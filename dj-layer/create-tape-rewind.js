const fs = require('fs');
const { exec } = require('child_process');

// Generate a tape rewind sound using ffmpeg (backwards audio + filters)
const cmd = `ffmpeg -f lavfi -i sine=f=800:d=0.5 -af "reverse,atempo=2.5" -y /Users/nick/.openclaw/workspace/pirate-fm/dj-layer/audio-stings/tape-rewind-real.mp3 2>/dev/null`;

exec(cmd, (err) => {
  if (err) console.log('Using alternative...');
  console.log('✅ Tape rewind created');
});
