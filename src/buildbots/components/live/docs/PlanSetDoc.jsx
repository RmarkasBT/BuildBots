// A construction set as the bot read it: where it was filed, the sheet
// index with one trade's sheets flagged, and the scope pulled off them.
export default function PlanSetDoc({ doc }) {
  return (
    <div className="p-4">
      <div className="rounded-md border border-gray-15 bg-white">
        <div className="flex items-start gap-3 px-4 py-3">
          <span className="relative flex h-14 w-11 shrink-0 items-center justify-center rounded-[3px] border border-gray-20 bg-gray-5">
            <svg viewBox="0 0 40 48" className="h-full w-full" fill="none">
              <rect x="7" y="9" width="26" height="18" stroke="#9aa7b5" />
              <path d="M7 18h26M20 9v18" stroke="#9aa7b5" />
              {[32, 37].map((y) => <rect key={y} x="7" y={y} width={y === 37 ? 16 : 26} height="2" fill="#d3dbe2" />)}
            </svg>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-[2px] bg-danger-fg px-1 text-[8.5px] font-bold leading-[13px] text-white">PDF</span>
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-gray-90">{doc.file}</div>
            <div className="mt-0.5 text-[11.5px] text-gray-60">{doc.sheets} sheets · {doc.size} · {doc.revision}</div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-60">
              <span className="rounded-sm bg-navy-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Buildertrend</span>
              <span>Saved to {doc.savedTo}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-gray-15 bg-white">
        <div className="flex items-center border-b border-gray-15 px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-50">Sheet index</span>
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-gray-60">
            <span className="h-2 w-2 rounded-sm bg-brand-blue" />
            Flagged for {doc.flaggedTrade}
          </span>
        </div>
        {doc.groups.map((g) => (
          <div key={g.name} className={`border-b border-gray-10 last:border-b-0 ${g.flagged ? 'bg-info-bg/40' : ''}`}>
            <div className="flex items-center gap-2 px-4 pt-2 text-[10.5px] font-semibold uppercase tracking-wide text-gray-50">
              {g.flagged && <span className="h-2 w-2 rounded-sm bg-brand-blue" />}
              {g.name}
              <span className="font-normal normal-case tracking-normal text-gray-40">{g.sheets.length}</span>
            </div>
            <ul className="px-4 pb-2">
              {g.sheets.map((s) => (
                <li key={s.no} className="flex items-center gap-3 py-0.5 text-[12px]">
                  <span className={`w-9 shrink-0 font-mono tabular-nums ${g.flagged ? 'font-semibold text-navy-900' : 'text-gray-60'}`}>{s.no}</span>
                  <span className={`truncate ${g.flagged ? 'text-gray-90' : 'text-gray-70'}`}>{s.title}</span>
                  {s.rev && <span className="ml-auto shrink-0 rounded-sm bg-warning-bg px-1.5 py-0.5 text-[10px] font-medium text-warning-fg">Rev 2 cloud</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-md border border-gray-15 bg-white">
        <div className="border-b border-gray-15 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-50">{doc.flaggedTrade} scope pulled from the set</div>
        <dl className="divide-y divide-gray-10">
          {doc.scope.map((f) => (
            <div key={f.label} className="grid grid-cols-[110px_1fr] gap-3 px-4 py-2 text-[12.5px]">
              <dt className="text-gray-50">{f.label}</dt>
              <dd className={f.emphasis ? 'font-semibold text-gray-90' : 'text-gray-80'}>
                {f.value}
                {f.emphasis && <span className="ml-2 rounded-sm bg-warning-bg px-1.5 py-0.5 text-[10.5px] font-medium text-warning-fg">Changed</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
