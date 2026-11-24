(() => {
  const greetingNodes = document.querySelectorAll('[data-about-greeting]');
  const introNodes = document.querySelectorAll('[data-about-intro]');
  if (!greetingNodes.length) return;

  const words = {
    es: { morning: 'Buenos días', afternoon: 'Buenas tardes', night: 'Buenas noches', intro: 'mi nombre es' },
    en: { morning: 'Good morning', afternoon: 'Good afternoon', night: 'Good evening', intro: 'my name is' },
    fr: { morning: 'Bonjour', afternoon: 'Bon après-midi', night: 'Bonsoir', intro: 'je m’appelle' },
    it: { morning: 'Buongiorno', afternoon: 'Buon pomeriggio', night: 'Buonasera', intro: 'mi chiamo' },
  };

  const update = () => {
    const hour = new Date().getHours();
    const period = hour >= 6 && hour < 12 ? 'morning' : hour >= 12 && hour < 20 ? 'afternoon' : 'night';
    const language = words[window.YIF?.language] ? window.YIF.language : 'es';
    greetingNodes.forEach(node => { node.textContent = words[language][period]; });
    introNodes.forEach(node => { node.textContent = words[language].intro; });
  };

  update();
  document.addEventListener('languagechange', update);
})();
