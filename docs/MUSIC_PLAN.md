# Music Generation Plan

## Strategy

**40-50 tracks** across 8 moods. Goal: 5-6 tracks per mood, total ~45 tracks.

Suno Pro: 2,500 credits/month. Each track costs ~10-20 credits depending on length. Budget: ~100 credits for initial batch (leaving 2,400+ for ongoing generation).

## Generation Process

### Phase 1: Batch Generation (Today - Monday)

Manual generation via Suno Web UI or API. Create playlist/folder per mood. 

**Timeline:**
- Synthwave: 6 tracks
- Cyberpunk Lo-fi: 6 tracks
- Underground Hip-Hop: 5 tracks
- Ambient Drone: 5 tracks
- Acid House: 6 tracks
- Industrial: 5 tracks
- Experimental: 6 tracks
- Punk: 5 tracks

**Total: 44 tracks**

### Phase 2: Ongoing (After launch)

Every 4-6 hours:
1. Scraper fetches top 5 headlines from HN/TC/Wired/CNN
2. LLM converts headline into music prompt (creative + on-brand)
3. Suno API generates 1-2 new tracks
4. Store metadata (headline, mood, generated_at)
5. Add to rotation

## Suno Prompt Templates

Each prompt should be **specific + evocative** to inspire unique music.

### Synthwave
```
"Neon-drenched synthwave track with 80s aesthetic. Dark, driving synths with a slow-burn crescendo. Retro-futuristic vibe, moody yet energetic. [HEADLINE_TWIST]"
```

Examples:
- "...reflecting on AI advancement and digital futures"
- "...evoking a late-night drive through a cyberpunk city"
- "...capturing the tension between progress and nostalgia"

### Cyberpunk Lo-fi
```
"Lo-fi hip-hop with cyberpunk elements. Chill, glitchy, atmospheric. Futuristic but relaxed. Perfect for late-night coding or introspection. [HEADLINE_MOOD]"
```

Examples:
- "...inspired by tech disruption and digital resistance"
- "...reflecting on the blending of human and machine"

### Underground Hip-Hop
```
"Raw boom-bap hip-hop beat. Gritty, honest, underground vibe. Punchy drums, warm bass. Street-level energy. [HEADLINE_ANGLE]"
```

Examples:
- "...capturing grassroots revolution and change"
- "...celebrating counter-culture and rebellion"

### Ambient Drone
```
"Atmospheric ambient drone. Meditative, spacious, hypnotic. Perfect for deep focus or late-night introspection. Slow-moving textures. [HEADLINE_ATMOSPHERE]"
```

Examples:
- "...reflecting on uncertainty and vast systems"
- "...invoking contemplation of futures unknown"

### Acid House
```
"Hypnotic acid house with 303 synthesizer. Repetitive, trance-inducing, relentless energy. Dancefloor vibes. [HEADLINE_PULSE]"
```

Examples:
- "...capturing unstoppable momentum and change"
- "...evoking euphoria amid chaos"

### Industrial
```
"Heavy industrial track. Mechanical, aggressive, dark. Distorted synths, pounding drums. Intense and uncompromising. [HEADLINE_FORCE]"
```

Examples:
- "...reflecting on disruption and upheaval"
- "...capturing the weight of transformation"

### Experimental
```
"Avant-garde experimental soundscape. Weird, unexpected, boundary-pushing. Abstract instruments, unconventional structure. [HEADLINE_WILD]"
```

Examples:
- "...exploring the absurdity of current events"
- "...capturing the strangeness of our times"

### Punk
```
"Fast, raw punk rock. Rebellious energy, short sharp bursts. Angry, energetic, DIY spirit. No polish, all attitude. [HEADLINE_RAGE]"
```

Examples:
- "...channeling anti-establishment spirit"
- "...capturing youthful resistance and defiance"

## Headline → Mood Mapping

