// Flow 2 — a connector, an email and a text. Material Tracker is asked
// about the Crumley Ranch trusses, reads the supplier's revision through the
// Gmail connector (already connected, no setup shown), finds the order is
// late, drafts an email to Keystone asking them to pull the date in, then
// texts the PM about the risk. Both messages leave the company, so each
// waits for an OK even in Act mode.
import { bot, thinking, approval, action, browser, awaitUser, scenario } from '../../engine/types'
import { scriptDuration } from '../browserMocks'

const B = 'material-tracker'
const KEYSTONE = scriptDuration('keystone', 'truss-check')

const GMAIL_OPEN = { mode: 'document', targetId: 'crumley-email', title: 'Keystone delivery revision — PO 4471' }
const SCHEDULE_OPEN = { mode: 'document', targetId: 'crumley-schedule', title: 'Crumley Ranch — Schedule' }

// Drafts. The approval card shows them; the sent card repeats them.
const keystoneEmail = {
  channel: 'email',
  to: 'R. Castillo, Keystone dispatch',
  toEmail: 'dispatch@keystonebuildingsupply.com',
  subject: 'Re: Delivery update: PO 4471 (Crumley Ranch) — can you pull this in?',
  body: 'R.,\n\nNorthaven Homes on PO 4471, the truss package for Crumley Ranch. The revised date of Fri Oct 9 leaves our framing crew idle a full week and pushes the framing inspection. Is there any way to ship earlier, even as a split load with the 34 commons first and the girder and hip sets to follow? We can take delivery any day this week or next with a day’s notice.\n\nThanks,\nMaterial Tracker, for Dana Whitfield\nNorthaven Homes',
}

const pmText = {
  channel: 'sms',
  to: 'Jordan Reyes, PM on Crumley Ranch',
  toPhone: '(469) 555-0188',
  body: 'Jordan, Material Tracker at Northaven. Heads up on Crumley Ranch: Keystone pushed the truss delivery from Oct 1 to Fri Oct 9. Vega is set to start Mon and the framing inspection on the 9th is at risk. I have asked Keystone to ship earlier and will update you when they reply.',
}

const keystoneReply = {
  channel: 'email',
  from: 'R. Castillo, Keystone dispatch',
  when: 'just now',
  body: 'Dana, we can split it. The 34 commons are ready now and can go out Wed Oct 7 from Lufkin. Girder and hip sets follow Fri Oct 9 on a second truck, no charge. Reply to confirm and I will lock both slots.',
}

// Pushed into the queue as the bot drafts them, so the bell climbs live.
const aprKeystoneEmail = {
  id: 'apr-keystone-email',
  botId: B,
  jobId: 'crumley',
  kind: 'email',
  title: 'Email Keystone dispatch to pull in the PO 4471 delivery',
  summary: 'Reply to Keystone’s revision asking to ship earlier or split the load. Leaves the company, so it needs your OK in both modes.',
  native: false,
  draft: keystoneEmail,
  status: 'pending',
  onDecision: { approve: [], skip: [] },
}

const aprPmText = {
  id: 'apr-crumley-pm-text',
  botId: B,
  jobId: 'crumley',
  kind: 'sms',
  title: 'Text Jordan Reyes about the truss risk on Crumley Ranch',
  summary: 'Outbound text to the PM. Leaves the company, so it needs your OK in both modes.',
  native: false,
  draft: pmText,
  status: 'pending',
  onDecision: { approve: [], skip: [] },
}

// The week-long slip if Keystone holds Oct 9. Ghosted on the schedule doc
// as soon as the bot reads the email.
const SLIP = [
  { rowId: 'truss-deliv', patch: { proposedStart: '2026-10-09', proposedEnd: '2026-10-09' } },
  { rowId: 'truss-set', patch: { proposedStart: '2026-10-12', proposedEnd: '2026-10-13' } },
  { rowId: 'sheath', patch: { proposedStart: '2026-10-14', proposedEnd: '2026-10-15' } },
  { rowId: 'frame-insp', patch: { proposedStart: '2026-10-16', proposedEnd: '2026-10-16' } },
  { rowId: 'dry-in', patch: { proposedStart: '2026-10-19', proposedEnd: '2026-10-20' } },
].map(({ rowId, patch }) => ({ type: 'patchDoc', docId: 'crumley-schedule', op: 'setRow', rowId, patch }))

