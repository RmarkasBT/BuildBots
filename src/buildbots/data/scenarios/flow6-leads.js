// Flow 6 — the Shop Foreman builds Lead Follow-up. Branches off Flow 3's
// first question ("Generating leads and following up until they book").
// Connects Google Ads Manager and Meta Ads Manager in-thread (Gmail is
// already connected), adds a daily routine with a 36-hour follow-up rule,
// and on Create the new bot runs once: logs this week's leads, reads replies
// through Gmail, and drafts a follow-up for the one lead past 36 hours. The
// draft lands in the approvals queue and waits for an OK.
import { bot, thinking, action, approval, awaitUser, scenario } from '../../engine/types'

const F = 'shop-foreman'
const L = 'lead-followup'
const PREVIEW = { type: 'openLive', mode: 'preview', targetId: F, title: 'New bot' }

const card = (author, content, opts = {}) => ({ author, kind: 'card', content, delay: 600, ...opts })

// Knowledge layers offered in the interview.
const LAYERS = [
  { id: 'bt', group: 'bt', label: 'Buildertrend knowledge', detail: '412 articles, always current', on: true, locked: true },
  { id: 'website', group: 'business', label: 'Your website', detail: 'service area, project size, brand voice', on: true },
  { id: 'ads', group: 'business', label: 'Google Ads and Meta Ads lead forms', detail: '5 campaigns running', on: true },
  { id: 'derived', group: 'business', label: 'Your last 180 jobs', detail: 'leads answered within an hour book 3x more often', on: true },
  { id: 'lead-intake', group: 'sop', label: 'Lead Intake', on: true, status: 'indexed' },
  { id: 'selections-deadlines', group: 'sop', label: 'Selections Deadlines', on: false, status: 'missing' },
]

const CHANNELS = 'Email and text, under Northaven Homes, signed by the bot'

// The follow-up the new bot drafts on its first run. Pushed into the queue
// as it is written, so the bell goes 0 → 1 in front of the viewer.
const followUp = {
  channel: 'email',
  to: 'Sam Whitaker',
  toEmail: 'sam.whitaker@example.com',
  subject: 'Re: Garage apartment addition in Celina — two times to walk the lot',
  body: 'Sam, following up on the garage apartment addition you asked about through our Google ad on Tuesday. Dana can walk the lot with you Thursday Oct 8 at 4pm or Saturday Oct 10 at 9am. Reply with either and I will put it on the calendar, or send a time that suits you better.\n\nLead Follow-up, for Dana Whitfield\nNorthaven Homes',
}

const aprFollowUp = {
  id: 'apr-whitaker-followup',
  botId: L,
  kind: 'email',
  title: 'Follow up with Sam Whitaker, 41 hours without a reply',
  summary: 'Second touch on a Google Ads lead, past your 36-hour rule. Leaves the company, so it needs your OK.',
  native: false,
  draft: followUp,
  status: 'pending',
  onDecision: { approve: [], skip: [] },
}

