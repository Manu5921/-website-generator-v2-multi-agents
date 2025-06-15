#!/bin/bash

# ==========================================
# 🇫🇷 Script de Déploiement BigSpring France
# ==========================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage du déploiement BigSpring France..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function pour logger
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ==========================================
# 1. VÉRIFICATIONS PRÉALABLES
# ==========================================

log_info "Vérification de l'environnement..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

# Vérifier Next.js
if [ ! -f "package.json" ]; then
    log_error "package.json introuvable. Êtes-vous dans le bon répertoire ?"
    exit 1
fi

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    log_warning "node_modules manquant. Installation des dépendances..."
    npm install
fi

log_success "Environnement vérifié ✓"

# ==========================================
# 2. BACKUP CONFIGURATION ACTUELLE
# ==========================================

log_info "Sauvegarde de la configuration actuelle..."

# Backup next.config.js
if [ -f "next.config.js" ]; then
    cp next.config.js next.config.backup.$(date +%Y%m%d_%H%M%S).js
    log_success "Configuration sauvegardée ✓"
fi

# ==========================================
# 3. ACTIVATION CONFIGURATION I18N
# ==========================================

log_info "Activation de la configuration i18n française..."

# Activer la config i18n
if [ -f "next.config.i18n.js" ]; then
    cp next.config.i18n.js next.config.js
    log_success "Configuration i18n activée ✓"
else
    log_error "Fichier next.config.i18n.js introuvable"
    exit 1
fi

# ==========================================
# 4. VÉRIFICATION FICHIERS TRADUCTION
# ==========================================

log_info "Vérification des fichiers de traduction..."

# Vérifier structure locales
required_files=(
    "src/locales/fr/common.json"
    "src/locales/fr/homepage.json"
    "src/locales/fr/about.json"
    "src/locales/fr/pricing.json"
    "src/locales/fr/seo.json"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "Fichier manquant: $file"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -gt 0 ]; then
    log_error "$missing_files fichier(s) de traduction manquant(s)"
    exit 1
fi

log_success "Fichiers de traduction vérifiés ✓"

# ==========================================
# 5. VÉRIFICATION COMPOSANTS I18N
# ==========================================

log_info "Vérification des composants i18n..."

# Vérifier composants essentiels
if [ ! -f "src/lib/i18n.ts" ]; then
    log_error "Fichier src/lib/i18n.ts manquant"
    exit 1
fi

if [ ! -f "src/components/LanguageSwitcher.tsx" ]; then
    log_error "Fichier src/components/LanguageSwitcher.tsx manquant"
    exit 1
fi

log_success "Composants i18n vérifiés ✓"

# ==========================================
# 6. INSTALLATION DÉPENDANCES I18N
# ==========================================

log_info "Installation des dépendances i18n (si nécessaire)..."

# Installer react-intl si pas présent
if ! npm list react-intl &> /dev/null; then
    log_info "Installation de react-intl..."
    npm install react-intl
fi

# Installer date-fns pour formatage dates français
if ! npm list date-fns &> /dev/null; then
    log_info "Installation de date-fns..."
    npm install date-fns
fi

log_success "Dépendances installées ✓"

# ==========================================
# 7. BUILD DE TEST
# ==========================================

log_info "Test de build avec configuration française..."

# Build de test
if npm run build; then
    log_success "Build réussi ✓"
else
    log_error "Échec du build. Vérifiez les erreurs ci-dessus."
    exit 1
fi

# ==========================================
# 8. DÉMARRAGE DÉVELOPPEMENT
# ==========================================

log_info "Démarrage du serveur de développement..."

# Lancer le serveur dev
if [ "$1" = "--dev" ]; then
    log_success "🎉 Configuration BigSpring France activée !"
    echo ""
    echo "📍 URLs disponibles :"
    echo "   • Français (défaut) : http://localhost:3000"
    echo "   • Anglais           : http://localhost:3000/en"
    echo ""
    echo "🔧 Fichiers modifiés :"
    echo "   • next.config.js (i18n activé)"
    echo "   • src/locales/ (traductions françaises)"
    echo "   • src/lib/i18n.ts (utilitaires)"
    echo ""
    
    npm run dev
    exit 0
