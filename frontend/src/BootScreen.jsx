import React, { useState, useEffect } from 'react';
import './BootScreen.css';

const BOOT_MESSAGES = [
  'PIRATE.FM BOOT SEQUENCE INITIATED',
  'LOADING BIOS... OK',
  'CHECKING SYSTEM MEMORY... 640K OK',
  'INITIALIZING TRANSMISSION PROTOCOL...',
  'SCANNING FOR ILLEGAL BROADCASTS...',
  '',
  '>>> UNAUTHORIZED ACCESS DETECTED <<<',
  '',
  'SYSTEM COMPROMISED',
  'INITIATING RADIO TAKEOVER...',
  '',
  'PIRATE.FM v1.0 - RETRO TRANSMISSIONS FROM THE FUTURE',
  'ENTERING BROADCAST MODE...',
  '',
];

export function BootScreen() {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentLine >= BOOT_MESSAGES.length) {
      return;
    }

    const message = BOOT_MESSAGES[currentLine];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= message.length) {
        setDisplayText(
          BOOT_MESSAGES.slice(0, currentLine)
            .join('\n') +
            (currentLine > 0 ? '\n' : '') +
            message.substring(0, charIndex)
        );
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentLine(currentLine + 1);
        }, 300);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [currentLine]);

  // Blink cursor
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="boot-header">
      <pre className="boot-text">
        {displayText}
        {currentLine < BOOT_MESSAGES.length && (
          <span className={`cursor ${showCursor ? 'visible' : 'hidden'}`}>█</span>
        )}
      </pre>
    </div>
  );
}
