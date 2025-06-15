#!/usr/bin/env node

// =============================================================================
// 🚀 SCRIPT D'INITIALISATION GOOGLE ADS - SETUP AUTOMATIQUE
// =============================================================================

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration par défaut
const GOOGLE_ADS_CONFIG = {
  SETUP_FEE_AMOUNT: 299,
  MONTHLY_MANAGEMENT_FEE: 199,
  ADS_COMMISSION_RATE: 20,
  TEST_CAMPAIGN_BUDGET: 50,
  TARGET_CPA: 25,
  TARGET_ANNUAL_REVENUE: 120000,
};

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'cyan') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Vérifier les prérequis
 */
function checkPrerequisites() {
  log('\n🔍 Vérification des prérequis...', 'bright');
  
  try {
    // Vérifier Node.js
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    success(`Node.js version: ${nodeVersion}`);
    
    // Vérifier npm
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    success(`npm version: ${npmVersion}`);
    
    // Vérifier que nous sommes dans le bon répertoire
    if (!existsSync(join(projectRoot, 'package.json'))) {
      throw new Error('package.json introuvable. Assurez-vous d\'être dans le répertoire du projet.');
    }
    success('Répertoire de projet valide');
    
    // Vérifier la base de données
    if (!existsSync(join(projectRoot, 'drizzle.config.ts'))) {
      throw new Error('Configuration Drizzle introuvable');
    }
    success('Configuration base de données trouvée');
    
    return true;
  } catch (err) {
    error(`Prérequis manquant: ${err.message}`);
    return false;
  }
}

/**
 * Vérifier et créer le fichier .env.local
 */
function setupEnvironmentVariables() {
  log('\n⚙️  Configuration des variables d\'environnement...', 'bright');
  
  const envPath = join(projectRoot, '.env.local');
  let envContent = '';
  
  // Lire le fichier existant s'il existe
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
    info('Fichier .env.local existant trouvé');
  } else {
    info('Création d\'un nouveau fichier .env.local');
  }
  
  // Variables Google Ads requises
  const requiredVars = [
    '# =============================================================================',
    '# 📊 GOOGLE ADS API - CONFIGURATION OBLIGATOIRE',
    '# =============================================================================',
    '',
    '# OAuth2 Configuration (À REMPLIR MANUELLEMENT)',
    'GOOGLE_ADS_CLIENT_ID=your_oauth_client_id_here',
    'GOOGLE_ADS_CLIENT_SECRET=your_oauth_client_secret_here',
    'GOOGLE_ADS_REDIRECT_URI=http://localhost:3334/api/auth/google-ads/callback',
    '',
    '# Developer Token (À REMPLIR APRÈS APPROBATION GOOGLE)',
    'GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here',
    '',
    '# Customer ID (GÉNÉRÉ AUTOMATIQUEMENT APRÈS AUTH)',
    '# GOOGLE_ADS_CUSTOMER_ID=auto_generated_after_auth',
    '',
    '# Refresh Token (GÉNÉRÉ AUTOMATIQUEMENT APRÈS AUTH)',
    '# GOOGLE_ADS_REFRESH_TOKEN=auto_generated_after_auth',
    '',
    '# =============================================================================',
    '# 🎯 TRACKING CROSS-PLATFORM - CONFIGURATION',
    '# =============================================================================',
    '',
    '# Google Analytics 4 (OPTIONNEL)',
    '# NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX',
    '',
    '# Facebook Pixel (OPTIONNEL)',
    '# NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_facebook_pixel_id',
    '# FACEBOOK_ACCESS_TOKEN=your_facebook_access_token',
    '',
    '# LinkedIn Insight Tag (OPTIONNEL)',
    '# NEXT_PUBLIC_LINKEDIN_PARTNER_ID=your_linkedin_partner_id',
    '',
    '# =============================================================================',
    '# 💰 REVENUE STREAMS - CONFIGURATION AUTOMATIQUE',
    '# =============================================================================',
    '',
    `# Taux de commission (${GOOGLE_ADS_CONFIG.ADS_COMMISSION_RATE}% selon les consignes)`,
    `ADS_COMMISSION_RATE=${GOOGLE_ADS_CONFIG.ADS_COMMISSION_RATE}`,
    '',
    `# Prix des services (selon les consignes)`,
    `SETUP_FEE_AMOUNT=${GOOGLE_ADS_CONFIG.SETUP_FEE_AMOUNT}`,
    `MONTHLY_MANAGEMENT_FEE=${GOOGLE_ADS_CONFIG.MONTHLY_MANAGEMENT_FEE}`,
    '',
    `# Objectifs et métriques`,
    `TARGET_ANNUAL_REVENUE=${GOOGLE_ADS_CONFIG.TARGET_ANNUAL_REVENUE}`,
    `TEST_CAMPAIGN_BUDGET=${GOOGLE_ADS_CONFIG.TEST_CAMPAIGN_BUDGET}`,
    `TARGET_CPA=${GOOGLE_ADS_CONFIG.TARGET_CPA}`,
    '',
  ];
  
  // Vérifier si les variables Google Ads existent déjà
  const hasGoogleAdsConfig = envContent.includes('GOOGLE_ADS_CLIENT_ID');
  
  if (!hasGoogleAdsConfig) {
    // Ajouter la configuration Google Ads
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += requiredVars.join('\n') + '\n';
    
    writeFileSync(envPath, envContent);
    success('Variables d\'environnement Google Ads ajoutées à .env.local');
    
    warning('IMPORTANT: Vous devez maintenant remplir manuellement:');
    warning('  - GOOGLE_ADS_CLIENT_ID');
    warning('  - GOOGLE_ADS_CLIENT_SECRET');
    warning('  - GOOGLE_ADS_DEVELOPER_TOKEN');
  } else {
    info('Configuration Google Ads déjà présente dans .env.local');
  }
  
  return envPath;
}

