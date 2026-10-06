import { useState, useEffect, useRef } from 'react'
import { Z } from '../../constants'
import {
  copy, company,
  prebuiltSources, businessPrompts, businessDraft, projectKnowledge,
  setupSteps, sopGroups, sopUploadFile, sopCallToAction,
  SOP_QUESTIONS, SOP_TOTAL, SOP_POSSIBLE_TOTAL, SOP_COVERED_TOTAL,
} from '../../data'
import { useStore, useDispatch } from '../../store/useBuildbots'
import { selectUi, selectKnowledge } from '../../store/selectors'
import { A } from '../../store/actions'

// Guided first-run for the four knowledge layers. Step 4 is the reason the
// flow exists: the 28-process framework is shown empty first, so the builder
// sees the shape of what they have never written down, then an upload fills
// in whatever their own manual actually answers.

const TIER = (n) =>
  n >= 9 ? { key: 'strong', cls: 'bg-success-bg text-success-fg', bar: 'bg-success-fg' }
  : n >= 6 ? { key: 'partial', cls: 'bg-warning-bg text-warning-fg', bar: 'bg-warning-fg' }
  : { key: 'thin', cls: 'bg-danger-bg text-danger-fg', bar: 'bg-danger-fg' }

function Pips({ covered, barClass }) {
  return (
    <span className="flex shrink-0 gap-[2px]" aria-hidden>
      {Array.from({ length: SOP_QUESTIONS }, (_, i) => (
        <span key={i} className={`h-3 w-[3px] rounded-[1px] ${i < covered ? barClass : 'bg-gray-15'}`} />
      ))}
    </span>
  )
}

