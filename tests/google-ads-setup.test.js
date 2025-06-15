
// Test de validation de la configuration Google Ads
const { googleAdsOAuth, validateGoogleAdsSetup } = require('../src/lib/ads-management/google-ads-oauth');

async function testGoogleAdsSetup() {
  console.log('🧪 Test de la configuration Google Ads...');
  
  try {
    // Test 1: Validation de la configuration
    const validation = validateGoogleAdsSetup();
    console.log('Validation:', validation);
    
    // Test 2: Génération URL d'autorisation
    if (validation.isValid) {
      const { url, state } = googleAdsOAuth.generateAuthUrl();
      console.log('✅ URL d\'autorisation générée:', url.substring(0, 100) + '...');
    }
    
    console.log('✅ Tests de configuration réussis');
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

if (require.main === module) {
  testGoogleAdsSetup();
}

module.exports = { testGoogleAdsSetup };
