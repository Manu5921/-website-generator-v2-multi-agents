import { pgTable, text, integer, timestamp, boolean, decimal, uuid, json } from 'drizzle-orm/pg-core';

// 📋 Table des demandes clients
export const demandesClients = pgTable('demandes_clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  nom: text('nom').notNull(),
  email: text('email').notNull(),
  entreprise: text('entreprise').notNull(),
  ville: text('ville').notNull(),
  telephone: text('telephone').notNull(),
  slogan: text('slogan'),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  statut: text('statut', { 
    enum: ['nouvelle', 'en_cours', 'site_genere', 'livree', 'annulee'] 
  }).default('nouvelle').notNull(),
  notes: text('notes'), // Notes admin
});

// 💰 Table des commandes/paiements
export const commandes = pgTable('commandes', {
  id: uuid('id').defaultRandom().primaryKey(),
  demandeId: uuid('demande_id').references(() => demandesClients.id).notNull(),
  montant: decimal('montant', { precision: 10, scale: 2 }).notNull(), // 399.00
  devise: text('devise').default('EUR').notNull(),
  polarPaymentId: text('polar_payment_id'), // ID du paiement Polar
  statut: text('statut', {
    enum: ['attente', 'paye', 'rembourse', 'echoue']
  }).default('attente').notNull(),
  datePaiement: timestamp('date_paiement'),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 🌐 Table des sites générés
export const sitesGeneres = pgTable('sites_generes', {
  id: uuid('id').defaultRandom().primaryKey(),
  commandeId: uuid('commande_id').references(() => commandes.id).notNull(),
  url: text('url').notNull(), // URL GitHub Pages
  secteur: text('secteur').notNull(), // restaurant, plombier, etc.
  style: text('style').notNull(), // standard, premium, luxury
  repoName: text('repo_name').notNull(), // Nom du repository GitHub
  dateGeneration: timestamp('date_generation').defaultNow().notNull(),
  actif: boolean('actif').default(true).notNull(),
});

// 🔧 Table maintenance mensuelle
export const maintenances = pgTable('maintenances', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').references(() => sitesGeneres.id).notNull(),
  moisAnnee: text('mois_annee').notNull(), // "2025-06", "2025-07", etc.
  montant: decimal('montant', { precision: 10, scale: 2 }).default('29.00').notNull(),
  statut: text('statut', {
    enum: ['en_attente', 'paye', 'en_retard', 'suspendu']
  }).default('en_attente').notNull(),
  dateEcheance: timestamp('date_echeance').notNull(),
  datePaiement: timestamp('date_paiement'),
  polarPaymentId: text('polar_payment_id'),
});

// 👤 Table utilisateurs admin (pour NextAuth)
export const utilisateursAdmin = pgTable('utilisateurs_admin', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  nom: text('nom').notNull(),
  motDePasse: text('mot_de_passe'), // Hash du mot de passe
  role: text('role').default('admin').notNull(),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  dernierLogin: timestamp('dernier_login'),
});

// Types TypeScript
export type DemandeClient = typeof demandesClients.$inferSelect;
export type InsertDemandeClient = typeof demandesClients.$inferInsert;

export type Commande = typeof commandes.$inferSelect;
export type InsertCommande = typeof commandes.$inferInsert;

export type SiteGenere = typeof sitesGeneres.$inferSelect;
export type InsertSiteGenere = typeof sitesGeneres.$inferInsert;

export type Maintenance = typeof maintenances.$inferSelect;
export type InsertMaintenance = typeof maintenances.$inferInsert;

export type UtilisateurAdmin = typeof utilisateursAdmin.$inferSelect;
export type InsertUtilisateurAdmin = typeof utilisateursAdmin.$inferInsert;

// 🤖 Table des workflows business automatisés
export const workflowsAutomatises = pgTable('workflows_automatises', {
  id: uuid('id').defaultRandom().primaryKey(),
  nom: text('nom').notNull(), // Nom du workflow
  secteur: text('secteur').notNull(), // artisan, avocat, coach, plombier, etc.
  type: text('type', {
    enum: ['devis', 'contact', 'relance', 'nurturing', 'urgence', 'suivi']
  }).notNull(),
  description: text('description').notNull(),
  configuration: json('configuration').notNull(), // Config JSON du workflow
  actif: boolean('actif').default(true).notNull(),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  derniereMiseAJour: timestamp('derniere_mise_a_jour').defaultNow().notNull(),
});

