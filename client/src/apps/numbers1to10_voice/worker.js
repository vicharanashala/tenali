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

const PRIMARY_MODEL = 'gradient-queen/whisper-tiny-indian-digits-final';
const FALLBACK_MODEL = 'onnx-community/whisper-tiny';
const TASK = 'automatic-speech-recognition';

/**
 * Attempt to initialize the pipeline with WebGPU first, then gracefully fall back to WASM.
 */
async function loadPipeline(task, modelId, progress_callback) {
  try {
    return await pipeline(task, modelId, {
      progress_callback,
      dtype: 'q8',
      device: 'webgpu'
    });
  } catch (gpuErr) {
    console.info(`[worker.js] WebGPU unavailable for ${modelId}, falling back to WebAssembly (wasm):`, gpuErr?.message);
    return await pipeline(task, modelId, {
      progress_callback,
      dtype: 'q8',
      device: 'wasm'
    });
  }
}

class PipelineSingleton {
  static task = TASK;
  static model = PRIMARY_MODEL;
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      try {
        // Try fine-tuned model first
        this.instance = await loadPipeline(this.task, PRIMARY_MODEL, progress_callback);
        this.model = PRIMARY_MODEL;
      } catch (err) {
        console.warn(`[worker.js] Fine-tuned model ${PRIMARY_MODEL} requires ONNX weights on HF Hub; falling back to ${FALLBACK_MODEL}:`, err?.message);
        this.model = FALLBACK_MODEL;
        this.instance = await loadPipeline(this.task, FALLBACK_MODEL, progress_callback);
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

      const transcriber = await PipelineSingleton.getInstance();
      const output = await transcriber(audio, {
        language: 'en',
        task: 'transcribe',
        return_timestamps: false
      });

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