// The shorter move once Keystone splits the load: commons Wed Oct 7.
const FIX = [
  { rowId: 'truss-deliv', patch: { start: '2026-10-07', end: '2026-10-09' } },
  { rowId: 'truss-set', patch: { start: '2026-10-08', end: '2026-10-09' } },
  { rowId: 'sheath', patch: { start: '2026-10-12', end: '2026-10-13' } },
  { rowId: 'frame-insp', patch: { start: '2026-10-14', end: '2026-10-14' } },
  { rowId: 'dry-in', patch: { start: '2026-10-15', end: '2026-10-16' } },
].map(({ rowId, patch }) => ({
  type: 'patchDoc', docId: 'crumley-schedule', op: 'setRow', rowId,
  patch: { ...patch, moved: true, conflict: false, proposedStart: undefined, proposedEnd: undefined },
}))

export const materialTrusses = scenario('material-trusses', 'Flow 2 — Material Tracker: late trusses, supplier email, PM text', B, [
  // 1. Status asked. The portal is stale, so the bot goes to supplier mail
  // through the Gmail connector, which is already connected.
  bot(B, 'Keystone’s portal still lists PO 4471 as “Updated” with no new date, and nothing arrived on site yesterday. Keystone sends delivery revisions by email, so I am checking the supplier thread.', {
    delay: 900,
    effects: [{ type: 'botStatus', botId: B, status: 'working', lastActivity: 'Checking PO 4471 for Crumley Ranch' }],
  }),

  // 2. Read the thread.
  action(B, {
    title: 'Searching Gmail for Keystone messages about PO 4471',
    detail: 'from:keystonebuildingsupply.com "PO 4471", last 14 days.',
    source: 'connector',
    connector: 'Gmail',
    status: 'running',
    open: GMAIL_OPEN,
    openLabel: 'View what it found',
  }, {
    id: 'gm-action',
    delay: 700,
    effects: [{ type: 'botStatus', botId: B, status: 'working', lastActivity: 'Searching Gmail for Keystone, PO 4471' }],
  }),
  thinking(B, 'Searched Gmail, read 3 messages, matched one PO', [
    'Searched Gmail: from:keystonebuildingsupply.com "PO 4471" newer_than:14d — 3 matches',
    'Sep 11 and Sep 17 are the quote acceptance and the original confirmation (delivery 10/01)',
    'Sep 30, 4:47pm from Keystone dispatch: delivery revised to Fri Oct 9, plant backlog in Lufkin',
    'Matched PO 4471 to the Crumley Ranch truss package in Buildertrend',
    'Checked the Crumley Ranch schedule for items that depend on trusses',
  ], {
    delay: 2600,
    effects: [
      { type: 'openLive', ...GMAIL_OPEN },
      { type: 'patchMessage', id: 'material-tracker:gm-action', patch: { content: { title: 'Found Keystone’s delivery revision for PO 4471', detail: 'Sep 30 email from Keystone dispatch. Revised delivery and reason extracted.', source: 'connector', connector: 'Gmail', status: 'done', open: GMAIL_OPEN, openLabel: 'View what it found' } } },
    ],
  }),

  // 3. It is late.
  bot(B, 'It’s late. The trusses were due yesterday, Thu Oct 1, and nothing arrived. Keystone dispatch emailed Wed Sep 30 at 4:47pm: revised to Fri Oct 9, plant backlog at Lufkin, no change to pricing. Nobody had read it. Vega Framing is scheduled to set trusses Mon Oct 5, sheathing follows, and the framing inspection is Fri Oct 9. All of it slips a week unless Keystone pulls the date in.', {
    delay: 1400,
    effects: [
      ...SLIP,
      { type: 'openLive', ...SCHEDULE_OPEN },
      { type: 'botStatus', botId: B, status: 'idle', lastActivity: 'Crumley trusses late, Keystone revised to Oct 9' },
    ],
  }),

  // 4. Ask the supplier to speed it up.
  bot(B, 'I drafted a reply to Keystone dispatch asking them to ship earlier or split the load so the commons land first. I am in Act mode, but email leaves the company, so it waits for you.', {
    delay: 1200,
    effects: [
      { type: 'pushApproval', approval: aprKeystoneEmail },
      { type: 'botStatus', botId: B, status: 'waiting' },
    ],
  }),
  approval(B, 'apr-keystone-email', {
    delay: 500,
    awaitApproval: 'apr-keystone-email',
    onDecision: { approve: 'supplier-sent', edit: 'supplier-sent', skip: 'supplier-skip' },
  }),

  // --- supplier skipped ---
  bot(B, 'Not sent. Keystone still has you on Fri Oct 9, and Jordan Reyes, the PM on Crumley Ranch, does not know yet. I will leave both to you.', {
    label: 'supplier-skip',
    delay: 800,
    end: true,
    effects: [{ type: 'botStatus', botId: B, status: 'idle' }],
  }),

  // --- supplier sent ---
  { author: B, kind: 'sent', silent: true, label: 'supplier-sent', delay: 600, content: keystoneEmail,
    effects: [{ type: 'botStatus', botId: B, status: 'idle', lastActivity: 'Emailed Keystone dispatch about PO 4471' }] },
  bot(B, 'Sent to Keystone dispatch. I will post the reply here when it comes in.', { delay: 900 }),

  // 5. Tell the PM there is risk.
  bot(B, 'One more thing. Jordan Reyes runs Crumley Ranch and has not seen this. Vega shows up Monday with nothing to set, and the framing inspection on the 9th is at real risk. Want me to text Jordan?', {
    delay: 1300,
    effects: [{ type: 'botStatus', botId: B, status: 'waiting' }],
    ...awaitUser([
      { label: 'Yes, draft a text to Jordan', goto: 'pm' },
      { label: 'I’ll tell Jordan myself', goto: 'nopm' },
    ]),
  }),
  bot(B, 'Here is the draft. It goes out under Northaven Homes from the company line, so it waits for you.', {
    label: 'pm',
    delay: 900,
    effects: [{ type: 'pushApproval', approval: aprPmText }],
  }),
  approval(B, 'apr-crumley-pm-text', {
    delay: 500,
    awaitApproval: 'apr-crumley-pm-text',
    onDecision: { approve: 'pm-sent', edit: 'pm-sent', skip: 'pm-skip' },
  }),
  { author: B, kind: 'sent', silent: true, label: 'pm-sent', delay: 600, content: pmText, next: 'reply',
    effects: [{ type: 'botStatus', botId: B, status: 'idle', lastActivity: 'Texted Jordan Reyes about the Crumley truss risk' }] },
  bot(B, 'Not sent. Jordan still expects trusses Monday. I will leave that to you.', {
    label: 'pm-skip',
    delay: 800,
    next: 'reply',
    effects: [{ type: 'botStatus', botId: B, status: 'idle' }],
  }),
  bot(B, 'Okay, I will leave Jordan to you.', {
    label: 'nopm',
    delay: 700,
    next: 'reply',
    effects: [{ type: 'botStatus', botId: B, status: 'idle' }],
  }),

  // 6. Keystone replies; the bot proposes the shorter move.
  { author: B, kind: 'inbound', label: 'reply', delay: 2600, typing: false, content: keystoneReply,
    effects: [{ type: 'botStatus', botId: B, status: 'waiting', unread: 1 }] },
  bot(B, 'Keystone can split the load: the 34 commons ship Wed Oct 7, the girder and hip sets Fri Oct 9, no extra charge. Vega can set commons Thu Oct 8 and finish when the girders land. That pulls the framing inspection back to Wed Oct 14 instead of the 16th. Want me to update the schedule?', {
    delay: 1400,
    effects: [{ type: 'botStatus', botId: B, unread: 0 }],
    ...awaitUser([
      { label: 'Yes, update the schedule', goto: 'update' },
      { label: 'Hold for now', goto: 'hold' },
    ]),
  }),
  action(B, {
    title: 'Updated 5 schedule items on Crumley Ranch',
    detail: 'Truss delivery → Wed Oct 7 to Fri Oct 9 (split). Set trusses → Oct 8–9. Sheathing → Oct 12–13. Framing inspection → Wed Oct 14. Roof dry-in → Oct 15–16.',
    source: 'buildertrend',
    status: 'done',
    open: SCHEDULE_OPEN,
  }, {
    label: 'update',
    delay: 900,
    effects: [
      ...FIX,
      { type: 'patchDoc', docId: 'crumley-schedule', op: 'merge', patch: { applied: true, appliedLabel: 'Updated by Material Tracker, today' } },
      { type: 'openLive', ...SCHEDULE_OPEN },
      { type: 'botStatus', botId: B, status: 'idle', lastActivity: 'Moved Crumley framing after Keystone split the load' },
    ],
  }),
  bot(B, 'Done. I confirmed both slots with Keystone and I will keep watching PO 4471. If the date moves again, Jordan hears about it the same hour.', { delay: 1000, end: true }),
  bot(B, 'Holding. Keystone’s reply stays here and the schedule is unchanged. Say the word and I will make the move.', { label: 'hold', delay: 800, end: true }),
])

