// Routines per bot. trigger.kind: 'schedule' | 'event' | 'inbound' | 'request'
export const routines = [
  {
    id: 'daily-log-5pm',
    botId: 'daily-log',
    name: 'Post the daily log',
    trigger: { kind: 'event', label: 'When a walkthrough video is uploaded' },
    lastRun: 'Yesterday, 4:52pm',
  },
  {
    id: 'schedule-6am',
    botId: 'schedule-analyzer',
    name: 'Morning schedule check',
    trigger: { kind: 'schedule', label: 'Every weekday at 6am' },
    lastRun: 'Today, 6:00am',
  },
  {
    id: 'material-delivery',
    botId: 'material-tracker',
    name: 'Chase late deliveries',
    trigger: { kind: 'schedule', label: 'Every weekday at 7am' },
    lastRun: 'Today, 7:00am',
  },
  {
    id: 'material-inbound',
    botId: 'material-tracker',
    name: 'Log supplier texts',
    trigger: { kind: 'inbound', label: 'When a supplier texts' },
    lastRun: 'Tuesday, 2:14pm',
  },
]

export const triggerKinds = [
  { kind: 'schedule', label: 'On a schedule' },
  { kind: 'event', label: 'On a Buildertrend event' },
  { kind: 'inbound', label: 'On an inbound message' },
  { kind: 'request', label: 'On request only' },
]
