// Vikramshila Developers — THE GOLDEN SWIRL.
//
// Black. A sparse scatter of small golden squares appears and SWIRLS —
// each one spiralling in along its own arc, the whole field turning like
// one slow wind — and settles. Every square seats into its exact pixel of
// the photograph, and the sharp image develops UNDERNEATH in lockstep
// with the settling (its opacity is driven from the same clock, in the
// same requestAnimationFrame), so the moment the last embers land the
// picture is simply there. No pause, no pop, no seam — structurally
// impossible for there to be a gap.
//
// The whole unfurl: ~2.2 seconds.
//
// Craft constants inherited from earlier engines: the tan(fov/2)
// point-size correction and seat-size overlap (kills 1px grid seams).
// Scroll is never hijacked — a gesture just completes the reveal.
// Reduced-motion and non-WebGL visitors get the photograph immediately.
(function () {
  'use strict';

  var cover = document.querySelector('[data-hero3d]');
  if (!cover) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = cover.querySelector('#hero3d-canvas');
  var media = cover.querySelector('.cover-media');
  var heroImg = cover.querySelector('.cover-media img');
  var scrim = cover.querySelector('.cover-scrim');

  function supportsWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  function standDown() {
    document.documentElement.classList.remove('h3-pending');
    cover.classList.add('h3-resolved');
    if (canvas) canvas.remove();
  }

  if (reduceMotion || !canvas || !heroImg || !media || !supportsWebGL()) {
    standDown();
    return;
  }

  var DUR = 2200;        // the whole unfurl
  var SPAN = 0.48;       // one square's own spiral inside the global clock
  var speed = 1;
  var lastGesture = 0;

  var onGesture = function () {
    var now = performance.now();
    if (now - lastGesture < 250) return;
    lastGesture = now;
    speed = speed < 6 ? 6 : 40;
  };
  window.addEventListener('scroll', onGesture, { passive: true });
  window.addEventListener('wheel', onGesture, { passive: true });
  window.addEventListener('touchmove', onGesture, { passive: true });

  import('../vendor/three.module.js').then(function (THREE) {
    var w = window.innerWidth;
    var cols = w < 700 ? 96 : w < 1100 ? 150 : 184;

    var start = function () {
      var aspect = (heroImg.naturalWidth / heroImg.naturalHeight) || 16 / 9;
      var rows = Math.max(24, Math.round(cols / aspect));

      var off = document.createElement('canvas');
      off.width = cols; off.height = rows;
      var octx = off.getContext('2d');
      octx.drawImage(heroImg, 0, 0, cols, rows);
      var data;
      try {
        data = octx.getImageData(0, 0, cols, rows).data;
      } catch (e) { standDown(); return; }

      var count = cols * rows;
      var planeW = 16, planeH = planeW / aspect;

      var aSlot = new Float32Array(count * 3);
      var aPhoto = new Float32Array(count * 3);
      var aSeed = new Float32Array(count);
      var aDelay = new Float32Array(count);
      var aSwirl = new Float32Array(count);

      // arrival order: soft noise patches + brightness bias + jitter —
      // the picture accretes organically, lit windows and sky first
      function patchNoise(nx, ny) {
        var v = 0.5 + 0.45 * Math.sin(nx * 5.1 + 1.7) * Math.sin(ny * 4.3 + 0.6)
              + 0.10 * Math.sin(nx * 11.7 + ny * 9.1);
        return Math.min(1, Math.max(0, v));
      }

      var i = 0;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var i3 = i * 3;
          aSlot[i3] = (x / (cols - 1) - 0.5) * planeW;
          aSlot[i3 + 1] = (0.5 - y / (rows - 1)) * planeH;
          aSlot[i3 + 2] = 0;

          var di = (y * cols + x) * 4;
          var r = data[di] / 255, g = data[di + 1] / 255, b = data[di + 2] / 255;
          aPhoto[i3] = r; aPhoto[i3 + 1] = g; aPhoto[i3 + 2] = b;

          var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          aSeed[i] = Math.random();
          // two populations: a sparse tranche of visible SWIRLERS carries the
          // opening (gold arcs on black), while the mass of FILLERS stays
          // invisible until it materializes at its seat — the image developing
          var swirler = Math.random() < 0.09;
          aSwirl[i] = swirler ? 1 : 0;
          if (swirler) {
            aDelay[i] = (1 - SPAN) * 0.55 * Math.pow(Math.random(), 1.3);
          } else {
            aDelay[i] = (1 - SPAN) * (0.42 + 0.58 * Math.min(1, Math.max(0,
              0.40 * patchNoise(x / cols, y / rows) + 0.30 * (1 - lum) + 0.30 * Math.random())));
          }
          i++;
        }
      }

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, media.clientWidth / media.clientHeight, 0.1, 100);
      camera.position.z = 13;

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(media.clientWidth, media.clientHeight, false);

      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(aSlot, 3));
      geo.setAttribute('aSlot', new THREE.BufferAttribute(aSlot, 3));
      geo.setAttribute('aPhoto', new THREE.BufferAttribute(aPhoto, 3));
      geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
      geo.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1));
      geo.setAttribute('aSwirl', new THREE.BufferAttribute(aSwirl, 1));

      var uniforms = {
        uTime: { value: 0 },
        uRaw: { value: 0 },
        uSpan: { value: SPAN },
        uScale: { value: 1 },
        uPitchWorld: { value: 0.1 },
        uHeightPx: { value: 1 },
        uTanHalf: { value: 1 },
      };

      var mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: [
          'attribute vec3 aSlot;',
          'attribute vec3 aPhoto;',
          'attribute float aSeed;',
          'attribute float aDelay;',
          'attribute float aSwirl;',
          'uniform float uTime, uRaw, uSpan, uScale, uPitchWorld, uHeightPx, uTanHalf;',
          'varying vec3 vColor;',
          'varying float vAlpha;',
          'float easeInOut(float t){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) * 0.5; }',
          'float easeOut(float t){ return 1.0 - pow(1.0 - t, 3.0); }',
          'void main(){',
          '  float lp = clamp((uRaw - aDelay) / uSpan, 0.0, 1.0);',
          // THE SWIRL: each square spirals in — radius eases shut while the
          // angle keeps advancing, all in one coherent rotational direction
          // (one wind), speed varying square to square
          '  float rad = uPitchWorld * uScale * mix(1.6 + aSeed * 2.4, 9.0 + aSeed * 9.0, aSwirl) * (1.0 - easeInOut(lp));',
          '  float ang = aSeed * 6.2831 + mix(0.22, 0.85 + aSeed * 0.5, aSwirl) * 6.2831 * easeOut(lp) + uTime * 0.25;',
          '  vec3 p = aSlot * uScale + vec3(cos(ang) * rad, sin(ang) * rad * 0.72, 0.0);',
          '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
          '  gl_Position = projectionMatrix * mv;',
          // exact pitch at seat (tan(fov/2)-corrected), 1.12 overlap kills seams
          '  float sizeWorld = uPitchWorld * uScale * mix(mix(0.9, 1.4, aSwirl), 1.12, easeOut(lp));',
          '  gl_PointSize = sizeWorld * (uHeightPx * 0.5) / (uTanHalf * -mv.z);',
          // gold in flight, its pixel colour only at the moment of seating
          '  float fl = 0.74 + 0.26 * sin(uTime * (1.8 + aSeed * 2.6) + aSeed * 43.0);',
          '  vec3 ember = mix(vec3(0.40, 0.23, 0.07), vec3(0.78, 0.50, 0.15), fract(aSeed * 7.31)) * fl;',
          // swirlers stay gold almost to the seat; fillers turn to the
          // pixel colour early — they ARE the image developing
          '  float colorAt = mix(smoothstep(0.25, 0.70, lp), smoothstep(0.85, 1.0, lp), aSwirl);',
          '  vColor = mix(ember, aPhoto, colorAt);',
          // swirlers are born visibly ahead of flight; fillers surface only
          // as they slide the last inch home
          '  float birthS = smoothstep(aDelay - 0.16, aDelay - 0.05, uRaw);',
          '  float birthF = smoothstep(0.55, 0.85, lp);',
          '  float birth = mix(birthF, birthS, aSwirl);',
          '  vAlpha = birth * mix(0.8 + 0.2 * fl, 1.0, lp);',
          '}',
        ].join('\n'),
        fragmentShader: [
          'varying vec3 vColor;',
          'varying float vAlpha;',
          'void main(){',
          '  vec2 q = gl_PointCoord - 0.5;',
          '  float m = max(abs(q.x), abs(q.y));',
          '  float a = (1.0 - smoothstep(0.44, 0.5, m)) * vAlpha;',
          '  if (a < 0.012) discard;',
          '  gl_FragColor = vec4(vColor, a);',
          '}',
        ].join('\n'),
      });

      var points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      scene.add(points);

      function fit() {
        var vFov = (camera.fov * Math.PI) / 180;
        var halfTan = Math.tan(vFov / 2);
        var visH = 2 * halfTan * camera.position.z;
        var visW = visH * camera.aspect;
        var scale = Math.max(visW / planeW, visH / planeH) * 1.02;
        uniforms.uScale.value = scale;
        uniforms.uTanHalf.value = halfTan;
        uniforms.uHeightPx.value = renderer.domElement.height;
        uniforms.uPitchWorld.value = planeW / (cols - 1);
      }
      fit();

      cover.classList.add('h3-active');
      document.documentElement.classList.remove('h3-pending');

      function smooth(a, b, t) {
        var v = Math.min(1, Math.max(0, (t - a) / (b - a)));
        return v * v * (3 - 2 * v);
      }

      var last = performance.now();
      var raw = 0;
      var titled = false;
      var faded = false;
      var stopped = false;

      function frame(now) {
        var dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        uniforms.uTime.value += dt;
        raw = Math.min(1, raw + (dt * 1000 / DUR) * speed);
        uniforms.uRaw.value = raw;

        // the photograph develops in lockstep with the settling — same clock,
        // same frame — reaching full strength exactly as the last squares seat
        var dev = smooth(0.50, 0.97, raw);
        heroImg.style.opacity = dev.toFixed(3);
        if (scrim) scrim.style.opacity = dev.toFixed(3);

        renderer.render(scene, camera);

        if (raw >= 0.8 && !titled) {
          titled = true;
          cover.classList.add('h3-resolved');
        }
        if (raw >= 1 && !faded) {
          faded = true;
          heroImg.style.opacity = '1';
          if (scrim) scrim.style.opacity = '1';
          var ease = getComputedStyle(document.documentElement).getPropertyValue('--ease').trim() || 'ease';
          canvas.style.transition = 'opacity 450ms ' + ease;
          canvas.style.opacity = '0';
          setTimeout(function () {
            stopped = true;
            geo.dispose(); mat.dispose(); renderer.dispose();
            canvas.style.display = 'none';
          }, 520);
        }
        if (!stopped) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      var resizeT;
      window.addEventListener('resize', function () {
        if (stopped) return;
        clearTimeout(resizeT);
        resizeT = setTimeout(function () {
          camera.aspect = media.clientWidth / media.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(media.clientWidth, media.clientHeight, false);
          fit();
        }, 120);
      });
    };

    if (heroImg.complete && heroImg.naturalWidth) start();
    else heroImg.onload = start;
    heroImg.onerror = standDown;
  }).catch(standDown);
})();
