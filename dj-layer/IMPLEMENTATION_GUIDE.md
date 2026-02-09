# 🎙️ Signal Thief DJ Layer - Implementation Guide

Complete step-by-step guide to integrate the DJ layer into Pirate.fm.

## Prerequisites

- Node.js 16+ installed
- Backend server running (to initialize database)
- ElevenLabs API key (for TTS generation)
- ~2 hours for full implementation

## Phase 1: Audio Stings (15-30 minutes)

### Step 1: Create Audio Stings

```bash
cd dj-layer
npm install
npm run create-stings
```

This synthesizes:
- `modem-handshake.wav` - V.92 modem chirp with static
- `tape-rewind.wav` - Tape click + rewind blip with vinyl crackle
- `pirate-whisper.wav` - Synthesized breathy whisper (placeholder for voice recording)

**Output:** `audio-stings/` directory with 3 WAV files

**Optional:** Replace `pirate-whisper.wav` with actual voice recording for better quality.

## Phase 2: Metadata Loading (5 minutes)

### Step 2: Load Track Metadata into Database

```bash
npm run load-metadata
```

This populates the database with all 44 tracks:
- Title, genre, mood, headline
- Placeholder file paths (updated when tracks are uploaded)
- Default 3-minute duration

**Verification:**
```bash
sqlite3 ../backend/pirate.db "SELECT COUNT(*) FROM tracks;"
# Should return: 44
```

## Phase 3: Intro Generation (1-2 hours)

### Step 3: Configure ElevenLabs API

Edit `dj-config.json`:

```json
{
  "elevenlabs": {
    "api_key": "YOUR_ELEVENLABS_API_KEY_HERE",
    "voice_id": "21m00Tcm4TlvDq8ikWAM",
    "model_id": "eleven_monolingual_v1"
  }
}
```

Or set environment variable:
```bash
export ELEVENLABS_API_KEY="sk-xxx..."
```

### Step 4: Generate Sample Intros (Testing)

```bash
npm run samples
# Generates 3 sample intros
```

Output: `samples/` directory with 3 MP3 files named like:
- `signal-thief-synthwave-sample-1.mp3`
- `signal-thief-cyberpunk-sample-2.mp3`
- `signal-thief-hiphop-sample-3.mp3`

**Listen to samples and verify:**
- Sound quality is good
- Voice tone matches Signal Thief persona
- Intros are 7-12 seconds long
- Natural pauses in speech
- No robot-like artifacts

### Step 5: Adjust Voice (If Needed)

If samples don't sound right, edit `dj-config.json` voice parameters:

```json
{
  "voice": {
    "speed": 0.75,        // Slower = 0.5 to 1.0 = Faster
    "pitch": -0.5,        // Lower = more bass, -2 to +2 range
    "stability": 0.6,     // Lower = more variation, 0 to 1.0
    "similarity": 0.8     // Higher = more consistent tone, 0 to 1.0
  }
}
```

Then regenerate samples.

### Step 6: Full Batch Generation

Once satisfied with samples:

```bash
npm run batch
# Generates all 44 intros
# Takes 45-60 minutes depending on API rate limits
# Costs ~50-80 credits on ElevenLabs
```

Monitor progress in console. Each intro shows:
- Track number and title
- Formula template used (1-5)
- Segment type (headline/advisory/regulation)
- Script that was sent to TTS
- Output filename

## Phase 4: Database Integration (10 minutes)

### Step 7: Integrate Intros into Backend

```bash
npm run integrate
# Loads all generated intros into database
# Associates with track metadata
# Links audio stings
```

This updates the tracks table:
- `intro_tts_path` - Path to intro MP3
- `intro_formula` - Which template (1-5)
- `segment_type` - Type of recurring segment
- `segment_text` - Full segment text
- `audio_stings` - JSON array of sting files and timings

### Step 8: Verify Integration

```bash
npm run verify
# Shows:
# - Total tracks in database
# - Tracks with intros loaded
# - Coverage percentage
# - Sample tracks with their intros
# - Audio stings present
```

## Phase 5: Frontend Integration (30-45 minutes)

### Step 9: Modify React Player to Use Intros

Edit `frontend/src/App.jsx` to load and play intros.

