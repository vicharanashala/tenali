/*
 * Soil Explorer core: the rules of the game, with no drawing in them.
 * Progress and scoring, the map geometry, the Soil Hunt and quiz judges and
 * the water experiment model. Nothing here touches the page, so the same
 * file runs under Node for tests/check.js.
 */
(function () {
  'use strict';

  var SE = window.SE;
  var D = SE.data;
  var C = (SE.core = {});

  C.STAGES = ['welcome', 'meet', 'lab', 'texture', 'india', 'detective', 'results', 'revision'];
  C.STORE = 'soilexplorer.progress.v1';
  C.LAB_ORDER = ['red', 'alluvial', 'forest', 'black', 'arid', 'laterite'];

  // ------------------------------------------------------------------
  // Small helpers
  // ------------------------------------------------------------------
  C.clamp = function (v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  };

  /** Repeatable random numbers, so a run can be replayed in a test. */
  C.rng = function (seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  C.shuffle = function (list, rnd) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  };

  // ------------------------------------------------------------------
  // Progress
  // ------------------------------------------------------------------
  C.fresh = function () {
    return {
      v: 1,
      lang: 'en',
      sound: true,
      stage: 'welcome',
      started: false,
      seen: {},
      score: 0,
      streak: 0,
      right: 0,
      wrong: 0,
      home: { dug: 0 },
      meet: { parts: {} },
      lab: { named: {}, spots: {}, layers: {} },
      tex: { seen: {}, poured: {}, waterQ: false, named: false },
      map: { visited: [], hunts: 0, huntDone: false, huntRight: 0, huntTotal: 0 },
      det: { matched: false, runs: 0, quizDone: false, right: 0, wrong: 0, log: [] }
    };
  };

  /** Lay saved progress over a fresh record, so older saves never lack a field. */
  C.restore = function (saved) {
    var s = C.fresh();
    if (!saved || typeof saved !== 'object' || saved.v !== 1) return s;
    Object.keys(s).forEach(function (k) {
      var v = saved[k];
      if (v === undefined || v === null) return;
      if (typeof s[k] === 'object' && !Array.isArray(s[k])) {
        if (typeof v !== 'object' || Array.isArray(v)) return;
        if (!Object.keys(s[k]).length) {
          s[k] = v; // an open list of ticks, such as the steps already seen
          return;
        }
        Object.keys(s[k]).forEach(function (kk) {
          if (v[kk] !== undefined && v[kk] !== null && typeof v[kk] === typeof s[k][kk]) s[k][kk] = v[kk];
        });
      } else if (typeof v === typeof s[k]) {
        s[k] = v;
      }
    });
    if (C.STAGES.indexOf(s.stage) < 0) s.stage = 'welcome';
    s.map.visited = s.map.visited.filter(function (id, i, a) {
      return !!D.region(id) && a.indexOf(id) === i;
    });
    s.score = Math.max(0, Math.round(s.score) || 0);
    return s;
  };

  // ------------------------------------------------------------------
  // Scoring: right +10, wrong -5 (never below zero), +10 for every third
  // right answer in a row, +20 for finishing the detective quiz.
  // ------------------------------------------------------------------
  C.RIGHT = 10;
  C.WRONG = 5;
  C.STREAK_EVERY = 3;
  C.STREAK_BONUS = 10;
  C.FINISH_BONUS = 20;

  C.answer = function (s, correct) {
    var out = { correct: !!correct, delta: 0, bonus: 0 };
    if (correct) {
      s.right++;
      s.streak++;
      out.delta = C.RIGHT;
      if (s.streak % C.STREAK_EVERY === 0) out.bonus = C.STREAK_BONUS;
      s.score += out.delta + out.bonus;
    } else {
      var lose = Math.min(C.WRONG, s.score);
      s.wrong++;
      s.streak = 0;
      s.score -= lose;
      out.delta = -lose;
    }
    out.score = s.score;
    out.streak = s.streak;
    return out;
  };

  C.accuracy = function (s) {
    var n = s.right + s.wrong;
    return n ? Math.round((100 * s.right) / n) : 0;
  };

  // ------------------------------------------------------------------
  // What counts as finishing each step of the journey
  // ------------------------------------------------------------------
  function count(obj) {
    return Object.keys(obj).filter(function (k) {
      return !!obj[k];
    }).length;
  }
  C.count = count;

  C.texDone = function (s) {
    return {
      a: count(s.tex.seen) >= 3,
      b: count(s.tex.poured) >= 3 && s.tex.waterQ,
      c: s.tex.named
    };
  };

  C.stageDone = function (s, id) {
    switch (id) {
      case 'welcome':
        return s.started;
      case 'meet':
        return count(s.meet.parts) >= 4;
      case 'lab':
        return count(s.lab.named) >= 3;
      case 'texture':
        var t = C.texDone(s);
        return t.a && t.b && t.c;
      case 'india':
        return s.map.visited.length >= 3;
      case 'detective':
        return s.det.quizDone;
      case 'results':
        return s.det.quizDone && !!s.seen.results;
      case 'revision':
        return !!s.seen.revision;
    }
    return false;
  };

  C.stepsDone = function (s) {
    return C.STAGES.filter(function (id) {
      return C.stageDone(s, id);
    }).length;
  };

  // ------------------------------------------------------------------
  // Soils and regions
  // ------------------------------------------------------------------
  /** 'major', 'also' or null: how far a soil spreads in a region. */
  C.hasSoil = function (regionId, soilId) {
    var r = D.region(regionId);
    if (!r) return null;
    if (r.major.indexOf(soilId) >= 0) return 'major';
    if (r.also.indexOf(soilId) >= 0) return 'also';
    return null;
  };

  /** Record a visit. Returns true the first time a region is explored. */
  C.visit = function (s, regionId) {
    if (!D.region(regionId) || s.map.visited.indexOf(regionId) >= 0) return false;
    s.map.visited.push(regionId);
    return true;
  };

  /** Soils the explorer has met: a visited region where the soil covers wide areas. */
  C.soilStamps = function (s) {
    var out = {};
    s.map.visited.forEach(function (id) {
      D.region(id).major.forEach(function (soil) {
        out[soil] = true;
      });
    });
    return out;
  };

  C.RANKS = [0, 3, 12, 24, 36];
  C.rank = function (n) {
    var i = 0;
    while (i < C.RANKS.length - 1 && n >= C.RANKS[i + 1]) i++;
    return { index: i, next: i < C.RANKS.length - 1 ? C.RANKS[i + 1] : null };
  };

  C.badges = function (s) {
    var t = C.texDone(s);
    return {
      explorer: count(s.lab.named) >= 6,
      texture: t.a && t.b && t.c,
      map: s.map.visited.length >= 12 && s.map.huntDone,
      iron: !!s.lab.spots['red.iron'] && !!s.lab.spots['laterite.iron'],
      young: s.det.quizDone
    };
  };
  C.BADGES = ['explorer', 'texture', 'map', 'iron', 'young'];

  /** Find regions by English or Hindi name. Names that start with the text come first. */
  C.search = function (text) {
    var q = String(text || '').trim().toLowerCase();
    if (!q) return [];
    var starts = [];
    var holds = [];
    D.regions.forEach(function (r) {
      var en = r.name[0].toLowerCase();
      var hi = r.name[1];
      if (en.indexOf(q) === 0 || hi.indexOf(q) === 0 || r.id.toLowerCase() === q) starts.push(r);
      else if (en.indexOf(q) > 0 || hi.indexOf(q) > 0) holds.push(r);
    });
    return starts.concat(holds).slice(0, 6);
  };

  // ------------------------------------------------------------------
  // The soil lab: three names to choose from for each sample
  // ------------------------------------------------------------------
  C.labOptions = function (soilId) {
    var soil = D.soil(soilId);
    var seed = 0;
    for (var i = 0; i < soilId.length; i++) seed = seed * 31 + soilId.charCodeAt(i);
    return C.shuffle([soilId].concat(soil.confuse), C.rng(seed));
  };

  // ------------------------------------------------------------------
  // Soil Hunt on the map
  // ------------------------------------------------------------------
  /** Six missions for one hunt: soil and state clues taking turns. */
  C.pickHunt = function (seed) {
    var rnd = C.rng(seed * 7919 + 17);
    var soil = C.shuffle(D.missions.filter(function (m) { return m.type === 'soil'; }), rnd);
    var state = C.shuffle(D.missions.filter(function (m) { return m.type === 'state'; }), rnd);
    var out = [];
    for (var i = 0; i < 3; i++) out.push(soil[i], state[i]);
    return out;
  };

  /**
   * 'right', 'near' or 'wrong'. "Near" is a region that does have the soil,
   * just not in the way the clue asks, and it costs no points.
   */
  C.judgeHunt = function (mission, regionId) {
    if (mission.accept.indexOf(regionId) >= 0) return 'right';
    if (mission.type === 'soil' && C.hasSoil(regionId, mission.soil)) return 'near';
    return 'wrong';
  };

  // ------------------------------------------------------------------
  // Detective quiz
  // ------------------------------------------------------------------
  /** Eight questions in the styles of D.quizPattern, options in a shuffled order. */
  C.pickQuiz = function (seed) {
    var rnd = C.rng(seed * 104729 + 71);
    var pools = {};
    D.questions.forEach(function (q) {
      (pools[q.type] = pools[q.type] || []).push(q);
    });
    Object.keys(pools).forEach(function (k) {
      pools[k] = C.shuffle(pools[k], rnd);
    });
    return D.quizPattern.map(function (type) {
      var q = pools[type].shift();
      return { q: q, opts: q.kind === 'tf' ? q.opts.slice() : C.shuffle(q.opts, rnd) };
    });
  };

  /** The id of an option, whichever way the question writes its options. */
  C.optId = function (opt) {
    return typeof opt === 'string' ? opt : opt.id;
  };

  // ------------------------------------------------------------------
  // Particle sizes: the largest particle of each kind, in millimetres
  // (USDA size classes: clay below 0.002, silt to 0.05, sand to 2).
  // ------------------------------------------------------------------
  C.particles = { sand: 2, silt: 0.05, clay: 0.002 };
  C.PARTICLE_KINDS = ['sand', 'silt', 'clay'];

  // ------------------------------------------------------------------
  // Water experiment. 100 mL is poured on a column of soil at t = 0.
  //   soak   seconds for the water to sink in at the top
  //   front  seconds for the wet front to reach the bottom (first drop)
  //   end    seconds until dripping stops
  //   held   mL that stays in the soil
  // Illustrative values that keep the real order: sand fastest and holding
  // least, clay slowest and holding most, loam between the two.
  // ------------------------------------------------------------------
  C.POUR = 100;
  C.water = {
    sandy: { soak: 1.4, front: 2.4, end: 7, held: 22 },
    loamy: { soak: 4, front: 6, end: 15, held: 48 },
    clayey: { soak: 9, front: 11, end: 22, held: 78 }
  };
  C.WATER_KINDS = ['sandy', 'loamy', 'clayey'];

  C.percolate = function (kind, t) {
    var w = C.water[kind];
    t = Math.max(0, t);
    var pond = C.POUR * (1 - C.clamp(t / w.soak, 0, 1));
    var x = C.clamp((t - w.front) / (w.end - w.front), 0, 1);
    var drained = (C.POUR - w.held) * (1 - (1 - x) * (1 - x));
    return {
      front: C.clamp(t / w.front, 0, 1),
      pond: pond,
      drained: drained,
      held: C.POUR - pond - drained,
      dripping: t >= w.front && t < w.end,
      done: t >= w.end
    };
  };

  // ------------------------------------------------------------------
  // Map geometry, decoded from js/data/india-geo.js on first use
  // ------------------------------------------------------------------
  var geoCache = null;
  C.geo = function () {
    if (geoCache) return geoCache;
    var G = SE.geo;
    var arcs = G.arcs.map(function (text) {
      var n = text.split(' ').map(Number);
      var pts = [[n[0], n[1]]];
      for (var i = 2; i < n.length; i += 2) {
        var last = pts[pts.length - 1];
        pts.push([last[0] + n[i], last[1] + n[i + 1]]);
      }
      return pts;
    });
    var uses = arcs.map(function () {
      return 0;
    });
    function ringPoints(ring) {
      var pts = [];
      ring.forEach(function (i) {
        var a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
        uses[i < 0 ? ~i : i]++;
        pts = pts.concat(pts.length ? a.slice(1) : a);
      });
      return pts;
    }
    function d(pts, close) {
      return 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join('L') + (close ? 'Z' : '');
    }
    var regions = {};
    Object.keys(G.regions).forEach(function (id) {
      var R = G.regions[id];
      var rings = R.r.map(ringPoints);
      var box = [Infinity, Infinity, -Infinity, -Infinity];
      var grow = function (p) {
        box[0] = Math.min(box[0], p[0]);
        box[1] = Math.min(box[1], p[1]);
        box[2] = Math.max(box[2], p[0]);
        box[3] = Math.max(box[3], p[1]);
      };
      rings.forEach(function (pts) { pts.forEach(grow); });
      (R.dots || []).forEach(grow);
      regions[id] = {
        id: id,
        type: R.type,
        c: R.c,
        area: R.area,
        dots: R.dots || [],
        rings: rings,
        box: box,
        path: rings.map(function (pts) { return d(pts, true); }).join('')
      };
    });
    // A border line used by one region only is coast or the edge of the country.
    var outline = '';
    arcs.forEach(function (pts, i) {
      if (uses[i] === 1) outline += d(pts, false);
    });
    geoCache = { width: G.width, height: G.height, regions: regions, outline: outline, ids: Object.keys(regions) };
    return geoCache;
  };

  /** True if the point lies inside the region (used by the checks). */
  C.inRegion = function (regionId, x, y) {
    var inside = false;
    C.geo().regions[regionId].rings.forEach(function (pts) {
      for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        if (pts[i][1] > y !== pts[j][1] > y && x < ((pts[j][0] - pts[i][0]) * (y - pts[i][1])) / (pts[j][1] - pts[i][1]) + pts[i][0]) inside = !inside;
      }
    });
    return inside;
  };
})();
