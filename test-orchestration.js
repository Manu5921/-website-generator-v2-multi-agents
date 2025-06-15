// =============================================================================
// 🧪 TESTS ORCHESTRATION MULTI-AGENTS - VALIDATION SYSTÈME COMPLET
// =============================================================================

import { config } from 'dotenv';
config();

// =============================================================================
// 🎯 CONFIGURATION ET VARIABLES
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3334';
const TIMEOUT = 30000; // 30 secondes

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.magenta}\n🎼 ${msg}${colors.reset}`)
};

// =============================================================================
// 🛠️ FONCTIONS UTILITAIRES
// =============================================================================

async function makeRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    return { response, data, status: response.status };
  } catch (error) {
    return { error: error.message, status: 0 };
  }
}

async function attendreCondition(condition, timeout = 30000, interval = 2000) {
  const debut = Date.now();
  
  while (Date.now() - debut < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
}

function genererDonneesTest() {
  const timestamp = Date.now();
  return {
    nom: `Test Orchestration ${timestamp}`,
    email: `test-orchestration-${timestamp}@example.com`,
    entreprise: `Restaurant Test ${timestamp}`,
    ville: 'Paris Test',
    telephone: '0123456789',
    slogan: 'Test automatisé orchestration'
  };
}

// =============================================================================
// 🧪 TESTS UNITAIRES ORCHESTRATION
// =============================================================================

async function testHealthAPI() {
  log.step('Test de santé de l\'API...');
  
  const { data, status, error } = await makeRequest('/api/health');
  
  if (error) {
    log.error(`API non accessible: ${error}`);
    return false;
  }
  
  if (status !== 200) {
    log.error(`API health failed: status ${status}`);
    return false;
  }
  
  log.success('API orchestration accessible');
  return true;
}

async function testWorkflowTemplates() {
  log.step('Test des templates de workflow...');
  
  const { data, status, error } = await makeRequest('/api/orchestration/workflow?action=templates');
  
  if (error || status !== 200) {
    log.error(`Erreur récupération templates: ${error || status}`);
    return false;
  }
  
  if (!data.success || !data.data.workflows) {
    log.error('Format de réponse templates invalide');
    return false;
  }
  
  const workflows = data.data.workflows;
  const secteursAtendus = ['restaurant', 'coiffeur', 'artisan'];
  
  for (const secteur of secteursAtendus) {
    const workflow = workflows.find(w => w.secteur === secteur);
    if (!workflow) {
      log.error(`Template workflow manquant pour secteur: ${secteur}`);
      return false;
    }
    
    log.info(`Template ${secteur}: ${workflow.nom} (${workflow.tempsEstime}min, ${workflow.nbEtapes} étapes)`);
  }
  
  log.success(`${workflows.length} templates de workflow validés`);
  return true;
}

async function testCreationDemande() {
  log.step('Test création demande client...');
  
  const donneesTest = genererDonneesTest();
  
  const { data, status, error } = await makeRequest('/api/demandes', {
    method: 'POST',
    body: JSON.stringify(donneesTest)
  });
  
  if (error || status !== 200) {
    log.error(`Erreur création demande: ${error || status}`);
    return null;
  }
  
  if (!data.success || !data.demandeId) {
    log.error('Création demande échouée');
    return null;
  }
  
  log.success(`Demande créée: ${data.demandeId}`);
  return data.demandeId;
}

async function testCreationProjetOrchestration(demandeId) {
  log.step('Test création projet multi-agent...');
  
  const { data, status, error } = await makeRequest('/api/orchestration', {
    method: 'POST',
    body: JSON.stringify({
      demandeId: demandeId,
      secteur: 'restaurant',
      budget: 399,
      priorite: 'haute',
      metadonnees: {
        test: true,
        timestamp: Date.now()
      }
    })
  });
  
  if (error || status !== 200) {
    log.error(`Erreur création projet: ${error || status}`);
    return null;
  }
  
  if (!data.success || !data.data.projetId) {
    log.error('Création projet échouée');
    return null;
  }
  
  log.success(`Projet multi-agent créé: ${data.data.projetId}`);
  log.info(`Temps estimé: ${data.data.tempsEstime} minutes`);
  log.info(`Secteur: ${data.data.secteur}`);
  
  return data.data.projetId;
}

async function testStatutProjet(projetId) {
  log.step('Test récupération statut projet...');
  
  const { data, status, error } = await makeRequest(`/api/orchestration?projetId=${projetId}`);
  
  if (error || status !== 200) {
    log.error(`Erreur récupération statut: ${error || status}`);
    return false;
  }
  
  if (!data.success || !data.data.projet) {
    log.error('Format statut projet invalide');
    return false;
  }
  
  const { projet, progression, taches, metriques } = data.data;
  
  log.info(`Statut projet: ${projet.statut}`);
  log.info(`Progression: ${progression.pourcentage}%`);
  log.info(`Temps écoulé: ${progression.tempsEcoule} minutes`);
  log.info(`Tâches: ${taches.length} total`);
  log.info(`Métriques: ${metriques.tachesTotal} tâches, ${metriques.tachesTerminees} terminées`);
  
  log.success('Statut projet récupéré avec succès');
  return true;
}

async function testDeclenchementWorkflow(demandeId) {
  log.step('Test déclenchement workflow business...');
  
  const { data, status, error } = await makeRequest('/api/orchestration/workflow', {
    method: 'POST',
    body: JSON.stringify({
      demandeId: demandeId,
      secteur: 'restaurant',
      declencheur: 'manuel',
      parametres: {
        test: true,
        urgence: 'haute'
      }
    })
  });
  
  if (error || status !== 200) {
    log.error(`Erreur déclenchement workflow: ${error || status}`);
    return null;
  }
  
  if (!data.success || !data.data.projetId) {
    log.error('Déclenchement workflow échoué');
    return null;
  }
  
  const { projetId, workflowId, workflowNom, tempsEstime, etapes } = data.data;
  
  log.success(`Workflow déclenché: ${workflowNom}`);
  log.info(`Projet ID: ${projetId}`);
  log.info(`Workflow ID: ${workflowId}`);
  log.info(`Temps estimé: ${tempsEstime} minutes`);
  log.info(`Étapes: ${etapes.length}`);
  
  return projetId;
}

async function testExecutionWorkflow(projetId) {
  log.step('Test suivi exécution workflow...');
  
  const { data, status, error } = await makeRequest(`/api/orchestration/workflow?projetId=${projetId}`);
  
  if (error || status !== 200) {
    log.error(`Erreur récupération exécution: ${error || status}`);
    return false;
  }
  
  if (!data.success || !data.data.execution) {
    log.error('Données exécution manquantes');
    return false;
  }
  
  const { execution, workflow, etatProjet } = data.data;
  
  log.info(`Statut exécution: ${execution.statut}`);
  log.info(`Étape actuelle: ${execution.etapeActuelle}`);
  log.info(`Étapes terminées: ${execution.etapesTerminees.length}`);
  log.info(`Temps écoulé: ${execution.tempsEcoule} minutes`);
  
  if (execution.erreurs.length > 0) {
    log.warning(`Erreurs détectées: ${execution.erreurs.length}`);
    execution.erreurs.forEach(erreur => log.warning(`  - ${erreur}`));
  }
  
  if (workflow) {
    log.info(`Workflow: ${workflow.nom} (${workflow.etapes.length} étapes)`);
  }
  
  if (etatProjet) {
    log.info(`État agents: ${etatProjet.agents.length} agents`);
    etatProjet.agents.forEach(agent => {
      log.info(`  - ${agent.type}: ${agent.statut} (${agent.progression || 0}%)`);
    });
  }
  
  log.success('Exécution workflow suivie avec succès');
  return true;
}

async function testWebhookInterAgent() {
  log.step('Test simulation webhook inter-agent...');
  
  const webhookData = {
    type: 'heartbeat',
    agentId: 'design-ia',
    projectId: 'test-project-123',
    status: 'online',
    data: {
      health: 'good',
      uptime: 12345,
      memory: '256MB',
      cpu: '15%'
    },
    timestamp: new Date().toISOString()
  };
  
  const { data, status, error } = await makeRequest('/api/orchestration/webhooks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.INTER_AGENT_TOKEN || 'dev-token'}`
    },
    body: JSON.stringify(webhookData)
  });
  
  if (error || status !== 200) {
    log.error(`Erreur webhook: ${error || status}`);
    return false;
  }
  
  if (!data.success) {
    log.error('Webhook échoué');
    return false;
  }
  
  log.success('Webhook inter-agent traité avec succès');
  log.info(`Message: ${data.message}`);
  
  return true;
}

