import React from 'react';

export function About() {
  return (
    <div className="page-content">
      <section className="about-box">
        <div className="box-title">>>> ABOUT PIRATE.FM</div>
        
        <div className="about-content">
          
          <div className="about-section">
            <h3>MISSION</h3>
            <p>
              Pirate.fm is an underground station broadcasting retro-tinted, machine-made music 
              for people who miss real radio. Some tracks are sparked by the day's noise. Most 
              are built from mood, memory, and static. No ads. No feed games. Just the transmission.
            </p>
          </div>

          <div className="about-section">
            <h3>THE TRANSMISSION</h3>
            <p>
              This is a broadcast, not a playlist. Tracks rotate like contraband: new drops, 
              late-night repeats, sudden genre pivots, and the occasional "what the hell was that" 
              moment. If it feels alive, that's the point.
            </p>
          </div>

          <div className="about-section">
            <h3>SIGNAL THIEF</h3>
            <p>
              Your DJ is Signal Thief. Calm. Suspicious. Slightly amused that you found this 
              frequency. They don't hype. They don't apologize. They introduce the next track, 
              leave a note from the shadows, then disappear into the noise.
            </p>
            <p className="catchphrase">
              <em>"Stay tuned. Keep the frequency alive."</em>
            </p>
          </div>

          <div className="about-section">
            <h3>MUSIC</h3>
            <p>
              Synthwave. Darkwave. Lo-fi. Industrial. Rock. Metal. Underground hip-hop. Ambient 
              drift. Acid nights. Punk edges. Experimental junk drawer. If it sounds like a 
              forgotten cassette from the future, it belongs here.
            </p>
          </div>

          <div className="about-section">
            <h3>STATUS</h3>
            <div className="status-list">
              <p><strong>Operating:</strong> LIVE</p>
              <p><strong>Mode:</strong> AI/RETRO</p>
              <p><strong>Headlines:</strong> OCCASIONAL</p>
              <p><strong>Permission:</strong> DENIED</p>
              <p><strong>Uptime:</strong> UNTIL THE FREQUENCY DIES</p>
            </div>
          </div>

          <div className="about-section">
            <h3>CONTACT</h3>
            <p>
              Got a mood request, a theme, or a track title that needs to exist? Send it. We read 
              everything. We respond when we feel like it.
            </p>
            <p>
              Submit via X or carrier pigeon.
            </p>
          </div>

          <div className="about-section about-footer">
            <p>
              Pirate.fm is 100% independent. No ads. No sponsors. No corporate overlords. 
              We survive on listener support and the goodwill of rebels who believe in free, 
              unfiltered transmission.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
