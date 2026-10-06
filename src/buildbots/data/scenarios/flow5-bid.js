// Flow 5 — Bid Coordinator. Upload a construction set, pick the plumbing
// trades (sorted by who was used most recently), review one personalized
// draft per trade, hit send. Everything stays in Buildertrend Bids, so the
// bot is native; the emails leave the company, so they wait for your OK.
import { bot, thinking, action, artifact, awaitUser, scenario } from '../../engine/types'

const B = 'bid-coordinator'

const SET_OPEN = { mode: 'document', targetId: 'pike-plumbing-set', title: 'Pike Street — Construction Set rev2' }
const BID_OPEN = { mode: 'document', targetId: 'pike-plumbing-bid', title: 'Pike Street Spec — Plumbing bid package' }

const SUBJECT = 'Bid request: Pike Street Spec, plumbing — due Fri Oct 16'

// One draft per plumber. Each names the last job together and what is
// different about Pike Street. Bodies are editable in the card.
const DRAFTS = [
  {
    partnerId: 'redline',
    to: 'Tasha Reed, Redline Plumbing',
    toEmail: 'tasha@redlineplumbing.com',
    subject: SUBJECT,
    why: 'Used 3 days ago on Hargrove. Same fixture tier.',
    body: 'Tasha,\n\nYou are wrapping rough-in on Hargrove this week, so this one should feel familiar. Pike Street is a 3,420 sf two-story spec on Lot 14: four full baths and a powder, gas tankless in the garage with a recirc loop, and the same fixture tier we ran at Hargrove.\n\nThe full set is attached; your sheets are P0.0 through P2.1. Rev 2 moved the island prep sink four feet east, clouded on P1.1.\n\nSite walk is Thursday Oct 8 at 9am. Bids are due Friday Oct 16. If you would rather price it off the Hargrove unit rates, say so and I will send those over.\n\nBid Coordinator, on behalf of Northaven Homes',
  },
  {
    partnerId: 'brazos',
    to: 'Hector Alaniz, Brazos Plumbing Co.',
    toEmail: 'hector@brazosplumbing.com',
    subject: SUBJECT,
    why: 'Used Aug 21 on Teller. Strongest on underslab work.',
    body: 'Hector,\n\nYour underslab work on Teller in August was clean, so I want you on this one. Pike Street is a slab-on-grade spec on Lot 14, 3,420 sf: four full baths, a powder, gas tankless in the garage. The underslab rough is on P1.0 and the risers are on P2.0.\n\nThe full set is attached; plumbing is P0.0 through P2.1. One change since the permit set: the island prep sink moved four feet east on Rev 2, clouded on P1.1, so the underslab stub moves with it.\n\nSite walk is Thursday Oct 8 at 9am. Bids are due Friday Oct 16. Reply here with questions and I will get you an answer the same day.\n\nBid Coordinator, on behalf of Northaven Homes',
  },
  {
    partnerId: 'loneoak',
    to: 'Wendy Sato, Lone Oak Plumbing & Gas',
    toEmail: 'wendy@loneoakpg.com',
    subject: SUBJECT,
    why: 'Used Jun 12 on Castellano. Licensed for gas; Pike has a lot of it.',
    body: 'Wendy,\n\nYou ran the gas line on the Castellano remodel in June and it went smoothly, which is why I am sending this your way. Pike Street is a 3,420 sf spec on Lot 14 with more gas than usual: a 199k BTU tankless, the range, a fireplace and an outdoor kitchen stub, all on P2.1. I would like the gas on the same bid as the plumbing.\n\nThe full set is attached; plumbing and gas are P0.0 through P2.1. Four full baths, a powder, slab on grade.\n\nSite walk is Thursday Oct 8 at 9am. Bids are due Friday Oct 16. If gas and plumbing need to be two numbers on your side, that is fine, just break them out.\n\nBid Coordinator, on behalf of Northaven Homes',
  },
]

const SENT_RECIPIENTS = [
  { partnerId: 'redline', status: 'sent', at: 'Today, 10:42am' },
  { partnerId: 'brazos', status: 'sent', at: 'Today, 10:42am' },
  { partnerId: 'loneoak', status: 'sent', at: 'Today, 10:42am' },
]

