# 🔐 GitHub Token Инструкция

## Проблема
Токен для GitHub устарел или недействителен.

## Решение

### Шаг 1: Создай новый Personal Access Token

1. **Иди на:** https://github.com/settings/tokens
2. **Нажми:** "Generate new token (classic)"
3. **Введи Note:** `TonHub Exchange Deployment`
4. **Выбери Scopes (обязательно отметь):**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages to GitHub Package Registry)
   - ✅ `user` (Read user profile data)
5. **Нажми:** "Generate token"
6. **Скопируй токен** (он покажется только один раз!)
   - Формат: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Шаг 2: Сохрани токен

**Вариант A: Вставить в команду push**

```bash
cd /home/kostik/tonhub-exchange

# Замени YOUR_TOKEN на свой токен
git remote set-url origin https://zametkikostik:YOUR_TOKEN@github.com/zametkikostik/tonhub-exchange.git

# Теперь пуш
git push -u origin main --force
```

**Вариант B: Использовать Git Credential Manager**

```bash
# Очисти текущие.credentials
git config --global --unset credential.helper

# Сделай push - Git спросит логин/пароль
git push -u origin main --force

# Введи:
# Username: zametkikostik
# Password: YOUR_TOKEN (вставь токен)
```

### Шаг 3: Проверь

```bash
# Проверь remote
git remote -v

# Должно быть:
# origin  https://zametkikostik:ghp_...@github.com/zametkikostik/tonhub-exchange.git
```

---

## 🚀 После успешного пуша

### 1. Деплой на Vercel

**Вариант A: Автоматически (скрипт)**

```bash
cd /home/kostik/tonhub-exchange
./deploy-to-vercel.sh
```

**Вариант B: Вручную**

1. Иди на https://vercel.com/new
2. Import GitHub repository
3. Выбери `tonhub-exchange`
4. Deploy Frontend (Root: `frontend`)
5. Deploy Backend (Root: `backend`)

### 2. База данных (Neon)

1. https://neon.tech → Sign Up
2. Create Project: `tonhub_exchange`
3. Copy Connection String
4. Add to Vercel Backend Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   ```

### 3. Redis (Upstash)

1. https://upstash.com → Sign Up
2. Create Database
3. Copy REST URL
4. Add to Vercel Backend:
   ```
   REDIS_URL=redis://...
   ```

### 4. Telegram Bot

1. @BotFather → `/newapp`
2. Select bot
3. Enter URL: `https://your-frontend.vercel.app`
4. Готово!

---

## 📞 Если проблемы

### Ошибка: "Invalid username or token"

- Токен устарел → создай новый
- Неправильный username → проверь `zametkikostik`

### Ошибка: "Authentication failed"

```bash
# Очисти credentials
git config --global --unset credential.helper

# Попробуй снова
git push -u origin main
```

### Ошибка: "Repository not found"

- Создай репозиторий вручную: https://github.com/new
- Name: `tonhub-exchange`
- Public или Private (на выбор)
- НЕ инициализируй с README

---

## ✅ Чеклист

- [ ] Создан Personal Access Token
- [ ] Токен скопирован
- [ ] Remote URL обновлён
- [ ] Код запушен на GitHub
- [ ] Репозиторий виден на https://github.com/zametkikostik/tonhub-exchange

---

## 🎯 Быстрая команда (если токен есть)

```bash
cd /home/kostik/tonhub-exchange

# Вставь свой токен вместо YOUR_TOKEN
git remote set-url origin https://zametkikostik:YOUR_TOKEN@github.com/zametkikostik/tonhub-exchange.git

# Пуш
git push -u origin main --force

# Готово!
```

---

**После успешного пуша — код будет на GitHub и можно деплоить на Vercel! 🚀**
