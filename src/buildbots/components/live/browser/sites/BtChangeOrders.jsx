// Buildertrend Change Orders — the bot driving your own product where no
// API exists yet. Navy top bar, blue buttons, dense table.
const hl = (highlighted, id) => (highlighted === id ? 'ring-2 ring-brand-blue ring-offset-1' : '')
const money = (n) => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

function Shell({ children, job }) {
  return (
    <div className="min-h-full bg-gray-5 text-gray-90">
      <div className="flex h-10 items-center gap-3 bg-navy-900 px-4 text-white">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold">b</span>
        <span className="text-[12px] text-white/80">Sales</span><span className="text-[12px] text-white/80">Jobs</span>
        <span className="text-[12px] font-semibold">Project Management</span>
        <span className="text-[12px] text-white/80">Files</span><span className="text-[12px] text-white/80">Financial</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-15 bg-white px-4 py-2">
        <div>
          <div className="text-[11px] text-gray-50">{job}</div>
          <div className="text-[14px] font-semibold">Change Orders</div>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function BtChangeOrders({ pageId, page, typed, highlighted }) {
  if (pageId === 'new') {
    return (
      <Shell job="Hargrove Residence">
        <div className="m-4 rounded-md border border-gray-15 bg-white p-4">
          <div className="mb-3 text-[13px] font-semibold">New Change Order</div>
          <div className="grid grid-cols-[1fr_180px] gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-gray-60">Title</span>
              <span data-target="title" className={`flex h-8 items-center rounded-sm border border-gray-20 px-2 text-[12.5px] ${hl(highlighted, 'title')}`}>{typed.title ?? ''}{highlighted === 'title' && <span className="ml-px h-4 w-px animate-pulse bg-gray-90" />}</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-gray-60">Builder cost</span>
              <span data-target="amount" className={`flex h-8 items-center rounded-sm border border-gray-20 px-2 text-[12.5px] tabular-nums ${hl(highlighted, 'amount')}`}>{typed.amount ? '$' + typed.amount : ''}{highlighted === 'amount' && <span className="ml-px h-4 w-px animate-pulse bg-gray-90" />}</span>
            </label>
          </div>
          <label className="mt-3 block">
            <span className="mb-1 block text-[11px] font-medium text-gray-60">Description</span>
            <span className="block h-16 rounded-sm border border-gray-20 px-2 py-1.5 text-[12px] text-gray-70">Girder truss redesign per Keystone revision 10/01. Upcharge passed through at cost plus 12%.</span>
          </label>
          <div className="mt-3 flex items-center gap-2">
            <span data-target="save" className={`inline-flex h-8 items-center rounded-sm bg-brand-blue px-3 text-[12.5px] font-semibold text-white ${hl(highlighted, 'save')}`}>Save</span>
            <span className="inline-flex h-8 items-center rounded-sm border border-gray-20 px-3 text-[12.5px] text-gray-70">Cancel</span>
          </div>
        </div>
      </Shell>
    )
  }
  return (
    <Shell job={page.job}>
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex gap-2 text-[12px]">
          <span className="rounded-sm border border-gray-20 bg-white px-2 py-1">Filter</span>
          <span className="rounded-sm border border-gray-20 bg-white px-2 py-1">Status: All</span>
        </div>
        <span data-target="new" className={`inline-flex h-8 items-center rounded-sm bg-brand-blue px-3 text-[12.5px] font-semibold text-white ${hl(highlighted, 'new')}`}>+ Change Order</span>
      </div>
      <div className="m-4 overflow-hidden rounded-md border border-gray-15 bg-white">
        <div className="grid grid-cols-[70px_1fr_120px_100px_80px] border-b border-gray-15 bg-gray-5 px-3 py-2 text-[11px] font-semibold uppercase text-gray-50">
          <span>#</span><span>Title</span><span className="text-right">Builder cost</span><span>Status</span><span className="text-right">Date</span>
        </div>
        {page.rows.map((r) => (
          <div key={r.id} className={`grid grid-cols-[70px_1fr_120px_100px_80px] border-b border-gray-10 px-3 py-2 text-[12.5px] last:border-b-0 ${r.isNew ? 'bg-info-bg bb-msg-in' : ''}`}>
            <span className="font-medium text-brand-blue">{r.id}</span>
            <span className="truncate">{r.title}</span>
            <span className="text-right tabular-nums">{money(r.amount)}</span>
            <span><span className={`rounded-sm px-1.5 py-0.5 text-[11px] ${r.status === 'Approved' ? 'bg-success-bg text-success-fg' : 'bg-warning-bg text-warning-fg'}`}>{r.status}</span></span>
            <span className="text-right tabular-nums text-gray-60">{r.date}</span>
          </div>
        ))}
      </div>
    </Shell>
  )
}
