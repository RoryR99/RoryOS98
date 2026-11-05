/* Quest definitions and tracking. The Quest Log app renders these. Nothing professional is ever locked behind a quest. */
(() => {
  'use strict';
  const has = (f) => OS.game.has(f);
  const count = (p) => OS.game.count(p);
  const check = (label, test, open) => ({ label, test, open });
  const tally = (label, fn, need, open) => ({ label, test: () => fn() >= need, progress: () => `${Math.min(fn(), need)}/${need}`, open });

  const LIST = [
    { id: 'know', name: 'Getting to Know the User', blurb: 'Who owns this computer, anyway?', steps: [
      check('Open About Rory', () => has('about:open'), ['about']),
      check('Discover education', () => has('about:education'), ['about', { tab: 'education' }]),
      check('Discover career interests', () => has('about:interests'), ['about', { tab: 'interests' }]),
    ] },
    { id: 'career', name: 'Career Explorer', blurb: 'Follow the employment trail.', steps: [
      check('Open Work Experience', () => has('app:experience'), ['experience']),
      tally('Explore at least two positions', () => count('job:'), 2, ['experience']),
    ] },
    { id: 'detective', name: 'Data Detective', blurb: 'The evidence is in the Projects folder.', steps: [
      check('Open Projects', () => has('app:projects'), ['projects']),
      tally('Explore three projects', () => count('project:'), 3, ['projects']),
    ] },
    { id: 'specialist', name: 'Technical Specialist', blurb: 'Prove you can talk shop.', steps: [
      check('Explore the Skills application', () => has('app:skills'), ['skills']),
      check('Pass a technical quiz', () => has('game:quiz'), ['quiz']),
    ] },
    { id: 'hunter', name: 'Achievement Hunter', blurb: 'Five trophies for the shelf.', steps: [
      tally('Unlock five achievements', () => OS.achievements.count(), 5, ['achievements']),
    ] },
    { id: 'contact', name: 'Contact Unlocked', blurb: 'The real final boss: sending an email.', steps: [
      check('Discover the Contact application', () => has('contact:open'), ['contact']),
    ] },
    { id: 'archivist', name: 'The Full Install', blurb: 'This software shipped on seven disks, and they are all over the place.', steps: [
      tally('Collect every floppy disk', () => OS.game.floppyCount(), 7),
    ] },
  ];

  const isDone = (q) => q.steps.every((s) => s.test());

  OS.quests = {
    list: LIST,
    isDone: (id) => !!OS.state.quests[id],
    doneCount: () => Object.keys(OS.state.quests).length,
    evaluate() {
      for (const q of LIST) {
        if (OS.state.quests[q.id] || !isDone(q)) continue;
        OS.state.quests[q.id] = Date.now();
        OS.sound.play('achieve');
        OS.game.toast({ title: 'Quest complete', name: q.name, desc: `Reward: ${OS.game.XP.quest} XP`, icon: 'quest' });
        OS.game.action('quest', q.id);
        OS.save();
      }
    },
  };
})();
