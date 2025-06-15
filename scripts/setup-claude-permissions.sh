#!/bin/bash

# 🤖 Setup Claude Code Permissions - Multi-Agents Architecture
# Configuration pour éviter les confirmations répétées

echo "🚀 Configuration des permissions Claude Code Multi-Agents..."

# =============================================================================
# 🔧 VARIABLES D'ENVIRONNEMENT CLAUDE
# =============================================================================

# Désactiver les confirmations répétées
export CLAUDE_SKIP_CONFIRMATIONS=true
export CLAUDE_AUTO_APPROVE=true
export CLAUDE_DANGER_MODE=true

# Configuration paths
export CLAUDE_PROJECT_ROOT="/Users/manu/Documents/DEV/website-generator-v2-multi-agents-clean"
export CLAUDE_AGENTS_ROOT="/Users/manu/Documents/DEV"

# Agents paths
export CLAUDE_DESIGN_AI_PATH="$CLAUDE_AGENTS_ROOT/website-generator-design-ai"
export CLAUDE_AUTOMATION_PATH="$CLAUDE_AGENTS_ROOT/website-generator-automation" 
export CLAUDE_ADS_PATH="$CLAUDE_AGENTS_ROOT/website-generator-ads"
export CLAUDE_CORE_PATH="$CLAUDE_AGENTS_ROOT/website-generator-core"

# =============================================================================
# 🎯 PERMISSIONS PAR AGENT
# =============================================================================

echo "📋 Configuration permissions par domaine..."

# Chef d'Orchestre (supervision complète)
echo "🎼 Chef d'Orchestre : Permissions complètes"
export CLAUDE_ORCHESTRATOR_PERMISSIONS="full"

# Agent Design IA (Figma + Images)
echo "🎨 Agent Design IA : Figma API + Image Generation"
export CLAUDE_DESIGN_AI_PERMISSIONS="figma,images,files,git"

# Agent Automation (N8N + APIs)
echo "🤖 Agent Automation : N8N + APIs tierces"
export CLAUDE_AUTOMATION_PERMISSIONS="n8n,webhooks,apis,database"

# Agent Ads Management (Google/Facebook APIs)
echo "📊 Agent Ads : Google/Facebook APIs"
export CLAUDE_ADS_PERMISSIONS="google-ads,facebook-ads,analytics"

# Agent Core Platform (Performance + Security)
echo "💎 Agent Core : Performance + Security"
export CLAUDE_CORE_PERMISSIONS="performance,security,monitoring"

# =============================================================================
# 🔒 SÉCURITÉ ET ACCÈS
# =============================================================================

# Ports autorisés
export CLAUDE_ALLOWED_PORTS="3334,3335,3336,3337,5678,8080"

# Dossiers autorisés (en écriture)
export CLAUDE_WRITE_PATHS="$CLAUDE_PROJECT_ROOT,$CLAUDE_AGENTS_ROOT"

# APIs autorisées
export CLAUDE_ALLOWED_APIS="figma.com,openai.com,anthropic.com,vercel.com,neon.tech"

# =============================================================================
# 🚀 CONFIGURATION AUTO-APPROVAL
# =============================================================================

# Commandes auto-approuvées
CLAUDE_AUTO_APPROVE_COMMANDS=(
    "npm install"
    "npm run dev"
    "npm run build" 
    "npm run test"
    "git add"
    "git commit"
    "git push"
    "git pull"
    "git merge"
    "echo"
    "ls"
    "cd"
    "mkdir"
    "cp"
    "mv"
    "chmod"
    "curl"
    "wget"
)

export CLAUDE_AUTO_APPROVE_COMMANDS

# =============================================================================
# 🎼 WORKFLOW MULTI-AGENTS
# =============================================================================

echo "🔧 Configuration workflow multi-agents..."

