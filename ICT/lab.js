/*
 * Soil Explorer screen 3: Soil Lab.
 * One large 3D sample at a time. The child turns it, reads the clues and
 * names the soil; that unlocks the glowing dots (what is inside), the
 * magnifier and the numbered layers of the cut face.
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

  function mount(root) {
    var st = SE.state;
    var view = (SE.view.lab = SE.view.lab || {});
    if (!view.soil || !D.soil(view.soil)) {
      view.soil = C.LAB_ORDER.filter(function (id) {
        return !st.lab.named[id];
      })[0] || C.LAB_ORDER[0];
    }
    view.tried = view.tried || {};
    var viewer = null;
    var dead = false;

    var bench = h('div', { class: 'bench', role: 'group', 'aria-label': SE.t('lab.samples') });
    var host = h('div', { class: 'viewer' });
    var marks = h('div', { class: 'marks' });
    var lens = h('div', { class: 'lens', hidden: true });
    var catcher = h('div', { class: 'lens-catch', hidden: true });
    var loading = h('p', { class: 'viewer-note', text: SE.t('lab.loading') });
    var stage = h('div', { class: 'viewer-wrap' }, host, marks, catcher, lens, loading);
    var tools = h('div', { class: 'tools', role: 'toolbar' });
    var hint = h('p', { class: 'fine viewer-hint' });
    var panel = h('div', { class: 'card lab-panel' });
    var tallyHost = h('div', { class: 'tally-row' });
    var spotEls = [];
    var layerEls = [];

    function soil() {
      return D.soil(view.soil);
    }
    function named() {
      return !!st.lab.named[view.soil];
    }
    function sampleNo(id) {
      return C.LAB_ORDER.indexOf(id) + 1;
    }

    // ---- sample picker ----
    function paintBench() {
      U.clear(bench);
      C.LAB_ORDER.forEach(function (id) {
        var known = !!st.lab.named[id];
        bench.appendChild(
          h(
            'button',
            { type: 'button', class: 'sample' + (id === view.soil ? ' is-on' : '') + (known ? ' is-named' : ''), 'aria-pressed': String(id === view.soil), onclick: function () {
              choose(id);
            } },
            U.swatch(id, 46, 46, 'swatch swatch-dot'),
            h('span', { class: 'sample-name', text: known ? SE.L(D.soil(id).short) : SE.t('lab.sample', { n: sampleNo(id) }) }),
            known ? U.icon('check', 16) : null
          )
        );
      });
      U.clear(tallyHost);
      var n = C.count(st.lab.named);
      tallyHost.appendChild(U.tally(SE.t('lab.identified', { n: n }), n >= 6));
    }

    function choose(id) {
      if (id === view.soil) return;
      view.soil = id;
      view.tool = null;
      view.spot = null;
      view.layer = null;
      U.sound('tap');
      paintBench();
      paintTools();
      paintPanel();
      showSoil(true);
    }

    // ---- the 3D sample ----
    function showSoil(reset) {
      if (!viewer) return;
      loading.hidden = false;
      loading.textContent = SE.t('lab.loading');
      setTimeout(function () {
        if (dead) return;
        viewer.setSoil(view.soil);
        if (reset) viewer.resetView();
        loading.hidden = !viewer.fallback;
        if (viewer.fallback) loading.textContent = SE.t('lab.no3d');
        viewer.canvas.setAttribute('role', 'img');
        viewer.canvas.setAttribute('aria-label', (named() ? SE.L(soil().name) : SE.t('lab.sample', { n: sampleNo(view.soil) })) + '. ' + SE.t('lab.drag'));
        buildMarks();
        paintLens();
      }, 30);
    }

    function buildMarks() {
      U.clear(marks);
      spotEls = soil().spots.map(function (spot) {
        var el = h('button', { type: 'button', class: 'spot', 'aria-label': SE.L(spot.name), onclick: function () {
          openSpot(spot.id);
        } }, h('i'));
        marks.appendChild(el);
        return { el: el, spot: spot };
      });
      layerEls = soil().layers.map(function (layer, i) {
        var el = h('button', { type: 'button', class: 'layer-mark', 'aria-label': SE.L(layer.name), onclick: function () {
          openLayer(i);
        } }, String(i + 1));
        marks.appendChild(el);
        return { el: el, at: ['front', 0.9, layer.t], i: i };
      });
      place();
    }
    /** Keep the dots glued to the sample as it turns. */
    function place() {
      if (!viewer || viewer.soil() !== view.soil) return;
      var open = named();
      spotEls.forEach(function (m) {
        var p = viewer.project(m.spot.at);
        var show = open && p.visible && view.tool !== 'mag';
        m.el.hidden = !show;
        m.el.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)';
        m.el.classList.toggle('is-open', !!st.lab.spots[view.soil + '.' + m.spot.id]);
        m.el.classList.toggle('is-on', view.spot === m.spot.id);
      });
      layerEls.forEach(function (m) {
        var p = viewer.project(m.at);
        m.el.hidden = !(open && view.tool === 'cut' && p.visible);
        m.el.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)';
        m.el.classList.toggle('is-on', view.layer === m.i);
      });
    }

    function openSpot(id) {
      var key = view.soil + '.' + id;
      view.spot = id;
      if (!st.lab.spots[key]) {
        st.lab.spots[key] = true;
        SE.save();
      }
      U.sound('tap');
      place();
      paintPanel();
      var row = panel.querySelector('.inside .is-on');
      if (row && row.scrollIntoView && window.innerWidth < 900) row.scrollIntoView({ block: 'nearest', behavior: U.reducedMotion() ? 'auto' : 'smooth' });
    }
    function openLayer(i) {
      view.layer = i;
      st.lab.layers[view.soil + '.' + i] = true;
      SE.save();
      U.sound('tap');
      place();
      paintPanel();
    }

    // ---- tools ----
    function setTool(tool) {
      view.tool = view.tool === tool ? null : tool;
      U.sound('tap');
      if (viewer) {
        if (view.tool === 'cut') {
          viewer.lookAt('front');
          U.say(named() ? 'sci.cut' : 'sci.look', 'point');
        } else if (tool === 'cut') viewer.lookAt('home');
        if (view.tool === 'mag') U.say('sci.mag', 'think');
      }
      paintTools();
      paintLens();
      paintPanel();
      place();
    }
    function paintTools() {
      U.clear(tools);
      tools.appendChild(U.btn({ class: 'btn-tool', icon: 'lens', label: SE.t('lab.mag'), pressed: view.tool === 'mag', on: function () {
        setTool('mag');
      } }));
      tools.appendChild(U.btn({ class: 'btn-tool', icon: 'layers', label: SE.t('lab.cut'), pressed: view.tool === 'cut', on: function () {
        setTool('cut');
      } }));
      tools.appendChild(h('span', { class: 'tools-gap' }));
      tools.appendChild(U.btn({ class: 'btn-icon', icon: 'plus', title: SE.t('lab.zoomIn'), on: function () {
        if (viewer) viewer.zoomBy(0.84);
      } }));
      tools.appendChild(U.btn({ class: 'btn-icon', icon: 'minus', title: SE.t('lab.zoomOut'), on: function () {
        if (viewer) viewer.zoomBy(1.19);
      } }));
      tools.appendChild(U.btn({ class: 'btn-icon', icon: 'reset', title: SE.t('lab.reset'), on: function () {
        view.tool = null;
        if (viewer) viewer.resetView();
        paintTools();
        paintLens();
        paintPanel();
        place();
      } }));
      hint.textContent = SE.t(view.tool === 'mag' ? 'lab.magHint' : 'lab.drag');
    }

    // ---- magnifier ----
    var LENS = 176;
    function paintLens() {
      var on = view.tool === 'mag';
      lens.hidden = !on;
      catcher.hidden = !on;
      if (!on) return;
      U.clear(lens);
      var pic = U.picture(A.micro(view.soil, 320), 300, 300, 'lens-pic');
      lens.appendChild(pic);
      var box = stage.getBoundingClientRect();
      moveLens(box.width / 2, box.height / 2);
    }
    function moveLens(x, y) {
      var box = stage.getBoundingClientRect();
      x = Math.min(box.width - 30, Math.max(30, x));
      y = Math.min(box.height - 30, Math.max(30, y));
      lens.style.transform = 'translate(' + (x - LENS / 2).toFixed(1) + 'px,' + (y - LENS / 2).toFixed(1) + 'px)';
      var pic = lens.firstChild;
      if (pic) pic.style.transform = 'translate(' + (-62 - (x / box.width - 0.5) * 110).toFixed(1) + 'px,' + (-62 - (y / box.height - 0.5) * 110).toFixed(1) + 'px)';
    }
    function lensMove(e) {
      var box = stage.getBoundingClientRect();
      moveLens(e.clientX - box.left, e.clientY - box.top);
    }
    catcher.addEventListener('pointermove', lensMove);
    catcher.addEventListener('pointerdown', lensMove);

    // ---- the panel beside the sample ----
    function fact(key, pair) {
      return [h('dt', { text: SE.t(key) }), h('dd', { text: SE.L(pair) })];
    }
    function paintPanel() {
      var so = soil();
      U.clear(panel);
      if (view.tool === 'mag') {
        panel.appendChild(h('div', { class: 'note-box' }, h('h3', null, U.icon('lens', 18), h('span', { text: SE.t('lab.magLabel') })), h('p', { text: SE.L(so.micro) })));
      }
      if (!named()) {
        var tried = view.tried[so.id] || [];
        panel.appendChild(h('p', { class: 'kicker', text: SE.t('lab.sample', { n: sampleNo(so.id) }) }));
        panel.appendChild(h('h2', { text: SE.t('lab.mystery') }));
        panel.appendChild(h('h3', { class: 'small-head', text: SE.t('lab.clues') }));
        panel.appendChild(h('ul', { class: 'clues' }, so.clues.map(function (c) {
          return h('li', { text: SE.L(c) });
        })));
        var opts = U.options(
          C.labOptions(so.id).map(function (id) {
            return { id: id, label: U.soilName(id) };
          }),
          function (id, btn) {
            if (id === so.id) {
              U.judge(true, btn);
              st.lab.named[so.id] = true;
              SE.save();
              if (viewer) viewer.spin();
              var all = C.count(st.lab.named) >= 6;
              U.say(all ? 'sci.labAll' : 'sci.labSpots', all ? 'cheer' : 'point');
              if (all) U.celebrate(stage, true);
              paintBench();
              paintPanel();
              showSoil(false);
            } else {
              U.judge(false, btn);
              view.tried[so.id] = tried.concat([id]);
              U.say('sci.try', 'oops');
              paintPanel();
            }
          }
        );
        tried.forEach(function (id) {
          var b = opts.querySelector('[data-id="' + id + '"]');
          if (b) {
            b.disabled = true;
            b.classList.add('is-wrong');
          }
        });
        panel.appendChild(opts);
        if (tried.length) panel.appendChild(h('p', { class: 'hint-box' }, h('b', { text: SE.t('fb.hint') + ': ' }), SE.L(so.hint)));
        panel.appendChild(h('p', { class: 'fine locked' }, U.icon('lock', 16), h('span', { text: SE.t('lab.locked') })));
        return;
      }

      panel.appendChild(h('p', { class: 'kicker', text: SE.L(so.tag) }));
      panel.appendChild(h('h2', { class: 'reveal', text: SE.t('lab.reveal', { name: SE.L(so.name) }) }));

      if (view.tool === 'cut') {
        panel.appendChild(h('h3', { class: 'small-head', text: SE.t('lab.layers') }));
        panel.appendChild(
          h(
            'ol',
            { class: 'inside layers-list' },
            so.layers.map(function (layer, i) {
              var on = view.layer === i;
              return h('li', { class: on ? 'is-on' : '' }, h('button', { type: 'button', 'aria-expanded': String(on), onclick: function () {
                openLayer(i);
              } }, h('b', { text: String(i + 1) }), h('span', { text: SE.L(layer.name) })), on ? h('p', { text: SE.L(layer.text) }) : null);
            })
          )
        );
      }

      var opened = so.spots.filter(function (sp) {
        return st.lab.spots[so.id + '.' + sp.id];
      }).length;
      panel.appendChild(h('h3', { class: 'small-head' }, h('span', { text: SE.t('lab.inside') }), U.tally(SE.t('lab.spots', { n: opened, total: so.spots.length }), opened >= so.spots.length)));
      panel.appendChild(
        h(
          'ul',
          { class: 'inside' },
          so.spots.map(function (sp) {
            var on = view.spot === sp.id;
            var seen = !!st.lab.spots[so.id + '.' + sp.id];
            return h('li', { class: (on ? 'is-on' : '') + (seen ? ' is-seen' : '') }, h('button', { type: 'button', 'aria-expanded': String(on), onclick: function () {
              openSpot(sp.id);
            } }, h('i', { class: 'dot' }), h('span', { text: SE.L(sp.name) })), on ? h('p', { text: SE.L(sp.text) }) : null);
          })
        )
      );

      panel.appendChild(h('dl', { class: 'facts' }, fact('lab.formed', so.formed), fact('lab.texture', so.texture), fact('lab.water', so.water), fact('lab.crops', so.crops), fact('lab.where', so.where)));
      panel.appendChild(h('p', { class: 'hint-box' }, h('b', { text: SE.t('lab.note') + ': ' }), SE.L(so.note)));
    }

    // ---- put it together ----
    root.appendChild(U.head('lab', 'lab.lead', tallyHost));
    root.appendChild(h('section', { class: 'lab' }, bench, h('div', { class: 'lab-stage' }, stage, tools, hint), panel));
    paintBench();
    paintTools();
    paintPanel();

    // The 3D scene is only built now, when the lab is actually opened.
    var starter = setTimeout(function () {
      if (dead) return;
      viewer = SE.viewer3d.create(host, { onChange: place });
      showSoil(false);
    }, 60);

    if (C.count(st.lab.named) < 6) U.say(named() ? 'sci.labSpots' : 'sci.lab', named() ? 'point' : 'think');

    return function () {
      dead = true;
      clearTimeout(starter);
      if (viewer) viewer.destroy();
    };
  }

  SE.screens.lab = { mount: mount };
})();
