# 🚀 Quick Start - Signal Thief DJ Layer

Get the DJ layer up and running in 5 minutes.

## TL;DR

```bash
# 1. Setup
cd dj-layer
npm install

# 2. Audio stings
npm run create-stings

# 3. Metadata
npm run load-metadata

# 4. Generate samples (test)
npm run samples
# Listen to 3 samples in samples/ directory

# 5. Generate all intros
export ELEVENLABS_API_KEY="your-key-here"
npm run batch
# Takes ~1 hour, generates 44 intros

# 6. Integrate into database
npm run integrate

# 7. Verify
npm run verify
```

## What You Get

✅ 44 TTS intros (~8 sec each) - Signal Thief persona
✅ 3 audio stings - modem, tape, whisper
✅ Database integration - ready to serve via API
✅ React player compatible - drop-in intros/stings
✅ Full automation - batch generation in one command

## Configuration

### ElevenLabs API Key

**Option 1: Environment variable**
```bash
export ELEVENLABS_API_KEY="sk-..."
node scripts/generate-intros.js --batch
```

**Option 2: Edit dj-config.json**
```json
{
  "elevenlabs": {
    "api_key": "sk-...",
    "voice_id": "21m00Tcm4TlvDq8ikWAM"
  }
}
```

### Voice Settings

Default Signal Thief config is in `dj-config.json`:
```json
{
  "voice": {
    "speed": 0.75,      // Slow, deliberate pace
    "pitch": -0.5,      // Deep, confident tone
    "stability": 0.6,   // Natural variation
    "similarity": 0.8   // Consistent personality
  }
}
```

Adjust if samples don't sound right, then regenerate.

## Output Structure

```
dj-layer/
├── audio-stings/
│   ├── modem-handshake.wav      (3.5 sec)
│   ├── tape-rewind.wav          (1.8 sec)
│   └── pirate-whisper.wav       (3.0 sec)
├── samples/                      (3 preview intros)
├── output/
│   └── intros/                  (44 generated intros)
│       ├── signal-thief-*.mp3
│       └── manifest.json
└── tracks-metadata.json
```

## Using in React Player

### Load into Frontend

```jsx
// In App.jsx
const playTrack = async (track) => {
  // If intro exists, play it first
  if (track.intro_tts_path) {
    const intro = new Audio(track.intro_tts_path);
    await intro.play();
  }
  
  // Then play main track
  audioRef.current.src = track.file_path;
  audioRef.current.play();
};
```

### Display DJ Info

```jsx
<div className="dj-layer">
  <p className="formula">Formula {currentTrack?.intro_formula}/5</p>
  <p className="segment">{currentTrack?.segment_type}</p>
</div>
```

### Full Integration Example

See `frontend-integration-example.jsx` in this directory for complete code.

## Testing Checklist

- [ ] Audio stings created (3 files in `audio-stings/`)
- [ ] Metadata loaded (44 tracks in database)
- [ ] Samples generated (listen to 3 intros)
- [ ] Samples sound good (Signal Thief persona)
- [ ] Batch generation complete (44 intros in `output/intros/`)
- [ ] Database integrated (manifest loaded)
- [ ] Verification passed (npm run verify)
- [ ] Frontend loads intros (audio plays before track)
- [ ] Timing is smooth (no gaps, no overlap)

## Troubleshooting

**"API key not found"**
→ Set `ELEVENLABS_API_KEY` env var or edit `dj-config.json`

**"Database not found"**
→ Run backend server first: `cd backend && npm run dev`

**"No samples generated"**
→ Check ElevenLabs account has credits available

**"Audio sounds robotic"**
→ Adjust voice settings in `dj-config.json`, regenerate samples

**"Intros don't play in React"**
→ Check file paths in database match actual files on disk/S3

## Next Steps

1. **Monitor** - Check `/api/dj/stats` endpoint
2. **Iterate** - Gather feedback, adjust voice if needed
3. **Extend** - Add new formulas, segments, or stings
4. **Deploy** - Push to production when ready

## Full Setup Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Audio stings | 1-2 min |
| 2 | Metadata | 1 min |
| 3a | Samples | 5 min |
| 3b | Review | 5 min |
| 3c | Full batch | 45-60 min |
| 4 | Database | 2 min |
| 5 | React | 15-30 min |
| 6 | Test | 10 min |
| **Total** | **End to end** | **90-130 min** |

## API Reference

### Get Track with Intro
```bash
GET /api/tracks
Response: {
  id: 1,
  title: "Neon Futures",
  intro_tts_path: "dj-layer/output/intros/signal-thief-synthwave-1-neon-futures.mp3",
  intro_formula: 1,
  segment_type: "headline",
  segment_text: "AI systems breakthrough in natural language. Anyway, here's the beat version.",
  audio_stings: [...]
}
```

### DJ Stats
```bash
GET /api/dj/stats
Response: {
  total_tracks: 44,
  tracks_with_intros: 44,
  formulas_used: 5,
  segments_used: 3
}
```

## File Reference

| File | Purpose |
|------|---------|
| `dj-config.json` | Main configuration (API key, voice settings) |
| `tracks-metadata.json` | All 44 track details |
| `voice-config/signal-thief.json` | Persona definition and guidelines |
| `voice-config/formulas.json` | 5 intro templates |
| `scripts/generate-intros.js` | TTS generator (main script) |
| `scripts/create-stings.js` | Audio sting synthesizer |
| `scripts/load-metadata.js` | Database loader |
| `scripts/dj-integration.js` | Database integration |
| `IMPLEMENTATION_GUIDE.md` | Full step-by-step guide |

## Support

See full documentation:
- `README.md` - Overview
- `IMPLEMENTATION_GUIDE.md` - Detailed setup
- `voice-config/signal-thief.json` - Persona details

---

**Ready? Start here:**

```bash
cd dj-layer
npm install
npm run create-stings
npm run load-metadata
npm run samples
```

Then listen to the samples and decide if the voice sounds good!

