#!/bin/bash

# 🔄 Synchronisation Multi-Agents - Chef d'Orchestre
# Synchronise tous les agents et résout les conflits

echo "🔄 Synchronisation des agents en cours..."

# =============================================================================
# 🎯 VARIABLES
# =============================================================================

PROJECT_ROOT="/Users/manu/Documents/DEV/website-generator-v2-multi-agents-clean"
AGENTS_ROOT="/Users/manu/Documents/DEV"

DESIGN_AI_PATH="$AGENTS_ROOT/website-generator-design-ai"
AUTOMATION_PATH="$AGENTS_ROOT/website-generator-automation" 
ADS_PATH="$AGENTS_ROOT/website-generator-ads"
CORE_PATH="$AGENTS_ROOT/website-generator-core"

# =============================================================================
# 🎼 FONCTION DE SYNCHRONISATION
# =============================================================================

sync_agent() {
    local agent_name=$1
    local agent_path=$2
    local branch_name=$3
    
    echo "🔄 Synchronisation $agent_name..."
    
    if [ -d "$agent_path" ]; then
        cd "$agent_path"
        
        # Pull des dernières modifications
        git pull origin "$branch_name" 2>/dev/null || echo "  ⚠️  Pas de changements distants"
        
        # Status
        if git diff --quiet && git diff --staged --quiet; then
            echo "  ✅ $agent_name synchronisé"
        else
            echo "  📝 $agent_name a des modifications locales"
            git status --porcelain
        fi
        
        cd "$PROJECT_ROOT"
    else
        echo "  ❌ Dossier $agent_name non trouvé: $agent_path"
    fi
}

# =============================================================================
# 🚀 SYNCHRONISATION DE TOUS LES AGENTS
# =============================================================================

echo "🎼 Synchronisation depuis le Chef d'Orchestre..."

# Chef d'Orchestre (main)
cd "$PROJECT_ROOT"
echo "🎼 Synchronisation Chef d'Orchestre (main)..."
git pull origin main 2>/dev/null || echo "  ⚠️  Pas de changements distants"

# Agents spécialisés
sync_agent "🎨 Design IA" "$DESIGN_AI_PATH" "agent/design-ai"
sync_agent "🤖 Automation" "$AUTOMATION_PATH" "agent/automation" 
sync_agent "📊 Ads Management" "$ADS_PATH" "agent/ads-management"
sync_agent "💎 Core Platform" "$CORE_PATH" "agent/core-platform"

# =============================================================================
# 🔀 MERGE VERS MAIN (SI DEMANDÉ)
# =============================================================================

if [ "$1" = "--merge" ]; then
    echo ""
    echo "🔀 Merge des branches agents vers main..."
    
    cd "$PROJECT_ROOT"
    
    # Merge chaque branche agent
    for branch in "agent/design-ai" "agent/automation" "agent/ads-management" "agent/core-platform"; do
        echo "🔀 Merge $branch..."
        git merge "$branch" --no-edit 2>/dev/null || echo "  ⚠️  Conflits détectés pour $branch"
    done
    
    echo "🚀 Push du merge vers origin..."
    git push origin main
fi

# =============================================================================
# 📊 RAPPORT FINAL
# =============================================================================

echo ""
echo "📊 Rapport de synchronisation:"
echo "================================"

cd "$PROJECT_ROOT"
echo "🎼 Chef d'Orchestre: $(git rev-parse --short HEAD) - $(git log -1 --pretty=format:'%s')"

if [ -d "$DESIGN_AI_PATH" ]; then
    cd "$DESIGN_AI_PATH"
    echo "🎨 Design IA: $(git rev-parse --short HEAD) - $(git log -1 --pretty=format:'%s')"
fi

if [ -d "$AUTOMATION_PATH" ]; then
    cd "$AUTOMATION_PATH" 
    echo "🤖 Automation: $(git rev-parse --short HEAD) - $(git log -1 --pretty=format:'%s')"
fi

if [ -d "$ADS_PATH" ]; then
    cd "$ADS_PATH"
    echo "📊 Ads Management: $(git rev-parse --short HEAD) - $(git log -1 --pretty=format:'%s')"
fi

if [ -d "$CORE_PATH" ]; then
    cd "$CORE_PATH"
    echo "💎 Core Platform: $(git rev-parse --short HEAD) - $(git log -1 --pretty=format:'%s')"
fi

cd "$PROJECT_ROOT"

echo ""
echo "✅ Synchronisation terminée !"
echo "💡 Utilisez '--merge' pour merger vers main"
echo ""

# Notification sonore
echo -e "\a"

exit 0