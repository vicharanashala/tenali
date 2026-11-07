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

/**
 * Determine the Whisper API base URL.
 * 1. Checks VITE_WHISPER_API_URL (e.g. Hugging Face Spaces or custom cloud endpoint)
 * 2. If running on localhost / 127.0.0.1, defaults to http://localhost:8000
 * 3. Otherwise defaults to empty string (relative /api path)
 */
function getWhisperBaseUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHISPER_API_URL) {
    return import.meta.env.VITE_WHISPER_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000';
  }
  return '';
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

    // If no endpoint is configured and we are not on localhost, mark offline to avoid noisy fetch errors
    if (!baseUrl && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setServerOnline(false);
      serverOnlineRef.current = false;
      return;
    }

    const checkServerHealth = async () => {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 2000);
        const healthUrl = baseUrl ? `${baseUrl}/api/health` : '/api/health';
        const res = await fetch(healthUrl, { method: 'GET', signal: controller.signal });
        clearTimeout(tid);
        if (isMounted) {
          const isOk = Boolean(res && res.ok);
          setServerOnline(isOk);
          serverOnlineRef.current = isOk;
        }
      } catch (e) {
        if (isMounted) {
          setServerOnline(false);
          serverOnlineRef.current = false;
        }
      }
    };

    checkServerHealth();
    const interval = setInterval(checkServerHealth, 8000);

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
      const formData = new FormData();
      formData.append('file', wavBlob, 'recording.wav');

      const baseUrl = getWhisperBaseUrl();
      const recognizeUrl = baseUrl ? `${baseUrl}/api/recognize` : '/api/recognize';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(recognizeUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Whisper AI server responded with ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.raw || data.text || '';
      let detectedDigit = data.digit ? Number(data.digit) : null;

      // Verify with phonetic resolver as well
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
      setErrorMessage(
        serverOnlineRef.current
          ? 'Whisper recognition error. Please try again.'
          : 'Whisper AI Server offline. Please connect your Whisper backend.'
      );
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
