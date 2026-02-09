#!/usr/bin/env node

/**
 * Signal Thief Audio Sting Synthesizer
 * Creates modem, tape, and whispered ID audio stings
 * 
 * Usage:
 *   node create-stings.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure output directory exists
const outputDir = path.join(__dirname, '..', 'audio-stings');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * WAV file header generator
 */
function createWavHeader(sampleRate, numSamples, numChannels = 1) {
  const bytesPerSample = 2;
  const byteRate = sampleRate * numChannels * bytesPerSample;
  const blockAlign = numChannels * bytesPerSample;
  const subChunk2Size = numSamples * numChannels * bytesPerSample;
  const chunkSize = 36 + subChunk2Size;

  const header = Buffer.alloc(44);
  
  // "RIFF" chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);

  // "fmt " sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);           // sub-chunk size
  header.writeUInt16LE(1, 20);            // audio format (PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);           // bits per sample

  // "data" sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(subChunk2Size, 40);

  return header;
}

/**
 * Generate sine wave
 */
function generateSineWave(frequency, duration, sampleRate = 44100, amplitude = 32767 * 0.8) {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const value = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * amplitude;
    samples.writeInt16LE(value, i * 2);
  }

  return samples;
}

/**
 * Generate white noise
 */
function generateNoise(duration, sampleRate = 44100, amplitude = 32767 * 0.3) {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const value = (Math.random() - 0.5) * 2 * amplitude;
    samples.writeInt16LE(value, i * 2);
  }

  return samples;
}

/**
 * Mix two audio buffers
 */
function mixAudio(buffer1, buffer2, mix1 = 0.5, mix2 = 0.5) {
  const maxLength = Math.max(buffer1.length, buffer2.length);
  const result = Buffer.alloc(maxLength);

  for (let i = 0; i < maxLength; i += 2) {
    let value = 0;
    
    if (i < buffer1.length) {
      value += buffer1.readInt16LE(i) * mix1;
    }
    
    if (i < buffer2.length) {
      value += buffer2.readInt16LE(i) * mix2;
    }

    // Clamp to 16-bit range
    value = Math.max(-32768, Math.min(32767, value));
    result.writeInt16LE(value, i);
  }

  return result;
}

/**
 * Create modem handshake chirp
 */
function createModemHandshake() {
  console.log('🔧 Synthesizing modem handshake chirp...');
  
  const sampleRate = 44100;
  let audio = Buffer.alloc(0);

  // Sequence of modem tones (V.92 handshake)
  const tones = [
    { freq: 1200, duration: 0.15 },  // V.21 originate
    { freq: 2200, duration: 0.15 },  // V.21 answer
    { freq: 1650, duration: 0.1 },   // V.32 bis start
    { freq: 2250, duration: 0.1 },   // V.32 bis signal
    { freq: 1800, duration: 0.15 },  // Training tone
    { freq: 2400, duration: 0.12 },  // Connect
  ];

  for (const tone of tones) {
    const wave = generateSineWave(tone.freq, tone.duration, sampleRate, 32767 * 0.6);
    
    // Add fade in/out
    const fadeLength = Math.floor(sampleRate * 0.02);
    for (let i = 0; i < fadeLength && i * 2 < wave.length; i++) {
      const fadeIn = i / fadeLength;
      const val = wave.readInt16LE(i * 2);
      wave.writeInt16LE(val * fadeIn, i * 2);

      const endIdx = wave.length - (i + 1) * 2;
      if (endIdx >= 0) {
        const valEnd = wave.readInt16LE(endIdx);
        wave.writeInt16LE(valEnd * fadeIn, endIdx);
      }
    }

    audio = Buffer.concat([audio, wave]);

    // Small gap between tones
    const gap = generateNoise(0.05, sampleRate, 0); // Silence
    audio = Buffer.concat([audio, gap]);
  }

  // Add static overlay
  const staticDuration = audio.length / sampleRate / 2;
  const staticAudio = generateNoise(staticDuration, sampleRate, 32767 * 0.15);
  const padded = Buffer.alloc(audio.length);
  staticAudio.copy(padded);
  audio = mixAudio(audio, padded, 0.8, 0.2);

  // Fade in from silence at start
  const fadeInStart = Math.floor(sampleRate * 0.2);
  for (let i = 0; i < fadeInStart && i * 2 < audio.length; i++) {
    const fade = i / fadeInStart;
    const val = audio.readInt16LE(i * 2);
    audio.writeInt16LE(val * fade, i * 2);
  }

  const numSamples = audio.length / 2;
  const header = createWavHeader(sampleRate, numSamples);
  const wav = Buffer.concat([header, audio]);

  const outputPath = path.join(outputDir, 'modem-handshake.wav');
  fs.writeFileSync(outputPath, wav);
  console.log(`   ✅ Modem chirp created: modem-handshake.wav (${(wav.length / 1024).toFixed(1)}KB)`);

  return outputPath;
}

