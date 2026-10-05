// Document payloads rendered in the live pane. The store deep-clones these
// at init so approvals can patch them without leaking into module constants.
// Each has a `type` the DocumentMode switch understands.

// Produced live during the Shop Foreman interview ("Write it with me").
// Not in `documents` at init — the scenario adds it with a setDoc effect.
export const sopWarrantyResponse = {
  id: 'sop-warranty-response',
  type: 'sop',
  title: 'Warranty Response',
  status: 'indexed',
  owner: 'Dana Whitfield',
  written: 'Today, with Shop Foreman',
  sections: [
    { heading: 'Response time', body: 'Homeowner hears back the same business day. A fix is scheduled within five business days of the report.' },
    { heading: 'Who approves', body: 'Dana Whitfield approves anything over $500 or anything that touches structure, roofing or plumbing. Under $500, the bot schedules the trade directly.' },
    { heading: 'Communication', body: 'Every warranty item gets three touches: acknowledgment on receipt, a date when scheduled, and a confirmation when closed. All under Northaven Homes, signed by Warranty Follow-up, each one approved before it goes out.' },
    { heading: 'Covered', body: 'One year workmanship, two years systems, ten years structural, per the website warranty page.' },
    { heading: 'Escalation', body: 'If a trade has not confirmed within two business days, the bot flags Dana and proposes a second trade.' },
  ],
}