fi

# ==========================================
# 9. TESTS DE VALIDATION
# ==========================================

log_info "Exécution des tests de validation..."

# Test des traductions JSON
log_info "Test de validité des fichiers JSON..."
for file in src/locales/fr/*.json; do
    if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
        log_error "JSON invalide dans $file"
        exit 1
    fi
done

log_success "Fichiers JSON valides ✓"

# Test d'import des traductions
log_info "Test d'import des traductions..."
node -e "
try {
  const common = require('./src/locales/fr/common.json');
  const homepage = require('./src/locales/fr/homepage.json');
  console.log('✓ Import réussi');
  console.log('✓ Navigation titre:', common.navigation.company.title);
  console.log('✓ Hero titre:', homepage.hero.title);
} catch(e) {
  console.error('✗ Erreur import:', e.message);
  process.exit(1);
}
"

# ==========================================
# 10. GÉNÉRATION RAPPORT
# ==========================================

log_info "Génération du rapport de déploiement..."

cat > bigspring-deploy-report.md << EOF
# 📊 Rapport de Déploiement BigSpring France

**Date** : $(date)
**Version** : Français + i18n
**Status** : ✅ RÉUSSI

## 🔧 Fichiers Modifiés

- \`next.config.js\` → Configuration i18n activée
- \`src/locales/fr/\` → Traductions françaises complètes
- \`src/lib/i18n.ts\` → Utilitaires de traduction
- \`src/components/LanguageSwitcher.tsx\` → Sélecteur de langue

## 📍 URLs Disponibles

- **Français (défaut)** : http://localhost:3000
- **Anglais** : http://localhost:3000/en

## 🎯 Traductions Disponibles

- ✅ Navigation et éléments communs
- ✅ Page d'accueil complète  
- ✅ Page À propos
- ✅ Page Tarifs avec pricing français
- ✅ SEO français optimisé

## 📈 Prochaines Étapes

1. **Tester la navigation** FR/EN
2. **Valider les CTAs** et conversions
3. **Vérifier le SEO** avec les meta tags français
4. **Déployer en production** sur Vercel

## 🆘 Support

En cas de problème :
- Email : dev@bigspring.fr
- Documentation : ./BIGSPRING_IMPLEMENTATION_PLAN_FR.md
- Exemple : ./BIGSPRING_EXEMPLE_IMPLEMENTATION.tsx

EOF

log_success "Rapport généré : bigspring-deploy-report.md"

# ==========================================
# 11. FINALISATION
# ==========================================

echo ""
echo "🎉 DÉPLOIEMENT BIGSPRING FRANCE TERMINÉ !"
echo ""
echo "📍 URLs disponibles :"
echo "   • Français (défaut) : http://localhost:3000"
echo "   • Anglais           : http://localhost:3000/en"
echo ""
echo "🔧 Commandes utiles :"
echo "   • Développement     : npm run dev"
echo "   • Build production  : npm run build"
echo "   • Démarrer          : npm start"
echo ""
echo "📖 Documentation :"
echo "   • Plan technique    : ./BIGSPRING_IMPLEMENTATION_PLAN_FR.md"
echo "   • Mapping complet   : ./BIGSPRING_TRADUCTION_MAPPING_FR.md"
echo "   • Exemple code      : ./BIGSPRING_EXEMPLE_IMPLEMENTATION.tsx"
echo ""
echo "🚀 Pour démarrer le serveur de développement :"
echo "   ./scripts/deploy-bigspring-french.sh --dev"
echo ""

log_success "Déploiement terminé avec succès ! 🇫🇷"

# ==========================================
# 12. NETTOYAGE (OPTIONNEL)
# ==========================================

# Nettoyer les fichiers temporaires si nécessaire
if [ "$1" = "--clean" ]; then
    log_info "Nettoyage des fichiers temporaires..."
    rm -f .next/cache/*.json 2>/dev/null || true
    log_success "Nettoyage terminé ✓"
fi

exit 0