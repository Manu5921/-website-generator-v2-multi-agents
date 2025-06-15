import { pgTable, text, integer, timestamp, boolean, decimal, uuid } from 'drizzle-orm/pg-core';

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