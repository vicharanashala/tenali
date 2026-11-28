/*
 * Soil Explorer screen 4: Texture Experiment. Three short experiments:
 *   A  particle sizes, drawn to their true relative scale
 *   B  the water test: pour the same water on three soils
 *   C  name the texture from what it feels like
 */
(function () {
  'use strict';

  var SE = window.SE;
  var C = SE.core;
  var U = SE.ui;
  var A = SE.art;
  var D = SE.data;
  var h = U.h;
  SE.screens = SE.screens || {};

  var TABS = ['a', 'b', 'c'];

  // ---- experiment A: where the three particles sit, in millimetres ----
  var RAD = { sand: C.particles.sand / 2, silt: C.particles.silt / 2, clay: C.particles.clay / 2 };
  var POS = { clay: 0 };
  // The three particles rest on the same floor, close together. A small one
  // tucks in under the curve of its big neighbour, so that when we zoom in on
  // it the neighbour's edge is still in the picture.
  POS.silt = 0.018;
  POS.sand = POS.silt + 0.5;
  var FILL = { sand: 0.5, silt: 0.42, clay: 0.3 }; // share of the picture height
  var BARS = [1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001, 0.0005];
  var WATER = '#5f93ad';

  function mount(root) {
    var st = SE.state;
    var view = (SE.view.tex = SE.view.tex || { tab: 'a', part: null, pour: {}, c: null });
    var body = h('div', { class: 'tex-body' });
    var tabs = h('div', { class: 'tabs', role: 'tablist' });
    var tallyHost = h('div', { class: 'tally-row' });
    var stop = null; // tidy-up for the experiment on screen
    var wasDone = allDone();

    function allDone() {
      var d = C.texDone(st);
      return d.a && d.b && d.c;
    }
    function checkDone() {
      paintTabs();
      if (!wasDone && allDone()) {
        wasDone = true;
        U.say('sci.texDone', 'cheer');
        U.sound('win');
        U.celebrate(tabs, true);
      }
    }

    function paintTabs() {
      var d = C.texDone(st);
      U.clear(tabs);
      TABS.forEach(function (id) {
        tabs.appendChild(
          h(
            'button',
            { type: 'button', role: 'tab', class: 'tab' + (view.tab === id ? ' is-on' : '') + (d[id] ? ' is-done' : ''), 'aria-selected': String(view.tab === id), onclick: function () {
              if (view.tab === id) return;
              view.tab = id;
              U.sound('tap');
              paint();
            } },
            h('span', { class: 'tab-letter' }, d[id] ? U.icon('check', 16) : id.toUpperCase()),
            h('span', { class: 'tab-text' }, h('small', { text: SE.t('tex.exp', { x: id.toUpperCase() }) }), h('span', { text: SE.t('tex.' + id) })),
            h('span', { class: 'tab-status', text: SE.t(d[id] ? 'tex.status.done' : 'tex.status.todo') })
          )
        );
      });
      U.clear(tallyHost);
      if (allDone()) tallyHost.appendChild(U.tally(SE.t('tex.done'), true));
    }

    function paint() {
      if (stop) stop();
      stop = null;
      paintTabs();
      U.clear(body);
      if (view.tab === 'a') stop = partA();
      else if (view.tab === 'b') stop = partB();
      else stop = partC();
    }

    // ================================================================
    // A. Particle sizes
    // ================================================================
    function partA() {
      var canvas = h('canvas', { class: 'particles', role: 'img' });
      var info = h('div', { class: 'card tex-info', 'aria-live': 'polite' });
      var picker = h('div', { class: 'part-picker', role: 'group' });
      var frame = 0;
      var w = 600;
      var hh = 300;
      var now = { part: view.part || 'sand', ls: 0, x: 0 };
      var anim = null;
      var font = window.getComputedStyle(document.body).fontFamily;

      function goal(part) {
        return { ls: Math.log((FILL[part] * hh) / (2 * RAD[part])), x: POS[part] };
      }
      function snap() {
        var g = goal(now.part);
        now.ls = g.ls;
        now.x = g.x;
      }
      function anchorX() {
        return w * (now.part === 'sand' ? 0.46 : 0.3);
      }

      function lines(ctx, text, max) {
        var words = text.split(' ');
        var out = [];
        var line = '';
        words.forEach(function (word) {
          var next = line ? line + ' ' + word : word;
          if (line && ctx.measureText(next).width > max) {
            out.push(line);
            line = word;
          } else line = next;
        });
        if (line) out.push(line);
        return out;
      }
      function label(ctx, text, x, y, align, max) {
        ctx.font = '600 13px ' + font;
        ctx.textAlign = align;
        ctx.textBaseline = 'top';
        var ls = lines(ctx, text, max || 170);
        var wide = 0;
        ls.forEach(function (l) {
          wide = Math.max(wide, ctx.measureText(l).width);
        });
        var left = align === 'center' ? x - wide / 2 : align === 'right' ? x - wide : x;
        left = Math.min(w - wide - 8, Math.max(8, left));
        ctx.fillStyle = 'rgba(255,250,240,0.92)';
        ctx.fillRect(left - 5, y - 3, wide + 10, ls.length * 16 + 5);
        ctx.fillStyle = '#3a2a1c';
        ctx.textAlign = 'left';
        ls.forEach(function (l, i) {
          ctx.fillText(l, left, y + i * 16);
        });
        return ls.length * 16 + 5;
      }

      function draw() {
        frame = 0;
        if (anim) {
          var k = Math.min(1, (performance.now() - anim.t0) / anim.dur);
          var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          now.ls = anim.ls0 + (anim.ls1 - anim.ls0) * e;
          // keep the chosen particle gliding toward its place on screen
          now.x = anim.x1 - (anim.off0 * (1 - e)) / Math.exp(now.ls);
          if (k >= 1) anim = null;
          else frame = requestAnimationFrame(draw);
        }
        var dpr = canvas.width / w;
        var ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, hh);
        var S = Math.exp(now.ls);
        var floor = hh * 0.8;
        var ax = anchorX();

        ctx.fillStyle = '#efe6d2';
        ctx.fillRect(0, floor, w, hh - floor);
        ctx.strokeStyle = '#c9b78f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, floor);
        ctx.lineTo(w, floor);
        ctx.stroke();

        var notes = [];
        ['sand', 'silt', 'clay'].forEach(function (p) {
          var r = RAD[p] * S;
          var cx = ax + (POS[p] - now.x) * S;
          var cy = floor - r;
          if (cx + r < -4 || cx - r > w + 4) return;
          // a huge ball curves away from the floor: skip it if none of it is in the picture
          if (r > floor && cx - Math.sqrt(2 * r * floor - floor * floor) > w) return;
          if (r < 0.55) {
            notes.push({ p: p, x: cx, tiny: true });
            return;
          }
          if (p === 'clay' && r >= 4) {
            var flat = 0.42;
            var thick = r * 0.2;
            var py = floor - thick - r * flat;
            [thick, 0].forEach(function (dy, n) {
              ctx.beginPath();
              for (var i = 0; i < 6; i++) {
                var a = (i / 6) * 6.283;
                ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, py + dy + Math.sin(a) * r * flat);
              }
              ctx.closePath();
              ctx.fillStyle = n ? '#c79a7c' : '#8a6048';
              ctx.fill();
              ctx.strokeStyle = '#5a3a26';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            });
            notes.push({ p: p, x: cx, top: py - r * flat });
            return;
          }
          var light = p === 'sand' ? '#f0e0b8' : p === 'silt' ? '#dccab0' : '#c79a7c';
          var dark = p === 'sand' ? '#b89a64' : p === 'silt' ? '#9c866a' : '#8a6048';
          if (r < 700) {
            var g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.05, cx, cy, r);
            g.addColorStop(0, light);
            g.addColorStop(1, dark);
            ctx.fillStyle = g;
          } else ctx.fillStyle = p === 'sand' ? '#d2ba88' : '#bca88a';
          ctx.beginPath();
          if (r > 14 && r < 700) A.blobPath(ctx, cx, cy, r, 0.035, C.rng(p.length * 11), 14);
          else ctx.arc(cx, cy, r, 0, 6.283);
          ctx.fill();
          ctx.strokeStyle = p === 'sand' ? '#8a6f44' : '#7a664c';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          if (r > 0.8 * w) notes.push({ p: p, edge: true, x: Math.max(cx - r, 0) });
          else if (r < 8) notes.push({ p: p, x: cx, small: true });
          else notes.push({ p: p, x: cx, top: cy - r });
        });

        notes.forEach(function (n) {
          if (n.edge) {
            label(ctx, SE.t(n.p === 'sand' ? 'tex.a.sandEdge' : 'tex.a.siltEdge'), w - 12, floor - hh * 0.5, 'right', Math.min(170, w - n.x - 20));
          } else if (n.tiny || n.small) {
            ctx.strokeStyle = '#b5533a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(n.x, floor - 2, 9, 0, 6.283);
            ctx.stroke();
            ctx.beginPath();
            if (n.p === 'silt') {
              ctx.moveTo(n.x, floor - 11);
              ctx.lineTo(n.x, floor - 40);
              ctx.stroke();
              label(ctx, SE.t('tex.silt'), n.x, floor - 60, 'center');
            } else {
              ctx.moveTo(n.x, floor + 7);
              ctx.lineTo(n.x, floor + 14);
              ctx.stroke();
              label(ctx, n.tiny ? SE.t('tex.a.tooSmall') : SE.t('tex.clay'), n.x, floor + 15, 'center', 230);
            }
          } else {
            label(ctx, SE.t('tex.' + n.p), n.x, Math.max(6, n.top - 26), 'center');
          }
        });

        // scale bar
        var len = BARS[BARS.length - 1];
        for (var i = 0; i < BARS.length; i++) {
          if (BARS[i] * S <= Math.min(120, w * 0.3)) {
            len = BARS[i];
            break;
          }
        }
        var bx = w - 14 - len * S;
        var by = 18;
        ctx.strokeStyle = '#3a2a1c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, by - 5);
        ctx.lineTo(bx, by + 5);
        ctx.moveTo(bx, by);
        ctx.lineTo(w - 14, by);
        ctx.moveTo(w - 14, by - 5);
        ctx.lineTo(w - 14, by + 5);
        ctx.stroke();
        ctx.font = '600 12px ' + font;
        ctx.fillStyle = '#3a2a1c';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(SE.t('tex.a.mm', { n: String(len) }), w - 14, by + 8);
      }
      function request() {
        if (!frame) frame = requestAnimationFrame(draw);
      }

      function zoomText() {
        var x = Math.exp(goal(now.part).ls) / 3.78; // screen pixels per millimetre, roughly
        var pow = Math.pow(10, Math.floor(Math.log(x) / Math.LN10));
        return (Math.round(x / pow) * pow).toLocaleString('en-IN');
      }

      function paintInfo() {
        U.clear(picker);
        C.PARTICLE_KINDS.forEach(function (p) {
          picker.appendChild(
            h('button', { type: 'button', class: 'part' + (view.part === p ? ' is-on' : ''), 'aria-pressed': String(view.part === p), onclick: function () {
              choose(p);
            } }, h('i', { class: 'part-dot part-' + p }), h('span', { text: SE.t('tex.' + p) }), st.tex.seen[p] ? U.icon('check', 16) : null)
          );
        });
        U.clear(info);
        if (view.part) {
          info.appendChild(h('p', { class: 'kicker', text: SE.t('tex.' + view.part + '.size') }));
          info.appendChild(h('h2', { text: SE.t('tex.' + view.part) }));
          info.appendChild(h('p', { text: SE.t('tex.' + view.part + '.feel') }));
          info.appendChild(h('p', { class: 'fine', text: SE.t('tex.a.zoom', { x: zoomText() }) + ' · ' + SE.t('tex.a.scaleNote') }));
        } else {
          info.appendChild(h('p', { class: 'empty' }, U.icon('hand', 22), h('span', { text: SE.t('tex.a.lead') })));
        }
        var n = C.count(st.tex.seen);
        info.appendChild(U.tally(SE.t('tex.a.seen', { n: n }), n >= 3));
        if (n >= 3) info.appendChild(h('p', { class: 'callout' }, U.icon('star', 18), h('span', { text: SE.t('tex.a.compare') })));
        canvas.setAttribute('aria-label', SE.t('tex.a') + ': ' + SE.t('tex.' + now.part) + '. ' + SE.t('tex.a.scaleNote'));
      }

      function choose(p) {
        var S0 = Math.exp(now.ls);
        var from = { ls: now.ls, off: (POS[p] - now.x) * S0 + anchorX() };
        view.part = p;
        now.part = p;
        st.tex.seen[p] = true;
        SE.save();
        U.sound('tap');
        var g = goal(p);
        if (U.reducedMotion()) {
          snap();
        } else {
          anim = { t0: performance.now(), dur: 1100, ls0: from.ls, ls1: g.ls, x1: g.x, off0: from.off - anchorX() };
        }
        paintInfo();
        request();
        checkDone();
      }

      function resize() {
        var box = canvas.getBoundingClientRect();
        if (!box.width) return;
        w = box.width;
        hh = box.height;
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(hh * dpr);
        if (!anim) snap();
        request();
      }
      var watcher = null;
      if (window.ResizeObserver) {
        watcher = new ResizeObserver(resize);
        watcher.observe(canvas);
      }

      body.appendChild(h('p', { class: 'lead', text: SE.t('tex.a.lead') }));
      body.appendChild(h('div', { class: 'tex-a' }, h('div', { class: 'card tex-stage' }, picker, canvas), info));
      paintInfo();
      resize();
      if (!C.texDone(st).a) U.say('sci.texA', 'point');

      return function () {
        if (frame) cancelAnimationFrame(frame);
        if (watcher) watcher.disconnect();
      };
    }

    // ================================================================
    // B. Water test
    // ================================================================
    function partB() {
      var W = 170;
      var H = 320;
      var cols = {};
      var frame = 0;
      var ask = h('div', { class: 'tex-ask', 'aria-live': 'polite' });
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var pourAll, reset;

      function time(kind) {
        return view.pour[kind] === undefined ? null : (performance.now() - view.pour[kind]) / 1000;
      }

      function drawCol(kind) {
        var col = cols[kind];
        var t = time(kind);
        var p = t === null ? { front: 0, pond: 0, drained: 0, held: 0, dripping: false, done: false } : C.percolate(kind, t);
        var ctx = col.canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        var x0 = 40;
        var x1 = 130;
        var top = 74;
        var bot = 196;

        // water being poured in
        if (t !== null && t < 0.7) {
          ctx.fillStyle = WATER;
          ctx.fillRect(81, 0, 8, top - (p.pond / 100) * 50);
        }
        // standing water
        if (p.pond > 0.5) {
          ctx.fillStyle = WATER;
          ctx.globalAlpha = 0.8;
          ctx.fillRect(x0, top - (p.pond / 100) * 50, x1 - x0, (p.pond / 100) * 50);
          ctx.globalAlpha = 1;
        }
        // soil, darker where it is wet
        var pic = A.texSample(kind, 180, 244);
        ctx.drawImage(pic, x0, top, x1 - x0, bot - top);
        if (p.front > 0) {
          ctx.fillStyle = 'rgba(22,34,58,0.36)';
          ctx.fillRect(x0, top, x1 - x0, (bot - top) * p.front);
        }
        // glass tube and outlet
        ctx.strokeStyle = '#3a2a1c';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x0, 14);
        ctx.lineTo(x0, bot);
        ctx.lineTo(78, 216);
        ctx.lineTo(78, 224);
        ctx.moveTo(x1, 14);
        ctx.lineTo(x1, bot);
        ctx.lineTo(92, 216);
        ctx.lineTo(92, 224);
        ctx.stroke();
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x0, bot);
        ctx.lineTo(x1, bot);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(x0 + 6, 20, 4, bot - 26);

        // beaker with what has drained through
        var bx0 = 46;
        var bx1 = 124;
        var by0 = 236;
        var by1 = 308;
        var level = (p.drained / 100) * 66;
        if (level > 0.3) {
          ctx.fillStyle = WATER;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(bx0 + 1, by1 - level, bx1 - bx0 - 2, level);
          ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = '#3a2a1c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx0, by0);
        ctx.lineTo(bx0, by1);
        ctx.lineTo(bx1, by1);
        ctx.lineTo(bx1, by0);
        ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(58,42,28,0.55)';
        [25, 50, 75].forEach(function (m) {
          var y = by1 - (m / 100) * 66;
          ctx.beginPath();
          ctx.moveTo(bx1 - 14, y);
          ctx.lineTo(bx1, y);
          ctx.stroke();
        });
        // drops
        if (p.dripping) {
          ctx.fillStyle = WATER;
          for (var i = 0; i < 3; i++) {
            var ph = (t * 1.7 + i / 3) % 1;
            var y = 226 + ph * ph * (by1 - level - 232);
            ctx.beginPath();
            ctx.arc(85, y, 3.2, 0, 6.283);
            ctx.fill();
          }
        }

        var w = C.water[kind];
        col.first.textContent = t !== null && t >= w.front ? SE.t('tex.b.sec', { n: w.front.toFixed(1) }) : SE.t('tex.b.waiting');
        col.drained.textContent = SE.t('tex.b.ml', { n: Math.round(p.drained) });
        col.held.textContent = SE.t('tex.b.ml', { n: Math.round(p.held) });
        col.btn.disabled = t !== null;
        col.canvas.setAttribute('aria-label', SE.t('tex.' + kind) + ': ' + SE.t('tex.b.drained') + ' ' + col.drained.textContent + ', ' + SE.t('tex.b.held') + ' ' + col.held.textContent);

        if (p.done && !st.tex.poured[kind]) {
          st.tex.poured[kind] = true;
          SE.save();
          paintAsk();
          checkDone();
        }
        return t !== null && !p.done;
      }

      function tick() {
        frame = 0;
        var busy = false;
        C.WATER_KINDS.forEach(function (kind) {
          if (drawCol(kind)) busy = true;
        });
        pourAll.disabled = C.WATER_KINDS.every(function (k) {
          return view.pour[k] !== undefined;
        });
        if (busy) frame = requestAnimationFrame(tick);
      }
      function request() {
        if (!frame) frame = requestAnimationFrame(tick);
      }
      function pour(kind) {
        if (view.pour[kind] !== undefined) return;
        view.pour[kind] = performance.now();
        U.sound('pour');
        request();
      }

      function paintAsk() {
        U.clear(ask);
        var all = C.count(st.tex.poured) >= 3;
        if (!all) {
          ask.appendChild(h('p', { class: 'fine', text: SE.t('tex.b.pourFirst') }));
          return;
        }
        if (!st.tex.waterQ) {
          ask.appendChild(h('h3', { text: SE.t('tex.b.q') }));
          var tried = view.triedB || [];
          var opts = U.options(
            C.WATER_KINDS.map(function (k) {
              return { id: k, label: SE.t('tex.' + k) };
            }),
            function (id, btn) {
              if (id === 'clayey') {
                U.judge(true, btn);
                st.tex.waterQ = true;
                SE.save();
                U.say('sci.great', 'cheer');
                paintAsk();
                checkDone();
              } else {
                U.judge(false, btn);
                view.triedB = tried.concat([id]);
                U.say('sci.try', 'oops');
                paintAsk();
              }
            },
            'options-row'
          );
          tried.forEach(function (id) {
            var b = opts.querySelector('[data-id="' + id + '"]');
            if (b) {
              b.disabled = true;
              b.classList.add('is-wrong');
            }
          });
          ask.appendChild(opts);
          return;
        }
        ask.appendChild(h('div', { class: 'card explain' }, h('h3', null, U.icon('check', 18), h('span', { text: SE.t('tex.clayey') })), h('p', { text: SE.t('tex.b.explain') }), h('p', { class: 'fine', text: SE.t('tex.b.note') })));
      }

      var bench = h('div', { class: 'columns' });
      C.WATER_KINDS.forEach(function (kind) {
        var col = (cols[kind] = {});
        col.canvas = h('canvas', { class: 'column-pic', role: 'img', width: W * dpr, height: H * dpr, style: { width: W + 'px', height: H + 'px' }, onclick: function () {
          pour(kind);
        } });
        col.first = h('dd');
        col.drained = h('dd');
        col.held = h('dd');
        col.btn = U.btn({ class: 'btn-small', icon: 'drop', label: SE.t('tex.b.pour'), on: function () {
          pour(kind);
        } });
        bench.appendChild(
          h('div', { class: 'column card' }, h('h3', { text: SE.t('tex.' + kind) }), col.canvas, col.btn, h('dl', { class: 'readout' }, h('dt', { text: SE.t('tex.b.first') }), col.first, h('dt', { text: SE.t('tex.b.drained') }), col.drained, h('dt', { text: SE.t('tex.b.held') }), col.held))
        );
      });
      pourAll = U.btn({ class: 'btn-primary', icon: 'drop', label: SE.t('tex.b.pourAll'), on: function () {
        C.WATER_KINDS.forEach(pour);
      } });
      reset = U.btn({ class: 'btn-ghost', icon: 'reset', label: SE.t('tex.b.reset'), on: function () {
        view.pour = {};
        U.sound('tap');
        request();
      } });

      body.appendChild(h('p', { class: 'lead', text: SE.t('tex.b.lead') }));
      body.appendChild(h('div', { class: 'tex-b-actions' }, pourAll, reset, h('span', { class: 'fine', text: SE.t('tex.b.tapPour') })));
      body.appendChild(bench);
      body.appendChild(ask);
      paintAsk();
      tick();
      if (!C.texDone(st).b) U.say('sci.texB', 'think');

      return function () {
        if (frame) cancelAnimationFrame(frame);
      };
    }

    // ================================================================
    // C. Name the texture
    // ================================================================
    function partC() {
      var host = h('div', { class: 'tex-c' });
      if (!view.c) view.c = { order: C.shuffle(['sandy', 'clayey', 'loamy'], C.rng(Date.now() % 100000)), i: 0, tried: [], solved: false };
      var c = view.c;

      function paintC() {
        U.clear(host);
        if (c.i >= 3) {
          host.appendChild(
            h('div', { class: 'card finish' }, h('h2', null, U.icon('check', 22), h('span', { text: SE.t('tex.c.done') })), U.btn({ class: 'btn-ghost', icon: 'reset', label: SE.t('tex.c.again'), on: function () {
              view.c = null;
              paint();
            } }))
          );
          return;
        }
        var kind = c.order[c.i];
        var tex = D.textures.filter(function (x) {
          return x.id === kind;
        })[0];
        var card = h('div', { class: 'card tex-card' });
        card.appendChild(h('p', { class: 'kicker', text: SE.t('tex.c.round', { n: c.i + 1 }) }));
        card.appendChild(
          h(
            'div',
            { class: 'tex-card-top' },
            U.picture(A.texSample(kind, 320, 200), 280, 175, 'tex-pic'),
            h('ul', { class: 'clues' }, tex.clues.map(function (cl) {
              return h('li', { text: SE.L(cl) });
            }))
          )
        );
        card.appendChild(h('h2', { text: SE.t('tex.c.q') }));
        var opts = U.options(
          C.WATER_KINDS.map(function (k) {
            return { id: k, label: SE.t('tex.' + k + '.s') };
          }),
          function (id, btn) {
            if (c.solved) return;
            if (id === kind) {
              U.judge(true, btn);
              c.solved = true;
              paintC();
            } else {
              U.judge(false, btn);
              c.tried.push(id);
              U.say('sci.try', 'oops');
              paintC();
            }
          },
          'options-row'
        );
        [].forEach.call(opts.children, function (b) {
          var id = b.getAttribute('data-id');
          if (c.tried.indexOf(id) >= 0) {
            b.disabled = true;
            b.classList.add('is-wrong');
          }
          if (c.solved) {
            b.disabled = true;
            if (id === kind) b.classList.add('is-right');
          }
        });
        card.appendChild(opts);
        if (c.solved) {
          card.appendChild(h('div', { class: 'explain' }, h('h3', null, U.icon('check', 18), h('span', { text: SE.t('tex.' + kind) })), h('p', { text: SE.L(tex.why) })));
          card.appendChild(U.btn({ class: 'btn-primary', label: SE.t(c.i === 2 ? 'fb.continue' : 'fb.next'), iconAfter: 'right', on: function () {
            c.i++;
            c.tried = [];
            c.solved = false;
            if (c.i >= 3) {
              st.tex.named = true;
              SE.save();
              checkDone();
            }
            paintC();
          } }));
        }
        host.appendChild(card);
      }

      body.appendChild(h('p', { class: 'lead', text: SE.t('tex.c.lead') }));
      body.appendChild(host);
      paintC();
      if (!C.texDone(st).c) U.say('sci.texC', 'point');
      return null;
    }

    root.appendChild(U.head('texture', 'tex.lead', tallyHost));
    root.appendChild(tabs);
    root.appendChild(body);
    paint();

    return function () {
      if (stop) stop();
    };
  }

  SE.screens.texture = { mount: mount };
})();
