# 🚀 TonHub Exchange - Quick Start Guide

## Быстрый старт

### 1. Установка зависимостей

```bash
cd tonhub-exchange

# Установить все зависимости
npm install

# Или использовать setup скрипт
./setup.sh
```

### 2. Настройка окружения

```bash
# Скопировать пример .env файла
cp .env.example .env

# Отредактировать .env с вашими настройками
# Минимальные требования:
# - TELEGRAM_BOT_TOKEN (уже настроен)
# - DATABASE_URL
# - REDIS_URL
# - JWT_SECRET (измените в production!)
```

### 3. Запуск баз данных (Docker)

```bash
# Запустить PostgreSQL и Redis
docker-compose up -d postgres redis

# Проверить статус
docker-compose ps
```

### 4. Миграции базы данных

```bash
cd backend

# Применить миграции
npx prisma migrate dev

# Сгенерировать Prisma клиент
npx prisma generate

# Вернуться в корень
cd ..
```

### 5. Запуск в режиме разработки

```bash
# Запустить frontend и backend одновременно
npm run dev

# Или использовать скрипт
./start-dev.sh
```

Доступ:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

### 6. Запуск в production (Docker)

```bash
# Собрать и запустить все сервисы
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановить
docker-compose down
```

## 📱 Настройка Telegram Mini App

### 1. Создание бота

1. Откройте [@BotFather](https://t.me/botfather)
2. Создайте нового бота: `/newbot`
3. Получите токен (уже есть в `.env`)

### 2. Настройка Mini App

1. В BotFather: `/newapp`
2. Выберите вашего бота
3. Введите URL: `https://your-domain.com` (или ngrok URL для локальной разработки)
4. Введите короткое название для кнопки

### 3. Локальная разработка с ngrok

```bash
# Установить ngrok (если нет)
# https://ngrok.com/download

# Запустить frontend
npm run dev:frontend

# В другом терминале запустить ngrok
ngrok http 5173

# Скопировать https URL и добавить в BotFather
```

## 🔧 Полезные команды

### Backend

```bash
# Запустить backend в dev режиме
npm run dev:backend

# Запустить миграции
npm run db:migrate

# Открыть Prisma Studio
npm run db:studio

# Собрать backend
npm run build:backend
```

### Frontend

```bash
# Запустить frontend в dev режиме
npm run dev:frontend

# Собрать frontend
npm run build:frontend

# Preview production сборки
npm run preview
```

### Docker

```bash
# Запустить все сервисы
docker-compose up -d

# Остановить все сервисы
docker-compose down

# Пересобрать сервисы
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f backend

# Очистить всё (включая volumes)
docker-compose down -v
```

## 🧪 Тестирование API

### Получить токен (через Telegram WebApp)

```javascript
// В консоли браузера в Telegram Mini App
const initData = window.Telegram.WebApp.initData;
console.log(initData);
```

### curl примеры

```bash
# Auth (замените initData на реальный)
curl -X POST http://localhost:3000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData": "query_id=...&user=...&hash=..."}'

# Get balances (замените TOKEN на ваш токен)
curl http://localhost:3000/api/user/balances \
  -H "Authorization: Bearer TOKEN"

# Get order book
curl http://localhost:3000/api/trades/orderbook/TON/USDT

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pair": "TON/USDT",
    "side": "buy",
    "type": "limit",
    "price": "5.00",
    "quantity": "10"
  }'
```

## 🐛 Troubleshooting

### Ошибка подключения к базе данных

```bash
# Проверить, запущен ли PostgreSQL
docker-compose ps postgres

# Перезапустить PostgreSQL
docker-compose restart postgres

# Проверить логи
docker-compose logs postgres
```

### Ошибка миграций

```bash
# Сбросить базу данных (ОСТОРОЖНО: удалит все данные!)
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

### Порт уже занят

```bash
# Найти процесс на порту 3000
lsof -i :3000

# Убить процесс
kill -9 <PID>
```

## 📊 Мониторинг

```bash
# Статус всех сервисов
docker-compose ps

# Использование ресурсов
docker stats

# Логи backend
docker-compose logs -f backend

# Логи PostgreSQL
docker-compose logs -f postgres
```

## 📝 Следующие шаги

1. ✅ Настроить Telegram бота
2. ✅ Протестировать авторизацию
3. ✅ Подключить TON кошелек
4. ✅ Создать тестовый ордер
5. ✅ Протестировать депозит/вывод

## 🆘 Поддержка

Если возникли проблемы:
1. Проверьте логи: `docker-compose logs -f`
2. Проверьте `.env` конфигурацию
3. Убедитесь, что все сервисы запущены
4. Откройте issue в репозитории

---

**Ready to trade! 🚀**
