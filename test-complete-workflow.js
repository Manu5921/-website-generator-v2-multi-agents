/**
 * Test du workflow complet
 */
import { Polar } from "@polar-sh/sdk";

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Test du workflow complet...\n');
    
    const polar = new Polar({
      accessToken: "polar_oat_8W2MdX23gFcZDDjNdfYT0QRwh4MVcyMUbF6n03yJCVJ",
      server: "production"
    });

    // Test de création d'un checkout avec vos vrais Price IDs
    console.log('💳 Test création checkout...');
    
    const priceIds = [
      "d58281e1-a05a-4fcd-ba57-14dbacab15e1", // 399€ création
      "1728da58-9758-44f1-882d-f929490e907b"  // 29€/mois maintenance
    ];

    try {
      const checkout = await polar.checkouts.create({
        productPriceId: priceIds[0], // 399€ création
        customerEmail: "test@gmail.com",
        metadata: {
          demandeId: "test-123",
          type: 'site_creation',
          entreprise: "Test Restaurant",
          clientNom: "John Doe"
        },
        successUrl: "http://localhost:3334/paiement/success?session_id={CHECKOUT_SESSION_ID}"
      });

      console.log('✅ Checkout créé avec succès !');
      console.log('🔗 URL de paiement:', checkout.url);
      console.log('🆔 Session ID:', checkout.id);
      
      console.log('\n🎯 ÉTAPES SUIVANTES:');
      console.log('1. ✅ API Polar configurée et fonctionnelle');
      console.log('2. ✅ Produits créés avec bons Price IDs');
      console.log('3. ✅ Checkout peut être généré');
      console.log('4. 🔄 Testez depuis le dashboard admin');
      console.log('5. 🔄 Configurez le webhook pour la production');
      
    } catch (error) {
      console.log('❌ Erreur création checkout:', error.message);
      
      if (error.message.includes('price')) {
        console.log('💡 Problème avec les Price IDs - vérifiez qu\'ils sont corrects');
      }
      if (error.message.includes('organization')) {
        console.log('💡 Problème d\'organisation - vérifiez les permissions');
      }
    }

  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

testCompleteWorkflow();