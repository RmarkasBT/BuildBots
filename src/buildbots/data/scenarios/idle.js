// Idle entry scenarios: what each bot says when you open it with nothing
// in flight. Specific, never "No data". The deep flows replace the entries
// for Schedule Analyzer (Flow 1), Material Tracker (Flow 2), Shop Foreman
// (Flow 3) and the Preconstruction Crew (Flow 4) in their own files.
import { bot, awaitUser, scenario } from '../../engine/types'

export const materialIdle = scenario('material-idle', 'Material Tracker — idle', 'material-tracker', [
  bot('material-tracker', 'Checked Keystone, Dixon and Falcon at 7am. Crumley Ranch trusses on PO 4471 were due yesterday and the portal still shows no delivery. Teller windows and Hargrove sheathing are on track.', {
    delay: 600,
    ...awaitUser([
      { label: 'What’s the status on the Crumley Ranch trusses?', goto: 'trusses' },
      { label: 'Anything late on Teller?' },
      { label: 'Is Vega’s insurance current?', goto: 'coi' },
    ]),
  }),
  bot('material-tracker', 'Teller windows from Falcon are on time for Oct 20. Redline has the PEX on site as of Tuesday. Nothing to chase.', {
    delay: 1100,
    ...awaitUser([
      { label: 'What’s the status on the Crumley Ranch trusses?', goto: 'trusses' },
      { label: 'Is Vega’s insurance current?', goto: 'coi' },
    ]),
  }),
  // Hands into the CertTrack browser demo — a clickable browser-control path.
  { author: 'system', kind: 'notice', content: '', label: 'coi', delay: 0, end: true, silent: true,
    effects: [{ type: 'startScenario', convId: 'material-tracker', scenarioId: 'demo-coi' }] },
  // Hands into Flow 2 in its own scenario so the dev drawer can jump there.
  { author: 'system', kind: 'notice', content: '', label: 'trusses', delay: 0, end: true, silent: true,
    effects: [{ type: 'startScenario', convId: 'material-tracker', scenarioId: 'material-trusses' }] },
])

export const takeoffIdle = scenario('takeoff-idle', 'Takeoff — idle', 'takeoff', [
  bot('takeoff', 'Pike Street plan set came in Tuesday, 14 sheets. I have not measured it yet. Say the word and I will start with framing and concrete.', {
    delay: 600,
    ...awaitUser(['Start with framing', 'What sheets do you have?']),
  }),
  bot('takeoff', 'A1.0 through A2.4 architectural, S1 through S3 structural, and two detail sheets. No MEP yet. Enough for framing, concrete and roofing quantities.', { delay: 1000 }),
])

export const bidIdle = scenario('bid-idle', 'Bid Leveling — idle', 'bid-leveling', [
  bot('bid-leveling', 'Three framing bids in on Pike Street: Vega, Precision and Lone Star. Lone Star left out hardware and blocking. I can level them once Takeoff has quantities.', {
    delay: 600,
    ...awaitUser(['Show me the three bids', 'Which one is low?']),
  }),
  bot('bid-leveling', 'Vega is low at face value. Add the hardware and blocking Lone Star excluded and the spread closes to about $2,800. I would not call it until the scope is matched.', { delay: 1000 }),
])

export const estimationIdle = scenario('estimation-idle', 'Estimation — idle', 'estimation', [
  bot('estimation', 'Castellano final is reconciled against actuals, 1.2% variance, all in drywall. Pike Street has no estimate yet. I need quantities and bids before I can price it.', {
    delay: 600,
    ...awaitUser(['Build a budget for Pike Street', 'Show the Castellano variance']),
  }),
  bot('estimation', 'That takes a crew. Flow 4 picks up here in a later phase.', { delay: 900 }),
])

export const dailyLogIdle = scenario('daily-log-idle', 'Daily Log — idle', 'daily-log', [
  bot('daily-log', 'Posted the Teller log at 4:52pm yesterday from the walkthrough video. 14 photos, three trades on site, no incidents. Next one goes up when today’s video lands.', {
    delay: 600,
    ...awaitUser(['Show yesterday’s log', 'Who was on site?']),
  }),
  bot('daily-log', 'Redline Plumbing with three, Allstar Electric with two, and Dale from Cutter Concrete for the flatwork walk.', { delay: 900 }),
])

// Catalog bots. Short, so they feel alive when added.
export const rfiIdle = scenario('rfi-idle', 'RFI — idle', 'rfi', [
  bot('rfi', 'No open RFIs on any job. Last one closed on Teller 11 days ago, beam pocket detail at the garage. I will draft the next one when you need it.', {
    delay: 600,
    ...awaitUser(['Draft an RFI for Hargrove']),
  }),
  bot('rfi', 'Which detail? Give me the sheet and I will write it against the spec.', { delay: 900 }),
])

export const leadsIdle = scenario('leads-idle', 'Leads Manager — idle', 'leads', [
  bot('leads', 'Two new leads this week from the website. One is a kitchen remodel in Prosper, inside your service area. One is a pool house in Waco, outside it. I have not replied to either.', {
    delay: 600,
    ...awaitUser(['Qualify the Prosper lead']),
  }),
  bot('leads', 'I will draft a reply asking for budget range and timeline. It goes out under Northaven Homes and waits for your OK.', { delay: 900 }),
])

export const socialIdle = scenario('social-idle', 'Social — idle', 'social', [
  bot('social', 'Castellano is closing out. There are 31 finish photos in Buildertrend, nine of them usable. I can draft two posts for review.', {
    delay: 600,
    ...awaitUser(['Draft the posts']),
  }),
  bot('social', 'Drafts coming. Nothing posts until you approve it.', { delay: 900 }),
])

export const preconIdle = scenario('precon-idle', 'Preconstruction Crew — idle', 'precon-crew', [
  bot('estimation', 'Crew is idle. Last run was Teller, six weeks ago. Pike Street is the next candidate once the plan set is measured.', {
    delay: 600,
    ...awaitUser(['Build a budget for Pike Street from the plans']),
  }),
  bot('estimation', 'That is Flow 4. It lands in a later phase.', { delay: 900 }),
])