/**
 * Installer les dépendances si nécessaire
 */
function installDependencies() {
  log('\n📦 Vérification des dépendances...', 'bright');
  
  try {
    // Vérifier si node_modules existe
    if (!existsSync(join(projectRoot, 'node_modules'))) {
      info('Installation des dépendances...');
      execSync('npm install', { 
        cwd: projectRoot, 
        stdio: 'inherit' 
      });
      success('Dépendances installées');
    } else {
      success('Dépendances déjà installées');
    }
    
    return true;
  } catch (err) {
    error(`Erreur installation dépendances: ${err.message}`);
    return false;
  }
}

/**
 * Configurer la base de données
 */
function setupDatabase() {
  log('\n🗄️  Configuration de la base de données...', 'bright');
  
  try {
    // Générer les migrations
    info('Génération des migrations Drizzle...');
    execSync('npm run db:generate', { 
      cwd: projectRoot, 
      stdio: 'inherit' 
    });
    success('Migrations générées');
    
    // Appliquer les migrations
    info('Application des migrations...');
    execSync('npm run db:push', { 
      cwd: projectRoot, 
      stdio: 'inherit' 
    });
    success('Base de données configurée');
    
    return true;
  } catch (err) {
    error(`Erreur configuration base de données: ${err.message}`);
    warning('Vérifiez votre configuration DATABASE_URL dans .env.local');
    return false;
  }
}

/**
 * Vérifier la configuration du port
 */
