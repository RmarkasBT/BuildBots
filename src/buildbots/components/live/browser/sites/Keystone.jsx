// Keystone Building Supply dealer portal. Dumb JSX: renders the page it is
// told to, shows typed text, highlights the targeted element.
const hl = (highlighted, id) => (highlighted === id ? 'ring-2 ring-brand-blue ring-offset-1' : '')

function Field({ id, label, typed, highlighted, type = 'text' }) {
  const v = typed[id] ?? ''
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-stone-600">{label}</span>
      <span data-target={id} className={`flex h-9 items-center rounded border border-stone-300 bg-white px-2.5 text-[13px] text-stone-800 ${hl(highlighted, id)}`}>
        {type === 'password' ? v : v}
        {highlighted === id && <span className="ml-px h-4 w-px animate-pulse bg-stone-800" />}
      </span>
    </label>
  )
}

function Shell({ children, page }) {
  return (
    <div className="min-h-full font-[system-ui] text-stone-800">
      <div className="flex h-12 items-center justify-between bg-[#7a1f1f] px-5 text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-white text-[12px] font-black text-[#7a1f1f]">K</span>
          <span className="text-[14px] font-semibold tracking-tight">Keystone Building Supply</span>
          <span className="ml-2 rounded-sm bg-white/15 px-1.5 text-[10px] uppercase">Dealer portal</span>
        </div>
        {page !== 'login' && <span className="text-[11.5px] text-white/80">Northaven Homes · NH-20481</span>}
      </div>
      {page !== 'login' && (
        <div className="flex gap-5 border-b border-stone-200 bg-stone-50 px-5 text-[12.5px]">
          {['Orders', 'Quotes', 'Invoices', 'Deliveries', 'Account'].map((t) => (
            <span key={t} className={`py-2.5 ${t === 'Orders' ? 'border-b-2 border-[#7a1f1f] font-semibold text-[#7a1f1f]' : 'text-stone-500'}`}>{t}</span>
          ))}
        </div>
      )}
      {children}
    </div>
  )
}

export default function Keystone({ pageId, page, typed, highlighted }) {
  if (pageId === 'login') {
    return (
      <Shell page="login">
        <div className="mx-auto mt-14 w-[320px] rounded border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-[15px] font-semibold">Sign in</div>
          <div className="space-y-3">
            <Field id="email" label="Email" typed={typed} highlighted={highlighted} />
            <Field id="password" label="Password" typed={typed} highlighted={highlighted} type="password" />
            <button data-target="signin" className={`h-9 w-full rounded bg-[#7a1f1f] text-[13px] font-semibold text-white ${hl(highlighted, 'signin')}`}>Sign in</button>
          </div>
          <div className="mt-3 text-center text-[11px] text-stone-400">Forgot password · Request dealer access</div>
        </div>
      </Shell>
    )
  }
  if (pageId === 'orders') {
    return (
      <Shell page="orders">
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[15px] font-semibold">Open and recent orders</div>
            <span className="h-7 w-44 rounded border border-stone-300 bg-white px-2 text-[11.5px] leading-7 text-stone-400">Search orders</span>
          </div>
          <table className="w-full text-[12.5px]">
            <thead className="text-left text-[11px] uppercase text-stone-500">
              <tr className="border-b border-stone-200"><th className="py-2">PO</th><th>Job</th><th>Description</th><th>Status</th><th className="text-right">Delivery</th></tr>
            </thead>
            <tbody>
              {page.rows.map((r) => (
                <tr key={r.po} data-target={`row-${r.po.replace('PO ', '')}`} className={`border-b border-stone-100 ${hl(highlighted, `row-${r.po.replace('PO ', '')}`)} ${r.flagged ? 'bg-amber-50' : ''}`}>
                  <td className="py-2.5 font-medium text-[#7a1f1f]">{r.po}</td>
                  <td>{r.job}</td>
                  <td className="text-stone-600">{r.desc}</td>
                  <td><span className={`rounded-sm px-1.5 py-0.5 text-[11px] ${r.status === 'Updated' ? 'bg-amber-100 text-amber-800' : r.status === 'Delivered' ? 'bg-stone-100 text-stone-600' : 'bg-emerald-50 text-emerald-700'}`}>{r.status}</span></td>
                  <td className="text-right tabular-nums">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Shell>
    )
  }
  // order detail
  const deliveryTab = highlighted === 'tab-delivery' || highlighted === 'revised' || highlighted === null
  return (
    <Shell page="order">
      <div className="p-5">
        <div className="text-[11.5px] text-stone-500">Orders / {page.po}</div>
        <div className="mt-0.5 flex items-baseline justify-between">
          <div className="text-[16px] font-semibold">{page.po} — Roof trusses</div>
          <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800">Delivery updated</span>
        </div>
        <div className="text-[12px] text-stone-600">{page.job}</div>
        <div className="mt-4 flex gap-4 border-b border-stone-200 text-[12.5px]">
          <span className="py-2 text-stone-500">Items</span>
          <span data-target="tab-delivery" className={`py-2 ${deliveryTab ? 'border-b-2 border-[#7a1f1f] font-semibold text-[#7a1f1f]' : 'text-stone-500'} ${hl(highlighted, 'tab-delivery')}`}>Delivery</span>
          <span className="py-2 text-stone-500">Documents</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-[12.5px]">
          <div className="rounded border border-stone-200 p-3">
            <div className="text-[11px] uppercase text-stone-500">Original delivery</div>
            <div className="mt-1 text-[13px] text-stone-500 line-through">{page.original}</div>
          </div>
          <div data-target="revised" className={`rounded border border-amber-300 bg-amber-50 p-3 ${hl(highlighted, 'revised')}`}>
            <div className="text-[11px] uppercase text-amber-800">Revised delivery</div>
            <div className="mt-1 text-[15px] font-semibold text-amber-900">{page.revised}</div>
            <div className="mt-1 text-[11.5px] text-amber-800">{page.note}</div>
          </div>
        </div>
        <table className="mt-4 w-full text-[12px]">
          <thead className="text-left text-[11px] uppercase text-stone-500"><tr className="border-b border-stone-200"><th className="py-1.5">SKU</th><th>Description</th><th className="text-right">Qty</th></tr></thead>
          <tbody>{page.items.map((it) => <tr key={it.sku} className="border-b border-stone-100"><td className="py-1.5 font-mono text-[11px]">{it.sku}</td><td>{it.desc}</td><td className="text-right tabular-nums">{it.qty}</td></tr>)}</tbody>
        </table>
      </div>
    </Shell>
  )
}
