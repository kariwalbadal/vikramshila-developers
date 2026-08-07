// Vikramshila Developers — site-wide motion system.
// Lenis inertia scroll + GSAP ScrollTrigger scrubbed chapters, with plain
// fallbacks everywhere: no library, no motion — the content still stands.
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- load choreography: covers and article heads rise ---------- */
  var loadTargets = document.querySelectorAll('[data-hero], .art-head, [data-proj-hero]');
  if (loadTargets.length) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        loadTargets.forEach(function (el) { el.classList.add('is-loaded'); });
      });
    });
  }

  /* ---------- inertia scroll (the feel of the whole site) ---------- */
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.18, wheelMultiplier: 1.0 });
    var lraf = function (time) { lenis.raf(time); requestAnimationFrame(lraf); };
    requestAnimationFrame(lraf);
  }

  /* ---------- scrubbed chapter parallax ---------- */
  if (!reduceMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);

    document.querySelectorAll('[data-chapter] .chapter-media img').forEach(function (img) {
      gsap.fromTo(img,
        { yPercent: -6, scale: 1.16 },
        { yPercent: 6, scale: 1.08, ease: 'none',
          scrollTrigger: { trigger: img.closest('[data-chapter]'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    document.querySelectorAll('[data-chapter] .chapter-copy').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el.closest('[data-chapter]'), start: 'top 55%' } });
    });
    /* THE RIVER, as the reference actually moves: a 3D ring. Items orbit
       continuously left-to-right; at the edges they swing NEAR the camera
       (large, blurred, fast) and through the centre they sit back (sharp,
       calm). Scroll adds current; resting the cursor on a card holds it. */
    var river = document.querySelector('[data-river]');
    var riverTrack = document.querySelector('[data-river-track]');
    if (river && riverTrack && window.innerWidth > 900) {
      var items = Array.prototype.slice.call(riverTrack.querySelectorAll('[data-river-item]'));
      var N = items.length;
      var TAU = Math.PI * 2;
      var base = 0;
      var speed = 0.26;            // slots/s — one card every ~4s
      var boost = 0;
      var hold = 1;
      river.addEventListener('mouseenter', function () { hold = 0.18; });
      river.addEventListener('mouseleave', function () { hold = 1; });
      // DECOUPLED from page scroll by design: the stream flows on its own
      // clock, and the only outside hand on it is a direct drag
      var dragging = false, dragX = 0, dragVel = 0, moved = 0;
      river.addEventListener('pointerdown', function (e) {
        dragging = true; dragX = e.clientX; dragVel = 0; moved = 0;
      });
      window.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - dragX;
        dragX = e.clientX;
        moved += Math.abs(dx);
        var d = dx / (window.innerWidth * 0.17);
        base += d;
        dragVel = d * 60;
      });
      window.addEventListener('pointerup', function () {
        if (!dragging) return;
        dragging = false;
        boost = Math.max(-1.4, Math.min(1.4, dragVel * 0.4));
      });
      // a drag must not fire the card link it started on
      river.addEventListener('click', function (e) {
        if (moved > 8) { e.preventDefault(); e.stopPropagation(); }
      }, true);
      var lastT = performance.now();
      var PERSP = 1150;                 // must match .river-track CSS perspective
      var tick = function () {
        var now = performance.now();
        var dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        var rr = river.getBoundingClientRect();
        if (rr.bottom < 0 || rr.top > window.innerHeight) { requestAnimationFrame(tick); return; }
        base += (speed * (dragging ? 0 : hold)) * dt + (dragging ? 0 : boost * dt);
        boost *= (1 - Math.min(1, dt * 2.0));
        var vw = window.innerWidth;
        var slotPx = vw * 0.17;
        for (var i = 0; i < N; i++) {
          // slot-space conveyor with wraparound: o = 0 is stage centre
          var o = (base + i) % N;
          if (o < 0) o += N;
          if (o > N / 2) o -= N;
          var el = items[i];
          if (Math.abs(o) > 3.4) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; continue; }
          var x = o * slotPx;
          var z = Math.min(520, o * o * 92);          // parabolic bulge: edges swing near
          var y = Math.sin(i * 2.3) * 24 + Math.sin(now / 1600 + i) * 8;
          var rotY = Math.max(-18, Math.min(18, -o * 6.5));
          var blur = (z / 520) * 8.5;
          // screen-space x after the perspective divide — used only for culling
          var sx = x * PERSP / (PERSP - z);
          var fade = Math.abs(sx) > vw * 0.92 ? Math.max(0, 1 - (Math.abs(sx) - vw * 0.92) / (vw * 0.25)) : 1;
          el.style.transform = 'translate(-50%, -50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + rotY.toFixed(2) + 'deg)';
          el.style.filter = blur > 0.4 ? 'blur(' + blur.toFixed(1) + 'px)' : 'none';
          el.style.opacity = fade.toFixed(2);
          el.style.zIndex = String(1000 + Math.round(z));
          el.style.pointerEvents = (fade > 0.5 && z < 200) ? 'auto' : 'none';
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    /* THE ZOOMER: scroll flies INTO each facade — blur-through — and
       arrives at the next ground, already sharpening. */
    var zoomer = document.querySelector('[data-zoomer]');
    if (zoomer && window.innerWidth > 900) {
      var scenes = Array.prototype.slice.call(zoomer.querySelectorAll('[data-zoom-scene]'));
      var prog = zoomer.querySelector('[data-zoom-progress]');
      var SEG = 120; // vh of scroll per building
      var ztl = gsap.timeline({
        scrollTrigger: {
          trigger: zoomer, pin: '[data-zoomer-stage]', scrub: true,
          start: 'top top',
          end: '+=' + (scenes.length * SEG) + '%',
          onUpdate: function (self) {
            if (!prog) return;
            var n = Math.min(scenes.length, 1 + Math.floor(self.progress * scenes.length));
            prog.textContent = String(n).padStart(2, '0') + ' / ' + String(scenes.length).padStart(2, '0');
          },
        },
      });
      scenes.forEach(function (scene, i) {
        var media = scene.querySelector('.zs-media');
        var copy = scene.querySelector('.zs-copy');
        var t0 = i;             // each scene owns one unit of the timeline
        if (i > 0) {
          // arrive: sharpen out of the blur-through
          ztl.fromTo(media, { scale: 1.18, filter: 'blur(10px)' },
            { scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }, t0);
          ztl.fromTo(copy, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out' }, t0 + 0.08);
        }
        if (i < scenes.length - 1) {
          // depart: fly INTO the building — scale toward the entry point,
          // blur through, and hand off to the scene beneath
          ztl.to(media, { scale: 5.2, filter: 'blur(14px)', duration: 0.42, ease: 'power2.in' }, t0 + 0.58);
          ztl.to(copy, { autoAlpha: 0, y: -24, duration: 0.18, ease: 'power1.in' }, t0 + 0.58);
          ztl.to(scene, { autoAlpha: 0, duration: 0.14, ease: 'none' }, t0 + 0.86);
        }
      });
    }

    // gentle drift on any flagged plate (project pages)
    document.querySelectorAll('[data-parallax] img').forEach(function (img) {
      gsap.fromTo(img,
        { yPercent: -4, scale: 1.12 },
        { yPercent: 4, scale: 1.06, ease: 'none',
          scrollTrigger: { trigger: img.closest('[data-parallax]'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  } else {
    // no GSAP/motion: chapter copy must simply be visible
    document.querySelectorAll('.chapter-copy').forEach(function (el) { el.style.opacity = '1'; });
  }

  /* ---------- chrome state ---------- */
  var chrome = document.querySelector('[data-chrome]');
  if (chrome) {
    var isHome = document.body.classList.contains('is-home');
    if (!isHome) chrome.classList.add('on-light');
    var onScrollChrome = function () {
      var y = window.scrollY;
      chrome.classList.toggle('is-solid', isHome ? y > window.innerHeight * 0.82 : y > 24);
    };
    onScrollChrome();
    window.addEventListener('scroll', onScrollChrome, { passive: true });
  }

  /* ---------- scroll progress hairline ---------- */
  var progress = document.querySelector('.scroll-progress');
  if (progress) {
    var onScrollProgress = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      progress.style.width = pct + '%';
    };
    onScrollProgress();
    window.addEventListener('scroll', onScrollProgress, { passive: true });
    window.addEventListener('resize', onScrollProgress);
  }

  /* ---------- enquiry forms: build a real mailto body in JS ---------- */
  document.querySelectorAll('.enquiry-form').forEach(function (form) {
    var email = (form.getAttribute('action') || '').replace(/^mailto:/, '') || 'indiavdpl@gmail.com';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var project = (data.get('project') || '').trim();
      var lines = [];
      if (data.get('name')) lines.push('Name: ' + data.get('name'));
      if (data.get('phone')) lines.push('Phone: ' + data.get('phone'));
      if (project) lines.push('Interested in: ' + project);
      if (data.get('message')) lines.push('Message: ' + data.get('message'));
      var subject = 'Website enquiry' + (project ? ' — ' + project : '');
      var mailto = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = mailto;
    });
  });

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { if (lenis) lenis.stop(); document.body.style.overflow = 'hidden'; }
      else { if (lenis) lenis.start(); document.body.style.overflow = ''; }
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        if (lenis) lenis.start();
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) toggle.click();
    });
  }

  /* ---------- IntersectionObserver reveals ---------- */
  var revealables = document.querySelectorAll('.reveal, .mask');
  if (revealables.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16, rootMargin: '600% 0px -8% 0px' } // top margin: an element scrolled PAST must count as seen — fast scrolling teleports over short elements between IO frames
      );
      revealables.forEach(function (el) { io.observe(el); });
    } else {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ---------- the index preview: a plate that follows the cursor ---------- */
  var indexSections = document.querySelectorAll('[data-index]');
  var canHover = window.matchMedia('(hover: hover)').matches;
  if (indexSections.length && canHover && !reduceMotion) {
    var preview = document.createElement('div');
    preview.className = 'index-preview';
    preview.setAttribute('aria-hidden', 'true');
    var srcs = [];
    indexSections.forEach(function (sec) {
      sec.querySelectorAll('.index-row[data-preview]').forEach(function (row) {
        var src = row.getAttribute('data-preview');
        if (srcs.indexOf(src) === -1) srcs.push(src);
      });
    });
    if (srcs.length) {
      var imgs = {};
      srcs.forEach(function (src) {
        var img = document.createElement('img');
        img.alt = '';
        img.setAttribute('data-src', src);
        preview.appendChild(img);
        imgs[src] = img;
      });
      document.body.appendChild(preview);
      var loaded = false;
      var px = 0, py = 0, raf = null;
      var place = function () {
        raf = null;
        var w = preview.offsetWidth || 300;
        var h = preview.offsetHeight || 225;
        var x = Math.min(Math.max(px + 28, 8), window.innerWidth - w - 8);
        var y = Math.min(Math.max(py - h / 2, 8), window.innerHeight - h - 8);
        preview.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        preview.style.left = '0';
        preview.style.top = '0';
      };
      indexSections.forEach(function (sec) {
        sec.querySelectorAll('.index-row[data-preview]').forEach(function (row) {
          row.addEventListener('mouseenter', function () {
            if (!loaded) {
              preview.querySelectorAll('img').forEach(function (img) { img.src = img.getAttribute('data-src'); });
              loaded = true;
            }
            var src = row.getAttribute('data-preview');
            preview.querySelectorAll('img').forEach(function (img) { img.classList.remove('is-current'); });
            if (imgs[src]) imgs[src].classList.add('is-current');
            preview.classList.add('is-on');
          });
          row.addEventListener('mouseleave', function () {
            preview.classList.remove('is-on');
          });
        });
        sec.addEventListener('mousemove', function (e) {
          px = e.clientX; py = e.clientY;
          if (raf === null) raf = requestAnimationFrame(place);
        });
      });
    }
  }

  /* ---------- EMBER VARIANT: recurring ember backdrop on connective sections ---------- */
  var vEmber = document.body.classList.contains('v-ember');
  {
    var assetBase = document.body.getAttribute('data-base') || '';
    var emberTargets = [];
    if (vEmber) document.querySelectorAll('.chapter-paper, section[data-index]').forEach(function (s) { emberTargets.push(s); });
    else document.querySelectorAll('section.index-ember').forEach(function (s) { emberTargets.push(s); });
    var artCols = vEmber ? document.querySelector('.art-cols') : null;
    if (artCols && artCols.closest('section')) emberTargets.push(artCols.closest('section'));
    if (vEmber) document.querySelectorAll('.proj-close').forEach(function (s) { emberTargets.push(s); });
    if (vEmber) document.querySelectorAll('.numrow, .contact-table').forEach(function (el) {
      var sec = el.closest('section');
      if (sec && !sec.closest('.chapter-dusk') && !el.closest('.chapter-dusk') && emberTargets.indexOf(sec) === -1 && !sec.querySelector('.enquiry-form')) emberTargets.push(sec);
    });
    emberTargets.forEach(function (sec) {
      if (!sec || sec.classList.contains('ember-host')) return;
      sec.classList.add('ember-host');
      var bg = document.createElement('div');
      bg.className = 'ember-bg';
      bg.setAttribute('aria-hidden', 'true');
      bg.innerHTML = '<img src="' + assetBase + '/images/generated/ember-field.jpg" alt="">' +
        '<video muted loop playsinline preload="none" poster="' + assetBase + '/images/generated/ember-field.jpg" data-ambient-src="' + assetBase + '/videos/ember-field.mp4"></video>';
      sec.prepend(bg);
    });
    if (vEmber) {
      var tag = document.createElement('div');
      tag.className = 'variant-tag';
      tag.textContent = 'Ember variant — preview';
      document.body.appendChild(tag);
    }
  }

  /* ---------- ambient videos: load lazily, play only while visible ---------- */
  var ambients = document.querySelectorAll('video[data-ambient-src]');
  if (ambients.length && !reduceMotion && 'IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (!v.src) { v.src = v.getAttribute('data-ambient-src'); }
          v.play().then(function () { v.classList.add('is-playing'); }).catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    ambients.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- count-up numerals (Indian digit grouping: 1,00,000) ---------- */
  var countEls = document.querySelectorAll('[data-countup]');
  if (countEls.length) {
    var fmt = function (n) { return n.toLocaleString('en-IN'); };
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute('data-countup'));
      if (isNaN(target)) return;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.textContent = fmt(target) + suffix; return; }
      var start = performance.now();
      var dur = 1600;
      var step = function (now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(Math.round(target * eased)) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      countEls.forEach(function (el) { cio.observe(el); });
    } else {
      countEls.forEach(animateCount);
    }
  }
})();
