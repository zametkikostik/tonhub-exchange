#!/bin/bash

# TonHub Exchange — Vercel Deployment Script
# Автоматический деплой на Vercel

set -e

echo "🚀 TonHub Exchange — Vercel Deployment"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI is not installed${NC}"
    echo ""
    read -p "Install Vercel CLI now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📦 Installing Vercel CLI...${NC}"
        npm install -g vercel
        echo "✅ Vercel CLI installed"
    else
        echo -e "${RED}❌ Vercel CLI is required for this script${NC}"
        echo "Alternative: Deploy manually at https://vercel.com/new"
        exit 1
    fi
fi

echo -e "${BLUE}🔐 Vercel Authentication${NC}"
echo ""

# Login to Vercel
vercel login

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Vercel login failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Logged in to Vercel${NC}"

echo ""
echo -e "${BLUE}📁 Deploying Frontend...${NC}"
echo ""

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ frontend directory not found${NC}"
    exit 1
fi

cd frontend

# Deploy frontend
echo -e "${YELLOW}Starting frontend deployment...${NC}"
vercel --prod

if [ $? -eq 0 ]; then
    FRONTEND_URL=$(vercel --prod | grep -o 'https://[^ ]*' | head -1)
    echo -e "${GREEN}✅ Frontend deployed: ${FRONTEND_URL}${NC}"
else
    echo -e "${RED}❌ Frontend deployment failed${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${BLUE}📁 Deploying Backend...${NC}"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ backend directory not found${NC}"
    exit 1
fi

cd backend

# Deploy backend
echo -e "${YELLOW}Starting backend deployment...${NC}"
vercel --prod

if [ $? -eq 0 ]; then
    BACKEND_URL=$(vercel --prod | grep -o 'https://[^ ]*' | head -1)
    echo -e "${GREEN}✅ Backend deployed: ${BACKEND_URL}${NC}"
else
    echo -e "${RED}❌ Backend deployment failed${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "📱 Frontend URL: ${FRONTEND_URL}"
echo "🔧 Backend URL: ${BACKEND_URL}"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo ""
echo "1. Add environment variables on Vercel:"
echo "   Frontend:"
echo "   - VITE_API_URL=${BACKEND_URL}/api"
echo "   - VITE_TELEGRAM_BOT_USERNAME=TonHubExchangeBot"
echo ""
echo "   Backend:"
echo "   - TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN"
echo "   - DATABASE_URL=your-database-url"
echo "   - REDIS_URL=your-redis-url"
echo "   - JWT_SECRET=your-secret"
echo "   - JWT_REFRESH_SECRET=your-refresh-secret"
echo "   - ENCRYPTION_KEY=your-encryption-key"
echo "   - TON_NETWORK=testnet"
echo "   - NODE_ENV=production"
echo ""
echo "2. Setup database (Neon/Supabase):"
echo "   - Create PostgreSQL database"
echo "   - Run migrations: npx prisma migrate deploy"
echo ""
echo "3. Setup Redis (Upstash):"
echo "   - Create Redis database"
echo "   - Add REDIS_URL to Vercel"
echo ""
echo "4. Configure Telegram Bot:"
echo "   - Open @BotFather"
echo "   - /newapp → Select bot"
echo "   - Enter URL: ${FRONTEND_URL}"
echo ""
echo "5. Test the application:"
echo "   - Open Telegram bot"
echo "   - Click Menu button"
echo "   - Test all features"
echo ""

# Save deployment info
cat > .deployment_info << EOF
# Deployment Information (DO NOT COMMIT!)
DEPLOYED_AT=$(date -Iseconds)
FRONTEND_URL=${FRONTEND_URL}
BACKEND_URL=${BACKEND_URL}
EOF

echo -e "${YELLOW}💾 Deployment info saved to .deployment_info${NC}"
echo ""
echo "🎉 Happy Trading! 🚀"
echo ""
