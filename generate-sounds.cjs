/**
 * Generate missing sound files for the Tenali Sound Effects System.
 * Creates submit.mp3 and quiz-complete.mp3 as WAV files (Howler.js supports WAV).
 * 
 * Since ffmpeg is not available, we generate minimal WAV files using raw PCM data.
 */

const fs = require('fs');
const path = require('path');

// WAV file generator helpers
function createWavBuffer(sampleRate, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = samples.length * 2; // 16-bit = 2 bytes per sample
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write samples
  for (let i = 0; i < samples.length; i++) {
    const val = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(val * 32767), headerSize + i * 2);
  }

  return buffer;
}

function generateTone(freq, duration, sampleRate, volume = 0.3, type = 'sine') {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float64Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, Math.min(t * 20, (duration - t) * 20)); // Attack/release
    let wave;
    if (type === 'sine') {
      wave = Math.sin(2 * Math.PI * freq * t);
    } else if (type === 'triangle') {
      wave = 2 * Math.abs(2 * (t * freq - Math.floor(t * freq + 0.5))) - 1;
    }
    samples[i] = wave * envelope * volume;
  }
  return samples;
}

function mixSamples(...arrays) {
  const maxLen = Math.max(...arrays.map(a => a.length));
  const result = new Float64Array(maxLen);
  for (const arr of arrays) {
    for (let i = 0; i < arr.length; i++) {
      result[i] += arr[i];
    }
  }
  return result;
}

function offsetSamples(samples, offsetSeconds, sampleRate) {
  const offsetSamples_count = Math.floor(offsetSeconds * sampleRate);
  const result = new Float64Array(samples.length + offsetSamples_count);
  for (let i = 0; i < samples.length; i++) {
    result[i + offsetSamples_count] = samples[i];
  }
  return result;
}

// --- Generate Submit Sound ---
// Short, subtle click/tap (0.05s) - similar to a button press
function generateSubmitSound() {
  const sampleRate = 22050;
  // Two quick tones for a "click" feel
  const tone1 = generateTone(800, 0.03, sampleRate, 0.2, 'triangle');
  const tone2 = offsetSamples(generateTone(1200, 0.02, sampleRate, 0.15, 'sine'), 0.015, sampleRate);
  const mixed = mixSamples(tone1, tone2);
  return createWavBuffer(sampleRate, mixed);
}

// --- Generate Quiz Complete Sound ---
// Celebratory ascending arpeggio (1.2s) - C5 E5 G5 C6
function generateQuizCompleteSound() {
  const sampleRate = 22050;
  const notes = [
    { freq: 523.25, start: 0,    dur: 0.3 },  // C5
    { freq: 659.25, start: 0.15, dur: 0.3 },  // E5
    { freq: 783.99, start: 0.30, dur: 0.3 },  // G5
    { freq: 1046.5, start: 0.45, dur: 0.5 },  // C6 (longer final note)
  ];

  const arrays = notes.map(n =>
    offsetSamples(generateTone(n.freq, n.dur, sampleRate, 0.2, 'sine'), n.start, sampleRate)
  );

  // Add a soft shimmer/harmony
  const shimmer = offsetSamples(generateTone(1568, 0.6, sampleRate, 0.08, 'sine'), 0.5, sampleRate);
  arrays.push(shimmer);

  const mixed = mixSamples(...arrays);
  return createWavBuffer(sampleRate, mixed);
}

// --- Write files ---
const essentialDir = path.join(__dirname, 'client/public/sounds/essential');
const standardDir = path.join(__dirname, 'client/public/sounds/standard');

// Submit sound -> essential (it's a basic interaction sound)
const submitBuffer = generateSubmitSound();
fs.writeFileSync(path.join(essentialDir, 'submit.wav'), submitBuffer);
console.log(`Created submit.wav (${submitBuffer.length} bytes) in essential/`);

// Quiz complete sound -> standard (it's a category-specific celebration)
const completeBuffer = generateQuizCompleteSound();
fs.writeFileSync(path.join(standardDir, 'quiz-complete.wav'), completeBuffer);
console.log(`Created quiz-complete.wav (${completeBuffer.length} bytes) in standard/`);

console.log('\nDone! Sound files created successfully.');
console.log('Note: Files are WAV format. Howler.js supports WAV natively.');
