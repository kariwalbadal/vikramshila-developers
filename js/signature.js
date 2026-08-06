// Vikramshila Developers — THE SIGNATURE: "monument rise."
// Thousands of light-particles, sampled from the real hero photograph,
// converge out of a scattered cloud into the monument as the visitor lands.
// Graceful degradation: no canvas, no three.js fetch at all, if WebGL is
// absent or the visitor asked for reduced motion — the static <img> hero
// (already in the DOM) and CSS mask headline reveal carry the moment alone.
(function () {
  'use strict';

  var hero = document.querySelector('[data-signature-hero]');
  if (!hero) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = hero.querySelector('#signature-canvas');
  var heroImg = hero.querySelector('.hero-media img');

  function supportsWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  if (reduceMotion || !canvas || !heroImg || !supportsWebGL()) {
    document.documentElement.classList.remove('sig-pending');
    if (canvas) canvas.remove();
    return; // static photo + CSS mask headline is the whole experience
  }

  // cubic-bezier(0.19,1,0.22,1) evaluated numerically (WebKit UnitBezier method)
  function makeBezier(x1, y1, x2, y2) {
    function a(a1, a2) { return 1 - 3 * a2 + 3 * a1; }
    function b(a1, a2) { return 3 * a2 - 6 * a1; }
    function c(a1) { return 3 * a1; }
    function bezX(t) { return ((a(x1, x2) * t + b(x1, x2)) * t + c(x1)) * t; }
    function bezY(t) { return ((a(y1, y2) * t + b(y1, y2)) * t + c(y1)) * t; }
    function dX(t) { return 3 * a(x1, x2) * t * t + 2 * b(x1, x2) * t + c(x1); }
    return function (x) {
      var t = x;
      for (var i = 0; i < 6; i++) {
        var dx = bezX(t) - x;
        if (Math.abs(dx) < 1e-4) break;
        var d = dX(t);
        if (Math.abs(d) < 1e-6) break;
        t -= dx / d;
      }
      return bezY(Math.max(0, Math.min(1, t)));
    };
  }
  var uiEase = makeBezier(0.19, 1, 0.22, 1); // the brand's snap-curve — right for 200-900ms UI transitions

  // ...but wrong for THIS: (0.19,1,0.22,1) reaches ~95% of its travel by
  // 25% of elapsed time, so a 2.6s timeline driven by it visually finishes
  // in the first ~650ms and then sits idle — measured directly (see commit
  // notes), not assumed. A cinematic multi-second unfold needs progress
  // spread across the whole duration: gentle in, gentle out, most of the
  // motion happening in the middle third where the eye is watching.
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  var skipped = false;
  var onSkip = function () {
    if (window.scrollY > 8) skipped = true;
  };
  window.addEventListener('scroll', onSkip, { passive: true });
  window.addEventListener('touchmove', onSkip, { passive: true });
  window.addEventListener('wheel', onSkip, { passive: true });

  import('/vendor/three.module.js').then(function (THREE) {
    var tier = window.innerWidth < 700 ? 'mobile' : (window.innerWidth < 1100 ? 'tablet' : 'desktop');
    var cols = tier === 'mobile' ? 84 : tier === 'tablet' ? 116 : 150;

    var sampleImg = heroImg; // same-origin, already loading/loaded for display — reuse it, don't fetch twice

    var start = function () {
      var aspect = sampleImg.naturalWidth / sampleImg.naturalHeight || 16 / 9;
      var rows = Math.round(cols / aspect);
      var off = document.createElement('canvas');
      off.width = cols; off.height = rows;
      var octx = off.getContext('2d');
      octx.drawImage(sampleImg, 0, 0, cols, rows);
      var data;
      try {
        data = octx.getImageData(0, 0, cols, rows).data;
      } catch (e) { document.documentElement.classList.remove('sig-pending'); return; } // CORS-tainted canvas — bail silently to static hero

      var count = cols * rows;
      var positions = new Float32Array(count * 3);
      var targets = new Float32Array(count * 3);
      var colors = new Float32Array(count * 3);

      var planeW = 16, planeH = planeW / aspect;
      var i = 0;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var px = (x / (cols - 1) - 0.5) * planeW;
          var py = (0.5 - y / (rows - 1)) * planeH;
          var di = (y * cols + x) * 4;
          var r = data[di] / 255, g = data[di + 1] / 255, b = data[di + 2] / 255;

          targets[i * 3] = px;
          targets[i * 3 + 1] = py;
          targets[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

          var ang = Math.random() * Math.PI * 2;
          var rad = 9 + Math.random() * 16;
          positions[i * 3] = Math.cos(ang) * rad + px * 0.3;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 14 + py * 0.3;
          positions[i * 3 + 2] = -6 - Math.random() * 22;

          var boost = 1.18;
          colors[i * 3] = Math.min(1, r * boost);
          colors[i * 3 + 1] = Math.min(1, g * boost);
          colors[i * 3 + 2] = Math.min(1, b * boost);
          i++;
        }
      }
      var starts = positions.slice(); // immutable scatter origin — lets every frame compute an absolute lerp instead of drifting via accumulation

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, hero.clientWidth / hero.clientHeight, 0.1, 100);
      camera.position.z = 13;

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(hero.clientWidth, hero.clientHeight, false);

      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // soft round sprite so points read as light-motes, not squares
      var spriteC = document.createElement('canvas');
      spriteC.width = spriteC.height = 32;
      var sctx = spriteC.getContext('2d');
      var grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 32, 32);
      var sprite = new THREE.CanvasTexture(spriteC);

      var mat = new THREE.PointsMaterial({
        size: 0.1, // overwritten by fitPlane() below, which sizes points from the *actual* post-scale pitch
        map: sprite,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        opacity: 0.96,
        // NormalBlending, not Additive: additive stacked on top of an
        // already-bright sky blew every mote out to pure white, reading as
        // snow rather than as motes carrying the photo's own colour
        blending: THREE.NormalBlending,
      });
      var baseOpacity = mat.opacity;

      var points = new THREE.Points(geo, mat);
      scene.add(points);

      function fitPlane() {
        var vFov = (camera.fov * Math.PI) / 180;
        var visH = 2 * Math.tan(vFov / 2) * camera.position.z;
        var visW = visH * camera.aspect;
        var scale = Math.max(visW / planeW, visH / planeH) * 1.02;
        points.scale.setScalar(scale);
        // size the sprites from the pitch they actually end up at once
        // scaled — a fixed world-space size left them at ~2.8% frame
        // coverage (measured), far too sparse to ever read as a surface;
        // overlapping neighbours is what makes the swarm look like it's
        // forming the building rather than dusting it with dots
        var pitch = (planeW / (cols - 1)) * scale;
        mat.size = pitch * 1.65;
      }
      fitPlane();

      hero.classList.add('sig-active'); // masks the photo out to a point; grows back in sync with convergence (see CSS)
      document.documentElement.classList.remove('sig-pending'); // sig-active now owns visibility

      // the reveal circle has to grow past the frame's true FARTHEST CORNER
      // (from the off-center reveal point) to fully uncover it — computed
      // once, in px, so it finishes on the same frame the particles land
      // instead of racing ahead and leaving them stranded mid-flight
      var revealCx = hero.clientWidth * 0.5, revealCy = hero.clientHeight * 0.54;
      var maxReveal = Math.max(
        Math.hypot(revealCx, revealCy),
        Math.hypot(hero.clientWidth - revealCx, revealCy),
        Math.hypot(revealCx, hero.clientHeight - revealCy),
        Math.hypot(hero.clientWidth - revealCx, hero.clientHeight - revealCy)
      );

      var DUR = 2600;
      var t0 = performance.now();
      var posAttr = geo.getAttribute('position');
      var resolved = false;
      var fading = false;

      function frame(now) {
        var elapsed = now - t0;
        var raw = Math.min(1, elapsed / DUR);
        if (skipped) raw = 1;
        var e = ease(raw);

        // the photograph materializes from the same point the particles
        // converge on, growing at the identical rate — same `e` drives both,
        // so the mask edge and the particle swarm arrive together, frame for
        // frame, instead of the mask racing ahead of what's actually formed
        heroImg.style.setProperty('--reveal-r', (e * maxReveal).toFixed(1) + 'px');

        // the swarm dissolves INTO the photo as it lands, rather than
        // sitting on top of a finished image for a beat after — the last
        // 30% of the timeline fades the motes out as they reach their targets
        mat.opacity = baseOpacity * (1 - Math.max(0, (raw - 0.7) / 0.3));

        for (var p = 0; p < count; p++) {
          var ix = p * 3, iy = p * 3 + 1, iz = p * 3 + 2;
          positions[ix] = starts[ix] + (targets[ix] - starts[ix]) * e;
          positions[iy] = starts[iy] + (targets[iy] - starts[iy]) * e;
          positions[iz] = starts[iz] + (targets[iz] - starts[iz]) * e;
        }
        posAttr.needsUpdate = true;
        renderer.render(scene, camera);

        if (raw >= 1 && !resolved) {
          resolved = true;
          hero.classList.add('sig-resolved'); // mask lifted — the sharp photo now stands fully on its own
          setTimeout(function () {
            fading = true;
            canvas.style.transition = 'opacity 900ms ' + getComputedStyle(document.documentElement).getPropertyValue('--ease').trim();
            canvas.style.opacity = '0';
            setTimeout(function () {
              renderer.dispose();
              canvas.style.display = 'none';
            }, 950);
          }, skipped ? 60 : 260);
        }
        if (!fading) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      var resizeT;
      window.addEventListener('resize', function () {
        clearTimeout(resizeT);
        resizeT = setTimeout(function () {
          camera.aspect = hero.clientWidth / hero.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(hero.clientWidth, hero.clientHeight, false);
          fitPlane();
          revealCx = hero.clientWidth * 0.5; revealCy = hero.clientHeight * 0.54;
          maxReveal = Math.max(
            Math.hypot(revealCx, revealCy), Math.hypot(hero.clientWidth - revealCx, revealCy),
            Math.hypot(revealCx, hero.clientHeight - revealCy), Math.hypot(hero.clientWidth - revealCx, hero.clientHeight - revealCy)
          );
        }, 120);
      });
    };

    if (sampleImg.complete && sampleImg.naturalWidth) start();
    else sampleImg.onload = start;
    sampleImg.onerror = function () { document.documentElement.classList.remove('sig-pending'); if (canvas) canvas.remove(); };
  }).catch(function () {
    document.documentElement.classList.remove('sig-pending');
    if (canvas) canvas.remove();
  });
})();