// Browser demos, reachable from the dev drawer. Keystone is the fallback
// when the email trail is missing: no API, so the bot drives the portal.
export const keystoneDemo = scenario('demo-keystone', 'Browser demo — Keystone dealer portal', B, [
  bot(B, 'Nothing from Keystone in the inbox about PO 4471, and they have no API. I will check the dealer portal directly.', {
    delay: 500,
    effects: [{ type: 'botStatus', botId: B, status: 'working' }],
  }),
  browser(B, {
    title: 'Checking PO 4471 on Keystone Building Supply',
    detail: 'Signing in, opening the order, reading the delivery schedule.',
    source: 'browser', status: 'running',
    open: { mode: 'browser', targetId: 'keystone', scriptId: 'truss-check', title: 'Keystone Building Supply' },
  }, { id: 'ks-action', delay: 500, effects: [{ type: 'openLive', mode: 'browser', targetId: 'keystone', scriptId: 'truss-check', title: 'Keystone Building Supply' }] }),
  bot(B, 'Portal shows the same thing: revised to Fri Oct 9, plant backlog in Lufkin.', {
    delay: KEYSTONE + 600, typing: false, end: true,
    effects: [
      { type: 'patchMessage', id: 'material-tracker:ks-action', patch: { content: { title: 'Checked PO 4471 on Keystone Building Supply', detail: 'Revised delivery read from the order’s delivery tab.', source: 'browser', status: 'done', open: { mode: 'browser', targetId: 'keystone', scriptId: 'truss-check', title: 'Keystone Building Supply' }, openLabel: 'Replay in browser' } } },
      { type: 'botStatus', botId: B, status: 'idle' },
    ],
  }),
])

