/*
 * Builds js/data/india-geo.js from the India Map Hub states TopoJSON.
 *
 * Source:  https://indiamaphub.pages.dev/data/india-states.topojson
 *          India Map Hub, based on data by the DataMeet India community
 *          (CC BY 4.0) and Natural Earth. 36 regions: 28 states, 8 UTs.
 *
 * What it does: projects the borders (Lambert conformal conic, the usual
 * choice for maps of India), simplifies each shared border once so that
 * neighbouring regions still fit together exactly, drops islands too small
 * to see, and writes the result as plain text.
 *
 * How to run: paste this file into a browser console (any page that allows
 * fetch to the source), or run it with Node 18+. The value of the final
 * expression is a Promise for the text of js/data/india-geo.js.
 */
(async function () {
  'use strict';

  const SRC = 'https://indiamaphub.pages.dev/data/india-states.topojson';
  const WIDTH = 1000; // output grid width; height follows from the projection
  const g = typeof window !== 'undefined' ? window : globalThis;
  const OPT = g.__geoOpts || {};
  const TOLERANCE = OPT.tolerance || 1.25; // simplification tolerance in grid units
  const MIN_RING = OPT.minRing || 5; // smallest island or enclave kept, in square grid units
  const RENAME = { DNHDD: 'DH' };
  const SCATTERED = { DH: true, PY: true };

  const topo = g.__topo || (await (await fetch(SRC)).json());

  // ---- 1. decode the delta-encoded arcs to longitude and latitude ----
  const tf = topo.transform;
  const lonlat = topo.arcs.map(function (arc) {
    let x = 0;
    let y = 0;
    return arc.map(function (p) {
      x += p[0];
      y += p[1];
      return [x * tf.scale[0] + tf.translate[0], y * tf.scale[1] + tf.translate[1]];
    });
  });

  // ---- 2. Lambert conformal conic, standard parallels 12°N and 32°N ----
  const RAD = Math.PI / 180;
  const P1 = 12 * RAD;
  const P2 = 32 * RAD;
  const P0 = 22 * RAD;
  const L0 = 82.5 * RAD;
  const tn = (p) => Math.tan(Math.PI / 4 + p / 2);
  const n = Math.log(Math.cos(P1) / Math.cos(P2)) / Math.log(tn(P2) / tn(P1));
  const F = (Math.cos(P1) * Math.pow(tn(P1), n)) / n;
  const rho0 = F / Math.pow(tn(P0), n);
  const project = function (p) {
    const rho = F / Math.pow(tn(p[1] * RAD), n);
    const th = n * (p[0] * RAD - L0);
    return [rho * Math.sin(th), -(rho0 - rho * Math.cos(th))];
  };
  let flat = lonlat.map((arc) => arc.map(project));
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  flat.forEach((arc) =>
    arc.forEach(function (p) {
      x0 = Math.min(x0, p[0]);
      x1 = Math.max(x1, p[0]);
      y0 = Math.min(y0, p[1]);
      y1 = Math.max(y1, p[1]);
    })
  );
  const PAD = 6;
  const k = (WIDTH - 2 * PAD) / (x1 - x0);
  const HEIGHT = Math.ceil((y1 - y0) * k + 2 * PAD);
  flat = flat.map((arc) => arc.map((p) => [(p[0] - x0) * k + PAD, (p[1] - y0) * k + PAD]));

  // ---- 3. simplify each arc (Douglas-Peucker), then snap to the grid ----
  function segDist(p, a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = dx * dx + dy * dy;
    let t = len ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  function simplify(pts) {
    const keep = new Array(pts.length).fill(false);
    keep[0] = keep[pts.length - 1] = true;
    const stack = [[0, pts.length - 1]];
    while (stack.length) {
      const s = stack.pop();
      let worst = 0;
      let at = -1;
      for (let i = s[0] + 1; i < s[1]; i++) {
        const d = segDist(pts[i], pts[s[0]], pts[s[1]]);
        if (d > worst) {
          worst = d;
          at = i;
        }
      }
      if (at > 0 && worst > TOLERANCE) {
        keep[at] = true;
        stack.push([s[0], at], [at, s[1]]);
      }
    }
    return pts.filter((p, i) => keep[i]);
  }
  const arcs = flat.map(function (arc) {
    const closed = arc.length > 3 && arc[0][0] === arc[arc.length - 1][0] && arc[0][1] === arc[arc.length - 1][1];
    let pts;
    if (closed) {
      // A ring on its own: split at the point farthest from the start so
      // the simplifier has a real baseline to work from.
      let far = 1;
      let best = 0;
      arc.forEach(function (p, i) {
        const d = Math.hypot(p[0] - arc[0][0], p[1] - arc[0][1]);
        if (d > best) {
          best = d;
          far = i;
        }
      });
      pts = simplify(arc.slice(0, far + 1)).concat(simplify(arc.slice(far)).slice(1));
    } else {
      pts = simplify(arc);
    }
    const out = [];
    pts.forEach(function (p) {
      const q = [Math.round(p[0]), Math.round(p[1])];
      const last = out[out.length - 1];
      if (!last || last[0] !== q[0] || last[1] !== q[1]) out.push(q);
    });
    if (out.length === 1) out.push(out[0].slice());
    return out;
  });

  // ---- 4. rings per region, dropping specks ----
  const arcPts = (i) => (i < 0 ? arcs[~i].slice().reverse() : arcs[i]);
  function ringPts(ring) {
    let pts = [];
    ring.forEach(function (i) {
      const a = arcPts(i);
      pts = pts.concat(pts.length ? a.slice(1) : a);
    });
    return pts;
  }
  function area(pts) {
    let s = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
    return Math.abs(s) / 2;
  }
  function centroid(pts) {
    let cx = 0;
    let cy = 0;
    pts.forEach(function (p) {
      cx += p[0];
      cy += p[1];
    });
    return [cx / pts.length, cy / pts.length];
  }
  function inside(p, pts) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      if (pts[i][1] > p[1] !== pts[j][1] > p[1] && p[0] < ((pts[j][0] - pts[i][0]) * (p[1] - pts[i][1])) / (pts[j][1] - pts[i][1]) + pts[i][0]) c = !c;
    }
    return c;
  }
  /** The point inside a shape that is farthest from its edge: a good place for a label. */
  function labelPoint(pts) {
    let bx0 = Infinity;
    let bx1 = -Infinity;
    let by0 = Infinity;
    let by1 = -Infinity;
    pts.forEach(function (p) {
      bx0 = Math.min(bx0, p[0]);
      bx1 = Math.max(bx1, p[0]);
      by0 = Math.min(by0, p[1]);
      by1 = Math.max(by1, p[1]);
    });
    let best = centroid(pts);
    let bestD = -1;
    const N = 36;
    for (let i = 1; i < N; i++) {
      for (let j = 1; j < N; j++) {
        const p = [bx0 + ((bx1 - bx0) * i) / N, by0 + ((by1 - by0) * j) / N];
        if (!inside(p, pts)) continue;
        let d = Infinity;
        for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) d = Math.min(d, segDist(p, pts[b], pts[a]));
        if (d > bestD) {
          bestD = d;
          best = p;
        }
      }
    }
    return [Math.round(best[0]), Math.round(best[1])];
  }

  const used = new Set();
  const regions = topo.objects.states.geometries.map(function (geo) {
    const polys = geo.type === 'Polygon' ? [geo.arcs] : geo.arcs;
    const outer = polys.map((poly) => ({ poly: poly, pts: ringPts(poly[0]) })).map((o) => Object.assign(o, { area: area(o.pts) }));
    outer.sort((a, b) => b.area - a.area);
    const kept = outer.filter((o) => o.area >= MIN_RING);
    const rings = [];
    kept.forEach(function (o) {
      o.poly.forEach(function (ring, i) {
        if (i === 0 || area(ringPts(ring)) >= MIN_RING) rings.push(ring);
      });
    });
    rings.forEach((ring) => ring.forEach((i) => used.add(i < 0 ? ~i : i)));
    const id = RENAME[geo.properties.abbr] || geo.properties.abbr;
    const rec = { id: id, name: geo.properties.name, type: geo.properties.type, rings: rings, area: Math.round(outer.reduce((s, o) => s + o.area, 0)) };
    if (kept.length) {
      rec.c = labelPoint(kept[0].pts);
      if (SCATTERED[id]) {
        // Territories made of separate parts: mark the parts too small to outline
        // (Diu, Mahe, Yanam) with a dot so that they are still on the map.
        const dots = [];
        outer.forEach(function (o) {
          if (o.area >= MIN_RING || o.area < 0.2) return;
          const p = centroid(o.pts).map(Math.round);
          const near = (q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 8;
          if (dots.some(near) || kept.some((kp) => kp.pts.some(near))) return;
          dots.push(p);
        });
        if (dots.length) rec.dots = dots;
      }
    } else {
      // Every piece is smaller than a speck (coral islands): keep their positions as dots.
      rec.dots = outer.slice(0, 6).map((o) => centroid(o.pts).map(Math.round));
      rec.c = centroid(rec.dots).map(Math.round);
    }
    return rec;
  });

  // ---- 5. renumber the arcs that are still in use ----
  const order = Array.from(used).sort((a, b) => a - b);
  const renum = new Map(order.map((old, i) => [old, i]));
  const outArcs = order.map(function (old) {
    const a = arcs[old];
    const parts = [a[0][0], a[0][1]];
    for (let i = 1; i < a.length; i++) parts.push(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]);
    return parts.join(' ');
  });
  regions.forEach(function (r) {
    r.rings = r.rings.map((ring) => ring.map((i) => (i < 0 ? ~renum.get(~i) : renum.get(i))));
  });
  regions.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'state' ? -1 : 1));

  // ---- 6. write the file ----
  let points = 0;
  order.forEach((old) => (points += arcs[old].length));
  const L = [];
  L.push('/*');
  L.push(' * Soil Explorer: the map of India as plain geographical data.');
  L.push(' * Generated by tools/build-geo.js. Do not edit by hand.');
  L.push(' *');
  L.push(' * 36 regions (28 states and 8 union territories), ' + outArcs.length + ' border lines, ' + points + ' points.');
  L.push(' * Boundaries: India Map Hub (https://indiamaphub.pages.dev), based on data by the');
  L.push(' * DataMeet India community (CC BY 4.0) and Natural Earth. Drawn to match the Survey');
  L.push(' * of India political map; simplified for a learning map, not certified survey data.');
  L.push(' *');
  L.push(' * arcs     each border line once, as "x y dx dy dx dy ..." on a ' + WIDTH + ' x ' + HEIGHT + ' grid');
  L.push(' *          (Lambert conformal conic projection, north at the top).');
  L.push(' * regions  r: the rings of each region as lists of arc numbers; a negative');
  L.push(' *          number ~i means arc i walked backwards. c: a point well inside the');
  L.push(' *          region, for labels and markers. dots: island groups too small to');
  L.push(' *          outline at this scale.');
  L.push(' */');
  L.push('(function () {');
  L.push("  'use strict';");
  L.push('  var SE = (window.SE = window.SE || {});');
  L.push('  SE.geo = {');
  L.push('    width: ' + WIDTH + ',');
  L.push('    height: ' + HEIGHT + ',');
  L.push('    arcs: [');
  outArcs.forEach((s, i) => L.push("      '" + s + "'" + (i < outArcs.length - 1 ? ',' : '')));
  L.push('    ],');
  L.push('    regions: {');
  regions.forEach(function (r, i) {
    let s = '      ' + r.id + ": { type: '" + r.type + "', c: [" + r.c.join(', ') + '], area: ' + r.area + ', r: ' + JSON.stringify(r.rings);
    if (r.dots) s += ', dots: ' + JSON.stringify(r.dots);
    L.push(s + ' }' + (i < regions.length - 1 ? ',' : ''));
  });
  L.push('    }');
  L.push('  };');
  L.push('})();');
  L.push('');
  const text = L.join('\n');
  g.__geoText = text;
  g.__geoStats = { arcs: outArcs.length, points: points, height: HEIGHT, chars: text.length, regions: regions.map((r) => r.id + ':' + r.rings.length + (r.dots ? '+dots' : '')).join(' ') };
  return text;
})();
