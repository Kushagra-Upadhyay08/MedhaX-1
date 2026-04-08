# 🚀 Deploy Code-Dual in 5 Minutes

## Quick Deploy to Render (FREE)

### Step 1: Create GitHub Repository
```bash
cd Code-Dual
git init
git add .
git commit -m "Initial commit - Code-Dual ready for deployment"
```

### Step 2: Push to GitHub
1. Go to github.com and create a new repository called "code-dual"
2. Run these commands:
```bash
git remote add origin https://github.com/YOUR_USERNAME/code-dual.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render
1. Go to https://render.com and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your "code-dual" repository
5. Render will detect the render.yaml file automatically
6. Click "Create Web Service"
7. Your app will be live in 2-3 minutes!

## Alternative: One-Click Deploy Links

### Railway (Click to Deploy)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Vercel (Click to Deploy)
Just drag your Code-Dual folder to vercel.com/new

## Your Live URLs
After deployment, you'll get URLs like:
- Render: `https://your-app-name.onrender.com`
- Railway: `https://your-app-name.up.railway.app`
- Vercel: `https://your-app-name.vercel.app`

## Environment Variables (Auto-configured)
✅ JWT_SECRET - Auto-generated secure key
✅ PORT - Auto-set by platform
✅ NODE_ENV - Set to production
✅ Database - SQLite file persisted on disk

## 🎮 Your Code-Dual Features
- Real-time multiplayer battles
- Battleship-style coding quiz
- User authentication
- Match history
- Multiple categories
- Responsive design

Ready to go live! 🚀