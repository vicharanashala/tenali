const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '../public/sounds');

// Ensure the directory exists
if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}

// Function to generate a simple WAV file buffer
function generateWav(sampleRate, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * numChannels * (bitsPerSample / 8);
  const chunkSize = 36 + dataSize;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write samples
  for (let i = 0; i < samples.length; i++) {
    // scale from -1.0..1.0 to -32767..32767
    let s = Math.max(-1, Math.min(1, samples[i]));
    s = s < 0 ? s * 32768 : s * 32767;
    buffer.writeInt16LE(Math.round(s), 44 + i * 2);
  }

  return buffer;
}

// Tone generator helper with frequency sweep support for better game effects
function generateTone(frequency, durationSec, type = 'sine', volume = 0.5, endFrequency = null) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = 0;
    
    // Envelope (simple ADSR, mostly fade out)
    const envelope = Math.max(0, 1 - (t / durationSec));

    // Frequency sweep if endFrequency is provided
    let freq = frequency;
    if (endFrequency !== null) {
      freq = frequency + (endFrequency - frequency) * (t / durationSec);
    }

    const phase = 2 * Math.PI * freq * t;

    if (type === 'sine') {
      val = Math.sin(phase);
    } else if (type === 'square') {
      val = Math.sign(Math.sin(phase));
    } else if (type === 'sawtooth') {
      val = 2 * ((freq * t) - Math.floor(freq * t + 0.5));
    } else if (type === 'noise') {
      val = Math.random() * 2 - 1;
    }
    
    samples[i] = val * volume * envelope;
  }
  return generateWav(sampleRate, samples);
}

function generateCelebrate() {
  const sampleRate = 44100;
  const durationSec = 2.5;
  const numSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(numSamples);

  // Helper to add a tone to the samples buffer at a specific start time
  function addNote(freq, startTime, noteDuration, type = 'sine', vol = 0.2, endFreq = null) {
    const startSample = Math.floor(startTime * sampleRate);
    const noteSamples = Math.floor(noteDuration * sampleRate);
    for (let i = 0; i < noteSamples; i++) {
      const idx = startSample + i;
      if (idx >= numSamples) break;
      const t = i / sampleRate;
      const envelope = Math.max(0, 1 - (t / noteDuration)); // linear decay
      
      let currentFreq = freq;
      if (endFreq !== null) {
        currentFreq = freq + (endFreq - freq) * (t / noteDuration);
      }
      
      let val = 0;
      const phase = 2 * Math.PI * currentFreq * t;
      if (type === 'sine') {
        val = Math.sin(phase);
      } else if (type === 'square') {
        val = Math.sign(Math.sin(phase));
      } else if (type === 'sawtooth') {
        val = 2 * ((currentFreq * t) - Math.floor(currentFreq * t + 0.5));
      } else if (type === 'triangle') {
        val = Math.abs(2 * ((currentFreq * t) - Math.floor(currentFreq * t + 0.5))) * 2 - 1;
      }
      
      samples[idx] += val * vol * envelope;
    }
  }

  // 1. Victory Fanfare (Gentle warm brassy/sawtooth + sine)
  // Arpeggiated C-major chord
  addNote(261.63, 0.0, 1.8, 'sine', 0.15);     // C4
  addNote(261.63, 0.0, 1.8, 'triangle', 0.05); // C4 texture
  
  addNote(329.63, 0.2, 1.6, 'sine', 0.15);     // E4
  addNote(329.63, 0.2, 1.6, 'triangle', 0.05); // E4 texture
  
  addNote(392.00, 0.4, 1.4, 'sine', 0.15);     // G4
  addNote(392.00, 0.4, 1.4, 'triangle', 0.05); // G4 texture
  
  addNote(523.25, 0.6, 1.2, 'sine', 0.2);      // C5
  addNote(523.25, 0.6, 1.2, 'triangle', 0.08); // C5 texture

  // 2. Sparkling Chimes (High pitch sine bells)
  const chimeNotes = [1046.50, 1318.51, 1567.98, 2093.00, 1760.00, 1567.98, 1318.51, 1046.50];
  chimeNotes.forEach((freq, idx) => {
    const startTime = 0.1 + idx * 0.18; // cascade
    addNote(freq, startTime, 0.45, 'sine', 0.08);
  });

  // 3. Happy Pop Finish
  addNote(440, 2.0, 0.2, 'sine', 0.2, 880); // C5 to C6 quick sweep
  addNote(880, 2.0, 0.08, 'triangle', 0.15); // pop punch

  // Limit/normalize to avoid clipping
  let maxVal = 0;
  for (let i = 0; i < numSamples; i++) {
    if (Math.abs(samples[i]) > maxVal) {
      maxVal = Math.abs(samples[i]);
    }
  }
  if (maxVal > 0.95) {
    const scale = 0.95 / maxVal;
    for (let i = 0; i < numSamples; i++) {
      samples[i] *= scale;
    }
  }

  return generateWav(sampleRate, samples);
}

// Generate specific sounds
const sounds = {
  'correct.mp3': generateTone(523.25, 0.4, 'sine', 0.5, 1046.50), // C5 to C6 (uplifting chirp)
  'wrong.mp3': generateTone(220, 0.5, 'sawtooth', 0.4, 110), // A3 to A2 (downward buzz)
  'coin.mp3': generateTone(987.77, 0.15, 'sine', 0.4, 1318.51), // B5 to E6 (satisfying coin chime)
  'click.mp3': generateTone(600, 0.03, 'sine', 0.15, 300), // very short quiet pop
  'streak.mp3': generateTone(523.25, 0.5, 'sine', 0.5, 1567.98), // C5 to G6 sweep
  'levelup.mp3': generateTone(261.63, 0.8, 'sine', 0.5, 1046.50), // C4 to C6 sweep
  'celebrate.mp3': generateCelebrate(), // C-major arpeggiated victory fanfare with chimes & pop
};

// Write files
for (const [filename, buffer] of Object.entries(sounds)) {
  const filepath = path.join(SOUNDS_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated ${filename}`);
}

console.log('All sounds generated successfully.');
