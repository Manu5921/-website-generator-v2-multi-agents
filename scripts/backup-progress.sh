#!/bin/bash

# 🔄 Script de Backup Automatique - Agents Progress
# Sauvegarde AGENTS_PROGRESS.md et CLAUDE.md toutes les 30 minutes

PROJECT_ROOT="/Users/manu/Documents/DEV/website-generator-v2-multi-agents-clean"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Créer dossier backup
mkdir -p "$BACKUP_DIR"

# Fonction de backup
create_backup() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    
    echo "🔄 [$(date '+%H:%M:%S')] Création backup..."
    
    # Backup AGENTS_PROGRESS.md
    if [ -f "$PROJECT_ROOT/AGENTS_PROGRESS.md" ]; then
        cp "$PROJECT_ROOT/AGENTS_PROGRESS.md" "$BACKUP_DIR/AGENTS_PROGRESS_$timestamp.md"
        echo "  ✅ AGENTS_PROGRESS.md → backups/AGENTS_PROGRESS_$timestamp.md"
    fi
    
    # Backup CLAUDE.md
    if [ -f "$PROJECT_ROOT/CLAUDE.md" ]; then
        cp "$PROJECT_ROOT/CLAUDE.md" "$BACKUP_DIR/CLAUDE_$timestamp.md"
        echo "  ✅ CLAUDE.md → backups/CLAUDE_$timestamp.md"
    fi
    
    # Nettoyer anciens backups (garder 48h = 96 backups max)
    find "$BACKUP_DIR" -name "*.md" -mtime +2 -delete 2>/dev/null
    
    local backup_count=$(ls -1 "$BACKUP_DIR"/*.md 2>/dev/null | wc -l)
    echo "  📊 Total backups: $backup_count fichiers"
}

# Mode daemon (toutes les 30 minutes)
if [ "$1" = "daemon" ]; then
    echo "🚀 Démarrage backup daemon (1h intervals)"
    echo "💾 Backups dans: $BACKUP_DIR"
    echo "⏰ Ctrl+C pour arrêter"
    echo ""
    
    while true; do
        create_backup
        echo "  ⏱️  Prochaine sauvegarde dans 1 heure..."
        echo ""
        sleep 3600  # 1 heure
    done
else
    # Mode unique
    create_backup
    echo "💡 Pour backup automatique: ./scripts/backup-progress.sh daemon &"
fi