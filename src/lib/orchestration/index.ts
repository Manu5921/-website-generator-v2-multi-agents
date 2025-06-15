// =============================================================================
// 🎼 SYSTÈME D'ORCHESTRATION MULTI-AGENTS - CORE PLATFORM
// =============================================================================

import { db } from '@/lib/db';
import { 
  projetsMultiAgents, 
  tachesAgents, 
  queueOrchestration, 
  metriquesOrchestration,
  synchronisationsAgents,
  type ProjetMultiAgent,
  type TacheAgent,
  type InsertProjetMultiAgent,
  type InsertTacheAgent,
  type InsertQueueOrchestration
} from '@/lib/db/schema';
import { eq, and, inArray, desc, asc } from 'drizzle-orm';

// =============================================================================
// 🎯 TYPES ET INTERFACES
// =============================================================================

export interface DemandeClient {
  id: string;
  nom: string;
  email: string;
  entreprise: string;
  ville: string;
  telephone: string;
  slogan?: string;
  secteur: string;
  budget: number;
}

export interface ConfigurationProjet {
  secteurBusiness: string;
  budgetClient: number;
  priorite: 'faible' | 'normale' | 'haute' | 'critique';
  tempsPrevisionnel: number;
  metadonnees?: Record<string, any>;
}

export interface WorkflowTemplate {
  id: string;
  nom: string;
  secteur: string;
  description: string;
  taches: TacheTemplate[];
  tempsEstime: number;
}

export interface TacheTemplate {
  nom: string;
  description: string;
  agentType: 'design-ia' | 'automation' | 'ads-management' | 'core-platform' | 'service-client' | 'marketing-automation' | 'business-intelligence';
  priorite: number;
  tempsEstime: number;
  dependances?: string[];
  parametres?: Record<string, any>;
}

export interface StatutOrchestration {
  projet: ProjetMultiAgent;
  taches: TacheAgent[];
  progressionGlobale: number;
  tempsEcoule: number;
  tempsEstimeRestant: number;
  erreurs: string[];
  metriques: Record<string, number>;
}

// =============================================================================
// 🎼 CLASSE ORCHESTRATEUR PRINCIPAL
// =============================================================================

export class OrchestrateurMultiAgents {
  private static instance: OrchestrateurMultiAgents;
  private agentsEndpoints: Record<string, string>;
  private workflowTemplates: Map<string, WorkflowTemplate>;
  private readonly AGENT_TIMEOUT = 30000; // 30 secondes

  private constructor() {
    this.agentsEndpoints = {
      'design-ia': process.env.DESIGN_IA_ENDPOINT || 'http://localhost:3335',
      'automation': process.env.AUTOMATION_ENDPOINT || 'http://localhost:3336',
      'ads-management': process.env.ADS_ENDPOINT || 'http://localhost:3337',
      'core-platform': process.env.CORE_ENDPOINT || 'http://localhost:3338',
      'service-client': '/api/agents/service-client',
      'marketing-automation': '/api/agents/marketing',
      'business-intelligence': '/api/agents/business-intelligence'
    };
    
    this.workflowTemplates = new Map();
    this.initialiserWorkflowTemplates();
  }

  public static getInstance(): OrchestrateurMultiAgents {
    if (!OrchestrateurMultiAgents.instance) {
      OrchestrateurMultiAgents.instance = new OrchestrateurMultiAgents();
    }
    return OrchestrateurMultiAgents.instance;
  }

  // =============================================================================
  // 🚀 INITIALISATION ET CONFIGURATION
  // =============================================================================

