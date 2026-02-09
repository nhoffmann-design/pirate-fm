# 🏴‍☠️ pirate.fm

**Retro transmissions from the future.**

An AI-powered underground radio station broadcasting headline-reactive music. All tracks generated via Suno AI. Dark, minimalist aesthetic. VHS scan lines. CRT glow. Continuously rotating playlist that evolves based on global headlines.

## MVP Deliverables (By Sunday EOD)

- ✅ Live 24/7 stream (Icecast)
- ✅ VHS-themed React web player
- ✅ Real-time listener counter
- ✅ Automated headline scraper (HN, TechCrunch, Wired, CNN)
- ✅ Suno music generation integration
- ✅ Patreon link (wire up)
- ✅ Social media (Twitter ready)

## Build Timeline

| Day | Task | Status |
|-----|------|--------|
| Mon | Music generation (40-50 tracks) | ⏳ IN PROGRESS |
| Tue | Frontend (React + VHS UI) | 🔲 TODO |
| Wed | Backend (Icecast, scraper, API) | 🔲 TODO |
| Thu | Integration, testing, deploy | 🔲 TODO |

## Tech Stack

**Frontend:**
- React (CRA or Vite)
- Tailwind CSS (CRT scan lines)
- WebSockets for live updates
- Deployed on Vercel

**Backend:**
- Node.js/Express (or Python/Flask)
- Icecast2 for streaming
- SQLite for metadata
- APScheduler for headline scraper
- Deployed on Railway or small VPS

**Audio:**
- Suno AI (2,500 credits/month)
- S3 or self-hosted storage
- 40-50 initial tracks (8 moods)
- 1-2 new tracks every 4-6 hours

## Project Structure

```
pirate-fm/
├── frontend/          # React app
├── backend/           # Node/Python server
├── music/             # Generated tracks (by mood)
├── docs/              # Architecture, spec, etc.
├── infra/             # Deployment configs
└── README.md
```

## Getting Started

See `docs/ARCHITECTURE.md` for technical details.
See `docs/MUSIC_PLAN.md` for Suno generation strategy.
