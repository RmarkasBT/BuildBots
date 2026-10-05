import { useState } from 'react'
import { createStore } from './store'
import { reducer, initialState } from './reducer'
import { createRunner } from '../engine/runner'
import { BuildbotsContext } from './useBuildbots'

// Store and runner are created once per mount via lazy useState. StrictMode
// double-invokes render, but the initializer runs once; nothing starts on
// mount — scenarios begin from event handlers.
export default function BuildbotsProvider({ children }) {
  const [ctx] = useState(() => {
    const store = createStore(reducer, initialState())
    const runner = createRunner(store)
    return { store, runner }
  })
  return <BuildbotsContext.Provider value={ctx}>{children}</BuildbotsContext.Provider>
}
