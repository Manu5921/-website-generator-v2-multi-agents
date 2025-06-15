// =============================================================================
// ⚡ WORKFLOW ENGINE - MOTEUR DE WORKFLOW BUSINESS
// =============================================================================

import { orchestrateur } from './index';
import { stateManager } from './state-manager';
import { db } from '@/lib/db';
import { 
  projetsMultiAgents, 
  tachesAgents, 
  demandesClients,
  type DemandeClient as DemandeClientType 
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// =============================================================================
// 🎯 TYPES ET INTERFACES WORKFLOW
// =============================================================================

export interface WorkflowBusiness {
  id: string;
  nom: string;
  secteur: string;
  description: string;
  declencheurs: Declencheur[];
  etapes: EtapeWorkflow[];
  conditions: ConditionWorkflow[];
  sla: SLAWorkflow;
}

export interface Declencheur {
  type: 'nouvelle_demande' | 'paiement_confirme' | 'validation_client' | 'manuel';
  conditions?: Record<string, any>;
  priorite: number;
}

export interface EtapeWorkflow {
  id: string;
  nom: string;
  type: 'sequentielle' | 'parallele' | 'conditionnelle';
  agents: AssignationAgent[];
  dependances?: string[];
  timeout: number; // en minutes
  retry?: {
    maxTentatives: number;
    delai: number; // en minutes
  };
}

export interface AssignationAgent {
  agentType: 'design-ia' | 'automation' | 'ads-management' | 'core-platform';
  tache: string;
  parametres: Record<string, any>;
  tempsEstime: number;
  priorite: number;
  ressourcesRequises?: string[];
}

export interface ConditionWorkflow {
  etapeId: string;
  condition: string; // Expression JavaScript
  actionSiVrai: string;
  actionSiFaux: string;
}

export interface SLAWorkflow {
  tempsMaxTotal: number; // minutes
  tempsMaxParEtape: Record<string, number>;
  alertes: {
    pourcentage: number; // % du temps écoulé pour alerter
    destinataires: string[];
  }[];
}

export interface ExecutionWorkflow {
  id: string;
  projetId: string;
  workflowId: string;
  statut: 'en_attente' | 'en_cours' | 'termine' | 'erreur' | 'timeout';
  etapeActuelle: string;
  etapesTerminees: string[];
  dateDebut: Date;
  dateFin?: Date;
  tempsEcoule: number;
  erreurs: string[];
  metriques: MetriquesExecution;
}

export interface MetriquesExecution {
  tempsParEtape: Record<string, number>;
  tempsParAgent: Record<string, number>;
  tauxReussiteParEtape: Record<string, number>;
  nbRetries: number;
  alertesEmises: number;
}

// =============================================================================
// 🎼 CLASSE WORKFLOW ENGINE
// =============================================================================

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private workflows: Map<string, WorkflowBusiness> = new Map();
  private executionsActives: Map<string, ExecutionWorkflow> = new Map();
  private intervalleMonitoring: NodeJS.Timeout | null = null;

  private constructor() {
    this.initialiserWorkflowsMetier();
    this.demarrerMonitoring();
  }

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  // =============================================================================
  // 🚀 INITIALISATION DES WORKFLOWS MÉTIER
  // =============================================================================

  private initialiserWorkflowsMetier(): void {
    // Workflow Restaurant Premium
    const workflowRestaurant: WorkflowBusiness = {
      id: 'restaurant-premium',
      nom: 'Site Restaurant Premium - 25 minutes',
      secteur: 'restaurant',
      description: 'Création complète d\'un site restaurant avec réservations et marketing',
      declencheurs: [
        {
          type: 'paiement_confirme',
          conditions: { secteur: 'restaurant', formule: 'premium' },
          priorite: 10
        }
      ],
      etapes: [
        {
          id: 'phase-design',
          nom: 'Phase Design & Maquettes',
          type: 'sequentielle',
          agents: [
            {
              agentType: 'design-ia',
              tache: 'creation_maquettes_restaurant',
              parametres: {
                secteur: 'restaurant',
                style: 'premium',
                pages: ['accueil', 'menu', 'reservation', 'contact'],
                couleurs: 'chaleureux',
                typographie: 'elegante'
              },
              tempsEstime: 8,
              priorite: 10
            }
          ],
          timeout: 12
        },
        {
          id: 'phase-developpement',
          nom: 'Développement Site & Infrastructure',
          type: 'parallele',
          dependances: ['phase-design'],
          agents: [
            {
              agentType: 'core-platform',
              tache: 'generation_site_restaurant',
              parametres: {
                template: 'restaurant-premium',
                features: ['menu-dynamique', 'galerie', 'contact-form'],
                seo: true,
                responsive: true
              },
              tempsEstime: 5,
              priorite: 9
            },
            {
              agentType: 'automation',
              tache: 'setup_workflow_reservation',
              parametres: {
                systeme: 'n8n',
                integrations: ['calendly', 'email', 'sms'],
                notifications: true
              },
              tempsEstime: 7,
              priorite: 8
            }
          ],
          timeout: 10
        },
        {
          id: 'phase-marketing',
          nom: 'Lancement Marketing & Publicité',
          type: 'sequentielle',
          dependances: ['phase-developpement'],
          agents: [
            {
              agentType: 'ads-management',
              tache: 'creation_campagne_restaurant',
              parametres: {
                plateformes: ['facebook', 'google'],
                budget: 200,
                ciblage: 'local',
                objectif: 'reservations'
              },
              tempsEstime: 5,
              priorite: 7
            }
          ],
          timeout: 8
        }
      ],
      conditions: [
        {
          etapeId: 'phase-design',
          condition: 'this.budget > 500',
          actionSiVrai: 'ajouter_animation_premium',
          actionSiFaux: 'template_standard'
        }
      ],
      sla: {
        tempsMaxTotal: 25,
        tempsMaxParEtape: {
          'phase-design': 12,
          'phase-developpement': 10,
          'phase-marketing': 8
        },
        alertes: [
          {
            pourcentage: 75,
            destinataires: ['admin@platform.com', 'alerts@platform.com']
          },
          {
            pourcentage: 90,
            destinataires: ['emergency@platform.com']
          }
        ]
      }
    };

    // Workflow Coiffeur Express
    const workflowCoiffeur: WorkflowBusiness = {
      id: 'coiffeur-express',
      nom: 'Site Coiffeur Express - 20 minutes',
      secteur: 'coiffeur',
      description: 'Site vitrine avec prise de rendez-vous automatisée',
      declencheurs: [
        {
          type: 'paiement_confirme',
          conditions: { secteur: 'coiffeur' },
          priorite: 8
        }
      ],
      etapes: [
        {
          id: 'design-elegance',
          nom: 'Design Élégant & Moderne',
          type: 'sequentielle',
          agents: [
            {
              agentType: 'design-ia',
              tache: 'creation_design_coiffeur',
              parametres: {
                secteur: 'coiffeur',
                style: 'elegance',
                couleurs: 'pastel',
                galerie: true
              },
              tempsEstime: 6,
              priorite: 10
            }
          ],
          timeout: 8
        },
        {
          id: 'site-et-rendez-vous',
          nom: 'Site + Système Rendez-vous',
          type: 'parallele',
          dependances: ['design-elegance'],
          agents: [
            {
              agentType: 'core-platform',
              tache: 'generation_site_coiffeur',
              parametres: {
                template: 'coiffeur-moderne',
                features: ['galerie', 'services', 'contact'],
                booking: false // géré par automation
              },
              tempsEstime: 4,
              priorite: 9
            },
            {
              agentType: 'automation',
              tache: 'integration_calendly_coiffeur',
              parametres: {
                creneaux: ['9h-12h', '14h-18h'],
                services: ['coupe', 'couleur', 'brushing'],
                durees: { 'coupe': 30, 'couleur': 90, 'brushing': 45 }
              },
              tempsEstime: 6,
              priorite: 8
            }
          ],
          timeout: 8
        },
        {
          id: 'marketing-beaute',
          nom: 'Marketing Beauté Locale',
          type: 'sequentielle',
          dependances: ['site-et-rendez-vous'],
          agents: [
            {
              agentType: 'ads-management',
              tache: 'campagne_instagram_coiffeur',
              parametres: {
                plateformes: ['instagram', 'facebook'],
                budget: 150,
                audience: 'femmes-25-45-local',
                creatives: 'avant-apres'
              },
              tempsEstime: 4,
              priorite: 7
            }
          ],
          timeout: 6
        }
      ],
      conditions: [],
      sla: {
        tempsMaxTotal: 20,
        tempsMaxParEtape: {
          'design-elegance': 8,
          'site-et-rendez-vous': 8,
          'marketing-beaute': 6
        },
        alertes: [
          {
            pourcentage: 80,
            destinataires: ['admin@platform.com']
          }
        ]
      }
    };

    // Workflow Artisan Pro
    const workflowArtisan: WorkflowBusiness = {
      id: 'artisan-professionnel',
      nom: 'Site Artisan Professionnel - 22 minutes',
      secteur: 'artisan',
      description: 'Site showcase avec portfolio et système de devis',
      declencheurs: [
        {
          type: 'paiement_confirme',
          conditions: { secteur: 'artisan' },
          priorite: 7
        }
      ],
      etapes: [
        {
          id: 'design-authentique',
          nom: 'Design Authentique & Portfolio',
          type: 'sequentielle',
          agents: [
            {
              agentType: 'design-ia',
              tache: 'creation_design_artisan',
              parametres: {
                secteur: 'artisan',
                style: 'authentique',
                couleurs: 'naturelles',
                portfolio: true,
                certifications: true
              },
              tempsEstime: 7,
              priorite: 10
            }
          ],
          timeout: 10
        },
        {
          id: 'site-et-devis',
          nom: 'Site Showcase + Système Devis',
          type: 'parallele',
          dependances: ['design-authentique'],
          agents: [
            {
              agentType: 'core-platform',
              tache: 'generation_site_artisan',
              parametres: {
                template: 'artisan-pro',
                features: ['portfolio', 'realisations', 'contact', 'devis'],
                seo: 'local'
              },
              tempsEstime: 5,
              priorite: 9
            },
            {
              agentType: 'automation',
              tache: 'formulaire_devis_intelligent',
              parametres: {
                calcul: 'automatique',
                materiau: 'variable',
                delais: 'estimation',
                validation: 'artisan'
              },
              tempsEstime: 6,
              priorite: 8
            }
          ],
          timeout: 9
        },
        {
          id: 'marketing-local',
          nom: 'Marketing Local B2B/B2C',
          type: 'sequentielle',
          dependances: ['site-et-devis'],
          agents: [
            {
              agentType: 'ads-management',
              tache: 'strategie_mixte_artisan',
              parametres: {
                plateformes: ['google', 'facebook'],
                budget: 180,
                ciblage: ['particuliers', 'professionnels'],
                zone: 'departementale'
              },
              tempsEstime: 4,
              priorite: 7
            }
          ],
          timeout: 6
        }
      ],
      conditions: [],
      sla: {
        tempsMaxTotal: 22,
        tempsMaxParEtape: {
          'design-authentique': 10,
          'site-et-devis': 9,
          'marketing-local': 6
        },
        alertes: [
          {
            pourcentage: 75,
            destinataires: ['admin@platform.com']
          }
        ]
      }
    };

    // Enregistrer les workflows
    this.workflows.set('restaurant', workflowRestaurant);
    this.workflows.set('coiffeur', workflowCoiffeur);
    this.workflows.set('artisan', workflowArtisan);

    console.log(`⚡ ${this.workflows.size} workflows métier initialisés`);
  }

  // =============================================================================
  // 🎯 DÉCLENCHEMENT ET EXÉCUTION DES WORKFLOWS
  // =============================================================================

  public async declencherWorkflow(
    demandeId: string, 
    secteur: string, 
    declencheur: Declencheur['type'] = 'paiement_confirme'
  ): Promise<string> {
    try {
      // Récupérer le workflow approprié
      const workflow = this.workflows.get(secteur);
      if (!workflow) {
        throw new Error(`Workflow non trouvé pour le secteur: ${secteur}`);
      }

      // Vérifier les conditions de déclenchement
      const declencheurValide = workflow.declencheurs.find(d => 
        d.type === declencheur
      );
      
      if (!declencheurValide) {
        throw new Error(`Déclencheur ${declencheur} non supporté pour ${secteur}`);
      }

      // Récupérer la demande client
      const [demande] = await db.select()
        .from(demandesClients)
        .where(eq(demandesClients.id, demandeId));

      if (!demande) {
        throw new Error('Demande client non trouvée');
      }

      // Créer le projet multi-agent via l'orchestrateur
      const configuration = {
        secteurBusiness: secteur,
        budgetClient: 399, // TODO: récupérer depuis la commande
        priorite: this.determinerPriorite(declencheurValide.priorite),
        tempsPrevisionnel: workflow.sla.tempsMaxTotal,
        metadonnees: {
          workflowId: workflow.id,
          declencheur: declencheur,
          etapes: workflow.etapes.map(e => e.id)
        }
      };

      const demandeFormatee = {
        id: demande.id,
        nom: demande.nom,
        email: demande.email,
        entreprise: demande.entreprise,
        ville: demande.ville,
        telephone: demande.telephone,
        slogan: demande.slogan || '',
        secteur: secteur,
        budget: 399
      };

      const projetId = await orchestrateur.creerProjetMultiAgent(
        demandeFormatee, 
        configuration
      );

      // Créer l'exécution workflow
      const execution: ExecutionWorkflow = {
        id: `exec_${Date.now()}`,
        projetId,
        workflowId: workflow.id,
        statut: 'en_cours',
        etapeActuelle: workflow.etapes[0].id,
        etapesTerminees: [],
        dateDebut: new Date(),
        tempsEcoule: 0,
        erreurs: [],
        metriques: {
          tempsParEtape: {},
          tempsParAgent: {},
          tauxReussiteParEtape: {},
          nbRetries: 0,
          alertesEmises: 0
        }
      };

      this.executionsActives.set(projetId, execution);

      // Avertir le state manager
      await stateManager.ajouterProjet(projetId);
      stateManager.emettreEvenement({
        type: 'projet_demarre',
        projetId,
        donnees: { workflowId: workflow.id, secteur },
        timestamp: new Date()
      });

      console.log(`⚡ Workflow ${workflow.id} démarré pour projet ${projetId}`);
      return projetId;

    } catch (error) {
      console.error('Erreur déclenchement workflow:', error);
      throw error;
    }
  }

  public async executerEtapeWorkflow(projetId: string, etapeId: string): Promise<void> {
    try {
      const execution = this.executionsActives.get(projetId);
      if (!execution) {
        throw new Error(`Exécution non trouvée pour projet ${projetId}`);
      }

      const workflow = this.workflows.get(execution.workflowId.split('-')[0]);
      if (!workflow) {
        throw new Error(`Workflow ${execution.workflowId} non trouvé`);
      }

      const etape = workflow.etapes.find(e => e.id === etapeId);
      if (!etape) {
        throw new Error(`Étape ${etapeId} non trouvée`);
      }

      console.log(`⚡ Exécution étape ${etapeId} pour projet ${projetId}`);

      // Marquer l'étape comme commencée
      const heureDebut = Date.now();

      // Exécuter selon le type d'étape
      switch (etape.type) {
        case 'sequentielle':
          await this.executerEtapeSequentielle(projetId, etape);
          break;
        
        case 'parallele':
          await this.executerEtapeParallele(projetId, etape);
          break;
        
        case 'conditionnelle':
          await this.executerEtapeConditionnelle(projetId, etape, workflow);
          break;
      }

      // Mettre à jour les métriques
      const tempsPasse = Math.round((Date.now() - heureDebut) / 60000);
      execution.metriques.tempsParEtape[etapeId] = tempsPasse;
      execution.etapesTerminees.push(etapeId);

      // Vérifier si le workflow est terminé
      const etapeSuivante = this.determinerEtapeSuivante(workflow, execution);
      if (etapeSuivante) {
        execution.etapeActuelle = etapeSuivante.id;
        // Programmer l'exécution de l'étape suivante
        setTimeout(() => {
          this.executerEtapeWorkflow(projetId, etapeSuivante.id);
        }, 1000);
      } else {
        // Workflow terminé
        await this.terminerWorkflow(projetId);
      }

    } catch (error) {
      console.error(`Erreur exécution étape ${etapeId}:`, error);
      await this.gererErreurWorkflow(projetId, etapeId, error);
    }
  }

  private async executerEtapeSequentielle(projetId: string, etape: EtapeWorkflow): Promise<void> {
    // Exécuter les agents un par un dans l'ordre
    for (const agent of etape.agents) {
      await this.assignerTacheAgent(projetId, agent);
      // Attendre que la tâche soit terminée avant de passer au suivant
      await this.attendreFinTache(projetId, agent);
    }
  }

  private async executerEtapeParallele(projetId: string, etape: EtapeWorkflow): Promise<void> {
    // Exécuter tous les agents en parallèle
    const promisesAgents = etape.agents.map(agent => 
      this.assignerTacheAgent(projetId, agent)
    );
    
    await Promise.all(promisesAgents);
    
    // Attendre que toutes les tâches soient terminées
    const promisesAttente = etape.agents.map(agent =>
      this.attendreFinTache(projetId, agent)
    );
    
    await Promise.all(promisesAttente);
  }

  private async executerEtapeConditionnelle(
    projetId: string, 
    etape: EtapeWorkflow, 
    workflow: WorkflowBusiness
  ): Promise<void> {
    // Récupérer les conditions pour cette étape
    const conditions = workflow.conditions.filter(c => c.etapeId === etape.id);
    
    for (const condition of conditions) {
      const resultat = await this.evaluerCondition(projetId, condition.condition);
      const action = resultat ? condition.actionSiVrai : condition.actionSiFaux;
      
      // Appliquer l'action basée sur la condition
      await this.appliquerAction(projetId, action);
    }
    
    // Puis exécuter normalement l'étape
    await this.executerEtapeSequentielle(projetId, etape);
  }

  // =============================================================================
  // 🔧 MÉTHODES UTILITAIRES
  // =============================================================================

  private determinerPriorite(prioriteNumerique: number): 'faible' | 'normale' | 'haute' | 'critique' {
    if (prioriteNumerique >= 9) return 'critique';
    if (prioriteNumerique >= 7) return 'haute';
    if (prioriteNumerique >= 5) return 'normale';
    return 'faible';
  }

  private determinerEtapeSuivante(workflow: WorkflowBusiness, execution: ExecutionWorkflow): EtapeWorkflow | null {
    const etapesRestantes = workflow.etapes.filter(e => 
      !execution.etapesTerminees.includes(e.id)
    );

    // Vérifier les dépendances
    for (const etape of etapesRestantes) {
      if (!etape.dependances) {
        return etape; // Pas de dépendances, peut être exécutée
      }

      const dependancesTerminees = etape.dependances.every(dep =>
        execution.etapesTerminees.includes(dep)
      );

      if (dependancesTerminees) {
        return etape;
      }
    }

    return null; // Aucune étape suivante disponible
  }

  private async assignerTacheAgent(projetId: string, agent: AssignationAgent): Promise<void> {
    // Interface avec l'orchestrateur pour assigner la tâche
    console.log(`🤖 Assignation tâche ${agent.tache} à ${agent.agentType} pour projet ${projetId}`);
    
    // La tâche sera créée et assignée via l'orchestrateur principal
    // qui gère déjà ce processus
  }

  private async attendreFinTache(projetId: string, agent: AssignationAgent): Promise<void> {
    // Attendre que la tâche soit terminée
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout pour tâche ${agent.tache}`));
      }, agent.tempsEstime * 60000 + 60000); // Temps estimé + 1 minute de marge

      // Écouter les événements du state manager
      const checkTache = () => {
        const etatProjet = stateManager.obtenirEtatProjet(projetId);
        if (etatProjet) {
          const agentEtat = etatProjet.agents.find(a => a.type === agent.agentType);
          if (agentEtat && agentEtat.statut === 'idle') {
            clearTimeout(timeout);
            resolve();
          }
        }
      };

      // Vérifier toutes les 5 secondes
      const intervalle = setInterval(checkTache, 5000);
      
      setTimeout(() => {
        clearInterval(intervalle);
      }, agent.tempsEstime * 60000 + 60000);
    });
  }

  private async evaluerCondition(projetId: string, condition: string): Promise<boolean> {
    // Évaluer une condition JavaScript simple
    try {
      // Récupérer le contexte du projet
      const [projet] = await db.select()
        .from(projetsMultiAgents)
        .where(eq(projetsMultiAgents.id, projetId));

      if (!projet) return false;

      // Créer un contexte sécurisé pour l'évaluation
      const contexte = {
        budget: parseFloat(projet.budgetClient),
        secteur: projet.secteurBusiness,
        priorite: projet.priorite,
        tempsPasse: projet.tempsReel || 0
      };

      // Évaluation basique (remplacer par un évaluateur plus sécurisé en production)
      const evalFunction = new Function('this', `return ${condition}`);
      return evalFunction.call(contexte);

    } catch (error) {
      console.error('Erreur évaluation condition:', error);
      return false;
    }
  }

  private async appliquerAction(projetId: string, action: string): Promise<void> {
    console.log(`⚡ Application action: ${action} pour projet ${projetId}`);
    
    // Actions simples supportées
    switch (action) {
      case 'ajouter_animation_premium':
        // Ajouter des paramètres premium au projet
        break;
      case 'template_standard':
        // Utiliser le template standard
        break;
      default:
        console.warn(`Action non reconnue: ${action}`);
    }
  }

  private async terminerWorkflow(projetId: string): Promise<void> {
    const execution = this.executionsActives.get(projetId);
    if (execution) {
      execution.statut = 'termine';
      execution.dateFin = new Date();
      execution.tempsEcoule = Math.round((Date.now() - execution.dateDebut.getTime()) / 60000);

      stateManager.emettreEvenement({
        type: 'projet_termine',
        projetId,
        donnees: { 
          tempsEcoule: execution.tempsEcoule,
          workflowId: execution.workflowId 
        },
        timestamp: new Date()
      });

      console.log(`🎉 Workflow terminé pour projet ${projetId} en ${execution.tempsEcoule} minutes`);
    }
  }

  private async gererErreurWorkflow(projetId: string, etapeId: string, error: any): Promise<void> {
    const execution = this.executionsActives.get(projetId);
    if (execution) {
      execution.statut = 'erreur';
      execution.erreurs.push(`Étape ${etapeId}: ${error.message}`);

      stateManager.emettreEvenement({
        type: 'erreur',
        projetId,
        donnees: { etapeId, error: error.message },
        timestamp: new Date()
      });

      console.error(`❌ Erreur workflow projet ${projetId} étape ${etapeId}:`, error);
    }
  }

  private demarrerMonitoring(): void {
    this.intervalleMonitoring = setInterval(async () => {
      await this.verifierSLA();
      await this.nettoyerExecutionsTerminees();
    }, 60000); // Vérification toutes les minutes
  }

  private async verifierSLA(): Promise<void> {
    for (const [projetId, execution] of this.executionsActives) {
      if (execution.statut !== 'en_cours') continue;

      const workflow = this.workflows.get(execution.workflowId.split('-')[0]);
      if (!workflow) continue;

      const tempsEcoule = Math.round((Date.now() - execution.dateDebut.getTime()) / 60000);
      const pourcentageTemps = (tempsEcoule / workflow.sla.tempsMaxTotal) * 100;

      // Vérifier les alertes SLA
      for (const alerte of workflow.sla.alertes) {
        if (pourcentageTemps >= alerte.pourcentage && 
            execution.metriques.alertesEmises < workflow.sla.alertes.length) {
          
          await this.emettreAlerteSLA(projetId, execution, alerte, pourcentageTemps);
          execution.metriques.alertesEmises++;
        }
      }
    }
  }

  private async emettreAlerteSLA(
    projetId: string, 
    execution: ExecutionWorkflow, 
    alerte: any, 
    pourcentage: number
  ): Promise<void> {
    console.warn(`⚠️ Alerte SLA: Projet ${projetId} à ${Math.round(pourcentage)}% du temps limite`);
    
    stateManager.emettreEvenement({
      type: 'erreur',
      projetId,
      donnees: { 
        type: 'sla_warning', 
        pourcentage, 
        destinataires: alerte.destinataires 
      },
      timestamp: new Date()
    });
  }

  private async nettoyerExecutionsTerminees(): Promise<void> {
    const maintenant = Date.now();
    const RETENTION_HOURS = 24;

    for (const [projetId, execution] of this.executionsActives) {
      if (execution.statut === 'termine' || execution.statut === 'erreur') {
        const ageHeures = (maintenant - execution.dateDebut.getTime()) / (1000 * 60 * 60);
        
        if (ageHeures > RETENTION_HOURS) {
          this.executionsActives.delete(projetId);
          console.log(`🧹 Exécution ${projetId} nettoyée (${Math.round(ageHeures)}h)`);
        }
      }
    }
  }

  // =============================================================================
  // 📊 API PUBLIQUE
  // =============================================================================

  public obtenirWorkflowsDisponibles(): WorkflowBusiness[] {
    return Array.from(this.workflows.values());
  }

  public obtenirExecutionWorkflow(projetId: string): ExecutionWorkflow | undefined {
    return this.executionsActives.get(projetId);
  }

  public obtenirExecutionsActives(): ExecutionWorkflow[] {
    return Array.from(this.executionsActives.values());
  }

  public arreter(): void {
    if (this.intervalleMonitoring) {
      clearInterval(this.intervalleMonitoring);
    }
    console.log('⚡ Workflow Engine arrêté');
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const workflowEngine = WorkflowEngine.getInstance();
export default workflowEngine;