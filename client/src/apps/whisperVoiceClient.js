/**
 * whisperVoiceClient.js
 *
 * Universal client-side bridge connecting browser microphone streams to Whisper.
 *
 * Supports 2 Modes:
 * 1. Direct Cloud Whisper API (via Groq Whisper Large-v3) -> Zero backend server needed, ~90ms latency!
 * 2. Self-hosted Python Whisper service (via VITE_WHISPER_API_URL or http://localhost:5001).
 *
 * Features:
 * - Direct 16kHz PCM WAV encoding in pure JavaScript (zero ffmpeg dependency!).
 * - Fast silence gating (discards empty audio before sending to save bandwidth/compute).
 * - Multi-language and whispered homophone resolution ('bun' -> 1, 'bye' -> 5, 'dead' -> 10).
 * - Completely safe: fails silently if offline, allowing native Web Speech to take over.
 */

export const GROQ_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GROQ_API_KEY)
  ? import.meta.env.VITE_GROQ_API_KEY.trim()
  : '';

export const WHISPER_API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WHISPER_API_URL)
  ? import.meta.env.VITE_WHISPER_API_URL.replace(/\/+$/, '')
  : 'http://localhost:5001';

// Phonetic homophone dictionary for numbers 1 to 10
export const PHONETIC_MAP = {
  1:  /\b(1|one|won|wan|van|when|run|bun|fun|done|first|ek|ondru|onnu|onru|un|uno)\b/i,
  2:  /\b(2|two|to|too|tu|do|doo|second|rendu|erandu|irandu|dos)\b/i,
  3:  /\b(3|three|tree|free|thee|tri|third|teen|tin|moonu|moondru|tres)\b/i,
  4:  /\b(4|four|for|fore|far|ford|fourth|char|chaar|naalu|naangu|cuatro)\b/i,
  5:  /\b(5|five|faiv|fai|fiv|fifth|panch|paanch|anju|aindhu|ainthu|cinco|bye|buy)\b/i,
  6:  /\b(6|six|siks|sex|sick|sixth|chhe|che|chha|aaru|seis)\b/i,
  7:  /\b(7|seven|sevn|sevan|seventh|saat|sat|yezhu|ezhu|siete)\b/i,
  8:  /\b(8|eight|ate|ait|eat|eighth|aath|ath|ettu|ocho)\b/i,
  9:  /\b(9|nine|nain|nin|night|ninth|nau|no|ombodhu|onpathu|onbathu|nueve)\b/i,
  10: /\b(10|ten|tan|tin|den|tenth|das|dus|pathu|patthu|diez|dead)\b/i
};

export function resolveTextToNumber(text) {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  for (let n = 1; n <= 10; n++) {
    if (PHONETIC_MAP[n].test(clean)) return n;
  }
  return null;
}

/**
 * Checks if Whisper is available (either Cloud API or local server).
 */
