#!/bin/bash
# Deploy to Production (dolcefiore.in) - CloudFront + Lightsail (No Nginx)
# Run this script on your production Lightsail instance

set -e

COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudfront.yml -f docker-compose.ghcr-prod.yml"

echo "🚀 Deploying to PRODUCTION (dolcefiore.in)..."
echo "📦 Architecture: CloudFront → Django:8000 + Next.js:3000 (No Nginx)"
echo ""

# Safety check
read -p "⚠️  Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

# Navigate to project directory
cd ~/dolce

# Pull latest code from prod branch
echo "📥 Pulling latest code from prod branch..."
git fetch origin
git checkout prod
git pull origin prod

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
echo "✅ Production deployment complete!"
echo "🌐 Site: https://dolcefiore.in"
echo "🔧 Admin: https://dolcefiore.in/admin"
