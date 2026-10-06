// Knowledge setup workflow. Four layers, walked in order:
//   1. Pre-built — ships with Buildertrend, nothing to do
//   2. Business — crawled from your website, plus what you tell us
//   3. Project — files on the jobs you already run
//   4. SOPs — the 28 processes every builder runs, yours or ours
//
// The SOP framework is the point of the whole flow: it exists before you
// upload anything, so you can see the shape of what you are missing.

export const setupSteps = [
  { id: 'prebuilt', n: 1, title: 'Pre-built knowledge', blurb: 'What every Buildbot already knows' },
  { id: 'business', n: 2, title: 'Business knowledge', blurb: 'Who you are and how you work' },
  { id: 'project', n: 3, title: 'Project knowledge', blurb: 'Files on the jobs you run' },
  { id: 'sop', n: 4, title: 'Your SOPs', blurb: '28 processes, yours or ours' },
]

// Layer 1 — library sources. `locked` ones cannot be turned off.
export const prebuiltSources = [
  {
    id: 'bt',
    title: 'Buildertrend knowledge',
    detail: 'Training manuals, release notes, best practices',
    meta: '412 articles',
    locked: true,
    on: true,
  },
  {
    id: 'osha',
    title: 'OSHA 29 CFR 1926',
    detail: 'Construction safety standards, fall protection, trenching',
    meta: 'Updated monthly',
    on: true,
  },
  {
    id: 'irc',
    title: 'IRC 2021 + Texas amendments',
    detail: 'Residential code as adopted statewide',
    meta: '2021 cycle',
    on: true,
  },
  {
    id: 'city',
    title: 'City codes and permit rules',
    detail: 'Frisco, Prosper, Celina, McKinney — matched to your service area',
    meta: '4 jurisdictions',
    on: true,
  },
  {
    id: 'nahb',
    title: 'NAHB residential construction performance guidelines',
    detail: 'Tolerances for callbacks and warranty disputes',
    meta: '5th edition',
    on: true,
  },
  {
    id: 'manufacturer',
    title: 'Manufacturer installation guides',
    detail: 'Hardie, Andersen, Kohler, Trex and 60 more — warranty terms included',
    meta: '64 brands',
    on: true,
  },
  {
    id: 'lien',
    title: 'Texas lien and contract law',
    detail: 'Notice deadlines, retainage, residential contract requirements',
    meta: 'Ch. 53 Property Code',
    on: false,
  },
  {
    id: 'energy',
    title: 'Energy code and ENERGY STAR',
    detail: 'IECC 2021, blower-door and duct-leakage targets',
    meta: 'IECC 2021',
    on: false,
  },
]

// Layer 2 — what the bots should hear in your own words. Prompts, not a form.
export const businessPrompts = [
  { id: 'what', label: 'What you build', placeholder: 'Custom homes and whole-home remodels, 8–12 a year, Frisco and the surrounding towns.' },
  { id: 'who', label: 'Who you build for', placeholder: 'Move-up families and empty nesters, $350k to $1.4M, usually referred by a past client or an architect.' },
  { id: 'how', label: 'How you like to work', placeholder: 'One PM per job. We walk the site Fridays. Homeowners hear from us weekly whether or not there is news.' },
  { id: 'never', label: 'Things we never do', placeholder: 'No verbal change orders. No selections past the deadline without a signed delay notice.' },
]

// What the website crawl writes into the business profile, in order.
export const businessDraft = {
  what: 'Custom homes and whole-home remodels, 8–12 a year, in Frisco, Prosper, Celina and McKinney.',
  who: 'Move-up families and empty nesters. Projects run $350k to $1.4M, mostly referrals from past clients and architects.',
  how: 'Plain, direct communication. One PM per job. Weekly homeowner update whether or not there is news.',
  never: '',
}

// Layer 3 — nothing to configure, so this step explains rather than collects.
export const projectKnowledge = {
  blurb: 'Every file already attached to a job is context. Plans, specs, signed selections, submittals, warranty letters — bots read them where they sit, on the job they belong to.',
  examples: [
    { title: 'Plans and specs', detail: 'Current revision only. Superseded sheets are ignored.' },
    { title: 'Signed proposals and change orders', detail: 'Scope language, allowances, exclusions.' },
    { title: 'Selections sheets', detail: 'Model numbers, lead times, who approved what.' },
    { title: 'Submittals and cert of insurance', detail: 'Which subs are current, which lapsed.' },
    { title: 'Daily logs and photos', detail: 'What happened on site, in order.' },
  ],
  note: 'Drop anything else here and it attaches to the job you choose. No separate upload step for the bots — they read what the job already has.',
}

// Layer 4 — the framework. Every builder runs these 28 processes whether or
// not they have written them down. Each one is defined by the same 11
// questions (who owns it, what triggers it, what Buildertrend records it,
// what the deadline is, what happens when it slips, and so on).
export const SOP_QUESTIONS = 11

