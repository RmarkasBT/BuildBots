import { A } from './actions'
import {
  allBots, rosterIds, catalogIds, crews, seededApprovals, routines,
  businessSources, sopDocuments, connectors, documents,
} from '../data'

const clone = (v) => JSON.parse(JSON.stringify(v))

export function initialState() {
  const conversations = {}
  for (const b of allBots) conversations[b.id] = conv(b.id, 'bot')
  for (const c of crews) conversations[c.id] = conv(c.id, 'crew', c.botIds)

  return {
    bots: {
      byId: Object.fromEntries(allBots.map((b) => [b.id, clone(b)])),
      rosterIds: [...rosterIds],
      catalogIds: [...catalogIds],
    },
    crews: {
      byId: Object.fromEntries(crews.map((c) => [c.id, clone(c)])),
      ids: crews.map((c) => c.id),
    },
    conversations,
    messages: { byId: {} },
    livePane: { open: false, expanded: false, current: null, history: [] },
    approvals: { items: clone(seededApprovals) },
    routines: { items: clone(routines) },
    knowledge: {
      sources: Object.fromEntries(businessSources.map((s) => [s.id, { status: s.status, learned: [...s.learned] }])),
      sops: Object.fromEntries(sopDocuments.map((s) => [s.id, { status: s.status }])),
      uploads: [],
      branch: null,
    },
    connectors: Object.fromEntries(connectors.map((c) => [c.id, c.status])),
    documents: clone(documents),
    ui: {
      activeConvId: null, // nothing opens on its own; the user picks a bot
      rosterCollapsed: false,
      drawerOpen: false,
      panel: null, // 'settings' | 'knowledge' | 'routines' | 'approvals' | 'connectors' | 'catalog' | null
    },
    engine: { runs: {} },
  }
}

function conv(id, kind, botIds) {
  return { id, kind, botIds: botIds ?? [id], messageIds: [], chips: null, typing: null, voice: false, draftBot: null }
}

