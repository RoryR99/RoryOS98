/* Arcade: Null Hunter, Data Detective Quiz, Reaction Test, Query Catcher and the Konami pad. */
(() => {
  'use strict';
  const { $, $$, el, esc, clamp, apps } = OS;
  const G = () => OS.game;
  const bests = () => OS.state.bests;
  const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

  /* ---------- Arcade launcher ---------- */
  apps.arcade = {
    title: 'Arcade', icon: 'joystick', w: 560, h: 450, minW: 290,
    render(win) {
      const root = el('<div class="grow scroll"></div>');
      win.body.append(root);
      const draw = () => {
        const b = bests();
        const unlocked = G().has('egg:konami');
        const cabs = [
          { id: 'hunter', icon: 'bug', name: 'Null Hunter', desc: 'A table full of records, some of them bad. Use the numbers to clear it without opening a NULL.', best: b.hunter ? `Best: ${Object.entries(b.hunter).map(([k, v]) => `${k} ${v}s`).join(', ')}` : '' },
          { id: 'quiz', icon: 'brain', name: 'Data Detective Quiz', desc: 'SQL, Python, analytics and BI questions at three difficulty levels.', best: b.quiz ? `Best: ${Object.entries(b.quiz).map(([k, v]) => `${k} ${v}/5`).join(', ')}` : '' },
          { id: 'reaction', icon: 'bolt', name: 'Reaction Test', desc: 'Wait for the signal, then click as fast as you can.', best: b.reaction ? `Best: ${b.reaction} ms` : '' },
          { id: 'terminal', args: { challenge: true }, icon: 'db', name: 'Terminal Challenge', desc: 'Crack five cases by writing real SQL against Rory\'s career data.', best: G().has('game:challenge') ? 'Solved' : '' },
          unlocked
            ? { id: 'catcher', icon: 'star', name: 'Query Catcher', desc: 'Bonus game. Catch clean rows, dodge the NULLs.', best: b.catcher ? `Best: ${b.catcher}` : '' }
            : { id: null, icon: 'lock', name: '??????', desc: 'Locked. Some codes never go out of style.' },
        ];
        root.innerHTML = `<div class="arcade-grid">${cabs.map((c, i) => `<button type="button" class="cab" data-i="${i}" ${c.id ? '' : 'disabled'}>${OS.icon(c.icon, 32)}<span><b>${esc(c.name)}</b><small>${esc(c.desc)}</small>${c.best ? `<small class="best">${esc(c.best)}</small>` : ''}</span></button>`).join('')}</div>
          <div class="pad-row"><fieldset class="group"><legend>Game pad</legend><div>No keyboard? Enter secret codes here.</div>
            <div class="konami-pad" aria-label="Directional game pad">${[['Up', '&#9650;', 'ArrowUp'], ['Down', '&#9660;', 'ArrowDown'], ['Left', '&#9664;', 'ArrowLeft'], ['Right', '&#9654;', 'ArrowRight'], ['B', 'B', 'b'], ['A', 'A', 'a']].map(([n, g, k]) => `<button type="button" class="btn" aria-label="${n}" data-k="${k}">${g}</button>`).join('')}</div></fieldset></div>`;
        $$('.cab', root).forEach((n) => n.addEventListener('click', () => {
          const c = cabs[+n.dataset.i];
          if (c.id) OS.open(c.id, c.args);
        }));
        $$('[data-k]', root).forEach((n) => n.addEventListener('click', () => { OS.sound.play('blip'); OS.feedKonami(n.dataset.k); }));
      };
      win.onClose(OS.on('change', () => {
        if (!root.contains(document.activeElement)) draw();
      }));
      draw();
    },
  };

  /* ---------- Konami ---------- */
  const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let seqPos = 0;
  OS.feedKonami = (key) => {
    const k = key.length === 1 ? key.toLowerCase() : key;
    if (k === SEQ[seqPos]) seqPos += 1;
    else seqPos = k === SEQ[0] ? 1 : 0;
    if (seqPos === SEQ.length) {
      seqPos = 0;
      OS.sound.play('levelup');
      G().egg('konami');
      OS.open('vault');
    }
  };

  /* ---------- Null Hunter: logic deduction over a table of records ---------- */
  const LEVELS = { Easy: { c: 9, r: 9, n: 10 }, Medium: { c: 12, r: 12, n: 24 }, Hard: { c: 12, r: 16, n: 40 } };

  apps.hunter = {
    title: 'Null Hunter', icon: 'bug', w: 410, h: 490, minW: 280, minH: 300,
    onResize(win) { win.fit?.(); },
    render(win) {
      const root = el(`<div class="nh"><div class="nh-head">
          <div class="lcd"><small>BAD RECORDS</small><span class="nh-left">0</span></div>
          <div class="btn-row"><button type="button" class="btn small nh-new">Re-run</button><button type="button" class="btn small nh-mode" aria-pressed="false">Mode: Inspect</button></div>
          <div class="lcd"><small>SECONDS</small><span class="nh-time">0</span></div>
        </div><div class="nh-board" role="grid" aria-label="Null Hunter board"></div><div class="nh-msg" role="status"></div></div>`);
      win.body.append(root);
      const board = $('.nh-board', root);
      const msg = $('.nh-msg', root);
      const leftEl = $('.nh-left', root);
      const timeEl = $('.nh-time', root);
      const modeBtn = $('.nh-mode', root);
      let level = 'Easy';
      let g = null;
      let timer = 0;
      let flagMode = false;

      const neighbours = (i) => {
        const { c, r } = LEVELS[level];
        const x = i % c;
        const y = Math.floor(i / c);
        const out = [];
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < c && ny >= 0 && ny < r) out.push(ny * c + nx);
        }
        return out;
      };

      const stopTimer = () => { clearInterval(timer); timer = 0; };
      win.onClose(stopTimer);

      const fit = () => {
        const { c, r } = LEVELS[level];
        const w = root.clientWidth - 22;
        const h = root.clientHeight - 100;
        const size = Math.floor(clamp(Math.min(w / c, Math.max(h / r, 24)), 20, OS.isMobile() ? 36 : 30));
        board.style.setProperty('--cell', `${size}px`);
      };
      win.fit = fit;

      const place = (safe) => {
        const { c, r, n } = LEVELS[level];
        const banned = new Set([safe, ...neighbours(safe)]);
        const spots = shuffle([...Array(c * r).keys()].filter((i) => !banned.has(i))).slice(0, n);
        spots.forEach((i) => { g.bad[i] = true; });
        for (let i = 0; i < c * r; i++) g.count[i] = neighbours(i).filter((j) => g.bad[j]).length;
        g.placed = true;
      };

      const paint = (i) => {
        const b = g.cells[i];
        if (g.open[i]) {
          b.classList.add('open');
          b.removeAttribute('data-n');
          if (g.bad[i]) { b.innerHTML = OS.icon('bug'); b.setAttribute('aria-label', 'Bad record'); }
          else {
            const n = g.count[i];
            b.textContent = n || '';
            if (n) b.dataset.n = n;
            b.setAttribute('aria-label', n ? `${n} nearby` : 'Clean');
          }
        } else if (g.flag[i]) { b.innerHTML = OS.icon('ticket'); b.setAttribute('aria-label', 'Flagged'); }
        else { b.textContent = ''; b.setAttribute('aria-label', 'Unchecked record'); }
      };

      const updateLeft = () => { leftEl.textContent = LEVELS[level].n - g.flag.filter(Boolean).length; };

      const finish = (won, hit) => {
        g.over = true;
        stopTimer();
        const { n, c, r } = LEVELS[level];
        for (let i = 0; i < c * r; i++) {
          if (g.bad[i] && !g.flag[i] && won) { g.flag[i] = true; paint(i); }
          if (g.bad[i] && !won) { g.open[i] = true; paint(i); }
        }
        if (won) {
          leftEl.textContent = 0;
          OS.sound.play('achieve');
          const b = (bests().hunter ||= {});
          const best = !b[level] || g.time < b[level];
          if (best) { b[level] = g.time; OS.save(); }
          msg.textContent = `Table clean: ${n} bad records found in ${g.time}s.${best ? ' New personal best.' : ''}`;
          G().action('game', 'hunter');
          G().collectFloppy('arcade');
        } else {
          OS.sound.play('error');
          g.cells[hit].classList.add('boom');
          msg.textContent = 'You opened a bad record. The dashboard is now wrong. Re-run?';
        }
      };

      const reveal = (start) => {
        const stack = [start];
        while (stack.length) {
          const i = stack.pop();
          if (g.open[i] || g.flag[i]) continue;
          g.open[i] = true;
          paint(i);
          if (!g.bad[i] && g.count[i] === 0) stack.push(...neighbours(i));
        }
      };

      const cleared = () => g.open.every((o, i) => o || g.bad[i]);

      const inspect = (i) => {
        if (g.over || g.flag[i]) return;
        if (!g.placed) {
          place(i);
          timer = setInterval(() => { if (win.minimized) return; g.time += 1; timeEl.textContent = g.time; }, 1000);
        }
        if (g.open[i]) {
          // Clicking an opened number with enough flags nearby clears the rest
          const near = neighbours(i);
          if (g.count[i] > 0 && near.filter((j) => g.flag[j]).length === g.count[i]) {
            near.forEach((j) => { if (!g.flag[j] && !g.open[j]) { if (g.bad[j]) { g.open[j] = true; finish(false, j); } else reveal(j); } });
            if (!g.over && cleared()) finish(true);
          }
          return;
        }
        if (g.bad[i]) { g.open[i] = true; paint(i); finish(false, i); return; }
        OS.sound.play('blip');
        reveal(i);
        if (cleared()) finish(true);
      };

      const flag = (i) => {
        if (g.over || g.open[i]) return;
        g.flag[i] = !g.flag[i];
        paint(i);
        updateLeft();
        OS.sound.play('click');
      };

      const newGame = () => {
        stopTimer();
        const { c, r } = LEVELS[level];
        const total = c * r;
        g = { bad: Array(total).fill(false), count: Array(total).fill(0), open: Array(total).fill(false), flag: Array(total).fill(false), cells: [], placed: false, over: false, time: 0 };
        OS.games.hunter = { get state() { return g; }, inspect, flag };
        timeEl.textContent = 0;
        msg.textContent = OS.singleTap() ? 'Tap to inspect. Hold, or switch mode, to flag a bad record.' : 'Left-click to inspect. Right-click to flag a bad record.';
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${c}, var(--cell))`;
        for (let i = 0; i < total; i++) {
          const b = el('<button type="button" class="nh-cell" role="gridcell"></button>');
          let hold = 0;
          let held = false;
          b.addEventListener('pointerdown', (e) => {
            held = false;
            if (e.pointerType === 'touch') hold = setTimeout(() => { held = true; flag(i); navigator.vibrate?.(15); }, 380);
          });
          const cancel = () => clearTimeout(hold);
          b.addEventListener('pointerup', cancel);
          b.addEventListener('pointercancel', cancel);
          b.addEventListener('pointerleave', cancel);
          b.addEventListener('click', () => { if (held) return; if (flagMode) flag(i); else inspect(i); });
          b.addEventListener('contextmenu', (e) => { e.preventDefault(); if (!held) flag(i); });
          b.addEventListener('keydown', (e) => {
            const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: c, ArrowUp: -c }[e.key];
            if (step) { e.preventDefault(); g.cells[clamp(i + step, 0, total - 1)].focus(); }
            if (e.key === 'f' || e.key === 'F') flag(i);
          });
          g.cells.push(b);
          paint(i);
          board.append(b);
        }
        updateLeft();
        fit();
        win.setStatus(`${level}: ${c} x ${r}, ${LEVELS[level].n} bad records`, bests().hunter?.[level] ? `Best: ${bests().hunter[level]}s` : 'No best yet');
      };

      $('.nh-new', root).addEventListener('click', newGame);
      modeBtn.addEventListener('click', () => {
        flagMode = !flagMode;
        modeBtn.textContent = `Mode: ${flagMode ? 'Flag' : 'Inspect'}`;
        modeBtn.setAttribute('aria-pressed', flagMode);
        modeBtn.classList.toggle('pressed', flagMode);
      });
      win.setMenu([{ label: 'Game', items: () => [
        { label: 'New Run', action: newGame },
        { sep: true },
        ...Object.keys(LEVELS).map((k) => ({ label: k, checked: level === k, action: () => { level = k; newGame(); } })),
        { sep: true },
        { label: 'How to Play', action: () => OS.dialog({ title: 'Null Hunter', icon: 'bug', message: 'Some records in this table are bad.\n\nInspect a record: a number tells you how many of its eight neighbours are bad. Use the numbers to flag every bad record and open all the clean ones.\n\nInspect a bad record and the run is over. Your first click is always safe.' }) },
        { label: 'Exit', action: () => win.close() },
      ] }]);
      newGame();
      requestAnimationFrame(fit);
    },
  };

  /* ---------- Data Detective Quiz ---------- */
  apps.quiz = {
    title: 'Data Detective Quiz', icon: 'brain', w: 500, h: 440, minW: 290,
    render(win) {
      const root = el('<div class="quiz"></div>');
      win.body.append(root);
      const ROUND = 5;
      const menu = () => {
        const b = bests().quiz || {};
        root.innerHTML = `<div class="doc-head" style="margin:0">${OS.icon('brain', 48)}<div><h3>Data Detective Quiz</h3>Five questions on SQL, Python, analytics and BI. Pass with 3 of 5.</div></div>
          <div class="answers">${[['easy', 'Easy: Junior Analyst'], ['medium', 'Medium: Senior Analyst'], ['hard', 'Hard: Head of Data']].map(([k, l]) => `<button type="button" class="btn answer" data-d="${k}"><span>${l}${b[k] !== undefined ? `<br><small>Best: ${b[k]}/${ROUND}</small>` : ''}</span></button>`).join('')}</div>`;
        $$('[data-d]', root).forEach((n) => n.addEventListener('click', () => start(n.dataset.d)));
        win.setStatus('Choose a difficulty.');
      };
      const start = (diff) => {
        const qs = shuffle(OS.data.quiz[diff]).slice(0, ROUND);
        let i = 0;
        let score = 0;
        const ask = () => {
          const q = qs[i];
          const opts = shuffle(q.a.map((text, idx) => ({ text, right: idx === q.c })));
          root.innerHTML = `<div>Question ${i + 1} of ${ROUND}</div>${OS.ui.bar((i / ROUND) * 100)}<h3>${esc(q.q)}</h3><div class="answers">${opts.map((o, k) => `<button type="button" class="btn answer" data-k="${k}">${esc(o.text)}</button>`).join('')}</div><div class="q-after"></div>`;
          win.setStatus(`${diff[0].toUpperCase()}${diff.slice(1)} difficulty`, `Score: ${score}`);
          root.scrollTop = 0;
          $$('.answer', root).forEach((b) => b.addEventListener('click', () => {
            const k = +b.dataset.k;
            const right = opts[k].right;
            if (right) { score += 1; OS.sound.play('ding'); } else OS.sound.play('error');
            $$('.answer', root).forEach((x, n) => { x.disabled = true; if (opts[n].right) x.classList.add('right'); else if (n === k) x.classList.add('wrong'); });
            const after = $('.q-after', root);
            after.innerHTML = `<div class="explain"><b>${right ? 'Correct.' : 'Not quite.'}</b> ${esc(q.why)}</div><div class="btn-row" style="justify-content:flex-end;margin-top:6px"><button type="button" class="btn default">${i + 1 < ROUND ? 'Next' : 'See Results'}</button></div>`;
            const next = $('button', after);
            next.focus();
            next.addEventListener('click', () => { i += 1; if (i < ROUND) ask(); else end(); });
            win.setStatus(`${diff[0].toUpperCase()}${diff.slice(1)} difficulty`, `Score: ${score}`);
          }));
        };
        const end = () => {
          const b = (bests().quiz ||= {});
          const best = b[diff] === undefined || score > b[diff];
          if (best) { b[diff] = score; OS.save(); }
          const passed = score >= 3;
          root.innerHTML = `<h3>${passed ? 'Case closed.' : 'Case still open.'}</h3><p>You scored <b>${score} of ${ROUND}</b> on ${esc(diff)}.${best ? ' That is your new best.' : ''}</p>${OS.ui.bar((score / ROUND) * 100, passed ? 'done' : '')}
            <p>${passed ? 'You pass. Rory would let you near the production database. Probably.' : 'You need 3 of 5 to pass. Try again, the questions shuffle.'}</p>
            <div class="btn-row"><button type="button" class="btn" data-again>Try Again</button><button type="button" class="btn" data-menu>Change Difficulty</button></div>`;
          $('[data-again]', root).addEventListener('click', () => start(diff));
          $('[data-menu]', root).addEventListener('click', menu);
          if (passed) G().action('game', 'quiz');
          if (score === ROUND && diff === 'hard') G().flag('quiz:perfect');
          OS.sound.play(passed ? 'achieve' : 'hit');
        };
        ask();
      };
      menu();
    },
  };

  /* ---------- Reaction Test ---------- */
  apps.reaction = {
    title: 'Reaction Test', icon: 'bolt', w: 420, h: 340, minW: 260,
    render(win) {
      const pad = el('<button type="button" class="rx idle"></button>');
      win.body.append(pad);
      let state = 'idle';
      let goAt = 0;
      let timer = 0;
      const show = (cls, big, small = '') => {
        pad.className = `rx ${cls}`;
        pad.innerHTML = `<span>${esc(big)}</span><small>${esc(small)}</small>`;
      };
      const status = () => win.setStatus(bests().reaction ? `Personal best: ${bests().reaction} ms` : 'No personal best yet');
      const idle = () => { state = 'idle'; show('idle', 'Reaction Test', 'Click or tap to start. When red turns green, click as fast as you can.'); status(); };
      const arm = () => {
        state = 'wait';
        show('wait', 'Wait for green...');
        timer = setTimeout(() => {
          state = 'go';
          goAt = performance.now();
          show('go', 'CLICK!');
          OS.sound.play('blip');
        }, 1400 + Math.random() * 2600);
      };
      const press = () => {
        if (state === 'idle' || state === 'result' || state === 'early') arm();
        else if (state === 'wait') {
          clearTimeout(timer);
          state = 'early';
          OS.sound.play('error');
          show('early', 'Too early.', 'False start. Click to try again.');
        } else if (state === 'go') {
          const ms = Math.round(performance.now() - goAt);
          state = 'result';
          const best = !bests().reaction || ms < bests().reaction;
          if (best) { bests().reaction = ms; OS.save(); }
          OS.sound.play('ding');
          show('result', `${ms} ms`, `${best ? 'New personal best. ' : ''}Click to go again.`);
          status();
          G().action('game', 'reaction');
          if (ms < 300) G().flag('reaction:fast');
        }
      };
      pad.addEventListener('pointerdown', (e) => { if (e.button === 0) press(); });
      pad.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press(); } });
      win.onClose(() => clearTimeout(timer));
      idle();
    },
  };

  /* ---------- Query Catcher: the hidden bonus game ---------- */
  apps.catcher = {
    title: 'BONUS.EXE: Query Catcher', icon: 'star', w: 360, h: 530, minW: 280, minH: 300,
    render(win) {
      const W = 320;
      const H = 400;
      const root = el(`<div class="qc"><div class="qc-head"><div class="lcd"><small>SCORE</small><span class="qc-score">0</span></div><button type="button" class="btn small qc-go">Start</button><div class="lcd"><small>TIME</small><span class="qc-time">30</span></div></div><canvas class="qc-canvas" width="${W}" height="${H}" aria-label="Query Catcher game field"></canvas></div>`);
      win.body.append(root);
      const c = $('canvas', root);
      const x = c.getContext('2d');
      const scoreEl = $('.qc-score', root);
      const timeEl = $('.qc-time', root);
      const goBtn = $('.qc-go', root);
      const bucket = { x: W / 2, w: 58 };
      let items = [];
      let running = false;
      let score = 0;
      let left = 30;
      let spawn = 0;
      let last = 0;
      let raf = 0;
      const keys = {};

      const text = (s, px, py, col, font = 'bold 12px monospace') => { x.font = font; x.fillStyle = col; x.textAlign = 'center'; x.fillText(s, px, py); };
      const drawBucket = () => {
        x.fillStyle = '#c0c0c0';
        x.fillRect(bucket.x - bucket.w / 2, H - 20, bucket.w, 14);
        x.fillStyle = '#ffffff';
        x.fillRect(bucket.x - bucket.w / 2, H - 20, bucket.w, 2);
        x.fillStyle = '#404040';
        x.fillRect(bucket.x - bucket.w / 2, H - 8, bucket.w, 2);
        text('DB', bucket.x, H - 9, '#000080');
      };
      const idleFrame = (headline, sub) => {
        x.fillStyle = '#001018';
        x.fillRect(0, 0, W, H);
        text(headline, W / 2, 160, '#55ff55', 'bold 18px monospace');
        sub.forEach((s, i) => text(s, W / 2, 190 + i * 18, '#c0c0c0'));
        drawBucket();
      };
      const KINDS = [
        { label: 'ROW', col: '#30d030', v: 10, w: 6 },
        { label: 'KPI', col: '#40e0ff', v: 25, w: 2 },
        { label: 'NULL', col: '#ff5050', v: -20, w: 4 },
      ];
      const pick = () => {
        const total = KINDS.reduce((s, k) => s + k.w, 0);
        let r = Math.random() * total;
        for (const k of KINDS) { r -= k.w; if (r <= 0) return k; }
        return KINDS[0];
      };
      const end = () => {
        running = false;
        cancelAnimationFrame(raf);
        goBtn.textContent = 'Play Again';
        const best = !bests().catcher || score > bests().catcher;
        if (best && score > 0) { bests().catcher = score; OS.save(); }
        idleFrame('Query complete', [`Score: ${score}`, best && score > 0 ? 'New personal best' : `Best: ${bests().catcher || 0}`]);
        G().action('game', 'catcher');
        OS.sound.play('achieve');
        win.setStatus(`Final score: ${score}`);
      };
      const frame = (t) => {
        if (!running) return;
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        if (win.minimized) return;
        left -= dt;
        timeEl.textContent = Math.max(0, Math.ceil(left));
        if (left <= 0) { end(); return; }
        const speed = 90 + (30 - left) * 5;
        if (keys.ArrowLeft) bucket.x -= 300 * dt;
        if (keys.ArrowRight) bucket.x += 300 * dt;
        bucket.x = clamp(bucket.x, bucket.w / 2, W - bucket.w / 2);
        spawn -= dt;
        if (spawn <= 0) {
          spawn = 0.75 - (30 - left) * 0.012;
          items.push({ ...pick(), x: 22 + Math.random() * (W - 44), y: -10 });
        }
        x.fillStyle = '#001018';
        x.fillRect(0, 0, W, H);
        x.fillStyle = '#04202c';
        for (let i = 40; i < W; i += 40) x.fillRect(i, 0, 1, H);
        items.forEach((it) => {
          it.y += speed * dt;
          x.fillStyle = it.col;
          x.fillRect(it.x - 20, it.y - 10, 40, 16);
          text(it.label, it.x, it.y + 2, '#001018');
          if (it.y > H - 28 && it.y < H - 6 && Math.abs(it.x - bucket.x) < bucket.w / 2 + 16) {
            it.hit = true;
            score = Math.max(0, score + it.v);
            scoreEl.textContent = score;
            OS.sound.play(it.v > 0 ? 'blip' : 'hit');
          }
        });
        items = items.filter((it) => !it.hit && it.y < H + 12);
        drawBucket();
      };
      const start = () => {
        items = [];
        score = 0;
        left = 30;
        spawn = 0;
        scoreEl.textContent = 0;
        running = true;
        goBtn.textContent = 'Restart';
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
        win.setStatus('Green and blue are good. Red is NULL.');
      };
      const toLogical = (e) => { const r = c.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * W; };
      c.addEventListener('pointermove', (e) => { bucket.x = clamp(toLogical(e), bucket.w / 2, W - bucket.w / 2); });
      c.addEventListener('pointerdown', (e) => { bucket.x = clamp(toLogical(e), bucket.w / 2, W - bucket.w / 2); c.setPointerCapture(e.pointerId); if (!running) start(); });
      const kd = (e) => {
        if (OS.wm.active !== win) return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { keys[e.key] = true; e.preventDefault(); }
      };
      const ku = (e) => { keys[e.key] = false; };
      addEventListener('keydown', kd);
      addEventListener('keyup', ku);
      goBtn.addEventListener('click', start);
      win.onClose(() => {
        running = false;
        cancelAnimationFrame(raf);
        removeEventListener('keydown', kd);
        removeEventListener('keyup', ku);
      });
      idleFrame('Query Catcher', ['Catch ROW and KPI records.', 'Dodge the NULLs.', 'Move with mouse, finger or arrows.', 'Click Start.']);
      win.setStatus('Bonus game unlocked.');
    },
  };

  OS.games = {};
})();
