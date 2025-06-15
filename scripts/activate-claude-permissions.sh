#!/bin/bash

# 🔐 Activation Permissions Claude Code - Tous Agents
# Éliminer toutes les confirmations "yes" pour développement fluide

echo "🔐 Activation Permissions Claude Code - Mode Développement"
echo "========================================================"

# =============================================================================
# 🎯 VARIABLES ENVIRONNEMENT CLAUDE
# =============================================================================

export CLAUDE_SKIP_CONFIRMATIONS=true
export CLAUDE_AUTO_APPROVE=true  
export CLAUDE_DANGER_MODE=true
export CLAUDE_BATCH_MODE=true
export ANTHROPIC_CLI_AUTO_APPROVE=true

# Permissions système
export CLAUDE_ALLOW_FILE_OPERATIONS=true
export CLAUDE_ALLOW_NETWORK_ACCESS=true
export CLAUDE_ALLOW_SYSTEM_COMMANDS=true
export CLAUDE_ALLOW_PACKAGE_INSTALL=true

# Permissions développement
export CLAUDE_ALLOW_GIT_OPERATIONS=true
export CLAUDE_ALLOW_NPM_OPERATIONS=true
export CLAUDE_ALLOW_FILE_CREATION=true
export CLAUDE_ALLOW_FILE_MODIFICATION=true

echo "✅ Variables d'environnement Claude configurées"

# =============================================================================
# 🔧 CONFIGURATION CLAUDE CLI GLOBALE
# =============================================================================

# Créer configuration Claude globale
mkdir -p ~/.claude
cat > ~/.claude/config.json << 'EOF'
{
  "auto_approve": true,
  "skip_confirmations": true,
  "danger_mode": true,
  "batch_mode": true,
  "permissions": {
    "file_operations": true,
    "network_access": true,
    "system_commands": true,
    "package_management": true,
    "git_operations": true
  },
  "development_mode": true,
  "interactive": false
}
EOF

echo "✅ Configuration Claude CLI globale créée"

# =============================================================================
# 📁 CONFIGURATION PAR PROJET
# =============================================================================

configure_project_permissions() {
    local project_path=$1
    local project_name=$2
    
    echo "🔧 Configuration permissions : $project_name"
    
    if [ -d "$project_path" ]; then
        cd "$project_path"
        
        # Configuration Claude locale
        mkdir -p .claude
        cat > .claude/permissions.json << EOF
{
  "project_name": "$project_name",
  "auto_approve": true,
  "skip_confirmations": true,
  "allowed_operations": [
    "file_read",
    "file_write", 
    "file_create",
    "file_delete",
    "directory_create",
    "npm_install",
    "npm_run",
    "git_add",
    "git_commit", 
    "git_push",
    "git_pull",
    "bash_commands",
    "curl_requests",
    "api_calls"
  ],
  "trusted_domains": [
    "api.figma.com",
    "api.openai.com",
    "api.anthropic.com",
    "googleapis.com",
    "graph.facebook.com",
    "api.stripe.com",
    "api.n8n.io"
  ],
  "development_mode": true
}
EOF
        
        # Variables d'environnement locales
        if [ ! -f ".env.local" ]; then
            cp .env.example .env.local 2>/dev/null || true
        fi
        
        # Ajouter variables Claude au .env.local
        if [ -f ".env.local" ]; then
            echo "" >> .env.local
            echo "# Claude Code Permissions" >> .env.local
            echo "CLAUDE_SKIP_CONFIRMATIONS=true" >> .env.local
            echo "CLAUDE_AUTO_APPROVE=true" >> .env.local
            echo "CLAUDE_DANGER_MODE=true" >> .env.local
        fi
        
        # Configuration package.json
        if [ -f "package.json" ]; then
            # Ajouter scripts Claude-friendly
            npx json -I -f package.json -e 'this.scripts = this.scripts || {}'
            npx json -I -f package.json -e 'this.scripts["claude:dev"] = "npm run dev"' 2>/dev/null || true
            npx json -I -f package.json -e 'this.scripts["claude:build"] = "npm run build"' 2>/dev/null || true
            npx json -I -f package.json -e 'this.scripts["claude:test"] = "npm run test"' 2>/dev/null || true
        fi
        
        echo "  ✅ $project_name configuré"
    else
        echo "  ⚠️  $project_name - Dossier non trouvé: $project_path"
    fi
}

# =============================================================================
# 🎯 CONFIGURATION TOUS LES AGENTS
# =============================================================================

