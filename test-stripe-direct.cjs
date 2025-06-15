/**
 * Test direct de Stripe sans notre application
 */

const stripe = require('stripe')('sk_test_YOUR_STRIPE_SECRET_KEY_HERE');

async function testStripeCheckout() {
  try {
    console.log('🧪 Test direct API Stripe...');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Test Simple',
              description: 'Test direct Stripe',
            },
            unit_amount: 50, // 0.5€
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://example.com/cancel',
    });

    console.log('✅ Session créée avec succès:');
    console.log('ID:', session.id);
    console.log('URL:', session.url);
    
    return session;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

testStripeCheckout();