/**
 * Debug complet des clés Stripe
 */

const stripe = require('stripe')('sk_test_YOUR_STRIPE_SECRET_KEY_HERE');

async function debugStripe() {
  try {
    console.log('🔍 Debug complet Stripe...\n');
    
    // 1. Vérifier l'account
    console.log('1. Vérification du compte...');
    const account = await stripe.accounts.retrieve();
    console.log('   Compte ID:', account.id);
    console.log('   Email:', account.email);
    console.log('   Type:', account.type);
    console.log('   Actif:', account.charges_enabled);
    console.log('   Mode:', account.metadata?.mode || 'production');
    
    // 2. Lister les produits
    console.log('\n2. Produits existants...');
    const products = await stripe.products.list({ limit: 5 });
    console.log('   Nombre de produits:', products.data.length);
    products.data.forEach(p => {
      console.log(`   - ${p.name} (${p.id})`);
    });
    
    // 3. Test avec montant minimal
    console.log('\n3. Test checkout avec 1€...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Test Debug',
          },
          unit_amount: 100, // 1€
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://httpbin.org/get?success=true',
      cancel_url: 'https://httpbin.org/get?cancelled=true',
    });
    
    console.log('   ✅ Session créée:', session.id);
    console.log('   URL:', session.url);
    
    return session.url;
    
  } catch (error) {
    console.error('❌ Erreur:', error.code || 'UNKNOWN');
    console.error('   Message:', error.message);
    if (error.type) console.error('   Type:', error.type);
    return null;
  }
}

debugStripe().then(url => {
  if (url) {
    console.log('\n🎯 Testez cette URL:', url);
  }
});