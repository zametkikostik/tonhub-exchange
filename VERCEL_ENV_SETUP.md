# 🚀 Настройка Vercel Environment Variables

## ✅ Уже сделано:
- ✅ Frontend задеплоен: https://frontend-2tb6bfmmq-konstantins-projects-349f505f.vercel.app
- ✅ Backend задеплоен: https://backend-hb1fsrdh5-konstantins-projects-349f505f.vercel.app
- ✅ GitHub репозиторий: https://github.com/zametkikostik/tonhub-exchange

## 📋 Что нужно добавить в Vercel:

### 1. Backend Environment Variables

Иди на: https://vercel.com/konstantins-projects-349f505f/backend/settings/environment-variables

**Добавь следующие переменные:**

```
# Telegram
TELEGRAM_BOT_TOKEN=8563396312:AAHc82-WCM6VCHrMLvxxbMM90BfAKuC8dIY

# Database (Neon) - ВАЖНО: Создай базу в Neon dashboard!
# 1. Иди на https://neon.tech
# 2. Выбери проект
# 3. Создай базу: tonhub_exchange
# 4. Скопируй connection string
DATABASE_URL=postgresql://neondb_owner:npg_OLJ80ZkYDuIT@ep-divine-voice-aiw7gio7.us-east-1.aws.neon.tech/tonhub_exchange?sslmode=require

# Redis (Upstash) - Создай на https://upstash.com
# 1. Sign up
# 2. Create Database
# 3. Copy REST API URL
REDIS_URL=redis://default:YOUR_UPSTASH_TOKEN@YOUR_HOST.upstash.io:6379

# JWT Secrets (можно сгенерировать)
JWT_SECRET=tonhub-jwt-secret-key-change-this-now
JWT_REFRESH_SECRET=tonhub-refresh-secret-change-this-too
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=tonhub-encryption-key-change-this-now

# Application
NODE_ENV=production
PORT=3000
TON_NETWORK=testnet
TRADING_FEE_PERCENT=0.1
DAILY_WITHDRAWAL_LIMIT=10
MIN_DEPOSIT_TON=0.1
```

### 2. Frontend Environment Variables

Иди на: https://vercel.com/konstantins-projects-349f505f/frontend/settings/environment-variables

**Добавь:**

```
VITE_API_URL=https://backend-hb1fsrdh5-konstantins-projects-349f505f.vercel.app/api
VITE_TELEGRAM_BOT_USERNAME=TonHubExchangeBot
```

---

## 🗄️ Создание базы данных в Neon

### Шаг 1: Иди на https://neon.tech

### Шаг 2: Выбери свой проект

### Шаг 3: Создай новую базу данных
```sql
CREATE DATABASE tonhub_exchange;
```

Или через UI:
1. Databases → Create Database
2. Name: `tonhub_exchange`
3. Create

### Шаг 4: Скопируй Connection String

```
postgresql://neondb_owner:npg_OLJ80ZkYDuIT@ep-divine-voice-aiw7gio7.us-east-1.aws.neon.tech/tonhub_exchange?sslmode=require
```

### Шаг 5: Добавь в Vercel Backend

---

## 🔴 Создание Redis в Upstash

### Шаг 1: Иди на https://upstash.com

### Шаг 2: Sign Up (через GitHub)

### Шаг 3: Create Database
- Name: `tonhub-redis`
- Region: выбери ближайший
- TLS: enabled

### Шаг 4: Скопируй REST API

```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Шаг 5: Преобразуй в формат Redis URL

```
REDIS_URL=redis://default:YOUR_TOKEN@YOUR_HOST.upstash.io:6379
```

### Шаг 6: Добавь в Vercel Backend

---

## 🔄 Redeploy после добавления переменных

### Backend:
1. Иди на https://vercel.com/konstantins-projects-349f505f/backend
2. Deployments → ⋮ → Redeploy
3. Жди завершения

### Frontend:
1. Иди на https://vercel.com/konstantins-projects-349f505f/frontend
2. Deployments → ⋮ → Redeploy

---

## ✅ Проверка

### 1. Проверь Backend

```bash
curl https://backend-hb1fsrdh5-konstantins-projects-349f505f.vercel.app/health
```

Должно вернуть:
```json
{"status":"ok","timestamp":"..."}
```

### 2. Проверь API

```bash
curl https://backend-hb1fsrdh5-konstantins-projects-349f505f.vercel.app/api/trades/prices
```

### 3. Открой Frontend

https://frontend-2tb6bfmmq-konstantins-projects-349f505f.vercel.app

---

## 📱 Настройка Telegram Бота

### После того как всё работает:

1. Открой @BotFather
2. Отправь `/newapp`
3. Выбери своего бота
4. Введи URL: `https://frontend-2tb6bfmmq-konstantins-projects-349f505f.vercel.app`
5. Введи короткое название: `TonHub`

---

## 🆘 Если проблемы

### Ошибка: "Database connection failed"
- Проверь DATABASE_URL формат
- Убедись что база `tonhub_exchange` создана
- Проверь что Neon проект активен

### Ошибка: "Redis connection failed"
- Создай Redis на Upstash
- Проверь REDIS_URL формат
- Убедись что токен правильный

### Ошибка: "JWT_SECRET is required"
- Добавь JWT_SECRET в Vercel
- Минимум 32 символа
- Redeploy backend

---

## 📞 Быстрая помощь

**Просто скинь мне:**
1. Connection string из Neon (после создания базы)
2. Redis URL из Upstash (после создания)

**Я обновлю все файлы и запушу снова!**

---

**Успехов! 🚀**