export const bidCoordinator = scenario('bid-coordinator-idle', 'Flow 5 — Bid Coordinator sends a plumbing bid', B, [
  // 0. Idle. Typing anything, or taking the upload chip, lands on the upload beat.
  bot(B, 'No open bid packages. Pike Street Spec is in preconstruction with nothing out to trades yet, and the construction set has not been uploaded here. Drop it in and tell me who should get it.', {
    delay: 600,
    ...awaitUser([
      { label: 'Upload the Pike Street construction set', send: 'Here is the 5 Street construction set. Organize the plumbing bids.' },
      { label: 'What is out for bid right now?', goto: 'status' },
    ]),
  }),

  // 1. The upload: the user's file lands in the thread.
  { author: 'user', kind: 'file', label: 'upload', delay: 0, content: {
    name: 'Pike Street — Construction Set rev2.pdf', size: '18.4 MB', pages: 24, kind: 'PDF',
  } },
  action(B, {
    title: 'Saving the set to Pike Street Spec and reading it',
    detail: 'Documents → Plans. Indexing 24 sheet titles, finding the plumbing sheets, pulling the fixture schedule.',
    source: 'buildertrend',
    status: 'running',
    open: SET_OPEN,
    openLabel: 'View the set',
  }, {
    id: 'read-set',
    delay: 700,
    effects: [{ type: 'botStatus', botId: B, status: 'working', lastActivity: 'Reading the Pike Street construction set' }],
  }),
  thinking(B, 'Read 24 sheets, flagged 6 for plumbing, pulled the fixture schedule', [
    'Saved the PDF to Pike Street Spec → Documents → Plans as rev 2',
    'Indexed the sheet list from G0.0: 24 sheets across six disciplines',
    'Flagged P0.0–P2.1 as plumbing scope; A2.0–A2.2 and S1.0 as reference',
    'Read the fixture schedule on P0.0: 5 WC, 7 lavs, 2 tubs, 4 showers, kitchen and prep sinks',
    'Found the gas piping plan on P2.1: tankless, range, fireplace, outdoor kitchen',
    'Compared against the Sep 11 permit set: one clouded change, island prep sink moved on A2.1 and P1.1',
  ], {
    delay: 2600,
    effects: [
      { type: 'openLive', ...SET_OPEN },
      { type: 'patchMessage', id: `${B}:read-set`, patch: { content: {
        title: 'Saved and read Pike Street — Construction Set rev2',
        detail: '24 sheets filed under Pike Street Spec → Documents → Plans. Six plumbing sheets flagged.',
        source: 'buildertrend', status: 'done', open: SET_OPEN, openLabel: 'View the set',
      } } },
      { type: 'botStatus', botId: B, status: 'idle', lastActivity: 'Read the Pike Street set, 6 plumbing sheets flagged' },
    ],
  }),
  artifact(B, { ...SET_OPEN, docId: 'pike-plumbing-set', caption: '24 sheets · plumbing scope on P0.0–P2.1 · rev 2', thumb: 'document' }, { delay: 500 }),
  bot(B, 'Saved it to Pike Street Spec and read all 24 sheets. Plumbing lives on six of them, P0.0 through P2.1: four full baths and a powder, a gas tankless in the garage, gas to the range, fireplace and outdoor kitchen, and the underslab rough on P1.0. Rev 2 moved the island prep sink, clouded on P1.1. Who should get it?', {
    delay: 1300,
    ...awaitUser([
      { label: 'Send this bid out to my plumbing team', goto: 'plumbers' },
      { label: 'Framers first', goto: 'framers' },
    ]),
  }),

  // 2. The plumbing list, most recent first.
  bot(B, 'Here is everyone flagged Plumbing in your Buildertrend contacts, most recent job first. The top three have all worked with you this year. Pryor has not been on a job since last August and their COI lapsed in July, so I left them unchecked.', {
    label: 'plumbers',
    delay: 1400,
  }),
  { author: B, kind: 'trades', delay: 600, content: {
    title: 'Plumbing trades',
    subtitle: 'sorted by last job with Northaven',
    trade: 'Plumbing',
    partnerIds: ['redline', 'brazos', 'loneoak', 'pryor'],
    selected: ['redline', 'brazos', 'loneoak'],
    flags: { pryor: 'COI lapsed Jul 14' },
    options: [
      { label: 'Draft bid requests', goto: 'drafts', send: 'Draft bid requests for those three.' },
      { label: 'Not now', goto: 'later', send: 'Not now.' },
    ],
  }, awaitUser: { chips: [], hidden: true } },

  // 3. One personalized draft each.
  bot(B, 'Three drafts, one each. Each names your last job together and what is different about Pike Street. Site walk Thursday Oct 8 at 9, bids due Friday Oct 16, the set attached with P0.0–P2.1 flagged. They go out under Northaven, so nothing moves until you hit send.', {
    label: 'drafts',
    delay: 1800,
    effects: [
      { type: 'botStatus', botId: B, status: 'waiting', lastActivity: 'Three plumbing bid requests waiting for your OK' },
    ],
  }),
  { author: B, kind: 'drafts', delay: 700, content: {
    title: 'Bid request — Pike Street Spec, Plumbing',
    package: 'Buildertrend Bids · 3 recipients · due Fri Oct 16',
    drafts: DRAFTS,
    options: [
      { label: 'Send all three', goto: 'sent', send: 'Send all three.' },
      { label: 'Skip', goto: 'nosend', send: 'Skip for now.' },
    ],
  }, awaitUser: { chips: [], hidden: true } },

  // 4. Sent.
  action(B, {
    title: 'Sent 3 bid requests from Buildertrend Bids',
    detail: 'Pike Street Spec — Plumbing. Construction set attached, P0.0–P2.1 flagged. Site walk Thu Oct 8. Bids due Fri Oct 16.',
    source: 'buildertrend',
    status: 'done',
    items: [
      { label: 'Tasha Reed, Redline Plumbing', value: 'Sent · email' },
      { label: 'Hector Alaniz, Brazos Plumbing Co.', value: 'Sent · email' },
      { label: 'Wendy Sato, Lone Oak Plumbing & Gas', value: 'Sent · email' },
    ],
    open: BID_OPEN,
    openLabel: 'View in Buildertrend Bids',
  }, {
    label: 'sent',
    delay: 1100,
    effects: [
      { type: 'patchDoc', docId: 'pike-plumbing-bid', op: 'merge', patch: { status: 'sent', sentAt: 'Today, 10:42am', recipients: SENT_RECIPIENTS } },
      { type: 'openLive', ...BID_OPEN },
      { type: 'botStatus', botId: B, status: 'idle', lastActivity: 'Sent the Pike Street plumbing bid to 3 trades' },
      { type: 'addRoutine', routine: {
        id: 'bid-coordinator-nudge', botId: B,
        name: 'Nudge unopened bid requests',
        trigger: { kind: 'schedule', label: 'Two business days after a bid goes out' },
        lastRun: 'Never',
      } },
    ],
  }),
  bot(B, 'Sent. Replies land here as they come in. If anyone has not opened the set by Tuesday I will nudge them, and I will remind all three the day before bids are due. When the numbers come back, Bid Leveling can line them up.', {
    delay: 1000,
    end: true,
  }),

  // --- side paths ---
  bot(B, 'Not sent. The three drafts stay here and the package sits in Buildertrend Bids as a draft. Say the word and they go.', {
    label: 'nosend', delay: 800, end: true,
    effects: [{ type: 'botStatus', botId: B, status: 'idle', lastActivity: 'Plumbing bid drafted, not sent' }],
  }),
  bot(B, 'Okay. The set is saved to Pike Street Spec and the plumbing list is here when you want it.', {
    label: 'later', delay: 800, end: true,
    effects: [{ type: 'botStatus', botId: B, status: 'idle', lastActivity: 'Pike Street set saved, no bids out yet' }],
  }),
  bot(B, 'Framing already has three bids in on Pike Street through Bid Leveling: Vega, Precision and Lone Star. Plumbing is the open trade.', {
    label: 'framers', delay: 1000,
    ...awaitUser([{ label: 'Send this bid out to my plumbing team', goto: 'plumbers' }]),
  }),
  bot(B, 'Nothing from me. Three framing bids came back on Pike Street through Bid Leveling, but no plumbing, electrical or HVAC packages have gone out. Upload the set and I will start with whichever trade you name.', {
    label: 'status', delay: 1000,
    ...awaitUser([{ label: 'Upload the Pike Street construction set', send: 'Here is the 5 Street construction set. Organize the plumbing bids.', goto: 'upload' }]),
  }),
])
