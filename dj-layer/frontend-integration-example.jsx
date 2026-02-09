/**
 * Signal Thief DJ Layer - React Player Integration Example
 * 
 * Shows how to integrate generated intros, audio stings, and segments
 * into the Pirate.fm React player.
 * 
 * Copy relevant parts into frontend/src/App.jsx or create a <DJ Player> component.
 */

import React, { useState, useRef, useEffect } from 'react';

/**
 * Audio Manager with DJ Layer Support
 * Handles sequencing of intros, stings, and main track
 */
class DJAudioManager {
  constructor(onEnded = () => {}) {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.audioQueue = [];
    this.currentAudio = null;
    this.onEnded = onEnded;
    this.introCache = new Map();
  }

  /**
   * Play track with intro sequence
   */
  async playTrackWithIntro(track) {
    // Clear any existing queue
    this.audioQueue = [];
    
    if (!track.intro_tts_path) {
      // No intro, play track directly
      return this.playAudio(track.file_path);
    }

    // Build audio sequence
    const stings = JSON.parse(track.audio_stings || '[]');
    
    // 1. Modem sting (fade in)
    const modem = stings.find(s => s.type === 'modem');
    if (modem) {
      this.audioQueue.push({
        src: modem.file,
        duration: modem.duration || 3.5,
        volume: 0.3,
        fadeIn: 0.5,
      });
    }

    // 2. Intro TTS
    this.audioQueue.push({
      src: track.intro_tts_path,
      duration: 8,
      volume: 0.8,
      fadeIn: 0.2,
    });

    // 3. Tape sting
    const tape = stings.find(s => s.type === 'tape');
    if (tape) {
      this.audioQueue.push({
        src: tape.file,
        duration: tape.duration || 1.8,
        volume: 0.25,
        fadeIn: 0.1,
      });
    }

    // 4. Whisper outro
    const whisper = stings.find(s => s.type === 'whisper');
    if (whisper) {
      this.audioQueue.push({
        src: whisper.file,
        duration: whisper.duration || 3.0,
        volume: 0.4,
        fadeIn: 0.4,
      });
    }

    // 5. Main track
    this.audioQueue.push({
      src: track.file_path,
      duration: track.duration || 180,
      volume: 0.85,
    });

    // Start playing the sequence
    return this.playQueue();
  }

  /**
   * Play audio queue sequentially
   */
  async playQueue() {
    if (this.audioQueue.length === 0) {
      this.onEnded();
      return;
    }

    const audio = this.audioQueue.shift();
    return this.playAudio(audio.src, audio.volume, audio.fadeIn);
  }

  /**
   * Play single audio with fade-in
   */
  playAudio(src, volume = 0.8, fadeInMs = 0) {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      audio.volume = 0;
      
      audio.onended = () => {
        this.playQueue();
        resolve();
      };

      audio.onerror = (e) => {
        console.error(`Failed to load: ${src}`, e);
        this.playQueue();
        resolve();
      };

      audio.play().catch(e => {
        console.error(`Failed to play: ${src}`, e);
        this.playQueue();
        resolve();
      });

      // Fade in
      if (fadeInMs > 0) {
        const interval = 50;
        const steps = fadeInMs / interval;
        let step = 0;
        const fadeInterval = setInterval(() => {
          step++;
          audio.volume = Math.min((step / steps) * volume, volume);
          if (step >= steps) {
            clearInterval(fadeInterval);
            audio.volume = volume;
          }
        }, interval);
      } else {
        audio.volume = volume;
      }

      this.currentAudio = audio;
    });
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    this.audioQueue = [];
  }

  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  resume() {
    if (this.currentAudio) {
      this.currentAudio.play().catch(e => console.error('Resume failed:', e));
    }
  }
}

/**
 * DJ Info Component
 * Displays formula, segment type, and segment text
 */
function DJInfo({ track }) {
  if (!track) return null;

  const formulas = ['Classic', 'Cryptic', 'Sarcastic', 'Retro', 'End-times'];
  const formulaName = formulas[track.intro_formula - 1] || 'Unknown';

  return (
    <div className="dj-info">
      <div className="dj-header">
        <span className="dj-label">🎙️ Signal Thief</span>
      </div>
      
      <div className="dj-formula">
        <span className="label">Formula:</span>
        <span className="value">{formulaName} ({track.intro_formula}/5)</span>
      </div>

      <div className="dj-segment">
        <span className="label">Segment:</span>
        <span className="value">{track.segment_type}</span>
      </div>

      {track.segment_text && (
        <div className="dj-segment-text">
          <p>"{track.segment_text}"</p>
        </div>
      )}

      {track.audio_stings && (
        <div className="dj-stings">
          <span className="label">Stings:</span>
          <span className="value">{JSON.parse(track.audio_stings || '[]').length} loaded</span>
        </div>
      )}
    </div>
  );
}

/**
 * Modified Player Component with DJ Layer
 */
