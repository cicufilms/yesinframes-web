// Yesinframes V5 — intro del cupido, menú móvil, carrusel del hero,
// apariciones discretas, cifras animadas y timeline de la experiencia.

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(value) { return Math.min(1, Math.max(0, value)); }

  function initTypewriter() {
    var targets = document.querySelectorAll('[data-typewriter]');
    if (!targets.length) return;
    targets.forEach(function (target) {
      var text = target.textContent.trim();
      if (!text || target.dataset.typewriterReady === 'true') return;
      target.dataset.typewriterReady = 'true';
      if (reduced) return;
      target.textContent = '';
      var index = 0;
      var deleting = false;
      function write() {
        target.textContent = deleting ? text.slice(0, index) : text.slice(0, index);
        if (!deleting) {
          index += 1;
          if (index <= text.length) return window.setTimeout(write, 62);
          deleting = true;
          return window.setTimeout(write, 1900);
        }
        index -= 1;
        if (index >= 0) return window.setTimeout(write, 38);
        deleting = false;
        index = 0;
        window.setTimeout(write, 420);
      }
      window.setTimeout(write, 420);
    });
  }

  /* ---------------- 1. Intro: el cupido se dibuja a tinta ---------------- */
  // Misma animación que la web vigente (Hover Central).
  function runIntroLoader(onComplete) {
    var loaderEl = document.getElementById('loader');
    var canvas = document.getElementById('loader-canvas');
    var sourceImage = document.getElementById('loader-source');
    var counterEl = document.getElementById('loader-counter');
    var context = canvas && canvas.getContext('2d');

    if (!loaderEl || !canvas || !sourceImage || !context) {
      if (loaderEl) loaderEl.hidden = true;
      onComplete();
      return;
    }

    // Every document load, including reload, plays the brand intro.
    document.body.classList.add('is-locked');

    var maskCanvas = document.createElement('canvas');
    var inkCanvas = document.createElement('canvas');
    maskCanvas.width = inkCanvas.width = canvas.width;
    maskCanvas.height = inkCanvas.height = canvas.height;
    var mask = maskCanvas.getContext('2d');
    var ink = inkCanvas.getContext('2d');
    var ready = false;
    var completed = false;
    var timeout = window.setTimeout(finish, 6000);
    if (!mask || !ink) { finish(); return; }

    var paths = [
      { start: 0, end: 0.54, width: 62, points: [[492,106],[446,96],[397,116],[353,139],[327,109],[299,68],[263,31],[311,18],[366,43],[404,83],[438,119]] },
      { start: 0.12, end: 0.76, width: 70, points: [[343,127],[318,164],[344,201],[388,216],[405,257],[380,301],[334,335],[277,349]] },
      { start: 0.18, end: 0.84, width: 76, points: [[307,133],[260,121],[214,105],[155,98],[92,88],[23,64],[64,112],[132,144],[210,158],[279,177]] },
      { start: 0.34, end: 0.96, width: 84, points: [[342,190],[312,230],[263,257],[207,270],[153,286],[111,325],[82,373],[58,427],[45,472]] },
      { start: 0.46, end: 1.0, width: 88, points: [[392,242],[408,286],[389,335],[354,382],[304,416],[244,431],[179,435],[111,454],[55,481]] }
    ];

    function drawPartialPath(points, progress, width) {
      if (progress <= 0) return;
      var segments = [];
      var total = 0;
      for (var i = 1; i < points.length; i++) {
        var len = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
        segments.push({ x1: points[i - 1][0], y1: points[i - 1][1], x2: points[i][0], y2: points[i][1], length: len });
        total += len;
      }
      var remaining = total * clamp(progress);
      mask.beginPath();
      mask.moveTo(points[0][0], points[0][1]);
      for (var j = 0; j < segments.length && remaining > 0; j++) {
        var seg = segments[j];
        if (remaining >= seg.length) {
          mask.lineTo(seg.x2, seg.y2);
          remaining -= seg.length;
        } else {
          var ratio = remaining / seg.length;
          mask.lineTo(seg.x1 + (seg.x2 - seg.x1) * ratio, seg.y1 + (seg.y2 - seg.y1) * ratio);
          remaining = 0;
        }
      }
      mask.lineWidth = width;
      mask.lineCap = 'round';
      mask.lineJoin = 'round';
      mask.strokeStyle = '#000';
      mask.stroke();
    }

    function draw(progress) {
      if (!ready) return;
      var value = clamp(progress);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = reduced ? 1 : 0.12;
      context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
      if (reduced) return;

      mask.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      for (var k = 0; k < paths.length; k++) {
        var p = paths[k];
        drawPartialPath(p.points, clamp((value - p.start) / (p.end - p.start)), p.width);
      }

      ink.clearRect(0, 0, inkCanvas.width, inkCanvas.height);
      ink.globalCompositeOperation = 'source-over';
      ink.drawImage(sourceImage, 0, 0, inkCanvas.width, inkCanvas.height);
      ink.globalCompositeOperation = 'destination-in';
      ink.drawImage(maskCanvas, 0, 0);
      ink.globalCompositeOperation = 'source-over';
      context.drawImage(inkCanvas, 0, 0);

      if (value > 0.88) {
        context.globalAlpha = clamp((value - 0.88) / 0.12);
        context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1;
      }
    }

    function finish() {
      if (completed) return;
      completed = true;
      window.clearTimeout(timeout);
      sourceImage.removeEventListener('load', start);
      sourceImage.removeEventListener('error', finish);
      loaderEl.classList.add('is-hidden');
      document.body.classList.remove('is-locked');
      onComplete();
      window.setTimeout(function () { loaderEl.setAttribute('hidden', ''); }, 650);
    }

    function start() {
      if (ready || completed) return;
      ready = true;
      if (reduced) {
        if (counterEl) counterEl.textContent = '100';
        draw(1);
        window.setTimeout(finish, 150);
        return;
      }
      var startedAt = performance.now();
      var duration = 1800;
      function step(now) {
        if (completed) return;
        var progress = clamp((now - startedAt) / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        if (counterEl) {
          var val = progress >= 1 ? 100 : Math.min(99, Math.max(1, Math.floor(1 + eased * 98)));
          counterEl.textContent = String(val).padStart(2, '0');
        }
        draw(progress);
        if (progress < 1) requestAnimationFrame(step);
        else window.setTimeout(finish, 260);
      }
      requestAnimationFrame(step);
    }

    if (sourceImage.complete) {
      if (sourceImage.naturalWidth) start();
      else finish();
    } else {
      sourceImage.addEventListener('load', start, { once: true });
      sourceImage.addEventListener('error', finish, { once: true });
    }
  }

  /* ==== Header flotante y menú en vino: recuperados de Hover Central ==== */
  /* ---------------- 3. Header Inteligente (Auto-hide on Scroll) ---------------- */
  function initSmartHeader() {
    var header = document.getElementById('wedding-header');
    if (!header) return;

    var lastScroll = window.scrollY;
    var threshold = 100;
    var ticking = false;

    function handleScroll() {
      var current = window.scrollY;
      var isMenuOpen = document.body.classList.contains('menu-open');

      if (isMenuOpen) {
        header.classList.remove('is-hidden');
        lastScroll = current;
        ticking = false;
        return;
      }

      if (current > threshold && current > lastScroll + 6) {
        // Bajando
        header.classList.add('is-hidden');
      } else if (current < lastScroll - 8 || current <= threshold) {
        // Subiendo o en la parte superior
        header.classList.remove('is-hidden');
      }

      lastScroll = current;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(handleScroll);
      }
    }, { passive: true });
  }


  /* ---------------- 5. Menú Flotante Central & Pantalla Completa ---------------- */
  function initMenu() {
    var button = document.getElementById('menu-button');
    var label = document.getElementById('menu-button-label');
    var panel = document.getElementById('site-menu');
    var wordmark = document.getElementById('wordmark-link');

    if (!button || !panel) return;

    function setOpen(open) {
      document.body.classList.toggle('menu-open', open);
      panel.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', String(!open));
      button.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Cerrar' : 'Menú';
      panel.inert = !open;
      document.querySelector('main').inert = open;
      document.querySelector('footer').inert = open;
      if (open) panel.querySelector('a').focus();
      else button.focus();
    }

    panel.inert = true;
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || !panel.classList.contains('is-open')) return;
      var links = Array.prototype.slice.call(panel.querySelectorAll('.menu-set:not(.menu-set--echo) a'));
      if (!event.shiftKey && document.activeElement === links[links.length - 1]) { event.preventDefault(); button.focus(); }
      else if (!event.shiftKey && document.activeElement === button) { event.preventDefault(); links[0].focus(); }
      else if (event.shiftKey && document.activeElement === links[0]) { event.preventDefault(); button.focus(); }
      else if (event.shiftKey && document.activeElement === button) { event.preventDefault(); links[links.length - 1].focus(); }
    });

    button.addEventListener('click', function () {
      setOpen(!panel.classList.contains('is-open'));
    });

    // Cerrar menú con la tecla Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        setOpen(false);
      }
    });

    // Cerrar al pulsar un enlace de navegación
    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });

    if (wordmark) {
      wordmark.addEventListener('click', function () {
        setOpen(false);
      });
    }
  }

  /* ---------------- 6. Menú: Emblema Reactivo & Cursor ---------------- */
  function initMenuStage() {
    var panel = document.getElementById('site-menu');
    var emblem = document.getElementById('menu-emblem');
    var caption = document.getElementById('menu-caption');
    var cursor = document.getElementById('menu-cursor');
    if (!panel || !emblem) return;

    var links = panel.querySelectorAll('.menu-link');
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function activate(link) {
      if (link.dataset.pose) emblem.dataset.pose = link.dataset.pose;
      if (caption && link.dataset.caption) {
        caption.textContent = link.dataset.caption;
        caption.classList.add('is-on');
      }
      if (cursor && fine) cursor.classList.add('is-on');
    }

    function rest() {
      emblem.removeAttribute('data-pose');
      if (caption) caption.classList.remove('is-on');
      if (cursor) cursor.classList.remove('is-on');
    }

    links.forEach(function (link) {
      link.addEventListener('mouseenter', function () { activate(link); });
      link.addEventListener('focus', function () { activate(link); });
      link.addEventListener('mouseleave', rest);
      link.addEventListener('blur', rest);
    });

    if (cursor && fine) {
      panel.addEventListener('mousemove', function (e) {
        cursor.style.setProperty('--cx', e.clientX + 'px');
        cursor.style.setProperty('--cy', e.clientY + 'px');
      }, { passive: true });
    }
  }


  /* ---------------- 7. Botón Flotante Persistente (Sticky CTA) ---------------- */
  function initStickyCta() {
    var cta = document.getElementById('sticky-wa');
    var hero = document.querySelector('.hero');
    var contact = document.getElementById('contacto');
    var about = document.getElementById('sobre-mi');
    if (!cta || !hero) return;

    var ticking = false;
    function update() {
      var heroBottom = hero.offsetTop + hero.offsetHeight * (window.innerWidth <= 700 ? 1 : 0.65);
      var contactTop = contact ? contact.offsetTop - window.innerHeight * 0.45 : Infinity;
      var y = window.scrollY;

      var aboutRect = about ? about.getBoundingClientRect() : null;
      var aboutVisible = window.innerWidth <= 700 && aboutRect && aboutRect.top < window.innerHeight * 0.8 && aboutRect.bottom > window.innerHeight * 0.2;
      var visible = y > heroBottom && y < contactTop && !aboutVisible;
      cta.classList.toggle('is-visible', visible);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------- 3. Carrusel del hero ---------------- */
  function initHeroStack(root, slides) {
    var mobile = window.matchMedia('(max-width: 700px)');
    var index = -1;
    var built = 0;
    var timer = null;
    var inView = false;
    var transitioning = false;

    function stop() { if (timer) window.clearTimeout(timer); timer = null; }
    function canPlay() { return mobile.matches && !reduced && !document.hidden && inView; }
    function schedule() {
      stop();
      if (!canPlay() || transitioning) return;
      timer = window.setTimeout(built < slides.length ? revealNext : advance, built < slides.length ? 250 : 1000);
    }
    function show() {
      slides.forEach(function (slide, position) {
        var visible = position < built;
        var active = visible && position === index;
        slide.dataset.stackState = visible ? 'visible' : 'queued';
        if (visible) slide.dataset.stackDepth = String((index - position + slides.length) % slides.length);
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
    }
    function enter(next) {
      var incoming = slides[next];
      incoming.classList.add('is-preparing');
      index = next;
      if (built < slides.length) built++;
      show();
      // Commit the starting position before the next card travels over the stack.
      void incoming.offsetWidth;
      incoming.classList.remove('is-preparing');
      incoming.classList.add('is-entering');
      window.setTimeout(function () {
        incoming.classList.remove('is-entering');
      }, 420);
    }
    function revealNext() {
      if (!canPlay()) return;
      enter(built);
      schedule();
    }
    function advance() {
      if (transitioning || !canPlay()) return;
      transitioning = true;
      enter((index + 1) % slides.length);
      window.setTimeout(function () {
        transitioning = false;
        schedule();
      }, 420);
    }

    document.addEventListener('visibilitychange', schedule);
    mobile.addEventListener('change', schedule);
    if (reduced) {
      index = 0;
      built = 1;
      show();
      return;
    }
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        inView = entries.some(function (entry) { return entry.isIntersecting; });
        schedule();
      }, { threshold: 0.15 });
      observer.observe(root);
    } else {
      inView = true;
    }
    show();
    schedule();
  }

  function initHeroSlides() {
    var roots = document.querySelectorAll('.hero-slides');
    if (!roots.length) return;

    roots.forEach(function (root) {
      var slides = root.querySelectorAll('.hero__slide');
      if (root.classList.contains('hero-slides--stack')) {
        if (slides.length > 1) initHeroStack(root, slides);
        return;
      }
      if (slides.length < 2 || reduced) return;

      var index = 0;
      var timer = null;

      function show(next) {
        slides[index].classList.remove('is-active');
        index = next;
        slides[index].classList.add('is-active');
      }

      function play() {
        stop();
        timer = window.setInterval(function () { show((index + 1) % slides.length); }, 6000);
      }
      function stop() { if (timer) window.clearInterval(timer); timer = null; }

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else play();
      });
      play();
    });
  }

  /* ---------------- 4. Apariciones discretas ---------------- */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduced) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- 6. Cifras que cuentan al aparecer ---------------- */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length || reduced || !('IntersectionObserver' in window)) return;

    function render(el, value) {
      // Punto de miles a la española (Intl no lo pone en cifras de cuatro dígitos).
      var text = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      el.textContent = (el.dataset.prefix || '') + text + (el.dataset.suffix || '');
    }

    function run(el) {
      var to = Number(el.dataset.count);
      var from = Number(el.dataset.from || 0);
      var duration = 2000;
      var startedAt = performance.now();
      function step(now) {
        var t = clamp((now - startedAt) / duration);
        var eased = 1 - Math.pow(1 - t, 4);
        render(el, Math.round(from + (to - from) * eased));
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        run(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) {
      render(el, Number(el.dataset.from || 0));
      observer.observe(el);
    });
  }

  /* ---------------- 7. Timeline de la experiencia ---------------- */
  // La línea se rellena al ritmo del scroll (el punto de lectura es el centro de la pantalla)
  // y cada rombo se enciende cuando la línea lo alcanza.
  function initTimeline() {
    var timeline = document.getElementById('timeline');
    var fill = document.getElementById('timeline-fill');
    if (!timeline || !fill) return;
    var steps = timeline.querySelectorAll('.tl-step');

    if (reduced) {
      timeline.style.setProperty('--p', 1);
      steps.forEach(function (step) { step.classList.add('is-on'); });
      return;
    }

    var ticking = false;
    function update() {
      ticking = false;
      var rect = timeline.getBoundingClientRect();
      var reach = window.innerHeight * 0.6 - rect.top;
      timeline.style.setProperty('--p', clamp(reach / rect.height));
      steps.forEach(function (step) {
        var dot = step.querySelector('.tl-dot').getBoundingClientRect();
        step.classList.toggle('is-on', dot.top + dot.height / 2 - rect.top <= reach);
      });
    }
    function request() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
  }

  /* ---------------- 8. Tres bodas (pestañas) ---------------- */
  // TEXTOS DE MUESTRA: validar con Víctor antes de publicar (solo «Armand» consta en sus archivos).
  var CASES = [
    {
      name: 'Armand & Cristina',
      meta: 'Finca Sant Lluís, Menorca · Celebración al aire libre',
      text: 'Brisa de tramuntana, ceremonia íntima bajo olivos centenarios, brindis con pomada menorquina y una cena iluminada por guirnaldas cálidas antes de la fiesta en el patio de piedra.',
      photos: 840
    },
    {
      name: 'Guille & Alba',
      meta: 'Finca Son Berga, Mallorca · Ceremonia civil al atardecer',
      text: 'Preparativos en casa, con la familia entrando y saliendo; ceremonia entre almendros con la última luz del día y un baile improvisado antes de la cena que nadie tenía en el guion.',
      photos: 760
    },
    {
      name: 'Marina & Carlos',
      meta: 'Masía en el Empordà · Boda de destino en dos días',
      text: 'Preboda entre viñedos la tarde anterior, ceremonia en el patio de la masía y una sobremesa larga que terminó con medio grupo de invitados dentro de la piscina.',
      photos: 920
    }
  ];

  function initCases() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.cases__tab'));
    var panel = document.getElementById('case-panel');
    if (!tabs.length || !panel) return;

    var fields = {};
    panel.querySelectorAll('[data-case-field]').forEach(function (el) { fields[el.dataset.caseField] = el; });
    var current = 0;
    var swapTimer = null;

    function countTo(el, to) {
      if (reduced) { el.textContent = to; return; }
      var from = Number(el.textContent) || 0;
      var startedAt = performance.now();
      function step(now) {
        var t = clamp((now - startedAt) / 900);
        el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function fill(index) {
      var item = CASES[index];
      fields.kicker.textContent = 'Boda 0' + (index + 1);
      fields.name.textContent = item.name;
      fields.meta.textContent = item.meta;
      fields.text.textContent = item.text;
      countTo(fields.photos, item.photos);
    }

    function select(index, focus) {
      if (index === current) return;
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tabs[index].id);
      if (focus) tabs[index].focus();
      current = index;

      window.clearTimeout(swapTimer);
      if (reduced) { fill(index); return; }
      panel.classList.add('is-swapping');
      swapTimer = window.setTimeout(function () {
        fill(index);
        panel.classList.remove('is-swapping');
      }, 260);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== null) { event.preventDefault(); select(next, true); }
      });
    });
  }

  /* ---------------- Arranque ---------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = '© ' + new Date().getFullYear() + ' Yesinframes';

  initSmartHeader();
  initMenu();
  initMenuStage();
  initStickyCta();
  initCases();
  initTypewriter();
  runIntroLoader(function () {
    initReveal();
    initHeroSlides();
    initCounters();
    initTimeline();
  });
})();
