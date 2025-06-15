// =============================================================================
// 🔄 STATE MANAGER - GESTION ÉTAT GLOBAL PROJETS MULTI-AGENTS
// =============================================================================

import { EventEmitter } from 'events';
import { db } from '@/lib/db';
import { 
  projetsMultiAgents, 
  tachesAgents, 
  metriquesOrchestration,
  type ProjetMultiAgent,
  type TacheAgent
} from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// =============================================================================
// 🎯 TYPES ET INTERFACES
// =============================================================================

export interface EtatProjet {
  id: string;
  statut: 'initialise' | 'en_cours' | 'terminé' | 'erreur' | 'annule';
  progression: number;
  tachesActives: string[];
  derniereActivite: Date;
  metriques: MetriquesProjet;
  agents: EtatAgent[];
}

export interface EtatAgent {
  type: 'design-ia' | 'automation' | 'ads-management' | 'core-platform';
  statut: 'idle' | 'busy' | 'error' | 'offline';
  tacheActuelle?: string;
  progression?: number;
  derniereActivite: Date;
  metriques: MetriquesAgent;
}

export interface MetriquesProjet {
  tempsTotal: number;
  tempsMoyen: number;
  tauxReussite: number;
  nbTaches: number;
  nbTachesTerminees: number;
  nbErreurs: number;
}

export interface MetriquesAgent {
  tempsReponse: number;
  tauxReussite: number;
  nbTachesTraitees: number;
  uptime: number;
  derniereConnexion: Date;
}

export interface EvenementOrchestration {
  type: 'projet_cree' | 'projet_demarre' | 'tache_assignee' | 'tache_terminee' | 'projet_termine' | 'erreur';
  projetId: string;
  tacheId?: string;
  agentId?: string;
  donnees?: any;
  timestamp: Date;
}

// =============================================================================
// 🎼 CLASSE STATE MANAGER
// =============================================================================

