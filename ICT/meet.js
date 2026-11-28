/*
 * Soil Explorer screen 2: Meet the Soil.
 * A ring showing what a handful of soil is made of, then three steps on
 * how soil forms.
 */
(function () {
  'use strict';

  var SE = window.SE;
  var U = SE.ui;
  var h = U.h;
  var s = U.s;
  SE.screens = SE.screens || {};

  // Shares by volume for a good garden soil (the usual textbook figure).
  var PARTS = [
    { id: 'minerals', share: 45, fill: '#b48a5c' },
    { id: 'water', share: 25, fill: '#6f9fb4' },
    { id: 'air', share: 25, fill: '#f1e9d6' },
    { id: 'humus', share: 5, fill: '#3a2a1c' }
  ];

  function arc(a0, a1, r) {
    var p0 = [110 + r * Math.sin(a0), 110 - r * Math.cos(a0)];
    var p1 = [110 + r * Math.sin(a1), 110 - r * Math.cos(a1)];
    return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + 'A' + r + ' ' + r + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
  }

  function stepArt(n) {
    if (n === 1) {
      return s(
        'svg',
        { viewBox: '0 0 120 80', class: 'form-art', 'aria-hidden': 'true' },
        s('circle', { cx: 98, cy: 16, r: 9, fill: '#e7c877' }),
        s('path', { d: 'M20 10l-4 12M32 8l-4 12M44 10l-4 12', stroke: '#6f9fb4', 'stroke-width': 3, 'stroke-linecap': 'round' }),
        s('path', { d: 'M12 72c2-22 16-36 44-38 28-2 46 12 52 38z', fill: '#8d8478', stroke: '#3a2a1c', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
        s('path', { d: 'M52 34l6 14-8 10 6 14M78 40l-6 12 8 8', fill: 'none', stroke: '#3a2a1c', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
      );
    }
    if (n === 2) {
      return s(
        'svg',
        { viewBox: '0 0 120 80', class: 'form-art', 'aria-hidden': 'true' },
        s('path', { d: 'M8 70l6-26 20-6 10 16-4 16z', fill: '#8d8478', stroke: '#3a2a1c', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
        s('path', { d: 'M52 70l4-16 12-4 8 10-2 10z', fill: '#a3978a', stroke: '#3a2a1c', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
        s('path', { d: 'M84 70l2-9 7-2 5 6-1 5z', fill: '#b8a890', stroke: '#3a2a1c', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
        s('g', { fill: '#b48a5c' }, s('circle', { cx: 106, cy: 68, r: 2.6 }), s('circle', { cx: 112, cy: 70, r: 1.8 }), s('circle', { cx: 108, cy: 62, r: 1.4 }), s('circle', { cx: 114, cy: 64, r: 1.1 })),
        s('path', { d: 'M40 28h34M68 22l8 6-8 6', fill: 'none', stroke: '#b5533a', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
      );
    }
    return s(
      'svg',
      { viewBox: '0 0 120 80', class: 'form-art', 'aria-hidden': 'true' },
      s('path', { d: 'M6 50h108v24H6z', fill: '#8a6844' }),
      s('path', { d: 'M6 44h108v12H6z', fill: '#3a2a1c' }),
      s('path', { d: 'M60 46V20', stroke: '#3e6b46', 'stroke-width': 3.5, 'stroke-linecap': 'round' }),
      s('path', { d: 'M60 30c-12 0-17-7-17-14 10 0 17 5 17 14zM60 26c10 0 15-5 15-12-8 0-15 4-15 12z', fill: '#3e6b46' }),
      s('path', { d: 'M60 48v12M60 52l-8 7M60 54l8 7', stroke: '#eadfc6', 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none' }),
      s('path', { d: 'M18 42q8-7 16 0q-8 6-16 0zM86 43q8-7 16 0q-8 6-16 0z', fill: '#a07a34' })
    );
  }

  function mount(root) {
    var st = SE.state;
    var view = (SE.view.meet = SE.view.meet || { part: null });
    var ring = h('div', { class: 'ring-wrap' });
    var detail = h('div', { class: 'card ring-detail', 'aria-live': 'polite' });
    var tallyHost = h('div', { class: 'tally-row' });

    function pick(id) {
      var first = !st.meet.parts[id];
      view.part = id;
      st.meet.parts[id] = true;
      SE.save();
      U.sound('tap');
      paint();
      if (first && SE.core.count(st.meet.parts) === 4) {
        U.say('sci.meetDone', 'cheer');
        U.sound('win');
        U.celebrate(ring, true);
        SE.app.refreshTop();
      }
    }

    function paint() {
      U.clear(ring);
      var svg = s('svg', { class: 'ring', viewBox: '0 0 220 220', role: 'group', 'aria-label': SE.t('meet.handful') });
      var a = 0;
      PARTS.forEach(function (p) {
        var span = (p.share / 100) * Math.PI * 2;
        var a0 = a + 0.02;
        var a1 = a + span - 0.02;
        a += span;
        var name = SE.t('meet.' + p.id);
        var seg = s('path', {
          class: 'ring-seg' + (view.part === p.id ? ' is-on' : '') + (st.meet.parts[p.id] ? ' is-found' : ''),
          d: arc(a0, a1, 76),
          stroke: p.fill,
          tabindex: 0,
          role: 'button',
          'aria-label': name + ', ' + SE.t('meet.share', { n: p.share }),
          onclick: function () {
            pick(p.id);
          },
          onkeydown: function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              pick(p.id);
            }
          }
        });
        svg.appendChild(s('path', { class: 'ring-edge', d: arc(a0, a1, 76) }));
        svg.appendChild(seg);
      });
      ring.appendChild(svg);
      ring.appendChild(h('div', { class: 'ring-centre' }, h('span', { text: SE.t('meet.handful') })));

      var legend = h(
        'div',
        { class: 'ring-legend' },
        PARTS.map(function (p) {
          return h(
            'button',
            { type: 'button', class: 'ring-key' + (view.part === p.id ? ' is-on' : ''), onclick: function () {
              pick(p.id);
            } },
            h('i', { style: { background: p.fill } }),
            h('span', { class: 'ring-key-name', text: SE.t('meet.' + p.id) }),
            h('span', { class: 'ring-key-share', text: SE.t('meet.share', { n: p.share }) }),
            st.meet.parts[p.id] ? U.icon('check', 16) : null
          );
        })
      );
      ring.appendChild(legend);

      U.clear(detail);
      if (view.part) {
        var p = PARTS.filter(function (x) {
          return x.id === view.part;
        })[0];
        detail.appendChild(h('p', { class: 'kicker', text: SE.t('meet.share', { n: p.share }) }));
        detail.appendChild(h('h2', { text: SE.t('meet.' + p.id) }));
        detail.appendChild(h('p', { text: SE.t('meet.' + p.id + '.t') }));
      } else {
        detail.appendChild(h('p', { class: 'empty' }, U.icon('hand', 22), h('span', { text: SE.t('meet.tap') })));
      }
      detail.appendChild(h('p', { class: 'fine', text: SE.t('meet.note') }));

      U.clear(tallyHost);
      var n = SE.core.count(st.meet.parts);
      tallyHost.appendChild(U.tally(SE.t('meet.found', { n: n }), n >= 4));
    }

    root.appendChild(U.head('meet', 'meet.lead', tallyHost));
    root.appendChild(h('section', { class: 'meet-top' }, ring, detail));
    root.appendChild(
      h(
        'section',
        { class: 'form' },
        h('h2', { text: SE.t('meet.form') }),
        h(
          'ol',
          { class: 'form-steps' },
          [1, 2, 3].map(function (n) {
            return h('li', { class: 'card' }, stepArt(n), h('h3', null, h('b', { text: String(n) }), h('span', { text: SE.t('meet.form' + n) })), h('p', { text: SE.t('meet.form' + n + '.t') }));
          })
        ),
        h('p', { class: 'callout' }, U.icon('star', 18), h('span', { text: SE.t('meet.formFact') })),
        h('div', { class: 'card remember' }, h('h3', { text: SE.t('meet.remember') }), h('p', { text: SE.t('meet.nutr') }))
      )
    );
    paint();
    if (SE.core.count(st.meet.parts) < 4) U.say('sci.meet', 'think');
  }

  SE.screens.meet = { mount: mount };
})();
