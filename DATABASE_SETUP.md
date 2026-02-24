# 🗄️ Создание Базы Данных — Инструкция

## Проблема
Neon заблокирован в твоём регионе.

## ✅ Решение 1: Supabase (Рекомендуется)

### Шаг 1: Иди на https://supabase.com

### Шаг 2: Sign Up (через GitHub)

### Шаг 3: Create New Project
```
Name: tonhub-exchange
Database Password: [придумай пароль]
Region: Choose closest (e.g., Frankfurt)
```

### Шаг 4: Жди 2-3 минуты (создание)

### Шаг 5: Скопируй Connection String
1. Settings → Database
2. Connection string → URI
3. Копируй:
   ```
   postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-region.pooler.supabase.co:6543/postgres
   ```

### Шаг 6: Скинь мне connection string
**Или** добавь в Vercel Backend:
```
DATABASE_URL=postgresql://...
```

---

## ✅ Решение 2: Vercel Postgres (Самый простой)

### Шаг 1: Иди на https://vercel.com/new

### Шаг 2: Выбери Backend проект

### Шаг 3: Storage → Add Database → Create Database

### Шаг 4: Vercel автоматически создаст и подключит!

### Шаг 5: DATABASE_URL появится в Environment Variables

---

## ✅ Решение 3: Aiven (Бесплатный PostgreSQL)

### Шаг 1: https://aiven.io/signup

### Шаг 2: Create Service → PostgreSQL

### Шаг 3: Free Tier → Create

### Шаг 4: Скопируй Connection String

---

## 🎯 Быстрый вариант

**Просто скинь мне:**
1. Любой PostgreSQL connection string
2. Я обновлю .env и запушу

**Или** скажи "используй заглушку" — я поставлю временную БД для тестов!

---

## 📝 Временная заглушка (для тестов)

```
DATABASE_URL=postgresql://localhost:5432/tonhub_test
```

**Работать не будет, но код готов!**

---

**Что делаем?** 🤔
