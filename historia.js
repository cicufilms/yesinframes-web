(function () {
  'use strict';

  // Número real de Víctor, formato internacional sin espacios ni signos.
  var WHATSAPP_NUMBER = '34636629961';

  var steps = [
    {
      key: 'fecha',
      kicker: 'Solo cuatro gestos',
      title: 'Empecemos por<br>lo más fácil.',
      question: '¿Cuándo celebráis vuestra boda?',
      reassurance: 'Solo cuatro gestos. Menos de un minuto.',
      image: 'assets/weddings/hero-dress-rug.webp',
      options: ['2026', '2027', '2028', 'Aún no lo sabemos']
    },
    {
      key: 'lugar',
      kicker: 'Situemos la historia',
      title: 'Ahora, situemos<br>la historia.',
      question: '¿Dónde celebraréis vuestra boda?',
      reassurance: 'Una elección y seguimos.',
      image: 'assets/weddings/sunset.webp',
      options: ['Menorca', 'Resto de Baleares', 'Canarias', 'Aún no lo sabemos']
    },
    {
      key: 'invitados',
      kicker: 'Una cifra aproximada',
      title: 'Cada historia tiene<br>su propio ritmo.',
      question: '¿Cuántas personas compartirán ese día?',
      reassurance: 'No hace falta que sea exacto.',
      image: 'assets/weddings/bride-ready.webp',
      options: ['Menos de 50', '50 — 100', '100 — 150', 'Más de 150'],
      unsure: 'Aún no lo sabemos'
    },
    {
      key: 'cobertura',
      kicker: 'Vuestro día, de principio a fin',
      title: '¿Cuánto de vuestro día<br>queremos contar?',
      question: '¿Qué os gustaría que cubriera?',
      reassurance: 'Lo afinamos juntos después, sin compromiso.',
      image: 'assets/weddings/getting-ready-tie.webp',
      options: ['Ceremonia y banquete', 'Desde los preparativos', 'Todo, más preboda o postboda', 'Aún no lo sabemos']
    }
  ];

  var currentIndex = 0;
  var answers = {};
  var moving = false;

  var content = document.getElementById('story-content');
  var complete = document.getElementById('story-complete');
  var progressMeta = document.querySelector('.story-progress__meta');
  var currentStep = document.getElementById('step-current');
  var totalSteps = document.getElementById('step-total');
  var progressFill = document.getElementById('progress-fill');
  var kicker = document.getElementById('story-kicker');
  var title = document.getElementById('story-title');
  var question = document.getElementById('story-question');
  var options = document.getElementById('story-options');
  var unsure = document.getElementById('story-unsure');
  var reassurance = document.getElementById('story-reassurance');
  var back = document.getElementById('story-back');
  var image = document.getElementById('story-image');
  var summary = document.getElementById('story-summary');
  var directWhatsapp = document.getElementById('story-whatsapp-direct');
  var finalWhatsapp = document.getElementById('story-whatsapp-final');

  if (!content || !complete || !options || !back || !image) return;

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function labelFor(value) {
    return t(String(value));
  }

  function t(value) { return window.YIF ? window.YIF.t(value) : value; }

  function buildMessage(isFinal) {
    var lines = [t('Hola Víctor, nos gustaría contarte nuestra boda y conocer mejor tu trabajo.'), ''];
    [['fecha', 'Fecha'], ['lugar', 'Lugar'], ['invitados', 'Invitados'], ['cobertura', 'Nos gustaría cubrir']].forEach(function (item) {
      if (answers[item[0]]) lines.push(t(item[1]) + ': ' + t(answers[item[0]]));
    });
    if (isFinal) lines.push('', t('Nos gustaría conocerte y saber si tienes disponibilidad.'));
    return lines.join('\n');
  }

  function whatsappUrl(isFinal) {
    var recipient = WHATSAPP_NUMBER ? WHATSAPP_NUMBER : '';
    return 'https://wa.me/' + recipient + '?text=' + encodeURIComponent(buildMessage(isFinal));
  }

  function refreshWhatsappLinks() {
    directWhatsapp.href = whatsappUrl(false);
    finalWhatsapp.href = whatsappUrl(true);
  }

  function changeImage(source) {
    if (image.getAttribute('src') === source) return;
    image.classList.add('is-changing');
    window.setTimeout(function () {
      image.src = source;
      image.onload = function () {
        requestAnimationFrame(function () { image.classList.remove('is-changing'); });
      };
    }, 220);
  }

  function createOption(step, value) {
    var button = document.createElement('button');
    button.className = 'story-option';
    button.type = 'button';
    button.textContent = labelFor(value);
    button.dataset.noTranslate = ''; 
    button.dataset.value = value;
    button.setAttribute('aria-pressed', String(answers[step.key] === value));
    if (answers[step.key] === value) button.classList.add('is-selected');
    button.addEventListener('click', function () { choose(step, value, button); });
    return button;
  }

  function choose(step, value, button) {
    if (moving) return;
    moving = true;
    answers[step.key] = value;
    options.querySelectorAll('.story-option').forEach(function (option) {
      var selected = option === button;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
    refreshWhatsappLinks();

    window.setTimeout(function () {
      if (currentIndex < steps.length - 1) {
        currentIndex += 1;
        transitionToStep();
      } else {
        showComplete();
      }
    }, 380);
  }

  function renderStep() {
    var step = steps[currentIndex];
    currentStep.textContent = pad(currentIndex + 1);
    totalSteps.textContent = pad(steps.length);
    progressFill.style.width = ((currentIndex + 1) / steps.length * 100) + '%';
    kicker.textContent = step.kicker;
    title.innerHTML = step.title;
    question.textContent = step.question;
    reassurance.textContent = step.reassurance;
    options.innerHTML = '';
    step.options.forEach(function (value) { options.appendChild(createOption(step, value)); });

    if (step.unsure) {
      unsure.hidden = false;
      unsure.textContent = step.unsure;
      unsure.onclick = function () { choose(step, step.unsure, unsure); };
    } else {
      unsure.hidden = true;
      unsure.onclick = null;
    }

    back.disabled = currentIndex === 0;
    back.innerHTML = '<span aria-hidden="true">←</span> Atrás';
    changeImage(step.image);
    refreshWhatsappLinks();
  }

  function transitionToStep() {
    content.classList.add('is-leaving');
    window.setTimeout(function () {
      renderStep();
      content.classList.remove('is-leaving');
      content.classList.add('is-entering');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          content.classList.remove('is-entering');
          moving = false;
          var first = options.querySelector('button');
          if (first) first.focus({ preventScroll: true });
        });
      });
    }, 280);
  }

  function showComplete() {
    content.classList.add('is-leaving');
    window.setTimeout(function () {
      content.hidden = true;
      complete.hidden = false;
      document.querySelector('.story-panel').setAttribute('aria-labelledby', 'story-complete-title');
      complete.classList.add('is-revealing');
      progressMeta.innerHTML = '<span>TODO LISTO</span>';
      progressFill.style.width = '100%';
      updateSummary();
      changeImage('assets/weddings/aerial-walk.webp');
      back.disabled = false;
      back.innerHTML = '<span aria-hidden="true">←</span> Cambiar respuestas';
      directWhatsapp.hidden = true;
      refreshWhatsappLinks();
      moving = false;
      finalWhatsapp.focus({ preventScroll: true });
    }, 300);
  }

  function updateSummary() {
    summary.textContent = [answers.fecha, answers.lugar, answers.invitados, answers.cobertura].filter(Boolean).map(t).join('  ·  ');
  }

  document.addEventListener('languagechange', function () {
    if (!complete.hidden) updateSummary();
    else renderStep();
    refreshWhatsappLinks();
  });

  function leaveComplete() {
    complete.hidden = true;
    document.querySelector('.story-panel').setAttribute('aria-labelledby', 'story-title');
    complete.classList.remove('is-revealing');
    content.hidden = false;
    content.classList.remove('is-leaving');
    progressMeta.innerHTML = '<span id="step-current"></span><span aria-hidden="true">—</span><span id="step-total"></span>';
    currentStep = document.getElementById('step-current');
    totalSteps = document.getElementById('step-total');
    directWhatsapp.hidden = false;
    currentIndex = steps.length - 1;
    renderStep();
    moving = false;
  }

  back.addEventListener('click', function () {
    if (moving || back.disabled) return;
    if (!complete.hidden) {
      leaveComplete();
      return;
    }
    moving = true;
    currentIndex = Math.max(0, currentIndex - 1);
    transitionToStep();
  });

  document.addEventListener('keydown', function (event) {
    if ((event.key === 'Escape' || event.key === 'ArrowLeft') && !back.disabled) {
      back.click();
    }
  });

  steps.slice(1).forEach(function (step) {
    var preload = new Image();
    preload.src = step.image;
  });
  var completionPreload = new Image();
  completionPreload.src = 'assets/weddings/aerial-walk.webp';

  summary.dataset.noTranslate = '';
  renderStep();
})();