  private initialiserWorkflowTemplates(): void {
    // Template Restaurant
    this.workflowTemplates.set('restaurant', {
      id: 'restaurant',
      nom: 'Site Restaurant Premium',
      secteur: 'restaurant',
      description: 'Création complète d\'un site restaurant avec réservations et menu',
      tempsEstime: 25,
      taches: [
        {
          nom: 'Design et maquettes restaurant',
          description: 'Création des maquettes Figma et design system restaurant',
          agentType: 'design-ia',
          priorite: 10,
          tempsEstime: 8,
          parametres: { secteur: 'restaurant', style: 'premium' }
        },
        {
          nom: 'Génération site avec templates',
          description: 'Génération du site Next.js avec templates optimisés',
          agentType: 'core-platform',
          priorite: 9,
          tempsEstime: 5,
          dependances: ['Design et maquettes restaurant']
        },
        {
          nom: 'Workflows réservation et menu',
          description: 'Configuration N8N pour gestion réservations et menu dynamique',
          agentType: 'automation',
          priorite: 8,
          tempsEstime: 7,
          dependances: ['Génération site avec templates']
        },
        {
          nom: 'Campagne publicitaire locale',
          description: 'Configuration Facebook/Google Ads pour promotion locale',
          agentType: 'ads-management',
          priorite: 7,
          tempsEstime: 5,
          dependances: ['Génération site avec templates']
        },
        {
          nom: 'Configuration Service Client IA',
          description: 'Déploiement chatbot service client 24/7 avec FAQ restaurant',
          agentType: 'service-client',
          priorite: 6,
          tempsEstime: 3,
          dependances: ['Génération site avec templates'],
          parametres: { secteur: 'restaurant', knowledgeBase: 'restaurant' }
        },
        {
          nom: 'Séquences Marketing Restaurant',
          description: 'Mise en place email automation et retargeting',
          agentType: 'marketing-automation',
          priorite: 5,
          tempsEstime: 4,
          dependances: ['Configuration Service Client IA']
        },
        {
          nom: 'Analytics et Insights Business',
          description: 'Dashboard analytics et rapports automatisés',
          agentType: 'business-intelligence',
          priorite: 4,
          tempsEstime: 3,
          dependances: ['Séquences Marketing Restaurant']
        }
      ]
    });

    // Template Coiffeur
    this.workflowTemplates.set('coiffeur', {
      id: 'coiffeur',
      nom: 'Site Coiffeur avec Rendez-vous',
      secteur: 'coiffeur',
      description: 'Site vitrine avec système de prise de rendez-vous',
      tempsEstime: 20,
      taches: [
        {
          nom: 'Design coiffeur moderne',
          description: 'Maquettes élégantes pour salon de coiffure',
          agentType: 'design-ia',
          priorite: 10,
          tempsEstime: 6,
          parametres: { secteur: 'coiffeur', style: 'elegant' }
        },
        {
          nom: 'Site vitrine responsive',
          description: 'Développement site avec galerie et présentation services',
          agentType: 'core-platform',
          priorite: 9,
          tempsEstime: 4,
          dependances: ['Design coiffeur moderne']
        },
        {
          nom: 'Système de rendez-vous',
          description: 'Integration Calendly/N8N pour prise de rendez-vous',
          agentType: 'automation',
          priorite: 8,
          tempsEstime: 6,
          dependances: ['Site vitrine responsive']
        },
        {
          nom: 'Publicité beauté locale',
          description: 'Campagnes Instagram/Facebook ciblées beauté',
          agentType: 'ads-management',
          priorite: 7,
          tempsEstime: 4,
          dependances: ['Site vitrine responsive']
        },
        {
          nom: 'Service Client Beauté',
          description: 'Chatbot spécialisé conseils beauté et prise de RDV',
          agentType: 'service-client',
          priorite: 6,
          tempsEstime: 3,
          dependances: ['Système de rendez-vous'],
          parametres: { secteur: 'coiffeur', knowledgeBase: 'beaute' }
        },
        {
          nom: 'Marketing Automation Beauté',
          description: 'Séquences de fidélisation et suivi clients',
          agentType: 'marketing-automation',
          priorite: 5,
          tempsEstime: 4,
          dependances: ['Service Client Beauté']
        },
        {
          nom: 'Analytics Salon',
          description: 'Suivi performance et insights business salon',
          agentType: 'business-intelligence',
          priorite: 4,
          tempsEstime: 3,
          dependances: ['Marketing Automation Beauté']
        }
      ]
    });

    // Template Artisan
    this.workflowTemplates.set('artisan', {
      id: 'artisan',
      nom: 'Site Artisan Professionnel',
      secteur: 'artisan',
      description: 'Site showcase avec portfolio et demandes de devis',
      tempsEstime: 22,
      taches: [
        {
          nom: 'Design artisan authentique',
          description: 'Design mettant en valeur le savoir-faire artisanal',
          agentType: 'design-ia',
          priorite: 10,
          tempsEstime: 7,
          parametres: { secteur: 'artisan', style: 'authentique' }
        },
        {
          nom: 'Portfolio et présentation',
          description: 'Site avec galerie portfolio et présentation métier',
          agentType: 'core-platform',
          priorite: 9,
          tempsEstime: 5,
          dependances: ['Design artisan authentique']
        },
        {
          nom: 'Système de devis automatisé',
          description: 'Formulaires intelligents avec calcul de devis',
          agentType: 'automation',
          priorite: 8,
          tempsEstime: 6,
          dependances: ['Portfolio et présentation']
        },
        {
          nom: 'Marketing local B2B/B2C',
          description: 'Stratégie mixte particuliers et professionnels',
          agentType: 'ads-management',
          priorite: 7,
          tempsEstime: 4,
          dependances: ['Portfolio et présentation']
        },
        {
          nom: 'Support Client Artisan',
          description: 'Assistant IA pour devis et conseils techniques',
          agentType: 'service-client',
          priorite: 6,
          tempsEstime: 3,
          dependances: ['Système de devis automatisé'],
          parametres: { secteur: 'artisan', knowledgeBase: 'artisanat' }
        },
        {
          nom: 'Automation Devis et Suivi',
          description: 'Workflows automatisés pour le cycle de vente',
          agentType: 'marketing-automation',
          priorite: 5,
          tempsEstime: 4,
          dependances: ['Support Client Artisan']
        },
        {
          nom: 'Business Intelligence Artisan',
          description: 'Analytics projets et performance business',
          agentType: 'business-intelligence',
          priorite: 4,
          tempsEstime: 3,
          dependances: ['Automation Devis et Suivi']
        }
      ]
    });
  }

