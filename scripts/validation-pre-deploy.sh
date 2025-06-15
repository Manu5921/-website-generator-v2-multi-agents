#!/bin/bash

# 🚨 SCRIPT DE VALIDATION PRÉ-DÉPLOIEMENT
# Obligatoire avant tout déploiement Vercel

echo "🔍 VALIDATION PRÉ-DÉPLOIEMENT - DÉMARRAGE"
echo "=========================================="

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteur d'erreurs
ERRORS=0

echo -e "${BLUE}📋 CHECKLIST OBLIGATOIRE${NC}"
echo ""

# 1. Vérification Node modules
echo "1. 🔍 Vérification dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ node_modules manquant${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ node_modules présent${NC}"
fi

# 2. Vérification package.json
echo "2. 📦 Vérification package.json..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json manquant${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ package.json présent${NC}"
fi

# 3. Test build local
echo "3. 🔨 Test build local..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build réussi${NC}"
else
    echo -e "${RED}❌ Build échoué - ARRÊT${NC}"
    echo -e "${YELLOW}💡 Corriger les erreurs de build avant déploiement${NC}"
    exit 1
fi

# 4. Vérification des ports (pas 3000)
echo "4. 🚪 Vérification configuration ports..."
if grep -q "3000" package.json; then
    echo -e "${YELLOW}⚠️  Port 3000 détecté dans package.json${NC}"
    echo -e "${YELLOW}💡 Recommandation : utiliser port 3040+${NC}"
else
    echo -e "${GREEN}✅ Configuration ports OK${NC}"
fi

# 5. Vérification des imports Heroicons
echo "5. 🎨 Vérification imports Heroicons..."
HEROICONS_ERRORS=$(grep -r "ChefHatIcon\|CookieIcon\|KnifeIcon" src/ || true)
if [ ! -z "$HEROICONS_ERRORS" ]; then
    echo -e "${RED}❌ Icons invalides détectées :${NC}"
    echo "$HEROICONS_ERRORS"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ Icons Heroicons valides${NC}"
fi

# 6. Vérification des images Unsplash
echo "6. 🖼️  Vérification intégration images..."
if grep -r "emoji\|placeholder\|🍽️\|👨‍🍳" src/ > /dev/null; then
    echo -e "${YELLOW}⚠️  Emojis/placeholders détectés${NC}"
    echo -e "${YELLOW}💡 Remplacer par vraies photos Unsplash${NC}"
else
    echo -e "${GREEN}✅ Intégration images professionnelles${NC}"
fi

# 7. Vérification glassmorphism
echo "7. ✨ Vérification effets glassmorphism..."
if grep -r "glass-\|backdrop-blur\|glassmorphism" src/ > /dev/null; then
    echo -e "${GREEN}✅ Effets glassmorphism appliqués${NC}"
else
    echo -e "${YELLOW}⚠️  Effets glassmorphism manquants${NC}"
    echo -e "${YELLOW}💡 Ajouter CSS glassmorphism pour niveau premium${NC}"
fi

# 8. Vérification Framer Motion
echo "8. 🎬 Vérification animations Framer Motion..."
if grep -r "motion\.\|initial=\|animate=" src/ > /dev/null; then
    echo -e "${GREEN}✅ Animations Framer Motion présentes${NC}"
else
    echo -e "${YELLOW}⚠️  Animations Framer Motion manquantes${NC}"
fi

# 9. Vérification responsive design
echo "9. 📱 Vérification responsive design..."
if grep -r "sm:\|md:\|lg:\|xl:" src/ > /dev/null; then
    echo -e "${GREEN}✅ Classes responsive Tailwind présentes${NC}"
else
    echo -e "${YELLOW}⚠️  Classes responsive manquantes${NC}"
fi

# 10. Vérification environnement
echo "10. 🌍 Vérification variables environnement..."
if [ -f ".env.local" ] || [ -f ".env" ]; then
    echo -e "${GREEN}✅ Fichiers environnement présents${NC}"
else
    echo -e "${YELLOW}⚠️  Fichiers .env manquants${NC}"
fi

echo ""
echo "=========================================="

# Résultat final
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 VALIDATION RÉUSSIE - PRÊT POUR DÉPLOIEMENT${NC}"
    echo -e "${GREEN}✅ Tous les checks sont passés${NC}"
    echo ""
    echo -e "${BLUE}📋 PROCHAINES ÉTAPES :${NC}"
    echo "1. npx vercel --prod"
    echo "2. Tester l'URL de production"
    echo "3. Demander validation utilisateur"
    echo ""
    exit 0
else
    echo -e "${RED}🚨 VALIDATION ÉCHOUÉE - ${ERRORS} ERREUR(S)${NC}"
    echo -e "${RED}❌ Corriger les erreurs avant déploiement${NC}"
    echo ""
    echo -e "${YELLOW}💡 ACTIONS REQUISES :${NC}"
    echo "1. Corriger les erreurs listées ci-dessus"
    echo "2. Relancer ./scripts/validation-pre-deploy.sh"
    echo "3. Déployer seulement si validation ✅"
    echo ""
    exit 1
fi