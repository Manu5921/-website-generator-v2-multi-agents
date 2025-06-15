/**
 * Test script pour vérifier la création de checkout Polar
 */

import { Polar } from "@polar-sh/sdk";
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.POLAR_MODE === "production" ? "production" : "sandbox"
});

async function testCheckout() {
  try {
    console.log('🔧 Test création checkout avec produit test...');
    console.log('Mode:', process.env.POLAR_MODE);
    console.log('Test Product ID:', process.env.POLAR_TEST_PRODUCT_ID);
    
    const checkout = await polarClient.checkouts.create({
      products: [process.env.POLAR_TEST_PRODUCT_ID],
      customerEmail: 'test@example.com',
      metadata: {
        demandeId: 'test-123',
        type: 'test',
        entreprise: 'Test Corp',
        clientNom: 'Test User'
      },
      successUrl: `${process.env.APP_URL}/paiement/success?session_id={CHECKOUT_SESSION_ID}`
    });

    console.log('✅ Checkout créé avec succès!');
    console.log('ID:', checkout.id);
    console.log('URL:', checkout.url);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('Détails:', error.message);
    if (error.response) {
      console.error('Réponse API:', error.response.data);
    }
  }
}

testCheckout();