# Suno Music Generation Guide

## Overview

We're generating 44 AI-powered music tracks across 8 moods using Suno AI (Pro Plan: 2,500 credits/month).

## Suno Pro Details

- **Plan:** Suno Pro
- **Credits/Month:** 2,500
- **Cost per track:** ~10-20 credits (180 sec)
- **Budget for MVP:** 100-200 credits (leaving 2,300+ for ongoing)
- **Commercial Use:** Enabled ✅

## Generation Steps

### 1. Access Suno
- Go to **https://suno.com**
- Log in with Nick's Pro account
- Ensure you're on the Pro plan

### 2. Create Tracks

For each of the 44 tracks below, use the **Create** tab:

1. **Enter Prompt** (from templates in `MUSIC_PLAN.md`)
2. **Select Mood** (optional, helps guide generation)
3. **Choose Duration:** ~3 minutes (180 sec)
4. **Generate** (1-2 min wait)
5. **Download MP3** once complete

### Batch Generation Strategy

To speed up (Suno generates 2 tracks in parallel):

**Round 1 (2 tracks):**
- Synthwave: "Neon Futures"
- Cyberpunk Lo-fi: "Rain City Vibes"
- Wait 2-3 min → Download

**Round 2 (2 tracks):**
- Underground Hip-Hop: "Street Code"
- Ambient Drone: "Void Meditation"
- Wait 2-3 min → Download

Continue alternating between moods to maximize parallelism.

## Track List (44 Total)

### Synthwave (6)
1. **Neon Futures** - AI advancement, driving synths, optimistic
2. **Retro Cyber** - Tech innovation, 80s nostalgia, neon
3. **Midnight Drive** - Digital revolution, moody synths, hypnotic
4. **Chrome Dreams** - Tech optimism, uplifting, electronic
5. **Electric Horizons** - Future tech, expansive soundscape
6. **Synth Requiem** - Tech reflection, melancholic, introspective

### Cyberpunk Lo-fi (6)
1. **Rain City Vibes** - Urban tech, chill beat, atmospheric
2. **Glitch in the Matrix** - Digital dysfunction, experimental, groovy
3. **Neon Rain** - Night life, tech, lofi hip-hop beat
4. **Chill Protocols** - AI/tech but relaxed, chilled-out synths
5. **Night Shift** - Late-night coding vibe, lo-fi beats, chill
6. **Fade to Black** - Tech darkness, moody, introspective beats

### Underground Hip-Hop (5)
1. **Street Code** - Tech activism, boom bap drums, gritty
2. **Hustle 2026** - Startup grind, energetic, raw beats
3. **Break the Chain** - Freedom/resistance, powerful, determined
4. **Real Talk** - Honest perspective, introspective, soulful
5. **Rise Up** - Movement energy, uplifting, revolutionary

### Ambient Drone (5)
1. **Void Meditation** - Emptiness, spacious, contemplative
2. **Cosmic Dust** - Space, ethereal, expansive
3. **System Overload** - Crisis, heavy, distorted drones
4. **Endless Drift** - Uncertainty, slow-moving, hypnotic
5. **Deep Space** - Introspection, dark ambient, minimal

### Acid House (6)
1. **Euphoria Loop** - Endless climb, hypnotic, 303 synths
2. **303 Bliss** - Hypnotic joy, trance, electronic
3. **Unstoppable** - Momentum, driving beat, euphoric
4. **Peak Hours** - Maximum energy, acid house classic, relentless
5. **Acid Dreams** - Trance state, hypnotic, electronic
6. **Infinite Pulse** - Endless rhythm, repetitive, euphoric

### Industrial (5)
1. **Metal Crash** - Destruction, heavy, aggressive
2. **System Failure** - Collapse, dark, mechanical
3. **Pounding Force** - Heavy impact, industrial drums, intense
4. **Iron Age** - Brutal reality, harsh, mechanical
5. **Shattered Glass** - Disruption, experimental noise, intense

### Experimental (6)
1. **Glitch Reality** - Weird tech, abstract, glitchy
2. **Quantum Foam** - Abstract science, experimental, strange
3. **Broken Frequency** - Dysfunction, experimental, unconventional
4. **Chaos Theory** - Unpredictability, avant-garde, abstract
5. **Absurd World** - Weirdness, experimental, surreal
6. **Fractured Space** - Distortion, abstract, boundary-pushing