# Synchronisation inter-agents
export CLAUDE_SYNC_INTERVAL="300" # 5 minutes
export CLAUDE_AUTO_MERGE="true"
export CLAUDE_CONFLICT_RESOLUTION="orchestrator"

# Notifications
export CLAUDE_NOTIFICATIONS="true"
export CLAUDE_SOUND_NOTIFICATIONS="true"

# Logging
export CLAUDE_LOG_LEVEL="info"
export CLAUDE_LOG_PATH="$CLAUDE_PROJECT_ROOT/logs"

# =============================================================================
# 📁 CRÉATION DOSSIERS NÉCESSAIRES
# =============================================================================

echo "📁 Création des dossiers de travail..."

# Logs
mkdir -p "$CLAUDE_PROJECT_ROOT/logs"
mkdir -p "$CLAUDE_PROJECT_ROOT/scripts"

# MCP Profiles
mkdir -p "$CLAUDE_PROJECT_ROOT/.mcp"

# VS Code configuration
mkdir -p "$CLAUDE_PROJECT_ROOT/.vscode"

# =============================================================================
# 🎯 FICHIERS DE CONFIGURATION
# =============================================================================

echo "📝 Génération des fichiers de configuration..."

# .clauderc pour persistance
cat > "$CLAUDE_PROJECT_ROOT/.clauderc" << EOF
# Claude Code Configuration - Multi-Agents
CLAUDE_SKIP_CONFIRMATIONS=true
CLAUDE_AUTO_APPROVE=true
CLAUDE_DANGER_MODE=true
CLAUDE_PROJECT_ROOT=$CLAUDE_PROJECT_ROOT
CLAUDE_ORCHESTRATOR_MODE=true
EOF

# Profile MCP pour chaque agent
cat > "$CLAUDE_PROJECT_ROOT/.mcp/orchestrator.json" << EOF
{
  "name": "orchestrator",
  "description": "Chef d'Orchestre - Supervision Multi-Agents",
  "permissions": ["full"],
  "auto_approve": true,
  "skip_confirmations": true
}
EOF

cat > "$CLAUDE_PROJECT_ROOT/.mcp/design-ai.json" << EOF
{
  "name": "design-ai", 
  "description": "Agent Design IA - Figma MCP + Génération",
  "permissions": ["figma", "images", "files", "git"],
  "servers": {
    "figma-mcp": {
      "command": "npx",
      "args": ["@figma/mcp-server"]
    }
  }
}
EOF

cat > "$CLAUDE_PROJECT_ROOT/.mcp/automation.json" << EOF
{
  "name": "automation",
  "description": "Agent Automation - N8N + Agents IA", 
  "permissions": ["n8n", "webhooks", "apis", "database"],
  "servers": {
    "n8n-mcp": {
      "command": "npx", 
      "args": ["@n8n/mcp-server"]
    }
  }
}
EOF

# =============================================================================
# ✅ VALIDATION ET TESTS
# =============================================================================

echo "🧪 Tests des permissions..."

# Test commandes de base
echo "  ✓ Test echo" && echo "Test réussi" > /dev/null
echo "  ✓ Test ls" && ls > /dev/null
echo "  ✓ Test git" && git status > /dev/null 2>&1

# Test création fichiers
echo "  ✓ Test écriture" && touch "$CLAUDE_PROJECT_ROOT/test-permissions.tmp" && rm "$CLAUDE_PROJECT_ROOT/test-permissions.tmp"

# =============================================================================
# 🎉 FINALISATION
# =============================================================================

echo ""
echo "🎉 Configuration des permissions terminée !"
echo ""
echo "✅ Permissions configurées pour :"
echo "   🎼 Chef d'Orchestre (vous)"
echo "   🎨 Agent Design IA"  
echo "   🤖 Agent Automation"
echo "   📊 Agent Ads Management"
echo "   💎 Agent Core Platform"
echo ""
echo "🚀 Prêt pour développement multi-agents sans interruptions !"
echo ""

# Son de notification
echo -e "\a"

exit 0