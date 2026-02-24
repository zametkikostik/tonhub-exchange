# 🚀 Vercel Deployment Guide - TonHub Exchange

## Quick Deploy

### 1. Prepare Your Repository

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit: TonHub Exchange"
git branch -M main
git remote add origin https://github.com/yourusername/tonhub-exchange.git
git push -u origin main
```

### 2. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Add Environment Variables:
```
VITE_API_URL=https://your-backend-url.vercel.app/api
VITE_TELEGRAM_BOT_USERNAME=TonHubExchangeBot
```

6. Click "Deploy"

### 3. Deploy Backend to Vercel

1. Create a new project in Vercel
2. Import the same repository
3. Configure:
   - **Framework Preset:** Node.js
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add Environment Variables:
```
TELEGRAM_BOT_TOKEN=8563396312:AAHc82-WCM6VCHrMLvxxbMM90BfAKuC8dIY
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
ENCRYPTION_KEY=your-encryption-key
TON_NETWORK=testnet
NODE_ENV=production
```

5. Click "Deploy"

---

## Database Setup for Vercel

### Option 1: Neon (Recommended for Vercel)

1. Go to [neon.tech](https://neon.tech)
2. Create free account
3. Create new project
4. Copy connection string
5. Add to Vercel environment variables as `DATABASE_URL`

### Option 2: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create free project
3. Get connection string from Settings → Database
4. Add to Vercel as `DATABASE_URL`

### Option 3: Vercel Postgres (Beta)

1. In Vercel dashboard, go to Storage
2. Create Postgres database
3. Connect to your project
4. Environment variables auto-configured

---

## Redis Setup for Vercel

### Option 1: Upstash (Recommended)

1. Go to [upstash.com](https://upstash.com)
2. Create free account
3. Create Redis database
4. Copy `UPSTASH_REDIS_REST_URL`
5. Add to Vercel as `REDIS_URL`

### Option 2: Vercel KV

1. In Vercel dashboard, go to Storage
2. Create KV database
3. Connect to project
4. Use `KV_URL` environment variable

---

## Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend.vercel.app/api
VITE_TELEGRAM_BOT_USERNAME=TonHubExchangeBot
```

### Backend (.env)
```bash
TELEGRAM_BOT_TOKEN=8563396312:AAHc82-WCM6VCHrMLvxxbMM90BfAKuC8dIY
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=change-this-to-random-32-chars
JWT_REFRESH_SECRET=change-this-too
ENCRYPTION_KEY=32-character-random-string
TON_NETWORK=testnet
NODE_ENV=production
PORT=3000
```

---

## Telegram Bot Configuration

### 1. Set Mini App URL

After deploying frontend to Vercel:

1. Open [@BotFather](https://t.me/botfather)
2. Send `/newapp`
3. Select your bot
4. Enter your Vercel URL: `https://your-frontend.vercel.app`
5. Enter short name for button

### 2. Configure Menu Button

```
/sendmenu
Select bot → Configure menu button
URL: https://your-frontend.vercel.app
Text: Open Exchange
```

---

## Custom Domain (Optional)

### Frontend
1. Go to Vercel project settings
2. Domains → Add domain
3. Enter your domain
4. Configure DNS as instructed

### Backend
1. Same process for backend project
2. Update `VITE_API_URL` in frontend env

---

## CI/CD with GitHub Actions

### Setup

1. In GitHub repo, go to Settings → Secrets and variables → Actions
2. Add secrets:
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_FRONTEND_PROJECT_ID=your-frontend-project-id
VERCEL_BACKEND_PROJECT_ID=your-backend-project-id
DATABASE_URL=your-database-url
```

3. Push to main branch triggers auto-deploy

### Get Vercel Token

1. Go to vercel.com/account/tokens
2. Create new token
3. Copy and add to GitHub secrets

---

## Post-Deployment Checklist

### Frontend
- [ ] Site loads correctly
- [ ] Telegram WebApp initializes
- [ ] TON Connect works
- [ ] All pages render
- [ ] Mobile responsive
- [ ] SEO meta tags present

### Backend
- [ ] API endpoints respond
- [ ] Database connected
- [ ] Redis connected
- [ ] WebSocket works
- [ ] Auth flow works

### SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Verify in Bing Webmaster Tools
- [ ] Check robots.txt
- [ ] Test structured data

---

## Troubleshooting

### Frontend Issues

**Blank page after deploy:**
```bash
# Check build logs in Vercel
# Verify VITE_API_URL is correct
# Check browser console for errors
```

**API calls failing:**
```bash
# Ensure CORS is configured in backend
# Check API URL in frontend env
# Verify backend is deployed and running
```

### Backend Issues

**Database connection error:**
```bash
# Check DATABASE_URL format
# Ensure database allows connections from Vercel IPs
# Add Vercel IP to database allowlist
```

**Redis connection error:**
```bash
# Verify REDIS_URL format
# For Upstash, use REST URL not regular URL
```

### WebSocket Issues

Vercel serverless has WebSocket limitations. For production:
1. Use Vercel Functions with `@vercel/node`
2. Or deploy backend separately (Railway, Render, Fly.io)
3. Or use managed WebSocket (Pusher, Ably)

---

## Performance Optimization

### Frontend
- ✅ Code splitting enabled
- ✅ Image optimization
- ✅ Gzip compression
- ✅ CDN caching (Vercel Edge)

### Backend
- ✅ Redis caching for API responses
- ✅ Database connection pooling
- ✅ API response compression

---

## Monitoring

### Vercel Analytics
1. Enable in project settings
2. View real-time metrics

### Error Tracking
- Add Sentry or LogRocket
- Monitor Vercel Function logs

### Uptime Monitoring
- Setup UptimeRobot or Pingdom
- Monitor both frontend and backend

---

## Cost Optimization

### Free Tier Limits
- **Vercel:** 100GB bandwidth/month
- **Neon:** 0.5 GB storage
- **Upstash:** 10,000 commands/day

### When to Upgrade
- Traffic exceeds free limits
- Need custom domains
- Require more concurrent builds

---

## Security Checklist

- [ ] All secrets in Vercel environment variables
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Database credentials rotated
- [ ] `.env` files in `.gitignore`

---

**Deployed successfully! 🎉**

Your TonHub Exchange is now live on Vercel with:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Auto-scaling
- ✅ Zero configuration
