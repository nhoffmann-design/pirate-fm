#!/usr/bin/env node

/**
 * Signal Thief DJ Layer Integration
 * Integrates generated intros, stings, and segments into Pirate.fm backend
 * 
 * Usage:
 *   node dj-integration.js --integrate    (load intros into database)
 *   node dj-integration.js --verify        (verify integration)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load configuration
const configPath = path.join(__dirname, '..', 'dj-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Load metadata
const metadataPath = path.join(__dirname, '..', 'tracks-metadata.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

// Database path
const dbPath = path.join(__dirname, '..', '..', 'backend', 'pirate.db');

/**
 * Initialize database with DJ layer schema
 */
function initializeDJSchema(db) {
  console.log('📊 Initializing DJ layer schema...');

  // Extend tracks table with DJ layer columns if they don't exist
  const tableInfo = db.prepare("PRAGMA table_info(tracks)").all();
  const columnNames = tableInfo.map(col => col.name);

  const columnsToAdd = [
    { name: 'intro_tts_path', type: 'TEXT', default: null },
    { name: 'intro_formula', type: 'INTEGER', default: 1 },
    { name: 'segment_type', type: 'TEXT', default: 'headline' },
    { name: 'segment_text', type: 'TEXT', default: null },
    { name: 'audio_stings', type: 'TEXT', default: '[]' },
  ];

  for (const column of columnsToAdd) {
    if (!columnNames.includes(column.name)) {
      try {
        db.exec(`ALTER TABLE tracks ADD COLUMN ${column.name} ${column.type} DEFAULT '${column.default}'`);
        console.log(`   ✅ Added column: ${column.name}`);
      } catch (error) {
        console.log(`   ℹ️  Column already exists: ${column.name}`);
      }
    }
  }

  // Create DJ segments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS dj_segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER NOT NULL,
      segment_type TEXT NOT NULL,
      segment_text TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(track_id) REFERENCES tracks(id)
    );
  `);

  console.log('   ✅ DJ schema ready');
}

/**
 * Load intro manifest
 */
function loadIntroManifest() {
  const manifestPath = path.join(__dirname, '..', 'output', 'intros', 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.log('   ⚠️  No manifest found. Run: node generate-intros.js --batch');
    return null;
  }

  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

/**
 * Integrate intros into database
 */
function integrateIntros(db, manifest) {
  if (!manifest) {
    console.log('❌ No intro manifest found');
    return;
  }

  console.log(`\n🎙️  Integrating ${manifest.total} intros into database...\n`);

  let updated = 0;
  let failed = 0;

  for (const intro of manifest.tracks) {
    const track = metadata.tracks.find(t => t.id === intro.track_id);
    if (!track) {
      console.log(`   ⚠️  Track #${intro.track_id} not in metadata. Skipping.`);
      failed++;
      continue;
    }

    const segmentTypes = ['headline', 'advisory', 'regulation'];
    const segmentType = segmentTypes[intro.track_id % 3];
    const segmentText = getSegmentText(track, segmentType);

    // Build audio sting references
    const audioStings = [];
    
    // Modem before intro
    if (fs.existsSync(path.join(__dirname, '..', config.audio_stings.modem.file))) {
      audioStings.push({
        type: 'modem',
        file: config.audio_stings.modem.file,
        duration: config.audio_stings.modem.duration_seconds,
        placement: 'before_intro',
      });
    }

    // Tape after headline
    if (fs.existsSync(path.join(__dirname, '..', config.audio_stings.tape.file))) {
      audioStings.push({
        type: 'tape',
        file: config.audio_stings.tape.file,
        duration: config.audio_stings.tape.duration_seconds,
        placement: 'after_headline',
      });
    }

    // Whisper outro
    if (fs.existsSync(path.join(__dirname, '..', config.audio_stings.whisper.file))) {
      audioStings.push({
        type: 'whisper',
        file: config.audio_stings.whisper.file,
        duration: config.audio_stings.whisper.duration_seconds,
        placement: 'outro',
      });
    }

    try {
      // Update tracks table
      const introPath = `dj-layer/output/intros/${intro.filename}`;
      
      db.prepare(`
        UPDATE tracks 
        SET 
          intro_tts_path = ?,
          intro_formula = ?,
          segment_type = ?,
          segment_text = ?,
          audio_stings = ?
        WHERE id = ?
      `).run(
        introPath,
        intro.formula,
        segmentType,
        segmentText,
        JSON.stringify(audioStings),
        intro.track_id
      );

      // Insert into segments table
      db.prepare(`
        INSERT INTO dj_segments (track_id, segment_type, segment_text)
        VALUES (?, ?, ?)
      `).run(intro.track_id, segmentType, segmentText);

      console.log(`   ✅ Track #${intro.track_id}: ${track.title}`);
      updated++;
    } catch (error) {
      console.log(`   ❌ Track #${intro.track_id}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Integration Summary:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Failed: ${failed}`);
}

