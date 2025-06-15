#!/bin/bash

# =============================================================================
# 🚀 CONFIGURATION AUTOMATIQUE VERCEL PRODUCTION
# Agent Core Platform - Multi-Agents Website Generator V2
# =============================================================================

set -e

echo "🚀 Configuration Vercel Production - Multi-Agent Platform"
echo "=========================================================="

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Erreur: Vercel CLI non trouvé. Installation:"
    echo "npm install -g vercel@latest"
    exit 1
fi

# Vérifier si on est connecté à Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Connexion à Vercel requise..."
    vercel login
fi

# Créer fichier .env.production pour référence locale
echo "📝 Création du fichier .env.production de référence..."

cat > .env.production << 'EOF'
# =============================================================================
# 🔑 VARIABLES PRODUCTION - WEBSITE GENERATOR V2 MULTI-AGENTS
# =============================================================================

# AUTHENTIFICATION & SÉCURITÉ
NEXTAUTH_SECRET=5u61zO6lWjihY0Rb3LNefHEJLApoPdwjLwjkwrx6CFM=
NEXTAUTH_URL=https://your-production-domain.vercel.app
INTER_AGENT_TOKEN=secure-random-inter-agent-token-change-me

# BASE DE DONNÉES NEON
DATABASE_URL=postgresql://website-generator-platform_owner:npg_qWuJ32CHtVjs@ep-snowy-snowflake-a9a4wiek-pooler.gwc.azure.neon.tech/website-generator-platform?sslmode=require

# STRIPE PRODUCTION (À CONFIGURER)
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# POLAR BACKUP PAYMENT
POLAR_ACCESS_TOKEN=polar_oat_8W2MdX23gFcZDDjNdfYT0QRwh4MVcyMUbF6n03yJCVJ
POLAR_ORGANIZATION_ID=8eaa364c-9b45-4b44-a3c9-eb0412b55820
POLAR_MODE=production
POLAR_SITE_CREATION_PRODUCT_ID=cb38ebe0-c9a2-4db8-936e-be7285461670
POLAR_MAINTENANCE_PRODUCT_ID=3ddebe61-5143-4dc8-887d-33189c5842ca

# APPLICATION
APP_URL=https://your-production-domain.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-production-domain.vercel.app
NODE_ENV=production

# MULTI-AGENTS
ORCHESTRATOR_PORT=3334
CORE_PLATFORM_PORT=3338
DESIGN_IA_PORT=3335
AUTOMATION_PORT=3336
ADS_MANAGEMENT_PORT=3337
AGENT_RESPONSE_TIMEOUT=30000
AGENT_HEARTBEAT_INTERVAL=5000
AGENT_MAX_RETRIES=3

# MONITORING
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true
METRICS_COLLECTION_INTERVAL=60000
ALERT_THRESHOLD_RESPONSE_TIME=200
ALERT_THRESHOLD_ERROR_RATE=5
EOF

echo "✅ Fichier .env.production créé"

# Fonction pour ajouter une variable Vercel
add_vercel_env() {
    local key=$1
    local value=$2
    local environment=${3:-production}
    
    if [ -z "$value" ] || [ "$value" = "YOUR_KEY_HERE" ] || [[ "$value" == *"CHANGE_ME"* ]]; then
        echo "⚠️  ATTENTION: $key contient une valeur placeholder"
        echo "   Valeur actuelle: $value"
        read -p "   Entrer la vraie valeur pour $key: " real_value
        if [ -n "$real_value" ]; then
            value=$real_value
        else
            echo "   ⏭️  Ignoré - À configurer manuellement plus tard"
            return
        fi
    fi
    
    echo "🔧 Configuration $key..."
    echo "$value" | vercel env add "$key" "$environment" --force --silent
}

echo ""
echo "🔧 Configuration des variables d'environnement Vercel..."
echo "⚠️  ATTENTION: Les valeurs avec placeholder nécessitent une saisie manuelle"
echo ""

# Variables critiques avec vérification
echo "📋 VARIABLES CRITIQUES - VÉRIFICATION REQUISE"
echo "============================================="

# NextAuth
add_vercel_env "NEXTAUTH_SECRET" "5u61zO6lWjihY0Rb3LNefHEJLApoPdwjLwjkwrx6CFM="
echo "⚠️  Entrer votre domaine Vercel pour NEXTAUTH_URL"
read -p "Domaine production (ex: https://myapp.vercel.app): " production_domain
if [ -n "$production_domain" ]; then
    add_vercel_env "NEXTAUTH_URL" "$production_domain"
    add_vercel_env "APP_URL" "$production_domain"
    add_vercel_env "NEXT_PUBLIC_BASE_URL" "$production_domain"
fi

# Base de données
add_vercel_env "DATABASE_URL" "postgresql://website-generator-platform_owner:npg_qWuJ32CHtVjs@ep-snowy-snowflake-a9a4wiek-pooler.gwc.azure.neon.tech/website-generator-platform?sslmode=require"

