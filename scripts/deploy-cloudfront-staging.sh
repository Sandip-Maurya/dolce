#!/bin/bash
# Deploy to Staging (kakshaonline.com) - CloudFront + Lightsail (No Nginx)
# Run this script on your staging Lightsail instance

set -e

COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudfront.yml -f docker-compose.ghcr.yml"

echo "🚀 Deploying to STAGING (kakshaonline.com)..."
echo "📦 Architecture: CloudFront → Django:8000 + Next.js:3000 (No Nginx)"
echo ""

# Navigate to project directory
cd ~/dolce

# Pull latest code from dev branch
echo "📥 Pulling latest code from dev branch..."
git fetch origin
git checkout dev
git pull origin dev

# Pull latest Docker images from GHCR
echo "🐳 Pulling Docker images from GHCR..."
$COMPOSE_CMD pull

# Start/restart services
echo "🔄 Starting services..."
$COMPOSE_CMD up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service status (should show: db, backend, frontend-next):"
$COMPOSE_CMD ps

# Verify services are accessible
echo ""
echo "🔍 Verifying services..."
echo -n "  Next.js (3000): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "FAILED"
echo ""
echo -n "  Django (8000):  "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/admin/ || echo "FAILED"
echo ""

# Show recent logs
echo ""
echo "📋 Recent logs (last 10 lines):"
$COMPOSE_CMD logs --tail=10

echo ""
echo "✅ Staging deployment complete!"
echo "🌐 Site: https://kakshaonline.com"
echo "🔧 Admin: https://kakshaonline.com/admin"