  // =============================================================================
  // 🎯 CRÉATION ET GESTION DES PROJETS
  // =============================================================================

  public async creerProjetMultiAgent(
    demande: DemandeClient, 
    configuration: ConfigurationProjet
  ): Promise<string> {
    try {
      // 1. Créer le projet en base
      const [nouveauProjet] = await db.insert(projetsMultiAgents).values({
        demandeId: demande.id,
        secteurBusiness: configuration.secteurBusiness,
        budgetClient: configuration.budgetClient.toString(),
        priorite: configuration.priorite,
        tempsPrevisionnel: configuration.tempsPrevisionnel,
        metadonnees: JSON.stringify(configuration.metadonnees || {})
      }).returning();

      if (!nouveauProjet.id) {
        throw new Error('Erreur lors de la création du projet');
      }

      // 2. Récupérer le template de workflow
      const template = this.workflowTemplates.get(configuration.secteurBusiness);
      if (!template) {
        throw new Error(`Template non trouvé pour le secteur: ${configuration.secteurBusiness}`);
      }

      // 3. Créer les tâches selon le template
      const tachesACreer: InsertTacheAgent[] = template.taches.map(tacheTemplate => ({
        projetId: nouveauProjet.id,
        agentType: tacheTemplate.agentType,
        nomTache: tacheTemplate.nom,
        description: tacheTemplate.description,
        priorite: tacheTemplate.priorite,
        tempsEstime: tacheTemplate.tempsEstime,
        dependances: JSON.stringify(tacheTemplate.dependances || []),
        agentEndpoint: this.agentsEndpoints[tacheTemplate.agentType]
      }));

      await db.insert(tachesAgents).values(tachesACreer);

      // 4. Initialiser la queue avec le nouveau projet
      await this.ajouterALaQueue({
        projetId: nouveauProjet.id,
        typeMessage: 'nouveau_projet',
        payload: JSON.stringify({
          projet: nouveauProjet,
          demande: demande,
          configuration: configuration
        })
      });

      // 5. Lancer l'orchestration
      await this.demarrerOrchestration(nouveauProjet.id);

      await this.enregistrerMetrique(
        nouveauProjet.id,
        undefined,
        'projet_cree',
        1,
        'count'
      );

      return nouveauProjet.id;

    } catch (error) {
      console.error('Erreur création projet multi-agent:', error);
      throw error;
    }
  }

  // =============================================================================
  // 🎯 ORCHESTRATION ET DISPATCHER
  // =============================================================================

