/* ==========================================================================
   JL PROTEKSINDO — Company Profile
   Interaksi: navigasi, animasi, modal layanan, form kontak
   Vanilla JavaScript, tanpa library eksternal.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };

  // Kunci scroll body (dipakai bersama oleh menu dan modal)
  var scrollLocks = 0;
  function lockScroll() { scrollLocks++; body.classList.add('no-scroll'); }
  function unlockScroll() { scrollLocks = Math.max(0, scrollLocks - 1); if (!scrollLocks) body.classList.remove('no-scroll'); }

  // Focus trap sederhana untuk dialog
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    var items = $$(FOCUSABLE, container).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Toast ---------- */
  var toastEl = $('#toast');
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    $('span', toastEl).textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------- Preloader ---------- */
  var preloader = $('#preloader');
  var preloaderBar = preloader ? $('.preloader-bar span', preloader) : null;
  function hidePreloader() {
    if (!preloader || preloader.classList.contains('done')) return;
    preloader.classList.add('done');
    setTimeout(function () { if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 600);
  }
  if (preloaderBar) {
    preloaderBar.addEventListener('animationend', hidePreloader);
  }
  setTimeout(hidePreloader, reduceMotion ? 100 : 950);

  /* ---------- Tahun di footer ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header, progress, back-to-top, scroll spy ---------- */
  var header = $('#header');
  var progress = $('#scrollProgress');
  var toTop = $('#toTop');
  var ring = toTop ? $('.ring circle', toTop) : null;
  var RING_LEN = 2 * Math.PI * 21;
  var navLinks = $$('.nav-link');
  var spySections = navLinks
    .map(function (a) { var id = a.getAttribute('href'); return id && id.charAt(0) === '#' ? document.getElementById(id.slice(1)) : null; })
    .filter(Boolean);
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    var max = Math.max(1, root.scrollHeight - window.innerHeight);
    var ratio = clamp(y / max, 0, 1);

    if (header) header.classList.toggle('scrolled', y > 20);
    if (progress) progress.style.transform = 'scaleX(' + ratio + ')';
    if (toTop) toTop.classList.toggle('show', y > 600);
    if (ring) ring.style.strokeDashoffset = String(RING_LEN * (1 - ratio));

    // Scroll spy
    var mark = y + window.innerHeight * 0.35;
    var current = spySections[0];
    for (var i = 0; i < spySections.length; i++) {
      if (spySections[i].offsetTop <= mark) current = spySections[i];
    }
    if (y + window.innerHeight >= root.scrollHeight - 4) current = spySections[spySections.length - 1];
    if (current) {
      navLinks.forEach(function (a) {
        var active = a.getAttribute('href') === '#' + current.id;
        a.classList.toggle('active', active);
        if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Mobile navigation ---------- */
  var nav = $('#nav');
  var burger = $('#hamburger');
  var navBackdrop = $('#navBackdrop');
  var navOpen = false;

  function setNav(open) {
    if (!nav || !burger || open === navOpen) return;
    navOpen = open;
    nav.classList.toggle('open', open);
    if (navBackdrop) navBackdrop.classList.toggle('show', open);
    if (header) header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    if (open) lockScroll(); else unlockScroll();
  }
  if (burger) burger.addEventListener('click', function () { setNav(!navOpen); });
  if (navBackdrop) navBackdrop.addEventListener('click', function () { setNav(false); });
  if (nav) nav.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) setNav(false);
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 1060) setNav(false); });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Counter ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var from = parseInt(el.getAttribute('data-from'), 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    var dur = 1600, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (target - from) * eased));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); countObs.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObs.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* ---------- Typed text (hero) ---------- */
  var typedEl = $('#typed');
  if (typedEl) {
    var words = ['Surety Bond', 'Asuransi Kendaraan', 'Asuransi Cargo', 'Bank Garansi', 'Asuransi Property'];
    var wi = 0, ci = words[0].length, deleting = true;
    if (reduceMotion) {
      setInterval(function () { wi = (wi + 1) % words.length; typedEl.textContent = words[wi]; }, 2600);
    } else {
      var tick = function () {
        var word = words[wi];
        var delay;
        if (deleting) {
          ci--;
          typedEl.textContent = word.slice(0, ci);
          delay = 45;
          if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; delay = 300; }
        } else {
          ci++;
          typedEl.textContent = words[wi].slice(0, ci);
          delay = 85;
          if (ci >= words[wi].length) { deleting = true; delay = 2000; }
        }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 2400);
    }
  }

  /* ---------- Hero parallax (desktop) ---------- */
  var heroVisual = $('.hero-visual');
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (heroVisual && canHover && !reduceMotion) {
    var layers = $$('[data-parallax]', heroVisual);
    var heroSec = $('.hero');
    var px = 0, py = 0, rafP = null;
    heroSec.addEventListener('mousemove', function (e) {
      var r = heroSec.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!rafP) rafP = window.requestAnimationFrame(applyParallax);
    });
    heroSec.addEventListener('mouseleave', function () {
      px = 0; py = 0;
      if (!rafP) rafP = window.requestAnimationFrame(applyParallax);
    });
    var applyParallax = function () {
      layers.forEach(function (l) {
        var depth = parseFloat(l.getAttribute('data-parallax')) || 0;
        l.style.transform = 'translate3d(' + (px * depth).toFixed(2) + 'px,' + (py * depth).toFixed(2) + 'px,0)';
      });
      rafP = null;
    };
  }

  /* ---------- Copy to clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
      body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      body.removeChild(ta);
      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var text = btn.getAttribute('data-copy');
    copyText(text).then(function () {
      toast('Disalin: ' + text);
      btn.classList.add('copied');
      var use = $('use', btn);
      var prev = use ? use.getAttribute('href') : null;
      if (use) use.setAttribute('href', '#i-check');
      setTimeout(function () {
        btn.classList.remove('copied');
        if (use && prev) use.setAttribute('href', prev);
      }, 1600);
    }).catch(function () { toast('Gagal menyalin, silakan salin manual.'); });
  });

  /* ---------- Prefill layanan di form kontak ---------- */
  var serviceSelect = $('#fService');
  function prefillService(name) {
    if (!serviceSelect || !name) return;
    var opt = $$('option', serviceSelect).filter(function (o) { return o.value === name || o.textContent === name; })[0];
    if (opt) {
      serviceSelect.value = opt.value || opt.textContent;
      serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-prefill]');
    if (a) prefillService(a.getAttribute('data-prefill'));
  });

  /* ---------- Modal detail layanan ---------- */
  var SERVICES = [
    {
      title: 'Surety Bond',
      icon: '#i-shield',
      option: 'Surety Bond',
      desc: 'Produk asuransi penjamin (bukan asuransi kerugian biasa) yang memberikan jaminan kepada pemilik proyek (obligee) bahwa kontraktor atau vendor (principal) akan menyelesaikan kewajibannya sesuai kontrak. Jika principal gagal, perusahaan penjamin (surety) akan menanggung kerugian atau menyelesaikan proyek tersebut.',
      points: ['Untuk proyek Konstruksi & Non Konstruksi', 'Jaminan kepada Pemilik Proyek (Obligee)', 'Menjamin kewajiban Pelaksana (Principal)', 'Sesuai kesepakatan dalam kontrak']
    },
    {
      title: 'Asuransi Kendaraan Bermotor',
      icon: '#i-car',
      option: 'Asuransi Kendaraan Bermotor',
      desc: 'Produk asuransi perlindungan finansial untuk kendaraan bermotor (sepeda motor dan mobil) dari risiko kerusakan dan kehilangan. Terdapat beberapa jenis perlindungan yang dapat disesuaikan dengan kebutuhan Anda.',
      points: ['Sepeda motor & mobil', 'Perlindungan risiko kerusakan', 'Perlindungan risiko kehilangan', 'Beragam jenis sesuai kebutuhan']
    },
    {
      title: 'Asuransi Cargo / Pengangkutan',
      icon: '#i-ship',
      option: 'Asuransi Cargo / Pengangkutan',
      desc: 'Produk asuransi yang memberikan proteksi finansial terhadap risiko kerusakan, kehilangan, atau pencurian barang selama dalam proses pengiriman dari satu lokasi ke lokasi tujuan. Perlindungan ini berlaku untuk pengiriman melalui jalur darat, laut, maupun udara.',
      points: ['Pengiriman jalur darat', 'Pengiriman jalur laut', 'Pengiriman jalur udara', 'Risiko rusak, hilang & pencurian']
    },
    {
      title: 'Bank Garansi',
      icon: '#i-bank',
      option: 'Bank Garansi',
      desc: 'Jaminan tertulis dari bank yang menyatakan kesanggupan untuk membayar sejumlah uang kepada pihak penerima jaminan (klien / pemilik proyek), jika nasabah bank (penjamin / kontraktor) gagal memenuhi kewajibannya (wanprestasi) sesuai perjanjian kontrak.',
      points: ['Jaminan tertulis dari bank', 'Melindungi penerima jaminan', 'Berlaku saat terjadi wanprestasi', 'Mengacu pada perjanjian kontrak']
    }
  ];

  var sModal = $('#serviceModal');
  var sDialog = sModal ? $('.modal-dialog', sModal) : null;
  var sIndex = 0;
  var sLastFocus = null;

  function renderService(i, animate) {
    var s = SERVICES[i];
    if (!s || !sModal) return;
    sIndex = i;
    $('#smNum').textContent = String(i + 1);
    $('#smIcon').setAttribute('href', s.icon);
    $('#smTitle').textContent = s.title;
    $('#smDesc').textContent = s.desc;
    var list = $('#smPoints');
    list.innerHTML = '';
    s.points.forEach(function (p) {
      var li = document.createElement('li');
      li.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-check"/></svg><span></span>';
      li.querySelector('span').textContent = p;
      list.appendChild(li);
    });
    if (animate && sDialog && !reduceMotion) {
      sDialog.classList.remove('swap');
      void sDialog.offsetWidth; // restart animasi
      sDialog.classList.add('swap');
    }
  }
  function openService(i) {
    if (!sModal) return;
    sLastFocus = document.activeElement;
    renderService(i, false);
    sModal.hidden = false;
    sModal.classList.remove('closing');
    lockScroll();
    var closeBtn = $('.modal-close', sModal);
    if (closeBtn) closeBtn.focus();
  }
  function closeService() {
    if (!sModal || sModal.hidden) return;
    sModal.classList.add('closing');
    setTimeout(function () {
      sModal.hidden = true;
      sModal.classList.remove('closing');
      unlockScroll();
      if (sLastFocus && sLastFocus.focus) sLastFocus.focus();
    }, reduceMotion ? 0 : 240);
  }
  $$('.service-card').forEach(function (card) {
    var idx = parseInt(card.getAttribute('data-service'), 10) || 0;
    card.addEventListener('click', function () { openService(idx); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openService(idx); }
    });
  });
  if (sModal) {
    $$('[data-close]', sModal).forEach(function (el) { el.addEventListener('click', closeService); });
    $('#smPrev').addEventListener('click', function () { renderService((sIndex - 1 + SERVICES.length) % SERVICES.length, true); });
    $('#smNext').addEventListener('click', function () { renderService((sIndex + 1) % SERVICES.length, true); });
    $('#smCta').addEventListener('click', function () {
      prefillService(SERVICES[sIndex].option);
      closeService();
    });
    sModal.addEventListener('keydown', function (e) {
      trapFocus(sModal, e);
      if (e.key === 'ArrowRight') renderService((sIndex + 1) % SERVICES.length, true);
      if (e.key === 'ArrowLeft') renderService((sIndex - 1 + SERVICES.length) % SERVICES.length, true);
    });
  }

  /* ---------- Form kontak ---------- */
  var form = $('#contactForm');
  if (form) {
    var msg = $('#fMessage');
    var msgCount = $('#msgCount');
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var PHONE_RE = /^[+]?[0-9\s-]{8,20}$/;

    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Nama minimal 2 karakter.'; },
      email: function (v) { return !v.trim() ? 'Email wajib diisi.' : (EMAIL_RE.test(v.trim()) ? '' : 'Format email tidak valid.'); },
      phone: function (v) { return !v.trim() || PHONE_RE.test(v.trim()) ? '' : 'Nomor telepon tidak valid (8–20 digit).'; },
      service: function (v) { return v ? '' : 'Silakan pilih layanan.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Pesan minimal 10 karakter.'; },
      company: function () { return ''; }
    };

    var validateField = function (el, force) {
      var rule = rules[el.name];
      if (!rule) return true;
      var field = el.closest('.field');
      var error = rule(el.value);
      var touched = force || el.dataset.touched === '1';
      if (!touched) return !error;
      field.classList.toggle('invalid', !!error);
      field.classList.toggle('valid', !error && el.value.trim() !== '');
      var errEl = $('.err', field);
      if (errEl) errEl.textContent = error;
      el.setAttribute('aria-invalid', error ? 'true' : 'false');
      return !error;
    };

    $$('input, select, textarea', form).forEach(function (el) {
      el.addEventListener('blur', function () { el.dataset.touched = '1'; validateField(el); });
      el.addEventListener('input', function () { validateField(el); });
      el.addEventListener('change', function () { if (el.tagName === 'SELECT') el.dataset.touched = '1'; validateField(el); });
    });

    if (msg && msgCount) {
      var updateCount = function () { msgCount.textContent = String(msg.value.length); };
      msg.addEventListener('input', updateCount);
      updateCount();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = $$('input, select, textarea', form);
      var firstInvalid = null;
      fields.forEach(function (el) {
        el.dataset.touched = '1';
        if (!validateField(el, true) && !firstInvalid) firstInvalid = el;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        toast('Mohon lengkapi data yang ditandai.');
        return;
      }
      var d = {
        name: form.name.value.trim(),
        company: form.company.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        service: form.service.value,
        message: form.message.value.trim()
      };
      var subject = '[Website] Permintaan ' + d.service + ' - ' + d.name;
      var bodyText = [
        'Halo JL Proteksindo,',
        '',
        d.message,
        '',
        '------------------------------',
        'Nama       : ' + d.name,
        'Perusahaan : ' + (d.company || '-'),
        'Email      : ' + d.email,
        'Telepon    : ' + (d.phone || '-'),
        'Layanan    : ' + d.service
      ].join('\r\n');
      var href = 'mailto:langgengproteksindo@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);
      window.location.href = href;
      toast('Membuka aplikasi email Anda…');
      setTimeout(function () {
        form.reset();
        fields.forEach(function (el) {
          delete el.dataset.touched;
          el.removeAttribute('aria-invalid');
          var f = el.closest('.field');
          if (f) { f.classList.remove('valid', 'invalid'); var er = $('.err', f); if (er) er.textContent = ''; }
        });
        if (msgCount) msgCount.textContent = '0';
      }, 1200);
    });
  }

  /* ---------- Escape global (menu & modal) ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (sModal && !sModal.hidden) { closeService(); return; }
    if (navOpen) { setNav(false); if (burger) burger.focus(); }
  });
})();