export const permitDemo = scenario('demo-permits', 'Browser demo — Travis County permit lookup', 'schedule-analyzer', [
  bot('schedule-analyzer', 'Checking the Hargrove framing inspection on the county portal. No API there either.', {
    delay: 500,
    effects: [{ type: 'botStatus', botId: 'schedule-analyzer', status: 'working' }],
  }),
  browser('schedule-analyzer', {
    title: 'Looking up permit 2026-BP-08841 at Travis County',
    detail: 'Permit lookup, status, scheduled inspection date.',
    source: 'browser', status: 'running',
    open: { mode: 'browser', targetId: 'travis-permits', scriptId: 'permit-check', title: 'Travis County Permit Services' },
  }, { id: 'tp-action', delay: 400, effects: [{ type: 'openLive', mode: 'browser', targetId: 'travis-permits', scriptId: 'permit-check', title: 'Travis County Permit Services' }] }),
  bot('schedule-analyzer', 'Framing inspection is still scheduled 10/07 with inspector Oyelaran. The county does not know it moved. Rescheduling needs a phone call before 4pm; I cannot do that for you.', {
    delay: scriptDuration('travis-permits', 'permit-check') + 600,
    typing: false,
    end: true,
    effects: [
      { type: 'patchMessage', id: 'schedule-analyzer:tp-action', patch: { content: { title: 'Looked up permit 2026-BP-08841', detail: 'Status: Inspection scheduled 10/07, framing (rough).', source: 'browser', status: 'done', open: { mode: 'browser', targetId: 'travis-permits', scriptId: 'permit-check', title: 'Travis County Permit Services' }, openLabel: 'Replay in browser' } } },
      { type: 'botStatus', botId: 'schedule-analyzer', status: 'idle' },
    ],
  }),
])

