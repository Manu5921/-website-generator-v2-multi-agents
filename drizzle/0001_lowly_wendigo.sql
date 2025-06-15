CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid,
	"nom" text NOT NULL,
	"email" text NOT NULL,
	"telephone" text,
	"entreprise" text,
	"secteur_activite" text,
	"source" text NOT NULL,
	"statut" text DEFAULT 'nouveau' NOT NULL,
	"score_qualification" integer DEFAULT 0,
	"derniere_interaction" timestamp DEFAULT now() NOT NULL,
	"donnees_custom" json,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "declencheurs_workflow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"evenement" text NOT NULL,
	"conditions" json NOT NULL,
	"actif" boolean DEFAULT true NOT NULL,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "executions_workflow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"contact_id" uuid,
	"statut_execution" text DEFAULT 'en_cours' NOT NULL,
	"etape_actuelle" integer DEFAULT 1 NOT NULL,
	"donnees_context" json,
	"date_debut" timestamp DEFAULT now() NOT NULL,
	"date_fin" timestamp,
	"erreurs" json
);
--> statement-breakpoint
CREATE TABLE "metriques_conversion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"workflow_id" uuid,
	"periode" text NOT NULL,
	"date_debut" timestamp NOT NULL,
	"date_fin" timestamp NOT NULL,
	"visiteurs" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"taux_conversion" numeric(5, 2) DEFAULT '0.00',
	"chiffre_affaires" numeric(10, 2) DEFAULT '0.00',
	"cout_acquisition" numeric(10, 2) DEFAULT '0.00',
	"donnees_detaillees" json,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metriques_orchestration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projet_id" uuid,
	"agent_type" text,
	"metrique" text NOT NULL,
	"valeur" numeric(15, 5) NOT NULL,
	"unite" text,
	"horodatage" timestamp DEFAULT now() NOT NULL,
	"metadonnees" text
);
--> statement-breakpoint
CREATE TABLE "notifications_systeme" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid,
	"type" text NOT NULL,
	"titre" text NOT NULL,
	"message" text NOT NULL,
	"niveau" text DEFAULT 'info' NOT NULL,
	"lu" boolean DEFAULT false NOT NULL,
	"donnees_action" json,
	"destinataire" text NOT NULL,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projets_multi_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demande_id" uuid NOT NULL,
	"statut" text DEFAULT 'initialise' NOT NULL,
	"priorite" text DEFAULT 'normale' NOT NULL,
	"secteur_business" text NOT NULL,
	"budget_client" numeric(10, 2) NOT NULL,
	"temps_previsionnel" integer DEFAULT 25 NOT NULL,
	"temps_reel" integer,
	"date_debut_production" timestamp,
	"date_fin_production" timestamp,
	"date_creation" timestamp DEFAULT now() NOT NULL,
	"metadonnees" text
);
--> statement-breakpoint
CREATE TABLE "queue_orchestration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projet_id" uuid NOT NULL,
	"tache_id" uuid,
	"type_message" text NOT NULL,
	"payload" text NOT NULL,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"tentatives" integer DEFAULT 0 NOT NULL,
	"max_tentatives" integer DEFAULT 3 NOT NULL,
	"agent_destinataire" text,
	"date_creation" timestamp DEFAULT now() NOT NULL,
	"date_traitement" timestamp,
	"date_expiration" timestamp
);
--> statement-breakpoint
CREATE TABLE "synchronisations_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projet_id" uuid NOT NULL,
	"agent_emetteur" text NOT NULL,
	"agent_recepteur" text NOT NULL,
	"type_sync" text NOT NULL,
	"donnees" text NOT NULL,
	"statut" text DEFAULT 'envoye' NOT NULL,
	"date_envoi" timestamp DEFAULT now() NOT NULL,
	"date_reception" timestamp,
	"date_traitement" timestamp
);
--> statement-breakpoint
CREATE TABLE "taches_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projet_id" uuid NOT NULL,
	"agent_type" text NOT NULL,
	"nom_tache" text NOT NULL,
	"description" text NOT NULL,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"priorite" integer DEFAULT 5 NOT NULL,
	"dependances" text,
	"temps_estime" integer NOT NULL,
	"temps_reel" integer,
	"resultat" text,
	"erreurs" text,
	"agent_endpoint" text,
	"date_assignation" timestamp,
	"date_debut" timestamp,
	"date_fin" timestamp,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates_communication" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"canal" text NOT NULL,
	"etape" integer NOT NULL,
	"nom" text NOT NULL,
	"sujet" text,
	"contenu" text NOT NULL,
	"delai_envoi" integer DEFAULT 0 NOT NULL,
	"conditions" json,
	"actif" boolean DEFAULT true NOT NULL,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows_automatises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"secteur" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"configuration" json NOT NULL,
	"actif" boolean DEFAULT true NOT NULL,
	"date_creation" timestamp DEFAULT now() NOT NULL,
	"derniere_mise_a_jour" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declencheurs_workflow" ADD CONSTRAINT "declencheurs_workflow_workflow_id_workflows_automatises_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows_automatises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions_workflow" ADD CONSTRAINT "executions_workflow_workflow_id_workflows_automatises_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows_automatises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metriques_conversion" ADD CONSTRAINT "metriques_conversion_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metriques_conversion" ADD CONSTRAINT "metriques_conversion_workflow_id_workflows_automatises_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows_automatises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metriques_orchestration" ADD CONSTRAINT "metriques_orchestration_projet_id_projets_multi_agents_id_fk" FOREIGN KEY ("projet_id") REFERENCES "public"."projets_multi_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications_systeme" ADD CONSTRAINT "notifications_systeme_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projets_multi_agents" ADD CONSTRAINT "projets_multi_agents_demande_id_demandes_clients_id_fk" FOREIGN KEY ("demande_id") REFERENCES "public"."demandes_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_orchestration" ADD CONSTRAINT "queue_orchestration_projet_id_projets_multi_agents_id_fk" FOREIGN KEY ("projet_id") REFERENCES "public"."projets_multi_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_orchestration" ADD CONSTRAINT "queue_orchestration_tache_id_taches_agents_id_fk" FOREIGN KEY ("tache_id") REFERENCES "public"."taches_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synchronisations_agents" ADD CONSTRAINT "synchronisations_agents_projet_id_projets_multi_agents_id_fk" FOREIGN KEY ("projet_id") REFERENCES "public"."projets_multi_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taches_agents" ADD CONSTRAINT "taches_agents_projet_id_projets_multi_agents_id_fk" FOREIGN KEY ("projet_id") REFERENCES "public"."projets_multi_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates_communication" ADD CONSTRAINT "templates_communication_workflow_id_workflows_automatises_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows_automatises"("id") ON DELETE no action ON UPDATE no action;