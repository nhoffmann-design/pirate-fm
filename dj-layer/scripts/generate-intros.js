#!/usr/bin/env node

/**
 * Signal Thief Intro Generator
 * Generates TTS intros for all 44 tracks using ElevenLabs API
 * 
 * Usage:
 *   node generate-intros.js --samples 3    (generate 3 sample intros for review)
 *   node generate-intros.js --batch        (generate all 44 intros)
 *   node generate-intros.js --track 5      (generate intro for track ID 5)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load configuration
const configPath = path.join(__dirname, '..', 'dj-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Load metadata
const metadataPath = path.join(__dirname, '..', 'tracks-metadata.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

// Load formulas
const formulasPath = path.join(__dirname, '..', 'voice-config', 'formulas.json');
const formulas = JSON.parse(fs.readFileSync(formulasPath, 'utf-8'));

// Ensure output directories exist
const outputDir = path.join(__dirname, '..', 'output', 'intros');
const samplesDir = path.join(__dirname, '..', 'samples');
[outputDir, samplesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Generate intro text based on formula
 */
function generateIntroText(track, formula) {
  let text = formula.template;

  // Replace placeholders
  text = text.replace('[GENRE]', capitalize(track.genre.replace('-', ' ')));
  text = text.replace('[MOOD]', track.mood);
  
  // Headline in 6 words
  const headlineWords = track.headline.split(' ').slice(0, 6).join(' ');
  text = text.replace('[HEADLINE IN 6 WORDS]', headlineWords);
  text = text.replace('[HEADLINE]', track.headline);

  return text;
}

/**
 * Generate TTS using ElevenLabs API
 */
async function generateTTS(text, trackTitle) {
  const voiceId = config.elevenlabs.voice_id || '21m00Tcm4TlvDq8ikWAM'; // Signal Thief voice
  const apiKey = config.elevenlabs.api_key;

  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured. Set ELEVENLABS_API_KEY env var or update dj-config.json');
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const payload = {
    text: text,
    model_id: config.elevenlabs.model_id || 'eleven_monolingual_v1',
    voice_settings: {
      stability: config.voice.stability || 0.6,
      similarity_boost: config.voice.similarity || 0.8,
    },
  };

  console.log(`[TTS] Generating: "${trackTitle}"`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return Buffer.from(audioBuffer);
  } catch (error) {
    console.error(`[ERROR] TTS generation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get segment text for the track
 */
function getSegmentText(track, segmentType) {
  const segments = config.segments;
  
  switch (segmentType) {
    case 'headline':
      const headlineTemplate = segments.headlines[track.intensity > 3 ? 'heavy' : 'light'];
      return headlineTemplate.replace('[HEADLINE]', track.headline);
    
    case 'advisory':
      const advisoryTemplate = segments.transmission[track.intensity > 3 ? 'intense' : 'chill'];
      return advisoryTemplate.replace('[MOOD]', track.mood);
    
    case 'regulation':
      return segments.regulation[Math.floor(Math.random() * segments.regulation.length)];
    
    default:
      return '';
  }
}

/**
 * Sanitize filename
 */
function sanitizeFilename(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Capitalize string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Process a single track
 */
async function processTrack(track, formulaIndex) {
  const formula = formulas.templates[formulaIndex % 5];
  const introText = generateIntroText(track, formula);
  
  // Get segment
  const segmentTypes = ['headline', 'advisory', 'regulation'];
  const segmentType = segmentTypes[track.id % 3];
  const segmentText = getSegmentText(track, segmentType);

  // Full script with natural pauses (commas in text)
  const fullScript = `${segmentText}. ${introText}`;

  console.log(`\n📝 Track #${track.id}: ${track.title}`);
  console.log(`   Formula: ${formulaIndex + 1}/5 (${formula.name})`);
  console.log(`   Segment: ${segmentType}`);
  console.log(`   Script: "${fullScript}"`);

  try {
    const audioBuffer = await generateTTS(fullScript, track.title);
    
    const filename = `signal-thief-${sanitizeFilename(track.genre)}-${track.id}-${track.title.toLowerCase().replace(/\s+/g, '-')}.mp3`;
    const outputPath = path.join(outputDir, filename);
    
    fs.writeFileSync(outputPath, audioBuffer);
    console.log(`   ✅ Saved: ${filename}`);

    return {
      track_id: track.id,
      title: track.title,
      filename: filename,
      formula: formulaIndex + 1,
      segment: segmentType,
      script: fullScript,
      size_bytes: audioBuffer.length,
    };
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const samplesArg = args.includes('--samples');
  const batchArg = args.includes('--batch');
  const trackArg = args.find(a => a === '--track') ? parseInt(args[args.indexOf('--track') + 1]) : null;

  let tracksToProcess = [];

  if (samplesArg) {
    const samplesCount = parseInt(args[args.indexOf('--samples') + 1]) || 3;
    tracksToProcess = metadata.tracks.slice(0, Math.min(samplesCount, metadata.tracks.length));
    console.log(`\n🎙️  Signal Thief - Sample Intro Generation (${samplesCount} tracks)`);
  } else if (batchArg) {
    tracksToProcess = metadata.tracks;
    console.log(`\n🎙️  Signal Thief - Full Batch Intro Generation (${metadata.tracks.length} tracks)`);
    console.log('⚠️  WARNING: This will use API credits. Ensure you have sufficient balance.');
  } else if (trackArg) {
    const track = metadata.tracks.find(t => t.id === trackArg);
    if (!track) {
      console.error(`Track ID ${trackArg} not found`);
      process.exit(1);
    }
    tracksToProcess = [track];
    console.log(`\n🎙️  Signal Thief - Single Track Intro Generation`);
  } else {
    console.log('Usage:');
    console.log('  node generate-intros.js --samples 3   (generate samples)');
    console.log('  node generate-intros.js --batch       (generate all)');
    console.log('  node generate-intros.js --track 5     (generate track #5)');
    process.exit(1);
  }

  console.log(`Starting TTS generation for ${tracksToProcess.length} track(s)...`);
  console.log(`Output directory: ${outputDir}\n`);

  const results = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < tracksToProcess.length; i++) {
    const track = tracksToProcess[i];
    const formulaIndex = (track.id - 1) % 5; // Rotate formulas

    try {
      const result = await processTrack(track, formulaIndex);
      if (result) {
        results.push(result);
        successful++;
      } else {
        failed++;
      }

      // Rate limiting - be nice to the API
      if (i < tracksToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Unexpected error processing track: ${error.message}`);
      failed++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Output: ${outputDir}`);
  console.log('='.repeat(60) + '\n');

  // Save results manifest
  const manifest = {
    generated_at: new Date().toISOString(),
    total: results.length,
    successful: successful,
    failed: failed,
    tracks: results,
  };

  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📋 Manifest saved: ${manifestPath}`);

  if (results.length > 0 && samplesArg) {
    console.log(`\n🎧 To preview samples:`);
    console.log(`   cd samples/`);
    console.log(`   ls -la`);
    console.log(`\n   Then share with Nick for review before running --batch\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