// 📧 Table des templates de communication
export const templatesCommunication = pgTable('templates_communication', {
  id: uuid('id').defaultRandom().primaryKey(),
  workflowId: uuid('workflow_id').references(() => workflowsAutomatises.id).notNull(),
  canal: text('canal', {
    enum: ['email', 'sms', 'notification', 'whatsapp']
  }).notNull(),
  etape: integer('etape').notNull(), // Étape du workflow (1, 2, 3...)
  nom: text('nom').notNull(),
  sujet: text('sujet'), // Pour emails
  contenu: text('contenu').notNull(),
  delaiEnvoi: integer('delai_envoi').default(0).notNull(), // En minutes
  conditions: json('conditions'), // Conditions d'envoi
  actif: boolean('actif').default(true).notNull(),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 🎯 Table des déclencheurs de workflow
export const declencheursWorkflow = pgTable('declencheurs_workflow', {
  id: uuid('id').defaultRandom().primaryKey(),
  workflowId: uuid('workflow_id').references(() => workflowsAutomatises.id).notNull(),
  evenement: text('evenement').notNull(), // 'nouveau_contact', 'demande_devis', 'page_visite', etc.
  conditions: json('conditions').notNull(), // Conditions JSON pour déclencher
  actif: boolean('actif').default(true).notNull(),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 📊 Table des exécutions de workflow
export const executionsWorkflow = pgTable('executions_workflow', {
  id: uuid('id').defaultRandom().primaryKey(),
  workflowId: uuid('workflow_id').references(() => workflowsAutomatises.id).notNull(),
  contactId: uuid('contact_id'), // ID du contact concerné
  statutExecution: text('statut_execution', {
    enum: ['en_cours', 'termine', 'echoue', 'suspendu']
  }).default('en_cours').notNull(),
  etapeActuelle: integer('etape_actuelle').default(1).notNull(),
  donneesContext: json('donnees_context'), // Données du contexte d'exécution
  dateDebut: timestamp('date_debut').defaultNow().notNull(),
  dateFin: timestamp('date_fin'),
  erreurs: json('erreurs'), // Log des erreurs éventuelles
});

// 👥 Table des contacts/prospects
export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').references(() => sitesGeneres.id),
  nom: text('nom').notNull(),
  email: text('email').notNull(),
  telephone: text('telephone'),
  entreprise: text('entreprise'),
  secteurActivite: text('secteur_activite'),
  source: text('source').notNull(), // 'formulaire_contact', 'formulaire_devis', 'chat', etc.
  statut: text('statut', {
    enum: ['nouveau', 'qualifie', 'en_cours', 'converti', 'perdu']
  }).default('nouveau').notNull(),
  scoreQualification: integer('score_qualification').default(0),
  derniereInteraction: timestamp('derniere_interaction').defaultNow().notNull(),
  donneesCustom: json('donnees_custom'), // Données spécifiques au secteur
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 📈 Table des métriques de conversion
export const metriquesConversion = pgTable('metriques_conversion', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').references(() => sitesGeneres.id).notNull(),
  workflowId: uuid('workflow_id').references(() => workflowsAutomatises.id),
  periode: text('periode').notNull(), // 'jour', 'semaine', 'mois'
  dateDebut: timestamp('date_debut').notNull(),
  dateFin: timestamp('date_fin').notNull(),
  visiteurs: integer('visiteurs').default(0),
  conversions: integer('conversions').default(0),
  tauxConversion: decimal('taux_conversion', { precision: 5, scale: 2 }).default('0.00'),
  chiffreAffaires: decimal('chiffre_affaires', { precision: 10, scale: 2 }).default('0.00'),
  coutAcquisition: decimal('cout_acquisition', { precision: 10, scale: 2 }).default('0.00'),
  donneesDetaillees: json('donnees_detaillees'), // Métriques détaillées
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 🔔 Table des notifications système
export const notificationsSysteme = pgTable('notifications_systeme', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').references(() => sitesGeneres.id),
  type: text('type', {
    enum: ['workflow_echec', 'nouveau_contact', 'conversion', 'maintenance', 'alerte']
  }).notNull(),
  titre: text('titre').notNull(),
  message: text('message').notNull(),
  niveau: text('niveau', {
    enum: ['info', 'warning', 'error', 'success']
  }).default('info').notNull(),
  lu: boolean('lu').default(false).notNull(),
  donneesAction: json('donnees_action'), // Données pour actions liées
  destinataire: text('destinataire').notNull(), // email du destinataire
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// Types TypeScript pour les nouvelles tables
export type WorkflowAutomatise = typeof workflowsAutomatises.$inferSelect;
export type InsertWorkflowAutomatise = typeof workflowsAutomatises.$inferInsert;

export type TemplateCommunication = typeof templatesCommunication.$inferSelect;
export type InsertTemplateCommunication = typeof templatesCommunication.$inferInsert;

export type DeclencheurWorkflow = typeof declencheursWorkflow.$inferSelect;
export type InsertDeclencheurWorkflow = typeof declencheursWorkflow.$inferInsert;

export type ExecutionWorkflow = typeof executionsWorkflow.$inferSelect;
export type InsertExecutionWorkflow = typeof executionsWorkflow.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

export type MetriqueConversion = typeof metriquesConversion.$inferSelect;
export type InsertMetriqueConversion = typeof metriquesConversion.$inferInsert;

export type NotificationSysteme = typeof notificationsSysteme.$inferSelect;
export type InsertNotificationSysteme = typeof notificationsSysteme.$inferInsert;

// =============================================================================
// 🎼 TABLES ORCHESTRATION MULTI-AGENTS
// =============================================================================

// 📋 Table des projets multi-agents
export const projetsMultiAgents = pgTable('projets_multi_agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  demandeId: uuid('demande_id').references(() => demandesClients.id).notNull(),
  statut: text('statut', {
    enum: ['initialise', 'en_cours', 'terminé', 'erreur', 'annule']
  }).default('initialise').notNull(),
  priorite: text('priorite', {
    enum: ['faible', 'normale', 'haute', 'critique']
  }).default('normale').notNull(),
  secteurBusiness: text('secteur_business').notNull(), // restaurant, coiffeur, artisan, etc.
  budgetClient: decimal('budget_client', { precision: 10, scale: 2 }).notNull(),
  tempsPrevisionnel: integer('temps_previsionnel').default(25).notNull(), // en minutes
  tempsReel: integer('temps_reel'), // temps réel d'exécution
  dateDebutProduction: timestamp('date_debut_production'),
  dateFinProduction: timestamp('date_fin_production'),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  metadonnees: text('metadonnees'), // JSON avec config spécifique
});

// 🤖 Table des tâches agents
export const tachesAgents = pgTable('taches_agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  projetId: uuid('projet_id').references(() => projetsMultiAgents.id).notNull(),
  agentType: text('agent_type', {
    enum: ['design-ia', 'automation', 'ads-management', 'core-platform']
  }).notNull(),
  nomTache: text('nom_tache').notNull(),
  description: text('description').notNull(),
  statut: text('statut', {
    enum: ['en_attente', 'assigne', 'en_cours', 'termine', 'erreur', 'annule']
  }).default('en_attente').notNull(),
  priorite: integer('priorite').default(5).notNull(), // 1-10 (10 = critique)
  dependances: text('dependances'), // JSON array des IDs de tâches dépendantes
  tempsEstime: integer('temps_estime').notNull(), // en minutes
  tempsReel: integer('temps_reel'), // temps réel d'exécution
  resultat: text('resultat'), // JSON avec résultats de la tâche
  erreurs: text('erreurs'), // JSON avec erreurs éventuelles
  agentEndpoint: text('agent_endpoint'), // URL de l'agent responsable
  dateAssignation: timestamp('date_assignation'),
  dateDebut: timestamp('date_debut'),
  dateFin: timestamp('date_fin'),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 📊 Table de la queue d'orchestration
export const queueOrchestration = pgTable('queue_orchestration', {
  id: uuid('id').defaultRandom().primaryKey(),
  projetId: uuid('projet_id').references(() => projetsMultiAgents.id).notNull(),
  tacheId: uuid('tache_id').references(() => tachesAgents.id),
  typeMessage: text('type_message', {
    enum: ['nouveau_projet', 'tache_assignee', 'tache_terminee', 'erreur_agent', 'sync_status']
  }).notNull(),
  payload: text('payload').notNull(), // JSON avec données du message
  statut: text('statut', {
    enum: ['en_attente', 'traite', 'erreur', 'expire']
  }).default('en_attente').notNull(),
  tentatives: integer('tentatives').default(0).notNull(),
  maxTentatives: integer('max_tentatives').default(3).notNull(),
  agentDestinataire: text('agent_destinataire'),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  dateTraitement: timestamp('date_traitement'),
  dateExpiration: timestamp('date_expiration'),
});

// 📈 Table des métriques d'orchestration
export const metriquesOrchestration = pgTable('metriques_orchestration', {
  id: uuid('id').defaultRandom().primaryKey(),
  projetId: uuid('projet_id').references(() => projetsMultiAgents.id),
  agentType: text('agent_type'),
  metrique: text('metrique').notNull(), // nom de la métrique
  valeur: decimal('valeur', { precision: 15, scale: 5 }).notNull(),
  unite: text('unite'), // ms, %, count, etc.
  horodatage: timestamp('horodatage').defaultNow().notNull(),
  metadonnees: text('metadonnees'), // JSON avec contexte
});

// 🔄 Table des synchronisations inter-agents
export const synchronisationsAgents = pgTable('synchronisations_agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  projetId: uuid('projet_id').references(() => projetsMultiAgents.id).notNull(),
  agentEmetteur: text('agent_emetteur').notNull(),
  agentRecepteur: text('agent_recepteur').notNull(),
  typeSync: text('type_sync', {
    enum: ['handoff', 'notification', 'data_share', 'status_update']
  }).notNull(),
  donnees: text('donnees').notNull(), // JSON avec données échangées
  statut: text('statut', {
    enum: ['envoye', 'recu', 'traite', 'erreur']
  }).default('envoye').notNull(),
  dateEnvoi: timestamp('date_envoi').defaultNow().notNull(),
  dateReception: timestamp('date_reception'),
  dateTraitement: timestamp('date_traitement'),
});

// =============================================================================
// 🔧 TYPES TYPESCRIPT ORCHESTRATION
// =============================================================================

export type ProjetMultiAgent = typeof projetsMultiAgents.$inferSelect;
export type InsertProjetMultiAgent = typeof projetsMultiAgents.$inferInsert;

export type TacheAgent = typeof tachesAgents.$inferSelect;
export type InsertTacheAgent = typeof tachesAgents.$inferInsert;

export type QueueOrchestration = typeof queueOrchestration.$inferSelect;
export type InsertQueueOrchestration = typeof queueOrchestration.$inferInsert;

export type MetriqueOrchestration = typeof metriquesOrchestration.$inferSelect;
export type InsertMetriqueOrchestration = typeof metriquesOrchestration.$inferInsert;

export type SynchronisationAgent = typeof synchronisationsAgents.$inferSelect;
export type InsertSynchronisationAgent = typeof synchronisationsAgents.$inferInsert;

// =============================================================================
// 🤖 TABLES AGENTS IA CONVERSATIONNELS
// =============================================================================

// 💬 Table des conversations chat clients
export const conversationsChat = pgTable('conversations_chat', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').references(() => sitesGeneres.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  canal: text('canal', {
    enum: ['chat_web', 'email', 'sms', 'whatsapp', 'slack']
  }).default('chat_web').notNull(),
  statut: text('statut', {
    enum: ['active', 'resolue', 'escalade_humaine', 'fermee']
  }).default('active').notNull(),
  agent_type: text('agent_type', {
    enum: ['service_client', 'marketing', 'business_intelligence']
  }).default('service_client').notNull(),
  satisfaction: integer('satisfaction'), // 1-5 étoiles
  resolved_automatically: boolean('resolved_automatically').default(false),
  escalation_reason: text('escalation_reason'),
  session_data: json('session_data'), // Données de session utilisateur
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  dateFermeture: timestamp('date_fermeture'),
  derniereActivite: timestamp('derniere_activite').defaultNow().notNull(),
});

// 💬 Table des messages des conversations
export const messagesChat = pgTable('messages_chat', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => conversationsChat.id).notNull(),
  expediteur: text('expediteur', {
    enum: ['client', 'agent_ia', 'humain']
  }).notNull(),
  contenu: text('contenu').notNull(),
  type_message: text('type_message', {
    enum: ['texte', 'image', 'fichier', 'action_button', 'suggestion']
  }).default('texte').notNull(),
  metadata: json('metadata'), // Métadonnées du message
  response_time: integer('response_time'), // Temps de réponse en ms
  intent_detected: text('intent_detected'), // Intention détectée par IA
  confidence_score: decimal('confidence_score', { precision: 3, scale: 2 }), // Score de confiance IA
  dateEnvoi: timestamp('date_envoi').defaultNow().notNull(),
});