export class StateManagerOrchestration extends EventEmitter {
  private static instance: StateManagerOrchestration;
  private projetsEnCours: Map<string, EtatProjet> = new Map();
  private agentsEtat: Map<string, EtatAgent> = new Map();
  private evenementsRecents: EvenementOrchestration[] = [];
  private readonly MAX_EVENEMENTS = 1000;
  private intervalleRefresh: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.initialiserAgents();
    this.demarrerRefreshAuto();
  }

  public static getInstance(): StateManagerOrchestration {
    if (!StateManagerOrchestration.instance) {
      StateManagerOrchestration.instance = new StateManagerOrchestration();
    }
    return StateManagerOrchestration.instance;
  }

  // =============================================================================
  // 🚀 INITIALISATION ET CONFIGURATION
  // =============================================================================

  private initialiserAgents(): void {
    const agents: EtatAgent[] = [
      {
        type: 'design-ia',
        statut: 'offline',
        derniereActivite: new Date(),
        metriques: this.creerMetriquesVides()
      },
      {
        type: 'automation',
        statut: 'offline',
        derniereActivite: new Date(),
        metriques: this.creerMetriquesVides()
      },
      {
        type: 'ads-management',
        statut: 'offline',
        derniereActivite: new Date(),
        metriques: this.creerMetriquesVides()
      },
      {
        type: 'core-platform',
        statut: 'offline',
        derniereActivite: new Date(),
        metriques: this.creerMetriquesVides()
      }
    ];

    agents.forEach(agent => {
      this.agentsEtat.set(agent.type, agent);
    });
  }

  private creerMetriquesVides(): MetriquesAgent {
    return {
      tempsReponse: 0,
      tauxReussite: 0,
      nbTachesTraitees: 0,
      uptime: 0,
      derniereConnexion: new Date()
    };
  }

  private demarrerRefreshAuto(): void {
    // Actualiser l'état toutes les 10 secondes
    this.intervalleRefresh = setInterval(async () => {
      await this.rafraichirEtatGlobal();
    }, 10000);
  }

  // =============================================================================
  // 📊 GESTION DES PROJETS
  // =============================================================================

  public async ajouterProjet(projetId: string): Promise<void> {
    try {
      const etatProjet = await this.chargerEtatProjet(projetId);
      this.projetsEnCours.set(projetId, etatProjet);
      
      this.emettreEvenement({
        type: 'projet_cree',
        projetId,
        timestamp: new Date()
      });

      console.log(`📋 Projet ${projetId} ajouté au state manager`);
    } catch (error) {
      console.error('Erreur ajout projet au state manager:', error);
    }
  }

  public async mettreAJourProjet(projetId: string, changements: Partial<EtatProjet>): Promise<void> {
    const etatActuel = this.projetsEnCours.get(projetId);
    
    if (etatActuel) {
      const nouvelEtat = {
        ...etatActuel,
        ...changements,
        derniereActivite: new Date()
      };
      
      this.projetsEnCours.set(projetId, nouvelEtat);
      this.emit('projet_mis_a_jour', { projetId, ancien: etatActuel, nouveau: nouvelEtat });
    }
  }

  public async supprimerProjet(projetId: string): Promise<void> {
    this.projetsEnCours.delete(projetId);
    console.log(`🗑️ Projet ${projetId} supprimé du state manager`);
  }

  public obtenirEtatProjet(projetId: string): EtatProjet | undefined {
    return this.projetsEnCours.get(projetId);
  }

  public obtenirTousProjets(): EtatProjet[] {
    return Array.from(this.projetsEnCours.values());
  }

  // =============================================================================
  // 🤖 GESTION DES AGENTS
  // =============================================================================

  public mettreAJourAgent(
    agentType: string, 
    statut: EtatAgent['statut'], 
    donnees?: Partial<EtatAgent>
  ): void {
    const agent = this.agentsEtat.get(agentType);
    
    if (agent) {
      const nouvelEtat: EtatAgent = {
        ...agent,
        statut,
        derniereActivite: new Date(),
        ...donnees
      };
      
      this.agentsEtat.set(agentType, nouvelEtat);
      this.emit('agent_mis_a_jour', { agentType, ancien: agent, nouveau: nouvelEtat });
      
      console.log(`🤖 Agent ${agentType} mis à jour: ${statut}`);
    }
  }

  public obtenirEtatAgent(agentType: string): EtatAgent | undefined {
    return this.agentsEtat.get(agentType);
  }

  public obtenirTousAgents(): EtatAgent[] {
    return Array.from(this.agentsEtat.values());
  }

  public obtenirAgentsActifs(): EtatAgent[] {
    return this.obtenirTousAgents().filter(agent => 
      agent.statut !== 'offline' && agent.statut !== 'error'
    );
  }

  // =============================================================================
  // 📈 MÉTRIQUES ET STATISTIQUES
  // =============================================================================

  public async calculerMetriquesGlobales(): Promise<{
    projets: {
      total: number;
      actifs: number;
      termines: number;
      erreurs: number;
      progressionMoyenne: number;
    };
    agents: {
      total: number;
      actifs: number;
      offline: number;
      tauxDisponibilite: number;
    };
    performance: {
      tempsMoyenProjet: number;
      tauxReussiteGlobal: number;
      tempsReponseMoyen: number;
    };
  }> {
    const projets = this.obtenirTousProjets();
    const agents = this.obtenirTousAgents();

    // Métriques projets
    const projetsActifs = projets.filter(p => p.statut === 'en_cours').length;
    const projetsTermines = projets.filter(p => p.statut === 'terminé').length;
    const projetsErreurs = projets.filter(p => p.statut === 'erreur').length;
    const progressionMoyenne = projets.length > 0 
      ? projets.reduce((sum, p) => sum + p.progression, 0) / projets.length 
      : 0;

    // Métriques agents
    const agentsActifs = agents.filter(a => a.statut !== 'offline').length;
    const agentsOffline = agents.filter(a => a.statut === 'offline').length;
    const tauxDisponibilite = agents.length > 0 ? (agentsActifs / agents.length) * 100 : 0;

    // Métriques performance
    const tempsMoyenProjet = projets.length > 0
      ? projets.reduce((sum, p) => sum + p.metriques.tempsTotal, 0) / projets.length
      : 0;
    
    const tauxReussiteGlobal = projets.length > 0
      ? projets.reduce((sum, p) => sum + p.metriques.tauxReussite, 0) / projets.length
      : 0;
    
    const tempsReponseMoyen = agents.length > 0
      ? agents.reduce((sum, a) => sum + a.metriques.tempsReponse, 0) / agents.length
      : 0;

    return {
      projets: {
        total: projets.length,
        actifs: projetsActifs,
        termines: projetsTermines,
        erreurs: projetsErreurs,
        progressionMoyenne: Math.round(progressionMoyenne)
      },
      agents: {
        total: agents.length,
        actifs: agentsActifs,
        offline: agentsOffline,
        tauxDisponibilite: Math.round(tauxDisponibilite)
      },
      performance: {
        tempsMoyenProjet: Math.round(tempsMoyenProjet),
        tauxReussiteGlobal: Math.round(tauxReussiteGlobal),
        tempsReponseMoyen: Math.round(tempsReponseMoyen)
      }
    };
  }

  // =============================================================================
  // 📨 GESTION DES ÉVÉNEMENTS
  // =============================================================================

  public emettreEvenement(evenement: EvenementOrchestration): void {
    // Ajouter à la liste des événements récents
    this.evenementsRecents.unshift(evenement);
    
    // Limiter le nombre d'événements stockés
    if (this.evenementsRecents.length > this.MAX_EVENEMENTS) {
      this.evenementsRecents = this.evenementsRecents.slice(0, this.MAX_EVENEMENTS);
    }

    // Émettre l'événement pour les listeners
    this.emit('orchestration_event', evenement);
    this.emit(evenement.type, evenement);

    console.log(`📨 Événement émis: ${evenement.type} - Projet ${evenement.projetId}`);
  }

  public obtenirEvenementsRecents(limite: number = 50): EvenementOrchestration[] {
    return this.evenementsRecents.slice(0, limite);
  }

  // =============================================================================
  // 🔄 SYNCHRONISATION BASE DE DONNÉES
  // =============================================================================

  private async chargerEtatProjet(projetId: string): Promise<EtatProjet> {
    // Charger le projet depuis la base
    const [projet] = await db.select()
      .from(projetsMultiAgents)
      .where(eq(projetsMultiAgents.id, projetId));

    if (!projet) {
      throw new Error(`Projet ${projetId} non trouvé`);
    }

    // Charger les tâches
    const taches = await db.select()
      .from(tachesAgents)
      .where(eq(tachesAgents.projetId, projetId));

    // Calculer les métriques
    const nbTachesTerminees = taches.filter(t => t.statut === 'termine').length;
    const progression = taches.length > 0 ? (nbTachesTerminees / taches.length) * 100 : 0;
    const tachesActives = taches
      .filter(t => t.statut === 'en_cours' || t.statut === 'assigne')
      .map(t => t.id);

    // Calculer les métriques détaillées
    const metriques: MetriquesProjet = {
      tempsTotal: projet.tempsReel || 0,
      tempsMoyen: taches.length > 0 ? (projet.tempsReel || 0) / taches.length : 0,
      tauxReussite: taches.length > 0 ? (nbTachesTerminees / taches.length) * 100 : 0,
      nbTaches: taches.length,
      nbTachesTerminees,
      nbErreurs: taches.filter(t => t.statut === 'erreur').length
    };

    // Créer l'état des agents pour ce projet
    const agentsProjet = await this.creerEtatAgentsProjet(projetId, taches);

    return {
      id: projetId,
      statut: projet.statut as any,
      progression: Math.round(progression),
      tachesActives,
      derniereActivite: new Date(),
      metriques,
      agents: agentsProjet
    };
  }

  private async creerEtatAgentsProjet(projetId: string, taches: TacheAgent[]): Promise<EtatAgent[]> {
    const agents: EtatAgent[] = [];
    const typesAgents = ['design-ia', 'automation', 'ads-management', 'core-platform'] as const;

    for (const type of typesAgents) {
      const tachesAgent = taches.filter(t => t.agentType === type);
      const tacheActive = tachesAgent.find(t => t.statut === 'en_cours' || t.statut === 'assigne');
      
      // Récupérer les métriques depuis la base
      const metriques = await this.chargerMetriquesAgent(type, projetId);
      
      agents.push({
        type,
        statut: tacheActive ? 'busy' : 'idle',
        tacheActuelle: tacheActive?.id,
        progression: tacheActive ? this.calculerProgressionTache(tacheActive) : 0,
        derniereActivite: tacheActive?.dateDebut || new Date(),
        metriques
      });
    }

    return agents;
  }

  private calculerProgressionTache(tache: TacheAgent): number {
    if (tache.statut === 'termine') return 100;
    if (tache.statut === 'en_cours' && tache.dateDebut) {
      const tempsEcoule = Date.now() - tache.dateDebut.getTime();
      const tempsEstime = tache.tempsEstime * 60000; // en ms
      return Math.min(90, (tempsEcoule / tempsEstime) * 100); // Max 90% si pas terminé
    }
    return 0;
  }

  private async chargerMetriquesAgent(agentType: string, projetId?: string): Promise<MetriquesAgent> {
    // Requête pour les métriques récentes de l'agent
    const metriquesRecentes = await db.select()
      .from(metriquesOrchestration)
      .where(
        and(
          eq(metriquesOrchestration.agentType, agentType),
          projetId ? eq(metriquesOrchestration.projetId, projetId) : sql`true`
        )
      )
      .orderBy(desc(metriquesOrchestration.horodatage))
      .limit(100);

    // Calculer les métriques agrégées
    const tempsReponse = this.calculerMoyenne(
      metriquesRecentes.filter(m => m.metrique === 'temps_reponse'),
      'valeur'
    );

    const heartbeats = metriquesRecentes.filter(m => m.metrique === 'heartbeat');
    const derniereConnexion = heartbeats.length > 0 
      ? heartbeats[0].horodatage 
      : new Date(0);

    return {
      tempsReponse: Math.round(tempsReponse),
      tauxReussite: 95, // TODO: calculer depuis les tâches réussies/échouées
      nbTachesTraitees: metriquesRecentes.filter(m => m.metrique === 'tache_terminee').length,
      uptime: heartbeats.length, // Approximation
      derniereConnexion
    };
  }

  private calculerMoyenne(metriques: any[], champ: string): number {
    if (metriques.length === 0) return 0;
    const sum = metriques.reduce((acc, m) => acc + parseFloat(m[champ] || '0'), 0);
    return sum / metriques.length;
  }

  private async rafraichirEtatGlobal(): Promise<void> {
    try {
      // Rafraîchir tous les projets en cours
      for (const [projetId] of this.projetsEnCours) {
        const nouvelEtat = await this.chargerEtatProjet(projetId);
        this.projetsEnCours.set(projetId, nouvelEtat);
      }

      // Émettre un événement global de refresh
      this.emit('etat_rafraichi', {
        projets: this.projetsEnCours.size,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Erreur refresh état global:', error);
    }
  }

  // =============================================================================
  // 🧹 NETTOYAGE ET ARRÊT
  // =============================================================================

  public arreter(): void {
    if (this.intervalleRefresh) {
      clearInterval(this.intervalleRefresh);
      this.intervalleRefresh = null;
    }
    
    this.removeAllListeners();
    console.log('🔄 State Manager arrêté');
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const stateManager = StateManagerOrchestration.getInstance();
export default stateManager;