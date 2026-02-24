# ⚡ TonHub Exchange — Быстрый Деплой (5 минут)

## 🚀 Способ 1: Автоматический (Скрипты)

### Команда 1: Создание GitHub репозитория

```bash
cd /home/kostik/tonhub-exchange
./create-github-repo.sh
```

**Введите:**
1. GitHub username
2. Repo name (tonhub-exchange)
3. GitHub Personal Access Token

**Token создать:** https://github.com/settings/tokens
- Scopes: `repo`, `workflow`

---

### Команда 2: Деплой на Vercel

```bash
./deploy-to-vercel.sh
```

**Автоматически:**
- Установит Vercel CLI
- Авторизует
- Задеплоит frontend
- Задеплоит backend
- Покажет URL

---

## 🎯 Способ 2: Ручной (Быстро)

### 1. Push в GitHub

```bash
cd /home/kostik/tonhub-exchange
git init
git add .
git commit -m "TonHub Exchange"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tonhub-exchange.git
git push -u origin main
```

### 2. Деплой Frontend

1. https://vercel.com/new
2. Import GitHub repository
3. Root: `frontend`
4. Env vars:
   ```
   VITE_API_URL = https://your-app.vercel.app/api
   VITE_TELEGRAM_BOT_USERNAME = TonHubExchangeBot
   ```
5. Deploy

### 3. Деплой Backend

1. https://vercel.com/new (ещё раз)
2. Import тот же repository
3. Root: `backend`
4. Env vars:
   ```
   TELEGRAM_BOT_TOKEN = 8563396312:AAHc82-WCM6VCHrMLvxxbMM90BfAKuC8dIY
   DATABASE_URL = postgresql://... (из Neon)
   REDIS_URL = redis://... (из Upstash)
   JWT_SECRET = random-32-chars
   JWT_REFRESH_SECRET = random-32-chars
   ENCRYPTION_KEY = random-32-chars
   TON_NETWORK = testnet
   NODE_ENV = production
   ```
5. Deploy

### 4. База данных (Neon)

1. https://neon.tech → Sign Up
2. Create Project → `tonhub_exchange`
3. Copy Connection String
4. Add to Vercel Backend → `DATABASE_URL`
5. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

### 5. Redis (Upstash)

1. https://upstash.com → Sign Up
2. Create Database
3. Copy REST URL
4. Add to Vercel Backend → `REDIS_URL`

### 6. Telegram Бот

1. @BotFather → `/newapp`
2. Выбрать бота
3. URL: `https://your-frontend.vercel.app`
4. Готово!

---

## ✅ Проверка

```bash
# Backend health
curl https://your-backend.vercel.app/health

# Frontend
# Откройте в браузере: https://your-frontend.vercel.app

# Telegram
# Откройте бота и нажмите Menu
```

---

## 📁 Файлы для деплоя

| Файл | Описание |
|------|----------|
| `create-github-repo.sh` | Создание GitHub repo |
| `deploy-to-vercel.sh` | Деплой на Vercel |
| `DEPLOY_INSTRUCTIONS.md` | Полная инструкция |
| `.env.vercel` | Шаблон env для Vercel |

---

## 🆘 Помощь

Если что-то не работает:

1. Проверьте логи в Vercel Dashboard
2. Убедитесь что все env vars установлены
3. Проверьте DATABASE_URL и REDIS_URL
4. Перезадеплойте (Vercel → Deployments → Redeploy)

---

## 🎉 Готово!

**Frontend:** https://your-frontend.vercel.app  
**Backend:** https://your-backend.vercel.app  
**Telegram:** https://t.me/TonHubExchangeBot

**Удачи! 🚀**
