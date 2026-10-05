import { copy, triggerKinds } from '../../data'
import { useStore } from '../../store/useBuildbots'
import BotAvatar from '../ui/BotAvatar'

// The bot forming in the right pane while the Shop Foreman interviews you.
// Each setting appears as it is decided.
function Row({ label, value, pending }) {
  return (
    <div className={`grid grid-cols-[120px_1fr] gap-3 px-4 py-2.5 text-[12.5px] ${pending ? 'opacity-40' : 'bb-msg-in'}`}>
      <span className="text-gray-50">{label}</span>
      <span className="text-gray-90">{pending ? '—' : value}</span>
    </div>
  )
}

export default function BotPreview({ target }) {
  const draft = useStore((s) => s.conversations[target.targetId]?.draftBot) ?? {}
  const p = copy.preview
  const layers = draft.knowledge
  const trigger = triggerKinds.find((t) => t.kind === draft.scheduleKind)

  return (
    <div className="p-4">
      <div className="rounded-md border border-gray-15 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-15 px-4 py-4">
          <BotAvatar glyph={draft.avatar ?? 'grid'} size="xl" muted={!draft.name} />
          <div className="min-w-0">
            <div className={`text-[16px] font-bold ${draft.name ? 'text-gray-90 bb-msg-in' : 'text-gray-30'}`}>{draft.name ?? p.unnamed}</div>
            <div className={`text-[12.5px] ${draft.job ? 'text-gray-70 bb-msg-in' : 'text-gray-30'}`}>{draft.job ?? p.noJob}</div>
          </div>
        </div>
        <div className="divide-y divide-gray-10">
          <Row label={p.scope} value={draft.scope} pending={!draft.scope} />
          <div className={`px-4 py-2.5 text-[12.5px] ${layers ? 'bb-msg-in' : 'opacity-40'}`}>
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <span className="text-gray-50">{p.knows}</span>
              {layers ? (
                <ul className="space-y-1">
                  {layers.filter((l) => l.on).map((l) => (
                    <li key={l.id} className="flex items-center gap-2 text-gray-90">
                      <span className={`h-1.5 w-1.5 rounded-full ${l.status === 'thin' ? 'bg-warning-fg' : l.status === 'missing' ? 'bg-danger-fg' : 'bg-success-fg'}`} />
                      <span>{l.label}</span>
                      {l.status && l.status !== 'indexed' && <span className="text-[10.5px] capitalize text-gray-50">{l.status}</span>}
                    </li>
                  ))}
                </ul>
              ) : <span className="text-gray-90">—</span>}
            </div>
          </div>
          <Row
            label={p.allowed}
            value={draft.trust ? `${copy.trust[draft.trust]} — ${draft.trust === 'act' ? copy.trust.actHelp : copy.trust.suggestHelp} ${p.outboundRule}` : null}
            pending={!draft.trust}
          />
          <Row label={p.when} value={trigger ? `${trigger.label}: ${draft.scheduleLabel}` : draft.scheduleLabel} pending={!draft.scheduleLabel} />
          <Row label={p.channels} value={draft.channels} pending={!draft.channels} />
        </div>
      </div>
      <div className="mt-2 px-1 text-[11px] text-gray-50">{p.hint}</div>
    </div>
  )
}
