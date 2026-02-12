import React, { useState } from 'react';

export function Live({ currentTrack, listenerCount, isPlaying, onPlayPause, onNext, djMessage, queue, playHistory, API_URL }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(currentTrack?.likes || 0);
  const [shareMessage, setShareMessage] = useState('');

  const handleLike = async () => {
    if (!currentTrack?.id) return;
    
    try {
      const endpoint = liked ? 'unlike' : 'like';
      const res = await fetch(`${API_URL}/api/tracks/${currentTrack.id}/${endpoint}`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setLiked(!liked);
        setLikeCount(data.likes);
      }
    } catch (err) {
      console.error('Failed to like track:', err);
    }
  };

  const handleDownload = async () => {
    if (!currentTrack?.id) return;
    
    try {
      // Trigger download from the audio stream endpoint
      const link = document.createElement('a');
      link.href = `${API_URL}/api/stream/${currentTrack.id}`;
      link.download = `${currentTrack.title.replace(/\s+/g, '_')}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShareMessage('Track downloaded!');
      setTimeout(() => setShareMessage(''), 3000);
    } catch (err) {
      console.error('Download failed:', err);
      setShareMessage('Download failed');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  const handleShare = async () => {
    // Build share text with DJ message for personality
    const djQuote = djMessage ? `"${djMessage}"\n\n` : '';
    const shareText = `${djQuote}Now playing on Pirate.fm: ${currentTrack?.title} (${currentTrack?.mood})\n\nListen live: https://pirate.fm`;
    
    try {
      if (navigator.share) {
        // Try native share (mobile)
        await navigator.share({
          title: 'Pirate.fm',
          text: shareText,
          url: 'https://pirate.fm'
        });
        setShareMessage('Signal transmitted!');
        setTimeout(() => setShareMessage(''), 3000);
      } else {
        // Fallback for desktop: try clipboard API
        try {
          await navigator.clipboard.writeText(shareText);
          setShareMessage('Copied to clipboard!');
          setTimeout(() => setShareMessage(''), 3000);
        } catch (clipboardErr) {
          // Last resort: use execCommand (deprecated but works on HTTP)
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          document.body.appendChild(textArea);
          textArea.select();
          const success = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (success) {
            setShareMessage('Copied to clipboard!');
            setTimeout(() => setShareMessage(''), 3000);
          } else {
            throw new Error('Copy failed');
          }
        }
      }
    } catch (err) {
      console.error('Share failed:', err);
      setShareMessage('Transmission failed');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };
  return (
    <div className="page-content">
      {/* Now Playing */}
      <section className="now-playing-box">
        <div className="box-title">NOW PLAYING</div>
        {djMessage && <div className="dj-message">{djMessage}</div>}
        <div className="track-display">
          <h2>{currentTrack?.title || 'Loading...'}</h2>
          <p className="track-meta">
            {currentTrack?.mood && `genre: ${currentTrack.mood}`}
            {currentTrack?.headline && ` | source: ${currentTrack.headline}`}
          </p>
        </div>

        {/* Player Controls */}
        <div className="player-section">
          <button 
            className={`play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={onPlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            ▶ {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
          <div className="waveform">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="bar" style={{height: `${Math.sin(i * 0.3 + Date.now() / 200) * 50 + 50}%`}}></div>
            ))}
          </div>
          <button 
            className="next-btn"
            onClick={onNext}
            title="Next track"
          >
            ⏭ NEXT
          </button>
        </div>

        {/* Bump, Download & Spread the Signal */}
        <div className="track-actions">
          <button 
            className={`action-btn bump-btn ${liked ? 'bumped' : ''}`}
            onClick={handleLike}
            title="Flags this track for heavier rotation"
          >
            📈 BUMP {likeCount > 0 && `(${likeCount})`}
          </button>
          <button 
            className="action-btn download-btn"
            onClick={handleDownload}
            title="Download the track"
          >
            ⬇ GRAB IT
          </button>
          <button 
            className="action-btn signal-btn"
            onClick={handleShare}
            title="Transmit the frequency. Blame the static."
          >
            📡 SPREAD THE SIGNAL
          </button>
          {shareMessage && <span className="share-feedback">{shareMessage}</span>}
        </div>

        {/* Listener Count */}
        <div className="listeners-inline">
          <span className="listener-count">{listenerCount}</span>
          <span className="listener-label"> {listenerCount === 1 ? 'listener' : 'listeners'}</span>
        </div>
      </section>

      {/* Queue */}
      <section className="queue-box">
        <div className="box-title">UP NEXT (QUEUE)</div>
        <div className="queue-list">
          {queue.slice(0, 5).map((track, idx) => (
            <div key={idx} className="queue-item">
              <div className="queue-track-name">{track.title}</div>
              <div className="queue-track-meta">{track.mood} | archives</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Played */}
      {playHistory && playHistory.length > 0 && (
        <section className="history-box">
          <div className="box-title">RECENTLY PLAYED</div>
          <div className="history-list">
            {playHistory.slice(0, 8).map((track, idx) => (
              <div key={idx} className="history-item">
                <div className="history-track-name">{track.title}</div>
                <div className="history-track-meta">{track.mood}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
