export const selectUi = (s) => s.ui
export const selectBots = (s) => s.bots
export const selectBot = (id) => (s) => s.bots.byId[id]
export const selectRosterBots = (s) => s.bots.rosterIds.map((id) => s.bots.byId[id])
export const selectCatalogBots = (s) => s.bots.catalogIds.map((id) => s.bots.byId[id])
export const selectCrews = (s) => s.crews.ids.map((id) => s.crews.byId[id])
export const selectCrew = (id) => (s) => s.crews.byId[id]
export const selectConversation = (id) => (s) => s.conversations[id]
export const selectMessages = (convId) => (s) => {
  const c = s.conversations[convId]
  return c ? c.messageIds.map((id) => s.messages.byId[id]).filter(Boolean) : []
}
export const selectLive = (s) => s.livePane
export const selectApprovals = (s) => s.approvals.items
export const selectPendingApprovals = (s) => s.approvals.items.filter((a) => a.status === 'pending')
export const selectRoutines = (botId) => (s) => s.routines.items.filter((r) => !botId || r.botId === botId)
export const selectKnowledge = (s) => s.knowledge
export const selectConnectors = (s) => s.connectors
export const selectDoc = (id) => (s) => s.documents[id]
export const selectRun = (convId) => (s) => s.engine.runs[convId]