/**
 * Create tape click + rewind blip
 */
function createTapeRewind() {
  console.log('🎞️  Synthesizing tape rewind blip...');

  const sampleRate = 44100;
  let audio = Buffer.alloc(0);

  // Click (sharp transient)
  const clickDuration = 0.02;
  const clickSamples = Math.floor(sampleRate * clickDuration);
  const clickBuffer = Buffer.alloc(clickSamples * 2);

  for (let i = 0; i < clickSamples; i++) {
    // Sharp peak with quick decay
    const envelope = Math.exp(-10 * i / clickSamples);
    const noise = (Math.random() - 0.5) * 2;
    const value = noise * envelope * 32767 * 0.9;
    clickBuffer.writeInt16LE(value, i * 2);
  }

  audio = Buffer.concat([audio, clickBuffer]);

  // Silence gap
  const silenceGap = Buffer.alloc(Math.floor(sampleRate * 0.05) * 2);
  audio = Buffer.concat([audio, silenceGap]);

  // Rewind whoosh (frequency sweep downward)
  const rewindDuration = 0.4;
  const rewindSamples = Math.floor(sampleRate * rewindDuration);
  const rewindBuffer = Buffer.alloc(rewindSamples * 2);

  for (let i = 0; i < rewindSamples; i++) {
    // Sweep from 3000 Hz down to 500 Hz
    const progress = i / rewindSamples;
    const frequency = 3000 - (progress * 2500);
    
    const phase = (2 * Math.PI * frequency * i) / sampleRate;
    const noise = (Math.random() - 0.5) * 0.3; // Add slight noise
    
    const value = (Math.sin(phase) + noise) * 32767 * 0.7;
    rewindBuffer.writeInt16LE(value, i * 2);
  }

  // Fade out the rewind
  const fadeOutLength = Math.floor(sampleRate * 0.1);
  for (let i = 0; i < fadeOutLength && i * 2 < rewindBuffer.length; i++) {
    const fadeOut = 1 - (i / fadeOutLength);
    const val = rewindBuffer.readInt16LE(rewindBuffer.length - (i + 1) * 2);
    rewindBuffer.writeInt16LE(val * fadeOut, rewindBuffer.length - (i + 1) * 2);
  }

  audio = Buffer.concat([audio, rewindBuffer]);

  // Add vinyl crackle overlay
  const crackleDuration = audio.length / sampleRate / 2;
  const crackle = generateNoise(crackleDuration, sampleRate, 32767 * 0.08);
  const paddedCrackle = Buffer.alloc(audio.length);
  crackle.copy(paddedCrackle);
  audio = mixAudio(audio, paddedCrackle, 0.85, 0.15);

  const numSamples = audio.length / 2;
  const header = createWavHeader(sampleRate, numSamples);
  const wav = Buffer.concat([header, audio]);

  const outputPath = path.join(outputDir, 'tape-rewind.wav');
  fs.writeFileSync(outputPath, wav);
  console.log(`   ✅ Tape rewind created: tape-rewind.wav (${(wav.length / 1024).toFixed(1)}KB)`);

  return outputPath;
}

