import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// Get current track
app.get('/api/current', (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlist WHERE id = 1').get();
  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(playlist?.current_track_id || 1);
  
  res.json({
    track: track || { title: 'Loading...', mood: 'synthwave', file_path: '' },
    listeners: listenerCount,
    isPlaying,
  });
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin: Trigger next track
app.post('/api/next', (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlist WHERE id = 1').get();
  const trackCount = db.prepare('SELECT COUNT(*) as count FROM tracks').get().count;

  if (trackCount === 0) {
    return res.status(400).json({ error: 'No tracks in database' });
  }

  const nextId = ((playlist?.current_track_id || 0) % trackCount) + 1;
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

// Auto-advance track (simulate track rotation)
setInterval(() => {
  if (isPlaying) {
    const playlist = db.prepare('SELECT * FROM playlist WHERE id = 1').get();
    const trackCount = db.prepare('SELECT COUNT(*) as count FROM tracks').get().count;

    if (trackCount > 0) {
      const nextId = ((playlist?.current_track_id || 0) % trackCount) + 1;
      db.prepare('UPDATE playlist SET current_track_id = ?, last_updated = CURRENT_TIMESTAMP WHERE id = 1').run(nextId);

      const newTrack = db.prepare('SELECT * FROM tracks WHERE id = ?').get(nextId);
      io.emit('trackChange', newTrack);
      console.log(`[PLAYER] Now playing: ${newTrack?.title}`);
    }
  }
}, 180000); // Every 3 minutes (in production, use track duration)

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🏴‍☠️ Pirate.fm backend running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Closing database...');
  db.close();
  process.exit(0);
});
