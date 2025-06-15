CREATE TABLE "commandes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demande_id" uuid NOT NULL,
	"montant" numeric(10, 2) NOT NULL,
	"devise" text DEFAULT 'EUR' NOT NULL,
	"polar_payment_id" text,
	"statut" text DEFAULT 'attente' NOT NULL,
	"date_paiement" timestamp,
	"date_creation" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demandes_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"email" text NOT NULL,
	"entreprise" text NOT NULL,
	"ville" text NOT NULL,
	"telephone" text NOT NULL,
	"slogan" text,
	"date_creation" timestamp DEFAULT now() NOT NULL,
	"statut" text DEFAULT 'nouvelle' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "maintenances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"mois_annee" text NOT NULL,
	"montant" numeric(10, 2) DEFAULT '29.00' NOT NULL,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"date_echeance" timestamp NOT NULL,
	"date_paiement" timestamp,
	"polar_payment_id" text
);
--> statement-breakpoint
CREATE TABLE "sites_generes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commande_id" uuid NOT NULL,
	"url" text NOT NULL,
	"secteur" text NOT NULL,
	"style" text NOT NULL,
	"repo_name" text NOT NULL,
	"date_generation" timestamp DEFAULT now() NOT NULL,
	"actif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utilisateurs_admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"nom" text NOT NULL,
	"mot_de_passe" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"date_creation" timestamp DEFAULT now() NOT NULL,
	"dernier_login" timestamp,
	CONSTRAINT "utilisateurs_admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_demande_id_demandes_clients_id_fk" FOREIGN KEY ("demande_id") REFERENCES "public"."demandes_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_site_id_sites_generes_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites_generes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites_generes" ADD CONSTRAINT "sites_generes_commande_id_commandes_id_fk" FOREIGN KEY ("commande_id") REFERENCES "public"."commandes"("id") ON DELETE no action ON UPDATE no action;