export const sopGroups = [
  {
    id: 'foundation',
    letter: 'A',
    title: 'Foundation',
    processes: [
      { n: 1, id: 'users-roles', title: 'Users, Roles & Permissions', covered: 8, detail: 'Internal roles, sub/vendor divisions, customer contacts, who owns what, handoff points' },
      { n: 2, id: 'cost-catalog', title: 'Cost Catalog, Templates & Naming Standards', covered: 10, detail: 'Cost codes, catalog items, cost groups, job/estimate/schedule templates, job prefixes and naming rules' },
      { n: 3, id: 'accounting-setup', title: 'Accounting & Integrations Setup', covered: 11, detail: 'QuickBooks/Sage connection, vendor linking, Home Depot, payment processing, Takeoff, CRM' },
    ],
  },
  {
    id: 'sales',
    letter: 'B',
    title: 'Sales',
    processes: [
      { n: 4, id: 'lead-management', title: 'Lead Management', covered: 11, detail: 'Intake, tags/source/project type, activities and activity templates, qualifying, lead reporting' },
      { n: 5, id: 'precon-agreements', title: 'Pre-Construction Agreements & Deposits', covered: 5, detail: 'Design or preliminary agreements, client questionnaires, pre-con deposit' },
    ],
  },
  {
    id: 'preconstruction',
    letter: 'C',
    title: 'Pre-Construction',
    processes: [
      { n: 6, id: 'job-setup', title: 'Job Setup', covered: 11, detail: 'Converting a lead to a presale job, job details, what the template imports, job groups' },
      { n: 7, id: 'estimating', title: 'Estimating', covered: 10, detail: 'Building the estimate, Excel/Takeoff import, markup and contingency, optional groups, locking it and sending it to the budget' },
      { n: 8, id: 'plans-specs', title: 'Plans & Specifications', covered: 6, detail: '' },
      { n: 9, id: 'bids', title: 'Bids & Bid Packages', covered: 9, detail: 'Creating packages, inviting subs, due dates, entering bids received outside Buildertrend, approving, revising, two-round bidding' },
      { n: 10, id: 'selections', title: 'Selections & Allowances', covered: 8, detail: '' },
      { n: 11, id: 'proposals', title: 'Proposals & Contracts', covered: 10, detail: 'Contract wording, how the proposal is presented, releasing it, e-sign and countersign, tracking' },
      { n: 12, id: 'sold-handoff', title: 'Sold-Job Handoff', covered: 5, detail: 'Moving a presale job to open, client portal invite, handing off from sales to the PM' },
    ],
  },
  {
    id: 'production',
    letter: 'D',
    title: 'Production',
    processes: [
      { n: 13, id: 'schedule', title: 'Schedule', covered: 11, detail: '' },
      { n: 14, id: 'tasks-punch', title: 'Tasks & Punch Lists', covered: 11, detail: '' },
      { n: 15, id: 'daily-logs', title: 'Daily Logs', covered: 11, detail: '' },
      { n: 16, id: 'time-clock', title: 'Time Clock & Labor', covered: 6, detail: '' },
      { n: 17, id: 'client-updates', title: 'Client Updates & Client Portal', covered: 9, detail: '' },
    ],
  },
  {
    id: 'financial',
    letter: 'E',
    title: 'Financial Management',
    processes: [
      { n: 18, id: 'purchase-orders', title: 'Purchase Orders', covered: 10, detail: '' },
      { n: 19, id: 'change-orders', title: 'Change Orders', covered: 10, detail: '' },
      { n: 20, id: 'bills-payables', title: 'Bills, Cost Inbox & Payables', covered: 11, detail: '' },
      { n: 21, id: 'owner-invoicing', title: 'Owner Invoicing, Draws & Payments', covered: 11, detail: '' },
      { n: 22, id: 'job-costing', title: 'Job Costing Budget', covered: 11, detail: '' },
    ],
  },
  {
    id: 'closeout',
    letter: 'F',
    title: 'Closeout',
    processes: [
      { n: 23, id: 'job-closeout', title: 'Job Closeout', covered: 7, detail: '' },
      { n: 24, id: 'warranty', title: 'Warranty', covered: 7, detail: '' },
    ],
  },
  {
    id: 'cross',
    letter: 'G',
    title: 'Cross-Functional',
    processes: [
      { n: 25, id: 'files-docs', title: 'Files & Document Control', covered: 9, detail: 'Revisions, QR codes, signatures, sub certifications' },
      { n: 26, id: 'communication', title: 'Communication', covered: 10, detail: 'Messages, comments, chat, client/sub permissions' },
      { n: 27, id: 'mobile-routine', title: 'Mobile App Daily Routine', covered: 6, detail: '' },
      { n: 28, id: 'reporting-surveys', title: 'Reporting & Surveys', covered: 5, detail: '' },
    ],
  },
]

export const sopProcesses = sopGroups.flatMap((g) => g.processes.map((p) => ({ ...p, groupId: g.id, groupTitle: g.title })))

export const SOP_TOTAL = sopProcesses.length
export const SOP_COVERED_TOTAL = sopProcesses.reduce((n, p) => n + p.covered, 0)
export const SOP_POSSIBLE_TOTAL = SOP_TOTAL * SOP_QUESTIONS

// The file the demo "uploads". Reading it fills the framework in.
export const sopUploadFile = {
  title: 'Northaven Homes Operations Manual',
  file: 'Northaven SOP Manual v4.pdf',
  size: '6.4 MB',
  pages: 148,
  readSteps: [
    'Reading 148 pages',
    'Matching sections to the 28 processes',
    'Pulling owners, triggers and deadlines',
    'Flagging what the manual never answers',
  ],
}

export const sopCallToAction = {
  title: 'Do not have this written down?',
  body: 'Most builders do not. A Buildertrend consultant sits with your team, works through the 11 questions for the processes you care about, and loads the answers here when you are done.',
  primary: 'Have Buildertrend build my SOPs',
  secondary: 'Write one with a bot instead',
  meta: 'Typically two remote sessions per process area',
}
