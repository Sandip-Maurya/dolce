#!/bin/bash
# Database backup script for PostgreSQL
# Creates a timestamped backup of the database

set -e  # Exit on error

# Load environment variables if .env exists
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Default values
DB_NAME=${DB_NAME:-dolce_db}
DB_USER=${DB_USER:-dolce_user}
BACKUP_DIR=${BACKUP_DIR:-./backups}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "💾 Creating database backup: $BACKUP_FILE"

# Create backup using docker exec
docker-compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    
    # Keep only last 7 days of backups
    echo "🧹 Cleaning up old backups (keeping last 7 days)..."
    find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" -mtime +7 -delete
    
    echo "✅ Backup complete!"
    exit 0
else
    echo "❌ Backup failed!"
    exit 1
fi

