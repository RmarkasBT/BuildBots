// Registry of every scenario. The dev drawer lists this; the runner looks
// scenarios up by id. Later phases add flow files here.
import * as idle from './idle'
import * as flow1 from './flow1-schedule'
import * as flow2 from './flow2-material'
import * as flow3 from './flow3-create'
import * as flow5 from './flow5-bid'
import * as flow6 from './flow6-leads'

const list = [...Object.values(flow1), ...Object.values(flow2), ...Object.values(flow3), ...Object.values(flow5), ...Object.values(flow6), ...Object.values(idle)]

export const SCENARIOS = Object.fromEntries(list.map((s) => [s.id, s]))
export const SCENARIO_LIST = list

export function scenarioById(id) {
  const s = SCENARIOS[id]
  if (!s) throw new Error(`Unknown scenario: ${id}`)
  return s
}