**Synthwave:** Tech breakthroughs, futuristic announcements, AI advances, space news
**Cyberpunk Lo-fi:** Tech disruption, social media drama, digital privacy, remote work news
**Underground Hip-Hop:** Social justice, activism, grassroots movements, startup hustle
**Ambient Drone:** Economic uncertainty, climate news, systemic crises, philosophical questions
**Acid House:** Market rallies, crypto gains, euphoric announcements, viral moments
**Industrial:** Major disruptions, scandals, policy shifts, upheaval, bankruptcy news
**Experimental:** Absurd stories, weird science, bizarre events, unexpected twists
**Punk:** Political controversies, regulation fights, corporate vs indie, rule-breaking news

## Storage Format

Each track stored as:
```
music/[mood]/[title]-[date]-[suno_id].mp3
Metadata: JSON file with headline, generated_at, duration, mood
```

Example:
```
music/synthwave/neural-networks-rising-2026-02-09-xyz123.mp3
music/synthwave/neural-networks-rising-2026-02-09-xyz123.json
{
  "title": "Neural Networks Rising",
  "mood": "synthwave",
  "headline": "New breakthrough in large language model efficiency",
  "headline_source": "HackerNews",
  "generated_at": "2026-02-09T20:30:00Z",
  "suno_id": "xyz123",
  "duration": 180,
  "inspired_by_url": "https://news.ycombinator.com/..."
}
```

## Initial Batch: Track Ideas

### Synthwave (6)
1. "Neon Futures" - AI advancement
2. "Retro Cyber" - Tech innovation
3. "Midnight Drive" - Digital revolution
4. "Chrome Dreams" - Tech optimism
5. "Electric Horizons" - Tech frontier
6. "Synth Requiem" - Reflection on tech

### Cyberpunk Lo-fi (6)
1. "Rain City Vibes" - Urban tech
2. "Glitch in the Matrix" - Digital dysfunction
3. "Neon Rain" - Night life, tech
4. "Chill Protocols" - AI/tech but relaxed
5. "Night Shift" - Late-night coding vibe
6. "Fade to Black" - Tech darkness

### Underground Hip-Hop (5)
1. "Street Code" - Tech activism
2. "Hustle 2026" - Startup grind
3. "Break the Chain" - Freedom/resistance
4. "Real Talk" - Honest perspective
5. "Rise Up" - Movement energy

### Ambient Drone (5)
1. "Void Meditation" - Emptiness
2. "Cosmic Dust" - Space
3. "System Overload" - Crisis
4. "Endless Drift" - Uncertainty
5. "Deep Space" - Introspection

### Acid House (6)
1. "Euphoria Loop" - Endless climb
2. "303 Bliss" - Hypnotic joy
3. "Unstoppable" - Momentum
4. "Peak Hours" - Maximum energy
5. "Acid Dreams" - Trance state
6. "Infinite Pulse" - Endless rhythm

### Industrial (5)
1. "Metal Crash" - Destruction
2. "System Failure" - Collapse
3. "Pounding Force" - Heavy impact
4. "Iron Age" - Brutal reality
5. "Shattered Glass" - Disruption

### Experimental (6)
1. "Glitch Reality" - Weird tech
2. "Quantum Foam" - Abstract science
3. "Broken Frequency" - Dysfunction
4. "Chaos Theory" - Unpredictability
5. "Absurd World" - Weirdness
6. "Fractured Space" - Distortion

### Punk (5)
1. "F*** the Algorithm" - Tech rebellion
2. "Anarchy Online" - Digital rebellion
3. "No Compromise" - Defiance
4. "Rage Against" - Anger
5. "DIY or Die" - Punk ethos

## Next Steps

1. Generate all 44 tracks (today)
2. Organize into folders by mood
3. Create metadata JSON for each
4. Upload to storage (S3 or self-hosted)
5. Build playlist manager (backend)
6. Test Icecast streaming (Wednesday)
