// Vikramshila Developers — site-wide motion system. Vanilla JS, no deps.
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- cover / article load choreography ---------- */
  var loadTargets = document.querySelectorAll('[data-hero], .art-head, [data-proj-hero]');
  if (loadTargets.length) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        loadTargets.forEach(function (el) { el.classList.add('is-loaded'); });
      });
    });
  }

  /* ---------- compact bar slides in once the masthead scrolls away ---------- */
  var compact = document.querySelector('[data-compact]');
  var masthead = document.querySelector('header');
  if (compact && masthead) {
    var onScrollCompact = function () {
      compact.classList.toggle('is-shown', window.scrollY > masthead.offsetHeight - 10);
    };
    onScrollCompact();
    window.addEventListener('scroll', onScrollCompact, { passive: true });
    window.addEventListener('resize', onScrollCompact);
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

  /* ---------- enquiry forms: build a real mailto body in JS ----------
     A native <form action="mailto:..."> silently drops every field except
     subject/body/cc/bcc regardless of method/enctype — mail clients only
     read those four params. Build the message ourselves instead. */
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
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
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
        { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
      );
      revealables.forEach(function (el) { io.observe(el); });
    } else {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ---------- the index preview: a plate that follows the cursor ----------
     Desktop-only, pointer-events:none, position clamped to the viewport so
     it can never cause horizontal overflow. Hidden entirely on touch. */
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
              // fetch lazily, on first hover, so the page load never pays for it
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