// 🧠 Table de la base de connaissances (FAQ dynamique)
export const baseConnaissances = pgTable('base_connaissances', {
  id: uuid('id').defaultRandom().primaryKey(),
  secteur: text('secteur').notNull(), // restaurant, coiffeur, artisan, etc.
  categorie: text('categorie').notNull(), // prix, services, horaires, etc.
  question: text('question').notNull(),
  reponse: text('reponse').notNull(),
  keywords: json('keywords'), // Mots-clés pour matching
  priority: integer('priority').default(5).notNull(), // 1-10
  utilisation_count: integer('utilisation_count').default(0),
  success_rate: decimal('success_rate', { precision: 5, scale: 2 }).default('0.00'),
  derniere_utilisation: timestamp('derniere_utilisation'),
  actif: boolean('actif').default(true).notNull(),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  dateModification: timestamp('date_modification').defaultNow().notNull(),
});

// 🎯 Table des intents/intentions détectées
export const intentsDetectes = pgTable('intents_detectes', {
  id: uuid('id').defaultRandom().primaryKey(),
  nom: text('nom').notNull(), // 'demande_prix', 'prise_rdv', 'reclamation', etc.
  secteur: text('secteur').notNull(),
  patterns: json('patterns').notNull(), // Patterns de reconnaissance
  responses: json('responses').notNull(), // Réponses possibles
  actions: json('actions'), // Actions à déclencher
  confidence_threshold: decimal('confidence_threshold', { precision: 3, scale: 2 }).default('0.70'),
  actif: boolean('actif').default(true).notNull(),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 📊 Table des métriques des agents IA
export const metriquesAgentsIA = pgTable('metriques_agents_ia', {
  id: uuid('id').defaultRandom().primaryKey(),
  agent_type: text('agent_type', {
    enum: ['service_client', 'marketing', 'business_intelligence']
  }).notNull(),
  siteId: uuid('site_id').references(() => sitesGeneres.id),
  periode: text('periode').notNull(), // 'heure', 'jour', 'semaine', 'mois'
  dateDebut: timestamp('date_debut').notNull(),
  dateFin: timestamp('date_fin').notNull(),
  
  // Métriques Service Client
  conversations_totales: integer('conversations_totales').default(0),
  conversations_resolues: integer('conversations_resolues').default(0),
  taux_resolution_auto: decimal('taux_resolution_auto', { precision: 5, scale: 2 }).default('0.00'),
  temps_reponse_moyen: integer('temps_reponse_moyen').default(0), // en ms
  satisfaction_moyenne: decimal('satisfaction_moyenne', { precision: 3, scale: 2 }).default('0.00'),
  escalations_humaines: integer('escalations_humaines').default(0),
  
  // Métriques Marketing
  emails_envoyes: integer('emails_envoyes').default(0),
  taux_ouverture: decimal('taux_ouverture', { precision: 5, scale: 2 }).default('0.00'),
  taux_clic: decimal('taux_clic', { precision: 5, scale: 2 }).default('0.00'),
  conversions_generees: integer('conversions_generees').default(0),
  revenue_genere: decimal('revenue_genere', { precision: 10, scale: 2 }).default('0.00'),
  
  // Métriques Business Intelligence
  rapports_generes: integer('rapports_generes').default(0),
  insights_fournis: integer('insights_fournis').default(0),
  alertes_envoyees: integer('alertes_envoyees').default(0),
  predictions_accuracy: decimal('predictions_accuracy', { precision: 3, scale: 2 }).default('0.00'),
  
  metadonnees: json('metadonnees'),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 🔔 Table des escalations vers humains
export const escalationsHumaines = pgTable('escalations_humaines', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => conversationsChat.id).notNull(),
  raison: text('raison', {
    enum: ['demande_complexe', 'insatisfaction_client', 'erreur_technique', 'demande_specifique', 'autre']
  }).notNull(),
  priorite: text('priorite', {
    enum: ['basse', 'normale', 'haute', 'urgente']
  }).default('normale').notNull(),
  statut: text('statut', {
    enum: ['en_attente', 'assignee', 'en_cours', 'resolue']
  }).default('en_attente').notNull(),
  agent_humain: text('agent_humain'), // Email de l'agent assigné
  notes_contexte: text('notes_contexte'),
  resolution_summary: text('resolution_summary'),
  dateEscalade: timestamp('date_escalade').defaultNow().notNull(),
  dateResolution: timestamp('date_resolution'),
});

// =============================================================================
// 🔧 TYPES TYPESCRIPT AGENTS IA
// =============================================================================

export type ConversationChat = typeof conversationsChat.$inferSelect;
export type InsertConversationChat = typeof conversationsChat.$inferInsert;

export type MessageChat = typeof messagesChat.$inferSelect;
export type InsertMessageChat = typeof messagesChat.$inferInsert;

export type BaseConnaissance = typeof baseConnaissances.$inferSelect;
export type InsertBaseConnaissance = typeof baseConnaissances.$inferInsert;

export type IntentDetecte = typeof intentsDetectes.$inferSelect;
export type InsertIntentDetecte = typeof intentsDetectes.$inferInsert;

export type MetriqueAgentIA = typeof metriquesAgentsIA.$inferSelect;
export type InsertMetriqueAgentIA = typeof metriquesAgentsIA.$inferInsert;

export type EscalationHumaine = typeof escalationsHumaines.$inferSelect;
export type InsertEscalationHumaine = typeof escalationsHumaines.$inferInsert;

// =============================================================================
// 📊 TABLES ADS MANAGEMENT & ATTRIBUTION TRACKING
// =============================================================================

// 🎯 Table des campagnes publicitaires
export const campagnesPublicitaires = pgTable('campagnes_publicitaires', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').references(() => sitesGeneres.id).notNull(),
  nom: text('nom').notNull(),
  plateforme: text('plateforme', {
    enum: ['google_ads', 'facebook_ads', 'instagram_ads', 'linkedin_ads', 'tiktok_ads']
  }).notNull(),
  type: text('type', {
    enum: ['search', 'display', 'video', 'shopping', 'performance_max', 'social_media']
  }).notNull(),
  statut: text('statut', {
    enum: ['draft', 'active', 'paused', 'ended', 'archived']
  }).default('draft').notNull(),
  budgetQuotidien: decimal('budget_quotidien', { precision: 10, scale: 2 }).notNull(),
  budgetTotal: decimal('budget_total', { precision: 10, scale: 2 }),
  objectif: text('objectif', {
    enum: ['conversions', 'leads', 'traffic', 'awareness', 'app_installs', 'sales']
  }).notNull(),
  secteurCible: text('secteur_cible').notNull(),
  audienceCible: json('audience_cible').notNull(), // JSON config audience
  strategieEncheres: text('strategie_encheres', {
    enum: ['manual_cpc', 'enhanced_cpc', 'maximize_clicks', 'maximize_conversions', 'target_cpa', 'target_roas']
  }).default('maximize_conversions').notNull(),
  cpaTarget: decimal('cpa_target', { precision: 10, scale: 2 }), // Coût par acquisition cible
  roasTarget: decimal('roas_target', { precision: 5, scale: 2 }), // Return on ad spend cible
  idExterne: text('id_externe'), // ID de la campagne sur la plateforme
  dateDebut: timestamp('date_debut').notNull(),
  dateFin: timestamp('date_fin'),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  derniereOptimisation: timestamp('derniere_optimisation'),
  metadonneesML: json('metadonnees_ml'), // Données pour algorithmes ML
});

// 📝 Table des créatifs publicitaires
export const creatifsPublicitaires = pgTable('creatifs_publicitaires', {
  id: uuid('id').defaultRandom().primaryKey(),
  campagneId: uuid('campagne_id').references(() => campagnesPublicitaires.id).notNull(),
  nom: text('nom').notNull(),
  type: text('type', {
    enum: ['text_ad', 'image_ad', 'video_ad', 'carousel_ad', 'responsive_ad']
  }).notNull(),
  titre: text('titre').notNull(),
  description: text('description'),
  urlImage: text('url_image'),
  urlVideo: text('url_video'),
  callToAction: text('call_to_action'),
  urlDestination: text('url_destination').notNull(),
  utmSource: text('utm_source'),
  utmCampaign: text('utm_campaign'),
  utmMedium: text('utm_medium'),
  utmContent: text('utm_content'),
  utmTerm: text('utm_term'),
  statut: text('statut', {
    enum: ['active', 'paused', 'disapproved', 'under_review']
  }).default('active').notNull(),
  scoreQualite: decimal('score_qualite', { precision: 3, scale: 1 }), // Score 1-10
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  performanceData: json('performance_data'), // Métriques de performance
});

// 📊 Table des métriques de campagnes
export const metriquesCampagnes = pgTable('metriques_campagnes', {
  id: uuid('id').defaultRandom().primaryKey(),
  campagneId: uuid('campagne_id').references(() => campagnesPublicitaires.id).notNull(),
  creatifId: uuid('creatif_id').references(() => creatifsPublicitaires.id),
  date: timestamp('date').notNull(),
  impressions: integer('impressions').default(0),
  clics: integer('clics').default(0),
  depense: decimal('depense', { precision: 10, scale: 2 }).default('0.00'),
  conversions: integer('conversions').default(0),
  valeurConversions: decimal('valeur_conversions', { precision: 10, scale: 2 }).default('0.00'),
  ctr: decimal('ctr', { precision: 5, scale: 4 }).default('0.0000'), // Click-through rate
  cpc: decimal('cpc', { precision: 10, scale: 2 }).default('0.00'), // Cost per click
  cpa: decimal('cpa', { precision: 10, scale: 2 }).default('0.00'), // Cost per acquisition
  roas: decimal('roas', { precision: 5, scale: 2 }).default('0.00'), // Return on ad spend
  tauxConversion: decimal('taux_conversion', { precision: 5, scale: 4 }).default('0.0000'),
  donneesDetaillees: json('donnees_detaillees'), // Métriques supplémentaires
  horodatage: timestamp('horodatage').defaultNow().notNull(),
});

// 🛤️ Table du customer journey mapping
export const customerJourney = pgTable('customer_journey', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: text('session_id').notNull(), // ID unique de session utilisateur
  siteId: uuid('site_id').references(() => sitesGeneres.id).notNull(),
  contactId: uuid('contact_id').references(() => contacts.id),
  etape: integer('etape').notNull(), // Numéro d'étape dans le parcours
  typeEvenement: text('type_evenement', {
    enum: ['page_view', 'ad_click', 'form_submit', 'conversion', 'email_open', 'call', 'download']
  }).notNull(),
  source: text('source'), // google, facebook, direct, email, etc.
  medium: text('medium'), // cpc, organic, social, email, etc.
  campagne: text('campagne'), // Nom de la campagne
  contenu: text('contenu'), // utm_content
  motCle: text('mot_cle'), // utm_term
  urlPage: text('url_page'),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  localisationGeo: json('localisation_geo'), // Données géolocalisation
  valeurEvenement: decimal('valeur_evenement', { precision: 10, scale: 2 }), // Valeur monétaire si applicable
  dureeSession: integer('duree_session'), // En secondes
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  metadonnees: json('metadonnees'), // Données contextuelles
});