  public async demarrerOrchestration(projetId: string): Promise<void> {
    try {
      // 1. Mettre à jour le statut du projet
      await db.update(projetsMultiAgents)
        .set({ 
          statut: 'en_cours',
          dateDebutProduction: new Date()
        })
        .where(eq(projetsMultiAgents.id, projetId));

      // 2. Identifier les tâches prêtes à être exécutées
      const tachesPrêtes = await this.identifierTachesPrêtes(projetId);

      // 3. Dispatcher les tâches aux agents
      for (const tache of tachesPrêtes) {
        await this.assignerTacheAgent(tache);
      }

      // 4. Programmer la surveillance
      this.surveillerProgression(projetId);

    } catch (error) {
      console.error('Erreur démarrage orchestration:', error);
      await this.gererErreurProjet(projetId, error);
    }
  }

  private async identifierTachesPrêtes(projetId: string): Promise<TacheAgent[]> {
    // Récupérer toutes les tâches du projet
    const tachesProjet = await db.select()
      .from(tachesAgents)
      .where(eq(tachesAgents.projetId, projetId))
      .orderBy(desc(tachesAgents.priorite));

    const tachesPrêtes: TacheAgent[] = [];

    for (const tache of tachesProjet) {
      // Vérifier si la tâche peut être exécutée
      if (tache.statut === 'en_attente') {
        const dependances = JSON.parse(tache.dependances || '[]');
        
        if (dependances.length === 0) {
          // Pas de dépendances, prête à être exécutée
          tachesPrêtes.push(tache);
        } else {
          // Vérifier si toutes les dépendances sont terminées
          const dependancesTerminees = await this.verifierDependances(projetId, dependances);
          if (dependancesTerminees) {
            tachesPrêtes.push(tache);
          }
        }
      }
    }

    return tachesPrêtes;
  }

  private async verifierDependances(projetId: string, nomsDependances: string[]): Promise<boolean> {
    const tachesTerminees = await db.select()
      .from(tachesAgents)
      .where(
        and(
          eq(tachesAgents.projetId, projetId),
          inArray(tachesAgents.nomTache, nomsDependances),
          eq(tachesAgents.statut, 'termine')
        )
      );

    return tachesTerminees.length === nomsDependances.length;
  }

  private async assignerTacheAgent(tache: TacheAgent): Promise<void> {
    try {
      // 1. Mettre à jour le statut de la tâche
      await db.update(tachesAgents)
        .set({
          statut: 'assigne',
          dateAssignation: new Date()
        })
        .where(eq(tachesAgents.id, tache.id));

      // 2. Ajouter à la queue pour l'agent
      await this.ajouterALaQueue({
        projetId: tache.projetId,
        tacheId: tache.id,
        typeMessage: 'tache_assignee',
        agentDestinataire: tache.agentType,
        payload: JSON.stringify({
          tache: tache,
          endpoint: tache.agentEndpoint
        })
      });

      // 3. Envoyer la tâche à l'agent
      await this.envoyerTacheAgent(tache);

    } catch (error) {
      console.error('Erreur assignation tâche:', error);
      await this.gererErreurTache(tache.id, error);
    }
  }

  private async envoyerTacheAgent(tache: TacheAgent): Promise<void> {
    if (!tache.agentEndpoint) {
      throw new Error(`Endpoint manquant pour l'agent ${tache.agentType}`);
    }

    try {
      let response: Response;
      
      // Gestion différente pour les agents IA internes vs externes
      if (this.isInternalAgent(tache.agentType)) {
        response = await this.envoyerTacheAgentInterne(tache);
      } else {
        response = await this.envoyerTacheAgentExterne(tache);
      }

      if (!response.ok) {
        throw new Error(`Agent responded with ${response.status}: ${response.statusText}`);
      }

      // L'agent traitera la tâche et notifiera via webhook
      await this.enregistrerMetrique(
        tache.projetId,
        tache.agentType,
        'tache_envoyee',
        1,
        'count'
      );

    } catch (error) {
      console.error(`Erreur envoi tâche à l'agent ${tache.agentType}:`, error);
      throw error;
    }
  }

  private isInternalAgent(agentType: string): boolean {
    return ['service-client', 'marketing-automation', 'business-intelligence'].includes(agentType);
  }

  private async envoyerTacheAgentInterne(tache: TacheAgent): Promise<Response> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const endpoint = `${baseUrl}${tache.agentEndpoint}`;
    
    // Configuration spécifique selon le type d'agent
    let payload: any = {
      taskId: tache.id,
      projectId: tache.projetId,
      taskName: tache.nomTache,
      description: tache.description,
      parameters: JSON.parse(tache.resultat || '{}'),
      priority: tache.priorite,
      estimatedTime: tache.tempsEstime
    };

