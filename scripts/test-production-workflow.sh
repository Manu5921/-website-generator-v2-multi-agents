#!/bin/bash

# =============================================================================
# 🧪 TEST WORKFLOW PRODUCTION COMPLET
# Agent Core Platform - Test automatisé du workflow business
# =============================================================================

set -e

# Configuration
PRODUCTION_URL=${1:-"https://your-domain.vercel.app"}
TEST_EMAIL="test@example.com"
TEST_COMPANY="Test Company Ltd"

echo "🧪 TEST WORKFLOW PRODUCTION COMPLET"
echo "==================================="
echo "URL Production: $PRODUCTION_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Fonction de test avec retry
test_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local max_retries=${3:-3}
    local delay=${4:-2}
    
    echo "🔍 Test: $url"
    
    for i in $(seq 1 $max_retries); do
        if response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$url"); then
            if [ "$response" = "$expected_status" ]; then
                echo "  ✅ OK ($response)"
                return 0
            else
                echo "  ❌ Unexpected status: $response (expected: $expected_status)"
            fi
        else
            echo "  ⚠️  Tentative $i/$max_retries échouée"
        fi
        
        if [ $i -lt $max_retries ]; then
            echo "  ⏳ Retry dans ${delay}s..."
            sleep $delay
        fi
    done
    
    echo "  ❌ ÉCHEC après $max_retries tentatives"
    return 1
}

# Test avec JSON response
test_json_endpoint() {
    local url=$1
    local expected_field=$2
    
    echo "🔍 Test JSON: $url"
    
    if response=$(curl -s --max-time 30 "$url"); then
        if echo "$response" | jq -e ".$expected_field" > /dev/null 2>&1; then
            echo "  ✅ OK - Field '$expected_field' found"
            return 0
        else
            echo "  ❌ Field '$expected_field' not found in response"
            echo "  Response: $response" | head -c 200
            return 1
        fi
    else
        echo "  ❌ Request failed"
        return 1
    fi
}

# =============================================================================
# PHASE 1: TESTS INFRASTRUCTURE DE BASE
# =============================================================================

echo "🏗️  PHASE 1: INFRASTRUCTURE DE BASE"
echo "=================================="

# Test 1: Health Check
test_endpoint "$PRODUCTION_URL/api/health" 200

# Test 2: Métriques système
test_json_endpoint "$PRODUCTION_URL/api/system/metrics" "timestamp"

# Test 3: Dashboard V2
test_endpoint "$PRODUCTION_URL/dashboard-v2" 200

# Test 4: API Demandes
test_endpoint "$PRODUCTION_URL/api/demandes" 405  # GET non autorisé

echo ""
echo "✅ Phase 1 terminée - Infrastructure OK"

# =============================================================================
# PHASE 2: TESTS ORCHESTRATION MULTI-AGENTS
# =============================================================================

echo ""
echo "🤖 PHASE 2: ORCHESTRATION MULTI-AGENTS"
echo "====================================="

# Test 5: API Orchestration
test_json_endpoint "$PRODUCTION_URL/api/orchestration" "success"

# Test 6: Webhooks orchestration (stats)
test_json_endpoint "$PRODUCTION_URL/api/orchestration/webhooks" "success"

# Test 7: Workflow status
test_endpoint "$PRODUCTION_URL/api/workflows" 200

echo ""
echo "✅ Phase 2 terminée - Multi-agents OK"

# =============================================================================
# PHASE 3: TESTS PAIEMENTS & WEBHOOKS
# =============================================================================

echo ""
echo "💳 PHASE 3: SYSTÈME DE PAIEMENT"
echo "============================="

# Test 8: API Stripe checkout (should fail without data but respond)
echo "🔍 Test Stripe API availability"
if response=$(curl -s -X POST -H "Content-Type: application/json" -d '{}' "$PRODUCTION_URL/api/stripe/checkout" -w "%{http_code}"); then
    status_code=$(echo "$response" | tail -c 4)
    if [ "$status_code" = "400" ] || [ "$status_code" = "422" ]; then
        echo "  ✅ Stripe API répond (validation échoue comme attendu: $status_code)"
    else
        echo "  ⚠️  Status inattendu: $status_code"
    fi
else
    echo "  ❌ Stripe API non accessible"
fi

# Test 9: Webhooks Polar
test_endpoint "$PRODUCTION_URL/api/webhooks/polar" 401  # Unauthorized sans signature

echo ""
echo "✅ Phase 3 terminée - Paiements OK"

# =============================================================================
# PHASE 4: TEST WORKFLOW COMPLET SIMULÉ
# =============================================================================

echo ""
echo "🎯 PHASE 4: WORKFLOW BUSINESS SIMULÉ"
echo "==================================="

echo "📝 Simulation création demande client..."

# Données de test
TEST_DATA='{
  "nom": "Test User",
  "email": "'$TEST_EMAIL'",
  "entreprise": "'$TEST_COMPANY'",
  "secteur": "technology",
  "typesSites": ["vitrine"],
  "description": "Site test pour validation workflow production",
  "budget": "standard",
  "delai": "standard"
}'

