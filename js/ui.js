/* Shared widgets: menus, dialogs, tabs, icon grids, tooltips and sound. */
(() => {
  'use strict';
  const { $, $$, el, esc, clamp } = OS;

  /* ---------- Sound: synthesized with WebAudio, silent until switched on ---------- */
  let ctx = null;
  const tone = (freq, at, dur, type = 'square', vol = 0.04) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime + at);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime + at);
    o.stop(ctx.currentTime + at + dur + 0.02);
  };
  const SONGS = {
    click: [[880, 0, 0.03]],
    open: [[523, 0, 0.05], [784, 0.05, 0.07]],
    close: [[659, 0, 0.05], [392, 0.05, 0.07]],
    error: [[196, 0, 0.14], [147, 0.12, 0.22]],
    ding: [[988, 0, 0.1], [1319, 0.08, 0.2]],
    achieve: [[523, 0, 0.09], [659, 0.09, 0.09], [784, 0.18, 0.09], [1047, 0.27, 0.26]],
    levelup: [[392, 0, 0.1], [523, 0.1, 0.1], [659, 0.2, 0.1], [784, 0.3, 0.1], [1047, 0.4, 0.34]],
    startup: [[262, 0, 0.5, 'triangle', 0.07], [392, 0.14, 0.5, 'triangle', 0.07], [523, 0.28, 0.5, 'triangle', 0.07], [784, 0.42, 0.9, 'triangle', 0.07], [659, 0.42, 0.9, 'triangle', 0.05]],
    shutdown: [[784, 0, 0.4, 'triangle', 0.06], [523, 0.2, 0.4, 'triangle', 0.06], [392, 0.4, 0.4, 'triangle', 0.06], [262, 0.6, 0.9, 'triangle', 0.06]],
    hit: [[150, 0, 0.1, 'sawtooth', 0.05]],
    blip: [[660, 0, 0.04]],
  };
  OS.sound = {
    play(name) {
      if (!OS.state.settings.sound) return;
      try {
        ctx ||= new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        (SONGS[name] || []).forEach((n) => tone(...n));
      } catch (_) { /* audio unavailable: stay silent */ }
    },
    toggle(force) {
      OS.state.settings.sound = force ?? !OS.state.settings.sound;
      OS.save();
      OS.emit('settings');
      if (OS.state.settings.sound) OS.sound.play('ding');
      return OS.state.settings.sound;
    },
  };

  /* ---------- Menus ---------- */
  const open = []; // stack of open menu levels
  let anchorBtn = null;

  const closeFrom = (depth) => {
    while (open.length > depth) {
      const m = open.pop();
      m.el.remove();
      m.parentItem?.classList.remove('open');
    }
    if (depth === 0) {
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('keydown', onKey, true);
      const a = anchorBtn;
      anchorBtn = null;
      a?.onMenuClose?.();
    }
  };
  const outside = (e) => {
    if (e.target.closest('.menu')) return;
    if (anchorBtn && e.target.closest && anchorBtn.el?.contains(e.target)) return;
    closeFrom(0);
  };

  const onKey = (e) => {
    const level = open[open.length - 1];
    if (!level) return;
    const items = $$('.menu-item:not(:disabled)', level.el);
    const idx = items.indexOf(document.activeElement);
    const stop = () => { e.preventDefault(); e.stopPropagation(); };
    switch (e.key) {
      case 'ArrowDown': stop(); items[(idx + 1) % items.length]?.focus(); break;
      case 'ArrowUp': stop(); items[(idx - 1 + items.length) % items.length]?.focus(); break;
      case 'ArrowRight': if (document.activeElement?.classList.contains('has-sub')) { stop(); document.activeElement.click(); } break;
      case 'ArrowLeft': if (open.length > 1) { stop(); const p = level.parentItem; closeFrom(open.length - 1); p?.focus(); } break;
      case 'Escape': stop(); { const p = level.parentItem; closeFrom(open.length - 1); p?.focus(); } break;
      case 'Tab': stop(); closeFrom(0); break;
      default: break;
    }
  };

  const buildLevel = (items, opts, depth, parentItem) => {
    const m = el(`<div class="menu${opts.className ? ` ${opts.className}` : ''}" role="menu"></div>`);
    if (depth > 0) m.classList.remove('start');
    const list = typeof items === 'function' ? items() : items;
    list.filter(Boolean).forEach((it) => {
      if (it.sep) { m.append(el('<div class="menu-sep" role="separator"></div>')); return; }
      const tick = it.checked === undefined ? '' : `<span class="tick">${it.checked ? '&#10003;' : ''}</span>`;
      const b = el(`<button type="button" class="menu-item${it.sub ? ' has-sub' : ''}" role="menuitem"${it.disabled ? ' disabled' : ''}${it.sub ? ' aria-haspopup="menu"' : ''}>${it.icon ? OS.icon(it.icon, 16) : ''}${tick}<span>${OS.text(it.label)}</span></button>`);
      const showSub = () => {
        closeFrom(depth + 1);
        b.classList.add('open');
        const sub = buildLevel(it.sub, { className: '' }, depth + 1, b);
        document.body.append(sub);
        const r = b.getBoundingClientRect();
        const s = sub.getBoundingClientRect();
        let x = r.right - 3;
        if (x + s.width > innerWidth) x = Math.max(4, r.left - s.width + 3);
        if (OS.isMobile()) x = Math.max(4, Math.min(x, innerWidth - s.width - 4));
        const y = clamp(r.top - 3, 4, Math.max(4, innerHeight - s.height - 4));
        sub.style.left = `${x}px`;
        sub.style.top = `${y}px`;
        open.push({ el: sub, parentItem: b });
        return sub;
      };
      if (it.sub) {
        b.addEventListener('click', () => {
          const sub = showSub();
          if (document.activeElement === b) $('.menu-item:not(:disabled)', sub)?.focus();
        });
        if (!OS.singleTap()) b.addEventListener('pointerenter', () => { if (!b.classList.contains('open')) showSub(); });
      } else if (!it.disabled) {
        b.addEventListener('click', () => {
          closeFrom(0);
          OS.sound.play('click');
          it.action?.();
        });
        if (!OS.singleTap()) b.addEventListener('pointerenter', () => closeFrom(depth + 1));
      }
      m.append(b);
    });
    return m;
  };

  OS.menu = {
    /** items: [{label, icon, action, sub, sep, checked, disabled}] */
    open(items, { x, y, rect, className, anchor, above } = {}) {
      closeFrom(0);
      const m = buildLevel(items, { className }, 0, null);
      document.body.append(m);
      const s = m.getBoundingClientRect();
      let left = rect ? rect.left : x;
      let top = rect ? (above ? rect.top - s.height : rect.bottom) : y;
      left = clamp(left, 2, Math.max(2, innerWidth - s.width - 2));
      top = clamp(top, 2, Math.max(2, innerHeight - s.height - 2));
      m.style.left = `${left}px`;
      m.style.top = `${top}px`;
      open.push({ el: m, parentItem: null });
      anchorBtn = anchor || null;
      setTimeout(() => {
        document.addEventListener('pointerdown', outside, true);
        document.addEventListener('keydown', onKey, true);
      }, 0);
      return m;
    },
    close: () => closeFrom(0),
    isOpen: () => open.length > 0,
  };

  /* ---------- Dialogs ---------- */
  OS.dialog = ({ title = 'RoryOS 98', icon = 'info', message = '', html = null, buttons = ['OK'], sound = null, def = 0, cancel = null }) =>
    new Promise((resolve) => {
      const veil = el('<div class="modal-veil"></div>');
      const d = el(`<div class="window dialog active" role="alertdialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="title-bar"><span class="title-text">${esc(title)}</span><span class="title-btns"><button type="button" class="b-close" aria-label="Close"></button></span></div>
        <div class="dialog-main">${OS.icon(icon, 32)}<div class="dialog-msg"></div></div>
        <div class="dialog-btns"></div></div>`);
      const msg = $('.dialog-msg', d);
      if (html) msg.innerHTML = html; else msg.textContent = message;
      const prev = document.activeElement;
      const finish = (val) => {
        document.removeEventListener('keydown', onDlgKey, true);
        veil.remove();
        d.remove();
        prev?.focus?.();
        resolve(val);
      };
      const cancelVal = cancel ?? buttons[buttons.length - 1];
      const row = $('.dialog-btns', d);
      buttons.forEach((b, i) => {
        const btn = el(`<button type="button" class="btn${i === def ? ' default' : ''}">${esc(b)}</button>`);
        btn.addEventListener('click', () => { OS.sound.play('click'); finish(b); });
        row.append(btn);
      });
      $('.b-close', d).addEventListener('click', () => finish(cancelVal));
      const onDlgKey = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(cancelVal); }
        if (e.key === 'Tab') {
          const f = $$('button', d);
          const i = f.indexOf(document.activeElement);
          e.preventDefault();
          f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
      };
      document.addEventListener('keydown', onDlgKey, true);
      document.body.append(veil, d);
      if (!OS.isMobile()) {
        const r = d.getBoundingClientRect();
        d.style.left = `${Math.max(8, (innerWidth - r.width) / 2)}px`;
        d.style.top = `${Math.max(8, (innerHeight - r.height) / 2.4)}px`;
        // Dialogs can be dragged by their title bar too
        const tb = $('.title-bar', d);
        tb.addEventListener('pointerdown', (e) => {
          if (e.target.closest('button')) return;
          const ox = e.clientX - d.offsetLeft;
          const oy = e.clientY - d.offsetTop;
          tb.setPointerCapture(e.pointerId);
          const mv = (ev) => { d.style.left = `${ev.clientX - ox}px`; d.style.top = `${clamp(ev.clientY - oy, 0, innerHeight - 40)}px`; };
          const up = () => { tb.removeEventListener('pointermove', mv); tb.removeEventListener('pointerup', up); };
          tb.addEventListener('pointermove', mv);
          tb.addEventListener('pointerup', up);
        });
      }
      OS.sound.play(sound || (icon === 'error' ? 'error' : 'ding'));
      $(`.dialog-btns .btn:nth-child(${def + 1})`, d)?.focus();
    });

  /* ---------- Tabs ---------- */
  /** tabs: [{id, label, render(panel)}]. Panels render lazily and re-render when selected. */
  OS.ui = {};
  OS.ui.tabs = (host, tabs, { onChange, initial } = {}) => {
    const box = el('<div class="tabs"><div class="tablist" role="tablist"></div><div class="tabpanel" role="tabpanel" tabindex="0"></div></div>');
    const list = $('.tablist', box);
    const panel = $('.tabpanel', box);
    const select = (id, focus) => {
      const t = tabs.find((x) => x.id === id) || tabs[0];
      $$('.tab', list).forEach((b) => {
        const on = b.dataset.id === t.id;
        b.setAttribute('aria-selected', on);
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      panel.innerHTML = '';
      panel.scrollTop = 0;
      t.render(panel);
      onChange?.(t.id);
    };
    tabs.forEach((t) => {
      const b = el(`<button type="button" class="tab" role="tab" data-id="${esc(t.id)}">${esc(t.label)}</button>`);
      b.addEventListener('click', () => { OS.sound.play('click'); select(t.id); });
      list.append(b);
    });
    list.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = tabs.findIndex((t) => t.id === document.activeElement.dataset.id);
      const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      e.preventDefault();
      select(tabs[n].id, true);
    });
    host.append(box);
    select(initial || tabs[0].id);
    return { select };
  };

  /* ---------- Icon grid: select on click, open on double-click (one tap on touch) ---------- */
  OS.ui.iconGrid = (host, items, { onOpen, onSelect } = {}) => {
    const grid = el('<div class="icon-grid" role="list"></div>');
    items.forEach((it) => {
      const b = el(`<button type="button" class="g-item" role="listitem" ${it.tip ? `data-tip="${esc(it.tip)}"` : ''}>${OS.icon(it.icon, 32)}<span class="lbl">${OS.text(it.name)}</span></button>`);
      b.addEventListener('click', () => {
        $$('.g-item', grid).forEach((x) => x.classList.toggle('selected', x === b));
        onSelect?.(it);
        if (OS.singleTap()) { OS.sound.play('click'); onOpen?.(it); }
      });
      b.addEventListener('dblclick', () => { if (!OS.singleTap()) { OS.sound.play('click'); onOpen?.(it); } });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); onOpen?.(it); } });
      grid.append(b);
    });
    grid.addEventListener('pointerdown', (e) => { if (e.target === grid) $$('.g-item', grid).forEach((x) => x.classList.remove('selected')); });
    host.append(grid);
    return grid;
  };

  /* ---------- Tooltips: classic yellow, delegated ---------- */
  OS.ui.installTooltips = () => {
    const tip = $('#tooltip');
    let timer = 0;
    let current = null;
    const hide = () => { clearTimeout(timer); tip.hidden = true; current = null; };
    document.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      const t = e.target.closest?.('[data-tip]');
      if (t === current) return;
      hide();
      if (!t) return;
      current = t;
      const { clientX: x, clientY: y } = e;
      timer = setTimeout(() => {
        tip.textContent = t.dataset.tip;
        tip.hidden = false;
        const r = tip.getBoundingClientRect();
        tip.style.left = `${clamp(x + 8, 2, innerWidth - r.width - 2)}px`;
        tip.style.top = `${y + 20 + r.height > innerHeight ? y - r.height - 6 : y + 20}px`;
      }, 500);
    });
    document.addEventListener('pointerdown', hide, true);
    document.addEventListener('keydown', hide, true);
  };

  /* ---------- Details table used by file-style lists ---------- */
  OS.ui.bar = (pct, cls = '') => `<span class="progress ${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><span style="width:${clamp(pct, 0, 100)}%"></span></span>`;
})();