    // Actions spécifiques par agent
    switch (tache.agentType) {
      case 'service-client':
        payload.action = 'setup_knowledge_base';
        payload.secteur = payload.parameters?.secteur || 'general';
        break;
      
      case 'marketing-automation':
        payload.action = 'deploy_sequence';
        payload.secteur = payload.parameters?.secteur || 'general';
        payload.sequenceType = 'welcome';
        break;
      
      case 'business-intelligence':
        payload.action = 'setup_alerts';
        payload.siteId = payload.projectId;
        break;
    }

    return await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_AGENT_TOKEN || 'dev-token'}`
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.AGENT_TIMEOUT)
    });
  }

  private async envoyerTacheAgentExterne(tache: TacheAgent): Promise<Response> {
    return await fetch(`${tache.agentEndpoint}/api/tasks/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_AGENT_TOKEN || 'dev-token'}`
      },
      body: JSON.stringify({
        taskId: tache.id,
        projectId: tache.projetId,
        taskName: tache.nomTache,
        description: tache.description,
        parameters: JSON.parse(tache.resultat || '{}'),
        priority: tache.priorite,
        estimatedTime: tache.tempsEstime
      }),
      signal: AbortSignal.timeout(this.AGENT_TIMEOUT)
    });
  }

  // =============================================================================
  // 🔄 GESTION DE LA QUEUE ET SYNCHRONISATION
  // =============================================================================

  private async ajouterALaQueue(message: InsertQueueOrchestration): Promise<void> {
    const dateExpiration = new Date();
    dateExpiration.setHours(dateExpiration.getHours() + 1); // Expire dans 1h

    await db.insert(queueOrchestration).values({
      ...message,
      dateExpiration: dateExpiration
    });
  }

  public async traiterQueue(): Promise<void> {
    try {
      // Récupérer les messages en attente
      const messagesEnAttente = await db.select()
        .from(queueOrchestration)
        .where(eq(queueOrchestration.statut, 'en_attente'))
        .orderBy(asc(queueOrchestration.dateCreation))
        .limit(10);

      for (const message of messagesEnAttente) {
        await this.traiterMessage(message);
      }

    } catch (error) {
      console.error('Erreur traitement queue:', error);
    }
  }

  private async traiterMessage(message: any): Promise<void> {
    try {
      switch (message.typeMessage) {
        case 'nouveau_projet':
          // Déjà traité lors de la création
          break;
        
        case 'tache_terminee':
          await this.gererTacheTerminee(message);
          break;
        
        case 'erreur_agent':
          await this.gererErreurAgent(message);
          break;
        
        case 'sync_status':
          await this.gererSyncStatus(message);
          break;
      }

      // Marquer le message comme traité
      await db.update(queueOrchestration)
        .set({ 
          statut: 'traite',
          dateTraitement: new Date()
        })
        .where(eq(queueOrchestration.id, message.id));

    } catch (error) {
      console.error('Erreur traitement message:', error);
      
      // Incrémenter les tentatives
      const nouvelleTentative = message.tentatives + 1;
      
      if (nouvelleTentative >= message.maxTentatives) {
        await db.update(queueOrchestration)
          .set({ statut: 'erreur' })
          .where(eq(queueOrchestration.id, message.id));
      } else {
        await db.update(queueOrchestration)
          .set({ tentatives: nouvelleTentative })
          .where(eq(queueOrchestration.id, message.id));
      }
    }
  }

  // =============================================================================
  // 📊 MÉTRIQUES ET MONITORING
  // =============================================================================

  private async enregistrerMetrique(
    projetId: string | undefined,
    agentType: string | undefined,
    metrique: string,
    valeur: number,
    unite: string,
    metadonnees?: Record<string, any>
  ): Promise<void> {
    await db.insert(metriquesOrchestration).values({
      projetId,
      agentType,
      metrique,
      valeur: valeur.toString(),
      unite,
      metadonnees: metadonnees ? JSON.stringify(metadonnees) : undefined
    });
  }

  public async obtenirStatutProjet(projetId: string): Promise<StatutOrchestration> {
    // Récupérer le projet
    const [projet] = await db.select()
      .from(projetsMultiAgents)
      .where(eq(projetsMultiAgents.id, projetId));

    if (!projet) {
      throw new Error('Projet non trouvé');
    }

    // Récupérer toutes les tâches
    const taches = await db.select()
      .from(tachesAgents)
      .where(eq(tachesAgents.projetId, projetId))
      .orderBy(desc(tachesAgents.priorite));

    // Calculer la progression
    const tachesTerminees = taches.filter(t => t.statut === 'termine').length;
    const progressionGlobale = taches.length > 0 ? (tachesTerminees / taches.length) * 100 : 0;

    // Calculer les temps
    const tempsEcoule = projet.dateDebutProduction 
      ? Date.now() - projet.dateDebutProduction.getTime()
      : 0;
    
    const tempsEstimeRestant = Math.max(
      0, 
      (projet.tempsPrevisionnel * 60000) - tempsEcoule
    );

    // Récupérer les erreurs
    const tachesAvecErreurs = taches.filter(t => t.statut === 'erreur');
    const erreurs = tachesAvecErreurs.map(t => 
      `${t.nomTache}: ${JSON.parse(t.erreurs || '{}').message || 'Erreur inconnue'}`
    );

    return {
      projet,
      taches,
      progressionGlobale,
      tempsEcoule: Math.floor(tempsEcoule / 60000), // en minutes
      tempsEstimeRestant: Math.floor(tempsEstimeRestant / 60000), // en minutes
      erreurs,
      metriques: {
        tachesTotal: taches.length,
        tachesTerminees,
        tachesEnCours: taches.filter(t => t.statut === 'en_cours').length,
        tachesEnErreur: tachesAvecErreurs.length
      }
    };
  }

  // =============================================================================
  // 🚨 GESTION D'ERREURS
  // =============================================================================

  private async gererErreurProjet(projetId: string, error: any): Promise<void> {
    await db.update(projetsMultiAgents)
      .set({ statut: 'erreur' })
      .where(eq(projetsMultiAgents.id, projetId));

    await this.enregistrerMetrique(
      projetId,
      undefined,
      'erreur_projet',
      1,
      'count',
      { error: error.message }
    );
  }

  private async gererErreurTache(tacheId: string, error: any): Promise<void> {
    await db.update(tachesAgents)
      .set({ 
        statut: 'erreur',
        erreurs: JSON.stringify({ message: error.message, timestamp: new Date() })
      })
      .where(eq(tachesAgents.id, tacheId));
  }

  private async gererTacheTerminee(message: any): Promise<void> {
    const payload = JSON.parse(message.payload);
    const tacheId = payload.taskId;
    
    // Mettre à jour la tâche
    await db.update(tachesAgents)
      .set({
        statut: 'termine',
        dateFin: new Date(),
        tempsReel: payload.executionTime,
        resultat: JSON.stringify(payload.result)
      })
      .where(eq(tachesAgents.id, tacheId));

    // Vérifier si d'autres tâches peuvent être démarrées
    const [tache] = await db.select()
      .from(tachesAgents)
      .where(eq(tachesAgents.id, tacheId));

    if (tache) {
      await this.demarrerOrchestration(tache.projetId);
    }
  }

  private async gererErreurAgent(message: any): Promise<void> {
    const payload = JSON.parse(message.payload);
    await this.gererErreurTache(payload.taskId, new Error(payload.error));
  }

  private async gererSyncStatus(message: any): Promise<void> {
    // Traitement des mises à jour de statut
    const payload = JSON.parse(message.payload);
    
    await this.enregistrerMetrique(
      payload.projectId,
      payload.agentType,
      'sync_status',
      1,
      'count',
      payload
    );
  }

  private async surveillerProgression(projetId: string): Promise<void> {
    // Surveillance périodique en arrière-plan
    setTimeout(async () => {
      try {
        const statut = await this.obtenirStatutProjet(projetId);
        
        if (statut.progressionGlobale === 100) {
          // Projet terminé
          await db.update(projetsMultiAgents)
            .set({ 
              statut: 'terminé',
              dateFinProduction: new Date(),
              tempsReel: statut.tempsEcoule
            })
            .where(eq(projetsMultiAgents.id, projetId));
        } else if (statut.projet.statut === 'en_cours') {
          // Continuer la surveillance
          this.surveillerProgression(projetId);
        }
        
      } catch (error) {
        console.error('Erreur surveillance:', error);
      }
    }, 30000); // Vérifier toutes les 30 secondes
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const orchestrateur = OrchestrateurMultiAgents.getInstance();
export default orchestrateur;