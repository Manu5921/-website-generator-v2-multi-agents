/**
 * Test de connexion API Polar
 */
import { Polar } from "@polar-sh/sdk";

async function testPolar() {
  try {
    console.log('🔌 Test connexion Polar API...\n');
    
    const polar = new Polar({
      accessToken: "polar_oat_8W2MdX23gFcZDDjNdfYT0QRwh4MVcyMUbF6n03yJCVJ",
      server: "production"
    });

    const orgId = "8eaa364c-9b45-4b44-a3c9-eb0412b55820";

    // Test 1: Récupérer l'organisation spécifique
    console.log('📋 1. Récupération de votre organisation...');
    try {
      const org = await polar.organizations.get({ id: orgId });
      console.log('✅ Organisation trouvée:', org.name);
      console.log('   → ID:', org.id);
      console.log('   → Slug:', org.slug);
    } catch (error) {
      console.log('❌ Erreur organisation:', error.message);
    }

    // Test 2: Lister les produits de votre organisation
    console.log('\n📦 2. Récupération des produits...');
    try {
      const products = await polar.products.list({ 
        organizationId: orgId 
      });
      console.log('✅ Produits trouvés:', products.items?.length || 0);
      
      if (products.items?.length > 0) {
        products.items.forEach((product, index) => {
          console.log(`\n   📦 Produit ${index + 1}:`);
          console.log('   → Nom:', product.name);
          console.log('   → ID:', product.id);
          console.log('   → Type:', product.type);
          
          if (product.prices?.length > 0) {
            console.log('   → Prix disponibles:');
            product.prices.forEach(price => {
              console.log(`     • ${price.priceAmount / 100}${price.priceCurrency} (${price.recurringInterval || 'one-time'})`);
              console.log(`       🔑 Price ID: ${price.id}`);
            });
          }
        });
      } else {
        console.log('   → Aucun produit trouvé. Vous devez créer les produits sur polar.sh');
        console.log('   → Allez sur polar.sh → Products → Create Product');
      }
    } catch (error) {
      console.log('❌ Erreur produits:', error.message);
    }

    // Test 3: Vérifier les permissions checkouts
    console.log('\n🔑 3. Test des permissions checkouts...');
    try {
      const checkouts = await polar.checkouts.list({ 
        organizationId: orgId,
        limit: 1 
      });
      console.log('✅ Permission checkouts: OK');
      console.log('   → Checkouts trouvés:', checkouts.items?.length || 0);
    } catch (error) {
      console.log('❌ Permission checkouts:', error.message);
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

testPolar();