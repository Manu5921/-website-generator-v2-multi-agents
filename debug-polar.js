/**
 * Debug Polar API - Test plus approfondi
 */
import { Polar } from "@polar-sh/sdk";

async function debugPolar() {
  try {
    console.log('🔍 Debug Polar API...\n');
    
    const polar = new Polar({
      accessToken: "polar_oat_8W2MdX23gFcZDDjNdfYT0QRwh4MVcyMUbF6n03yJCVJ",
      server: "production"
    });

    const orgId = "8eaa364c-9b45-4b44-a3c9-eb0412b55820";

    // Test 1: Organisation avec plus de détails
    console.log('📋 1. Organisation complète...');
    try {
      const org = await polar.organizations.get({ id: orgId });
      console.log('✅ Organisation:', {
        name: org.name,
        id: org.id,
        slug: org.slug,
        avatarUrl: org.avatarUrl,
        bio: org.bio
      });
    } catch (error) {
      console.log('❌ Erreur organisation:', error.message);
    }

    // Test 2: Produits avec différents paramètres
    console.log('\n📦 2. Produits - Test avec paramètres...');
    try {
      // Sans filtre
      console.log('   → Test sans filtre...');
      const products1 = await polar.products.list({});
      console.log('     Produits (sans filtre):', products1.items?.length || 0);

      // Avec organizationId
      console.log('   → Test avec organizationId...');
      const products2 = await polar.products.list({ 
        organizationId: orgId,
        limit: 10
      });
      console.log('     Produits (avec orgId):', products2.items?.length || 0);

      // Avec organizationId seulement (format différent)
      console.log('   → Test format différent...');
      const products3 = await polar.products.list({ 
        organizationId: [orgId]
      });
      console.log('     Produits (format array):', products3.items?.length || 0);

      // Afficher les détails si trouvés
      const allProducts = products1.items || products2.items || products3.items || [];
      if (allProducts.length > 0) {
        console.log('\n   🎯 PRODUITS TROUVÉS:');
        allProducts.forEach((product, index) => {
          console.log(`\n   📦 Produit ${index + 1}:`);
          console.log('     → Nom:', product.name);
          console.log('     → ID:', product.id);
          console.log('     → Type:', product.type);
          console.log('     → Organisation:', product.organizationId);
          
          if (product.prices?.length > 0) {
            console.log('     → Prix disponibles:');
            product.prices.forEach(price => {
              const amount = price.priceAmount / 100;
              const interval = price.recurringInterval || 'one-time';
              console.log(`       • ${amount}${price.priceCurrency} (${interval})`);
              console.log(`       🔑 Price ID: ${price.id}`);
            });
          } else {
            console.log('     → ⚠️ Aucun prix configuré');
          }
        });
      }

    } catch (error) {
      console.log('❌ Erreur produits:', error.message);
      console.log('   Details:', error);
    }

    // Test 3: Vérifier les permissions spécifiques
    console.log('\n🔑 3. Test permissions détaillées...');
    
    try {
      console.log('   → Test products:read...');
      const testProducts = await polar.products.list({ limit: 1 });
      console.log('   ✅ products:read OK');
    } catch (error) {
      console.log('   ❌ products:read:', error.message);
    }

    try {
      console.log('   → Test checkouts:write...');
      // Test si on peut lister (pas créer pour éviter erreurs)
      const testCheckouts = await polar.checkouts.list({ limit: 1 });
      console.log('   ✅ checkouts access OK');
    } catch (error) {
      console.log('   ❌ checkouts access:', error.message);
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

debugPolar();