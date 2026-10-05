import { createContext, useContext, useRef, useSyncExternalStore } from 'react'

export const BuildbotsContext = createContext(null)

export function useBuildbotsContext() {
  const ctx = useContext(BuildbotsContext)
  if (!ctx) throw new Error('useBuildbots must be used inside BuildbotsProvider')
  return ctx
}

// Shallow equality for arrays and plain objects, so selectors that build a
// fresh array (e.g. mapping ids to records) still return a stable snapshot.
function shallowEqual(a, b) {
  if (Object.is(a, b)) return true
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) if (!Object.is(a[k], b[k])) return false
  return true
}

// Read a slice. useSyncExternalStore needs getSnapshot to return a cached
// value when nothing changed, or React loops; we memoize per hook instance.
export function useStore(selector) {
  const { store } = useBuildbotsContext()
  const cache = useRef({ state: undefined, value: undefined })
  const getSnapshot = () => {
    const state = store.getState()
    const next = selector(state)
    const c = cache.current
    if (c.state === state && c.value !== undefined) return c.value
    if (shallowEqual(c.value, next)) {
      c.state = state
      return c.value
    }
    c.state = state
    c.value = next
    return next
  }
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)
}

export function useDispatch() {
  return useBuildbotsContext().store.dispatch
}

export function useRunner() {
  return useBuildbotsContext().runner
}
