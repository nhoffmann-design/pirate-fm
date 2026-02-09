# Build Timeline - Pirate.fm MVP

**Target:** Live by Sunday EOD (3 days, Mon-Sun)

## Day 1: Monday (Today)

**Goal:** Generate 40-50 music tracks, set up project infrastructure

### Tasks
- [ ] Project structure created (DONE)
- [ ] Git repo initialized (DONE)
- [ ] Architecture docs written (DONE)
- [ ] Music plan + prompts created (DONE)
- [ ] Generate 44 tracks via Suno (5-6 per mood)
  - [ ] Synthwave (6)
  - [ ] Cyberpunk Lo-fi (6)
  - [ ] Underground Hip-Hop (5)
  - [ ] Ambient Drone (5)
  - [ ] Acid House (6)
  - [ ] Industrial (5)
  - [ ] Experimental (6)
  - [ ] Punk (5)
- [ ] Organize tracks into `/music/[mood]/` folders
- [ ] Create metadata JSON for each track
- [ ] Upload tracks to storage (S3 or self-hosted)
- [ ] Create initial playlist (random order, all moods)
- [ ] First git commit

**Deliverable:** 44 .mp3 files + metadata, organized + stored

---

## Day 2: Tuesday

**Goal:** Build React frontend with VHS UI

### Tasks
- [ ] React app scaffold (Vite or CRA)
  - [ ] `npm create vite@latest frontend -- --template react`
  - [ ] Install Tailwind CSS
  - [ ] Install WebSocket library (ws or socket.io-client)
- [ ] VHS UI components
  - [ ] CRT scan line effect (CSS animation)
  - [ ] Dark theme, neon accents
  - [ ] Retro typography (monospace fonts)
  - [ ] Main player card
- [ ] Web player
  - [ ] Play/pause button
  - [ ] Current track title + mood
  - [ ] Listener count (placeholder)
  - [ ] Duration + progress bar (if possible)
- [ ] Metadata display
  - [ ] "Now Playing: [track name]"
  - [ ] "Mood: [synthwave/cyberpunk/etc]"
  - [ ] "Inspired by: [headline]" (if available)
- [ ] Social/Links
  - [ ] Patreon link (placeholder)
  - [ ] Twitter share button
  - [ ] Email share
  - [ ] Mission statement: "Retro transmissions from the future."
- [ ] Responsive design (mobile + desktop)
- [ ] WebSocket setup (connect to backend API)
- [ ] Build + test locally
- [ ] Commit to git

**Deliverable:** Working React app locally, VHS-themed player

---

## Day 3: Wednesday

**Goal:** Build backend + Icecast streaming

### Tasks
- [ ] Node.js/Express setup
  - [ ] `npm init -y && npm install express socket.io cors dotenv`
  - [ ] Create server.js
  - [ ] Setup `.env` (Suno key, Icecast password, S3 creds, etc.)
- [ ] SQLite database
  - [ ] Install `better-sqlite3` or `sqlite`
  - [ ] Create schema (tracks, headlines, listeners)
  - [ ] Initialize DB
- [ ] API endpoints
  - [ ] `GET /api/current` → current track info
  - [ ] `GET /api/listeners` → real-time count
  - [ ] `GET /api/tracks` → recent tracks list
  - [ ] `POST /api/generate` → trigger Suno (admin only)
- [ ] Playlist rotation logic
  - [ ] Load all tracks from storage
  - [ ] Shuffle + rotate (cycle through moods)
  - [ ] Track pointer in DB
  - [ ] Advance every 3-4 minutes (or track duration)
- [ ] WebSocket setup (real-time updates)
  - [ ] Broadcast current track changes
  - [ ] Broadcast listener count updates
  - [ ] Frontend connects + updates UI
- [ ] Icecast2 setup
  - [ ] Install Icecast2 (docker or local)
  - [ ] Configure stream (MP3, 128kbps)
  - [ ] Mount point: `/stream` or `/pirate.fm`
  - [ ] Test stream locally
  - [ ] Create bash script to feed MP3s into Icecast