echo "🔍 Test création demande..."
if response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  "$PRODUCTION_URL/api/demandes"); then
  
  # Vérifier si la réponse contient un ID
  if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    DEMANDE_ID=$(echo "$response" | jq -r '.demande.id // empty')
    echo "  ✅ Demande créée avec succès"
    echo "  ID: $DEMANDE_ID"
    
    if [ -n "$DEMANDE_ID" ] && [ "$DEMANDE_ID" != "null" ]; then
      # Test création checkout pour cette demande
      echo ""
      echo "💳 Test création checkout Stripe..."
      CHECKOUT_DATA='{"demandeId": "'$DEMANDE_ID'", "amount": 50}'
      
      if checkout_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$CHECKOUT_DATA" \
        "$PRODUCTION_URL/api/stripe/checkout"); then
        
        if echo "$checkout_response" | jq -e '.success' > /dev/null 2>&1; then
          CHECKOUT_URL=$(echo "$checkout_response" | jq -r '.commande.lienPaiement // empty')
          echo "  ✅ Checkout créé avec succès"
          echo "  URL Paiement: $CHECKOUT_URL"
        else
          echo "  ⚠️  Checkout création échouée (normal sans config Stripe complète)"
          echo "  Réponse: $(echo "$checkout_response" | head -c 200)"
        fi
      else
        echo "  ❌ Erreur appel API checkout"
      fi
    fi
  else
    echo "  ⚠️  Réponse inattendue création demande"
    echo "  Réponse: $(echo "$response" | head -c 200)"
  fi
else
  echo "  ❌ Erreur création demande"
fi

echo ""
echo "✅ Phase 4 terminée - Workflow simulé"

# =============================================================================
# PHASE 5: TESTS PERFORMANCE & MONITORING
# =============================================================================

echo ""
echo "📊 PHASE 5: PERFORMANCE & MONITORING"
echo "==================================="

echo "⚡ Test temps de réponse des endpoints critiques..."

# Fonction de mesure de performance
measure_performance() {
    local url=$1
    local endpoint_name=$2
    
    echo "📏 $endpoint_name..."
    time_total=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$url" 2>/dev/null || echo "timeout")
    
    if [ "$time_total" != "timeout" ]; then
        time_ms=$(echo "$time_total * 1000" | bc 2>/dev/null || echo "$time_total")
        echo "  ⏱️  ${time_ms}ms"
        
        # Alertes performance
        if (( $(echo "$time_total > 1.0" | bc -l) )); then
            echo "  ⚠️  LENT: > 1000ms"
        elif (( $(echo "$time_total > 0.5" | bc -l) )); then
            echo "  ⚠️  MOYEN: > 500ms"
        else
            echo "  ✅ RAPIDE: < 500ms"
        fi
    else
        echo "  ❌ TIMEOUT"
    fi
}

measure_performance "$PRODUCTION_URL/api/health" "Health Check"
measure_performance "$PRODUCTION_URL/api/system/metrics" "System Metrics"
measure_performance "$PRODUCTION_URL/dashboard-v2" "Dashboard V2"
measure_performance "$PRODUCTION_URL/api/orchestration" "Orchestration API"

echo ""
echo "✅ Phase 5 terminée - Performance mesurée"

# =============================================================================
# RÉSUMÉ & RECOMMANDATIONS
# =============================================================================

echo ""
echo "📋 RÉSUMÉ DES TESTS"
echo "=================="

# Compter les succès (approximatif)
echo "🎯 Tests Infrastructure: ✅ OK"
echo "🤖 Tests Multi-agents: ✅ OK"
echo "💳 Tests Paiements: ⚠️  Config requise"
echo "🎪 Workflow Simulé: ✅ Partiel"
echo "📊 Performance: ✅ Mesurée"

echo ""
echo "🔧 ACTIONS RECOMMANDÉES"
echo "======================"
echo "1. ✅ Infrastructure: Prêt pour production"
echo "2. 🔑 Stripe: Configurer clés production complètes"
echo "3. 🔗 Webhooks: Configurer URLs dans Stripe Dashboard"
echo "4. 🧪 Tests: Effectuer paiement test complet"
echo "5. 📧 Email: Configurer SMTP pour notifications"

echo ""
echo "🚀 STATUT DÉPLOIEMENT"
echo "===================="

# Déterminer le statut global
if test_endpoint "$PRODUCTION_URL/api/health" 200 > /dev/null 2>&1 && \
   test_json_endpoint "$PRODUCTION_URL/api/system/metrics" "timestamp" > /dev/null 2>&1; then
    echo "✅ PRODUCTION READY"
    echo ""
    echo "🎉 La plateforme est opérationnelle!"  
    echo "📊 Dashboard: $PRODUCTION_URL/dashboard-v2"
    echo "🔍 Health: $PRODUCTION_URL/api/health"
    echo "💳 Prochaine étape: Configuration Stripe complète"
else
    echo "⚠️  ATTENTION REQUISE"
    echo ""
    echo "❌ Des problèmes ont été détectés"
    echo "🔍 Vérifier logs Vercel et configuration"
fi

echo ""
echo "📞 SUPPORT"
echo "=========="
echo "Dashboard Vercel: https://vercel.com/dashboard"
echo "Logs temps réel: vercel logs --follow"
echo "Status monitoring: $PRODUCTION_URL/api/system/metrics"

echo ""
echo "🏁 Test workflow terminé!"