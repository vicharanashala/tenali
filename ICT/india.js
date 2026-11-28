/*
 * Soil Explorer screen 5: Explore India.
 * The map of 28 states and 8 union territories. In Explore mode the child
 * taps regions, filters by soil and fills the Explorer Passport. In Soil
 * Hunt mode Bhoomi gives a clue and the child answers on the map.
 */
(function () {
  'use strict';

  var SE = window.SE;
  var C = SE.core;
  var U = SE.ui;
  var A = SE.art;
  var D = SE.data;
  var h = U.h;
  var s = U.s;
  SE.screens = SE.screens || {};

  // Colours used on the map. They are chosen to be told apart easily, so
  // they are a little stronger than the real soil colours.
  var MAPCOL = (SE.mapColours = { alluvial: '#b79f72', black: '#4b4541', red: '#b5533a', laterite: '#7d3a1c', arid: '#e0c489', forest: '#3e6b46' });
  var PLAIN = '#f3ecdb';
  var SEEN = '#e3cf9f';
  var MAX_ZOOM = 6;

  function mount(root) {
    var st = SE.state;
    var view = (SE.view.map = SE.view.map || { mode: 'explore', filter: 'all', sel: null, k: 1, x: 0, y: 0, hunt: null, fresh: null });
    var geo = C.geo();
    var W = geo.width;
    var H = geo.height;
    var regEls = {};
    var flashTimer = 0;
    var motion = !U.reducedMotion();

    function name(id) {
      return SE.L(D.region(id).name);
    }

    // ----------------------------------------------------------------
    // The map itself
    // ----------------------------------------------------------------
    var svg = s('svg', { class: 'map', viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': SE.t('map.label') });
    var defs = s('defs');
    D.soils.forEach(function (soil) {
      defs.appendChild(s('pattern', { id: 'hatch-' + soil.id, width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, s('rect', { width: 9, height: 9, fill: PLAIN }), s('rect', { width: 4.5, height: 9, fill: MAPCOL[soil.id] })));
    });
    svg.appendChild(defs);
    var vp = s('g', { class: 'vp' });
    svg.appendChild(vp);
    vp.appendChild(s('path', { class: 'coast', d: geo.outline }));
    geo.ids
      .slice()
      .sort(function (a, b) {
        return geo.regions[b].area - geo.regions[a].area;
      })
      .forEach(function (id) {
        var R = geo.regions[id];
        var g = s('g', { class: 'reg', 'data-id': id, tabindex: 0, role: 'button', 'aria-label': name(id) });
        if (R.path) {
          g.appendChild(s('path', { class: 'reg-shape', d: R.path, 'fill-rule': 'evenodd' }));
          if (R.area < 2500) g.appendChild(s('path', { class: 'reg-hit', d: R.path }));
        }
        R.dots.forEach(function (p) {
          g.appendChild(s('circle', { class: 'reg-shape reg-dot', cx: p[0], cy: p[1], r: 5.5 }));
          g.appendChild(s('circle', { class: 'reg-hit-dot', cx: p[0], cy: p[1], r: 15 }));
        });
        if (R.path && R.area < 200) {
          g.appendChild(s('circle', { class: 'reg-shape reg-dot', cx: R.c[0], cy: R.c[1], r: 7 }));
          g.appendChild(s('circle', { class: 'reg-hit-dot', cx: R.c[0], cy: R.c[1], r: 15 }));
        }
        vp.appendChild(g);
        regEls[id] = g;
      });
    var outline = s('path', { class: 'sel-outline', 'fill-rule': 'evenodd' });
    var selDots = s('g', { class: 'sel-dots' });
    var pinArt = s('g', { class: 'pin-art' }, s('path', { d: 'M0 0C-11-15-17-23-17-32a17 17 0 0 1 34 0c0 9-6 17-17 32z' }), s('circle', { cx: 0, cy: -32, r: 6.5 }));
    var pin = s('g', { class: 'pin' }, pinArt);
    vp.appendChild(outline);
    vp.appendChild(selDots);
    vp.appendChild(pin);

    var tip = h('div', { class: 'map-tip', hidden: true });
    var layout = null;
    var zoomBox = h('div', { class: 'map-zoom', role: 'group' });
    var mapWrap = h('div', { class: 'map-wrap' }, svg, tip, zoomBox);

    function fillFor(id) {
      if (view.mode === 'hunt') return PLAIN;
      if (view.filter === 'all') return st.map.visited.indexOf(id) >= 0 ? SEEN : PLAIN;
      var has = C.hasSoil(id, view.filter);
      return has === 'major' ? MAPCOL[view.filter] : has === 'also' ? 'url(#hatch-' + view.filter + ')' : PLAIN;
    }
    function paintMap() {
      var Hn = view.mode === 'hunt' ? view.hunt : null;
      var m = Hn && Hn.state !== 'done' ? mission() : null;
      geo.ids.forEach(function (id) {
        var el = regEls[id];
        el.style.setProperty('--fill', fillFor(id));
        var cls = 'reg';
        if (view.mode === 'explore' && view.filter !== 'all' && !C.hasSoil(id, view.filter)) cls += ' is-muted';
        if (Hn && m) {
          if (Hn.state === 'solved' && Hn.found === id) cls += ' is-right';
          if (Hn.state === 'revealed' && m.accept.indexOf(id) >= 0) cls += ' is-answer';
          if (Hn.flash && Hn.flash.id === id) cls += ' is-' + Hn.flash.kind;
        }
        el.setAttribute('class', cls);
        el.setAttribute('aria-label', name(id));
      });
      var sel = view.mode === 'explore' ? view.sel : null;
      U.clear(selDots);
      if (sel) {
        var R = geo.regions[sel];
        outline.setAttribute('d', R.path || '');
        R.dots.forEach(function (p) {
          selDots.appendChild(s('circle', { cx: p[0], cy: p[1], r: 9 }));
        });
        pin.setAttribute('transform', 'translate(' + R.c[0] + ' ' + R.c[1] + ') scale(' + (1.15 / Math.sqrt(view.k)).toFixed(3) + ')');
        pin.style.display = '';
      } else {
        outline.setAttribute('d', '');
        pin.style.display = 'none';
      }
      svg.classList.toggle('is-hunt', view.mode === 'hunt');
      svg.style.touchAction = view.k > 1.01 ? 'none' : 'pan-y';
    }
    function dropPin() {
      if (!motion) return;
      pinArt.classList.remove('is-dropping');
      void pinArt.getBoundingClientRect();
      pinArt.classList.add('is-dropping');
    }

    // ---- zoom and pan ----
    function clampView() {
      view.k = Math.min(MAX_ZOOM, Math.max(1, view.k));
      view.x = Math.min(0, Math.max(W * (1 - view.k), view.x));
      view.y = Math.min(0, Math.max(H * (1 - view.k), view.y));
    }
    function applyView(smooth) {
      clampView();
      vp.style.transition = smooth && motion ? 'transform 0.45s ease' : 'none';
      vp.style.transform = 'translate(' + view.x.toFixed(2) + 'px,' + view.y.toFixed(2) + 'px) scale(' + view.k.toFixed(4) + ')';
      // Touch screens: a finger scrolls the page until the map is zoomed in, then it moves the map.
      // Two fingers always pinch-zoom the map.
      svg.style.touchAction = view.k > 1.01 ? 'none' : 'pan-y';
      paintMap();
    }
    function toMap(cx, cy) {
      var m = svg.getScreenCTM();
      if (!m) return [W / 2, H / 2];
      var p = svg.createSVGPoint();
      p.x = cx;
      p.y = cy;
      p = p.matrixTransform(m.inverse());
      return [p.x, p.y];
    }
    function zoomAt(px, py, factor, smooth) {
      var k2 = Math.min(MAX_ZOOM, Math.max(1, view.k * factor));
      view.x = px - (px - view.x) * (k2 / view.k);
      view.y = py - (py - view.y) * (k2 / view.k);
      view.k = k2;
      applyView(smooth);
    }
    function focusRegion(id) {
      var R = geo.regions[id];
      var bw = Math.max(70, R.box[2] - R.box[0]);
      var bh = Math.max(70, R.box[3] - R.box[1]);
      view.k = Math.min(5, Math.max(1, Math.min(W / (bw * 2.6), H / (bh * 2.6))));
      view.x = W / 2 - R.c[0] * view.k;
      view.y = H / 2 - R.c[1] * view.k;
      applyView(true);
    }

    var pointers = {};
    var dragged = false;
    var spread = 0;
    var travel = 0;
    function down(e) {
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (Object.keys(pointers).length === 1) {
        dragged = false;
        travel = 0;
      }
      spread = 0;
    }
    function move(e) {
      var p = pointers[e.pointerId];
      if (!p) {
        hover(e);
        return;
      }
      var ids = Object.keys(pointers);
      if (ids.length === 1) {
        travel += Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y);
        if (travel > 6 && view.k > 1.01) {
          dragged = true;
          var a = toMap(p.x, p.y);
          var b = toMap(e.clientX, e.clientY);
          view.x += b[0] - a[0];
          view.y += b[1] - a[1];
          applyView(false);
        }
      }
      p.x = e.clientX;
      p.y = e.clientY;
      if (ids.length === 2) {
        var p1 = pointers[ids[0]];
        var p2 = pointers[ids[1]];
        var d = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
        if (spread && d > 0) {
          var mid = toMap((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
          dragged = true;
          zoomAt(mid[0], mid[1], d / spread, false);
        }
        spread = d;
      }
    }
    function up(e) {
      delete pointers[e.pointerId];
      spread = 0;
    }
    function wheel(e) {
      // Plain scrolling moves the page. Once zoomed in (or with Ctrl held) the wheel zooms the map.
      if (!(e.ctrlKey || view.k > 1.01)) return;
      e.preventDefault();
      var p = toMap(e.clientX, e.clientY);
      zoomAt(p[0], p[1], e.deltaY > 0 ? 0.87 : 1.15, false);
    }
    function hover(e) {
      var g = e.pointerType === 'mouse' && view.mode === 'explore' && e.target.closest ? e.target.closest('.reg') : null;
      if (!g) {
        tip.hidden = true;
        return;
      }
      var box = mapWrap.getBoundingClientRect();
      tip.textContent = name(g.getAttribute('data-id'));
      tip.hidden = false;
      tip.style.transform = 'translate(' + (e.clientX - box.left + 14).toFixed(0) + 'px,' + (e.clientY - box.top + 14).toFixed(0) + 'px)';
    }
    function tap(e) {
      var g = e.target.closest ? e.target.closest('.reg') : null;
      if (!g || dragged) return;
      act(g.getAttribute('data-id'));
    }
    function keyTap(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var g = e.target.closest ? e.target.closest('.reg') : null;
      if (!g) return;
      e.preventDefault();
      act(g.getAttribute('data-id'));
    }
    function act(id) {
      if (view.mode === 'hunt') huntPick(id);
      else select(id, false);
    }
    svg.addEventListener('pointerdown', down);
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerleave', function () {
      tip.hidden = true;
    });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    svg.addEventListener('wheel', wheel, { passive: false });
    svg.addEventListener('click', tap);
    svg.addEventListener('keydown', keyTap);

    // ----------------------------------------------------------------
    // Explore mode
    // ----------------------------------------------------------------
    function select(id, focus) {
      var before = C.rank(st.map.visited.length).index;
      var first = C.visit(st, id);
      view.sel = id;
      view.fresh = first ? id : null;
      SE.save();
      if (first) {
        U.sound('stamp');
        var after = C.rank(st.map.visited.length).index;
        if (st.map.visited.length === 1) U.say('sci.stamp', 'cheer');
        else if (after > before) {
          U.say('sci.great', 'cheer');
          U.sound('win');
        }
      } else {
        U.sound('tap');
        if (!view.saidVisited) {
          view.saidVisited = true;
          U.say('sci.visited', 'think');
        }
      }
      if (focus) focusRegion(id);
      else paintMap();
      dropPin();
      paintPanel();
      paintPassport();
      if (first && motion) {
        var stamp = panel.querySelector('.stamp');
        if (stamp) U.celebrate(stamp);
      }
      // on a phone or tablet the card sits below the map: bring it into view
      if (window.innerWidth <= 980 && panel.scrollIntoView) panel.scrollIntoView({ block: 'nearest', behavior: motion ? 'smooth' : 'auto' });
    }

    function soilChip(id, strong) {
      return h('button', { type: 'button', class: 'soil-chip' + (strong ? ' is-major' : ''), onclick: function () {
        setFilter(id);
      } }, h('i', { style: { background: MAPCOL[id] } }), h('span', { text: U.soilName(id) }));
    }

    var panel = h('div', { class: 'card map-panel', 'aria-live': 'polite' });
    function paintPanel() {
      U.clear(panel);
      if (view.mode === 'hunt') {
        paintHunt();
        return;
      }
      if (!view.sel) {
        panel.appendChild(h('p', { class: 'empty' }, U.icon('pin', 22), h('span', { text: SE.t('map.pick') })));
        return;
      }
      var r = D.region(view.sel);
      var R = geo.regions[view.sel];
      var other = SE.i18n.lang === 'hi' ? 0 : 1;
      panel.appendChild(
        h(
          'div',
          { class: 'region-head' },
          h('div', null, h('p', { class: 'kicker', text: SE.t(R.type === 'ut' ? 'map.ut' : 'map.state') }), h('h2', { text: SE.L(r.name) }), h('p', { class: 'other-name', lang: other ? 'hi' : 'en', text: r.name[other] })),
          view.fresh === r.id ? h('span', { class: 'stamp is-new' }, U.icon('star', 18), h('span', { text: SE.t('map.stamp') })) : h('span', { class: 'stamp' }, U.icon('check', 16), h('span', { text: SE.t('map.explored') }))
        )
      );
      panel.appendChild(h('h3', { class: 'small-head', text: SE.t('map.major') }));
      var majors = h('div', { class: 'chips' }, r.major.map(function (id) {
        return soilChip(id, true);
      }));
      if (r.other === 'coral') majors.appendChild(h('span', { class: 'soil-chip is-major' }, h('i', { style: { background: '#efe3c4' } }), h('span', { text: SE.t('map.coral') })));
      panel.appendChild(majors);
      if (r.also.length) {
        panel.appendChild(h('h3', { class: 'small-head', text: SE.t('map.also') }));
        panel.appendChild(h('div', { class: 'chips' }, r.also.map(function (id) {
          return soilChip(id, false);
        })));
      }
      var main = r.major[0] ? D.soil(r.major[0]) : null;
      panel.appendChild(
        h(
          'div',
          { class: 'region-texture' },
          main ? U.swatch(main.id, 112, 76, 'swatch') : U.picture(A.texSample('sandy', 280, 170), 112, 76, 'swatch'),
          h('div', null, h('h3', { class: 'small-head', text: SE.t('lab.texture') + (main ? ' · ' + SE.L(main.short) : '') }), h('p', { text: main ? SE.L(main.texture) : SE.t('tex.sand.feel') }))
        )
      );
      panel.appendChild(h('h3', { class: 'small-head', text: SE.t('map.fact') }));
      panel.appendChild(h('p', { text: SE.L(r.fact) }));
      panel.appendChild(h('h3', { class: 'small-head', text: SE.t('map.crops') }));
      panel.appendChild(h('p', { text: SE.L(r.crops) }));
    }

    // ---- passport ----
    var passport = h('div', { class: 'card passport' });
    function paintPassport() {
      U.clear(passport);
      var n = st.map.visited.length;
      var rank = C.rank(n);
      var stamps = C.soilStamps(st);
      passport.appendChild(h('h2', null, U.icon('book', 20), h('span', { text: SE.t('pass.title') })));
      passport.appendChild(h('p', { class: 'pass-count', text: SE.t('pass.count', { n: n }) }));
      passport.appendChild(h('span', { class: 'meter', 'aria-hidden': 'true' }, h('i', { style: { width: (n / 36) * 100 + '%' } })));
      passport.appendChild(
        h('p', { class: 'pass-rank' }, h('b', { text: SE.t('pass.rank') + ': ' + SE.t('pass.rank' + rank.index) }), h('span', { text: rank.next === null ? SE.t('pass.top') : SE.t('pass.next', { n: rank.next - n, rank: SE.t('pass.rank' + (rank.index + 1)) }) }))
      );
      passport.appendChild(h('h3', { class: 'small-head', text: SE.t('pass.soils') }));
      passport.appendChild(
        h(
          'div',
          { class: 'soil-stamps' },
          D.soils.map(function (soil) {
            return h('span', { class: 'soil-stamp' + (stamps[soil.id] ? ' is-on' : ''), style: { '--c': MAPCOL[soil.id] }, title: SE.L(soil.name) }, h('i', null, stamps[soil.id] ? U.icon('check', 16) : null), h('span', { text: SE.L(soil.short) }));
          })
        )
      );
      passport.appendChild(h('p', { class: 'fine', text: SE.t('pass.soilsHow') }));
      passport.appendChild(h('h3', { class: 'small-head', text: SE.t('pass.recent') }));
      var recent = st.map.visited.slice(-5).reverse();
      passport.appendChild(
        recent.length
          ? h('div', { class: 'chips' }, recent.map(function (id) {
            return h('button', { type: 'button', class: 'chip', onclick: function () {
              if (view.mode !== 'explore') setMode('explore');
              select(id, true);
            } }, name(id));
          }))
          : h('p', { class: 'fine', text: SE.t('pass.none') })
      );
    }

    // ---- filters, legend, tools ----
    var filters = h('div', { class: 'filters', role: 'group', 'aria-label': SE.t('map.filters') });
    var legend = h('div', { class: 'legend' });
    var tools = h('div', { class: 'map-tools' });
    var modes = h('div', { class: 'modes', role: 'group' });
    var results = h('div', { class: 'search-results' });

    function setFilter(id) {
      view.filter = id;
      U.sound('tap');
      if (id !== 'all' && !view.saidFilter) {
        view.saidFilter = true;
        U.say('sci.filter', 'point');
      }
      paintFilters();
      paintMap();
    }
    function paintFilters() {
      U.clear(filters);
      U.clear(legend);
      if (view.mode === 'hunt') {
        filters.hidden = true;
        legend.appendChild(h('p', { class: 'fine', text: SE.t('map.simple') }));
        legend.appendChild(h('p', { class: 'fine credit', text: SE.t('map.credit') }));
        return;
      }
      filters.hidden = false;
      filters.appendChild(h('button', { type: 'button', class: 'filter' + (view.filter === 'all' ? ' is-on' : ''), 'aria-pressed': String(view.filter === 'all'), onclick: function () {
        setFilter('all');
      } }, h('span', { text: SE.t('map.all') })));
      D.soils.forEach(function (soil) {
        filters.appendChild(h('button', { type: 'button', class: 'filter' + (view.filter === soil.id ? ' is-on' : ''), 'aria-pressed': String(view.filter === soil.id), onclick: function () {
          setFilter(soil.id);
        } }, h('i', { style: { background: MAPCOL[soil.id] } }), h('span', { text: SE.L(soil.short) })));
      });
      var keys = h('div', { class: 'legend-keys' });
      function key(style, text) {
        keys.appendChild(h('span', { class: 'legend-key' }, h('i', { style: style }), h('span', { text: text })));
      }
      if (view.filter === 'all') {
        key({ background: SEEN }, SE.t('map.legendSeen'));
        key({ background: PLAIN }, SE.t('map.legendNew'));
      } else {
        var c = MAPCOL[view.filter];
        key({ background: c }, SE.t('map.legendMajor'));
        key({ background: 'repeating-linear-gradient(135deg,' + c + ' 0 3px,' + PLAIN + ' 3px 6px)' }, SE.t('map.legendAlso'));
        key({ background: PLAIN }, SE.t('map.legendNone'));
      }
      legend.appendChild(keys);
      legend.appendChild(h('p', { class: 'tip' }, h('b', { text: SE.t('map.tip') + ': ' }), view.filter === 'all' ? SE.t('map.tipAll') : SE.L(D.soil(view.filter).tip)));
      legend.appendChild(h('p', { class: 'fine', text: SE.t('map.simple') }));
      legend.appendChild(h('p', { class: 'fine credit', text: SE.t('map.credit') }));
    }

    function paintTools() {
      // on a phone the clue card moves above the map during a hunt (see the stylesheet)
      if (layout) layout.classList.toggle('is-hunt', view.mode === 'hunt');
      U.clear(modes);
      [['explore', 'pin', 'map.explore'], ['hunt', 'flag', 'map.hunt']].forEach(function (m) {
        modes.appendChild(U.btn({ class: 'btn-mode', icon: m[1], label: SE.t(m[2]), pressed: view.mode === m[0], on: function () {
          setMode(m[0]);
        } }));
      });
      U.clear(tools);
      U.clear(results);
      if (view.mode === 'explore') {
        var input = h('input', { type: 'search', class: 'search', placeholder: SE.t('map.search'), 'aria-label': SE.t('map.search'), autocomplete: 'off' });
        var found = [];
        var show = function () {
          U.clear(results);
          var q = input.value;
          found = C.search(q);
          if (!q.trim()) return;
          if (!found.length) {
            results.appendChild(h('p', { class: 'fine', text: SE.t('map.noMatch') }));
            return;
          }
          found.forEach(function (r) {
            results.appendChild(h('button', { type: 'button', class: 'chip', onclick: function () {
              go(r.id);
            } }, SE.L(r.name)));
          });
        };
        var go = function (id) {
          input.value = '';
          U.clear(results);
          select(id, true);
        };
        input.addEventListener('input', show);
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && found.length) go(found[0].id);
        });
        tools.appendChild(h('label', { class: 'search-box' }, U.icon('lens', 18), input));
      }
      U.clear(zoomBox);
      zoomBox.appendChild(U.btn({ class: 'btn-icon', icon: 'plus', title: SE.t('map.zoomIn'), on: function () {
        centreZoom(1.5);
      } }));
      zoomBox.appendChild(U.btn({ class: 'btn-icon', icon: 'minus', title: SE.t('map.zoomOut'), on: function () {
        centreZoom(1 / 1.5);
      } }));
      zoomBox.appendChild(U.btn({ class: 'btn-icon', icon: 'reset', title: SE.t('map.reset'), on: wholeMap }));
      if (view.mode === 'explore') {
        tools.appendChild(U.btn({ class: 'btn-small', icon: 'shuffle', label: SE.t('map.random'), on: function () {
          var fresh = geo.ids.filter(function (id) {
            return st.map.visited.indexOf(id) < 0;
          });
          var pool = fresh.length ? fresh : geo.ids;
          select(pool[Math.floor(Math.random() * pool.length)], true);
        } }));
      }
    }
    /** Back to the whole country. */
    function wholeMap() {
      view.k = 1;
      view.x = 0;
      view.y = 0;
      applyView(true);
    }
    /** Zoom about whatever is at the middle of the map right now. */
    function centreZoom(factor) {
      zoomAt(W / 2, H / 2, factor, true);
    }

    function setMode(mode) {
      if (view.mode === mode) return;
      view.mode = mode;
      U.sound('tap');
      tip.hidden = true;
      // a hunt needs the whole country in view
      if (mode === 'hunt') wholeMap();
      paintTools();
      paintFilters();
      paintMap();
      paintPanel();
      if (mode === 'hunt' && (!view.hunt || view.hunt.state === 'ask')) U.say('sci.hunt', 'point');
    }

    // ----------------------------------------------------------------
    // Soil Hunt
    // ----------------------------------------------------------------
    function mission() {
      var id = view.hunt.list[view.hunt.i];
      return D.missions.filter(function (m) {
        return m.id === id;
      })[0];
    }
    function startHunt() {
      view.hunt = {
        list: C.pickHunt(st.map.hunts + 1).map(function (m) {
          return m.id;
        }),
        i: 0,
        tries: 0,
        state: 'ask',
        right: 0,
        msg: null,
        found: null,
        flash: null
      };
      U.sound('tap');
      U.say('sci.hunt', 'point');
      wholeMap();
      paintMap();
      paintPanel();
    }
    function flash(id, kind) {
      var Hn = view.hunt;
      Hn.flash = { id: id, kind: kind };
      clearTimeout(flashTimer);
      flashTimer = setTimeout(function () {
        Hn.flash = null;
        paintMap();
      }, 1100);
    }
    function huntPick(id) {
      var Hn = view.hunt;
      if (!Hn || Hn.state !== 'ask') return;
      var m = mission();
      var verdict = C.judgeHunt(m, id);
      if (verdict === 'right') {
        U.judge(true, regEls[id], { quiet: true });
        Hn.right++;
        Hn.state = 'solved';
        Hn.found = id;
        Hn.msg = { kind: 'right', key: 'hunt.right', region: id };
        U.say('sci.great', 'cheer');
      } else if (verdict === 'near') {
        U.sound('tap');
        Hn.msg = { kind: 'near', key: m.place ? 'hunt.nearPlace' : 'hunt.near', region: id };
        flash(id, 'near');
      } else {
        var r = U.judge(false, null, { quiet: true });
        Hn.tries++;
        Hn.msg = { kind: 'wrong', key: r.delta < 0 ? 'hunt.wrong' : 'hunt.wrongFree', region: id };
        flash(id, 'wrong');
        if (Hn.tries >= 2) Hn.state = 'revealed';
        else U.say('sci.try', 'oops');
      }
      paintMap();
      paintPanel();
    }
    function nextMission() {
      var Hn = view.hunt;
      Hn.i++;
      Hn.tries = 0;
      Hn.msg = null;
      Hn.found = null;
      Hn.flash = null;
      if (Hn.i >= Hn.list.length) {
        Hn.state = 'done';
        st.map.hunts++;
        st.map.huntDone = true;
        st.map.huntRight = Hn.right;
        st.map.huntTotal = Hn.list.length;
        SE.save();
        U.say('sci.huntDone', 'cheer');
        U.sound('win');
        U.celebrate(mapWrap, true);
      } else {
        Hn.state = 'ask';
        U.sound('tap');
      }
      paintMap();
      paintPanel();
    }
    function paintHunt() {
      var Hn = view.hunt;
      if (!Hn) {
        panel.appendChild(h('h2', null, U.icon('flag', 20), h('span', { text: SE.t('map.hunt') })));
        panel.appendChild(h('p', { text: SE.t('hunt.intro') }));
        panel.appendChild(h('p', { class: 'fine', text: SE.t('det.rules').split(' · ').slice(0, 3).join(' · ') }));
        panel.appendChild(U.btn({ class: 'btn-primary', icon: 'flag', label: SE.t('hunt.start'), on: startHunt }));
        return;
      }
      if (Hn.state === 'done') {
        panel.appendChild(h('h2', null, U.icon('star', 20), h('span', { text: SE.t('hunt.done', { right: Hn.right, total: Hn.list.length }) })));
        panel.appendChild(
          h('div', { class: 'btn-row' }, U.btn({ class: 'btn-primary', icon: 'flag', label: SE.t('hunt.again'), on: startHunt }), U.btn({ class: 'btn-ghost', icon: 'pin', label: SE.t('hunt.back'), on: function () {
            setMode('explore');
          } }))
        );
        return;
      }
      var m = mission();
      panel.appendChild(
        h('div', { class: 'hunt-dots', 'aria-hidden': 'true' }, Hn.list.map(function (id, i) {
          return h('i', { class: i < Hn.i ? 'is-done' : i === Hn.i ? 'is-here' : '' });
        }))
      );
      panel.appendChild(h('p', { class: 'kicker', text: SE.t('hunt.mission', { n: Hn.i + 1, total: Hn.list.length }) + ' · ' + SE.t(m.type === 'soil' ? 'hunt.soil' : 'hunt.state') }));
      panel.appendChild(h('h2', { class: 'clue', text: SE.L(m.clue) }));
      if (Hn.state === 'ask' && !Hn.msg) panel.appendChild(h('p', { class: 'fine', text: SE.t('hunt.tap') }));
      if (Hn.msg) panel.appendChild(h('p', { class: 'verdict is-' + Hn.msg.kind, text: SE.t(Hn.msg.key, { name: name(Hn.msg.region) }) }));
      if (Hn.state === 'ask' && Hn.tries > 0) panel.appendChild(h('p', { class: 'hint-box' }, h('b', { text: SE.t('fb.hint') + ': ' }), SE.L(m.hint)));
      if (Hn.state !== 'ask') {
        var shown = Hn.found || m.accept[0];
        if (Hn.state === 'revealed') panel.appendChild(h('p', { class: 'fine', text: SE.t('hunt.reveal') }));
        panel.appendChild(h('div', { class: 'explain' }, h('h3', { text: SE.t('fb.why') }), h('p', { text: SE.L(m.why).replace('{name}', name(shown)) })));
        panel.appendChild(U.btn({ class: 'btn-primary', label: SE.t(Hn.i === Hn.list.length - 1 ? 'fb.continue' : 'fb.next'), iconAfter: 'right', on: nextMission }));
      }
    }

    // ----------------------------------------------------------------
    // Put it together
    // ----------------------------------------------------------------
    root.appendChild(U.head('india', 'map.lead'));
    layout = h(
      'section',
      { class: 'india' },
      h('div', { class: 'card map-card' }, h('div', { class: 'map-bar' }, modes, tools), results, filters, mapWrap),
      h('div', { class: 'map-side' }, panel, passport),
      // its own card, so that on a phone the region card can sit right under the map
      h('div', { class: 'card map-legend' }, legend)
    );
    root.appendChild(layout);
    paintTools();
    paintFilters();
    applyView(false);
    paintPanel();
    paintPassport();
    if (view.mode === 'explore' && !st.map.visited.length) U.say('sci.map', 'point');

    return function () {
      clearTimeout(flashTimer);
      if (view.hunt) view.hunt.flash = null;
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }

  SE.screens.india = { mount: mount };
})();