export const documents = {
  // The Pike Street construction set as Bid Coordinator read it: the sheet
  // index with the plumbing sheets flagged, and the scope it pulled off them.
  'pike-plumbing-set': {
    id: 'pike-plumbing-set',
    type: 'planset',
    title: 'Pike Street — Construction Set rev2',
    jobId: 'pike',
    file: 'Pike Street — Construction Set rev2.pdf',
    size: '18.4 MB',
    sheets: 24,
    revision: 'Rev 2 · Sep 29, 2026',
    savedTo: 'Pike Street Spec → Documents → Plans',
    flaggedTrade: 'Plumbing',
    groups: [
      { name: 'General', sheets: [
        { no: 'G0.0', title: 'Cover, index, vicinity' },
        { no: 'G0.1', title: 'Code summary, energy compliance' },
      ] },
      { name: 'Architectural', sheets: [
        { no: 'A1.0', title: 'Site plan' },
        { no: 'A2.0', title: 'Foundation plan' },
        { no: 'A2.1', title: 'First floor plan', rev: true },
        { no: 'A2.2', title: 'Second floor plan' },
        { no: 'A3.0', title: 'Exterior elevations' },
        { no: 'A3.1', title: 'Exterior elevations' },
        { no: 'A4.0', title: 'Building sections' },
        { no: 'A5.0', title: 'Wall sections and details' },
        { no: 'A6.0', title: 'Door, window and finish schedules' },
      ] },
      { name: 'Structural', sheets: [
        { no: 'S1.0', title: 'Foundation plan and notes' },
        { no: 'S2.0', title: 'First floor framing' },
        { no: 'S2.1', title: 'Roof framing' },
      ] },
      { name: 'Plumbing', flagged: true, sheets: [
        { no: 'P0.0', title: 'Plumbing notes and fixture schedule' },
        { no: 'P1.0', title: 'Underslab plumbing plan' },
        { no: 'P1.1', title: 'First floor plumbing plan', rev: true },
        { no: 'P1.2', title: 'Second floor plumbing plan' },
        { no: 'P2.0', title: 'Waste and vent risers' },
        { no: 'P2.1', title: 'Gas piping plan' },
      ] },
      { name: 'Electrical', sheets: [
        { no: 'E1.0', title: 'Electrical site and panel schedule' },
        { no: 'E1.1', title: 'First floor power and lighting' },
        { no: 'E1.2', title: 'Second floor power and lighting' },
      ] },
      { name: 'Mechanical', sheets: [
        { no: 'M1.0', title: 'HVAC plan' },
      ] },
    ],
    scope: [
      { label: 'Baths', value: '4 full baths, 1 powder' },
      { label: 'Fixtures', value: '5 water closets, 7 lavatories, 2 tubs (1 freestanding), 4 showers' },
      { label: 'Kitchen', value: 'Main sink, prep sink on island, pot filler, dishwasher, fridge box' },
      { label: 'Utility', value: 'Laundry box, 4 hose bibbs, floor drain in mechanical' },
      { label: 'Water heater', value: 'Gas tankless, 199k BTU, garage wall, recirc loop' },
      { label: 'Gas', value: 'Range, tankless, fireplace, outdoor kitchen stub' },
      { label: 'Foundation', value: 'Slab on grade. Underslab rough on P1.0' },
      { label: 'Rev 2 change', value: 'Island prep sink moved 4 ft east. Clouded on A2.1 and P1.1', emphasis: true },
    ],
  },

  // The bid package the bot creates in Buildertrend Bids. Starts as a draft;
  // the send step merges in `status: 'sent'` and per-recipient states.
  'pike-plumbing-bid': {
    id: 'pike-plumbing-bid',
    type: 'bidpackage',
    title: 'Pike Street Spec — Plumbing',
    jobId: 'pike',
    status: 'draft',
    sentAt: null,
    due: '2026-10-16',
    walk: 'Thu Oct 8, 9:00am, Lot 14 Pike Street',
    scope: 'Complete plumbing: underslab, rough-in, top-out, trim and gas piping per P0.0–P2.1. Fixtures furnished by builder, installed by sub. Permit by sub.',
    attachments: [
      { name: 'Pike Street — Construction Set rev2.pdf', note: '24 sheets, plumbing on P0.0–P2.1' },
      { name: 'Northaven Plumbing Scope Sheet.pdf', note: 'Standard inclusions and exclusions' },
    ],
    recipients: [
      { partnerId: 'redline', status: 'draft' },
      { partnerId: 'brazos', status: 'draft' },
      { partnerId: 'loneoak', status: 'draft' },
    ],
  },

  // Source data the bot pulled through a connector. Rendered as the
  // information used, not as the connector's own UI.
  'crumley-email': {
    id: 'crumley-email',
    type: 'source',
    title: 'Keystone delivery revision — PO 4471',
    via: 'Gmail',
    query: 'from:keystonebuildingsupply.com "PO 4471" newer_than:14d',
    matched: 3,
    extracted: [
      { label: 'Purchase order', value: 'PO 4471 — Roof trusses, 42 units' },
      { label: 'Job', value: 'Crumley Ranch' },
      { label: 'Original delivery', value: 'Thu Oct 1, 2026', strike: true },
      { label: 'Revised delivery', value: 'Fri Oct 9, 2026', emphasis: true },
      { label: 'Reason', value: 'Plant backlog, Lufkin' },
      { label: 'Contact', value: 'R. Castillo, Keystone dispatch' },
    ],
    email: {
      from: 'Keystone Building Supply <dispatch@keystonebuildingsupply.com>',
      to: 'orders@northavenhomes.com',
      date: 'Wed Sep 30, 2026, 4:47 PM',
      subject: 'Delivery update: PO 4471 (Crumley Ranch) — revised to 10/09',
      body: 'Hello Northaven,\n\nYour truss package on PO 4471 for 7 Crumley Ranch Rd has a revised delivery date of Friday, October 9. The Lufkin plant is running a backlog on 24/12 commons and we were not able to hold your original slot of October 1.\n\nThe girder set and hip set will ship on the same truck. No change to pricing.\n\nIf the new date does not work please reply to this email or call dispatch.\n\nR. Castillo\nKeystone Building Supply — Dispatch',
    },
    others: [
      { date: 'Sep 17', subject: 'Order confirmation: PO 4471 — delivery scheduled 10/01' },
      { date: 'Sep 11', subject: 'Quote Q-20991 accepted — PO 4471 created' },
    ],
  },

  // Crumley Ranch framing, the week the trusses were due. No proposed moves
  // at init: Flow 2 ghosts the week-long slip when it reads the email, then
  // applies the shorter one after Keystone agrees to split the load.
  'crumley-schedule': {
    id: 'crumley-schedule',
    type: 'schedule',
    title: 'Crumley Ranch — Schedule',
    jobId: 'crumley',
    windowStart: '2026-09-28',
    windowDays: 17,
    rows: [
      { id: 'truss-deliv', title: 'Truss delivery — PO 4471', trade: 'Keystone Building Supply', start: '2026-10-01', end: '2026-10-01', conflict: true },
      { id: 'truss-set', title: 'Set roof trusses', trade: 'Vega Framing', start: '2026-10-05', end: '2026-10-06', conflict: true },
      { id: 'sheath', title: 'Roof sheathing', trade: 'Vega Framing', start: '2026-10-07', end: '2026-10-08' },
      { id: 'frame-insp', title: 'Framing inspection', trade: 'City of Frisco', start: '2026-10-09', end: '2026-10-09', conflict: true },
      { id: 'dry-in', title: 'Roof dry-in', trade: 'Hartwell Roofing', start: '2026-10-12', end: '2026-10-13' },
    ],
    pendingLabel: 'If Keystone holds Oct 9: four items slip a week',
    appliedLabel: 'Updated by Material Tracker, today',
    applied: false,
  },

  'hargrove-schedule': {
    id: 'hargrove-schedule',
    type: 'schedule',
    title: 'Hargrove Residence — Schedule',
    jobId: 'hargrove',
    // Two-week window shown in the doc. Working days only, Mon–Fri.
    windowStart: '2026-10-05',
    windowDays: 12,
    // `proposed*` is the pending change. `applyProposed` copies it over.
    rows: [
      { id: 'plumb-rough', title: 'Plumbing rough-in', trade: 'Redline Plumbing', start: '2026-10-05', end: '2026-10-08' },
      { id: 'frame-insp', title: 'Framing inspection', trade: 'City of Frisco', start: '2026-10-07', end: '2026-10-07', proposedStart: '2026-10-09', proposedEnd: '2026-10-09', conflict: true },
      { id: 'vega-back', title: 'Backframe and blocking', trade: 'Vega Framing', start: '2026-10-08', end: '2026-10-08', proposedStart: '2026-10-12', proposedEnd: '2026-10-12', conflict: true },
      { id: 'elec-rough', title: 'Electrical rough-in', trade: 'Allstar Electric', start: '2026-10-08', end: '2026-10-13', proposedStart: '2026-10-12', proposedEnd: '2026-10-15' },
      { id: 'hvac-rough', title: 'HVAC rough-in', trade: 'Comfort Air', start: '2026-10-09', end: '2026-10-12' },
      { id: 'insul', title: 'Insulation', trade: 'Monarch Drywall', start: '2026-10-14', end: '2026-10-16', proposedStart: '2026-10-16', proposedEnd: '2026-10-20' },
    ],
    pendingLabel: 'Proposed: four items move two working days',
    appliedLabel: 'Updated by Schedule Analyzer, today',
    applied: false,
  },
}
