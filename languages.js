/* Local translations: no third-party translation service or page reload. */
(function () {
  'use strict';
  const locales = ['es', 'en', 'fr', 'it'];
  const names = ['Español', 'English', 'Français', 'Italiano'];
  const normalise = value => value.replace(/\s+/g, ' ').trim();
  const dictionary = new Map((window.YIF_TRANSLATIONS || []).map(row => [normalise(row[0]), row]));
  const sources = new WeakMap();
  let stored;
  try { stored = localStorage.getItem('yesinframes-language'); } catch (_) {}
  const requested = new URLSearchParams(location.search).get('lang');
  let language = locales.includes(requested) ? requested : locales.includes(stored) ? stored : 'es';
  function translate(value) {
    const row = dictionary.get(normalise(value));
    return row ? row[locales.indexOf(language)] : value;
  }
  window.YIF = { t: translate, get language() { return language; } };
  const controls = [];
  document.querySelectorAll('[data-language-switch]').forEach(host => {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'language-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    const list = document.createElement('div');
    list.className = 'language-options';
    list.id = 'language-options-' + controls.length;
    list.hidden = true;
    toggle.setAttribute('aria-controls', list.id);
    locales.forEach((code, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.lang = code;
      option.dataset.language = code;
      option.textContent = names[index];
      option.addEventListener('click', () => {
        language = code;
        try { localStorage.setItem('yesinframes-language', language); } catch (_) {}
        const url = new URL(location.href);
        url.searchParams.set('lang', language);
        history.replaceState(null, '', url);
        close();
        apply();
        document.dispatchEvent(new CustomEvent('languagechange', {detail: language}));
        toggle.focus();
      });
      list.append(option);
    });
    function close() { list.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', () => {
      const opening = list.hidden;
      list.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
      if (opening) list.querySelector('[data-language="' + language + '"]').focus();
    });
    host.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); close(); toggle.focus(); }
    });
    document.addEventListener('click', event => { if (!host.contains(event.target)) close(); });
    host.append(toggle, list);
    controls.push({toggle, list});
  });
  function localiseValue(node, key, value, set) {
    let record = sources.get(node);
    if (!record) { record = {}; sources.set(node, record); }
    let item = record[key];
    if (!item || item.last !== value) item = record[key] = { original: value };
    const trimmed = normalise(item.original);
    const translated = translate(trimmed);
    const next = translated === trimmed ? item.original : item.original.replace(item.original.trim(), translated);
    item.last = next;
    if (value !== next) set(next);
  }
  const observer = new MutationObserver(() => apply());
  function apply() {
    observer.disconnect();
    document.documentElement.lang = language;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim() || node.parentElement.closest('script,style,noscript,[data-language-switch],[data-no-translate]')) continue;
      const target = node;
      localiseValue(target, 'text', target.textContent, value => { target.textContent = value; });
    }
    document.querySelectorAll('[aria-label],[alt],[data-caption]').forEach(element => {
      if (element.closest('[data-language-switch]')) return;
      ['aria-label', 'alt', 'data-caption'].forEach(attribute => {
        if (element.hasAttribute(attribute)) localiseValue(element, attribute, element.getAttribute(attribute), value => element.setAttribute(attribute, value));
      });
    });
    localiseValue(document.querySelector('title'), 'text', document.title, value => { document.title = value; });
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (/^(historia|index)\.html(?:[?#]|$)/.test(href)) {
        const url = new URL(href, location.href);
        url.searchParams.set('lang', language);
        link.setAttribute('href', url.pathname.split('/').pop() + url.search + url.hash);
      }
    });
    document.querySelectorAll('meta[name=description],meta[property="og:title"],meta[property="og:description"]').forEach(meta => {
      localiseValue(meta, 'content', meta.content, value => { meta.content = value; });
    });
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.content = {es:'es_ES',en:'en_GB',fr:'fr_FR',it:'it_IT'}[language];
    controls.forEach(({toggle,list}) => {
      toggle.textContent = language.toUpperCase() + ' ⌄';
      toggle.setAttribute('aria-label', ['Idioma', 'Language', 'Langue', 'Lingua'][locales.indexOf(language)] + ': ' + names[locales.indexOf(language)]);
      list.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    });
    observer.observe(document.body, {subtree:true, childList:true, characterData:true});
  }
  apply();
})();
