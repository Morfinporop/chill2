# Railway Setup Guide

## Important: You need 2 separate services on Railway!

### Service 1: Backend (API + WebSocket)

1. **Create new service** on Railway
2. **Connect GitHub repo**: `Morfinporop/chill2`
3. **Settings:**
   - Name: `chillgram-backend`
   - Root Directory: `server`
   - Start Command: `npm start`
   - Port: `8080`

4. **Add this domain:**
   - Custom domain or Railway domain
   - Example: `chillgram-api.up.railway.app`

### Service 2: Frontend (React App)

1. **Create another new service** on Railway
2. **Connect same GitHub repo**: `Morfinporop/chill2`
3. **Settings:**
   - Name: `chillgram-frontend`
   - Root Directory: `.` (leave empty or root)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

4. **Environment Variables:**
   ```
   VITE_API_URL=https://chillgram-api.up.railway.app/api
   VITE_WS_URL=wss://chillgram-api.up.railway.app
   ```

5. **Add domain:**
   - Example: `chillgram.up.railway.app`

## OR: Single Service (simpler but not recommended)

If you want just ONE service:

1. Root Directory: `server`
2. Add this to `server/index.js` after line 1:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../dist')));

// Catch all routes and return index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

3. Build frontend first: `npm run build`
4. Deploy the `server` directory
5. Domain: `sud-production-4cd9.up.railway.app`

## Current Error Fix

Your current setup is trying to run the frontend as a server. Fix:

1. **In Railway Settings:**
   - Root Directory: `server`
   - Start Command: `npm start`

2. **Build Command:** (leave empty or `npm install`)

3. **Deploy!**

The error you see is Caddy (Railway's proxy) - it's normal. Your Node server should be running behind it.

## Test locally first:

```bash
# Terminal 1
cd server
npm install
npm start

# Terminal 2
npm install
npm run dev
```

Visit: http://localhost:5173
