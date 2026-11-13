import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioChunkRecorder } from './audioChunkRecorder.js';
import { resolveTextToNumber } from './phoneticResolver.js';

// Module-level shared Web Worker singleton (pre-warms model once across all tabs)
let sharedWorker = null;
let sharedModelStatus = 'loading'; // 'loading' | 'ready'
let sharedLoadingProgress = 0;
let sharedWorkerResolver = null;
const sharedStatusListeners = new Set();
const sharedCompletionListeners = new Set();

function getOrCreateSharedWorker() {
  if (typeof window === 'undefined') return null;
  if (!sharedWorker) {
    try {
      const workerUrl = window.location
        ? `${window.location.origin}/whisper-worker.js`
        : '/whisper-worker.js';
      sharedWorker = new Worker(workerUrl, { type: 'module' });

      sharedWorker.onmessage = (event) => {
        const { status, output, error, data } = event.data || {};

        if (status === 'progress') {
          if (data && typeof data.progress === 'number') {
            sharedLoadingProgress = Math.round(data.progress);
            sharedStatusListeners.forEach((fn) => fn(sharedModelStatus, sharedLoadingProgress));
          }
        } else if (status === 'ready') {
          sharedModelStatus = 'ready';
          sharedLoadingProgress = 100;
          sharedStatusListeners.forEach((fn) => fn('ready', 100));
        } else if (status === 'complete') {
          console.info('[useWhisperVoice] Worker transcription result:', output);
          if (sharedWorkerResolver) {
            sharedWorkerResolver.resolve(output);
            sharedWorkerResolver = null;
          }
          // Broadcast to active instance listeners (protects against lost or late results)
          sharedCompletionListeners.forEach((fn) => {
            try { fn(output); } catch (e) {}
          });
        } else if (status === 'error') {
          console.warn('[useWhisperVoice] Worker error:', error);
          if (sharedWorkerResolver) {
            sharedWorkerResolver.reject(new Error(error || 'Worker error'));
            sharedWorkerResolver = null;
          }
          sharedModelStatus = 'ready';
          sharedStatusListeners.forEach((fn) => fn('ready', 100));
        }
      };

      sharedWorker.onerror = (e) => {
        console.error('[useWhisperVoice] Web Worker error:', e?.message || e);
        sharedModelStatus = 'ready';
        sharedStatusListeners.forEach((fn) => fn('ready', 100));
      };

      sharedWorker.postMessage({ type: 'load' });
    } catch (err) {
      console.warn('[useWhisperVoice] Failed to spawn worker:', err);
      sharedModelStatus = 'ready';
    }
  }
  return sharedWorker;
}

/**
 * useWhisperVoice
 *
 * Click-to-Speak & Real-Time Neural Speech hook for NumberTracingApp & SpaceMazeAdventure.
 *
 * Architecture:
 * 1. 100% In-Browser Inference: Spawns dedicated Web Worker (worker.js) running
 *    quantized Whisper ONNX weights via @huggingface/transformers & ONNX Runtime Web.
 * 2. Zero Server Dependency: Runs completely serverless on Vercel with 0 backend servers.
 * 3. Real-Time Detection: Automatically detects spoken numbers (1-10) with zero latency
 *    via browser native speech recognition as child speaks.
 * 4. Reactive Audio VU Meter: Computes live RMS decibel energy to drive real-time visual
 *    sound wave feedback and provide clear hardware diagnostics.
 */