# Stripe - CRITIQUE pour les paiements
echo ""
echo "💳 CONFIGURATION STRIPE (CRITIQUE)"
echo "================================="
echo "ℹ️  Récupérer vos clés depuis: https://dashboard.stripe.com/apikeys"
add_vercel_env "STRIPE_PUBLISHABLE_KEY" "pk_live_YOUR_LIVE_KEY_HERE"
add_vercel_env "STRIPE_SECRET_KEY" "sk_live_YOUR_LIVE_KEY_HERE"
add_vercel_env "STRIPE_WEBHOOK_SECRET" "whsec_YOUR_WEBHOOK_SECRET_HERE"

# Polar (backup)
echo ""
echo "🔄 CONFIGURATION POLAR (BACKUP PAYMENTS)"
echo "======================================="
add_vercel_env "POLAR_ACCESS_TOKEN" "polar_oat_8W2MdX23gFcZDDjNdfYT0QRwh4MVcyMUbF6n03yJCVJ"
add_vercel_env "POLAR_ORGANIZATION_ID" "8eaa364c-9b45-4b44-a3c9-eb0412b55820"
add_vercel_env "POLAR_MODE" "production"
add_vercel_env "POLAR_SITE_CREATION_PRODUCT_ID" "cb38ebe0-c9a2-4db8-936e-be7285461670"
add_vercel_env "POLAR_MAINTENANCE_PRODUCT_ID" "3ddebe61-5143-4dc8-887d-33189c5842ca"

# Variables automatiques (sans interaction utilisateur)
echo ""
echo "🤖 CONFIGURATION AUTOMATIQUE MULTI-AGENTS"
echo "========================================="

# Multi-agents configuration
vercel env add "ORCHESTRATOR_PORT" --value="3334" production --force --silent
vercel env add "CORE_PLATFORM_PORT" --value="3338" production --force --silent
vercel env add "DESIGN_IA_PORT" --value="3335" production --force --silent
vercel env add "AUTOMATION_PORT" --value="3336" production --force --silent
vercel env add "ADS_MANAGEMENT_PORT" --value="3337" production --force --silent
vercel env add "AGENT_RESPONSE_TIMEOUT" --value="30000" production --force --silent
vercel env add "AGENT_HEARTBEAT_INTERVAL" --value="5000" production --force --silent
vercel env add "AGENT_MAX_RETRIES" --value="3" production --force --silent

# Monitoring
vercel env add "LOG_LEVEL" --value="info" production --force --silent
vercel env add "ENABLE_PERFORMANCE_MONITORING" --value="true" production --force --silent
vercel env add "METRICS_COLLECTION_INTERVAL" --value="60000" production --force --silent
vercel env add "ALERT_THRESHOLD_RESPONSE_TIME" --value="200" production --force --silent
vercel env add "ALERT_THRESHOLD_ERROR_RATE" --value="5" production --force --silent

# Environment
vercel env add "NODE_ENV" --value="production" production --force --silent

# Token inter-agents sécurisé
INTER_AGENT_TOKEN=$(openssl rand -hex 32)
vercel env add "INTER_AGENT_TOKEN" --value="$INTER_AGENT_TOKEN" production --force --silent

echo "✅ Variables multi-agents configurées"

# Afficher le résumé
echo ""
echo "📊 RÉSUMÉ CONFIGURATION"
echo "======================"
echo "✅ Variables de base configurées"
echo "✅ Multi-agents configuration OK"
echo "✅ Monitoring activé"
echo "✅ Token inter-agents généré"

# Vérifier la configuration
echo ""
echo "🔍 VÉRIFICATION CONFIGURATION"
echo "============================="
vercel env ls production | head -20

echo ""
echo "⚠️  ACTIONS MANUELLES REQUISES:"
echo "================================"
echo "1. 💳 Vérifier clés Stripe en production"
echo "2. 🌐 Configurer webhooks Stripe: https://dashboard.stripe.com/webhooks"
echo "3. 🔗 URL webhook: ${production_domain:-https://your-domain.vercel.app}/api/webhooks/stripe"
echo "4. 📧 Configurer SMTP si envoi emails requis"
echo "5. 🏗️  Tester le build: npm run build"
echo ""

echo "🚀 PRÊT POUR DÉPLOIEMENT"
echo "========================"
echo "Lancer le déploiement avec:"
echo "  ./scripts/deploy-production.sh"
echo ""
echo "Ou manuellement:"
echo "  vercel --prod --confirm"
echo ""

# Ajouter .env.production au .gitignore
echo ".env.production" >> .gitignore 2>/dev/null || true

echo "✅ Configuration Vercel terminée!"
echo "📋 Fichier .env.production créé pour référence locale"
echo "🔒 Fichier ajouté au .gitignore pour sécurité"
echo ""
echo "🎯 PROCHAINE ÉTAPE: Déploiement production"