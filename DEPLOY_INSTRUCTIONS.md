# 🚀 TonHub Exchange — Полная Инструкция по Деплою

## Вариант 1: Автоматический деплой (Скрипты)

### Шаг 1: Создание GitHub репозитория

```bash
cd /home/kostik/tonhub-exchange

# Сделать скрипт исполняемым
chmod +x create-github-repo.sh

# Запустить скрипт
./create-github-repo.sh
```

**Скрипт спросит:**
1. Ваш GitHub username
2. Название репозитория (по умолчанию: tonhub-exchange)
3. GitHub Personal Access Token

**Как создать Personal Access Token:**
1. Идите на https://github.com/settings/tokens
2. Нажмите "Generate new token (classic)"
3. Выберите scopes: `repo`, `workflow`, `write:packages`
4. Нажмите "Generate token"
5. Скопируйте токен (покажите только один раз!)

### Шаг 2: Деплой на Vercel

```bash
# Сделать скрипт исполняемым
chmod +x deploy-to-vercel.sh

# Запустить скрипт
./deploy-to-vercel.sh
```

**Скрипт:**
1. Установит Vercel CLI (если нет)
2. Авторизует в Vercel
3. Задеплоит frontend
4. Задеплоит backend
5. Покажет URL обоих приложений

---

## Вариант 2: Ручной деплой (через веб-интерфейс)

### Шаг 1: Push в GitHub

```bash
cd /home/kostik/tonhub-exchange

# Инициализация git
git init
git add .
git commit -m "Initial commit: TonHub Exchange"
git branch -M main

# Создайте репозиторий на GitHub и запушьте:
git remote add origin https://github.com/YOUR_USERNAME/tonhub-exchange.git
git push -u origin main
```

### Шаг 2: Деплой Frontend на Vercel

1. **Идите на https://vercel.com/new**
2. **Import Git Repository**
   - Выберите ваш GitHub аккаунт
   - Найдите репозиторий `tonhub-exchange`
   - Нажмите Import

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   ```
   VITE_API_URL = https://your-backend.vercel.app/api
   VITE_TELEGRAM_BOT_USERNAME = TonHubExchangeBot
   ```