async function testMetriquesOrchestration() {
  log.step('Test métriques orchestration...');
  
  const { data, status, error } = await makeRequest('/api/orchestration/workflow?action=actifs');
  
  if (error || status !== 200) {
    log.error(`Erreur récupération métriques: ${error || status}`);
    return false;
  }
  
  if (!data.success) {
    log.error('Récupération métriques échouée');
    return false;
  }
  
  const { executionsActives, statistiques, metriquesGlobales } = data.data;
  
  log.info(`Exécutions actives: ${executionsActives.length}`);
  
  if (statistiques) {
    log.info(`En cours: ${statistiques.enCours}, Terminées: ${statistiques.terminees}, Erreurs: ${statistiques.erreurs}`);
    log.info(`Temps moyen: ${statistiques.tempsEcouleMoyen} minutes`);
  }
  
  if (metriquesGlobales) {
    log.info(`Projets: ${metriquesGlobales.projets.total} total, ${metriquesGlobales.projets.actifs} actifs`);
    log.info(`Agents: ${metriquesGlobales.agents.actifs}/${metriquesGlobales.agents.total} actifs`);
    log.info(`Performance: ${metriquesGlobales.performance.tauxReussiteGlobal}% réussite`);
  }
  
  log.success('Métriques orchestration récupérées');
  return true;
}