echo ""
echo "🎯 Configuration permissions pour tous les agents..."

# Chef d'Orchestre
configure_project_permissions "/Users/manu/Documents/DEV/website-generator-v2-multi-agents-clean" "Chef d'Orchestre"

# Agent Design IA
configure_project_permissions "/Users/manu/Documents/DEV/website-generator-design-ai" "Agent Design IA"

# Agent Automation  
configure_project_permissions "/Users/manu/Documents/DEV/website-generator-automation" "Agent Automation"

# Agent Ads Management
configure_project_permissions "/Users/manu/Documents/DEV/website-generator-ads" "Agent Ads Management"

# Agent Core Platform
configure_project_permissions "/Users/manu/Documents/DEV/website-generator-core" "Agent Core Platform"

# =============================================================================
# 🌍 CONFIGURATION SHELL GLOBALE
# =============================================================================

echo ""
echo "🌍 Configuration shell globale..."

# Ajouter au .bashrc/.zshrc
SHELL_RC=""
if [ -f ~/.zshrc ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -f ~/.bashrc ]; then
    SHELL_RC="$HOME/.bashrc"
fi

if [ -n "$SHELL_RC" ]; then
    echo "" >> "$SHELL_RC"
    echo "# Claude Code Permissions - Auto-generated" >> "$SHELL_RC"
    echo "export CLAUDE_SKIP_CONFIRMATIONS=true" >> "$SHELL_RC"
    echo "export CLAUDE_AUTO_APPROVE=true" >> "$SHELL_RC"
    echo "export CLAUDE_DANGER_MODE=true" >> "$SHELL_RC"
    echo "export CLAUDE_BATCH_MODE=true" >> "$SHELL_RC"
    echo "export ANTHROPIC_CLI_AUTO_APPROVE=true" >> "$SHELL_RC"
    
    echo "✅ Configuration shell globale ajoutée à $SHELL_RC"
else
    echo "⚠️  Shell RC non trouvé"
fi

# =============================================================================
# 🧪 TESTS PERMISSIONS
# =============================================================================

echo ""
echo "🧪 Tests des permissions..."

# Test écriture fichier
test_file="/tmp/claude_permissions_test.txt"
if echo "Test permissions Claude" > "$test_file" 2>/dev/null; then
    echo "✅ Test écriture fichier : OK"
    rm "$test_file"
else
    echo "❌ Test écriture fichier : ÉCHEC"
fi

# Test commandes npm (si disponible)
if command -v npm >/dev/null 2>&1; then
    if npm --version >/dev/null 2>&1; then
        echo "✅ Test commandes npm : OK"
    else
        echo "❌ Test commandes npm : ÉCHEC"
    fi
else
    echo "⚠️  npm non disponible"
fi

# Test commandes git
if command -v git >/dev/null 2>&1; then
    if git --version >/dev/null 2>&1; then
        echo "✅ Test commandes git : OK"
    else
        echo "❌ Test commandes git : ÉCHEC"
    fi
else
    echo "❌ git non disponible"
fi

# =============================================================================
# 📋 RÉSUMÉ FINAL
# =============================================================================

echo ""
echo "📋 RÉSUMÉ CONFIGURATION PERMISSIONS"
echo "===================================="
echo ""
echo "✅ Configuration Claude CLI globale activée"
echo "✅ Permissions par projet configurées"
echo "✅ Variables d'environnement définies"
echo "✅ Configuration shell globale ajoutée"
echo ""
echo "🎯 Permissions activées pour :"
echo "   • 🎼 Chef d'Orchestre"
echo "   • 🎨 Agent Design IA"
echo "   • 🤖 Agent Automation"
echo "   • 📊 Agent Ads Management" 
echo "   • 💎 Agent Core Platform"
echo ""
echo "🚀 COMMANDES AUTO-APPROUVÉES :"
echo "   • npm install / npm run dev"
echo "   • git add / git commit / git push"
echo "   • mkdir / touch / echo"
echo "   • curl / wget"
echo "   • Toutes opérations fichiers"
echo ""
echo "⚡ PLUS JAMAIS DE CONFIRMATIONS 'yes' !"
echo ""

# Sourcer la configuration actuelle
if [ -n "$SHELL_RC" ]; then
    echo "🔄 Rechargement configuration shell..."
    source "$SHELL_RC" 2>/dev/null || true
fi

echo "🎉 Configuration permissions terminée !"
echo "🤖 Claude Code peut maintenant travailler sans interruptions"
echo ""

# Notification sonore
echo -e "\a"

exit 0