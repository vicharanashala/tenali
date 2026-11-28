/*
 * Soil Explorer 3D sample viewer.
 * A small WebGL scene written by hand (no library): one block of soil with
 * a bumpy top and a cut face on each side. Drag to turn it, scroll or pinch
 * to zoom. Where WebGL is missing, the same sample is drawn as a still
 * picture with ordinary canvas drawing.
 */
(function () {
  'use strict';

  var SE = window.SE;
  var V = (SE.viewer3d = {});

  var TALL = 1.1; // the block is 2 x 2 wide and this high
  var RELIEF = 0.17; // how far the top surface rises and falls
  var GRID = 72;
  var HOME = { yaw: -0.62, pitch: 0.5, dist: 5.6 };
  var FRONT = { yaw: 0, pitch: 0.13, dist: 4.7 };
  var LIMIT = { pitch: [0.04, 1.35], dist: [3.4, 8.5] };

  // ---- 4 x 4 matrices, column by column ----
  function persp(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0];
  }
  function mul4(a, b) {
    var o = new Array(16);
    for (var c = 0; c < 4; c++) {
      for (var r = 0; r < 4; r++) {
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }
  function rotX(a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  }
  function rotY(a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  }
  function trans(x, y, z) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  }
  function apply(m, p) {
    return [
      m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
      m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
      m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
      m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]
    ];
  }

  var VERT =
    'attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUv;' +
    'uniform mat4 uMvp; uniform mat3 uRot;' +
    'varying vec2 vUv; varying float vLight;' +
    'void main() {' +
    '  vec3 n = normalize(uRot * aNor);' +
    '  float d = max(dot(n, normalize(vec3(-0.45, 0.75, 0.6))), 0.0);' +
    '  vLight = 0.5 + 0.62 * d;' +
    '  vUv = aUv;' +
    '  gl_Position = uMvp * vec4(aPos, 1.0);' +
    '}';
  var FRAG =
    'precision mediump float;' +
    'uniform sampler2D uTex; uniform float uShadow;' +
    'varying vec2 vUv; varying float vLight;' +
    'void main() {' +
    '  if (uShadow > 0.5) {' +
    '    float d = distance(vUv, vec2(0.5)) * 2.0;' +
    '    float a = 0.42 * (1.0 - smoothstep(0.45, 1.0, d));' +
    '    gl_FragColor = vec4(vec3(0.16, 0.1, 0.05) * a, a);' +
    '  } else {' +
    '    gl_FragColor = vec4(texture2D(uTex, vUv).rgb * vLight, 1.0);' +
    '  }' +
    '}';

  /** Height of the top surface at (u, v), each from 0 to 1. */
  function heightAt(top, u, v) {
    var n = top.size;
    var x = Math.min(n - 1, Math.max(0, Math.round(u * (n - 1))));
    var y = Math.min(n - 1, Math.max(0, Math.round(v * (n - 1))));
    var sum = 0;
    var cnt = 0;
    for (var dy = -2; dy <= 2; dy += 2) {
      for (var dx = -2; dx <= 2; dx += 2) {
        var xx = Math.min(n - 1, Math.max(0, x + dx));
        var yy = Math.min(n - 1, Math.max(0, y + dy));
        sum += top.height[yy * n + xx];
        cnt++;
      }
    }
    return TALL / 2 + RELIEF * (sum / cnt - 0.45);
  }

  function buildMesh(top) {
    var n = GRID + 1;
    var pos = [];
    var nor = [];
    var uv = [];
    var idx = [];
    var hs = new Float32Array(n * n);
    var i, j;
    for (j = 0; j < n; j++) for (i = 0; i < n; i++) hs[j * n + i] = heightAt(top, i / GRID, j / GRID);
    var cellSize = 2 / GRID;
    for (j = 0; j < n; j++) {
      for (i = 0; i < n; i++) {
        var hx = hs[j * n + Math.min(n - 1, i + 1)] - hs[j * n + Math.max(0, i - 1)];
        var hz = hs[Math.min(n - 1, j + 1) * n + i] - hs[Math.max(0, j - 1) * n + i];
        var nx = -hx / (2 * cellSize);
        var nz = -hz / (2 * cellSize);
        var len = Math.sqrt(nx * nx + 1 + nz * nz);
        pos.push(-1 + i * cellSize, hs[j * n + i], -1 + j * cellSize);
        nor.push(nx / len, 1 / len, nz / len);
        uv.push(i / GRID, j / GRID);
      }
    }
    for (j = 0; j < GRID; j++) {
      for (i = 0; i < GRID; i++) {
        var a = j * n + i;
        idx.push(a, a + n, a + 1, a + 1, a + n, a + n + 1);
      }
    }
    var topCount = idx.length;

    // Four cut faces. Each walks along one edge of the top; the picture is
    // mirrored on every second face so it meets itself at the corners.
    var sides = [
      { at: function (k) { return [k, 1]; }, n: [0, 0, 1], flip: false },
      { at: function (k) { return [1, 1 - k]; }, n: [1, 0, 0], flip: true },
      { at: function (k) { return [1 - k, 0]; }, n: [0, 0, -1], flip: false },
      { at: function (k) { return [0, k]; }, n: [-1, 0, 0], flip: true }
    ];
    sides.forEach(function (side) {
      var base = pos.length / 3;
      for (i = 0; i <= GRID; i++) {
        var k = i / GRID;
        var p = side.at(k);
        var gi = Math.round(p[0] * GRID);
        var gj = Math.round(p[1] * GRID);
        var x = -1 + 2 * p[0];
        var z = -1 + 2 * p[1];
        var tu = side.flip ? 1 - k : k;
        pos.push(x, hs[gj * n + gi], z, x, -TALL / 2, z);
        nor.push(side.n[0], side.n[1], side.n[2], side.n[0], side.n[1], side.n[2]);
        uv.push(tu, 0, tu, 1);
      }
      for (i = 0; i < GRID; i++) {
        var q = base + i * 2;
        idx.push(q, q + 1, q + 2, q + 2, q + 1, q + 3);
      }
    });
    return { pos: new Float32Array(pos), nor: new Float32Array(nor), uv: new Float32Array(uv), idx: new Uint16Array(idx), topCount: topCount, sideCount: idx.length - topCount };
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /**
   * Put a viewer inside `host`. Returns
   *   setSoil(id), resetView(), zoomBy(factor), spin(), lookAt('front'),
   *   project(anchor), destroy(), fallback (true when drawn without WebGL)
   * and calls opts.onChange after every redraw.
   */
  V.create = function (host, opts) {
    opts = opts || {};
    var canvas = document.createElement('canvas');
    canvas.className = 'viewer-canvas';
    canvas.tabIndex = 0;
    host.appendChild(canvas);

    var gl = null;
    if (!opts.force2d) {
      try {
        gl = canvas.getContext('webgl', { alpha: true, antialias: true }) || canvas.getContext('experimental-webgl');
      } catch (e) {
        gl = null;
      }
    }
    var ctx2d = gl ? null : canvas.getContext('2d');
    var detail = (navigator.hardwareConcurrency || 4) > 4 && !opts.light ? 512 : 256;

    var view = { yaw: HOME.yaw, pitch: HOME.pitch, dist: HOME.dist };
    var soil = null;
    var top = null;
    var side = null;
    var cssW = 1;
    var cssH = 1;
    var mvp = null;
    var modelView = null;
    var rot = null;
    var frame = 0;
    var anim = null;
    var dead = false;
    var G = null; // WebGL objects

    function initGl() {
      function shader(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      }
      var prog = gl.createProgram();
      gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      G = {
        prog: prog,
        aPos: gl.getAttribLocation(prog, 'aPos'),
        aNor: gl.getAttribLocation(prog, 'aNor'),
        aUv: gl.getAttribLocation(prog, 'aUv'),
        uMvp: gl.getUniformLocation(prog, 'uMvp'),
        uRot: gl.getUniformLocation(prog, 'uRot'),
        uTex: gl.getUniformLocation(prog, 'uTex'),
        uShadow: gl.getUniformLocation(prog, 'uShadow'),
        block: { pos: gl.createBuffer(), nor: gl.createBuffer(), uv: gl.createBuffer(), idx: gl.createBuffer() },
        shadow: { pos: gl.createBuffer(), nor: gl.createBuffer(), uv: gl.createBuffer(), idx: gl.createBuffer() },
        texTop: gl.createTexture(),
        texSide: gl.createTexture(),
        mesh: null
      };
      var y = -TALL / 2 - 0.004;
      var r = 1.9;
      fillBuffers(G.shadow, {
        pos: new Float32Array([-r, y, -r, r, y, -r, -r, y, r, r, y, r]),
        nor: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
        uv: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
        idx: new Uint16Array([0, 2, 1, 1, 2, 3])
      });
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    }
    function fillBuffers(b, m) {
      gl.bindBuffer(gl.ARRAY_BUFFER, b.pos);
      gl.bufferData(gl.ARRAY_BUFFER, m.pos, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.nor);
      gl.bufferData(gl.ARRAY_BUFFER, m.nor, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.uv);
      gl.bufferData(gl.ARRAY_BUFFER, m.uv, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.idx);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
    }
    function bind(b) {
      gl.bindBuffer(gl.ARRAY_BUFFER, b.pos);
      gl.enableVertexAttribArray(G.aPos);
      gl.vertexAttribPointer(G.aPos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.nor);
      gl.enableVertexAttribArray(G.aNor);
      gl.vertexAttribPointer(G.aNor, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.uv);
      gl.enableVertexAttribArray(G.aUv);
      gl.vertexAttribPointer(G.aUv, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.idx);
    }
    function upload(tex, source) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }

    if (gl) {
      try {
        initGl();
      } catch (e) {
        gl = null;
        G = null;
        // A canvas that already gave out a WebGL context cannot draw in 2D,
        // so swap in a fresh one for the still picture.
        var fresh = document.createElement('canvas');
        fresh.className = canvas.className;
        fresh.tabIndex = 0;
        host.replaceChild(fresh, canvas);
        canvas = fresh;
        ctx2d = canvas.getContext('2d');
      }
    }

    function matrices() {
      var aspect = cssW / cssH;
      var fov = 0.56;
      // The view is tuned for a picture about 1.3 times as wide as it is tall.
      // On anything narrower, step back so the whole block still fits.
      var back = aspect < 1.3 ? (view.dist * 1.3) / Math.max(0.55, aspect) : view.dist;
      var r = mul4(rotX(view.pitch), rotY(view.yaw));
      modelView = mul4(trans(0, -0.08, -back), r);
      mvp = mul4(persp(fov, aspect, 0.5, 40), modelView);
      rot = [r[0], r[1], r[2], r[4], r[5], r[6], r[8], r[9], r[10]];
    }

    // ---- still picture, used when WebGL is not available ----
    var isoScale = 1;
    function iso(x, y, z) {
      return [cssW / 2 + (x - z) * isoScale * 0.82, cssH * 0.5 + (x + z) * isoScale * 0.44 - y * isoScale * 0.95];
    }
    function face(img, o, pu, pv, shade) {
      var dpr = canvas.width / cssW;
      var w = img.width;
      var h = img.height;
      ctx2d.setTransform(((pu[0] - o[0]) / w) * dpr, ((pu[1] - o[1]) / w) * dpr, ((pv[0] - o[0]) / h) * dpr, ((pv[1] - o[1]) / h) * dpr, o[0] * dpr, o[1] * dpr);
      ctx2d.drawImage(img, 0, 0);
      if (shade) {
        ctx2d.fillStyle = 'rgba(20,12,6,' + shade + ')';
        ctx2d.fillRect(0, 0, w, h);
      }
    }
    function draw2d() {
      isoScale = Math.min(cssW / 3.6, cssH / 3.1);
      ctx2d.setTransform(1, 0, 0, 1, 0, 0);
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      if (!top) return;
      var t = TALL / 2;
      var dpr = canvas.width / cssW;
      var g = iso(0, -t, 0);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2d.fillStyle = 'rgba(40,26,12,0.22)';
      ctx2d.beginPath();
      ctx2d.ellipse(g[0], g[1] + isoScale * 0.1, isoScale * 1.9, isoScale * 1.0, 0, 0, 6.283);
      ctx2d.fill();
      face(side, iso(-1, t, 1), iso(1, t, 1), iso(-1, -t, 1), 0.1);
      face(side, iso(1, t, 1), iso(1, t, -1), iso(1, -t, 1), 0.3);
      face(top.canvas, iso(-1, t, -1), iso(1, t, -1), iso(-1, t, 1), 0);
    }

    function draw() {
      frame = 0;
      if (dead) return;
      if (anim) {
        var k = Math.min(1, (performance.now() - anim.t0) / anim.dur);
        var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        view.yaw = anim.from.yaw + (anim.to.yaw - anim.from.yaw) * e;
        view.pitch = anim.from.pitch + (anim.to.pitch - anim.from.pitch) * e;
        view.dist = anim.from.dist + (anim.to.dist - anim.from.dist) * e;
        if (k >= 1) anim = null;
        else request();
      }
      if (!gl) {
        draw2d();
      } else {
        matrices();
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (G.mesh) {
          gl.uniformMatrix4fv(G.uMvp, false, new Float32Array(mvp));
          gl.uniformMatrix3fv(G.uRot, false, new Float32Array(rot));
          gl.uniform1i(G.uTex, 0);
          gl.activeTexture(gl.TEXTURE0);
          gl.depthMask(false);
          gl.uniform1f(G.uShadow, 1);
          bind(G.shadow);
          gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
          gl.depthMask(true);
          gl.uniform1f(G.uShadow, 0);
          bind(G.block);
          gl.bindTexture(gl.TEXTURE_2D, G.texTop);
          gl.drawElements(gl.TRIANGLES, G.mesh.topCount, gl.UNSIGNED_SHORT, 0);
          gl.bindTexture(gl.TEXTURE_2D, G.texSide);
          gl.drawElements(gl.TRIANGLES, G.mesh.sideCount, gl.UNSIGNED_SHORT, G.mesh.topCount * 2);
        }
      }
      if (opts.onChange) opts.onChange();
    }
    function request() {
      if (!frame && !dead) frame = requestAnimationFrame(draw);
    }

    function resize() {
      var box = host.getBoundingClientRect();
      cssW = Math.max(1, box.width);
      cssH = Math.max(1, box.height);
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      request();
    }
    var watcher = null;
    if (window.ResizeObserver) {
      watcher = new ResizeObserver(resize);
      watcher.observe(host);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();

    function go(to, dur) {
      if (reducedMotion() || !dur) {
        anim = null;
        view.yaw = to.yaw;
        view.pitch = to.pitch;
        view.dist = to.dist;
      } else {
        anim = { from: { yaw: view.yaw, pitch: view.pitch, dist: view.dist }, to: to, t0: performance.now(), dur: dur };
      }
      request();
    }
    function wrap(a) {
      return a - Math.round(a / 6.283185) * 6.283185;
    }
    function clampView() {
      view.pitch = Math.min(LIMIT.pitch[1], Math.max(LIMIT.pitch[0], view.pitch));
      view.dist = Math.min(LIMIT.dist[1], Math.max(LIMIT.dist[0], view.dist));
    }

    // ---- pointer, wheel and keyboard ----
    var pointers = {};
    var spread = 0;
    function down(e) {
      if (!gl) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {
        /* the pointer may already be gone */
      }
      anim = null;
      spread = 0;
    }
    function move(e) {
      var p = pointers[e.pointerId];
      if (!p) return;
      var ids = Object.keys(pointers);
      if (ids.length === 1) {
        view.yaw += (e.clientX - p.x) * 0.011;
        view.pitch += (e.clientY - p.y) * 0.009;
      }
      p.x = e.clientX;
      p.y = e.clientY;
      if (ids.length === 2) {
        var a = pointers[ids[0]];
        var b = pointers[ids[1]];
        var d = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        if (spread) view.dist *= spread / Math.max(1, d);
        spread = d;
      }
      clampView();
      request();
    }
    function up(e) {
      delete pointers[e.pointerId];
      spread = 0;
    }
    function wheel(e) {
      if (!gl) return;
      e.preventDefault();
      anim = null;
      view.dist *= e.deltaY > 0 ? 1.08 : 0.92;
      clampView();
      request();
    }
    function key(e) {
      if (!gl) return;
      var used = true;
      if (e.key === 'ArrowLeft') view.yaw -= 0.14;
      else if (e.key === 'ArrowRight') view.yaw += 0.14;
      else if (e.key === 'ArrowUp') view.pitch += 0.1;
      else if (e.key === 'ArrowDown') view.pitch -= 0.1;
      else if (e.key === '+' || e.key === '=') view.dist *= 0.9;
      else if (e.key === '-') view.dist *= 1.1;
      else used = false;
      if (used) {
        e.preventDefault();
        anim = null;
        clampView();
        request();
      }
    }
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('wheel', wheel, { passive: false });
    canvas.addEventListener('keydown', key);

    var api = {
      canvas: canvas,
      fallback: !gl,
      setSoil: function (id) {
        soil = id;
        top = SE.art.soilTop(id, detail);
        side = SE.art.soilSide(id, 512, 256);
        if (gl) {
          G.mesh = buildMesh(top);
          fillBuffers(G.block, G.mesh);
          upload(G.texTop, top.canvas);
          upload(G.texSide, side);
        }
        request();
      },
      soil: function () {
        return soil;
      },
      resetView: function () {
        go({ yaw: HOME.yaw, pitch: HOME.pitch, dist: HOME.dist }, 500);
        view.yaw = wrap(view.yaw);
        if (anim) anim.from.yaw = view.yaw;
      },
      zoomBy: function (factor) {
        var d = Math.min(LIMIT.dist[1], Math.max(LIMIT.dist[0], view.dist * factor));
        go({ yaw: view.yaw, pitch: view.pitch, dist: d }, 220);
      },
      spin: function () {
        go({ yaw: view.yaw + 6.283185, pitch: view.pitch, dist: view.dist }, 1500);
      },
      lookAt: function (name) {
        view.yaw = wrap(view.yaw);
        go(name === 'front' ? { yaw: FRONT.yaw, pitch: FRONT.pitch, dist: FRONT.dist } : { yaw: HOME.yaw, pitch: HOME.pitch, dist: HOME.dist }, 600);
      },
      view: function () {
        return { yaw: view.yaw, pitch: view.pitch, dist: view.dist };
      },
      /**
       * Where a point on the sample sits on screen.
       * anchor: ['top', u, v] or ['front', along, depth], each from 0 to 1.
       * Returns { x, y, visible } in CSS pixels inside the host.
       */
      project: function (anchor) {
        if (!top) return { x: 0, y: 0, visible: false };
        var p, n;
        if (anchor[0] === 'top') {
          p = [-1 + 2 * anchor[1], heightAt(top, anchor[1], anchor[2]) + 0.02, -1 + 2 * anchor[2]];
          n = [0, 1, 0];
        } else {
          p = [-1 + 2 * anchor[1], TALL / 2 - anchor[2] * TALL, 1.01];
          n = [0, 0, 1];
        }
        if (!gl) {
          var q = iso(p[0], p[1], p[2]);
          return { x: q[0], y: q[1], visible: true };
        }
        if (!mvp) matrices();
        var c = apply(mvp, p);
        var eye = apply(modelView, p);
        var nv = [rot[0] * n[0] + rot[3] * n[1] + rot[6] * n[2], rot[1] * n[0] + rot[4] * n[1] + rot[7] * n[2], rot[2] * n[0] + rot[5] * n[1] + rot[8] * n[2]];
        var len = Math.sqrt(eye[0] * eye[0] + eye[1] * eye[1] + eye[2] * eye[2]);
        var facing = -(nv[0] * eye[0] + nv[1] * eye[1] + nv[2] * eye[2]) / len;
        return { x: (c[0] / c[3] / 2 + 0.5) * cssW, y: (0.5 - c[1] / c[3] / 2) * cssH, visible: facing > 0.12 };
      },
      destroy: function () {
        dead = true;
        if (frame) cancelAnimationFrame(frame);
        if (watcher) watcher.disconnect();
        else window.removeEventListener('resize', resize);
        if (gl) {
          var lose = gl.getExtension('WEBGL_lose_context');
          if (lose) lose.loseContext();
        }
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    };
    return api;
  };
})();
