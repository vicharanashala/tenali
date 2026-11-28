/*
 * Soil Explorer app shell: loads saved progress, draws the top bar with
 * the journey, the Back / Next footer with Bhoomi, and swaps screens.
 * This file loads last and starts the app.
 */
(function () {
  'use strict';

  var SE = window.SE;
  var C = SE.core;
  var U = SE.ui;
  var h = U.h;
  var app = (SE.app = {});
  var els = {};
  var cleanup = null;

  // ------------------------------------------------------------------
  // Progress in the browser's local storage
  // ------------------------------------------------------------------
  function load() {
    try {
      return JSON.parse(window.localStorage.getItem(C.STORE));
    } catch (e) {
      return null;
    }
  }
  SE.save = function () {
    try {
      window.localStorage.setItem(C.STORE, JSON.stringify(SE.state));
    } catch (e) {
      /* private mode or full storage: the game still works for this visit */
    }
    announceBadges();
    // Tick a step in the journey bar as soon as its task is complete.
    var ticks = doneSteps();
    if (els.top && ticks !== lastTicks) renderTop();
    lastTicks = ticks;
  };
  var lastTicks = '';
  function doneSteps() {
    return C.STAGES.map(function (id) {
      return C.stageDone(SE.state, id) ? 1 : 0;
    }).join('');
  }
  SE.state = C.restore(load());
  SE.i18n.set(SE.state.lang);
  SE.view = {}; // what each screen is showing right now; not saved

  /** Tell the child when a badge has just been earned. */
  function announceBadges() {
    var b = C.badges(SE.state);
    C.BADGES.forEach(function (id) {
      if (b[id] && !SE.state.seen['badge.' + id]) {
        SE.state.seen['badge.' + id] = true;
        try {
          window.localStorage.setItem(C.STORE, JSON.stringify(SE.state));
        } catch (e) {
          /* see above */
        }
        setTimeout(function () {
          U.toast(SE.t('res.badges') + ': ' + SE.t('res.b.' + id), 'bonus');
          U.sound('win');
        }, 900);
      }
    });
  }

  // ------------------------------------------------------------------
  // Top bar
  // ------------------------------------------------------------------
  function logo() {
    var s = U.s;
    return s(
      'svg',
      { class: 'logo', viewBox: '0 0 40 40', width: 36, height: 36, 'aria-hidden': 'true' },
      s('circle', { cx: 20, cy: 20, r: 19, fill: '#f6efe0', stroke: '#3a2a1c', 'stroke-width': 2 }),
      s('path', { d: 'M3.5 22h33a16.6 16.6 0 0 1-33 0z', fill: '#a4532a' }),
      s('path', { d: 'M6.5 29h27a16.6 16.6 0 0 1-27 0z', fill: '#5a3a26' }),
      s('path', { d: 'M20 22V11', stroke: '#3e6b46', 'stroke-width': 2.4, 'stroke-linecap': 'round', fill: 'none' }),
      s('path', { d: 'M20 15c-5 0-7-3-7-6 4 0 7 2 7 6zM20 13c4 0 6-2 6-5-3 0-6 1.6-6 5z', fill: '#3e6b46' }),
      s('path', { d: 'M20 22v6M20 24l-4 3M20 25l4 3', stroke: '#eadfc6', 'stroke-width': 1.4, 'stroke-linecap': 'round', fill: 'none' })
    );
  }

  function renderTop() {
    var st = SE.state;
    var at = C.STAGES.indexOf(st.stage);
    U.clear(els.top);
    els.top.appendChild(
      h('button', { type: 'button', class: 'brand', title: SE.t('top.home'), onclick: function () {
        app.go('welcome');
      } }, logo(), h('span', { class: 'brand-name', text: SE.t('app.name') }))
    );
    els.top.appendChild(
      h(
        'nav',
        { class: 'journey', 'aria-label': SE.t('nav.journey') },
        h(
          'ol',
          null,
          C.STAGES.map(function (id, i) {
            var done = C.stageDone(st, id);
            var here = i === at;
            var name = SE.t('stage.' + id);
            return h(
              'li',
              { class: 'step' + (done ? ' is-done' : '') + (here ? ' is-here' : '') },
              h(
                'button',
                { type: 'button', 'aria-current': here ? 'step' : null, title: name, 'aria-label': name + (here ? ' (' + SE.t('nav.here') + ')' : done ? ' (' + SE.t('nav.done') + ')' : ''), onclick: function () {
                  app.go(id);
                } },
                h('span', { class: 'step-dot' }, done ? U.icon('check', 14) : String(i + 1)),
                h('span', { class: 'step-name', text: name })
              )
            );
          })
        )
      )
    );
    var pips = st.streak % C.STREAK_EVERY;
    els.score = h('b', { text: String(st.score) });
    els.top.appendChild(
      h(
        'div',
        { class: 'top-tools' },
        h(
          'div',
          { class: 'score', title: SE.t('top.streak', { n: st.streak }), 'aria-label': SE.t('top.score') + ' ' + st.score },
          U.icon('star', 18),
          h('span', { class: 'score-label', text: SE.t('top.score') }),
          els.score,
          h('span', { class: 'pips', 'aria-hidden': 'true' }, [0, 1, 2].map(function (i) {
            return h('i', { class: i < pips ? 'is-on' : '' });
          }))
        ),
        h(
          'div',
          { class: 'lang', role: 'group', 'aria-label': SE.t('top.lang') },
          h('button', { type: 'button', lang: 'en', 'aria-pressed': String(st.lang === 'en'), onclick: function () {
            app.setLang('en');
          }, text: 'EN' }),
          h('button', { type: 'button', lang: 'hi', 'aria-pressed': String(st.lang === 'hi'), onclick: function () {
            app.setLang('hi');
          }, text: 'हिं' })
        ),
        U.btn({ class: 'btn-icon', icon: st.sound ? 'soundOn' : 'soundOff', title: SE.t(st.sound ? 'top.soundOn' : 'top.soundOff'), pressed: st.sound, on: function () {
          st.sound = !st.sound;
          SE.save();
          renderTop();
          U.sound('tap');
        } })
      )
    );
  }

  /** Update the score after an answer. `result` comes from core.answer. */
  app.refreshTop = function (result) {
    renderTop();
    if (!result || U.reducedMotion()) return;
    var gain = result.delta + result.bonus;
    if (!gain) return;
    var pill = els.top.querySelector('.score');
    pill.appendChild(h('span', { class: 'score-pop ' + (gain > 0 ? 'is-up' : 'is-down'), text: (gain > 0 ? '+' : '−') + Math.abs(gain) }));
    pill.classList.add('is-bump');
  };

  // ------------------------------------------------------------------
  // Footer
  // ------------------------------------------------------------------
  function renderFoot() {
    var at = C.STAGES.indexOf(SE.state.stage);
    var prev = C.STAGES[at - 1];
    var next = C.STAGES[at + 1];
    U.clear(els.foot);
    els.foot.appendChild(
      prev
        ? U.btn({ class: 'btn-ghost foot-back', icon: 'left', label: SE.t('nav.back'), on: function () {
          app.go(prev);
        } })
        : h('span', { class: 'foot-gap' })
    );
    var mid = h('div', { class: 'foot-mid' });
    els.foot.appendChild(mid);
    U.mountGuide(mid);
    els.foot.appendChild(
      next
        ? U.btn({ class: 'btn-primary foot-next', label: SE.t('nav.next', { name: SE.t('stage.' + next) }), iconAfter: 'right', on: function () {
          app.go(next);
        } })
        : h('span', { class: 'foot-gap' })
    );
  }

  // ------------------------------------------------------------------
  // Screens
  // ------------------------------------------------------------------
  app.render = function () {
    if (cleanup) {
      try {
        cleanup();
      } catch (e) {
        /* a screen that fails to tidy up must not block the next one */
      }
      cleanup = null;
    }
    var stage = SE.state.stage;
    document.documentElement.lang = SE.i18n.lang;
    document.title = SE.t('app.name') + ' · ' + SE.t('stage.' + stage);
    renderTop();
    renderFoot();
    U.clear(els.main);
    els.main.className = 'screen screen-' + stage;
    try {
      cleanup = SE.screens[stage].mount(els.main) || null;
    } catch (e) {
      if (window.console) console.error(e);
      U.clear(els.main);
      els.main.appendChild(h('div', { class: 'card oops' }, h('h1', { text: 'Something went wrong on this screen.' }), h('p', { text: String(e && e.message ? e.message : e) }), U.btn({ class: 'btn-primary', label: SE.t('rev.home'), on: function () {
        app.go('welcome');
      } })));
    }
  };

  app.go = function (stage, opts) {
    if (C.STAGES.indexOf(stage) < 0) stage = 'welcome';
    if (stage !== 'welcome') SE.state.started = true;
    SE.state.stage = stage;
    SE.state.seen[stage] = true;
    SE.save();
    U.forgetGuide();
    app.render();
    if (!opts || !opts.keepScroll) {
      window.scrollTo(0, 0);
      var head = els.main.querySelector('h1');
      if (head && opts !== 'boot') {
        try {
          head.focus({ preventScroll: true });
        } catch (e) {
          /* older browsers */
        }
      }
    }
  };

  app.setLang = function (lang) {
    SE.state.lang = SE.i18n.set(lang);
    SE.save();
    app.render();
  };

  /** Wipe all progress and return to the welcome screen. */
  app.restart = function () {
    var keep = { lang: SE.state.lang, sound: SE.state.sound };
    SE.state = C.fresh();
    SE.state.lang = keep.lang;
    SE.state.sound = keep.sound;
    SE.view = {};
    app.go('welcome');
  };

  // ------------------------------------------------------------------
  // The checks page: index.html?selftest
  // ------------------------------------------------------------------
  function showSelftest() {
    var results = SE.selftest.run();
    var sum = SE.selftest.summary(results);
    var group = '';
    var list = h('div', { class: 'selftest-list' });
    results.forEach(function (r) {
      if (r.group !== group) {
        group = r.group;
        list.appendChild(h('h2', { text: group }));
      }
      list.appendChild(h('p', { class: r.pass ? 'is-pass' : 'is-fail' }, h('b', { text: r.pass ? 'pass' : 'FAIL' }), ' ' + r.name, r.detail ? h('small', { text: r.detail }) : null));
    });
    document.body.appendChild(
      h('main', { class: 'selftest' }, h('h1', { text: 'Soil Explorer checks: ' + sum.passed + ' of ' + sum.total + ' passed' }), h('p', null, h('a', { href: 'index.html', text: 'Open Soil Explorer' })), list)
    );
  }

  app.boot = function () {
    if (/[?&]selftest\b/.test(window.location.search)) {
      showSelftest();
      return;
    }
    els.top = h('header', { class: 'top' });
    els.main = h('main', { class: 'screen', id: 'screen' });
    els.foot = h('footer', { class: 'foot' });
    document.body.appendChild(h('div', { class: 'app' }, els.top, els.main, els.foot));
    app.go(SE.state.stage, 'boot');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', app.boot);
  else app.boot();
})();