export const createLeadsBot = scenario('create-leads-bot', 'Flow 6 — Shop Foreman builds Lead Follow-up', F, [
  // 1. Scope, and where leads come from.
  bot(F, 'Lead follow-up. Leads land in Buildertrend Sales from your website form and your ads, and the first reply takes 26 hours on average. Four of the last ten never got one. Where do your leads come from?', {
    delay: 1100,
    effects: [
      { type: 'draftBot', patch: { name: 'Lead Follow-up', avatar: 'funnel', job: 'Watches new leads and follows up until they book an appointment', knowledge: undefined } },
      PREVIEW,
    ],
    ...awaitUser([
      { label: 'Google Ads, Meta Ads and the website', goto: 'connect' },
      { label: 'Just the website form', goto: 'connect-web' },
    ]),
  }),
  { author: 'system', kind: 'notice', content: '', label: 'connect-web', delay: 0, silent: true, next: 'know',
    effects: [{ type: 'draftBot', patch: { scope: 'Website-form leads, followed up until they book or decline' } }] },

  // 2. Connect the ad managers in the thread.
  bot(F, 'Two of those need a connector, so the bot sees a lead-form submission the moment it lands instead of waiting for the daily digest. Gmail is already connected for the replies.', {
    label: 'connect',
    delay: 1000,
  }),
  card(F, {
    variant: 'options',
    title: 'Connect Google Ads Manager and Meta Ads Manager',
    body: 'Read-only access to lead-form submissions. Campaign spend and settings stay untouched.',
    options: [
      { label: 'Connect both', goto: 'connecting', send: 'Connect both.' },
      { label: 'Skip for now', goto: 'know', send: 'Skip for now.' },
    ],
  }, { delay: 500, awaitUser: { chips: [], hidden: true } }),
  action(F, {
    title: 'Connecting Google Ads Manager',
    detail: 'Northaven Homes · 3 lead-form campaigns running.',
    source: 'connector',
    connector: 'Google Ads',
    status: 'running',
  }, { id: 'ga-connect', label: 'connecting', delay: 500, effects: [{ type: 'connector', id: 'google-ads', status: 'connecting' }] }),
  action(F, {
    title: 'Connecting Meta Ads Manager',
    detail: 'Northaven Homes · 2 lead-form campaigns running.',
    source: 'connector',
    connector: 'Meta Ads',
    status: 'running',
  }, { id: 'ma-connect', delay: 400, effects: [{ type: 'connector', id: 'meta-ads', status: 'connecting' }] }),
  { author: 'system', kind: 'notice', content: 'Google Ads Manager and Meta Ads Manager connected. Lead-form submissions reach the bot as they land.', delay: 2000,
    effects: [
      { type: 'connector', id: 'google-ads', status: 'connected' },
      { type: 'connector', id: 'meta-ads', status: 'connected' },
      { type: 'patchMessage', id: 'shop-foreman:ga-connect', patch: { content: { title: 'Google Ads Manager connected', detail: 'Northaven Homes · 3 lead-form campaigns running.', source: 'connector', connector: 'Google Ads', status: 'done' } } },
      { type: 'patchMessage', id: 'shop-foreman:ma-connect', patch: { content: { title: 'Meta Ads Manager connected', detail: 'Northaven Homes · 2 lead-form campaigns running.', source: 'connector', connector: 'Meta Ads', status: 'done' } } },
      { type: 'draftBot', patch: { scope: 'New leads from Google Ads, Meta Ads and the website form, followed up until they book or decline' } },
    ] },

  // 3. What should it know?
  bot(F, 'Here is what it can draw on. Buildertrend knowledge is always on. Turn the rest on or off.', {
    label: 'know',
    delay: 1000,
    effects: [{ type: 'draftBot', patch: { knowledge: LAYERS } }],
  }),
  card(F, {
    variant: 'knowledge',
    title: 'What this bot should know',
    layers: LAYERS,
    options: [{ label: 'Continue', goto: 'trust', send: 'Those sources are right.' }],
  }, { awaitUser: { chips: [], hidden: true } }),

  // 4. What is it allowed to do on its own?
  bot(F, 'What is it allowed to do on its own? Suggest means it drafts and waits for you. Act means it logs leads, books the appointment and tells you after. Either way, every email or text to a lead needs your OK before it goes out.', {
    label: 'trust',
    delay: 1600,
    ...awaitUser([
      { label: 'Suggest — every email waits for me', goto: 'trust-suggest' },
      { label: 'Act — log leads and book appointments on its own', goto: 'trust-act' },
    ]),
  }),
  { author: 'system', kind: 'notice', content: '', label: 'trust-suggest', delay: 0, silent: true, next: 'when',
    effects: [{ type: 'draftBot', patch: { trust: 'suggest', channels: CHANNELS } }] },
  { author: 'system', kind: 'notice', content: '', label: 'trust-act', delay: 0, silent: true, next: 'when',
    effects: [{ type: 'draftBot', patch: { trust: 'act', channels: CHANNELS } }] },

  // 5. When should it work? The daily check carries the 36-hour rule.
  bot(F, 'When should it work?', {
    label: 'when',
    delay: 900,
    effects: [PREVIEW],
    ...awaitUser([
      { label: 'Every day at 8am, follow up after 36 hours of silence', goto: 'when-daily' },
      { label: 'Only when I ask', goto: 'when-request' },
    ]),
  }),
  { author: 'system', kind: 'notice', content: '', label: 'when-daily', delay: 0, silent: true, next: 'rule',
    effects: [{ type: 'draftBot', patch: { scheduleKind: 'schedule', scheduleLabel: 'Every day at 8am', routineName: 'Check replies, follow up after 36 hours' } }] },
  { author: 'system', kind: 'notice', content: '', label: 'when-request', delay: 0, silent: true, next: 'summary',
    effects: [{ type: 'draftBot', patch: { scheduleKind: 'request', scheduleLabel: 'On request only' } }] },
  bot(F, 'Added. Every morning at 8 it reads the replies on every open lead through Gmail. Anyone silent for more than 36 hours gets a follow-up drafted, and every draft lands in your approvals queue before it goes out. After the third touch it stops and tells you.', {
    label: 'rule',
    delay: 1300,
    next: 'summary',
  }),

  // 6. Summary with Create / Keep tuning.
  bot(F, 'Here is the bot. Create it, or keep tuning.', { label: 'summary', delay: 900 }),
  card(F, {
    variant: 'summary',
    title: 'Lead Follow-up',
    subtitle: 'Ready to create',
    options: [
      { label: 'Create', goto: 'create', send: 'Create it.' },
      { label: 'Keep tuning', goto: 'tune', send: 'Keep tuning.' },
    ],
  }, { awaitUser: { chips: [], hidden: true } }),
  bot(F, 'What would you change?', {
    label: 'tune',
    delay: 700,
    ...awaitUser([
      { label: 'Change what it is allowed to do', goto: 'trust' },
      { label: 'Change when it works', goto: 'when' },
    ]),
  }),

  // Create: the bot lands in the roster and runs once.
  bot(F, 'Built. Lead Follow-up is in your roster and already reading this week’s leads.', {
    label: 'create',
    delay: 1100,
    end: true,
    effects: [
      { type: 'applyDraftBot', fromConvId: F, botId: L },
      { type: 'addRoutine', routine: { id: 'lead-followup-inbound', botId: L, name: 'Log new leads', trigger: { kind: 'event', label: 'When a lead form is submitted' }, lastRun: 'Never' } },
      { type: 'addBotToRoster', botId: L },
      { type: 'closeLive' },
      { type: 'botStatus', botId: L, status: 'working', lastActivity: 'Reading this week’s leads and replies' },
      { type: 'startScenario', convId: L, scenarioId: 'leads-first' },
    ],
  }),
])

