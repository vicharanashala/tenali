/**
 * voiceRecognizer.js
 *
 * Dedicated Voice Recognition Service for the Numbers 1 to 10 module.
 *
 * Architecture:
 * - Hybrid Speech Architecture:
 *   1. Cloud Whisper API (Groq Whisper Large-v3 Turbo) -> ~90ms ultra-low latency, zero backend!
 *   2. Self-Hosted Whisper HTTP Server (Python whisper_voice_recognizer.py or Hugging Face ZeroGPU).
 *   3. Native Browser Web Speech API (SpeechRecognition / webkitSpeechRecognition) as instant zero-network fallback.
 *
 * Features:
 * - Pure JavaScript 16-bit 16kHz PCM WAV encoding (zero ffmpeg / external binary dependencies).
 * - Silence threshold gating to save bandwidth & compute.
 * - Comprehensive multi-lingual & phonetic homophone resolution for numbers 1 to 10
 *   (English, Tamil, Hindi, Spanish + common acoustic misrecognitions).
 * - Safe failover: if network or mic drops, gracefully degrades without crashing UI.
 */

export const GROQ_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GROQ_API_KEY)
  ? import.meta.env.VITE_GROQ_API_KEY.trim()
  : '';

export const WHISPER_API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WHISPER_API_URL)
  ? import.meta.env.VITE_WHISPER_API_URL.replace(/\/+$/, '')
  : 'http://localhost:5001';

// Phonetic and multilingual dictionary for numbers 1 to 10
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

/**
 * Resolves a recognized transcript or phrase to a number (1-10) using phonetic rules.
 */
export function resolveTextToNumber(text) {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  for (let n = 1; n <= 10; n++) {
    if (PHONETIC_MAP[n].test(clean)) return n;
  }
  return null;
}

/**
 * Checks if a Whisper service (Cloud or Self-Hosted) is available.
 */