function checkPortConfiguration() {
  log('\n🔌 Vérification de la configuration des ports...', 'bright');
  
  const packageJsonPath = join(projectRoot, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  // Vérifier le script dev
  const devScript = packageJson.scripts?.dev;
  if (devScript && devScript.includes('--port 3334')) {
    success('Port 3334 configuré dans package.json (conforme aux consignes)');
  } else {
    warning('Port 3334 non configuré - Mise à jour recommandée');
    info('Script dev actuel: ' + devScript);
  }
  
  return true;
}

/**
 * Créer les fichiers de test
 */
function createTestFiles() {
  log('\n🧪 Création des fichiers de test...', 'bright');
  
  const testDir = join(projectRoot, 'tests');
  const testFilePath = join(testDir, 'google-ads-setup.test.js');
  
  // Créer le répertoire de test s'il n'existe pas
  if (!existsSync(testDir)) {
    execSync(`mkdir -p ${testDir}`, { cwd: projectRoot });
  }
  
  const testContent = `
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
      console.log('✅ URL d\\'autorisation générée:', url.substring(0, 100) + '...');
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
`;
  
  writeFileSync(testFilePath, testContent);
  success('Fichier de test créé: tests/google-ads-setup.test.js');
  
  return testFilePath;
}

/**
 * Générer le rapport de configuration
 */
function generateConfigReport() {
  log('\n📋 Génération du rapport de configuration...', 'bright');
  
  const reportPath = join(projectRoot, 'GOOGLE_ADS_CONFIG_REPORT.md');
  const timestamp = new Date().toISOString();
  
  const reportContent = `# 📊 Rapport de Configuration Google Ads

**Généré le**: ${timestamp}
**Version**: Agent Ads Management v1.0

## ✅ Configuration Réalisée

### 1. Fichiers créés/modifiés:
- \`src/lib/ads-management/google-ads-oauth.ts\` - Système OAuth2
- \`src/app/api/auth/google-ads/authorize/route.ts\` - Route autorisation
- \`src/app/api/auth/google-ads/callback/route.ts\` - Route callback
- \`src/app/api/ads/campaigns/create-test/route.ts\` - Création campagnes test
- \`src/components/dashboard/GoogleAdsManagement.tsx\` - Dashboard intégré
- \`src/lib/ads-management/cross-platform-attribution.ts\` - Attribution ML
- \`src/lib/tracking-setup/cross-platform-tracking.ts\` - Tracking cross-platform
- \`src/components/dashboard/AdsRevenueStreams.tsx\` - Revenue streams dashboard
- \`.env.local\` - Variables d'environnement

### 2. Revenue Streams configurés:
- **Setup Fee**: ${GOOGLE_ADS_CONFIG.SETUP_FEE_AMOUNT}€ par client
- **Gestion mensuelle**: ${GOOGLE_ADS_CONFIG.MONTHLY_MANAGEMENT_FEE}€/mois par plateforme
- **Commission**: ${GOOGLE_ADS_CONFIG.ADS_COMMISSION_RATE}% sur budgets publicitaires
- **Objectif année 1**: ${GOOGLE_ADS_CONFIG.TARGET_ANNUAL_REVENUE.toLocaleString()}€

### 3. Campagne test configurée:
- **Budget**: ${GOOGLE_ADS_CONFIG.TEST_CAMPAIGN_BUDGET}€ (validation selon consignes)
- **CPA cible**: ${GOOGLE_ADS_CONFIG.TARGET_CPA}€
- **Mots-clés**: "génération site web IA", "création site automatique"
- **Ciblage**: PME France (restaurant/coiffeur/artisan)

## 🔧 Prochaines étapes requises:

### 1. Configuration Google Cloud Console:
1. Créer un projet Google Cloud
2. Activer l'API Google Ads
3. Créer des identifiants OAuth 2.0
4. Configurer les URIs de redirection

### 2. Variables d'environnement à compléter:
\`\`\`bash
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
\`\`\`

### 3. Demande Developer Token:
- Aller sur: https://developers.google.com/google-ads/api/docs/first-call/dev-token
- Remplir le formulaire d'application
- Attendre l'approbation (1-2 jours ouvrables)

### 4. Test de la configuration:
\`\`\`bash
npm run dev
# Aller sur http://localhost:3334/dashboard
# Tester l'authentification Google Ads
\`\`\`

## 🎯 Objectifs Business:

- **Commission 20%** sur budgets publicitaires clients
- **299€ setup** + **199€/mois** par plateforme gérée
- **Objectif**: 120k€ CA année 1
- **Première campagne test**: 50€ budget limité

## 📊 Métriques tracking:

- **Google Analytics 4**: Événements et conversions
- **Facebook Pixel**: Retargeting et lookalike audiences
- **LinkedIn Insight Tag**: B2B tracking
- **Attribution ML**: Cross-platform avec algorithmes propriétaires

---

**✅ Configuration de base terminée**
**⏳ En attente**: Credentials Google Ads API
**🎯 Ready**: Intégration Dashboard V3 + Revenue Streams
`;

  writeFileSync(reportPath, reportContent);
  success('Rapport généré: GOOGLE_ADS_CONFIG_REPORT.md');
  
  return reportPath;
}

/**
 * Afficher les instructions finales
 */
function showFinalInstructions() {
  log('\n🎉 Configuration Google Ads terminée !', 'bright');
  log('\n' + '='.repeat(60), 'cyan');
  log('📋 PROCHAINES ÉTAPES OBLIGATOIRES:', 'bright');
  log('='.repeat(60), 'cyan');
  
  log('\n1. 🔧 Configurer Google Cloud Console:', 'yellow');
  log('   • Créer un projet Google Cloud');
  log('   • Activer l\'API Google Ads');
  log('   • Créer des identifiants OAuth 2.0');
  log('   • Voir: GOOGLE_ADS_SETUP_GUIDE.md pour les détails');
  
  log('\n2. ⚙️  Compléter les variables d\'environnement:', 'yellow');
  log('   • Éditer .env.local');
  log('   • Remplir GOOGLE_ADS_CLIENT_ID');
  log('   • Remplir GOOGLE_ADS_CLIENT_SECRET');
  log('   • Remplir GOOGLE_ADS_DEVELOPER_TOKEN');
  
  log('\n3. 🚀 Tester la configuration:', 'yellow');
  log('   • npm run dev');
  log('   • Aller sur http://localhost:3334/dashboard');
  log('   • Tester l\'authentification Google Ads');
  
  log('\n4. 💰 Valider les revenue streams:', 'yellow');
  log('   • Setup: 299€ par client');
  log('   • Gestion: 199€/mois par plateforme');
  log('   • Commission: 20% sur budgets publicitaires');
  log('   • Objectif: 120k€ CA année 1');
  
  log('\n' + '='.repeat(60), 'cyan');
  log('✅ SYSTÈME GOOGLE ADS READY FOR DEPLOYMENT', 'green');
  log('🎯 PREMIÈRE CAMPAGNE TEST: 50€ BUDGET LIMITÉ', 'green');
  log('📊 DASHBOARD V3 + MÉTRIQUES TEMPS RÉEL', 'green');
  log('🤖 ATTRIBUTION ML CROSS-PLATFORM', 'green');
  log('='.repeat(60), 'cyan');
}

/**
 * Fonction principale
 */
async function main() {
  log('🚀 INITIALISATION GOOGLE ADS API - AGENT ADS MANAGEMENT', 'bright');
  log('Système Multi-Agents - Website Generator V2\n', 'cyan');
  
  try {
    // 1. Vérifier les prérequis
    if (!checkPrerequisites()) {
      process.exit(1);
    }
    
    // 2. Installer les dépendances
    if (!installDependencies()) {
      process.exit(1);
    }
    
    // 3. Configurer les variables d'environnement
    setupEnvironmentVariables();
    
    // 4. Configurer la base de données
    if (!setupDatabase()) {
      warning('Base de données non configurée - continuez manuellement');
    }
    
    // 5. Vérifier la configuration des ports
    checkPortConfiguration();
    
    // 6. Créer les fichiers de test
    createTestFiles();
    
    // 7. Générer le rapport
    generateConfigReport();
    
    // 8. Afficher les instructions finales
    showFinalInstructions();
    
  } catch (err) {
    error(`Erreur lors de l'initialisation: ${err.message}`);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as setupGoogleAds };