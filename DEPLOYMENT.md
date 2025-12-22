# 🚀 Deployment Guide

## Step 1: Push to GitHub

1. Create a new repository on GitHub (https://github.com/new)
   - Name it: `breadio-bakery` (or your preferred name)
   - Don't initialize with README (we already have one)

2. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/breadio-bakery.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend (Railway - Recommended)

1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `breadio-bakery` repository
5. Set root directory to: `backend`
6. Add environment variables:
   - `TWEETSCOUT_API_KEY` = your key
   - `OPENAI_API_KEY` = your key
   - `PORT` = (Railway sets this automatically)
7. Deploy! Railway will give you a URL like: `https://your-app.railway.app`

## Step 3: Deploy Frontend (Vercel - Recommended)

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your `breadio-bakery` repository
5. Set root directory to: `frontend`
6. Before deploying, update `frontend/config.js`:
   ```javascript
   window.API_URL = 'https://your-backend.railway.app';
   ```
7. Deploy!

## Alternative: Netlify (Frontend)

1. Go to https://netlify.com
2. Sign up/login with GitHub
3. "Add new site" → "Import an existing project"
4. Select your repo
5. Build settings:
   - Base directory: `frontend`
   - Build command: (leave empty - static site)
   - Publish directory: `frontend`
6. Update `frontend/config.js` with your backend URL
7. Deploy!

## Alternative: Render (Backend)

1. Go to https://render.com
2. Sign up/login
3. "New" → "Web Service"
4. Connect your GitHub repo
5. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables (same as Railway)
7. Deploy!

## 🔧 After Deployment

1. Update `frontend/config.js` with your production backend URL
2. Commit and push the change
3. Redeploy frontend

## ✅ Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend `config.js` updated with backend URL
- [ ] Environment variables set on hosting platform
- [ ] CORS configured (should work automatically)
- [ ] Test the full flow end-to-end

