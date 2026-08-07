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
