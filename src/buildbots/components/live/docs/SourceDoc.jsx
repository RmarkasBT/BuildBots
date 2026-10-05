import { copy } from '../../../data'

// Data the bot pulled through a connector. Leads with the facts it used,
// then shows the source message underneath so a viewer can check its work.
export default function SourceDoc({ doc }) {
  const e = doc.email
  return (
    <div className="p-4">
      <div className="mb-2 flex items-center gap-2 text-[11.5px] text-gray-60">
        <span className="rounded-sm border border-gray-40 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-gray-70">{doc.via}</span>
        <span>{copy.source.foundVia(doc.via)}</span>
        {doc.matched != null && <span className="ml-auto tabular-nums text-gray-40">{copy.source.matched(doc.matched)}</span>}
      </div>
      {doc.query && (
        <div className="mb-3 truncate rounded-sm bg-gray-10 px-2 py-1 font-mono text-[11px] text-gray-60">{doc.query}</div>
      )}

      <div className="rounded-md border border-gray-15 bg-white">
        <div className="border-b border-gray-15 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-50">{copy.source.extracted}</div>
        <dl className="divide-y divide-gray-10">
          {doc.extracted.map((f) => (
            <div key={f.label} className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2 text-[12.5px]">
              <dt className="text-gray-50">{f.label}</dt>
              <dd className={`tabular-nums ${f.strike ? 'text-gray-40 line-through' : f.emphasis ? 'font-semibold text-gray-90' : 'text-gray-80'}`}>
                {f.value}
                {f.emphasis && <span className="ml-2 rounded-sm bg-warning-bg px-1.5 py-0.5 text-[10.5px] font-medium text-warning-fg">{copy.source.changed}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {e && (
        <div className="mt-3 rounded-md border border-gray-15 bg-white">
          <div className="border-b border-gray-15 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-50">{copy.source.message}</div>
          <div className="px-4 py-3">
            <div className="text-[13px] font-semibold text-gray-90">{e.subject}</div>
            <div className="mt-1 grid grid-cols-[44px_1fr] gap-x-2 text-[11.5px] text-gray-60">
              <span>From</span><span className="truncate text-gray-80">{e.from}</span>
              <span>To</span><span className="truncate">{e.to}</span>
              <span>Date</span><span>{e.date}</span>
            </div>
            <p className="mt-3 whitespace-pre-line text-[12.5px] leading-[1.55] text-gray-80">{e.body}</p>
          </div>
        </div>
      )}

      {doc.others?.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-50">{copy.source.alsoMatched}</div>
          <ul className="rounded-md border border-gray-15 bg-white">
            {doc.others.map((o) => (
              <li key={o.subject} className="flex items-center gap-3 border-b border-gray-10 px-4 py-2 text-[12px] last:border-b-0">
                <span className="w-12 shrink-0 tabular-nums text-gray-40">{o.date}</span>
                <span className="truncate text-gray-70">{o.subject}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
