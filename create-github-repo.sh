#!/bin/bash

# TonHub Exchange — GitHub Repository Setup Script
# Автоматическое создание репозитория и пуш кода

set -e

echo "🚀 TonHub Exchange — GitHub Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install git first.${NC}"
    exit 1
fi

echo -e "${BLUE}📝 GitHub Configuration${NC}"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter repository name (default: tonhub-exchange): " REPO_NAME
REPO_NAME=${REPO_NAME:-tonhub-exchange}

echo ""
echo -e "${YELLOW}Repository will be created at:${NC}"
echo "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo ""

# Confirm
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Aborted${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Initializing Git repository...${NC}"

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

# Create .gitignore if not exists
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/
package-lock.json

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
!.env.example
!.env.docker
!.env.vercel

# Build outputs
dist/
build/
*.local

# OS
.DS_Store
Thumbs.db
*.swp
*.swo
*~

# IDE
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Database
*.db
*.sqlite
*.sqlite3
prisma/migrations/

# Testing
coverage/
.nyc_output/

# TON
.ton/

# Secrets
*.key
*.pem
*.crt
secrets/

# Docker
docker-data/

# Vercel
.vercel

# Shell scripts (keep them)
!*.sh

# GitHub Actions
.github/
EOF
    echo "✅ .gitignore created"
fi

echo ""
echo -e "${BLUE}📋 Adding files to git...${NC}"
git add .
echo "✅ Files added"

echo ""
echo -e "${BLUE}💾 Creating initial commit...${NC}"
git commit -m "🎉 Initial commit: TonHub Exchange - Crypto Exchange for Telegram

Features:
- Telegram Mini Apps integration
- TON Connect wallet support
- Spot trading (TON/USDT, TON/BTC, NOT/TON)
- Real-time order book via WebSocket
- Trading charts with Lightweight Charts
- Wallet management (deposit/withdraw)
- JWT authentication
- SEO optimized
- Vercel ready
- AI search optimized

Tech Stack:
- Frontend: React 18 + Vite + TypeScript + TailwindCSS
- Backend: Node.js + Express + Prisma + PostgreSQL
- Infrastructure: Docker, Redis, Vercel
"
echo "✅ Initial commit created"

echo ""
echo -e "${BLUE}📌 Creating main branch...${NC}"
git branch -M main
echo "✅ Main branch created"

echo ""
echo -e "${YELLOW}🔐 GitHub Authentication${NC}"
echo ""
echo "Please create a Personal Access Token (PAT) on GitHub:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Select scopes: repo, workflow, write:packages"
echo "4. Generate token and copy it"
echo ""

read -p "Enter your GitHub Personal Access Token: " -s GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Token is required${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📤 Creating repository on GitHub...${NC}"

# Create repository using GitHub API
curl -X POST \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"${REPO_NAME}\",\"description\":\"TonHub Exchange - Cryptocurrency trading on TON blockchain via Telegram Mini Apps\",\"private\":false,\"auto_init\":false}"

if [ $? -eq 0 ]; then
    echo "✅ Repository created on GitHub"
else
    echo -e "${RED}❌ Failed to create repository. Make sure your token is valid.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔗 Adding remote origin...${NC}"
git remote add origin https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git
echo "✅ Remote added"

echo ""
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo "✅ Code pushed to GitHub"
else
    echo -e "${RED}❌ Failed to push code${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Success!${NC}"
echo ""
echo "📦 Repository URL:"
echo "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo ""
echo "🎯 Next steps:"
echo "1. ⭐ Star your repository"
echo "2. 📝 Update README.md with your information"
echo "3. 🔗 Connect to Vercel for deployment"
echo "4. 📝 Add environment variables on Vercel"
echo ""
echo "🚀 Deploy to Vercel:"
echo "   1. Go to https://vercel.com/new"
echo "   2. Import your GitHub repository"
echo "   3. Configure and deploy!"
echo ""

# Save credentials for later use
cat > .github_credentials << EOF
# GitHub Credentials (DO NOT COMMIT THIS FILE!)
GITHUB_USERNAME=${GITHUB_USERNAME}
REPO_NAME=${REPO_NAME}
REPO_URL=https://github.com/${GITHUB_USERNAME}/${REPO_NAME}
EOF

echo -e "${YELLOW}⚠️  Important:${NC}"
echo ".github_credentials file created with your credentials"
echo "This file is in .gitignore - DO NOT commit it!"
echo ""
