/* Window manager: open, focus, drag, resize, minimize, maximize, close, taskbar sync. */
(() => {
  'use strict';
  const { $, $$, el, esc, clamp } = OS;
  const windows = new Map();
  let zTop = 100;
  let uid = 0;
  let cascade = 0;

  const desktop = () => $('#desktop');
  const area = () => { const r = desktop().getBoundingClientRect(); return { w: r.width, h: r.height }; };

  const syncDbg = (w) => {
    if (OS.state.settings.devMode) w.el.dataset.dbg = `${w.appId} z${w.el.style.zIndex}`;
  };

  const syncTaskbar = () => {
    const host = $('#task-buttons');
    host.innerHTML = '';
    for (const w of windows.values()) {
      const b = el(`<button type="button" class="tb-btn${w === wm.active && !w.minimized ? ' active' : ''}" aria-pressed="${w === wm.active && !w.minimized}" aria-label="${esc(w.title)}" data-tip="${esc(w.title)}">${OS.icon(w.icon, 16)}<span>${esc(w.title)}</span></button>`);
      b.addEventListener('click', () => {
        OS.sound.play('click');
        if (w === wm.active && !w.minimized) w.minimize();
        else w.restore();
      });
      b.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        OS.menu.open([
          { label: 'Restore', disabled: !w.minimized && !w.maximized, action: () => { if (w.minimized) w.restore(); else w.toggleMax(); } },
          { label: 'Minimize', disabled: w.minimized, action: () => w.minimize() },
          { label: 'Maximize', disabled: w.maximized || OS.isMobile(), action: () => { w.restore(); w.toggleMax(); } },
          { sep: true },
          { label: 'Close', action: () => w.close() },
        ], { x: e.clientX, y: e.clientY });
      });
      w.taskBtn = b;
      host.append(b);
    }
    // On phones the taskbar scrolls, so keep the active program in view.
    if (wm.active?.taskBtn) wm.active.taskBtn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  /** A wireframe rectangle flies between the window and its taskbar button. */
  const flyRect = (from, to) => {
    if (OS.reducedMotion() || OS.isMobile()) return;
    const g = el('<div style="position:fixed;border:2px solid #808080;z-index:14000;pointer-events:none"></div>');
    const set = (r) => Object.assign(g.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    set(from);
    document.body.append(g);
    const steps = 6;
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      const t = i / steps;
      set({
        left: from.left + (to.left - from.left) * t,
        top: from.top + (to.top - from.top) * t,
        width: from.width + (to.width - from.width) * t,
        height: from.height + (to.height - from.height) * t,
      });
      if (i >= steps) { clearInterval(iv); g.remove(); }
    }, 18);
  };

  class Win {
    constructor(appId, key, spec, args) {
      this.id = `w${++uid}`;
      this.appId = appId;
      this.key = key;
      this.spec = spec;
      this.icon = (typeof spec.icon === 'function' ? spec.icon(args) : spec.icon) || 'app';
      this.title = (typeof spec.title === 'function' ? spec.title(args) : spec.title) || appId;
      this.minimized = false;
      this.maximized = false;
      this.cleanups = [];
      this.build();
    }

    build() {
      const { spec } = this;
      const a = area();
      const w = Math.min(spec.w || 480, a.w - 8);
      const h = Math.min(spec.h || 360, a.h - 8);
      const step = cascade++ % 7;
      const left = clamp(50 + 110 + step * 24, 2, Math.max(2, a.w - w - 2));
      const top = clamp(20 + step * 24, 2, Math.max(2, a.h - h - 2));
      this.el = el(`<section class="window opening" role="dialog" aria-label="${esc(this.title)}" style="left:${left}px;top:${top}px;width:${w}px;height:${h}px">
        <header class="title-bar">${OS.icon(this.icon, 16)}<span class="title-text">${esc(this.title)}</span>
          <span class="title-btns">
            <button type="button" class="b-min" aria-label="Minimize" data-tip="Minimize"></button>
            ${spec.noMax ? '' : '<button type="button" class="b-max" aria-label="Maximize" data-tip="Maximize"></button>'}
            <button type="button" class="b-close" aria-label="Close" data-tip="Close"></button>
          </span></header>
        <div class="window-body"></div>
        ${spec.noResize ? '' : ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'].map((d) => `<div class="rz rz-${d}" data-dir="${d}"></div>`).join('')}
      </section>`);
      this.body = $('.window-body', this.el);
      this.titleEl = $('.title-text', this.el);
      this.tb = $('.title-bar', this.el);
      this.el.addEventListener('animationend', () => this.el.classList.remove('opening'), { once: true });

      $('.b-close', this.el).addEventListener('click', () => this.close());
      $('.b-min', this.el).addEventListener('click', () => this.minimize());
      $('.b-max', this.el)?.addEventListener('click', () => this.toggleMax());
      this.el.addEventListener('pointerdown', () => this.focus(), true);
      this.el.addEventListener('focusin', () => { if (wm.active !== this) this.focus(); });
      this.tb.addEventListener('dblclick', (e) => { if (!e.target.closest('button') && !spec.noMax && !OS.isMobile()) this.toggleMax(); });
      this.tb.addEventListener('pointerdown', (e) => this.startDrag(e));
      $$('.rz', this.el).forEach((r) => r.addEventListener('pointerdown', (e) => this.startResize(e, r.dataset.dir)));
      desktop().append(this.el);
    }

    startDrag(e) {
      if (e.target.closest('button') || e.button !== 0 || this.maximized || OS.isMobile()) return;
      e.preventDefault();
      const ox = e.clientX - this.el.offsetLeft;
      const oy = e.clientY - this.el.offsetTop;
      const tb = this.tb;
      tb.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const a = area();
        this.el.style.left = `${clamp(ev.clientX - ox, 80 - this.el.offsetWidth, a.w - 80)}px`;
        this.el.style.top = `${clamp(ev.clientY - oy, 0, a.h - 22)}px`;
      };
      const up = () => { tb.removeEventListener('pointermove', move); tb.removeEventListener('pointerup', up); tb.removeEventListener('pointercancel', up); };
      tb.addEventListener('pointermove', move);
      tb.addEventListener('pointerup', up);
      tb.addEventListener('pointercancel', up);
    }

    startResize(e, dir) {
      if (e.button !== 0 || this.maximized) return;
      e.preventDefault();
      const handle = e.target;
      handle.setPointerCapture(e.pointerId);
      const s = { x: e.clientX, y: e.clientY, l: this.el.offsetLeft, t: this.el.offsetTop, w: this.el.offsetWidth, h: this.el.offsetHeight };
      const minW = this.spec.minW || 220;
      const minH = this.spec.minH || 140;
      const move = (ev) => {
        const dx = ev.clientX - s.x;
        const dy = ev.clientY - s.y;
        let { l, t, w, h } = s;
        if (dir.includes('e')) w = Math.max(minW, s.w + dx);
        if (dir.includes('s')) h = Math.max(minH, s.h + dy);
        if (dir.includes('w')) { w = Math.max(minW, s.w - dx); l = s.l + s.w - w; }
        if (dir.includes('n')) { h = Math.max(minH, s.h - dy); t = Math.max(0, s.t + s.h - h); }
        Object.assign(this.el.style, { left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${h}px` });
        this.spec.onResize?.(this);
      };
      const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', up); };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
    }

    focus() {
      if (wm.active === this && !this.minimized) return;
      this.el.style.zIndex = ++zTop;
      if (wm.active) wm.active.el.classList.remove('active');
      wm.active = this;
      this.el.classList.add('active');
      syncDbg(this);
      syncTaskbar();
      this.spec.onFocus?.(this);
    }

    minimize() {
      if (this.minimized) return;
      const from = this.el.getBoundingClientRect();
      const to = this.taskBtn?.getBoundingClientRect() || from;
      flyRect(from, to);
      this.minimized = true;
      this.el.classList.add('minimized');
      this.el.classList.remove('active');
      if (wm.active === this) { wm.active = null; wm.focusTop(); }
      syncTaskbar();
      OS.sound.play('blip');
    }

    restore() {
      if (this.minimized) {
        this.minimized = false;
        this.el.classList.remove('minimized');
        flyRect(this.taskBtn?.getBoundingClientRect() || this.el.getBoundingClientRect(), this.el.getBoundingClientRect());
      }
      this.focus();
      syncTaskbar();
    }

    toggleMax() {
      this.maximized = !this.maximized;
      this.el.classList.toggle('maximized', this.maximized);
      const btn = $('.b-max', this.el);
      btn?.setAttribute('aria-label', this.maximized ? 'Restore' : 'Maximize');
      btn?.setAttribute('data-tip', this.maximized ? 'Restore' : 'Maximize');
      this.spec.onResize?.(this);
    }

    close() {
      if (this.closing) return;
      this.closing = true;
      this.cleanups.forEach((fn) => { try { fn(); } catch (err) { console.error(err); } });
      windows.delete(this.key);
      const done = () => this.el.remove();
      if (OS.reducedMotion()) done();
      else {
        this.el.classList.add('closing');
        setTimeout(done, 110);
      }
      if (wm.active === this) { wm.active = null; wm.focusTop(); }
      syncTaskbar();
      OS.sound.play('close');
    }

    setTitle(t) {
      this.title = t;
      this.titleEl.textContent = t;
      this.el.setAttribute('aria-label', t);
      syncTaskbar();
    }

    /** menus: [{label, items}] where items may be a function so tick marks stay current. */
    setMenu(menus) {
      $('.menubar', this.el)?.remove();
      const bar = el('<div class="menubar" role="menubar"></div>');
      menus.forEach((m) => {
        const b = el(`<button type="button" role="menuitem" aria-haspopup="menu">${esc(m.label)}</button>`);
        b.addEventListener('click', () => {
          b.classList.add('open');
          OS.menu.open(m.items, { rect: b.getBoundingClientRect(), anchor: { onMenuClose: () => b.classList.remove('open') } });
        });
        bar.append(b);
      });
      this.tb.after(bar);
    }

    setStatus(...cells) {
      let bar = $('.statusbar', this.el);
      if (!bar) {
        bar = el('<div class="statusbar" role="status"></div>');
        this.body.after(bar);
      }
      bar.innerHTML = cells.map((c) => `<span>${esc(c)}</span>`).join('');
    }

    /** Register cleanup for timers, listeners and animation loops. */
    onClose(fn) { this.cleanups.push(fn); }
  }

  const wm = {
    active: null,
    windows,

    open(appId, args) {
      const spec = OS.apps[appId];
      if (!spec) {
        OS.dialog({ title: 'RoryOS 98', icon: 'error', message: `Cannot find the program "${appId}".` });
        return null;
      }
      const key = spec.instanceKey ? `${appId}:${spec.instanceKey(args)}` : appId;
      const existing = windows.get(key);
      if (existing) {
        existing.restore();
        spec.onReopen?.(existing, args);
        return existing;
      }
      const w = new Win(appId, key, spec, args);
      windows.set(key, w);
      w.el.style.zIndex = ++zTop;
      try {
        spec.render(w, args);
      } catch (err) {
        console.error(err);
        OS.dialog({ title: w.title, icon: 'error', message: 'This program has performed an illegal operation and will be shut down. (Really: please tell Rory.)' });
      }
      wm.active?.el.classList.remove('active');
      wm.active = w;
      w.el.classList.add('active');
      syncDbg(w);
      syncTaskbar();
      OS.sound.play('open');
      OS.emit('app-open', { appId, args });
      return w;
    },

    focusTop() {
      let top = null;
      for (const w of windows.values()) {
        if (!w.minimized && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w;
      }
      if (top) top.focus();
      else syncTaskbar();
    },

    closeAll() { [...windows.values()].forEach((w) => w.close()); },
    minimizeAll() { [...windows.values()].forEach((w) => w.minimize()); },
    resync: syncTaskbar,
    get: (appId) => [...windows.values()].find((w) => w.appId === appId) || null,

    /** Keeps windows reachable after the browser resizes. */
    clampAll() {
      const a = area();
      for (const w of windows.values()) {
        if (w.maximized || w.minimized) continue;
        const e = w.el;
        if (e.offsetWidth > a.w) e.style.width = `${a.w}px`;
        if (e.offsetHeight > a.h) e.style.height = `${a.h}px`;
        e.style.left = `${clamp(e.offsetLeft, 80 - e.offsetWidth, a.w - 80)}px`;
        e.style.top = `${clamp(e.offsetTop, 0, Math.max(0, a.h - 22))}px`;
        w.spec.onResize?.(w);
      }
    },
  };

  OS.wm = wm;
  /** Shorthand used everywhere. */
  OS.open = (appId, args) => wm.open(appId, args);
  addEventListener('resize', () => wm.clampAll());
})();
