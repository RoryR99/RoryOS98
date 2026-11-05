/* Startup: wire everything together, handle deep links, boot. */
(() => {
  'use strict';

  /** Links like #projects/tranquiltt or #resume open an app directly and skip the boot sequence. */
  const ROUTES = {
    about: 'about', experience: 'experience', projects: 'projects', skills: 'skills', resume: 'resume', contact: 'contact',
    achievements: 'achievements', quests: 'quests', arcade: 'arcade', terminal: 'terminal', settings: 'settings',
  };
  const route = () => {
    const [name, id] = location.hash.replace(/^#\/?/, '').split('/');
    if (!name) return false;
    if (name === 'projects' && id && OS.data.projects.some((p) => p.id === id)) { OS.open('project', { id }); return true; }
    if (ROUTES[name]) { OS.open(ROUTES[name]); return true; }
    return false;
  };

  const afterBoot = (deepLinked) => {
    // Welcome renders first so it can tell a first visit from a return visit.
    if (!deepLinked && OS.state.settings.welcome) OS.open('welcome');
    OS.game.flag('boot');
    if (new Date().getHours() < 5) OS.game.flag('night');
    OS.game.evaluate();
  };

  const init = async () => {
    OS.installCursors();
    OS.ui.installTooltips();
    document.body.classList.toggle('reduce-motion', !!OS.state.settings.reduceMotion);
    document.body.classList.toggle('dev-mode', !!OS.state.settings.devMode);
    OS.desktop.install();
    OS.startMenu.install();

    // Rewards and flags tied to opening apps
    OS.on('app-open', ({ appId }) => {
      OS.game.flag(`app:${appId}`);
      if (appId === 'about') { OS.game.flag('about:open'); OS.game.award('about:open', OS.game.XP.about); }
    });

    // Konami detection works anywhere that is not a text box
    document.addEventListener('keydown', (e) => {
      if (e.target.matches?.('input, textarea')) return;
      OS.feedKonami(e.key);
    });

    addEventListener('hashchange', route);

    const deepLink = /^#\/?\w/.test(location.hash);
    if (deepLink) {
      const opened = route();
      afterBoot(opened);
      return;
    }
    await OS.boot(!!OS.state.flags.boot);
    afterBoot(false);
  };

  init();
})();
