# RoryOS 98

The portfolio of **Rory Rampersad**, Business Intelligence Analyst, delivered as a small retro desktop operating system.

**Live site:** https://roryr99.github.io/RoryOS98/

Visitors explore a working desktop: draggable windows, a Start menu, a terminal, an arcade, quests, XP and hidden floppy disks. Recruiters can reach the resume, projects and contact details in one click, without completing anything.

It is plain HTML, CSS and JavaScript. There is no framework, build step, backend, database, API key or external service.

## Run it locally

Any static server works. From the project folder:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/. You can also open `index.html` directly, because the scripts are classic scripts rather than ES modules.

## Update your content

**Edit [`js/data.js`](js/data.js).** All career content lives there: profile, jobs, projects, skills, real-world achievements, documents and quiz questions. No application code needs to change.

### Placeholders

To mark something as unfinished, write `[PLACEHOLDER: ...]` in `js/data.js` and the site highlights it in yellow. None are in use right now.

### Skill levels

Skills use `Familiar`, `Working Knowledge`, `Experienced` or `Advanced` rather than percentages, each with a line of evidence. The current levels are a first pass inferred from the resume and projects, so review them. DAX and Power Query in particular are inferred from Power BI work.

### Other common changes

- **Resume:** replace `assets/resume/Rory_Rampersad_Resume.pdf`, keeping the filename.
- **Screenshots:** add images to `assets/images/` and list them under a project's `shots` in `js/data.js`.
- **New project:** add an object to `projects` in `js/data.js`. Folders, filters, quests, XP and the terminal's SQL tables pick it up automatically.

## Deploy to GitHub Pages

Deployment is automatic. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publishes the site on every push to `main`.

For a fresh fork or copy:

1. Push the project to a GitHub repository.
2. Go to **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`, or run the workflow from the **Actions** tab.

Every asset path is relative, and app links use the URL hash (for example `#projects/tranquiltt`), so the site works from a `username.github.io/repository/` subdirectory with no server configuration.

GitHub Pages sites are public, so anything committed here, including the resume PDF, is public too.

## Deep links

Send someone straight to a program, skipping the boot sequence:

| Link suffix | Opens |
|---|---|
| `#resume` | Resume |
| `#contact` | Contact |
| `#projects` | Projects Explorer |
| `#projects/tranquiltt` | A specific project (use its `id` from `data.js`) |
| `#experience`, `#skills`, `#about`, `#achievements`, `#quests`, `#arcade`, `#terminal` | That program |

## Project layout

```
index.html              Page shell, plus a plain profile for no-JS visitors and crawlers
assets/                 Favicon, project screenshots and the resume PDF
css/
  styles.css            Design tokens and shared chrome (bevels, buttons, progress bars)
  desktop.css           Desktop, taskbar, Start menu, boot and full-screen sequences
  windows.css           Window chrome and application layouts
  games.css             Arcade, games and terminal
js/
  core.js               Namespace, helpers, event bus, localStorage state
  icons.js              Pixel icons and cursors, drawn as text and rendered at startup
  data.js               ALL PORTFOLIO CONTENT
  ui.js                 Menus, dialogs, tabs, icon grids, tooltips, sound
  windowManager.js      Window lifecycle, drag, resize, focus, taskbar
  gamification.js       XP, levels, notifications, floppy disks
  achievements.js       Visitor achievements
  quests.js             Quests
  desktop.js            Icons, wallpapers, context menu, tray, boot, shutdown
  startMenu.js          Start menu
  applications.js       Portfolio apps and system utilities
  terminal.js           Command parser, SQL engine, Terminal Challenge
  games.js              Arcade and games
  main.js               Startup and deep links
```

To add a program, register `OS.apps.myapp = { title, icon, w, h, render(win, args) {} }` and call `OS.open('myapp')`.

## What is in the box

**Desktop:** icons you can select, drag and open; multiple windows with drag, resize, minimize, maximize and focus; taskbar; Start menu with flyouts; context menus; marquee selection; wallpapers; shutdown and restart.

**Portfolio:** About, Work Experience timeline, Projects Explorer with category filters and search, Skills Explorer, Achievements, Resume viewer and download, Contact.

**Progression:** XP that pays out once per action, 6 levels, 7 quests, 36 visitor achievements, 7 hidden floppy disks and a Disk Box. Progress is saved in `localStorage`, and only in the visitor's browser.

**Arcade:**

- **Null Hunter:** an original logic-deduction game about finding bad records in a table.
- **Data Detective Quiz:** 30 questions across three difficulties.
- **Reaction Test:** with a saved personal best.
- **Terminal Challenge:** five cases solved with real SQL, run by a small engine in `terminal.js`.
- **Query Catcher:** a hidden bonus game.

**Terminal:** a working command parser with history and tab completion. Type `HELP`. Not everything is documented.

**Accessibility:** keyboard-operable menus, dialogs and tabs; visible focus; reduced-motion support; sound off by default; a plain-text profile via the skip link.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari, on desktop and mobile.

Microsoft and Windows are trademarks of Microsoft Corporation. This is an independent personal project inspired by 1990s desktop computing, with original icons, sounds and games.
