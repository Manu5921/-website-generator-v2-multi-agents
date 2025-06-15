/**
 * Test création directe d'un checkout
 */
import { Polar } from "@polar-sh/sdk";

async function testDirectCheckout() {
  try {
    console.log('🛒 Test création checkout direct...\n');
    
    const polar = new Polar({
      accessToken: "polar_oat_8W2MdX23gFcZDDjNdfYT0QRwh4MVcyMUbF6n03yJCVJ",
      server: "production"
    });

    const orgId = "8eaa364c-9b45-4b44-a3c9-eb0412b55820";

    // Au lieu d'utiliser productPriceId, testons avec des price IDs génériques
    // ou essayons de créer un checkout simple

    console.log('🔍 Méthode alternative: Tester la création d\'un checkout...');
    
    try {
      // Essayons avec un checkout minimal pour voir l'erreur
      const checkout = await polar.checkouts.create({
        productPriceId: "price_test", // ID test pour voir l'erreur
        customerEmail: "test@example.com",
        successUrl: "https://example.com/success"
      });
      
      console.log('✅ Checkout créé (surprise!):', checkout.id);
      
    } catch (error) {
      console.log('❌ Erreur checkout (attendue):', error.message);
      
      // L'erreur peut nous donner des indices sur les price IDs valides
      if (error.message.includes('product') || error.message.includes('price')) {
        console.log('💡 Cette erreur peut contenir des infos utiles sur les produits');
      }
    }

    // Test d'une autre approche: voir tous les webhooks/events
    console.log('\n📡 Test des événements/webhooks...');
    try {
      // Certaines APIs donnent des infos sur les produits indirectement
      const orders = await polar.orders.list({ 
        organizationId: orgId,
        limit: 5 
      });
      console.log('✅ Commandes trouvées:', orders.items?.length || 0);
      
      if (orders.items?.length > 0) {
        orders.items.forEach(order => {
          console.log('💰 Commande:', {
            id: order.id,
            amount: order.amount,
            productId: order.productId,
            productPriceId: order.productPriceId
          });
        });
      }
    } catch (error) {
      console.log('❌ Erreur commandes:', error.message);
    }

  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

testDirectCheckout();