**Current structure:**
```jsx
// Existing: plays track directly
const playTrack = (track) => {
  audioRef.current.src = track.file_path;
  audioRef.current.play();
};
```

**New structure with DJ layer:**
```jsx
const playTrack = (track) => {
  if (track.intro_tts_path) {
    // Load intro with stings
    const intro = new Audio(track.intro_tts_path);
    
    // Play modem sting (fade in)
    const modem = new Audio('dj-layer/audio-stings/modem-handshake.wav');
    modem.volume = 0.3;
    
    // Sequence:
    // 1. Modem (3.5 sec)
    // 2. Intro (8 sec)
    // 3. Whisper outro (3 sec)
    // 4. Main track
    
    modem.play();
    modem.onended = () => {
      intro.play();
      intro.onended = () => {
        const whisper = new Audio('dj-layer/audio-stings/pirate-whisper.wav');
        whisper.volume = 0.4;
        whisper.play();
        whisper.onended = () => {
          audioRef.current.src = track.file_path;
          audioRef.current.play();
        };
      };
    };
  } else {
    // Fallback to direct playback
    audioRef.current.src = track.file_path;
    audioRef.current.play();
  }
};
```

**Better approach (with timing control):**
```jsx
const playTrack = async (track) => {
  if (!track.intro_tts_path) {
    audioRef.current.src = track.file_path;
    audioRef.current.play();
    return;
  }

  // Parse audio stings
  const stings = JSON.parse(track.audio_stings || '[]');
  
  // Create audio context for precise timing
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  
  let playbackTime = now;

  for (const sting of stings) {
    if (sting.placement === 'before_intro') {
      const stingAudio = new Audio(`dj-layer/${sting.file}`);
      stingAudio.play();
      playbackTime += sting.duration + 0.2; // Add gap
    }
  }

  // Play intro
  const intro = new Audio(track.intro_tts_path);
  setTimeout(() => intro.play(), (playbackTime - now) * 1000);
  playbackTime += 8; // Intro duration

  // Play main track after all intros/stings
  setTimeout(() => {
    audioRef.current.src = track.file_path;
    audioRef.current.play();
  }, (playbackTime - now) * 1000);
};
```

### Step 10: Update Track Display UI

Show DJ layer info in player (optional):

```jsx
<div className="dj-info">
  <p className="dj-formula">Formula: {currentTrack?.intro_formula}/5</p>
  <p className="dj-segment">{currentTrack?.segment_type}</p>
  <p className="dj-segment-text">{currentTrack?.segment_text}</p>
</div>
```

### Step 11: CSS Styling

Add styling for DJ layer elements:

```css
.dj-info {
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.dj-formula {
  font-weight: bold;
  color: #00ff88;
  text-transform: uppercase;
}

.dj-segment {
  font-family: 'Space Mono', monospace;
  color: #666;
}

.dj-segment-text {
  font-style: italic;
  color: #555;
  border-left: 2px solid #00ff88;
  padding-left: 0.5rem;
  margin-top: 0.25rem;
}
```

## Phase 6: Backend API Extension (20 minutes)

### Step 12: Extend Backend API

The backend already supports returning intro metadata. Verify these endpoints work:

```bash
# Get current track with intro
curl http://localhost:3000/api/current

# Get all tracks with intro data
curl http://localhost:3000/api/tracks

# Expected response includes:
# {
#   "id": 1,
#   "title": "Neon Futures",
#   "intro_tts_path": "dj-layer/output/intros/signal-thief-synthwave-1-neon-futures.mp3",
#   "intro_formula": 1,
#   "segment_type": "headline",
#   "segment_text": "AI systems breakthrough in natural language. Anyway, here's the beat version.",
#   "audio_stings": [...]
# }
```

### Step 13: Create DJ Stats Endpoint (Optional)

Add endpoint to get DJ layer statistics:

```javascript
// In backend/server.js
app.get('/api/dj/stats', (req, res) => {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_tracks,
      SUM(CASE WHEN intro_tts_path IS NOT NULL THEN 1 ELSE 0 END) as tracks_with_intros,
      COUNT(DISTINCT intro_formula) as formulas_used,
      COUNT(DISTINCT segment_type) as segments_used
    FROM tracks
  `).get();
  
  res.json(stats);
});
```

## Phase 7: Testing & QA (20 minutes)

### Step 14: Test Locally

```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev

