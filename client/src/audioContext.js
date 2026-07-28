let sharedAudioContext = null;

export function getAudioContext() {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
}

export function playSound(type, enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      const now = ctx.currentTime;
      osc.type = 'triangle'; // Warm, game-like chime tone
      osc.frequency.setValueAtTime(987.77, now); // B5 note
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6 note
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.setValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong') {
      const now = ctx.currentTime;
      osc.type = 'sawtooth'; // Playful, retro buzzer slide down
      osc.frequency.setValueAtTime(293.66, now); // D4
      osc.frequency.linearRampToValueAtTime(110.00, now + 0.3); // A2 slide
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'plane_whoosh1') {
      const now = ctx.currentTime;
      osc.type = 'triangle'; // Original triangle wave rising sweep
      osc.frequency.setValueAtTime(180.00, now);
      osc.frequency.exponentialRampToValueAtTime(650.00, now + 1.2);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
      osc.start(now);
      osc.stop(now + 1.3);
    } else if (type === 'plane_whoosh2') {
      const now = ctx.currentTime;
      osc.type = 'sine'; // Soft, pure sine wave for simple whoosh
      osc.frequency.setValueAtTime(220.00, now); // Start slightly higher
      osc.frequency.exponentialRampToValueAtTime(780.00, now + 0.6); // Faster slide (0.6s)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.10, now + 0.15); // Fast swell
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7); // Rapid smooth fade out
      osc.start(now);
      osc.stop(now + 0.7);
    } else if (type === 'plane_whoosh3') {
      const now = ctx.currentTime;
      // Dual detuned oscillators for spacious whoosh
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150.00, now);
      osc.frequency.exponentialRampToValueAtTime(550.00, now + 1.4);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(153.00, now); // slightly detuned
      osc2.frequency.exponentialRampToValueAtTime(553.00, now + 1.4);
      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.06, now + 0.4);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.start(now);
      osc.stop(now + 1.4);
      osc2.start(now);
      osc2.stop(now + 1.4);
    } else if (type === 'plane') {
      const now = ctx.currentTime;
      // Classic glider wind whoosh sound
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.2, now);
      filter.frequency.setValueAtTime(120, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 1.0);

      noise.connect(filter);
      filter.connect(gain);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.10, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.10, now + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      noise.start(now);
      noise.stop(now + 1.5);
      osc.start(now);
      osc.stop(now);
    }
  } catch (e) {
    console.warn('AudioContext playback failed:', e);
  }
}