// 🔄 Table des attributions multi-touch
export const attributionsMultiTouch = pgTable('attributions_multi_touch', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversionId: uuid('conversion_id').notNull(), // ID unique de la conversion
  sessionId: text('session_id').notNull(),
  siteId: uuid('site_id').references(() => sitesGeneres.id).notNull(),
  contactId: uuid('contact_id').references(() => contacts.id),
  campagneId: uuid('campagne_id').references(() => campagnesPublicitaires.id),
  creatifId: uuid('creatif_id').references(() => creatifsPublicitaires.id),
  modeleAttribution: text('modele_attribution', {
    enum: ['first_touch', 'last_touch', 'linear', 'time_decay', 'position_based', 'data_driven']
  }).default('linear').notNull(),
  poidsAttribution: decimal('poids_attribution', { precision: 5, scale: 4 }).notNull(), // 0.0000 à 1.0000
  valeurAttributee: decimal('valeur_attributee', { precision: 10, scale: 2 }).notNull(),
  ordreEtape: integer('ordre_etape').notNull(), // Position dans le parcours
  delaiAttribution: integer('delai_attribution'), // Délai en heures depuis premier contact
  typeConversion: text('type_conversion', {
    enum: ['purchase', 'lead', 'signup', 'download', 'call', 'form_submit']
  }).notNull(),
  dateConversion: timestamp('date_conversion').notNull(),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 🧠 Table des modèles ML et algorithmes d'optimisation
export const modelesML = pgTable('modeles_ml', {
  id: uuid('id').defaultRandom().primaryKey(),
  nom: text('nom').notNull(),
  type: text('type', {
    enum: ['budget_allocation', 'audience_targeting', 'bid_optimization', 'creative_optimization', 'attribution_modeling']
  }).notNull(),
  secteur: text('secteur'), // restaurant, coiffeur, artisan, etc.
  version: text('version').default('1.0').notNull(),
  algorithme: text('algorithme', {
    enum: ['linear_regression', 'random_forest', 'gradient_boosting', 'neural_network', 'ensemble']
  }).notNull(),
  hyperparametres: json('hyperparametres').notNull(),
  metriquesPerformance: json('metriques_performance'), // Précision, recall, F1-score, etc.
  donneesEntrainement: json('donnees_entrainement'), // Métadonnées sur les données d'entraînement
  modeleSérialise: text('modele_serialise'), // Modèle sérialisé en base64
  statut: text('statut', {
    enum: ['training', 'active', 'deprecated', 'failed']
  }).default('training').notNull(),
  dernierEntrainement: timestamp('dernier_entrainement'),
  prochainEntrainement: timestamp('prochain_entrainement'),
  scoreValidation: decimal('score_validation', { precision: 5, scale: 4 }),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 🎲 Table des tests A/B créatifs
export const testsABCreatifs = pgTable('tests_ab_creatifs', {
  id: uuid('id').defaultRandom().primaryKey(),
  campagneId: uuid('campagne_id').references(() => campagnesPublicitaires.id).notNull(),
  nom: text('nom').notNull(),
  hypothese: text('hypothese').notNull(), // Hypothèse du test
  typeTest: text('type_test', {
    enum: ['headline', 'description', 'image', 'cta', 'landing_page', 'audience']
  }).notNull(),
  creatifControle: uuid('creatif_controle').references(() => creatifsPublicitaires.id).notNull(),
  creatifVariante: uuid('creatif_variante').references(() => creatifsPublicitaires.id).notNull(),
  repartitionTrafic: decimal('repartition_trafic', { precision: 3, scale: 2 }).default('0.50').notNull(), // 50/50 par défaut
  metriqueObjectif: text('metrique_objectif', {
    enum: ['ctr', 'cpa', 'roas', 'conversion_rate', 'engagement']
  }).notNull(),
  significanceLevel: decimal('significance_level', { precision: 3, scale: 2 }).default('0.95').notNull(),
  tailleSample: integer('taille_sample').notNull(),
  statut: text('statut', {
    enum: ['setup', 'running', 'completed', 'paused', 'failed']
  }).default('setup').notNull(),
  gagnant: text('gagnant', {
    enum: ['controle', 'variante', 'no_difference']
  }),
  confianceResultat: decimal('confiance_resultat', { precision: 5, scale: 4 }),
  liftPerformance: decimal('lift_performance', { precision: 5, scale: 2 }), // % d'amélioration
  dateDebut: timestamp('date_debut'),
  dateFin: timestamp('date_fin'),
  dureeTestJours: integer('duree_test_jours').default(14).notNull(),
  resultatsDetailles: json('resultats_detailles'),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 🚨 Table des alertes et notifications ADS
export const alertesAds = pgTable('alertes_ads', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').references(() => sitesGeneres.id).notNull(),
  campagneId: uuid('campagne_id').references(() => campagnesPublicitaires.id),
  type: text('type', {
    enum: ['budget_epuise', 'cpa_eleve', 'roas_faible', 'conversion_drop', 'competition_increase', 'opportunity_detected']
  }).notNull(),
  severite: text('severite', {
    enum: ['info', 'warning', 'critical']
  }).default('warning').notNull(),
  titre: text('titre').notNull(),
  message: text('message').notNull(),
  seuilDeclenche: decimal('seuil_declenche', { precision: 10, scale: 2 }),
  valeurActuelle: decimal('valeur_actuelle', { precision: 10, scale: 2 }),
  recommandationAction: text('recommandation_action'),
  actionRecommandee: json('action_recommandee'), // Actions automatiques suggérées
  statut: text('statut', {
    enum: ['nouvelle', 'en_cours', 'resolue', 'ignoree']
  }).default('nouvelle').notNull(),
  actionPrise: text('action_prise'),
  dateResolution: timestamp('date_resolution'),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// 💰 Table des revenus et commissions
export const revenusCommissions = pgTable('revenus_commissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').references(() => sitesGeneres.id).notNull(),
  campagneId: uuid('campagne_id').references(() => campagnesPublicitaires.id).notNull(),
  periode: text('periode').notNull(), // YYYY-MM format
  depenseClient: decimal('depense_client', { precision: 10, scale: 2 }).notNull(),
  tauxCommission: decimal('taux_commission', { precision: 3, scale: 2 }).default('0.20').notNull(), // 20%
  commissionBrute: decimal('commission_brute', { precision: 10, scale: 2 }).notNull(),
  fraisPlateforme: decimal('frais_plateforme', { precision: 10, scale: 2 }).default('0.00'),
  commissionNette: decimal('commission_nette', { precision: 10, scale: 2 }).notNull(),
  statutPaiement: text('statut_paiement', {
    enum: ['pending', 'paid', 'disputed', 'refunded']
  }).default('pending').notNull(),
  facturePolarId: text('facture_polar_id'),
  datePeriodeDebut: timestamp('date_periode_debut').notNull(),
  datePeriodeFin: timestamp('date_periode_fin').notNull(),
  dateFacturation: timestamp('date_facturation'),
  datePaiement: timestamp('date_paiement'),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
});

// =============================================================================
// 🔧 TYPES TYPESCRIPT ADS MANAGEMENT
// =============================================================================

export type CampagnePublicitaire = typeof campagnesPublicitaires.$inferSelect;
export type InsertCampagnePublicitaire = typeof campagnesPublicitaires.$inferInsert;

export type CreatifPublicitaire = typeof creatifsPublicitaires.$inferSelect;
export type InsertCreatifPublicitaire = typeof creatifsPublicitaires.$inferInsert;

export type MetriqueCampagne = typeof metriquesCampagnes.$inferSelect;
export type InsertMetriqueCampagne = typeof metriquesCampagnes.$inferInsert;

export type CustomerJourney = typeof customerJourney.$inferSelect;
export type InsertCustomerJourney = typeof customerJourney.$inferInsert;

export type AttributionMultiTouch = typeof attributionsMultiTouch.$inferSelect;
export type InsertAttributionMultiTouch = typeof attributionsMultiTouch.$inferInsert;

export type ModeleML = typeof modelesML.$inferSelect;
export type InsertModeleML = typeof modelesML.$inferInsert;

export type TestABCreatif = typeof testsABCreatifs.$inferSelect;
export type InsertTestABCreatif = typeof testsABCreatifs.$inferInsert;

export type AlerteAds = typeof alertesAds.$inferSelect;
export type InsertAlerteAds = typeof alertesAds.$inferInsert;

export type RevenuCommission = typeof revenusCommissions.$inferSelect;
export type InsertRevenuCommission = typeof revenusCommissions.$inferInsert;