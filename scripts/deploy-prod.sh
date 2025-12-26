#!/bin/bash
# Deployment script for production environment
# This script should be run on the production server

set -e  # Exit on error

echo "🚀 Starting production deployment..."

# Check if we're on the prod branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "prod" ]; then
    echo "❌ Error: Must be on prod branch to deploy to production (current: $CURRENT_BRANCH)"
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes from prod branch..."
git pull origin prod

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file from .env.example and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Backup database before deployment
echo "💾 Creating database backup..."
./scripts/backup-db.sh || echo "⚠️  Warning: Database backup failed, but continuing..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T backend python manage.py migrate --noinput

# Collect static files
echo "📦 Collecting static files..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

# Show container status
echo "✅ Deployment complete! Container status:"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Health check
echo "🏥 Performing health check..."
sleep 5
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "⚠️  Warning: Health check failed. Please verify the deployment."
fi

echo ""
echo "🌐 Application should be available at: http://localhost"
echo "📊 Check logs with: docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"

