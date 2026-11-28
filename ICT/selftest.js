/*
 * Soil Explorer checks: the map, the content, both languages and the game
 * rules. Runs under Node (tests/check.js) and in the browser, where
 * SE.selftest.run() returns the same list of results.
 */
(function () {
  'use strict';

  var SE = window.SE;
  var D = SE.data;
  var C = SE.core;
  var T = (SE.selftest = {});

  var DEVANAGARI = /[\u0900-\u097F]/;
  var LATIN = /[A-Za-z]/;

  function isPair(p) {
    return Array.isArray(p) && p.length === 2 && typeof p[0] === 'string' && typeof p[1] === 'string' && p[0].trim() !== '' && p[1].trim() !== '';
  }
  /** A proper pair: English on the left, Hindi script on the right. */
  function bilingual(p) {
    return isPair(p) && LATIN.test(p[0]) && !DEVANAGARI.test(p[0]) && DEVANAGARI.test(p[1]);
  }
  function holes(s) {
    return (s.match(/\{\w+\}/g) || []).sort().join(',');
  }

  T.run = function () {
    var out = [];
    function check(group, name, fn) {
      try {
        var r = fn();
        if (typeof r === 'boolean') r = { pass: r, detail: '' };
        out.push({ group: group, name: name, pass: !!r.pass, detail: r.detail || '' });
      } catch (e) {
        out.push({ group: group, name: name, pass: false, detail: 'Error: ' + (e && e.message ? e.message : e) });
      }
    }
    var geo = C.geo();
    var ids = geo.ids;

    // ----------------------------------------------------------------
    var G1 = 'Map of India';

    check(G1, 'The map has 36 regions: 28 states and 8 union territories', function () {
      var states = ids.filter(function (id) { return geo.regions[id].type === 'state'; }).length;
      var uts = ids.filter(function (id) { return geo.regions[id].type === 'ut'; }).length;
      return { pass: ids.length === 36 && states === 28 && uts === 8, detail: states + ' states, ' + uts + ' union territories.' };
    });

    check(G1, 'Every region on the map has soil information, and the other way round', function () {
      var a = ids.slice().sort().join(' ');
      var b = D.regions.map(function (r) { return r.id; }).sort().join(' ');
      return { pass: a === b && D.regions.length === 36, detail: a === b ? 'Same 36 identifiers on both sides.' : 'map: ' + a + ' | content: ' + b };
    });

    check(G1, 'Every region can be drawn and tapped: an outline, or dots for islands too small to outline', function () {
      var bad = ids.filter(function (id) {
        var r = geo.regions[id];
        return !(r.path.length > 10 || r.dots.length > 0);
      });
      var dotsOnly = ids.filter(function (id) { return !geo.regions[id].path; });
      return { pass: bad.length === 0, detail: bad.length ? 'Cannot draw: ' + bad.join(' ') : 'Dots only: ' + dotsOnly.join(' ') + '.' };
    });

    check(G1, 'The marker point of each outlined region lies inside that region', function () {
      var bad = ids.filter(function (id) {
        var r = geo.regions[id];
        return r.path && !C.inRegion(id, r.c[0], r.c[1]);
      });
      return { pass: bad.length === 0, detail: bad.length ? 'Outside: ' + bad.join(' ') : '' };
    });

    check(G1, 'No region claims a point inside another region', function () {
      var clash = [];
      ids.forEach(function (a) {
        var p = geo.regions[a].c;
        if (!geo.regions[a].path) return;
        ids.forEach(function (b) {
          if (a !== b && geo.regions[b].path && C.inRegion(b, p[0], p[1])) clash.push(a + ' in ' + b);
        });
      });
      return { pass: clash.length === 0, detail: clash.join('; ') };
    });

    check(G1, 'All borders stay inside the map frame, and every border line is used once or twice', function () {
      var ok = true;
      ids.forEach(function (id) {
        var b = geo.regions[id].box;
        if (b[0] < 0 || b[1] < 0 || b[2] > geo.width || b[3] > geo.height) ok = false;
      });
      var uses = SE.geo.arcs.map(function () { return 0; });
      Object.keys(SE.geo.regions).forEach(function (id) {
        SE.geo.regions[id].r.forEach(function (ring) {
          ring.forEach(function (i) { uses[i < 0 ? ~i : i]++; });
        });
      });
      var odd = uses.filter(function (n) { return n < 1 || n > 2; }).length;
      return { pass: ok && odd === 0, detail: SE.geo.arcs.length + ' border lines; ' + odd + ' used wrongly.' };
    });

    check(G1, 'Places are where they should be: Ladakh in the north, Kerala in the south, Gujarat in the west, Arunachal Pradesh in the east', function () {
      var c = function (id) { return geo.regions[id].c; };
      var north = ids.every(function (id) { return id === 'LA' || id === 'JK' || c('LA')[1] <= c(id)[1]; });
      var east = ids.every(function (id) { return c('AR')[0] >= c(id)[0]; });
      return { pass: north && east && c('KL')[1] > c('KA')[1] && c('GJ')[0] < c('MP')[0] && c('LD')[0] < c('KL')[0] && c('AN')[0] > c('TN')[0], detail: '' };
    });

    // ----------------------------------------------------------------
    var G2 = 'Soils and regions';

    check(G2, 'Six soils, each with clues, three dots, three layers and facts in both languages', function () {
      var bad = [];
      D.soils.forEach(function (s) {
        var pairs = [s.name, s.short, s.tag, s.formed, s.texture, s.water, s.crops, s.where, s.hint, s.micro, s.note, s.tip, s.match, s.matchWhy].concat(s.clues, s.keys);
        s.spots.forEach(function (p) { pairs.push(p.name, p.text); });
        s.layers.forEach(function (p) { pairs.push(p.name, p.text); });
        if (!pairs.every(bilingual) || s.clues.length !== 3 || s.spots.length !== 3 || s.layers.length !== 3 || s.keys.length !== 3) bad.push(s.id);
        if (s.confuse.length !== 2 || !s.confuse.every(function (id) { return D.soil(id) && id !== s.id; })) bad.push(s.id + ' options');
      });
      return { pass: D.soils.length === 6 && bad.length === 0, detail: bad.join(' ') };
    });

    check(G2, 'Dots sit on the sample: positions between 0 and 1 on the top or the cut face', function () {
      var bad = [];
      D.soils.forEach(function (s) {
        s.spots.forEach(function (p) {
          var a = p.at;
          if (!(a[0] === 'top' || a[0] === 'front') || !(a[1] > 0.05 && a[1] < 0.95 && a[2] > 0.05 && a[2] < 0.95)) bad.push(s.id + '.' + p.id);
        });
        s.layers.forEach(function (l, i) {
          if (!(l.t > 0 && l.t < 1) || (i && l.t <= s.layers[i - 1].t)) bad.push(s.id + ' layer ' + i);
        });
      });
      return { pass: bad.length === 0, detail: bad.join(' ') };
    });

    check(G2, 'Red soil and laterite soil each have an iron dot (for the Iron Detective badge)', function () {
      var has = function (id) { return D.soil(id).spots.some(function (p) { return p.id === 'iron' && p.iron; }); };
      return has('red') && has('laterite');
    });

    check(G2, 'Every region lists known soils, with a name, a fact and crops in both languages', function () {
      var bad = [];
      D.regions.forEach(function (r) {
        var soils = r.major.concat(r.also);
        var known = soils.every(function (id) { return !!D.soil(id); });
        var twice = soils.some(function (id, i) { return soils.indexOf(id) !== i; });
        if (!known || twice || !bilingual(r.name) || !bilingual(r.fact) || !bilingual(r.crops)) bad.push(r.id);
      });
      return { pass: bad.length === 0, detail: bad.join(' ') };
    });

    check(G2, 'No state is shown as having one soil only by default: most list more than one', function () {
      var states = D.regions.filter(function (r) { return geo.regions[r.id].type === 'state'; });
      var many = states.filter(function (r) { return r.major.length + r.also.length > 1; }).length;
      return { pass: many >= 16, detail: many + ' of ' + states.length + ' states list two or more soils.' };
    });

    check(G2, 'Only Lakshadweep falls outside the six groups, and it says why', function () {
      var none = D.regions.filter(function (r) { return r.major.length === 0; });
      return { pass: none.length === 1 && none[0].id === 'LD' && none[0].other === 'coral', detail: none.map(function (r) { return r.id; }).join(' ') };
    });

    check(G2, 'Every soil covers wide areas in at least one region, so every soil stamp can be earned', function () {
      var tally = D.soils.map(function (s) {
        return s.id + ' ' + D.regions.filter(function (r) { return r.major.indexOf(s.id) >= 0; }).length;
      });
      return { pass: tally.every(function (t) { return Number(t.split(' ')[1]) > 0; }), detail: tally.join(', ') + '.' };
    });

    check(G2, 'Textbook pairings hold: Rajasthan arid, Maharashtra black, Kerala laterite, Punjab alluvial, Tamil Nadu red, Himachal Pradesh forest', function () {
      var ok = [['RJ', 'arid'], ['MH', 'black'], ['KL', 'laterite'], ['PB', 'alluvial'], ['TN', 'red'], ['HP', 'forest'], ['UP', 'alluvial'], ['MP', 'black'], ['JH', 'red']].every(function (p) {
        return C.hasSoil(p[0], p[1]) === 'major';
      });
      return ok && C.hasSoil('GJ', 'arid') === 'also' && C.hasSoil('KL', 'arid') === null;
    });

    // ----------------------------------------------------------------
    var G3 = 'English and Hindi';

    check(G3, 'Every interface string exists in both languages', function () {
      var keys = Object.keys(SE.i18n.dict);
      var bad = keys.filter(function (k) { return !isPair(SE.i18n.dict[k]); });
      return { pass: bad.length === 0 && keys.length > 250, detail: keys.length + ' strings.' + (bad.length ? ' Missing: ' + bad.join(' ') : '') };
    });

    check(G3, 'Hindi strings are written in Devanagari', function () {
      var same = { 'tex.b.ml': true };
      var bad = Object.keys(SE.i18n.dict).filter(function (k) {
        return !same[k] && !DEVANAGARI.test(SE.i18n.dict[k][1]);
      });
      return { pass: bad.length === 0, detail: bad.join(' ') };
    });

    check(G3, 'Placeholders such as {n} match between the two languages', function () {
      var bad = Object.keys(SE.i18n.dict).filter(function (k) {
        return holes(SE.i18n.dict[k][0]) !== holes(SE.i18n.dict[k][1]);
      });
      return { pass: bad.length === 0, detail: bad.join(' ') };
    });

    check(G3, 'Switching language changes the words and nothing else', function () {
      var before = SE.i18n.lang;
      SE.i18n.set('en');
      var en = SE.t('nav.step', { n: 2, total: 8 }) + '|' + SE.L(D.soil('black').name);
      SE.i18n.set('hi');
      var hi = SE.t('nav.step', { n: 2, total: 8 }) + '|' + SE.L(D.soil('black').name);
      SE.i18n.set('xx');
      var fallback = SE.i18n.lang;
      SE.i18n.set(before);
      return { pass: en === 'Step 2 of 8|Black Soil' && hi === 'चरण 2 / 8|काली मिट्टी' && fallback === 'en' && SE.t('no.such.key') === 'no.such.key', detail: en + ' / ' + hi };
    });

    check(G3, 'Questions, missions and texture samples are complete in both languages', function () {
      var bad = [];
      D.questions.forEach(function (q) {
        var pairs = [q.q, q.why].concat(q.clues || []);
        if (q.kind === 'text') q.opts.forEach(function (o) { pairs.push(o.label); });
        if (!pairs.every(bilingual)) bad.push(q.id);
      });
      D.missions.forEach(function (m) {
        if (![m.clue, m.hint, m.why].every(bilingual) || holes(m.why[0]) !== holes(m.why[1])) bad.push(m.id);
      });
      D.textures.forEach(function (t) {
        if (!t.clues.concat([t.why]).every(bilingual) || t.clues.length !== 3) bad.push(t.id);
      });
      return { pass: bad.length === 0, detail: bad.join(' ') };
    });

    // ----------------------------------------------------------------
    var G4 = 'Scoring';

    check(G4, 'A right answer scores 10 and a wrong answer costs 5', function () {
      var s = C.fresh();
      var a = C.answer(s, true);
      var b = C.answer(s, false);
      return { pass: a.delta === 10 && b.delta === -5 && s.score === 5 && s.right === 1 && s.wrong === 1, detail: 'Score after one right and one wrong: ' + s.score + '.' };
    });

    check(G4, 'The score never goes below zero', function () {
      var s = C.fresh();
      var a = C.answer(s, false);
      C.answer(s, false);
      s.score = 3;
      var c = C.answer(s, false);
      return { pass: a.delta === 0 && c.delta === -3 && s.score === 0, detail: 'From 3 points, a wrong answer takes 3.' };
    });

    check(G4, 'Three right answers in a row earn a bonus of 10, and again at six', function () {
      var s = C.fresh();
      var bonus = [];
      for (var i = 0; i < 6; i++) bonus.push(C.answer(s, true).bonus);
      return { pass: bonus.join(',') === '0,0,10,0,0,10' && s.score === 80 && s.streak === 6, detail: 'Bonuses: ' + bonus.join(',') + '; score ' + s.score + '.' };
    });

    check(G4, 'A wrong answer breaks the streak', function () {
      var s = C.fresh();
      C.answer(s, true);
      C.answer(s, true);
      C.answer(s, false);
      var a = C.answer(s, true);
      var b = C.answer(s, true);
      var c = C.answer(s, true);
      return { pass: a.bonus === 0 && b.bonus === 0 && c.bonus === 10 && s.streak === 3, detail: '' };
    });

    check(G4, 'Accuracy is the share of right answers', function () {
      var s = C.fresh();
      var zero = C.accuracy(s);
      C.answer(s, true);
      C.answer(s, true);
      C.answer(s, true);
      C.answer(s, false);
      return { pass: zero === 0 && C.accuracy(s) === 75, detail: C.accuracy(s) + ' %.' };
    });

    // ----------------------------------------------------------------
    var G5 = 'Soil Hunt';

    check(G5, 'Every mission points at real regions, and soil missions only accept regions where that soil covers wide areas', function () {
      var bad = [];
      D.missions.forEach(function (m) {
        if (!m.accept.length || !m.accept.every(function (id) { return !!D.region(id); })) bad.push(m.id);
        if (m.type === 'soil' && !m.accept.every(function (id) { return C.hasSoil(id, m.soil) === 'major'; })) bad.push(m.id + ' soil');
        if (m.type === 'state' && m.accept.length !== 1) bad.push(m.id + ' state');
      });
      return { pass: bad.length === 0, detail: D.missions.length + ' missions.' + (bad.length ? ' Bad: ' + bad.join(' ') : '') };
    });

    check(G5, 'Soil missions without a place in the clue accept every region where the soil covers wide areas', function () {
      var bad = D.missions.filter(function (m) {
        if (m.type !== 'soil' || m.place) return false;
        var all = D.regions.filter(function (r) { return r.major.indexOf(m.soil) >= 0; }).map(function (r) { return r.id; });
        return m.id !== 'arid' && all.slice().sort().join() !== m.accept.slice().sort().join();
      });
      return { pass: bad.length === 0, detail: bad.map(function (m) { return m.id; }).join(' ') };
    });

    check(G5, 'Answers are judged right, close or wrong', function () {
      var m = function (id) { return D.missions.filter(function (x) { return x.id === id; })[0]; };
      var got = [C.judgeHunt(m('black'), 'MH'), C.judgeHunt(m('black'), 'KA'), C.judgeHunt(m('black'), 'KL'), C.judgeHunt(m('arid'), 'RJ'), C.judgeHunt(m('arid'), 'GJ'), C.judgeHunt(m('kerala'), 'KL'), C.judgeHunt(m('kerala'), 'TN'), C.judgeHunt(m('forest'), 'NL'), C.judgeHunt(m('lakshadweep'), 'LD')];
      return { pass: got.join(',') === 'right,near,wrong,right,near,right,wrong,near,right', detail: got.join(', ') };
    });

    check(G5, 'A hunt has six different missions, three of each kind, and hunts differ', function () {
      var ok = true;
      var seen = {};
      for (var seed = 1; seed <= 12; seed++) {
        var h = C.pickHunt(seed);
        var idsH = h.map(function (m) { return m.id; });
        if (h.length !== 6 || idsH.some(function (id, i) { return idsH.indexOf(id) !== i; })) ok = false;
        if (h.filter(function (m) { return m.type === 'soil'; }).length !== 3) ok = false;
        seen[idsH.join()] = true;
      }
      return { pass: ok && Object.keys(seen).length >= 6, detail: Object.keys(seen).length + ' different hunts from 12 seeds.' };
    });

    // ----------------------------------------------------------------
    var G6 = 'Detective quiz and lab';

    check(G6, 'Every question has its answer among the options', function () {
      var bad = D.questions.filter(function (q) {
        var idsQ = q.opts.map(C.optId);
        var known = q.kind === 'soil' ? idsQ.every(function (id) { return !!D.soil(id); }) : q.kind === 'tex' ? idsQ.every(function (id) { return !!C.water[id]; }) : true;
        return idsQ.indexOf(q.answer) < 0 || !known || idsQ.length < 2;
      });
      return { pass: bad.length === 0, detail: D.questions.length + ' questions.' + (bad.length ? ' Bad: ' + bad.map(function (q) { return q.id; }).join(' ') : '') };
    });

    check(G6, 'Picture questions show the soil they ask about, and map questions agree with the map data', function () {
      var bad = [];
      D.questions.forEach(function (q) {
        if (q.type === 'image' && q.image !== q.answer) bad.push(q.id);
        if (q.type === 'map') {
          if (!q.map.every(function (id) { return C.hasSoil(id, q.answer) === 'major'; })) bad.push(q.id);
          q.opts.forEach(function (o) {
            if (o !== q.answer && q.map.some(function (id) { return C.hasSoil(id, o) === 'major'; })) bad.push(q.id + ' has a second right answer');
          });
        }
      });
      return { pass: bad.length === 0, detail: bad.join('; ') };
    });

    check(G6, 'A quiz has eight different questions in at least five styles, and quizzes differ', function () {
      var ok = true;
      var seen = {};
      for (var seed = 1; seed <= 12; seed++) {
        var quiz = C.pickQuiz(seed);
        var idsQ = quiz.map(function (x) { return x.q.id; });
        var styles = {};
        quiz.forEach(function (x) {
          styles[x.q.type] = true;
          if (x.opts.map(C.optId).sort().join() !== x.q.opts.map(C.optId).sort().join()) ok = false;
        });
        if (quiz.length !== 8 || idsQ.some(function (id, i) { return idsQ.indexOf(id) !== i; }) || Object.keys(styles).length < 5) ok = false;
        seen[idsQ.join()] = true;
      }
      return { pass: ok && Object.keys(seen).length >= 6, detail: Object.keys(seen).length + ' different quizzes from 12 seeds.' };
    });

    check(G6, 'Each lab sample offers three different names, one of them right, and all six samples are on the bench', function () {
      var ok = D.soils.every(function (s) {
        var o = C.labOptions(s.id);
        return o.length === 3 && o.indexOf(s.id) >= 0 && o[0] !== o[1] && o[1] !== o[2] && o[0] !== o[2];
      });
      return ok && C.LAB_ORDER.slice().sort().join() === D.soils.map(function (s) { return s.id; }).sort().join();
    });

    check(G6, 'The six matching clues are all different', function () {
      var clues = D.soils.map(function (s) { return s.match[0]; });
      return clues.every(function (c, i) { return clues.indexOf(c) === i; });
    });

    // ----------------------------------------------------------------
    var G7 = 'Texture experiments';

    check(G7, 'Particle sizes keep their real proportions: clay 1, silt 25, sand 1000', function () {
      var p = C.particles;
      return { pass: Math.abs(p.silt / p.clay - 25) < 1e-9 && Math.abs(p.sand / p.clay - 1000) < 1e-9, detail: 'Largest clay ' + p.clay + ' mm, silt ' + p.silt + ' mm, sand ' + p.sand + ' mm.' };
    });

    check(G7, 'Water drains fastest through sandy soil and slowest through clayey soil', function () {
      var w = C.water;
      return { pass: w.sandy.front < w.loamy.front && w.loamy.front < w.clayey.front && w.sandy.end < w.loamy.end && w.loamy.end < w.clayey.end, detail: 'First drop after ' + w.sandy.front + ' s, ' + w.loamy.front + ' s and ' + w.clayey.front + ' s.' };
    });

    check(G7, 'Clayey soil holds the most water, sandy soil the least, loamy soil in between', function () {
      var held = C.WATER_KINDS.map(function (k) { return C.percolate(k, 1000).held; });
      return { pass: held[0] < held[1] && held[1] < held[2] && Math.abs(held[2] - 78) < 1e-9, detail: 'Held: ' + held.join(', ') + ' mL of 100.' };
    });

    check(G7, 'No water is lost or made: standing, held and drained water always add up to 100 mL', function () {
      var ok = true;
      C.WATER_KINDS.forEach(function (k) {
        var last = -1;
        for (var t = 0; t <= 40; t += 0.25) {
          var p = C.percolate(k, t);
          if (Math.abs(p.pond + p.held + p.drained - C.POUR) > 1e-9 || p.pond < 0 || p.held < -1e-9 || p.drained < last - 1e-9 || p.front < 0 || p.front > 1) ok = false;
          last = p.drained;
        }
        if (C.percolate(k, 0).pond !== C.POUR || C.percolate(k, 0).drained !== 0) ok = false;
      });
      return ok;
    });

    check(G7, 'Nothing drips before the wet front reaches the bottom', function () {
      return C.WATER_KINDS.every(function (k) {
        var w = C.water[k];
        return C.percolate(k, w.front - 0.01).drained === 0 && C.percolate(k, w.front + 0.5).drained > 0 && C.percolate(k, w.end).done;
      });
    });

    // ----------------------------------------------------------------
    var G8 = 'Progress and rewards';

    check(G8, 'Saved progress survives a round trip, and broken saves fall back to a fresh start', function () {
      var s = C.fresh();
      s.lang = 'hi';
      s.started = true;
      s.seen.lab = true;
      s.meet.parts.water = true;
      s.lab.named.black = true;
      C.visit(s, 'MH');
      C.visit(s, 'KL');
      C.answer(s, true);
      s.det.log.push({ id: 'tf-clay', picked: 'true', ok: true });
      var back = C.restore(JSON.parse(JSON.stringify(s)));
      var same = JSON.stringify(back) === JSON.stringify(s);
      var junk = [null, 'x', 7, [], { v: 99 }, { v: 1, score: 'lots', map: 5, stage: 'moon' }].every(function (j) {
        var r = C.restore(j);
        return r.score === 0 && r.stage === 'welcome' && Array.isArray(r.map.visited);
      });
      return { pass: same && junk, detail: same ? '' : 'Round trip changed the record.' };
    });

    check(G8, 'Unknown or repeated regions in a save are dropped', function () {
      var s = C.fresh();
      s.map.visited = ['MH', 'MH', 'ZZ', 'KL'];
      return C.restore(s).map.visited.join() === 'MH,KL';
    });

    check(G8, 'A region earns its stamp once only', function () {
      var s = C.fresh();
      return C.visit(s, 'RJ') === true && C.visit(s, 'RJ') === false && C.visit(s, 'ZZ') === false && s.map.visited.length === 1;
    });

    check(G8, 'Visiting all 36 regions earns all six soil stamps and the top rank', function () {
      var s = C.fresh();
      var ranks = [];
      D.regions.forEach(function (r) {
        C.visit(s, r.id);
        ranks.push(C.rank(s.map.visited.length).index);
      });
      var stamps = C.soilStamps(s);
      return { pass: s.map.visited.length === 36 && C.count(stamps) === 6 && C.rank(36).index === 4 && C.rank(36).next === null && C.rank(0).index === 0 && C.rank(2).next === 3 && C.rank(3).index === 1 && C.rank(12).index === 2 && C.rank(35).index === 3, detail: '' };
    });

    check(G8, 'Soil stamps come from regions where the soil covers wide areas', function () {
      var s = C.fresh();
      C.visit(s, 'GJ');
      var one = Object.keys(C.soilStamps(s)).join();
      C.visit(s, 'LD');
      return one === 'black' && Object.keys(C.soilStamps(s)).join() === 'black';
    });

    check(G8, 'Each step of the journey is ticked when its task is done', function () {
      var s = C.fresh();
      var none = C.stepsDone(s);
      s.started = true;
      ['minerals', 'water', 'air', 'humus'].forEach(function (p) { s.meet.parts[p] = true; });
      ['red', 'black', 'arid'].forEach(function (p) { s.lab.named[p] = true; });
      ['sand', 'silt', 'clay'].forEach(function (p) { s.tex.seen[p] = true; });
      var half = C.stageDone(s, 'texture');
      C.WATER_KINDS.forEach(function (p) { s.tex.poured[p] = true; });
      s.tex.waterQ = true;
      s.tex.named = true;
      ['MH', 'KL', 'RJ'].forEach(function (id) { C.visit(s, id); });
      var five = C.stepsDone(s);
      s.det.quizDone = true;
      s.seen.results = true;
      s.seen.revision = true;
      return { pass: none === 0 && !half && five === 5 && C.stepsDone(s) === 8, detail: none + ', ' + five + ', ' + C.stepsDone(s) + ' steps.' };
    });

    check(G8, 'Badges are earned for the right reasons', function () {
      var s = C.fresh();
      var start = C.BADGES.filter(function (b) { return C.badges(s)[b]; }).length;
      D.soils.forEach(function (x) { s.lab.named[x.id] = true; });
      s.lab.spots['red.iron'] = true;
      var noIron = C.badges(s).iron;
      s.lab.spots['laterite.iron'] = true;
      for (var i = 0; i < 12; i++) C.visit(s, D.regions[i].id);
      var noMap = C.badges(s).map;
      s.map.huntDone = true;
      s.det.quizDone = true;
      var b = C.badges(s);
      return { pass: start === 0 && !noIron && !noMap && b.explorer && b.iron && b.map && b.young && !b.texture, detail: '' };
    });

    check(G8, 'Search finds regions by English or Hindi name', function () {
      var names = function (q) { return C.search(q).map(function (r) { return r.id; }).join(); };
      return { pass: names('raj') === 'RJ' && names('केरल') === 'KL' && names('  KERALA ') === 'KL' && C.search('pradesh').length === 5 && names('') === '' && names('zzz') === '' && names('and').indexOf('AP,AN') === 0 && names('andaman') === 'AN', detail: 'pradesh: ' + names('pradesh') + '; and: ' + names('and') };
    });

    return out;
  };

  /** Short summary for the page or the console. */
  T.summary = function (results) {
    var failed = results.filter(function (r) { return !r.pass; });
    return { total: results.length, passed: results.length - failed.length, failed: failed };
  };
})();
