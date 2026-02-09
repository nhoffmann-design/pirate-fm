#!/usr/bin/env node

/**
 * Load Track Metadata into Database
 * Populates the tracks table with initial metadata for all 44 tracks
 * 
 * Usage:
 *   node load-metadata.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load metadata
const metadataPath = path.join(__dirname, '..', 'tracks-metadata.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

// Database path
const dbPath = path.join(__dirname, '..', '..', 'backend', 'pirate.db');

/**
 * Main execution
 */
function main() {
  console.log('\n📚 Track Metadata Loader\n');

  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Database not found: ${dbPath}`);
    console.error('   Ensure the backend server has been run at least once.');
    process.exit(1);
  }

  const db = new Database(dbPath);

  try {
    console.log(`Loading metadata for ${metadata.tracks.length} tracks...\n`);

    let inserted = 0;
    let skipped = 0;

    for (const track of metadata.tracks) {
      // Check if track already exists
      const existing = db.prepare('SELECT id FROM tracks WHERE id = ?').get(track.id);

      if (existing) {
        console.log(`   ⏭️  Track #${track.id} already exists. Skipping.`);
        skipped++;
        continue;
      }

      try {
        // Create placeholder file path (will be updated when actual files arrive)
        const filePathPlaceholder = `music/${track.genre}/${track.title.toLowerCase().replace(/\s+/g, '-')}.mp3`;

        db.prepare(`
          INSERT INTO tracks (
            id,
            title,
            mood,
            headline,
            file_path,
            duration
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          track.id,
          track.title,
          track.mood,
          track.headline,
          filePathPlaceholder,
          180 // Default 3-minute duration
        );

        console.log(`   ✅ Track #${track.id}: ${track.title} (${track.genre})`);
        inserted++;
      } catch (error) {
        console.log(`   ❌ Track #${track.id}: ${error.message}`);
      }
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Inserted: ${inserted}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);

    // Show sample
    const allTracks = db.prepare('SELECT COUNT(*) as count FROM tracks').get();
    console.log(`   📈 Total tracks in DB: ${allTracks.count}\n`);

    // Verify by mood
    const byMood = db.prepare(`
      SELECT mood, COUNT(*) as count 
      FROM tracks 
      GROUP BY mood 
      ORDER BY count DESC
    `).all();

    if (byMood.length > 0) {
      console.log('📋 Tracks by Mood:');
      for (const row of byMood) {
        console.log(`   ${row.mood}: ${row.count}`);
      }
      console.log();
    }

    // Verify by genre
    const byGenre = db.prepare(`
      SELECT 
        CASE 
          WHEN title LIKE '%Neon%' OR title LIKE '%Retro%' OR title LIKE '%Midnight%' OR title LIKE '%Chrome%' OR title LIKE '%Electric%' OR title LIKE '%Synth%' THEN 'synthwave'
          WHEN title LIKE '%Rain%' OR title LIKE '%Glitch%' OR title LIKE '%Neon%' OR title LIKE '%Chill%' OR title LIKE '%Night%' OR title LIKE '%Fade%' THEN 'cyberpunk-lofi'
          WHEN title LIKE '%Street%' OR title LIKE '%Hustle%' OR title LIKE '%Break%' OR title LIKE '%Real%' OR title LIKE '%Rise%' THEN 'underground-hiphop'
          WHEN title LIKE '%Void%' OR title LIKE '%Cosmic%' OR title LIKE '%System%' OR title LIKE '%Endless%' OR title LIKE '%Deep%' THEN 'ambient-drone'
          WHEN title LIKE '%Euphoria%' OR title LIKE '%303%' OR title LIKE '%Unstoppable%' OR title LIKE '%Peak%' OR title LIKE '%Acid%' OR title LIKE '%Infinite%' THEN 'acid-house'
          WHEN title LIKE '%Metal%' OR title LIKE '%Failure%' OR title LIKE '%Pounding%' OR title LIKE '%Iron%' OR title LIKE '%Shattered%' THEN 'industrial'
          WHEN title LIKE '%Glitch%' OR title LIKE '%Quantum%' OR title LIKE '%Broken%' OR title LIKE '%Chaos%' OR title LIKE '%Absurd%' OR title LIKE '%Fractured%' THEN 'experimental'
          WHEN title LIKE '%Fuck%' OR title LIKE '%Anarchy%' OR title LIKE '%Compromise%' OR title LIKE '%Rage%' OR title LIKE '%DIY%' THEN 'punk'
          ELSE 'unknown'
        END as genre,
        COUNT(*) as count
      FROM tracks
      GROUP BY genre
      ORDER BY count DESC
    `).all();

    if (byGenre.length > 0) {
      console.log('🎸 Tracks by Genre:');
      for (const row of byGenre) {
        console.log(`   ${row.genre}: ${row.count}`);
      }
      console.log();
    }

  } finally {
    db.close();
  }

  console.log('✅ Metadata loaded!\n');
  console.log('Next steps:');
  console.log('  1. node create-stings.js           (create audio stings)');
  console.log('  2. node generate-intros.js --samples 3  (generate sample intros)');
  console.log('  3. Review samples, then run:');
  console.log('  4. node generate-intros.js --batch (generate all intros)');
  console.log('  5. node dj-integration.js --integrate (load into database)\n');
}

main();
