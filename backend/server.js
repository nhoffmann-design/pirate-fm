import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getRandomIntro, getRandomOutro, getRandomPlug, generateDJMessage } from './dj-intros.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/music', express.static(join(__dirname, '../music'))); // Serve music files

// Database
const db = new Database(process.env.DATABASE_PATH || './pirate.db');
initializeDatabase();

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      mood TEXT NOT NULL,
      headline TEXT,
      suno_id TEXT,
      file_path TEXT NOT NULL,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS headlines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS listeners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      count INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS playlist (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_track_id INTEGER,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS track_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER NOT NULL,
      listener_ip TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(track_id, listener_ip)
    );
  `);

  // Initialize playlist pointer if not exists
  const existing = db.prepare('SELECT * FROM playlist WHERE id = 1').get();
  if (!existing) {
    db.prepare('INSERT INTO playlist (id, current_track_id) VALUES (1, 1)').run();
  }
}

// State
let currentTrack = null;
let listenerCount = 0;
let isPlaying = true;

// Routes

// Get current track with like count
app.get('/api/current', (req, res) => {
  try {
    const playlist = db.prepare('SELECT * FROM playlist WHERE id = 1').get();
    
    if (!playlist) {
      console.error('[API] Playlist not found, initializing...');
      db.prepare('INSERT OR IGNORE INTO playlist (id, current_track_id) VALUES (1, 27)').run();
      const newPlaylist = db.prepare('SELECT * FROM playlist WHERE id = 1').get();
      var trackId = newPlaylist?.current_track_id || 27;
    } else {
      var trackId = playlist.current_track_id;
    }
    
    const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);
    const likes = track ? db.prepare('SELECT COUNT(*) as count FROM track_likes WHERE track_id = ?').get(track.id) : { count: 0 };
    
    console.log(`[API] Playlist: ${JSON.stringify(playlist || 'null')}, Track ID: ${trackId}, Track: ${track?.title || 'null'}`);
    
    res.json({
      track: track || { title: 'Loading...', mood: 'synthwave', file_path: '', likes: 0 },
      listeners: listenerCount,
      isPlaying,
    });
  } catch (err) {
    console.error('[API] /api/current error:', err);
    res.json({
      track: { title: 'Error', mood: 'error', file_path: '', likes: 0 },
      listeners: listenerCount,
      isPlaying,
    });
  }
});

// Get listener count
app.get('/api/listeners', (req, res) => {
  res.json({ count: listenerCount });
});

// Get recent tracks
app.get('/api/tracks', (req, res) => {
  const limit = req.query.limit || 10;
  const tracks = db.prepare('SELECT * FROM tracks ORDER BY created_at DESC LIMIT ?').all(limit);
  res.json(tracks);
});

// Get headlines
app.get('/api/headlines', (req, res) => {
  const limit = req.query.limit || 5;
  const headlines = db.prepare('SELECT * FROM headlines ORDER BY scraped_at DESC LIMIT ?').all(limit);
  res.json(headlines);
});

// Get DJ intro/outro
app.get('/api/dj/:type', (req, res) => {
  const { type } = req.params;
  let message = '';
  
  switch(type) {
    case 'intro':
      message = getRandomIntro();
      break;
    case 'outro':
      message = getRandomOutro();
      break;
    case 'plug':
      message = getRandomPlug();
      break;
    default:
      return res.status(400).json({ error: 'Unknown DJ type' });
  }
  
  res.json({ message, type });
});

// Get DJ intro as audio (TTS)
app.get('/api/dj-audio/:type', async (req, res) => {
  const { type } = req.params;
  let message = '';
  
  switch(type) {
    case 'intro':
      message = getRandomIntro();
      break;
    case 'plug':
      message = getRandomPlug();
      break;
    default:
      return res.status(400).json({ error: 'Unknown DJ type' });
  }
  
  // For now, just return the text message
  // In production, this would call ElevenLabs or similar for TTS
  res.json({ 
    message,
    text: message,
    type,
    note: 'TTS generation would happen here with ElevenLabs API'
  });
});

// Like a track
app.post('/api/tracks/:trackId/like', (req, res) => {
  const { trackId } = req.params;
  const listenerIp = req.ip || 'unknown';
  
  try {
    db.prepare(`
      INSERT INTO track_likes (track_id, listener_ip)
      VALUES (?, ?)
    `).run(trackId, listenerIp);
    
    const likes = db.prepare('SELECT COUNT(*) as count FROM track_likes WHERE track_id = ?').get(trackId);
    res.json({ success: true, likes: likes.count });
  } catch (err) {
    // User already liked this track
    res.status(400).json({ error: 'Already liked', message: 'You already liked this track' });
  }
});

// Unlike a track
app.post('/api/tracks/:trackId/unlike', (req, res) => {
  const { trackId } = req.params;
  const listenerIp = req.ip || 'unknown';
  
  db.prepare('DELETE FROM track_likes WHERE track_id = ? AND listener_ip = ?').run(trackId, listenerIp);
  
  const likes = db.prepare('SELECT COUNT(*) as count FROM track_likes WHERE track_id = ?').get(trackId);
  res.json({ success: true, likes: likes.count });
});

// Get likes for a track
app.get('/api/tracks/:trackId/likes', (req, res) => {
  const { trackId } = req.params;
  const likes = db.prepare('SELECT COUNT(*) as count FROM track_likes WHERE track_id = ?').get(trackId);
  res.json({ trackId, likes: likes.count });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stream current track file (on-demand, not live streaming)
app.get('/api/stream/current', (req, res) => {
  try {
    const playlist = db.prepare('SELECT current_track_id FROM playlist WHERE id = 1').get();
    const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(playlist?.current_track_id);
    
    if (!track) {
      return res.status(404).json({ error: 'No current track' });
    }
    
    console.log('[STREAM] Serving current track:', track.title);
    
    // Serve the track file
    if (track.file_path.startsWith('/music/')) {
      const filePath = join(__dirname, '..', track.file_path);
      res.set('Content-Type', 'audio/mpeg');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'no-cache');
      return res.sendFile(filePath);
    }
    
    res.status(404).json({ error: 'Track file not found' });
  } catch (err) {
    console.error('[STREAM] Error:', err.message);
    res.status(500).json({ error: 'Stream error' });
  }
});

// Audio proxy (handle local files and external URLs)
app.get('/api/stream/:trackId', async (req, res) => {
  const { trackId } = req.params;
  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);
  
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }

  try {
    // If it's a local file path, serve it directly
    if (track.file_path.startsWith('/music/')) {
      const filePath = join(__dirname, '..', track.file_path);
      return res.sendFile(filePath);
    }

    // Otherwise proxy external URLs
    const fetch = (await import('node-fetch')).default;
    const audioRes = await fetch(track.file_path);
    res.set('Content-Type', 'audio/mpeg');
    res.set('Access-Control-Allow-Origin', '*');
    audioRes.body.pipe(res);
  } catch (err) {
    console.error('Stream error:', err);
    res.status(500).json({ error: 'Failed to stream audio' });
  }
});

// Admin: Trigger next track
app.post('/api/next', (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlist WHERE id = 1').get();
  const allTracks = db.prepare('SELECT id FROM tracks ORDER BY id').all();

  if (allTracks.length === 0) {
    return res.status(400).json({ error: 'No tracks in database' });
  }

  const currentIdx = allTracks.findIndex(t => t.id === playlist?.current_track_id);
  const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % allTracks.length : 0;
  const nextId = allTracks[nextIdx].id;
  
  db.prepare('UPDATE playlist SET current_track_id = ?, last_updated = CURRENT_TIMESTAMP WHERE id = 1').run(nextId);

  const newTrack = db.prepare('SELECT * FROM tracks WHERE id = ?').get(nextId);
  currentTrack = newTrack;

  // Broadcast to all connected clients
  io.emit('trackChange', newTrack);

  res.json({ track: newTrack });
});

// Admin: Add track
app.post('/api/tracks', (req, res) => {
  const { title, mood, headline, suno_id, file_path, duration } = req.body;

  if (!title || !mood || !file_path) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = db.prepare(`
    INSERT INTO tracks (title, mood, headline, suno_id, file_path, duration)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, mood, headline, suno_id, file_path, duration);

  res.json({ id: result.lastInsertRowid, title, mood });
});

// Admin: Add headline
app.post('/api/headlines', (req, res) => {
  const { source, title, url } = req.body;

  if (!source || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.prepare(`
    INSERT INTO headlines (source, title, url)
    VALUES (?, ?, ?)
  `).run(source, title, url);

  res.json({ success: true });
});

// WebSocket
io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Send current track on connect
  const playlist = db.prepare('SELECT * FROM playlist WHERE id = 1').get();
  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(playlist?.current_track_id || 1);
  socket.emit('trackChange', track);
  socket.emit('listenerCount', listenerCount);

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// Simulate listener count updates (in production, poll Icecast)
setInterval(() => {
  listenerCount = Math.max(1, Math.floor(Math.random() * 100)); // Placeholder
  io.emit('listenerCount', listenerCount);
}, 5000);

// Auto-advance track (disabled - use frontend audio 'ended' event instead)
// setInterval(() => { ... }, 180000);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🏴‍☠️ Pirate.fm backend running on port ${PORT}`);
  console.log(`   API: http://192.168.4.51:${PORT}`);
  console.log(`   Health: http://192.168.4.51:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Closing database...');
  db.close();
  process.exit(0);
});
