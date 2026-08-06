// Project-page interactions: hero choreography, the unit explorer, the
// sticky vitals bar, and a lightbox for plans and renders.
// Vanilla, no dependencies, and every effect degrades to plain content.
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero: letters rise once the image is up ---------- */
  var heroEl = document.querySelector('[data-proj-hero]');
  if (heroEl) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { heroEl.classList.add('is-loaded'); });
    });
  }

  /* ---------- vitals bar pins once the hero is past ---------- */
  var vitals = document.querySelector('[data-vitals]');
  if (vitals && heroEl) {
    var onScrollVitals = function () {
      var past = heroEl.getBoundingClientRect().bottom <= 96;
      vitals.classList.toggle('is-pinned', past);
    };
    onScrollVitals();
    window.addEventListener('scroll', onScrollVitals, { passive: true });
  }

  /* ---------- unit explorer ---------- */
  document.querySelectorAll('[data-unit-explorer]').forEach(function (root) {
    var chips = Array.prototype.slice.call(root.querySelectorAll('.ue-chip'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.ue-panel'));
    if (!chips.length || !panels.length) return;

    function select(key) {
      chips.forEach(function (c) {
        var on = c.getAttribute('data-ue-key') === key;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      panels.forEach(function (pn) {
        pn.classList.toggle('is-active', pn.getAttribute('data-ue-panel') === key);
      });
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () { select(c.getAttribute('data-ue-key')); });
      // arrow keys walk the set, so this is usable without a mouse
      c.addEventListener('keydown', function (e) {
        var i = chips.indexOf(c);
        var next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1
                 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : -1;
        if (next < 0 || next >= chips.length) return;
        e.preventDefault();
        chips[next].focus();
        select(chips[next].getAttribute('data-ue-key'));
      });
    });

    select(chips[0].getAttribute('data-ue-key'));
  });

  /* ---------- lightbox for plans and renders ----------
     Floor plans are the most-studied asset on a property site; opening one
     in the browser's bare image viewer (white page, no caption, no way back)
     was the most default-browser moment on the old page. */
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (links.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.setAttribute('aria-hidden', 'true'); // a closed dialog stays out of the a11y tree
    lb.innerHTML =
      '<button class="lb-close" type="button" aria-label="Close viewer">&times;</button>' +
      '<button class="lb-nav lb-prev" type="button" aria-label="Previous image">&#8249;</button>' +
      '<button class="lb-nav lb-next" type="button" aria-label="Next image">&#8250;</button>' +
      '<figure class="lb-figure"><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var idx = 0;
    var lastFocus = null;

    function show(i) {
      idx = (i + links.length) % links.length;
      var a = links[idx];
      lbImg.src = a.getAttribute('href');
      lbImg.alt = a.getAttribute('data-caption') || '';
      lbCap.textContent = a.getAttribute('data-caption') || '';
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('is-open');
      lb.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    }
    function close() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Tab') { e.preventDefault(); } // keep focus inside the dialog
    });
  }

  /* ---------- gallery plates drift very slightly on scroll ---------- */
  if (!reduceMotion && window.innerWidth > 980) {
    var plates = Array.prototype.slice.call(document.querySelectorAll('.gal-plate img'));
    if (plates.length) {
      var raf = null;
      var tick = function () {
        raf = null;
        var vh = window.innerHeight;
        plates.forEach(function (img) {
          var r = img.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          var c = (r.top + r.height / 2 - vh / 2) / vh;
          img.style.transform = 'scale(1.08) translate3d(0,' + (c * -22).toFixed(1) + 'px,0)';
        });
      };
      window.addEventListener('scroll', function () {
        if (raf === null) raf = requestAnimationFrame(tick);
      }, { passive: true });
      tick();
    }
  }
})();
