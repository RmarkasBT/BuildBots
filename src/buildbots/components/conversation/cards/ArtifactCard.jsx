import { useDispatch } from '../../../store/useBuildbots'
import { A } from '../../../store/actions'
import { BotBlock } from '../Message'

// A thumbnail with a title that opens the thing in the live pane.
const THUMBS = {
  document: (
    <svg viewBox="0 0 40 48" className="h-full w-full" fill="none">
      <rect x="1" y="1" width="38" height="46" rx="2" fill="#fff" stroke="#d3dbe2" />
      {[10, 16, 22, 28, 34].map((y) => <rect key={y} x="7" y={y} width={y % 12 === 4 ? 18 : 26} height="2" fill="#d3dbe2" />)}
    </svg>
  ),
  schedule: (
    <svg viewBox="0 0 40 48" className="h-full w-full" fill="none">
      <rect x="1" y="1" width="38" height="46" rx="2" fill="#fff" stroke="#d3dbe2" />
      <rect x="6" y="12" width="14" height="4" fill="#001a43" />
      <rect x="12" y="20" width="18" height="4" fill="#001a43" />
      <rect x="18" y="28" width="14" height="4" fill="#0763fb" />
      <rect x="9" y="36" width="20" height="4" fill="#001a43" />
    </svg>
  ),
  browser: (
    <svg viewBox="0 0 40 48" className="h-full w-full" fill="none">
      <rect x="1" y="7" width="38" height="34" rx="2" fill="#fff" stroke="#d3dbe2" />
      <rect x="1" y="7" width="38" height="6" fill="#f1f4fa" />
      <rect x="6" y="18" width="28" height="3" fill="#d3dbe2" />
      <rect x="6" y="25" width="20" height="3" fill="#d3dbe2" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 40 48" className="h-full w-full" fill="none">
      <rect x="1" y="1" width="38" height="46" rx="2" fill="#fff" stroke="#d3dbe2" />
      <rect x="5" y="6" width="14" height="12" fill="#d3dbe2" />
      <rect x="21" y="6" width="14" height="12" fill="#d3dbe2" />
      <rect x="5" y="20" width="14" height="12" fill="#d3dbe2" />
      <rect x="21" y="20" width="14" height="12" fill="#d3dbe2" />
    </svg>
  ),
}

export default function ArtifactCard({ message }) {
  const dispatch = useDispatch()
  const c = message.content ?? {}
  const thumb = THUMBS[c.thumb ?? c.mode ?? 'document'] ?? THUMBS.document
  const open = () =>
    dispatch({ type: A.LIVE_OPEN, payload: { mode: c.mode ?? 'document', targetId: c.docId, scriptId: c.scriptId, title: c.title } })
  return (
    <BotBlock botId={message.author}>
      <button onClick={open} className="flex w-[380px] items-center gap-3 rounded-md border border-gray-15 bg-white p-2 text-left hover:border-brand-blue">
        <span className="h-14 w-11 shrink-0">{thumb}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-semibold text-gray-90">{c.title}</span>
          {c.caption && <span className="block truncate text-[11.5px] text-gray-50">{c.caption}</span>}
        </span>
        <span className="shrink-0 text-[11.5px] font-medium text-brand-blue">Open</span>
      </button>
    </BotBlock>
  )
}