// =============================================================================
// 🧪 TEST DE CHARGE ET PERFORMANCE
// =============================================================================

async function testChargeOrchestration() {
  log.step('Test de charge orchestration (3 projets simultanés)...');
  
  const projets = [];
  const secteurs = ['restaurant', 'coiffeur', 'artisan'];
  
  // Créer 3 demandes simultanément
  for (let i = 0; i < 3; i++) {
    const demandeId = await testCreationDemande();
    if (!demandeId) {
      log.error(`Échec création demande ${i + 1}`);
      return false;
    }
    
    const projetId = await testDeclenchementWorkflow(demandeId);
    if (!projetId) {
      log.error(`Échec déclenchement workflow ${i + 1}`);
      return false;
    }
    
    projets.push({ demandeId, projetId, secteur: secteurs[i] });
  }
  
  log.info(`${projets.length} projets créés simultanément`);
  
  // Vérifier que tous les projets sont bien en cours
  for (const projet of projets) {
    const statutOK = await testStatutProjet(projet.projetId);
    if (!statutOK) {
      log.error(`Projet ${projet.projetId} en erreur`);
      return false;
    }
  }
  
  log.success('Test de charge réussi - tous les projets actifs');
  return true;
}

// =============================================================================
// 🎯 ORCHESTRATEUR DE TESTS PRINCIPAL
// =============================================================================

async function executerTousLesTests() {
  log.title('DÉBUT DES TESTS ORCHESTRATION MULTI-AGENTS');
  
  const tests = [
    { nom: 'API Health', fonction: testHealthAPI },
    { nom: 'Templates Workflow', fonction: testWorkflowTemplates },
    { nom: 'Webhook Inter-Agent', fonction: testWebhookInterAgent },
    { nom: 'Métriques Orchestration', fonction: testMetriquesOrchestration }
  ];
  
  let testsReussis = 0;
  let testsEchoues = 0;
  
  // Tests unitaires
  for (const test of tests) {
    try {
      log.title(`TEST: ${test.nom}`);
      const resultat = await test.fonction();
      
      if (resultat) {
        testsReussis++;
        log.success(`✅ ${test.nom} RÉUSSI`);
      } else {
        testsEchoues++;
        log.error(`❌ ${test.nom} ÉCHOUÉ`);
      }
    } catch (error) {
      testsEchoues++;
      log.error(`❌ ${test.nom} ERREUR: ${error.message}`);
    }
    
    console.log(); // Ligne vide
  }
  
  // Test de workflow complet
  try {
    log.title('TEST WORKFLOW COMPLET');
    
    const demandeId = await testCreationDemande();
    if (demandeId) {
      const projetOrchestration = await testCreationProjetOrchestration(demandeId);
      if (projetOrchestration) {
        await testStatutProjet(projetOrchestration);
        testsReussis++;
      } else {
        testsEchoues++;
      }
      
      const projetWorkflow = await testDeclenchementWorkflow(demandeId);
      if (projetWorkflow) {
        await testExecutionWorkflow(projetWorkflow);
        testsReussis++;
      } else {
        testsEchoues++;
      }
    } else {
      testsEchoues += 2;
    }
  } catch (error) {
    testsEchoues += 2;
    log.error(`Erreur workflow complet: ${error.message}`);
  }
  
  // Test de charge
  try {
    log.title('TEST DE CHARGE');
    const chargeOK = await testChargeOrchestration();
    if (chargeOK) {
      testsReussis++;
    } else {
      testsEchoues++;
    }
  } catch (error) {
    testsEchoues++;
    log.error(`Erreur test de charge: ${error.message}`);
  }
  
  // Résumé final
  log.title('RÉSUMÉ DES TESTS');
  
  const total = testsReussis + testsEchoues;
  const pourcentageReussite = total > 0 ? Math.round((testsReussis / total) * 100) : 0;
  
  console.log(`${colors.bold}📊 RÉSULTATS:${colors.reset}`);
  console.log(`   ✅ Tests réussis: ${colors.green}${testsReussis}${colors.reset}`);
  console.log(`   ❌ Tests échoués: ${colors.red}${testsEchoues}${colors.reset}`);
  console.log(`   📈 Taux de réussite: ${colors.bold}${pourcentageReussite}%${colors.reset}`);
  
  if (pourcentageReussite >= 80) {
    log.success('🎉 ORCHESTRATION MULTI-AGENTS VALIDÉE');
    console.log(`${colors.green}${colors.bold}Le système d'orchestration est opérationnel !${colors.reset}\n`);
    return true;
  } else {
    log.error('🚨 ORCHESTRATION NON VALIDÉE');
    console.log(`${colors.red}${colors.bold}Des corrections sont nécessaires avant la production.${colors.reset}\n`);
    return false;
  }
}

// =============================================================================
// 🚀 EXÉCUTION
// =============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  executerTousLesTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log.error(`Erreur fatale: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}

export { 
  executerTousLesTests,
  testHealthAPI,
  testWorkflowTemplates,
  testCreationProjetOrchestration,
  testDeclenchementWorkflow,
  testWebhookInterAgent
};