/**
 * Tenali Flower Merge Addition (Activity 2) Game Engine
 * Visual Addition for Foundational Numeracy (Preschool Ages 4-5)
 * [Flower with num1 petals] + [Flower with num2 petals] = [Merged Grand Flower]
 *
 * Teaches preschool children that when two groups of flowers are added together,
 * they can be combined to make one group representing the total.
 *
 * Features:
 * - Interactive petal counting on addend flowers (starting from 1 independently)
 * - Progressive staggered appearance of individual flowers in the Answer Box
 * - Child-led manual counting of individual total flowers
 * - Smooth, delightful gliding & merging animation into a Grand Flower showing total
 * - Warm Indian preschool teacher voice narration
 * - Spaced repetition question scheduler for Levels 1, 2, 3 (10 rounds per level)
 * - Single "Count Again" button and "Count With Me" visual guidance
 * - Seamless integration with the Tenali header Activities dropdown
 */

(function () {
  'use strict';

  // --- Coordinated Activity 2 Flower Palettes (Bright, Child-Friendly, Varied) ---
  // Rotates across 12 distinct, high-contrast, preschool-friendly floral themes.
  // Within any round: First Flower, Second Flower, Answer Box individual flowers,
  // Grand Merged Flower, and Answer Option Buttons all share the exact same coordinated color theme.
  // Automatically advances to a fresh, attractive theme with every new round.
  const ACTIVITY2_PALETTES = [
    { name: 'Daisy White & Golden Sun', petal: '#ffffff', petalDark: '#f59e0b', center: '#fec84b', centerBorder: '#e07a16', numberColor: '#1e293b', isWhite: true },
    { name: 'Sky Azure Blossom', petal: '#38bdf8', petalDark: '#0284c7', center: '#fef08a', centerBorder: '#eab308', numberColor: '#1e293b', isWhite: false },
    { name: 'Coral Rose Blossom', petal: '#fb7185', petalDark: '#e11d48', center: '#fef9c3', centerBorder: '#f59e0b', numberColor: '#1e293b', isWhite: false },
    { name: 'Royal Violet Blossom', petal: '#a855f7', petalDark: '#7e22ce', center: '#ffd54f', centerBorder: '#f59e0b', numberColor: '#1e293b', isWhite: false },
    { name: 'Sunny Tangerine Blossom', petal: '#fb923c', petalDark: '#ea580c', center: '#fffbeb', centerBorder: '#d97706', numberColor: '#1e293b', isWhite: false },
    { name: 'Bubblegum Pink Blossom', petal: '#f472b6', petalDark: '#db2777', center: '#fff176', centerBorder: '#f59e0b', numberColor: '#1e293b', isWhite: false },
    { name: 'Ocean Teal Blossom', petal: '#2dd4bf', petalDark: '#0d9488', center: '#fef9c3', centerBorder: '#f59e0b', numberColor: '#1e293b', isWhite: false },
    { name: 'Golden Sunflower Blossom', petal: '#facc15', petalDark: '#ca8a04', center: '#ea580c', centerBorder: '#c2410c', numberColor: '#ffffff', isWhite: false },
    { name: 'Indigo Orchid Blossom', petal: '#818cf8', petalDark: '#4f46e5', center: '#ffd54f', centerBorder: '#f59e0b', numberColor: '#1e293b', isWhite: false },
    { name: 'Ruby Cherry Blossom', petal: '#f87171', petalDark: '#dc2626', center: '#fef08a', centerBorder: '#f59e0b', numberColor: '#1e293b', isWhite: false },
    { name: 'Fresh Mint Blossom', petal: '#22d3ee', petalDark: '#0891b2', center: '#fef08a', centerBorder: '#eab308', numberColor: '#1e293b', isWhite: false },
    { name: 'Lavender Lilac Blossom', petal: '#c084fc', petalDark: '#9333ea', center: '#fef9c3', centerBorder: '#f59e0b', numberColor: '#1e293b', isWhite: false }
  ];

  // --- Storage Keys for Reliable Persistence ---
  const STORAGE_KEY_ACTIVITY = 'tenali_active_activity';
  const STORAGE_KEY_PROGRESS = 'tenali_flower_merge_progress_v2';

  function safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSetItem(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {}
  }

  function safeRemoveItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  // --- Activity 2 State ---
  const mergeState = {
    level: 1, // 1: totals up to 4, 2: totals up to 6, 3: totals up to 9
    currentQuestion: null,
    selectedAnswer: null,
    isAnswered: false,
    starsEarned: 0,
    maxStars: 10,
    currentStreak: 0,
    paletteIndex: 0,
    stage: 'counting_addends', // 'counting_addends' -> 'counting_total' -> 'merging' -> 'total_announced' -> 'answer'
    flower1Taps: 0,
    flower2Taps: 0,
    flower1Counted: false,
    flower2Counted: false,
    totalCounted: 0,
    hasMerged: false,
    isHintActive: false,
    hintInterval: null,
    hasAnnouncedTotal: false,
    isAnswerSelectionEnabled: false,
    announcementTimer: null,
    nextQuestionTimer: null,
    staggerTimers: []
  };

  // Active activity tracker: 'activity1' or 'activity2'
  if (!window.TenaliActiveActivity) {
    window.TenaliActiveActivity = 'activity1';
  }
  window.TenaliResetActivity2RoundCounting = resetMergeRoundCounting;
  window.TenaliMergeState = mergeState;

  // =========================================================================
  // ZERO-DEPENDENCY WEB AUDIO SYNTHESIZER
  // =========================================================================
  class Activity2SoundEngine {
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

    isSoundOn() {
      // Respect global voice/sound toggle button
      const voiceStatus = document.getElementById('teacher-voice-status');
      const text = voiceStatus && voiceStatus.textContent ? voiceStatus.textContent.trim().toUpperCase() : 'ON';
      return text !== 'OFF';
    }

    playPop(index = 1) {
      if (!this.isSoundOn()) return;
      this.init();
      if (!this.ctx) return;

      const baseFreq = 340 + (index * 45);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.55, this.ctx.currentTime + 0.11);

      gain.gain.setValueAtTime(0.24, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    }

    playMergeChime() {
      if (!this.isSoundOn()) return;
      this.init();
      if (!this.ctx) return;

      // Magical shimmer chord: C5, E5, G5, B5, C6
      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + (idx * 0.08);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.58);
      });
    }

    playSuccessFanfare() {
      if (!this.isSoundOn()) return;
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + (i * 0.09);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.22, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.34);
      });
    }

    playTryAgain() {
      if (!this.isSoundOn()) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    }
  }

  const mergeAudio = new Activity2SoundEngine();

  // =========================================================================
  // TEACHER VOICE ENGINE (Indian Preschool Teacher Cadence)
  // =========================================================================
  class Activity2TeacherVoice {
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
      if (!('speechSynthesis' in window)) return null;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      return this.selectVoice(voices);
    }

    selectVoice(voices) {
      if (this.isGoogleChrome()) {
        this.selectedVoice = this.selectExistingChromeVoice(voices);
      } else {
        this.selectedVoice = this.selectCrossBrowserVoice(voices);
      }
      this.isVoiceReady = !!this.selectedVoice;
      return this.selectedVoice;
    }

    // Exact existing Chrome voice selection logic preserved strictly
    selectExistingChromeVoice(voices) {
      if (!voices || voices.length === 0) return null;

      const isMale = (name) => {
        const n = name.toLowerCase();
        return n.includes('david') || n.includes('mark') || n.includes('george') ||
               n.includes('ravi') || n.includes('male') || n.includes('guy') || n.includes('james');
      };

      // 1. Indian English Female
      let best = voices.find(v => {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        const isInd = lang.includes('en-in') || lang.includes('en_in') || name.includes('india');
        return isInd && !isMale(name);
      });

      // 2. Any Indian English
      if (!best) {
        best = voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          return lang.includes('en-in') || lang.includes('en_in') || name.includes('india');
        });
      }

      // 3. Any English Female
      if (!best) {
        best = voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          return lang.startsWith('en') && !isMale(name);
        });
      }

      // 4. Fallback
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

    isVoiceOn() {
      const voiceStatus = document.getElementById('teacher-voice-status');
      const text = voiceStatus && voiceStatus.textContent ? voiceStatus.textContent.trim().toUpperCase() : 'ON';
      return text !== 'OFF';
    }

    getWord(n) {
      const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      return words[n] || String(n);
    }

    cancel() {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          // ignore
        }
      }
      this.activeUtterance = null;
    }

    speak(text, onEnd) {
      if (!this.isVoiceOn() || !('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        this.ensureVoice();
        const UtteranceClass = window.SpeechSynthesisUtterance || SpeechSynthesisUtterance;
        const utterance = new UtteranceClass(text);
        this.activeUtterance = utterance;

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }

        const isIndian = this.selectedVoice && (
          (this.selectedVoice.lang || '').toLowerCase().includes('in') ||
          (this.selectedVoice.name || '').toLowerCase().includes('india')
        );

        utterance.lang = isIndian ? (this.selectedVoice.lang || 'en-IN') : (this.selectedVoice ? this.selectedVoice.lang : 'en-IN');
        utterance.rate = 0.83; // slightly slow, caring preschool cadence
        utterance.pitch = 1.08; // gentle, warm pitch
        utterance.volume = 1.0;

        let called = false;
        const cleanup = () => {
          if (called) return;
          called = true;
          this.activeUtterance = null;
          if (onEnd) onEnd();
        };

        utterance.onend = cleanup;
        utterance.onerror = () => cleanup();

        // Safety fallback timer so speech callback always resolves even if speech engine stalls
        setTimeout(cleanup, 4500);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Teacher voice synthesis error in Activity 2:', e);
        if (onEnd) onEnd();
      }
    }

    countFlower(n) {
      const word = this.getWord(n);
      const cap = word.charAt(0).toUpperCase() + word.slice(1);
      this.speak(`${cap}!`);
    }

    announceTotal(total, onEnd) {
      const wAns = this.getWord(total);
      const noun = total === 1 ? 'flower' : 'flowers';
      const text = `We have ${wAns} ${noun} in total.`;
      this.speak(text, onEnd);
    }

    celebrateCorrect(num1, num2, total) {
      if (total === undefined && mergeState.currentQuestion) {
        total = mergeState.currentQuestion.answer;
        num1 = mergeState.currentQuestion.num1;
        num2 = mergeState.currentQuestion.num2;
      }
      const w1 = this.getWord(num1);
      const cap1 = w1.charAt(0).toUpperCase() + w1.slice(1);
      const w2 = this.getWord(num2);
      const wAns = this.getWord(total);
      const text = `Excellent! ${cap1} plus ${w2} is ${wAns}. Good job!`;
      this.speak(text);
    }

    encourageTryAgain() {
      this.speak("That's okay, little one! Let's count and add the flowers together.");
    }

    readQuestion(num1, num2) {
      const w1 = this.getWord(num1);
      const cap1 = w1.charAt(0).toUpperCase() + w1.slice(1);
      const w2 = this.getWord(num2);
      this.speak(`${cap1} plus ${w2}.`);
    }

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

  const mergeTeacherVoice = new Activity2TeacherVoice();

  // =========================================================================
  // QUESTION GENERATOR FOR ACTIVITY 2
  // 10 rounds per level, addends >= 1, sum <= level max (4, 6, 9)
  // =========================================================================
  class Activity2Scheduler {
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
        { pair: [A[0], A[1]] },
        { pair: [B[0], B[1]] },
        { pair: [C[0], C[1]] },
        { pair: [A[0], A[1]] },
        { pair: [B[0], B[1]] },
        { pair: [C[0], C[1]] }
      );
    }

    getNextPair(level) {
      if (this.currentLevel !== level) {
        this.initQueue(level);
      }
      if (this.queue.length === 0) {
        this.fillQueue(level);
      }
      return this.queue.shift().pair;
    }
  }

  const mergeScheduler = new Activity2Scheduler();

  function generateMergeQuestion(level = mergeState.level) {
    const [num1, num2] = mergeScheduler.getNextPair(level);
    const answer = num1 + num2;

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
  // SVG FLOWER BUILDERS FOR ACTIVITY 2 (Distinctive Daisy Identity & Coordinated Palettes)
  // Inspired by the soft, friendly cartoon reference image:
  // - Broad, soft, rounded petals arranged evenly around the circular centre
  // - Prominent circular centre with contrasting border and inner highlight rim
  // - Smooth, clean, solid petal fill with NO lines, strokes, veins, spokes, or markings inside petals
  // - Polished cartoon sticker depth with soft drop-shadow
  // - Dynamic round-by-round palette coordination across all flowers in the round
  // =========================================================================

  /**
   * Helper: Applies flower container background according to current round palette.
   * Special requirement: When petals are white, use warm yellow / soft golden-yellow
   * background inside flower containers so white petals never blend into pale green.
   */
  function applyActivity2FlowerTheme(palette) {
    const card = document.getElementById('flower-merge-activity-container');
    const box1 = document.getElementById('merge-flower-1-box');
    const box2 = document.getElementById('merge-flower-2-box');
    const resBox = document.getElementById('merge-answer-box');

    const isWhite = Boolean(palette && (palette.isWhite || (palette.petal && palette.petal.toLowerCase() === '#ffffff')));

    if (card) {
      if (isWhite) {
        card.classList.add('white-flower-theme');
      } else {
        card.classList.remove('white-flower-theme');
      }
    }

    if (box1) {
      if (isWhite) {
        box1.style.backgroundColor = '#fef3c7';
        box1.style.borderColor = '#f59e0b';
      } else {
        box1.style.backgroundColor = '';
        box1.style.borderColor = '';
      }
    }

    if (box2) {
      if (isWhite) {
        box2.style.backgroundColor = '#fef3c7';
        box2.style.borderColor = '#f59e0b';
      } else {
        box2.style.backgroundColor = '';
        box2.style.borderColor = '';
      }
    }

    if (resBox) {
      if (isWhite) {
        resBox.style.backgroundColor = '#fef3c7';
        resBox.style.borderColor = '#f59e0b';
      } else {
        resBox.style.backgroundColor = '';
        resBox.style.borderColor = '';
      }
    }
  }

  /**
   * First Flower and Second Flower Builder (Addend Flowers):
   * Symmetrical 8 broad rounded petals radiating around a prominent circular centre.
   * Bold, clear, perfectly centered number with high contrast.
   */
  function createAddendFlowerSVG({
    num = 1,
    size = 135,
    petalColor = '#ffffff',
    petalDark = '#f59e0b',
    centerColor = '#fec84b',
    centerBorder = '#e07a16',
    numberColor = null
  } = {}) {
    const cx = 50.0;
    const cy = 50.0;
    const centerR = 21.5;
    const numPetals = 8;
    const angleStep = 45;
    const numFill = numberColor || (centerColor.toLowerCase() === '#ea580c' ? '#ffffff' : '#1e293b');
    const effectivePetalDark = (petalColor && (petalColor.toLowerCase() === '#ffffff' || petalColor.toLowerCase() === '#fff')) ? '#f59e0b' : petalDark;

    let petalsHTML = '';
    for (let i = 0; i < numPetals; i++) {
      const rot = i * angleStep;
      petalsHTML += `
        <g transform="rotate(${rot} ${cx} ${cy})">
          <path d="M 43 50 L 40.5 17.5 C 40.5 6.2, 59.5 6.2, 59.5 17.5 L 57 50 Z" 
                class="flower-petal-lobe" 
                fill="${petalColor}" 
                stroke="${effectivePetalDark}" 
                stroke-width="2.6" 
                stroke-linejoin="round" 
                stroke-linecap="round" 
                style="fill: ${petalColor}; stroke: ${effectivePetalDark};" />
        </g>\n`;
    }

    return `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" class="merge-flower-svg" aria-label="Flower representing addend ${num}" style="overflow: visible; filter: drop-shadow(0 5px 10px rgba(71, 85, 105, 0.22));">
        <!-- Broad, soft, rounded petals with coordinated outline -->
        <g class="flower-petals-ring">
          ${petalsHTML}
        </g>
        <!-- Soft contact shadow under center circle -->
        <circle cx="${cx}" cy="${cy + 1.2}" r="${centerR}" fill="rgba(0, 0, 0, 0.12)" />
        <!-- Prominent circular centre with coordinated border -->
        <circle cx="${cx}" cy="${cy}" r="${centerR}" class="flower-center-circle" fill="${centerColor}" stroke="${centerBorder}" stroke-width="3.2" style="fill: ${centerColor}; stroke: ${centerBorder};" />
        <!-- Subtle inner highlight rim for a polished cartoon appearance -->
        <circle cx="${cx}" cy="${cy}" r="${centerR - 2.5}" fill="none" stroke="rgba(255, 255, 255, 0.40)" stroke-width="1.2" />
        <!-- Clear, bold, centered number -->
        <text x="${cx}" y="${cy}" 
              text-anchor="middle" 
              dominant-baseline="central" 
              font-family="'Fredoka', 'Nunito', sans-serif" 
              font-weight="900" 
              font-size="28" 
              fill="${numFill}" 
              class="flower-center-digit" 
              style="fill: ${numFill}; pointer-events: none; user-select: none;">${num}</text>
      </svg>
    `;
  }

  /**
   * Standard Flower Token Builder (for Answer Box individual flowers):
   * Symmetrical 8 rounded petals matching the current round flower theme.
   * Numbers 1, 2, 3... are revealed in the centre upon child tapping.
   */
  function createStandardFlowerSVG({
    number = null,
    size = 64,
    petalColor = '#ffffff',
    petalDark = '#f59e0b',
    centerColor = '#fec84b',
    centerBorder = '#e07a16',
    numberColor = null,
    hideNumber = false
  } = {}) {
    const cx = 50.0;
    const cy = 50.0;
    const centerR = 20.0;
    const numPetals = 8;
    const angleStep = 45;
    const numFill = numberColor || (centerColor.toLowerCase() === '#ea580c' ? '#ffffff' : '#1e293b');
    const effectivePetalDark = (petalColor && (petalColor.toLowerCase() === '#ffffff' || petalColor.toLowerCase() === '#fff')) ? '#f59e0b' : petalDark;

    let petalsHTML = '';
    for (let i = 0; i < numPetals; i++) {
      const rot = i * angleStep;
      petalsHTML += `
        <g transform="rotate(${rot} ${cx} ${cy})">
          <path d="M 43 50 L 40.5 17.5 C 40.5 6.2, 59.5 6.2, 59.5 17.5 L 57 50 Z" 
                class="flower-petal-lobe" 
                fill="${petalColor}" 
                stroke="${effectivePetalDark}" 
                stroke-width="2.3" 
                stroke-linejoin="round" 
                stroke-linecap="round" 
                style="fill: ${petalColor}; stroke: ${effectivePetalDark};" />
        </g>\n`;
    }

    const digitClass = hideNumber ? 'flower-digit-text hidden-digit' : 'flower-digit-text revealed';
    const displayNum = (number !== null && number !== undefined) ? number : '';

    return `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" class="flower-svg" aria-hidden="true" style="overflow: visible; filter: drop-shadow(0 3px 6px rgba(71, 85, 105, 0.20));">
        <g class="flower-petals-ring">
          ${petalsHTML}
        </g>
        <circle cx="${cx}" cy="${cy + 1}" r="${centerR}" fill="rgba(0, 0, 0, 0.10)" />
        <circle cx="${cx}" cy="${cy}" r="${centerR}" class="flower-center-circle flower-center-disk" fill="${centerColor}" stroke="${centerBorder}" stroke-width="2.8" style="fill: ${centerColor}; stroke: ${centerBorder};" />
        <circle cx="${cx}" cy="${cy}" r="${centerR - 2.2}" fill="none" stroke="rgba(255, 255, 255, 0.40)" stroke-width="1.0" />
        <text x="${cx}" y="${cy}" 
              text-anchor="middle" 
              dominant-baseline="central" 
              font-family="'Fredoka', 'Nunito', sans-serif" 
              font-weight="900" 
              font-size="22" 
              fill="${numFill}" 
              class="${digitClass}" 
              style="fill: ${numFill}; user-select: none;">${displayNum}</text>
      </svg>
    `;
  }

  /**
   * Dedicated SVG Generator for the 3 Multiple-Choice Answer Option Flowers:
   * Coordinated with the current round's flower theme:
   * - Petals: Uses current round's petalColor and petalDark outline
   * - Centre: Uses current round's centerColor and centerBorder outline
   * - Number: Centred, bold (font-weight: 900), high-contrast readable color
   * - Shape: Symmetrical 8 rounded petals
   * - Sizing: Preserved at 86px (desktop) / 76px (tablet) / 68px (mobile)
   */
  function createAnswerFlowerSVG({
    number = null,
    size = 86,
    petalColor = '#ffffff',
    petalDark = '#f59e0b',
    centerColor = '#fec84b',
    centerBorder = '#e07a16',
    numberColor = null
  } = {}) {
    const cx = 50.0;
    const cy = 50.0;
    const centerR = 21.0;
    const numPetals = 8;
    const angleStep = 45;
    const numFill = numberColor || (centerColor.toLowerCase() === '#ea580c' ? '#ffffff' : '#1e293b');
    const effectivePetalDark = (petalColor && (petalColor.toLowerCase() === '#ffffff' || petalColor.toLowerCase() === '#fff')) ? '#f59e0b' : petalDark;

    let petalsHTML = '';
    for (let i = 0; i < numPetals; i++) {
      const rot = i * angleStep;
      petalsHTML += `
        <g transform="rotate(${rot} ${cx} ${cy})">
          <path d="M 43 50 L 40.5 17.5 C 40.5 6.2, 59.5 6.2, 59.5 17.5 L 57 50 Z" 
                class="answer-flower-petal" 
                fill="${petalColor}" 
                stroke="${effectivePetalDark}" 
                stroke-width="2.4" 
                stroke-linejoin="round" 
                stroke-linecap="round" 
                style="fill: ${petalColor}; stroke: ${effectivePetalDark};" />
        </g>\n`;
    }

    const displayNum = (number !== null && number !== undefined) ? number : '';

    return `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" class="flower-svg answer-flower-svg" aria-hidden="true" style="width: 100%; height: 100%; display: block; overflow: visible; filter: drop-shadow(0 4px 8px rgba(71, 85, 105, 0.20));">
        <g class="flower-petals-ring">
          ${petalsHTML}
        </g>
        <circle cx="${cx}" cy="${cy + 1}" r="${centerR}" fill="rgba(0, 0, 0, 0.10)" />
        <circle cx="${cx}" cy="${cy}" r="${centerR}" class="flower-center-circle answer-flower-center" fill="${centerColor}" stroke="${centerBorder}" stroke-width="3.0" style="fill: ${centerColor}; stroke: ${centerBorder};" />
        <circle cx="${cx}" cy="${cy}" r="${centerR - 2.5}" fill="none" stroke="rgba(255, 255, 255, 0.40)" stroke-width="1.2" />
        <text x="${cx}" y="51" 
              text-anchor="middle" 
              dominant-baseline="central" 
              class="answer-flower-digit-text"
              fill="${numFill}"
              style="fill: ${numFill}; font-family: 'Fredoka', 'Quicksand', 'Nunito', sans-serif; font-size: 26px; font-weight: 900; user-select: none;">
          ${displayNum}
        </text>
      </svg>
    `;
  }

  /**
   * Grand Merged Flower Builder:
   * Symmetrical grand flower displaying the combined total perfectly centered inside.
   * 10 broad rounded petals radiating around the prominent circular centre.
   */
  function createGrandMergedFlowerSVG({
    total = 3,
    size = 116,
    petalColor = '#ffffff',
    petalDark = '#f59e0b',
    centerColor = '#fec84b',
    centerBorder = '#e07a16',
    numberColor = null
  } = {}) {
    const cx = 50.0;
    const cy = 50.0;
    const centerR = 23.5;
    const numPetals = 10;
    const angleStep = 36;
    const numFill = numberColor || (centerColor.toLowerCase() === '#ea580c' ? '#ffffff' : '#1e293b');
    const effectivePetalDark = (petalColor && (petalColor.toLowerCase() === '#ffffff' || petalColor.toLowerCase() === '#fff')) ? '#f59e0b' : petalDark;

    let petalsHTML = '';
    for (let i = 0; i < numPetals; i++) {
      const rot = i * angleStep;
      petalsHTML += `
        <g transform="rotate(${rot} ${cx} ${cy})">
          <path d="M 43.5 50 L 41.2 17.5 C 41.2 6.5, 58.8 6.5, 58.8 17.5 L 56.5 50 Z" 
                class="flower-petal-lobe" 
                fill="${petalColor}" 
                stroke="${effectivePetalDark}" 
                stroke-width="2.6" 
                stroke-linejoin="round" 
                stroke-linecap="round" 
                style="fill: ${petalColor}; stroke: ${effectivePetalDark};" />
        </g>\n`;
    }

    return `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" class="grand-flower-svg" aria-label="Grand merged flower showing total ${total}" style="overflow: visible; filter: drop-shadow(0 6px 14px rgba(71, 85, 105, 0.25));">
        <g class="grand-petals-ring">
          ${petalsHTML}
        </g>
        <circle cx="${cx}" cy="${cy + 1.2}" r="${centerR}" fill="rgba(0, 0, 0, 0.12)" />
        <circle cx="${cx}" cy="${cy}" r="${centerR}" class="flower-center-circle" fill="${centerColor}" stroke="${centerBorder}" stroke-width="3.4" style="fill: ${centerColor}; stroke: ${centerBorder};" />
        <circle cx="${cx}" cy="${cy}" r="${centerR - 2.5}" fill="none" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.3" />
        <text x="${cx}" y="${cy}" 
              text-anchor="middle" 
              dominant-baseline="central" 
              font-family="'Fredoka', 'Nunito', sans-serif" 
              font-weight="900" 
              font-size="32" 
              fill="${numFill}" 
              style="fill: ${numFill}; user-select: none;">${total}</text>
      </svg>
    `;
  }

  // =========================================================================
  // ACTIVITY 2 CONTROLLER LOGIC
  // =========================================================================

  let hintStepTimeout = null;
  let hintTimeouts = [];

  function clearHintTimeouts() {
    hintTimeouts.forEach(t => clearTimeout(t));
    hintTimeouts = [];
    if (hintStepTimeout) {
      clearTimeout(hintStepTimeout);
      hintStepTimeout = null;
    }
  }

  function setHintTimeout(fn, delay) {
    if (!mergeState.isHintActive) return null;
    const tId = setTimeout(() => {
      hintTimeouts = hintTimeouts.filter(id => id !== tId);
      if (!mergeState.isHintActive) return;
      fn();
    }, delay);
    hintTimeouts.push(tId);
    return tId;
  }

  function stopMergeCountingHint() {
    clearHintTimeouts();
    if (mergeState.hintInterval) {
      clearInterval(mergeState.hintInterval);
      mergeState.hintInterval = null;
    }
    mergeState.isHintActive = false;
    clearHintHighlights();
    resetMergeSymbolsGlow();

    const ansBox = document.getElementById('merge-answer-box');
    if (ansBox) {
      ansBox.querySelectorAll('.flower-token.highlighted').forEach(el => {
        el.classList.remove('highlighted');
      });
    }

    const hintBtn = document.getElementById('btn-merge-count-hint');
    if (hintBtn) {
      hintBtn.classList.remove('hint-active');
    }
  }

  function clearTimers() {
    stopMergeCountingHint();
    if (mergeTeacherVoice && typeof mergeTeacherVoice.cancel === 'function') {
      mergeTeacherVoice.cancel();
    }
    if (mergeState.announcementTimer) {
      clearTimeout(mergeState.announcementTimer);
      mergeState.announcementTimer = null;
    }
    if (mergeState.nextQuestionTimer) {
      clearTimeout(mergeState.nextQuestionTimer);
      mergeState.nextQuestionTimer = null;
    }
    if (mergeState.staggerTimers && mergeState.staggerTimers.length > 0) {
      mergeState.staggerTimers.forEach(t => clearTimeout(t));
      mergeState.staggerTimers = [];
    }
    mergeState.isSpawningAddend = false;
    if (mergeState.hintInterval) {
      clearInterval(mergeState.hintInterval);
      mergeState.hintInterval = null;
    }
    clearConfetti();
  }

  function resetMergeSymbolsGlow() {
    const plusElem = document.getElementById('merge-plus-symbol');
    const equalsElem = document.getElementById('merge-equals-symbol');
    if (plusElem) plusElem.classList.remove('symbol-glow', 'highlighted');
    if (equalsElem) equalsElem.classList.remove('symbol-glow', 'highlighted');
  }

  function setMergeAnswerButtonsEnabled(enabled) {
    mergeState.isAnswerSelectionEnabled = enabled;
    const container = document.getElementById('merge-flower-answer-buttons');
    if (!container) return;

    container.style.display = 'flex';
    container.style.pointerEvents = (mergeState.isAnswered || !enabled) ? 'none' : '';

    const btns = container.querySelectorAll('.flower-btn');
    btns.forEach(btn => {
      btn.disabled = !enabled && !mergeState.isAnswered;
      if (enabled) {
        btn.classList.remove('disabled');
        btn.classList.add('unlocked');
        setTimeout(() => btn.classList.remove('unlocked'), 600);
      } else if (!mergeState.isAnswered) {
        btn.classList.add('disabled');
        btn.classList.remove('unlocked');
      }
    });
  }

  let hintHighlightTimeout = null;

  function clearHintHighlights() {
    if (hintHighlightTimeout) {
      clearTimeout(hintHighlightTimeout);
      hintHighlightTimeout = null;
    }
    const box1 = document.getElementById('merge-flower-1-box');
    const box2 = document.getElementById('merge-flower-2-box');
    const ansBox = document.getElementById('merge-answer-box');
    const ansContainer = document.getElementById('merge-flower-answer-buttons');
    const nextBtn = document.getElementById('merge-next-btn');

    if (box1) box1.classList.remove('box-attention', 'hint-target-glow');
    if (box2) box2.classList.remove('box-attention', 'hint-target-glow');
    if (ansBox) {
      ansBox.querySelectorAll('.flower-token').forEach(fl => fl.classList.remove('flower-attention'));
    }
    if (ansContainer) ansContainer.classList.remove('hint-target-glow');
    if (nextBtn) nextBtn.classList.remove('hint-target-glow');
  }

  function saveMergeProgress() {
    if (!mergeState.currentQuestion) return;
    const data = {
      level: mergeState.level,
      starsEarned: mergeState.starsEarned,
      currentStreak: mergeState.currentStreak,
      paletteIndex: mergeState.paletteIndex,
      currentQuestion: mergeState.currentQuestion
    };
    safeSetItem(STORAGE_KEY_PROGRESS, JSON.stringify(data));
  }

  function restoreMergeProgress() {
    const raw = safeGetItem(STORAGE_KEY_PROGRESS);
    if (!raw) return false;

    try {
      const saved = JSON.parse(raw);
      if (!saved || !saved.currentQuestion || !saved.currentQuestion.answer) {
        return false;
      }

      mergeState.level = saved.level || 1;
      mergeScheduler.initQueue(mergeState.level);
      mergeState.starsEarned = typeof saved.starsEarned === 'number' ? saved.starsEarned : 0;
      mergeState.currentStreak = typeof saved.currentStreak === 'number' ? saved.currentStreak : 0;
      mergeState.paletteIndex = typeof saved.paletteIndex === 'number' ? saved.paletteIndex : 0;
      mergeState.currentQuestion = saved.currentQuestion;

      // Reset all temporary counting & Answer Box states so Answer Box starts completely empty
      mergeState.flower1Taps = 0;
      mergeState.flower2Taps = 0;
      mergeState.flower1Counted = false;
      mergeState.flower2Counted = false;
      mergeState.totalCounted = 0;
      mergeState.hasMerged = false;
      mergeState.hasAnnouncedTotal = false;
      mergeState.isAnswerSelectionEnabled = false;
      mergeState.isAnswered = false;
      mergeState.selectedAnswer = null;
      mergeState.stage = 'counting_addends';

      renderMergeQuestion();
      saveMergeProgress();
      return true;
    } catch (e) {
      console.warn('Failed to restore Activity 2 progress:', e);
      return false;
    }
  }

  /**
   * Helper to render individual flowers in First Group and Second Group.
   * Displays the exact number of individual flowers represented by each addend.
   * Each individual flower displays its own counting number in the centre (1, 2, ... sequentially).
   */
  function renderAddendGroupFlowers(boxEl, count, palette) {
    if (!boxEl) return;
    boxEl.innerHTML = '';

    // Prominent, consistent flower size (68-70px, ~12% reduction) for clear preschool visual counting
    const sizeClass = 'size-lg';
    const pixelSize = 68;

    for (let i = 1; i <= count; i++) {
      const flowerDiv = document.createElement('div');
      flowerDiv.className = `flower-token ${sizeClass} addend-flower-token`;
      flowerDiv.dataset.number = String(i);
      flowerDiv.dataset.box = boxEl.id;
      flowerDiv.title = `Flower ${i}`;
      flowerDiv.innerHTML = createStandardFlowerSVG({
        number: i,
        size: pixelSize,
        petalColor: palette.petal,
        petalDark: palette.petalDark,
        centerColor: palette.center,
        centerBorder: palette.centerBorder,
        numberColor: palette.numberColor,
        hideNumber: false
      });

      flowerDiv.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        if (boxEl.id === 'merge-flower-1-box') {
          handleFlower1Tap();
        } else {
          handleFlower2Tap();
        }
      });

      boxEl.appendChild(flowerDiv);
    }
  }

  function renderRestoredMergeQuestion() {
    renderMergeQuestion();
  }

  /**
   * Renders the current Activity 2 round:
   * 1. Displays First Flower with addend num1 in center (clean flower, zero petal numbers)
   * 2. Displays Second Flower with addend num2 in center (clean flower, zero petal numbers)
   * 3. Clears Answer Box (starts completely empty until BOTH original groups are counted)
   * 4. Renders 3 flower answer buttons (disabled)
   */
  function renderMergeQuestion() {
    clearTimers();
    clearConfetti();
    clearHintHighlights();
    resetMergeSymbolsGlow();

    mergeState.isAnswered = false;
    mergeState.selectedAnswer = null;
    mergeState.isHintActive = false;
    mergeState.stage = 'counting_addends';
    mergeState.flower1Taps = 0;
    mergeState.flower2Taps = 0;
    mergeState.flower1Counted = false;
    mergeState.flower2Counted = false;
    mergeState.totalCounted = 0;
    mergeState.hasMerged = false;
    mergeState.hasAnnouncedTotal = false;
    mergeState.isAnswerSelectionEnabled = false;

    const q = mergeState.currentQuestion;
    if (!q) return;

    const palette = ACTIVITY2_PALETTES[mergeState.paletteIndex % ACTIVITY2_PALETTES.length];
    applyActivity2FlowerTheme(palette);

    // 1. Render First Flower Box (First Addend)
    const box1 = document.getElementById('merge-flower-1-box');
    const cont1 = document.getElementById('merge-container-1');
    if (box1) {
      box1.className = 'flower-group-box merge-flower-host';
      renderAddendGroupFlowers(box1, q.num1, palette);
      box1.onclick = (e) => {
        if (e) e.stopPropagation();
        handleFlower1Tap();
      };
    }
    if (cont1) {
      cont1.onclick = () => handleFlower1Tap();
    }

    // 2. Render Second Flower Box (Second Addend)
    const box2 = document.getElementById('merge-flower-2-box');
    const cont2 = document.getElementById('merge-container-2');
    if (box2) {
      box2.className = 'flower-group-box merge-flower-host';
      renderAddendGroupFlowers(box2, q.num2, palette);
      box2.onclick = (e) => {
        if (e) e.stopPropagation();
        handleFlower2Tap();
      };
    }
    if (cont2) {
      cont2.onclick = () => handleFlower2Tap();
    }

    // 3. Answer Box starts completely EMPTY
    const resBox = document.getElementById('merge-answer-box');
    if (resBox) {
      resBox.className = 'flower-group-box flower-combined-group-box merge-answer-box';
      resBox.innerHTML = '';
    }

    // 4. Render Three Flower Answer Option Buttons (Faded & semi-transparent until merge & voice complete)
    const answerContainer = document.getElementById('merge-flower-answer-buttons');
    if (answerContainer) {
      answerContainer.style.display = 'flex';
      answerContainer.style.pointerEvents = 'none';
      answerContainer.innerHTML = '';
      q.options.forEach((val) => {
        const btn = document.createElement('button');
        btn.className = 'flower-btn disabled';
        btn.disabled = true;
        btn.dataset.value = String(val);
        btn.setAttribute('aria-label', `Flower option ${val}`);

        btn.innerHTML = createAnswerFlowerSVG({
          number: val,
          size: 86,
          petalColor: palette.petal,
          petalDark: palette.petalDark,
          centerColor: palette.center,
          centerBorder: palette.centerBorder
        });

        btn.addEventListener('click', (e) => {
          handleMergeAnswerSelect(val, btn, e);
        });

        answerContainer.appendChild(btn);
      });
    }

    // 5. Reset Feedback Ribbon
    const feedbackRibbon = document.getElementById('merge-feedback-ribbon');
    if (feedbackRibbon) {
      feedbackRibbon.innerHTML = '';
    }

    // 6. Update Level & Progress Track if Activity 2 is visible
    if (window.TenaliActiveActivity === 'activity2') {
      updateMergeLevelBadge();
      updateMergeProgressStars();
    }

    saveMergeProgress();
  }

  window.TenaliRenderMergeQuestion = renderMergeQuestion;

  /**
   * Spawns exactly one individual flower into the Answer Box.
   * If countNumber is provided, displays the sequential counting number in the centre.
   */
  function spawnAnswerBoxFlower(countNumber = null) {
    const q = mergeState.currentQuestion;
    if (!q) return null;

    const resBox = document.getElementById('merge-answer-box');
    if (!resBox) return null;

    const existingCount = resBox.querySelectorAll('.flower-token').length;
    if (existingCount >= q.answer) return null;

    const palette = ACTIVITY2_PALETTES[mergeState.paletteIndex % ACTIVITY2_PALETTES.length];

    // Prominent, consistent flower size (68-70px, ~12% reduction) for clear preschool visual counting
    const flowerSizeClass = 'size-lg';
    const pixelSize = 68;

    const hasNumber = (countNumber !== undefined && countNumber !== null && countNumber !== '');
    const flowerToken = document.createElement('div');
    flowerToken.className = `flower-token ${flowerSizeClass} ${hasNumber ? 'counted' : 'uncounted'} spawn-reveal`;
    flowerToken.dataset.box = 'merge-answer-box';
    flowerToken.dataset.counted = hasNumber ? 'true' : 'false';
    flowerToken.dataset.countOrder = hasNumber ? String(countNumber) : '';
    flowerToken.dataset.index = String(existingCount);

    flowerToken.innerHTML = createStandardFlowerSVG({
      number: hasNumber ? countNumber : '',
      size: pixelSize,
      petalColor: palette.petal,
      petalDark: palette.petalDark,
      centerColor: palette.center,
      centerBorder: palette.centerBorder,
      hideNumber: !hasNumber // unnumbered yellow centre if no number provided
    });

    flowerToken.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAnswerBoxFlowerTap(flowerToken);
    });

    resBox.appendChild(flowerToken);
    return flowerToken;
  }

  /**
   * Child taps First Flower:
   * 1. Teacher clearly speaks the number of this group (e.g. "One.", "Two.", "Three.").
   * 2. After the voice finishes, wait approximately 1 second.
   * 3. Automatically reveals all q.num1 individual flowers sequentially into the Answer Box
   *    one after another with smooth, gentle animation and pop sounds.
   * Can be tapped first or second.
   */
  function handleFlower1Tap() {
    if (mergeState.isAnswered || mergeState.isHintActive || mergeState.isSpawningAddend) return;

    const q = mergeState.currentQuestion;
    if (!q) return;

    const box1 = document.getElementById('merge-flower-1-box');

    // If Flower 1 already counted completely: bounce & pop only, do not recount or reveal extra flowers
    if (mergeState.flower1Counted || (mergeState.flower1Taps || 0) >= q.num1) {
      if (box1) {
        box1.classList.remove('tapped');
        void box1.offsetWidth;
        box1.classList.add('tapped');
      }
      mergeAudio.playPop(q.num1);
      return;
    }

    mergeAudio.init();

    if (box1) {
      box1.classList.remove('tapped');
      void box1.offsetWidth;
      box1.classList.add('tapped');
    }

    // Lock to prevent concurrent taps during sequential reveal
    mergeState.isSpawningAddend = true;
    if (!mergeState.staggerTimers) mergeState.staggerTimers = [];

    const totalToSpawn = q.num1;
    let currentCount = mergeState.flower1Taps || 0;

    // 1. Teacher speaks the quantity of this flower: "One." / "Two." / "Three." etc.
    const word = mergeTeacherVoice.getWord(q.num1);
    const spokenWord = word.charAt(0).toUpperCase() + word.slice(1) + '.';

    mergeTeacherVoice.speak(spokenWord, () => {
      // 2. After the voice finishes, wait approximately 1 second
      const pauseTimer = setTimeout(() => {
        // 3. Reveal individual flowers one after another with smooth gentle animation
        function revealNext() {
          if (currentCount < totalToSpawn) {
            currentCount++;
            mergeState.flower1Taps = currentCount;

            // Audio pop and flower reveal
            mergeAudio.playPop(currentCount);
            spawnAnswerBoxFlower();

            if (currentCount < totalToSpawn) {
              const nextTimer = setTimeout(revealNext, 450);
              mergeState.staggerTimers.push(nextTimer);
              return;
            }
          }

          // Complete group 1
          mergeState.flower1Counted = true;
          mergeState.isSpawningAddend = false;

          if (box1) {
            box1.classList.add('box-completed');
          }

          checkAddendsProgress();
        }

        revealNext();
      }, 1000);

      mergeState.staggerTimers.push(pauseTimer);
    });
  }

  /**
   * Child taps Second Flower:
   * 1. Teacher clearly speaks the number of this group (e.g. "One.", "Two.", "Three.").
   * 2. After the voice finishes, wait approximately 1 second.
   * 3. Automatically reveals all q.num2 individual flowers sequentially into the Answer Box
   *    one after another with smooth, gentle animation and pop sounds.
   * Can be tapped first or second.
   */
  function handleFlower2Tap() {
    if (mergeState.isAnswered || mergeState.isHintActive || mergeState.isSpawningAddend) return;

    const q = mergeState.currentQuestion;
    if (!q) return;

    const box2 = document.getElementById('merge-flower-2-box');

    // If Flower 2 already counted completely: bounce & pop only, do not recount or reveal extra flowers
    if (mergeState.flower2Counted || (mergeState.flower2Taps || 0) >= q.num2) {
      if (box2) {
        box2.classList.remove('tapped');
        void box2.offsetWidth;
        box2.classList.add('tapped');
      }
      mergeAudio.playPop(q.num2);
      return;
    }

    mergeAudio.init();

    if (box2) {
      box2.classList.remove('tapped');
      void box2.offsetWidth;
      box2.classList.add('tapped');
    }

    // Lock to prevent concurrent taps during sequential reveal
    mergeState.isSpawningAddend = true;
    if (!mergeState.staggerTimers) mergeState.staggerTimers = [];

    const totalToSpawn = q.num2;
    let currentCount = mergeState.flower2Taps || 0;

    // 1. Teacher speaks the quantity of this flower: "One." / "Two." / "Three." etc.
    const word = mergeTeacherVoice.getWord(q.num2);
    const spokenWord = word.charAt(0).toUpperCase() + word.slice(1) + '.';

    mergeTeacherVoice.speak(spokenWord, () => {
      // 2. After the voice finishes, wait approximately 1 second
      const pauseTimer = setTimeout(() => {
        // 3. Reveal individual flowers one after another with smooth gentle animation
        function revealNext() {
          if (currentCount < totalToSpawn) {
            currentCount++;
            mergeState.flower2Taps = currentCount;

            // Audio pop and flower reveal
            mergeAudio.playPop(currentCount);
            spawnAnswerBoxFlower();

            if (currentCount < totalToSpawn) {
              const nextTimer = setTimeout(revealNext, 450);
              mergeState.staggerTimers.push(nextTimer);
              return;
            }
          }

          // Complete group 2
          mergeState.flower2Counted = true;
          mergeState.isSpawningAddend = false;

          if (box2) {
            box2.classList.add('box-completed');
          }

          checkAddendsProgress();
        }

        revealNext();
      }, 1000);

      mergeState.staggerTimers.push(pauseTimer);
    });
  }

  /**
   * Checks whether both original flowers have been fully counted.
   */
  function checkAddendsProgress() {
    const q = mergeState.currentQuestion;
    if (!q) return;

    const f1Done = mergeState.flower1Counted || (mergeState.flower1Taps >= q.num1);
    const f2Done = mergeState.flower2Counted || (mergeState.flower2Taps >= q.num2);

    const plusElem = document.getElementById('merge-plus-symbol');
    const equalsElem = document.getElementById('merge-equals-symbol');

    if ((f1Done && !f2Done) || (f2Done && !f1Done)) {
      if (plusElem) plusElem.classList.add('symbol-glow');
      if (equalsElem) equalsElem.classList.remove('symbol-glow');
      saveMergeProgress();
      return;
    }

    if (f1Done && f2Done) {
      if (plusElem) plusElem.classList.remove('symbol-glow');
      if (equalsElem) equalsElem.classList.add('symbol-glow');

      mergeState.stage = 'counting_total';
      const resBox = document.getElementById('merge-answer-box');
      if (resBox) {
        resBox.classList.add('counting-active');
      }
      saveMergeProgress();
    } else {
      if (plusElem) plusElem.classList.remove('symbol-glow');
      if (equalsElem) equalsElem.classList.remove('symbol-glow');
      saveMergeProgress();
    }
  }

  /**
   * Stage 3 Manual Child Counting:
   * Child taps each revealed flower in the Answer Box (starts at 1)
   */
  function handleAnswerBoxFlowerTap(flowerEl) {
    if (mergeState.isAnswered || mergeState.isHintActive) return;

    if (mergeState.stage !== 'counting_total') {
      const q = mergeState.currentQuestion;
      if (q) {
        const f1Done = mergeState.flower1Counted || (mergeState.flower1Taps >= q.num1);
        const f2Done = mergeState.flower2Counted || (mergeState.flower2Taps >= q.num2);
        const targetBoxId = !f1Done ? 'merge-flower-1-box' : (!f2Done ? 'merge-flower-2-box' : null);
        if (targetBoxId) {
          const targetBox = document.getElementById(targetBoxId);
          if (targetBox) {
            targetBox.classList.remove('box-attention');
            void targetBox.offsetWidth;
            targetBox.classList.add('box-attention');
            setTimeout(() => targetBox.classList.remove('box-attention'), 500);
          }
        }
      }
      return;
    }

    // Duplicate tap provides bounce only
    if (flowerEl.dataset.counted === 'true') {
      flowerEl.classList.remove('tapped');
      void flowerEl.offsetWidth;
      flowerEl.classList.add('tapped');
      const prev = parseInt(flowerEl.dataset.countOrder, 10) || 1;
      mergeAudio.playPop(prev);
      return;
    }

    const q = mergeState.currentQuestion;
    if (!q) return;

    mergeState.totalCounted++;
    const currentCount = mergeState.totalCounted;

    flowerEl.dataset.counted = 'true';
    flowerEl.dataset.countOrder = String(currentCount);
    flowerEl.classList.remove('uncounted');
    flowerEl.classList.add('counted', 'tapped');

    // Reveal count number inside sunny yellow centre
    const digitText = flowerEl.querySelector('.flower-digit-text');
    if (digitText) {
      digitText.textContent = currentCount;
      digitText.classList.remove('hidden-digit');
      digitText.classList.add('revealed');
    }

    // Audio pop and speech
    mergeAudio.playPop(currentCount);
    mergeTeacherVoice.countFlower(currentCount);

    saveMergeProgress();

    // When all total flowers have been counted: trigger flower merging animation!
    if (mergeState.totalCounted >= q.answer) {
      const equalsElem = document.getElementById('merge-equals-symbol');
      if (equalsElem) equalsElem.classList.remove('symbol-glow');

      mergeState.stage = 'merging';
      saveMergeProgress();
      triggerFlowerMergeAnimation();
    }
  }

  /**
   * Stage 4: FLOWER MERGING ANIMATION (The Crucial Feature)
   * The individual flowers in the Answer Box gently glide towards one another,
   * converge at the center, and merge into one Grand Merged Flower showing the total!
   */
  function triggerFlowerMergeAnimation() {
    const q = mergeState.currentQuestion;
    if (!q) return;

    const resBox = document.getElementById('merge-answer-box');
    if (!resBox) return;

    // Short pause so child observes all numbered flowers
    setTimeout(() => {
      const flowers = Array.from(resBox.querySelectorAll('.flower-token'));
      if (flowers.length === 0) return;

      const boxRect = resBox.getBoundingClientRect();
      const centerX = boxRect.width / 2;
      const centerY = boxRect.height / 2;

      // Animate each flower gliding into center
      flowers.forEach(flower => {
        const fRect = flower.getBoundingClientRect();
        const fCenterX = fRect.left + fRect.width / 2 - boxRect.left;
        const fCenterY = fRect.top + fRect.height / 2 - boxRect.top;
        const dx = (centerX - fCenterX).toFixed(1);
        const dy = (centerY - fCenterY).toFixed(1);

        flower.style.transition = 'transform 0.72s cubic-bezier(0.34, 1.25, 0.64, 1), opacity 0.72s ease';
        flower.style.transform = `translate(${dx}px, ${dy}px) scale(0.38)`;
        flower.style.opacity = '0.35';
      });

      // Merge point: replace with Grand Merged Flower
      setTimeout(() => {
        resBox.innerHTML = '';
        resBox.classList.remove('counting-active');
        resBox.classList.add('box-completed');

        // Play delightful magical merge chime!
        mergeAudio.playMergeChime();

        const palette = ACTIVITY2_PALETTES[mergeState.paletteIndex % ACTIVITY2_PALETTES.length];
        const grandDiv = document.createElement('div');
        grandDiv.className = 'grand-merged-flower';
        grandDiv.id = 'grand-merged-flower';
        grandDiv.innerHTML = createGrandMergedFlowerSVG({
          total: q.answer,
          size: 116,
          petalColor: palette.petal,
          petalDark: palette.petalDark,
          centerColor: palette.center,
          centerBorder: palette.centerBorder
        });

        resBox.appendChild(grandDiv);

        mergeState.hasMerged = true;
        mergeState.stage = 'total_announced';
        saveMergeProgress();

        triggerMergeTotalAnnouncement();
      }, 740);
    }, 420);
  }

  /**
   * Spoken Announcement & Answer Unlocking:
   * "We have [total] flowers in total."
   * Then answer buttons unlock.
   */
  function triggerMergeTotalAnnouncement(onComplete) {
    const q = mergeState.currentQuestion;
    if (!q) return;

    clearTimeout(mergeState.announcementTimer);
    mergeState.announcementTimer = setTimeout(() => {
      mergeTeacherVoice.announceTotal(q.answer, () => {
        setMergeAnswerButtonsEnabled(true);
        mergeState.hasAnnouncedTotal = true;
        mergeState.isAnswerSelectionEnabled = true;
        mergeState.stage = 'answer';
        saveMergeProgress();

        // Highlight matching answer button gently to invite selection, matching Activity 1
        const answerBtns = document.querySelectorAll('#merge-flower-answer-buttons .flower-btn');
        answerBtns.forEach(btn => {
          if (parseInt(btn.dataset.value, 10) === q.answer) {
            btn.style.filter = 'drop-shadow(0 0 22px rgba(245, 158, 11, 0.95))';
            setTimeout(() => {
              btn.style.filter = '';
            }, 3500);
          }
        });

        if (onComplete) onComplete();
      });
    }, 450);
  }

  /**
   * Confetti Celebration Engine for Activity 2
   * Short, colourful and joyful celebration matching Activity 1
   */
  let mergeConfettiParticles = [];
  let mergeConfettiAnimId = null;

  function triggerConfettiBurst(origin) {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;

    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    if (origin && typeof origin.getBoundingClientRect === 'function') {
      const rect = origin.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (origin && origin.clientX !== undefined) {
      x = origin.clientX;
      y = origin.clientY;
    }

    const colors = ['#f97316', '#ffd54f', '#ab47bc', '#7cb342', '#38bdf8', '#fb7185'];
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (let i = 0; i < 48; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      mergeConfettiParticles.push({
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

    if (!mergeConfettiAnimId) {
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = mergeConfettiParticles.length - 1; i >= 0; i--) {
          const p = mergeConfettiParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.22;
          p.rotation += p.rotationSpeed;
          p.opacity -= p.decay;

          if (p.opacity <= 0) {
            mergeConfettiParticles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }

        if (mergeConfettiParticles.length > 0) {
          mergeConfettiAnimId = requestAnimationFrame(render);
        } else {
          mergeConfettiAnimId = null;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      mergeConfettiAnimId = requestAnimationFrame(render);
    }
  }

  function clearConfetti() {
    if (mergeConfettiAnimId) {
      cancelAnimationFrame(mergeConfettiAnimId);
      mergeConfettiAnimId = null;
    }
    mergeConfettiParticles = [];
    const canvas = document.getElementById('confetti-canvas');
    if (canvas && typeof canvas.getContext === 'function') {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  /**
   * Answer Option Selection
   */
  function handleMergeAnswerSelect(selectedVal, btnEl, event) {
    if (mergeState.isAnswered || !mergeState.isAnswerSelectionEnabled) return;

    const q = mergeState.currentQuestion;
    if (!q) return;

    mergeAudio.init();

    mergeState.selectedAnswer = selectedVal;
    const isCorrect = selectedVal === q.answer;

    if (isCorrect) {
      mergeState.isAnswered = true;
      mergeState.isAnswerSelectionEnabled = false;

      // Prevent further clicks while keeping all three buttons visible and fully opaque
      const answerContainer = document.getElementById('merge-flower-answer-buttons');
      if (answerContainer) {
        answerContainer.querySelectorAll('.flower-btn').forEach(b => b.classList.remove('incorrect'));
        answerContainer.style.pointerEvents = 'none';
      }

      // Highlight winning button using Activity 1's feedback style
      btnEl.classList.add('correct');

      // Fanfare & Confetti originating from the clicked flower button
      mergeAudio.playSuccessFanfare();
      triggerConfettiBurst(btnEl || event);

      // Praise voice: "Excellent! [num1] plus [num2] is [total]. Good job!"
      mergeTeacherVoice.celebrateCorrect(q.num1, q.num2, q.answer);

      // Feedback ribbon: dynamic encouragement message and Next Question button
      const ribbon = document.getElementById('merge-feedback-ribbon');
      if (ribbon) {
        const isRound10 = (mergeState.starsEarned + 1) >= mergeState.maxStars;
        let actionBtnText = 'Play Next Round';
        if (isRound10) {
          actionBtnText = mergeState.level < 3 ? 'Start Next Level' : 'Play Again';
        }

        ribbon.innerHTML = `
          <div class="feedback-msg success">
            <span class="feedback-icon" aria-hidden="true">🌟</span>
            <span class="feedback-text">Excellent! &nbsp;${q.num1} + ${q.num2} = ${q.answer}&nbsp; Good job!</span>
          </div>
          <button id="merge-next-btn" class="next-question-btn">
            ${actionBtnText}
          </button>
        `;

        const nextBtn = document.getElementById('merge-next-btn');
        if (nextBtn) {
          nextBtn.focus();
          nextBtn.addEventListener('click', () => {
            if (isRound10) {
              showMergeLevelCompleteModal();
            } else {
              onNextMergeQuestion();
            }
          });
        }
      }

      // Progress stars & streak
      mergeState.starsEarned++;
      mergeState.currentStreak++;
      updateMergeProgressStars();

      saveMergeProgress();

      // Check level completion (10 stars)
      if (mergeState.starsEarned >= mergeState.maxStars) {
        setTimeout(() => {
          showMergeLevelCompleteModal();
        }, 1200);
      }

    } else {
      // Incorrect answer: gentle wobble & encourage try again
      btnEl.classList.remove('incorrect');
      void btnEl.offsetWidth;
      btnEl.classList.add('incorrect');

      mergeAudio.playTryAgain();
      mergeTeacherVoice.encourageTryAgain();

      const ribbon = document.getElementById('merge-feedback-ribbon');
      if (ribbon) {
        ribbon.innerHTML = `
          <div class="feedback-msg try-again">
            <span class="feedback-icon" aria-hidden="true">🌱</span>
            <span class="feedback-text">That's okay, little one! Let's count and add the flowers together.</span>
          </div>
        `;
      }
    }
  }

  /**
   * Reset Round Counting Handler ("Count Again")
   * Restarts current question from the beginning without changing question or score.
   */
  function resetMergeRoundCounting() {
    stopMergeCountingHint();
    clearTimers();
    clearHintHighlights();
    mergeTeacherVoice.cancel();
    mergeState.flower1Taps = 0;
    mergeState.flower2Taps = 0;
    mergeState.flower1Counted = false;
    mergeState.flower2Counted = false;
    mergeState.totalCounted = 0;
    mergeState.hasMerged = false;
    mergeState.hasAnnouncedTotal = false;
    mergeState.isAnswerSelectionEnabled = false;
    mergeState.isAnswered = false;
    mergeState.selectedAnswer = null;
    mergeState.stage = 'counting_addends';
    renderMergeQuestion();
    saveMergeProgress();
  }

  /**
   * Count With Me Tutorial in Activity 2:
   * Slow, clear, and perfectly synchronised with the teacher's voice and flower animations.
   *
   * 1. First Group – Speak and Show Flowers:
   *    - Highlight First Group
   *    - Teacher speaks addend naturally & clearly (e.g. "Two.")
   *    - Wait until voice completely finishes speaking (onend callback)
   *    - Pause 500ms, then reveal individual flowers in Answer Box one at a time (numbered 1, 2, etc.)
   *    - Pause between flower appearances so child can see each one
   *
   * 2. Plus Sign – Addition Instruction:
   *    - Teacher says "Plus."
   *    - Highlight plus sign while spoken
   *    - Wait until voice finishes speaking before proceeding to Second Group
   *
   * 3. Second Group – Speak and Show Flowers:
   *    - Highlight Second Group
   *    - Teacher speaks second addend naturally & clearly (e.g. "One.")
   *    - Wait until voice completely finishes speaking (onend callback)
   *    - Pause 500ms, then reveal individual flowers in Answer Box one at a time,
   *      continuing sequential counting numbers from First Group (e.g. 3, etc.)
   *
   * 4. Equals Sign – Addition Instruction:
   *    - Highlight equals sign while teacher speaks (following Activity 1 visual behaviour)
   *    - Teacher says: "Equals"
   *    - Wait until voice finishes speaking before proceeding to next counting step
   *
   * 5. Count All Flowers Together:
   *    - Teacher slowly counts entire collection from 1 onwards: "One... Two... Three."
   *    - Each number spoken separately
   *    - Highlight corresponding individual flower in Answer Box as its number is spoken
   *    - Sufficient pause between each spoken number so child can follow
   *
   * 6. Merge the Flowers:
   *    - Only after complete counting sequence has finished, start existing flower-merging animation
   *    - Flowers glide smoothly together into Grand Merged Flower showing correct total in centre
   *
   * 7. Announce the Final Total:
   *    - After merging animation completely finishes, teacher says: "We have [total] flowers in total."
   *    - Only after this announcement finishes speaking: conclude tutorial & unlock 3 answer choices
   *
   * Dynamic & resilient: If child taps Count With Me after partially revealing flowers,
   * resumes from the appropriate next step without duplicating flowers or recounting.
   */
  function triggerMergeCountingHint() {
    if (mergeState.isHintActive || mergeState.isAnswered) return;
    stopMergeCountingHint();

    const q = mergeState.currentQuestion;
    if (!q) return;

    mergeState.isHintActive = true;
    mergeAudio.init();

    const hintBtn = document.getElementById('btn-merge-count-hint');
    if (hintBtn) {
      hintBtn.classList.add('hint-active');
    }

    const box1 = document.getElementById('merge-flower-1-box');
    const box2 = document.getElementById('merge-flower-2-box');
    const ansBox = document.getElementById('merge-answer-box');
    const plusElem = document.getElementById('merge-plus-symbol');
    const equalsElem = document.getElementById('merge-equals-symbol');

    // Helper: checks if tutorial is still active before doing anything
    function checkActive() {
      return !!mergeState.isHintActive;
    }

    // Check existing progress to avoid duplicate flowers or recounting
    const f1Done = mergeState.flower1Counted || ((mergeState.flower1Taps || 0) >= q.num1);
    const f2Done = mergeState.flower2Counted || ((mergeState.flower2Taps || 0) >= q.num2);
    const hasMerged = !!mergeState.hasMerged;

    const sequence = [];

    // =========================================================================
    // 1. First Group – Speak and Show Flowers (if not already completed)
    // =========================================================================
    if (!f1Done) {
      sequence.push({
        name: 'step1-first-group',
        run: (next) => {
          if (!checkActive()) return;
          clearHintHighlights();
          if (box1) {
            box1.classList.add('hint-target-glow', 'tapped');
            setHintTimeout(() => { if (checkActive() && box1) box1.classList.remove('tapped'); }, 400);
          }

          // Teacher speaks the First Group addend naturally and clearly (e.g. "Two.")
          const w1 = mergeTeacherVoice.getWord(q.num1);
          const cap1 = w1.charAt(0).toUpperCase() + w1.slice(1);

          mergeTeacherVoice.speak(cap1 + ".", () => {
            if (!checkActive()) return;
            // Wait until the voice has completely finished speaking, then comfortable pause
            setHintTimeout(() => {
              if (!checkActive()) return;

              // Reveal corresponding individual flowers in Answer Box, one at a time
              let currentCount = mergeState.flower1Taps || 0;
              const totalToSpawn = q.num1;

              function revealNextFlower() {
                if (!checkActive()) return;
                if (currentCount < totalToSpawn) {
                  currentCount++;
                  mergeState.flower1Taps = currentCount;

                  const existingCount = ansBox ? ansBox.querySelectorAll('.flower-token').length : 0;
                  const seqNum = existingCount + 1;

                  const flower = spawnAnswerBoxFlower(seqNum);
                  if (flower) {
                    flower.classList.add('flower-attention');
                    setHintTimeout(() => { if (flower) flower.classList.remove('flower-attention'); }, 500);
                  }
                  mergeAudio.playPop(seqNum);

                  if (currentCount < totalToSpawn) {
                    setHintTimeout(revealNextFlower, 550);
                    return;
                  }
                }

                // Completed First Group
                mergeState.flower1Counted = true;
                if (box1) {
                  box1.classList.remove('hint-target-glow');
                  box1.classList.add('box-completed');
                }
                saveMergeProgress();
                setHintTimeout(next, 600);
              }

              revealNextFlower();
            }, 500);
          });
        }
      });
    }

    // =========================================================================
    // 2. Plus Sign – Addition Instruction
    // =========================================================================
    if (!hasMerged && !f2Done) {
      sequence.push({
        name: 'step2-plus-sign',
        run: (next) => {
          if (!checkActive()) return;
          clearHintHighlights();
          if (plusElem) {
            plusElem.classList.add('symbol-glow', 'highlighted');
          }
          mergeAudio.playPop(1);

          // Teacher says: "Plus."
          mergeTeacherVoice.speak("Plus.", () => {
            if (!checkActive()) return;
            // Wait until voice has finished speaking before proceeding to Second Group
            if (plusElem) {
              plusElem.classList.remove('symbol-glow', 'highlighted');
            }
            setHintTimeout(next, 500);
          });
        }
      });
    }

    // =========================================================================
    // 3. Second Group – Speak and Show Flowers (if not already completed)
    // =========================================================================
    if (!f2Done) {
      sequence.push({
        name: 'step3-second-group',
        run: (next) => {
          if (!checkActive()) return;
          clearHintHighlights();
          if (box2) {
            box2.classList.add('hint-target-glow', 'tapped');
            setHintTimeout(() => { if (checkActive() && box2) box2.classList.remove('tapped'); }, 400);
          }

          // Teacher speaks the Second Group addend naturally and clearly (e.g. "One.")
          const w2 = mergeTeacherVoice.getWord(q.num2);
          const cap2 = w2.charAt(0).toUpperCase() + w2.slice(1);

          mergeTeacherVoice.speak(cap2 + ".", () => {
            if (!checkActive()) return;
            // Wait until voice has completely finished speaking, then comfortable pause
            setHintTimeout(() => {
              if (!checkActive()) return;

              // Reveal corresponding individual flowers in Answer Box, one at a time,
              // continuing the sequential counting number from First Group (e.g. 3, etc.)
              let currentGroupCount = mergeState.flower2Taps || 0;
              const totalToSpawn = q.num2;

              function revealNextFlower() {
                if (!checkActive()) return;
                if (currentGroupCount < totalToSpawn) {
                  currentGroupCount++;
                  mergeState.flower2Taps = currentGroupCount;

                  const existingCount = ansBox ? ansBox.querySelectorAll('.flower-token').length : 0;
                  const seqNum = existingCount + 1;

                  const flower = spawnAnswerBoxFlower(seqNum);
                  if (flower) {
                    flower.classList.add('flower-attention');
                    setHintTimeout(() => { if (flower) flower.classList.remove('flower-attention'); }, 500);
                  }
                  mergeAudio.playPop(seqNum);

                  if (currentGroupCount < totalToSpawn) {
                    setHintTimeout(revealNextFlower, 550);
                    return;
                  }
                }

                // Completed Second Group
                mergeState.flower2Counted = true;
                if (box2) {
                  box2.classList.remove('hint-target-glow');
                  box2.classList.add('box-completed');
                }
                saveMergeProgress();
                setHintTimeout(next, 600);
              }

              revealNextFlower();
            }, 500);
          });
        }
      });
    }

    // =========================================================================
    // 4. Equals Sign – Addition Instruction
    // =========================================================================
    if (!hasMerged) {
      sequence.push({
        name: 'step-equals-sign',
        run: (next) => {
          if (!checkActive()) return;
          clearHintHighlights();
          if (equalsElem) {
            equalsElem.classList.add('symbol-glow', 'highlighted');
          }
          mergeAudio.playPop(1);

          // Teacher speaks equals aloud: "Equals" (matching Activity 1 audio behaviour & cadence)
          mergeTeacherVoice.speak("Equals", () => {
            if (!checkActive()) return;
            // Wait until the spoken word has completely finished before proceeding to next counting step
            if (equalsElem) {
              equalsElem.classList.remove('highlighted');
              equalsElem.classList.add('symbol-glow');
            }
            setHintTimeout(next, 500);
          });
        }
      });
    }

    // =========================================================================
    // 5. Count All Flowers Together
    // =========================================================================
    if (!hasMerged) {
      sequence.push({
        name: 'step4-count-all-together',
        run: (next) => {
          if (!checkActive()) return;
          clearHintHighlights();
          if (ansBox) ansBox.classList.add('counting-active');
          mergeState.stage = 'counting_total';

          const tokens = ansBox ? Array.from(ansBox.querySelectorAll('.flower-token')) : [];
          // Ensure all flowers display their sequential numbers
          tokens.forEach((t, i) => {
            const num = i + 1;
            t.dataset.countOrder = String(num);
            const digitText = t.querySelector('.flower-digit-text');
            if (digitText) {
              digitText.textContent = String(num);
              digitText.classList.remove('hidden-digit');
              digitText.classList.add('revealed');
            }
          });

          let countIdx = 0;

          function countNextNumber() {
            if (!checkActive()) return;
            tokens.forEach(t => t.classList.remove('highlighted'));

            if (countIdx < q.answer && countIdx < tokens.length) {
              const currentNum = countIdx + 1;
              const flower = tokens[countIdx];

              // Highlight corresponding individual flower as its number is spoken
              flower.classList.add('highlighted', 'counted');
              flower.dataset.counted = 'true';
              flower.classList.remove('uncounted');

              flower.classList.remove('tapped');
              void flower.offsetWidth;
              flower.classList.add('tapped');

              mergeAudio.playPop(currentNum);
              mergeState.totalCounted = currentNum;
              saveMergeProgress();

              // Teacher slowly speaks each number separately: "One.", "Two.", "Three."
              const word = mergeTeacherVoice.getWord(currentNum);
              const spokenNumber = word.charAt(0).toUpperCase() + word.slice(1) + ".";

              mergeTeacherVoice.speak(spokenNumber, () => {
                if (!checkActive()) return;
                // Sufficient time between each spoken number so child can follow
                countIdx++;
                setHintTimeout(countNextNumber, 600);
              });
            } else {
              tokens.forEach(t => t.classList.remove('highlighted'));
              setHintTimeout(next, 700);
            }
          }

          countNextNumber();
        }
      });
    }

    // =========================================================================
    // 5. Merge the Flowers
    // =========================================================================
    if (!hasMerged) {
      sequence.push({
        name: 'step5-merge-flowers',
        run: (next) => {
          if (!checkActive()) return;
          clearHintHighlights();
          if (equalsElem) equalsElem.classList.remove('symbol-glow', 'highlighted');
          mergeState.stage = 'merging';

          if (ansBox) {
            const flowers = Array.from(ansBox.querySelectorAll('.flower-token'));
            if (flowers.length > 0) {
              const boxRect = ansBox.getBoundingClientRect();
              const centerX = boxRect.width / 2;
              const centerY = boxRect.height / 2;

              flowers.forEach(flower => {
                const fRect = flower.getBoundingClientRect();
                const fCenterX = fRect.left + fRect.width / 2 - boxRect.left;
                const fCenterY = fRect.top + fRect.height / 2 - boxRect.top;
                const dx = (centerX - fCenterX).toFixed(1);
                const dy = (centerY - fCenterY).toFixed(1);

                flower.style.transition = 'transform 0.72s cubic-bezier(0.34, 1.25, 0.64, 1), opacity 0.72s ease';
                flower.style.transform = `translate(${dx}px, ${dy}px) scale(0.38)`;
                flower.style.opacity = '0.35';
              });

              setHintTimeout(() => {
                if (!checkActive()) return;
                ansBox.innerHTML = '';
                ansBox.classList.remove('counting-active');
                ansBox.classList.add('box-completed');

                mergeAudio.playMergeChime();

                const palette = ACTIVITY2_PALETTES[mergeState.paletteIndex % ACTIVITY2_PALETTES.length];
                const grandDiv = document.createElement('div');
                grandDiv.className = 'grand-merged-flower';
                grandDiv.id = 'grand-merged-flower';
                grandDiv.innerHTML = createGrandMergedFlowerSVG({
                  total: q.answer,
                  size: 116,
                  petalColor: palette.petal,
                  petalDark: palette.petalDark,
                  centerColor: palette.center,
                  centerBorder: palette.centerBorder
                });
                ansBox.appendChild(grandDiv);

                mergeState.hasMerged = true;
                mergeState.stage = 'total_announced';
                saveMergeProgress();

                // Wait until merging animation & chime completely finish
                setHintTimeout(next, 950);
              }, 740);
              return;
            }
          }

          mergeState.hasMerged = true;
          mergeState.stage = 'total_announced';
          setHintTimeout(next, 300);
        }
      });
    }

    // =========================================================================
    // 6. Announce the Final Total
    // =========================================================================
    sequence.push({
      name: 'step6-announce-final-total',
      run: () => {
        if (!checkActive()) return;
        clearHintHighlights();

        const wAns = mergeTeacherVoice.getWord(q.answer);
        const noun = q.answer === 1 ? 'flower' : 'flowers';
        const announcementText = `We have ${wAns} ${noun} in total.`;

        let unlocked = false;
        function finishTutorial() {
          if (unlocked) return;
          unlocked = true;

          // Unlock the three answer choices so child can select correct answer
          setMergeAnswerButtonsEnabled(true);
          mergeState.hasAnnouncedTotal = true;
          mergeState.isAnswerSelectionEnabled = true;
          mergeState.stage = 'answer';
          saveMergeProgress();

          // Highlight matching answer button with golden glow
          const answerBtns = document.querySelectorAll('#merge-flower-answer-buttons .flower-btn');
          answerBtns.forEach(btn => {
            if (parseInt(btn.dataset.value, 10) === q.answer) {
              btn.style.filter = 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.95))';
              setTimeout(() => {
                btn.style.filter = '';
              }, 3500);
            }
          });

          // Conclude tutorial
          mergeState.isHintActive = false;
          if (hintBtn) hintBtn.classList.remove('hint-active');
        }

        // Teacher says: "We have [total] flowers in total."
        // Only after this announcement has finished speaking: conclude & unlock!
        mergeTeacherVoice.speak(announcementText, () => {
          setHintTimeout(finishTutorial, 400);
        });
      }
    });

    // Execute sequential steps
    let currentIdx = 0;
    function executeNext() {
      if (!checkActive()) return;
      if (currentIdx < sequence.length) {
        const step = sequence[currentIdx];
        currentIdx++;
        step.run(() => {
          executeNext();
        });
      } else {
        mergeState.isHintActive = false;
        if (hintBtn) hintBtn.classList.remove('hint-active');
      }
    }

    executeNext();
  }

  function onNextMergeQuestion() {
    mergeState.paletteIndex = (mergeState.paletteIndex + 1) % ACTIVITY2_PALETTES.length;
    mergeState.currentQuestion = generateMergeQuestion();
    renderMergeQuestion();
    saveMergeProgress();
  }

  function updateMergeLevelBadge() {
    const badge = document.getElementById('level-badge-text');
    if (badge) {
      if (mergeState.level === 1) {
        badge.textContent = 'Level 1: Totals up to 4';
      } else if (mergeState.level === 2) {
        badge.textContent = 'Level 2: Totals up to 6';
      } else {
        badge.textContent = 'Level 3: Totals up to 9';
      }
    }

    const levelBtns = document.querySelectorAll('.level-toggle-btn');
    levelBtns.forEach(btn => {
      const lvl = parseInt(btn.dataset.level, 10);
      if (lvl === mergeState.level) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function updateMergeProgressStars() {
    const starSlots = document.querySelectorAll('.stars-meter-row .star-slot');
    starSlots.forEach((slot, idx) => {
      if (idx < mergeState.starsEarned) {
        slot.classList.add('earned');
      } else {
        slot.classList.remove('earned');
      }
    });

    const streakEl = document.getElementById('stat-streak-val');
    if (streakEl) {
      streakEl.textContent = mergeState.currentStreak;
    }
  }

  function showMergeLevelCompleteModal() {
    mergeAudio.playSuccessFanfare();

    const titleElem = document.getElementById('modal-complete-title');
    const starsText = document.getElementById('modal-complete-stars-text');
    const descText = document.getElementById('modal-complete-desc-text');
    const playBtn = document.getElementById('btn-play-again');

    if (starsText && descText && playBtn) {
      starsText.textContent = `You earned 10 ⭐ in Level ${mergeState.level}!`;

      if (mergeState.level === 1) {
        if (titleElem) titleElem.textContent = 'Activity 2: Level 1 Completed!';
        descText.textContent = 'Wonderful! 🌸 You can now merge flowers to make 4. Ready to learn to make 6?';
        playBtn.textContent = 'Start Next Level';
      } else if (mergeState.level === 2) {
        if (titleElem) titleElem.textContent = 'Activity 2: Level 2 Completed!';
        descText.textContent = 'Wonderful! 🌸 You can now merge flowers to make 6. Ready to learn to make 9?';
        playBtn.textContent = 'Start Next Level';
      } else {
        if (titleElem) titleElem.textContent = 'Activity 2: Quest Completed!';
        descText.textContent = 'Wonderful! 🌸 You can now merge flowers to make 9. You’re an addition star!';
        playBtn.textContent = 'Play Again';
      }
    }

    const modal = document.getElementById('quest-complete-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  // =========================================================================
  // ACTIVITIES DROPDOWN CONTROLLER & SWITCHER
  // Switches between Activity 1 (Flower Counting) and Activity 2 (Flower Merge)
  // =========================================================================
  function setupActivitiesNavigation() {
    const dropdownWrapper = document.getElementById('activities-dropdown-wrapper');
    const dropdownBtn = document.getElementById('activities-dropdown-btn');
    const item1 = document.getElementById('activity-1-item');
    const item2 = document.getElementById('activity-2-item');
    const item3 = document.getElementById('activity-3-item');
    const headerTitle = document.getElementById('activity-section-title');

    const card1 = document.getElementById('flower-activity-container');
    const card2 = document.getElementById('flower-merge-activity-container');
    const card3 = document.getElementById('flower-merge-3-activity-container');

    const closeDropdown = () => {
      if (dropdownWrapper && dropdownWrapper.classList.contains('open')) {
        dropdownWrapper.classList.remove('open');
        if (dropdownBtn) dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    };

    function switchToActivity(actNum, shouldScroll = true) {
      closeDropdown();
      const actKey = actNum === 3 ? 'activity3' : (actNum === 2 ? 'activity2' : 'activity1');
      window.TenaliActiveActivity = actKey;
      safeSetItem(STORAGE_KEY_ACTIVITY, actKey);

      if (actNum === 1) {
        if (headerTitle) headerTitle.textContent = 'Activity 1';
        if (card1) card1.style.display = '';
        if (card2) card2.style.display = 'none';
        if (card3) card3.style.display = 'none';

        if (item1) item1.classList.add('active');
        if (item2) item2.classList.remove('active');
        if (item3) item3.classList.remove('active');

        clearTimers();
        if (typeof window.TenaliCancelActivity3Timers === 'function') {
          window.TenaliCancelActivity3Timers();
        }
        if (typeof window.TenaliStopMergeCountingHint === 'function') {
          window.TenaliStopMergeCountingHint();
        }
        if (typeof window.TenaliStopMergeCountingHint3 === 'function') {
          window.TenaliStopMergeCountingHint3();
        }
        if (typeof window.TenaliResetActivity1RoundCounting === 'function') {
          window.TenaliResetActivity1RoundCounting(true);
        }

        // Scroll into view
        if (shouldScroll && card1 && typeof card1.scrollIntoView === 'function') {
          card1.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else if (actNum === 2) {
        if (headerTitle) headerTitle.textContent = 'Activity 2';
        if (card1) card1.style.display = 'none';
        if (card2) card2.style.display = 'flex';
        if (card3) card3.style.display = 'none';

        if (item1) item1.classList.remove('active');
        if (item2) item2.classList.add('active');
        if (item3) item3.classList.remove('active');

        clearTimers();
        if (typeof window.TenaliCancelActivity3Timers === 'function') {
          window.TenaliCancelActivity3Timers();
        }
        if (typeof window.TenaliStopMergeCountingHint3 === 'function') {
          window.TenaliStopMergeCountingHint3();
        }
        if (typeof window.TenaliResetActivity1RoundCounting === 'function') {
          window.TenaliResetActivity1RoundCounting(true);
        }

        // Initialize or restore Activity 2 question (Answer Box starts empty)
        if (!mergeState.currentQuestion) {
          if (!restoreMergeProgress()) {
            mergeState.currentQuestion = generateMergeQuestion();
            renderMergeQuestion();
          }
        } else {
          resetMergeRoundCounting();
        }

        updateMergeLevelBadge();
        updateMergeProgressStars();

        // Scroll into view
        if (shouldScroll && card2 && typeof card2.scrollIntoView === 'function') {
          card2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else if (actNum === 3) {
        if (headerTitle) headerTitle.textContent = 'Activity 3';
        if (card1) card1.style.display = 'none';
        if (card2) card2.style.display = 'none';
        if (card3) card3.style.display = 'flex';

        if (item1) item1.classList.remove('active');
        if (item2) item2.classList.remove('active');
        if (item3) item3.classList.add('active');

        clearTimers();
        if (typeof window.TenaliStopMergeCountingHint === 'function') {
          window.TenaliStopMergeCountingHint();
        }
        if (typeof window.TenaliResetActivity1RoundCounting === 'function') {
          window.TenaliResetActivity1RoundCounting(true);
        }

        if (typeof window.TenaliSwitchToActivity3 === 'function') {
          window.TenaliSwitchToActivity3(shouldScroll);
        } else if (shouldScroll && card3 && typeof card3.scrollIntoView === 'function') {
          card3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }

    if (item1) {
      item1.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchToActivity(1, true);
      });
    }

    if (item2) {
      item2.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchToActivity(2, true);
      });
    }

    if (item3) {
      item3.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchToActivity(3, true);
      });
    }

    window.TenaliSwitchToActivity = switchToActivity;

    // Single "Count Again" Button in Activity 2
    const countAgainBtn2 = document.getElementById('btn-merge-count-again');
    if (countAgainBtn2) {
      countAgainBtn2.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetMergeRoundCounting();
      });
    }

    // Audio Speaker in Activity 2 Question Banner
    const speakerBtn2 = document.getElementById('merge-audio-speak-btn');
    if (speakerBtn2) {
      speakerBtn2.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const q = mergeState.currentQuestion;
        if (q) {
          speakerBtn2.classList.add('speaking');
          mergeTeacherVoice.readQuestion(q.num1, q.num2);
          setTimeout(() => speakerBtn2.classList.remove('speaking'), 1200);
        }
      });
    }

    // Count With Me in Activity 2
    const countHintBtn2 = document.getElementById('btn-merge-count-hint');
    if (countHintBtn2) {
      countHintBtn2.addEventListener('click', (e) => {
        e.preventDefault();
        triggerMergeCountingHint();
      });
    }

    // Level buttons coordination for Activity 2
    const levelBtns = document.querySelectorAll('.level-toggle-btn');
    levelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.TenaliActiveActivity === 'activity2') {
          const selectedLvl = parseInt(btn.dataset.level, 10);
          if (mergeState.level !== selectedLvl) {
            mergeState.level = selectedLvl;
            mergeState.starsEarned = 0;
            mergeState.currentStreak = 0;
            mergeScheduler.initQueue(selectedLvl);
            updateMergeLevelBadge();
            updateMergeProgressStars();
            onNextMergeQuestion();
          }
        }
      });
    });

    // Play Again / Start Next Level button in completion modal
    const playAgainBtn = document.getElementById('btn-play-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        if (window.TenaliActiveActivity === 'activity2') {
          const modal = document.getElementById('quest-complete-modal');
          if (modal) modal.classList.remove('active');
          mergeState.starsEarned = 0;
          mergeState.currentStreak = 0;
          if (mergeState.level < 3) {
            mergeState.level++;
          } else {
            mergeState.level = 1;
          }
          mergeScheduler.initQueue(mergeState.level);
          updateMergeLevelBadge();
          updateMergeProgressStars();
          onNextMergeQuestion();
        }
      });
    }

    return switchToActivity;
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  function initActivity2() {
    const switcher = setupActivitiesNavigation();
    window.TenaliSwitchToActivity = switcher;
    const savedAct = safeGetItem(STORAGE_KEY_ACTIVITY);
    if (savedAct === 'activity2' && switcher) {
      switcher(2, false);
    } else if (savedAct === 'activity3' && switcher) {
      switcher(3, false);
    } else {
      window.TenaliActiveActivity = 'activity1';
    }
  }

  window.TenaliTriggerMergeCountingHint = triggerMergeCountingHint;
  window.TenaliStopMergeCountingHint = stopMergeCountingHint;
  window.TenaliOnNextMergeQuestion = onNextMergeQuestion;
  window.TenaliMergeState = mergeState;
  window.TenaliSetCurrentQuestion = function(q) {
    mergeState.currentQuestion = q;
    renderMergeQuestion();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActivity2);
  } else {
    initActivity2();
  }

})();
