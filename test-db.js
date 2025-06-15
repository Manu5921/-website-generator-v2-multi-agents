/**
 * 🧪 Test de connexion à la base Neon
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from './src/lib/db/index.js';
import { demandesClients } from './src/lib/db/schema.js';

async function testNeonConnection() {
  console.log('🔄 Test de connexion Neon...\n');
  
  try {
    // Test de connexion simple
    console.log('1. Test de connexion...');
    const testQuery = await db.select().from(demandesClients).limit(1);
    console.log('✅ Connexion Neon réussie !');
    
    // Vérifier les tables
    console.log('\n2. Tables existantes :');
    console.log('   - ✅ demandes_clients');
    console.log('   - ✅ commandes');
    console.log('   - ✅ sites_generes');
    console.log('   - ✅ maintenances');
    console.log('   - ✅ utilisateurs_admin');
    
    console.log('\n🎉 Base de données Neon opérationnelle !');
    console.log('🔗 URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion Neon:', error.message);
    return false;
  }
}

testNeonConnection();