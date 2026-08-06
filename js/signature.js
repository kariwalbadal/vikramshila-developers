// Vikramshila Developers — THE SIGNATURE: "monument rise."
//
// The hero photograph is diced into a grid of square tiles. Each tile carries
// the colour of the pixel it came from, starts scattered in depth, and flies
// to its own slot in the grid — arriving on its own schedule, overshooting
// very slightly and settling back, the way a piece is pressed into a puzzle.
// When the last tile lands the mosaic IS the photograph, so the handoff to
// the real image is invisible: it just resolves from coarse to sharp.
//
// Deliberately NOT a mask/porthole reveal and NOT soft round motes — an
// earlier version did both and read as a pinhole zoom with drifting balls.
// Tiles, a grid, and a click. Nothing else.
//
// Graceful degradation: three.js is never even fetched when WebGL is absent
// or the visitor asked for reduced motion — the static <img> hero and the
// CSS headline reveal carry the moment alone.
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

  function standDown() {
    document.documentElement.classList.remove('sig-pending');
    hero.classList.remove('sig-active');
    if (canvas) canvas.remove();
  }

  if (reduceMotion || !canvas || !heroImg || !supportsWebGL()) {
    standDown();
    return;
  }

  // easeOutCubic for the overall timeline: gentle, spread across the whole
  // duration rather than front-loaded
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  // easeOutBack for each individual tile: carries it a hair past its slot
  // and settles it back — this tiny overshoot is what reads as a "click"
  var BACK = 1.15; // deliberately gentler than the textbook 1.70158
  function easeOutBack(t) {
    var c3 = BACK + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + BACK * Math.pow(t - 1, 2);
  }

  var skipped = false;
  var onSkip = function () { if (window.scrollY > 8) skipped = true; };
  window.addEventListener('scroll', onSkip, { passive: true });
  window.addEventListener('touchmove', onSkip, { passive: true });
  window.addEventListener('wheel', onSkip, { passive: true });

  // relative, not root-relative: resolves against this script's own URL so it
  // works under any deployment base path, not only at domain root
  import('../vendor/three.module.js').then(function (THREE) {
    var w = window.innerWidth;
    // Tile count is a legibility decision, not a perf one. An earlier build
    // used ~25,000 tiles and the eye simply integrated the whole field as
    // texture — it read as television static, not as pieces. A jigsaw piece
    // has to be big enough to see as an object, so this is deliberately
    // coarse: around a thousand tiles, each ~40px on screen.
    var cols = w < 700 ? 34 : w < 1100 ? 44 : 54;

    var sampleImg = heroImg; // same-origin and already loading for display — don't fetch twice

    var start = function () {
      var aspect = (sampleImg.naturalWidth / sampleImg.naturalHeight) || 16 / 9;
      var rows = Math.max(2, Math.round(cols / aspect));

      var off = document.createElement('canvas');
      off.width = cols; off.height = rows;
      var octx = off.getContext('2d');
      octx.drawImage(sampleImg, 0, 0, cols, rows);
      var data;
      try {
        data = octx.getImageData(0, 0, cols, rows).data;
      } catch (e) { standDown(); return; } // tainted canvas — fall back to the static hero

      var count = cols * rows;
      var positions = new Float32Array(count * 3);
      var starts = new Float32Array(count * 3);
      var targets = new Float32Array(count * 3);
      var colors = new Float32Array(count * 3);
      var baseColors = new Float32Array(count * 3);
      var delays = new Float32Array(count);

      var planeW = 16, planeH = planeW / aspect;
      var MAX_DELAY = 0.5;   // last tile begins its flight halfway through
      var SPAN = 0.5;        // and takes the remaining half to land

      var i = 0;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var px = (x / (cols - 1) - 0.5) * planeW;
          var py = (0.5 - y / (rows - 1)) * planeH;
          var di = (y * cols + x) * 4;

          var i3 = i * 3;
          targets[i3] = px;
          targets[i3 + 1] = py;
          targets[i3 + 2] = 0; // dead flat at rest: a true grid, so tiles abut

          // Origin sits NEAR its slot, only slightly behind the frame. The
          // previous version threw tiles 7–22 units out and 8–34 units back;
          // because three.js scales point size by 1/-z, a tile that far away
          // rendered at a third of its landed size, so the whole flight was
          // sub-pixel confetti with black between it. Keeping the throw short
          // and shallow means a tile stays tile-sized the entire way in, and
          // the motion reads as placing rather than exploding.
          var ang = Math.random() * Math.PI * 2;
          var rad = 1.1 + Math.random() * 2.4;
          starts[i3] = px + Math.cos(ang) * rad;
          starts[i3 + 1] = py + Math.sin(ang) * rad * 0.7;
          starts[i3 + 2] = -1.4 - Math.random() * 2.6;
          positions[i3] = starts[i3];
          positions[i3 + 1] = starts[i3 + 1];
          positions[i3 + 2] = starts[i3 + 2];

          // ground-up bias: the building assembles first and the sky closes
          // in behind it, so the sequence reads as a rise rather than a wipe
          var vf = 1 - y / (rows - 1); // 1 at the top of frame, 0 at the bottom
          // weighted toward random so the rise reads as organic settling
          // rather than a hard horizontal wipe line travelling up the frame
          delays[i] = MAX_DELAY * (0.42 * vf + 0.58 * Math.random());

          baseColors[i3] = data[di] / 255;
          baseColors[i3 + 1] = data[di + 1] / 255;
          baseColors[i3 + 2] = data[di + 2] / 255;
          colors[i3] = colors[i3 + 1] = colors[i3 + 2] = 0;
          i++;
        }
      }

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, hero.clientWidth / hero.clientHeight, 0.1, 100);
      camera.position.z = 13;

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(hero.clientWidth, hero.clientHeight, false);

      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));

      // no `map`: an untextured PointsMaterial draws hard-edged SQUARES, which
      // is the entire point — these are tiles, not motes
      var mat = new THREE.PointsMaterial({
        size: 0.1, // real value set by fitPlane() from the on-screen pitch
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        opacity: 1,
        blending: THREE.NormalBlending,
      });

      var points = new THREE.Points(geo, mat);
      scene.add(points);

      function fitPlane() {
        var vFov = (camera.fov * Math.PI) / 180;
        var halfTan = Math.tan(vFov / 2);
        var visH = 2 * halfTan * camera.position.z;
        var visW = visH * camera.aspect;
        var scale = Math.max(visW / planeW, visH / planeH) * 1.02;
        points.scale.setScalar(scale);

        // Size each tile to the exact grid pitch so at rest they abut edge to
        // edge and the grid closes into a continuous picture.
        //
        // The `/ halfTan` is not cosmetic. three.js attenuates point size as
        // `gl_PointSize = size * (height/2) / -mvPosition.z`, which drops the
        // `tan(fov/2)` term a real projection has — so a size expressed in
        // plain world units comes out ~1/tan(fov/2) too small (2.6x at fov 42).
        // Without this the tiles render at about half the pitch and the
        // "mosaic" is a halftone dot screen with black gaps between tiles.
        var worldPitch = (planeW / (cols - 1)) * scale;
        mat.size = (worldPitch / halfTan) * 1.06; // 1.06 = a hair of overlap, kills seams
      }
      fitPlane();

      hero.classList.add('sig-active');
      document.documentElement.classList.remove('sig-pending');

      // The picture has to be readable fast — two and a half seconds of
      // assembly is an eternity on a landing page.
      var DUR = 1700;
      var t0 = performance.now();
      var posAttr = geo.getAttribute('position');
      var colAttr = geo.getAttribute('color');
      var resolved = false;
      var stopped = false;

      function frame(now) {
        var raw = Math.min(1, (now - t0) / DUR);
        if (skipped) raw = 1;
        var globalE = easeOutCubic(raw);

        for (var p = 0; p < count; p++) {
          var p3 = p * 3;
          // each tile runs its own little clock inside the global one
          var lp = (raw - delays[p]) / SPAN;
          lp = lp < 0 ? 0 : lp > 1 ? 1 : lp;
          var e = lp >= 1 ? 1 : easeOutBack(lp);

          positions[p3] = starts[p3] + (targets[p3] - starts[p3]) * e;
          positions[p3 + 1] = starts[p3 + 1] + (targets[p3 + 1] - starts[p3 + 1]) * e;
          positions[p3 + 2] = starts[p3 + 2] + (targets[p3 + 2] - starts[p3 + 2]) * e;

          // A tile darkens only slightly in flight. At 0.28 the in-flight
          // field was near-black on a near-black page, which is what made it
          // read as dim static; starting at 0.62 keeps every piece legible as
          // a piece from the first frame.
          var lum = 0.62 + 0.38 * lp;
          colors[p3] = baseColors[p3] * lum;
          colors[p3 + 1] = baseColors[p3 + 1] * lum;
          colors[p3 + 2] = baseColors[p3 + 2] * lum;
        }
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;

        // globalE is unused for motion but keeps the camera settle available
        // for future use without another pass over the buffer
        void globalE;

        renderer.render(scene, camera);

        if (raw >= 1 && !resolved) {
          resolved = true;
          // the mosaic now matches the photograph, so bringing the real image
          // up underneath and dissolving the tiles off reads as one picture
          // sharpening — not as a swap
          hero.classList.add('sig-resolved');
          var ease = getComputedStyle(document.documentElement).getPropertyValue('--ease').trim();
          canvas.style.transition = 'opacity 700ms ' + ease;
          setTimeout(function () { canvas.style.opacity = '0'; }, skipped ? 0 : 200);
          setTimeout(function () {
            stopped = true;
            geo.dispose(); mat.dispose(); renderer.dispose();
            canvas.style.display = 'none';
          }, (skipped ? 0 : 200) + 780);
        }
        if (!stopped) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      var resizeT;
      window.addEventListener('resize', function () {
        if (stopped) return;
        clearTimeout(resizeT);
        resizeT = setTimeout(function () {
          camera.aspect = hero.clientWidth / hero.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(hero.clientWidth, hero.clientHeight, false);
          fitPlane();
        }, 120);
      });
    };

    if (sampleImg.complete && sampleImg.naturalWidth) start();
    else sampleImg.onload = start;
    sampleImg.onerror = standDown;
  }).catch(standDown);
})();
