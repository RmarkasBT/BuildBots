// Buildbots — full-screen product surface rendered outside <Shell>.
// Self-contained: no fetch, no backend, no LLM. Everything is authored in
// src/buildbots/data. `npm run dev:client` alone is enough to run it.
import BuildbotsProvider from '../buildbots/store/BuildbotsProvider'
import Workspace from '../buildbots/components/Workspace'

export default function BuildBots() {
  return (
    <BuildbotsProvider>
      <Workspace />
    </BuildbotsProvider>
  )
}