export function PiratePlayer({ track, isPlaying, onPlay, onPause, onNext }) {
  const audioManager = useRef(null);

  useEffect(() => {
    // Initialize audio manager
    audioManager.current = new DJAudioManager(() => {
      console.log('Track finished');
      onNext?.();
    });

    return () => {
      audioManager.current?.stop();
    };
  }, [onNext]);

  const handlePlay = async () => {
    if (!track) return;

    try {
      await audioManager.current.playTrackWithIntro(track);
      onPlay?.(track);
    } catch (error) {
      console.error('Playback failed:', error);
      // Fallback: try to play directly without intro
      audioManager.current.playAudio(track.file_path);
    }
  };

  const handlePause = () => {
    audioManager.current?.pause();
    onPause?.();
  };

  const handleResume = () => {
    audioManager.current?.resume();
    onPlay?.(track);
  };

  const handleStop = () => {
    audioManager.current?.stop();
    onPause?.();
  };

  return (
    <div className="pirate-player">
      <div className="player-header">
        <h2>🏴‍☠️ Pirate.fm</h2>
        <p className="tagline">Retro transmissions from the future</p>
      </div>

      {track && (
        <>
          <div className="track-info">
            <h3>{track.title}</h3>
            <p className="mood">{track.mood} • {track.genre}</p>
            <p className="headline">"{track.headline}"</p>
          </div>

          <DJInfo track={track} />

          <div className="player-controls">
            {!isPlaying ? (
              <button onClick={handlePlay} className="btn-play">▶ Play</button>
            ) : (
              <button onClick={handlePause} className="btn-pause">⏸ Pause</button>
            )}
            <button onClick={handleNext} className="btn-next">⏭ Next</button>
            <button onClick={handleStop} className="btn-stop">⏹ Stop</button>
          </div>

          <div className="playback-info">
            <p className="intro-status">
              {track.intro_tts_path ? '✅ Intro loaded' : '❌ No intro'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * CSS Styling for DJ Layer Components
 */
const djLayerStyles = `
.dj-info {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: 'Space Mono', monospace;
  font-size: 0.9rem;
}

.dj-header {
  border-bottom: 1px solid rgba(0, 255, 136, 0.3);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.dj-label {
  color: #00ff88;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.dj-formula,
.dj-segment,
.dj-stings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px dotted rgba(0, 255, 136, 0.1);
}

.dj-formula .label,
.dj-segment .label,
.dj-stings .label {
  color: #888;
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.dj-formula .value,
.dj-segment .value,
.dj-stings .value {
  color: #00ff88;
  font-weight: bold;
}

.dj-segment-text {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #00ff88;
  border-radius: 2px;
}

.dj-segment-text p {
  margin: 0;
  color: #ccc;
  font-style: italic;
  line-height: 1.5;
  font-size: 0.9rem;
}

.player-controls {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.btn-play,
.btn-pause,
.btn-next,
.btn-stop {
  flex: 1;
  padding: 0.75rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  font-family: 'Space Mono', monospace;
  transition: all 0.2s;
}

.btn-play:hover,
.btn-pause:hover,
.btn-next:hover,
.btn-stop:hover {
  background: rgba(0, 255, 136, 0.2);
  border-color: #00ff88;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.playback-info {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
}

.intro-status {
  font-family: 'Space Mono', monospace;
  color: #666;
}
`;

// Export CSS
export const djLayerCSS = djLayerStyles;

/**
 * Advanced: Preload Next Track's Intro
 */
export function usePreloadNextIntro(nextTrack) {
  useEffect(() => {
    if (nextTrack?.intro_tts_path) {
      const audio = new Audio(nextTrack.intro_tts_path);
      // Don't play, just load into browser cache
      audio.preload = 'auto';
    }
  }, [nextTrack]);
}

/**
 * Advanced: DJ Layer Audio Context Manager
 * For precise timing using Web Audio API
 */
export class DJAudioContextManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  /**
   * Play with precise timing
   */
  async playWithPreciseTiming(sources) {
    const audioBuffer = [];
    let currentTime = 0;

    for (const source of sources) {
      const audio = new Audio(source.src);
      
      // Schedule playback
      setTimeout(() => {
        audio.play().catch(e => console.error('Play error:', e));
      }, currentTime * 1000);

      currentTime += source.duration;
    }
  }

  /**
   * Apply spatial audio effects (optional)
   */
  applySpatialAudio(audio, azimuth = 0, elevation = 0) {
    const panner = this.audioContext.createPanner();
    panner.setPosition(
      Math.cos(azimuth) * Math.cos(elevation),
      Math.sin(elevation),
      Math.sin(azimuth) * Math.cos(elevation)
    );
    return panner;
  }
}

export default {
  PiratePlayer,
  DJAudioManager,
  DJAudioContextManager,
  DJInfo,
  djLayerCSS,
  usePreloadNextIntro,
};
