import { useDispatch } from '../../../store/useBuildbots'
import { A } from '../../../store/actions'
import SourceBadge from '../../ui/SourceBadge'
import { BotBlock } from '../Message'

// What the bot did inside Buildertrend (or through a browser), with the
// entity named and a link that opens the thing in the live pane.
export default function ActionCard({ message }) {
  const dispatch = useDispatch()
  const c = message.content ?? {}
  const open = () => {
    if (!c.open) return
    dispatch({ type: A.LIVE_OPEN, payload: { mode: c.open.mode, targetId: c.open.targetId, scriptId: c.open.scriptId, title: c.open.title ?? c.title } })
  }
  return (
    <BotBlock botId={message.author}>
      <div className="rounded-md border border-gray-15 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-10 px-3 py-2">
          <SourceBadge source={c.source} connector={c.connector} />
          <span className="text-[12.5px] font-semibold text-gray-90">{c.title}</span>
          {c.status === 'running' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-blue bb-pulse" />}
          {c.status === 'done' && <span className="ml-auto text-[11px] font-medium text-success-fg">Done</span>}
        </div>
        {c.detail && <div className="px-3 py-2 text-[12.5px] text-gray-70">{c.detail}</div>}
        {c.items?.length > 0 && (
          <ul className="border-t border-gray-10 px-3 py-2 text-[12px] text-gray-80">
            {c.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-3 py-0.5">
                <span className="truncate">{it.label}</span>
                {it.value && <span className="shrink-0 tabular-nums text-gray-60">{it.value}</span>}
              </li>
            ))}
          </ul>
        )}
        {c.open && (
          <div className="border-t border-gray-10 px-3 py-1.5">
            <button onClick={open} className="text-[12px] font-medium text-brand-blue hover:underline">
              {c.openLabel ?? (c.source === 'browser' ? 'Watch in browser' : c.source === 'connector' ? 'View what it found' : 'View in Buildertrend')}
            </button>
          </div>
        )}
      </div>
    </BotBlock>
  )
}
