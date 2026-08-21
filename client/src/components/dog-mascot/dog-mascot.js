/**
 * <dog-mascot> — a friendly floating dog buddy for kids' learning platforms.
 *
 * Framework-agnostic Web Component. Works in plain HTML, React, Vue, Svelte,
 * Angular, etc. — no build step, no dependencies.
 *
 * BASIC USE
 * ---------
 *   <script src="dog-mascot.js"></script>
 *   <dog-mascot image="mascot-dog.png" name="Buddy"></dog-mascot>
 *
 * TALKING TO THE MASCOT FROM YOUR APP CODE
 * -----------------------------------------
 *   const buddy = document.querySelector('dog-mascot');
 *   buddy.say("Woof! Ready for some math?");
 *   buddy.celebrate("You got it right!");   // happy bounce + confetti-ish wag
 *   buddy.encourage();                       // random "you can do it" line
 *   buddy.think("Hmm, let's see...");        // thinking pose
 *
 * REACT EXAMPLE
 * -------------
 *   import 'dog-mascot.js';
 *   const ref = useRef(null);
 *   useEffect(() => { ref.current.say('Welcome back!'); }, []);
 *   return <dog-mascot ref={ref} image="/mascot-dog.png" name="Buddy" />;
 *
 * ATTRIBUTES
 * ----------
 *   image           path to the mascot image (defaults to "mascot-dog.png")
 *   name            the mascot's name, used in default lines (default "Buddy")
 *   greeting        custom first greeting (optional, overrides the random pool)
 *   idle-messages   "true" | "false" — pop up a friendly line every so often (default "true")
 *   position        "bottom-right" | "bottom-left" (default "bottom-right")
 *
 * EVENTS
 * ------
 *   "mascot:message"  fired whenever the speech bubble changes text,
 *                      detail: { text, mood }
 */

