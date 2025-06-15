/**
 * Test avec votre produit Stripe existant
 */

const stripe = require('stripe')('sk_test_YOUR_STRIPE_SECRET_KEY_HERE');

async function testWithProduct() {
  try {
    console.log('🧪 Test avec votre produit créé...\n');
    
    // 1. Vérifier le produit
    const product = await stripe.products.retrieve('prod_SUxELTBpnYo1gn');
    console.log('✅ Produit trouvé:', product.name);
    
    // 2. Récupérer les prix
    const prices = await stripe.prices.list({
      product: 'prod_SUxELTBpnYo1gn',
      active: true,
      limit: 5
    });
    
    console.log('📋 Prix disponibles:');
    prices.data.forEach(price => {
      console.log(`   - ${price.id}: ${price.unit_amount/100}€`);
    });
    
    if (prices.data.length === 0) {
      console.log('❌ Aucun prix trouvé pour ce produit');
      return;
    }
    
    // 3. Créer une session avec le produit
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: 'test@example.com',
      metadata: {
        demandeId: 'test-123',
        type: 'test',
        entreprise: 'Test Entreprise',
      },
      success_url: `http://localhost:3334/paiement/success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: `http://localhost:3334/demande?cancelled=true`,
    });
    
    console.log('\n✅ Session créée avec votre produit !');
    console.log('ID:', session.id);
    console.log('URL:', session.url);
    
    return session.url;
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

testWithProduct().then(url => {
  if (url) {
    console.log('\n🎯 Testez cette URL maintenant:', url);
  }
});