### Punk (5)
1. **F*** the Algorithm** - Tech rebellion, fast punk, raw
2. **Anarchy Online** - Digital rebellion, punk attitude, energetic
3. **No Compromise** - Defiance, aggressive, powerful
4. **Rage Against** - Anger, fast, raw punk energy
5. **DIY or Die** - Punk ethos, rebellious, fast drums

## Suno Prompt Format

Use this template for consistency:

```
[MOOD] track about [THEME]. [VIBE_DETAILS]. 
Perfect for [USE_CASE]. [EMOTIONAL_TONE].
```

### Example Prompts

**Synthwave:**
> "A neon-drenched synthwave track with 80s aesthetic. Dark, driving synths with a slow-burn crescendo reflecting on AI advancement. Moody yet energetic. Perfect for late-night hacking or introspection."

**Cyberpunk Lo-fi:**
> "Lo-fi hip-hop with cyberpunk elements. Chill, glitchy, atmospheric. Futuristic but relaxed. Captures the blending of human and machine. Perfect for deep focus sessions."

**Underground Hip-Hop:**
> "Raw boom-bap hip-hop beat. Gritty, honest, street-level energy. Celebrates grassroots revolution and change. Punchy drums, warm bass, real talk."

**Ambient Drone:**
> "Atmospheric ambient drone. Meditative, spacious, hypnotic. Reflects on vast systems and uncertainty. Perfect for deep introspection or background meditation."

**Acid House:**
> "Hypnotic acid house with 303 synthesizer. Repetitive, trance-inducing, relentless energy. Captures euphoria amid unstoppable momentum. Dancefloor vibes."

**Industrial:**
> "Heavy industrial track. Mechanical, aggressive, dark. Distorted synths, pounding drums. Reflects on disruption and upheaval. Intense and uncompromising."

**Experimental:**
> "Avant-garde experimental soundscape. Weird, unexpected, boundary-pushing. Explores the absurdity of current events. Abstract instruments, unconventional structure."

**Punk:**
> "Fast, raw punk rock. Rebellious energy, short sharp bursts. Channels anti-establishment spirit. Angry, energetic, DIY attitude. No polish, all rebellion."

## Downloading & Organizing

Once generated:

1. **Download MP3** from Suno
2. **Rename:** `[mood]-[title]-[date]-[suno_id].mp3`
   - Example: `synthwave-neon-futures-2026-02-09-abc123.mp3`
3. **Move to:** `/music/[mood]/[filename].mp3`
4. **Create metadata JSON:**
   ```json
   {
     "title": "Neon Futures",
     "mood": "synthwave",
     "headline": null,
     "suno_id": "abc123",
     "duration": 180,
     "generated_at": "2026-02-09T14:30:00Z"
   }
   ```
5. **Save as:** `/music/[mood]/[filename].json`

## Storage Structure

```
music/
├── synthwave/
│   ├── neon-futures-2026-02-09-abc123.mp3
│   ├── neon-futures-2026-02-09-abc123.json
│   ├── retro-cyber-2026-02-09-xyz789.mp3
│   └── retro-cyber-2026-02-09-xyz789.json
├── cyberpunk-lofi/
│   ├── rain-city-vibes-2026-02-09-def456.mp3
│   └── rain-city-vibes-2026-02-09-def456.json
├── ...
```

## Time Estimate

- **Generation:** 44 tracks × 2 min avg = ~90 minutes (with parallel batching)
- **Download + organize:** ~30 minutes
- **Total:** ~2 hours

**Target:** Start 10am, finish by 1pm

## Quality Check

After generation:

- [ ] All 44 tracks downloaded
- [ ] No duplicates or corrupted files
- [ ] Metadata JSON created for each
- [ ] Files organized by mood
- [ ] File sizes reasonable (~8-15 MB per 3 min track)
- [ ] Sample listen to 2-3 tracks (spot check)

## Next Steps

After all 44 tracks are ready:

1. Upload to S3 or self-hosted storage
2. Load metadata into SQLite database
3. Create initial playlist (randomized)
4. Test playback on backend
5. Feed into Icecast stream (Wednesday)

## Notes

- **Suno API:** May have rate limits; batch in parallel when possible
- **Quality:** Trust Suno's AI to deliver; regenerate if bad
- **Variety:** Ensure mood diversity (not all similar sounds)
- **Naming:** Consistent naming helps with backend automation
- **Backup:** Keep local copies until uploaded to storage
