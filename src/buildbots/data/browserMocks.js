// Hand-built mock websites the bot "drives". Each mock has pages (content
// the site component renders) and scripts (what the cursor does). Steps:
//   { target, action: 'type'|'click'|'move'|'navigate', text?, page?, caption, duration }
// `target` is a data-target attribute in the site component. `page` on a
// click/navigate switches the page after the action.

export const browserMocks = {
  keystone: {
    id: 'keystone',
    title: 'Keystone Building Supply',
    host: 'portal.keystonebuildingsupply.com',
    component: 'Keystone',
    pages: {
      login: { path: '/login' },
      orders: {
        path: '/orders',
        rows: [
          { po: 'PO 4471', job: 'Crumley Ranch', desc: 'Roof trusses, 42 units', status: 'Updated', date: 'Oct 1', flagged: true },
          { po: 'PO 4468', job: 'Teller Custom', desc: 'LVL beams and hangers', status: 'Scheduled', date: 'Oct 9' },
          { po: 'PO 4462', job: 'Hargrove Residence', desc: 'Sheathing, 7/16 OSB', status: 'Delivered', date: 'Sep 30' },
          { po: 'PO 4455', job: 'Castellano Remodel', desc: 'Trim package', status: 'Delivered', date: 'Sep 24' },
        ],
      },
      order: {
        path: '/orders/4471',
        po: 'PO 4471',
        job: 'Crumley Ranch · 7 Crumley Ranch Rd',
        items: [
          { sku: 'TR-COM-24', desc: 'Common truss 24/12, 32 ft', qty: 34 },
          { sku: 'TR-GRD-24', desc: 'Girder truss 24/12, 32 ft', qty: 4 },
          { sku: 'TR-HIP-24', desc: 'Hip set', qty: 4 },
        ],
        original: 'Thu Oct 1, 2026',
        revised: 'Fri Oct 9, 2026',
        note: 'Plant backlog — Lufkin. Revised 09/30 by R. Castillo.',
      },
    },
    scripts: {
      'truss-check': {
        startPage: 'login',
        steps: [
          { target: 'email', action: 'type', text: 'orders@northavenhomes.com', caption: 'Signing in to the dealer portal', duration: 1400 },
          { target: 'password', action: 'type', text: '••••••••••', caption: 'Signing in to the dealer portal', duration: 900 },
          { target: 'signin', action: 'click', page: 'orders', caption: 'Opening the order list', duration: 900 },
          { target: 'row-4471', action: 'click', page: 'order', caption: 'Opening PO 4471, Crumley Ranch trusses', duration: 1000 },
          { target: 'tab-delivery', action: 'click', caption: 'Reading the delivery schedule', duration: 900 },
          { target: 'revised', action: 'move', caption: 'Revised delivery: Fri Oct 9', duration: 1600 },
        ],
      },
    },
  },

  'travis-permits': {
    id: 'travis-permits',
    title: 'Travis County Permit Services',
    host: 'permits.traviscountytx.gov',
    component: 'TravisPermits',
    ugly: true,
    pages: {
      lookup: { path: '/cgi-bin/permitlookup.cgi' },
      result: {
        path: '/cgi-bin/permitlookup.cgi?permit=2026-BP-08841',
        permit: '2026-BP-08841',
        address: '4412 RIDGEMONT CT',
        type: 'BUILDING - NEW SFR',
        status: 'INSPECTION SCHEDULED',
        inspection: 'FRAMING (ROUGH)',
        scheduled: '10/07/2026',
        inspector: 'D. OYELARAN',
        issued: '03/14/2026',
        expires: '03/14/2027',
      },
    },
    scripts: {
      'permit-check': {
        startPage: 'lookup',
        steps: [
          { target: 'permit', action: 'type', text: '2026-BP-08841', caption: 'Entering the Hargrove permit number', duration: 1400 },
          { target: 'search', action: 'click', page: 'result', caption: 'Looking up the permit', duration: 1200 },
          { target: 'scheduled', action: 'move', caption: 'Framing inspection scheduled 10/07', duration: 1500 },
        ],
      },
    },
  },

  coi: {
    id: 'coi',
    title: 'CertTrack — COI verification',
    host: 'app.certtrack.io',
    component: 'CoiPortal',
    pages: {
      search: { path: '/certificates' },
      cert: {
        path: '/certificates/vega-framing',
        insured: 'Vega Framing LLC',
        holder: 'Northaven Homes',
        carrier: 'Texas Mutual / Hartford',
        policies: [
          { type: 'General Liability', limits: '$1,000,000 / $2,000,000', expires: 'Oct 18, 2026', soon: true },
          { type: 'Workers’ Compensation', limits: 'Statutory', expires: 'Jan 31, 2027' },
          { type: 'Auto Liability', limits: '$1,000,000 CSL', expires: 'Oct 18, 2026', soon: true },
        ],
        additionalInsured: true,
        waiver: true,
      },
    },
    scripts: {
      'vega-coi': {
        startPage: 'search',
        steps: [
          { target: 'q', action: 'type', text: 'Vega Framing', caption: 'Searching for the certificate', duration: 1200 },
          { target: 'result-vega', action: 'click', page: 'cert', caption: 'Opening Vega Framing’s certificate', duration: 1000 },
          { target: 'gl-expires', action: 'move', caption: 'General liability expires Oct 18', duration: 1500 },
        ],
      },
    },
  },

  'bt-change-orders': {
    id: 'bt-change-orders',
    title: 'Buildertrend — Change Orders',
    host: 'buildertrend.net',
    component: 'BtChangeOrders',
    pages: {
      list: {
        path: '/app/ChangeOrders',
        job: 'Hargrove Residence',
        rows: [
          { id: 'CO-06', title: 'Upgrade to spray foam, attic', amount: 6840, status: 'Approved', date: 'Sep 22' },
          { id: 'CO-05', title: 'Add outlet, garage east wall', amount: 310, status: 'Approved', date: 'Sep 15' },
          { id: 'CO-04', title: 'Delete mudroom bench', amount: -1250, status: 'Approved', date: 'Sep 2' },
        ],
      },
      new: { path: '/app/ChangeOrders/Add' },
      saved: {
        path: '/app/ChangeOrders',
        job: 'Hargrove Residence',
        rows: [
          { id: 'CO-07', title: 'Truss redesign, girder upcharge', amount: 2480, status: 'Pending', date: 'Oct 2', isNew: true },
          { id: 'CO-06', title: 'Upgrade to spray foam, attic', amount: 6840, status: 'Approved', date: 'Sep 22' },
          { id: 'CO-05', title: 'Add outlet, garage east wall', amount: 310, status: 'Approved', date: 'Sep 15' },
          { id: 'CO-04', title: 'Delete mudroom bench', amount: -1250, status: 'Approved', date: 'Sep 2' },
        ],
      },
    },
    scripts: {
      'log-co': {
        startPage: 'list',
        steps: [
          { target: 'new', action: 'click', page: 'new', caption: 'Starting a new change order', duration: 900 },
          { target: 'title', action: 'type', text: 'Truss redesign, girder upcharge', caption: 'Entering the title', duration: 1500 },
          { target: 'amount', action: 'type', text: '2,480.00', caption: 'Entering the amount', duration: 900 },
          { target: 'save', action: 'click', page: 'saved', caption: 'Saving as pending', duration: 1000 },
        ],
      },
    },
  },
}

export const browserMockById = (id) => browserMocks[id]

// Total authored duration of a script, so scenarios can pace the beat after.
export function scriptDuration(mockId, scriptId) {
  const s = browserMocks[mockId]?.scripts[scriptId]
  if (!s) return 0
  return s.steps.reduce((sum, st) => sum + st.duration + (st.page ? 450 : 0), 600)
}
