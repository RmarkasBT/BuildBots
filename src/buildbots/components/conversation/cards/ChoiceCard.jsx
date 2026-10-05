import { copy } from '../../../data'
import { useStore, useDispatch, useRunner } from '../../../store/useBuildbots'
import { A } from '../../../store/actions'
import BotAvatar from '../../ui/BotAvatar'
import { BotBlock } from '../Message'

// In-thread cards with buttons that branch the scenario. Variants:
//   options    — title/body + buttons, each with a goto label
//   knowledge  — the three knowledge layers as toggles; Continue writes the
//                chosen layers into the forming bot (draftBot)
//   consulting — the SOP-gap hand-raise: write it with me / talk to a consultant
//   summary    — the forming bot's settings with Create / Keep tuning
// A decided card remembers the choice via patchMessage and goes quiet.

function useDecide(message) {
  const runner = useRunner()
  const dispatch = useDispatch()
  return (label, send) => {
    dispatch({ type: A.PATCH_MESSAGE, payload: { id: message.id, patch: { decided: label } } })
    runner.resumeFromUser(message.convId, send ?? label, { goto: label })
  }
}

function Buttons({ options, decided, onPick }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-10 px-3 py-2">
      {options.map((o, i) => {
        const chosen = decided === o.goto
        if (decided && !chosen) return null
        return (
          <button
            key={o.goto ?? o.label}
            disabled={!!decided}
            onClick={() => onPick(o.goto, o.send ?? o.label)}
            className={`h-7 rounded-sm px-3 text-[12px] font-semibold ${i === 0 && !decided ? 'bg-navy-900 text-white' : chosen ? 'bg-success-bg text-success-fg' : 'border border-gray-20 text-gray-80 hover:bg-gray-5'}`}
          >
            {chosen ? `✓ ${o.label}` : o.label}
          </button>
        )
      })}
    </div>
  )
}

function KnowledgeCard({ message }) {
  const c = message.content
  const dispatch = useDispatch()
  const decide = useDecide(message)
  const draft = useStore((s) => s.conversations[message.convId]?.draftBot) ?? {}
  const layers = draft.knowledge ?? c.layers
  const toggle = (id) => {
    if (message.decided) return
    const next = layers.map((l) => (l.id === id && !l.locked ? { ...l, on: !l.on } : l))
    dispatch({ type: A.PATCH_DRAFT_BOT, payload: { convId: message.convId, patch: { knowledge: next } } })
  }
  const groups = [
    { key: 'bt', title: copy.knowledge.bt },
    { key: 'business', title: copy.knowledge.business },
    { key: 'sop', title: copy.knowledge.sop },
  ]
  return (
    <div className="w-[520px] rounded-md border border-navy-900/30 bg-white">
      <div className="border-b border-gray-10 px-3 py-2 text-[12.5px] font-semibold text-gray-90">{c.title}</div>
      {groups.map((g) => (
        <div key={g.key} className="border-b border-gray-10 px-3 py-2 last:border-b-0">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-gray-50">{g.title}</div>
          <ul className="space-y-1">
            {layers.filter((l) => l.group === g.key).map((l) => (
              <li key={l.id} className="flex items-center gap-2.5 text-[12.5px]">
                <button
                  onClick={() => toggle(l.id)}
                  disabled={l.locked || !!message.decided}
                  className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${l.on ? 'bg-navy-900' : 'bg-gray-20'} ${l.locked ? 'opacity-60' : ''}`}
                  aria-label={l.label}
                >
                  <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${l.on ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                </button>
                <span className="min-w-0 flex-1">
                  <span className="text-gray-90">{l.label}</span>
                  {l.detail && <span className="ml-1.5 text-[11px] text-gray-50">{l.detail}</span>}
                </span>
                {l.locked && <span className="text-[10.5px] text-gray-40">{copy.knowledge.alwaysOn}</span>}
                {l.status && l.status !== 'indexed' && (
                  <span className={`rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium capitalize ${l.status === 'thin' ? 'bg-warning-bg text-warning-fg' : 'bg-danger-bg text-danger-fg'}`}>{l.status}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Buttons options={c.options} decided={message.decided} onPick={decide} />
    </div>
  )
}

function ConsultingCard({ message }) {
  const c = message.content
  const decide = useDecide(message)
  return (
    <div className="w-[520px] rounded-md border border-warning-fg/40 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-10 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-warning-fg" />
        <span className="text-[12.5px] font-semibold text-gray-90">{c.title}</span>
        <span className="ml-auto rounded-sm bg-warning-bg px-1.5 py-0.5 text-[10.5px] font-medium capitalize text-warning-fg">{c.status}</span>
      </div>
      {c.gap && <div className="px-3 pt-2 text-[12px] text-gray-60">{c.gap}</div>}
      <p className="px-3 py-2 text-[13px] leading-[1.5] text-gray-90">{c.body}</p>
      <Buttons options={c.options} decided={message.decided} onPick={decide} />
    </div>
  )
}

function SummaryCard({ message }) {
  const c = message.content
  const decide = useDecide(message)
  const draft = useStore((s) => s.conversations[message.convId]?.draftBot) ?? {}
  const p = copy.preview
  const rows = [
    [p.job, draft.job],
    [p.scope, draft.scope],
    [p.knows, draft.knowledge?.filter((l) => l.on).map((l) => l.label).join(', ')],
    [p.allowed, draft.trust ? `${copy.trust[draft.trust]}. ${p.outboundRule}` : null],
    [p.when, draft.scheduleLabel],
    [p.channels, draft.channels],
  ]
  return (
    <div className="w-[520px] rounded-md border border-navy-900/30 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-10 px-3 py-2.5">
        <BotAvatar glyph={draft.avatar ?? 'shield'} size="md" />
        <div>
          <div className="text-[13px] font-bold text-gray-90">{draft.name ?? c.title}</div>
          <div className="text-[11.5px] text-gray-50">{c.subtitle}</div>
        </div>
      </div>
      <dl className="divide-y divide-gray-10">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[110px_1fr] gap-3 px-3 py-1.5 text-[12.5px]">
            <dt className="text-gray-50">{k}</dt>
            <dd className="text-gray-90">{v ?? '—'}</dd>
          </div>
        ))}
      </dl>
      <Buttons options={c.options} decided={message.decided} onPick={decide} />
    </div>
  )
}

function OptionsCard({ message }) {
  const c = message.content
  const decide = useDecide(message)
  return (
    <div className="w-[520px] rounded-md border border-gray-20 bg-white">
      {c.title && <div className="border-b border-gray-10 px-3 py-2 text-[12.5px] font-semibold text-gray-90">{c.title}</div>}
      {c.body && <p className="px-3 py-2 text-[13px] leading-[1.5] text-gray-90">{c.body}</p>}
      <Buttons options={c.options} decided={message.decided} onPick={decide} />
    </div>
  )
}

const VARIANTS = { knowledge: KnowledgeCard, consulting: ConsultingCard, summary: SummaryCard, options: OptionsCard }

export default function ChoiceCard({ message }) {
  const Variant = VARIANTS[message.content?.variant] ?? OptionsCard
  return (
    <BotBlock botId={message.author}>
      <Variant message={message} />
    </BotBlock>
  )
}
