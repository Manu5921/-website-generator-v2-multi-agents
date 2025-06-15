/**
 * 🔧 Script d'initialisation admin
 * Crée un utilisateur administrateur pour accéder au dashboard
 */

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db } from '../src/lib/db/index.js';
import { utilisateursAdmin } from '../src/lib/db/schema.js';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

async function initAdmin() {
  console.log('🔧 Initialisation utilisateur admin...\n');

  try {
    const adminEmail = 'admin@website-generator.com';
    const adminPassword = 'admin123'; // À changer en production !
    const adminNom = 'Administrateur';

    // Vérifier si l'admin existe déjà
    console.log('1. Vérification admin existant...');
    const [existingAdmin] = await db
      .select()
      .from(utilisateursAdmin)
      .where(eq(utilisateursAdmin.email, adminEmail))
      .limit(1);

    if (existingAdmin) {
      console.log('⚠️  Admin déjà existant:', adminEmail);
      console.log('   ID:', existingAdmin.id);
      console.log('   Nom:', existingAdmin.nom);
      console.log('   Dernière connexion:', existingAdmin.dernierLogin || 'Jamais');
      return;
    }

    // Hasher le mot de passe
    console.log('2. Hashage du mot de passe...');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Créer l'admin
    console.log('3. Création de l\'utilisateur admin...');
    const [nouvelAdmin] = await db
      .insert(utilisateursAdmin)
      .values({
        email: adminEmail,
        nom: adminNom,
        motDePasse: hashedPassword,
        role: 'admin'
      })
      .returning();

    console.log('\n✅ Utilisateur admin créé avec succès !');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Mot de passe:', adminPassword);
    console.log('🆔 ID:', nouvelAdmin.id);
    console.log('\n🔐 Vous pouvez maintenant vous connecter sur:');
    console.log('   http://localhost:3000/login');
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe en production !');

  } catch (error) {
    console.error('❌ Erreur création admin:', error);
  }
}

initAdmin();