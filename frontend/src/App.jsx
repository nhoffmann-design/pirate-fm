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
  const [isPlaying, setIsPlaying] = useState(true);
  const [socket, setSocket] = useState(null);
  const [queue, setQueue] = useState([]);
  const [djMessage, setDjMessage] = useState('');
  const [introAudio, setIntroAudio] = useState(null);
  const [currentPage, setCurrentPage] = useState('live');
  const audioRef = React.useRef(null);
  const introAudioRef = React.useRef(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);

    newSocket.on('trackChange', (track) => {
      setCurrentTrack(track);
      
      // Set audio source first
      if (audioRef.current && track?.id) {
        const url = `${API_URL}/api/stream/${track.id}`;
        audioRef.current.src = url;
      }
      
      // Fetch DJ message and it will speak the intro via TTS
      fetchDJMessage('intro');
      
      // Start track after 5 seconds (time for intro to speak + buffer)
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.warn('Playback error:', err));
        }
      }, 5000);
    });

    newSocket.on('listenerCount', (count) => {
      setListenerCount(count);
    });

    setSocket(newSocket);

    fetch(`${API_URL}/api/current`)
      .then((res) => res.json())
      .then((data) => {
        if (data.track) {
          setCurrentTrack(data.track);
          if (audioRef.current && data.track.id) {
            audioRef.current.src = `${API_URL}/api/stream/${data.track.id}`;
          }
        }
        setListenerCount(data.listeners);
        setIsPlaying(data.isPlaying);
      })
      .catch((err) => console.error('Failed to fetch current track:', err));

    fetch(`${API_URL}/api/tracks?limit=10`)
      .then((res) => res.json())
      .then((data) => setQueue(data))
      .catch((err) => console.error('Failed to fetch queue:', err));

    return () => {
      newSocket.close();
    };
  }, []);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.warn('Playback error:', err));
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = async () => {
    try {
      const res = await fetch(`${API_URL}/api/next`, { method: 'POST' });
      const data = await res.json();
      setCurrentTrack(data.track);
      if (audioRef.current && data.track?.id) {
        audioRef.current.src = `${API_URL}/api/stream/${data.track.id}`;
      }
    } catch (err) {
      console.error('Failed to skip track:', err);
    }
  };

  const handleAudioEnded = async () => {
    console.log('[AUDIO] Track ended, advancing to next...');
    try {
      const res = await fetch(`${API_URL}/api/next`, { method: 'POST' });
      const data = await res.json();
      setCurrentTrack(data.track);
      if (audioRef.current && data.track?.id) {
        const url = `${API_URL}/api/stream/${data.track.id}`;
        
        const playWhenReady = () => {
          audioRef.current.play().catch(err => console.warn('Autoplay after track end failed:', err));
          audioRef.current.removeEventListener('canplay', playWhenReady);
        };
        
        audioRef.current.addEventListener('canplay', playWhenReady);
        audioRef.current.src = url;
      }
    } catch (err) {
      console.error('Failed to advance track:', err);
    }
  };

  const fetchDJMessage = async (type = 'intro') => {
    try {
      const res = await fetch(`${API_URL}/api/dj/${type}`);
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
      <audio ref={audioRef} crossOrigin="anonymous" onEnded={handleAudioEnded} />
      
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
