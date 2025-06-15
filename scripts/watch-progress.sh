#!/bin/bash

# 📊 Surveillance Progression Multi-Agents
# Script pour surveiller et mettre à jour la progression en temps réel

echo "📊 Surveillance Progression Multi-Agents"
echo "========================================"

PROJECT_ROOT="/Users/manu/Documents/DEV/website-generator-v2-multi-agents-clean"
PROGRESS_FILE="$PROJECT_ROOT/AGENTS_PROGRESS.md"

# Fonction de mise à jour du statut
update_status() {
    local timestamp=$(date '+%d %B %Y - %H:%M')
    
    # Vérifier le statut de chaque agent
    local orchestrator_status="❌ OFFLINE"
    local design_ai_status="❌ OFFLINE"
    local automation_status="❌ OFFLINE"
    local ads_status="❌ OFFLINE"
    
    # Test de connexion
    if curl -s "http://localhost:3334" > /dev/null 2>&1; then
        orchestrator_status="✅ ACTIF"
    fi
    
    if curl -s "http://localhost:3335" > /dev/null 2>&1; then
        design_ai_status="✅ ACTIF"
    fi
    
    if curl -s "http://localhost:3336" > /dev/null 2>&1; then
        automation_status="✅ ACTIF"
    fi
    
    if curl -s "http://localhost:3337" > /dev/null 2>&1; then
        ads_status="✅ ACTIF"
    fi
    
    # Mettre à jour le fichier de progression
    sed -i '' "s/*Mise à jour en temps réel : .*/*Mise à jour en temps réel : $timestamp/" "$PROGRESS_FILE"
    
    echo "📊 Status $timestamp:"
    echo "  🎼 Chef d'Orchestre: $orchestrator_status"
    echo "  🎨 Design IA: $design_ai_status"
    echo "  🤖 Automation: $automation_status"
    echo "  📊 Ads Management: $ads_status"
    echo ""
    
    # Déclencher refresh VS Code (si ouvert)
    osascript -e 'tell application "Visual Studio Code" to activate' 2>/dev/null || true
}

# Surveillance continue
echo "🔄 Surveillance continue activée..."
echo "📝 Fichier progression: $PROGRESS_FILE"
echo "💡 Ouvrez le fichier AGENTS_PROGRESS.md dans VS Code pour voir la progression"
echo ""

while true; do
    update_status
    sleep 30
done