// The new bot's first run: new leads logged, replies read, one follow-up
// drafted for the lead past 36 hours. The draft waits in the queue.
export const leadsFirst = scenario('leads-first', 'Flow 6 — Lead Follow-up’s first run', L, [
  thinking(L, 'Pulled 3 new leads from the ad connectors, read Gmail replies on 5 open leads', [
    'Google Ads Manager: 1 new lead-form submission since Monday',
    'Meta Ads Manager: 2 new lead-form submissions, one outside the service area',
    'Logged all three in Buildertrend Sales with source and campaign',
    'Searched Gmail for replies on 5 open leads: 2 replied, 1 booked, 1 declined, 2 silent',
    'Lead Intake SOP: second touch after 36 hours of silence, third and last after 72',
    'Sam Whitaker: first email Tue 3:12pm, no reply in 41 hours — past the rule',
  ], { delay: 2400 }),
  action(L, {
    title: 'Logged 3 new leads in Buildertrend Sales',
    detail: 'Source and campaign recorded on each. The Waco lead is outside your service area and is flagged, not contacted.',
    source: 'buildertrend',
    status: 'done',
    items: [
      { label: 'Marcus and Elena Tran — kitchen remodel, Prosper', value: 'Meta Ads' },
      { label: 'Priya Desai — second-story addition, Frisco', value: 'Google Ads' },
      { label: 'Tom Albrecht — pool house, Waco (outside service area)', value: 'Meta Ads' },
    ],
  }, { delay: 900 }),
  action(L, {
    title: 'Read replies on 5 open leads',
    detail: 'Threads under office@northavenhomes.com, matched to Buildertrend Sales by email address.',
    source: 'connector',
    connector: 'Gmail',
    status: 'done',
    items: [
      { label: 'Rachel Moore — booked a walkthrough', value: 'Thu Oct 8, 10am' },
      { label: 'Kim and Dev Patel — replied, wants a Tuesday walkthrough', value: '2 hours ago' },
      { label: 'Angela Ruiz — no reply yet', value: '9 hours' },
      { label: 'Sam Whitaker — no reply', value: '41 hours' },
      { label: 'Ben Okafor — declined, going with another builder', value: 'yesterday' },
    ],
  }, { delay: 900 }),
  bot(L, 'Rachel Moore booked Thursday at 10am and it is on the calendar. The Patels want a Tuesday walkthrough, so I will offer two times. Ben Okafor went with another builder; I closed the lead. Sam Whitaker asked about a garage apartment addition through the Google ad on Tuesday and has not replied in 41 hours, past your 36-hour rule, so I drafted the second touch. It is waiting in your approvals queue.', {
    delay: 1500,
    sources: ['Lead Intake SOP', 'Buildertrend Best Practices'],
    effects: [
      { type: 'selectConv', convId: L },
      { type: 'pushApproval', approval: aprFollowUp },
      { type: 'botStatus', botId: L, status: 'waiting', unread: 0 },
    ],
  }),
  approval(L, 'apr-whitaker-followup', {
    delay: 600,
    awaitApproval: 'apr-whitaker-followup',
    onDecision: { approve: 'sent', edit: 'sent', skip: 'nosend' },
  }),
  { author: L, kind: 'sent', silent: true, label: 'sent', delay: 600, content: followUp,
    effects: [{ type: 'botStatus', botId: L, status: 'scheduled', lastActivity: 'Followed up with Sam Whitaker; next check tomorrow at 8am' }] },
  bot(L, 'Sent. Next check is tomorrow at 8am. If Sam has not replied by Saturday I will draft a third and last touch, and after that I stop and tell you.', { delay: 1000, end: true }),
  bot(L, 'Not sent. Sam stays open at 41 hours and I will ask again at tomorrow’s check.', {
    label: 'nosend',
    delay: 800,
    end: true,
    effects: [{ type: 'botStatus', botId: L, status: 'idle' }],
  }),
])