- [ ] Listener counter
  - [ ] Icecast exposes listener count via XML API
  - [ ] Backend polls Icecast, stores in DB
  - [ ] API endpoint returns count
- [ ] Headline scraper (basic version)
  - [ ] Install APScheduler: `pip install apscheduler` (Python) or Node scheduler
  - [ ] Create scraper.js
    - [ ] Fetch HackerNews top 5 (via API)
    - [ ] Fetch TechCrunch headlines (RSS or API)
    - [ ] Fetch Wired (RSS)
    - [ ] Fetch CNN (RSS or web scrape)
  - [ ] Store in SQLite
  - [ ] Schedule: Every 6 hours
  - [ ] Log scrapes
- [ ] Audio serving
  - [ ] Icecast handles streaming
  - [ ] Backend tracks current position
  - [ ] Optional: Expose current track file via HTTP (for frontend preview)
- [ ] Local testing
  - [ ] Start Icecast
  - [ ] Start Node server
  - [ ] Connect frontend WebSocket
  - [ ] Test play → listener count updates
  - [ ] Test headline scraper manually
- [ ] Commit to git

**Deliverable:** Working backend + Icecast streaming locally

---

## Day 4: Thursday

**Goal:** Integration, testing, deployment

### Tasks
- [ ] Deploy frontend to Vercel
  - [ ] Push to GitHub (if not already)
  - [ ] Connect GitHub repo to Vercel
  - [ ] Configure build: `npm run build`
  - [ ] Point to `pirate.fm` domain (update Vercel DNS)
  - [ ] Test live
- [ ] Deploy backend to Railway (or small VPS)
  - [ ] Create Railway project
  - [ ] Connect GitHub repo
  - [ ] Set environment variables (.env)
  - [ ] Deploy: `npm start`
  - [ ] Get public URL (or use subdomain: `api.pirate.fm`)
- [ ] Update frontend to use live backend
  - [ ] Change API URLs from localhost to production
  - [ ] Update WebSocket connection URL
  - [ ] Rebuild + redeploy to Vercel
- [ ] End-to-end testing
  - [ ] Access pirate.fm in browser
  - [ ] Player loads, shows current track
  - [ ] Listener count updates in real-time
  - [ ] WebSocket connects successfully
  - [ ] Play button works (streams from Icecast)
  - [ ] Social links work
- [ ] Icecast deployment
  - [ ] Docker container on same VPS as backend
  - [ ] Configure firewall (port 8000 public)
  - [ ] Test stream from external client
- [ ] Headline scraper test
  - [ ] Run scraper manually
  - [ ] Verify headlines stored in DB
  - [ ] Check API returns headlines
  - [ ] Verify cron job is scheduled
- [ ] Social media setup
  - [ ] Create Twitter account (if needed)
  - [ ] Post launch announcement
  - [ ] Add Twitter link to player
  - [ ] Patreon link (placeholder)
- [ ] Final checks
  - [ ] All links work (Patreon, Twitter, email share)
  - [ ] Mobile responsive (test on phone)
  - [ ] No console errors
  - [ ] Icecast stable (test 5+ min stream)
  - [ ] Listener count increments
- [ ] GitHub final commit + push
- [ ] Documentation update (README with live URLs)

**Deliverable:** Live pirate.fm streaming 24/7, working player, all features MVP-complete

---

## Sunday Evening

**Final Checklist:**

✅ pirate.fm domain points to Vercel frontend
✅ Web player loads + streams works
✅ Listener count live + updating
✅ 44 tracks rotating (all moods represented)
✅ Headline scraper running (backend logs)
✅ Icecast streaming stable
✅ Social links ready (Twitter, Patreon placeholder)
✅ Mobile responsive
✅ No critical bugs
✅ GitHub repo clean + documented

**GO LIVE**

---

## Notes

- **Music generation is the bottleneck today.** Start ASAP.
- **Icecast + Node running together** on same VPS (Docker Compose).
- **Suno API** - Check if API available; if not, use batch web UI today.
- **Listener count:** Icecast XML stats API is reliable.
- **Timeline is tight.** Focus on MVP only (Phase 2 features can wait).
- **Patreon link:** Placeholder is fine for launch; Nick wires it up later.
