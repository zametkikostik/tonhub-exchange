#!/bin/bash

# TonHub Exchange - Start Development Script

set -e

echo "🚀 Starting TonHub Exchange in Development Mode"
echo "==============================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run ./setup.sh first or create .env from .env.example"
    exit 1
fi

# Start Docker services
echo ""
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 3

# Start development servers
echo ""
echo "📱 Starting development servers..."
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""

npm run dev
