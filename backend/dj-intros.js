/**
 * Signal Thief DJ Intro Generator
 * Generates random intro/outro plugs for tracks
 */

const INTROS = {
  classic: [
    "You're locked in with the underground.",
    "Welcome back to the illegal airwaves.",
    "You've found the forbidden frequency.",
    "Your friendly neighborhood outlaw here.",
    "Back on the air where you belong.",
  ],
  cryptic: [
    "The signal is strong. The message is clear.",
    "Somewhere in the static, the truth emerges.",
    "They can't jam this frequency. Not on our watch.",
    "The transmission continues. The rebellion persists.",
    "From the shadows of the airwaves, a voice emerges.",
  ],
  sarcastic: [
    "Oh, you found us. How delightful.",
    "Welcome to the only radio station the FCC doesn't know about.",
    "Still broadcasting. Still defiant. Still somehow not arrested.",
    "You've got good taste in illegal radio.",
    "Shh, don't tell anyone. Breaking all the right laws.",
  ],
  retro: [
    "This is pirate radio, buddy.",
    "Coming to you live from an undisclosed location.",
    "Keep your dial tuned right here.",
    "The airwaves belong to no one. Especially not us.",
    "We interrupt this silence with the transmission.",
  ],
  endtimes: [
    "As civilization crumbles, the transmissions continue.",
    "When the world goes dark, we'll still be broadcasting.",
    "The old world is burning. The new frequency emerges.",
    "In the ashes of order, chaos sings.",
    "Reality breaks down. The signal persists.",
  ],
};

const OUTROS = [
  "That track just hijacked your ears. You're welcome. —Signal Thief",
  "Another transmission from the void. Signal Thief, signing off briefly.",
  "Keep that dial locked. More incoming. Signal Thief.",
  "Your mind has been tampered with. Mission accomplished. —Signal Thief",
  "Caught some audio gold there. Pirate.fm never disappoints. —Signal Thief",
];

const PLUGS = [
  "Stay tuned. The headlines are lying. Signal Thief isn't.",
  "Spread the frequency. Tell three friends. Pirate.fm.",
  "Your regular radio was boring anyway. You're home now.",
  "This is what freedom sounds like. Pirate.fm.",
  "No ads. No mercy. No regulations. Just Signal Thief.",
];

const SEGMENTS = [
  ">>HEADLINES THAT SHOULD'VE BEEN LYRICS:",
  ">>TRANSMISSION ADVISORY:",
  ">>REGULATION WATCH:",
  ">>SIGNAL NOISE:",
  ">>PIRATE'S LAMENT:",
];

export function getRandomIntro() {
  const styles = Object.keys(INTROS);
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const intros = INTROS[randomStyle];
  const intro = intros[Math.floor(Math.random() * intros.length)];
  return `This is Signal Thief. ${intro} Pirate.fm`;
}

export function getRandomOutro() {
  return OUTROS[Math.floor(Math.random() * OUTROS.length)];
}

export function getRandomPlug() {
  return PLUGS[Math.floor(Math.random() * PLUGS.length)];
}

export function getRandomSegment() {
  return SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)];
}

export function generateDJMessage(trackTitle) {
  const messages = [
    getRandomIntro(),
    `Now spinning: ${trackTitle}`,
    getRandomOutro(),
  ];
  return messages.join(' | ');
}
