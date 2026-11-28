/*
 * Soil Explorer screen 6: Soil Detective.
 *   Case 1  match each soil to its clue, by dragging or by tapping
 *   Case 2  an eight-question quiz in six styles, with no timer
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
    var view = (SE.view.det = SE.view.det || {});
    if (!view.phase) view.phase = !st.det.matched ? 'match' : st.det.quizDone ? 'done' : 'quiz';
    var body = h('div', { class: 'det-body' });
    var cases = h('div', { class: 'cases' });
    var tidy = null;

    function paint() {
      if (tidy) tidy();
      tidy = null;
      U.clear(cases);
      [['match', 'det.case1', st.det.matched], ['quiz', 'det.case2', st.det.quizDone]].forEach(function (c) {
        var on = view.phase === c[0] || (c[0] === 'quiz' && view.phase === 'done');
        cases.appendChild(
          h('button', { type: 'button', class: 'case' + (on ? ' is-on' : '') + (c[2] ? ' is-done' : ''), 'aria-pressed': String(on), onclick: function () {
            if (on) return;
            view.phase = c[0] === 'quiz' && st.det.quizDone && !view.quiz ? 'done' : c[0];
            U.sound('tap');
            paint();
          } }, c[2] ? U.icon('check', 16) : null, h('span', { text: SE.t(c[1]) }))
        );
      });
      U.clear(body);
      if (view.phase === 'match') tidy = match();
      else if (view.phase === 'quiz') quiz();
      else finished();
    }

    // ================================================================
    // Case 1: match the soil
    // ================================================================
    function match() {
      if (!view.order) {
        view.order = C.shuffle(D.soils.map(function (x) {
          return x.id;
        }), C.rng(st.det.runs * 13 + 5));
        view.placed = {};
        if (st.det.matched) {
          D.soils.forEach(function (x) {
            view.placed[x.id] = true;
          });
        }
        view.picked = null;
      }
      var tokens = h('div', { class: 'tokens' });
      var slots = h('div', { class: 'slots' });
      var status = h('p', { class: 'match-status', 'aria-live': 'polite' });
      var justDragged = false;
      var stopDrag = null;

      function token(id, cls) {
        return h('span', { class: 'token ' + (cls || '') }, U.swatch(id, 40, 40, 'swatch swatch-dot'), h('span', { text: SE.L(D.soil(id).short) }));
      }
      function left() {
        return D.soils.length - C.count(view.placed);
      }
      function place(soilId, slotSoil, slotEl) {
        if (view.placed[slotSoil]) return;
        if (soilId === slotSoil) {
          U.judge(true, slotEl);
          view.placed[soilId] = true;
          view.picked = null;
          if (left() === 0) {
            st.det.matched = true;
            SE.save();
            U.say('sci.matchDone', 'cheer');
            U.sound('win');
            U.celebrate(slots, true);
            paint();
            return;
          }
        } else {
          U.judge(false, slotEl);
          U.say('sci.try', 'oops');
        }
        paintMatch();
      }
      function slotAt(x, y) {
        var el = document.elementFromPoint(x, y);
        return el && el.closest ? el.closest('.slot') : null;
      }
      function drag(e, id, el) {
        if (e.button > 0 || stopDrag) return;
        var sx = e.clientX;
        var sy = e.clientY;
        var ghost = null;
        var over = null;
        function mv(ev) {
          if (!ghost) {
            if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 8) return;
            ghost = token(id, 'is-ghost');
            document.body.appendChild(ghost);
            el.classList.add('is-lifted');
          }
          ghost.style.transform = 'translate(' + (ev.clientX - 46) + 'px,' + (ev.clientY - 26) + 'px)';
          var now = slotAt(ev.clientX, ev.clientY);
          if (now !== over) {
            if (over) over.classList.remove('is-over');
            if (now && !view.placed[now.getAttribute('data-soil')]) now.classList.add('is-over');
            over = now;
          }
          ev.preventDefault();
        }
        function end(ev) {
          stopDrag();
          if (!ghost) return;
          var slot = ev.type === 'pointerup' ? slotAt(ev.clientX, ev.clientY) : null;
          justDragged = true;
          setTimeout(function () {
            justDragged = false;
          }, 0);
          if (slot) place(id, slot.getAttribute('data-soil'), slot);
        }
        stopDrag = function () {
          window.removeEventListener('pointermove', mv);
          window.removeEventListener('pointerup', end);
          window.removeEventListener('pointercancel', end);
          if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
          if (over) over.classList.remove('is-over');
          el.classList.remove('is-lifted');
          stopDrag = null;
        };
        window.addEventListener('pointermove', mv, { passive: false });
        window.addEventListener('pointerup', end);
        window.addEventListener('pointercancel', end);
      }

      function paintMatch() {
        U.clear(tokens);
        D.soils.forEach(function (soil) {
          if (view.placed[soil.id]) return;
          var on = view.picked === soil.id;
          var el = h(
            'button',
            { type: 'button', class: 'token' + (on ? ' is-on' : ''), 'aria-pressed': String(on), onclick: function () {
              if (justDragged) return;
              view.picked = on ? null : soil.id;
              U.sound('tap');
              paintMatch();
            }, onpointerdown: function (e) {
              drag(e, soil.id, el);
            } },
            U.swatch(soil.id, 40, 40, 'swatch swatch-dot'),
            h('span', { text: SE.L(soil.short) })
          );
          tokens.appendChild(el);
        });
        U.clear(slots);
        view.order.forEach(function (id) {
          var soil = D.soil(id);
          var done = !!view.placed[id];
          var el = h(
            done ? 'div' : 'button',
            { type: done ? null : 'button', class: 'slot' + (done ? ' is-done' : '') + (view.picked && !done ? ' is-ready' : ''), 'data-soil': id, onclick: done ? null : function () {
              if (view.picked) place(view.picked, id, el);
              else {
                status.textContent = SE.t('det.matchLead');
                U.sound('tap');
              }
            } },
            h('span', { class: 'slot-clue', text: SE.L(soil.match) }),
            done ? token(id, 'is-set') : h('span', { class: 'slot-drop', text: SE.t('det.drop') }),
            done ? h('span', { class: 'slot-why', text: SE.L(soil.matchWhy) }) : null
          );
          slots.appendChild(el);
        });
        status.textContent = view.picked ? SE.t('det.picked', { name: U.soilName(view.picked) }) : left() ? SE.t('det.left', { n: left() }) : SE.t('det.matchDone');
      }

      body.appendChild(h('p', { class: 'lead', text: SE.t('det.matchLead') }));
      body.appendChild(h('div', { class: 'match' }, h('div', { class: 'match-left' }, tokens, status), slots));
      if (left() === 0) {
        body.appendChild(h('div', { class: 'btn-row' }, U.btn({ class: 'btn-primary', label: SE.t('det.toQuiz'), iconAfter: 'right', on: function () {
          startQuiz();
        } })));
      }
      paintMatch();
      if (left()) U.say('sci.match', 'think');
      return function () {
        if (stopDrag) stopDrag();
      };
    }

    // ================================================================
    // Case 2: the quiz
    // ================================================================
    function startQuiz() {
      view.phase = 'quiz';
      view.quiz = { seed: st.det.runs + 1, i: 0, answer: null };
      st.det.log = [];
      SE.save();
      U.say('sci.quiz', 'happy');
      paint();
    }

    function quiz() {
      if (!view.quiz) {
        body.appendChild(
          h('div', { class: 'card quiz-intro' }, h('h2', { text: SE.t('det.case2') }), h('p', { class: 'rules', text: SE.t('det.rules') }), U.btn({ class: 'btn-primary', label: SE.t('det.toQuiz'), iconAfter: 'right', on: startQuiz }))
        );
        return;
      }
      var Q = view.quiz;
      var items = C.pickQuiz(Q.seed);
      var item = items[Q.i];
      var q = item.q;
      var card = h('div', { class: 'card quiz-card' });
      card.appendChild(
        h('div', { class: 'quiz-progress', role: 'img', 'aria-label': SE.t('det.q', { n: Q.i + 1, total: items.length }) }, items.map(function (it, i) {
          var past = st.det.log[i];
          return h('i', { class: i === Q.i ? 'is-here' : past ? (past.ok ? 'is-right' : 'is-wrong') : '' });
        }))
      );
      card.appendChild(h('p', { class: 'kicker', text: SE.t('det.q', { n: Q.i + 1, total: items.length }) + ' · ' + SE.t('det.' + q.type) }));
      card.appendChild(h('h2', { text: SE.L(q.q) }));

      if (q.type === 'image') card.appendChild(U.picture(A.soilTop(q.image, 256).canvas, 320, 200, 'quiz-pic'));
      else if (q.type === 'map') card.appendChild(U.miniMap(q.map, SE.t('det.mapAlt')));
      else if (q.type === 'mystery') {
        card.appendChild(h('ul', { class: 'clues' }, q.clues.map(function (c) {
          return h('li', { text: SE.L(c) });
        })));
      }

      var opts = U.options(
        item.opts.map(function (o) {
          var id = C.optId(o);
          return { id: id, label: U.optLabel(q, id) };
        }),
        function (id, btn) {
          if (Q.answer) return;
          var ok = id === q.answer;
          var r = U.judge(ok, btn);
          Q.answer = { picked: id, ok: ok, lost: r.delta };
          st.det.log[Q.i] = { id: q.id, picked: id, ok: ok };
          SE.save();
          paint();
        },
        q.kind === 'tf' ? 'options-row' : ''
      );
      if (Q.answer) {
        [].forEach.call(opts.children, function (b) {
          var id = b.getAttribute('data-id');
          b.disabled = true;
          if (id === q.answer) b.classList.add('is-right');
          else if (id === Q.answer.picked) b.classList.add('is-wrong');
        });
      }
      card.appendChild(opts);

      if (Q.answer) {
        var last = Q.i === items.length - 1;
        card.appendChild(
          h(
            'div',
            { class: 'explain ' + (Q.answer.ok ? 'is-right' : 'is-wrong'), 'aria-live': 'polite' },
            h('h3', null, U.icon(Q.answer.ok ? 'check' : 'cross', 18), h('span', { text: Q.answer.ok ? SE.t('fb.correct') : SE.t(Q.answer.lost < 0 ? 'fb.wrong' : 'fb.wrongFree') })),
            Q.answer.ok ? null : h('p', null, h('b', { text: SE.t('fb.answer') + ': ' }), U.optLabel(q, q.answer)),
            h('p', { text: SE.L(q.why) })
          )
        );
        var nextBtn = U.btn({ class: 'btn-primary', label: SE.t(last ? 'det.finish' : 'fb.next'), iconAfter: 'right', on: function () {
          if (last) finishQuiz();
          else {
            Q.i++;
            Q.answer = null;
            paint();
            var head = body.querySelector('h2');
            if (head && head.scrollIntoView && window.innerWidth < 900) head.scrollIntoView({ block: 'start' });
          }
        } });
        card.appendChild(nextBtn);
      }
      body.appendChild(card);
      body.appendChild(h('p', { class: 'fine rules', text: SE.t('det.rules') }));
    }

    function finishQuiz() {
      var right = st.det.log.filter(function (x) {
        return x && x.ok;
      }).length;
      st.score += C.FINISH_BONUS;
      st.det.quizDone = true;
      st.det.runs++;
      st.det.right = right;
      st.det.wrong = st.det.log.length - right;
      view.quiz = null;
      view.phase = 'done';
      view.order = null;
      SE.save();
      U.toast(SE.t('det.bonus'), 'bonus');
      U.sound('win');
      SE.view.celebrate = true;
      SE.app.go('results');
    }

    function finished() {
      body.appendChild(
        h(
          'div',
          { class: 'card finish' },
          h('h2', null, U.icon('star', 22), h('span', { text: SE.t('det.case2') })),
          h('p', { text: SE.t('res.right') + ': ' + st.det.right + ' / ' + (st.det.right + st.det.wrong) }),
          h('p', { class: 'fine rules', text: SE.t('det.rules') }),
          h('div', { class: 'btn-row' }, U.btn({ class: 'btn-primary', label: SE.t('det.finish'), iconAfter: 'right', on: function () {
            SE.app.go('results');
          } }), U.btn({ class: 'btn-ghost', icon: 'reset', label: SE.t('res.mission'), on: startQuiz }))
        )
      );
    }

    root.appendChild(U.head('detective', 'det.lead'));
    root.appendChild(cases);
    root.appendChild(body);
    paint();

    return function () {
      if (tidy) tidy();
    };
  }

  SE.screens.detective = { mount: mount };
})();
