/* Progression: XP, levels, one-time rewards, toast notifications, floppy disks. */
(() => {
  'use strict';
  const { $, el, esc } = OS;

  /** XP for each kind of action. A given key only ever pays out once, so there is nothing to farm. */
  const XP = { about: 10, job: 15, project: 20, skill: 10, game: 25, secret: 50, quest: 50, egg: 30, floppy: 10 };

  const LEVELS = [
    { n: 1, name: 'Guest User', xp: 0 },
    { n: 2, name: 'Desktop Explorer', xp: 100 },
    { n: 3, name: 'Power User', xp: 250 },
    { n: 4, name: 'Data Detective', xp: 500 },
    { n: 5, name: 'System Administrator', xp: 850 },
    { n: 6, name: 'Portfolio Legend', xp: 1250 },
  ];

  const FLOPPIES = {
    desktop: { name: 'WALLPAPER.DSK', where: 'Left lying on the desktop.' },
    recycle: { name: 'OLD_DISK.FLP', where: 'Rescued from the Recycle Bin.' },
    about: { name: 'CV_BACKUP.DSK', where: 'Hidden on the General tab of About Rory.' },
    secret: { name: 'CLASSIFIED.DSK', where: 'Stashed in the hidden folder.' },
    terminal: { name: 'FLOPPY.DSK', where: 'Read from the terminal with TYPE.' },
    clock: { name: 'TAPED_UP.DSK', where: 'Taped under the system clock.' },
    arcade: { name: 'HISCORE.DSK', where: 'Earned by clearing a Null Hunter table.' },
  };

  const levelFor = (xp) => {
    let cur = LEVELS[0];
    for (const l of LEVELS) if (xp >= l.xp) cur = l;
    const next = LEVELS[cur.n] || null;
    const pct = next ? ((xp - cur.xp) / (next.xp - cur.xp)) * 100 : 100;
    return { ...cur, next, pct };
  };

  /* ---------- Toasts ---------- */
  const toast = ({ title, name, desc, icon = 'info', ms = 5200 }) => {
    const host = $('#toasts');
    while (host.children.length >= 3) host.firstElementChild.remove();
    const t = el(`<div class="toast" role="status"><div class="toast-title"><span>${esc(title)}</span><button type="button" aria-label="Dismiss">x</button></div>
      <div class="toast-body">${OS.icon(icon, 32)}<div><b>${esc(name)}</b>${desc ? `<span>${esc(desc)}</span>` : ''}</div></div></div>`);
    const dismiss = () => {
      if (!t.isConnected) return;
      t.classList.add('leaving');
      setTimeout(() => t.remove(), OS.reducedMotion() ? 0 : 150);
    };
    $('button', t).addEventListener('click', dismiss);
    host.append(t);
    setTimeout(dismiss, ms);
  };

  const xpFloat = (amount) => {
    const host = $('#xp-floats');
    const f = el(`<div class="xp-float">+${amount} XP</div>`);
    f.style.bottom = `${host.children.length * 22}px`;
    host.append(f);
    setTimeout(() => f.remove(), 1500);
    const m = $('#xp-meter');
    m.classList.add('bump');
    setTimeout(() => m.classList.remove('bump'), 500);
  };

  /* ---------- Core ---------- */
  let evaluating = false;
  let dirty = false;

  const game = {
    XP, LEVELS, FLOPPIES, levelFor, toast,
    has: (flag) => !!OS.state.flags[flag],
    count: (prefix) => Object.keys(OS.state.flags).filter((k) => k.startsWith(prefix)).length,
    floppyCount: () => Object.keys(OS.state.floppies).length,
    floppyTotal: () => Object.keys(FLOPPIES).length,
    level: () => levelFor(OS.state.xp),

    /** Pays out once per key. Returns true the first time. */
    award(key, amount) {
      if (OS.state.rewarded[key]) return false;
      OS.state.rewarded[key] = amount;
      const before = levelFor(OS.state.xp);
      OS.state.xp += amount;
      const after = levelFor(OS.state.xp);
      xpFloat(amount);
      if (after.n > before.n) {
        OS.sound.play('levelup');
        toast({ title: 'Promotion', name: `Level ${after.n}: ${after.name}`, desc: 'Your account privileges have been upgraded.', icon: 'rocket' });
      }
      OS.save();
      OS.emit('change');
      return true;
    },

    /** Records that something happened. Safe to call repeatedly. */
    flag(name) {
      if (OS.state.flags[name]) return false;
      OS.state.flags[name] = Date.now();
      OS.save();
      game.evaluate();
      return true;
    },

    /** Records a rewarded action such as ('project', 'walmart'). */
    action(kind, id) {
      const name = `${kind}:${id}`;
      const isNew = game.flag(name);
      if (isNew && XP[kind]) game.award(name, XP[kind]);
      if (isNew) game.evaluate();
      return isNew;
    },

    egg(id) { return game.action('egg', id); },

    collectFloppy(id) {
      if (!FLOPPIES[id] || OS.state.floppies[id]) return false;
      OS.state.floppies[id] = Date.now();
      OS.sound.play('ding');
      toast({ title: 'Floppy disk found', name: FLOPPIES[id].name, desc: `${game.floppyCount()} of ${game.floppyTotal()} collected. Click the disk in the tray.`, icon: 'floppy' });
      game.award(`floppy:${id}`, XP.floppy);
      OS.save();
      OS.emit('change');
      game.evaluate();
      return true;
    },

    /** Runs achievements and quests until nothing new unlocks. */
    evaluate() {
      if (evaluating) { dirty = true; return; }
      evaluating = true;
      do {
        dirty = false;
        OS.achievements?.evaluate();
        OS.quests?.evaluate();
      } while (dirty);
      evaluating = false;
      OS.emit('change');
    },

    syncHud() {
      const lv = game.level();
      $('#xp-level').textContent = `Lv ${lv.n}`;
      $('#xp-fill').style.width = `${lv.pct}%`;
      const meter = $('#xp-meter');
      const tip = lv.next ? `${lv.name}: ${OS.state.xp} / ${lv.next.xp} XP` : `${lv.name}: ${OS.state.xp} XP. Maximum level.`;
      meter.dataset.tip = tip;
      meter.setAttribute('aria-label', tip);
      const fl = $('#tray-floppy');
      const n = game.floppyCount();
      fl.hidden = n === 0;
      fl.innerHTML = `${OS.icon('floppy', 16)}<span>${n}</span>`;
      fl.dataset.tip = `Disk Box: ${n} of ${game.floppyTotal()} floppy disks`;
      fl.setAttribute('aria-label', fl.dataset.tip);
    },
  };

  OS.game = game;
  OS.on('change', () => game.syncHud());
})();
