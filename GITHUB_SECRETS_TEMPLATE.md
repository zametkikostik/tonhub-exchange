# GitHub Secrets Template
# Скопируй эти значения в GitHub → Settings → Secrets and variables → Actions

# Vercel Configuration
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_FRONTEND_PROJECT_ID=your-frontend-project-id
VERCEL_BACKEND_PROJECT_ID=your-backend-project-id

# Database (Neon/Supabase)
DATABASE_URL=postgresql://user:password@host.region.aws.neon.tech/tonhub_exchange?sslmode=require

# Redis (Upstash)
REDIS_URL=redis://default:password@host.region.upstash.io:6379

# Telegram
TELEGRAM_BOT_TOKEN=8563396312:AAHc82-WCM6VCHrMLvxxbMM90BfAKuC8dIY

# JWT Secrets - CHANGE THESE!
JWT_SECRET=change-this-to-random-32-character-string
JWT_REFRESH_SECRET=change-this-to-another-random-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Encryption - CHANGE THIS!
ENCRYPTION_KEY=change-this-to-32-character-random-key

# Application
TON_NETWORK=testnet
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tonhub-exchange.vercel.app
BACKEND_URL=https://tonhub-backend.vercel.app

# Trading
TRADING_FEE_PERCENT=0.1
DAILY_WITHDRAWAL_LIMIT=10
MIN_DEPOSIT_TON=0.1

# Frontend
VITE_API_URL=https://tonhub-backend.vercel.app/api
VITE_TELEGRAM_BOT_USERNAME=TonHubExchangeBot
