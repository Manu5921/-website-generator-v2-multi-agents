#!/bin/bash

# 🚀 Lancement Simultané des 4 Agents - Chef d'Orchestre
# Script pour démarrer tous les agents en parallèle

echo "🚀 Lancement Architecture Multi-Agents..."
echo "========================================"

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
# 🎼 FONCTION DE LANCEMENT AGENT
# =============================================================================

start_agent() {
    local agent_name=$1
    local agent_path=$2
    local port=$3
    local color=$4
    
    echo ""
    echo "🚀 Lancement $agent_name (Port $port)..."
    
    if [ -d "$agent_path" ]; then
        cd "$agent_path"
        
        # Créer le fichier de log
        log_file="$PROJECT_ROOT/logs/agent-$(echo $agent_name | tr ' ' '-' | tr '[:upper:]' '[:lower:]').log"
        
        # Lancer l'agent en arrière-plan
        npm run dev > "$log_file" 2>&1 &
        local pid=$!
        
        echo "  ✅ $agent_name démarré (PID: $pid)"
        echo "  📊 Port: $port | Couleur: $color"
        echo "  📝 Logs: $log_file"
        
        # Sauvegarder le PID
        echo "$pid" > "$PROJECT_ROOT/logs/$(echo $agent_name | tr ' ' '-' | tr '[:upper:]' '[:lower:]').pid"
        
        cd "$PROJECT_ROOT"
    else
        echo "  ❌ Dossier non trouvé: $agent_path"
    fi
}

# =============================================================================
# 🚀 LANCEMENT SÉQUENTIEL DES AGENTS
# =============================================================================

echo "🎼 Démarrage depuis le Chef d'Orchestre..."

# Créer dossier logs
mkdir -p "$PROJECT_ROOT/logs"

# Agent 1: Design IA (Priorité Critique)
start_agent "🎨 Design IA" "$DESIGN_AI_PATH" "3335" "Rouge"
sleep 2

# Agent 2: Automation (Priorité Haute) 
start_agent "🤖 Automation" "$AUTOMATION_PATH" "3336" "Bleu"
sleep 2

# Agent 3: Ads Management (Priorité Moyenne)
start_agent "📊 Ads Management" "$ADS_PATH" "3337" "Vert"
sleep 2

# Agent 4: Core Platform (Priorité Moyenne)
start_agent "💎 Core Platform" "$CORE_PATH" "3338" "Violet"
sleep 2

# Chef d'Orchestre (Supervision)
echo ""
echo "🎼 Lancement Chef d'Orchestre (Port 3334)..."
cd "$PROJECT_ROOT"
npm run dev > "$PROJECT_ROOT/logs/orchestrator.log" 2>&1 &
orchestrator_pid=$!
echo "$orchestrator_pid" > "$PROJECT_ROOT/logs/orchestrator.pid"
echo "  ✅ Chef d'Orchestre actif (PID: $orchestrator_pid)"

# =============================================================================
# 📊 STATUT FINAL
# =============================================================================

echo ""
echo "🎉 Architecture Multi-Agents Lancée !"
echo "====================================="
echo ""
echo "🌐 URLs Actives:"
echo "  🎼 Chef d'Orchestre:  http://localhost:3334"
echo "  🎨 Design IA:         http://localhost:3335" 
echo "  🤖 Automation:        http://localhost:3336"
echo "  📊 Ads Management:    http://localhost:3337"
echo "  💎 Core Platform:     http://localhost:3338"
echo ""
echo "📝 Logs en temps réel:"
echo "  tail -f logs/orchestrator.log"
echo "  tail -f logs/🎨-design-ia.log"
echo "  tail -f logs/🤖-automation.log"
echo "  tail -f logs/📊-ads-management.log"
echo ""
echo "⚡ Commandes utiles:"
echo "  ./scripts/status-agents.sh    # Statut des agents"
echo "  ./scripts/stop-agents.sh      # Arrêt tous agents"
echo "  ./scripts/restart-agent.sh    # Redémarrage agent"
echo ""

# =============================================================================
# 🔔 MONITORING CONTINU
# =============================================================================

echo "🔄 Surveillance continue des agents..."
echo "Appuyez sur Ctrl+C pour arrêter le monitoring"
echo ""

# Fonction de surveillance
monitor_agents() {
    while true; do
        sleep 30
        
        echo "📊 Status $(date '+%H:%M:%S'):"
        
        # Vérifier chaque agent
        agents=("orchestrator:3334" "design-ai:3335" "automation:3336" "ads-management:3337" "core-platform:3338")
        
        for agent in "${agents[@]}"; do
            name=$(echo $agent | cut -d: -f1)
            port=$(echo $agent | cut -d: -f2)
            
            if curl -s "http://localhost:$port" > /dev/null 2>&1; then
                echo "  ✅ $name (port $port)"
            else
                echo "  ❌ $name (port $port) - OFFLINE"
            fi
        done
        
        echo ""
    done
}

# Lancer le monitoring en arrière-plan
monitor_agents &
monitor_pid=$!

# Attendre interruption
wait $monitor_pid

echo ""
echo "🔔 Monitoring arrêté"
echo "💡 Utilisez ./scripts/stop-agents.sh pour arrêter tous les agents"
echo ""

# Notification sonore
echo -e "\a"

exit 0