/* Visitor achievements. Rory's real-world achievements live in data.js and are always visible. */
(() => {
  'use strict';
  const g = () => OS.game;
  const has = (f) => OS.game.has(f);
  const count = (p) => OS.game.count(p);
  const allProjects = () => OS.data.projects.length;
  const allSkills = () => OS.data.skills.length;

  const LIST = [
    { id: 'boot', name: 'Hello, World', icon: 'computer', desc: 'Booted RoryOS 98.', hint: 'Start the computer.', check: () => has('boot') },
    { id: 'background', name: 'Background Check', icon: 'user', desc: 'Read up on Rory.', hint: 'Open About Rory.', check: () => has('about:open') },
    { id: 'references', name: 'References Checked', icon: 'briefcase', desc: 'Reviewed every position in the career timeline.', hint: 'Explore all positions in Work Experience.', check: () => count('job:') >= OS.data.jobs.length },
    { id: 'first-project', name: 'File Opened', icon: 'folder', desc: 'Opened a first project.', hint: 'Open any project.', check: () => count('project:') >= 1 },
    { id: 'all-projects', name: 'Full Portfolio Review', icon: 'star', desc: 'Opened every project on the system.', hint: 'Open all projects.', check: () => count('project:') >= allProjects() },
    { id: 'skill-tree', name: 'Skill Tree Climbed', icon: 'chart', desc: 'Browsed every skill category.', hint: 'Explore all skill categories.', check: () => count('skill:') >= allSkills() },
    { id: 'sql', name: 'SQL Explorer', icon: 'db', desc: 'Ran a working SQL query against Rory\'s career data.', hint: 'Run a SELECT in the terminal.', check: () => has('sql:ran') },
    { id: 'python', name: 'Python Explorer', icon: 'terminal', desc: 'Opened a project built in Python.', hint: 'Open a Python project.', check: () => OS.data.projects.some((p) => p.tech.includes('Python') && has(`project:${p.id}`)) },
    { id: 'recruiter', name: 'Recruiter Instinct', icon: 'doc', desc: 'Went straight for the resume PDF.', hint: 'Open or download the PDF resume.', check: () => has('resume:pdf') },
    { id: 'contact', name: 'Let\'s Talk', icon: 'mail', desc: 'Found the contact details.', hint: 'Open Contact.', check: () => has('contact:open') },
    { id: 'cmd', name: 'Command Line Native', icon: 'terminal', desc: 'Ran five different terminal commands.', hint: 'Run 5 different terminal commands.', check: () => count('cmd:') >= 5 },
    { id: 'quiz', name: 'Data Detective', icon: 'brain', desc: 'Passed the Data Detective Quiz.', hint: 'Score 60% or better on the quiz.', check: () => has('game:quiz') },
    { id: 'quiz-hard', name: 'Flawless Query', icon: 'medal', desc: 'Got a perfect score on Hard.', hint: 'Score 100% on Hard difficulty.', check: () => has('quiz:perfect') },
    { id: 'hunter', name: 'Data Cleaner', icon: 'bug', desc: 'Cleared a Null Hunter table without touching a bad record.', hint: 'Win a game of Null Hunter.', check: () => has('game:hunter') },
    { id: 'reflex', name: 'Fast Refresh', icon: 'bolt', desc: 'Reacted in under 300 milliseconds.', hint: 'Beat 300 ms in the Reaction Test.', check: () => has('reaction:fast') },
    { id: 'challenge', name: 'Query Master', icon: 'db', desc: 'Solved all five Terminal Challenge cases.', hint: 'Finish the Terminal Challenge.', check: () => has('game:challenge') },
    { id: 'decorator', name: 'Interior Decorator', icon: 'paint', desc: 'Changed the wallpaper.', hint: 'Pick a new wallpaper.', check: () => has('wallpaper:changed') },
    { id: 'floppy1', name: 'Removable Media', icon: 'floppy', desc: 'Found a first floppy disk.', hint: 'Find a floppy disk.', check: () => OS.game.floppyCount() >= 1 },
    { id: 'floppy-all', name: 'Floppy Archivist', icon: 'floppy', desc: 'Collected every floppy disk.', hint: 'Find all the floppy disks.', check: () => OS.game.floppyCount() >= OS.game.floppyTotal() },
    { id: 'power', name: 'Power User', icon: 'rocket', desc: 'Reached Level 3.', hint: 'Reach Level 3.', check: () => OS.game.level().n >= 3 },
    { id: 'legend', name: 'Portfolio Legend', icon: 'trophy', desc: 'Reached the maximum level.', hint: 'Reach Level 6.', check: () => OS.game.level().n >= 6 },
    { id: 'completionist', name: 'Quest Complete', icon: 'quest', desc: 'Finished every quest in the log.', hint: 'Complete all quests.', check: () => OS.quests && OS.quests.doneCount() >= OS.quests.list.length },
    // Secret achievements stay hidden until earned
    { id: 'konami', name: 'Up Up Down Down', icon: 'key', desc: 'Entered the code everyone\'s older sibling taught them.', secret: true, check: () => has('egg:konami') },
    { id: 'secret-folder', name: 'Hidden Files Enabled', icon: 'secretfolder', desc: 'Found the hidden folder on the desktop.', secret: true, check: () => has('secret:folder') },
    { id: 'dumpster', name: 'Dumpster Diver', icon: 'bin', desc: 'Went through Rory\'s trash.', secret: true, check: () => has('egg:recycle') },
    { id: 'sudo', name: 'Not In The Sudoers File', icon: 'lock', desc: 'Tried to become root. This incident will be reported.', secret: true, check: () => has('egg:sudo') },
    { id: 'deep', name: 'Deep Thought', icon: 'question', desc: 'Found the answer. Still unclear on the question.', secret: true, check: () => has('egg:42') },
    { id: 'matrix', name: 'Free Your Mind', icon: 'terminal', desc: 'Watched the green rain fall.', secret: true, check: () => has('egg:matrix') },
    { id: 'retry', name: 'Abort, Retry, Retry', icon: 'drive', desc: 'Refused to take no for an answer from drive A:.', secret: true, check: () => has('egg:retry') },
    { id: 'crash', name: 'Survivor', icon: 'error', desc: 'Formatted the C: drive and lived.', secret: true, check: () => has('egg:crash') },
    { id: 'dev', name: 'Developer Mode', icon: 'wrench', desc: 'You are now a developer. Sorry.', secret: true, check: () => has('egg:devmode') },
    { id: 'refresh', name: 'Refresh Addict', icon: 'computer', desc: 'Refreshed the desktop five times. It is still the desktop.', secret: true, check: () => has('egg:refresh') },
    { id: 'bonus', name: 'Clean Catch', icon: 'db', desc: 'Played the hidden bonus game.', secret: true, check: () => has('game:catcher') },
    { id: 'restart', name: 'Have You Tried Turning It Off?', icon: 'power', desc: 'Shut down and came back anyway.', secret: true, check: () => has('restarted') },
    { id: 'night', name: 'Night Shift', icon: 'moon', desc: 'Exploring a portfolio between midnight and 5 a.m.', secret: true, check: () => has('night') },
    { id: 'coffee', name: 'Refuelled', icon: 'coffee', desc: 'Asked the terminal for coffee.', secret: true, check: () => has('egg:coffee') },
  ];

  const XP_EACH = 15;

  OS.achievements = {
    list: LIST,
    unlocked: (id) => !!OS.state.achievements[id],
    count: () => Object.keys(OS.state.achievements).length,
    evaluate() {
      for (const a of LIST) {
        if (OS.state.achievements[a.id]) continue;
        let ok = false;
        try { ok = a.check(); } catch (_) { ok = false; }
        if (!ok) continue;
        OS.state.achievements[a.id] = Date.now();
        OS.sound.play('achieve');
        g().toast({ title: 'Achievement unlocked', name: a.name, desc: a.desc, icon: a.icon });
        g().award(`ach:${a.id}`, XP_EACH);
        OS.save();
        OS.emit('achievement', a);
      }
    },
  };
})();