5. **Click "Deploy"**
   - Ждите 2-3 минуты
   - Запишите URL (например: https://tonhub-exchange.vercel.app)

### Шаг 3: Деплой Backend на Vercel

1. **Идите на https://vercel.com/new**
2. **Import Git Repository** (тот же репозиторий)
3. **Configure Project**
   ```
   Framework Preset: Node.js
   Root Directory: backend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   ```
   TELEGRAM_BOT_TOKEN = 8563396312:AAHc82-WCM6VCHrMLvxxbMM90BfAKuC8dIY
   DATABASE_URL = postgresql://user:pass@host:5432/dbname
   REDIS_URL = redis://default:pass@host:6379
   JWT_SECRET = your-32-char-secret
   JWT_REFRESH_SECRET = your-32-char-refresh-secret
   ENCRYPTION_KEY = your-32-char-encryption-key
   TON_NETWORK = testnet
   NODE_ENV = production
   PORT = 3000
   ```

5. **Click "Deploy"**
   - Ждите 2-3 минуты
   - Запишите URL (например: https://tonhub-backend.vercel.app)

### Шаг 4: Обновите Frontend Environment

1. **Идите в Vercel Dashboard → Frontend Project**
2. **Settings → Environment Variables**
3. **Edit VITE_API_URL**
   ```
   VITE_API_URL = https://tonhub-backend.vercel.app/api
   ```
4. **Redeploy** (Deployments → Redeploy)

---

## 🗄️ База данных (Neon)

### Создание базы данных

1. **Идите на https://neon.tech**
2. **Sign Up** (через GitHub)
3. **Create New Project**
   ```
   Project name: tonhub-exchange
   Database name: tonhub_exchange
   ```
4. **Copy Connection String**
   ```
   postgresql://user:password@host.region.aws.neon.tech/tonhub_exchange?sslmode=require
   ```
5. **Add to Vercel Backend**
   - Backend Project → Settings → Environment Variables
   - Add `DATABASE_URL` с вашим connection string

### Запуск миграций

```bash
# В Vercel Backend Dashboard
Settings → Environment Variables → Add:
DATABASE_URL=postgresql://...

# Затем в терминале локально:
cd backend
npx prisma migrate deploy
npx prisma generate
```

Или через Vercel Functions:
1. Создайте файл `backend/api/migrate.ts`
2. Запустите `https://your-backend.vercel.app/api/migrate`

---

## 🔴 Redis (Upstash)

### Создание Redis

1. **Идите на https://upstash.com**
2. **Sign Up** (через GitHub)
3. **Create Database**
   ```
   Name: tonhub-redis
   Region: choose closest
   TLS: enabled
   ```
4. **Copy REST API URL**
   ```
   UPSTASH_REDIS_REST_URL = https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN = your-token
   ```
5. **Add to Vercel Backend**
   ```
   REDIS_URL = redis://default:token@host:6379
   ```

---

## 📱 Настройка Telegram Бота

### После деплоя

1. **Откройте @BotFather в Telegram**
2. **Отправьте /newapp**
3. **Выберите вашего бота**
4. **Введите URL**
   ```
   https://tonhub-exchange.vercel.app
   ```
5. **Введите короткое название**
   ```
   TonHub Exchange
   ```
6. **Готово!**

### Проверка

1. Откройте вашего бота
2. Нажмите кнопку Menu
3. Mini App должен открыться

---

## 🔧 Проверка работы

### Чеклист

- [ ] Frontend открывается по URL
- [ ] Backend отвечает на `/health`
- [ ] Telegram Mini App открывается
- [ ] Авторизация работает
- [ ] TON Connect подключается
- [ ] Балансы отображаются
- [ ] Торговля работает

### Тестовые запросы

```bash
# Health check
curl https://your-backend.vercel.app/health

# API test
curl https://your-backend.vercel.app/api/trades/prices

# Frontend
# Просто откройте в браузере
```

---

## 🐛 Troubleshooting

### Ошибка: "Build failed"

**Frontend:**
```bash
# Проверьте логи в Vercel
# Убедитесь что VITE_API_URL установлен
# Проверьте package.json
```

**Backend:**
```bash
# Проверьте DATABASE_URL формат
# Проверьте REDIS_URL формат
# Убедитесь что все env vars установлены
```

### Ошибка: "Database connection failed"

```bash
# Проверьте DATABASE_URL
# Убедитесь что Neon проект активен
# Проверьте firewall настройки
```

### Ошибка: "Telegram auth failed"

```bash
# Проверьте TELEGRAM_BOT_TOKEN
# Убедитесь что токен актуален
# Проверьте время на сервере
```

### Mini App не открывается

```bash
# Проверьте URL в BotFather
# Очистите кэш Telegram
# Пересоздайте Mini App
```

---

## 📊 Monitoring

### Vercel Analytics

1. Backend Project → Analytics → Enable
2. Frontend Project → Analytics → Enable
3. View dashboard

### Логи

```bash
# Vercel CLI
vercel logs your-backend.vercel.app
vercel logs your-frontend.vercel.app

# Или в Dashboard
Deployments → Click on deployment → Logs
```

### Uptime Monitoring

1. **UptimeRobot**: https://uptimerobot.com
2. **Add New Monitor**
   ```
   Monitor Type: HTTP(s)
   URL: https://your-backend.vercel.app/health
   Interval: 5 minutes
   ```

---

## 💰 Стоимость

### Vercel Free Tier

- ✅ 100GB bandwidth / month
- ✅ 100GB hours build time
- ✅ Unlimited deployments
- ✅ Automatic SSL

### Neon Free Tier

- ✅ 0.5 GB storage
- ✅ 50,000 compute units / month
- ✅ Unlimited databases

### Upstash Free Tier

- ✅ 10,000 commands / day
- ✅ 256MB max memory

**Итого: $0/мес** для старта! 🎉

---

## 🎯 Post-Deployment

### 1. Обновите .env.local

```bash
# Создайте файл .env.local
cp .env.example .env.local

# Добавьте production URL
VITE_API_URL=https://your-backend.vercel.app/api
```

### 2. Добавьте домен (опционально)

**Vercel:**
1. Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed

### 3. Настройте редиректы

Создайте `vercel.json` во frontend:
```json
{
  "rewrites": [
    {"source": "/api/(.*)", "destination": "https://your-backend.vercel.app/api/$1"}
  ]
}
```

### 4. Обновите README

Добавьте badges в README.md:
```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-26A5E4?logo=telegram)](https://t.me/YourBot)
```

---

## ✅ Финальный чеклист

- [ ] GitHub репозиторий создан
- [ ] Код запушен
- [ ] Frontend задеплоен
- [ ] Backend задеплоен
- [ ] База данных создана
- [ ] Redis создан
- [ ] Environment variables добавлены
- [ ] Telegram бот настроен
- [ ] Health check проходит
- [ ] Авторизация работает
- [ ] Торговля тестируется

---

## 🎉 Готово!

Ваш TonHub Exchange теперь онлайн! 🚀

**URL:**
- Frontend: `https://tonhub-exchange.vercel.app`
- Backend: `https://tonhub-backend.vercel.app`
- Telegram: `https://t.me/TonHubExchangeBot`

**Следующие шаги:**
1. Протестируйте все функции
2. Добавьте реальные trading пары
3. Настройте мониторинг
4. Запустите маркетинг

**Удачи! 🚀**
