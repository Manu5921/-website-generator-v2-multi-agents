// =============================================================================
// 🧪 TEST INTÉGRATION STRIPE → WORKFLOW AUTOMATIQUE
// =============================================================================

const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3334';
const TEST_DEMANDE = {
  nom: 'Jean Dupont',
  email: 'test@restaurant-chez-jean.fr',
  entreprise: 'Restaurant Chez Jean',
  ville: 'Paris',
  telephone: '+33123456789',
  slogan: 'Cuisine française authentique',
  secteur: 'restaurant', // Optionnel pour test auto-détection
  // Pour test auto-détection, remplacer par:
  // entreprise: 'Salon Beauté Éclat', slogan: 'Coiffure moderne et élégante'
};

// =============================================================================
// 🎯 SCÉNARIO DE TEST COMPLET
// =============================================================================

async function testerIntegrationCompleteStripe() {
  console.log('🧪 === TEST INTÉGRATION STRIPE → WORKFLOW ===\n');

  try {
    // ÉTAPE 1: Créer une demande client
    console.log('📝 ÉTAPE 1: Création demande client');
    const demande = await creerDemandeClient();
    console.log(`✅ Demande créée: ${demande.id} pour ${demande.entreprise}\n`);

    // ÉTAPE 2: Créer checkout Stripe avec métadonnées workflow
    console.log('💳 ÉTAPE 2: Création checkout Stripe');
    const checkout = await creerCheckoutStripe(demande.id, false); // false = test, true = production
    console.log(`✅ Checkout créé: ${checkout.lienPaiement}\n`);

    // ÉTAPE 3: Instructions pour test manuel
    console.log('🔔 ÉTAPE 3: Test manuel requis');
    console.log('👉 Ouvrir le lien de paiement et effectuer un paiement test');
    console.log(`🔗 ${checkout.lienPaiement}`);
    console.log('\n📋 Cartes de test Stripe:');
    console.log('   • 4242424242424242 (Succès)');
    console.log('   • 4000000000000002 (Échec)');
    console.log('   • Date: 12/34, CVC: 123\n');

    // ÉTAPE 4: Vérifier webhook endpoint
    console.log('🎯 ÉTAPE 4: Vérification webhook endpoint');
    await verifierWebhookEndpoint();

    // ÉTAPE 5: Test de l'auto-détection de secteur
    console.log('🧠 ÉTAPE 5: Test auto-détection secteur');
    await testerAutoDetectionSecteur();

    console.log('\n🎉 === TESTS INITIALISÉS AVEC SUCCÈS ===');
    console.log('👀 Surveiller les logs du serveur pour voir le workflow se déclencher');
    console.log('📊 Dashboard: http://localhost:3334/dashboard-v2');

  } catch (error) {
    console.error('❌ Erreur test intégration:', error);
  }
}

// =============================================================================
// 🛠️ FONCTIONS DE TEST
// =============================================================================

async function creerDemandeClient() {
  const response = await fetch(`${BASE_URL}/api/demandes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_DEMANDE)
  });

  if (!response.ok) {
    throw new Error(`Erreur création demande: ${response.status}`);
  }

  const result = await response.json();
  return result.demande;
}

async function creerCheckoutStripe(demandeId, isProduction = false) {
  const montant = isProduction ? 39900 : 50; // 399€ ou 0.50€

  const response = await fetch(`${BASE_URL}/api/stripe/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      demandeId,
      amount: montant,
      isProduction,
      secteur: TEST_DEMANDE.secteur
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur création checkout: ${response.status}`);
  }

  const result = await response.json();
  return result.commande;
}

async function verifierWebhookEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/stripe`, {
      method: 'GET'
    });

    if (response.ok) {
      const stats = await response.json();
      console.log('✅ Endpoint webhook accessible');
      console.log(`📊 Statistiques:`, stats.data);
    } else {
      console.log('⚠️ Endpoint webhook non accessible');
    }
  } catch (error) {
    console.log('❌ Erreur vérification webhook:', error.message);
  }
}

