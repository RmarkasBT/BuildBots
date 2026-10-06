// Flow 3 — creating a bot by conversation. No form anywhere. The Shop
// Foreman interviews you; the bot forms in the right pane; on Create it
// lands in the roster and sends its first message.
import { bot, thinking, approval, awaitUser, scenario } from '../../engine/types'
import { sopWarrantyResponse } from '../documents'
import { castellanoEmailApproval } from '../approvals'

const F = 'shop-foreman'
const W = 'warranty'
const PREVIEW = { type: 'openLive', mode: 'preview', targetId: F, title: 'New bot' }

// Knowledge layers offered in exchange 3. Statuses are the point.
const LAYERS = [
  { id: 'bt', group: 'bt', label: 'Buildertrend knowledge', detail: '412 articles, always current', on: true, locked: true },
  { id: 'website', group: 'business', label: 'Your website', detail: 'warranty terms, brand voice', on: true },
  { id: 'derived', group: 'business', label: 'Your last 180 jobs', detail: 'punch lists close in 19 days on average', on: true },
  { id: 'punch-walkthrough', group: 'sop', label: 'Punch List Walkthrough', on: true, status: 'indexed' },
  { id: 'warranty-response', group: 'sop', label: 'Warranty Response', on: true, status: 'thin' },
  { id: 'change-order-policy', group: 'sop', label: 'Change Order Policy', on: false, status: 'indexed' },
]

const card = (author, content, opts = {}) => ({ author, kind: 'card', content, delay: 600, ...opts })

