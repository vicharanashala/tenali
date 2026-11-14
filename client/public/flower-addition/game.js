/**
 * Tenali Flower Addition II Game Engine
 * Visual Addition for Foundational Numeracy (Ages 4-5)
 * [Group 1 of flowers] + [Group 2 of flowers] = [Combined group of flowers]
 * Features Web Audio synthesizer, Indian Preschool Teacher Speech Synthesis,
 * dynamic SVG flowers, tactile visual counting, and positive reinforcement.
 */

(function () {
  'use strict';

  // --- Flower Color Themes (Rotates with each new question) ---
  const FLOWER_PALETTES = [
    { name: 'Classic Purple', petal: '#ab47bc', petalDark: '#8e24aa', petalLight: '#ba68c8' }, // Authentic Tenali Blossom
    { name: 'Sky Cyan', petal: '#0ea5e9', petalDark: '#0284c7', petalLight: '#38bdf8' },
    { name: 'Rose Blossom', petal: '#f43f5e', petalDark: '#e11d48', petalLight: '#fb7185' },
    { name: 'Sunny Tangerine', petal: '#f97316', petalDark: '#ea580c', petalLight: '#fb923c' },
    { name: 'Garden Emerald', petal: '#10b981', petalDark: '#059669', petalLight: '#34d399' },
    { name: 'Royal Violet', petal: '#8b5cf6', petalDark: '#7c3aed', petalLight: '#a78bfa' },
    { name: 'Sweet Magenta', petal: '#d946ef', petalDark: '#c026d3', petalLight: '#f0abfc' },
    { name: 'Lagoon Teal', petal: '#14b8a6', petalDark: '#0d9488', petalLight: '#2dd4bf' }
  ];

  // --- Game State ---
  const state = {
    level: 1, // 1: totals up to 4, 2: totals up to 6, 3: totals up to 9
    currentQuestion: null,
    selectedAnswer: null,
    isAnswered: false,
    starsEarned: 0,
    maxStars: 10,
    currentStreak: 0,
    soundEnabled: true,
    voiceEnabled: true,
    isCountingHintActive: false,
    paletteIndex: 0,
    hasUserInteracted: false,
    hasWelcomed: false,
    boxCounters: {
      'flower-group-1': 0,
      'flower-group-2': 0,
      'flower-group-result': 0
    },
    activeCountingBox: null,
    hintInterval: null,
    currentStage: 'group1', // 'group1' -> 'group2' -> 'counting_total' -> 'total_announced' -> 'answer'
    isAnswerSelectionEnabled: false,
    hasAnnouncedTotal: false
  };

  // =========================================================================
  // SOUND ENGINE (Zero-Dependency Web Audio API Synthesizer)
  // 100% offline, standalone & reliable across all devices
  // =========================================================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Gentle musical bubble pop when tapping a flower (pitch scales with count index 1..9)
    playPop(index = 1) {
      if (!state.soundEnabled) return;
      this.init();
      if (!this.ctx) return;

      const baseFreq = 320 + (index * 45);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    }

    // Cheerful arpeggio fanfare for correct answer (C5, E5, G5, C6)
    playSuccessFanfare() {
      if (!state.soundEnabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + i * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.08);
        osc.stop(this.ctx.currentTime + i * 0.08 + 0.38);
      });
    }

    // Warm, gentle sine pitch ramp for incorrect try (no harsh buzzers)
    playGentleTryAgain() {
      if (!state.soundEnabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.32);
    }

    // Sparkle chime when a gold quest star is earned
    playStarEarned() {
      if (!state.soundEnabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [880, 1174.66, 1396.91, 1760];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.06);
        osc.stop(this.ctx.currentTime + i * 0.06 + 0.32);
      });
    }
  }

  const audio = new SoundEngine();

  // =========================================================================
  // TEACHER VOICE ENGINE (Warm Indian Preschool Teacher Speech Synthesis)
  // Replicates exact Activity I voice profile: gentle, warm, patient Indian
  // English female preschool teacher voice ('en-IN', rate: 0.83, pitch: 1.08)
  // =========================================================================
  class TeacherVoiceEngine {
    constructor() {
      this.selectedVoice = null;
      this.isVoiceReady = false;
      this.activeUtterance = null;
      this.initVoiceList();
    }

    isGoogleChrome() {
      if (typeof navigator === 'undefined') return true;
      const ua = (navigator.userAgent || '').toLowerCase();
      const vendor = (navigator.vendor || '').toLowerCase();
      if (ua.includes('brave') || (navigator.brave && typeof navigator.brave.isBrave === 'function')) return false;
      if (ua.includes('edg/')) return false;
      if (ua.includes('opr/') || ua.includes('opera') || ua.includes('opt/')) return false;
      if (ua.includes('firefox') || ua.includes('fxios')) return false;
      if ((ua.includes('safari') || vendor.includes('apple')) && !ua.includes('chrome') && !ua.includes('chromium')) return false;
      if (ua.includes('vivaldi') || ua.includes('yabrowser')) return false;
      return ua.includes('chrome') || ua.includes('crios') || vendor.includes('google');
    }

    initVoiceList() {
      if (!('speechSynthesis' in window)) return;

      const load = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          this.selectVoice(voices);
          this.isVoiceReady = true;
        }
      };

      // 1. Attempt immediate load
      load();

      // 2. Event listener for asynchronous voice loading
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = load;
      }
      if (window.speechSynthesis.addEventListener) {
        window.speechSynthesis.addEventListener('voiceschanged', load);
      }

      // 3. Robust polling fallback for browsers with lazy-loaded voice lists (e.g. Chrome, Edge on Windows)
      let pollCount = 0;
      const pollTimer = setInterval(() => {
        pollCount++;
        const voices = window.speechSynthesis.getVoices();
        if ((voices && voices.length > 0 && this.selectedVoice) || pollCount > 12) {
          clearInterval(pollTimer);
        } else if (voices && voices.length > 0) {
          load();
        }
      }, 200);
    }

    ensureVoice() {
      if (!this.selectedVoice && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          this.selectVoice(voices);
          this.isVoiceReady = true;
        }
      }
      return this.selectedVoice;
    }

    selectVoice(voices) {
      if (this.isGoogleChrome()) {
        this.selectedVoice = this.selectExistingChromeVoice(voices);
      } else {
        this.selectedVoice = this.selectCrossBrowserVoice(voices);
      }
      return this.selectedVoice;
    }

    selectBestIndianVoice(voices) {
      return this.selectVoice(voices);
    }

    // Exact existing Chrome voice selection logic preserved strictly
    selectExistingChromeVoice(voices) {
      if (!voices || voices.length === 0) return null;

      // Exact Activity I Indian female teacher voice candidates
      const indianFemaleKeywords = [
        'neerja', 'heera', 'swara', 'veena', 'lekha', 'isha', 'ananya', 'priya', 'kavya', 'shruti', 'aditi'
      ];
      // Explicitly reject male voice tokens to avoid male Indian voice assignment
      const maleKeywords = [
        'ravi', 'prabhat', 'madhur', 'david', 'mark', 'george', 'richard', 'james', 'alex', 'daniel', 'fred', 'male'
      ];

      const isMale = (name) => {
        const lower = (name || '').toLowerCase();
        return maleKeywords.some(m => lower.includes(m)) && !lower.includes('female');
      };

      // Priority 1: Indian English Natural / Online Female voice (e.g. Neerja Online Natural)
      let best = voices.find(v => {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        const isIndian = lang.startsWith('en-in') || lang === 'en_in' || name.includes('india');
        const isNatural = name.includes('natural') || name.includes('online');
        const isFemale = indianFemaleKeywords.some(k => name.includes(k)) || name.includes('female');
        return isIndian && isFemale && isNatural && !isMale(name);
      });

      // Priority 2: Standard Indian English Female voice (e.g. Microsoft Heera, Veena, Neerja, Lekha, Isha)
      if (!best) {
        best = voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          const isIndian = lang.startsWith('en-in') || lang === 'en_in' || name.includes('india');
          const isFemale = indianFemaleKeywords.some(k => name.includes(k)) || name.includes('female');
          return isIndian && isFemale && !isMale(name);
        });
      }

      // Priority 3: Any en-IN voice that is not male (e.g. Google English (India))
      if (!best) {
        best = voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          const isIndian = lang.startsWith('en-in') || lang === 'en_in' || name.includes('india');
          return isIndian && !isMale(name);
        });
      }

      // Priority 4: Hindi bilingual voice speaking English (hi-IN)
      if (!best) {
        best = voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          return (lang.startsWith('hi-in') || lang === 'hi_in') && !isMale(name);
        });
      }

      // Priority 5: Warm, gentle female English teacher fallback (e.g. Samantha, Victoria, Hazel, Susan, Zira)
      if (!best) {
        const gentleFemale = ['samantha', 'victoria', 'hazel', 'susan', 'zira', 'karen', 'jenny', 'natural', 'female'];
        best = voices.find(v => {
          const name = (v.name || '').toLowerCase();
          const lang = (v.lang || '').toLowerCase();
          return lang.startsWith('en') && gentleFemale.some(k => name.includes(k)) && !isMale(name);
        });
      }

      // Priority 6: Any non-male English voice
      if (!best) {
        best = voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          return lang.startsWith('en') && !isMale(name);
        });
      }

      // Final fallback
      if (!best) {
        best = voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voices[0];
      }

      return best;
    }

    // Extended cross-browser selection for Brave, Edge, Firefox, Safari
    selectCrossBrowserVoice(voices) {
      if (!voices || voices.length === 0) return null;

      const maleKeywords = [
        'ravi', 'prabhat', 'madhur', 'david', 'mark', 'george', 'richard',
        'james', 'alex', 'daniel', 'fred', 'male', 'guy', 'brian', 'tom',
        'steffan', 'oliver', 'rishi', 'sanjay', 'ryan', 'adam', 'paul', 'john', 'michael'
      ];
      const isMale = (name) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('female') || lower.includes('woman') || lower.includes('girl')) {
          return false;
        }
        return maleKeywords.some(m => lower.includes(m));
      };

      // 1. Prefer the same female teacher voice used in Chrome whenever that voice is available
      const chromePreferred = this.selectExistingChromeVoice(voices);
      if (chromePreferred && !isMale(chromePreferred.name) && (
        (chromePreferred.lang || '').toLowerCase().includes('in') ||
        (chromePreferred.name || '').toLowerCase().includes('female') ||
        (chromePreferred.name || '').toLowerCase().includes('natural')
      )) {
        return chromePreferred;
      }

      const indianFemaleKeywords = [
        'neerja', 'heera', 'swara', 'veena', 'lekha', 'isha', 'ananya', 'priya', 'kavya', 'shruti', 'aditi'
      ];

      // 2. Indian English Natural / Online Female voice (e.g. Edge Microsoft Neerja Online (Natural))
      let best = voices.find(v => {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        const isIndian = lang.startsWith('en-in') || lang === 'en_in' || name.includes('india');
        const isNatural = name.includes('natural') || name.includes('online');
        const isFemale = indianFemaleKeywords.some(k => name.includes(k)) || name.includes('female');
        return isIndian && isFemale && isNatural && !isMale(name);
      });

      // 3. Standard Indian English Female voice (e.g. Microsoft Heera, Veena)
      if (!best) {
        best = voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          const isIndian = lang.startsWith('en-in') || lang === 'en_in' || name.includes('india');
          const isFemale = indianFemaleKeywords.some(k => name.includes(k)) || name.includes('female');
          return isIndian && isFemale && !isMale(name);
        });
      }

      // 4. Any Indian English non-male voice
      if (!best) {
        best = voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          const isIndian = lang.startsWith('en-in') || lang === 'en_in' || name.includes('india');
          return isIndian && !isMale(name);
        });
      }

      // 5. Hindi bilingual voice speaking English (hi-IN)
      if (!best) {
        best = voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          return (lang.startsWith('hi-in') || lang === 'hi_in') && !isMale(name);
        });
      }

      // 6. Warm, gentle female English teacher fallback (e.g. Samantha, Zira, Jenny, Victoria, Hazel, Susan, Karen)
      if (!best) {
        const gentleFemale = [
          'samantha', 'zira', 'jenny', 'victoria', 'hazel', 'susan', 'karen', 'moira',
          'tessa', 'fiona', 'ava', 'allison', 'aria', 'cora', 'clara', 'natural', 'female'
        ];
        best = voices.find(v => {
          const name = (v.name || '').toLowerCase();
          const lang = (v.lang || '').toLowerCase();
          return lang.startsWith('en') && gentleFemale.some(k => name.includes(k)) && !isMale(name);
        });
      }

      // 7. Any non-male English voice
      if (!best) {
        best = voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          return lang.startsWith('en') && !isMale(name);
        });
      }

      // 8. Final fallback to any English voice or first available voice
      if (!best) {
        best = voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voices[0];
      }

      return best;
    }

    getWord(n) {
      const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      return words[n] || n.toString();
    }

    speak(text, onEnd) {
      if (!state.voiceEnabled || !('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      try {
        window.speechSynthesis.cancel(); // Stop any pending utterance to prevent overlapping speech

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        // Dynamically re-verify voice before speaking
        this.ensureVoice();

        const utterance = new SpeechSynthesisUtterance(text);
        this.activeUtterance = utterance; // Prevent garbage collection bug in Chrome

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }

        const isIndian = this.selectedVoice && (
          (this.selectedVoice.lang || '').toLowerCase().includes('in') ||
          (this.selectedVoice.name || '').toLowerCase().includes('india')
        );

        // Always prioritize en-IN language code for correct preschool teacher cadence
        utterance.lang = isIndian ? (this.selectedVoice.lang || 'en-IN') : (this.selectedVoice ? this.selectedVoice.lang : 'en-IN');
        utterance.rate = 0.83; // Exact Activity I rate: slightly slow, patient, caring preschool pace
        utterance.pitch = 1.08; // Exact Activity I pitch: warm, friendly, gentle teacher pitch
        utterance.volume = 1.0;

        let called = false;
        const cleanup = () => {
          if (called) return;
          called = true;
          this.activeUtterance = null;
          if (onEnd) onEnd();
        };

        utterance.onend = cleanup;
        utterance.onerror = (e) => {
          console.warn('Teacher speech error:', e);
          cleanup();
        };

        // Safety fallback timer so speech callback always resolves even if speech engine stalls
        setTimeout(cleanup, 4500);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Teacher voice synthesis error:', e);
        if (onEnd) onEnd();
      }
    }

    // 1. Welcome Interaction (Exact Activity I)
    welcome(onEnd) {
      this.speak("Hello, little gardener! Are you ready to count some flowers?", onEnd);
    }

    // 2. Read Question Interaction: "One plus two." (Exact Activity I)
    readQuestion(q, onEnd) {
      if (!q) return;
      const w1 = this.getWord(q.num1);
      const w2 = this.getWord(q.num2);
      const cap1 = w1.charAt(0).toUpperCase() + w1.slice(1);
      const text = `${cap1} plus ${w2}.`;
      this.speak(text, onEnd);
    }

    // 3. Count Single Flower: "One!", "Two!", "Three!" (Exact Activity I)
    countFlower(n, onEnd) {
      const word = this.getWord(n);
      const cap = word.charAt(0).toUpperCase() + word.slice(1);
      this.speak(cap + "!", onEnd);
    }

    // 4. Announce Total Flowers: "We have [total] flowers in total."
    announceTotal(total, onEnd) {
      let countVal;
      if (typeof total === 'number') {
        countVal = total;
      } else if (state.currentQuestion) {
        countVal = state.currentQuestion.answer;
      } else {
        countVal = 4;
      }
      const wAns = this.getWord(countVal);
      const noun = countVal === 1 ? 'flower' : 'flowers';
      const text = `We have ${wAns} ${noun} in total.`;
      this.speak(text, onEnd);
    }

    // Aliases for backwards compatibility
    guideCounting(num1, num2, answer) {
      this.announceTotal(answer);
    }

    guideEquation(num1, num2, answer) {
      this.announceTotal(answer);
    }

    // 5. Correct Answer Interaction:
    // "Excellent! [num1] plus [num2] is [answer]. Good job!"
    celebrateCorrect(num1, num2, answer) {
      if (answer === undefined && state.currentQuestion) {
        answer = state.currentQuestion.answer;
        num1 = state.currentQuestion.num1;
        num2 = state.currentQuestion.num2;
      }
      if (num1 === undefined && state.currentQuestion) {
        num1 = state.currentQuestion.num1;
      }
      if (num2 === undefined && state.currentQuestion) {
        num2 = state.currentQuestion.num2;
      }
      const w1 = this.getWord(num1);
      const cap1 = w1.charAt(0).toUpperCase() + w1.slice(1);
      const w2 = this.getWord(num2);
      const wAns = this.getWord(answer);
      const text = `Excellent! ${cap1} plus ${w2} is ${wAns}. Good job!`;
      this.speak(text);
    }

    // 6. Incorrect Answer Interaction (Exact Activity I):
    // “That's okay, little one! Let's count and add the flowers together.”
    encourageTryAgain() {
      this.speak("That's okay, little one! Let's count and add the flowers together.");
    }

    // 7. Hint Interaction: Directly triggers the sequential flower count (Exact Activity I)
    startHint(onReady) {
      if (onReady) onReady();
    }

    // 8. Next Question Interaction (Exact Activity I):
    // "Ready for another little challenge? Let's go!"
    nextChallenge(onReady) {
      this.speak("Ready for another little challenge? Let's go!", onReady);
    }

    // 9. Completion Interaction (Exact Activity I):
    completion(level = 1) {
      if (level === 1) {
        this.speak("Wonderful! You can now add numbers to make four. Ready to learn to make six?");
      } else if (level === 2) {
        this.speak("Wonderful! You can now add numbers to make six. Ready to learn to make nine?");
      } else {
        this.speak("Wonderful! You can now add numbers to make nine. You're an addition star!");
      }
    }
  }

  const teacherVoice = new TeacherVoiceEngine();

  // =========================================================================
  // SVG FLOWER COMPONENT BUILDER
  // Exactly matching Activity I: scalloped petals, sunny yellow center,
  // and number inside the yellow center!
  // =========================================================================
  function createFlowerSVG({ 
    number = null, 
    size = 72, 
    petalColor = '#ab47bc', 
    centerColor = '#ffd54f', 
    centerBorder = '#f59e0b', 
    id = '',
    hideNumber = false
  }) {
    const numPetals = 10;
    const orbitR = 25.0;
    const petalR = 15.0;
    const cx = 50.0;
    const cy = 50.0;

    let petalsHTML = '';
    for (let i = 0; i < numPetals; i++) {
      const angle = i * (2 * Math.PI / numPetals);
      const px = (cx + orbitR * Math.cos(angle)).toFixed(1);
      const py = (cy + orbitR * Math.sin(angle)).toFixed(1);
      petalsHTML += `<circle cx="${px}" cy="${py}" r="${petalR}" class="flower-petal-lobe" fill="${petalColor}" />\n`;
    }

    const digitClass = hideNumber ? 'flower-digit-text hidden-digit' : 'flower-digit-text revealed';
    const displayVal = (number !== null && number !== undefined) ? number : '';

    const numberHTML = `
      <text x="50" y="51" 
            text-anchor="middle" 
            dominant-baseline="central" 
            class="${digitClass}" 
            fill="#261c14">${displayVal}</text>
    `;

    const flowerLabel = displayVal ? `Flower with number ${displayVal}` : 'Flower - tap to count';

    return `
      <svg class="flower-svg" viewBox="0 0 100 100" width="${size}" height="${size}" aria-label="${flowerLabel}">
        <g class="flower-graphic" id="${id}">
          <g class="petals-group">
            ${petalsHTML}
            <circle cx="50" cy="50" r="26" class="flower-petal-lobe" fill="${petalColor}" />
          </g>
          <circle cx="50" cy="50" r="19" class="flower-center-circle" fill="${centerColor}" stroke="${centerBorder}" stroke-width="1.5" />
          ${numberHTML}
        </g>
      </svg>
    `;
  }

  // =========================================================================
  // SPACED REPETITION QUESTION SCHEDULER
  // Introduces addition pairs in dynamic triplets, repeating each fact after
  // two different intervening questions to reinforce durable retention.
  // =========================================================================
  class QuestionScheduler {
    constructor() {
      this.currentLevel = 1;
      this.queue = [];
      this.usedTripletIndices = [];
      this.initQueue(1);
    }

    initQueue(level) {
      this.currentLevel = level;
      this.queue = [];
      this.usedTripletIndices = [];
      this.fillQueue(level);
    }

    onLevelChange(newLevel) {
      this.initQueue(newLevel);
    }

    getLevelTriplets(level) {
      if (level === 1) {
        // Level 1: Totals up to 4
        return [
          [[1, 2], [1, 1], [2, 2]],
          [[1, 3], [2, 1], [3, 1]]
        ];
      } else if (level === 2) {
        // Level 2: Totals up to 6
        return [
          [[2, 3], [3, 3], [1, 4]],
          [[3, 2], [2, 4], [4, 1]],
          [[4, 2], [1, 5], [5, 1]]
        ];
      } else {
        // Level 3: Totals up to 9
        return [
          [[3, 4], [4, 4], [2, 5]],
          [[4, 5], [4, 3], [3, 5]],
          [[5, 2], [5, 3], [5, 4]],
          [[2, 6], [3, 6], [2, 7]]
        ];
      }
    }

    fillQueue(level) {
      const allTriplets = this.getLevelTriplets(level);

      let availableIndices = allTriplets.map((_, i) => i).filter(i => !this.usedTripletIndices.includes(i));
      if (availableIndices.length === 0) {
        this.usedTripletIndices = [];
        availableIndices = allTriplets.map((_, i) => i);
      }

      const chosenIndex = availableIndices[0];
      this.usedTripletIndices.push(chosenIndex);
      const triplet = allTriplets[chosenIndex];

      const A = triplet[0];
      const B = triplet[1];
      const C = triplet[2];

      // Schedule: A, B, C, then repeat A, repeat B, repeat C
      this.queue.push(
        { pair: [A[0], A[1]], isRepeat: false },
        { pair: [B[0], B[1]], isRepeat: false },
        { pair: [C[0], C[1]], isRepeat: false },
        { pair: [A[0], A[1]], isRepeat: true },
        { pair: [B[0], B[1]], isRepeat: true },
        { pair: [C[0], C[1]], isRepeat: true }
      );
    }

    getNextPair(level) {
      if (this.currentLevel !== level) {
        this.initQueue(level);
      }

      if (this.queue.length === 0) {
        this.fillQueue(level);
      }

      const item = this.queue.shift();
      return item.pair;
    }
  }

  const questionScheduler = new QuestionScheduler();

  function generateQuestion(level = state.level) {
    const [num1, num2] = questionScheduler.getNextPair(level);
    const answer = num1 + num2;

    // Generate 2 sensible preschool distractors
    const distractors = new Set();
    const candidatePool = [];

    if (answer - 1 > 0) candidatePool.push(answer - 1);
    if (answer + 1 <= 9) candidatePool.push(answer + 1);
    if (num1 > 0 && num1 !== answer) candidatePool.push(num1);
    if (num2 > 0 && num2 !== answer) candidatePool.push(num2);
    if (answer - 2 > 0) candidatePool.push(answer - 2);
    if (answer + 2 <= 9) candidatePool.push(answer + 2);

    candidatePool.sort(() => Math.random() - 0.5);

    for (const val of candidatePool) {
      if (val !== answer && val > 0 && val <= 9) {
        distractors.add(val);
        if (distractors.size === 2) break;
      }
    }

    let fallback = 1;
    while (distractors.size < 2) {
      if (fallback !== answer && fallback <= 9) {
        distractors.add(fallback);
      }
      fallback++;
    }

    const options = [answer, ...Array.from(distractors)];
    options.sort(() => Math.random() - 0.5);

    return {
      num1,
      num2,
      answer,
      options
    };
  }

  // =========================================================================
  // CONFETTI CELEBRATION ENGINE
  // =========================================================================
  class ConfettiEffect {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.animationId = null;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(x = window.innerWidth / 2, y = window.innerHeight / 2) {
      const colors = ['#f97316', '#ffd54f', '#ab47bc', '#7cb342', '#38bdf8', '#fb7185'];
      for (let i = 0; i < 48; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 8;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: 6 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          opacity: 1,
          decay: 0.015 + Math.random() * 0.015
        });
      }

      if (!this.animationId) {
        this.animate();
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(() => this.animate());
      } else {
        this.animationId = null;
      }
    }
  }

  let confetti;

  // =========================================================================
  // EQUATION SYMBOLS GLOW & COUNTING HINT CONTROLS
  // Provides gentle, noticeable glow to guide attention through addition steps
  // =========================================================================
  function resetEquationSymbolsGlow() {
    const plusElem = document.querySelector('.math-plus-symbol');
    const equalsElem = document.querySelector('.math-equals-symbol');
    if (plusElem) {
      plusElem.classList.remove('symbol-glow', 'highlighted');
    }
    if (equalsElem) {
      equalsElem.classList.remove('symbol-glow', 'highlighted');
    }
  }

  let hintTimers = [];
  function setHintTimeout(fn, delay) {
    if (!state.isCountingHintActive) return null;
    const t = setTimeout(() => {
      const idx = hintTimers.indexOf(t);
      if (idx !== -1) hintTimers.splice(idx, 1);
      if (state.isCountingHintActive) fn();
    }, delay);
    hintTimers.push(t);
    return t;
  }

  function clearHintTimers() {
    hintTimers.forEach(t => clearTimeout(t));
    hintTimers = [];
  }

  function stopCountingHint() {
    clearHintTimers();
    if (state.hintInterval) {
      clearInterval(state.hintInterval);
      state.hintInterval = null;
    }
    state.isCountingHintActive = false;
    const hintBtn = document.getElementById('btn-count-hint');
    if (hintBtn) {
      hintBtn.classList.remove('hint-active');
    }
    document.querySelectorAll('.flower-token.highlighted').forEach(el => {
      el.classList.remove('highlighted');
    });
    resetEquationSymbolsGlow();
  }

  // --- Answer Buttons Disabled / Enabled State Controller ---
  function setAnswerButtonsEnabled(enabled) {
    state.isAnswerSelectionEnabled = enabled;
    const answerContainer = document.getElementById('flower-answer-buttons');
    if (!answerContainer) return;

    const btns = answerContainer.querySelectorAll('.flower-btn');
    btns.forEach(btn => {
      btn.disabled = !enabled;
      if (enabled) {
        btn.classList.remove('disabled');
        btn.classList.add('unlocked');
        setTimeout(() => btn.classList.remove('unlocked'), 600);
      } else {
        btn.classList.add('disabled');
        btn.classList.remove('unlocked');
      }
    });
  }

  // --- Stage Two: Automatically Reveal Combined Total Flowers ---
  // As the child counts flowers in either First Group or Second Group:
  // Each valid counting tap automatically reveals exactly one corresponding flower into the Combined Total box.
  // These flowers initially appear unnumbered (blank sunny yellow centre).
  // The child must never have to tap the blank Combined Total box to make flowers appear.
  function spawnUnnumberedTotalFlower() {
    const q = state.currentQuestion;
    if (!q) return null;

    const resBox = document.getElementById('flower-group-result');
    if (!resBox) return null;

    // Do not reveal more flowers than the mathematical sum
    if (resBox.children.length >= q.answer) return null;

    const currentPalette = FLOWER_PALETTES[state.paletteIndex];

    // Prominent, consistent flower size (68-70px, ~12% reduction) for clear preschool visual counting
    const flowerSizeClass = 'size-lg';
    const flowerPixelSize = 68;

    const flowerDiv = document.createElement('div');
    flowerDiv.className = `flower-token ${flowerSizeClass} uncounted revealing`;
    flowerDiv.dataset.box = 'flower-group-result';
    flowerDiv.dataset.counted = 'false';
    flowerDiv.dataset.countOrder = '';

    flowerDiv.innerHTML = createFlowerSVG({
      number: '',
      size: flowerPixelSize,
      petalColor: currentPalette.petal,
      centerColor: '#ffd54f',
      hideNumber: true // Initially unnumbered: blank sunny yellow centre
    });

    // Clicking a flower in Combined Total is handled by handleCombinedFlowerTap
    flowerDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCombinedFlowerTap(flowerDiv);
    });

    resBox.appendChild(flowerDiv);
    return flowerDiv;
  }

  // --- Stage Three: Count the Combined Total Flowers ---
  // Once both First Group and Second Group are fully counted, the child independently
  // counts all the revealed flowers in the Combined Total box.
  // Child can tap revealed flowers in any order; numbers (1, 2, 3...) are assigned
  // sequentially according to tap order.
  function handleCombinedFlowerTap(flowerEl) {
    if (state.isAnswered || state.isCountingHintActive) return;

    // Stage gating: Can only count total flowers once both groups are completed
    if (state.currentStage !== 'counting_total') {
      const targetBoxId = state.currentStage === 'group1' ? 'flower-group-1' : 'flower-group-2';
      const targetBox = document.getElementById(targetBoxId);
      if (targetBox) {
        targetBox.classList.remove('box-attention');
        void targetBox.offsetWidth;
        targetBox.classList.add('box-attention');
        setTimeout(() => targetBox.classList.remove('box-attention'), 500);
      }
      return;
    }

    // Tapping an already-counted flower provides tactile bounce without changing count or number
    if (flowerEl.dataset.counted === 'true') {
      flowerEl.classList.remove('tapped');
      void flowerEl.offsetWidth;
      flowerEl.classList.add('tapped');
      const prevOrder = parseInt(flowerEl.dataset.countOrder, 10) || 1;
      audio.playPop(prevOrder);
      return;
    }

    const q = state.currentQuestion;
    if (!q) return;

    // Lock to combined box during sequence if not already locked
    if (!state.activeCountingBox) {
      state.activeCountingBox = 'flower-group-result';
      const resBox = document.getElementById('flower-group-result');
      if (resBox) {
        resBox.classList.add('counting-active');
      }
    }

    state.boxCounters['flower-group-result'] = (state.boxCounters['flower-group-result'] || 0) + 1;
    const currentCount = state.boxCounters['flower-group-result'];

    flowerEl.dataset.counted = 'true';
    flowerEl.dataset.countOrder = String(currentCount);
    flowerEl.classList.remove('uncounted');
    flowerEl.classList.add('counted');

    // Reveal number in sunny yellow center
    const textElem = flowerEl.querySelector('.flower-digit-text');
    if (textElem) {
      textElem.textContent = currentCount;
      textElem.classList.remove('hidden-digit');
      textElem.classList.add('revealed');
    }

    // Tactile blossom bounce
    flowerEl.classList.remove('tapped');
    void flowerEl.offsetWidth;
    flowerEl.classList.add('tapped');

    // Audio pop and speech
    audio.playPop(currentCount);
    teacherVoice.countFlower(currentCount);

    // Box completion check: When all total flowers have been counted
    if (currentCount >= q.answer) {
      const resBox = document.getElementById('flower-group-result');
      if (resBox) {
        resBox.classList.remove('counting-active');
        resBox.classList.add('box-completed');
      }

      const equalsElem = document.querySelector('.math-equals-symbol');
      if (equalsElem) {
        equalsElem.classList.remove('symbol-glow');
      }

      state.activeCountingBox = null;
      state.currentStage = 'total_announced';

      // Stage Four: Play spoken total announcement, then enable answer buttons
      if (!state.hasAnnouncedTotal) {
        state.hasAnnouncedTotal = true;
        triggerTotalAnnouncement();
      }
    }
  }

  function revealCombinedTotalFlowers() {
    const q = state.currentQuestion;
    if (!q) return;
    const resBox = document.getElementById('flower-group-result');
    if (!resBox) return;
    while (resBox.children.length < q.answer) {
      spawnUnnumberedTotalFlower();
    }
  }

  function revealNextCombinedFlower() {
    return spawnUnnumberedTotalFlower();
  }

  // --- Timers for Spoken Total Announcement ---
  let totalAnnouncementTimer = null;
  let totalUnlockTimer = null;

  function clearAnnouncementTimers() {
    if (totalAnnouncementTimer) {
      clearTimeout(totalAnnouncementTimer);
      totalAnnouncementTimer = null;
    }
    if (totalUnlockTimer) {
      clearTimeout(totalUnlockTimer);
      totalUnlockTimer = null;
    }
  }

  // Plays "We have [total] flowers in total." after all combined total flowers are counted,
  // then enables answer buttons once the speech finishes.
  function triggerTotalAnnouncement(onComplete) {
    clearAnnouncementTimers();
    const q = state.currentQuestion;
    if (!q) return;

    // Small delay (450ms) to let the last flower count ("Four!") be voiced clearly
    totalAnnouncementTimer = setTimeout(() => {
      totalAnnouncementTimer = null;
      if (state.isAnswered) return;

      const finishAnnouncement = () => {
        if (totalUnlockTimer) {
          clearTimeout(totalUnlockTimer);
          totalUnlockTimer = null;
        }
        if (!state.isAnswered) {
          state.currentStage = 'answer';
          setAnswerButtonsEnabled(true);
          if (onComplete) onComplete();
        }
      };

      // Safety fallback timer to unlock answer buttons even if browser speech hangs
      totalUnlockTimer = setTimeout(finishAnnouncement, 4000);

      teacherVoice.announceTotal(q.answer, finishAnnouncement);
    }, 450);
  }

  // =========================================================================
  // RENDER QUESTION & VISUAL ADDITION EQUATION
  // [Group 1 of flowers] + [Group 2 of flowers] = [Combined group of flowers]
  // =========================================================================
  function renderQuestion() {
    state.isAnswered = false;
    state.selectedAnswer = null;
    state.isCountingHintActive = false;
    state.currentStage = 'group1';
    state.isAnswerSelectionEnabled = false;
    state.hasAnnouncedTotal = false;

    clearAnnouncementTimers();

    // Reset any active hint and equation symbol glows
    stopCountingHint();

    // Reset per-box counters and active counting sequence
    state.boxCounters = {
      'flower-group-1': 0,
      'flower-group-2': 0,
      'flower-group-result': 0
    };
    state.activeCountingBox = null;

    ['flower-group-1', 'flower-group-2', 'flower-group-result'].forEach(id => {
      const box = document.getElementById(id);
      if (box) {
        box.classList.remove('counting-active', 'box-completed', 'box-attention');
      }
    });

    const q = state.currentQuestion;
    const currentPalette = FLOWER_PALETTES[state.paletteIndex];

    // Dynamically update CSS custom properties for ambient theme accents
    document.documentElement.style.setProperty('--flower-purple-petal', currentPalette.petal);
    document.documentElement.style.setProperty('--flower-purple-petal-dark', currentPalette.petalDark);
    document.documentElement.style.setProperty('--flower-purple-petal-light', currentPalette.petalLight);

    // 1. Math Question Banner: "num1 + num2 = ?"
    const qNum1 = document.getElementById('q-num1');
    const qNum2 = document.getElementById('q-num2');
    const qTarget = document.getElementById('q-target');

    if (qNum1) qNum1.textContent = q.num1;
    if (qNum2) qNum2.textContent = q.num2;
    if (qTarget) {
      qTarget.textContent = '?';
      qTarget.classList.remove('solved');
    }

    // Determine flower size class based on answer total to keep layout neat and balanced
    // Prominent, consistent flower size (68-70px, ~12% reduction) for clear preschool visual counting
    const flowerSizeClass = 'size-lg';
    const flowerPixelSize = 68;

    // 2. Render Group 1 Box (q.num1 flowers)
    // Child can tap any flower as 1, counting in any order!
    const group1Box = document.getElementById('flower-group-1');
    if (group1Box) {
      group1Box.innerHTML = '';
      for (let i = 1; i <= q.num1; i++) {
        const flowerDiv = document.createElement('div');
        flowerDiv.className = `flower-token ${flowerSizeClass} uncounted`;
        flowerDiv.dataset.box = 'flower-group-1';
        flowerDiv.dataset.counted = 'false';
        flowerDiv.dataset.countOrder = '';
        flowerDiv.innerHTML = createFlowerSVG({
          number: '',
          size: flowerPixelSize,
          petalColor: currentPalette.petal,
          centerColor: '#ffd54f',
          hideNumber: true // Hidden initially, reveals dynamic count number on tap!
        });

        flowerDiv.addEventListener('click', () => {
          handleFlowerTap(flowerDiv, 'flower-group-1');
        });

        group1Box.appendChild(flowerDiv);
      }
    }

    // 3. Render Group 2 Box (q.num2 flowers)
    // Child can tap any flower as 1, counting independently!
    const group2Box = document.getElementById('flower-group-2');
    if (group2Box) {
      group2Box.innerHTML = '';
      for (let i = 1; i <= q.num2; i++) {
        const flowerDiv = document.createElement('div');
        flowerDiv.className = `flower-token ${flowerSizeClass} uncounted`;
        flowerDiv.dataset.box = 'flower-group-2';
        flowerDiv.dataset.counted = 'false';
        flowerDiv.dataset.countOrder = '';
        flowerDiv.innerHTML = createFlowerSVG({
          number: '',
          size: flowerPixelSize,
          petalColor: currentPalette.petal,
          centerColor: '#ffd54f',
          hideNumber: true
        });

        flowerDiv.addEventListener('click', () => {
          handleFlowerTap(flowerDiv, 'flower-group-2');
        });

        group2Box.appendChild(flowerDiv);
      }
    }

    // 4. Combined Result Group Box:
    // STARTS COMPLETELY BLANK!
    // Total flowers appear one-by-one automatically as Group 1 and Group 2 flowers are counted.
    const groupResultBox = document.getElementById('flower-group-result');
    if (groupResultBox) {
      groupResultBox.innerHTML = '';
    }

    // 5. Render Three Flower-Shaped Answer Buttons
    // Answer buttons start DISABLED until total counting is completed!
    const answerContainer = document.getElementById('flower-answer-buttons');
    if (answerContainer) {
      answerContainer.innerHTML = '';

      q.options.forEach((val) => {
        const btn = document.createElement('button');
        btn.className = 'flower-btn disabled';
        btn.disabled = true;
        btn.dataset.value = val;
        btn.setAttribute('aria-label', `Flower option ${val}`);

        btn.innerHTML = createFlowerSVG({
          number: val,
          size: 105,
          petalColor: currentPalette.petal,
          centerColor: '#ffd54f',
          hideNumber: false // Visible numbers inside sunny yellow centres
        });

        btn.addEventListener('click', (e) => {
          handleAnswerSelect(val, btn, e);
        });

        answerContainer.appendChild(btn);
      });
    }

    // 6. Reset Feedback Ribbon
    const feedbackRibbon = document.getElementById('feedback-ribbon');
    if (feedbackRibbon) {
      feedbackRibbon.innerHTML = '';
    }

    // 7. Update Level Indicator Text
    updateLevelBadge();
  }

  // --- Flower Tap Handler (Tactile Order-Irrelevant Counting) ---
  // Learning Sequence:
  // Count First Group -> Count Second Group -> Count Combined Total Flowers -> Select Correct Answer
  // Each valid tap in First or Second Group automatically reveals one unnumbered flower in Combined Total box!
  function handleFlowerTap(flowerEl, boxId) {
    if (state.isAnswered || state.isCountingHintActive) return;

    if (boxId === 'flower-group-result') {
      handleCombinedFlowerTap(flowerEl);
      return;
    }

    // Prevent counting a flower twice in the same sequence
    if (flowerEl.dataset.counted === 'true') {
      flowerEl.classList.remove('tapped');
      void flowerEl.offsetWidth;
      flowerEl.classList.add('tapped');
      const prevOrder = parseInt(flowerEl.dataset.countOrder, 10) || 1;
      audio.playPop(prevOrder);
      return;
    }

    const q = state.currentQuestion;
    if (!q) return;

    // Sequential stage gating:
    // If child taps Group 2 while Group 1 is not finished, gently guide to Group 1
    if (boxId === 'flower-group-2' && state.currentStage === 'group1') {
      const box1El = document.getElementById('flower-group-1');
      if (box1El) {
        box1El.classList.remove('box-attention');
        void box1El.offsetWidth;
        box1El.classList.add('box-attention');
        setTimeout(() => box1El.classList.remove('box-attention'), 500);
      }
      return;
    }

    // Keep counting restricted to the current box.
    // The child must not switch to another box in the middle of a counting sequence.
    if (state.activeCountingBox && state.activeCountingBox !== boxId) {
      const activeBoxEl = document.getElementById(state.activeCountingBox);
      if (activeBoxEl) {
        activeBoxEl.classList.remove('box-attention');
        void activeBoxEl.offsetWidth;
        activeBoxEl.classList.add('box-attention');
        setTimeout(() => {
          activeBoxEl.classList.remove('box-attention');
        }, 500);
      }
      return;
    }

    // Lock to this box during the sequence if not already locked
    if (!state.activeCountingBox) {
      state.activeCountingBox = boxId;
      const boxEl = document.getElementById(boxId);
      if (boxEl) {
        boxEl.classList.add('counting-active');
      }
    }

    // Assign the next number in order of child's selection: 1, 2, 3...
    state.boxCounters[boxId] = (state.boxCounters[boxId] || 0) + 1;
    const currentCount = state.boxCounters[boxId];

    flowerEl.dataset.counted = 'true';
    flowerEl.dataset.countOrder = String(currentCount);
    flowerEl.classList.remove('uncounted');
    flowerEl.classList.add('counted');

    // Reveal the dynamic count number in the flower's yellow centre
    const textElem = flowerEl.querySelector('.flower-digit-text');
    if (textElem) {
      textElem.textContent = currentCount;
      textElem.classList.remove('hidden-digit');
      textElem.classList.add('revealed');
    }

    // Tactile blossom bounce
    flowerEl.classList.remove('tapped');
    void flowerEl.offsetWidth;
    flowerEl.classList.add('tapped');

    // Spoken number and cheerful pop sound
    audio.playPop(currentCount);
    teacherVoice.countFlower(currentCount);

    // Stage Two: Automatically Reveal exactly one corresponding flower into Combined Total box
    spawnUnnumberedTotalFlower();

    const boxEl = document.getElementById(boxId);

    // --- Box Completion Checks ---
    if (boxId === 'flower-group-1') {
      if (state.boxCounters['flower-group-1'] >= q.num1) {
        if (boxEl) {
          boxEl.classList.remove('counting-active');
          boxEl.classList.add('box-completed');
        }
        // Group 1 complete: Activate gentle glow on plus (+) sign!
        const plusElem = document.querySelector('.math-plus-symbol');
        if (plusElem) {
          plusElem.classList.add('symbol-glow');
        }
        // Advance stage to Group 2, unlock active box
        state.currentStage = 'group2';
        state.activeCountingBox = null;
      }
    } else if (boxId === 'flower-group-2') {
      if (state.boxCounters['flower-group-2'] >= q.num2) {
        if (boxEl) {
          boxEl.classList.remove('counting-active');
          boxEl.classList.add('box-completed');
        }
        // Group 2 complete: Turn off plus glow, activate gentle glow on equals (=) sign!
        const plusElem = document.querySelector('.math-plus-symbol');
        if (plusElem) {
          plusElem.classList.remove('symbol-glow');
        }
        const equalsElem = document.querySelector('.math-equals-symbol');
        if (equalsElem) {
          equalsElem.classList.add('symbol-glow');
        }
        // Advance stage to counting_total, unlock active box
        state.currentStage = 'counting_total';
        state.activeCountingBox = null;

        // Highlight Combined Total box to invite child to count the total flowers
        const resBox = document.getElementById('flower-group-result');
        if (resBox) {
          resBox.classList.add('counting-active');
        }
      }
    }
  }

  // --- Reset Round Counting Handler ("Count Again") ---
  // Restarts the current round's counting sequence from the beginning:
  // - Clears all counting numbers from First Group
  // - Clears all counting numbers from Second Group
  // - Removes all flowers from Combined Total box (returns to completely blank state)
  // - Resets total group's independent counting sequence
  // - Resets plus and equals glow effects
  // - Resets counting progress, announcement state, and answer-selection state (disabled)
  // - Allows repeating sequence for same question without altering level or score.
  function resetRoundCounting(silent = false) {
    stopCountingHint();
    clearAnnouncementTimers();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    state.boxCounters = {
      'flower-group-1': 0,
      'flower-group-2': 0,
      'flower-group-result': 0
    };
    state.activeCountingBox = null;
    state.currentStage = 'group1';
    state.isAnswered = false;
    state.hasAnnouncedTotal = false;

    // Reset equation symbol glows
    resetEquationSymbolsGlow();

    // Reset answer selection state (disabled)
    setAnswerButtonsEnabled(false);

    // Reset target equation text to '?'
    const qTarget = document.getElementById('q-target');
    if (qTarget) {
      qTarget.textContent = '?';
      qTarget.classList.remove('solved');
    }

    // Reset feedback ribbon
    const feedbackRibbon = document.getElementById('feedback-ribbon');
    if (feedbackRibbon) {
      feedbackRibbon.innerHTML = '';
    }

    // Reset flowers in Group 1 and Group 2
    ['flower-group-1', 'flower-group-2'].forEach(id => {
      const boxEl = document.getElementById(id);
      if (boxEl) {
        boxEl.classList.remove('counting-active', 'box-completed', 'box-attention');

        const flowers = boxEl.querySelectorAll('.flower-token');
        flowers.forEach(flowerEl => {
          flowerEl.dataset.counted = 'false';
          flowerEl.dataset.countOrder = '';
          flowerEl.classList.remove('counted', 'tapped', 'highlighted');
          flowerEl.classList.add('uncounted');

          const textElem = flowerEl.querySelector('.flower-digit-text');
          if (textElem) {
            textElem.textContent = '';
            textElem.classList.remove('revealed');
            textElem.classList.add('hidden-digit');
          }
        });
      }
    });

    // Remove all flowers from Combined Total box (completely blank initial state)
    const resultBox = document.getElementById('flower-group-result');
    if (resultBox) {
      resultBox.innerHTML = '';
      resultBox.classList.remove('counting-active', 'box-completed', 'box-attention');
    }

    if (!silent) {
      audio.playPop(1);
    }
  }

  function resetBoxCounting(boxId) {
    resetRoundCounting();
  }

  // Reveal all question flowers upon hint or correct answer
  // Ensures any uncounted flowers are filled with remaining valid numbers 1..N
  function revealAllQuestionFlowers() {
    const q = state.currentQuestion;
    if (!q) return;

    // Ensure result box has all q.answer flowers spawned
    const resultBox = document.getElementById('flower-group-result');
    if (resultBox) {
      while (resultBox.children.length < q.answer) {
        spawnUnnumberedTotalFlower();
      }
    }

    const boxes = [
      { id: 'flower-group-1', total: q.num1 },
      { id: 'flower-group-2', total: q.num2 },
      { id: 'flower-group-result', total: q.answer }
    ];

    let delayIndex = 0;
    boxes.forEach(boxInfo => {
      const boxEl = document.getElementById(boxInfo.id);
      if (!boxEl) return;

      const flowers = Array.from(boxEl.querySelectorAll('.flower-token'));
      const usedNumbers = new Set();
      flowers.forEach(f => {
        if (f.dataset.counted === 'true' && f.dataset.countOrder) {
          usedNumbers.add(parseInt(f.dataset.countOrder, 10));
        }
      });

      const unusedNumbers = [];
      for (let n = 1; n <= boxInfo.total; n++) {
        if (!usedNumbers.has(n)) {
          unusedNumbers.push(n);
        }
      }

      let unusedIdx = 0;
      flowers.forEach(flowerEl => {
        if (flowerEl.dataset.counted !== 'true') {
          const assignedNum = unusedNumbers[unusedIdx++] || (usedNumbers.size + 1);
          flowerEl.dataset.counted = 'true';
          flowerEl.dataset.countOrder = String(assignedNum);
          flowerEl.classList.remove('uncounted');
          flowerEl.classList.add('counted');

          const textElem = flowerEl.querySelector('.flower-digit-text');
          if (textElem) {
            textElem.textContent = assignedNum;
          }

          setTimeout(() => {
            if (textElem) {
              textElem.classList.remove('hidden-digit');
              textElem.classList.add('revealed');
            }
          }, delayIndex * 50);
          delayIndex++;
        }
      });

      boxEl.classList.remove('counting-active', 'box-attention');
      boxEl.classList.add('box-completed');
    });
  }

  // =========================================================================
  // ANSWER SELECTION & VERIFICATION
  // =========================================================================
  function handleAnswerSelect(selectedVal, btnElement, event) {
    if (state.isAnswered || !state.isAnswerSelectionEnabled) return;

    stopCountingHint();

    audio.init();

    if (selectedVal === state.currentQuestion.answer) {
      // --- CORRECT ANSWER ---
      state.isAnswered = true;
      state.selectedAnswer = selectedVal;
      state.starsEarned++;
      state.currentStreak++;

      // Update question equation display: ? -> answer with solved highlight
      const qTarget = document.getElementById('q-target');
      if (qTarget) {
        qTarget.textContent = selectedVal;
        qTarget.classList.add('solved');
      }

      // Button celebration animation
      btnElement.classList.add('correct');

      // Reveal all flowers across the equation so child sees the full solution
      revealAllQuestionFlowers();

      // Trigger Confetti originating from the clicked flower
      if (confetti) {
        const rect = btnElement.getBoundingClientRect();
        confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }

      // Audio & Speech
      audio.playSuccessFanfare();
      teacherVoice.celebrateCorrect(state.currentQuestion.num1, state.currentQuestion.num2, selectedVal);

      // Feedback banner
      const feedbackRibbon = document.getElementById('feedback-ribbon');
      if (feedbackRibbon) {
        const isRound10 = state.starsEarned >= state.maxStars;
        let actionBtnText = 'Play Next Round';
        if (isRound10) {
          actionBtnText = state.level < 3 ? 'Start Next Level' : 'Play Again';
        }

        feedbackRibbon.innerHTML = `
          <div class="feedback-msg success">
            🎉 Excellent! &nbsp;${state.currentQuestion.num1} + ${state.currentQuestion.num2} = ${selectedVal}&nbsp; Good job!
          </div>
          <button id="next-btn" class="next-question-btn">
            ${actionBtnText}
          </button>
        `;

        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
          nextBtn.focus();
          nextBtn.addEventListener('click', () => {
            if (isRound10) {
              showLevelCompleteModal();
            } else {
              onNextQuestion();
            }
          });
        }
      }

      // Star meter update
      updateProgressStars();

      // Check for round 10 completion
      if (state.starsEarned >= state.maxStars) {
        setTimeout(() => {
          showLevelCompleteModal();
        }, 1200);
      }

    } else {
      // --- INCORRECT ANSWER (Encouraging, Non-penalizing) ---
      btnElement.classList.remove('incorrect');
      void btnElement.offsetWidth;
      btnElement.classList.add('incorrect');

      audio.playGentleTryAgain();
      teacherVoice.encourageTryAgain();

      const feedbackRibbon = document.getElementById('feedback-ribbon');
      if (feedbackRibbon) {
        feedbackRibbon.innerHTML = `
          <div class="feedback-msg try-again">
            🌱 That's okay, little one! Let's count and add the flowers together.
          </div>
        `;
      }

      // Gently pulse the hint button to guide the child
      const hintBtn = document.getElementById('btn-count-hint');
      if (hintBtn) {
        hintBtn.classList.add('hint-pulse');
        setTimeout(() => hintBtn.classList.remove('hint-pulse'), 3000);
      }
    }
  }

  // =========================================================================
  // VISUAL EQUATION COUNTING HINT ("Count with Me")
  // Walks sequentially through:
  // Count First Group (auto-spawns total flowers) -> Plus Glows ->
  // Count Second Group (auto-spawns total flowers) -> Equals Glows ->
  // Count Total Flowers (reveals 1..N in yellow centers) -> Spoken Total Announcement ->
  // Enable Answer Buttons!
  // =========================================================================
  function triggerCountingHint() {
    if (state.isCountingHintActive || state.isAnswered) return;
    stopCountingHint();

    // Start with a clean slate for the guided counting sequence
    resetRoundCounting();

    state.isCountingHintActive = true;
    audio.init();

    const hintBtn = document.getElementById('btn-count-hint');
    if (hintBtn) {
      hintBtn.classList.add('hint-active');
    }

    const q = state.currentQuestion;
    if (!q) return;

    const box1El = document.getElementById('flower-group-1');
    const box2El = document.getElementById('flower-group-2');
    const resBox = document.getElementById('flower-group-result');
    const g1Flowers = box1El ? Array.from(box1El.querySelectorAll('.flower-token')) : [];
    const g2Flowers = box2El ? Array.from(box2El.querySelectorAll('.flower-token')) : [];
    const plusElem = document.querySelector('.math-plus-symbol');
    const equalsElem = document.querySelector('.math-equals-symbol');

    function checkActive() {
      return !!state.isCountingHintActive;
    }

    // Step 1: Count First Group flowers (1..q.num1)
    if (box1El) {
      box1El.classList.add('counting-active');
    }
    state.currentStage = 'group1';

    let g1Idx = 0;
    function countNextGroup1Flower() {
      if (!checkActive()) return;

      document.querySelectorAll('.flower-token.highlighted').forEach(el => {
        el.classList.remove('highlighted');
      });

      if (g1Idx < g1Flowers.length) {
        const count = g1Idx + 1;
        const flowerEl = g1Flowers[g1Idx];

        flowerEl.classList.add('highlighted', 'counted');
        flowerEl.dataset.counted = 'true';
        flowerEl.dataset.countOrder = String(count);
        flowerEl.classList.remove('uncounted');

        const textElem = flowerEl.querySelector('.flower-digit-text');
        if (textElem) {
          textElem.textContent = count;
          textElem.classList.remove('hidden-digit');
          textElem.classList.add('revealed');
        }

        flowerEl.classList.remove('tapped');
        void flowerEl.offsetWidth;
        flowerEl.classList.add('tapped');

        state.boxCounters['flower-group-1'] = count;
        audio.playPop(count);

        // Auto-spawn corresponding unnumbered flower in Combined Total box
        spawnUnnumberedTotalFlower();

        // Speak flower count and wait until speech completely finishes + 600ms pause (matching Activities 2 & 3)
        teacherVoice.countFlower(count, () => {
          if (!checkActive()) return;
          g1Idx++;
          if (g1Idx < g1Flowers.length) {
            setHintTimeout(countNextGroup1Flower, 600);
          } else {
            // Group 1 complete
            if (box1El) {
              box1El.classList.remove('counting-active');
              box1El.classList.add('box-completed');
            }
            setHintTimeout(stepPlusSign, 600);
          }
        });
      } else {
        if (box1El) {
          box1El.classList.remove('counting-active');
          box1El.classList.add('box-completed');
        }
        setHintTimeout(stepPlusSign, 600);
      }
    }

    // Step 2: Plus Sign addition instruction
    function stepPlusSign() {
      if (!checkActive()) return;

      document.querySelectorAll('.flower-token.highlighted').forEach(el => {
        el.classList.remove('highlighted');
      });

      if (plusElem) {
        plusElem.classList.add('symbol-glow', 'highlighted');
      }
      state.currentStage = 'group2';
      audio.playPop(1);

      // Teacher says "Plus!" and waits until speech finishes + 500ms pause (matching Activities 2 & 3)
      teacherVoice.speak("Plus!", () => {
        if (!checkActive()) return;
        if (plusElem) {
          plusElem.classList.remove('highlighted');
          plusElem.classList.add('symbol-glow');
        }
        setHintTimeout(stepGroup2, 500);
      });
    }

    // Step 3: Count Second Group flowers (1..q.num2)
    function stepGroup2() {
      if (!checkActive()) return;

      if (box2El) {
        box2El.classList.add('counting-active');
      }

      let g2Idx = 0;
      function countNextGroup2Flower() {
        if (!checkActive()) return;

        document.querySelectorAll('.flower-token.highlighted').forEach(el => {
          el.classList.remove('highlighted');
        });

        if (g2Idx < g2Flowers.length) {
          const count = g2Idx + 1;
          const flowerEl = g2Flowers[g2Idx];

          flowerEl.classList.add('highlighted', 'counted');
          flowerEl.dataset.counted = 'true';
          flowerEl.dataset.countOrder = String(count);
          flowerEl.classList.remove('uncounted');

          const textElem = flowerEl.querySelector('.flower-digit-text');
          if (textElem) {
            textElem.textContent = count;
            textElem.classList.remove('hidden-digit');
            textElem.classList.add('revealed');
          }

          flowerEl.classList.remove('tapped');
          void flowerEl.offsetWidth;
          flowerEl.classList.add('tapped');

          state.boxCounters['flower-group-2'] = count;
          audio.playPop(count);

          // Auto-spawn corresponding unnumbered flower in Combined Total box
          spawnUnnumberedTotalFlower();

          // Speak flower count and wait until speech completely finishes + 600ms pause (matching Activities 2 & 3)
          teacherVoice.countFlower(count, () => {
            if (!checkActive()) return;
            g2Idx++;
            if (g2Idx < g2Flowers.length) {
              setHintTimeout(countNextGroup2Flower, 600);
            } else {
              // Group 2 complete
              if (box2El) {
                box2El.classList.remove('counting-active');
                box2El.classList.add('box-completed');
              }
              setHintTimeout(stepEqualsSign, 600);
            }
          });
        } else {
          if (box2El) {
            box2El.classList.remove('counting-active');
            box2El.classList.add('box-completed');
          }
          setHintTimeout(stepEqualsSign, 600);
        }
      }

      countNextGroup2Flower();
    }

    // Step 4: Equals Sign addition instruction
    function stepEqualsSign() {
      if (!checkActive()) return;

      document.querySelectorAll('.flower-token.highlighted').forEach(el => {
        el.classList.remove('highlighted');
      });

      if (plusElem) {
        plusElem.classList.remove('symbol-glow', 'highlighted');
      }
      if (equalsElem) {
        equalsElem.classList.add('symbol-glow', 'highlighted');
      }
      state.currentStage = 'counting_total';
      audio.playPop(1);

      // Teacher speaks "Equals" and waits until speech finishes + 500ms pause (matching Activities 2 & 3)
      teacherVoice.speak("Equals", () => {
        if (!checkActive()) return;
        if (equalsElem) {
          equalsElem.classList.remove('highlighted');
          equalsElem.classList.add('symbol-glow');
        }
        setHintTimeout(stepCountTotal, 500);
      });
    }

    // Step 5: Count Combined Total flowers (1..q.answer)
    function stepCountTotal() {
      if (!checkActive()) return;

      if (resBox) {
        resBox.classList.add('counting-active');
      }

      const resFlowers = resBox ? Array.from(resBox.querySelectorAll('.flower-token')) : [];
      let totalIdx = 0;

      function countNextTotalFlower() {
        if (!checkActive()) return;

        document.querySelectorAll('.flower-token.highlighted').forEach(el => {
          el.classList.remove('highlighted');
        });

        if (totalIdx < q.answer && totalIdx < resFlowers.length) {
          const count = totalIdx + 1;
          const flowerEl = resFlowers[totalIdx];

          if (flowerEl) {
            flowerEl.classList.add('highlighted', 'counted');
            flowerEl.dataset.counted = 'true';
            flowerEl.dataset.countOrder = String(count);
            flowerEl.classList.remove('uncounted');

            const textElem = flowerEl.querySelector('.flower-digit-text');
            if (textElem) {
              textElem.textContent = count;
              textElem.classList.remove('hidden-digit');
              textElem.classList.add('revealed');
            }

            flowerEl.classList.remove('tapped');
            void flowerEl.offsetWidth;
            flowerEl.classList.add('tapped');
          }

          state.boxCounters['flower-group-result'] = count;
          audio.playPop(count);

          // Teacher speaks each total flower number slowly & clearly, waiting for speech to finish + 600ms pause
          teacherVoice.countFlower(count, () => {
            if (!checkActive()) return;
            totalIdx++;
            if (totalIdx < q.answer && totalIdx < resFlowers.length) {
              setHintTimeout(countNextTotalFlower, 600);
            } else {
              setHintTimeout(stepCompleteTotal, 700);
            }
          });
        } else {
          setHintTimeout(stepCompleteTotal, 700);
        }
      }

      countNextTotalFlower();
    }

    // Step 6: Complete Total Counting & Announce Final Total
    function stepCompleteTotal() {
      if (!checkActive()) return;

      document.querySelectorAll('.flower-token.highlighted').forEach(el => {
        el.classList.remove('highlighted');
      });

      if (resBox) {
        resBox.classList.remove('counting-active');
        resBox.classList.add('box-completed');
      }
      if (equalsElem) {
        equalsElem.classList.remove('symbol-glow', 'highlighted');
      }

      state.currentStage = 'total_announced';
      state.hasAnnouncedTotal = true;

      triggerTotalAnnouncement(() => {
        // Highlight matching answer button gently to invite selection
        const answerBtns = document.querySelectorAll('.flower-answer-buttons .flower-btn');
        answerBtns.forEach(btn => {
          if (parseInt(btn.dataset.value, 10) === q.answer) {
            btn.style.filter = 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.95))';
            setTimeout(() => {
              btn.style.filter = '';
            }, 3500);
          }
        });
        state.isCountingHintActive = false;
        if (hintBtn) {
          hintBtn.classList.remove('hint-active');
        }
      });
    }

    // Begin with Group 1
    countNextGroup1Flower();
  }

  // --- Next Question Action ---
  function onNextQuestion() {
    state.paletteIndex = (state.paletteIndex + 1) % FLOWER_PALETTES.length;
    state.currentQuestion = generateQuestion();
    renderQuestion();
  }

  // --- Progress & Stars Update ---
  function updateProgressStars() {
    const starSlots = document.querySelectorAll('.stars-meter-row .star-slot');
    starSlots.forEach((slot, idx) => {
      if (idx < state.starsEarned) {
        if (!slot.classList.contains('earned')) {
          slot.classList.add('earned');
          audio.playStarEarned();
        }
      } else {
        slot.classList.remove('earned');
      }
    });

    const streakEl = document.getElementById('stat-streak-val');
    if (streakEl) {
      streakEl.textContent = state.currentStreak;
    }
  }

  // --- Update Level Badge Indicator ---
  function updateLevelBadge() {
    const badge = document.getElementById('level-badge-text');
    if (badge) {
      if (state.level === 1) {
        badge.textContent = 'Level 1: Totals up to 4';
      } else if (state.level === 2) {
        badge.textContent = 'Level 2: Totals up to 6';
      } else {
        badge.textContent = 'Level 3: Totals up to 9';
      }
    }

    // Update level switcher buttons
    const levelBtns = document.querySelectorAll('.level-toggle-btn');
    levelBtns.forEach(btn => {
      const lvl = parseInt(btn.dataset.level, 10);
      if (lvl === state.level) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // =========================================================================
  // CELEBRATION / QUEST COMPLETE MODAL
  // =========================================================================
  function showLevelCompleteModal() {
    audio.playSuccessFanfare();
    if (confetti) {
      confetti.burst(window.innerWidth / 2, window.innerHeight / 3);
      setTimeout(() => confetti.burst(window.innerWidth / 3, window.innerHeight / 2), 300);
      setTimeout(() => confetti.burst((window.innerWidth * 2) / 3, window.innerHeight / 2), 600);
    }

    teacherVoice.completion(state.level);

    const titleElem = document.getElementById('modal-complete-title');
    const starsText = document.getElementById('modal-complete-stars-text');
    const descText = document.getElementById('modal-complete-desc-text');
    const playBtn = document.getElementById('btn-play-again');

    if (starsText && descText && playBtn) {
      starsText.textContent = `You earned 10 ⭐ in Level ${state.level}!`;

      if (state.level === 1) {
        if (titleElem) titleElem.textContent = 'Level 1 Completed!';
        descText.textContent = 'Wonderful! 🌸 You can now add numbers to make 4. Ready to learn to make 6?';
        playBtn.textContent = 'Start Next Level';
      } else if (state.level === 2) {
        if (titleElem) titleElem.textContent = 'Level 2 Completed!';
        descText.textContent = 'Wonderful! 🌸 You can now add numbers to make 6. Ready to learn to make 9?';
        playBtn.textContent = 'Start Next Level';
      } else {
        if (titleElem) titleElem.textContent = 'Quest Completed!';
        descText.textContent = 'Wonderful! 🌸 You can now add numbers to make 9. You’re an addition star!';
        playBtn.textContent = 'Play Again';
      }
    }

    const modal = document.getElementById('quest-complete-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // =========================================================================
  // INITIALIZE APP
  // =========================================================================
  function init() {
    // Canvas Confetti
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
      confetti = new ConfettiEffect(canvas);
    }

    // Audio Speaker button in math banner
    const audioSpeakBtn = document.getElementById('audio-speak-btn');
    if (audioSpeakBtn) {
      audioSpeakBtn.addEventListener('click', () => {
        audio.init();
        audioSpeakBtn.classList.add('speaking');
        teacherVoice.readQuestion(state.currentQuestion, () => {
          audioSpeakBtn.classList.remove('speaking');
        });
      });
    }

    // Visual Counting Hint Button
    const countHintBtn = document.getElementById('btn-count-hint');
    if (countHintBtn) {
      countHintBtn.addEventListener('click', triggerCountingHint);
    }

    // Activities Dropdown Controller in Brown Website Header
    const activitiesDropdownWrapper = document.getElementById('activities-dropdown-wrapper');
    const activitiesDropdownBtn = document.getElementById('activities-dropdown-btn');
    const activity1Item = document.getElementById('activity-1-item');
    const flowerActivityContainer = document.getElementById('flower-activity-container');

    if (activitiesDropdownBtn && activitiesDropdownWrapper) {
      const toggleDropdown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = activitiesDropdownWrapper.classList.toggle('open');
        activitiesDropdownBtn.setAttribute('aria-expanded', String(isOpen));
      };

      const closeDropdown = () => {
        if (activitiesDropdownWrapper.classList.contains('open')) {
          activitiesDropdownWrapper.classList.remove('open');
          activitiesDropdownBtn.setAttribute('aria-expanded', 'false');
        }
      };

      activitiesDropdownBtn.addEventListener('click', toggleDropdown);

      // Close dropdown when tapping anywhere outside
      document.addEventListener('click', (e) => {
        if (!activitiesDropdownWrapper.contains(e.target)) {
          closeDropdown();
        }
      });

      // Close dropdown on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeDropdown();
        }
      });

      // Selecting Activity 1 from dropdown opens/displays Flower Addition II game
      if (activity1Item) {
        activity1Item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeDropdown();

          if (typeof window.TenaliSwitchToActivity === 'function') {
            window.TenaliSwitchToActivity(1, true);
          } else {
            if (flowerActivityContainer) {
              flowerActivityContainer.style.display = '';
              flowerActivityContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            resetRoundCounting(true);
          }
        });
      }
    }

    // Single "Count Again" Button in Top-Right Corner of Activity Area
    const countAgainBtn = document.getElementById('btn-count-again');
    if (countAgainBtn) {
      countAgainBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetRoundCounting();
      });
    }

    // Combined Total Box: Flowers appear automatically during Group 1 & 2 counting.
    // In Stage Three, child counts by tapping each revealed flower directly.
    // Child never has to tap the blank box to spawn flowers.
    const combinedTotalBox = document.getElementById('flower-group-result');
    if (combinedTotalBox) {
      combinedTotalBox.addEventListener('click', (e) => {
        const clickedFlower = e.target.closest('.flower-token');
        if (clickedFlower && clickedFlower.parentElement === combinedTotalBox) {
          handleCombinedFlowerTap(clickedFlower);
        }
      });
    }

    // Teacher Voice & Sound Toggles
    function updateVoiceTogglesUI() {
      const soundToggleBtn = document.getElementById('btn-sound-toggle');
      const teacherVoiceBtn = document.getElementById('teacher-voice-toggle-btn');
      const teacherVoiceStatus = document.getElementById('teacher-voice-status');

      if (soundToggleBtn) {
        soundToggleBtn.textContent = state.voiceEnabled ? '🔊' : '🔇';
        soundToggleBtn.title = state.voiceEnabled ? 'Mute Teacher Voice' : 'Unmute Teacher Voice';
      }

      if (teacherVoiceBtn && teacherVoiceStatus) {
        teacherVoiceStatus.textContent = state.voiceEnabled ? 'ON' : 'OFF';
        if (state.voiceEnabled) {
          teacherVoiceBtn.classList.remove('muted');
          teacherVoiceBtn.title = 'Teacher Voice: ON (Click to Mute)';
        } else {
          teacherVoiceBtn.classList.add('muted');
          teacherVoiceBtn.title = 'Teacher Voice: OFF (Click to Unmute)';
        }
      }
    }

    function toggleTeacherVoice() {
      state.voiceEnabled = !state.voiceEnabled;
      state.soundEnabled = state.voiceEnabled;
      updateVoiceTogglesUI();

      if (!state.voiceEnabled) {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } else {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
        teacherVoice.ensureVoice();
      }
    }

    const soundToggleBtn = document.getElementById('btn-sound-toggle');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', toggleTeacherVoice);
    }

    const teacherVoiceBtn = document.getElementById('teacher-voice-toggle-btn');
    if (teacherVoiceBtn) {
      teacherVoiceBtn.addEventListener('click', toggleTeacherVoice);
    }

    // Guide Modal Triggers
    const guideBtn = document.getElementById('guide-pill-btn');
    const guideModal = document.getElementById('guide-modal');
    if (guideBtn && guideModal) {
      guideBtn.addEventListener('click', (e) => {
        e.preventDefault();
        guideModal.classList.add('active');
      });
    }

    // Level Switcher Buttons
    const levelBtns = document.querySelectorAll('.level-toggle-btn');
    levelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedLvl = parseInt(btn.dataset.level, 10);
        if (state.level !== selectedLvl) {
          state.level = selectedLvl;
          state.starsEarned = 0;
          state.currentStreak = 0;
          updateProgressStars();
          questionScheduler.onLevelChange(selectedLvl);
          updateLevelBadge();
          onNextQuestion();
        }
      });
    });

    // Modal Close Buttons
    const closeButtons = document.querySelectorAll('.modal-close-trigger');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
      });
    });

    // Play Again button inside completion modal
    const playAgainBtn = document.getElementById('btn-play-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        hideModal('quest-complete-modal');
        state.starsEarned = 0;
        state.currentStreak = 0;
        updateProgressStars();
        if (state.level < 3) {
          state.level++;
        } else {
          state.level = 1;
        }
        questionScheduler.onLevelChange(state.level);
        updateLevelBadge();
        onNextQuestion();
      });
    }

    // Autoplay compliance & Voice Engine warm up on first gesture
    function handleFirstUserGesture() {
      if (!state.hasUserInteracted) {
        state.hasUserInteracted = true;
        audio.init();
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
        teacherVoice.ensureVoice();
      }
    }

    ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
      window.addEventListener(evt, handleFirstUserGesture, { once: true, passive: true });
    });

    // Generate First Question & Start
    state.currentQuestion = generateQuestion();
    renderQuestion();
    updateVoiceTogglesUI();

    // Export helpers for clean multi-activity switching and reset
    window.TenaliResetActivity1RoundCounting = (silent = true) => resetRoundCounting(silent);
    window.TenaliState1 = state;
    window.TenaliRenderQuestion1 = renderQuestion;
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();