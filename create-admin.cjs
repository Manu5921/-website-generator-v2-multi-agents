/**
 * 🔧 Script d'initialisation admin - Version CJS
 */

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { eq } = require('drizzle-orm');

// Schema simplifiée pour l'admin
const { pgTable, text, timestamp, varchar, boolean } = require('drizzle-orm/pg-core');

const utilisateursAdmin = pgTable('utilisateurs_admin', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  nom: varchar('nom', { length: 255 }).notNull(),
  motDePasse: text('mot_de_passe').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('admin'),
  actif: boolean('actif').default(true),
  dernierLogin: timestamp('dernier_login'),
  dateCreation: timestamp('date_creation').defaultNow(),
  dateModification: timestamp('date_modification').defaultNow()
});

async function createAdmin() {
  console.log('🔧 Création utilisateur admin...\n');

  try {
    // Connexion à la base
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    const adminEmail = 'admin@website-generator.com';
    const adminPassword = 'admin123';
    const adminNom = 'Administrateur';
    const adminId = `admin_${Date.now()}`;

    // Supprimer admin existant
    console.log('1. Suppression admin existant...');
    await db.delete(utilisateursAdmin).where(eq(utilisateursAdmin.email, adminEmail));

    // Hasher le mot de passe
    console.log('2. Hashage du mot de passe...');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Créer l'admin
    console.log('3. Création nouvel admin...');
    const [nouvelAdmin] = await db
      .insert(utilisateursAdmin)
      .values({
        id: adminId,
        email: adminEmail,
        nom: adminNom,
        motDePasse: hashedPassword,
        role: 'admin',
        actif: true
      })
      .returning();

    console.log('\n✅ Admin créé avec succès !');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Mot de passe:', adminPassword);
    console.log('🆔 ID:', nouvelAdmin.id);
    console.log('\n🔐 Connexion:');
    console.log('   http://localhost:3334/login');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createAdmin();