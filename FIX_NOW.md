# QUICK FIX FOR RAILWAY

## Problem:
Railway is trying to run the FRONTEND instead of BACKEND server!

## Solution (2 minutes):

### Step 1: Go to Railway Settings

In your Railway project `sud-production-4cd9`:

1. Click **"Settings"**
2. Find **"Root Directory"**
3. Change from `.` or empty to: **`server`**
4. Click **"Update"**

### Step 2: Verify Start Command

1. Scroll to **"Start Command"**
2. Should be: **`npm start`** or **`node index.js`**
3. If empty, set it to: **`npm start`**
4. Click **"Update"**

### Step 3: Redeploy

1. Click **"Deployments"** tab
2. Click **"Deploy"** button
3. Wait 1-2 minutes

### Step 4: Test

Your API should now work at:
```
https://sud-production-4cd9.up.railway.app/api/users
```

## If Still Not Working:

### Option A: Check Logs
1. Go to **"Deployments"**
2. Click latest deployment
3. Check logs for:
   ```
   Server running on port 8080
   ```

### Option B: Environment Variables
Add this variable:
- Key: `PORT`
- Value: `8080`

## For Frontend:

You have 2 options:

### Option 1: Separate Service (Recommended)
1. Create NEW service on Railway
2. Connect same repo
3. Root Directory: leave empty
4. Build: `npm run build`
5. Start: `npm run preview`
6. Add env var: `VITE_API_URL=https://sud-production-4cd9.up.railway.app`

### Option 2: Static Files from Backend
Add to `server/index.js` at the TOP:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// After app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

Then rebuild frontend locally:
```bash
npm run build
```

And commit + push to GitHub.

## Current Status:

✅ All flags added (200+ countries)  
✅ Emoji flags working  
✅ White theme by default  
✅ WebSocket code ready  
✅ API endpoints ready  
❌ Railway pointing to wrong directory  

**Fix:** Set Root Directory to `server` in Railway!
