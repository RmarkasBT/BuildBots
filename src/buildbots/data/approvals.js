// The approval queue starts empty. Every flow pushes its own approval into
// the queue at the moment the bot drafts it (`pushApproval` effect), so the
// bell only ever counts drafts the viewer has watched being written.
// `onDecision` lists the effects applied for each decision. Approvals that
// lead nowhere feel hollow, so every approve has a visible consequence.
export const seededApprovals = []

// Flow 1: Schedule Analyzer's four-trade shift on Hargrove.
export const hargroveShiftApproval = {
    id: 'apr-hargrove-shift',
    botId: 'schedule-analyzer',
    jobId: 'hargrove',
    kind: 'schedule',
    title: 'Push four trades on Hargrove by two days',
    summary: 'Framing inspection, Vega Framing backframe, Allstar Electric rough-in and Monarch insulation each move two working days later.',
    native: true,
    preview: { docId: 'hargrove-schedule' },
    status: 'pending',
    onDecision: {
      approve: [
        { type: 'patchDoc', docId: 'hargrove-schedule', op: 'applyProposed' },
        { type: 'openLive', mode: 'document', targetId: 'hargrove-schedule' },
        { type: 'botStatus', botId: 'schedule-analyzer', status: 'idle', unread: 0 },
        {
          type: 'addMessage',
          convId: 'schedule-analyzer',
          message: { author: 'system', kind: 'notice', content: 'Schedule change approved from the queue. Four items moved on Hargrove.' },
        },
      ],
      skip: [
        { type: 'botStatus', botId: 'schedule-analyzer', status: 'idle', unread: 0 },
      ],
    },
}

// Flow 3: Warranty Follow-up's first homeowner email.
export const castellanoEmailApproval = {
    id: 'apr-castellano-email',
    botId: 'warranty',
    jobId: 'castellano',
    kind: 'email',
    title: 'Email the Castellano homeowners about a punch item',
    summary: 'Status update on the master bath grout repair. Leaves the company, so it needs your OK.',
    native: false,
    draft: {
      channel: 'email',
      to: 'Rob and Maria Castellano',
      toEmail: 'castellanos@example.com',
      subject: 'Master bath grout repair — scheduled Thursday',
      body: 'Rob and Maria, the grout hairline in the master bath is scheduled for repair Thursday Oct 8 between 8 and 10am. Monarch will need about an hour. Reply if that window does not work.\n\nWarranty Follow-up, on behalf of Northaven Homes',
    },
    status: 'pending',
    onDecision: {
      approve: [
        {
          type: 'addMessage',
          convId: 'warranty',
          message: {
            author: 'warranty',
            kind: 'sent',
            content: {
              channel: 'email',
              to: 'Rob and Maria Castellano',
              toEmail: 'castellanos@example.com',
              subject: 'Master bath grout repair — scheduled Thursday',
              body: 'Rob and Maria, the grout hairline in the master bath is scheduled for repair Thursday Oct 8 between 8 and 10am. Monarch will need about an hour. Reply if that window does not work.',
            },
          },
        },
      ],
      skip: [],
    },
}