export const coiDemo = scenario('demo-coi', 'Browser demo — COI verification', B, [
  bot(B, 'Vega Framing’s certificate of insurance is close to expiring. Checking CertTrack.', { delay: 500, effects: [{ type: 'botStatus', botId: B, status: 'working' }] }),
  browser(B, {
    title: 'Verifying Vega Framing’s COI on CertTrack',
    detail: 'Search, open the certificate, read expirations.',
    source: 'browser', status: 'running',
    open: { mode: 'browser', targetId: 'coi', scriptId: 'vega-coi', title: 'CertTrack' },
  }, { id: 'coi-action', delay: 400, effects: [{ type: 'openLive', mode: 'browser', targetId: 'coi', scriptId: 'vega-coi', title: 'CertTrack — COI verification' }] }),
  bot(B, 'General liability and auto both expire Oct 18, sixteen days out. Workers’ comp is good through January. I can draft a renewal request to Luis; it would wait for your OK.', {
    delay: scriptDuration('coi', 'vega-coi') + 600, typing: false, end: true,
    effects: [
      { type: 'patchMessage', id: 'material-tracker:coi-action', patch: { content: { title: 'Verified Vega Framing’s COI', detail: 'GL and auto expire Oct 18, 2026. WC through Jan 31, 2027.', source: 'browser', status: 'done', open: { mode: 'browser', targetId: 'coi', scriptId: 'vega-coi', title: 'CertTrack' }, openLabel: 'Replay in browser' } } },
      { type: 'botStatus', botId: B, status: 'idle' },
    ],
  }),
])

export const changeOrderDemo = scenario('demo-change-order', 'Browser demo — Buildertrend Change Orders', 'estimation', [
  bot('estimation', 'Keystone’s girder redesign adds $2,480 to Hargrove. Change Orders has no API yet, so I will log it through the screen.', { delay: 500, effects: [{ type: 'botStatus', botId: 'estimation', status: 'working' }] }),
  browser('estimation', {
    title: 'Logging CO-07 in Buildertrend Change Orders',
    detail: 'New change order, title, amount, save as pending.',
    source: 'browser', status: 'running',
    open: { mode: 'browser', targetId: 'bt-change-orders', scriptId: 'log-co', title: 'Buildertrend — Change Orders' },
  }, { id: 'co-action', delay: 400, effects: [{ type: 'openLive', mode: 'browser', targetId: 'bt-change-orders', scriptId: 'log-co', title: 'Buildertrend — Change Orders' }] }),
  bot('estimation', 'CO-07 is saved as pending at $2,480. It goes to the homeowner only when you release it.', {
    delay: scriptDuration('bt-change-orders', 'log-co') + 600, typing: false, end: true,
    effects: [
      { type: 'patchMessage', id: 'estimation:co-action', patch: { content: { title: 'Logged CO-07 on Hargrove Residence', detail: 'Truss redesign, girder upcharge — $2,480.00, pending.', source: 'browser', status: 'done', open: { mode: 'browser', targetId: 'bt-change-orders', scriptId: 'log-co', title: 'Buildertrend — Change Orders' }, openLabel: 'Replay in browser' } } },
      { type: 'botStatus', botId: 'estimation', status: 'idle' },
    ],
  }),
])
