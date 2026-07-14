import { Howl } from 'howler';

const SOUNDS = {
  correct: { src: '/sounds/correct.mp3', format: ['wav'] },
  wrong: { src: '/sounds/wrong.mp3', format: ['wav'] },
  coin: { src: '/sounds/coin.mp3', format: ['wav'] },
  click: { src: '/sounds/click.mp3', format: ['wav'] },
  streak: { src: '/sounds/streak.mp3', format: ['wav'] },
  levelup: { src: '/sounds/levelup.mp3', format: ['wav'] },
  celebrate: { src: '/sounds/celebrate.mp3', format: ['wav'] },
};

class AudioManager {
  constructor() {
    this.muted = localStorage.getItem('tenali-sound-effects') === 'false';
    this.streakCount = 0;
    this.howls = {};
    this.lastPlayedTime = {};

    // Preload howls
    Object.entries(SOUNDS).forEach(([key, config]) => {
      this.howls[key] = new Howl({
        src: [config.src],
        format: config.format,
        preload: true,
      });
    });
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('tenali-sound-effects', muted ? 'false' : 'true');
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  playSound(name, rate = 1.0) {
    if (this.muted) return;
    
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