/**
 * Get segment text
 */
function getSegmentText(track, segmentType) {
  const segments = config.segments;
  
  switch (segmentType) {
    case 'headline':
      const headlineTemplate = segments.headlines[track.intensity > 3 ? 'heavy' : 'light'];
      return headlineTemplate.replace('[HEADLINE]', track.headline);
    
    case 'advisory':
      const advisoryTemplate = segments.transmission[track.intensity > 3 ? 'intense' : 'chill'];
      return advisoryTemplate.replace('[MOOD]', track.mood);
    
    case 'regulation':
      return segments.regulation[track.id % segments.regulation.length];
    
    default:
      return '';
  }
}

/**
 * Verify integration
 */
function verifyIntegration(db) {
  console.log('\n✅ Verifying DJ layer integration...\n');

  const tracksWithIntros = db.prepare(`
    SELECT COUNT(*) as count FROM tracks WHERE intro_tts_path IS NOT NULL
  `).get();

  const totalTracks = db.prepare(`
    SELECT COUNT(*) as count FROM tracks
  `).get();

  console.log(`📊 Database Status:`);
  console.log(`   Total tracks: ${totalTracks.count}`);
  console.log(`   Tracks with intros: ${tracksWithIntros.count}`);
  console.log(`   Coverage: ${((tracksWithIntros.count / totalTracks.count) * 100).toFixed(1)}%\n`);

  // Sample tracks
  const sampleTracks = db.prepare(`
    SELECT id, title, intro_formula, segment_type, intro_tts_path 
    FROM tracks 
    WHERE intro_tts_path IS NOT NULL 
    LIMIT 5
  `).all();

  if (sampleTracks.length > 0) {
    console.log('📋 Sample Integrated Tracks:');
    for (const track of sampleTracks) {
      console.log(`   #${track.id}: ${track.title}`);
      console.log(`        Formula: ${track.intro_formula}/5`);
      console.log(`        Segment: ${track.segment_type}`);
      console.log(`        Intro: ${path.basename(track.intro_tts_path)}`);
    }
  }

  // Check audio stings
  const stingsPath = path.join(__dirname, '..', 'audio-stings');
  if (fs.existsSync(stingsPath)) {
    const stings = fs.readdirSync(stingsPath);
    console.log(`\n🎵 Audio Stings (${stings.length} files):`);
    for (const sting of stings) {
      const filepath = path.join(stingsPath, sting);
      const size = (fs.statSync(filepath).size / 1024).toFixed(1);
      console.log(`   ${sting} (${size}KB)`);
    }
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const integrateArg = args.includes('--integrate');
  const verifyArg = args.includes('--verify');

  console.log('\n🎙️  Signal Thief DJ Layer Integration\n');

  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Database not found: ${dbPath}`);
    console.error('   Run the backend first to initialize the database.');
    process.exit(1);
  }

  const db = new Database(dbPath);

  try {
    if (integrateArg) {
      initializeDJSchema(db);
      const manifest = loadIntroManifest();
      if (manifest) {
        integrateIntros(db, manifest);
      }
    } else if (verifyArg) {
      verifyIntegration(db);
    } else {
      console.log('Usage:');
      console.log('  node dj-integration.js --integrate   (load intros into database)');
      console.log('  node dj-integration.js --verify       (verify integration status)');
      console.log('\nBefore integrating, run:');
      console.log('  node generate-intros.js --batch');
      process.exit(1);
    }

    console.log('\n✅ Done!\n');
  } finally {
    db.close();
  }
}

main();