# Test in browser:
# 1. Load http://localhost:5173
# 2. Click play on first track
# 3. Listen for:
#    - Modem handshake
#    - Intro with Signal Thief voice
#    - Main track fades in
# 4. Verify audio quality and timing
```

### Step 15: Check All Tracks

Use the dashboard to randomly check 10 tracks across different genres/moods to ensure:
- All intros play correctly
- No missing audio files
- Timing transitions smoothly
- Volume levels are balanced

## Phase 8: Deployment (15 minutes)

### Step 16: Prepare for Production

1. **Upload audio files to S3 or CDN:**
   ```bash
   # Copy dj-layer/output/intros/*.mp3 to S3
   # Copy dj-layer/audio-stings/*.wav to S3
   ```

2. **Update file paths in database:**
   - If hosting on S3: update `intro_tts_path` to S3 URLs
   - If serving locally: ensure paths are correct relative to frontend

3. **Build for production:**
   ```bash
   cd frontend
   npm run build
   
   cd ../backend
   npm run build
   ```

4. **Deploy:**
   ```bash
   # Deploy frontend to Vercel
   vercel deploy

   # Deploy backend to Railway/Heroku
   # (per DEPLOYMENT.md)
   ```

## Troubleshooting

### No Intros Generated
- Check ElevenLabs API key in `dj-config.json`
- Ensure API key has credits available
- Check internet connection

### Audio Quality Issues
- Adjust voice settings in `dj-config.json`
- Try different `stability` and `similarity` values
- Regenerate samples before full batch

### Database Integration Failed
- Ensure `pirate.db` exists and backend has been run
- Check database file permissions
- Verify manifest.json exists in `output/intros/`

### Timing Issues (Intros Don't Sync)
- Adjust timing values in `dj-config.json`
- Consider using Web Audio API for precise timing
- Test in different browsers (Safari vs Chrome has differences)

### Missing Audio Stings
- Run `npm run create-stings` to regenerate
- Check `audio-stings/` directory has 3 files
- Verify file paths in database match actual files

## Performance Optimization

### Caching
```javascript
// Frontend: cache intros after first play
const introCache = new Map();

const playTrack = (track) => {
  if (introCache.has(track.id)) {
    const cached = introCache.get(track.id);
    playSequence(cached);
  } else {
    fetchIntro(track).then(intro => {
      introCache.set(track.id, intro);
      playSequence(intro);
    });
  }
};
```

### Preloading
```javascript
// Preload next track's intro while current plays
const preloadNextIntro = (nextTrack) => {
  const audio = new Audio(nextTrack.intro_tts_path);
  // Don't play, just load into browser cache
};
```

## Customization

### Change Intro Formulas
Edit `voice-config/formulas.json`, add new template, increment `total` count.

### Add New Segments
Edit `dj-config.json` segments section, update segment rotation logic in `dj-integration.js`.

### Adjust Persona
Edit `voice-config/signal-thief.json`, regenerate samples to test.

## Monitoring

### Check Integration Status
```bash
npm run verify
```

### View DJ Stats
```bash
curl http://localhost:3000/api/dj/stats
```

### Monitor API Usage
```bash
# Check ElevenLabs account for:
# - Credits used
# - API calls made
# - Voice ID usage
# - Model usage
```

## Next Steps After Deployment

1. **Gather feedback** on voice, timing, and vibe
2. **Iterate** on voice settings if needed
3. **Add new formulas** based on listener response
4. **Rotate segments** periodically to keep fresh
5. **Monitor performance** - are intros skipped by users?

---

**Timeline:**
- Phase 1 (Stings): 15-30 min
- Phase 2 (Metadata): 5 min
- Phase 3 (Intros): 60-120 min
- Phase 4 (Integration): 10 min
- Phase 5 (Frontend): 30-45 min
- Phase 6 (Backend): 20 min
- Phase 7 (Testing): 20 min
- Phase 8 (Deploy): 15 min

**Total: 3-5 hours from start to live deployment**

---

**Questions?** Review:
- `README.md` - Overview
- `dj-config.json` - Configuration
- `voice-config/signal-thief.json` - Persona details
- `voice-config/formulas.json` - Intro templates