export function useWhisperVoice({
  onNumberDetected,
  onTextHeard
} = {}) {
  const [modelStatus, setModelStatus] = useState(sharedModelStatus);
  const [loadingProgress, setLoadingProgress] = useState(sharedLoadingProgress);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [heardText, setHeardText] = useState('');
  const [lastDetectedNumber, setLastDetectedNumber] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [serverOnline, setServerOnline] = useState(true);

  const recorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const liveSpeechRef = useRef('');
  const liveDigitRef = useRef(null);
  const onNumberDetectedRef = useRef(onNumberDetected);
  const onTextHeardRef = useRef(onTextHeard);
  const isRecordingRef = useRef(false);
  const autoStopTimerRef = useRef(null);
  const nativeStopTimerRef = useRef(null);
  const stopRecordingRef = useRef(null);
  const lastToggleTimeRef = useRef(0);
  const lastWorkerErrorRef = useRef(null);
  const numberEmittedForCurrentRecordingRef = useRef(false);

  useEffect(() => {
    onNumberDetectedRef.current = onNumberDetected;
  }, [onNumberDetected]);

  useEffect(() => {
    onTextHeardRef.current = onTextHeard;
  }, [onTextHeard]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Track shared Web Worker status and pre-warm model
  useEffect(() => {
    const handleStatus = (status, progress) => {
      setModelStatus(status);
      setLoadingProgress(progress);
    };
    sharedStatusListeners.add(handleStatus);

    if (sharedModelStatus === 'ready') {
      setModelStatus('ready');
      setLoadingProgress(100);
    } else {
      getOrCreateSharedWorker();
    }

    return () => {
      sharedStatusListeners.delete(handleStatus);
    };
  }, []);

  // Subscribe to shared worker completions (handles late completions if safety timeout hit)
  useEffect(() => {
    const handleSharedComplete = (output) => {
      if (numberEmittedForCurrentRecordingRef.current) return;

      let extractedText = '';
      if (typeof output === 'string') {
        extractedText = output;
      } else if (output && typeof output.text === 'string') {
        extractedText = output.text;
      } else if (Array.isArray(output) && output.length > 0) {
        extractedText = typeof output[0] === 'string' ? output[0] : (output[0].text || '');
      }

      const text = (extractedText || '').trim();
      if (!text) return;

      const num = resolveTextToNumber(text);
      console.info('[useWhisperVoice] Late worker transcription resolved:', text, '-> number:', num);

      setHeardText(text);
      if (onTextHeardRef.current) {
        onTextHeardRef.current(text);
      }

      if (num !== null && num >= 1 && num <= 10) {
        numberEmittedForCurrentRecordingRef.current = true;
        setLastDetectedNumber(num);
        setErrorMessage('');
        if (onNumberDetectedRef.current) {
          onNumberDetectedRef.current(num, text);
        }
      } else {
        setErrorMessage(`Heard "${text}", but did not match a number (1-10).`);
      }
      setIsTranscribing(false);
    };

    sharedCompletionListeners.add(handleSharedComplete);
    return () => {
      sharedCompletionListeners.delete(handleSharedComplete);
    };
  }, []);

  // Initialize and cleanup audio recorder
  useEffect(() => {
    const recorder = new AudioChunkRecorder(16000);
    recorder.onVolumeChange = (normalized) => {
      setAudioLevel(normalized);
    };
    recorderRef.current = recorder;

    return () => {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
      if (nativeStopTimerRef.current) {
        clearTimeout(nativeStopTimerRef.current);
      }
      if (recorderRef.current) {
        try { recorderRef.current.destroy(); } catch (e) {}
      }
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  /**
   * Click to Stop Recording & Recognize Spoken Number
   */
  const stopRecording = useCallback(async () => {
    if (!isRecordingRef.current) return;
    setIsRecording(false);
    isRecordingRef.current = false;
    setAudioLevel(0);
    setErrorMessage(''); // Clear previous error immediately so UI is clean during transcription

    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (nativeStopTimerRef.current) {
      clearTimeout(nativeStopTimerRef.current);
      nativeStopTimerRef.current = null;
    }

    try {
      setIsTranscribing(true);

      // Stop recorder and retrieve audio diagnostics
      const stats = recorderRef.current ? recorderRef.current.getStats() : { peakVolume: 0, durationMs: 0 };
      let audioChunk = null;
      if (recorderRef.current) {
        audioChunk = recorderRef.current.stop();
      }

      // Stop speech recognition instance
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }

      // If a number was already emitted during this recording session via zero-latency native speech,
      // DO NOT run Whisper and DO NOT emit onNumberDetected again!
      if (numberEmittedForCurrentRecordingRef.current) {
        setIsTranscribing(false);
        return;
      }

      let recognizedRaw = '';
      let detectedNumber = null;

      // 1. In-Browser Web Worker (ONNX Runtime Web / Transformers.js)
      if (audioChunk && audioChunk.length >= 800) {
        const worker = getOrCreateSharedWorker();
        if (worker) {
          try {
            const workerPromise = new Promise((resolve, reject) => {
              sharedWorkerResolver = { resolve, reject };
              worker.postMessage({
                type: 'transcribe',
                audio: audioChunk
              });

              // 60-second safety timeout for cold-start model initialization
              setTimeout(() => {
                if (sharedWorkerResolver) {
                  console.warn('[useWhisperVoice] Worker transcription timeout');
                  sharedWorkerResolver.resolve(null);
                  sharedWorkerResolver = null;
                }
              }, 60000);
            });

            const res = await workerPromise;
          let extractedText = '';
          if (typeof res === 'string') {
            extractedText = res;
          } else if (res && typeof res.text === 'string') {
            extractedText = res.text;
          } else if (Array.isArray(res) && res.length > 0) {
            extractedText = typeof res[0] === 'string' ? res[0] : (res[0].text || '');
          }

          if (extractedText) {
            recognizedRaw = extractedText.trim();
            const num = resolveTextToNumber(recognizedRaw);
            if (num) {
              detectedNumber = num;
            }
          }
        } catch (workerErr) {
          console.warn('[useWhisperVoice] In-browser worker failed:', workerErr);
          lastWorkerErrorRef.current = workerErr?.message || String(workerErr);
        }
      }
    }

      // 2. Fallback to browser live speech if neural engine did not resolve digit
      if (!detectedNumber) {
        if (!liveSpeechRef.current && !liveDigitRef.current) {
          await new Promise((r) => setTimeout(r, 200));
        }

        if (liveDigitRef.current) {
          detectedNumber = liveDigitRef.current;
        } else {
          const textToResolve = recognizedRaw || liveSpeechRef.current;
          detectedNumber = resolveTextToNumber(textToResolve);
        }

        if (!recognizedRaw && liveSpeechRef.current) {
          recognizedRaw = liveSpeechRef.current;
        }
      }

      const finalDisplay = recognizedRaw || (detectedNumber ? String(detectedNumber) : '');
      setHeardText(finalDisplay);

      if (finalDisplay && onTextHeardRef.current) {
        onTextHeardRef.current(finalDisplay);
      }

      if (!numberEmittedForCurrentRecordingRef.current && detectedNumber !== null && detectedNumber >= 1 && detectedNumber <= 10) {
        numberEmittedForCurrentRecordingRef.current = true;
        setLastDetectedNumber(detectedNumber);
        setErrorMessage('');
        if (onNumberDetectedRef.current) {
          onNumberDetectedRef.current(detectedNumber, finalDisplay);
        }
      } else if (!numberEmittedForCurrentRecordingRef.current) {
        if (finalDisplay) {
          setErrorMessage(`Heard "${finalDisplay}", but did not match a number (1-10).`);
        } else {
          // Provide precise diagnostics based on physical mic energy & worker status
          if (lastWorkerErrorRef.current) {
            setErrorMessage(`AI speech worker notice: ${lastWorkerErrorRef.current}`);
          } else if (stats.peakVolume < 0.003) {
            setErrorMessage('Microphone appears muted or quiet. Please check system mic settings.');
          } else if (stats.durationMs < 400) {
            setErrorMessage('Recording was very short. Click mic, say the number, then stop.');
          } else {
            setErrorMessage('No speech detected. Please speak closer to the mic.');
          }
        }
      }
    } catch (err) {
      console.error('[useWhisperVoice] Recognition error:', err);
      setErrorMessage('Speech recognition error. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  stopRecordingRef.current = stopRecording;

  /**
   * Click to Start Recording
   */
  const startRecording = useCallback(async () => {
    if (isRecordingRef.current || isTranscribing) return;
    setErrorMessage('');
    setHeardText('');
    setLastDetectedNumber(null);
    lastWorkerErrorRef.current = null;
    liveSpeechRef.current = '';
    liveDigitRef.current = null;
    numberEmittedForCurrentRecordingRef.current = false;
    if (nativeStopTimerRef.current) {
      clearTimeout(nativeStopTimerRef.current);
      nativeStopTimerRef.current = null;
    }

    try {
      if (!recorderRef.current) {
        const recorder = new AudioChunkRecorder(16000);
        recorder.onVolumeChange = (normalized) => setAudioLevel(normalized);
        recorderRef.current = recorder;
      }
      await recorderRef.current.start();
      setIsRecording(true);
      isRecordingRef.current = true;

      // Start browser native speech recognition with real-time interim & continuous results
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.lang = 'en-IN';
          rec.continuous = false;
          rec.interimResults = true;
          rec.maxAlternatives = 8;

          rec.onend = () => {
            if (isRecordingRef.current) {
              try { rec.start(); } catch (e) {}
            }
          };

          rec.onresult = (ev) => {
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
              const res = ev.results[i];
              if (!res) continue;

              let matchedNum = null;
              let matchedText = '';

              for (let a = 0; a < res.length; a++) {
                const alt = res[a]?.transcript?.trim();
                if (alt) {
                  if (!matchedText) matchedText = alt;
                  const num = resolveTextToNumber(alt);
                  if (num) {
                    matchedNum = num;
                    matchedText = alt;
                    break;
                  }
                }
              }

              if (matchedText) {
                console.info('[useWhisperVoice] Native speech recognized:', matchedText, '-> number:', matchedNum);
                liveSpeechRef.current = matchedText;
                setHeardText(matchedText);

                if (matchedNum && !numberEmittedForCurrentRecordingRef.current) {
                  numberEmittedForCurrentRecordingRef.current = true;
                  liveDigitRef.current = matchedNum;
                  setLastDetectedNumber(matchedNum);
                  setErrorMessage('');

                  // Instant zero-latency trigger!
                  if (onNumberDetectedRef.current) {
                    onNumberDetectedRef.current(matchedNum, matchedText);
                  }

                  // Automatically close recording after 700ms (tracked in ref to avoid cutting off next step)
                  if (nativeStopTimerRef.current) clearTimeout(nativeStopTimerRef.current);
                  nativeStopTimerRef.current = setTimeout(() => {
                    if (isRecordingRef.current && stopRecordingRef.current) {
                      stopRecordingRef.current();
                    }
                  }, 700);
                }
              }
            }
          };

          rec.onerror = (e) => {
            console.warn('[useWhisperVoice] Speech recognition event:', e.error);
          };

          rec.start();
          speechRecognitionRef.current = rec;
        } catch (e) {
          console.warn('[useWhisperVoice] SpeechRec init:', e);
        }
      }

      // Automatically stop after 7 seconds if no speech is detected
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = setTimeout(() => {
        if (isRecordingRef.current && stopRecordingRef.current) {
          stopRecordingRef.current();
        }
      }, 7000);

    } catch (err) {
      console.warn('[useWhisperVoice] Mic start error:', err);
      setErrorMessage(err.message || 'Microphone access denied. Please allow mic permissions in your browser.');
    }
  }, [isTranscribing]);

  /**
   * Click-to-toggle helper with accidental double-click protection
   */
  const toggleRecording = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 500) {
      return; // Protect against rapid double click/tap
    }
    lastToggleTimeRef.current = now;

    if (isRecordingRef.current) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [startRecording, stopRecording]);

  return {
    ready: true,
    modelStatus,
    loadingProgress,
    isRecording,
    isTranscribing,
    audioLevel,
    heardText,
    lastDetectedNumber,
    errorMessage,
    serverOnline: true,
    startRecording,
    stopRecording,
    toggleRecording
  };
}

export default useWhisperVoice;