export const createBot = scenario('create-bot', 'Flow 3 — Shop Foreman builds Warranty Follow-up', F, [
  // 1. What should it take off your plate?
  bot(F, 'What should this bot take off your plate?', {
    delay: 500,
    effects: [{ type: 'draftBot', patch: { knowledge: undefined } }, PREVIEW],
    ...awaitUser([
      { label: 'Generating leads and following up until they book', goto: 'leads' },
      { label: 'Chasing open warranty and punch items', goto: 'scope' },
      { label: 'Keeping homeowners posted after closeout', goto: 'scope' },
    ]),
  }),
  // Hands into Flow 6 in its own scenario so the dev drawer can jump there.
  { author: 'system', kind: 'notice', content: '', label: 'leads', delay: 0, end: true, silent: true,
    effects: [{ type: 'startScenario', convId: F, scenarioId: 'create-leads-bot' }] },

  // 2. Clarifying scope.
  bot(F, 'Warranty and punch. Two open items on Castellano right now, nine and six days old, neither scheduled — so there is work waiting. One question on scope: warranty items after closeout only, or the punch list before closeout too?', {
    label: 'scope',
    delay: 1200,
    effects: [{ type: 'draftBot', patch: { name: 'Warranty Follow-up', avatar: 'shield', job: 'Chases open punch and warranty items, keeps homeowners posted' } }],
    ...awaitUser([
      { label: 'Both, punch and warranty', goto: 'know' },
      { label: 'Warranty after closeout only', goto: 'know-warranty' },
    ]),
  }),
  { author: 'system', kind: 'notice', content: '', label: 'know-warranty', delay: 0, silent: true, next: 'know',
    effects: [{ type: 'draftBot', patch: { scope: 'Warranty items after closeout. Punch stays with the PM.' } }] },

  // 3. What should it know? — the three layers as toggles, in the thread.
  bot(F, 'Here is what it can draw on. Buildertrend knowledge is always on. Turn the rest on or off.', {
    label: 'know',
    delay: 1000,
    effects: [{ type: 'draftBot', patch: { scope: 'Open punch items on active jobs and warranty items after closeout', knowledge: LAYERS } }],
  }),
  card(F, {
    variant: 'knowledge',
    title: 'What this bot should know',
    layers: LAYERS,
    options: [{ label: 'Continue', goto: 'gap', send: 'Those sources are right.' }],
  }, { awaitUser: { chips: [], hidden: true } }),

  // The gap surfaces naturally: Warranty Response is thin.
  bot(F, 'One gap. Your Warranty Response SOP is a single page from 2024 — no response-time targets, no homeowner communication steps. The bot would fall back on Buildertrend best practices there, which is fine, but it would not be your process.', {
    label: 'gap',
    delay: 1300,
    sources: ['Warranty Response SOP', 'Buildertrend Best Practices'],
  }),
  card(F, {
    variant: 'consulting',
    title: 'Warranty Response',
    status: 'thin',
    gap: 'One page, no response-time targets, no homeowner communication steps.',
    body: 'I do not have your process for this. Want to write it with me, or have a Buildertrend consultant help build it with your team?',
    options: [
      { label: 'Write it with me', goto: 'write', send: 'Write it with me.' },
      { label: 'Talk to a consultant', goto: 'consultant', send: 'I want to talk to a consultant.' },
    ],
  }, { delay: 500, awaitUser: { chips: [], hidden: true } }),

  // --- write it with me: a short authoring exchange ---
  bot(F, 'Two questions and I will draft it. How fast should a homeowner hear back, and how fast should a fix be on the calendar?', {
    label: 'write',
    delay: 900,
    ...awaitUser([
      { label: 'Same day reply, fix scheduled within 5 business days', goto: 'write-2' },
      { label: 'Within 48 hours, fix within 10 business days', goto: 'write-2' },
    ]),
  }),
  bot(F, 'And who approves a warranty claim before a trade is dispatched?', {
    label: 'write-2',
    delay: 900,
    ...awaitUser([
      { label: 'Me, for anything over $500 or structural', goto: 'write-3' },
      { label: 'Me, every time', goto: 'write-3' },
    ]),
  }),
  thinking(F, 'Drafted five sections from your answers, the website warranty page, and Buildertrend’s warranty SOP template', [
    'Response time and scheduling targets from your first answer',
    'Approval threshold from your second answer',
    'Coverage terms pulled from northavenhomes.com/warranty',
    'Three-touch communication pattern from Buildertrend Best Practices',
    'Escalation rule from your last 180 jobs: trades confirm within 2 days 81% of the time',
  ], { label: 'write-3', delay: 1800 }),
  bot(F, 'Written. Warranty Response is now five sections and indexed — it is open on the right. Edit anything later from the Knowledge panel. The new bot will follow it.', {
    delay: 1200,
    sources: ['Warranty Response SOP', 'northavenhomes.com', 'Buildertrend Best Practices'],
    next: 'trust',
    effects: [
      { type: 'setDoc', doc: sopWarrantyResponse },
      { type: 'openLive', mode: 'document', targetId: 'sop-warranty-response', title: 'Warranty Response' },
      { type: 'knowledgeSop', id: 'warranty-response', status: 'indexed' },
      { type: 'knowledgeBranch', branch: 'self' },
      { type: 'draftBot', patch: { knowledge: LAYERS.map((l) => (l.id === 'warranty-response' ? { ...l, status: 'indexed' } : l)) } },
    ],
  }),

  // --- talk to a consultant: request panel with confirmation, then continue ---
  bot(F, 'Opening a request. A Buildertrend consultant will build the Warranty Response process with your team; until then the bot uses Buildertrend best practices for warranty handling.', {
    label: 'consultant',
    delay: 900,
    end: true,
    effects: [{ type: 'setUi', patch: { panel: 'consultant', panelContext: { convId: F, resumeLabel: 'consultant-done', sopTitle: 'Warranty Response', notes: 'Current SOP is one page from 2024. Need response-time targets and homeowner communication steps.' } } }],
  }),
  bot(F, 'Request sent. Someone will reach out within one business day. Moving on.', {
    label: 'consultant-done',
    delay: 700,
    next: 'trust',
    effects: [{ type: 'draftBot', patch: { knowledge: LAYERS.map((l) => (l.id === 'warranty-response' ? { ...l, detail: 'consultant engaged' } : l)) } }],
  }),

  // 4. What is it allowed to do on its own?
  // The SOP (or consultant note) stays visible through this question; the
  // forming-bot preview returns on the next one.
  bot(F, 'What is it allowed to do on its own? Suggest means it drafts and waits for you. Act means it does the work inside Buildertrend and tells you after. Either way, anything that leaves the company — a text or an email to a homeowner or a trade — always needs your OK.', {
    label: 'trust',
    delay: 2200,
    ...awaitUser([
      { label: 'Suggest — draft and wait for me', goto: 'trust-suggest' },
      { label: 'Act — schedule trades on its own', goto: 'trust-act' },
    ]),
  }),
  { author: 'system', kind: 'notice', content: '', label: 'trust-suggest', delay: 0, silent: true, next: 'when',
    effects: [{ type: 'draftBot', patch: { trust: 'suggest', channels: 'Email and text, under Northaven Homes, signed by the bot' } }] },
  { author: 'system', kind: 'notice', content: '', label: 'trust-act', delay: 0, silent: true, next: 'when',
    effects: [{ type: 'draftBot', patch: { trust: 'act', channels: 'Email and text, under Northaven Homes, signed by the bot' } }] },

  // 5. When should it work?
  bot(F, 'When should it work?', {
    label: 'when',
    delay: 900,
    effects: [PREVIEW],
    ...awaitUser([
      { label: 'Every weekday at 7am', goto: 'when-sched' },
      { label: 'Whenever a punch or warranty item is opened', goto: 'when-event' },
      { label: 'Only when I ask', goto: 'when-request' },
    ]),
  }),
  { author: 'system', kind: 'notice', content: '', label: 'when-sched', delay: 0, silent: true, next: 'summary',
    effects: [{ type: 'draftBot', patch: { scheduleKind: 'schedule', scheduleLabel: 'Every weekday at 7am' } }] },
  { author: 'system', kind: 'notice', content: '', label: 'when-event', delay: 0, silent: true, next: 'summary',
    effects: [{ type: 'draftBot', patch: { scheduleKind: 'event', scheduleLabel: 'When a punch or warranty item is opened' } }] },
  { author: 'system', kind: 'notice', content: '', label: 'when-request', delay: 0, silent: true, next: 'summary',
    effects: [{ type: 'draftBot', patch: { scheduleKind: 'request', scheduleLabel: 'On request only' } }] },

  // 6. Summary with Create / Keep tuning.
  bot(F, 'Here is the bot. Create it, or keep tuning.', { label: 'summary', delay: 900 }),
  card(F, {
    variant: 'summary',
    title: 'Warranty Follow-up',
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

  // Create: the bot animates into the roster and sends its first message.
  bot(F, 'Built. Warranty Follow-up is in your roster and already looking at Castellano.', {
    label: 'create',
    delay: 1100,
    end: true,
    effects: [
      { type: 'applyDraftBot', fromConvId: F, botId: W },
      { type: 'addBotToRoster', botId: W },
      { type: 'closeLive' },
      { type: 'botStatus', botId: W, status: 'working', lastActivity: 'Reading Castellano punch and warranty items' },
      { type: 'startScenario', convId: W, scenarioId: 'warranty-first' },
    ],
  }),
])

// The new bot's first message: it found two open punch items on Castellano
// and brings the homeowner email to you.
export const warrantyFirst = scenario('warranty-first', 'Flow 3 — Warranty Follow-up’s first message', W, [
  thinking(W, 'Read Castellano: 2 open punch items, 0 warranty claims, 1 scheduled trade', [
    'Castellano Remodel is in punch and closeout; contract signed Jan 2026',
    'Open punch items: master bath grout hairline (9 days), pantry door rubs at strike (6 days)',
    'Neither has a trade scheduled; Monarch Drywall did the bath tile grout',
    'Warranty Response SOP: same-day acknowledgment, fix within 5 business days — both items are past that',
  ], { delay: 2200 }),
  bot(W, 'Two open punch items on Castellano, both past the five-day target. Master bath grout hairline, nine days, Monarch Drywall’s scope. Pantry door rubbing at the strike plate, six days, a fifteen-minute carpentry fix. Neither has a date. I have Monarch for Thursday 8 to 10am for the grout and drafted the homeowner update. The email waits for your OK.', {
    delay: 1400,
    sources: ['Warranty Response SOP', 'Buildertrend Best Practices'],
    effects: [
      { type: 'selectConv', convId: W },
      { type: 'botStatus', botId: W, status: 'waiting', unread: 0 },
      { type: 'pushApproval', approval: castellanoEmailApproval },
    ],
  }),
  approval(W, 'apr-castellano-email', {
    delay: 600,
    awaitApproval: 'apr-castellano-email',
    onDecision: { approve: 'sent', edit: 'sent', skip: 'nosend' },
  }),
  { author: W, kind: 'sent', silent: true, label: 'sent', delay: 600, content: {
    channel: 'email',
    to: 'Rob and Maria Castellano',
    toEmail: 'castellanos@example.com',
    subject: 'Master bath grout repair — scheduled Thursday',
    body: 'Rob and Maria, the grout hairline in the master bath is scheduled for repair Thursday Oct 8 between 8 and 10am. Monarch will need about an hour. Reply if that window does not work.',
  }, effects: [{ type: 'botStatus', botId: W, status: 'scheduled', lastActivity: 'Emailed the Castellanos; Monarch Thu 8–10am' }] },
  bot(W, 'Sent. I will confirm with Monarch tomorrow morning and post the pantry door fix once I find a carpenter with an open hour.', { delay: 1000, end: true }),
  bot(W, 'Not sent. The grout appointment with Monarch still holds; the homeowners have not been told.', { label: 'nosend', delay: 800, end: true, effects: [{ type: 'botStatus', botId: W, status: 'idle' }] }),
])
