# 🚀 EASIEST DEPLOYMENT - Just 3 Commands!

## Prerequisites
- GitHub account (free)
- Vercel account (free) - Sign up at https://vercel.com
- Render account (free) - Sign up at https://render.com
- **Your existing Neon database** (already configured ✅)

---

## Option 1: GitHub Auto-Deploy (RECOMMENDED - 10 minutes)

### Step 1: Push to GitHub
```bash
# If not already on GitHub:
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR-USERNAME/cs-roadmap-platform.git
git push -u origin main
```

### Step 2: Deploy Frontend (Vercel)
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `cs-roadmap-platform` repo
4. Configure:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Environment Variables:** Add `VITE_API_URL` (leave blank for now, we'll update it)
5. Click "Deploy"
6. **Save your frontend URL** (e.g., `https://cs-roadmap-platform.vercel.app`)

### Step 3: Get Your Neon Database URL (Already Done! ✅)
1. Go to https://console.neon.tech/
2. Select your existing project
3. Go to Dashboard → Connection Details
4. Copy the **Connection string** (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
5. **Save this connection string** - you'll paste it into Render in the next step

> 💡 **Note:** Your database is already set up! This is just to get the connection string for the production backend.

### Step 4: Deploy Backend (Render)
1. Go to https://render.com/
2. Click "New +" → "Web Service"
3. Connect GitHub account
4. Select your `cs-roadmap-platform` repo
5. Configure:
   ```
   Name: cs-roadmap-backend
   Region: Frankfurt
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```
6. Click "Advanced" → Add Environment Variables:
   ```
   DATABASE_URL = <paste your Neon connection string from Step 3>
   JWT_SECRET = <paste the value below>
   FRONTEND_URL = <your Vercel URL from Step 2>
   NODE_ENV = production
   PORT = 10000
   ```

   **Generate JWT_SECRET locally:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

7. Click "Create Web Service"
8. Wait 3-5 minutes for deployment
9. **Save your backend URL** (e.g., `https://cs-roadmap-backend.onrender.com`)

### Step 5: Connect Frontend to Backend
1. Go back to Vercel dashboard
2. Select your project → Settings → Environment Variables
3. Edit `VITE_API_URL`:
   ```
   VITE_API_URL = https://cs-roadmap-backend.onrender.com/api
   ```
4. Go to Deployments → Click "..." → "Redeploy"

### Step 6: Update CORS
1. Edit `server/src/app.js` locally
2. Find the CORS section and add your Vercel URL:
   ```javascript
   const corsOptions = {
     origin: [
       'http://localhost:5173',
       'https://cs-roadmap-platform.vercel.app'  // Add your Vercel URL
     ],
     credentials: true
   };
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push
   ```
4. Render will auto-redeploy!

---

## Option 2: CLI Deploy (For Terminal Lovers - 5 minutes)

### Prerequisites
```bash
npm install -g vercel
```

### Deploy Frontend
```bash
cd frontend
vercel login
vercel --prod
```
Follow prompts:
- Setup and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **cs-roadmap-platform**
- In which directory? **.**
- Override settings? **No**

### Add Environment Variable
```bash
vercel env add VITE_API_URL production
# Paste: https://cs-roadmap-backend.onrender.com/api
vercel --prod
```

For backend, use GitHub method (Step 4 from Option 1).

---

## ✅ Verification

**Test Backend:**
```bash
curl https://YOUR-BACKEND-URL.onrender.com/health
```

**Test Frontend:**
Visit your Vercel URL in browser

---

## 🎉 You're Live!

Your app URLs:
- **Frontend:** `https://YOUR-APP.vercel.app`
- **Backend:** `https://YOUR-BACKEND.onrender.com`

### Next Steps:
1. Share with friends! 🌍
2. Set up custom domain (optional, free on Vercel)
3. Enable auto-deploy: Every `git push` auto-deploys to both services!

---

## ⚠️ Important Notes

1. **First Load Slow:** Render free tier "sleeps" after 15min inactivity. First request takes ~30-60s to wake up.
2. **Database Limits:** Neon free tier includes 0.5 GiB storage and shared compute
3. **Auto-Deploy:** Both services auto-deploy on git push to `main` - already configured!

Need help? Check the full guide: `deployment-guide.md`
