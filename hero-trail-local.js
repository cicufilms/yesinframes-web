(() => {
  const hero = document.getElementById('inicio');
  const trail = document.getElementById('hero-image-trail');
  if (!hero || !trail) return;

  const desktop = window.matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const photos = [
    'hero-muro-blanco.webp', 'hero-atardecer.webp', 'abrazo.webp',
    'hero-petalos.webp', 'pergola.webp', 'velo-caballo.webp',
    'madre-corbata.webp', 'zapatos-alianzas.webp'
  ];
  const rotations = [-9, 7, -5, 10, -8, 5, -11, 8];
  let index = 0;
  let lastPoint = null;
  let lastTime = 0;

  function addPhoto(x, y) {
    const frame = document.createElement('figure');
    const photo = document.createElement('img');
    frame.className = 'hero__trail-photo';
    frame.style.setProperty('--trail-x', `${x}px`);
    frame.style.setProperty('--trail-y', `${y}px`);
    frame.style.setProperty('--trail-rotation', `${rotations[index % rotations.length]}deg`);
    photo.src = `assets/photos/${photos[index % photos.length]}`;
    photo.alt = '';
    photo.decoding = 'async';
    frame.appendChild(photo);
    trail.appendChild(frame);
    index += 1;
    while (trail.children.length > 7) trail.firstElementChild.remove();
    frame.addEventListener('animationend', () => frame.remove(), { once: true });
  }

  hero.addEventListener('pointermove', event => {
    if (!desktop.matches || (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
    const point = { x: event.clientX, y: event.clientY };
    const now = performance.now();
    if (lastPoint && (Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) < 145 || now - lastTime < 150)) return;
    const rect = hero.getBoundingClientRect();
    addPhoto(point.x - rect.left, point.y - rect.top);
    lastPoint = point;
    lastTime = now;
  }, { passive: true });

  hero.addEventListener('pointerleave', () => { lastPoint = null; });
  desktop.addEventListener('change', () => {
    if (!desktop.matches) {
      trail.replaceChildren();
      lastPoint = null;
      lastTime = 0;
    }
  });
})();
