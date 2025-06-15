/**
 * Vérification complète du statut du compte Stripe
 */

const stripe = require('stripe')('sk_test_YOUR_STRIPE_SECRET_KEY_HERE');

async function checkAccount() {
  try {
    console.log('🔍 Diagnostic complet du compte Stripe...\n');
    
    // 1. Account détaillé
    const account = await stripe.accounts.retrieve();
    console.log('=== COMPTE ===');
    console.log('ID:', account.id);
    console.log('Email:', account.email);
    console.log('Pays:', account.country);
    console.log('Devise par défaut:', account.default_currency);
    console.log('Charges activées:', account.charges_enabled);
    console.log('Paiements activés:', account.payouts_enabled);
    console.log('Détails requis:', account.details_submitted);
    
    // 2. Requirements
    if (account.requirements) {
      console.log('\n=== EXIGENCES ===');
      console.log('Currently due:', account.requirements.currently_due);
      console.log('Eventually due:', account.requirements.eventually_due);
      console.log('Past due:', account.requirements.past_due);
      console.log('Disabled reason:', account.requirements.disabled_reason);
    }
    
    // 3. Capabilities
    if (account.capabilities) {
      console.log('\n=== CAPACITÉS ===');
      Object.entries(account.capabilities).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    }
    
    // 4. Test simple avec session existante
    console.log('\n=== TEST SESSION ===');
    const session = await stripe.checkout.sessions.retrieve('cs_test_a1Bvcz45HdHtPtQ87MpvdTS3rbKQQupdRVpyyjGN6hOD0kAErViQkZD0ZA');
    console.log('Session status:', session.status);
    console.log('Payment status:', session.payment_status);
    console.log('URL:', session.url);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code) console.error('Code:', error.code);
  }
}

checkAccount();