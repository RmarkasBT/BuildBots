// Trade partners. Two COIs expire within the month (TODAY is 2026-10-02).
// `lastUsed` / `lastJob` / `jobs` drive the Bid Coordinator's trade list,
// which sorts by who was used most recently.
export const partners = [
  { id: 'vega', name: 'Vega Framing', trade: 'Framing', contact: 'Luis Vega', phone: '(469) 555-0142', coiExpires: '2026-10-18' },
  { id: 'redline', name: 'Redline Plumbing', trade: 'Plumbing', contact: 'Tasha Reed', phone: '(214) 555-0177', email: 'tasha@redlineplumbing.com', coiExpires: '2027-03-02',
    lastUsed: '2026-09-29', lastJob: 'Hargrove Residence', lastScope: 'Plumbing rough-in, in progress', jobs: 7, rating: 'Always on time' },
  { id: 'allstar', name: 'Allstar Electric', trade: 'Electrical', contact: 'Marcus Bell', phone: '(972) 555-0119', coiExpires: '2026-10-30' },
  { id: 'monarch', name: 'Monarch Drywall', trade: 'Drywall', contact: 'Priya Nair', phone: '(469) 555-0163', coiExpires: '2027-01-15' },
  { id: 'cutter', name: 'Cutter Concrete', trade: 'Concrete', contact: 'Dale Cutter', phone: '(214) 555-0138', coiExpires: '2027-05-20' },
  { id: 'hartwell', name: 'Hartwell Roofing', trade: 'Roofing', contact: 'Jen Hartwell', phone: '(972) 555-0191', coiExpires: '2027-02-08' },
  { id: 'brazos', name: 'Brazos Plumbing Co.', trade: 'Plumbing', contact: 'Hector Alaniz', phone: '(972) 555-0154', email: 'hector@brazosplumbing.com', coiExpires: '2026-11-21',
    lastUsed: '2026-08-21', lastJob: 'Teller Custom', lastScope: 'Underslab and rough-in', jobs: 4, rating: 'Sharpest on slab work' },
  { id: 'loneoak', name: 'Lone Oak Plumbing & Gas', trade: 'Plumbing', contact: 'Wendy Sato', phone: '(214) 555-0186', email: 'wendy@loneoakpg.com', coiExpires: '2027-04-09',
    lastUsed: '2026-06-12', lastJob: 'Castellano Remodel', lastScope: 'Bath remodel and gas line', jobs: 2, rating: 'Licensed for gas' },
  { id: 'pryor', name: 'Pryor Plumbing', trade: 'Plumbing', contact: 'Gene Pryor', phone: '(469) 555-0127', email: 'gene@pryorplumbing.net', coiExpires: '2026-07-14',
    lastUsed: '2025-08-05', lastJob: 'Whitlock Addition', lastScope: 'Fixture set', jobs: 1, rating: null },
]

export const partnerById = Object.fromEntries(partners.map((p) => [p.id, p]))

export const suppliers = [
  { id: 'keystone', name: 'Keystone Building Supply', portal: 'portal.keystonebuildingsupply.com', account: 'NH-20481' },
  { id: 'dixon', name: 'Dixon Lumber', portal: 'orders.dixonlumber.com', account: 'NORTHAVEN' },
  { id: 'falcon', name: 'Falcon Window and Door', portal: 'falconwd.com/dealer', account: 'D-7731' },
]

export const supplierById = Object.fromEntries(suppliers.map((s) => [s.id, s]))
