import { LIVE_W, LIVE_EXPANDED_VW, Z } from '../../constants'
import { copy } from '../../data'
import { useStore, useDispatch } from '../../store/useBuildbots'
import { selectLive } from '../../store/selectors'
import { A } from '../../store/actions'
import DocumentMode from './DocumentMode'
import BrowserMode from './browser/BrowserMode'
import BotPreview from './BotPreview'

// Built-in modes. Media lands in Phase 5+.
const MODES = { document: DocumentMode, browser: BrowserMode, preview: BotPreview }

export default function LivePane({ renderers = {} }) {
  const live = useStore(selectLive)
  const docTitle = useStore((s) => (live.current?.mode === 'document' ? s.documents[live.current.targetId]?.title : null))
  const dispatch = useDispatch()
  const { open, expanded, current, history } = live
  const Mode = current ? renderers[current.mode] ?? MODES[current.mode] : null
  const label = current ? copy.live[current.mode] ?? current.mode : ''
  const title = current?.title ?? docTitle

  const body = (
    <div className="flex h-full flex-col bg-white" style={{ width: expanded ? undefined : LIVE_W }}>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-15 px-3">
        <button
          onClick={() => dispatch({ type: A.LIVE_BACK })}
          disabled={!history.length}
          title={copy.live.back}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-gray-60 hover:bg-gray-5 disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <span className="rounded-sm bg-gray-10 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-gray-60">{label}</span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-gray-80">{title}</span>
        <button
          onClick={() => dispatch({ type: A.LIVE_EXPAND })}
          title={expanded ? copy.live.collapse : copy.live.expand}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-gray-60 hover:bg-gray-5"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {expanded ? <path d="M9 9H4V4M15 15h5v5M9 15H4v5M15 9h5V4" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
          </svg>
        </button>
        <button
          onClick={() => dispatch({ type: A.LIVE_CLOSE })}
          title={copy.live.close}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-gray-60 hover:bg-gray-5"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-gray-5">
        {Mode ? <Mode target={current} /> : (
          <div className="flex h-full items-center justify-center text-sm text-gray-40">{copy.live.empty}</div>
        )}
      </div>
    </div>
  )

  if (expanded && open) {
    return (
      <>
        <div className={`fixed inset-0 top-12 bg-navy-900/30 ${Z.liveScrim}`} onClick={() => dispatch({ type: A.LIVE_EXPAND, payload: { expanded: false } })} />
        <div className={`fixed top-12 right-0 bottom-0 border-l border-gray-15 shadow-sm ${Z.liveOverlay}`} style={{ width: `${LIVE_EXPANDED_VW}vw` }}>
          {body}
        </div>
      </>
    )
  }

  // Width animates on a wrapper; inner content stays fixed-width so text
  // doesn't reflow mid-slide.
  return (
    <div
      className="shrink-0 overflow-hidden border-l border-gray-15 transition-[width] duration-300 ease-out"
      style={{ width: open ? LIVE_W : 0, borderLeftWidth: open ? 1 : 0 }}
    >
      {body}
    </div>
  )
}
