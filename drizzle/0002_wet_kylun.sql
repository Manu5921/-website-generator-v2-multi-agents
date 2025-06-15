CREATE TABLE "alertes_ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"campagne_id" uuid,
	"type" text NOT NULL,
	"severite" text DEFAULT 'warning' NOT NULL,
	"titre" text NOT NULL,
	"message" text NOT NULL,
	"seuil_declenche" numeric(10, 2),
	"valeur_actuelle" numeric(10, 2),
	"recommandation_action" text,
	"action_recommandee" json,
	"statut" text DEFAULT 'nouvelle' NOT NULL,
	"action_prise" text,
	"date_resolution" timestamp,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attributions_multi_touch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversion_id" uuid NOT NULL,
	"session_id" text NOT NULL,
	"site_id" uuid NOT NULL,
	"contact_id" uuid,
	"campagne_id" uuid,
	"creatif_id" uuid,
	"modele_attribution" text DEFAULT 'linear' NOT NULL,
	"poids_attribution" numeric(5, 4) NOT NULL,
	"valeur_attributee" numeric(10, 2) NOT NULL,
	"ordre_etape" integer NOT NULL,
	"delai_attribution" integer,
	"type_conversion" text NOT NULL,
	"date_conversion" timestamp NOT NULL,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "base_connaissances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"secteur" text NOT NULL,
	"categorie" text NOT NULL,
	"question" text NOT NULL,
	"reponse" text NOT NULL,
	"keywords" json,
	"priority" integer DEFAULT 5 NOT NULL,
	"utilisation_count" integer DEFAULT 0,
	"success_rate" numeric(5, 2) DEFAULT '0.00',
	"derniere_utilisation" timestamp,
	"actif" boolean DEFAULT true NOT NULL,
	"date_creation" timestamp DEFAULT now() NOT NULL,
	"date_modification" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campagnes_publicitaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"plateforme" text NOT NULL,
	"type" text NOT NULL,
	"statut" text DEFAULT 'draft' NOT NULL,
	"budget_quotidien" numeric(10, 2) NOT NULL,
	"budget_total" numeric(10, 2),
	"objectif" text NOT NULL,
	"secteur_cible" text NOT NULL,
	"audience_cible" json NOT NULL,
	"strategie_encheres" text DEFAULT 'maximize_conversions' NOT NULL,
	"cpa_target" numeric(10, 2),
	"roas_target" numeric(5, 2),
	"id_externe" text,
	"date_debut" timestamp NOT NULL,
	"date_fin" timestamp,
	"date_creation" timestamp DEFAULT now() NOT NULL,
	"derniere_optimisation" timestamp,
	"metadonnees_ml" json
);
--> statement-breakpoint
CREATE TABLE "conversations_chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid,
	"contact_id" uuid,
	"canal" text DEFAULT 'chat_web' NOT NULL,
	"statut" text DEFAULT 'active' NOT NULL,
	"agent_type" text DEFAULT 'service_client' NOT NULL,
	"satisfaction" integer,
	"resolved_automatically" boolean DEFAULT false,
	"escalation_reason" text,
	"session_data" json,
	"date_creation" timestamp DEFAULT now() NOT NULL,
	"date_fermeture" timestamp,
	"derniere_activite" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creatifs_publicitaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campagne_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"type" text NOT NULL,
	"titre" text NOT NULL,
	"description" text,
	"url_image" text,
	"url_video" text,
	"call_to_action" text,
	"url_destination" text NOT NULL,
	"utm_source" text,
	"utm_campaign" text,
	"utm_medium" text,
	"utm_content" text,
	"utm_term" text,
	"statut" text DEFAULT 'active' NOT NULL,
	"score_qualite" numeric(3, 1),
	"date_creation" timestamp DEFAULT now() NOT NULL,
	"performance_data" json
);
--> statement-breakpoint
CREATE TABLE "customer_journey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"site_id" uuid NOT NULL,
	"contact_id" uuid,
	"etape" integer NOT NULL,
	"type_evenement" text NOT NULL,
	"source" text,
	"medium" text,
	"campagne" text,
	"contenu" text,
	"mot_cle" text,
	"url_page" text,
	"referrer" text,
	"user_agent" text,
	"ip_address" text,
	"localisation_geo" json,
	"valeur_evenement" numeric(10, 2),
	"duree_session" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadonnees" json
);
--> statement-breakpoint
CREATE TABLE "escalations_humaines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"raison" text NOT NULL,
	"priorite" text DEFAULT 'normale' NOT NULL,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"agent_humain" text,
	"notes_contexte" text,
	"resolution_summary" text,
	"date_escalade" timestamp DEFAULT now() NOT NULL,
	"date_resolution" timestamp
);
--> statement-breakpoint
CREATE TABLE "intents_detectes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"secteur" text NOT NULL,
	"patterns" json NOT NULL,
	"responses" json NOT NULL,
	"actions" json,
	"confidence_threshold" numeric(3, 2) DEFAULT '0.70',
	"actif" boolean DEFAULT true NOT NULL,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages_chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"expediteur" text NOT NULL,
	"contenu" text NOT NULL,
	"type_message" text DEFAULT 'texte' NOT NULL,
	"metadata" json,
	"response_time" integer,
	"intent_detected" text,
	"confidence_score" numeric(3, 2),
	"date_envoi" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metriques_agents_ia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_type" text NOT NULL,
	"site_id" uuid,
	"periode" text NOT NULL,
	"date_debut" timestamp NOT NULL,
	"date_fin" timestamp NOT NULL,
	"conversations_totales" integer DEFAULT 0,
	"conversations_resolues" integer DEFAULT 0,
	"taux_resolution_auto" numeric(5, 2) DEFAULT '0.00',
	"temps_reponse_moyen" integer DEFAULT 0,
	"satisfaction_moyenne" numeric(3, 2) DEFAULT '0.00',
	"escalations_humaines" integer DEFAULT 0,
	"emails_envoyes" integer DEFAULT 0,
	"taux_ouverture" numeric(5, 2) DEFAULT '0.00',
	"taux_clic" numeric(5, 2) DEFAULT '0.00',
	"conversions_generees" integer DEFAULT 0,
	"revenue_genere" numeric(10, 2) DEFAULT '0.00',
	"rapports_generes" integer DEFAULT 0,
	"insights_fournis" integer DEFAULT 0,
	"alertes_envoyees" integer DEFAULT 0,
	"predictions_accuracy" numeric(3, 2) DEFAULT '0.00',
	"metadonnees" json,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metriques_campagnes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campagne_id" uuid NOT NULL,
	"creatif_id" uuid,
	"date" timestamp NOT NULL,
	"impressions" integer DEFAULT 0,
	"clics" integer DEFAULT 0,
	"depense" numeric(10, 2) DEFAULT '0.00',
	"conversions" integer DEFAULT 0,
	"valeur_conversions" numeric(10, 2) DEFAULT '0.00',
	"ctr" numeric(5, 4) DEFAULT '0.0000',
	"cpc" numeric(10, 2) DEFAULT '0.00',
	"cpa" numeric(10, 2) DEFAULT '0.00',
	"roas" numeric(5, 2) DEFAULT '0.00',
	"taux_conversion" numeric(5, 4) DEFAULT '0.0000',
	"donnees_detaillees" json,
	"horodatage" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modeles_ml" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"type" text NOT NULL,
	"secteur" text,
	"version" text DEFAULT '1.0' NOT NULL,
	"algorithme" text NOT NULL,
	"hyperparametres" json NOT NULL,
	"metriques_performance" json,
	"donnees_entrainement" json,
	"modele_serialise" text,
	"statut" text DEFAULT 'training' NOT NULL,
	"dernier_entrainement" timestamp,
	"prochain_entrainement" timestamp,
	"score_validation" numeric(5, 4),
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenus_commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"campagne_id" uuid NOT NULL,
	"periode" text NOT NULL,
	"depense_client" numeric(10, 2) NOT NULL,
	"taux_commission" numeric(3, 2) DEFAULT '0.20' NOT NULL,
	"commission_brute" numeric(10, 2) NOT NULL,
	"frais_plateforme" numeric(10, 2) DEFAULT '0.00',
	"commission_nette" numeric(10, 2) NOT NULL,
	"statut_paiement" text DEFAULT 'pending' NOT NULL,
	"facture_polar_id" text,
	"date_periode_debut" timestamp NOT NULL,
	"date_periode_fin" timestamp NOT NULL,
	"date_facturation" timestamp,
	"date_paiement" timestamp,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests_ab_creatifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campagne_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"hypothese" text NOT NULL,
	"type_test" text NOT NULL,
	"creatif_controle" uuid NOT NULL,
	"creatif_variante" uuid NOT NULL,
	"repartition_trafic" numeric(3, 2) DEFAULT '0.50' NOT NULL,
	"metrique_objectif" text NOT NULL,
	"significance_level" numeric(3, 2) DEFAULT '0.95' NOT NULL,
	"taille_sample" integer NOT NULL,
	"statut" text DEFAULT 'setup' NOT NULL,
	"gagnant" text,
	"confiance_resultat" numeric(5, 4),
	"lift_performance" numeric(5, 2),
	"date_debut" timestamp,
	"date_fin" timestamp,
	"duree_test_jours" integer DEFAULT 14 NOT NULL,
	"resultats_detailles" json,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alertes_ads" ADD CONSTRAINT "alertes_ads_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alertes_ads" ADD CONSTRAINT "alertes_ads_campagne_id_campagnes_publicitaires_id_fk" FOREIGN KEY ("campagne_id") REFERENCES "public"."campagnes_publicitaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attributions_multi_touch" ADD CONSTRAINT "attributions_multi_touch_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attributions_multi_touch" ADD CONSTRAINT "attributions_multi_touch_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attributions_multi_touch" ADD CONSTRAINT "attributions_multi_touch_campagne_id_campagnes_publicitaires_id_fk" FOREIGN KEY ("campagne_id") REFERENCES "public"."campagnes_publicitaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attributions_multi_touch" ADD CONSTRAINT "attributions_multi_touch_creatif_id_creatifs_publicitaires_id_fk" FOREIGN KEY ("creatif_id") REFERENCES "public"."creatifs_publicitaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campagnes_publicitaires" ADD CONSTRAINT "campagnes_publicitaires_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations_chat" ADD CONSTRAINT "conversations_chat_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations_chat" ADD CONSTRAINT "conversations_chat_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creatifs_publicitaires" ADD CONSTRAINT "creatifs_publicitaires_campagne_id_campagnes_publicitaires_id_fk" FOREIGN KEY ("campagne_id") REFERENCES "public"."campagnes_publicitaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_journey" ADD CONSTRAINT "customer_journey_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_journey" ADD CONSTRAINT "customer_journey_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations_humaines" ADD CONSTRAINT "escalations_humaines_conversation_id_conversations_chat_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations_chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages_chat" ADD CONSTRAINT "messages_chat_conversation_id_conversations_chat_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations_chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metriques_agents_ia" ADD CONSTRAINT "metriques_agents_ia_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metriques_campagnes" ADD CONSTRAINT "metriques_campagnes_campagne_id_campagnes_publicitaires_id_fk" FOREIGN KEY ("campagne_id") REFERENCES "public"."campagnes_publicitaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metriques_campagnes" ADD CONSTRAINT "metriques_campagnes_creatif_id_creatifs_publicitaires_id_fk" FOREIGN KEY ("creatif_id") REFERENCES "public"."creatifs_publicitaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenus_commissions" ADD CONSTRAINT "revenus_commissions_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenus_commissions" ADD CONSTRAINT "revenus_commissions_campagne_id_campagnes_publicitaires_id_fk" FOREIGN KEY ("campagne_id") REFERENCES "public"."campagnes_publicitaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests_ab_creatifs" ADD CONSTRAINT "tests_ab_creatifs_campagne_id_campagnes_publicitaires_id_fk" FOREIGN KEY ("campagne_id") REFERENCES "public"."campagnes_publicitaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests_ab_creatifs" ADD CONSTRAINT "tests_ab_creatifs_creatif_controle_creatifs_publicitaires_id_fk" FOREIGN KEY ("creatif_controle") REFERENCES "public"."creatifs_publicitaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests_ab_creatifs" ADD CONSTRAINT "tests_ab_creatifs_creatif_variante_creatifs_publicitaires_id_fk" FOREIGN KEY ("creatif_variante") REFERENCES "public"."creatifs_publicitaires"("id") ON DELETE no action ON UPDATE no action;