export function reducer(state, action) {
  const p = action.payload ?? {}
  switch (action.type) {
    case A.RESET:
      return initialState()

    case A.SELECT_CONV: {
      const bot = state.bots.byId[p.convId]
      const bots = bot && bot.unread
        ? { ...state.bots, byId: { ...state.bots.byId, [p.convId]: { ...bot, unread: 0 } } }
        : state.bots
      return { ...state, bots, ui: { ...state.ui, activeConvId: p.convId, panel: null } }
    }

    case A.RESET_CONV: {
      const c = state.conversations[p.convId]
      if (!c) return state
      const byId = { ...state.messages.byId }
      for (const id of c.messageIds) delete byId[id]
      return {
        ...state,
        messages: { byId },
        conversations: { ...state.conversations, [p.convId]: { ...c, messageIds: [], chips: null, typing: null } },
      }
    }

    case A.TOGGLE_ROSTER:
      return { ...state, ui: { ...state.ui, rosterCollapsed: !state.ui.rosterCollapsed } }

    case A.SET_UI:
      return { ...state, ui: { ...state.ui, ...p } }

    case A.ADD_MESSAGE: {
      const m = p.message
      const c = state.conversations[m.convId] ?? conv(m.convId, 'bot')
      if (state.messages.byId[m.id]) return state
      return {
        ...state,
        messages: { byId: { ...state.messages.byId, [m.id]: m } },
        conversations: {
          ...state.conversations,
          [m.convId]: { ...c, messageIds: [...c.messageIds, m.id], typing: null },
        },
      }
    }

    case A.PATCH_MESSAGE: {
      const m = state.messages.byId[p.id]
      if (!m) return state
      return { ...state, messages: { byId: { ...state.messages.byId, [p.id]: { ...m, ...p.patch } } } }
    }

    case A.SET_TYPING: {
      const c = state.conversations[p.convId]
      if (!c) return state
      return { ...state, conversations: { ...state.conversations, [p.convId]: { ...c, typing: p.author ?? null } } }
    }

    case A.SET_CHIPS: {
      const c = state.conversations[p.convId]
      if (!c) return state
      return { ...state, conversations: { ...state.conversations, [p.convId]: { ...c, chips: p.chips ?? null, chipsHidden: !!p.hidden } } }
    }

    case A.SET_VOICE: {
      const c = state.conversations[p.convId]
      if (!c) return state
      return { ...state, conversations: { ...state.conversations, [p.convId]: { ...c, voice: !!p.voice } } }
    }

    case A.SET_BOT_STATUS: {
      const b = state.bots.byId[p.botId]
      if (!b) return state
      const patch = {}
      if (p.status !== undefined) patch.status = p.status
      if (p.unread !== undefined) patch.unread = p.unread
      if (p.working !== undefined) patch.working = p.working
      if (p.lastActivity !== undefined) patch.lastActivity = p.lastActivity
      return { ...state, bots: { ...state.bots, byId: { ...state.bots.byId, [p.botId]: { ...b, ...patch } } } }
    }

    case A.PATCH_BOT: {
      const b = state.bots.byId[p.botId]
      if (!b) return state
      return { ...state, bots: { ...state.bots, byId: { ...state.bots.byId, [p.botId]: { ...b, ...p.patch } } } }
    }

    case A.ADD_BOT_TO_ROSTER: {
      if (state.bots.rosterIds.includes(p.botId)) return state
      const b = state.bots.byId[p.botId]
      const byId = b ? { ...state.bots.byId, [p.botId]: { ...b, isNew: true } } : state.bots.byId
      return {
        ...state,
        bots: {
          ...state.bots,
          byId,
          rosterIds: [...state.bots.rosterIds, p.botId],
          catalogIds: state.bots.catalogIds.filter((id) => id !== p.botId),
        },
      }
    }

    case A.ADD_BOT_TO_CREW: {
      const c = state.conversations[p.convId]
      if (!c || c.botIds.includes(p.botId)) return state
      return {
        ...state,
        conversations: { ...state.conversations, [p.convId]: { ...c, kind: 'crew', botIds: [...c.botIds, p.botId] } },
      }
    }

    case A.SAVE_CREW: {
      const crew = p.crew
      const c = state.conversations[crew.id] ?? conv(crew.id, 'crew', crew.botIds)
      return {
        ...state,
        crews: { byId: { ...state.crews.byId, [crew.id]: crew }, ids: state.crews.ids.includes(crew.id) ? state.crews.ids : [...state.crews.ids, crew.id] },
        conversations: { ...state.conversations, [crew.id]: { ...c, botIds: crew.botIds } },
      }
    }

    case A.PATCH_DRAFT_BOT: {
      const c = state.conversations[p.convId]
      if (!c) return state
      return {
        ...state,
        conversations: { ...state.conversations, [p.convId]: { ...c, draftBot: { ...(c.draftBot ?? {}), ...p.patch } } },
      }
    }

    case A.LIVE_OPEN: {
      const target = { mode: p.mode, targetId: p.targetId, scriptId: p.scriptId ?? null, stepIndex: 0, title: p.title ?? null }
      const history = state.livePane.current ? [...state.livePane.history, state.livePane.current] : state.livePane.history
      return { ...state, livePane: { ...state.livePane, open: true, current: target, history: history.slice(-12) } }
    }

    case A.LIVE_BACK: {
      const h = state.livePane.history
      if (!h.length) return state
      return { ...state, livePane: { ...state.livePane, current: h[h.length - 1], history: h.slice(0, -1) } }
    }

    case A.LIVE_CLOSE:
      return { ...state, livePane: { open: false, expanded: false, current: null, history: [] } }

    case A.LIVE_EXPAND:
      return { ...state, livePane: { ...state.livePane, expanded: p.expanded ?? !state.livePane.expanded } }

    case A.LIVE_SET_STEP: {
      if (!state.livePane.current) return state
      return { ...state, livePane: { ...state.livePane, current: { ...state.livePane.current, stepIndex: p.stepIndex } } }
    }

    case A.PUSH_APPROVAL: {
      if (state.approvals.items.some((a) => a.id === p.approval.id)) return state
      return { ...state, approvals: { items: [...state.approvals.items, p.approval] } }
    }

    case A.DECIDE_APPROVAL:
      return {
        ...state,
        approvals: {
          items: state.approvals.items.map((a) => (a.id === p.id ? { ...a, status: p.decision === 'approve' ? 'approved' : p.decision === 'edit' ? 'edited' : 'skipped' } : a)),
        },
      }

    case A.PATCH_APPROVAL:
      return {
        ...state,
        approvals: { items: state.approvals.items.map((a) => (a.id === p.id ? { ...a, ...p.patch } : a)) },
      }

    case A.ADD_ROUTINE:
      if (state.routines.items.some((r) => r.id === p.routine.id)) return state
      return { ...state, routines: { items: [...state.routines.items, p.routine] } }

    case A.ADD_BOT: {
      const b = p.bot
      if (state.bots.byId[b.id]) return state
      return {
        ...state,
        bots: { ...state.bots, byId: { ...state.bots.byId, [b.id]: b } },
        conversations: { ...state.conversations, [b.id]: conv(b.id, 'bot') },
      }
    }

    // Company-wide uploads from the global Knowledge panel.
    // upload: { id, title, status: 'indexing'|'indexed', pages }
    case A.KNOWLEDGE_ADD_UPLOAD: {
      const uploads = state.knowledge.uploads ?? []
      const i = uploads.findIndex((u) => u.id === p.upload.id)
      const next = i >= 0 ? uploads.map((u, j) => (j === i ? { ...u, ...p.upload } : u)) : [...uploads, p.upload]
      return { ...state, knowledge: { ...state.knowledge, uploads: next } }
    }

    case A.KNOWLEDGE_SOURCE: {
      const s = state.knowledge.sources[p.id] ?? { status: 'available', learned: [] }
      return { ...state, knowledge: { ...state.knowledge, sources: { ...state.knowledge.sources, [p.id]: { ...s, status: p.status, learned: p.learned ?? s.learned } } } }
    }

    case A.KNOWLEDGE_EDIT_LEARNED: {
      const s = state.knowledge.sources[p.id]
      if (!s) return state
      const learned = s.learned.map((l, i) => (i === p.index ? p.text : l))
      return { ...state, knowledge: { ...state.knowledge, sources: { ...state.knowledge.sources, [p.id]: { ...s, learned } } } }
    }

    case A.KNOWLEDGE_SOP:
      return { ...state, knowledge: { ...state.knowledge, sops: { ...state.knowledge.sops, [p.id]: { status: p.status } } } }

    case A.KNOWLEDGE_BRANCH:
      return { ...state, knowledge: { ...state.knowledge, branch: p.branch } }

    case A.CONNECTOR:
      return { ...state, connectors: { ...state.connectors, [p.id]: p.status } }

    case A.PATCH_DOC: {
      const d = state.documents[p.docId]
      if (!d) return state
      return { ...state, documents: { ...state.documents, [p.docId]: patchDoc(d, p) } }
    }

    case A.SET_DOC:
      return { ...state, documents: { ...state.documents, [p.doc.id]: p.doc } }

    case A.ENGINE_SET_RUN:
      return { ...state, engine: { runs: { ...state.engine.runs, [p.convId]: p.run } } }

    case A.ENGINE_CLEAR_RUN: {
      const runs = { ...state.engine.runs }
      delete runs[p.convId]
      return { ...state, engine: { runs } }
    }

    default:
      return state
  }
}

// Document patch ops. Kept small on purpose; add ops as docs need them.
function patchDoc(doc, p) {
  switch (p.op) {
    case 'applyProposed':
      return {
        ...doc,
        applied: true,
        rows: doc.rows.map((r) => (r.proposedStart
          ? { ...r, start: r.proposedStart, end: r.proposedEnd, proposedStart: undefined, proposedEnd: undefined, conflict: false, moved: true }
          : r)),
      }
    // patch: { [rowId]: newProposedStart } — keeps each row's duration.
    case 'editProposed':
      return {
        ...doc,
        rows: doc.rows.map((r) => {
          const next = p.patch?.[r.id]
          if (!next || !r.proposedStart) return r
          const dur = (new Date(r.proposedEnd) - new Date(r.proposedStart)) / 86400000
          const end = new Date(new Date(next).getTime() + dur * 86400000).toISOString().slice(0, 10)
          return { ...r, proposedStart: next, proposedEnd: end }
        }),
      }
    case 'setRow':
      return { ...doc, rows: doc.rows.map((r) => (r.id === p.rowId ? { ...r, ...p.patch } : r)) }
    case 'merge':
      return { ...doc, ...p.patch }
    default:
      return doc
  }
}
