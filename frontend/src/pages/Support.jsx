import React from 'react';

export function Support() {
  return (
    <div className="page-content">
      <section className="support-box">
        <div className="box-title">>>> SUPPORT PIRATE.FM</div>
        
        <div className="support-content">
          <div className="support-section">
            <h3>WHY SUPPORT?</h3>
            <p>
              Pirate.fm is 100% independent. No ads. No sponsors. No corporate overlords. 
              We survive on listener support and the goodwill of rebels who believe in 
              free, unfiltered transmission.
            </p>
          </div>

          <div className="support-section">
            <h3>DONATE</h3>
            <p>
              Keep the frequency alive. Every coffee counts.
            </p>
            <a href="https://buymeacoffee.com/piratefm" target="_blank" rel="noopener noreferrer" className="support-link">
              Buy Signal Thief a Coffee
            </a>
          </div>

          <div className="support-section">
            <h3>SPREAD THE SIGNAL</h3>
            <p>
              No money? No problem. Tell three friends. Share the frequency. The best 
              support is word-of-mouth from listeners who get it.
            </p>
          </div>

          <div className="support-section">
            <h3>OPERATING COSTS (ALLEGEDLY)</h3>
            <p>
              Your support keeps the lights on and the laws confused:
            </p>
            <ul className="cost-breakdown">
              <li>🛰️ <strong>Satellite Rental (totally real)</strong> — $38–$74 /mo</li>
              <li>📡 <strong>Anti-Detection Waveform Polish</strong> — $12–$29 /mo</li>
              <li>🌕 <strong>Lunar Reflection Fees (moon's got bills too)</strong> — $7–$19 /mo</li>
              <li>🧲 <strong>Magnetic Tape Revival Fund</strong> — $9–$22 /mo</li>
              <li>🔧 <strong>Duct Tape & Frequency Grease</strong> — $4–$11 /mo</li>
              <li>☕ <strong>Signal Thief Payroll (paid in caffeine and spite)</strong> — $15–$45 /mo</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="social-box">
        <div className="box-title">>>> FOLLOW THE FREQUENCY</div>
        <div className="social-links">
          <a href="https://x.com/piratedotfm" target="_blank" rel="noopener noreferrer" className="social-link">
            𝕏 Twitter
          </a>
        </div>
      </section>
    </div>
  );
}
