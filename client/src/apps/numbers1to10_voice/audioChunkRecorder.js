/**
 * audioChunkRecorder.js
 *
 * Lightweight Web Audio API recorder designed for Push-To-Talk (PTT).
 * Captures clean 16,000 Hz mono PCM Float32Array chunks required by Whisper.
 * Computes real-time RMS audio levels to drive reactive UI sound waves and
 * diagnose muted or quiet microphones.
 */

export class AudioChunkRecorder {
  constructor(sampleRate = 16000) {
    this.targetSampleRate = sampleRate;
    this.audioContext = null;
    this.actualSampleRate = 16000;
    this.mediaStream = null;
    this.sourceNode = null;
    this.processorNode = null;
    this.silentGain = null;
    this.recordedChunks = [];
    this.isRecording = false;

    // Diagnostics & live volume
    this.peakVolume = 0;
    this.recordingStartTime = 0;
    this.recordingDurationMs = 0;
    this.onVolumeChange = null;
  }

  /**
   * Request microphone access and begin streaming PCM samples into memory.
   */
  async start() {
    if (this.isRecording) return;
    this.recordedChunks = [];
    this.peakVolume = 0;
    this.recordingStartTime = performance.now();

    // Request 1-channel microphone stream with noise suppression
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    try {
      this.audioContext = new AudioContextClass({ sampleRate: this.targetSampleRate });
    } catch (e) {
      this.audioContext = new AudioContextClass();
    }
    this.actualSampleRate = this.audioContext.sampleRate || 48000;

    // Chromium starts AudioContext in 'suspended' state; must explicitly resume!
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('[AudioChunkRecorder] AudioContext resume failed:', e);
      }
    }

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

    // Buffer size of 4096 gives ~0.25s chunks at 16kHz
    const bufferSize = 4096;
    this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.processorNode.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const channelData = e.inputBuffer.getChannelData(0);
      this.recordedChunks.push(new Float32Array(channelData));

      // Compute Root-Mean-Square (RMS) audio energy
      let sumSquares = 0;
      for (let i = 0; i < channelData.length; i++) {
        const sample = channelData[i];
        sumSquares += sample * sample;
      }
      const rms = Math.sqrt(sumSquares / channelData.length);
      if (rms > this.peakVolume) {
        this.peakVolume = rms;
      }

      if (this.onVolumeChange) {
        // Boost volume visually for user feedback (0.0 to 1.0)
        const normalized = Math.min(1, rms * 14);
        this.onVolumeChange(normalized, rms);
      }
    };

    // Connect through a silent GainNode to prevent audio feedback through speakers
    this.silentGain = this.audioContext.createGain();
    this.silentGain.gain.value = 0;

    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.silentGain);
    this.silentGain.connect(this.audioContext.destination);

    this.isRecording = true;
  }

  /**
   * Stop recording, release all audio tracks, and return merged 16kHz Float32Array chunk.
   * @returns {Float32Array|null}
   */
  stop() {
    if (!this.isRecording && this.recordedChunks.length === 0) return null;
    this.isRecording = false;
    this.recordingDurationMs = performance.now() - this.recordingStartTime;

    if (this.onVolumeChange) {
      this.onVolumeChange(0, 0);
    }

    // Disconnect audio nodes
    try {
      if (this.processorNode) {
        this.processorNode.disconnect();
        this.processorNode.onaudioprocess = null;
      }
      if (this.silentGain) {
        this.silentGain.disconnect();
      }
      if (this.sourceNode) {
        this.sourceNode.disconnect();
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
    } catch (e) {
      console.warn('[AudioChunkRecorder] Error releasing audio resources:', e);
    }

    if (this.recordedChunks.length === 0) return null;

    // Compute total samples captured
    const totalLength = this.recordedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const mergedBuffer = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.recordedChunks) {
      mergedBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    this.recordedChunks = [];

    // Ensure Whisper receives EXACTLY 16,000 Hz Float32Array mono
    const downsampled = downsampleTo16000(mergedBuffer, this.actualSampleRate);

    // Normalize peak volume so quiet microphones are crystal clear to Whisper
    return normalizeAudio(downsampled);
  }

  /**
   * Retrieve session diagnostics (peak volume and duration).
   */
  getStats() {
    return {
      peakVolume: this.peakVolume,
      durationMs: this.recordingDurationMs
    };
  }
}

/**
 * Downsamples any PCM Float32Array from sourceSampleRate to 16000 Hz using linear interpolation.
 *
 * @param {Float32Array} buffer
 * @param {number} sourceSampleRate
 * @returns {Float32Array}
 */
export function downsampleTo16000(buffer, sourceSampleRate) {
  if (!buffer || buffer.length === 0) return new Float32Array(0);
  if (sourceSampleRate === 16000) return buffer;

  const targetSampleRate = 16000;
  const ratio = sourceSampleRate / targetSampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const originIndex = i * ratio;
    const indexLow = Math.floor(originIndex);
    const indexHigh = Math.min(indexLow + 1, buffer.length - 1);
    const weight = originIndex - indexLow;
    result[i] = buffer[indexLow] * (1 - weight) + buffer[indexHigh] * weight;
  }

  return result;
}

/**
 * Normalizes audio volume so Whisper receives clear signal without distortion.
 *
 * @param {Float32Array} buffer
 * @returns {Float32Array}
 */
export function normalizeAudio(buffer) {
  if (!buffer || buffer.length === 0) return buffer;
  let maxVal = 0;
  for (let i = 0; i < buffer.length; i++) {
    const abs = Math.abs(buffer[i]);
    if (abs > maxVal) maxVal = abs;
  }
  // If peak volume is quiet (between 0.01 and 0.8), boost to 0.9
  if (maxVal > 0.01 && maxVal < 0.8) {
    const gain = 0.9 / maxVal;
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] *= gain;
    }
  }
  return buffer;
}

export default AudioChunkRecorder;
