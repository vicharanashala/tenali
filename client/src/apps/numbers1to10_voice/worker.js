/**
 * worker.js
 *
 * Dedicated Web Worker for speech recognition using @huggingface/transformers.
 * Follows the official Hugging Face React tutorial architecture:
 * https://huggingface.co/docs/transformers.js/en/tutorials/react
 *
 * Exclusively tuned for Indian digits and numbers 1 to 10.
 * Runs 100% in-browser via WebAssembly (zero server required).
 * Primary: Local Olive-quantized INT8 fine-tuned Indian digits Whisper model.
 * Fallback: onnx-community/whisper-tiny.
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3';

// Enable loading bundled model from client/public/models/
env.allowLocalModels = true;
env.allowRemoteModels = true;
env.localModelPath = '/models/';
env.useBrowserCache = true;

const LOCAL_MODEL = 'whisper_indian_digits';
const FALLBACK_MODEL = 'onnx-community/whisper-tiny';
const TASK = 'automatic-speech-recognition';

/**
 * Initialize the pipeline with WebAssembly (WASM).
 * We explicitly use WASM with SIMD instead of WebGPU because ONNX Runtime Web's WebGPU
 * backend retains tensors in GPU memory buffers during Whisper autoregressive decoding,
 * which triggers "The data is not on CPU" errors.
 * WASM runs 100% in CPU linear memory with zero GPU buffer errors.
 */
async function loadPipeline(task, modelId, progress_callback) {
  try {
    console.info(`[worker.js] Loading Whisper pipeline via WebAssembly (wasm): ${modelId}...`);
    return await pipeline(task, modelId, {
      progress_callback,
      device: 'wasm'
    });
  } catch (err) {
    console.warn(`[worker.js] First attempt for ${modelId} failed (${err?.message}), retrying with explicit dtype:`, err);
    return await pipeline(task, modelId, {
      progress_callback,
      dtype: 'fp32',
      device: 'wasm'
    });
  }
}

class PipelineSingleton {
  static task = TASK;
  static model = LOCAL_MODEL;
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      try {
        console.info(`[worker.js] Loading primary local Olive INT8 fine-tuned model: ${LOCAL_MODEL}...`);
        this.instance = await loadPipeline(this.task, LOCAL_MODEL, progress_callback);
        this.model = LOCAL_MODEL;
        console.info(`[worker.js] Local fine-tuned model loaded successfully!`);
      } catch (localErr) {
        console.warn(`[worker.js] Could not load local model ${LOCAL_MODEL}, falling back to ${FALLBACK_MODEL}:`, localErr?.message);
        try {
          this.instance = await loadPipeline(this.task, FALLBACK_MODEL, progress_callback);
          this.model = FALLBACK_MODEL;
          console.info(`[worker.js] Fallback community model loaded successfully!`);
        } catch (fallbackErr) {
          console.error('[worker.js] Both model sources failed:', fallbackErr);
          throw fallbackErr;
        }
      }
    }
    return this.instance;
  }
}

let isTranscribing = false;

self.addEventListener('message', async (event) => {
  const { type, audio } = event.data || {};

  if (type === 'load') {
    try {
      console.info('[worker.js] Received load event, initializing model in background...');
      const transcriber = await PipelineSingleton.getInstance((progressData) => {
        self.postMessage({
          status: 'progress',
          data: progressData
        });
      });

      // Warm up WASM kernels and ONNX execution session with 0.5s of silence
      try {
        console.info('[worker.js] Pre-warming ONNX WebAssembly execution session...');
        const warmUpSilence = new Float32Array(8000);
        await transcriber(warmUpSilence, {
          task: 'transcribe',
          temperature: 0.0,
          do_sample: false,
          num_beams: 1,
          max_new_tokens: 2,
          condition_on_previous_text: false,
          return_timestamps: false
        });
        console.info('[worker.js] Warm-up inference complete! Session ready.');
      } catch (warmErr) {
        console.warn('[worker.js] Warm-up inference notice (non-fatal):', warmErr);
      }

      console.info('[worker.js] Model initialized and ready for transcription!');
      self.postMessage({ status: 'ready', model: PipelineSingleton.model });
    } catch (error) {
      console.error('[worker.js] Failed to initialize pipeline:', error);
      self.postMessage({
        status: 'error',
        error: error?.message || 'Failed to initialize Whisper model.'
      });
    }
    return;
  }

  if (type === 'transcribe') {
    if (isTranscribing) {
      console.warn('[worker.js] Transcription already in progress, dropping duplicate request.');
      return;
    }
    isTranscribing = true;

    try {
      if (!audio) {
        throw new Error('No audio chunk provided for transcription.');
      }

      let audioInput = audio;
      if (!(audioInput instanceof Float32Array)) {
        audioInput = new Float32Array(audioInput);
      }

      // Pad audio with silence to at least 0.5s (8000 samples at 16kHz) to ensure convolution kernel validity
      if (audioInput.length < 8000) {
        const padded = new Float32Array(8000);
        padded.set(audioInput, 0);
        audioInput = padded;
      }

      console.info(`[worker.js] Transcribing audio via WASM: ${audioInput.length} samples (${(audioInput.length / 16000).toFixed(2)}s)...`);

      const transcriber = await PipelineSingleton.getInstance();
      const output = await transcriber(audioInput, {
        task: 'transcribe',
        temperature: 0.0,
        do_sample: false,
        num_beams: 1,
        max_new_tokens: 10,
        condition_on_previous_text: false,
        return_timestamps: false
      });

      console.info('[worker.js] Transcription complete:', output);

      self.postMessage({
        status: 'complete',
        output: output
      });
    } catch (error) {
      console.error('[worker.js] Transcription error:', error);
      // Reset instance on failure to prevent "Session already started" in ONNX Runtime
      PipelineSingleton.instance = null;
      self.postMessage({
        status: 'error',
        error: error?.message || 'Speech recognition failed.'
      });
    } finally {
      isTranscribing = false;
    }
  }
});
