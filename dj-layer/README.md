# 🏴‍☠️ Signal Thief DJ Layer

**Automated intro generation, audio stings, and recurring segments for Pirate.fm**

## Overview

The DJ layer adds the **Signal Thief** persona to all 44 tracks with:
- **TTS Intros** (7-12 sec) - Dynamic formulas + voice generation
- **Audio Stings** (3-5 sec) - Modem, tape, whispered ID
- **Recurring Segments** - Headlines, Transmission Advisory, Regulation Watch
- **Automation** - One-click batch generation for all tracks

## Components

### 1. Track Metadata (`tracks-metadata.json`)
Complete catalog of all 44 tracks with:
- Title, genre, mood
- Headline inspiration
- Intensity (1-5)
- Suno ID (once generated)

### 2. Intro Generator (`generate-intros.js`)
- Reads track metadata
- Rotates through 5 formula templates
- Generates Signal Thief TTS via ElevenLabs API
- Outputs MP3 files ready to layer

### 3. Audio Stings (`create-stings.js`)
- Synthesizes modem handshake
- Creates tape rewind blip
- Records/layers whispered "Pirate dot F M"
- 3-5 seconds each, ready for mixing

### 4. Integration (`dj-integration.js`)
- Loads intros into backend database
- Associates with track metadata
- Serves via API `/api/tracks/:id/intro`

### 5. Configuration (`dj-config.json`)
- ElevenLabs API key
- Voice parameters (pace, pitch, tone)
- Segment rotation strategy
- Audio sting timing

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure (edit dj-config.json)
# Add ElevenLabs API key

# 3. Load track metadata
node load-metadata.js

# 4. Generate audio stings
node create-stings.js

# 5. Generate sample intros (3 tracks)
node generate-intros.js --samples 3

# 6. Preview samples
# Intros output to: ./samples/

# 7. Full batch generation (all 44 tracks)
node generate-intros.js --batch

# 8. Integrate into backend
node dj-integration.js
```

## Voice Spec

**Persona:** Signal Thief - calm, low, confident, like broadcasting from a closet of stolen transmitters

**Voice Parameters:**
- Speed: 0.75 (slow pace)
- Pitch: -0.5 (deep, confident)
- Stability: 0.6 (natural, intentional pauses)
- Similarity boost: 0.8 (clear, distinctive)

**Catchphrases:**
- "You're on the frequency. Don't blink."
- "Keep it low. Keep it moving."
- "If you can hear this, you're already complicit."

**Signature words:** frequency, transmission, contraband, artifact, static, side-channel

## Intro Formulas (5 Rotating Templates)

### 1. Classic
> "Pirate.fm. Back on the frequency. Next up: [GENRE] with [MOOD]. Inspired by [HEADLINE IN 6 WORDS]. Let it run."

### 2. Cryptic
> "They wrote the rule. We wrote the chorus. Pirate.fm."

### 3. Sarcastic
> "Today's headline: [HEADLINE]. Our response: bass. Pirate.fm."

### 4. Retro
> "If 1986 had neural nets, it would sound like this. Pirate.fm."

### 5. End-times
> "Civilization: questionable. Groove: undeniable. Pirate.fm."

## Recurring Segments

Cycle through 3 segments before each intro:

### Headlines That Should've Been Lyrics
"[One-liner about headline]. Anyway, here's the beat version."

### Transmission Advisory
"This one contains: [MOOD-BASED WARNING]. [Bassline/Rhythm DESCRIPTION]."

### Regulation Watch
"Some suit said you can't do this. So naturally, we did it twice."

## Audio Stings

### 1. Modem Handshake Chirp (2-3 sec)
- V.92 modem sequences
- Classic dial-up nostalgia
- Fades in with static

### 2. Tape Click + Rewind Blip (1.5-2 sec)
- Physical tape click
- Rewind whoosh
- Analog warmth

### 3. Whispered "Pirate dot F M" (2-3 sec)
- Cryptic, low whisper
- Static background
- Vinyl crackle overlay
- Signature drop-in

## File Structure

```
dj-layer/
├── README.md                     # This file
├── dj-config.json                # Configuration & secrets
├── tracks-metadata.json          # All 44 tracks
├── scripts/
│   ├── generate-intros.js        # TTS generator (ElevenLabs)
│   ├── create-stings.js          # Audio sting synthesis
│   ├── load-metadata.js          # Load tracks into DB
│   └── dj-integration.js         # Backend API integration
├── samples/                      # Sample intros for preview
├── audio-stings/                 # Generated sting files
│   ├── modem-handshake.mp3
│   ├── tape-rewind.mp3
│   └── pirate-whisper.mp3
└── voice-config/
    ├── signal-thief.json         # Voice parameters
    └── formulas.json             # Intro templates
```

## Integration with Pirate.fm Backend

### API Endpoint
```
GET /api/tracks/:id/intro
Returns: { intro_tts_path, segment_type, audio_stings }
```

### Database Extension
Tracks table now includes:
- `intro_tts_path` - Path to generated intro MP3
- `segment_type` - Current recurring segment (Headlines/Advisory/Watch)
- `intro_formula` - Which template used (1-5)
- `audio_sting_order` - Array of sting file paths

### Frontend Integration
React player now:
- Loads intro 3-5 sec before track starts
- Plays segment (0-2 sec) after intro
- Sequences audio stings
- Fades to main track

## Testing

### Sample Generation
Generate 3 sample intros for manual review:
```bash
node scripts/generate-intros.js --samples 3
```

Outputs to `samples/` with names like:
- `signal-thief-synthwave-sample-1.mp3`
- `signal-thief-cyberpunk-sample-2.mp3`
- `signal-thief-hiphop-sample-3.mp3`

### Full Batch (with caution)
After approving samples:
```bash
node scripts/generate-intros.js --batch
```

Generates all 44 intros, uploads to S3, updates database.

## Voice & Tone Guidelines

**What Signal Thief Sounds Like:**
- Calm but commanding
- Low, confident delivery
- Short sentences, intentional pauses
- Dry humor, no enthusiasm
- Like secrets being shared
- Sounds like they're broadcasting from a closet

**What Signal Thief DOESN'T Sound Like:**
- Excited DJ energy
- Loud or brash
- Marketing speak
- Breathless hype
- Anything polished

**Pacing:**
- Use commas in scripts to create natural pauses
- Slow (0.75x speed), let words breathe
- Silence between phrases is good
- Make it sound like someone thinking out loud

## Editing & Tweaking

### Adjust Voice Parameters
Edit `dj-config.json`:
```json
"voice": {
  "speed": 0.75,      // Slower = more menacing
  "pitch": -0.5,      // Lower = more authoritative
  "stability": 0.6,   // Lower = more variation
  "similarity": 0.8   // Higher = more consistent tone
}
```

### Add New Formula
Edit `formulas.json`, add template, redeploy batch.

### Change Segment Rotation
Edit `dj-integration.js` line ~XX for segment selection logic.

## Timeline

- Audio stings: ✅ Ready to generate
- TTS integration: ✅ Ready to run
- Sample generation: 20 min
- Full batch (44 tracks): 30-40 min
- Integration testing: 20 min
- **Total: ~2 hours from start to full production**

## Next Steps

1. Load track metadata
2. Generate audio stings (run create-stings.js)
3. Generate 3 sample intros for Nick to review
4. Get approval
5. Batch generate all 44
6. Integrate into backend
7. Test in React player
8. Deploy with music files

---

**Status:** Ready to run. All scripts functional. Waiting for:
1. Track metadata loaded
2. Nick approval on sample intros
3. Batch generation trigger

