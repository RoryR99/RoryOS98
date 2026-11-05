/* Portfolio applications and system utilities. Content comes from data.js. */
(() => {
  'use strict';
  const { $, $$, el, esc, apps } = OS;
  const T = OS.text;
  const D = OS.data;
  const bullets = (list) => `<ul class="bullets">${list.map((x) => `<li>${T(x)}</li>`).join('')}</ul>`;
  const extLink = (l) => (l.url
    ? `<a class="btn small" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`
    : `<span>${T(l.label)}</span>`);

  OS.downloadResume = () => {
    OS.game.flag('resume:pdf');
    const a = document.createElement('a');
    a.href = OS.paths.resume;
    a.download = 'Rory_Rampersad_Resume.pdf';
    document.body.append(a);
    a.click();
    a.remove();
  };

  /* ---------- Welcome ---------- */
  apps.welcome = {
    title: 'Welcome to RoryOS 98', icon: 'logo', w: 470, h: 372, minH: 300,
    render(win) {
      const lv = OS.game.level();
      const back = OS.state.xp > 0;
      const box = el(`<div class="welcome"><div class="welcome-side">${OS.icon('logo', 64)}</div><div class="welcome-main">
        <h2>${back ? 'Welcome back.' : 'Welcome to Rory\'s computer.'}</h2>
        <p>${back ? `You are <b>Level ${lv.n}: ${esc(lv.name)}</b> with ${OS.state.xp} XP. Your progress was saved.` : 'This is the portfolio of <b>Rory Rampersad</b>, Business Intelligence Analyst. It happens to be an operating system.'}</p>
        <fieldset class="group"><legend>Here for the essentials?</legend><div class="welcome-buttons">
          <button type="button" class="btn" data-open="resume">${OS.icon('doc')}View Resume</button>
          <button type="button" class="btn" data-open="projects">${OS.icon('folder')}See Projects</button>
          <button type="button" class="btn" data-open="experience">${OS.icon('briefcase')}Work Experience</button>
          <button type="button" class="btn" data-open="contact">${OS.icon('mail')}Contact Rory</button>
        </div></fieldset>
        <fieldset class="group"><legend>Got ten minutes?</legend><div class="welcome-buttons">
          <button type="button" class="btn" data-open="quests">${OS.icon('quest')}Start the Quests</button>
          <button type="button" class="btn" data-open="arcade">${OS.icon('joystick')}Open the Arcade</button>
        </div><p style="margin-top:6px">Earn XP by exploring. Nothing professional is locked behind a quest.</p></fieldset>
        <label class="check-row"><input type="checkbox" ${OS.state.settings.welcome ? 'checked' : ''}> Show this window at startup</label>
      </div></div>`);
      win.body.append(box);
      $$('[data-open]', box).forEach((b) => b.addEventListener('click', () => { OS.open(b.dataset.open); win.close(); }));
      $('input', box).addEventListener('change', (e) => { OS.state.settings.welcome = e.target.checked; OS.save(); });
    },
  };

  /* ---------- About Rory ---------- */
  apps.about = {
    title: 'System Properties: About Rory', icon: 'user', w: 500, h: 430,
    render(win, args = {}) {
      const P = D.profile;
      win.tabs = OS.ui.tabs(win.body, [
        { id: 'general', label: 'General', render(p) {
          p.innerHTML = `<div class="profile-card">
              <div class="portrait">${OS.icon('user', 80, 'Pixel character portrait')}</div>
              <dl class="spec">
                <dt>Name:</dt><dd>${esc(P.name)}</dd>
                <dt>Occupation:</dt><dd>${esc(P.occupation)}</dd>
                <dt>Now running:</dt><dd>${esc(P.currentRole)}</dd>
                <dt>Education:</dt><dd>${esc(P.university)}</dd>
                <dt>Degree:</dt><dd>${esc(P.degree)}</dd>
                <dt>Minor:</dt><dd>${esc(P.minor)}</dd>
                <dt>Location:</dt><dd>${esc(P.location)}</dd>
                <dt>Status:</dt><dd style="color:var(--ok)">${esc(P.status)}</dd>
              </dl></div>
            <fieldset class="group"><legend>Introduction</legend>${P.intro.map((x) => `<p style="margin-bottom:4px">${T(x)}</p>`).join('')}<p>${T(P.values)}</p></fieldset>
            <p style="margin-top:8px;display:flex;align-items:center;gap:6px;justify-content:flex-end">Registered to: Rory Rampersad <span id="fl-slot"></span></p>`;
          if (!OS.state.floppies.about) {
            const f = el(`<button type="button" class="secret-pixel" aria-label="Something small">${OS.icon('floppy', 16)}</button>`);
            f.addEventListener('click', () => { OS.game.collectFloppy('about'); f.remove(); });
            $('#fl-slot', p).append(f);
          }
        } },
        { id: 'education', label: 'Education', render(p) {
          OS.game.flag('about:education');
          p.innerHTML = `${P.education.map((e) => `<fieldset class="group"><legend>${esc(e.school)}</legend><b>${esc(e.what)}</b><br>${esc(e.where)}<br>${esc(e.when)}</fieldset>`).join('')}
            <fieldset class="group"><legend>Certifications</legend>${bullets(P.certifications)}</fieldset>`;
        } },
        { id: 'interests', label: 'Interests', render(p) {
          OS.game.flag('about:interests');
          p.innerHTML = `<fieldset class="group"><legend>Career interests</legend>${P.interests.map((i) => `<div class="interest"><b>${esc(i.name)}</b><small>${esc(i.fit)}</small>${esc(i.detail)}</div>`).join('')}</fieldset>
            <fieldset class="group"><legend>Personal interests</legend>${bullets(P.personalInterests)}</fieldset>`;
        } },
        { id: 'strengths', label: 'Strengths', render(p) { p.innerHTML = `<fieldset class="group"><legend>Professional strengths</legend>${bullets(P.strengths)}</fieldset>`; } },
        { id: 'goals', label: 'Goals', render(p) { p.innerHTML = `<fieldset class="group"><legend>Current professional goals</legend>${bullets(P.goals)}</fieldset><div class="btn-row" style="margin-top:10px"><button type="button" class="btn" id="goto-contact">Talk to Rory</button></div>`; $('#goto-contact', p).addEventListener('click', () => OS.open('contact')); } },
      ], { initial: args.tab });
    },
    onReopen(win, args) { if (args?.tab) win.tabs.select(args.tab); },
  };

  /* ---------- Work Experience ---------- */
  apps.experience = {
    title: 'Career Timeline', icon: 'briefcase', w: 640, h: 440, minW: 320,
    render(win, args = {}) {
      const root = el(`<div class="split stack-mobile"><div class="timeline sunken" role="list" aria-label="Positions"></div><div class="doc sunken"></div></div>`);
      win.body.append(root);
      const list = $('.timeline', root);
      const doc = $('.doc', root);
      const select = (id) => {
        const j = D.jobs.find((x) => x.id === id) || D.jobs[0];
        OS.game.action('job', j.id);
        $$('.t-node', list).forEach((n) => {
          const on = n.dataset.id === j.id;
          n.classList.toggle('on', on);
          n.setAttribute('aria-current', on);
          n.classList.toggle('seen', OS.game.has(`job:${n.dataset.id}`));
        });
        doc.scrollTop = 0;
        doc.innerHTML = `<div class="doc-head">${OS.icon('briefcase', 48)}<div><h2>${esc(j.role)}</h2><b>${esc(j.company)}</b><br>${esc(j.dates)} | ${esc(j.location)}</div></div>
          <h3>Responsibilities</h3><ul>${j.responsibilities.map((x) => `<li>${T(x)}</li>`).join('')}</ul>
          <h3>Key accomplishments</h3><ul>${j.accomplishments.map((x) => `<li>${T(x)}</li>`).join('')}</ul>
          <h3>Tools and technologies</h3><div class="chips">${j.tools.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>`;
        win.setStatus(`${j.company}`, `${OS.game.count('job:')} of ${D.jobs.length} positions explored`);
      };
      D.jobs.forEach((j) => {
        const n = el(`<button type="button" class="t-node" role="listitem" data-id="${j.id}"><span class="when">${esc(j.dates)}</span><b>${esc(j.role)}</b>${esc(j.company)}</button>`);
        n.addEventListener('click', () => { OS.sound.play('click'); select(j.id); });
        list.append(n);
      });
      select(args.id || D.jobs[0].id);
    },
  };

  /* ---------- Projects Explorer ---------- */
  apps.projects = {
    title: 'Exploring - C:\\Projects', icon: 'folder', w: 680, h: 460, minW: 320,
    render(win, args = {}) {
      let cat = args.category || 'All';
      let view = 'icons';
      let selected = null;
      let query = '';
      const root = el(`<div class="grow" style="display:flex;flex-direction:column;min-height:0">
        <div class="toolbar">
          <button type="button" class="tool" data-act="open" disabled data-tip="Open the selected project">${OS.icon('folder')}Open</button>
          <span class="sep"></span>
          <button type="button" class="tool on" data-view="icons" data-tip="Large icons">${OS.icon('app')}Icons</button>
          <button type="button" class="tool" data-view="details" data-tip="File details">${OS.icon('notepad')}Details</button>
          <span class="sep"></span>
          <input type="search" class="prj-search" placeholder="Find a project..." aria-label="Find a project" style="flex:1;min-width:110px;max-width:220px">
        </div>
        <div class="address"><span>Address</span><div class="field">${OS.icon('folder')}<span class="addr"></span></div></div>
        <div class="split stack-mobile"><nav class="tree sunken" aria-label="Project categories"></nav><div class="sunken grow prj-pane" style="flex:1"></div></div></div>`);
      win.body.append(root);
      const tree = $('.tree', root);
      const pane = $('.prj-pane', root);
      const openBtn = $('[data-act="open"]', root);

      const visible = () => D.projects.filter((p) => {
        if (cat !== 'All' && !p.categories.includes(cat)) return false;
        if (!query) return true;
        return [p.name, p.description, ...p.tech, ...p.categories].join(' ').toLowerCase().includes(query);
      });
      const openProject = (p) => OS.open('project', { id: p.id });
      const openSecret = () => OS.open('secret');
      const showHidden = () => !!OS.state.settings.showHidden;

      const drawTree = () => {
        const nodes = [['All', `All Projects (${D.projects.length})`, 'folder', false],
          ...D.projectCategories.map((c) => [c, `${c} (${D.projects.filter((p) => p.categories.includes(c)).length})`, 'folder', true])];
        tree.innerHTML = '';
        nodes.forEach(([id, label, icon, indent]) => {
          const b = el(`<button type="button" class="${cat === id ? 'on' : ''}${indent ? ' indent' : ''}" aria-pressed="${cat === id}">${OS.icon(icon)}<span>${esc(label)}</span></button>`);
          b.addEventListener('click', () => { cat = id; selected = null; OS.sound.play('click'); draw(); });
          tree.append(b);
        });
      };

      const select = (p) => {
        selected = p;
        openBtn.disabled = !p;
        const list = visible();
        win.setStatus(`${list.length} object(s)${showHidden() && cat === 'All' && !query ? ' + 1 hidden' : ''}`, p ? `${p.name}: ${p.kind}` : (OS.singleTap() ? 'Tap a project to open it' : 'Double-click a project to open it'));
      };

      const draw = () => {
        drawTree();
        $('.addr', root).textContent = `C:\\Projects${cat === 'All' ? '' : `\\${cat}`}`;
        pane.innerHTML = '';
        const list = visible();
        const hiddenItem = showHidden() && cat === 'All' && !query;
        if (!list.length) pane.innerHTML = '<p class="pad">This folder is empty. Try another category or search.</p>';
        if (view === 'icons') {
          const items = list.map((p) => ({ name: p.name, icon: 'folder', tip: p.description, project: p }));
          if (hiddenItem) items.push({ name: '.classified', icon: 'secretfolder', secret: true });
          OS.ui.iconGrid(pane, items, {
            onSelect: (it) => select(it.project || null),
            onOpen: (it) => (it.secret ? openSecret() : openProject(it.project)),
          });
        } else {
          const t = el(`<table class="details-table"><thead><tr><th>Name</th><th>Type</th><th>Category</th><th>Tools</th></tr></thead><tbody></tbody></table>`);
          const tb = $('tbody', t);
          list.forEach((p) => {
            const tr = el(`<tr tabindex="0"><td><span class="cell-name">${OS.icon('folder')}${esc(p.name)}</span></td><td>${esc(p.kind)}</td><td>${esc(p.categories.join(', '))}</td><td>${esc(p.tech.slice(0, 3).join(', '))}</td></tr>`);
            tr.addEventListener('click', () => {
              $$('tr', tb).forEach((x) => x.classList.toggle('selected', x === tr));
              select(p);
              if (OS.singleTap()) openProject(p);
            });
            tr.addEventListener('dblclick', () => { if (!OS.singleTap()) openProject(p); });
            tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') openProject(p); });
            tb.append(tr);
          });
          if (hiddenItem) {
            const tr = el(`<tr tabindex="0"><td><span class="cell-name">${OS.icon('secretfolder')}.classified</span></td><td>Hidden folder</td><td>?</td><td>?</td></tr>`);
            tr.addEventListener('dblclick', openSecret);
            tr.addEventListener('click', () => { if (OS.singleTap()) openSecret(); });
            tb.append(tr);
          }
          pane.append(t);
        }
        select(selected && list.includes(selected) ? selected : null);
      };

      const setView = (v) => {
        view = v;
        $$('[data-view]', root).forEach((b) => b.classList.toggle('on', b.dataset.view === v));
        draw();
      };
      $$('[data-view]', root).forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
      openBtn.addEventListener('click', () => selected && openProject(selected));
      $('.prj-search', root).addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); draw(); });

      win.setMenu([
        { label: 'File', items: () => [
          { label: 'Open', disabled: !selected, action: () => openProject(selected) },
          { sep: true },
          { label: 'Close', action: () => win.close() },
        ] },
        { label: 'View', items: () => [
          { label: 'Large Icons', checked: view === 'icons', action: () => setView('icons') },
          { label: 'Details', checked: view === 'details', action: () => setView('details') },
          { sep: true },
          { label: 'Show Hidden Files', checked: showHidden(), action: () => OS.desktop.setShowHidden(!showHidden()) },
        ] },
        { label: 'Help', items: [
          { label: 'About Projects', action: () => OS.dialog({ title: 'About Projects', icon: 'folder', message: 'Each folder is a real project. Double-click (or tap) one to open it.\n\nExplorer has been known to hide things. Check the View menu.' }) },
        ] },
      ]);
      const off = OS.on('settings', draw);
      win.onClose(off);
      draw();
    },
  };

  apps.project = {
    title: (a) => D.projects.find((p) => p.id === a.id)?.name || 'Project',
    icon: (a) => D.projects.find((p) => p.id === a.id)?.icon || 'folder',
    w: 560, h: 480, minW: 300,
    instanceKey: (a) => a.id,
    render(win, { id }) {
      const p = D.projects.find((x) => x.id === id);
      if (!p) { win.body.innerHTML = '<p class="pad">Project not found.</p>'; return; }
      OS.game.action('project', p.id);
      OS.state.recent = [p.id, ...OS.state.recent.filter((x) => x !== p.id)].slice(0, 5);
      OS.save();
      const li = (a) => `<ul>${a.map((x) => `<li>${T(x)}</li>`).join('')}</ul>`;
      const doc = el(`<article class="doc">
        <div class="doc-head">${OS.icon(p.icon, 48)}<div><h2>${esc(p.name)}</h2>${esc(p.kind)}<div class="chips">${p.categories.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div></div></div>
        ${p.award ? `<div class="award">${OS.icon('trophy')}${esc(p.award)}</div>` : ''}
        <p>${T(p.description)}</p>
        ${p.note ? `<p><i>${T(p.note)}</i></p>` : ''}
        <h3>Problem being solved</h3><p>${T(p.problem)}</p>
        <h3>My contribution</h3>${li(p.contribution)}
        <h3>Tools and technologies</h3><div class="chips">${p.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
        ${p.shots.length ? `<h3>Screenshots</h3>${p.shots.map((s) => `<figure class="shot" style="margin-left:0;margin-right:0"><img src="${esc(s.src)}" alt="${esc(s.caption)}" loading="lazy"><figcaption>${esc(s.caption)}</figcaption></figure>`).join('')}` : ''}
        <h3>Outcomes and results</h3>${li(p.outcomes)}
        ${p.links.length ? `<h3>Links</h3><div class="link-row">${p.links.map(extLink).join('')}</div>` : ''}
      </article>`);
      win.body.append(doc);
      win.setStatus(`Viewing ${p.file}`, `${OS.game.count('project:')} of ${D.projects.length} projects explored`);
    },
  };

  /* ---------- Skills ---------- */
  apps.skills = {
    title: 'Skills Explorer', icon: 'chart', w: 680, h: 460, minW: 320,
    render(win, args = {}) {
      const levels = D.skillLevels;
      const pips = (lvl) => {
        const n = levels.indexOf(lvl) + 1;
        return `<div class="pips" aria-hidden="true">${levels.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`;
      };
      const root = el(`<div class="split stack-mobile"><nav class="tree sunken" aria-label="Skill categories"></nav><div class="grow scroll pad skills-pane" style="flex:1"></div></div>`);
      win.body.append(root);
      const tree = $('.tree', root);
      const pane = $('.skills-pane', root);
      const select = (id) => {
        const cat = D.skills.find((c) => c.id === id) || D.skills[0];
        OS.game.action('skill', cat.id);
        $$('button', tree).forEach((b) => { const on = b.dataset.id === cat.id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
        pane.scrollTop = 0;
        pane.innerHTML = `<h2 style="font-size:14px;margin-bottom:4px">${esc(cat.name)}</h2>
          <div class="legend">${levels.map((l, i) => `<span>${i + 1}/4 ${esc(l)}</span>`).join('')}</div>
          <div class="skill-list">${cat.items.map((s) => `<div class="skill-card"><b>${esc(s.name)}<span>${esc(s.level || 'Not rated')}</span></b>${pips(s.level)}<small>${T(s.evidence)}</small></div>`).join('')}</div>`;
        win.setStatus(`${cat.items.length} skills in ${cat.name}`, `${OS.game.count('skill:')} of ${D.skills.length} categories explored`);
      };
      D.skills.forEach((c) => {
        const b = el(`<button type="button" data-id="${c.id}">${OS.icon(c.icon)}<span>${esc(c.name)}</span></button>`);
        b.addEventListener('click', () => { OS.sound.play('click'); select(c.id); });
        tree.append(b);
      });
      select(args.id || D.skills[0].id);
    },
  };

  /* ---------- Achievements ---------- */
  apps.achievements = {
    title: 'Achievements', icon: 'trophy', w: 640, h: 460, minW: 320,
    render(win, args = {}) {
      const A = OS.achievements;
      const card = (a) => {
        const on = A.unlocked(a.id);
        const locked = !on && a.secret;
        return `<div class="ach${on ? '' : ' locked'}">${OS.icon(locked ? 'lock' : a.icon, 32)}<div>
          <b>${locked ? '???' : esc(a.name)}</b>
          <small>${on ? esc(a.desc) : locked ? 'Secret achievement. Keep exploring.' : `Locked: ${esc(a.hint)}`}</small>
          ${on ? '<small class="xp">Unlocked, +15 XP</small>' : ''}</div></div>`;
      };
      const tabs = OS.ui.tabs(win.body, [
        { id: 'real', label: 'Rory\'s Achievements', render(p) {
          p.innerHTML = `<p style="margin-bottom:8px">Real-world professional achievements. These are always unlocked.</p>
            <div class="ach-grid">${D.realAchievements.map((a) => `<div class="ach real">${OS.icon(a.icon, 32)}<div><b>${esc(a.name)}</b><small>${esc(a.when)}</small><small>${T(a.desc)}</small></div></div>`).join('')}</div>`;
        } },
        { id: 'visitor', label: 'Your Achievements', render(p) {
          const total = A.list.length;
          const got = A.count();
          p.innerHTML = `<p style="margin-bottom:4px">Earned by you, while exploring this computer: <b>${got} of ${total}</b></p>
            <div style="margin-bottom:8px">${OS.ui.bar((got / total) * 100)}</div><div class="ach-grid">${A.list.filter((a) => !a.secret || A.unlocked(a.id)).map(card).join('')}${A.list.filter((a) => a.secret && !A.unlocked(a.id)).map(card).join('')}</div>`;
        } },
      ], { initial: args.tab, onChange: (id) => { win.tab = id; } });
      const off = OS.on('achievement', () => { if (win.tab === 'visitor') tabs.select('visitor'); });
      win.onClose(off);
      win.setStatus('Professional achievements are real. Visitor achievements are earned here.');
    },
  };

  /* ---------- Quest Log ---------- */
  const levelPanel = () => {
    const lv = OS.game.level();
    const need = lv.next ? `${OS.state.xp} / ${lv.next.xp} XP to ${lv.next.name}` : `${OS.state.xp} XP. Maximum level reached.`;
    return `<div class="level-panel">${OS.icon('star', 48)}<div class="grow"><b>Level ${lv.n}: ${esc(lv.name)}</b><div style="margin:3px 0">${OS.ui.bar(lv.pct)}</div>${esc(need)}</div></div>`;
  };

  apps.quests = {
    title: 'Quest Log', icon: 'quest', w: 480, h: 500, minW: 300,
    render(win) {
      const pane = el('<div class="grow scroll pad"></div>');
      win.body.append(pane);
      const draw = () => {
        const top = pane.scrollTop;
        pane.innerHTML = `${levelPanel()}<p style="margin-bottom:8px">Quests are optional. Everything professional is already open.</p>`;
        OS.quests.list.forEach((q) => {
          const done = OS.quests.isDone(q.id);
          const stepsDone = q.steps.filter((s) => s.test()).length;
          const box = el(`<div class="quest${done ? ' done' : ''}"><h3><span>${esc(q.name)}</span><span>${done ? 'Complete' : `+${OS.game.XP.quest} XP`}</span></h3><div>${esc(q.blurb)}</div><ul></ul>${OS.ui.bar((stepsDone / q.steps.length) * 100, done ? 'done' : '')}</div>`);
          const ul = $('ul', box);
          q.steps.forEach((s) => {
            const ok = s.test();
            const li = el(`<li><span class="box" aria-hidden="true">${ok ? '&#10003;' : ''}</span></li>`);
            const text = `${s.label}${s.progress ? ` (${s.progress()})` : ''}`;
            if (s.open && !ok) {
              const b = el(`<button type="button">${esc(text)}</button>`);
              b.addEventListener('click', () => OS.open(...s.open));
              li.append(b);
            } else li.append(el(`<span>${esc(text)}${ok ? ' <span class="sr-only"></span>' : ''}</span>`));
            ul.append(li);
          });
          pane.append(box);
        });
        pane.scrollTop = top;
        win.setStatus(`${OS.quests.doneCount()} of ${OS.quests.list.length} quests complete`, `${OS.state.xp} XP`);
      };
      win.onClose(OS.on('change', draw));
      draw();
    },
  };

  /* ---------- Visitor profile ---------- */
  apps.profile = {
    title: 'Visitor Profile', icon: 'star', w: 430, h: 480, minW: 290,
    render(win) {
      const pane = el('<div class="grow scroll pad"></div>');
      win.body.append(pane);
      const G = OS.game;
      const draw = () => {
        const lv = G.level();
        const row = (a, b) => `<tr><td>${esc(a)}</td><td><b>${esc(b)}</b></td></tr>`;
        pane.innerHTML = `${levelPanel()}
          <fieldset class="group"><legend>Statistics</legend><table class="level-table">
            ${row('Achievements', `${OS.achievements.count()} of ${OS.achievements.list.length}`)}
            ${row('Quests complete', `${OS.quests.doneCount()} of ${OS.quests.list.length}`)}
            ${row('Projects explored', `${G.count('project:')} of ${D.projects.length}`)}
            ${row('Positions explored', `${G.count('job:')} of ${D.jobs.length}`)}
            ${row('Skill categories', `${G.count('skill:')} of ${D.skills.length}`)}
            ${row('Floppy disks', `${G.floppyCount()} of ${G.floppyTotal()}`)}
          </table></fieldset>
          <fieldset class="group"><legend>Levels</legend><table class="level-table">
            ${G.LEVELS.map((l) => `<tr class="${l.n === lv.n ? 'on' : l.n > lv.n ? 'off' : ''}"><td>Level ${l.n}</td><td>${esc(l.name)}</td><td>${l.xp} XP</td></tr>`).join('')}
          </table></fieldset>
          <fieldset class="group"><legend>How XP works</legend><table class="level-table">
            ${row('Open About Rory', '+10')}${row('Explore a position', '+15')}${row('Open a project', '+20')}${row('Explore a skill category', '+10')}${row('Complete a mini-game', '+25')}${row('Find a secret folder', '+50')}${row('Complete a quest', '+50')}${row('Discover an easter egg', '+30')}${row('Unlock an achievement', '+15')}${row('Find a floppy disk', '+10')}
          </table><p style="margin-top:4px">Each action pays out once. No farming.</p></fieldset>`;
      };
      win.onClose(OS.on('change', draw));
      draw();
    },
  };

  /* ---------- Resume ---------- */
  apps.resume = {
    title: 'Resume.doc - WordPad', icon: 'doc', w: 680, h: 520, minW: 320,
    render(win) {
      const P = D.profile;
      const C = D.contact;
      const root = el(`<div class="grow" style="display:flex;flex-direction:column;min-height:0">
        <div class="toolbar">
          <a class="tool" href="${OS.paths.resume}" target="_blank" rel="noopener" data-track>${OS.icon('doc')}Open PDF</a>
          <a class="tool" href="${OS.paths.resume}" download="Rory_Rampersad_Resume.pdf" data-track>${OS.icon('floppy')}Download</a>
          <span class="sep"></span>
          <button type="button" class="tool" data-contact>${OS.icon('mail')}Contact</button>
        </div>
        <div class="wordpad"><div class="page">
          <h1>${esc(P.name)}</h1>
          <p class="contact-line"><a href="mailto:${esc(C.email)}">${esc(C.email)}</a> | <a href="${esc(C.linkedin)}" target="_blank" rel="noopener noreferrer">linkedin.com/in/roryrampersad</a> | <a href="${esc(C.github)}" target="_blank" rel="noopener noreferrer">github.com/RoryR99</a></p>
          <h2>Experience</h2>
          ${D.jobs.map((j) => `<div class="entry"><div class="row"><b>${esc(j.role)}</b><span>${esc(j.dates)}</span></div><div class="row"><i>${esc(j.company)}</i><i>${esc(j.location)}</i></div><ul>${j.accomplishments.map((a) => `<li>${T(a)}</li>`).join('')}</ul></div>`).join('')}
          <h2>Projects</h2>
          ${D.projects.filter((p) => p.links.some((l) => l.url)).map((p) => `<div class="entry"><b>${esc(p.name)}</b> | <i>${esc(p.tech.slice(0, 4).join(', '))}</i><br>${T(p.award || p.description)}</div>`).join('')}
          <h2>Education</h2>
          ${P.education.map((e) => `<div class="entry"><div class="row"><b>${esc(e.school)}</b><span>${esc(e.when)}</span></div><i>${esc(e.what)}</i></div>`).join('')}
          <h2>Certifications</h2><p>${esc(P.certifications.join(' | '))}</p>
          <h2>Technical Skills</h2>
          ${D.skills.slice(0, 4).map((c) => `<p><b>${esc(c.name)}:</b> ${esc(c.items.filter((s) => s.level).map((s) => s.name).join(', '))}</p>`).join('')}
        </div></div></div>`);
      win.body.append(root);
      $$('[data-track]', root).forEach((a) => a.addEventListener('click', () => OS.game.flag('resume:pdf')));
      $('[data-contact]', root).addEventListener('click', () => OS.open('contact'));
      win.setMenu([
        { label: 'File', items: [
          { label: 'Open PDF in new tab', action: () => { OS.game.flag('resume:pdf'); window.open(OS.paths.resume, '_blank', 'noopener'); } },
          { label: 'Download PDF', action: () => OS.downloadResume() },
          { sep: true },
          { label: 'Exit', action: () => win.close() },
        ] },
        { label: 'Help', items: [{ label: 'About this document', action: () => OS.dialog({ title: 'About', icon: 'doc', message: 'A readable summary of Rory\'s resume. The PDF is the official version.' }) }] },
      ]);
      win.setStatus('For Help, press the PDF button.', 'Page 1');
    },
  };

  /* ---------- Contact ---------- */
  apps.contact = {
    title: 'Contact Rory', icon: 'mail', w: 430, h: 480, minW: 290,
    render(win) {
      OS.game.flag('contact:open');
      const C = D.contact;
      const root = el(`<div class="grow scroll pad">
        <p style="margin-bottom:8px"><b>${esc(D.profile.status)}.</b> The fastest way to reach Rory is email.</p>
        <div class="contact-list">
          <a class="contact-row" href="mailto:${esc(C.email)}">${OS.icon('mail', 32)}<span><b>Email</b><span>${esc(C.email)}</span></span></a>
          <a class="contact-row" href="${esc(C.linkedin)}" target="_blank" rel="noopener noreferrer">${OS.icon('linkedin', 32)}<span><b>LinkedIn</b><span>linkedin.com/in/roryrampersad</span></span></a>
          <a class="contact-row" href="${esc(C.github)}" target="_blank" rel="noopener noreferrer">${OS.icon('octo', 32)}<span><b>GitHub</b><span>github.com/RoryR99</span></span></a>
          <a class="contact-row" href="${OS.paths.resume}" download="Rory_Rampersad_Resume.pdf" data-track>${OS.icon('doc', 32)}<span><b>Resume</b><span>Download the PDF</span></span></a>
        </div>
        <fieldset class="group"><legend>Compose a message</legend>
          <form class="form-grid">
            <label for="ct-subj">Subject:</label><input id="ct-subj" type="text" value="Saw your portfolio">
            <textarea aria-label="Message" placeholder="Hi Rory,"></textarea>
            <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:6px;align-items:center"><span>Opens in your email app.</span><button type="submit" class="btn">Send</button></div>
          </form></fieldset></div>`);
      win.body.append(root);
      $('[data-track]', root).addEventListener('click', () => OS.game.flag('resume:pdf'));
      $('form', root).addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = encodeURIComponent($('#ct-subj', root).value);
        const body = encodeURIComponent($('textarea', root).value);
        location.href = `mailto:${C.email}?subject=${subject}&body=${body}`;
      });
    },
  };

  /* ---------- Generic folder browser ---------- */
  const folder = (win, nodes, pathName) => {
    const stack = [{ name: pathName, items: nodes }];
    const root = el(`<div class="grow" style="display:flex;flex-direction:column;min-height:0">
      <div class="toolbar"><button type="button" class="tool" data-back disabled>${OS.icon('folder')}Up</button></div>
      <div class="address"><span>Address</span><div class="field">${OS.icon('computer')}<span class="addr"></span></div></div>
      <div class="sunken grow pane"></div></div>`);
    win.body.append(root);
    const pane = $('.pane', root);
    const back = $('[data-back]', root);
    const draw = () => {
      const cur = stack[stack.length - 1];
      const items = typeof cur.items === 'function' ? cur.items() : cur.items;
      pane.innerHTML = '';
      $('.addr', root).textContent = stack.map((s) => s.name).join('\\').replace(/^My Computer\\?/, '') || 'My Computer';
      back.disabled = stack.length === 1;
      OS.ui.iconGrid(pane, items, {
        onSelect: (it) => win.setStatus(it.tip || it.name),
        onOpen: (it) => {
          if (it.items) { stack.push(it); draw(); } else it.open?.();
        },
      });
      win.setStatus(`${items.length} object(s)`);
    };
    back.addEventListener('click', () => { stack.pop(); draw(); });
    draw();
  };

  /* ---------- My Computer ---------- */
  let retries = 0;
  const floppyDrive = async () => {
    const r = await OS.dialog({ title: 'A:\\', icon: 'error', message: 'A:\\ is not accessible.\n\nThe device is not ready. Someone has hidden all the disks.', buttons: ['Abort', 'Retry', 'Fail'], def: 1 });
    if (r === 'Retry') {
      retries += 1;
      if (retries >= 3) {
        retries = 0;
        OS.game.egg('retry');
        OS.dialog({ title: 'A:\\', icon: 'info', message: 'Fine. There are seven disks hidden somewhere on this machine.\n\nOne is on the desktop, if you look closely.' });
      } else floppyDrive();
    } else retries = 0;
  };

  const fakeError = async () => {
    const a = await OS.dialog({ title: 'DO_NOT_CLICK.EXE', icon: 'warning', message: 'You clicked it.\n\nThe program DO_NOT_CLICK.EXE has done exactly what it said it would not.', buttons: ['Sorry', 'Not sorry'] });
    OS.dialog({ title: 'Error', icon: 'error', message: a === 'Sorry' ? 'Task failed successfully.\n\nError 0: There is no error.' : 'Task succeeded unsuccessfully.\n\nError 1: Attitude.' });
  };

  const props = () => OS.dialog({ title: 'System Properties', icon: 'computer', message: `RoryOS 98\nVersion ${OS.version}\n\nRegistered to: Rory Rampersad\n\nComputer:\n  1x Human, University of Waterloo Math Co-Processor\n  Coffee-cooled\n  Runs SQL, Python, R and Power BI natively` });

  const sub = (name, icon, items) => ({ name, icon, items });
  const launch = (name, icon, id, args, tip) => ({ name, icon, tip, open: () => OS.open(id, args) });
  const computerTree = () => [
    { name: '3 1/2 Floppy (A:)', icon: 'drive', tip: 'Removable disk', open: floppyDrive },
    sub('Rory (C:)', 'hdd', [
      sub('Documents', 'folder', [
        launch('Resume.doc', 'doc', 'resume'),
        launch('readme.txt', 'notepad', 'notepad', { file: 'readme.txt' }),
        launch('do_not_open.txt', 'notepad', 'notepad', { file: 'do_not_open.txt' }),
        launch('Untitled.txt', 'notepad', 'notepad', {}),
      ]),
      sub('Program Files', 'folder', [
        launch('About Rory', 'user', 'about'),
        launch('Work Experience', 'briefcase', 'experience'),
        launch('Skills', 'chart', 'skills'),
        launch('Contact', 'mail', 'contact'),
        launch('Terminal', 'terminal', 'terminal'),
        launch('Quest Log', 'quest', 'quests'),
      ]),
      sub('Games', 'folder', [
        launch('Arcade', 'joystick', 'arcade'),
        launch('Null Hunter', 'bug', 'hunter'),
        launch('Data Detective', 'brain', 'quiz'),
        launch('Reaction Test', 'bolt', 'reaction'),
      ]),
      sub('System', 'folder', [
        { name: 'DO_NOT_CLICK.EXE', icon: 'error', open: fakeError },
        launch('Control Panel', 'gear', 'settings'),
      ]),
    ]),
    sub('Portfolio (D:)', 'cd', D.projects.map((p) => launch(p.file, 'folder', 'project', { id: p.id }, p.description))),
    launch('Control Panel', 'gear', 'settings'),
    launch('Recycle Bin', 'bin', 'bin'),
  ];

  apps.computer = {
    title: 'My Computer', icon: 'computer', w: 540, h: 380, minW: 290,
    render(win) {
      folder(win, computerTree(), 'My Computer');
      win.setMenu([
        { label: 'File', items: [{ label: 'Properties', action: props }, { sep: true }, { label: 'Close', action: () => win.close() }] },
        { label: 'View', items: () => [{ label: 'Show Hidden Files', checked: !!OS.state.settings.showHidden, action: () => OS.desktop.setShowHidden(!OS.state.settings.showHidden) }] },
      ]);
    },
  };

  /* ---------- Recycle Bin ---------- */
  apps.bin = {
    title: 'Recycle Bin', icon: 'bin', w: 500, h: 340, minW: 280,
    render(win) {
      OS.game.egg('recycle');
      const jokes = D.recycled.filter((r) => r.joke);
      const opener = jokes[Math.floor(Math.random() * jokes.length)];
      const root = el(`<div class="grow" style="display:flex;flex-direction:column;min-height:0">
        <div class="pad" style="background:var(--tip);border:1px solid var(--ink);margin:2px"><b>${esc(opener.name)}</b>: ${esc(opener.joke)}</div>
        <div class="sunken grow pane"></div></div>`);
      win.body.append(root);
      const pane = $('.pane', root);
      const draw = () => {
        pane.innerHTML = '';
        const items = D.recycled.filter((r) => !(r.floppy && OS.state.floppies[r.floppy]));
        OS.ui.iconGrid(pane, items, {
          onOpen: (it) => {
            if (it.floppy) { OS.game.collectFloppy(it.floppy); draw(); return; }
            OS.dialog({ title: it.name, icon: 'warning', message: it.joke });
          },
        });
        win.setStatus(`${items.length} object(s)`, 'Occupied: years of regret');
      };
      win.setMenu([{ label: 'File', items: [
        { label: 'Empty Recycle Bin', action: () => OS.dialog({ title: 'Confirm Delete', icon: 'warning', message: 'Rory has refused to let go of these files.\n\nThey may be needed for a future performance review.', buttons: ['Fair enough'] }) },
        { sep: true },
        { label: 'Close', action: () => win.close() },
      ] }]);
      draw();
    },
  };

  /* ---------- Secret folder ---------- */
  apps.secret = {
    title: '~hidden', icon: 'secretfolder', w: 460, h: 300, minW: 280,
    render(win) {
      OS.game.action('secret', 'folder');
      win.setTitle('C:\\~hidden');
      const pane = el('<div class="sunken grow"></div>');
      win.body.append(pane);
      const draw = () => {
        pane.innerHTML = '';
        const items = [
          { name: 'dev_notes.txt', icon: 'notepad', open: () => OS.open('notepad', { file: 'dev_notes.txt' }) },
          { name: 'BONUS.EXE', icon: 'star', tip: 'A hidden bonus game', open: () => OS.open('catcher') },
          { name: 'CHEATS.EXE', icon: 'key', tip: 'Cheat sheet', open: () => OS.open('vault') },
          { name: 'DEV_MODE.BAT', icon: 'wrench', tip: 'For professionals', open: () => OS.setDevMode(true) },
        ];
        if (!OS.state.floppies.secret) items.push({ name: 'CLASSIFIED.DSK', icon: 'floppy', open: () => { OS.game.collectFloppy('secret'); draw(); } });
        OS.ui.iconGrid(pane, items, { onOpen: (it) => it.open() });
        win.setStatus(`${items.length} object(s)`, 'You are not supposed to be here');
      };
      draw();
    },
  };

  /* ---------- Disk Box (collectibles) ---------- */
  apps.diskbox = {
    title: 'Disk Box', icon: 'floppy', w: 460, h: 380, minW: 280,
    render(win) {
      const pane = el('<div class="grow scroll pad"></div>');
      win.body.append(pane);
      const draw = () => {
        const G = OS.game;
        pane.innerHTML = `<p style="margin-bottom:4px"><b>${G.floppyCount()} of ${G.floppyTotal()}</b> installation disks recovered.</p>
          <div style="margin-bottom:8px">${OS.ui.bar((G.floppyCount() / G.floppyTotal()) * 100)}</div>
          <div class="ach-grid">${Object.entries(G.FLOPPIES).map(([id, f]) => {
            const got = OS.state.floppies[id];
            return `<div class="ach${got ? '' : ' locked'}">${OS.icon('floppy', 32)}<div><b>${got ? esc(f.name) : '????????.???'}</b><small>${got ? esc(f.where) : 'Not yet found.'}</small></div></div>`;
          }).join('')}</div>`;
      };
      win.onClose(OS.on('change', draw));
      draw();
    },
  };

  /* ---------- Cheat vault, the Konami unlock ---------- */
  apps.vault = {
    title: 'CHEATS.EXE', icon: 'key', w: 430, h: 400, minW: 280,
    render(win) {
      const root = el(`<div class="grow scroll pad">
        <p style="margin-bottom:6px"><b>The classified cheat sheet.</b> Keep it between us.</p>
        <fieldset class="group"><legend>Hidden terminal commands</legend><ul class="bullets">
          <li>SECRET, KONAMI, SUDO, 42</li><li>XYZZY, COFFEE, HIRE, DEVMODE</li><li>FORMAT C: (do it, nothing bad happens)</li></ul></fieldset>
        <fieldset class="group"><legend>Floppy disk hints</legend><ul class="bullets">
          <li>One is lying on the desktop.</li><li>One is in the trash.</li><li>One is very small, in About Rory.</li>
          <li>One needs a closer look at do_not_open.txt.</li><li>DIR might turn one up in the terminal.</li>
          <li>One is a prize. One is in a hidden folder.</li></ul></fieldset>
        <div class="btn-row" style="margin-top:10px">
          <button type="button" class="btn" data-a="catcher">${OS.icon('star')}Play Bonus Game</button>
          <button type="button" class="btn" data-a="secret">${OS.icon('secretfolder')}Open Hidden Folder</button>
        </div></div>`);
      win.body.append(root);
      $$('[data-a]', root).forEach((b) => b.addEventListener('click', () => OS.open(b.dataset.a)));
    },
  };

  /* ---------- Notepad ---------- */
  apps.notepad = {
    title: (a) => `${a?.file || 'Untitled'} - Notepad`, icon: 'notepad', w: 500, h: 380, minW: 260,
    instanceKey: (a) => a?.file || 'untitled',
    render(win, args = {}) {
      const file = args.file;
      const ta = el(`<textarea class="notepad" spellcheck="false" aria-label="${esc(file || 'Untitled')} text"></textarea>`);
      ta.value = file ? D.documents[file] || '' : OS.state.notes;
      win.body.append(ta);
      let wrap = true;
      const save = () => {
        if (file) {
          OS.dialog({ title: 'Notepad', icon: 'warning', message: `${file} is read-only.\n\nUntitled.txt is yours, though. Anything saved there stays in this browser.` });
          return;
        }
        OS.state.notes = ta.value;
        OS.saveNow();
        win.setStatus('Saved to this browser.');
      };
      win.setMenu([
        { label: 'File', items: () => [
          { label: 'New', action: () => OS.open('notepad', {}) },
          { label: 'Open', sub: Object.keys(D.documents).filter((f) => f !== 'dev_notes.txt' || OS.game.has('secret:folder')).map((f) => ({ label: f, action: () => OS.open('notepad', { file: f }) })) },
          { label: 'Save', action: save },
          { sep: true },
          { label: 'Exit', action: () => win.close() },
        ] },
        { label: 'Edit', items: [
          { label: 'Select All', action: () => { ta.focus(); ta.select(); } },
          { label: 'Time/Date', action: () => { ta.setRangeText(new Date().toLocaleString(), ta.selectionStart, ta.selectionEnd, 'end'); ta.focus(); } },
        ] },
        { label: 'Format', items: () => [
          { label: 'Word Wrap', checked: wrap, action: () => { wrap = !wrap; ta.classList.toggle('nowrap', !wrap); ta.wrap = wrap ? 'soft' : 'off'; } },
        ] },
        { label: 'Help', items: [{ label: 'About Notepad', action: () => OS.dialog({ title: 'About Notepad', icon: 'notepad', message: 'Notepad for RoryOS 98.\n\nStill the best BI tool for writing down what the stakeholder actually wanted.' }) }] },
      ]);
      win.setStatus(file ? `${file} (read-only)` : 'Untitled.txt is saved in this browser.');
    },
  };

  /* ---------- Developer mode ---------- */
  OS.setDevMode = (on) => {
    OS.state.settings.devMode = on;
    document.body.classList.toggle('dev-mode', on);
    OS.save();
    if (on) {
      OS.game.egg('devmode');
      OS.open('sysmon');
    }
    OS.emit('settings');
  };
  apps.sysmon = {
    title: 'System Monitor (Developer Mode)', icon: 'wrench', w: 460, h: 400,
    render(win) {
      const root = el(`<div class="grow" style="display:flex;flex-direction:column;min-height:0"><div class="mono-pane"></div><div class="btn-row pad"><button type="button" class="btn" data-off>Disable Developer Mode</button></div></div>`);
      win.body.append(root);
      const out = $('.mono-pane', root);
      const draw = () => {
        const open = [...OS.wm.windows.values()].map((w) => `  ${w.appId.padEnd(14)} z=${w.el.style.zIndex}${w.minimized ? ' (min)' : ''}`).join('\n');
        const { notes, iconPositions, ...state } = OS.state;
        out.textContent = `WINDOWS\n${open}\n\nLOCALSTORAGE roryos98.v1\n${JSON.stringify(state, null, 1)}`;
      };
      $('[data-off]', root).addEventListener('click', () => { OS.setDevMode(false); win.close(); });
      win.onClose(OS.on('change', draw));
      const iv = setInterval(draw, 1500);
      win.onClose(() => clearInterval(iv));
      draw();
    },
  };

  /* ---------- Settings ---------- */
  apps.settings = {
    title: 'Control Panel', icon: 'gear', w: 420, h: 400, minW: 280, minH: 300,
    render(win, args = {}) {
      const S = OS.state.settings;
      let versionClicks = 0;
      OS.ui.tabs(win.body, [
        { id: 'display', label: 'Display', render(p) {
          p.innerHTML = `<div class="wall-preview"><div></div></div><fieldset class="group"><legend>Wallpaper</legend><div class="w-list"></div></fieldset>`;
          const prev = $('.wall-preview div', p);
          const showPrev = (id) => { prev.removeAttribute('style'); Object.assign(prev.style, OS.desktop.wallCss(id)); };
          Object.entries(OS.desktop.wallpapers).forEach(([id, w]) => {
            const row = el(`<label class="check-row"><input type="radio" name="wall" value="${id}" ${S.wallpaper === id ? 'checked' : ''}> ${esc(w.name)}</label>`);
            $('input', row).addEventListener('change', () => { OS.desktop.setWallpaper(id); showPrev(id); });
            $('.w-list', p).append(row);
          });
          showPrev(S.wallpaper);
        } },
        { id: 'prefs', label: 'Sound & Motion', render(p) {
          p.innerHTML = `<fieldset class="group"><legend>Sound</legend><label class="check-row"><input type="checkbox" id="st-sound" ${S.sound ? 'checked' : ''}> Play system sounds</label><p>Off by default. All sounds are generated in your browser.</p></fieldset>
            <fieldset class="group"><legend>Animation</legend><label class="check-row"><input type="checkbox" id="st-motion" ${S.reduceMotion ? 'checked' : ''}> Reduce animations</label><p>Also follows your system's reduced motion preference.</p></fieldset>
            <fieldset class="group"><legend>Files</legend><label class="check-row"><input type="checkbox" id="st-hidden" ${S.showHidden ? 'checked' : ''}> Show hidden files</label></fieldset>`;
          $('#st-sound', p).addEventListener('change', (e) => OS.sound.toggle(e.target.checked));
          $('#st-motion', p).addEventListener('change', (e) => OS.setReduceMotion(e.target.checked));
          $('#st-hidden', p).addEventListener('change', (e) => OS.desktop.setShowHidden(e.target.checked));
        } },
        { id: 'progress', label: 'Progress', render(p) {
          p.innerHTML = `${levelPanel()}<fieldset class="group"><legend>Saved progress</legend><p style="margin-bottom:8px">Your XP, achievements, quests and floppy disks are stored only in this browser.</p><button type="button" class="btn" id="st-reset">Reset Saved Progress...</button></fieldset>`;
          $('#st-reset', p).addEventListener('click', async () => {
            const r = await OS.dialog({ title: 'Confirm Reset', icon: 'warning', message: 'This permanently erases your XP, achievements, quests and floppy disks.\n\nReset saved progress?', buttons: ['Yes', 'No'], def: 1 });
            if (r !== 'Yes') return;
            OS.wm.closeAll();
            OS.resetProgress();
            OS.game.flag('boot');
            document.body.classList.remove('dev-mode');
            OS.desktop.setShowHidden(false);
            OS.desktop.layout();
            OS.game.toast({ title: 'RoryOS 98', name: 'Progress reset', desc: 'You are a Guest User once again.', icon: 'info' });
          });
        } },
        { id: 'system', label: 'System', render(p) {
          p.innerHTML = `<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">${OS.icon('logo', 48)}<div><b>RoryOS 98</b><br>Business Intelligence Edition</div></div>
            <dl class="spec"><dt>Build:</dt><dd><button type="button" id="st-ver" style="background:none;border:0;padding:0;font-weight:bold;cursor:var(--cur-arrow)">${esc(OS.version)}</button></dd><dt>Stack:</dt><dd>HTML, CSS, JavaScript</dd><dt>Backend:</dt><dd>None. Not even a little.</dd><dt>Registered to:</dt><dd>Rory Rampersad</dd></dl>`;
          $('#st-ver', p).addEventListener('click', () => {
            versionClicks += 1;
            if (versionClicks >= 7) { versionClicks = 0; OS.setDevMode(true); }
            else if (versionClicks >= 4) win.setStatus(`You are ${7 - versionClicks} step(s) away from being a developer.`);
          });
        } },
      ], { initial: args.tab });
      win.setStatus('Changes apply immediately.');
    },
  };

  OS.setReduceMotion = (on) => {
    OS.state.settings.reduceMotion = on;
    document.body.classList.toggle('reduce-motion', on);
    OS.save();
  };
})();
