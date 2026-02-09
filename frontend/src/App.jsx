import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [listenerCount, setListenerCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io(API_URL);

    newSocket.on('trackChange', (track) => {
      setCurrentTrack(track);
    });

    newSocket.on('listenerCount', (count) => {
      setListenerCount(count);
    });

    setSocket(newSocket);

    // Fetch initial state
    fetch(`${API_URL}/api/current`)
      .then((res) => res.json())
      .then((data) => {
        setCurrentTrack(data.track);
        setListenerCount(data.listeners);
        setIsPlaying(data.isPlaying);
      })
      .catch((err) => console.error('Failed to fetch current track:', err));

    return () => {
      newSocket.close();
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = async () => {
    try {
      const res = await fetch(`${API_URL}/api/next`, { method: 'POST' });
      const data = await res.json();
      setCurrentTrack(data.track);
    } catch (err) {
      console.error('Failed to skip track:', err);
    }
  };

  return (
    <div className="app">
      <div className="scanlines"></div>

      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="title">🏴‍☠️ pirate.fm</h1>
          <p className="tagline">Retro transmissions from the future.</p>
        </div>

        {/* Player Card */}
        <div className="player-card">
          {/* Track Info */}
          <div className="track-info">
            <h2 className="track-title">
              {currentTrack?.title || 'Loading...'}
            </h2>
            <p className="track-mood">
              {currentTrack?.mood ? `📻 ${currentTrack.mood}` : 'preparing transmission'}
            </p>
            {currentTrack?.headline && (
              <p className="inspired-by">
                Inspired by: <em>{currentTrack.headline}</em>
              </p>
            )}
          </div>

          {/* Player Controls */}
          <div className="player-controls">
            <button
              className="btn btn-play"
              onClick={handlePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              className="btn btn-next"
              onClick={handleNext}
              title="Next track"
            >
              ⏭
            </button>
          </div>

          {/* Listener Count */}
          <div className="listeners">
            <span className="listener-count">{listenerCount}</span>
            <span className="listener-label">
              {listenerCount === 1 ? 'listener' : 'listeners'}
            </span>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mission">
          <p>
            An underground radio station broadcasting headline-reactive,
            AI-generated music. All tracks powered by Suno AI. No licensing
            issues, pure creative chaos.
          </p>
        </div>

        {/* Social & Links */}
        <div className="footer">
          <div className="links">
            <a href="https://twitter.com/pirate_fm_radio" target="_blank" rel="noopener noreferrer" className="link">
              𝕏 Twitter
            </a>
            <a href="https://patreon.com/pirate.fm" target="_blank" rel="noopener noreferrer" className="link">
              💖 Patreon
            </a>
            <a href="mailto:?subject=Check out pirate.fm" className="link">
              📧 Share
            </a>
          </div>
          <p className="footer-text">
            24/7 stream • All AI-generated • Made with chaos & code
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
