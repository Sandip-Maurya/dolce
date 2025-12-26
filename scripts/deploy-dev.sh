#!/bin/bash
# Deployment script for development environment
# This script should be run on the dev server

set -e  # Exit on error

echo "🚀 Starting development deployment..."

# Check if we're on the dev branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "dev" ]; then
    echo "⚠️  Warning: Not on dev branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pull latest changes
echo "📥 Pulling latest changes from dev branch..."
git pull origin dev

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file from .env.example and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec -T backend python manage.py migrate --noinput

# Collect static files
echo "📦 Collecting static files..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec -T backend python manage.py collectstatic --noinput || true

# Show container status
echo "✅ Deployment complete! Container status:"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

echo ""
echo "🌐 Application should be available at: http://localhost:8080"
echo "📊 Check logs with: docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f"

