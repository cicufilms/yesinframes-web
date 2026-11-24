(function () {
  'use strict';

  var overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var entering = document.documentElement.classList.contains('story-arriving');

  if (entering) {
    if (reducedMotion.matches) {
      document.documentElement.classList.remove('story-arriving');
      return;
    }
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.documentElement.classList.add('story-entering');
        window.setTimeout(function () {
          document.documentElement.classList.remove('story-arriving', 'story-entering');
        }, 620);
      });
    });
    return;
  }

  if (document.body.classList.contains('story-page')) return;

  var leaving = false;
  document.addEventListener('click', function (event) {
    if (leaving || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        reducedMotion.matches) return;

    var link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    var destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin ||
        !/\/historia\.html$/.test(destination.pathname)) return;

    event.preventDefault();
    leaving = true;
    try { sessionStorage.setItem('yesinframes-story-entry', '1'); } catch (error) {}
    document.body.classList.add('story-leaving');
    window.setTimeout(function () { window.location.assign(destination.href); }, 560);
  });

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      leaving = false;
      document.body.classList.remove('story-leaving');
    }
  });
})();
