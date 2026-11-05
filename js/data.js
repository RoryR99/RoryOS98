/*
 * ======================================================================
 *  RoryOS 98 CONTENT FILE. Update your career here, not in the app code.
 * ======================================================================
 * Sources: RoryR_Resume_26.pdf, the previous portfolio site, public GitHub repos and the project brief.
 * Anything not backed by a source is written as [PLACEHOLDER: ...], which the UI highlights in yellow.
 * Search this file for "PLACEHOLDER" to see everything left to complete.
 */
(() => {
  'use strict';

  OS.data = {
    profile: {
      name: 'Rory Rampersad',
      occupation: 'Business Intelligence / Data Analytics',
      currentRole: 'Business Intelligence Analyst, SM Jaleel & Co. Ltd.',
      location: 'Trinidad and Tobago',
      university: 'University of Waterloo',
      degree: 'Honours Bachelor of Mathematics, Mathematics and Business Administration',
      minor: 'Computing',
      status: 'Available for opportunities',
      intro: [
        'I build reporting systems, clean up messy data, and turn business questions into something teams can use.',
        'My background spans analytics, operations, government delivery, and software work, in both public and private sector environments.',
      ],
      education: [
        { school: 'University of Waterloo', where: 'Ontario, Canada', when: 'Sept 2019 - Apr 2023', what: 'Bachelor of Mathematics and Business Administration (Honours), Computing Minor' },
        { school: 'University of Mendoza', where: 'Mendoza, Argentina (online)', when: 'Jul 2024 - Nov 2024', what: 'Postgraduate Diploma, Internet Governance and Regulations' },
      ],
      certifications: [
        'IBM Full Stack Software Developer',
        'Google Project Management',
        'Applied Data Science with Python',
        'Introduction to Cybersecurity and Risk Management',
        'Career Essentials in Data Analysis and Software Engineering',
      ],
      interests: [
        { name: 'Analytics', fit: 'Best match for data and BI roles', detail: 'Building dashboards, KPI models, forecasting views, and reporting pipelines that teams can actually use.' },
        { name: 'Operations', fit: 'Best match for execution-heavy roles', detail: 'Turning moving parts into cleaner workflows, better visibility, and faster decision-making across teams.' },
        { name: 'Software', fit: 'Best match for builder roles', detail: 'Shipping practical web and data tools with a focus on functionality, structure, and real-world usefulness.' },
        { name: 'Leadership', fit: 'Best match for team-facing roles', detail: 'Stepping into ambiguous environments, organizing the work, and keeping people moving toward the outcome.' },
      ],
      strengths: [
        'Pairing technical execution with operational judgment',
        'Data quality, validation and governance',
        'KPI design and dimensional modelling',
        'Reporting automation',
        'Translating stakeholder requirements across Sales, Finance and Operations',
        'Documentation and repeatable procedures',
      ],
      values: 'I care about clarity, performance, and making technical work easier to use day to day.',
      personalInterests: ['[PLACEHOLDER: add two or three personal interests]'],
      goals: [
        'Current focus: Business Intelligence and data systems.',
        'Build clear systems that help people work faster.',
        '[PLACEHOLDER: add the specific role or industry you want next]',
      ],
    },

    contact: {
      email: 'roryrampersad@outlook.com',
      linkedin: 'https://linkedin.com/in/roryrampersad/',
      github: 'https://github.com/RoryR99',
    },

    jobs: [
      {
        id: 'smjaleel',
        company: 'SM Jaleel & Co. Ltd.',
        role: 'Business Intelligence Analyst',
        dates: 'Sept 2025 - Present',
        location: 'Trinidad and Tobago',
        current: true,
        responsibilities: [
          'Design and maintain dimensional data models and database structures supporting performance tracking across 4 business units.',
          'Unify data pipelines across 5+ disparate sources, enforcing data quality and governance controls.',
          'Work with Sales, Finance and Operations to translate business requirements into database-driven reporting and forecasting models.',
        ],
        accomplishments: [
          'Reduced data preparation time by an estimated 30% by unifying pipelines across 5+ sources.',
          'Built 15+ KPIs and dimensional models tracking revenue, customer behaviour and operational throughput across 4 business units.',
          'Delivered 8+ automated Power BI dashboards that replaced manual Excel reporting and reduced monthly reporting cycle time by about 40%.',
          'Built a Geotab fleet analytics solution to track driver activity, route efficiency and fleet utilization.',
        ],
        tools: ['Power BI', 'SQL', 'Python', 'Excel', 'Epicor data', 'Geotab', 'Dimensional modelling'],
      },
      {
        id: 'mdt',
        company: 'Ministry of Digital Transformation',
        role: 'Project Support Officer',
        dates: 'Oct 2023 - Nov 2024',
        location: 'Trinidad and Tobago',
        responsibilities: [
          'Curated government datasets for the national Open Data platform, applying data validation, quality assurance and open data standards.',
          'Maintained PMO project databases and reporting systems, keeping data definitions, access controls and reporting standards aligned with government ICT procedures.',
          'Managed PMO documentation across active digital transformation initiatives.',
        ],
        accomplishments: [
          'Curated and published 20+ government datasets on the national Open Data platform.',
          'Led Smartsheet adoption across the PMO, migrating Excel workflows to structured digital systems.',
          'Trained and guided 10+ stakeholders on Smartsheet and built live tracking dashboards for them.',
        ],
        tools: ['Smartsheet', 'Excel', 'Open Data platform', 'Project databases', 'Data validation'],
      },
      {
        id: 'superpharm',
        company: 'SuperPharm Ltd.',
        role: 'Software Developer Intern',
        dates: 'Aug 2023 - Oct 2023',
        location: 'Trinidad and Tobago',
        responsibilities: [
          'Administered SQL Server databases for a 30+ location retail chain, including log management and routine upkeep.',
          'Developed and maintained database documentation and procedures for repeatable, auditable administration.',
          'Coordinated scanner and printer rollout across retail locations, handling device configuration.',
        ],
        accomplishments: [
          'Optimized SSIS pipelines and database queries for a 20% improvement in query performance and a 15% reduction in response times.',
        ],
        tools: ['SQL Server', 'T-SQL', 'SSIS', 'Query optimisation', 'Database documentation'],
      },
    ],

    projectCategories: ['Business Intelligence', 'Data Analytics', 'Software Development', 'Data Engineering', 'Machine Learning'],

    projects: [
      {
        id: 'otif',
        name: 'OTIF Supply Chain Analytics',
        file: 'OTIF_Analytics',
        icon: 'chart',
        categories: ['Business Intelligence', 'Data Analytics'],
        kind: 'Power BI report',
        description: 'On-time, in-full delivery reporting built on purchase order and receipt data from Epicor.',
        problem: 'Supply chain performance is hard to manage when on-time delivery has to be pieced together from separate purchase order and receipt records.',
        contribution: [
          'Analysed purchase orders against receipts to measure delivery performance.',
          'Built the on-time delivery reporting in SQL and Power BI.',
          'Surfaced supply chain performance insights for the business.',
        ],
        tech: ['SQL', 'Power BI', 'Epicor data', 'Excel'],
        outcomes: ['[PLACEHOLDER: add an outcome you are cleared to share]'],
        note: 'Internal employer work: the report, data and screenshots are not public.',
        links: [],
        shots: [],
      },
      {
        id: 'dataimport',
        name: 'Data Import / ETL Workflows',
        file: 'Data_Import_ETL',
        icon: 'db',
        categories: ['Data Engineering'],
        kind: 'Data pipelines',
        description: 'Data transformation and import workflows that move operational data between systems with quality checks along the way.',
        problem: 'Imports built by hand are slow and let bad records through, so the data needs transforming and validating before it reaches the target system.',
        contribution: [
          'Built data transformation and import workflows.',
          'Applied data quality checks to the records being loaded.',
        ],
        tech: ['SQL', 'Python'],
        outcomes: ['[PLACEHOLDER: add an outcome you are cleared to share]'],
        note: 'Internal employer work: the code and data are not public.',
        links: [],
        shots: [],
      },
      {
        id: 'geotab',
        name: 'GeoTab ETL Pipeline',
        file: 'GeoTab_ETL',
        icon: 'globe',
        categories: ['Data Engineering', 'Data Analytics'],
        kind: 'Python pipeline',
        description: 'A Python ETL pipeline that connects to the GeoTab telematics API, performs geospatial analysis on truck trip data, and exports enriched results alongside interactive visual reports.',
        problem: 'Raw telematics trips do not say whether a truck stopped where it should have. Trips need matching to zones and enriching before logistics teams can act on them.',
        contribution: [
          'Built extract, transform, validate and load stages with a CLI entry point.',
          'Engineered stop features such as nearest zone, stop duration, after-hours stops and high idling.',
          'Generated CSV and Excel outputs, a Folium trip map and an HTML KPI dashboard.',
          'Added data quality checks, rotating logs and unit tests.',
        ],
        tech: ['Python', 'GeoTab API', 'Folium', 'Excel', 'Geospatial analysis'],
        outcomes: ['Produces a multi-sheet workbook, an interactive trip map and a KPI dashboard for any chosen trip window.'],
        links: [{ label: 'GitHub', url: 'https://github.com/RoryR99/GeoTabExceptionReport' }],
        shots: [],
      },
      {
        id: 'tranquiltt',
        name: 'TranquilTT',
        file: 'TranquilTT',
        icon: 'brain',
        categories: ['Software Development'],
        kind: 'Wellness web app',
        award: '1st place, DIA Tech 4 TT Hackathon 2024',
        description: 'A mental wellness web and mobile app built for employees in Trinidad and Tobago, providing curated support resources and tools for managing stress.',
        problem: 'Employees in Trinidad and Tobago need accessible, locally relevant tools and resources for managing stress and mental wellbeing.',
        contribution: [
          'Built it as a product, not just a prototype, with equal attention to delivery, usability and presentation.',
          '[PLACEHOLDER: describe your specific role on the hackathon team]',
        ],
        tech: ['HTML', 'CSS', 'JavaScript', 'Node.js'],
        outcomes: ['Won 1st place at the DIA Tech 4 TT Hackathon 2024.', 'Live demo and pitch deck are public.'],
        links: [
          { label: 'Live demo', url: 'https://tranquiltt.netlify.app/' },
          { label: 'GitHub', url: 'https://github.com/RoryR99/TranquilTT' },
          { label: 'Pitch deck', url: 'https://prezi.com/p/q-mppblmmvt6/tranquiltt/' },
        ],
        shots: [{ src: 'assets/images/tranquiltt-home.png', caption: 'TranquilTT home screen, captured from the live demo.' }],
      },
      {
        id: 'walmart',
        name: 'Walmart Sales Analysis',
        file: 'Walmart_Sales',
        icon: 'chart',
        categories: ['Data Analytics', 'Machine Learning'],
        kind: 'Jupyter notebook',
        description: 'Regression analysis of historical sales from 45 Walmart stores, February 2010 to November 2012, exploring what drives weekly sales and forecasting demand.',
        problem: 'Holidays and economic conditions cause unforeseen demand and stockouts, so better prediction needs to account for events, CPI, unemployment and fuel price.',
        contribution: [
          'Identified top-selling and most variable stores, and Q3 2012 quarterly growth.',
          'Compared holiday and non-holiday sales and built monthly and semester views.',
          'Built and compared linear regression and random forest models for Store 1, testing the impact of CPI, unemployment and fuel price.',
        ],
        tech: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'scikit-learn'],
        outcomes: ['Focused on seasonality, demand patterns and the drivers behind store-level revenue. December shows the clear monthly sales peak.'],
        links: [{ label: 'GitHub', url: 'https://github.com/RoryR99/Walmart-Retail-Sales-Analysis' }],
        shots: [
          { src: 'assets/images/walmart-monthly-sales.png', caption: 'Monthly sales, from the project notebook.' },
          { src: 'assets/images/walmart-yearly-sales.png', caption: 'Yearly sales, from the project notebook.' },
        ],
      },
      {
        id: 'fraud',
        name: 'Credit Card Fraud Detection',
        file: 'Fraud_Detection',
        icon: 'bug',
        categories: ['Machine Learning', 'Data Analytics'],
        kind: 'R classification model',
        description: 'A fraud detection classifier developed in R on an imbalanced transaction dataset, using ensemble approaches.',
        problem: 'Fraud is rare, so an imbalanced dataset can make a model look accurate while it still misses the cases that matter. False negatives carry the real risk.',
        contribution: [
          'Developed and evaluated Random Forest and XGBoost classifiers in R.',
          'Paid particular attention to fraud detection quality and false-negative risk.',
        ],
        tech: ['R', 'Random Forest', 'XGBoost', 'RStudio'],
        outcomes: ['Reached 84.7% accuracy.'],
        links: [{ label: '[PLACEHOLDER: add GitHub link]', url: '' }],
        shots: [],
      },
      {
        id: 'dealership',
        name: 'IBM Cloud Dealership Reviews',
        file: 'Dealership_Reviews',
        icon: 'app',
        categories: ['Software Development'],
        kind: 'Django web app',
        description: 'A full-stack Django application where customers look up car dealership branches by state, read reviews, and submit their own. Built as the IBM Cloud application development capstone.',
        problem: 'A national dealership wanted one central place for customers to find branches and read reviews, to bring transparency and build trust.',
        contribution: [
          'Designed and developed a full-stack system with a structured relational database for persistent storage, filtering and retrieval of records.',
          'Implemented anonymous and authenticated user flows, including account creation and review submission.',
        ],
        tech: ['Python', 'Django', 'SQLite', 'HTML', 'CSS', 'JavaScript'],
        outcomes: ['A complete example of backend logic, persistence and user-facing CRUD workflows.'],
        links: [{ label: 'GitHub', url: 'https://github.com/RoryR99/agfzb-CloudAppDevelopment_Capstone' }],
        shots: [],
      },
    ],

    /*
     * Levels describe evidence, not a self-assigned percentage.
     * Familiar < Working Knowledge < Experienced < Advanced. null shows as "Not rated".
     * These are a first pass from the resume and projects. Raise or lower them as you see fit.
     */
    skillLevels: ['Familiar', 'Working Knowledge', 'Experienced', 'Advanced'],
    skills: [
      { id: 'bi', name: 'Business Intelligence', icon: 'chart', items: [
        { name: 'Power BI', level: 'Experienced', evidence: '8+ automated dashboards at SM Jaleel; OTIF reporting.' },
        { name: 'DAX', level: 'Working Knowledge', evidence: 'Used for KPI measures in Power BI reporting.' },
        { name: 'Power Query', level: 'Working Knowledge', evidence: 'Used for shaping data in Power BI reporting.' },
        { name: 'KPI Design', level: 'Experienced', evidence: '15+ KPIs across 4 business units.' },
        { name: 'Dimensional Modelling', level: 'Experienced', evidence: 'Models supporting performance tracking across 4 business units.' },
      ] },
      { id: 'analysis', name: 'Data Analysis', icon: 'brain', items: [
        { name: 'Excel', level: 'Experienced', evidence: 'Daily tool across every role; replaced manual Excel reporting with automated dashboards.' },
        { name: 'Data Visualization', level: 'Experienced', evidence: 'Power BI dashboards; Matplotlib and Seaborn in project work.' },
        { name: 'Statistical Analysis', level: 'Experienced', evidence: 'University of Waterloo mathematics degree; regression work on 45 Walmart stores.' },
        { name: 'Predictive Modelling', level: 'Working Knowledge', evidence: 'Walmart regression and random forest; R fraud classifiers.' },
        { name: 'Data Quality & Validation', level: 'Experienced', evidence: '20+ government datasets validated for Open Data; controls across 5+ pipeline sources.' },
      ] },
      { id: 'programming', name: 'Programming', icon: 'terminal', items: [
        { name: 'SQL', level: 'Experienced', evidence: 'Core tool across BI work and SQL Server administration.' },
        { name: 'Python', level: 'Experienced', evidence: 'GeoTab ETL pipeline; Walmart analysis; Applied Data Science certification.' },
        { name: 'R', level: 'Working Knowledge', evidence: 'Fraud detection model with Random Forest and XGBoost.' },
        { name: 'JavaScript', level: 'Working Knowledge', evidence: 'TranquilTT; IBM Full Stack certification; this operating system.' },
        { name: 'HTML / CSS', level: 'Working Knowledge', evidence: 'TranquilTT; dealership review platform.' },
        { name: 'Git', level: 'Working Knowledge', evidence: 'Public project history on GitHub.' },
      ] },
      { id: 'databases', name: 'Databases', icon: 'db', items: [
        { name: 'SQL Server', level: 'Experienced', evidence: 'Administered databases for a 30+ location retail chain.' },
        { name: 'T-SQL', level: 'Experienced', evidence: 'Query optimisation with a 20% performance improvement.' },
        { name: 'SSIS / ETL', level: 'Experienced', evidence: 'Optimized SSIS pipelines; unified 5+ data sources.' },
        { name: 'SQLite', level: 'Working Knowledge', evidence: 'Dealership review platform.' },
        { name: 'PostgreSQL', level: null, evidence: '[PLACEHOLDER: add evidence and a level, or remove this entry]' },
      ] },
      { id: 'pm', name: 'Project Management', icon: 'calendar', items: [
        { name: 'Smartsheet', level: 'Experienced', evidence: 'Led PMO adoption and trained 10+ stakeholders.' },
        { name: 'PMO Reporting', level: 'Experienced', evidence: 'Project databases and reporting at the Ministry of Digital Transformation.' },
        { name: 'Project Coordination', level: 'Working Knowledge', evidence: 'Google Project Management certification; multi-site device rollout.' },
      ] },
      { id: 'ops', name: 'Business Operations', icon: 'briefcase', items: [
        { name: 'Stakeholder Collaboration', level: 'Experienced', evidence: 'Sales, Finance and Operations requirements at SM Jaleel.' },
        { name: 'Supply Chain Reporting', level: 'Working Knowledge', evidence: 'OTIF analysis of purchase orders and receipts.' },
        { name: 'Data Governance', level: 'Experienced', evidence: 'Open data standards; data definitions and access controls in government.' },
        { name: 'Documentation & Procedures', level: 'Experienced', evidence: 'Repeatable, auditable database administration procedures.' },
      ] },
    ],

    /* Real-world achievements. These are always shown and never need unlocking. */
    realAchievements: [
      { name: 'University of Waterloo Mathematics Graduate', icon: 'grad', when: 'Apr 2023', desc: 'Honours Bachelor of Mathematics and Business Administration, Computing Minor.' },
      { name: 'DIA Tech 4 TT Hackathon Winner', icon: 'trophy', when: '2024', desc: '1st place with TranquilTT, a mental wellness platform for Trinidad and Tobago.' },
      { name: 'Postgraduate Diploma', icon: 'medal', when: 'Nov 2024', desc: 'Internet Governance and Regulations, University of Mendoza.' },
      { name: 'Built a Full-Stack Application', icon: 'app', when: 'Certified', desc: 'Dealership review platform in Django and SQLite. IBM Full Stack Software Developer certification.' },
      { name: 'Developed BI Reporting Solutions', icon: 'chart', when: 'Since 2025', desc: '8+ automated Power BI dashboards and 15+ KPIs across 4 business units.' },
      { name: 'Published National Open Data', icon: 'globe', when: '2023 - 2024', desc: 'Curated and published 20+ government datasets for Trinidad and Tobago.' },
      { name: 'Data Analysis Projects Completed', icon: 'star', when: 'Ongoing', desc: 'Walmart sales regression, credit card fraud classification, OTIF supply chain analytics and GeoTab fleet analysis.' },
      { name: 'Professional Certifications', icon: 'medal', when: '5 earned', desc: 'IBM Full Stack, Google Project Management, Applied Data Science with Python, Cybersecurity and Risk Management, and Career Essentials in Data Analysis and Software Engineering.' },
    ],

    /* Text documents shown in Notepad and readable from the terminal with TYPE. */
    documents: {
      'readme.txt': `RORYOS 98 - README.TXT
========================

Welcome. You appear to have found Rory Rampersad's computer.

IN A HURRY?
  Resume ............ desktop, double-click "Resume"
  Contact ........... desktop, double-click "Contact"
  Projects .......... desktop, double-click "Projects"
Everything professional is open from the start. No quests required.

HAVE TEN MINUTES?
  Open the Quest Log and start earning XP.
  There are 7 floppy disks hidden around this machine.
  Some things only appear if you know where to look.

SYSTEM REQUIREMENTS
  Curiosity (minimum 1).
  A mouse or a finger.

HINT: the terminal knows more than HELP tells you.
`,
      'do_not_open.txt': `You opened it anyway.

That is exactly the attitude this system rewards.

Nothing to see here.

Keep scrolling if you have nothing better to do.
${'\n'.repeat(38)}
Still here? Good. Here is a maintenance note left by the sysadmin:

  "Taped a spare floppy under the system clock.
   It only comes loose if you tap the clock five times.
   Do not tell anyone."

                                 - R.
`,
      'dev_notes.txt': `DEVELOPER NOTES - DO NOT DISTRIBUTE (please distribute)

- Built with plain HTML, CSS and JavaScript. No frameworks were harmed.
- All icons are hand-typed text, rendered to pixels when the page loads.
- All sounds are synthesized, and off until you turn them on.
- Your progress lives only in this browser's localStorage.

Unfinished business:
- Teach the Recycle Bin to let go of the past.
- Stop naming files final_FINAL_v3.

Try these in the terminal: DEVMODE, XYZZY, COFFEE, HIRE.
`,
    },

    /* Recycle Bin contents. Purely jokes, except for the one that is not. */
    recycled: [
      { name: 'resume_final_FINAL_v7.doc', icon: 'doc', joke: 'Version 8 is the real one. Probably.' },
      { name: 'vlookup_nested_11_levels.xlsx', icon: 'chart', joke: 'This file calculated for nine days, then returned #N/A.' },
      { name: 'dashboard_nobody_opened.pbix', icon: 'chart', joke: 'Fifty-two visuals. One viewer. The viewer was its author.' },
      { name: 'SELECT_star_in_production.sql', icon: 'db', joke: 'We do not speak of what happened on that Tuesday.' },
      { name: 'quick_favour_5_mins.txt', icon: 'notepad', joke: 'Estimated time: 5 minutes. Time elapsed: 3 weeks.' },
      { name: 'old_disk.flp', icon: 'floppy', floppy: 'recycle' },
    ],

    /* Data Detective Quiz */
    quiz: {
      easy: [
        { q: 'Which SQL clause filters rows before any grouping happens?', a: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], c: 0, why: 'WHERE filters individual rows. HAVING filters after GROUP BY.' },
        { q: 'What does ETL stand for?', a: ['Extract, Transform, Load', 'Evaluate, Test, Launch', 'Export, Translate, Link', 'Encode, Tabulate, Log'], c: 0, why: 'Pull data out, reshape it, and load it into a target.' },
        { q: 'In Python, which library is the standard choice for tabular DataFrames?', a: ['pandas', 'requests', 'flask', 'pytest'], c: 0, why: 'pandas provides the DataFrame.' },
        { q: 'Which chart best shows a trend over time?', a: ['Line chart', 'Pie chart', 'Scatter of random samples', 'Word cloud'], c: 0, why: 'Lines read naturally as change across time.' },
        { q: 'What does KPI stand for?', a: ['Key Performance Indicator', 'Known Process Input', 'Key Pivot Index', 'Kernel Performance Interface'], c: 0, why: 'A measurable value that tracks progress toward an objective.' },
        { q: 'Which SQL keyword removes duplicate rows from a result?', a: ['DISTINCT', 'UNIQUE ROWS', 'DEDUPE', 'SINGLE'], c: 0, why: 'SELECT DISTINCT returns each unique row once.' },
        { q: 'In Power BI, which language is used to write measures?', a: ['DAX', 'VBA', 'XSLT', 'Bash'], c: 0, why: 'DAX, or Data Analysis Expressions, powers measures and calculated columns.' },
        { q: 'What does NULL mean in a database?', a: ['The value is missing or unknown', 'The number zero', 'An empty string', 'The text "NULL"'], c: 0, why: 'NULL is the absence of a value, not zero or blank.' },
        { q: 'OTIF in supply chain reporting stands for:', a: ['On Time In Full', 'Order Tracking In Flow', 'Outbound Transit Invoice File', 'Open Ticket Item Form'], c: 0, why: 'Did the delivery arrive when promised, with everything ordered?' },
        { q: 'What is the Python list comprehension for squares of 0 to 2?', a: ['[x**2 for x in range(3)]', '[x^^2 in 3]', 'squares(0, 2)', '{x: range(3)}'], c: 0, why: 'range(3) yields 0, 1, 2, and x**2 squares each.' },
      ],
      medium: [
        { q: 'A LEFT JOIN returns:', a: ['All left rows, plus matches from the right', 'Only rows matching on both sides', 'All right rows, plus matches from the left', 'Every combination of rows'], c: 0, why: 'Left rows with no match get NULLs for the right columns.' },
        { q: 'What is a fact table in a star schema?', a: ['Measurable events, with keys to dimensions', 'Lookup values describing an entity', 'A backup of the source system', 'A list of database users'], c: 0, why: 'Facts hold the numbers; dimensions describe them.' },
        { q: 'What is the result of COUNT(column) when some values are NULL?', a: ['It skips the NULLs', 'It counts the NULLs too', 'It raises an error', 'It returns NULL'], c: 0, why: 'COUNT(*) counts rows, but COUNT(column) ignores NULLs.' },
        { q: 'Which pandas call gives the mean of sales per store?', a: ["df.groupby('store')['sales'].mean()", "df.mean('store', 'sales')", "df.pivot('mean')", "df['store'].sales.avg"], c: 0, why: 'Split with groupby, select the column, then aggregate.' },
        { q: 'In DAX, what does CALCULATE primarily do?', a: ['Evaluates an expression in a modified filter context', 'Creates a new table in the source', 'Refreshes the dataset', 'Sorts a visual'], c: 0, why: 'Changing filter context is what makes CALCULATE so powerful.' },
        { q: 'What does a correlation of about 0 between two variables suggest?', a: ['Little or no linear relationship', 'They are identical', 'One causes the other', 'A data entry error'], c: 0, why: 'There may still be a non-linear relationship, but no linear one.' },
        { q: 'Which window function numbers rows with no ties or gaps?', a: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'NTILE(1)'], c: 0, why: 'RANK and DENSE_RANK give ties the same number. ROW_NUMBER never does.' },
        { q: 'What is the main purpose of an index on a table?', a: ['Speeding up reads', 'Encrypting the column', 'Compressing backups', 'Enforcing a business rule on every report'], c: 0, why: 'It trades extra storage and slower writes for faster lookups.' },
        { q: 'Which is the best first step for a slow query?', a: ['Read the execution plan', 'Buy a bigger server', 'Rename the tables', 'Rewrite it in Python'], c: 0, why: 'Measure first. The plan shows where the time actually goes.' },
        { q: 'What is Power Query mainly for?', a: ['Extracting and shaping data before modelling', 'Sending dashboards by email', 'Designing report themes', 'Managing workspace users'], c: 0, why: 'Power Query is the ETL layer in front of the data model.' },
      ],
      hard: [
        { q: 'On a dataset with 0.2% fraud, a model predicts "not fraud" every time. Its accuracy is:', a: ['99.8%, and it is useless', '0.2%', '50%', 'Undefined'], c: 0, why: 'Accuracy misleads on imbalanced data. Look at recall and precision.' },
        { q: 'Which metric focuses on missed fraud cases?', a: ['Recall', 'Precision', 'R-squared', 'MAPE'], c: 0, why: 'Recall = TP / (TP + FN), so false negatives directly lower it.' },
        { q: 'A Type 2 slowly changing dimension:', a: ['Adds a new row per change, keeping history', 'Overwrites the old value', 'Deletes changed rows', 'Stores changes in a text file'], c: 0, why: 'Validity dates or a current flag preserve the full history.' },
        { q: 'What does `WHERE col <> 5` do with rows where col is NULL?', a: ['Excludes them', 'Includes them', 'Errors', 'Converts NULL to 0'], c: 0, why: 'A comparison with NULL is UNKNOWN, and WHERE only keeps TRUE.' },
        { q: 'A training R² of 0.94 with test R² of 0.15 most likely means:', a: ['Overfitting', 'Underfitting', 'A perfect model', 'Too little training accuracy'], c: 0, why: 'A big gap between train and test is the classic overfitting signal.' },
        { q: 'A CTE in SQL is best described as:', a: ['A named result set scoped to one statement', 'A permanent indexed table', 'A stored procedure', 'A type of database backup'], c: 0, why: 'WITH name AS (...) lasts only for the statement that uses it.' },
        { q: 'Which is most likely to make a filter non-sargable?', a: ['WHERE YEAR(order_date) = 2025', 'WHERE order_date >= \'2025-01-01\'', 'WHERE id = 7', 'WHERE code IN (1, 2)'], c: 0, why: 'Wrapping the column in a function can stop an index seek.' },
        { q: 'A bidirectional relationship in a Power BI model risks:', a: ['Ambiguous filter paths and slower performance', 'Automatic data loss', 'Disabling all DAX', 'Removing row-level security entirely'], c: 0, why: 'Single-direction star schemas are simpler and more predictable.' },
        { q: 'In Python, what does `df.merge(b, how="left")` risk if keys in b are not unique?', a: ['Row multiplication', 'Dropping all left rows', 'A syntax error', 'Sorting the output'], c: 0, why: 'Each duplicate match adds a row. validate="many_to_one" catches it.' },
        { q: 'A p-value of 0.03 means:', a: ['Data this extreme has a 3% chance if the null hypothesis is true', 'There is a 97% chance the effect is real', 'The effect is large', 'The null hypothesis has a 3% probability'], c: 0, why: 'It describes the data under the null, not the probability of the hypothesis.' },
      ],
    },
  };
})();
