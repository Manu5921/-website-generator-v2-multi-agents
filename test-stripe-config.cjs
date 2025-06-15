/**
 * 🧪 Script de test de configuration Stripe
 */

const checkStripeConfig = () => {
  const requiredVars = [
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY', 
    'STRIPE_WEBHOOK_SECRET'
  ];

  console.log('🔍 Vérification configuration Stripe...\n');

  const missing = [];
  const placeholder = [];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
    } else if (value.includes('your_key_here') || value.includes('your_webhook_secret_here')) {
      placeholder.push(varName);
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    }
  });

  if (missing.length > 0) {
    console.log(`❌ Variables manquantes: ${missing.join(', ')}`);
  }

  if (placeholder.length > 0) {
    console.log(`⚠️  Variables avec valeurs placeholder: ${placeholder.join(', ')}`);
  }

  if (missing.length === 0 && placeholder.length === 0) {
    console.log('\n🎉 Configuration Stripe complète !');
    return true;
  } else {
    console.log('\n📝 Pour configurer Stripe:');
    console.log('1. Allez sur https://dashboard.stripe.com/');
    console.log('2. Récupérez vos clés test (pk_test_... et sk_test_...)');
    console.log('3. Configurez un webhook endpoint');
    console.log('4. Mettez à jour .env.local avec les vraies valeurs');
    return false;
  }
};

// Load environment variables
require('dotenv').config({ path: '.env.local' });
const isConfigured = checkStripeConfig();

if (!isConfigured) {
  console.log('\n🔶 L\'intégration Stripe est prête, il ne manque que les clés API réelles.');
  console.log('   Le bouton "Stripe" dans le dashboard fonctionnera une fois les clés configurées.');
}