// Tiny external store. The scenario runner dispatches from timers and
// reads state synchronously at fire time, so this is not tied to any
// component lifecycle. One pure root reducer.
export function createStore(reducer, initialState) {
  let state = initialState
  const listeners = new Set()
  const log = []

  return {
    getState: () => state,
    dispatch(action) {
      state = reducer(state, action)
      if (log.length > 200) log.shift()
      log.push(action.type)
      listeners.forEach((l) => l())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getLog: () => log,
  }
}
