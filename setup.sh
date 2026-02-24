#!/bin/bash

# TonHub Exchange - Setup Script

set -e

echo "🚀 TonHub Exchange - Setup"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Some features may not work."
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create logs directory
mkdir -p logs

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration!"
fi

# Start Docker services (PostgreSQL and Redis)
echo ""
echo "🐳 Starting Docker services (PostgreSQL, Redis)..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env with your configuration"
echo "   2. Run 'npm run dev' to start development servers"
echo "   3. Open http://localhost:5173 in your browser"
echo ""