function Toggle({ on, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-brand-blue' : 'bg-gray-20'} ${disabled ? 'opacity-40' : ''}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

function StepRail({ step, setStep }) {
  const s = copy.setup
  return (
    <nav className="w-[208px] shrink-0 border-r border-gray-15 bg-gray-5 p-3">
      <div className="mb-3 px-1">
        <div className="text-[13px] font-semibold text-gray-90">{s.title}</div>
        <div className="text-[11.5px] text-gray-50">{s.subtitle}</div>
      </div>
      <ol className="space-y-0.5">
        {setupSteps.map((st, i) => {
          const active = i === step
          const past = i < step
          return (
            <li key={st.id}>
              <button
                onClick={() => setStep(i)}
                className={`flex w-full items-start gap-2.5 rounded-sm px-2 py-2 text-left ${active ? 'bg-white shadow-sm' : 'hover:bg-gray-10'}`}
              >
                <span className={`mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold ${past ? 'bg-success-bg text-success-fg' : active ? 'bg-navy-900 text-white' : 'bg-gray-15 text-gray-50'}`}>
                  {past ? '✓' : st.n}
                </span>
                <span className="min-w-0">
                  <span className={`block text-[12.5px] ${active ? 'font-semibold text-gray-90' : 'text-gray-80'}`}>{st.title}</span>
                  <span className="block text-[11px] leading-[1.35] text-gray-50">{st.blurb}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function StepHeader({ title, note }) {
  return (
    <div className="mb-3">
      <h3 className="text-[14px] font-semibold text-gray-90">{title}</h3>
      {note && <p className="mt-0.5 text-[12px] leading-[1.5] text-gray-60">{note}</p>}
    </div>
  )
}

/* ---------- Step 1: pre-built ---------- */

function StepPrebuilt() {
  const knowledge = useStore(selectKnowledge)
  const dispatch = useDispatch()
  const s = copy.setup
  return (
    <>
      <StepHeader title={setupSteps[0].title} note={s.prebuiltNote} />
      <ul className="divide-y divide-gray-10 rounded-md border border-gray-15 bg-white">
        {prebuiltSources.map((src) => {
          const on = src.locked || knowledge.prebuilt?.[src.id]
          return (
            <li key={src.id} className="flex items-center gap-3 px-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-semibold text-gray-90">{src.title}</span>
                <span className="block text-[11.5px] leading-[1.4] text-gray-50">{src.detail}</span>
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-gray-40">{src.meta}</span>
              {src.locked ? (
                <span className="shrink-0 rounded-sm bg-gray-10 px-1.5 py-0.5 text-[10.5px] font-medium text-gray-60">{s.prebuiltAlways}</span>
              ) : (
                <Toggle on={!!on} onChange={(v) => dispatch({ type: A.SETUP_PREBUILT, payload: { id: src.id, on: v } })} />
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

/* ---------- Step 2: business ---------- */

function StepBusiness() {
  const knowledge = useStore(selectKnowledge)
  const dispatch = useDispatch()
  const [phase, setPhase] = useState('idle') // idle | reading | done
  const [stepIdx, setStepIdx] = useState(-1)
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const s = copy.setup
  const website = { steps: ['Reading 14 pages', 'Pulling service area and trades', 'Reading the warranty page', 'Matching brand voice'] }

  const crawl = () => {
    setPhase('reading')
    website.steps.forEach((_, i) => timers.current.push(setTimeout(() => setStepIdx(i), 400 + i * 650)))
    timers.current.push(setTimeout(() => {
      dispatch({ type: A.SETUP_PROFILE, payload: { fields: businessDraft } })
      setPhase('done'); setStepIdx(-1)
    }, 400 + website.steps.length * 650 + 400))
  }

  const filled = Object.values(knowledge.profile ?? {}).some(Boolean)

  return (
    <>
      <StepHeader title={setupSteps[1].title} note={s.businessNote} />

      <div className="mb-4 rounded-md border border-gray-15 bg-white px-3 py-2.5">
        <div className="flex items-center gap-3">
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold text-gray-90">{company.website}</span>
            <span className="block text-[11.5px] text-gray-50">{filled ? s.crawled : 'Your site is the fastest way to start.'}</span>
          </span>
          {phase === 'reading' ? (
            <span className="flex items-center gap-2 text-[11.5px] text-gray-60"><span className="h-1.5 w-1.5 rounded-full bg-brand-blue bb-pulse" />{s.crawling}</span>
          ) : (
            <button onClick={crawl} className="h-7 shrink-0 rounded-sm border border-gray-20 px-2.5 text-[12px] text-gray-80 hover:bg-gray-5">
              {filled ? s.recrawl : s.crawl}
            </button>
          )}
        </div>
        {phase === 'reading' && (
          <ul className="mt-2 space-y-0.5 text-[11.5px] text-gray-60">
            {website.steps.map((t, i) => (
              <li key={t} className={`flex items-center gap-2 ${i > stepIdx ? 'opacity-30' : ''}`}>
                <span className={`w-3 text-center ${i < stepIdx ? 'text-success-fg' : ''}`}>{i < stepIdx ? '✓' : i === stepIdx ? '·' : ''}</span>{t}
              </li>
            ))}
          </ul>
        )}
      </div>

      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-50">{s.describe}</h4>
      <div className="space-y-3">
        {businessPrompts.map((p) => (
          <label key={p.id} className="block">
            <span className="mb-1 block text-[11.5px] font-medium text-gray-70">{p.label}</span>
            <textarea
              rows={2}
              value={knowledge.profile?.[p.id] ?? ''}
              placeholder={p.placeholder}
              onChange={(e) => dispatch({ type: A.SETUP_PROFILE, payload: { fields: { [p.id]: e.target.value } } })}
              className="w-full resize-none rounded-sm border border-gray-20 px-2 py-1.5 text-[12.5px] leading-[1.5] text-gray-90 outline-none placeholder:text-gray-30 focus:border-brand-blue"
            />
          </label>
        ))}
      </div>
    </>
  )
}

/* ---------- Step 3: project ---------- */

function StepProject() {
  const s = copy.setup
  return (
    <>
      <StepHeader title={setupSteps[2].title} note={s.projectNote} />
      <p className="mb-3 text-[12.5px] leading-[1.6] text-gray-80">{projectKnowledge.blurb}</p>
      <ul className="divide-y divide-gray-10 rounded-md border border-gray-15 bg-white">
        {projectKnowledge.examples.map((e) => (
          <li key={e.title} className="flex items-start gap-3 px-3 py-2.5">
            <span className="mt-[2px] h-5 w-4 shrink-0 rounded-[2px] border border-gray-30" />
            <span className="min-w-0">
              <span className="block text-[12.5px] font-semibold text-gray-90">{e.title}</span>
              <span className="block text-[11.5px] text-gray-50">{e.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-md border border-dashed border-gray-20 bg-gray-5 px-4 py-6 text-center">
        <div className="text-[12.5px] font-medium text-gray-80">Drop files to attach them to a job</div>
        <p className="mx-auto mt-1 max-w-[380px] text-[11.5px] leading-[1.5] text-gray-50">{projectKnowledge.note}</p>
      </div>
    </>
  )
}

/* ---------- Step 4: SOPs ---------- */

function SopRow({ p, filled }) {
  const tier = TIER(p.covered)
  const s = copy.setup
  return (
    <li className={`flex items-center gap-3 py-2 pl-9 pr-3 ${filled ? 'bb-msg-in' : ''}`}>
      <span className="w-5 shrink-0 text-right text-[11px] tabular-nums text-gray-40">{p.n}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12.5px] font-medium text-gray-90">{p.title}</span>
        <span className="block truncate text-[11px] leading-[1.4] text-gray-50">
          {filled ? (p.detail || `${SOP_QUESTIONS - p.covered} of ${SOP_QUESTIONS} questions still open`) : s.sopUndefined}
        </span>
      </span>
      {filled ? (
        <>
          <Pips covered={p.covered} barClass={tier.bar} />
          <span className={`w-11 shrink-0 rounded-sm px-1.5 py-0.5 text-center text-[10.5px] font-semibold tabular-nums ${tier.cls}`}>
            {p.covered}/{SOP_QUESTIONS}
          </span>
        </>
      ) : (
        <>
          <Pips covered={0} barClass="bg-gray-15" />
          <span className="w-11 shrink-0 rounded-sm bg-gray-10 px-1.5 py-0.5 text-center text-[10.5px] font-semibold tabular-nums text-gray-40">
            —/{SOP_QUESTIONS}
          </span>
        </>
      )}
    </li>
  )
}

function Chevron({ open }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 shrink-0 text-gray-40 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

// Collapsed by default. The seven lettered headers are the whole point of the
// first look — you see the shape before you see 28 rows of detail.
function SopGroup({ group: g, filled }) {
  const [open, setOpen] = useState(false)
  const covered = g.processes.reduce((n, p) => n + p.covered, 0)
  const of = g.processes.length * SOP_QUESTIONS
  const tier = TIER(Math.round((covered / of) * SOP_QUESTIONS))
  return (
    <section className="overflow-hidden rounded-md border border-gray-15 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-5"
      >
        <Chevron open={open} />
        <span className="w-3 shrink-0 text-[11.5px] font-semibold text-gray-40">{g.letter}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-90">{g.title}</span>
        <span className="shrink-0 text-[11px] text-gray-40">{g.processes.length} processes</span>
        {filled ? (
          <>
            <span className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-gray-10">
              <span className={`block h-full rounded-full ${tier.bar}`} style={{ width: `${(covered / of) * 100}%` }} />
            </span>
            <span className={`w-14 shrink-0 rounded-sm px-1.5 py-0.5 text-center text-[10.5px] font-semibold tabular-nums ${tier.cls}`}>{covered}/{of}</span>
          </>
        ) : (
          <>
            <span className="h-1.5 w-24 shrink-0 rounded-full bg-gray-10" />
            <span className="w-14 shrink-0 rounded-sm bg-gray-10 px-1.5 py-0.5 text-center text-[10.5px] font-semibold tabular-nums text-gray-40">—/{of}</span>
          </>
        )}
      </button>
      {open && (
        <ul className="divide-y divide-gray-10 border-t border-gray-10">
          {g.processes.map((p) => <SopRow key={p.id} p={p} filled={filled} />)}
        </ul>
      )}
    </section>
  )
}

function StepSops() {
  const knowledge = useStore(selectKnowledge)
  const dispatch = useDispatch()
  const [reading, setReading] = useState(false)
  const [stepIdx, setStepIdx] = useState(-1)
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const s = copy.setup
  const filled = knowledge.framework === 'filled'

  const upload = () => {
    setReading(true)
    sopUploadFile.readSteps.forEach((_, i) => timers.current.push(setTimeout(() => setStepIdx(i), 400 + i * 800)))
    timers.current.push(setTimeout(() => {
      dispatch({ type: A.SETUP_SOPS, payload: { status: 'filled', manual: sopUploadFile } })
      setReading(false); setStepIdx(-1)
    }, 400 + sopUploadFile.readSteps.length * 800 + 500))
  }

  const pct = Math.round((SOP_COVERED_TOTAL / SOP_POSSIBLE_TOTAL) * 100)

  return (
    <>
      <StepHeader title={setupSteps[3].title} note={filled ? s.sopFilledNote : s.sopNote} />

      {!filled && <p className="mb-3 text-[12.5px] leading-[1.6] text-gray-80">{s.sopIntro}</p>}

      {/* Coverage summary + upload */}
      <div className="mb-4 rounded-md border border-gray-15 bg-white px-3 py-2.5">
        <div className="flex items-center gap-3">
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold text-gray-90">
              {filled ? sopUploadFile.title : `${SOP_TOTAL} processes, ${SOP_POSSIBLE_TOTAL} questions`}
            </span>
            <span className="block text-[11.5px] text-gray-50">
              {filled
                ? `${sopUploadFile.file} · ${sopUploadFile.pages} pages · ${s.answered(SOP_COVERED_TOTAL, SOP_POSSIBLE_TOTAL)}`
                : s.answered(0, SOP_POSSIBLE_TOTAL)}
            </span>
          </span>
          {reading ? (
            <span className="flex items-center gap-2 text-[11.5px] text-gray-60"><span className="h-1.5 w-1.5 rounded-full bg-brand-blue bb-pulse" />{s.sopReading}</span>
          ) : !filled ? (
            <button onClick={upload} className="h-7 shrink-0 rounded-sm bg-navy-900 px-3 text-[12px] font-semibold text-white">{s.sopUpload}</button>
          ) : (
            <span className="shrink-0 rounded-sm bg-success-bg px-1.5 py-0.5 text-[10.5px] font-medium text-success-fg">Indexed</span>
          )}
        </div>
        {reading && (
          <ul className="mt-2 space-y-0.5 text-[11.5px] text-gray-60">
            {sopUploadFile.readSteps.map((t, i) => (
              <li key={t} className={`flex items-center gap-2 ${i > stepIdx ? 'opacity-30' : ''}`}>
                <span className={`w-3 text-center ${i < stepIdx ? 'text-success-fg' : ''}`}>{i < stepIdx ? '✓' : i === stepIdx ? '·' : ''}</span>{t}
              </li>
            ))}
          </ul>
        )}
        {filled && (
          <div className="mt-2.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-10">
              <div className="h-full rounded-full bg-success-fg" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-gray-50">
              <span>{s.legend}</span>
              <span className="tabular-nums">{pct}% {s.coverage.toLowerCase()}</span>
            </div>
          </div>
        )}
      </div>

      {/* The framework */}
      <div className="space-y-1.5">
        {sopGroups.map((g) => <SopGroup key={g.id} group={g} filled={filled} />)}
      </div>

      {/* Call to action — louder before the upload, still there after */}
      <div className={`mt-4 rounded-md border px-4 py-3 ${filled ? 'border-gray-15 bg-gray-5' : 'border-brand-blue/30 bg-info-bg'}`}>
        <div className="text-[12.5px] font-semibold text-gray-90">
          {filled ? `${SOP_POSSIBLE_TOTAL - SOP_COVERED_TOTAL} questions your manual never answers` : sopCallToAction.title}
        </div>
        <p className="mt-1 text-[12px] leading-[1.55] text-gray-70">{sopCallToAction.body}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="h-8 shrink-0 whitespace-nowrap rounded-sm bg-navy-900 px-3 text-[12.5px] font-semibold text-white">{sopCallToAction.primary}</button>
          <button className="h-8 shrink-0 whitespace-nowrap rounded-sm border border-gray-20 bg-white px-3 text-[12.5px] text-gray-80 hover:bg-gray-5">{sopCallToAction.secondary}</button>
        </div>
        <p className="mt-2 text-[11px] text-gray-50">{sopCallToAction.meta}</p>
      </div>
    </>
  )
}

/* ---------- Shell ---------- */

const STEP_BODY = [StepPrebuilt, StepBusiness, StepProject, StepSops]

export default function KnowledgeSetup() {
  const ui = useStore(selectUi)
  const dispatch = useDispatch()
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)
  if (ui.panel !== 'setup') return null
  const s = copy.setup
  const Body = STEP_BODY[step]
  const last = step === setupSteps.length - 1

  const close = () => { dispatch({ type: A.SET_UI, payload: { panel: null, panelContext: null } }); setFinished(false) }
  const finish = () => { dispatch({ type: A.SETUP_DONE }); setFinished(true) }

  return (
    <>
      <div className={`absolute inset-0 bg-navy-900/20 ${Z.liveScrim}`} onClick={close} />
      <aside className={`absolute top-0 right-0 bottom-0 flex w-[820px] flex-col border-l border-gray-15 bg-white shadow-sm ${Z.panel}`}>
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-15 px-4">
          <span className="text-[13px] font-semibold text-gray-90">{s.title}</span>
          <span className="text-[11.5px] text-gray-50">{company.name}</span>
          <button onClick={close} className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-gray-60 hover:bg-gray-5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {finished ? (
          <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-bg text-success-fg">✓</div>
            <div className="mt-3 text-[14px] font-semibold text-gray-90">{s.finishedTitle}</div>
            <p className="mt-1 max-w-[420px] text-[12.5px] leading-[1.55] text-gray-60">{s.finishedBody}</p>
            <button onClick={close} className="mt-4 h-8 rounded-sm bg-navy-900 px-4 text-[12.5px] font-semibold text-white">Done</button>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1">
              <StepRail step={step} setStep={setStep} />
              <div className="min-w-0 flex-1 overflow-y-auto p-5"><Body /></div>
            </div>
            <div className="flex h-14 shrink-0 items-center gap-2 border-t border-gray-15 px-4">
              <span className="text-[11.5px] text-gray-50">{s.step(step + 1, setupSteps.length)}</span>
              <button onClick={close} className="ml-auto h-8 rounded-sm px-3 text-[12.5px] text-gray-60 hover:bg-gray-5">{s.skip}</button>
              {step > 0 && (
                <button onClick={() => setStep((n) => n - 1)} className="h-8 rounded-sm border border-gray-20 px-3 text-[12.5px] text-gray-80 hover:bg-gray-5">{s.back}</button>
              )}
              <button
                onClick={() => (last ? finish() : setStep((n) => n + 1))}
                className="h-8 rounded-sm bg-navy-900 px-4 text-[12.5px] font-semibold text-white"
              >
                {last ? s.done : s.next}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
