/* The desktop: icons, wallpaper, context menu, tray, boot, shutdown and full-screen gags. */
(() => {
  'use strict';
  const { $, $$, el, esc, clamp } = OS;

  const ICONS = [
    { id: 'computer', name: 'My Computer', icon: 'computer', tip: 'Browse the drives on this machine.' },
    { id: 'about', name: 'About Rory', icon: 'user', tip: 'Profile, education, interests and goals.' },
    { id: 'experience', name: 'Work Experience', icon: 'briefcase', tip: 'Interactive career timeline.' },
    { id: 'projects', name: 'Projects', icon: 'folder', tip: 'Explore Rory\'s projects.' },
    { id: 'skills', name: 'Skills', icon: 'chart', tip: 'Skills, with the evidence behind them.' },
    { id: 'resume', name: 'Resume', icon: 'doc', tip: 'Read or download the resume.' },
    { id: 'contact', name: 'Contact', icon: 'mail', tip: 'Email, LinkedIn and GitHub.' },
    { id: 'achievements', name: 'Achievements', icon: 'trophy', tip: 'Rory\'s achievements, and yours.' },
    { id: 'quests', name: 'Quest Log', icon: 'quest', tip: 'Objectives, progress and XP.' },
    { id: 'arcade', name: 'Arcade', icon: 'joystick', tip: 'Mini-games. Important work.' },
    { id: 'terminal', name: 'Terminal', icon: 'terminal', tip: 'Type HELP to begin.' },
    { id: 'readme', name: 'readme.txt', icon: 'notepad', app: 'notepad', args: { file: 'readme.txt' }, tip: 'Start here.' },
    { id: 'bin', name: 'Recycle Bin', icon: 'bin', tip: 'Rory\'s regrets.' },
  ];
  const HIDDEN_ICON = { id: 'secret', name: '~hidden', icon: 'secretfolder', hidden: true };

  const openIcon = (ic) => {
    OS.sound.play('click');
    OS.open(ic.app || ic.id, ic.args);
  };

  /* ---------- Layout ---------- */
  const CELL_W = 86;
  const CELL_H = 74;
  const layout = () => {
    if (OS.isMobile()) return;
    const d = $('#desktop').getBoundingClientRect();
    const rows = Math.max(1, Math.floor((d.height - 8) / CELL_H));
    ICONS.forEach((ic, i) => {
      const n = $(`.d-icon[data-id="${ic.id}"]`);
      const saved = OS.state.iconPositions[ic.id];
      const x = saved ? saved.x : 4 + Math.floor(i / rows) * CELL_W;
      const y = saved ? saved.y : 6 + (i % rows) * CELL_H;
      n.style.left = `${clamp(x, 0, d.width - 84)}px`;
      n.style.top = `${clamp(y, 0, d.height - 60)}px`;
    });
    const h = $('.d-icon[data-id="secret"]');
    if (h) {
      const saved = OS.state.iconPositions.secret;
      h.style.left = `${clamp(saved ? saved.x : d.width - 96, 0, d.width - 84)}px`;
      h.style.top = `${clamp(saved ? saved.y : Math.round(d.height * 0.55), 0, d.height - 60)}px`;
    }
  };

  const selectIcon = (node, additive) => {
    if (!additive) $$('.d-icon.selected').forEach((n) => n.classList.remove('selected'));
    node?.classList.add('selected');
  };

  /* ---------- Icon behaviour: select, drag, double-click ---------- */
  const makeIcon = (ic) => {
    const n = el(`<button type="button" class="d-icon${ic.hidden ? ' hidden-item' : ''}" data-id="${ic.id}" ${ic.tip ? `data-tip="${esc(ic.tip)}"` : ''} aria-label="${esc(ic.name)}">${OS.icon(ic.icon, 32)}<span class="lbl">${esc(ic.name)}</span></button>`);
    let drag = null;
    let didDrag = false;
    n.addEventListener('pointerdown', (e) => {
      didDrag = false;
      if (e.button !== 0 || OS.isMobile()) return;
      e.stopPropagation();
      selectIcon(n);
      drag = { sx: e.clientX, sy: e.clientY, ox: n.offsetLeft, oy: n.offsetTop, moved: false };
      n.setPointerCapture(e.pointerId);
    });
    n.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true;
      n.classList.add('dragging');
      const d = $('#desktop').getBoundingClientRect();
      n.style.left = `${clamp(drag.ox + dx, 0, d.width - 84)}px`;
      n.style.top = `${clamp(drag.oy + dy, 0, d.height - 60)}px`;
    });
    const end = () => {
      if (drag?.moved) {
        didDrag = true;
        OS.state.iconPositions[ic.id] = { x: n.offsetLeft, y: n.offsetTop };
        OS.save();
      }
      n.classList.remove('dragging');
      drag = null;
    };
    n.addEventListener('pointerup', end);
    n.addEventListener('pointercancel', end);
    n.addEventListener('click', (e) => {
      e.stopPropagation();
      if (didDrag) return;
      if (OS.singleTap()) { selectIcon(n); openIcon(ic); }
      else selectIcon(n);
    });
    n.addEventListener('dblclick', () => { if (!OS.singleTap() && !didDrag) openIcon(ic); });
    n.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); openIcon(ic); return; }
      const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const all = $$('.d-icon:not(.hidden-item)');
      const next = all[(all.indexOf(n) + dir + all.length) % all.length];
      selectIcon(next);
      next.focus();
    });
    n.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectIcon(n);
      const items = [
        { label: 'Open', action: () => openIcon(ic) },
        { sep: true },
        ic.id === 'bin' ? { label: 'Empty Recycle Bin', action: emptyBin } : null,
        ic.id === 'resume' ? { label: 'Download PDF', action: () => OS.downloadResume() } : null,
        { label: 'Properties', action: () => OS.dialog({ title: `${ic.name} Properties`, icon: ic.icon, message: `${ic.name}\n\nType: Application\nLocation: C:\\Desktop\n${ic.tip || 'Attributes: Hidden. Well, it was.'}` }) },
      ];
      OS.menu.open(items, { x: e.clientX, y: e.clientY });
    });
    return n;
  };

  const emptyBin = () => OS.dialog({ title: 'Confirm Delete', icon: 'warning', message: 'Rory has refused to let go of these files.\n\nThey may be needed for a future performance review.', buttons: ['Fair enough'] });

  /* ---------- Marquee selection ---------- */
  const installMarquee = () => {
    const desk = $('#desktop');
    desk.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.window, .d-icon, .desk-floppy') || e.button !== 0) return;
      selectIcon(null);
      if (OS.wm.active && !OS.isMobile()) { OS.wm.active.el.classList.remove('active'); OS.wm.active = null; OS.wm.resync(); }
      if (OS.isMobile()) return;
      const box = desk.getBoundingClientRect();
      const sx = e.clientX - box.left;
      const sy = e.clientY - box.top;
      const m = el('<div id="marquee"></div>');
      desk.append(m);
      desk.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const x = ev.clientX - box.left;
        const y = ev.clientY - box.top;
        const r = { l: Math.min(sx, x), t: Math.min(sy, y), w: Math.abs(x - sx), h: Math.abs(y - sy) };
        Object.assign(m.style, { left: `${r.l}px`, top: `${r.t}px`, width: `${r.w}px`, height: `${r.h}px` });
        $$('.d-icon').forEach((n) => {
          const hit = n.offsetLeft < r.l + r.w && n.offsetLeft + n.offsetWidth > r.l && n.offsetTop < r.t + r.h && n.offsetTop + n.offsetHeight > r.t;
          n.classList.toggle('selected', hit);
        });
      };
      const up = () => { m.remove(); desk.removeEventListener('pointermove', move); desk.removeEventListener('pointerup', up); desk.removeEventListener('pointercancel', up); };
      desk.addEventListener('pointermove', move);
      desk.addEventListener('pointerup', up);
      desk.addEventListener('pointercancel', up);
    });
  };

  /* ---------- Wallpapers, drawn to a small canvas and scaled up with crisp pixels ---------- */
  const paint = (w, h, fn) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    fn(c.getContext('2d'), w, h);
    return c.toDataURL('image/png');
  };
  const bands = (x, w, h, stops) => {
    const n = stops.length;
    const bh = h / n;
    stops.forEach((col, i) => {
      x.fillStyle = col;
      x.fillRect(0, Math.floor(i * bh), w, Math.ceil(bh));
      // Ordered dither into the next band, for that 256-colour look
      if (i < n - 1) {
        x.fillStyle = stops[i + 1];
        const y0 = Math.floor((i + 1) * bh) - 4;
        for (let yy = 0; yy < 4; yy++) for (let xx = (yy % 2) * 2; xx < w; xx += 4 - (yy > 1 ? 2 : 0)) x.fillRect(xx, y0 + yy, 1, 1);
      }
    });
  };
  const WALLPAPERS = {
    teal: { name: 'Classic Teal', css: () => ({ backgroundColor: '#008080', backgroundImage: 'none' }) },
    midnight: { name: 'Night Shift', css: () => ({ backgroundColor: '#000030', backgroundImage: `url(${paint(320, 200, (x, w, h) => {
      x.fillStyle = '#000030'; x.fillRect(0, 0, w, h);
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 150; i++) { x.fillStyle = rnd() > 0.8 ? '#ffffff' : '#8088c0'; x.fillRect(rnd() * w | 0, rnd() * h | 0, 1, 1); }
      x.fillStyle = '#e8e0a0'; x.beginPath(); x.arc(262, 40, 13, 0, 7); x.fill();
      x.fillStyle = '#000030'; x.beginPath(); x.arc(256, 36, 12, 0, 7); x.fill();
    })})` }) },
    dusk: { name: 'Caribbean Dusk', css: () => ({ backgroundColor: '#301858', backgroundImage: `url(${paint(320, 200, (x, w, h) => {
      bands(x, w, h, ['#201050', '#402070', '#703080', '#b04870', '#e87858', '#f8a848', '#f8d068', '#106078', '#0c4a60', '#083448']);
      x.fillStyle = '#ffe890';
      x.beginPath(); x.arc(160, 138, 26, Math.PI, 0); x.fill();
      // Palm silhouette
      x.fillStyle = '#100820';
      for (let i = 0; i < 46; i++) x.fillRect(58 + (i * i) / 150, 150 - i * 1.6, 3, 2);
      const tip = [72, 76];
      [[-22, -2], [-18, 9], [-10, 15], [14, 14], [24, 6], [22, -4], [6, -10], [-10, -9]].forEach(([dx, dy]) => {
        for (let t = 0; t <= 1; t += 0.05) x.fillRect(tip[0] + dx * t, tip[1] + dy * t + 7 * t * t, 3 - 2 * t, 2);
      });
      x.fillRect(0, 151, 120, 3); x.fillRect(0, 148, 92, 3);
    })})` }) },
    grid: { name: 'Graph Paper', css: () => ({ backgroundColor: '#006a6a', backgroundImage: `url(${paint(32, 32, (x, w, h) => {
      x.fillStyle = '#007272'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#008a8a'; for (let i = 0; i < 32; i += 8) { x.fillRect(i, 0, 1, h); x.fillRect(0, i, w, 1); }
      x.fillStyle = '#00a4a4'; x.fillRect(0, 0, w, 1); x.fillRect(0, 0, 1, h);
    })})`, backgroundSize: '32px 32px', backgroundRepeat: 'repeat', backgroundPosition: '0 0' }) },
    bars: { name: 'Quarterly Results', css: () => ({ backgroundColor: '#101828', backgroundImage: `url(${paint(320, 200, (x, w, h) => {
      x.fillStyle = '#101828'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#1c2840'; for (let y = 20; y < h; y += 20) x.fillRect(0, y, w, 1);
      const vals = [40, 62, 54, 80, 72, 98, 90, 118, 110, 138, 128, 160];
      vals.forEach((v, i) => {
        const bx = 16 + i * 25;
        x.fillStyle = '#208080'; x.fillRect(bx, h - v - 6, 18, v);
        x.fillStyle = '#40d0c0'; x.fillRect(bx, h - v - 6, 18, 2);
      });
    })})` }) },
  };
  const cachedCss = {};
  const wallCss = (id) => (cachedCss[id] ||= (WALLPAPERS[id] || WALLPAPERS.teal).css());

  OS.desktop = {
    wallpapers: WALLPAPERS,
    wallCss,
    setWallpaper(id, user = true) {
      if (!WALLPAPERS[id]) id = 'teal';
      const w = $('#wallpaper');
      w.removeAttribute('style');
      Object.assign(w.style, wallCss(id));
      const prev = OS.state.settings.wallpaper;
      OS.state.settings.wallpaper = id;
      OS.save();
      if (user && prev !== id) OS.game.flag('wallpaper:changed');
    },
    refresh() {
      const icons = $$('.d-icon');
      icons.forEach((n) => n.classList.add('flash'));
      setTimeout(() => icons.forEach((n) => n.classList.remove('flash')), 130);
      layout();
      OS.state.bests.refreshes = (OS.state.bests.refreshes || 0) + 1;
      OS.save();
      if (OS.state.bests.refreshes >= 5) OS.game.egg('refresh');
    },
    setShowHidden(on) {
      OS.state.settings.showHidden = on;
      document.body.classList.toggle('show-hidden', on);
      OS.save();
      OS.emit('settings');
    },
    layout,
  };

  const contextMenu = (e) => {
    if (e.target.closest('.window')) return;
    e.preventDefault();
    const s = OS.state.settings;
    OS.menu.open([
      { label: 'Arrange Icons', action: () => { OS.state.iconPositions = {}; OS.save(); layout(); } },
      { label: 'Refresh', action: () => OS.desktop.refresh() },
      { sep: true },
      { label: 'Show Hidden Files', checked: !!s.showHidden, action: () => OS.desktop.setShowHidden(!s.showHidden) },
      { label: 'Wallpaper', sub: () => Object.entries(WALLPAPERS).map(([id, w]) => ({ label: w.name, checked: OS.state.settings.wallpaper === id, action: () => OS.desktop.setWallpaper(id) })) },
      { label: 'New', sub: [
        { label: 'Text Document', icon: 'notepad', action: () => OS.open('notepad', {}) },
        { label: 'Terminal', icon: 'terminal', action: () => OS.open('terminal') },
      ] },
      { sep: true },
      { label: 'Minimize All Windows', action: () => OS.wm.minimizeAll() },
      { label: 'Properties', action: () => OS.open('settings') },
    ], { x: e.clientX, y: e.clientY });
  };

  /* ---------- Tray ---------- */
  const flashTip = (text, node) => {
    const tip = $('#tooltip');
    tip.textContent = text;
    tip.hidden = false;
    const r = node.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    tip.style.left = `${clamp(r.right - t.width, 2, innerWidth - t.width - 2)}px`;
    tip.style.top = `${r.top - t.height - 4}px`;
    clearTimeout(flashTip.t);
    flashTip.t = setTimeout(() => { tip.hidden = true; }, 1800);
  };
  const installTray = () => {
    const clock = $('#tray-clock');
    const tick = () => {
      const now = new Date();
      clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      clock.setAttribute('aria-label', `System clock: ${clock.textContent}`);
    };
    tick();
    setInterval(tick, 5000);
    let clicks = 0;
    let lastClick = 0;
    clock.addEventListener('click', () => {
      const now = Date.now();
      clicks = now - lastClick < 1500 ? clicks + 1 : 1;
      lastClick = now;
      flashTip(new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), clock);
      if (clicks >= 5) { clicks = 0; OS.game.collectFloppy('clock'); }
    });
    const snd = $('#tray-sound');
    const syncSound = () => {
      const on = OS.state.settings.sound;
      snd.innerHTML = OS.icon(on ? 'speaker' : 'speakeroff', 16);
      snd.dataset.tip = on ? 'Sound on. Click to mute.' : 'Sound off. Click to turn on.';
      snd.setAttribute('aria-pressed', on);
    };
    syncSound();
    OS.on('settings', syncSound);
    snd.addEventListener('click', () => OS.sound.toggle());
    $('#tray-floppy').addEventListener('click', () => OS.open('diskbox'));
    $('#xp-meter').addEventListener('click', () => OS.open('profile'));
    OS.game.syncHud();
  };

  const installTaskbarMenu = () => {
    $('#taskbar').addEventListener('contextmenu', (e) => {
      if (e.target.closest('#task-buttons .tb-btn')) return;
      e.preventDefault();
      OS.menu.open([
        { label: 'Minimize All Windows', action: () => OS.wm.minimizeAll() },
        { label: 'Close All Windows', action: () => OS.wm.closeAll() },
        { sep: true },
        { label: 'Control Panel', action: () => OS.open('settings') },
      ], { x: e.clientX, y: e.clientY });
    });
  };

  /* ---------- Full-screen sequences ---------- */
  const fsRoot = () => $('#fullscreen-root');

  /** Runs on every load unless a deep link skips it. Any key or click skips. */
  OS.boot = (quick = false) =>
    new Promise((resolve) => {
      const s = el('<div class="fs-screen" role="status" aria-label="RoryOS 98 is starting"><div class="boot-bios"></div><button type="button" class="boot-skip">Skip intro</button></div>');
      fsRoot().append(s);
      const bios = $('.boot-bios', s);
      let finished = false;
      const timers = [];
      const later = (fn, ms) => timers.push(setTimeout(fn, ms));
      const finish = () => {
        if (finished) return;
        finished = true;
        timers.forEach(clearTimeout);
        document.removeEventListener('keydown', finish);
        s.remove();
        resolve();
      };
      $('.boot-skip', s).addEventListener('click', finish);
      s.addEventListener('pointerdown', (e) => { if (!e.target.closest('button')) finish(); });
      document.addEventListener('keydown', finish);
      if (OS.reducedMotion()) { later(finish, 300); return; }

      const splash = (delay) => later(() => {
        const sp = el(`<div class="boot-splash">
          <div class="boot-logo">${OS.icon('logo', 72)}<h1>RoryOS<sup>98</sup></h1></div>
          <div class="boot-tag">Business Intelligence Edition</div>
          ${OS.ui.bar(0)}
          <div class="boot-status">Starting up...</div></div>`);
        s.insertBefore(sp, $('.boot-skip', s));
        const fill = $('.progress > span', sp);
        const status = $('.boot-status', sp);
        OS.sound.play('startup');
        const msgs = ['Loading career history...', 'Indexing projects...', 'Hiding floppy disks...', 'Welcome.'];
        msgs.forEach((m, i) => later(() => { status.textContent = m; fill.style.width = `${((i + 1) / msgs.length) * 100}%`; }, 80 + i * 280));
        later(finish, 1300);
      }, delay);

      if (quick) { splash(0); return; }
      const mem = (OS.isMobile() ? 16384 : 65536);
      const lines = [
        'RORY BIOS (C) 1998 Rampersad Megatrends Inc.',
        'Rev. 4.10 / University of Waterloo Math Co-Processor detected',
        '',
        `Memory Test: ${mem}K OK`,
        'Detecting SQL Server ........ OK',
        'Detecting Power BI .......... OK',
        'Detecting Python, R ......... OK',
        'Floppy drive A: ............. 7 disks missing',
        '',
        'Booting RoryOS 98...',
      ];
      lines.forEach((l, i) => later(() => { bios.textContent += `${l}\n`; }, 40 + i * 110));
      splash(40 + lines.length * 110 + 60);
    });

  const showShutdown = () => {
    const s = el(`<div class="fs-screen"><div class="shutdown"><div>It is now safe to close this tab.<small><br>Thanks for visiting. Rory is still reachable at ${esc(OS.data.contact.email)}.</small></div><button type="button" class="btn">Restart RoryOS</button></div></div>`);
    fsRoot().append(s);
    const btn = $('button', s);
    btn.focus();
    btn.addEventListener('click', async () => {
      s.remove();
      await OS.boot(true);
      OS.game.flag('restarted');
    });
  };

  OS.shutdownDialog = async () => {
    const choice = await OS.dialog({
      title: 'Shut Down RoryOS',
      icon: 'power',
      message: 'What do you want the computer to do?\n\nYour progress is saved either way.',
      buttons: ['Shut Down', 'Restart', 'Cancel'],
      cancel: 'Cancel',
      sound: 'ding',
    });
    if (choice === 'Cancel') return;
    OS.wm.closeAll();
    if (choice === 'Restart') {
      await OS.boot(true);
      OS.game.flag('restarted');
      return;
    }
    OS.sound.play('shutdown');
    const wait = el('<div class="fs-screen"><div class="shutting">Please wait while your computer shuts down...</div></div>');
    fsRoot().append(wait);
    await OS.wait(OS.reducedMotion() ? 50 : 900);
    wait.remove();
    showShutdown();
  };

  /** A gag crash screen, reached via FORMAT C: in the terminal. */
  OS.crash = () => {
    const s = el(`<div class="fs-screen" tabindex="-1"><div class="crash"><div>
      <h2> RoryOS </h2>
      <p>A fatal exception 0xDA7A has occurred at RORY:SQL_SERVER. Drive C: has been formatted.</p><br>
      <p>Just kidding. You cannot format a static website. Everything is exactly where you left it.</p><br>
      <p>* Press any key to return to the desktop.</p>
      <p>* Press CTRL+ALT+DEL to also do that. There is really only one option here.</p>
    </div></div></div>`);
    fsRoot().append(s);
    OS.sound.play('error');
    const close = () => {
      document.removeEventListener('keydown', close, true);
      s.remove();
      OS.game.egg('crash');
    };
    setTimeout(() => {
      document.addEventListener('keydown', close, true);
      s.addEventListener('pointerdown', close);
    }, 300);
  };

  /** Falling green text, reached via MATRIX in the terminal. */
  OS.matrix = () => {
    const s = el('<div class="fs-screen"><canvas class="matrix-canvas" aria-hidden="true"></canvas><div class="matrix-hint">Press any key or tap to return</div></div>');
    fsRoot().append(s);
    const c = $('canvas', s);
    const x = c.getContext('2d');
    const FS = 14;
    const CH = 'SELECT*FROMWHEREJOIN01NULLETLDAXKPI{}<>=+-'.split('');
    let drops = [];
    const size = () => {
      c.width = innerWidth;
      c.height = innerHeight;
      drops = Array.from({ length: Math.ceil(c.width / FS) }, () => (Math.random() * -40) | 0);
    };
    size();
    let raf = 0;
    let last = 0;
    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      if (t - last < 55) return;
      last = t;
      x.fillStyle = 'rgba(0,0,0,.09)';
      x.fillRect(0, 0, c.width, c.height);
      x.font = `${FS}px monospace`;
      drops.forEach((d, i) => {
        x.fillStyle = Math.random() > 0.96 ? '#d0ffd0' : '#20e040';
        x.fillText(CH[(Math.random() * CH.length) | 0], i * FS, d * FS);
        drops[i] = d * FS > c.height && Math.random() > 0.97 ? 0 : d + 1;
      });
    };
    raf = requestAnimationFrame(frame);
    addEventListener('resize', size);
    const close = () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', size);
      document.removeEventListener('keydown', close, true);
      s.remove();
      OS.game.egg('matrix');
    };
    setTimeout(() => {
      document.addEventListener('keydown', close, true);
      s.addEventListener('pointerdown', close);
    }, 300);
  };

  /* ---------- Build ---------- */
  OS.desktop.install = () => {
    const host = $('#icons');
    ICONS.forEach((ic) => host.append(makeIcon(ic)));
    host.append(makeIcon(HIDDEN_ICON));
    layout();
    addEventListener('resize', layout);

    if (!OS.state.floppies.desktop) {
      const fl = el(`<button type="button" class="desk-floppy" aria-label="A floppy disk">${OS.icon('floppy', 16)}</button>`);
      fl.addEventListener('click', (e) => {
        e.stopPropagation();
        OS.game.collectFloppy('desktop');
        fl.remove();
      });
      $('#desktop').append(fl);
      OS.on('reset', () => { if (!fl.isConnected) $('#desktop').append(fl); });
    }

    $('#desktop').addEventListener('contextmenu', contextMenu);
    installMarquee();
    installTray();
    installTaskbarMenu();
    document.body.classList.toggle('show-hidden', !!OS.state.settings.showHidden);
    OS.desktop.setWallpaper(OS.state.settings.wallpaper, false);
  };
})();
