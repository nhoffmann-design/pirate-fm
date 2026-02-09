# Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account with pirate-fm repo
- Vercel account (free)
- Domain: pirate.fm

### Steps

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/your-username/pirate-fm.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select GitHub repository
   - Framework: React
   - Build command: `cd frontend && npm run build`
   - Output directory: `frontend/dist`

3. **Configure Environment**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add: `REACT_APP_API_URL=https://api.pirate.fm` (or your backend URL)

4. **Connect Domain**
   - In Vercel, go to Settings → Domains
   - Add domain: `pirate.fm`
   - Update DNS records (Vercel will provide)
   - Wait for DNS propagation (~15 min)

5. **Deploy**
   - Push to main branch
   - Vercel auto-deploys
   - Monitor build at https://vercel.com/dashboard

---

## Backend Deployment (Railway)

### Prerequisites
- Railway account (free tier available)
- GitHub repo with backend code
- Environment variables ready

### Steps

1. **Prepare Environment Variables**
   - Create `.env` file with:
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_PATH=./pirate.db
     ICECAST_HOST=icecast.pirate.fm (or IP)
     ICECAST_PORT=8000
     ICECAST_MOUNT=/pirate.fm
     ICECAST_PASSWORD=your_password
     SUNO_API_KEY=your_suno_key
     API_BASE_URL=https://api.pirate.fm
     ```

2. **Deploy to Railway**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select pirate-fm repo
   - Choose root directory: `backend`
   - Railway auto-detects Node.js

3. **Configure Environment**
   - In Railway dashboard, go to Variables
   - Paste all `.env` variables
   - Railway sets `PORT` automatically (ignore)

4. **Get Public URL**
   - Railway provides: `https://xxxxx.up.railway.app`
   - Create subdomain: `api.pirate.fm`
   - Update frontend: `REACT_APP_API_URL=https://api.pirate.fm`

5. **Monitor Logs**
   - Railway dashboard shows real-time logs
   - Check for startup errors, Icecast connection issues

---

## Icecast Deployment (Same VPS as Backend)

### Option A: Docker Compose (Recommended)

Run alongside backend on same VPS:

```bash
docker-compose -f infra/docker-compose.yml up -d
```

This starts:
- Backend (Node.js) on port 3000
- Icecast2 on port 8000

### Option B: Manual Install

**On Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install icecast2

# Configure
sudo nano /etc/icecast2/icecast.xml

# Start
sudo systemctl start icecast2
```

**Configuration (icecast.xml):**
```xml
<icecast>
  <limits>
    <clients>100</clients>
    <sources>10</sources>
    <threadpool>4</threadpool>
    <queue-size>524288</queue-size>
    <client-timeout>30</client-timeout>
    <header-timeout>15</header-timeout>
    <source-timeout>10</source-timeout>
    <burst-on-connect>1</burst-on-connect>
    <burst-size>65536</burst-size>
  </limits>

  <authentication>
    <source-password>your_password</source-password>
    <relay-password>your_password</relay-password>
    <admin-user>admin</admin-user>
    <admin-password>your_password</admin-password>
  </authentication>

  <paths>
    <basedir>/usr/share/icecast2</basedir>
    <logdir>/var/log/icecast2</logdir>
    <webroot>/usr/share/icecast2/web</webroot>
  </paths>

  <listen-socket>
    <port>8000</port>
  </listen-socket>

  <mount>
    <mount-name>/pirate.fm</mount-name>
    <max-listeners>1000</max-listeners>
  </mount>
</icecast>
```

---

## Domain Setup (pirate.fm)

### DNS Configuration

Assuming you have pirate.fm domain registered:

1. **Frontend (Vercel)**
   ```
   pirate.fm  A/CNAME  cname.vercel-dns.com
   ```

2. **Backend/Icecast (Railway or VPS)**
   ```
   api.pirate.fm  CNAME  xxxxx.up.railway.app
   stream.pirate.fm  A  your.vps.ip.address
   ```

3. **Verify**
   ```bash
   nslookup pirate.fm
   nslookup api.pirate.fm
   nslookup stream.pirate.fm
   ```

---

## Backend-Icecast Connection

### From Node.js to Icecast

1. Backend runs on same VPS as Icecast
2. Backend connects to Icecast on `localhost:8000`
3. Backend feeds MP3 stream to Icecast mount `/pirate.fm`

**Node.js Stream Feeding:**
```javascript
const icecast = {
  host: process.env.ICECAST_HOST || 'localhost',
  port: process.env.ICECAST_PORT || 8000,
  mount: process.env.ICECAST_MOUNT || '/pirate.fm',
  password: process.env.ICECAST_PASSWORD,
};

// In production, feed audio chunks to Icecast
// via HTTP PUT to: http://source:password@localhost:8000/pirate.fm
```

### Frontend Stream URL

Frontend player connects to:
```
http://stream.pirate.fm:8000/pirate.fm
or
https://api.pirate.fm/stream (proxied)
```

---

## Monitoring & Logs

### Vercel
- Dashboard: https://vercel.com/dashboard
- Deployments tab
- Real-time logs for builds

### Railway
- Dashboard: https://railway.app/dashboard
- "Logs" tab for runtime logs
- "Metrics" tab for resource usage

### Icecast
- Admin panel: http://stream.pirate.fm:8000/admin/
- Listeners: http://stream.pirate.fm:8000/admin/listenerdetail.html
- Stats XML: http://stream.pirate.fm:8000/status-json.xsl

---

## Troubleshooting

### Frontend not connecting to backend
- Check `REACT_APP_API_URL` in Vercel environment
- Ensure CORS enabled on backend
- Check browser console for errors

### Icecast shows 0 listeners
- Verify Icecast is running: `curl http://localhost:8000/status-json.xsl`
- Check mount point: `http://localhost:8000/pirate.fm`
- Verify backend is feeding audio

### Backend not found errors
- Check Railway logs for crashes
- Verify environment variables are set
- Test health endpoint: `curl https://api.pirate.fm/health`

### DNS not resolving
- Wait 15-30 min for propagation
- Flush DNS cache:
  ```bash
  # macOS
  sudo dscacheutil -flushcache
  
  # Linux
  sudo systemctl restart systemd-resolved
  ```

---

## Post-Deployment

- [ ] Frontend loads at pirate.fm
- [ ] Web player displays
- [ ] Backend API responds at api.pirate.fm/health
- [ ] Icecast stream accessible at stream.pirate.fm:8000/pirate.fm
- [ ] Real-time listener count updates
- [ ] Headline scraper running
- [ ] Logs clean (no errors)
- [ ] Social links work (Twitter, Patreon)
- [ ] Mobile responsive on real phone
