// CertTrack — a clean SaaS COI tracker. Certificate view with expirations.
const hl = (highlighted, id) => (highlighted === id ? 'ring-2 ring-brand-blue ring-offset-1' : '')

function Shell({ children }) {
  return (
    <div className="min-h-full bg-slate-50 font-[system-ui] text-slate-800">
      <div className="flex h-11 items-center gap-3 border-b border-slate-200 bg-white px-4">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-teal-600 text-[11px] font-bold text-white">CT</span>
        <span className="text-[13.5px] font-semibold">CertTrack</span>
        <span className="ml-4 text-[12px] text-slate-500">Certificates</span>
        <span className="text-[12px] text-slate-400">Vendors</span>
        <span className="text-[12px] text-slate-400">Requests</span>
        <span className="ml-auto h-6 w-6 rounded-full bg-slate-200" />
      </div>
      {children}
    </div>
  )
}

export default function CoiPortal({ pageId, page, typed, highlighted }) {
  if (pageId === 'search') {
    const q = typed.q ?? ''
    const show = q.toLowerCase().startsWith('veg')
    return (
      <Shell>
        <div className="p-5">
          <div className="text-[15px] font-semibold">Certificates of insurance</div>
          <div className="mt-3 flex gap-2">
            <span data-target="q" className={`flex h-9 w-72 items-center rounded-md border border-slate-300 bg-white px-3 text-[13px] ${hl(highlighted, 'q')}`}>
              {q || <span className="text-slate-400">Search by vendor</span>}
              {highlighted === 'q' && <span className="ml-px h-4 w-px animate-pulse bg-slate-800" />}
            </span>
            <span className="flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-[12px] text-slate-600">Status: All</span>
          </div>
          <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
            {(show
              ? [{ id: 'vega', name: 'Vega Framing LLC', trade: 'Framing', status: 'Expiring soon', tone: 'amber' }]
              : [
                { id: 'allstar', name: 'Allstar Electric', trade: 'Electrical', status: 'Expiring soon', tone: 'amber' },
                { id: 'redline', name: 'Redline Plumbing', trade: 'Plumbing', status: 'Compliant', tone: 'emerald' },
                { id: 'monarch', name: 'Monarch Drywall', trade: 'Drywall', status: 'Compliant', tone: 'emerald' },
                { id: 'vega', name: 'Vega Framing LLC', trade: 'Framing', status: 'Expiring soon', tone: 'amber' },
              ]
            ).map((r) => (
              <div key={r.id} data-target={`result-${r.id}`} className={`flex items-center gap-3 border-b border-slate-100 px-4 py-2.5 text-[12.5px] last:border-b-0 ${hl(highlighted, `result-${r.id}`)}`}>
                <span className="font-medium">{r.name}</span>
                <span className="text-slate-500">{r.trade}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] ${r.tone === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </Shell>
    )
  }
  return (
    <Shell>
      <div className="p-5">
        <div className="text-[11.5px] text-slate-500">Certificates / {page.insured}</div>
        <div className="mt-0.5 flex items-center gap-2">
          <div className="text-[16px] font-semibold">{page.insured}</div>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">Expiring soon</span>
        </div>
        <div className="mt-1 text-[12px] text-slate-500">Certificate holder: {page.holder} · Carrier: {page.carrier}</div>
        <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="grid grid-cols-[1.3fr_1.3fr_1fr] border-b border-slate-200 bg-slate-50 px-4 py-2 text-[11px] uppercase text-slate-500">
            <span>Coverage</span><span>Limits</span><span>Expires</span>
          </div>
          {page.policies.map((p, i) => (
            <div key={p.type} data-target={i === 0 ? 'gl-expires' : undefined} className={`grid grid-cols-[1.3fr_1.3fr_1fr] border-b border-slate-100 px-4 py-2.5 text-[12.5px] last:border-b-0 ${i === 0 ? hl(highlighted, 'gl-expires') : ''}`}>
              <span className="font-medium">{p.type}</span>
              <span className="tabular-nums text-slate-600">{p.limits}</span>
              <span className={`tabular-nums ${p.soon ? 'font-semibold text-red-600' : 'text-slate-700'}`}>{p.expires}{p.soon && <span className="ml-1.5 text-[10.5px] font-normal">16 days</span>}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[12px] text-slate-600">
          <span>✓ Additional insured</span>
          <span>✓ Waiver of subrogation</span>
          <span>✓ Primary and non-contributory</span>
        </div>
      </div>
    </Shell>
  )
}
