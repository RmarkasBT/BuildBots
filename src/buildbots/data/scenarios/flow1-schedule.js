// Flow 1 — native write with approval. Schedule Analyzer opens having
// already found something on Hargrove.
import { bot, thinking, approval, action, awaitUser, scenario } from '../../engine/types'

const B = 'schedule-analyzer'

export const scheduleConflict = scenario('schedule-conflict', 'Flow 1 — Schedule Analyzer, Hargrove conflict', B, [
  bot(B, 'Framing inspection on Hargrove is set for Wed Oct 7, but Redline does not finish plumbing rough-in until Thu Oct 8. The inspector will fail it. Vega Framing is also booked on Teller that Thursday, so backframe cannot slide one day.', {
    delay: 500,
    effects: [{ type: 'botStatus', botId: B, unread: 0, status: 'waiting' }],
  }),
  thinking(B, 'Checked 4 jobs, 6 predecessors, 2 crew calendars', [
    'Read the Hargrove schedule: 6 items in the next two weeks',
    'Walked predecessors: framing inspection depends on plumbing rough-in (FS)',
    'Checked Vega Framing on Teller: committed Thu Oct 8 through Fri Oct 9',
    'Checked Allstar Electric and Monarch: both can move without a new conflict',
    'Checked the 10-day forecast: dry through Oct 16',
  ], { delay: 900 }),
  bot(B, 'Cleanest fix is two working days. Inspection moves to Fri Oct 9, Vega backframe to Mon Oct 12, Allstar to Oct 12 through 15, and Monarch insulation to Oct 16 through 20. Nothing downstream of insulation moves. Here are the moves, and the schedule is open on the right.', {
    delay: 1400,
    effects: [{ type: 'openLive', mode: 'document', targetId: 'hargrove-schedule', title: 'Hargrove Residence — Schedule' }],
  }),
  approval(B, 'apr-hargrove-shift', {
    delay: 700,
    awaitApproval: 'apr-hargrove-shift',
    onDecision: { approve: 'approved', edit: 'approved', skip: 'skipped' },
  }),

  // --- approved ---
  action(B, {
    title: 'Updated 4 schedule items on Hargrove Residence',
    detail: 'Framing inspection, Backframe and blocking, Electrical rough-in, Insulation. Predecessors preserved.',
    source: 'buildertrend',
    status: 'done',
    open: { mode: 'document', targetId: 'hargrove-schedule', title: 'Hargrove Residence — Schedule' },
  }, {
    label: 'approved',
    delay: 600,
    effects: [{ type: 'botStatus', botId: B, status: 'idle', lastActivity: 'Moved four Hargrove items, today' }],
  }),
  bot(B, 'Done. Three subs are affected: Vega Framing, Allstar Electric and Monarch Drywall. Want me to text them? Each one comes to you before it goes out.', {
    delay: 1100,
    ...awaitUser([
      { label: 'Notify the three subs', goto: 'notify' },
      { label: 'Not yet', goto: 'later' },
    ]),
  }),

  // --- notify: the bot drafts the texts itself; outbound always waits for an OK ---
  bot(B, 'Starting with Vega, since they move first. Here is the text to Luis.', {
    label: 'notify',
    delay: 800,
    effects: [
      { type: 'botStatus', botId: B, status: 'waiting' },
      { type: 'pushApproval', approval: {
        id: 'apr-vega-shift',
        botId: B,
        jobId: 'hargrove',
        kind: 'sms',
        title: 'Text Vega Framing about the Hargrove shift',
        summary: 'Outbound text to Luis Vega. Leaves the company, so it needs your OK.',
        native: false,
        draft: { channel: 'sms', to: 'Luis Vega, Vega Framing', toPhone: '(469) 555-0142', body: 'Luis, Northaven here. Hargrove backframe and blocking moved from Thu Oct 8 to Mon Oct 12 so the framing inspection lands after plumbing rough-in. Still good for the 12th?' },
        status: 'pending',
        onDecision: { approve: [], skip: [] },
      } },
    ],
  }),
  approval(B, 'apr-vega-shift', { delay: 500, awaitApproval: 'apr-vega-shift', onDecision: { approve: 'sent', edit: 'sent', skip: 'nosend' } }),
  { author: B, kind: 'sent', label: 'sent', delay: 600, content: {
    channel: 'sms', to: 'Luis Vega, Vega Framing', toPhone: '(469) 555-0142',
    body: 'Luis, Northaven here. Hargrove backframe and blocking moved from Thu Oct 8 to Mon Oct 12 so the framing inspection lands after plumbing rough-in. Still good for the 12th?',
  }, effects: [{ type: 'botStatus', botId: B, status: 'idle', lastActivity: 'Texted Vega about the Hargrove shift' }] },
  bot(B, 'Sent. Allstar and Monarch are next; I will bring each one to you the same way and post replies here as they come in.', { delay: 1000, end: true }),
  bot(B, 'Not sent. Vega still has the 8th on their calendar. I will leave the subs to you.', { label: 'nosend', delay: 700, end: true, effects: [{ type: 'botStatus', botId: B, status: 'idle' }] }),

  bot(B, 'Left as is. I will flag it again if anything else shifts on Hargrove.', { label: 'later', delay: 700, end: true }),

  // --- skipped ---
  bot(B, 'Left the schedule alone. The inspection will fail as scheduled unless Redline finishes a day early. I will check again at 6am tomorrow.', {
    label: 'skipped',
    delay: 800,
    end: true,
    effects: [
      { type: 'botStatus', botId: B, status: 'idle' },
      { type: 'closeLive' },
    ],
  }),
])
