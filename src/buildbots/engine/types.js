// Beat schema and small builders. Scenario files import only from here so
// authors never touch components.
//
// @typedef {'user'|'system'|string} Author   — string = botId
// @typedef {'text'|'thinking'|'action'|'approval'|'browser'|'artifact'|'handoff'|'notice'|'sent'|'inbound'|'card'} BeatKind
//
// @typedef {Object} Chip
// @property {string} label        what the chip says
// @property {string} [send]       what appears as the user's message (defaults to label)
// @property {string} [goto]       label of the beat to jump to (defaults to next)
//
// @typedef {Object} Beat
// @property {string} [id]         stable id when a later beat patches it
// @property {Author} author
// @property {BeatKind} kind
// @property {*} content
// @property {number} [delay]      ms before it lands
// @property {boolean} [typing]    show the working indicator during delay
// @property {Object[]} [effects]  applied when it lands
// @property {{chips: Chip[]}} [awaitUser]
// @property {string} [awaitApproval]   approval id
// @property {{approve?: string, edit?: string, skip?: string}} [onDecision]  labels
// @property {string} [label]      jump target
// @property {{id: string, at: number}[]} [sideEvents]
//
// @typedef {Object} Scenario
// @property {string} id
// @property {string} title
// @property {string} convId
// @property {Beat[]} beats

export function bot(author, content, opts = {}) {
  return { author, kind: 'text', content, ...opts }
}

export function user(content, opts = {}) {
  return { author: 'user', kind: 'text', content, delay: 0, ...opts }
}

export function system(content, opts = {}) {
  return { author: 'system', kind: 'notice', content, delay: 400, ...opts }
}

// content: { summary, steps: string[] }
export function thinking(author, summary, steps, opts = {}) {
  return { author, kind: 'thinking', content: { summary, steps }, delay: 700, ...opts }
}

// content: { title, detail, source: 'buildertrend'|'browser', entity?, docId? }
export function action(author, content, opts = {}) {
  return { author, kind: 'action', content, delay: 800, ...opts }
}

// content: { approvalId }
export function approval(author, approvalId, opts = {}) {
  return { author, kind: 'approval', content: { approvalId }, delay: 800, ...opts }
}

// content: { mockId, scriptId, caption }
export function browser(author, content, opts = {}) {
  return { author, kind: 'browser', content, delay: 600, ...opts }
}

// content: { docId, title, caption, mode }
export function artifact(author, content, opts = {}) {
  return { author, kind: 'artifact', content, delay: 700, ...opts }
}

// content: { fromBotId, toBotId, reason }
export function handoff(fromBotId, toBotId, reason, opts = {}) {
  return { author: 'system', kind: 'handoff', content: { fromBotId, toBotId, reason }, delay: 500, ...opts }
}

export function awaitUser(chips) {
  return { awaitUser: { chips: chips.map((c) => (typeof c === 'string' ? { label: c } : c)) } }
}

export function scenario(id, title, convId, beats, extra = {}) {
  return { id, title, convId, beats, ...extra }
}