export async function checkWhisperServerHealth() {
  if (typeof window === 'undefined') return false;
  if (GROQ_API_KEY) return true;

  try {
    const res = await fetch(`${WHISPER_API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(4500)
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Encodes Float32Array PCM samples into standard 16-bit mono WAV Blob.
 */
export function encodeWav(samples, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Resamples input Float32Array to 16kHz.
 */
export function downsampleTo16k(audioBuffer, inputSampleRate) {
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
 * Creates a stream recorder for Whisper transcription.
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
          noiseSuppression: false,
          autoGainControl: true
        }
      });

      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtxClass();
      mediaStreamSource = audioContext.createMediaStreamSource(audioStream);

      scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      sampleBuffer = [];
      isActive = true;

      scriptProcessor.onaudioprocess = async (event) => {
        if (!isActive) return;
        const channelData = event.inputBuffer.getChannelData(0);
        sampleBuffer.push(new Float32Array(channelData));

        const totalSamples = sampleBuffer.reduce((acc, curr) => acc + curr.length, 0);
        // Optimized to 0.75s for fast single-digit counting (~2.4x faster than 1.8s)
        const targetSampleCount = Math.round(audioContext.sampleRate * 0.75);

        if (totalSamples >= targetSampleCount && !isSending) {
          const merged = new Float32Array(totalSamples);
          let offset = 0;
          for (const chunk of sampleBuffer) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          sampleBuffer = [];

          const resampled16k = downsampleTo16k(merged, audioContext.sampleRate);

          let peak = 0;
          for (let i = 0; i < resampled16k.length; i++) {
            const abs = Math.abs(resampled16k[i]);
            if (abs > peak) peak = abs;
          }

          if (peak < 0.005) return;

          const wavBlob = encodeWav(resampled16k, 16000);
          isSending = true;

          try {
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
                if (raw && onTextHeard) onTextHeard(raw);
                const detectedNumber = resolveTextToNumber(raw);
                if (detectedNumber && onNumberDetected) {
                  onNumberDetected(detectedNumber, raw, raw, 'groq-whisper');
                }
              }
            } else {
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
                  if (raw && onTextHeard) onTextHeard(raw);
                  if (result.number && onNumberDetected) {
                    onNumberDetected(result.number, result.text, raw, 'hf-whisper');
                  }
                }
              }
            }
          } catch {
            // Fail silent
          } finally {
            isSending = false;
          }
        }
      };

      mediaStreamSource.connect(scriptProcessor);
      // Mute audio output to prevent microphone feedback echo
      const muteGain = audioContext.createGain();
      muteGain.gain.value = 0;
      scriptProcessor.connect(muteGain);
      muteGain.connect(audioContext.destination);

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
      try { scriptProcessor.disconnect(); } catch { /* ignore */ }
      scriptProcessor = null;
    }
    if (mediaStreamSource) {
      try { mediaStreamSource.disconnect(); } catch { /* ignore */ }
      mediaStreamSource = null;
    }
    if (audioContext) {
      try {
        if (audioContext.state !== 'closed') audioContext.close();
      } catch { /* ignore */ }
      audioContext = null;
    }
    if (audioStream) {
      try {
        audioStream.getTracks().forEach((track) => track.stop());
      } catch { /* ignore */ }
      audioStream = null;
    }
    sampleBuffer = [];
    isSending = false;
    if (onStatusChange) onStatusChange(false);
  }

  return { start, stop };
}

/**
 * Unified Voice Recognizer Service
 * Orchestrates Whisper AI and Browser Web Speech into a single, clean interface.
 */
export function createVoiceRecognizer({
  onNumberDetected,
  onTextHeard,
  onEngineChange,
  onStatusChange,
  language = 'en-US'
}) {
  let whisperStreamer = null;
  let nativeSpeechRec = null;
  let isRunning = false;
  let lastMatchTime = 0;

  function handleNumber(num, cleanText, rawText) {
    const now = Date.now();
    if (now - lastMatchTime < 280) return;
    lastMatchTime = now;
    if (onNumberDetected) onNumberDetected(num, cleanText, rawText);
  }

  async function start() {
    if (isRunning) return;
    isRunning = true;
    if (onStatusChange) onStatusChange('listening');

    // 1. Try launching Whisper
    let whisperStarted = false;
    try {
      whisperStreamer = createWhisperStreamer({
        onNumberDetected: (num, clean, raw) => handleNumber(num, clean, raw),
        onTextHeard: (text) => { if (onTextHeard) onTextHeard(text); },
        onStatusChange: (isLive) => {
          if (onEngineChange) onEngineChange(isLive ? 'whisper' : 'native');
        }
      });
      whisperStarted = await whisperStreamer.start();
    } catch {
      whisperStarted = false;
    }

    if (whisperStarted) {
      if (onEngineChange) onEngineChange('whisper');
    } else {
      if (onEngineChange) onEngineChange('native');
    }

    // 2. Launch Native Web Speech API (low latency concurrent/fallback listener)
    if (typeof window !== 'undefined') {
      const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechClass) {
        try {
          const rec = new SpeechClass();
          nativeSpeechRec = rec;
          rec.continuous = true;
          rec.interimResults = true;
          rec.maxAlternatives = 8;
          rec.lang = language || 'en-US';

          rec.onresult = (ev) => {
            if (!isRunning) return;
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
              const res = ev.results[i];
              if (!res) continue;
              const transcript = res[0] ? res[0].transcript : '';
              if (transcript && onTextHeard) onTextHeard(transcript.trim());

              for (let a = 0; a < res.length; a++) {
                const cand = res[a] ? res[a].transcript : '';
                const num = resolveTextToNumber(cand);
                if (num) {
                  handleNumber(num, cand, transcript);
                  break;
                }
              }
            }
          };

          rec.onend = () => {
            if (isRunning && nativeSpeechRec) {
              try { nativeSpeechRec.start(); } catch { /* ignore */ }
            }
          };

          rec.onerror = () => { /* safe ignore */ };

          rec.start();
        } catch {
          // Native speech unavailable
        }
      }
    }
  }

  function stop() {
    isRunning = false;
    if (whisperStreamer) {
      try { whisperStreamer.stop(); } catch { /* ignore */ }
      whisperStreamer = null;
    }
    if (nativeSpeechRec) {
      try { nativeSpeechRec.abort(); } catch { /* ignore */ }
      nativeSpeechRec = null;
    }
    if (onStatusChange) onStatusChange('idle');
  }

  return { start, stop };
}

export default {
  resolveTextToNumber,
  checkWhisperServerHealth,
  createWhisperStreamer,
  createVoiceRecognizer,
  PHONETIC_MAP
};

