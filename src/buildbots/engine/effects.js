// Translates authored effects (friendly names in data) into store actions.
// `ctx` carries { convId, botId } of the beat that fired the effect.
import { A } from '../store/actions'

let effectSeq = 0

export function applyEffect(store, runner, effect, ctx = {}) {
  const d = store.dispatch
  switch (effect.type) {
    case 'openLive':
      d({ type: A.LIVE_OPEN, payload: { mode: effect.mode, targetId: effect.targetId, scriptId: effect.scriptId, title: effect.title } })
      break
    case 'closeLive':
      d({ type: A.LIVE_CLOSE })
      break
    case 'expandLive':
      d({ type: A.LIVE_EXPAND, payload: { expanded: effect.expanded ?? true } })
      break
    case 'botStatus':
      d({ type: A.SET_BOT_STATUS, payload: { botId: effect.botId ?? ctx.botId, status: effect.status, unread: effect.unread, working: effect.working, lastActivity: effect.lastActivity } })
      break
    case 'patchBot':
      d({ type: A.PATCH_BOT, payload: { botId: effect.botId ?? ctx.botId, patch: effect.patch } })
      break
    case 'pushApproval':
      d({ type: A.PUSH_APPROVAL, payload: { approval: effect.approval } })
      break
    case 'decideApproval':
      runner.resumeFromApproval(effect.id, effect.decision)
      break
    case 'addRoutine':
      d({ type: A.ADD_ROUTINE, payload: { routine: effect.routine } })
      break
    case 'knowledgeSource':
      d({ type: A.KNOWLEDGE_SOURCE, payload: { id: effect.id, status: effect.status, learned: effect.learned } })
      break
    case 'knowledgeSop':
      d({ type: A.KNOWLEDGE_SOP, payload: { id: effect.id, status: effect.status } })
      break
    case 'knowledgeBranch':
      d({ type: A.KNOWLEDGE_BRANCH, payload: { branch: effect.branch } })
      break
    case 'connector':
      d({ type: A.CONNECTOR, payload: { id: effect.id, status: effect.status } })
      break
    case 'addBotToRoster':
      d({ type: A.ADD_BOT_TO_ROSTER, payload: { botId: effect.botId } })
      break
    case 'addBotToCrew':
      d({ type: A.ADD_BOT_TO_CREW, payload: { convId: effect.convId ?? ctx.convId, botId: effect.botId } })
      break
    case 'saveCrew':
      d({ type: A.SAVE_CREW, payload: { crew: effect.crew } })
      break
    case 'patchDoc':
      d({ type: A.PATCH_DOC, payload: { docId: effect.docId, op: effect.op, rowId: effect.rowId, patch: effect.patch } })
      break
    case 'setDoc':
      d({ type: A.SET_DOC, payload: { doc: effect.doc } })
      break
    case 'patchMessage':
      d({ type: A.PATCH_MESSAGE, payload: { id: effect.id, patch: effect.patch } })
      break
    case 'draftBot':
      d({ type: A.PATCH_DRAFT_BOT, payload: { convId: effect.convId ?? ctx.convId, patch: effect.patch } })
      break
    // Copy the forming bot's decided settings onto the real bot record and
    // add its routine, so the created bot reflects the interview.
    case 'applyDraftBot': {
      const draft = store.getState().conversations[effect.fromConvId]?.draftBot ?? {}
      const patch = {}
      if (draft.name) patch.name = draft.name
      if (draft.job) patch.job = draft.job
      if (draft.avatar) patch.avatar = draft.avatar
      if (draft.trust) patch.trust = draft.trust
      if (draft.knowledge) patch.knowledge = draft.knowledge.filter((l) => l.on).map((l) => l.label)
      d({ type: A.PATCH_BOT, payload: { botId: effect.botId, patch } })
      if (draft.scheduleKind && draft.scheduleKind !== 'request') {
        d({ type: A.ADD_ROUTINE, payload: { routine: {
          id: `${effect.botId}-routine`, botId: effect.botId,
          name: draft.scheduleKind === 'schedule' ? 'Morning punch and warranty check' : 'Pick up new punch and warranty items',
          trigger: { kind: draft.scheduleKind, label: draft.scheduleLabel }, lastRun: 'Never',
        } } })
      }
      break
    }
    case 'addMessage': {
      const convId = effect.convId ?? ctx.convId
      const m = effect.message
      d({
        type: A.ADD_MESSAGE,
        payload: { message: { id: m.id ?? `${convId}:eff:${++effectSeq}`, convId, ts: Date.now(), ...m } },
      })
      break
    }
    case 'setChips':
      d({ type: A.SET_CHIPS, payload: { convId: effect.convId ?? ctx.convId, chips: effect.chips } })
      break
    case 'selectConv':
      d({ type: A.SELECT_CONV, payload: { convId: effect.convId } })
      break
    case 'setUi':
      d({ type: A.SET_UI, payload: effect.patch })
      break
    case 'startScenario':
      // Deferred: starting replaces the current run, and this effect may be
      // firing from inside that run's own land() step.
      setTimeout(() => runner.start(effect.convId, effect.scenarioId, effect.from ?? 0), 0)
      break
    default:
      // Unknown effects are authoring mistakes; make them loud in dev.
      console.warn('[buildbots] unknown effect', effect)
  }
}