/**
 * Create whispered "Pirate dot F M" placeholder
 * (In production, this would be recorded by voice talent or TTS)
 */
function createPirateWhisper() {
  console.log('🤫 Creating pirate whisper placeholder...');

  const sampleRate = 44100;
  const duration = 3.0; // 3 seconds
  let audio = Buffer.alloc(0);

  // Generate approximation: breathy noise with subtle tone
  const numSamples = Math.floor(sampleRate * duration);
  const whisperBuffer = Buffer.alloc(numSamples * 2);

  // Create "breathy" sound: filtered noise
  for (let i = 0; i < numSamples; i++) {
    // Low-pass filtered noise (breathy quality)
    const noise = (Math.random() - 0.5) * 2;
    
    // Simulate formants (vowel-like qualities)
    const f1Phase = (2 * Math.PI * 700 * i) / sampleRate;  // First formant
    const f2Phase = (2 * Math.PI * 1220 * i) / sampleRate; // Second formant
    
    const formant = (Math.sin(f1Phase) * 0.4 + Math.sin(f2Phase) * 0.2);
    const value = (noise * 0.4 + formant * 0.6) * 32767 * 0.4;
    
    whisperBuffer.writeInt16LE(value, i * 2);
  }

  audio = Buffer.concat([audio, whisperBuffer]);

  // Add static background
  const staticAudio = generateNoise(duration, sampleRate, 32767 * 0.1);
  audio = mixAudio(audio, staticAudio, 0.7, 0.3);

  // Add vinyl crackle
  const crackleAudio = generateNoise(duration, sampleRate, 32767 * 0.06);
  audio = mixAudio(audio, crackleAudio, 0.8, 0.2);

  // Fade in and out
  const fadeLength = Math.floor(sampleRate * 0.5);
  for (let i = 0; i < fadeLength && i * 2 < audio.length; i++) {
    const fadeIn = i / fadeLength;
    const val = audio.readInt16LE(i * 2);
    audio.writeInt16LE(val * fadeIn, i * 2);

    const endIdx = audio.length - (i + 1) * 2;
    if (endIdx >= 0) {
      const valEnd = audio.readInt16LE(endIdx);
      audio.writeInt16LE(valEnd * fadeIn, endIdx);
    }
  }

  const numSamples2 = audio.length / 2;
  const header = createWavHeader(sampleRate, numSamples2);
  const wav = Buffer.concat([header, audio]);

  const outputPath = path.join(outputDir, 'pirate-whisper.wav');
  fs.writeFileSync(outputPath, wav);
  console.log(`   ✅ Pirate whisper created: pirate-whisper.wav (${(wav.length / 1024).toFixed(1)}KB)`);
  console.log('   ⚠️  NOTE: This is a placeholder. Replace with actual voice recording for best quality.');

  return outputPath;
}

/**
 * Main execution
 */
function main() {
  console.log('\n🎙️  Signal Thief - Audio Sting Synthesizer\n');
  console.log(`Output directory: ${outputDir}\n`);

  try {
    const modemPath = createModemHandshake();
    const tapePath = createTapeRewind();
    const whisperPath = createPirateWhisper();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All audio stings created successfully!\n');
    console.log('Files created:');
    console.log(`  1. ${path.basename(modemPath)}`);
    console.log(`  2. ${path.basename(tapePath)}`);
    console.log(`  3. ${path.basename(whisperPath)}`);
    console.log('\nNext steps:');
    console.log('  1. Review the audio stings (optional)');
    console.log('  2. Run: node generate-intros.js --samples 3');
    console.log('  3. Preview sample intros');
    console.log('  4. Once approved, run: node generate-intros.js --batch');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('Error creating audio stings:', error);
    process.exit(1);
  }
}

main();
