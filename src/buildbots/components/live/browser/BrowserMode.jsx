import { useRef } from 'react'
import { browserMocks, copy } from '../../../data'
import { useDispatch } from '../../../store/useBuildbots'
import { A } from '../../../store/actions'
import Cursor from './Cursor'
import useBrowserScript from './useBrowserScript'
import Keystone from './sites/Keystone'
import TravisPermits from './sites/TravisPermits'
import CoiPortal from './sites/CoiPortal'
import BtChangeOrders from './sites/BtChangeOrders'

const SITES = { Keystone, TravisPermits, CoiPortal, BtChangeOrders }

// A chrome strip with a fake URL bar, then the mock site, then a step
// counter. The cursor lives in a positioned wrapper over the site.
export default function BrowserMode({ target }) {
  const mock = browserMocks[target.targetId]
  const script = mock?.scripts[target.scriptId]
  const dispatch = useDispatch()
  const ref = useRef(null)
  const s = useBrowserScript(ref, mock, script, {
    onStep: (i) => dispatch({ type: A.LIVE_SET_STEP, payload: { stepIndex: i } }),
  })
  if (!mock) return <div className="p-6 text-sm text-gray-40">Unknown site: {target.targetId}</div>
  const Site = SITES[mock.component]
  const page = mock.pages[s.page] ?? mock.pages[script?.startPage]
  const steps = script?.steps ?? []
  const showStep = s.stepIndex >= 0 && s.stepIndex < steps.length

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-gray-20 bg-gray-10">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-30" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-30" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-30" />
          </span>
          <span className="ml-1 flex gap-1 text-gray-40">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </span>
          <div className="flex h-6 flex-1 items-center gap-1.5 rounded-sm border border-gray-20 bg-white px-2 text-[11px] text-gray-70">
            <svg viewBox="0 0 24 24" className="h-3 w-3 text-gray-40" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="1.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            <span className="truncate"><span className="text-gray-90">{mock.host}</span>{page?.path ?? ''}</span>
          </div>
        </div>
        <div className="relative h-0.5 bg-transparent">
          {s.loading && <div className="absolute inset-y-0 left-0 w-2/3 bg-brand-blue bb-slide-in" />}
        </div>
      </div>

      <div ref={ref} className={`relative min-h-0 flex-1 overflow-auto ${mock.ugly ? 'bg-[#d4d0c8]' : 'bg-white'}`}>
        <Site mock={mock} pageId={s.page} page={page} typed={s.typed} highlighted={s.highlighted} />
        <Cursor {...s.cursor} />
      </div>

      <div className="flex h-9 shrink-0 items-center gap-2 border-t border-gray-15 bg-white px-3 text-[11.5px]">
        {showStep ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-blue bb-pulse" />
            <span className="font-semibold tabular-nums text-gray-80">{copy.live.step(s.stepIndex + 1, steps.length)}</span>
            <span className="truncate text-gray-60">{s.caption}</span>
          </>
        ) : s.done ? (
          <>
            <span className="text-success-fg">✓</span>
            <span className="text-gray-70">{copy.live.stepsDone(steps.length)}</span>
            <span className="truncate text-gray-50">{s.caption}</span>
          </>
        ) : (
          <span className="text-gray-50">{copy.live.connecting}</span>
        )}
      </div>
    </div>
  )
}
