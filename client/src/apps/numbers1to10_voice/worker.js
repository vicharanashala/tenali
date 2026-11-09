/**
 * worker.js
 *
 * Dedicated Web Worker for speech recognition using @huggingface/transformers.
 * Follows the official Hugging Face React tutorial architecture:
 * https://huggingface.co/docs/transformers.js/en/tutorials/react
 *
 * Exclusively tuned for Indian digits and numbers 1 to 10.
 * Runs 100% in-browser via WebAssembly / WebGPU (zero server required).
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3';

env.allowLocalModels = false;
env.useBrowserCache = true;

const FALLBACK_MODEL = 'onnx-community/whisper-tiny';
const CUSTOM_MODEL = 'gradient-queen/whisper-tiny-indian-digits-final';
const TASK = 'automatic-speech-recognition';

/**
 * Attempt to initialize the pipeline with WebGPU first, then gracefully fall back to WASM.
 * Uses official Transformers.js whisper configuration:
 * encoder_model (fp32) + decoder_model_merged (q4) for lightning-fast zero-error inference.
 */
async function loadPipeline(task, modelId, progress_callback) {
  const quantConfig = {
    encoder_model: 'fp32',
    decoder_model_merged: 'q4'
  };

  try {
    console.info(`[worker.js] Attempting WebGPU pipeline for ${modelId}...`);
    return await pipeline(task, modelId, {
      progress_callback,
      dtype: quantConfig,
      device: 'webgpu'
    });
  } catch (gpuErr) {
    console.info(`[worker.js] WebGPU unavailable for ${modelId}, using WebAssembly (wasm):`, gpuErr?.message);
    try {
      return await pipeline(task, modelId, {
        progress_callback,
        dtype: quantConfig,
        device: 'wasm'
      });
    } catch (wasmErr) {
      console.info(`[worker.js] Default pipeline fallback for ${modelId}:`, wasmErr?.message);
      return await pipeline(task, modelId, {
        progress_callback,
        device: 'wasm'
      });
    }
  }
}

class PipelineSingleton {
  static task = TASK;
  static model = FALLBACK_MODEL;
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      try {
        console.info(`[worker.js] Loading primary community model: ${FALLBACK_MODEL}...`);
        this.instance = await loadPipeline(this.task, FALLBACK_MODEL, progress_callback);
        this.model = FALLBACK_MODEL;
        console.info(`[worker.js] Primary model loaded successfully!`);
      } catch (err) {
        console.warn(`[worker.js] Could not load ${FALLBACK_MODEL}, trying ${CUSTOM_MODEL}:`, err?.message);
        try {
          this.instance = await loadPipeline(this.task, CUSTOM_MODEL, progress_callback);
          this.model = CUSTOM_MODEL;
          console.info(`[worker.js] Custom model loaded successfully!`);
        } catch (customErr) {
          console.error('[worker.js] Both model sources failed:', customErr);
          throw customErr;
        }
      }
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
  const { type, audio } = event.data || {};

  if (type === 'load') {
    try {
      await PipelineSingleton.getInstance((progressData) => {
        self.postMessage({
          status: 'progress',
          data: progressData
        });
      });
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

      console.info(`[worker.js] Transcribing audio: ${audioInput.length} samples (${(audioInput.length / 16000).toFixed(2)}s)...`);

      const transcriber = await PipelineSingleton.getInstance();
      const output = await transcriber(audioInput, {
        language: 'en',
        task: 'transcribe',
        return_timestamps: false
      });

      console.info('[worker.js] Transcription complete:', output);

      self.postMessage({
        status: 'complete',
        output: output
      });
    } catch (error) {
      console.error('[worker.js] Transcription error:', error);
      self.postMessage({
        status: 'error',
        error: error?.message || 'Speech recognition failed.'
      });
    }
  }
});