export async function checkWhisperServerHealth() {
  if (typeof window === 'undefined') return false;
  // If Groq Cloud Whisper API key is present, it's always ready!
  if (GROQ_API_KEY) return true;

  try {
    const res = await fetch(`${WHISPER_API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(1200)
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Encodes a Float32Array of audio samples into a standard 16-bit mono WAV Blob.
 */
function encodeWav(samples, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  // file length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(8, 'WAVE');
  // format chunk identifier
  writeString(12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 2 bytes per sample for 16-bit mono)
  view.setUint32(28, sampleRate * 2, true);
  // block align (2 bytes)
  view.setUint16(32, 2, true);
  // bits per sample (16)
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Resamples an input Float32Array to 16kHz.
 */
function downsampleTo16k(audioBuffer, inputSampleRate) {
  if (inputSampleRate === 16000) return audioBuffer;
  const ratio = inputSampleRate / 16000;
  const newLength = Math.round(audioBuffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < audioBuffer.length; i++) {
      accum += audioBuffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

/**
 * Creates a stream recorder that records ~1.8-second audio slices and transcribes them via Whisper.
 */
export function createWhisperStreamer({ onNumberDetected, onTextHeard, onStatusChange }) {
  let audioStream = null;
  let audioContext = null;
  let scriptProcessor = null;
  let mediaStreamSource = null;
  let sampleBuffer = [];
  let isSending = false;
  let isActive = false;

  async function start() {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return false;

    try {
      const isHealthy = await checkWhisperServerHealth();
      if (!isHealthy) {
        if (onStatusChange) onStatusChange(false);
        return false;
      }
      if (onStatusChange) onStatusChange(true);

      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: false, // Preserve delicate whisper frequencies
          autoGainControl: true
        }
      });

      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtxClass();
      mediaStreamSource = audioContext.createMediaStreamSource(audioStream);

      // Buffer size 4096 gives ~92ms intervals at 44.1kHz / 48kHz
      scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      sampleBuffer = [];
      isActive = true;

      scriptProcessor.onaudioprocess = async (event) => {
        if (!isActive) return;
        const channelData = event.inputBuffer.getChannelData(0);
        sampleBuffer.push(new Float32Array(channelData));

        // ~1.8 seconds worth of audio samples
        const totalSamples = sampleBuffer.reduce((acc, curr) => acc + curr.length, 0);
        const targetSampleCount = Math.round(audioContext.sampleRate * 1.8);

        if (totalSamples >= targetSampleCount && !isSending) {
          // Flatten accumulated buffer
          const merged = new Float32Array(totalSamples);
          let offset = 0;
          for (const chunk of sampleBuffer) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          // Reset buffer immediately
          sampleBuffer = [];

          // Downsample to 16kHz
          const resampled16k = downsampleTo16k(merged, audioContext.sampleRate);

          // Fast silence check: calculate peak
          let peak = 0;
          for (let i = 0; i < resampled16k.length; i++) {
            const abs = Math.abs(resampled16k[i]);
            if (abs > peak) peak = abs;
          }

          // Skip sending if dead silence (< 0.005)
          if (peak < 0.005) {
            return;
          }

          // Encode to standard 16-bit mono WAV blob
          const wavBlob = encodeWav(resampled16k, 16000);
          isSending = true;

          try {
            // MODE A: Direct Cloud Whisper API (Groq Whisper Large-v3 Turbo) -> ~90ms latency, zero backend!
            if (GROQ_API_KEY) {
              const formData = new FormData();
              formData.append('file', wavBlob, 'audio.wav');
              formData.append('model', 'whisper-large-v3-turbo');
              formData.append('prompt', '1, 2, 3, 4, 5, 6, 7, 8, 9, 10. Counting numbers: one, two, three, four, five, six, seven, eight, nine, ten.');
              formData.append('temperature', '0');

              const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: formData
              });

              if (res.ok) {
                const result = await res.json();
                const raw = result.text ? result.text.trim() : '';
                if (raw && onTextHeard) {
                  onTextHeard(raw);
                }
                const detectedNumber = resolveTextToNumber(raw);
                if (detectedNumber && onNumberDetected) {
                  onNumberDetected(detectedNumber, raw, raw);
                }
              }
            } else {
              // MODE B: Self-Hosted Whisper HTTP Server (Python or Hugging Face Space)
              const res = await fetch(`${WHISPER_API_URL}/transcribe`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'audio/wav'
                },
                body: wavBlob
              });

              if (res.ok) {
                const result = await res.json();
                if (result && result.success) {
                  const raw = result.raw_text || result.text;
                  if (raw && onTextHeard) {
                    onTextHeard(raw);
                  }
                  if (result.number && onNumberDetected) {
                    onNumberDetected(result.number, result.text, raw);
                  }
                }
              }
            }
          } catch {
            // Safe fallback if network flickers
          } finally {
            isSending = false;
          }
        }
      };

      mediaStreamSource.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      return true;
    } catch {
      isActive = false;
      if (onStatusChange) onStatusChange(false);
      return false;
    }
  }

  function stop() {
    isActive = false;
    if (scriptProcessor) {
      try {
        scriptProcessor.disconnect();
      } catch {
        // Safe cleanup
      }
      scriptProcessor = null;
    }
    if (mediaStreamSource) {
      try {
        mediaStreamSource.disconnect();
      } catch {
        // Safe cleanup
      }
      mediaStreamSource = null;
    }
    if (audioContext) {
      try {
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      } catch {
        // Safe cleanup
      }
      audioContext = null;
    }
    if (audioStream) {
      try {
        audioStream.getTracks().forEach((track) => track.stop());
      } catch {
        // Safe cleanup
      }
      audioStream = null;
    }
    sampleBuffer = [];
    isSending = false;
    if (onStatusChange) onStatusChange(false);
  }

  return { start, stop };
}
