/* RoryOS 98 kernel: namespace, helpers, event bus, saved state. Plain scripts, so the site also runs from file://. */
(() => {
  'use strict';
  const OS = (window.OS = { apps: {}, version: '4.10.1998' });

  OS.$ = (sel, root = document) => root.querySelector(sel);
  OS.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  OS.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /** Escapes text and highlights any [PLACEHOLDER: ...] marker so unfinished content is obvious. */
  OS.text = (s) => OS.esc(s).replace(/\[PLACEHOLDER:[^\]]*\]/g, (m) => `<mark class="ph">${m}</mark>`);
  OS.el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  OS.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  OS.isMobile = () => matchMedia('(max-width: 720px), (max-height: 480px)').matches;
  /** Touch devices and phones open things on one tap; a mouse uses select + double-click. */
  OS.singleTap = () => OS.isMobile() || matchMedia('(hover: none) and (pointer: coarse)').matches;
  OS.reducedMotion = () => document.body.classList.contains('reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  OS.wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Event bus
  const listeners = {};
  OS.on = (name, fn) => { (listeners[name] ||= []).push(fn); return () => { listeners[name] = listeners[name].filter((f) => f !== fn); }; };
  OS.emit = (name, data) => (listeners[name] || []).slice().forEach((fn) => fn(data));

  // Saved state
  const KEY = 'roryos98.v1';
  const fresh = () => ({
    xp: 0,
    rewarded: {},
    flags: {},
    achievements: {},
    floppies: {},
    quests: {},
    bests: {},
    iconPositions: {},
    recent: [],
    notes: '',
    settings: { sound: false, reduceMotion: false, wallpaper: 'teal', welcome: true, devMode: false },
  });
  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && typeof raw === 'object') {
        const base = fresh();
        return { ...base, ...raw, settings: { ...base.settings, ...(raw.settings || {}) } };
      }
    } catch (_) { /* storage blocked or corrupt: run from memory */ }
    return fresh();
  };
  OS.state = load();
  let saveTimer = 0;
  OS.save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(OS.saveNow, 120);
  };
  OS.saveNow = () => {
    clearTimeout(saveTimer);
    try { localStorage.setItem(KEY, JSON.stringify(OS.state)); } catch (_) { /* private mode: progress lasts for the session */ }
  };
  OS.resetProgress = () => {
    const keep = { wallpaper: OS.state.settings.wallpaper, sound: OS.state.settings.sound, reduceMotion: OS.state.settings.reduceMotion };
    OS.state = fresh();
    Object.assign(OS.state.settings, keep);
    OS.saveNow();
    OS.emit('reset');
    OS.emit('change');
  };
  addEventListener('pagehide', () => OS.saveNow());

  OS.paths = {
    resume: 'assets/resume/Rory_Rampersad_Resume.pdf',
  };
})();
