/* Start menu. Built on the shared menu widget, so keyboard and touch come along for free. */
(() => {
  'use strict';
  const { $ } = OS;

  const projectItem = (p) => ({ label: p.name, icon: p.icon, action: () => OS.open('project', { id: p.id }) });

  const recentProjects = () => {
    const ids = OS.state.recent.length ? OS.state.recent : ['tranquiltt', 'otif', 'geotab'];
    const items = ids.map((id) => OS.data.projects.find((p) => p.id === id)).filter(Boolean).map(projectItem);
    return [...items, { sep: true }, { label: 'All Projects', icon: 'folder', action: () => OS.open('projects') }];
  };

  const games = () => [
    { label: 'Arcade', icon: 'joystick', action: () => OS.open('arcade') },
    { sep: true },
    { label: 'Null Hunter', icon: 'bug', action: () => OS.open('hunter') },
    { label: 'Data Detective Quiz', icon: 'brain', action: () => OS.open('quiz') },
    { label: 'Reaction Test', icon: 'bolt', action: () => OS.open('reaction') },
    { label: 'Terminal Challenge', icon: 'db', action: () => OS.open('terminal', { challenge: true }) },
    OS.game.has('egg:konami') || OS.game.has('secret:folder') ? { label: 'Query Catcher', icon: 'star', action: () => OS.open('catcher') } : null,
  ];

  const items = () => [
    { label: 'Programs', icon: 'app', sub: [
      { label: 'My Computer', icon: 'computer', action: () => OS.open('computer') },
      { label: 'About Rory', icon: 'user', action: () => OS.open('about') },
      { label: 'Work Experience', icon: 'briefcase', action: () => OS.open('experience') },
      { label: 'Projects', icon: 'folder', action: () => OS.open('projects') },
      { label: 'Skills', icon: 'chart', action: () => OS.open('skills') },
      { label: 'Contact', icon: 'mail', action: () => OS.open('contact') },
      { sep: true },
      { label: 'Terminal', icon: 'terminal', action: () => OS.open('terminal') },
      { label: 'Notepad', icon: 'notepad', action: () => OS.open('notepad', {}) },
      { label: 'Recycle Bin', icon: 'bin', action: () => OS.open('bin') },
    ] },
    { label: 'Documents', icon: 'doc', sub: [
      { label: 'Resume', icon: 'doc', action: () => OS.open('resume') },
      { label: 'Download Resume (PDF)', icon: 'floppy', action: () => OS.downloadResume() },
      { sep: true },
      { label: 'readme.txt', icon: 'notepad', action: () => OS.open('notepad', { file: 'readme.txt' }) },
      { label: 'do_not_open.txt', icon: 'notepad', action: () => OS.open('notepad', { file: 'do_not_open.txt' }) },
    ] },
    { label: 'Games', icon: 'joystick', sub: games },
    { label: 'My Profile', icon: 'user', sub: [
      { label: 'About Rory', icon: 'user', action: () => OS.open('about') },
      { label: 'Contact Rory', icon: 'mail', action: () => OS.open('contact') },
      { sep: true },
      { label: 'Your Visitor Profile', icon: 'star', action: () => OS.open('profile') },
    ] },
    { label: 'Recent Projects', icon: 'folder', sub: recentProjects },
    { label: 'Achievements', icon: 'trophy', action: () => OS.open('achievements') },
    { label: 'Quest Log', icon: 'quest', action: () => OS.open('quests') },
    { label: 'Settings', icon: 'gear', action: () => OS.open('settings') },
    { sep: true },
    { label: 'Shut Down...', icon: 'power', action: () => OS.shutdownDialog() },
  ];

  OS.startMenu = {
    install() {
      const btn = $('#start-btn');
      $('#start-logo').innerHTML = OS.icon('logo', 16);
      let isOpen = false;
      const setOpen = (on) => {
        isOpen = on;
        btn.classList.toggle('pressed', on);
        btn.setAttribute('aria-expanded', on);
      };
      const show = () => {
        OS.sound.play('click');
        const m = OS.menu.open(items, {
          rect: btn.getBoundingClientRect(),
          above: true,
          className: 'start',
          anchor: { el: btn, onMenuClose: () => setOpen(false) },
        });
        setOpen(true);
        return m;
      };
      btn.addEventListener('click', () => {
        if (isOpen) OS.menu.close();
        else show();
      });
      document.addEventListener('keydown', (e) => {
        // Ctrl+Esc is the classic shortcut. The Windows key belongs to the visitor's real OS.
        if (e.key === 'Escape' && e.ctrlKey) {
          e.preventDefault();
          if (isOpen) OS.menu.close();
          else $('.menu-item', show())?.focus();
        }
      });
    },
  };
})();
