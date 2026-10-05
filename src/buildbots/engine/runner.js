// Scenario runner. Stands in for the model. One instance, owns every timer.
// One run per conversation; runs in different conversations proceed
// concurrently so a bot keeps working while you are elsewhere.
import { A } from '../store/actions'
import { applyEffect } from './effects'
import { scenarioById } from '../data/scenarios'
import { DEFAULT_BOT_DELAY, DEFAULT_USER_DELAY } from '../constants'

const SIDE_EVENTS = {}
export function registerSideEvents(map) {
  Object.assign(SIDE_EVENTS, map)
}

export function createRunner(store) {
  const runs = new Map() // convId -> { scenarioId, index, timers:Set, paused, waitingOn }
  const d = store.dispatch

  function publish(convId) {
    const run = runs.get(convId)
    if (!run) {
      d({ type: A.ENGINE_CLEAR_RUN, payload: { convId } })
      return
    }
    d({ type: A.ENGINE_SET_RUN, payload: { convId, run: { scenarioId: run.scenarioId, index: run.index, paused: run.paused, waitingOn: run.waitingOn } } })
  }

  function timer(run, ms, fn) {
    const t = setTimeout(() => {
      run.timers.delete(t)
      fn()
    }, ms)
    run.timers.add(t)
    return t
  }

  function messageFromBeat(convId, scenarioId, index, beat) {
    return {
      id: beat.id ? `${convId}:${beat.id}` : `${convId}:${scenarioId}:${index}`,
      convId,
      author: beat.author,
      kind: beat.kind,
      content: beat.content,
      sources: beat.sources,
      ts: Date.now(),
    }
  }

  function land(convId, run, index, beat, { instant = false } = {}) {
    const scenario = scenarioById(run.scenarioId)
    // `silent` beats carry effects only (e.g. hand into another scenario).
    if (!beat.silent) d({ type: A.ADD_MESSAGE, payload: { message: messageFromBeat(convId, scenario.id, index, beat) } })
    const ctx = { convId, botId: beat.author !== 'user' && beat.author !== 'system' ? beat.author : null }
    beat.effects?.forEach((e) => applyEffect(store, runner, e, ctx))
    if (!instant && beat.sideEvents) {
      beat.sideEvents.forEach(({ id, at }) => {
        timer(run, at, () => {
          const ev = SIDE_EVENTS[id]
          if (!ev) return console.warn('[buildbots] unknown side event', id)
          d({ type: A.ADD_MESSAGE, payload: { message: { ...messageFromBeat(convId, scenario.id, `side-${id}`, ev.beat), id: `${convId}:side:${id}` } } })
          ev.beat.effects?.forEach((e) => applyEffect(store, runner, e, ctx))
        })
      })
    }
  }

  function schedule(convId) {
    const run = runs.get(convId)
    if (!run) return
    const scenario = scenarioById(run.scenarioId)
    const beat = scenario.beats[run.index]
    if (!beat) {
      run.paused = true
      run.waitingOn = 'end'
      publish(convId)
      return
    }
    const isBot = beat.author !== 'user' && beat.author !== 'system'
    const delay = beat.delay ?? (isBot ? DEFAULT_BOT_DELAY : DEFAULT_USER_DELAY)
    if (isBot && beat.typing !== false && delay > 250) {
      d({ type: A.SET_TYPING, payload: { convId, author: beat.author } })
      d({ type: A.SET_BOT_STATUS, payload: { botId: beat.author, working: true } })
    }
    publish(convId)
    timer(run, delay, () => {
      if (isBot) d({ type: A.SET_BOT_STATUS, payload: { botId: beat.author, working: false } })
      land(convId, run, run.index, beat)
      advance(convId)
    })
  }

  function advance(convId) {
    const run = runs.get(convId)
    if (!run) return
    const scenario = scenarioById(run.scenarioId)
    const beat = scenario.beats[run.index]
    if (beat.awaitUser) {
      run.paused = true
      run.waitingOn = 'user'
      d({ type: A.SET_CHIPS, payload: { convId, chips: beat.awaitUser.chips, hidden: !!beat.awaitUser.hidden } })
      publish(convId)
      return
    }
    if (beat.awaitApproval) {
      run.paused = true
      run.waitingOn = `approval:${beat.awaitApproval}`
      publish(convId)
      return
    }
    // Flat arrays with labels need explicit terminators: `end` stops the
    // run, `next` jumps to a label instead of falling into the next beat.
    if (beat.end) {
      run.paused = true
      run.waitingOn = 'end'
      publish(convId)
      return
    }
    if (beat.next) {
      const i = indexOfLabel(scenario, beat.next)
      run.index = i >= 0 ? i : run.index + 1
    } else {
      run.index += 1
    }
    run.paused = false
    schedule(convId)
  }

  function indexOfLabel(scenario, label) {
    const i = scenario.beats.findIndex((b) => b.label === label)
    if (i < 0) console.warn('[buildbots] unknown label', label, 'in', scenario.id)
    return i
  }

  function cancel(convId) {
    const run = runs.get(convId)
    if (!run) return
    run.timers.forEach(clearTimeout)
    runs.delete(convId)
    d({ type: A.SET_TYPING, payload: { convId, author: null } })
    publish(convId)
  }

  const runner = {
    runs,

    start(convId, scenarioId, fromIndex = 0) {
      cancel(convId)
      runs.set(convId, { scenarioId, index: fromIndex, timers: new Set(), paused: false, waitingOn: null })
      schedule(convId)
    },

    // Start only if nothing has run in this conversation yet.
    ensureStarted(convId, scenarioId) {
      if (runs.has(convId)) return
      const c = store.getState().conversations[convId]
      if (c && c.messageIds.length) return
      runner.start(convId, scenarioId)
    },

    // Dev drawer: apply beats 0..index-1 instantly, then run live from index.
    jumpTo(convId, scenarioId, index) {
      cancel(convId)
      d({ type: A.RESET_CONV, payload: { convId } })
      const scenario = scenarioById(scenarioId)
      const run = { scenarioId, index: 0, timers: new Set(), paused: false, waitingOn: null }
      runs.set(convId, run)
      for (let i = 0; i < index && i < scenario.beats.length; i++) {
        const beat = scenario.beats[i]
        land(convId, run, i, beat, { instant: true })
        if (beat.awaitUser) {
          // Pretend the user took the first chip so the thread reads right.
          const chip = beat.awaitUser.chips[0]
          const text = chip?.send ?? chip?.label ?? '…'
          d({ type: A.ADD_MESSAGE, payload: { message: { id: `${convId}:${scenarioId}:${i}:u`, convId, author: 'user', kind: 'text', content: text, ts: Date.now() } } })
        }
      }
      d({ type: A.SET_CHIPS, payload: { convId, chips: null } })
      d({ type: A.SELECT_CONV, payload: { convId } })
      run.index = index
      schedule(convId)
    },

    resumeFromUser(convId, text, chip) {
      const run = runs.get(convId)
      d({ type: A.ADD_MESSAGE, payload: { message: { id: `${convId}:u:${Date.now()}`, convId, author: 'user', kind: 'text', content: text, ts: Date.now() } } })
      d({ type: A.SET_CHIPS, payload: { convId, chips: null } })
      if (!run || run.waitingOn !== 'user') return
      const scenario = scenarioById(run.scenarioId)
      if (chip?.goto) {
        const i = indexOfLabel(scenario, chip.goto)
        run.index = i >= 0 ? i : run.index + 1
      } else {
        run.index += 1
      }
      run.paused = false
      run.waitingOn = null
      schedule(convId)
    },

    resumeFromApproval(approvalId, decision) {
      const state = store.getState()
      const approval = state.approvals.items.find((a) => a.id === approvalId)
      if (!approval || approval.status !== 'pending') return
      d({ type: A.DECIDE_APPROVAL, payload: { id: approvalId, decision } })
      // If a scenario is waiting on this approval it narrates the outcome
      // itself, so skip the queue's own narration (addMessage) effects.
      const narrated = [...runs.values()].some((r) => r.waitingOn === `approval:${approvalId}`)
      const effects = approval.onDecision?.[decision] ?? (decision === 'edit' ? approval.onDecision?.approve : null) ?? []
      effects
        .filter((e) => !(narrated && e.type === 'addMessage'))
        .forEach((e) => applyEffect(store, runner, e, { convId: approval.botId, botId: approval.botId }))

      for (const [convId, run] of runs) {
        if (run.waitingOn !== `approval:${approvalId}`) continue
        const scenario = scenarioById(run.scenarioId)
        const beat = scenario.beats[run.index]
        const label = beat.onDecision?.[decision] ?? (decision === 'edit' ? beat.onDecision?.approve : undefined)
        if (label) {
          const i = indexOfLabel(scenario, label)
          run.index = i >= 0 ? i : run.index + 1
        } else {
          run.index += 1
        }
        run.paused = false
        run.waitingOn = null
        schedule(convId)
      }
    },

    // Generic "continue to label" for in-thread buttons (cards with branches).
    gotoLabel(convId, label) {
      const run = runs.get(convId)
      if (!run) return
      const scenario = scenarioById(run.scenarioId)
      const i = indexOfLabel(scenario, label)
      if (i < 0) return
      d({ type: A.SET_CHIPS, payload: { convId, chips: null } })
      run.index = i
      run.paused = false
      run.waitingOn = null
      schedule(convId)
    },

    cancel,

    cancelAll() {
      for (const convId of [...runs.keys()]) cancel(convId)
    },

    reset() {
      runner.cancelAll()
      d({ type: A.RESET })
    },
  }

  return runner
}
