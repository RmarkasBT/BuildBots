import { useEffect } from 'react'
import { PRODUCT_NAME, DEV_DRAWER_SHORTCUT } from '../constants'
import { company } from '../data'
import { useDispatch, useStore } from '../store/useBuildbots'
import { selectUi } from '../store/selectors'
import { A } from '../store/actions'
import TopBar from './shell/TopBar'
import Roster from './shell/Roster'
import Conversation from './conversation/Conversation'
import LivePane from './live/LivePane'
import DevDrawer from './dev/DevDrawer'
import ApprovalsPanel from './panels/ApprovalsPanel'
import KnowledgePanel from './panels/KnowledgePanel'
import KnowledgeSetup from './panels/KnowledgeSetup'
import ConsultantRequest from './panels/ConsultantRequest'
import SettingsPanel from './panels/SettingsPanel'
import ConnectorsGallery from './panels/ConnectorsGallery'
import CatalogGallery from './panels/CatalogGallery'

// Three panes: roster | conversation | live pane. Panels (approvals,
// settings, knowledge...) overlay the conversation in later phases.
export default function Workspace({ messageRenderers, liveRenderers, panels: Panels }) {
  const dispatch = useDispatch()
  const ui = useStore(selectUi)

  useEffect(() => {
    const prev = document.title
    document.title = `${PRODUCT_NAME} — ${company.name}`
    return () => { document.title = prev }
  }, [])

  // Hidden dev drawer shortcut.
  useEffect(() => {
    const onKey = (e) => {
      const k = DEV_DRAWER_SHORTCUT
      if (e.key.toLowerCase() === k.key && (e.metaKey || e.ctrlKey) === !!k.meta && e.shiftKey === !!k.shift) {
        e.preventDefault()
        dispatch({ type: A.SET_UI, payload: { drawerOpen: !ui.drawerOpen } })
      }
      if (e.key === 'Escape') dispatch({ type: A.SET_UI, payload: { drawerOpen: false, panel: null } })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch, ui.drawerOpen])

  // Nothing starts on open. Schedule Analyzer sits in the roster waiting
  // with an unread badge; clicking it kicks off Flow 1.
  return (
    <div className="flex h-screen min-w-[1280px] flex-col overflow-hidden bg-gray-5 text-gray-90">
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <Roster />
        <Conversation renderers={messageRenderers} />
        <LivePane renderers={liveRenderers} />
        <ApprovalsPanel />
        <KnowledgePanel />
        <KnowledgeSetup />
        <ConsultantRequest />
        <SettingsPanel />
        <ConnectorsGallery />
        <CatalogGallery />
        {Panels && <Panels />}
      </div>
      <DevDrawer />
    </div>
  )
}
