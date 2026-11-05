/* Terminal: a real command parser, a small SQL engine over Rory's career data, and the Terminal Challenge. */
(() => {
  'use strict';
  const { $, el, esc } = OS;
  const D = OS.data;

  /* ---------- SQL engine ---------- */
  const tables = () => ({
    projects: D.projects.map((p) => ({
      name: p.name,
      category: p.categories[0],
      kind: p.kind,
      award: p.award ? 'yes' : 'no',
    })),
    skills: D.skills.flatMap((c) => c.items.map((s) => ({ name: s.name, category: c.name, level: s.level || 'Not rated' }))),
    jobs: D.jobs.map((j) => ({ company: j.company, role: j.role, dates: j.dates, current: j.current ? 'yes' : 'no' })),
  });

  const QUERY = /^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+(\w+)(?:\s+(asc|desc))?)?(?:\s+limit\s+(\d+))?\s*;?\s*$/i;
  const COND = /^(\w+)\s*(=|!=|<>|>=|<=|>|<|like)\s*(.+)$/i;

  const parseValue = (raw) => {
    const s = raw.trim();
    if (/^'.*'$|^".*"$/.test(s)) return s.slice(1, -1);
    if (s !== '' && !Number.isNaN(Number(s))) return Number(s);
    throw new Error(`Text values need quotes: '${s}'`);
  };

  const test = (row, cond, table) => {
    const m = cond.trim().match(COND);
    if (!m) throw new Error(`Could not understand condition: ${cond}`);
    const col = m[1].toLowerCase();
    if (!(col in row)) throw new Error(`No column "${m[1]}" in ${table}`);
    const left = String(row[col]).toLowerCase();
    const value = parseValue(m[3]);
    const right = String(value).toLowerCase();
    switch (m[2].toLowerCase()) {
      case '=': return left === right;
      case '!=': case '<>': return left !== right;
      case 'like': return new RegExp(`^${right.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.')}$`).test(left);
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      default: return false;
    }
  };

  /** Returns { columns, rows, table, count, where } or throws with a friendly message. */
  const runSql = (sql) => {
    const m = sql.trim().match(QUERY);
    if (!m) throw new Error('Syntax: SELECT columns FROM table [WHERE col = \'x\'] [ORDER BY col] [LIMIT n]');
    const [, cols, tableName, where, order, dir, limit] = m;
    const name = tableName.toLowerCase();
    const all = tables();
    if (!all[name]) throw new Error(`No table "${tableName}". Try SHOW TABLES.`);
    let rows = all[name];
    if (where) {
      const conds = where.split(/\s+and\s+/i);
      rows = rows.filter((r) => conds.every((c) => test(r, c, name)));
    }
    if (/^count\(\s*\*\s*\)$/i.test(cols.trim())) {
      return { columns: ['count'], rows: [{ count: rows.length }], table: name, isCount: true, where };
    }
    if (order) {
      const c = order.toLowerCase();
      if (!(all[name][0] && c in all[name][0])) throw new Error(`No column "${order}" in ${name}`);
      const s = dir?.toLowerCase() === 'desc' ? -1 : 1;
      rows = [...rows].sort((a, b) => String(a[c]).localeCompare(String(b[c])) * s);
    }
    if (limit) rows = rows.slice(0, Number(limit));
    const available = Object.keys(all[name][0] || {});
    const columns = cols.trim() === '*' ? available : cols.split(',').map((c) => c.trim().toLowerCase());
    columns.forEach((c) => { if (!available.includes(c)) throw new Error(`No column "${c}" in ${name}. Columns: ${available.join(', ')}`); });
    return { columns, rows, table: name, where, order, limit };
  };

  const asciiTable = (columns, rows) => {
    const widths = columns.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c]).length)));
    const line = (cells) => cells.map((v, i) => String(v).padEnd(widths[i])).join(' | ');
    return [line(columns), widths.map((w) => '-'.repeat(w)).join('-+-'), ...rows.map((r) => line(columns.map((c) => r[c])))].join('\n');
  };

  /* ---------- The Terminal Challenge ---------- */
  const CASES = [
    { brief: 'CASE 1: The Inventory. Find out what data you have.\nList the tables in this database.', hint: 'SHOW TABLES', ok: (r) => r === 'tables' },
    { brief: 'CASE 2: The Employment Record. Who has employed the suspect?\nReturn every column and row from the jobs table.', hint: 'SELECT * FROM jobs', ok: (r) => r.table === 'jobs' && !r.where && r.columns.length === 4 && r.rows.length === D.jobs.length },
    { brief: 'CASE 3: The Headcount. How big is the skill set?\nCount the rows in the skills table.', hint: 'SELECT COUNT(*) FROM skills', ok: (r) => r.table === 'skills' && r.isCount && !r.where },
    { brief: 'CASE 4: The Specialist. Isolate the machine learning work.\nReturn the name of every project whose category is \'Machine Learning\'.', hint: "SELECT name FROM projects WHERE category = 'Machine Learning'", ok: (r) => r.table === 'projects' && r.columns.includes('name') && r.rows.length > 0 && r.rows.every((x) => D.projects.find((p) => p.name === x.name)?.categories[0] === 'Machine Learning') },
    { brief: "CASE 5: The Trophy. One project won an award.\nFind the name of the project where award = 'yes'.", hint: "SELECT name FROM projects WHERE award = 'yes'", ok: (r) => r.table === 'projects' && r.rows.length === 1 && r.rows[0].name === 'TranquilTT' && r.columns.includes('name') },
  ];

  /* ---------- App ---------- */
  OS.apps.terminal = {
    title: 'Terminal', icon: 'terminal', w: 620, h: 420, minW: 300,
    onReopen(win, args) { if (args?.challenge) win.term.startChallenge(); win.term.focus(); },
    onFocus(win) { if (!OS.isMobile()) win.term?.focus(); },
    render(win, args = {}) {
      const root = el(`<div class="grow" style="display:flex;flex-direction:column;min-height:0">
        <div class="term" role="log" aria-label="Terminal output"><div class="term-out"></div>
          <label class="term-line"><span class="term-prompt"></span><span class="term-typed"></span><span class="term-cursor" aria-hidden="true"></span><span class="term-after term-typed"></span>
            <input class="term-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Command">
          </label></div>
        <div class="term-keys"></div></div>`);
      win.body.append(root);
      const box = $('.term', root);
      const out = $('.term-out', root);
      const input = $('.term-input', root);
      const typed = $('.term-typed', root);
      const after = $('.term-after', root);
      const promptEl = $('.term-prompt', root);
      const history = [];
      let hIdx = 0;
      let challenge = null; // current case index, null when not in challenge mode

      const setPrompt = () => { promptEl.textContent = challenge === null ? 'C:\\RORY> ' : 'SQL> '; };
      const scroll = () => { box.scrollTop = box.scrollHeight; };
      const print = (text = '', cls = '') => {
        const p = document.createElement('pre');
        if (cls) p.className = cls;
        p.textContent = text;
        out.append(p);
        scroll();
      };
      const printHtml = (html) => { out.append(el(`<pre>${html}</pre>`)); scroll(); };
      const renderInput = () => {
        const pos = input.selectionStart ?? input.value.length;
        typed.textContent = input.value.slice(0, pos);
        after.textContent = input.value.slice(pos);
        scroll();
      };
      const focus = () => input.focus({ preventScroll: true });

      const openApp = (id, a) => setTimeout(() => OS.open(id, a), 120);

      const achievementsText = () => {
        const A = OS.achievements;
        const got = A.list.filter((a) => A.unlocked(a.id));
        print(`${got.length} of ${A.list.length} visitor achievements unlocked`, 'hl');
        got.forEach((a) => print(`  [x] ${a.name}`, 'ok'));
        print('Rory\'s real-world achievements:', 'hl');
        D.realAchievements.forEach((a) => print(`  * ${a.name}`));
        print('Type OPEN ACHIEVEMENTS for the full collection.', 'dim');
      };

      const OPENABLE = { about: 'about', experience: 'experience', work: 'experience', projects: 'projects', skills: 'skills', achievements: 'achievements', quests: 'quests', quest: 'quests', resume: 'resume', contact: 'contact', arcade: 'arcade', computer: 'computer', settings: 'settings', notepad: 'notepad', bin: 'bin', recycle: 'bin', profile: 'profile', disks: 'diskbox', diskbox: 'diskbox', hunter: 'hunter', quiz: 'quiz', reaction: 'reaction' };

      const FILES = { 'readme.txt': 1, 'do_not_open.txt': 1, 'resume.pdf': 1, 'floppy.dsk': 1 };

      const startChallenge = () => {
        challenge = Math.min(OS.state.bests.challengeStep || 0, CASES.length - 1);
        if (OS.game.has('game:challenge')) challenge = 0;
        setPrompt();
        print('');
        print('=== TERMINAL CHALLENGE: THE RORY FILES ===', 'warn');
        print('Query the database to crack each case. Type HINT for help, QUIT to leave.', 'dim');
        print(`Tables: projects, skills, jobs`, 'dim');
        print('');
        print(CASES[challenge].brief, 'hl');
        focus();
      };

      const checkCase = (result) => {
        if (challenge === null) return;
        if (!CASES[challenge].ok(result)) {
          if (result !== 'tables') print('That ran, but it does not crack the case. Type HINT if you are stuck.', 'warn');
          return;
        }
        OS.sound.play('ding');
        print('CASE CLOSED.', 'ok');
        challenge += 1;
        OS.state.bests.challengeStep = challenge;
        OS.save();
        if (challenge >= CASES.length) {
          print('');
          print('All five cases solved. The suspect is, as you suspected, employable.', 'ok');
          challenge = null;
          OS.state.bests.challengeStep = 0;
          OS.game.action('game', 'challenge');
          setPrompt();
          return;
        }
        print('');
        print(CASES[challenge].brief, 'hl');
      };

      const handleSql = (line) => {
        try {
          if (/^show\s+tables\s*;?$/i.test(line)) {
            print(Object.entries(tables()).map(([t, rows]) => `${t.padEnd(10)} ${rows.length} rows  (${Object.keys(rows[0]).join(', ')})`).join('\n'));
            checkCase('tables');
            return;
          }
          const r = runSql(line);
          print(r.rows.length ? asciiTable(r.columns, r.rows) : '(0 rows)');
          print(`${r.rows.length} row(s)`, 'dim');
          OS.game.flag('sql:ran');
          checkCase(r);
        } catch (err) {
          print(`SQL error: ${err.message}`, 'err');
        }
      };

      const COMMANDS = {
        help() {
          print('Available commands:', 'hl');
          print(`  ABOUT         Who is Rory?             WHOAMI        Who are you?
  SKILLS        Skills summary           PROJECTS      List projects
  EXPERIENCE    Career history           CONTACT       How to reach Rory
  RESUME        Open the resume          ACHIEVEMENTS  Show achievements
  QUESTS        Show quest progress      CLEAR         Clear the screen
  MATRIX        Follow the white rabbit  OPEN <app>    Open a program
  DIR           List files               TYPE <file>   Read a file
  CHALLENGE     Start SQL challenge      SELECT ...    Query career data
  SOUND ON|OFF  Toggle sounds            SHUTDOWN      Shut down`);
          print('There may be other commands. Nobody documents everything.', 'dim');
        },
        about() {
          const P = D.profile;
          print(P.name, 'hl');
          print(`${P.occupation}\n${P.currentRole}\n${P.university}, ${P.degree}\nMinor: ${P.minor}\n\n${P.intro[0]}`);
          print('Type OPEN ABOUT for the full profile.', 'dim');
        },
        whoami() {
          const lv = OS.game.level();
          print(`guest\\visitor: Level ${lv.n} ${lv.name}, ${OS.state.xp} XP`);
          if (lv.n === 1) print('Everyone starts somewhere. Try the Quest Log.', 'dim');
        },
        skills() {
          D.skills.forEach((c) => {
            print(c.name, 'hl');
            print(`  ${c.items.map((s) => s.name).join(', ')}`);
          });
          print('Type OPEN SKILLS for levels and evidence.', 'dim');
        },
        projects() {
          D.projects.forEach((p) => print(`  ${p.file.padEnd(20)} ${p.kind}${p.award ? '  [AWARD]' : ''}`));
          print('Type OPEN PROJECTS, or query them: SELECT * FROM projects', 'dim');
        },
        experience() {
          D.jobs.forEach((j) => { print(`${j.dates}`, 'hl'); print(`  ${j.role}, ${j.company}`); });
          print('Type OPEN EXPERIENCE for details.', 'dim');
        },
        contact() {
          const C = D.contact;
          printHtml(`Email:    <a href="mailto:${esc(C.email)}">${esc(C.email)}</a>\nLinkedIn: <a href="${esc(C.linkedin)}" target="_blank" rel="noopener noreferrer">linkedin.com/in/roryrampersad</a>\nGitHub:   <a href="${esc(C.github)}" target="_blank" rel="noopener noreferrer">github.com/RoryR99</a>`);
          OS.game.flag('contact:open');
        },
        resume() {
          printHtml(`Opening Resume... PDF: <a href="${OS.paths.resume}" target="_blank" rel="noopener">${OS.paths.resume}</a>`);
          openApp('resume');
        },
        achievements: achievementsText,
        quests() {
          OS.quests.list.forEach((q) => {
            const done = OS.quests.isDone(q.id);
            const n = q.steps.filter((s) => s.test()).length;
            print(`  [${done ? 'x' : ' '}] ${q.name.padEnd(28)} ${n}/${q.steps.length}`, done ? 'ok' : '');
          });
          print('Type OPEN QUESTS for the log.', 'dim');
        },
        clear() { out.innerHTML = ''; },
        cls() { out.innerHTML = ''; },
        matrix() { print('Wake up...', 'ok'); setTimeout(OS.matrix, 300); },
        open(args) {
          const name = (args[0] || '').toLowerCase();
          if (!name) { print(`Open what? Try: ${Object.keys(OPENABLE).slice(0, 8).join(', ')}...`, 'warn'); return; }
          if (!OPENABLE[name]) { print(`Cannot find program "${name}".`, 'err'); return; }
          print(`Starting ${name}...`);
          openApp(OPENABLE[name], OPENABLE[name] === 'notepad' ? {} : undefined);
        },
        dir() {
          print(` Volume in drive C is RORY\n Directory of C:\\RORY\n
  README   TXT     <FILE>
  DO_NOT~1 TXT     <FILE>   do_not_open.txt
  RESUME   PDF     <FILE>
  FLOPPY   DSK     <FILE>${OS.state.floppies.terminal ? '   (empty)' : ''}
  PROJECTS         <DIR>`);
        },
        type(args) {
          const f = (args[0] || '').toLowerCase();
          if (!f) { print('Type what? Try TYPE README.TXT', 'warn'); return; }
          if (f === 'floppy.dsk') {
            if (OS.state.floppies.terminal) print('The disk has already been ejected.', 'dim');
            else { print('Reading sector 0... there is a whole disk in here.', 'ok'); OS.game.collectFloppy('terminal'); }
            return;
          }
          if (f === 'resume.pdf') { COMMANDS.resume(); return; }
          if (D.documents[f]) { print(D.documents[f]); return; }
          print(`File not found: ${args[0]}`, 'err');
        },
        cd() { print('You are already exactly where you need to be.', 'dim'); },
        ver() { print(`RoryOS 98 [Version ${OS.version}]`); },
        date() { print(new Date().toString()); },
        time() { print(new Date().toLocaleTimeString()); },
        echo(args, raw) { print(raw.replace(/^echo\s*/i, '')); },
        xp() { COMMANDS.whoami(); },
        sound(args) {
          const v = (args[0] || '').toLowerCase();
          if (v !== 'on' && v !== 'off') { print(`Sound is ${OS.state.settings.sound ? 'ON' : 'OFF'}. Use SOUND ON or SOUND OFF.`); return; }
          OS.sound.toggle(v === 'on');
          print(`Sound ${v.toUpperCase()}.`);
        },
        challenge: () => startChallenge(),
        exit() { win.close(); },
        shutdown() { OS.shutdownDialog(); },
        // Hidden commands
        secret() {
          print('Psst. Not all files on the desktop are visible.', 'warn');
          print('Hidden files are now shown. Look to the right.', 'dim');
          OS.desktop.setShowHidden(true);
        },
        konami() { print('Up, Up, Down, Down, Left, Right, Left, Right, B, A.\nNot here, though. On the desktop, with your keyboard. Or on the pad in the Arcade.', 'warn'); },
        sudo() {
          print('[sudo] password for guest:', 'hl');
          print('guest is not in the sudoers file. This incident will be reported.', 'err');
          print('(To Rory. Who will find it funny.)', 'dim');
          OS.game.egg('sudo');
        },
        42() {
          print('Correct.', 'ok');
          print('Now, what was the question?', 'dim');
          OS.game.egg('42');
        },
        xyzzy() { print('Nothing happens. But you knew that, and now we both know you are old enough to know that.', 'dim'); OS.game.egg('xyzzy'); },
        coffee() { print('      ( (\n       ) )\n    ........\n    |      |]\n    \\      /\n     `----\'', 'warn'); print('Error 418: this terminal is a teapot. But nice try.', 'dim'); OS.game.egg('coffee'); },
        hire() { print('Excellent decision. Routing you to Contact...', 'ok'); openApp('contact'); },
        devmode() { print('Developer Mode engaged.', 'warn'); OS.setDevMode(true); },
        format(args) {
          if ((args[0] || '').toLowerCase() !== 'c:') { print('Format what?', 'warn'); return; }
          print('Formatting C:... 100% complete.', 'err');
          setTimeout(OS.crash, 500);
        },
        rm() { print('Nice try. Everything here is static, and also version controlled.', 'dim'); OS.game.egg('rm'); },
        inventory() { openApp('diskbox'); },
      };

      const run = (raw) => {
        const line = raw.trim();
        print(`${promptEl.textContent}${raw}`, 'dim');
        if (!line) return;
        history.push(line);
        hIdx = history.length;
        const first = line.split(/\s+/)[0].toLowerCase();

        if (/^(select|show)\b/i.test(line)) {
          OS.game.flag('cmd:sql');
          handleSql(line);
          return;
        }
        if (challenge !== null) {
          if (first === 'hint') { print(`Try: ${CASES[challenge].hint}`, 'warn'); return; }
          if (first === 'quit' || first === 'exit') {
            challenge = null;
            setPrompt();
            print('Left the challenge. Your case progress is saved. Type CHALLENGE to return.', 'dim');
            return;
          }
          if (first === 'clear' || first === 'cls') { out.innerHTML = ''; print(CASES[challenge].brief, 'hl'); return; }
          print('In challenge mode, type a SELECT or SHOW TABLES. Or HINT, or QUIT.', 'warn');
          return;
        }
        const fn = Object.prototype.hasOwnProperty.call(COMMANDS, first) ? COMMANDS[first] : null;
        if (!fn) {
          print(`Bad command or file name: ${line.split(/\s+/)[0]}`, 'err');
          print('Type HELP for a list of commands.', 'dim');
          return;
        }
        OS.game.flag(`cmd:${first}`);
        fn(line.split(/\s+/).slice(1), line);
      };

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const v = input.value;
          input.value = '';
          renderInput();
          run(v);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (hIdx > 0) { hIdx -= 1; input.value = history[hIdx]; }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          hIdx = Math.min(history.length, hIdx + 1);
          input.value = history[hIdx] || '';
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const v = input.value.toLowerCase();
          if (v) {
            const m = Object.keys(COMMANDS).filter((c) => c.startsWith(v) && !['xyzzy', 'sudo', 'secret', 'konami', '42', 'devmode', 'format', 'rm', 'coffee', 'hire'].includes(c));
            if (m.length === 1) input.value = `${m[0].toUpperCase()} `;
            else if (m.length > 1) print(m.join('  ').toUpperCase(), 'dim');
          }
        } else if (e.key === 'l' && e.ctrlKey) {
          e.preventDefault();
          out.innerHTML = '';
        } else return;
        requestAnimationFrame(() => { input.setSelectionRange(input.value.length, input.value.length); renderInput(); });
      });
      ['input', 'keyup', 'click', 'select'].forEach((ev) => input.addEventListener(ev, renderInput));
      box.addEventListener('click', () => { if (!getSelection().toString()) focus(); });

      const keys = $('.term-keys', root);
      ['HELP', 'PROJECTS', 'SKILLS', 'CONTACT', 'CLEAR'].forEach((k) => {
        const b = el(`<button type="button" class="btn small">${k}</button>`);
        b.addEventListener('click', () => { run(k); });
        keys.append(b);
      });

      win.term = { focus, startChallenge, run };
      setPrompt();
      print(`RoryOS 98 [Version ${OS.version}]`, 'hl');
      print('(C) Rory Rampersad. Type HELP for commands.', 'dim');
      print('');
      if (args.challenge) startChallenge();
      renderInput();
      if (!OS.isMobile()) setTimeout(focus, 30);
    },
  };

  OS.terminalTest = { runSql };
})();
