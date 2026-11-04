/**
 * whisperVoiceClient.js
 *
 * Client-side bridge connecting browser microphone streams to the local
 * Python Whisper server (whisper_voice_recognizer.py --serve --port 5001).
 *
 * Features:
 * - Direct 16kHz PCM WAV encoding in pure JavaScript (zero ffmpeg dependency!).
 * - Fast silence gating (doesn't spam the server when user is not speaking).
 * - Non-blocking asynchronous transcription with phonetic homophone resolution.
 * - Completely safe: fails silently if the server is offline, allowing native Web Speech to take over.
 */

export const WHISPER_API_URL = 'http://localhost:5001';

/**
 * Checks if the local Whisper server is online and ready.
 */
export async function checkWhisperServerHealth() {
  if (typeof window === 'undefined') return false;
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
 * Creates a stream recorder that records ~2.0-second audio slices and posts WAV bytes to Whisper server.
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
          noiseSuppression: false, // Don't suppress faint whispers
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

        // ~2.0 seconds worth of samples
        const totalSamples = sampleBuffer.reduce((acc, curr) => acc + curr.length, 0);
        const targetSampleCount = Math.round(audioContext.sampleRate * 2.0);

        if (totalSamples >= targetSampleCount && !isSending) {
          // Flatten accumulated buffer
          const merged = new Float32Array(totalSamples);
          let offset = 0;
          for (const chunk of sampleBuffer) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          // Reset buffer
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
