let sharedAudioContext = null;

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume();
    } else if (!sharedAudioContext) {
      try {
        sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {}
    }
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
}

export let penScratchSoundVariant = 'pencil'; // 'pencil' | 'quill' | 'magic'
export let clickSoundVariant = 'crystal'; // 'crystal' | 'pop' | 'woodblock'

export function setPenScratchSoundVariant(variant) {
  penScratchSoundVariant = variant;
}

export function setClickSoundVariant(variant) {
  clickSoundVariant = variant;
}

export function getAudioContext() {
  if (!sharedAudioContext) {
    try {
      sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
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

    if (type === 'clue_appear') {
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.00, now); // G4
      osc.frequency.setValueAtTime(493.88, now + 0.08); // B4
      osc.frequency.setValueAtTime(587.33, now + 0.16); // D5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0.08, now + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'correct') {
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
      osc.type = 'triangle';
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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220.00, now);
      osc.frequency.exponentialRampToValueAtTime(780.00, now + 0.6);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.10, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.start(now);
      osc.stop(now + 0.7);
    } else if (type === 'plane_whoosh3') {
      const now = ctx.currentTime;
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
      osc2.frequency.setValueAtTime(153.00, now);
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
    } else if (type === 'click') {
      const now = ctx.currentTime;
      if (clickSoundVariant === 'woodblock') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.03);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (clickSoundVariant === 'crystal') {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1567.98, now);
        gain.gain.setValueAtTime(0.06, now);
        gain2.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.06);
        osc2.stop(now + 0.06);
      } else {
        // 'pop' default
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } else if (type === 'pen_scratch') {
      const now = ctx.currentTime;
      if (penScratchSoundVariant === 'quill') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200 + Math.random() * 600, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.025);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc.start(now);
        osc.stop(now + 0.025);
      } else if (penScratchSoundVariant === 'magic') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400 + Math.random() * 800, now);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else {
        // 'pencil' default highpass noise
        const bufferSize = Math.floor(ctx.sampleRate * 0.035);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.4;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1600 + Math.random() * 500, now);
        noise.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        noise.start(now);
        noise.stop(now + 0.035);
        osc.start(now);
        osc.stop(now);
      }
    }
  } catch (e) {
    console.warn('AudioContext playback failed:', e);
  }
}
