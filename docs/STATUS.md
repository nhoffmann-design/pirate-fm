# Project Status: Pirate.fm MVP

**Last Updated:** 2026-02-09 16:30 EST
**Timeline:** Mon-Sun (3 days remaining)
**Target:** Live by Sunday EOD

---

## ✅ Completed (Day 1 - Foundation)

### Documentation
- [x] Project structure & directories
- [x] Architecture overview
- [x] Music generation plan (8 moods, 44 tracks)
- [x] Build timeline & checklist
- [x] Deployment guide
- [x] Suno generation guide
- [x] Headline scraper template

### Backend Skeleton
- [x] Node.js/Express boilerplate
- [x] SQLite database schema
- [x] Core API endpoints (/api/current, /api/listeners, /api/tracks)
- [x] WebSocket setup (real-time updates)
- [x] Playlist rotation logic
- [x] Track auto-advance (every 3 min)
- [x] Health check endpoint
- [x] Environment config template

### Frontend Skeleton
- [x] React app (Vite template)
- [x] VHS aesthetic (CRT scan lines, neon accents)
- [x] Web player UI (play/pause, next, track info)
- [x] Real-time listener count display
- [x] Social links (Twitter, Patreon, email share)
- [x] Responsive design (mobile + desktop)
- [x] WebSocket client integration
- [x] Dark mode with retro fonts

### Infrastructure
- [x] Git repo initialized
- [x] .gitignore configured
- [x] Docker setup (Dockerfile, docker-compose)
- [x] Icecast configuration template

---

## 🔲 In Progress (Today - Music Generation)

### Music Generation (PRIORITY #1)
- [ ] Generate 44 AI tracks via Suno Pro
  - [ ] Synthwave (6 tracks)
  - [ ] Cyberpunk Lo-fi (6 tracks)
  - [ ] Underground Hip-Hop (5 tracks)
  - [ ] Ambient Drone (5 tracks)
  - [ ] Acid House (6 tracks)
  - [ ] Industrial (5 tracks)
  - [ ] Experimental (6 tracks)
  - [ ] Punk (5 tracks)
- [ ] Create metadata JSON for each track
- [ ] Organize into mood folders
- [ ] Upload to storage (S3 or self-hosted)
- [ ] Load into SQLite database
- [ ] Test playlist rotation locally

**Est. Time:** 2-3 hours (with parallel Suno generation)
**Blocker:** Suno API availability

---

## 🔲 Upcoming (Day 2 - Frontend)

### Frontend Build (Tuesday)
- [ ] Install npm dependencies
- [ ] Configure Tailwind CSS
- [ ] Build CRT scan line animation
- [ ] Style player card (neon borders, gradient)
- [ ] Implement play/pause button
- [ ] Implement next/skip button
- [ ] Progress bar (optional)
- [ ] Mobile responsive tweaks
- [ ] Test WebSocket connection
- [ ] Build & preview locally

**Est. Time:** 4-5 hours

---

## 🔲 Upcoming (Day 3 - Backend & Streaming)

### Backend Integration (Wednesday)
- [ ] Install npm dependencies
- [ ] Set up SQLite database locally
- [ ] Load music tracks + metadata into DB
- [ ] Test API endpoints (/api/current, /api/listeners)
- [ ] Integrate WebSocket with frontend
- [ ] Build playlist feeder for Icecast
- [ ] Test with sample MP3s

### Icecast Setup
- [ ] Install Icecast2 (or use Docker)
- [ ] Configure mount point (/pirate.fm)
- [ ] Test local streaming
- [ ] Connect backend to feed audio
- [ ] Verify listener counter

### Headline Scraper
- [ ] Implement HackerNews API integration
- [ ] Add RSS feed parser (npm install rss-parser)
- [ ] Implement TechCrunch RSS scraper
- [ ] Implement Wired RSS scraper
- [ ] Implement CNN RSS scraper
- [ ] Schedule via APScheduler (or cron)
- [ ] Test scraper manually

**Est. Time:** 6-7 hours

---

## 🔲 Upcoming (Day 4 - Deployment)

### Deployment
- [ ] Push frontend to GitHub
- [ ] Deploy to Vercel
- [ ] Configure environment variables
- [ ] Point pirate.fm domain to Vercel
- [ ] Push backend to GitHub
- [ ] Deploy to Railway (or VPS)
- [ ] Configure backend environment
- [ ] Set up api.pirate.fm domain
- [ ] Deploy Icecast (Docker on VPS)
- [ ] Test end-to-end streaming

### Final Testing
- [ ] Verify pirate.fm loads in browser
- [ ] Player displays current track
- [ ] Listener count updates live
- [ ] Stream plays audio
- [ ] Social links work
- [ ] Mobile responsive
- [ ] No console errors
- [ ] All services stable

