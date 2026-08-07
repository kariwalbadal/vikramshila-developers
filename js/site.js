// Vikramshila Developers — site-wide motion system. Vanilla JS, no deps.
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero load choreography: slow push-in + masked line rise ---------- */
  var heroTitle = document.querySelector('.hero-title');
  var heroSection = document.querySelector('[data-hero]');
  if (heroTitle || heroSection) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (heroTitle) heroTitle.classList.add('is-loaded');
        if (heroSection) heroSection.classList.add('is-loaded');
      });
    });
  }

  /* ---------- header scroll state ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScrollHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });
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

  /* ---------- parallax on media (disabled <=980px, see CSS) ---------- */
  var parallaxEls = document.querySelectorAll('.parallax');
  if (parallaxEls.length && !reduceMotion) {
    var raf = null;
    var updateParallax = function () {
      raf = null;
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var center = rect.top + rect.height / 2 - vh / 2;
        var shift = Math.max(-1, Math.min(1, center / vh)) * 34;
        el.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
      });
    };
    window.addEventListener('scroll', function () {
      if (raf === null) raf = requestAnimationFrame(updateParallax);
    }, { passive: true });
    updateParallax();
  }

  /* ---------- self-healing marquee (repeat until >=10 tiles) ---------- */
  document.querySelectorAll('[data-marquee]').forEach(function (track) {
    var items = Array.prototype.slice.call(track.children);
    if (!items.length) return;
    while (track.children.length < 10) {
      items.forEach(function (item) { track.appendChild(item.cloneNode(true)); });
    }
    // duplicate the whole set once more for a seamless -50% loop
    var current = Array.prototype.slice.call(track.children);
    current.forEach(function (item) { track.appendChild(item.cloneNode(true)); });
  });

  /* ---------- count-up numerals (real numbers only, driven by data-countup) ---------- */
  var countEls = document.querySelectorAll('[data-countup]');
  if (countEls.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute('data-countup'));
      if (isNaN(target)) return;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var start = performance.now();
      var dur = 1400;
      var step = function (now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
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

  /* ---------- cap concurrent playing videos at 5 ---------- */
  var videos = document.querySelectorAll('video[data-tile]');
  if (videos.length) {
    var playing = [];
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (playing.indexOf(v) === -1) {
            if (playing.length >= 5) {
              var oldest = playing.shift();
              oldest.pause();
            }
            playing.push(v);
            v.play().catch(function () {});
          }
        } else {
          v.pause();
          var i = playing.indexOf(v);
          if (i > -1) playing.splice(i, 1);
        }
      });
    }, { threshold: 0.4 });
    videos.forEach(function (v) { vio.observe(v); });
  }
})();