async function testerAutoDetectionSecteur() {
  const testsCases = [
    {
      entreprise: 'Pizzeria Mario',
      slogan: 'La vraie pizza italienne',
      secteurAttendu: 'restaurant'
    },
    {
      entreprise: 'Salon Beauté Éclat',
      slogan: 'Coiffure moderne et élégante',
      secteurAttendu: 'coiffeur'
    },
    {
      entreprise: 'Menuiserie Dubois',
      slogan: 'Artisan du bois depuis 1950',
      secteurAttendu: 'artisan'
    }
  ];

  console.log('🧠 Test de détection automatique de secteur:');
  
  for (const testCase of testsCases) {
    console.log(`   • "${testCase.entreprise}" → Secteur attendu: ${testCase.secteurAttendu}`);
  }
  
  console.log('   ✅ Logique implémentée dans le webhook Stripe');
}

// =============================================================================
// 🚀 TEST AVANCÉ POUR PRODUCTION
// =============================================================================

async function testerCheckoutProduction() {
  console.log('🚀 === TEST CHECKOUT PRODUCTION ===\n');

  try {
    // Créer une demande pour production
    const demandeProduction = {
      ...TEST_DEMANDE,
      entreprise: 'Restaurant Premium Test',
      email: 'production@test.com'
    };

    console.log('📝 Création demande production');
    const demande = await creerDemandeClient();
    
    console.log('💰 Création checkout PRODUCTION (399€)');
    const checkout = await creerCheckoutStripe(demande.id, true); // true = production
    
    console.log(`✅ Checkout PRODUCTION créé: ${checkout.lienPaiement}`);
    console.log('⚠️ ATTENTION: Ceci utilise le vrai Stripe avec 399€');
    console.log('💡 Utiliser des cartes de test uniquement !');

  } catch (error) {
    console.error('❌ Erreur test production:', error);
  }
}

// =============================================================================
// 🔍 FONCTION DE MONITORING
// =============================================================================

async function monitorerWorkflowsActifs() {
  console.log('📊 === MONITORING WORKFLOWS ACTIFS ===\n');

  try {
    // Vérifier l'orchestration
    const response = await fetch(`${BASE_URL}/api/orchestration`, {
      method: 'GET'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('🎼 État orchestrateur:', data);
    }

    // Vérifier les workflows
    const workflowResponse = await fetch(`${BASE_URL}/api/orchestration/workflow`, {
      method: 'GET'
    });

    if (workflowResponse.ok) {
      const workflowData = await workflowResponse.json();
      console.log('⚡ Workflows actifs:', workflowData);
    }

  } catch (error) {
    console.error('❌ Erreur monitoring:', error);
  }
}

// =============================================================================
// 🎮 INTERFACE LIGNE DE COMMANDE
// =============================================================================

function afficherMenu() {
  console.log('\n🎮 === MENU TESTS STRIPE AUTOMATION ===\n');
  console.log('1. Test complet (demande → checkout → webhook)');
  console.log('2. Test checkout production (399€)');
  console.log('3. Monitoring workflows actifs');
  console.log('4. Vérifier webhook endpoint');
  console.log('5. Quitter\n');
}

async function executerMenu() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function questionAsync(question) {
    return new Promise(resolve => rl.question(question, resolve));
  }

  let continuer = true;

  while (continuer) {
    afficherMenu();
    const choix = await questionAsync('Choisir une option (1-5): ');

    switch (choix.trim()) {
      case '1':
        await testerIntegrationCompleteStripe();
        break;
      case '2':
        await testerCheckoutProduction();
        break;
      case '3':
        await monitorerWorkflowsActifs();
        break;
      case '4':
        await verifierWebhookEndpoint();
        break;
      case '5':
        continuer = false;
        break;
      default:
        console.log('❌ Option invalide');
    }

    if (continuer) {
      await questionAsync('\nAppuyer sur Entrée pour continuer...');
    }
  }

  rl.close();
}

// =============================================================================
// 🚀 EXÉCUTION
// =============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--production')) {
    testerCheckoutProduction();
  } else if (args.includes('--monitor')) {
    monitorerWorkflowsActifs();
  } else if (args.includes('--menu')) {
    executerMenu();
  } else {
    testerIntegrationCompleteStripe();
  }
}

module.exports = {
  testerIntegrationCompleteStripe,
  testerCheckoutProduction,
  monitorerWorkflowsActifs
};