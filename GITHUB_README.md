# 🚀 TonHub Exchange

> Cryptocurrency exchange inside Telegram Mini Apps built on TON blockchain

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tonhub-exchange)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-26A5E4?logo=telegram)](https://t.me/TonHubExchangeBot)

---

## 📱 Live Demo

**Telegram Bot:** [@TonHubExchangeBot](https://t.me/TonHubExchangeBot)

---

## ✨ Features

- 🎯 **Telegram Mini Apps** — Seamless integration with Telegram
- 💼 **TON Connect** — Connect Tonkeeper, MyTonWallet, Tonhub
- 📊 **Spot Trading** — Trade TON/USDT, TON/BTC, NOT/TON
- 📈 **Real-time Charts** — TradingView Lightweight Charts
- 📖 **Order Book** — Live order book with WebSocket
- 💰 **Wallet** — Deposit, withdraw, track balances
- 🔐 **Secure** — JWT auth, 2FA support, encrypted data
- 🚀 **Fast** — Built with React, Vite, Node.js
- 📱 **Mobile-First** — Optimized for mobile devices
- 🌐 **SEO Optimized** — AI search ready

---

## 🏗️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TON Connect UI
- TailwindCSS
- Zustand (state management)
- TanStack Query
- React Router

### Backend
- Node.js 20 + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- Redis (Upstash)
- WebSocket (ws)
- JWT authentication

### Infrastructure
- Vercel (hosting)
- Docker (local development)
- GitHub Actions (CI/CD)

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/tonhub-exchange.git
cd tonhub-exchange
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Start Development

```bash
# Start databases
docker-compose up -d postgres redis

# Run migrations
cd backend
npx prisma migrate dev
npx prisma generate
cd ..

# Start dev servers
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 📦 Deployment

### Deploy to Vercel (Automated)

```bash
# Create GitHub repository
./create-github-repo.sh

# Deploy to Vercel
./deploy-to-vercel.sh
```

### Deploy to Vercel (Manual)

1. **Frontend:**
   - Go to https://vercel.com/new
   - Import repository
   - Root Directory: `frontend`
   - Add environment variables
   - Deploy

2. **Backend:**
   - Go to https://vercel.com/new
   - Import repository
   - Root Directory: `backend`
   - Add environment variables
   - Deploy

3. **Database:**
   - Create database on [Neon](https://neon.tech)
   - Add `DATABASE_URL` to Vercel
   - Run migrations

4. **Redis:**
   - Create database on [Upstash](https://upstash.com)
   - Add `REDIS_URL` to Vercel

5. **Telegram Bot:**
   - Open @BotFather
   - `/newapp` → Select bot
   - Enter frontend URL

📖 **Full deployment guide:** [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file |
| [QUICKSTART.md](QUICKSTART.md) | Quick start guide |
| [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md) | Deployment instructions |
| [QUICK_DEPLOY.md](QUICK_DEPLOY.md) | 5-minute deploy |
| [FEATURES_AND_LISTING_PRICES.md](FEATURES_AND_LISTING_PRICES.md) | Features & pricing |
| [ROADMAP_2026.md](ROADMAP_2026.md) | Product roadmap |
| [SEO_GUIDE.md](SEO_GUIDE.md) | SEO optimization |
| [REDESIGN_2026.md](REDESIGN_2026.md) | Design system |
| [TELEGRAM_UI_DEMO.md](TELEGRAM_UI_DEMO.md) | UI mockups |

---

## 🔧 Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend.vercel.app/api
VITE_TELEGRAM_BOT_USERNAME=TonHubExchangeBot
```

### Backend (.env)
```bash
TELEGRAM_BOT_TOKEN=8563396312:AAHc82-WCM6VCHrMLvxxbMM90BfAKuC8dIY
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
JWT_SECRET=your-secret-32-chars
JWT_REFRESH_SECRET=your-refresh-secret
ENCRYPTION_KEY=your-encryption-key
TON_NETWORK=testnet
NODE_ENV=production
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/telegram` — Login with Telegram
- `POST /api/auth/refresh` — Refresh token
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user

### Trading
- `POST /api/orders` — Create order
- `GET /api/orders/:id` — Get order
- `DELETE /api/orders/:id` — Cancel order
- `GET /api/trades/orderbook/:pair` — Get order book
- `GET /api/trades/:pair` — Get recent trades
- `GET /api/trades/prices` — Get prices

### Wallet
- `POST /api/wallet/deposit/address` — Get deposit address
- `POST /api/wallet/withdraw` — Create withdrawal
- `GET /api/wallet/history` — Transaction history

📖 **Full API docs:** See backend/routes

---

## 🎨 UI Preview

![TonHub Exchange UI](https://via.placeholder.com/800x450.png?text=TonHub+Exchange+UI)

*Modern, sleek design with dark theme, gradient cards, and glassmorphism effects*

---

## 📈 Roadmap

### Q1 2026 (Launch)
- ✅ MVP with spot trading
- ✅ Telegram Mini Apps
- ✅ TON Connect
- ⏳ 2FA, Price Alerts
- ⏳ Referral program

### Q2 2026 (Growth)
- Trading bots (Grid, DCA)
- Staking
- Multi-language support
- Mobile apps

### Q3 2026 (Scale)
- Margin trading
- Futures
- NFT marketplace
- Launchpad

📖 **Full roadmap:** [ROADMAP_2026.md](ROADMAP_2026.md)

---

## 💰 Pricing & Listing

### Token Listing

| Tier | Price | Features |
|------|-------|----------|
| Community | $1K-5K | 1 pair, voting |
| Standard | $5K-15K | 1 pair, 5 days |
| Premium | $25K-50K | 3 pairs, marketing |
| Enterprise | $100K-250K | ∞ pairs, VIP |

📖 **Full pricing:** [FEATURES_AND_LISTING_PRICES.md](FEATURES_AND_LISTING_PRICES.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👥 Team

- Built with ❤️ by TonHub Team
- Telegram: [@TonHubExchange](https://t.me/TonHubExchange)
- Twitter: [@TonHubExchange](https://twitter.com/TonHubExchange)

---

## 🙏 Acknowledgments

- [TON Foundation](https://ton.org)
- [Telegram](https://telegram.org)
- [Vercel](https://vercel.com)
- [Neon](https://neon.tech)
- [Upstash](https://upstash.com)

---

## 📞 Support

- **Telegram:** [@TonHubSupport](https://t.me/TonHubSupport)
- **Email:** support@tonhub.exchange
- **Docs:** https://docs.tonhub.exchange

---

**Happy Trading! 🚀**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tonhub-exchange)