### Social & Launch
- [ ] Create Twitter account (if needed)
- [ ] Post launch announcement
- [ ] Wire up Patreon link
- [ ] Final documentation
- [ ] Commit & push

**Est. Time:** 4-5 hours

---

## 🎯 MVP Deliverables Checklist

### Core Features
- [ ] Live 24/7 streaming
- [ ] Working web player
- [ ] Real-time listener counter
- [ ] VHS aesthetic UI
- [ ] Current track display
- [ ] Mood indication
- [ ] Headline inspiration (when available)

### Backend Services
- [ ] Icecast streaming server
- [ ] Node.js API server
- [ ] SQLite database
- [ ] Playlist rotation
- [ ] WebSocket real-time updates
- [ ] Headline scraper (runs every 4-6h)
- [ ] Track metadata management

### Deployment
- [ ] Frontend live at pirate.fm (Vercel)
- [ ] Backend API at api.pirate.fm (Railway)
- [ ] Icecast stream at stream.pirate.fm:8000
- [ ] GitHub repo public
- [ ] CI/CD ready (GitHub Actions for auto-deploy)

### Social & Content
- [ ] 44 AI-generated tracks (8 moods)
- [ ] Twitter account setup
- [ ] Patreon link (placeholder)
- [ ] Mission statement visible
- [ ] Social share buttons (Twitter, email)

---

## 📊 Project Metrics

| Metric | Status |
|--------|--------|
| Total Lines of Code | ~2,000 (so far) |
| API Endpoints | 6 (core) |
| Database Tables | 4 (tracks, headlines, listeners, playlist) |
| Frontend Components | 1 main (App.jsx) |
| Backend Services | 3 (API, Icecast, Scraper) |
| Deployment Targets | 3 (Vercel, Railway, VPS) |
| Music Tracks (Goal) | 44 |
| Moods | 8 |
| Real-Time Features | 2 (track changes, listener count) |

---

## 🚀 Critical Path

**Today (Monday):** Music generation (blocking item)
1. Generate 44 tracks via Suno ← **CRITICAL**
2. Organize & metadata
3. Upload to storage

**Tomorrow (Tuesday):** Frontend build
- React player, VHS UI

**Wednesday:** Backend & Icecast
- Streaming setup, scraper, integration

**Thursday:** Deploy & launch
- Vercel, Railway, live test

---

## 🛠️ Tech Stack Summary

**Frontend:**
- React 18 + Vite
- Tailwind CSS + custom CSS
- Socket.io-client (WebSocket)
- Deployed on Vercel

**Backend:**
- Node.js 18 + Express
- SQLite3 (better-sqlite3)
- Socket.io (WebSocket)
- Deployed on Railway

**Streaming:**
- Icecast2 (open-source)
- MP3 format
- On same VPS as backend

**Audio Generation:**
- Suno AI (Pro plan)
- 2,500 credits/month
- Commercial use enabled

---

## 📝 Next Immediate Action

**🎯 PRIORITY: Generate 44 music tracks via Suno**

See `docs/SUNO_GENERATION.md` for detailed steps:
1. Access Suno.com with Pro account
2. Use prompt templates for each mood
3. Generate in parallel batches (2 at a time)
4. Download & organize by mood
5. Create metadata JSON
6. Upload to storage

**Target:** Finish by end of today (Monday)

---

## ⚠️ Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Suno API rate limits | Blocks music gen | Batch generation, parallel API calls |
| Icecast complexity | Delay streaming | Use Docker, pre-config provided |
| WebSocket issues | Real-time breaks | Built with socket.io, fallback polling |
| Database migration | Data loss | SQLite backup before deploy |
| DNS propagation | Domain down | Allow 15-30 min, test with dig/nslookup |

---

## 📚 Documentation Files

- `README.md` - Project overview
- `docs/ARCHITECTURE.md` - Technical design
- `docs/MUSIC_PLAN.md` - Track generation strategy
- `docs/SUNO_GENERATION.md` - Suno step-by-step guide
- `docs/TIMELINE.md` - Build schedule
- `docs/DEPLOYMENT.md` - Vercel/Railway/Icecast setup
- `docs/STATUS.md` - This file

---

## 🤝 Key Contacts

**Nick** (Project Owner)
- Suno Pro account ready
- Domain pirate.fm (ready to point)
- Patreon link (to be provided)
- Music moods defined

---

## 📞 Support

If blocking issues arise:
1. Check relevant documentation file
2. Review error logs
3. Consult troubleshooting sections
4. Escalate if needed

**Let's ship this.** 🏴‍☠️