(function () {
  const WELCOME_LINES = [
    "Hi there! I'm {name}! Ready to learn something fun today? 🐾",
    "Woof! Welcome back, friend! What shall we discover today?",
    "Yay, you're here! Let's go on a learning adventure!",
    "Hello hello! {name} is so happy to see you!",
  ];

  const IDLE_LINES = [
    "Psst… you're doing great!",
    "Did you know dogs can learn over 100 words? So can you!",
    "Take a deep breath — you've got this!",
    "Need a paw? Just ask your teacher or grown-up!",
    "Every mistake means your brain is growing stronger!",
    "Woof! Keep going, superstar!",
  ];

  const CELEBRATE_LINES = [
    "WOOF! You did it! Amazing job! 🎉",
    "Pawsome work! I'm so proud of you!",
    "Yesss! High paw! ✋🐾",
    "You're on fire! Keep it up!",
  ];

  const ENCOURAGE_LINES = [
    "It's okay, learning takes practice — try again!",
    "Almost there! I believe in you!",
    "Oops-a-daisy! Let's give it another go together.",
    "Mistakes help us grow — you're doing wonderfully!",
  ];

  const THINK_LINES = [
    "Hmm, let's think about this one...",
    "Ooh, tricky! Let's figure it out together.",
    "Give me a second to sniff out the answer...",
  ];

  const CLICK_LINES = [
    "Tail wags for you! 🐕",
    "That tickles! Hehe.",
    "Woof woof! Thanks for saying hi!",
    "You found my favorite spot!",
  ];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  class DogMascot extends HTMLElement {
    static get observedAttributes() {
      return ["image", "name", "position"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._idleTimer = null;
      this._hideTimer = null;
    }

    connectedCallback() {
      this._render();
      this._wireEvents();

      // Greet shortly after mount so it feels alive, not instant/robotic.
      const greeting = this.getAttribute("greeting");
      window.setTimeout(() => {
        this.say(greeting || pick(WELCOME_LINES).replace("{name}", this.mascotName), "happy");
      }, 600);

      if (this.getAttribute("idle-messages") !== "false") {
        this._scheduleIdle();
      }
    }

    disconnectedCallback() {
      clearTimeout(this._idleTimer);
      clearTimeout(this._hideTimer);
    }

    attributeChangedCallback() {
      if (this.shadowRoot && this.shadowRoot.childElementCount) {
        this._applyDynamicAttrs();
      }
    }

    get mascotName() {
      return this.getAttribute("name") || "Buddy";
    }

    // ---------- public API ----------

    say(text, mood = "neutral") {
      this._speak(text, mood);
    }

    celebrate(text) {
      this._speak(text || pick(CELEBRATE_LINES), "happy", { bounce: true });
    }

    encourage(text) {
      this._speak(text || pick(ENCOURAGE_LINES), "gentle");
    }

    think(text) {
      this._speak(text || pick(THINK_LINES), "thinking");
    }

    // ---------- internals ----------

    _scheduleIdle() {
      const delay = 25000 + Math.random() * 20000; // 25–45s, stays low-key
      this._idleTimer = window.setTimeout(() => {
        if (!this._bubbleVisible) {
          this._speak(pick(IDLE_LINES), "neutral");
        }
        this._scheduleIdle();
      }, delay);
    }

    _speak(text, mood, opts = {}) {
      const bubble = this.shadowRoot.getElementById("bubble");
      const bubbleText = this.shadowRoot.getElementById("bubble-text");
      const figure = this.shadowRoot.getElementById("figure");

      bubbleText.textContent = text;
      bubble.classList.add("visible");
      figure.classList.remove("mood-happy", "mood-gentle", "mood-thinking");
      if (mood === "happy") figure.classList.add("mood-happy");
      if (mood === "gentle") figure.classList.add("mood-gentle");
      if (mood === "thinking") figure.classList.add("mood-thinking");

      if (opts.bounce) {
        figure.classList.remove("bounce");
        // force reflow so the animation can replay
        void figure.offsetWidth;
        figure.classList.add("bounce");
      }

      this._bubbleVisible = true;
      clearTimeout(this._hideTimer);
      this._hideTimer = window.setTimeout(() => {
        bubble.classList.remove("visible");
        this._bubbleVisible = false;
      }, 4800);

      this.dispatchEvent(
        new CustomEvent("mascot:message", {
          detail: { text, mood },
          bubbles: true,
          composed: true,
        })
      );
    }

    _applyDynamicAttrs() {
      const img = this.shadowRoot.getElementById("dog-image");
      if (img) img.src = this.getAttribute("image") || "mascot-dog.png";

      const host = this.shadowRoot.getElementById("root");
      if (host) {
        host.classList.toggle("pos-left", this.getAttribute("position") === "bottom-left");
      }
    }

    _wireEvents() {
      const figure = this.shadowRoot.getElementById("figure");
      figure.addEventListener("click", () => this._speak(pick(CLICK_LINES), "happy", { bounce: true }));
      figure.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this._speak(pick(CLICK_LINES), "happy", { bounce: true });
        }
      });
    }

    _render() {
      const image = this.getAttribute("image") || "mascot-dog.png";
      const isLeft = this.getAttribute("position") === "bottom-left";

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            all: initial;
            font-family: "Baloo 2", "Fredoka", "Nunito", system-ui, sans-serif;
          }
          #root {
            position: fixed;
            right: 18px;
            bottom: 14px;
            z-index: 2147483000;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
            pointer-events: none;
          }
          #root.pos-left {
            right: auto;
            left: 18px;
            align-items: flex-start;
          }
          #bubble {
            pointer-events: none;
            max-width: 220px;
            background: #FFFDF7;
            border: 3px solid #2B2118;
            border-radius: 20px;
            padding: 10px 14px;
            font-size: 15px;
            line-height: 1.35;
            color: #2B2118;
            box-shadow: 0 4px 0 rgba(43,33,24,0.15);
            opacity: 0;
            transform: translateY(8px) scale(0.92);
            transform-origin: bottom right;
            transition: opacity 0.22s ease, transform 0.22s ease;
          }
          #root.pos-left #bubble { transform-origin: bottom left; }
          #bubble.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          #dog-button {
            pointer-events: auto;
            background: #FFC93C;
            border: 3px solid #2B2118;
            border-radius: 50%;
            width: 84px;
            height: 84px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 5px 0 #E0A317, 0 5px 14px rgba(0,0,0,0.18);
            transition: transform 0.15s ease;
          }
          #dog-button:hover { transform: translateY(-2px); }
          #dog-button:active { transform: translateY(2px); box-shadow: 0 2px 0 #E0A317; }
          #dog-button:focus-visible {
            outline: 3px solid #45B7D1;
            outline-offset: 3px;
          }
          #figure {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: visible;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: idle-bob 3.2s ease-in-out infinite;
          }
          #dog-image {
            width: 92%;
            height: 92%;
            object-fit: contain;
            filter: drop-shadow(0 2px 1px rgba(0,0,0,0.12));
          }
          @keyframes idle-bob {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-3px) rotate(-2deg); }
          }
          .bounce { animation: bounce-pop 0.55s cubic-bezier(.36,1.4,.64,1) !important; }
          @keyframes bounce-pop {
            0% { transform: scale(1) rotate(0deg); }
            35% { transform: scale(1.18, 0.85) rotate(-6deg); }
            60% { transform: scale(0.92, 1.1) rotate(4deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          .mood-happy #dog-button { background: #FFC93C; }
          .mood-gentle #dog-button { background: #A7E3B5; }
          .mood-thinking #dog-button { background: #BFE1F5; }

          @media (prefers-reduced-motion: reduce) {
            #figure { animation: none; }
            .bounce { animation: none !important; }
            #bubble { transition: opacity 0.15s ease; }
          }
          @media (max-width: 480px) {
            #root { right: 10px; bottom: 10px; }
            #root.pos-left { left: 10px; }
            #dog-button { width: 68px; height: 68px; }
            #bubble { max-width: 62vw; font-size: 14px; }
          }
        </style>

        <div id="root" class="${isLeft ? "pos-left" : ""}">
          <div id="bubble" role="status" aria-live="polite">
            <span id="bubble-text"></span>
          </div>
          <button id="dog-button" type="button" aria-label="${this.mascotName}, your learning buddy — tap to say hi">
            <span id="figure">
              <img id="dog-image" src="${image}" alt="${this.mascotName} the mascot dog" />
            </span>
          </button>
        </div>
      `;
    }
  }

  if (!customElements.get("dog-mascot")) {
    customElements.define("dog-mascot", DogMascot);
  }
})();
