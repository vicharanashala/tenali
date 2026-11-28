/*
 * Soil Explorer screens 7 and 8: Final Results and Quick Revision.
 */
(function () {
  'use strict';

  var SE = window.SE;
  var C = SE.core;
  var U = SE.ui;
  var D = SE.data;
  var h = U.h;
  SE.screens = SE.screens || {};

  var BADGE_ICON = { explorer: 'lens', texture: 'drop', map: 'pin', iron: 'layers', young: 'star' };
  var BADGE_COLOUR = { explorer: '#a4532a', texture: '#5f93ad', map: '#3e6b46', iron: '#b5533a', young: '#c59a3d' };

  function badge(id, earned) {
    return h(
      'li',
      { class: 'badge' + (earned ? ' is-on' : ''), style: { '--c': BADGE_COLOUR[id] } },
      h('span', { class: 'badge-disc' }, U.icon(earned ? BADGE_ICON[id] : 'lock', 30)),
      h('strong', { text: SE.t('res.b.' + id) }),
      h('span', { class: 'badge-how', text: SE.t('res.b.' + id + '.how') }),
      h('span', { class: 'badge-state', text: SE.t(earned ? 'res.earned' : 'res.locked') })
    );
  }

  // ------------------------------------------------------------------
  // Final Results
  // ------------------------------------------------------------------
  function results(root) {
    var st = SE.state;
    var view = (SE.view.res = SE.view.res || { review: false });
    var done = st.det.quizDone;
    var badges = C.badges(st);
    var earned = C.BADGES.filter(function (b) {
      return badges[b];
    }).length;

    var head = h(
      'header',
      { class: 'page-head results-head' },
      h('p', { class: 'kicker', text: SE.t('nav.step', { n: 7, total: 8 }) }),
      h('h1', { tabindex: '-1', text: SE.t(done ? 'res.title' : 'res.early') }),
      h('p', { class: 'lead', text: SE.t(done ? 'res.lead' : 'res.earlyLead') })
    );
    root.appendChild(head);

    function stat(label, value, cls) {
      return h('div', { class: 'stat ' + (cls || '') }, h('dt', { text: label }), h('dd', { text: value }));
    }
    var stats = h(
      'dl',
      { class: 'stats' },
      stat(SE.t('res.score'), String(st.score), 'stat-score'),
      stat(SE.t('res.right'), String(st.right)),
      stat(SE.t('res.wrong'), String(st.wrong)),
      stat(SE.t('res.acc'), C.accuracy(st) + '%'),
      stat(SE.t('res.regions'), st.map.visited.length + ' / 36'),
      stat(SE.t('res.soils'), C.count(st.lab.named) + ' / 6')
    );
    root.appendChild(stats);

    root.appendChild(
      h('section', { class: 'badges' }, h('h2', null, h('span', { text: SE.t('res.badges') }), U.tally(earned + ' / ' + C.BADGES.length, earned === C.BADGES.length)), h('ul', { class: 'badge-list' }, C.BADGES.map(function (b) {
        return badge(b, badges[b]);
      })))
    );

    var review = h('section', { class: 'review' });
    function paintReview() {
      U.clear(review);
      if (!view.review) return;
      review.appendChild(h('h2', { text: SE.t('res.review') }));
      var log = st.det.log.filter(function (x) {
        return !!x;
      });
      if (!log.length) {
        review.appendChild(h('p', { text: SE.t('res.noReview') }));
        review.appendChild(U.btn({ class: 'btn-ghost', label: SE.t('res.toQuiz'), iconAfter: 'right', on: function () {
          SE.app.go('detective');
        } }));
        return;
      }
      review.appendChild(
        h(
          'ol',
          { class: 'review-list' },
          log.map(function (entry) {
            var q = D.questions.filter(function (x) {
              return x.id === entry.id;
            })[0];
            if (!q) return null;
            return h(
              'li',
              { class: 'card ' + (entry.ok ? 'is-right' : 'is-wrong') },
              h('h3', null, U.icon(entry.ok ? 'check' : 'cross', 18), h('span', { text: SE.L(q.q) })),
              q.clues ? h('p', { class: 'fine', text: q.clues.map(SE.L).join(' ') }) : null,
              q.map ? h('p', { class: 'fine', text: q.map.map(function (id) {
                return SE.L(D.region(id).name);
              }).join(', ') }) : null,
              h('p', null, h('b', { text: SE.t('res.your') + ': ' }), U.optLabel(q, entry.picked)),
              entry.ok ? null : h('p', null, h('b', { text: SE.t('res.correctAns') + ': ' }), U.optLabel(q, q.answer)),
              h('p', { class: 'why', text: SE.L(q.why) })
            );
          })
        )
      );
    }

    root.appendChild(
      h(
        'div',
        { class: 'btn-row results-actions' },
        U.btn({ class: 'btn-primary', icon: 'check', label: SE.t('res.review'), on: function () {
          view.review = !view.review;
          U.sound('tap');
          paintReview();
          if (view.review && review.scrollIntoView) review.scrollIntoView({ block: 'start', behavior: U.reducedMotion() ? 'auto' : 'smooth' });
        } }),
        U.btn({ class: 'btn-ghost', icon: 'pin', label: SE.t('res.explore'), on: function () {
          if (SE.view.map) SE.view.map.mode = 'explore';
          SE.app.go('india');
        } }),
        U.btn({ class: 'btn-ghost', icon: 'flag', label: SE.t('res.mission'), on: function () {
          SE.view.det = { phase: 'quiz' };
          SE.app.go('detective');
        } })
      )
    );
    root.appendChild(review);
    paintReview();

    if (done) {
      U.say(earned >= 3 ? 'sci.results' : 'sci.young', 'cheer');
      if (SE.view.celebrate) {
        SE.view.celebrate = false;
        setTimeout(function () {
          U.celebrate(stats, true);
        }, 250);
      }
    }
  }

  // ------------------------------------------------------------------
  // Quick Revision
  // ------------------------------------------------------------------
  function revision(root) {
    var view = (SE.view.rev = SE.view.rev || { flipped: {}, confirm: false });

    root.appendChild(U.head('revision', 'rev.lead'));
    var cards = h('div', { class: 'flip-cards' });
    D.soils.forEach(function (soil) {
      var card = h(
        'button',
        { type: 'button', class: 'flip' + (view.flipped[soil.id] ? ' is-flipped' : ''), 'aria-pressed': String(!!view.flipped[soil.id]), onclick: function () {
          view.flipped[soil.id] = !view.flipped[soil.id];
          card.classList.toggle('is-flipped', view.flipped[soil.id]);
          card.setAttribute('aria-pressed', String(view.flipped[soil.id]));
          U.sound('tap');
        } },
        h('span', { class: 'flip-face flip-front' }, U.swatch(soil.id, 220, 120), h('strong', { text: SE.L(soil.name) }), h('small', { text: SE.t('rev.flip') })),
        h('span', { class: 'flip-face flip-back' }, h('strong', { text: SE.L(soil.name) }), h('ul', null, soil.keys.map(function (k) {
          return h('li', { text: SE.L(k) });
        })))
      );
      cards.appendChild(card);
    });
    root.appendChild(cards);

    root.appendChild(
      h('section', { class: 'card keys' }, h('h2', { text: SE.t('rev.keys') }), h('ol', null, [1, 2, 3, 4, 5].map(function (n) {
        return h('li', { text: SE.t('rev.k' + n) });
      })))
    );

    var actions = h('div', { class: 'rev-actions' });
    function paintActions() {
      U.clear(actions);
      if (view.confirm) {
        actions.appendChild(
          h('div', { class: 'card confirm', role: 'alertdialog', 'aria-label': SE.t('rev.restart') }, h('p', { text: SE.t('rev.confirm') }), h('div', { class: 'btn-row' }, U.btn({ class: 'btn-danger', label: SE.t('rev.yes'), on: function () {
            SE.app.restart();
          } }), U.btn({ class: 'btn-primary', label: SE.t('rev.no'), on: function () {
            view.confirm = false;
            paintActions();
          } })))
        );
        return;
      }
      actions.appendChild(
        h('div', { class: 'btn-row' }, U.btn({ class: 'btn-primary', icon: 'home', label: SE.t('rev.home'), on: function () {
          SE.app.go('welcome');
        } }), U.btn({ class: 'btn-ghost', icon: 'reset', label: SE.t('rev.restart'), on: function () {
          view.confirm = true;
          paintActions();
        } }))
      );
    }
    root.appendChild(actions);
    paintActions();
    root.appendChild(h('p', { class: 'fine sources', text: SE.t('rev.sources') }));
    U.say('sci.revision', 'happy');
  }

  SE.screens.results = { mount: results };
  SE.screens.revision = { mount: revision };
})();
