import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import { BootScreen } from './BootScreen';
import { Live } from './pages/Live';
import { Archive } from './pages/Archive';
import { About } from './pages/About';
import { Support } from './pages/Support';
import logo from './assets/pirate-fm-logo.png';

// Use relative URLs to avoid mixed-content issues and local network permission prompts
const BASE_URL = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000';
const API_URL = '/api';
const SOCKET_URL = BASE_URL;

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [listenerCount, setListenerCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [socket, setSocket] = useState(null);
  const [queue, setQueue] = useState([]);
  const [djMessage, setDjMessage] = useState('');
  const [introAudio, setIntroAudio] = useState(null);
  const [currentPage, setCurrentPage] = useState('live');
  const [playHistory, setPlayHistory] = useState([]);
  const audioRef = React.useRef(null);
  const introAudioRef = React.useRef(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);

    newSocket.on('trackChange', (track) => {
      console.log(`[SOCKET] trackChange received:`, track?.title);
      if (track) {
        setCurrentTrack(track);
        fetchDJMessage('intro');
      } else {
        console.error('[SOCKET] trackChange received with no track data');
      }
    });

    newSocket.on('listenerCount', (count) => {
      setListenerCount(count);
    });

    setSocket(newSocket);

    fetch(`${API_URL}/current`)
      .then((res) => res.json())
      .then((data) => {
        if (data.track) {
          setCurrentTrack(data.track);
          fetchDJMessage('intro');
        }
        setListenerCount(data.listeners);
      })
      .catch((err) => console.error('Failed to fetch current track:', err));

    fetch(`${API_URL}/tracks?limit=10`)
      .then((res) => res.json())
      .then((data) => setQueue(data))
      .catch((err) => console.error('Failed to fetch queue:', err));

    return () => {
      newSocket.close();
    };
  }, []);

  // Track play history
  useEffect(() => {
    if (currentTrack?.id) {
      setPlayHistory(prev => {
        // Don't add duplicates (same track back-to-back)
        if (prev.length > 0 && prev[0].id === currentTrack.id) {
          return prev;
        }
        // Keep last 15 tracks
        return [currentTrack, ...prev].slice(0, 15);
      });
    }
  }, [currentTrack?.id]);

  const handlePlayPause = async () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      console.log('[AUDIO] Pausing');
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Set the audio source to the current track
      const url = `${API_URL}/stream/current`;
      console.log('[AUDIO] Playing:', currentTrack?.title, 'URL:', url);
      audioRef.current.src = url;
      audioRef.current.play().catch(err => console.warn('Playback error:', err));
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    // Disabled - tracks advance automatically
    console.log('[AUDIO] Next disabled in auto-advance mode');
  };

  const handleAudioEnded = async () => {
    console.log('[AUDIO] Track ended. Current track:', currentTrack?.title);
    try {
      const res = await fetch(`${API_URL}/next`, { method: 'POST' });
      const data = await res.json();
      console.log('[AUDIO] Backend advanced to:', data.track?.title);
      
      if (data.track) {
        // Update UI immediately
        setCurrentTrack(data.track);
        
        // Reset audio source with cache bust to force reload
        if (audioRef.current) {
          const cacheBust = `?t=${Date.now()}`;
          const url = `${API_URL}/stream/current${cacheBust}`;
          audioRef.current.src = url;
          console.log('[AUDIO] Loading new track:', url);
          
          const playWhenReady = () => {
            console.log('[AUDIO] New track ready, auto-playing...');
            audioRef.current.play().catch(err => console.warn('Autoplay failed:', err));
            audioRef.current.removeEventListener('canplay', playWhenReady);
          };
          
          audioRef.current.addEventListener('canplay', playWhenReady, { once: true });
        }
      }
    } catch (err) {
      console.error('[AUDIO] Failed to advance track:', err);
    }
  };

  const fetchDJMessage = async (type = 'intro') => {
    try {
      const res = await fetch(`${API_URL}/dj/${type}`);
      const data = await res.json();
      setDjMessage(data.message);
      
      // Speak the intro using browser TTS
      if (window.speechSynthesis && type === 'intro') {
        speakIntro(data.message);
      }
    } catch (err) {
      console.error('Failed to fetch DJ message:', err);
    }
  };

  const speakIntro = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to find a good voice (prefer male/neutral)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Look for a male voice or just use the first available
      const voice = voices.find(v => v.name.includes('Male')) || voices[0];
      utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="app">
      <div className="scanlines"></div>
      <audio 
        ref={audioRef} 
        crossOrigin="anonymous" 
        onEnded={handleAudioEnded}
        onPlay={() => console.log('[AUDIO] PLAY event')}
        onPause={() => console.log('[AUDIO] PAUSE event')}
        onLoadedmetadata={() => console.log('[AUDIO] LOADEDMETADATA event')}
      />
      
      <BootScreen />

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>PIRATE.FM</h1>
            <p>retro transmissions from the future</p>
          </div>
          <nav className="header-nav">
            <button 
              className={`nav-btn ${currentPage === 'live' ? 'active' : ''}`}
              onClick={() => setCurrentPage('live')}
            >
              LIVE
            </button>
            <button 
              className={`nav-btn ${currentPage === 'archive' ? 'active' : ''}`}
              onClick={() => setCurrentPage('archive')}
            >
              ARCHIVE
            </button>
            <button 
              className={`nav-btn ${currentPage === 'about' ? 'active' : ''}`}
              onClick={() => setCurrentPage('about')}
            >
              ABOUT
            </button>
            <button 
              className={`nav-btn ${currentPage === 'support' ? 'active' : ''}`}
              onClick={() => setCurrentPage('support')}
            >
              SUPPORT
            </button>
          </nav>
        </div>
      </header>

      {/* Main Layout */}
      <div className="main-layout">
        
        {/* Left Sidebar - Transmission Log */}
        <aside className="sidebar">
          <div className="logo-box">
            <img src={logo} alt="Pirate.fm Logo" className="sidebar-logo" />
          </div>
          <div className="log-box">
            <h2 className="box-title">>>> TRANSMISSION LOG</h2>
            <div className="log-content">
              <p>carrier: LOCKED</p>
              <p>mode: AI/RETRO</p>
              <p>headlines: OCCASIONAL</p>
              <p>listeners: {listenerCount} (unverified)</p>
              <p>packet loss: intentional</p>
              <p>next drop: 00:17</p>
              <p>note: keep it illegal, keep it pretty</p>
            </div>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="content">
          
          {currentPage === 'live' && (
            <Live 
              currentTrack={currentTrack}
              listenerCount={listenerCount}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              djMessage={djMessage}
              queue={queue}
              playHistory={playHistory}
              API_URL={API_URL}
            />
          )}

          {currentPage === 'archive' && (
            <Archive API_URL={API_URL} />
          )}

          {currentPage === 'about' && (
            <About />
          )}

          {currentPage === 'support' && (
            <Support />
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span className="footer-text">>>> 24/7 stream • AI-generated • retro mode • headlines: occasional • no ads, no mercy</span>
          <div className="footer-buttons">
            <a href="https://x.com/piratedotfm" target="_blank" rel="noopener noreferrer" className="footer-btn">X</a>
            <a href="https://buymeacoffee.com/piratefm" target="_blank" rel="noopener noreferrer" className="footer-btn">COFFEE</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
