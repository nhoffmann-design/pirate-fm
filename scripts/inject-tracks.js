#!/usr/bin/env node

/**
 * Inject real MP3 tracks from music/ directory into database
 * Usage: node inject-tracks.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Database from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const musicDir = path.join(__dirname, '../music');
const dbPath = path.join(__dirname, '../backend/pirate.db');

console.log('🎵 Injecting tracks from music directory...');
console.log(`Music directory: ${musicDir}`);
console.log(`Database: ${dbPath}`);

// Open database
const db = new Database(dbPath);

// Clear existing tracks
db.prepare('DELETE FROM tracks').run();
console.log('Cleared existing tracks.');

let injected = 0;
const moods = new Set();

// Recursively find all MP3s
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.mp3')) {
      const mood = path.basename(path.dirname(fullPath));
      const title = path.basename(file, '.mp3');
      const relPath = path.relative(path.join(__dirname, '..'), fullPath);
      
      // Skip test tracks
      if (title === 'test-track') return;
      
      moods.add(mood);
      
      // Insert into database
      const result = db.prepare(`
        INSERT INTO tracks (title, mood, headline, file_path, duration)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        title,
        mood,
        `From ${mood} collection`,
        `/music/${mood}/${file}`, // Relative path for serving
        180 // Default duration
      );
      
      console.log(`✓ ${mood}/${title}`);
      injected++;
    }
  }
}

walkDir(musicDir);

// Update playlist to start at track 1
db.prepare('UPDATE playlist SET current_track_id = 1 WHERE id = 1').run();

console.log(`\n✅ Injected ${injected} tracks`);
console.log(`📊 Moods: ${Array.from(moods).join(', ')}`);
console.log(`\n🎙️ Next steps:`);
console.log(`1. Set up static file serving for /music/ directory`);
console.log(`2. Restart backend: npm start`);
console.log(`3. Refresh browser and click play!`);

db.close();
