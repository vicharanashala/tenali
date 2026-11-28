/*
 * Soil Explorer art: every picture in the app is drawn here by code, so the
 * site needs no image files and nothing from the internet.
 *   soilTop / soilSide   surface and cut face of each soil sample
 *   micro                the view under the magnifier
 *   texSample            sandy, clayey and loamy samples
 *   profile              the dig-down soil profile on the welcome screen
 *   scientist            Bhoomi, the guide
 */
(function () {
  'use strict';

  var SE = window.SE;
  var A = (SE.art = {});

  // ------------------------------------------------------------------
  // Noise
  // ------------------------------------------------------------------
  function hash(x, y, s) {
    var h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function noise(x, y, s) {
    var xi = Math.floor(x);
    var yi = Math.floor(y);
    var xf = x - xi;
    var yf = y - yi;
    var u = xf * xf * (3 - 2 * xf);
    var v = yf * yf * (3 - 2 * yf);
    var a = hash(xi, yi, s);
    var b = hash(xi + 1, yi, s);
    var c = hash(xi, yi + 1, s);
    var d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, s, oct) {
    var sum = 0;
    var amp = 0.5;
    var norm = 0;
    for (var i = 0; i < oct; i++) {
      sum += amp * noise(x, y, s + i * 17);
      norm += amp;
      x *= 2.03;
      y *= 2.03;
      amp *= 0.5;
    }
    return sum / norm;
  }
  // Distances to the nearest and second nearest scattered point.
  var F1 = 0;
  var F2 = 0;
  function cell(x, y, s) {
    var xi = Math.floor(x);
    var yi = Math.floor(y);
    F1 = 9;
    F2 = 9;
    for (var dy = -1; dy <= 1; dy++) {
      for (var dx = -1; dx <= 1; dx++) {
        var cx = xi + dx;
        var cy = yi + dy;
        var px = cx + hash(cx, cy, s) - x;
        var py = cy + hash(cx, cy, s + 101) - y;
        var d = Math.sqrt(px * px + py * py);
        if (d < F1) {
          F2 = F1;
          F1 = d;
        } else if (d < F2) F2 = d;
      }
    }
  }
  function step(a, b, x) {
    var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  function rgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }
  function canvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  // One pixel being worked on: height and colour.
  var P = { h: 0, r: 0, g: 0, b: 0 };
  function set(c) {
    P.r = c[0];
    P.g = c[1];
    P.b = c[2];
  }
  function mix(c, t) {
    P.r += (c[0] - P.r) * t;
    P.g += (c[1] - P.g) * t;
    P.b += (c[2] - P.b) * t;
  }
  function mul(k) {
    P.r *= k;
    P.g *= k;
    P.b *= k;
  }

  // ------------------------------------------------------------------
  // Soil surfaces (u, v from 0 to 1; px, py on a 256 grid for single specks)
  // ------------------------------------------------------------------
  var TOP = {
    alluvial: function (u, v, px, py) {
      var n = fbm(u * 4, v * 4, 11, 4);
      var flow = fbm(u * 3 + n * 0.7, v * 15, 12, 3);
      var fine = noise(u * 95, v * 95, 13);
      cell(u * 5 + n, v * 5, 14);
      var curl = 1 - step(0.0, 0.05, F2 - F1);
      P.h = 0.45 + 0.28 * (n - 0.5) + 0.14 * (flow - 0.5) + 0.05 * (fine - 0.5) - 0.1 * curl;
      set([176, 152, 112]);
      mix([140, 120, 88], flow * 0.8);
      mul(0.9 + 0.22 * n + 0.08 * (fine - 0.5));
      mul(1 - 0.3 * curl);
      if (hash(px, py, 15) > 0.996) mix([236, 226, 200], 0.7);
    },
    black: function (u, v) {
      var wx = u * 5 + 0.4 * fbm(u * 6, v * 6, 21, 2);
      var wy = v * 5 + 0.4 * fbm(u * 6 + 9, v * 6, 22, 2);
      cell(wx, wy, 23);
      var e = F2 - F1;
      var crack = 1 - step(0.0, 0.1, e);
      var dome = step(0, 0.5, e);
      cell(wx * 2.4, wy * 2.4, 24);
      var fineCrack = (1 - step(0, 0.045, F2 - F1)) * 0.55;
      var grain = fbm(u * 42, v * 42, 25, 2);
      P.h = 0.3 + 0.5 * dome * (0.85 + 0.3 * grain) - 0.28 * crack - 0.07 * fineCrack;
      set([56, 51, 48]);
      mix([92, 86, 80], dome * 0.42);
      mul(0.8 + 0.42 * grain);
      mul((1 - 0.78 * crack) * (1 - 0.4 * fineCrack));
    },
    red: function (u, v, px, py) {
      var grain = fbm(u * 62, v * 62, 31, 2);
      var mid = fbm(u * 9, v * 9, 32, 3);
      var patch = step(0.5, 0.68, fbm(u * 3.2 + 3, v * 3.2, 33, 3));
      P.h = 0.42 + 0.3 * (mid - 0.5) + 0.26 * (grain - 0.5);
      set([172, 76, 46]);
      mix([134, 52, 34], mid * 0.9);
      mix([204, 150, 66], patch * 0.82);
      mul(0.8 + 0.42 * grain);
      if (hash(px, py, 34) > 0.991) {
        mix([232, 214, 196], 0.75);
        P.h += 0.08;
      }
    },
    laterite: function (u, v) {
      var mid = fbm(u * 7, v * 7, 41, 3);
      var grain = fbm(u * 52, v * 52, 42, 2);
      var mott = fbm(u * 4, v * 4, 43, 2);
      cell(u * 24, v * 24, 44);
      var pore = (1 - step(0.1, 0.24, F1)) * step(0.3, 0.55, noise(u * 6, v * 6, 45));
      cell(u * 7, v * 7, 46);
      var nod = (1 - step(0.14, 0.24, F1)) * step(0.45, 0.6, noise(u * 3 + 5, v * 3, 47));
      P.h = 0.46 + 0.3 * (mid - 0.5) + 0.1 * (grain - 0.5) - 0.3 * pore + 0.26 * nod;
      set([160, 76, 38]);
      mix([118, 50, 30], mid * 0.9);
      mix([192, 118, 64], step(0.55, 0.8, mott) * 0.6);
      mul(0.84 + 0.36 * grain);
      mul(1 - 0.62 * pore);
      mix([70, 36, 30], nod * 0.78);
    },
    arid: function (u, v, px, py) {
      var warp = fbm(u * 3, v * 3, 51, 3);
      var rip = 0.5 + 0.5 * Math.sin((u * 0.35 + v) * 27 + warp * 7.5);
      var grain = noise(u * 135, v * 135, 52);
      var salt = step(0.62, 0.74, fbm(u * 4 + 2, v * 4 + 7, 53, 2));
      P.h = 0.3 + 0.36 * rip + 0.12 * (warp - 0.5) + 0.04 * (grain - 0.5);
      set([198, 168, 120]);
      mix([228, 203, 158], rip);
      mul(0.92 + 0.16 * grain);
      mix([244, 238, 222], salt * 0.42);
      var speck = hash(px, py, 54);
      if (speck > 0.994) mix([250, 240, 216], 0.7);
      else if (speck < 0.005) mul(0.62);
    },
    forest: function (u, v) {
      var mid = fbm(u * 6, v * 6, 61, 4);
      var grain = fbm(u * 46, v * 46, 62, 2);
      var moss = step(0.62, 0.74, fbm(u * 5 + 4, v * 5, 63, 2));
      P.h = 0.42 + 0.42 * (mid - 0.5) + 0.16 * (grain - 0.5);
      set([50, 36, 26]);
      mix([88, 62, 42], mid * 0.9);
      mul(0.74 + 0.52 * grain);
      mix([74, 90, 46], moss * 0.42);
    }
  };

  function blobPath(ctx, x, y, r, rough, rnd, n) {
    n = n || 9;
    var pts = [];
    var turn = rnd() * 6.283;
    for (var i = 0; i < n; i++) {
      var a = turn + (i / n) * 6.283;
      var rr = r * (1 - rough + rnd() * rough * 2);
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    ctx.beginPath();
    for (var k = 0; k < n; k++) {
      var p = pts[k];
      var q = pts[(k + 1) % n];
      var mx = (p[0] + q[0]) / 2;
      var my = (p[1] + q[1]) / 2;
      if (k === 0) ctx.moveTo(mx, my);
      else ctx.quadraticCurveTo(p[0], p[1], mx, my);
    }
    var p0 = pts[0];
    var p1 = pts[1];
    ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    ctx.closePath();
  }

  function stone(ctx, x, y, r, rnd, light, dark) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = r * 0.5;
    ctx.shadowOffsetX = r * 0.18;
    ctx.shadowOffsetY = r * 0.22;
    var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.1);
    g.addColorStop(0, light);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    blobPath(ctx, x, y, r, 0.2, rnd, 8);
    ctx.fill();
    ctx.restore();
  }

  function leaf(ctx, x, y, len, turn, colour) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn);
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = len * 0.12;
    ctx.shadowOffsetY = len * 0.05;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.quadraticCurveTo(0, -len * 0.34, len / 2, 0);
    ctx.quadraticCurveTo(0, len * 0.34, -len / 2, 0);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(40,26,14,0.55)';
    ctx.lineWidth = Math.max(0.6, len * 0.03);
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.lineTo(len / 2, 0);
    ctx.stroke();
    ctx.restore();
  }

  var LEAVES = ['#8a6a2c', '#6f4e22', '#a07a34', '#5c4a26', '#7a5a30', '#94622c'];

  var DECOR = {
    red: function (ctx, size, rnd) {
      for (var i = 0; i < 12; i++) stone(ctx, rnd() * size, rnd() * size, size * (0.008 + rnd() * 0.012), rnd, '#ecdccb', '#a98572');
    },
    arid: function (ctx, size, rnd) {
      for (var i = 0; i < 7; i++) stone(ctx, rnd() * size, rnd() * size, size * (0.008 + rnd() * 0.014), rnd, '#cdb893', '#8f7858');
    },
    forest: function (ctx, size, rnd) {
      var i;
      for (i = 0; i < 6; i++) stone(ctx, rnd() * size, rnd() * size, size * (0.025 + rnd() * 0.035), rnd, '#a9a59c', '#5e5a54');
      ctx.lineCap = 'round';
      for (i = 0; i < 7; i++) {
        var x = rnd() * size;
        var y = rnd() * size;
        var a = rnd() * 6.283;
        var len = size * (0.1 + rnd() * 0.16);
        ctx.strokeStyle = i % 2 ? '#4a3220' : '#6a4a2e';
        ctx.lineWidth = size * (0.006 + rnd() * 0.006);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + Math.cos(a + 0.3) * len * 0.5, y + Math.sin(a + 0.3) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.stroke();
      }
      for (i = 0; i < 26; i++) leaf(ctx, rnd() * size, rnd() * size, size * (0.07 + rnd() * 0.07), rnd() * 6.283, LEAVES[Math.floor(rnd() * LEAVES.length)]);
    }
  };

  var SEEDS = { alluvial: 3, black: 5, red: 7, laterite: 11, arid: 13, forest: 17 };
  var topCache = {};

  /** Surface picture and height map of a soil. */
  A.soilTop = function (id, size) {
    size = size || 256;
    var key = id + ':' + size;
    if (topCache[key]) return topCache[key];
    var fn = TOP[id];
    var H = new Float32Array(size * size);
    var col = new Float32Array(size * size * 3);
    var x, y, i;
    for (y = 0; y < size; y++) {
      for (x = 0; x < size; x++) {
        var u = x / size;
        var v = y / size;
        fn(u, v, (u * 256) | 0, (v * 256) | 0);
        i = y * size + x;
        H[i] = P.h;
        col[i * 3] = P.r;
        col[i * 3 + 1] = P.g;
        col[i * 3 + 2] = P.b;
      }
    }
    var c = canvas(size, size);
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(size, size);
    var k = (size / 256) * 2.4;
    for (y = 0; y < size; y++) {
      var yu = y > 0 ? y - 1 : y;
      var yd = y < size - 1 ? y + 1 : y;
      for (x = 0; x < size; x++) {
        var xl = x > 0 ? x - 1 : x;
        var xr = x < size - 1 ? x + 1 : x;
        i = y * size + x;
        var sh = 1 + k * (H[y * size + xr] - H[y * size + xl] + H[yd * size + x] - H[yu * size + x]);
        sh = Math.min(1.42, Math.max(0.5, sh)) * (0.8 + 0.28 * H[i]);
        img.data[i * 4] = col[i * 3] * sh;
        img.data[i * 4 + 1] = col[i * 3 + 1] * sh;
        img.data[i * 4 + 2] = col[i * 3 + 2] * sh;
        img.data[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    if (DECOR[id]) DECOR[id](ctx, size, SE.core.rng(SEEDS[id] * 977));
    return (topCache[key] = { canvas: c, height: H, size: size });
  };

  // ------------------------------------------------------------------
  // Cut faces: the soil from the surface (top) downward
  // ------------------------------------------------------------------
  function ramp(stops, t) {
    for (var i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        var a = stops[i - 1];
        var b = stops[i];
        var k = (t - a[0]) / (b[0] - a[0] || 1);
        P.r = a[1][0] + (b[1][0] - a[1][0]) * k;
        P.g = a[1][1] + (b[1][1] - a[1][1]) * k;
        P.b = a[1][2] + (b[1][2] - a[1][2]) * k;
        return;
      }
    }
    set(stops[stops.length - 1][1]);
  }
  function stops(list) {
    return list.map(function (s) {
      return [s[0], rgb(s[1])];
    });
  }
  function nodules(ctx, w, h, rnd, n, t0, t1, r0, r1, light, dark) {
    for (var i = 0; i < n; i++) {
      var r = r0 + rnd() * (r1 - r0);
      var x = rnd() * w;
      var y = (t0 + rnd() * (t1 - t0)) * h;
      var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      g.addColorStop(0, light);
      g.addColorStop(1, dark);
      ctx.fillStyle = g;
      blobPath(ctx, x, y, r, 0.22, rnd, 7);
      ctx.fill();
    }
  }
  function shards(ctx, w, h, rnd, n, t0, t1, r0, r1, colours) {
    for (var i = 0; i < n; i++) {
      var r = r0 + rnd() * (r1 - r0);
      var x = rnd() * w;
      var y = (t0 + rnd() * (t1 - t0)) * h;
      var sides = 4 + Math.floor(rnd() * 3);
      var turn = rnd() * 6.283;
      ctx.beginPath();
      for (var k = 0; k < sides; k++) {
        var a = turn + (k / sides) * 6.283;
        var rr = r * (0.65 + rnd() * 0.5);
        ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr * 1.25, y + Math.sin(a) * rr * 0.8);
      }
      ctx.closePath();
      ctx.fillStyle = colours[Math.floor(rnd() * colours.length)];
      ctx.fill();
      ctx.strokeStyle = 'rgba(30,22,16,0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  function root(ctx, x, y, a, len, wide, rnd, depth) {
    var x2 = x + Math.cos(a) * len;
    var y2 = y + Math.sin(a) * len;
    ctx.lineWidth = wide;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a + 0.5) * len * 0.5, y + Math.sin(a + 0.5) * len * 0.5, x2, y2);
    ctx.stroke();
    if (depth > 0) {
      root(ctx, x2, y2, a - 0.3 - rnd() * 0.5, len * 0.72, wide * 0.62, rnd, depth - 1);
      root(ctx, x2, y2, a + 0.3 + rnd() * 0.5, len * 0.66, wide * 0.62, rnd, depth - 1);
    }
  }

  var SIDE = {
    alluvial: {
      stops: stops([[0, '#9a8562'], [0.3, '#ac9570'], [0.36, '#cdb890'], [0.56, '#c6ae84'], [0.62, '#a08862'], [1, '#8a7452']]),
      px: function (s, t, tt) {
        mul(0.9 + 0.2 * noise(s * 3, tt * 48, 71));
        if (tt > 0.36 && tt < 0.58 && hash(s * 512, t * 256, 72) > 0.9) mul(1.14);
      },
      decor: function (ctx, w, h, rnd) {
        nodules(ctx, w, h, rnd, 16, 0.72, 0.96, w * 0.004, w * 0.009, '#e6dcc6', '#b3a688');
      }
    },
    black: {
      stops: stops([[0, '#2c2826'], [0.6, '#35302d'], [1, '#4a433c']]),
      decor: function (ctx, w, h, rnd) {
        ctx.fillStyle = '#100e0d';
        for (var i = 0; i < 7; i++) {
          var x = (i + 0.2 + rnd() * 0.6) * (w / 7);
          var deep = h * (0.3 + rnd() * 0.32);
          var wide = w * (0.006 + rnd() * 0.008);
          var left = [];
          var right = [];
          for (var k = 0; k <= 8; k++) {
            var f = k / 8;
            var cx = x + (rnd() - 0.5) * w * 0.022 * (k ? 1 : 0);
            left.push([cx - wide * (1 - f), f * deep]);
            right.push([cx + wide * (1 - f), f * deep]);
          }
          ctx.beginPath();
          left.forEach(function (p, n) {
            ctx[n ? 'lineTo' : 'moveTo'](p[0], p[1]);
          });
          right.reverse().forEach(function (p) {
            ctx.lineTo(p[0], p[1]);
          });
          ctx.closePath();
          ctx.fill();
        }
        nodules(ctx, w, h, rnd, 30, 0.66, 0.97, w * 0.004, w * 0.011, '#ebe4d2', '#a9a08c');
      }
    },
    red: {
      stops: stops([[0, '#a44529'], [0.3, '#b3562f'], [0.46, '#c98c3e'], [0.68, '#c99a4c'], [0.78, '#a58866'], [1, '#8d8478']]),
      px: function (s, t) {
        if (hash(s * 512, t * 256, 73) > 0.988) mix([236, 220, 200], 0.7);
      },
      decor: function (ctx, w, h, rnd) {
        shards(ctx, w, h, rnd, 34, 0.74, 1.0, w * 0.012, w * 0.034, ['#9b8f86', '#b5a79a', '#8a7f78', '#c2ad9c', '#a8958a']);
      }
    },
    laterite: {
      stops: stops([[0, '#6e3a22'], [0.16, '#8a4022'], [0.24, '#a4532a'], [0.7, '#b0602e'], [0.8, '#c39468'], [1, '#d2c0a6']]),
      px: function (s, t, tt) {
        var zone = step(0.2, 0.3, tt) * (1 - step(0.68, 0.8, tt));
        var m = fbm(s * 10, t * 6, 81, 3);
        mix([222, 184, 140], zone * step(0.56, 0.72, m) * 0.7);
        mix([104, 44, 28], zone * (1 - step(0.3, 0.44, m)) * 0.6);
        cell(s * 46, t * 24, 82);
        mul(1 - 0.55 * (1 - step(0.1, 0.22, F1)) * (1 - step(0.7, 0.8, tt)) * step(0.3, 0.5, noise(s * 9, t * 5, 83)));
      },
      decor: function (ctx, w, h, rnd) {
        nodules(ctx, w, h, rnd, 26, 0.02, 0.2, w * 0.005, w * 0.012, '#6a3426', '#3a1c16');
      }
    },
    arid: {
      stops: stops([[0, '#dcc294'], [0.2, '#d4b886'], [0.66, '#ccb084'], [0.74, '#c4ad8a'], [1, '#bca88a']]),
      px: function (s, t) {
        var k = hash(s * 512, t * 256, 74);
        if (k > 0.99) mul(1.12);
        else if (k < 0.012) mul(0.8);
      },
      decor: function (ctx, w, h, rnd) {
        nodules(ctx, w, h, rnd, 54, 0.7, 0.96, w * 0.006, w * 0.016, '#f1eada', '#b9ab8e');
      }
    },
    forest: {
      stops: stops([[0, '#241a13'], [0.1, '#32241a'], [0.34, '#4e3a2a'], [0.5, '#6c553e'], [0.7, '#7e6a52'], [1, '#89806f']]),
      decor: function (ctx, w, h, rnd) {
        var i;
        for (i = 0; i < 16; i++) stone(ctx, rnd() * w, (0.56 + rnd() * 0.42) * h, w * (0.012 + rnd() * 0.03), rnd, '#b3aea4', '#615c55');
        ctx.strokeStyle = '#a58460';
        ctx.lineCap = 'round';
        for (i = 0; i < 7; i++) root(ctx, (i + 0.2 + rnd() * 0.6) * (w / 7), 0, 1.57 + (rnd() - 0.5) * 0.5, h * (0.14 + rnd() * 0.1), w * 0.007, rnd, 3);
        for (i = 0; i < 40; i++) leaf(ctx, rnd() * w, h * (0.005 + rnd() * 0.03), w * (0.03 + rnd() * 0.02), (rnd() - 0.5) * 0.7, LEAVES[Math.floor(rnd() * LEAVES.length)]);
      }
    }
  };

  var sideCache = {};
  A.soilSide = function (id, w, h) {
    w = w || 512;
    h = h || 256;
    var key = id + ':' + w + 'x' + h;
    if (sideCache[key]) return sideCache[key];
    var def = SIDE[id];
    var seed = SEEDS[id] * 31;
    var c = canvas(w, h);
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(w, h);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var s = x / w;
        var t = y / h;
        var tt = Math.min(1, Math.max(0, t + 0.07 * (fbm(s * 5, t * 3, seed, 2) - 0.5)));
        ramp(def.stops, tt);
        mul(0.84 + 0.32 * fbm(s * 90, t * 45, seed + 1, 2));
        if (def.px) def.px(s, t, tt);
        mul(1 - 0.1 * step(0.9, 1, t));
        var i = (y * w + x) * 4;
        img.data[i] = P.r;
        img.data[i + 1] = P.g;
        img.data[i + 2] = P.b;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    if (def.decor) def.decor(ctx, w, h, SE.core.rng(seed + 5));
    return (sideCache[key] = c);
  };

  // ------------------------------------------------------------------
  // Under the magnifier
  // ------------------------------------------------------------------
  function ground(ctx, w, h, hex, seed, zoom, contrast) {
    var base = rgb(hex);
    var img = ctx.createImageData(w, h);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var k = 1 - contrast / 2 + contrast * fbm((x / w) * zoom, (y / w) * zoom, seed, 3);
        var i = (y * w + x) * 4;
        img.data[i] = base[0] * k;
        img.data[i + 1] = base[1] * k;
        img.data[i + 2] = base[2] * k;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  function grain(ctx, x, y, r, rnd, light, dark, rough) {
    var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.05);
    g.addColorStop(0, light);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    blobPath(ctx, x, y, r, rough === undefined ? 0.2 : rough, rnd, 9);
    ctx.fill();
  }
  /** Scatter n spots so that they do not pile on top of each other. */
  function scatter(w, h, n, r0, r1, rnd) {
    var out = [];
    for (var tries = 0; out.length < n && tries < n * 30; tries++) {
      var r = r0 + rnd() * (r1 - r0);
      var x = rnd() * w;
      var y = rnd() * h;
      var ok = true;
      for (var i = 0; i < out.length; i++) {
        var o = out[i];
        var dx = o[0] - x;
        var dy = o[1] - y;
        if (dx * dx + dy * dy < (o[2] + r) * (o[2] + r) * 0.72) {
          ok = false;
          break;
        }
      }
      if (ok) out.push([x, y, r]);
    }
    return out;
  }

  var MICRO = {
    alluvial: function (ctx, s, rnd) {
      ground(ctx, s, s, '#927b58', 91, 30, 0.5);
      var i;
      for (i = 0; i < 520; i++) {
        ctx.fillStyle = i % 3 ? '#7c6648' : '#a8916c';
        ctx.fillRect(rnd() * s, rnd() * s, 1.4, 1);
      }
      scatter(s, s, 70, s * 0.012, s * 0.024, rnd).forEach(function (p) {
        grain(ctx, p[0], p[1], p[2], rnd, '#d2bf9c', '#a48f6a', 0.28);
      });
      var shades = [['#efe4cc', '#c0aa84'], ['#e0d0b0', '#a8926c'], ['#f4ecdc', '#cbbba0'], ['#cdb894', '#98825e']];
      scatter(s, s, 9, s * 0.07, s * 0.12, rnd).forEach(function (p, n) {
        ctx.save();
        ctx.shadowColor = 'rgba(40,28,14,0.5)';
        ctx.shadowBlur = s * 0.02;
        ctx.shadowOffsetY = s * 0.008;
        grain(ctx, p[0], p[1], p[2], rnd, shades[n % 4][0], shades[n % 4][1], 0.24);
        ctx.restore();
      });
    },
    black: function (ctx, s, rnd) {
      ground(ctx, s, s, '#3a3532', 92, 60, 0.3);
      function crack(x, y, a, len, wide, depth) {
        var x2 = x + Math.cos(a) * len;
        var y2 = y + Math.sin(a) * len;
        var nx = -Math.sin(a);
        var ny = Math.cos(a);
        ctx.fillStyle = '#0d0b0a';
        ctx.beginPath();
        ctx.moveTo(x - nx * wide, y - ny * wide);
        ctx.lineTo(x2 - nx * wide * 0.5, y2 - ny * wide * 0.5);
        ctx.lineTo(x2 + nx * wide * 0.5, y2 + ny * wide * 0.5);
        ctx.lineTo(x + nx * wide, y + ny * wide);
        ctx.fill();
        ctx.strokeStyle = 'rgba(120,112,104,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - nx * wide, y - ny * wide);
        ctx.lineTo(x2 - nx * wide * 0.5, y2 - ny * wide * 0.5);
        ctx.stroke();
        if (depth > 0) {
          crack(x2, y2, a + (rnd() - 0.5) * 0.7, len * 0.9, wide * 0.5, depth - 1);
          if (rnd() > 0.35) crack(x2, y2, a + (rnd() > 0.5 ? 1 : -1) * (0.7 + rnd() * 0.5), len * 0.6, wide * 0.3, depth - 2);
        }
      }
      crack(-s * 0.05, s * 0.3, 0.25, s * 0.28, s * 0.045, 4);
    },
    red: function (ctx, s, rnd) {
      ground(ctx, s, s, '#74301e', 93, 24, 0.5);
      scatter(s, s, 34, s * 0.045, s * 0.1, rnd).forEach(function (p) {
        ctx.save();
        ctx.shadowColor = 'rgba(30,10,6,0.55)';
        ctx.shadowBlur = s * 0.016;
        ctx.shadowOffsetY = s * 0.006;
        var g = ctx.createRadialGradient(p[0] - p[2] * 0.2, p[1] - p[2] * 0.25, p[2] * 0.1, p[0], p[1], p[2]);
        g.addColorStop(0, '#efe4d6');
        g.addColorStop(0.62, '#d9bfa6');
        g.addColorStop(0.8, '#c0603a');
        g.addColorStop(1, '#a23f24');
        ctx.fillStyle = g;
        blobPath(ctx, p[0], p[1], p[2], 0.22, rnd, 8);
        ctx.fill();
        ctx.restore();
      });
    },
    laterite: function (ctx, s, rnd) {
      ground(ctx, s, s, '#a04e28', 94, 14, 0.55);
      scatter(s, s, 6, s * 0.06, s * 0.09, rnd).forEach(function (p) {
        grain(ctx, p[0], p[1], p[2], rnd, '#7a4034', '#3c1e18', 0.16);
      });
      scatter(s, s, 60, s * 0.022, s * 0.05, rnd).forEach(function (p) {
        ctx.fillStyle = '#c98a54';
        blobPath(ctx, p[0] + p[2] * 0.12, p[1] + p[2] * 0.14, p[2], 0.2, rnd, 8);
        ctx.fill();
        var g = ctx.createRadialGradient(p[0], p[1], p[2] * 0.1, p[0], p[1], p[2]);
        g.addColorStop(0, '#1e0c08');
        g.addColorStop(1, '#4a2014');
        ctx.fillStyle = g;
        blobPath(ctx, p[0], p[1], p[2] * 0.92, 0.2, rnd, 8);
        ctx.fill();
      });
    },
    arid: function (ctx, s, rnd) {
      ground(ctx, s, s, '#5a4630', 95, 18, 0.4);
      var shades = [['#f4e4bc', '#c9a970'], ['#ecd6a6', '#b89660'], ['#f8ecd0', '#d4b988'], ['#e2c690', '#a88650'], ['#f0dcae', '#c2a068']];
      scatter(s, s, 46, s * 0.055, s * 0.095, rnd).forEach(function (p, n) {
        ctx.save();
        ctx.shadowColor = 'rgba(30,20,8,0.6)';
        ctx.shadowBlur = s * 0.02;
        ctx.shadowOffsetY = s * 0.008;
        grain(ctx, p[0], p[1], p[2], rnd, shades[n % 5][0], shades[n % 5][1], 0.1);
        ctx.restore();
      });
    },
    forest: function (ctx, s, rnd) {
      ground(ctx, s, s, '#221812', 96, 20, 0.5);
      var shades = [['#6a4e38', '#3a2a1e'], ['#56402e', '#2e2118'], ['#7a5a40', '#463224']];
      scatter(s, s, 34, s * 0.05, s * 0.11, rnd).forEach(function (p, n) {
        grain(ctx, p[0], p[1], p[2], rnd, shades[n % 3][0], shades[n % 3][1], 0.32);
      });
      ctx.strokeStyle = 'rgba(214,192,152,0.85)';
      ctx.lineCap = 'round';
      for (var i = 0; i < 6; i++) root(ctx, rnd() * s, -4, 1.57 + (rnd() - 0.5) * 1.2, s * 0.26, s * 0.012, rnd, 3);
      leaf(ctx, s * 0.72, s * 0.7, s * 0.3, 0.6, '#7a5a30');
    }
  };

  var microCache = {};
  A.micro = function (id, size) {
    size = size || 240;
    var key = id + ':' + size;
    if (microCache[key]) return microCache[key];
    var c = canvas(size, size);
    MICRO[id](c.getContext('2d'), size, SE.core.rng(SEEDS[id] * 53));
    return (microCache[key] = c);
  };

  // ------------------------------------------------------------------
  // Texture samples
  // ------------------------------------------------------------------
  var texCache = {};
  A.texSample = function (kind, w, h) {
    w = w || 280;
    h = h || 170;
    var key = kind + ':' + w + 'x' + h;
    if (texCache[key]) return texCache[key];
    var c = canvas(w, h);
    var ctx = c.getContext('2d');
    var rnd = SE.core.rng(kind.length * 7919 + kind.charCodeAt(0));
    var i;
    if (kind === 'sandy') {
      ground(ctx, w, h, '#c4a372', 201, 9, 0.3);
      var sand = [['#f0dcb0', '#c4a066'], ['#e4cc9a', '#ac8a54'], ['#f6e8c8', '#d0b480'], ['#b89460', '#8a6a3c'], ['#d8d0c4', '#a09484']];
      scatter(w, h, 900, w * 0.008, w * 0.017, rnd).forEach(function (p, n) {
        ctx.save();
        ctx.shadowColor = 'rgba(60,40,16,0.6)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetY = 1;
        grain(ctx, p[0], p[1], p[2], rnd, sand[n % 5][0], sand[n % 5][1], 0.16);
        ctx.restore();
      });
    } else if (kind === 'clayey') {
      var img = ctx.createImageData(w, h);
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var u = x / w;
          var v = y / w;
          var smear = fbm(u * 2 + v * 3, v * 22 - u * 6, 211, 3);
          var body = fbm(u * 3, v * 3, 212, 3);
          var shine = step(0.62, 0.8, smear) * step(0.4, 0.7, body);
          set([128, 96, 76]);
          mix([98, 72, 58], body);
          mul(0.92 + 0.16 * smear);
          mix([212, 196, 184], shine * 0.5);
          var k = (y * w + x) * 4;
          img.data[k] = P.r;
          img.data[k + 1] = P.g;
          img.data[k + 2] = P.b;
          img.data[k + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      ctx.strokeStyle = 'rgba(52,34,26,0.5)';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      for (i = 0; i < 5; i++) {
        var x0 = rnd() * w;
        var y0 = rnd() * h;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.bezierCurveTo(x0 + 30, y0 - 10, x0 + 60, y0 + 14, x0 + 100, y0 + (rnd() - 0.5) * 20);
        ctx.stroke();
      }
    } else {
      ground(ctx, w, h, '#3a2a1e', 221, 12, 0.5);
      var loam = [['#7a5c42', '#48331f'], ['#66492f', '#3a281a'], ['#8a6a4c', '#54391f'], ['#5a4230', '#32231a']];
      scatter(w, h, 260, w * 0.014, w * 0.045, rnd).forEach(function (p, n) {
        ctx.save();
        ctx.shadowColor = 'rgba(16,10,6,0.6)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1.5;
        grain(ctx, p[0], p[1], p[2], rnd, loam[n % 4][0], loam[n % 4][1], 0.34);
        ctx.restore();
      });
      ctx.strokeStyle = 'rgba(206,180,128,0.75)';
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      for (i = 0; i < 12; i++) {
        var sx = rnd() * w;
        var sy = rnd() * h;
        var sa = rnd() * 6.283;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(sa) * 16, sy + Math.sin(sa) * 16);
        ctx.stroke();
      }
    }
    return (texCache[key] = c);
  };

  // ------------------------------------------------------------------
  // The soil profile on the welcome screen: four layers, top to bottom
  // ------------------------------------------------------------------
  A.PROFILE = [0, 0.24, 0.5, 0.76, 1];
  A.profile = function (w, h) {
    var c = canvas(w, h);
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(w, h);
    var ramps = stops([[0, '#2e2118'], [0.2, '#4a3524'], [0.25, '#8a6844'], [0.47, '#a07c52'], [0.52, '#84705c'], [0.74, '#7c7266'], [0.78, '#5e5a58'], [1, '#4a4848']]);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var s = x / w;
        var t = y / h;
        var tt = Math.min(1, Math.max(0, t + 0.03 * (fbm(s * 7, t * 2, 301, 2) - 0.5)));
        ramp(ramps, tt);
        mul(0.84 + 0.32 * fbm(s * (w / 5), t * (h / 5), 302, 2));
        if (tt > 0.77) mul(0.9 + 0.2 * noise(s * 5, t * 30, 303));
        var i = (y * w + x) * 4;
        img.data[i] = P.r;
        img.data[i + 1] = P.g;
        img.data[i + 2] = P.b;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    var rnd = SE.core.rng(4242);
    var i2;
    // stones in the subsoil
    for (i2 = 0; i2 < 14; i2++) stone(ctx, rnd() * w, (0.28 + rnd() * 0.2) * h, w * (0.006 + rnd() * 0.012), rnd, '#c9b89c', '#7c6a52');
    // broken rock
    shards(ctx, w, h, rnd, 70, 0.52, 0.76, w * 0.012, w * 0.036, ['#9a8e80', '#857a6e', '#aa9c8a', '#6f665c', '#93877a']);
    // joints in the bedrock
    ctx.strokeStyle = 'rgba(20,18,18,0.55)';
    ctx.lineWidth = 1.5;
    for (i2 = 0; i2 < 9; i2++) {
      var x0 = rnd() * w;
      var y0 = (0.79 + rnd() * 0.08) * h;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + (rnd() - 0.5) * w * 0.1, y0 + h * (0.08 + rnd() * 0.1));
      ctx.lineTo(x0 + (rnd() - 0.5) * w * 0.16, h);
      ctx.stroke();
    }
    // roots reaching down from the plants above
    ctx.strokeStyle = '#b89a70';
    ctx.lineCap = 'round';
    for (i2 = 0; i2 < 9; i2++) root(ctx, (i2 + 0.2 + rnd() * 0.6) * (w / 9), 0, 1.57 + (rnd() - 0.5) * 0.5, h * (0.06 + rnd() * 0.035), Math.max(1.5, w * 0.004), rnd, 3);
    // an earthworm in the topsoil
    ctx.strokeStyle = '#c98a78';
    ctx.lineWidth = Math.max(3, w * 0.007);
    ctx.beginPath();
    ctx.moveTo(w * 0.62, h * 0.15);
    ctx.bezierCurveTo(w * 0.66, h * 0.11, w * 0.69, h * 0.2, w * 0.73, h * 0.16);
    ctx.stroke();
    return c;
  };

  // ------------------------------------------------------------------
  // Bhoomi, the guide. Parts marked m-<mood> show for that mood only.
  // ------------------------------------------------------------------
  var INK = '#3a2a1c';
  var SKIN = '#e3ab7a';
  var COAT = '#f6efdf';
  function arm(d, hand) {
    return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="23" stroke-linecap="round"/>' + '<path d="' + d + '" fill="none" stroke="' + COAT + '" stroke-width="18" stroke-linecap="round"/>' + hand;
  }
  function fist(x, y) {
    return '<circle cx="' + x + '" cy="' + y + '" r="10.5" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.5"/>';
  }
  var SCIENTIST =
    '<svg class="sci-svg" viewBox="0 0 200 232" aria-hidden="true" focusable="false">' +
    // hair behind
    '<path d="M40 108C32 50 66 20 100 20c36 0 68 30 60 88 3 22-3 40-12 50H52c-9-10-15-28-12-50z" fill="#3b2418" stroke="' + INK + '" stroke-width="2.5"/>' +
    // neck
    '<path d="M88 138h24v26H88z" fill="#cf9460"/>' +
    // coat and shirt
    '<path d="M34 232c0-42 20-64 52-70l14 16 14-16c32 6 52 28 52 70z" fill="' + COAT + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M87 162l13 30 13-30-5-3-8 13-8-13z" fill="#3e6b46" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M86 162l-9 26 19 14 4-10z" fill="#fffaf0" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M114 162l9 26-19 14-4-10z" fill="#fffaf0" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M124 206h20v16h-20z" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M130 200v10M137 202v8" stroke="#b5533a" stroke-width="3" stroke-linecap="round"/>' +
    // ears and face
    '<ellipse cx="55" cy="106" rx="6" ry="9" fill="#d99c68" stroke="' + INK + '" stroke-width="2"/>' +
    '<ellipse cx="145" cy="106" rx="6" ry="9" fill="#d99c68" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M56 94c0-32 20-48 44-48s44 16 44 48c0 31-20 54-44 54s-44-23-44-54z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.5"/>' +
    '<ellipse cx="72" cy="119" rx="8" ry="4.5" fill="#d47b5a" opacity=".42"/>' +
    '<ellipse cx="128" cy="119" rx="8" ry="4.5" fill="#d47b5a" opacity=".42"/>' +
    // fringe
    '<path d="M53 100C46 54 76 32 102 32c28 0 54 22 46 68-5-14-12-26-23-34-2 10-8 16-17 18 2-8 0-14-4-20-9 14-24 22-39 22-5 4-9 8-12 14z" fill="#3b2418" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M72 50c10-8 24-10 36-8" fill="none" stroke="#6a4630" stroke-width="3" stroke-linecap="round"/>' +
    // goggles pushed up on the head
    '<path d="M50 66c14-28 86-28 100 0" fill="none" stroke="#7a8440" stroke-width="7" stroke-linecap="round"/>' +
    '<rect x="66" y="30" width="30" height="20" rx="9" fill="#d4e6dc" stroke="' + INK + '" stroke-width="2.5"/>' +
    '<rect x="104" y="30" width="30" height="20" rx="9" fill="#d4e6dc" stroke="' + INK + '" stroke-width="2.5"/>' +
    '<path d="M96 40h8" stroke="' + INK + '" stroke-width="3"/>' +
    '<path d="M72 36l6 8M110 36l6 8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>' +
    // brows
    '<g class="m m-happy m-point m-cheer"><path d="M70 87q10-6 20-2M110 85q10-4 20 2" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/></g>' +
    '<g class="m m-think"><path d="M70 84q10-5 20 0M110 88q10-7 20-3" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/></g>' +
    '<g class="m m-oops"><path d="M70 88q10-7 20-6M110 82q10-1 20 6" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/></g>' +
    // eyes: open
    '<g class="m m-happy m-point m-oops">' +
    '<ellipse cx="80" cy="104" rx="9.5" ry="11.5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><ellipse cx="80.5" cy="105" rx="6.6" ry="8.6" fill="#6b3f22"/><circle cx="80.5" cy="106" r="3.6" fill="#24140c"/><circle cx="77.6" cy="100.6" r="2.7" fill="#fff"/><circle cx="83.6" cy="109.4" r="1.3" fill="#fff"/>' +
    '<ellipse cx="120" cy="104" rx="9.5" ry="11.5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><ellipse cx="119.5" cy="105" rx="6.6" ry="8.6" fill="#6b3f22"/><circle cx="119.5" cy="106" r="3.6" fill="#24140c"/><circle cx="116.6" cy="100.6" r="2.7" fill="#fff"/><circle cx="122.6" cy="109.4" r="1.3" fill="#fff"/>' +
    '<path d="M69.5 98q10-10 21 0M109.5 98q10-10 21 0" fill="none" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round"/></g>' +
    // eyes: looking up, thinking
    '<g class="m m-think">' +
    '<ellipse cx="80" cy="104" rx="9.5" ry="11.5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><ellipse cx="83" cy="100" rx="6" ry="7.4" fill="#6b3f22"/><circle cx="83.6" cy="99.4" r="3.2" fill="#24140c"/><circle cx="81" cy="96.6" r="2.2" fill="#fff"/>' +
    '<ellipse cx="120" cy="104" rx="9.5" ry="11.5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><ellipse cx="123" cy="100" rx="6" ry="7.4" fill="#6b3f22"/><circle cx="123.6" cy="99.4" r="3.2" fill="#24140c"/><circle cx="121" cy="96.6" r="2.2" fill="#fff"/>' +
    '<path d="M69.5 98q10-10 21 0M109.5 98q10-10 21 0" fill="none" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round"/></g>' +
    // eyes: closed and smiling
    '<g class="m m-cheer"><path d="M70 106q10-12 20 0M110 106q10-12 20 0" fill="none" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/></g>' +
    // nose
    '<path d="M99 115q3 3 0 6" fill="none" stroke="#b9794c" stroke-width="2" stroke-linecap="round"/>' +
    // mouths
    '<g class="m m-happy m-point"><path d="M89 128q11 11 22 0" fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/></g>' +
    '<g class="m m-think"><path d="M93 131q7-4 13 0" fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/></g>' +
    '<g class="m m-cheer"><path d="M87 125q13 22 26 0z" fill="#8a3324" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M93 135q7 5 14 0-7-4-14 0z" fill="#e58a7a"/></g>' +
    '<g class="m m-oops"><path d="M91 129q9 7 18 0" fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/></g>' +
    // arms
    '<g class="m m-happy">' + arm('M150 204L172 168', fist(174, 160) + '<path d="M168 152v-9M173 150v-11M178 151v-9M183 155l4-7" stroke="' + INK + '" stroke-width="5.5" stroke-linecap="round"/><path d="M168 152v-9M173 150v-11M178 151v-9M183 155l4-7" stroke="' + SKIN + '" stroke-width="3" stroke-linecap="round"/>') + '</g>' +
    '<g class="m m-point">' + arm('M52 204L30 172', fist(26, 166) + '<path d="M22 160L10 146" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M22 160L10 146" stroke="' + SKIN + '" stroke-width="4" stroke-linecap="round"/>') + '</g>' +
    '<g class="m m-think">' + arm('M150 212L128 170', fist(118, 152)) + '</g>' +
    '<g class="m m-cheer">' + arm('M48 204L26 160', fist(22, 150)) + arm('M152 204L174 160', fist(178, 150)) + '<path d="M12 128l3 7 7 3-7 3-3 7-3-7-7-3 7-3zM188 124l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#c59a3d"/></g>' +
    '<g class="m m-oops">' + arm('M150 208L170 178', fist(174, 170) + '<path d="M174 162v-12" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="M174 162v-12" stroke="' + SKIN + '" stroke-width="5" stroke-linecap="round"/>') + '</g>' +
    '</svg>';

  /** A fresh drawing of Bhoomi. Set data-mood on the returned element. */
  A.scientist = function (mood) {
    var wrap = document.createElement('span');
    wrap.className = 'sci';
    wrap.setAttribute('data-mood', mood || 'happy');
    wrap.innerHTML = SCIENTIST;
    return wrap;
  };

  A.blobPath = blobPath;
  A.canvas = canvas;
})();
