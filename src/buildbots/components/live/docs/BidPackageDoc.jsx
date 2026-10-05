import { partnerById, jobById } from '../../../data'
import { fmtShort } from '../../../lib/dates'

// The bid package as it sits in Buildertrend Bids: header with status, the
// scope and attachments, then each recipient with their send state.
const STATUS = {
  draft: { label: 'Draft', cls: 'bg-gray-10 text-gray-70' },
  sent: { label: 'Sent', cls: 'bg-success-bg text-success-fg' },
  viewed: { label: 'Viewed', cls: 'bg-info-bg text-info-fg' },
  submitted: { label: 'Bid received', cls: 'bg-success-bg text-success-fg' },
}

export default function BidPackageDoc({ doc }) {
  const job = jobById[doc.jobId]
  const st = STATUS[doc.status] ?? STATUS.draft
  return (
    <div className="p-4">
      <div className="rounded-md border border-gray-15 bg-white">
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] text-gray-50">
              <span className="rounded-sm bg-navy-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Buildertrend</span>
              <span>Bids · {job?.name}</span>
            </div>
            <div className="mt-1 text-[14px] font-semibold text-gray-90">{doc.title}</div>
            <div className="mt-0.5 text-[11.5px] text-gray-60">{job?.address}</div>
          </div>
          <span className={`shrink-0 rounded-sm px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-gray-10 border-t border-gray-10 text-[12px]">
          <div className="px-4 py-2">
            <dt className="text-[10.5px] uppercase tracking-wide text-gray-50">Bids due</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-gray-90">{fmtShort(doc.due)}</dd>
          </div>
          <div className="px-4 py-2">
            <dt className="text-[10.5px] uppercase tracking-wide text-gray-50">Site walk</dt>
            <dd className="mt-0.5 font-medium text-gray-90">{doc.walk}</dd>
          </div>
          <div className="px-4 py-2">
            <dt className="text-[10.5px] uppercase tracking-wide text-gray-50">{doc.status === 'sent' ? 'Sent' : 'Created'}</dt>
            <dd className="mt-0.5 font-medium text-gray-90">{doc.sentAt ?? 'Today'}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-3 rounded-md border border-gray-15 bg-white">
        <div className="border-b border-gray-15 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-50">Scope</div>
        <p className="px-4 py-2.5 text-[12.5px] leading-[1.55] text-gray-80">{doc.scope}</p>
        <div className="border-t border-gray-10 px-4 py-2">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-gray-50">Attachments</div>
          <ul className="space-y-1">
            {doc.attachments.map((a) => (
              <li key={a.name} className="flex items-center gap-2 text-[12px]">
                <span className="h-3.5 w-3 shrink-0 rounded-[2px] border border-gray-30" />
                <span className="truncate text-gray-90">{a.name}</span>
                <span className="truncate text-[11px] text-gray-50">· {a.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-gray-15 bg-white">
        <div className="flex items-center border-b border-gray-15 px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-50">Recipients</span>
          <span className="ml-auto text-[11px] tabular-nums text-gray-50">{doc.recipients.length} trades</span>
        </div>
        <ul className="divide-y divide-gray-10">
          {doc.recipients.map((r) => {
            const p = partnerById[r.partnerId]
            const rs = STATUS[r.status] ?? STATUS.draft
            return (
              <li key={r.partnerId} className="flex items-center gap-3 px-4 py-2 text-[12.5px]">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-gray-90">{p?.name}</span>
                  <span className="block truncate text-[11px] text-gray-50">{p?.contact} · {p?.email}</span>
                </span>
                {r.at && <span className="shrink-0 text-[11px] tabular-nums text-gray-50">{r.at}</span>}
                <span className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium ${rs.cls}`}>{rs.label}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
