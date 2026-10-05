// Five jobs. Every flow references these so the world stays consistent.
// Financial figures: contract, budget (planned cost), committed, actual,
// projected cost. margin = (contract - projected) / contract.
// Target margin is 18%. Hargrove runs ~4 points under on purpose.
export const jobs = [
  {
    id: 'hargrove',
    name: 'Hargrove Residence',
    address: '4412 Ridgemont Ct',
    stage: 'Framing',
    contract: 1284000,
    budget: 1052900,
    committed: 1018400,
    actual: 612300,
    projected: 1104200,
    targetMargin: 0.18,
    note: 'The schedule conflict lives here.',
    // Cost codes driving the margin gap. Sum = projected - budget = 51,300.
    gapDrivers: [
      { code: '06-100', name: 'Rough Framing Labor', budget: 148200, projected: 179600, over: 31400 },
      { code: '03-300', name: 'Concrete Flatwork', budget: 61500, projected: 81400, over: 19900 },
    ],
  },
  {
    id: 'castellano',
    name: 'Castellano Remodel',
    address: '118 Alder Walk',
    stage: 'Punch and closeout',
    contract: 386500,
    budget: 316900,
    committed: 309800,
    actual: 301200,
    projected: 312400,
    targetMargin: 0.18,
    note: 'Warranty and punch items live here.',
    homeowners: 'Rob and Maria Castellano',
    homeownerEmail: 'castellanos@example.com',
    punchItems: [
      { id: 'p1', title: 'Master bath grout hairline crack', room: 'Master bath', openedDaysAgo: 9 },
      { id: 'p2', title: 'Pantry door rubs at the strike plate', room: 'Kitchen', openedDaysAgo: 6 },
    ],
  },
  {
    id: 'pike',
    name: 'Pike Street Spec',
    address: 'Lot 14, Pike Street',
    stage: 'Preconstruction',
    contract: null,
    budget: null,
    committed: 0,
    actual: 18400,
    projected: null,
    targetMargin: 0.18,
    note: 'The preconstruction crew flow runs here.',
    targetSale: 1150000,
    sqft: 3420,
  },
  {
    id: 'crumley',
    name: 'Crumley Ranch',
    address: '7 Crumley Ranch Rd',
    stage: 'Framing',
    contract: 1468000,
    budget: 1203800,
    committed: 1141200,
    actual: 498600,
    projected: 1221500,
    targetMargin: 0.18,
    note: 'The late truss delivery lives here. Flow 2 runs on this job.',
    // The PM on this job. Not the signed-in user, so the bot can text them.
    pm: { name: 'Jordan Reyes', phone: '(469) 555-0188' },
  },
  {
    id: 'teller',
    name: 'Teller Custom',
    address: '29 Cottonwood Bend',
    stage: 'Rough-in',
    contract: 942000,
    budget: 772400,
    committed: 655100,
    actual: 388700,
    projected: 770900,
    targetMargin: 0.18,
    note: 'Background only.',
  },
]

export const jobById = Object.fromEntries(jobs.map((j) => [j.id, j]))

export function marginOf(job) {
  if (!job.contract || !job.projected) return null
  return (job.contract - job.projected) / job.contract
}
