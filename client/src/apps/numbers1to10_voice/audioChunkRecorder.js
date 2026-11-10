/**
 * audioChunkRecorder.js
 *
 * Lightweight Web Audio API recorder designed for Push-To-Talk (PTT).
 * Captures clean 16,000 Hz mono PCM Float32Array chunks required by Whisper.
 * Computes real-time RMS audio levels to drive reactive UI sound waves and
 * diagnose muted or quiet microphones.
 *
 * Features persistent warm audio context to eliminate the 250ms hardware
 * spin-up latency on every click, smart silence trimming (VAD), and
 * capped audio normalization.
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
   * Initializes or reuses the warm MediaStream and AudioContext.
   * This completely eliminates the 250ms hardware delay on subsequent mic taps.
   */
  async ensureAudioStream() {
    // If stream already has active live tracks, reuse it instantly
    if (this.mediaStream) {
      const tracks = this.mediaStream.getAudioTracks();
      if (tracks.length > 0 && tracks[0].readyState === 'live') {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          try {
            await this.audioContext.resume();
          } catch (e) {
            console.warn('[AudioChunkRecorder] AudioContext resume failed:', e);
          }
        }
        return;
      }
    }

    // Request 1-channel microphone stream with hardware noise suppression
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

    // Chromium starts AudioContext in 'suspended' state; explicitly resume
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

    // Connect through a silent GainNode to prevent audio feedback through speakers
    this.silentGain = this.audioContext.createGain();
    this.silentGain.gain.value = 0;

    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.silentGain);
    this.silentGain.connect(this.audioContext.destination);
  }

  /**
   * Begin streaming PCM samples into memory.
   */
  async start() {
    if (this.isRecording) return;
    this.recordedChunks = [];
    this.peakVolume = 0;
    this.recordingStartTime = performance.now();

    await this.ensureAudioStream();

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

    this.isRecording = true;
  }

  /**
   * Stop recording, keep stream warm, and return merged 16kHz Float32Array chunk.
   * @returns {Float32Array|null}
   */
  stop() {
    if (!this.isRecording && this.recordedChunks.length === 0) return null;
    this.isRecording = false;
    this.recordingDurationMs = performance.now() - this.recordingStartTime;

    if (this.onVolumeChange) {
      this.onVolumeChange(0, 0);
    }

    // Detach listener so warm stream doesn't consume memory or CPU while paused
    if (this.processorNode) {
      this.processorNode.onaudioprocess = null;
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

    // Trim leading/trailing dead silence to eliminate room background hiss
    const trimmed = trimSilence(downsampled, 0.006);

    // Smart normalize so Whisper receives clear signal without noise distortion
    return normalizeAudio(trimmed);
  }

  /**
   * Full teardown of hardware mic tracks and AudioContext on unmount.
   */
  destroy() {
    this.isRecording = false;
    try {
      if (this.processorNode) {
        this.processorNode.disconnect();
        this.processorNode.onaudioprocess = null;
        this.processorNode = null;
      }
      if (this.silentGain) {
        this.silentGain.disconnect();
        this.silentGain = null;
      }
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
        this.audioContext = null;
      }
    } catch (e) {
      console.warn('[AudioChunkRecorder] Error releasing audio resources:', e);
    }
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
 * Trims leading and trailing silence below an RMS energy threshold.
 * Prevents ambient room noise or dead silence from confusing Whisper's decoder.
 *
 * @param {Float32Array} buffer
 * @param {number} threshold
 * @returns {Float32Array}
 */
export function trimSilence(buffer, threshold = 0.006) {
  if (!buffer || buffer.length === 0) return buffer;
  let start = 0;
  while (start < buffer.length && Math.abs(buffer[start]) < threshold) {
    start++;
  }

  if (start >= buffer.length) return buffer;

  let end = buffer.length - 1;
  while (end > start && Math.abs(buffer[end]) < threshold) {
    end--;
  }

  // Retain up to 800 samples (~50ms at 16kHz) padding around speech start and end
  const padSamples = 800;
  const safeStart = Math.max(0, start - padSamples);
  const safeEnd = Math.min(buffer.length, end + padSamples + 1);

  return buffer.slice(safeStart, safeEnd);
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
 * Normalizes audio volume so Whisper receives clear signal without noise distortion.
 * Avoids magnifying background room hiss into distortion by requiring genuine voice signal
 * and capping the gain multiplier.
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
  // Only boost if genuine speech signal exists (maxVal >= 0.008) and not already loud (maxVal < 0.85).
  // Cap boost multiplier at 8x to avoid magnifying quiet room noise into distortion.
  if (maxVal >= 0.008 && maxVal < 0.85) {
    const desiredGain = 0.88 / maxVal;
    const gain = Math.min(8.0, desiredGain);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] *= gain;
    }
  }
  return buffer;
}

export default AudioChunkRecorder;
