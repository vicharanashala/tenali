import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioChunkRecorder } from './audioChunkRecorder.js';
import { resolveTextToNumber } from './phoneticResolver.js';

/**
 * Encode Float32Array PCM samples into a standard 16-bit 16kHz mono WAV Blob.
 * Generates valid RIFF headers that soundfile and Whisper read directly.
 */
function encodeWAV(samples, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  view.setUint32(16, 16, true); // PCM Chunk size
  view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true);  // Channels (1 = Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true);  // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export const HUGGINGFACE_WHISPER_SPACE_URL = 'https://gradient-queen-whisper-indian-digits.hf.space';

/**
 * Determine the Whisper API base URL.
 * 1. Honors explicit VITE_WHISPER_API_URL if configured.
 * 2. Uses the same-origin proxy route `/whisper-service` (configured in Vite & vercel.json)
 *    to avoid cross-site CSRF/CORS 403 blocks from Hugging Face's SvelteKit frontend.
 */
function getWhisperBaseUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHISPER_API_URL) {
    return import.meta.env.VITE_WHISPER_API_URL.replace(/\/+$/, '');
  }
  return '/whisper-service';
}

/**
 * useWhisperVoice (Pure Whisper Neural Speech Hook — NO WebKit)
 *
 * Dedicated to `gradient-queen/whisper-tiny-indian-digits-final`.
 * Captures 16kHz audio from mic and performs neural transcription strictly via Whisper.
 */
