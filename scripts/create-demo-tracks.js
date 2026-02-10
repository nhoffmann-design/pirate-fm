#!/usr/bin/env node

/**
 * Create silent MP3 placeholder tracks for demo/testing
 * Once Nick has real Suno tracks, replace these with actual audio
 */

import fs from 'fs';
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const musicDir = join(__dirname, '../music');

// Track definitions from dj-layer
const tracks = [
  { name: 'Neon-Futures', mood: 'synthwave', duration: 180 },
  { name: 'Digital-Decay', mood: 'synthwave', duration: 180 },
  { name: 'Retro-Vibes', mood: 'synthwave', duration: 180 },
  { name: 'Cyber-Dreams', mood: 'synthwave', duration: 180 },
  { name: 'Electric-Nights', mood: 'synthwave', duration: 180 },
  { name: 'Neon-City', mood: 'synthwave', duration: 180 },

  { name: 'Rain-on-Chrome', mood: 'cyberpunk-lofi', duration: 180 },
  { name: 'Midnight-Code', mood: 'cyberpunk-lofi', duration: 180 },
  { name: 'Distorted-Future', mood: 'cyberpunk-lofi', duration: 180 },
  { name: 'Silent-Protocol', mood: 'cyberpunk-lofi', duration: 180 },
  { name: 'Data-Stream', mood: 'cyberpunk-lofi', duration: 180 },

  { name: 'Underground-Pulse', mood: 'underground-hiphop', duration: 180 },
  { name: 'Cipher-Spit', mood: 'underground-hiphop', duration: 180 },
  { name: 'Street-Signal', mood: 'underground-hiphop', duration: 180 },
  { name: 'Encrypted-Flow', mood: 'underground-hiphop', duration: 180 },
  { name: 'Black-Market-Beats', mood: 'underground-hiphop', duration: 180 },

  { name: 'Ambient-Void', mood: 'ambient-drone', duration: 180 },
  { name: 'Space-Static', mood: 'ambient-drone', duration: 180 },
  { name: 'Echoes-of-Nothing', mood: 'ambient-drone', duration: 180 },
  { name: 'Drift', mood: 'ambient-drone', duration: 180 },
  { name: 'Transmission-End', mood: 'ambient-drone', duration: 180 },

  { name: 'Acid-Trip', mood: 'acid-house', duration: 180 },
  { name: 'Chemical-Signal', mood: 'acid-house', duration: 180 },
  { name: 'Syth-Rave', mood: 'acid-house', duration: 180 },
  { name: 'Analog-Surge', mood: 'acid-house', duration: 180 },
  { name: 'Frequency-Collision', mood: 'acid-house', duration: 180 },
  { name: 'Rave-Artifact', mood: 'acid-house', duration: 180 },

  { name: 'Broken-Machines', mood: 'industrial', duration: 180 },
  { name: 'Iron-Pulse', mood: 'industrial', duration: 180 },
  { name: 'Metal-Drone', mood: 'industrial', duration: 180 },
  { name: 'Machinery-Decay', mood: 'industrial', duration: 180 },
  { name: 'Rust-and-Steel', mood: 'industrial', duration: 180 },

  { name: 'Chaos-Theory', mood: 'experimental', duration: 180 },
  { name: 'Fragment', mood: 'experimental', duration: 180 },
  { name: 'Artifact-13', mood: 'experimental', duration: 180 },
  { name: 'Glitch-Manifest', mood: 'experimental', duration: 180 },
  { name: 'Noise-Palette', mood: 'experimental', duration: 180 },
  { name: 'Abstraction', mood: 'experimental', duration: 180 },

  { name: 'Rebellion-Song', mood: 'punk', duration: 180 },
  { name: 'DIY-Transmission', mood: 'punk', duration: 180 },
  { name: 'Static-Scream', mood: 'punk', duration: 180 },
  { name: 'Anarchist-Radio', mood: 'punk', duration: 180 },
  { name: 'Distortion-Pride', mood: 'punk', duration: 180 },
];

console.log('🎵 Creating demo silence MP3s for testing...');
console.log(`Target directory: ${musicDir}`);

// Create moods directory structure
const moods = new Set(tracks.map(t => t.mood));
for (const mood of moods) {
  const moodDir = join(musicDir, mood);
  if (!fs.existsSync(moodDir)) {
    fs.mkdirSync(moodDir, { recursive: true });
  }
}

// Generate silence MP3 for each track
let created = 0;
for (const track of tracks) {
  const moodDir = join(musicDir, track.mood);
  const trackPath = join(moodDir, `${track.name}.mp3`);

  // Check if ffmpeg is available
  try {
    // Create 3 minutes of silence at 44100Hz
    execSync(
      `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${track.duration} -q:a 9 "${trackPath}" 2>/dev/null`,
      { stdio: 'pipe' }
    );
    created++;
    console.log(`✓ ${track.mood}/${track.name}.mp3`);
  } catch (err) {
    console.error(`✗ Failed to create ${track.name}.mp3:`, err.message);
    // Create an empty file as fallback (will need to be replaced with real audio)
    fs.writeFileSync(trackPath, Buffer.alloc(0));
  }
}

console.log(`\n✅ Created ${created}/${tracks.length} demo tracks`);
console.log(`\n📝 Next steps:`);
console.log(`1. Replace silence files with real Suno tracks`);
console.log(`2. Run: npm run load-music-metadata`);
console.log(`3. Start backend: npm run dev`);
console.log(`4. Start frontend: npm run dev`);
