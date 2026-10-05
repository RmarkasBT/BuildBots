// An SOP rendered as a clean document. Status chip reads from the doc.
const STATUS = {
  indexed: 'bg-success-bg text-success-fg',
  thin: 'bg-warning-bg text-warning-fg',
  missing: 'bg-danger-bg text-danger-fg',
}

export default function SopDoc({ doc }) {
  return (
    <div className="p-4">
      <div className="rounded-md border border-gray-15 bg-white">
        <div className="flex items-start justify-between border-b border-gray-15 px-5 py-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-50">Standard operating procedure</div>
            <div className="mt-0.5 text-[16px] font-bold text-gray-90">{doc.title}</div>
            <div className="mt-1 text-[11.5px] text-gray-50">{doc.owner} · {doc.written}</div>
          </div>
          <span className={`rounded-sm px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS[doc.status] ?? STATUS.indexed}`}>{doc.status}</span>
        </div>
        <div className="px-5 py-3">
          {doc.sections.map((s, i) => (
            <div key={s.heading} className={`bb-msg-in py-3 ${i ? 'border-t border-gray-10' : ''}`} style={{ animationDelay: `${i * 120}ms` }}>
              <div className="text-[12.5px] font-semibold text-gray-90">{i + 1}. {s.heading}</div>
              <p className="mt-1 text-[12.5px] leading-[1.55] text-gray-80">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
