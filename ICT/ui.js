/*
 * Soil Explorer shared interface pieces: the element builder, icons,
 * sound cues, Bhoomi's speech bubble, score feedback and small widgets
 * used by more than one screen.
 */
(function () {
  'use strict';

  var SE = window.SE;
  var C = SE.core;
  var U = (SE.ui = {});
  var SVGNS = 'http://www.w3.org/2000/svg';

  // ------------------------------------------------------------------
  // Building elements
  // ------------------------------------------------------------------
  function fill(el, props, kids, svg) {
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') {
          if (svg) el.setAttribute('class', v);
          else el.className = v;
        } else if (k === 'text') el.textContent = v;
        else if (k === 'style' && typeof v === 'object') {
          Object.keys(v).forEach(function (s) {
            el.style.setProperty(s, v[s]);
          });
        } else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    kids.forEach(function add(kid) {
      if (kid === null || kid === undefined || kid === false) return;
      if (Array.isArray(kid)) {
        kid.forEach(add);
        return;
      }
      el.appendChild(typeof kid === 'object' ? kid : document.createTextNode(String(kid)));
    });
    return el;
  }
  /** h('div', { class: 'x', onclick: fn }, child, 'text', [more]) */
  U.h = function (tag, props) {
    return fill(document.createElement(tag), props, [].slice.call(arguments, 2), false);
  };
  /** The same for SVG elements. */
  U.s = function (tag, props) {
    return fill(document.createElementNS(SVGNS, tag), props, [].slice.call(arguments, 2), true);
  };
  var h = U.h;
  var s = U.s;

  U.clear = function (el) {
    while (el.firstChild) el.removeChild(el.firstChild);
    return el;
  };

  U.reducedMotion = function () {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };

  // ------------------------------------------------------------------
  // Icons: simple line drawings on a 24 x 24 grid
  // ------------------------------------------------------------------
  var ICONS = {
    soundOn: ['M4 9v6h4l5 4V5L8 9H4z', 'M16.5 8.5a5 5 0 0 1 0 7', 'M19 6a8.5 8.5 0 0 1 0 12'],
    soundOff: ['M4 9v6h4l5 4V5L8 9H4z', 'M16.5 9.5l5 5M21.5 9.5l-5 5'],
    plus: ['M12 5v14M5 12h14'],
    minus: ['M5 12h14'],
    reset: ['M4.5 12a7.5 7.5 0 1 0 2.4-5.5', 'M4 4.5v5h5'],
    lens: ['M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13z', 'M15.5 15.5L20 20'],
    layers: ['M12 3.5l8.5 4.5L12 12.5 3.5 8 12 3.5z', 'M3.5 12L12 16.5 20.5 12', 'M3.5 16L12 20.5 20.5 16'],
    shuffle: ['M4 7h3c5 0 5 10 10 10h3', 'M17 14l3 3-3 3', 'M4 17h3c1.8 0 3-1.2 4-2.9', 'M20 7h-3c-1.6 0-2.7.9-3.6 2.2', 'M17 4l3 3-3 3'],
    check: ['M5 12.5l4.5 4.5L19 7.5'],
    cross: ['M6.5 6.5l11 11M17.5 6.5l-11 11'],
    left: ['M14.5 5.5L8 12l6.5 6.5'],
    right: ['M9.5 5.5L16 12l-6.5 6.5'],
    spade: ['M12 3v9', 'M9 3h6', 'M7 12h10v2.5c0 3.2-2.2 5.6-5 6.5-2.8-.9-5-3.3-5-6.5V12z'],
    lock: ['M6 11h12v9H6z', 'M8.5 11V8a3.5 3.5 0 0 1 7 0v3'],
    drop: ['M12 3.5c3.4 4.3 5.8 7.3 5.8 10.2a5.8 5.8 0 0 1-11.6 0C6.2 10.8 8.6 7.8 12 3.5z'],
    star: ['M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6z'],
    home: ['M4 11.5l8-7 8 7', 'M6.5 10v9.5h11V10'],
    pin: ['M12 21s6-5.6 6-10.4a6 6 0 0 0-12 0C6 15.4 12 21 12 21z', 'M12 8.6a2 2 0 1 0 0 4a2 2 0 0 0 0-4z'],
    flag: ['M6 21V4', 'M6 5h12l-2.5 3.5L18 12H6'],
    book: ['M6 3.5h12v17H6z', 'M12 7.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6z', 'M9.5 17h5'],
    hand: ['M9 11V5.5a1.5 1.5 0 0 1 3 0V10', 'M12 10V4.5a1.5 1.5 0 0 1 3 0V10', 'M15 10V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 6.5-6 6.5-3 0-4.6-1.5-6-4L4.6 13a1.5 1.5 0 0 1 2.6-1.4L9 14']
  };
  U.icon = function (name, size) {
    var el = s('svg', { class: 'ico', viewBox: '0 0 24 24', width: size || 20, height: size || 20, 'aria-hidden': 'true', focusable: 'false' });
    (ICONS[name] || []).forEach(function (d) {
      el.appendChild(s('path', { d: d }));
    });
    return el;
  };

  /** A button. opts: { class, icon, label (text shown), title (spoken name), on } */
  U.btn = function (opts) {
    return h(
      'button',
      { type: 'button', class: 'btn ' + (opts.class || ''), onclick: opts.on, title: opts.label ? null : opts.title, 'aria-label': opts.label ? null : opts.title, disabled: opts.disabled, 'aria-pressed': opts.pressed === undefined ? null : String(!!opts.pressed) },
      opts.icon ? U.icon(opts.icon) : null,
      opts.label ? h('span', { text: opts.label }) : null,
      opts.iconAfter ? U.icon(opts.iconAfter) : null
    );
  };

  // ------------------------------------------------------------------
  // Sound cues, made with the Web Audio API (no sound files)
  // ------------------------------------------------------------------
  var audio = null;
  var SOUNDS = {
    tap: [[520, 0, 0.05, 'sine', 0.05]],
    good: [[660, 0, 0.1, 'sine', 0.09], [880, 0.09, 0.18, 'sine', 0.09]],
    bad: [[300, 0, 0.14, 'triangle', 0.07], [240, 0.11, 0.2, 'triangle', 0.07]],
    stamp: [[150, 0, 0.09, 'square', 0.06], [110, 0.05, 0.12, 'sine', 0.1]],
    pour: [[720, 0, 0.1, 'sine', 0.04], [620, 0.08, 0.1, 'sine', 0.04], [540, 0.16, 0.14, 'sine', 0.04]],
    dig: [[190, 0, 0.07, 'triangle', 0.08], [140, 0.06, 0.12, 'triangle', 0.08]],
    win: [[523, 0, 0.12, 'sine', 0.08], [659, 0.11, 0.12, 'sine', 0.08], [784, 0.22, 0.12, 'sine', 0.08], [1047, 0.33, 0.3, 'sine', 0.08]]
  };
  U.sound = function (name) {
    if (!SE.state || !SE.state.sound || !SOUNDS[name]) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audio = audio || new AC();
      if (audio.state === 'suspended') audio.resume();
      var now = audio.currentTime;
      SOUNDS[name].forEach(function (n) {
        var osc = audio.createOscillator();
        var gain = audio.createGain();
        osc.type = n[3];
        osc.frequency.value = n[0];
        gain.gain.setValueAtTime(0, now + n[1]);
        gain.gain.linearRampToValueAtTime(n[4], now + n[1] + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n[1] + n[2]);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(now + n[1]);
        osc.stop(now + n[1] + n[2] + 0.03);
      });
    } catch (e) {
      /* sound is a bonus; the game works without it */
    }
  };

  // ------------------------------------------------------------------
  // Bhoomi's speech bubble. She speaks when something happens and then
  // falls quiet; tapping her repeats the last thing she said.
  // ------------------------------------------------------------------
  var guide = { el: null, bubble: null, sci: null, timer: 0, last: null };

  U.mountGuide = function (host) {
    guide.sci = SE.art.scientist('happy');
    guide.bubble = h('div', { class: 'guide-bubble', role: 'status', 'aria-live': 'polite' });
    guide.el = h(
      'div',
      { class: 'guide' },
      guide.bubble,
      h('button', { type: 'button', class: 'guide-face', 'aria-label': SE.t('sci.name') + ' · ' + SE.t('sci.role'), onclick: function () {
        if (guide.el.classList.contains('is-talking')) hush();
        else if (guide.last) U.say(guide.last.key, guide.last.mood, guide.last.vars);
      } }, guide.sci)
    );
    host.appendChild(guide.el);
    if (guide.last) U.say(guide.last.key, guide.last.mood, guide.last.vars);
  };
  function hush() {
    clearTimeout(guide.timer);
    if (guide.el) guide.el.classList.remove('is-talking');
  }
  /** Have Bhoomi say dictionary entry `key` with a mood: happy, think, cheer, oops or point. */
  U.say = function (key, mood, vars) {
    guide.last = { key: key, mood: mood || 'happy', vars: vars };
    if (!guide.el) return;
    var text = SE.t(key, vars);
    guide.sci.setAttribute('data-mood', mood || 'happy');
    guide.bubble.textContent = '';
    guide.bubble.appendChild(h('strong', { text: SE.t('sci.name') }));
    guide.bubble.appendChild(h('span', { text: text }));
    guide.el.classList.add('is-talking');
    clearTimeout(guide.timer);
    guide.timer = setTimeout(hush, 4200 + text.length * 60);
  };
  U.hush = hush;
  U.forgetGuide = function () {
    guide.last = null;
    hush();
  };

  // ------------------------------------------------------------------
  // Toasts, score feedback and a small celebration
  // ------------------------------------------------------------------
  var toastHost = null;
  U.toast = function (text, kind) {
    if (!toastHost) {
      toastHost = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(toastHost);
    }
    var el = h('div', { class: 'toast toast-' + (kind || 'info') }, kind === 'good' ? U.icon('check', 18) : kind === 'bonus' ? U.icon('star', 18) : null, h('span', { text: text }));
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add('is-leaving');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    }, 2300);
    while (toastHost.children.length > 3) toastHost.removeChild(toastHost.firstChild);
  };

  var SPECKS = ['#b5533a', '#c59a3d', '#3e6b46', '#7a8440', '#a4532a', '#d9c39a'];
  U.celebrate = function (anchor, big) {
    if (U.reducedMotion() || !anchor || !anchor.getBoundingClientRect) return;
    var box = anchor.getBoundingClientRect();
    var cx = box.left + box.width / 2;
    var cy = box.top + box.height / 2;
    var n = big ? 34 : 16;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * 6.283 + Math.random() * 0.5;
      var d = (big ? 90 : 50) + Math.random() * (big ? 130 : 60);
      var el = h('i', { class: 'speck', style: { left: cx + 'px', top: cy + 'px', background: SPECKS[i % SPECKS.length], '--dx': Math.cos(a) * d + 'px', '--dy': Math.sin(a) * d - 30 + 'px', '--turn': Math.random() * 540 - 270 + 'deg', 'animation-delay': Math.random() * 90 + 'ms' } });
      document.body.appendChild(el);
      (function (node) {
        setTimeout(function () {
          if (node.parentNode) node.parentNode.removeChild(node);
        }, 1300);
      })(el);
    }
  };

  /**
   * Judge an answer, update the score and tell the child what happened.
   * Returns the result from core.answer. opts.quiet skips the toast.
   */
  U.judge = function (correct, anchor, opts) {
    opts = opts || {};
    var r = C.answer(SE.state, correct);
    SE.save();
    if (correct) {
      U.sound('good');
      if (!opts.quiet) U.toast(SE.t('fb.correct'), 'good');
      U.celebrate(anchor);
      if (r.bonus) {
        setTimeout(function () {
          U.toast(SE.t('fb.streak'), 'bonus');
          U.sound('win');
          U.say('sci.streak', 'cheer');
        }, 500);
      }
    } else {
      U.sound('bad');
      if (!opts.quiet) U.toast(SE.t(r.delta < 0 ? 'fb.wrong' : 'fb.wrongFree'), 'bad');
      if (anchor && anchor.classList && !U.reducedMotion()) {
        anchor.classList.remove('shake');
        void anchor.offsetWidth;
        anchor.classList.add('shake');
      }
    }
    if (SE.app) SE.app.refreshTop(r);
    return r;
  };

  // ------------------------------------------------------------------
  // Pictures
  // ------------------------------------------------------------------
  /** Copy a drawn picture into a new canvas of the given CSS size (covering it). */
  U.picture = function (source, w, h2, cls) {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var c = h('canvas', { class: cls || 'pic', width: Math.round(w * dpr), height: Math.round(h2 * dpr), style: { width: w + 'px', height: h2 + 'px' }, 'aria-hidden': 'true' });
    var k = Math.max(c.width / source.width, c.height / source.height);
    var sw = c.width / k;
    var sh = c.height / k;
    c.getContext('2d').drawImage(source, (source.width - sw) / 2, (source.height - sh) / 2, sw, sh, 0, 0, c.width, c.height);
    return c;
  };
  /** A patch of a soil's surface. */
  U.swatch = function (soilId, w, h2, cls) {
    return U.picture(SE.art.soilTop(soilId, 128).canvas, w, h2, cls || 'swatch');
  };

  /** Page heading used by every screen after the welcome. */
  U.head = function (stage, leadKey, extra) {
    var n = C.STAGES.indexOf(stage) + 1;
    return h(
      'header',
      { class: 'page-head' },
      h('p', { class: 'kicker', text: SE.t('nav.step', { n: n, total: C.STAGES.length }) }),
      h('h1', { tabindex: '-1', text: SE.t('stage.' + stage) }),
      leadKey ? h('p', { class: 'lead', text: SE.t(leadKey) }) : null,
      extra || null
    );
  };

  /** Small pill showing progress, such as "2 of 6 named". */
  U.tally = function (text, done) {
    return h('span', { class: 'tally' + (done ? ' is-done' : '') }, done ? U.icon('check', 16) : null, h('span', { text: text }));
  };

  /** Options for a question. items: [{ id, label, swatch }]. pick(id, button) is called on a tap. */
  U.options = function (items, pick, cls) {
    return h(
      'div',
      { class: 'options ' + (cls || '') },
      items.map(function (it) {
        var b = h('button', { type: 'button', class: 'option', 'data-id': it.id, onclick: function () {
          pick(it.id, b);
        } }, it.swatch ? U.swatch(it.swatch, 44, 44, 'swatch swatch-dot') : null, h('span', { text: it.label }));
        return b;
      })
    );
  };

  /** A small map of India with some regions picked out, for map questions. */
  U.miniMap = function (ids, label) {
    var geo = C.geo();
    var svg = s('svg', { class: 'mini-map', viewBox: '0 0 ' + geo.width + ' ' + geo.height, role: 'img', 'aria-label': label });
    [false, true].forEach(function (lit) {
      geo.ids.forEach(function (id) {
        if ((ids.indexOf(id) >= 0) !== lit) return;
        var R = geo.regions[id];
        if (R.path) svg.appendChild(s('path', { d: R.path, class: lit ? 'is-on' : '', 'fill-rule': 'evenodd' }));
        R.dots.forEach(function (p) {
          svg.appendChild(s('circle', { cx: p[0], cy: p[1], r: 7, class: lit ? 'is-on' : '' }));
        });
      });
    });
    return svg;
  };

  /** The words shown for one option of a quiz question. */
  U.optLabel = function (q, id) {
    if (q.kind === 'soil') return U.soilName(id);
    if (q.kind === 'tf') return SE.t('det.' + id);
    if (q.kind === 'tex') return SE.t('tex.' + id);
    var opt = q.opts.filter(function (o) {
      return C.optId(o) === id;
    })[0];
    return opt ? SE.L(opt.label) : id;
  };

  /** A soil's display name. */
  U.soilName = function (id) {
    return SE.L(SE.data.soil(id).name);
  };
})();
