import Database from 'better-sqlite3';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database('/var/www/pirate-fm/backend/pirate.db');

const ICECAST_HOST = 'localhost';
const ICECAST_PORT = 8000;
const ICECAST_MOUNT = '/live';
const ICECAST_PASSWORD = 'pirate123';

let currentTrackIndex = 0;
let allTracks = [];

function getAllTracks() {
  return db.prepare('SELECT * FROM tracks ORDER BY id').all();
}

function getCurrentTrack() {
  const playlist = db.prepare('SELECT current_track_id FROM playlist WHERE id = 1').get();
  return db.prepare('SELECT * FROM tracks WHERE id = ?').get(playlist.current_track_id);
}

async function streamTrackToRequest(req, track) {
  return new Promise((resolve) => {
    const filePath = path.join('/var/www/pirate-fm/backend', '..', track.file_path);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      resolve();
      return;
    }

    try {
      const fileStream = fs.createReadStream(filePath);
      let finished = false;

      fileStream.on('end', () => {
        console.log(`[ICECAST] Finished: ${track.title}`);
        finished = true;
        resolve();
      });

      fileStream.on('error', (err) => {
        console.error(`[ICECAST] File error: ${err.message}`);
        finished = true;
        resolve();
      });

      console.log(`[ICECAST] Streaming: ${track.title}`);
      fileStream.pipe(req, { end: false });
    } catch (err) {
      console.error(`[ICECAST] Setup error: ${err.message}`);
      resolve();
    }
  });
}

async function runSourceClient() {
  console.log('🏴☠️ Pirate FM Icecast Source Client Starting...');

  allTracks = getAllTracks();
  console.log(`[TRACKS] Loaded ${allTracks.length} tracks\n`);

  if (allTracks.length === 0) {
    console.error('❌ No tracks');
    process.exit(1);
  }

  const fileSize = 10000000; // Dummy size for SOURCE header (Icecast accepts this)

  const options = {
    hostname: ICECAST_HOST,
    port: ICECAST_PORT,
    path: ICECAST_MOUNT,
    method: 'SOURCE',
    auth: `source:${ICECAST_PASSWORD}`,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Ice-Name': 'Pirate FM',
      'Ice-Description': 'Retro transmissions from the future',
      'Ice-Genre': 'Electronic',
      'Ice-URL': 'https://pirate.fm',
      'Ice-Public': '1',
      'Ice-Bitrate': '128'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`[ICECAST] Connected - Status: ${res.statusCode}`);
    
    if (res.statusCode !== 200) {
      console.error(`❌ Icecast error: ${res.statusCode}`);
      process.exit(1);
    }

    res.on('close', () => {
      console.log('[ICECAST] Connection closed');
      process.exit(0);
    });

    res.on('error', (err) => {
      console.error('[ICECAST] Response error:', err.message);
      process.exit(1);
    });
  });

  req.on('error', (err) => {
    console.error('[ICECAST] Request error:', err.message);
    process.exit(1);
  });

  let trackCounter = 0;

  while (true) {
    try {
      const track = getCurrentTrack();
      if (!track) {
        console.error('❌ No current track');
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      trackCounter++;
      console.log(`\n[${trackCounter}] Playing: ${track.title}`);
      await streamTrackToRequest(req, track);

      // NOTE: Do NOT advance playlist here - frontend audio element controls advancement
      // This prevents race conditions between backend and frontend next calls
      // The Icecast source just streams whatever /api/current returns
    } catch (err) {
      console.error('[ERROR]', err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN]');
  db.close();
  process.exit(0);
});

runSourceClient().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
