/**
 * Récupérer les Price IDs des produits
 */
import { Polar } from "@polar-sh/sdk";

async function getPriceIds() {
  try {
    console.log('🔍 Récupération des Price IDs...\n');
    
    const polar = new Polar({
      accessToken: "polar_oat_8W2MdX23gFcZDDjNdfYT0QRwh4MVcyMUbF6n03yJCVJ",
      server: "production"
    });

    const productIds = [
      "cb38ebe0-c9a2-4db8-936e-be7285461670", // Création site 399€
      "3ddebe61-5143-4dc8-887d-33189c5842ca"  // Maintenance 29€/mois
    ];

    console.log('📦 Analyse des produits...\n');

    for (const [index, productId] of productIds.entries()) {
      console.log(`🔍 Produit ${index + 1} (ID: ${productId}):`);
      
      try {
        const product = await polar.products.get({ id: productId });
        
        console.log(`✅ Produit trouvé: "${product.name}"`);
        console.log(`   → Type: ${product.type}`);
        console.log(`   → Description: ${product.description || 'Non définie'}`);
        
        if (product.prices && product.prices.length > 0) {
          console.log(`   → Prix disponibles (${product.prices.length}):`);
          
          product.prices.forEach((price, priceIndex) => {
            const amount = price.priceAmount / 100;
            const currency = price.priceCurrency;
            const interval = price.recurringInterval || 'one-time';
            
            console.log(`     • Prix ${priceIndex + 1}: ${amount}${currency} (${interval})`);
            console.log(`       🔑 Price ID: ${price.id}`);
            
            // Identifier quel produit c'est
            if (amount === 399 && interval === 'one-time') {
              console.log(`       ✅ → CRÉATION SITE (399€)`);
            } else if (amount === 29 && interval === 'month') {
              console.log(`       ✅ → MAINTENANCE (29€/mois)`);
            }
          });
        } else {
          console.log(`   ❌ Aucun prix configuré pour ce produit`);
        }
        
        console.log(''); // Ligne vide
        
      } catch (error) {
        console.log(`❌ Erreur produit ${productId}:`, error.message);
        console.log('');
      }
    }

    console.log('🎯 RÉSUMÉ POUR .env.local:');
    console.log('=====================================\n');

  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

getPriceIds();