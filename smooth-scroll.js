/* Gentle wheel inertia; touch, keyboard and anchor links retain native scrolling. */
(function () {
  'use strict';
  var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var frame = 0;
  var destination = window.scrollY;
  var previousTime = 0;

  function limit() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    destination = window.scrollY;
  }
  function locked() {
    return document.body.classList.contains('menu-open') || document.body.classList.contains('is-locked');
  }
  function nestedScroll(target) {
    for (var element = target instanceof Element ? target : null; element && element !== document.body; element = element.parentElement) {
      if (element.matches('textarea,select,[contenteditable="true"],[data-native-scroll]')) return true;
      var style = getComputedStyle(element);
      if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1) return true;
    }
    return false;
  }
  function advance(time) {
    if (preference.matches || locked()) { stop(); return; }
    var elapsed = previousTime ? Math.min(time - previousTime, 64) : 16.67;
    previousTime = time;
    destination = Math.max(0, Math.min(limit(), destination));
    var current = window.scrollY;
    var distance = destination - current;
    if (Math.abs(distance) < 1) {
      window.scrollTo({top:destination, behavior:'instant'});
      stop();
      return;
    }
    var next = current + distance * (1 - Math.exp(-elapsed / 95));
    // Ensure progress when browsers round the scroll position to whole pixels.
    if (Math.abs(next - current) < 1) next = current + Math.sign(distance);
    window.scrollTo({top:next, behavior:'instant'});
    frame = requestAnimationFrame(advance);
  }
  window.addEventListener('wheel', function (event) {
    if (event.defaultPrevented || preference.matches || locked() || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || nestedScroll(event.target)) return;
    var delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    if (event.deltaMode === 2) delta *= window.innerHeight;
    if (!delta) return;
    if (!frame) destination = window.scrollY;
    // Reversing direction should respond immediately, without leftover momentum.
    if ((destination - window.scrollY) * delta < 0) destination = window.scrollY;
    destination = Math.max(0, Math.min(limit(), destination + delta));
    event.preventDefault();
    if (!frame) frame = requestAnimationFrame(advance);
  }, {passive:false});
  window.addEventListener('pointerdown', stop, {passive:true});
  window.addEventListener('touchstart', stop, {passive:true});
  window.addEventListener('resize', stop, {passive:true});
  window.addEventListener('pagehide', stop);
  document.addEventListener('keydown', function (event) {
    if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Escape','Tab'].includes(event.key)) stop();
  });
  document.addEventListener('click', function (event) {
    if (event.target instanceof Element && event.target.closest('a,button,summary')) stop();
  });
  preference.addEventListener('change', stop);
})();
