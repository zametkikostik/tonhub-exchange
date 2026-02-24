#!/bin/bash

# TonHub Exchange - Start Production Script (Docker)

set -e

echo "🚀 Starting TonHub Exchange in Production Mode"
echo "=============================================="

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    echo "❌ .env.docker file not found."
    exit 1
fi

# Build and start all services
echo ""
echo "🐳 Building and starting all services..."
docker-compose up -d --build

echo ""
echo "✅ TonHub Exchange is running!"
echo ""
echo "📝 Services:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3000"
echo "   PostgreSQL: localhost:5432"
echo "   Redis:     localhost:6379"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart:       docker-compose restart"
echo ""