export function useWhisperVoice({
  onNumberDetected,
  onTextHeard
} = {}) {
  const [modelStatus, setModelStatus] = useState('ready');
  const [loadingProgress, setLoadingProgress] = useState(100);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [heardText, setHeardText] = useState('');
  const [lastDetectedNumber, setLastDetectedNumber] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [serverOnline, setServerOnline] = useState(false);

  const recorderRef = useRef(null);
  const onNumberDetectedRef = useRef(onNumberDetected);
  const onTextHeardRef = useRef(onTextHeard);
  const isRecordingRef = useRef(false);
  const serverOnlineRef = useRef(false);
  const autoStopTimerRef = useRef(null);
  const stopRecordingRef = useRef(null);

  useEffect(() => {
    onNumberDetectedRef.current = onNumberDetected;
  }, [onNumberDetected]);

  useEffect(() => {
    onTextHeardRef.current = onTextHeard;
  }, [onTextHeard]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Periodic health check for Whisper backend
  useEffect(() => {
    let isMounted = true;
    const baseUrl = getWhisperBaseUrl();

    const checkServerHealth = async () => {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 6000);
        let ok = false;

        const endpoints = [
          `${baseUrl}/health`,
          `${baseUrl}/api/health`,
          `${HUGGINGFACE_WHISPER_SPACE_URL}/health`,
          `${HUGGINGFACE_WHISPER_SPACE_URL}/api/health`,
          `${baseUrl}/`
        ];

        for (const ep of endpoints) {
          try {
            const res = await fetch(ep, {
              method: 'GET',
              headers: { 'x-requested-with': 'XMLHttpRequest' },
              signal: controller.signal
            });
            if (res.ok) {
              ok = true;
              break;
            }
          } catch (e) {}
        }

        clearTimeout(tid);
        if (isMounted) {
          setServerOnline(ok);
          serverOnlineRef.current = ok;
        }
      } catch (e) {
        if (isMounted) {
          setServerOnline(false);
          serverOnlineRef.current = false;
        }
      }
    };

    checkServerHealth();
    const interval = setInterval(checkServerHealth, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Initialize and cleanup recorder
  useEffect(() => {
    recorderRef.current = new AudioChunkRecorder(16000);

    return () => {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
      if (recorderRef.current) {
        try { recorderRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  /**
   * Stop Recording & Transcribe with Whisper
   */
  const stopRecording = useCallback(async () => {
    if (!isRecordingRef.current) return;
    setIsRecording(false);
    isRecordingRef.current = false;

    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }

    try {
      setIsTranscribing(true);

      let audioChunk = null;
      if (recorderRef.current) {
        audioChunk = recorderRef.current.stop();
      }

      if (!audioChunk || audioChunk.length < 800) {
        setErrorMessage('No speech recorded. Please hold the mic and speak.');
        setIsTranscribing(false);
        return;
      }

      const wavBlob = encodeWAV(audioChunk, 16000);
      const baseUrl = getWhisperBaseUrl();
      const controller = new AbortController();
      // Allow up to 35s in case Hugging Face Space is spinning up from sleep
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      let data = null;
      let lastFailureDetail = '';

      // Ordered list of candidate endpoint strategies (raw binary WAV preferred to avoid CSRF blocks)
      const attempts = [
        // 1. Same-Origin Proxy: /transcribe with raw wavBlob (whisper-service/app.py standard)
        async () => {
          const res = await fetch(`${baseUrl}/transcribe`, {
            method: 'POST',
            body: wavBlob,
            headers: {
              'Content-Type': 'audio/wav',
              'x-requested-with': 'XMLHttpRequest'
            },
            signal: controller.signal
          });
          if (res.ok) return await res.json();
          const errTxt = await res.text().catch(() => '');
          lastFailureDetail = `${baseUrl}/transcribe (${res.status} ${errTxt.slice(0, 80)})`;
          return null;
        },
        // 2. Direct HF Space: /transcribe with raw wavBlob
        async () => {
          const res = await fetch(`${HUGGINGFACE_WHISPER_SPACE_URL}/transcribe`, {
            method: 'POST',
            body: wavBlob,
            headers: {
              'Content-Type': 'audio/wav',
              'x-requested-with': 'XMLHttpRequest'
            },
            signal: controller.signal
          });
          if (res.ok) return await res.json();
          const errTxt = await res.text().catch(() => '');
          lastFailureDetail = `Direct /transcribe (${res.status} ${errTxt.slice(0, 80)})`;
          return null;
        },
        // 3. Same-Origin Proxy: /api/recognize with FormData
        async () => {
          const formData = new FormData();
          formData.append('file', wavBlob, 'recording.wav');
          formData.append('audio', wavBlob, 'recording.wav');

          const res = await fetch(`${baseUrl}/api/recognize`, {
            method: 'POST',
            body: formData,
            headers: {
              'x-requested-with': 'XMLHttpRequest'
            },
            signal: controller.signal
          });
          if (res.ok) return await res.json();
          const errTxt = await res.text().catch(() => '');
          lastFailureDetail = `${baseUrl}/api/recognize (${res.status} ${errTxt.slice(0, 80)})`;
          return null;
        },
        // 4. Same-Origin Proxy: /recognize with FormData
        async () => {
          const formData = new FormData();
          formData.append('file', wavBlob, 'recording.wav');

          const res = await fetch(`${baseUrl}/recognize`, {
            method: 'POST',
            body: formData,
            headers: {
              'x-requested-with': 'XMLHttpRequest'
            },
            signal: controller.signal
          });
          if (res.ok) return await res.json();
          const errTxt = await res.text().catch(() => '');
          lastFailureDetail = `${baseUrl}/recognize (${res.status} ${errTxt.slice(0, 80)})`;
          return null;
        },
        // 5. Local dev localhost fallback
        async () => {
          if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            const formData = new FormData();
            formData.append('file', wavBlob, 'recording.wav');

            const res = await fetch('http://localhost:8000/api/recognize', {
              method: 'POST',
              body: formData,
              signal: controller.signal
            });
            if (res.ok) return await res.json();
          }
          return null;
        }
      ];

      for (const attempt of attempts) {
        try {
          const resData = await attempt();
          if (resData) {
            data = resData;
            break;
          }
        } catch (callErr) {
          lastFailureDetail = callErr.message || String(callErr);
        }
      }

      clearTimeout(timeoutId);

      if (!data) {
        throw new Error(lastFailureDetail || 'Whisper Space returned an unexpected error');
      }

      const rawText = data.raw || data.raw_text || data.text || '';
      let detectedDigit = null;
      if (data.digit !== undefined && data.digit !== null) {
        detectedDigit = Number(data.digit);
      } else if (data.number !== undefined && data.number !== null) {
        detectedDigit = Number(data.number);
      }

      // Verify with phonetic resolver if rawText exists
      if (!detectedDigit && rawText) {
        detectedDigit = resolveTextToNumber(rawText);
      }

      setServerOnline(true);
      serverOnlineRef.current = true;

      const display = rawText || (detectedDigit ? String(detectedDigit) : '');
      setHeardText(display);

      if (display && onTextHeardRef.current) {
        onTextHeardRef.current(display);
      }

      if (detectedDigit !== null && detectedDigit >= 1 && detectedDigit <= 10) {
        setLastDetectedNumber(detectedDigit);
        setErrorMessage('');
        if (onNumberDetectedRef.current) {
          onNumberDetectedRef.current(detectedDigit, display);
        }
      } else {
        if (display) {
          setErrorMessage(`Whisper heard "${display}", but did not match a number (1-10).`);
        } else {
          setErrorMessage('Whisper detected no speech. Please speak closer to the mic.');
        }
      }
    } catch (err) {
      console.error('[useWhisperVoice] Whisper inference error:', err);
      const isAbort = err.name === 'AbortError';
      if (isAbort) {
        setErrorMessage('Whisper Space is waking up. Please try again in 10-15 seconds!');
      } else {
        setErrorMessage(`Whisper AI: ${err.message || 'Recognition error. Please try again.'}`);
      }
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  stopRecordingRef.current = stopRecording;

  /**
   * Start Recording (Pure Whisper, No WebKit)
   */
  const startRecording = useCallback(async () => {
    if (isRecordingRef.current || isTranscribing) return;
    setErrorMessage('');
    setHeardText('');
    setLastDetectedNumber(null);

    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudioChunkRecorder(16000);
      }
      await recorderRef.current.start();
      setIsRecording(true);
      isRecordingRef.current = true;

      // Auto-stop after 3.8 seconds so child doesn't have to tap stop manually
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = setTimeout(() => {
        if (isRecordingRef.current && stopRecordingRef.current) {
          stopRecordingRef.current();
        }
      }, 3800);

    } catch (err) {
      console.warn('[useWhisperVoice] Mic start error:', err);
      setErrorMessage(err.message || 'Microphone access denied. Please allow mic permissions.');
    }
  }, [isTranscribing]);

  const toggleRecording = useCallback(() => {
    if (isRecordingRef.current) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [startRecording, stopRecording]);

  return {
    modelStatus,
    loadingProgress,
    isRecording,
    isTranscribing,
    heardText,
    lastDetectedNumber,
    errorMessage,
    serverOnline,
    startRecording,
    stopRecording,
    toggleRecording
  };
}

export default useWhisperVoice;
