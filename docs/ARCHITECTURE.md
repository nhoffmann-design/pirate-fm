# Architecture

## Overview

Pirate.fm is a headline-reactive radio station. Here's how it works:

### Data Flow

```
Headlines (HN, TC, Wired, CNN)
    ↓
Scraper (Cron: every 4-6h)
    ↓
Headline → Suno Prompt (LLM translation)
    ↓
Suno API (Generate track)
    ↓
S3/Storage (Store MP3)
    ↓
Icecast Server (Stream)
    ↓
Web Player (React)
    ↓
Listener (plays, sees metadata)
```

## Components

### Frontend (React)
- **UI:** Dark mode, CRT scan lines, retro fonts
- **Player:** Play/pause, current track, listener count
- **Metadata:** "Inspired by [headline]" when available
- **Social:** Twitter share, Patreon link
- **Deployment:** Vercel (static + API routes for listener count)

### Backend (Node.js/Express)
- **API Endpoints:**
  - `GET /api/current` - Current track info
  - `GET /api/listeners` - Real-time count
  - `POST /api/generate` - Trigger Suno generation (admin)
  - `GET /api/tracks` - List recent tracks

- **Services:**
  - **Headline Scraper** (APScheduler cron)
    - Polls HackerNews, TechCrunch, Wired, CNN APIs
    - Stores top 5-10 headlines in SQLite
    - Runs every 4-6 hours
  
  - **Suno Integration**
    - Converts headline → creative music prompt
    - Calls Suno API (batch or one-at-a-time)
    - Polls for completion
    - Stores metadata (title, mood, headline, generated_at)
  
  - **Icecast Manager**
    - Watches storage directory
    - Auto-rotates playlist
    - Real-time listener count via WebSocket or polling

- **Database (SQLite):**
  ```
  tracks (id, title, mood, headline, suno_id, file_path, generated_at, duration)
  headlines (id, source, title, url, scraped_at)
  listeners (id, count, timestamp)
  ```

### Streaming (Icecast2)
- Open-source, reliable streaming server
- Serves MP3 stream
- Real-time listener tracking
- Can run on same VPS as backend

### Storage
- **Option A:** S3 (scalable, clean)
- **Option B:** Self-hosted on VPS (simpler for MVP)

## Deployment

**Frontend:**
- GitHub repo → Vercel (auto-deploy on push)
- Points to `pirate.fm` (DNS configured)

**Backend:**
- GitHub repo → Railway or Linode VPS (docker + docker-compose)
- Runs: Icecast, Node server, headline scraper

**Music:**
- Generated via Suno (Web UI or API)
- Stored on backend VPS
- Streamed via Icecast

## MVP vs Phase 2

**MVP (This weekend):**
- Live stream (rotating tracks)
- Basic player
- Listener count
- Headline scraper (manual Suno generation for now)
- Social links

**Phase 2 (Later):**
- Automated Suno generation (headline → API call)
- Track archive with search
- Show schedule
- Mobile apps
- API for third-party players
- Analytics dashboard

## Moods (8 Total)

1. **Synthwave** - Neon, retro synths, driving beat
2. **Cyberpunk Lo-fi** - Futuristic, chill, glitchy
3. **Underground Hip-Hop** - Boom bap, raw, gritty
4. **Ambient Drone** - Atmospheric, meditative, spacious
5. **Acid House** - Hypnotic, 303 synths, repetitive
6. **Industrial** - Heavy, mechanical, aggressive
7. **Experimental** - Weird, avant-garde, unexpected
8. **Punk** - Fast, raw, rebellious

## Key Files

- `backend/.env` - Suno API key, Icecast password, S3 creds
- `backend/scraper.js` - Headline fetcher
- `backend/suno.js` - Suno integration
- `frontend/src/App.jsx` - React player
- `docs/MUSIC_PLAN.md` - Track generation strategy
