import { Howl, Howler } from 'howler';

const SOUNDS = {
  correct: { src: '/sounds/correct.mp3', format: ['mp3'] },
  wrong: { src: '/sounds/wrong.mp3', format: ['mp3'] },
  coin: { src: '/sounds/coin.mp3', format: ['mp3'] },
  click: { src: '/sounds/click.mp3', format: ['mp3'] },
  streak: { src: '/sounds/streak.mp3', format: ['mp3'] },
  levelup: { src: '/sounds/levelup.mp3', format: ['mp3'] },
  celebrate: { src: '/sounds/celebrate.mp3', format: ['mp3'] },
};

class AudioManager {
  constructor() {
    this.streakCount = 0;
    this.howls = {};
    this.lastPlayedTime = {};

    // Initial mute status from localStorage
    const savedMuted = localStorage.getItem('tenali-sound-effects') === 'false';
    this.mutedState = savedMuted;
    if (typeof Howler !== 'undefined') {
      Howler.mute(savedMuted);
    }

    // Preload howls with robust error handling
    Object.entries(SOUNDS).forEach(([key, config]) => {
      this.howls[key] = new Howl({
        src: [config.src],
        format: config.format,
        preload: true,
        onloaderror: (id, err) => {
          console.warn(`Failed to load audio asset: ${config.src}. Error:`, err);
        },
        onplayerror: (id, err) => {
          console.warn(`Failed to play audio asset: ${config.src}. Error:`, err);
          if (typeof Howler !== 'undefined' && Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume().then(() => {
              this.howls[key].play(id);
            });
          }
        }
      });
    });

    // Auto-unlock AudioContext on user gesture (browser autoplay policies)
    const resumeAudio = () => {
      if (typeof Howler !== 'undefined' && Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => {
          console.log('AudioContext resumed successfully via user interaction');
          this.warmup();
          cleanup();
        }).catch(err => {
          console.warn('Failed to resume AudioContext:', err);
        });
      } else {
        this.warmup();
        cleanup();
      }
    };
    const cleanup = () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
    };
    window.addEventListener('click', resumeAudio);
    window.addEventListener('touchstart', resumeAudio);
    window.addEventListener('keydown', resumeAudio);
  }

  warmup() {
    try {
      Object.values(this.howls).forEach(howl => {
        if (howl && howl.state() === 'loaded') {
          const originalVolume = howl.volume();
          howl.volume(0);
          const id = howl.play();
          setTimeout(() => {
            howl.stop(id);
            howl.volume(originalVolume);
          }, 20);
        }
      });
    } catch (e) {
      console.warn('Audio warmup failed:', e);
    }
  }

  isMuted() {
    return this.mutedState;
  }

  setMuted(muted) {
    this.mutedState = muted;
    localStorage.setItem('tenali-sound-effects', muted ? 'false' : 'true');
    if (typeof Howler !== 'undefined') {
      Howler.mute(muted);
    }
  }

  toggleMuted() {
    const nextMute = !this.isMuted();
    this.setMuted(nextMute);
    return nextMute;
  }

  stopAll() {
    try {
      if (typeof Howler !== 'undefined' && Howler.stop) {
        Howler.stop();
      }
    } catch (e) {
      console.warn('Error stopping all sounds:', e);
    }
  }

  playSound(name, rate = 1.0) {
    if (this.isMuted()) return;
    
    const now = Date.now();
    if (this.lastPlayedTime[name] && now - this.lastPlayedTime[name] < 80) {
      return;
    }
    this.lastPlayedTime[name] = now;

    const howl = this.howls[name];
    if (howl) {
      howl.rate(rate);
      howl.play();
    }
  }

  playCorrect() {
    // Dynamically increase pitch/rate for streaks, capping at 2.0x speed
    this.streakCount++;
    const rate = Math.min(2.0, 1.0 + (this.streakCount - 1) * 0.1);
    this.playSound('correct', rate);
  }

  playWrong() {
    this.streakCount = 0;
    this.playSound('wrong');
  }

  playCoin() {
    this.playSound('coin');
  }

  playClick() {
    this.playSound('click');
  }

  playStreak() {
    this.playSound('streak');
  }

  playLevelUp() {
    this.playSound('levelup');
  }

  playCelebrate() {
    this.playSound('celebrate');
  }
}

const managerInstance = new AudioManager();

export default managerInstance;
