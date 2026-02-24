# 🚀 TonHub Exchange

Cryptocurrency exchange inside Telegram Mini Apps built on TON blockchain.

## 📋 Features

- **Telegram Mini Apps Integration** - Seamless authentication via Telegram WebApp
- **TON Connect** - Connect TON wallets (Tonkeeper, MyTonWallet, etc.)
- **Spot Trading** - Buy and sell crypto with limit/market orders
- **Real-time Order Book** - Live order book with WebSocket updates
- **Trading Charts** - Price charts with TradingView Lightweight Charts
- **Wallet Management** - Deposit, withdraw, and track transactions
- **Order History** - Track all your trades and orders
- **Referral System** - Multi-level referral program

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Telegram App   │────▶│   Frontend      │
│  (Mini Apps)    │     │   (React+Vite)  │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   Nginx         │
                        │   (Reverse Proxy)│
                        └────────┬────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
     │   Backend API  │ │   PostgreSQL   │ │     Redis      │
     │   (Node.js)    │ │   (Database)   │ │   (Cache)      │
     └────────────────┘ └────────────────┘ └────────────────┘
              │
              ▼
     ┌────────────────┐
     │   TON Network  │
     │   (Blockchain) │
     └────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TON Connect UI
- TailwindCSS
- Zustand (state management)
- TanStack Query (data fetching)
- React Router

### Backend
- Node.js 20 + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis
- WebSocket (ws)
- JWT authentication

### Infrastructure
- Docker + Docker Compose
- Nginx (reverse proxy)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm or pnpm

### 1. Clone Repository

```bash
git clone <repository-url>
cd tonhub-exchange
```

### 2. Setup Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit with your values
# IMPORTANT: Change JWT secrets and encryption key in production!
```

### 3. Development Mode

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api

### 4. Production Mode (Docker)

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📱 Telegram Bot Setup

1. Create a new bot via [@BotFather](https://t.me/botfather)
2. Get your bot token and add to `.env`
3. Configure Mini App URL:
   ```
   /setmenubutton -> Select bot -> Enter URL: https://your-domain.com
   ```
4. For local development, use ngrok:
   ```bash
   ngrok http 5173
   ```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/telegram` - Login with Telegram
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### User
- `GET /api/user/balances` - Get balances
- `GET /api/user/profile` - Get profile
- `GET /api/user/orders` - Get orders
- `GET /api/user/transactions` - Get transactions

### Trading
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order
- `DELETE /api/orders/:id` - Cancel order
- `GET /api/trades/orderbook/:pair` - Get order book
- `GET /api/trades/:pair` - Get recent trades
- `GET /api/trades/prices` - Get current prices

### Wallet
- `POST /api/wallet/deposit/address` - Get deposit address
- `POST /api/wallet/withdraw` - Create withdrawal
- `GET /api/wallet/history` - Get transaction history

## 🔒 Security

- JWT authentication with refresh tokens
- Telegram WebApp initData validation
- Rate limiting (100 req/min per user)
- Withdrawal whitelist
- 2FA support (TOTP)
- Encrypted sensitive data

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📄 Project Structure

```
tonhub-exchange/
├── backend/
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── utils/        # Utilities
│   │   └── index.ts      # Entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── store/        # Zustand stores
│   │   ├── api/          # API client
│   │   └── main.tsx      # Entry point
│   └── Dockerfile
├── shared/
│   └── src/
│       └── types.ts      # Shared TypeScript types
├── docker/
│   └── nginx/
│       └── nginx.conf    # Nginx configuration
├── docker-compose.yml
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | - |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `TON_NETWORK` | TON network (testnet/mainnet) | testnet |
| `TRADING_FEE_PERCENT` | Trading fee percentage | 0.1 |
| `DAILY_WITHDRAWAL_LIMIT` | Daily withdrawal limit | 10 |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

- Telegram: [@TonHubSupport](https://t.me/tonhubsupport)
- Email: support@tonhub.exchange

---

**⚠️ Disclaimer:** This is a demonstration project. Use at your own risk. Always do your own research before deploying cryptocurrency exchange software.
