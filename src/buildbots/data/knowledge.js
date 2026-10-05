// Three knowledge layers. Every bot draws on all three.

export const buildertrendKnowledge = {
  id: 'bt',
  title: 'Buildertrend knowledge',
  articles: 412,
  line: '412 articles, always current',
  blurb: 'Training manuals, best practices and SOPs Buildertrend publishes. Always on.',
  sourcePill: 'Buildertrend Best Practices',
}

// Business knowledge: connect cards. `status`: 'connected' | 'available'.
// `learned` is what the crawl surfaces, each statement editable in the UI.
export const businessSources = [
  {
    id: 'website',
    title: 'Your website',
    detail: 'northavenhomes.com',
    status: 'connected',
    crawlSteps: ['Reading 14 pages', 'Pulling service area and trades', 'Reading warranty page', 'Matching brand voice'],
    learned: [
      'Service area: Frisco, Prosper, Celina and McKinney',
      'Trades offered: whole-home custom, additions, kitchen and bath remodels',
      'Typical project size: $350k to $1.4M',
      'Brand voice: plain, direct, no superlatives',
      'Warranty terms: one year workmanship, two years systems, ten years structural',
    ],
  },
  {
    id: 'facebook',
    title: 'Facebook',
    detail: 'Northaven Homes',
    status: 'available',
    crawlSteps: ['Reading 86 posts', 'Pulling finished-job photos', 'Reading comments'],
    learned: [
      'Posts about twice a month, mostly finished kitchens',
      'Homeowners comment on trim carpentry more than anything else',
      'Three five-star reviews mention the walkthrough process by name',
    ],
  },
  {
    id: 'instagram',
    title: 'Instagram',
    detail: '@northavenhomes',
    status: 'available',
    crawlSteps: ['Reading 212 posts', 'Pulling finished-job photos', 'Reading captions'],
    learned: [
      'Strongest engagement on exterior reveals',
      'Caption voice is shorter than the website',
    ],
  },
  {
    id: 'gbp',
    title: 'Google Business Profile',
    detail: '4.9 stars, 61 reviews',
    status: 'available',
    crawlSteps: ['Reading 61 reviews', 'Pulling hours and service area', 'Reading Q&A'],
    learned: [
      'Reviews mention schedule communication 23 times',
      'Two reviews mention slow warranty response',
      'Hours listed: 7am to 5pm weekdays',
    ],
  },
  {
    id: 'upload',
    title: 'Upload documents',
    detail: 'Brochures, past proposals, anything',
    status: 'available',
    crawlSteps: ['Reading 3 files', 'Extracting statements'],
    learned: ['Standard allowance schedule by room', 'Selections lead times by vendor'],
  },
]

// Derived from Buildertrend history — always present.
export const derivedFromJobs = {
  id: 'derived',
  title: 'Learned from your last 180 jobs',
  facts: [
    'Average cycle time, custom home: 11.4 months',
    'Trades you use most: Vega Framing, Redline Plumbing, Allstar Electric',
    'Framing runs long on 38% of jobs, usually by 4 to 6 days',
    'Change orders average 6 per job, median $4,200',
    'Punch lists close in 19 days on average',
  ],
}

// Project and SOP knowledge. The statuses are the point.
// 'indexed' | 'thin' | 'missing'
export const sopDocuments = [
  { id: 'punch-walkthrough', title: 'Punch List Walkthrough', status: 'indexed', pages: 6, updated: '2026-06-12' },
  { id: 'change-order-policy', title: 'Change Order Policy', status: 'indexed', pages: 3, updated: '2026-02-03' },
  { id: 'warranty-response', title: 'Warranty Response', status: 'thin', pages: 1, updated: '2024-11-20', gap: 'One page, no response-time targets, no homeowner communication steps.' },
  { id: 'selections-deadlines', title: 'Selections Deadlines', status: 'missing', pages: 0, updated: null, gap: 'Referenced in two proposals, never written down.' },
]

export const sopById = Object.fromEntries(sopDocuments.map((s) => [s.id, s]))

export const consultingCard = {
  body: 'I do not have your process for this. Want to write it with me, or have a Buildertrend consultant help build it with your team?',
  writeLabel: 'Write it with me',
  consultantLabel: 'Talk to a consultant',
}
