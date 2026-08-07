// Vikramshila Developers — THE LIGHTS COME HOME.
//
// A true 3D arrival. The camera starts deep inside a dark corridor of
// drifting window-lights — every light is a real pixel of the photograph,
// scattered through forty units of DEPTH — and flies forward. Nearby
// lights sweep past HUGE and fast; distant ones hang small and slow
// (real motion parallax, real size attenuation, real fog). As the camera
// passes each light it glides into its own window of the building, so the
// photograph assembles ahead of you, wave by wave, and the camera glides
// to rest exactly as the last dark pixels materialize and the image is
// simply there. The lateral sway of the camera against the depth layers
// is what makes the dimensionality unmistakable frame over frame.
//
// Every depth cue is present this time: size-by-distance, motion
// parallax, fog attenuation, near-light overexposure, and convergence.
// (The previous engine kept all particles at z=0 — genuinely flat, and
// the client called it correctly.)
//
// Scroll accelerates, never hijacks. Reduced-motion / no WebGL / tainted
// canvas: the photograph appears immediately.
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

  var DUR = 3000;         // the flight
  var SPAN = 0.30;        // one light's own glide into its window
  var CORRIDOR = 42;      // how deep the light-field is, in world units
  var speed = 1;
  var lastGesture = 0;

  var onGesture = function () {
    var now = performance.now();
    if (now - lastGesture < 250) return;
    lastGesture = now;
    speed = speed < 5 ? 5 : 30;
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
      var aScatter = new Float32Array(count * 3);
      var aPhoto = new Float32Array(count * 3);
      var aSeed = new Float32Array(count);
      var aDelay = new Float32Array(count);
      var aLight = new Float32Array(count);

      var i = 0;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var i3 = i * 3;
          var sx = (x / (cols - 1) - 0.5) * planeW;
          var sy = (0.5 - y / (rows - 1)) * planeH;
          aSlot[i3] = sx; aSlot[i3 + 1] = sy; aSlot[i3 + 2] = 0;

          var di = (y * cols + x) * 4;
          var r = data[di] / 255, g = data[di + 1] / 255, b = data[di + 2] / 255;
          aPhoto[i3] = r; aPhoto[i3 + 1] = g; aPhoto[i3 + 2] = b;

          var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          var seed = Math.random();
          aSeed[i] = seed;

          // the photograph's own light decides who flies: bright pixels
          // (windows, lamps, sky glow) become the streaming lights
          var isLight = lum > 0.5 && Math.random() < 0.22;
          aLight[i] = isLight ? 1 : 0;

          if (isLight) {
            // scattered through the corridor's DEPTH; XY loosely prefigures
            // the image (each light hovers outward of its own window)
            var z = 6 + CORRIDOR * Math.pow(Math.random(), 0.85);
            var spread = 1.15 + Math.random() * 1.25;
            aScatter[i3] = sx * spread + (Math.random() - 0.5) * 3.2;
            aScatter[i3 + 1] = sy * spread + (Math.random() - 0.5) * 2.6;
            aScatter[i3 + 2] = z;
            // deeper lights (near the plane) seat first: the wall assembles
            // ahead of the camera, wave by wave
            aDelay[i] = (1 - SPAN) * (0.62 * (z - 6) / CORRIDOR + 0.10 + 0.14 * Math.random());
          } else {
            // the dark body of the image materializes at its seat, late
            aScatter[i3] = sx + (Math.random() - 0.5) * 0.8;
            aScatter[i3 + 1] = sy + (Math.random() - 0.5) * 0.8;
            aScatter[i3 + 2] = 1.5 + Math.random() * 2.5;
            // coherent patches (not random dither): neighbouring pixels
            // surface together, so the image assembles in visible waves
            var pn = 0.5 + 0.45 * Math.sin((x / cols) * 5.1 + 1.7) * Math.sin((y / rows) * 4.3 + 0.6)
                   + 0.10 * Math.sin((x / cols) * 11.7 + (y / rows) * 9.1);
            pn = Math.min(1, Math.max(0, pn));
            aDelay[i] = (1 - SPAN) * (0.62 + 0.34 * (0.55 * pn + 0.25 * (1 - lum) + 0.20 * Math.random()));
          }
          i++;
        }
      }

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, media.clientWidth / media.clientHeight, 0.1, 200);
      camera.position.set(0, 0, 13 + CORRIDOR);

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(media.clientWidth, media.clientHeight, false);

      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(aSlot, 3));
      geo.setAttribute('aSlot', new THREE.BufferAttribute(aSlot, 3));
      geo.setAttribute('aScatter', new THREE.BufferAttribute(aScatter, 3));
      geo.setAttribute('aPhoto', new THREE.BufferAttribute(aPhoto, 3));
      geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
      geo.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1));
      geo.setAttribute('aLight', new THREE.BufferAttribute(aLight, 1));

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
          'attribute vec3 aScatter;',
          'attribute vec3 aPhoto;',
          'attribute float aSeed;',
          'attribute float aDelay;',
          'attribute float aLight;',
          'uniform float uTime, uRaw, uSpan, uScale, uPitchWorld, uHeightPx, uTanHalf;',
          'varying vec3 vColor;',
          'varying float vAlpha;',
          'varying float vShape;',   // 0 = glowing round light, 1 = square pixel
          'float easeInOut(float t){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) * 0.5; }',
          'void main(){',
          '  float lp = clamp((uRaw - aDelay) / uSpan, 0.0, 1.0);',
          '  float e = easeInOut(lp);',
          // idle drift while afloat — lights breathe in place
          '  vec3 sc = aScatter;',
          '  sc.x += sin(uTime * 0.5 + aSeed * 21.0) * 0.35 * (1.0 - e);',
          '  sc.y += cos(uTime * 0.4 + aSeed * 33.0) * 0.30 * (1.0 - e);',
          // glide from the corridor into its own window on the plane
          '  vec3 p = vec3(mix(sc.xy, aSlot.xy, e) * uScale, mix(sc.z, 0.0, e));',
          '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
          '  gl_Position = projectionMatrix * mv;',
          '  float dist = -mv.z;',
          // real size-by-distance: near lights render huge, far ones tiny —
          // the tan(fov/2)-corrected pitch keeps the seated grid exact
          '  float sizeWorld = mix(uPitchWorld * uScale * (2.2 + aSeed * 2.0), uPitchWorld * uScale * 1.12, e);',
          '  float px = sizeWorld * (uHeightPx * 0.5) / (uTanHalf * max(dist, 0.6));',
          '  gl_PointSize = min(px, 150.0);',
          // fog: distance eats light; the near field glows hot
          '  float fog = clamp(1.0 - (dist - 4.0) / 52.0, 0.12, 1.0);',
          '  float hot = 1.0 + 0.5 * clamp(1.0 - dist / 9.0, 0.0, 1.0);',
          '  vec3 lightC = (aPhoto * 1.18 + vec3(0.10, 0.06, 0.02)) * hot;',
          '  vColor = mix(aPhoto, lightC * fog, (1.0 - e) * aLight);',
          // darks surface only as they seat; lights are visible all along,
          // but never when they sit behind the camera
          '  float birthDark = smoothstep(0.22, 0.6, lp);',
          '  float vis = mix(birthDark, 0.9 + 0.1 * sin(uTime * (1.2 + aSeed * 2.0) + aSeed * 40.0), aLight);',
          // seated squares evaporate one by one at the very end, while the
          // sharp image focuses underneath — nothing pops in any single frame
          '  vis *= 1.0 - smoothstep(0.86 + aSeed * 0.10, 0.96 + aSeed * 0.04, uRaw);',
          '  vis *= step(mv.z, -0.6);',
          '  vAlpha = vis;',
          '  vShape = mix(1.0, e, aLight);',
          '}',
        ].join('\n'),
        fragmentShader: [
          'varying vec3 vColor;',
          'varying float vAlpha;',
          'varying float vShape;',
          'void main(){',
          '  vec2 q = gl_PointCoord - 0.5;',
          '  float d = length(q);',
          '  float glow = smoothstep(0.5, 0.08, d);',            // soft light with halo
          '  float m = max(abs(q.x), abs(q.y));',
          '  float square = 1.0 - smoothstep(0.44, 0.5, m);',
          '  float a = mix(glow, square, vShape) * vAlpha;',
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
        var visH = 2 * halfTan * 13;
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
      function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

      var last = performance.now();
      var raw = 0;
      var devRaw = 0;   // rate-capped shadow of raw for the develop channel
      var titled = false;
      var faded = false;
      var stopped = false;

      function frame(now) {
        var dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        uniforms.uTime.value += dt;
        raw = Math.min(1, raw + (dt * 1000 / DUR) * speed);
        uniforms.uRaw.value = raw;

        // THE DOLLY: the camera rides the corridor and settles at the plane's
        // framing distance; its lateral sway against the depth layers is the
        // parallax that reads as space
        var travel = easeInOutCubic(Math.min(1, raw / 0.94));
        var decay = Math.pow(1 - travel, 1.15);
        camera.position.z = 13 + CORRIDOR * (1 - travel);
        camera.position.x = Math.sin(raw * Math.PI * 1.6) * 1.5 * decay;
        camera.position.y = Math.cos(raw * Math.PI * 1.1) * 0.6 * decay;
        camera.lookAt(0, 0, 0);

        // the sharp photograph develops beneath the seating pixels: it fades
        // in BLURRED and pulls into focus, on a rate-capped clock, so the
        // transition from mosaic to image is a continuous focus pull — never
        // a single-frame pop, even when a gesture fast-forwards the flight
        devRaw = Math.min(raw, devRaw + dt * 0.9);
        var dev = smooth(0.62, 0.92, devRaw);
        var focus = smooth(0.72, 0.995, devRaw);
        heroImg.style.opacity = dev.toFixed(3);
        heroImg.style.filter = 'blur(' + ((1 - focus) * 16).toFixed(1) + 'px)';
        if (scrim) scrim.style.opacity = dev.toFixed(3);

        renderer.render(scene, camera);

        if (devRaw >= 0.86 && !titled) {
          titled = true;
          cover.classList.add('h3-resolved');
        }
        if (raw >= 1 && devRaw >= 0.998 && !faded) {
          faded = true;
          heroImg.style.opacity = '1';
          heroImg.style.filter = 'none';
          if (scrim) scrim.style.opacity = '1';
          var ease = getComputedStyle(document.documentElement).getPropertyValue('--ease').trim() || 'ease';
          canvas.style.transition = 'opacity 500ms ' + ease;
          canvas.style.opacity = '0';
          setTimeout(function () {
            stopped = true;
            geo.dispose(); mat.dispose(); renderer.dispose();
            canvas.style.display = 'none';
          }, 560);
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
