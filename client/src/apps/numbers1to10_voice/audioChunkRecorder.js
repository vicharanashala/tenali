/**
 * audioChunkRecorder.js
 *
 * Lightweight Web Audio API recorder designed for Push-To-Talk (PTT).
 * Captures clean 16,000 Hz mono PCM Float32Array chunks required by Whisper.
 * Ensures microphone streams and AudioContexts are properly resumed and closed
 * to prevent hardware locks on Chromium/Windows.
 */

export class AudioChunkRecorder {
  constructor(sampleRate = 16000) {
    this.targetSampleRate = sampleRate;
    this.audioContext = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.processorNode = null;
    this.silentGain = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }

  /**
   * Request microphone access and begin streaming PCM samples into memory.
   */
  async start() {
    if (this.isRecording) return;
    this.recordedChunks = [];

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
    this.audioContext = new AudioContextClass({
      sampleRate: this.targetSampleRate
    });

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
    return mergedBuffer;
  }
}

export default AudioChunkRecorder;
