/*
 * Soil Explorer screen 1: Welcome.
 * A landscape with a soil profile the child can dig through, Bhoomi's
 * greeting, a preview of the six soils and the Start button.
 */
(function () {
  'use strict';

  var SE = window.SE;
  var C = SE.core;
  var U = SE.ui;
  var A = SE.art;
  var h = U.h;
  var s = U.s;
  SE.screens = SE.screens || {};

  function sky() {
    // Sun, clouds and the far hills; drawn once, moved a little by the pointer.
    return s(
      'svg',
      { class: 'scene-far', viewBox: '0 0 400 170', preserveAspectRatio: 'xMidYMax slice', 'aria-hidden': 'true' },
      s('circle', { cx: 318, cy: 46, r: 24, fill: '#e7c877' }),
      s('circle', { cx: 318, cy: 46, r: 34, fill: '#e7c877', opacity: 0.25 }),
      s('path', { d: 'M40 44h64a11 11 0 0 0-20-7 16 16 0 0 0-30-2 10 10 0 0 0-14 9z', fill: '#fffaf0', opacity: 0.9 }),
      s('path', { d: 'M176 28h50a9 9 0 0 0-16-5 13 13 0 0 0-24-2 8 8 0 0 0-10 7z', fill: '#fffaf0', opacity: 0.75 }),
      s('path', { d: 'M0 170V112c30-22 58-30 88-14 26-34 64-42 96-10 26-20 60-24 92 2 34-26 78-22 124 14v76z', fill: '#b9bf8e' }),
      s('path', { d: 'M148 74l12-18 12 18M262 84l10-14 10 14', fill: '#fffaf0', opacity: 0.7 })
    );
  }
  function land() {
    var trees = [];
    [[36, 118, 1], [64, 126, 0.8], [338, 116, 1.1], [368, 126, 0.85], [300, 130, 0.7]].forEach(function (t) {
      var x = t[0];
      var y = t[1];
      var k = t[2];
      trees.push(s('path', { d: 'M' + x + ' ' + y + 'v' + 20 * k, stroke: '#5a3a26', 'stroke-width': 4 * k, 'stroke-linecap': 'round' }));
      trees.push(s('circle', { cx: x, cy: y - 6 * k, r: 15 * k, fill: '#3e6b46' }));
      trees.push(s('circle', { cx: x - 9 * k, cy: y + 2 * k, r: 10 * k, fill: '#34603d' }));
      trees.push(s('circle', { cx: x + 10 * k, cy: y + 1 * k, r: 11 * k, fill: '#4a7a50' }));
    });
    var rows = [];
    for (var i = 0; i < 9; i++) rows.push(s('path', { d: 'M' + (120 + i * 19) + ' 170q' + (4 - i) * 5 + ' -18 ' + (8 - i * 2) * 3 + ' -34', stroke: '#93a04e', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }));
    return s(
      'svg',
      { class: 'scene-near', viewBox: '0 0 400 170', preserveAspectRatio: 'xMidYMax slice', 'aria-hidden': 'true' },
      s('path', { d: 'M0 170v-34c44-20 92-22 138-8 50-18 104-16 150-2 40-10 78-6 112 8v36z', fill: '#7a8440' }),
      s('path', { d: 'M96 170c20-30 54-40 100-40s86 10 108 40z', fill: '#a9b060' }),
      rows,
      trees,
      s('path', { d: 'M0 170v-12c60-8 120-10 200-8s150 2 200 8v12z', fill: '#4f7a45' })
    );
  }

  function mount(root) {
    var st = SE.state;
    var motion = !U.reducedMotion();
    var caption = h('div', { class: 'dig-caption', 'aria-live': 'polite' });
    var layers = [];
    var shown = 0; // which layer the caption describes

    // ---- the scene ----
    var far = sky();
    var near = land();
    var ground = h('div', { class: 'ground' });
    var pic = A.profile(520, 360);
    pic.className = 'profile';
    pic.setAttribute('role', 'img');
    ground.appendChild(pic);
    for (var i = 0; i < 4; i++) {
      (function (n) {
        var el = h(
          'button',
          { type: 'button', class: 'layer', style: { top: A.PROFILE[n] * 100 + '%', height: (A.PROFILE[n + 1] - A.PROFILE[n]) * 100 + '%' }, onclick: function () {
            if (st.home.dug > n) {
              shown = n + 1;
              paint();
              U.sound('tap');
            }
          } },
          h('span', { class: 'layer-cover' }, U.icon('lock', 16), h('span', { class: 'layer-hidden' })),
          h('span', { class: 'layer-tag' }, h('b', { text: String(n + 1) }), h('span', { class: 'layer-name' }))
        );
        layers.push(el);
        ground.appendChild(el);
      })(i);
    }
    var digBtn = U.btn({ class: 'btn-dig', icon: 'spade', label: ' ', on: dig });
    var scene = h('div', { class: 'scene' }, h('div', { class: 'sky' }), far, near, ground, digBtn);

    function paint() {
      var dug = st.home.dug;
      pic.setAttribute('aria-label', SE.t('home.depth', { n: Math.max(1, dug) }));
      layers.forEach(function (el, n) {
        var open = dug > n;
        el.classList.toggle('is-open', open);
        el.classList.toggle('is-shown', shown === n + 1);
        el.disabled = !open;
        el.querySelector('.layer-hidden').textContent = SE.t('home.hidden');
        el.querySelector('.layer-name').textContent = SE.t('home.layer' + (n + 1));
        el.setAttribute('aria-label', open ? SE.t('home.layer' + (n + 1)) : SE.t('home.hidden'));
      });
      digBtn.querySelector('span').textContent = SE.t(dug >= 4 ? 'home.digAgain' : 'home.dig');
      U.clear(caption);
      if (!dug) {
        caption.appendChild(h('p', { class: 'dig-hint', text: SE.t('home.digHint') }));
      } else {
        var n = shown || dug;
        caption.appendChild(h('p', { class: 'kicker', text: SE.t('home.depth', { n: n }) + (dug >= 4 ? ' · ' + SE.t('home.digDone') : '') }));
        caption.appendChild(h('h3', { text: SE.t('home.layer' + n) }));
        caption.appendChild(h('p', { text: SE.t('home.layer' + n + '.t') }));
      }
    }
    function dig() {
      if (st.home.dug >= 4) {
        st.home.dug = 0;
        shown = 0;
      } else {
        st.home.dug++;
        shown = st.home.dug;
        U.sound('dig');
        if (st.home.dug === 4) {
          U.say('sci.digDone', 'cheer');
          U.celebrate(digBtn);
        } else if (st.home.dug === 1) U.say('sci.dig', 'point');
      }
      SE.save();
      paint();
    }

    function drift(e) {
      var box = scene.getBoundingClientRect();
      var x = (e.clientX - box.left) / box.width - 0.5;
      var y = (e.clientY - box.top) / box.height - 0.5;
      far.style.transform = 'translate(' + (-x * 8).toFixed(1) + 'px,' + (-y * 4).toFixed(1) + 'px)';
      near.style.transform = 'translate(' + (-x * 18).toFixed(1) + 'px,' + (-y * 6).toFixed(1) + 'px)';
    }
    if (motion) scene.addEventListener('pointermove', drift);

    // ---- text side ----
    var done = C.stepsDone(st);
    var startBtn = U.btn({ class: 'btn-primary btn-start', label: SE.t(st.started ? 'home.continue' : 'home.start'), iconAfter: 'right', on: function () {
      U.sound('good');
      U.celebrate(startBtn);
      var next = 'meet';
      if (st.started) {
        for (var k = 1; k < C.STAGES.length; k++) {
          if (!C.stageDone(st, C.STAGES[k])) {
            next = C.STAGES[k];
            break;
          }
          next = 'results';
        }
      }
      st.started = true;
      setTimeout(function () {
        SE.app.go(next);
      }, motion ? 260 : 0);
    } });

    var hello = h(
      'div',
      { class: 'hello' },
      A.scientist(st.started ? 'happy' : 'point'),
      h('div', { class: 'hello-bubble' }, h('strong', { text: SE.t('sci.name') }), h('span', { text: SE.t(st.started ? 'sci.back' : 'sci.hello') }))
    );

    var plan = h(
      'ul',
      { class: 'plan', 'aria-label': SE.t('home.plan') },
      [['lens', 'home.plan1'], ['drop', 'home.plan2'], ['pin', 'home.plan3'], ['flag', 'home.plan4'], ['star', 'home.plan5']].map(function (p) {
        return h('li', null, U.icon(p[0], 18), h('span', { text: SE.t(p[1]) }));
      })
    );

    var hero = h(
      'section',
      { class: 'hero' },
      h(
        'div',
        { class: 'hero-text' },
        h('p', { class: 'kicker', text: SE.t('home.kicker') }),
        h('h1', { tabindex: '-1', text: SE.t('app.name') }),
        h('p', { class: 'tagline' }, h('span', { lang: 'en', text: SE.i18n.dict['app.tagline'][0] }), h('span', { lang: 'hi', text: SE.i18n.dict['app.tagline'][1] })),
        hello,
        h(
          'div',
          { class: 'hero-actions' },
          startBtn,
          h('div', { class: 'hero-meta' }, h('span', { text: SE.t('home.time') }), h('span', { class: 'meter', role: 'img', 'aria-label': SE.t('home.progress', { n: done }) }, h('i', { style: { width: (done / 8) * 100 + '%' } })), h('span', { text: SE.t('home.progress', { n: done }) }))
        ),
        plan
      ),
      h('div', { class: 'hero-scene' }, scene, caption)
    );

    // ---- six soils ----
    var cards = SE.data.soils.map(function (soil) {
      return h(
        'button',
        { type: 'button', class: 'soil-card', onclick: function () {
          SE.view.lab = { soil: soil.id };
          SE.app.go('lab');
        } },
        U.swatch(soil.id, 168, 104),
        h('span', { class: 'soil-card-name', text: SE.L(soil.name) }),
        h('span', { class: 'soil-card-tag', text: SE.L(soil.tag) })
      );
    });
    var preview = h('section', { class: 'preview' }, h('h2', { text: SE.t('home.preview') }), h('div', { class: 'soil-cards' }, cards));

    root.appendChild(hero);
    root.appendChild(preview);
    paint();

    return function () {
      scene.removeEventListener('pointermove', drift);
    };
  }

  SE.screens.welcome = { mount: mount };
})();
