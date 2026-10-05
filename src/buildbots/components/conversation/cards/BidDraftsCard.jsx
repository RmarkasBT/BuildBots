import { useState } from 'react'
import { copy, company, partnerById } from '../../../data'
import { useDispatch, useRunner } from '../../../store/useBuildbots'
import { A } from '../../../store/actions'
import { BotBlock } from '../Message'
import { ChannelIcon } from './SentCard'

// One personalized draft per recipient, tabbed. Bodies are editable until
// sent. One primary button sends them all; the card then flips to its sent
// state and each tab shows a check, so the thread does not need three
// separate sent cards.
export default function BidDraftsCard({ message }) {
  const dispatch = useDispatch()
  const runner = useRunner()
  const c = message.content ?? {}
  const drafts = c.drafts ?? []
  const [tab, setTab] = useState(0)
  const decided = message.decided
  const sent = decided === 'sent'
  const d = drafts[tab]

  const edit = (body) => {
    if (decided) return
    const next = drafts.map((x, i) => (i === tab ? { ...x, body } : x))
    dispatch({ type: A.PATCH_MESSAGE, payload: { id: message.id, patch: { content: { ...c, drafts: next } } } })
  }

  const pick = (o) => {
    dispatch({ type: A.PATCH_MESSAGE, payload: { id: message.id, patch: { decided: o.goto } } })
    runner.resumeFromUser(message.convId, o.send ?? o.label, { goto: o.goto })
  }

  return (
    <BotBlock botId={message.author}>
      <div className={`w-[600px] rounded-md border bg-white ${decided ? 'border-gray-15' : 'border-navy-900/30'}`}>
        <div className="flex items-center gap-2 border-b border-gray-10 px-3 py-2">
          <span className="rounded-sm bg-navy-900 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-white">Buildertrend</span>
          <span className="min-w-0 truncate text-[12.5px] font-semibold text-gray-90">{c.title}</span>
          {sent ? (
            <span className="ml-auto flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-success-fg"><span>✓</span>Sent to {drafts.length}</span>
          ) : decided ? (
            <span className="ml-auto shrink-0 text-[11.5px] text-gray-50">Not sent</span>
          ) : (
            <span className="ml-auto shrink-0 text-[11px] text-gray-50">{c.package}</span>
          )}
        </div>

        {/* Recipient tabs */}
        <div className="flex border-b border-gray-10">
          {drafts.map((x, i) => {
            const p = partnerById[x.partnerId]
            const active = i === tab
            return (
              <button
                key={x.partnerId}
                onClick={() => setTab(i)}
                className={`relative flex min-w-0 flex-1 flex-col items-start px-3 py-2 text-left ${active ? 'bg-white' : 'bg-gray-5 hover:bg-white'}`}
              >
                <span className="flex w-full items-center gap-1.5">
                  <span className={`truncate text-[12px] font-semibold ${active ? 'text-gray-90' : 'text-gray-70'}`}>{p?.contact ?? x.to}</span>
                  {sent && <span className="ml-auto text-[11px] text-success-fg">✓</span>}
                </span>
                <span className="w-full truncate text-[10.5px] text-gray-50">{p?.name}</span>
                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-navy-900" />}
              </button>
            )
          })}
        </div>

        {d && (
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-gray-50">
              <ChannelIcon channel="email" className="h-3.5 w-3.5 text-gray-50" />
              <span>Email to <span className="font-medium text-gray-80">{d.to}</span> · {d.toEmail}</span>
              {sent && <span className="ml-auto text-success-fg">Sent today, 10:42am</span>}
            </div>
            {d.why && !sent && (
              <div className="mt-1.5 inline-block rounded-sm bg-info-bg px-1.5 py-0.5 text-[10.5px] text-info-fg">Why them: {d.why}</div>
            )}
            <div className="mt-2 text-[12.5px] font-medium text-gray-90">{d.subject}</div>
            {decided ? (
              <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-[1.55] text-gray-80">{d.body}</p>
            ) : (
              <textarea
                value={d.body}
                onChange={(e) => edit(e.target.value)}
                rows={11}
                className="mt-1.5 w-full resize-y rounded-sm border border-transparent bg-transparent px-1 py-1 text-[12.5px] leading-[1.55] text-gray-80 outline-none hover:border-gray-20 focus:border-brand-blue focus:bg-white"
              />
            )}
            <div className="mt-2 flex items-center gap-2 text-[10.5px] text-gray-40">
              <span className="h-3 w-2.5 rounded-[2px] border border-gray-30" />
              <span>Pike Street — Construction Set rev2.pdf attached · P0.0–P2.1 flagged</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-10 px-3 py-2">
          {sent ? (
            <span className="text-[11px] text-gray-40">{copy.sent.signature(company.name)}</span>
          ) : (
            <>
              {(c.options ?? []).map((o, i) => {
                const chosen = decided === o.goto
                if (decided && !chosen) return null
                return (
                  <button
                    key={o.goto ?? o.label}
                    disabled={!!decided}
                    onClick={() => pick(o)}
                    className={`h-7 rounded-sm px-3 text-[12px] font-semibold ${i === 0 && !decided ? 'bg-navy-900 text-white' : chosen ? 'bg-gray-10 text-gray-60' : 'border border-gray-20 text-gray-80 hover:bg-gray-5'}`}
                  >
                    {chosen ? `— ${o.label}` : o.label}
                  </button>
                )
              })}
              {!decided && <span className="ml-auto max-w-[260px] text-right text-[11px] leading-tight text-warning-fg">{copy.approvals.needsOk}</span>}
            </>
          )}
        </div>
      </div>
    </BotBlock>
  )
}
