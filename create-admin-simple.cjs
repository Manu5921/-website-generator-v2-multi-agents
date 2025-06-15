/**
 * 🔧 Script simple de création admin
 */

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

async function createAdmin() {
  console.log('🔧 Création admin simple...\n');

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    const adminEmail = 'admin@website-generator.com';
    const adminPassword = 'admin123';
    const adminNom = 'Administrateur';
    
    // Hasher le mot de passe
    console.log('1. Hashage du mot de passe...');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Supprimer admin existant d'abord
    console.log('2. Suppression admin existant...');
    await sql`DELETE FROM utilisateurs_admin WHERE email = ${adminEmail}`;
    
    // Créer l'admin
    console.log('3. Création nouvel admin...');
    const result = await sql`
      INSERT INTO utilisateurs_admin (id, email, nom, mot_de_passe, role, date_creation)
      VALUES (gen_random_uuid(), ${adminEmail}, ${adminNom}, ${hashedPassword}, 'admin', NOW())
      RETURNING id, email, nom
    `;

    console.log('\n✅ Admin créé avec succès !');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Mot de passe:', adminPassword);
    console.log('🆔 ID:', result[0].id);
    console.log('\n🔐 Connexion:');
    console.log('   http://localhost:3334/login');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createAdmin();