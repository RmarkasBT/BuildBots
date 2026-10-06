import { useEffect, useRef } from 'react'
import { Z } from '../../constants'
import { copy, connectors, mcpNote } from '../../data'
import { useStore, useDispatch } from '../../store/useBuildbots'
import { selectUi, selectConnectors } from '../../store/selectors'
import { A } from '../../store/actions'

// Email, SMS and social are capabilities bots hold, not bots of their own.
// Connectors are tiles in three states; "connecting" is a two-second fake.
const INITIALS = { quickbooks: 'QB', xero: 'X', gmail: 'M', outlook: 'O', gcal: 'C', 'google-ads': 'GA', 'meta-ads': 'MA', companycam: 'CC', dropbox: 'D', gdrive: 'G', slack: 'S', zapier: 'Z', facebook: 'f', instagram: 'IG', gbp: 'G', twilio: 'T', mcp: 'MCP' }

function Tile({ c, status, onConnect }) {
  const soon = status === 'soon'
  return (
    <div className={`flex flex-col rounded-md border bg-white p-3 ${soon ? 'border-gray-15 opacity-60' : 'border-gray-15'}`}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${c.generic ? 'border border-dashed border-gray-30 text-gray-50' : 'bg-gray-10 text-gray-70'}`}>{INITIALS[c.id]}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-semibold text-gray-90">{c.name}</span>
          <span className="block text-[11px] text-gray-50">{c.group}</span>
        </span>
      </div>
      <div className="mt-3 flex items-center">
        {status === 'connected' && <span className="rounded-sm bg-success-bg px-1.5 py-0.5 text-[10.5px] font-medium text-success-fg">{copy.connectors.connected}</span>}
        {status === 'available' && <button onClick={onConnect} className="h-6 rounded-sm border border-gray-20 px-2 text-[11.5px] text-gray-80 hover:bg-gray-5">{copy.connectors.connect}</button>}
        {status === 'connecting' && <span className="flex items-center gap-1.5 text-[11px] text-brand-blue"><span className="h-1.5 w-1.5 rounded-full bg-brand-blue bb-pulse" />{copy.connectors.connecting}</span>}
        {soon && <span className="rounded-sm bg-gray-10 px-1.5 py-0.5 text-[10.5px] font-medium text-gray-50">{copy.connectors.soon}</span>}
      </div>
    </div>
  )
}

export default function ConnectorsGallery() {
  const ui = useStore(selectUi)
  const state = useStore(selectConnectors)
  const dispatch = useDispatch()
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  if (ui.panel !== 'connectors') return null
  const close = () => dispatch({ type: A.SET_UI, payload: { panel: null } })
  const connect = (id) => {
    dispatch({ type: A.CONNECTOR, payload: { id, status: 'connecting' } })
    timers.current.push(setTimeout(() => dispatch({ type: A.CONNECTOR, payload: { id, status: 'connected' } }), 2000))
  }
  const connectedCount = Object.values(state).filter((s) => s === 'connected').length

  return (
    <>
      <div className={`absolute inset-0 bg-navy-900/20 ${Z.liveScrim}`} onClick={close} />
      <div className={`absolute left-1/2 top-12 w-[880px] -translate-x-1/2 rounded-md border border-gray-20 bg-white shadow-lg ${Z.panel}`}>
        <div className="flex items-center gap-3 border-b border-gray-15 px-5 py-3">
          <span className="text-[13px] font-semibold text-gray-90">{copy.connectors.title}</span>
          <span className="text-[11.5px] text-gray-50">{copy.connectors.subtitle(connectedCount)}</span>
          <button onClick={close} className="ml-auto flex h-7 w-7 items-center justify-center rounded-sm text-gray-60 hover:bg-gray-5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 p-5">
          {connectors.map((c) => <Tile key={c.id} c={c} status={state[c.id]} onConnect={() => connect(c.id)} />)}
        </div>
        <div className="flex items-start gap-3 border-t border-gray-15 bg-gray-5 px-5 py-3 text-[12px] text-gray-70">
          <span className="mt-0.5 rounded-sm border border-gray-40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-70">MCP</span>
          <span>{mcpNote}</span>
        </div>
      </div>
    </>
  )
}
