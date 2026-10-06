import { useState, useEffect, useRef } from 'react'
import { Z } from '../../constants'
import { copy, company, buildertrendKnowledge, businessSources, derivedFromJobs, sopDocuments, prebuiltSources, sopGroups, SOP_QUESTIONS, SOP_TOTAL, SOP_POSSIBLE_TOTAL, SOP_COVERED_TOTAL } from '../../data'
import { useStore, useDispatch } from '../../store/useBuildbots'
import { selectUi, selectKnowledge, selectBots } from '../../store/selectors'
import { A } from '../../store/actions'

// Three knowledge layers in one panel. Opens from the top bar (company-wide,
// with upload) or from a bot's menu (same layers, framed for that bot).
// Business sources connect with a scripted crawl, then show what was learned
// as editable statements.

export function PanelShell({ title, subtitle, onClose, children, width = 560 }) {
  return (
    <>
      <div className={`absolute inset-0 ${Z.liveScrim}`} onClick={onClose} />
      <aside className={`absolute top-0 right-0 bottom-0 flex flex-col border-l border-gray-15 bg-white shadow-sm ${Z.panel}`} style={{ width }}>
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-15 px-4">
          <span className="text-[13px] font-semibold text-gray-90">{title}</span>
          {subtitle && <span className="truncate text-[11.5px] text-gray-50">{subtitle}</span>}
          <button onClick={onClose} className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-gray-60 hover:bg-gray-5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </>
  )
}

function Section({ title, note, action, children }) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-50">{title}</h3>
        <span className="flex items-center gap-3">
          {note && <span className="text-[11px] text-gray-40">{note}</span>}
          {action}
        </span>
      </div>
      {children}
    </section>
  )
}

function Learned({ sourceId, statements }) {
  const dispatch = useDispatch()
  const [editing, setEditing] = useState(null)
  const [text, setText] = useState('')
  const save = (i) => {
    if (text.trim()) dispatch({ type: A.KNOWLEDGE_EDIT_LEARNED, payload: { id: sourceId, index: i, text: text.trim() } })
    setEditing(null)
  }
  return (
    <ul className="mt-2 divide-y divide-gray-10 border-t border-gray-10">
      {statements.map((s, i) => (
        <li key={i} className="group flex items-start gap-2 py-1.5 text-[12.5px]">
          {editing === i ? (
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => save(i)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(i); if (e.key === 'Escape') setEditing(null) }}
              className="flex-1 rounded-sm border border-brand-blue px-1.5 py-0.5 text-[12.5px] outline-none"
            />
          ) : (
            <>
              <span className="flex-1 text-gray-80">{s}</span>
              <button
                onClick={() => { setEditing(i); setText(s) }}
                title={copy.knowledge.editStatement}
                className="shrink-0 text-[11px] text-gray-40 opacity-0 hover:text-brand-blue group-hover:opacity-100"
              >
                {copy.knowledge.edit}
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

function SourceCard({ source, state }) {
  const dispatch = useDispatch()
  const [step, setStep] = useState(-1)
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const connect = () => {
    dispatch({ type: A.KNOWLEDGE_SOURCE, payload: { id: source.id, status: 'crawling' } })
    source.crawlSteps.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStep(i), 500 + i * 700))
    })
    timers.current.push(setTimeout(() => {
      dispatch({ type: A.KNOWLEDGE_SOURCE, payload: { id: source.id, status: 'connected', learned: source.learned } })
      setStep(-1)
    }, 500 + source.crawlSteps.length * 700 + 400))
  }
  const status = state?.status ?? source.status
  return (
    <div className="rounded-md border border-gray-15 bg-white px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-semibold text-gray-90">{source.title}</span>
          <span className="block truncate text-[11px] text-gray-50">{source.detail}</span>
        </span>
        {status === 'connected' && <span className="rounded-sm bg-success-bg px-1.5 py-0.5 text-[10.5px] font-medium text-success-fg">{copy.knowledge.connected}</span>}
        {status === 'available' && (
          <button onClick={connect} className="h-7 rounded-sm border border-gray-20 px-2.5 text-[12px] text-gray-80 hover:bg-gray-5">
            {source.id === 'upload' ? copy.knowledge.upload : copy.knowledge.connect}
          </button>
        )}
        {status === 'crawling' && <span className="h-1.5 w-1.5 rounded-full bg-brand-blue bb-pulse" />}
      </div>
      {status === 'crawling' && (
        <ul className="mt-2 space-y-0.5 text-[11.5px] text-gray-60">
          {source.crawlSteps.map((s, i) => (
            <li key={s} className={`flex items-center gap-2 ${i > step ? 'opacity-30' : ''}`}>
              <span className={`w-3 text-center ${i < step ? 'text-success-fg' : ''}`}>{i < step ? '✓' : i === step ? '·' : ''}</span>{s}
            </li>
          ))}
        </ul>
      )}
      {status === 'connected' && state?.learned && <Learned sourceId={source.id} statements={state.learned} />}
    </div>
  )
}

const COVER_STYLE = (n) => (n >= 9 ? 'bg-success-bg text-success-fg' : n >= 6 ? 'bg-warning-bg text-warning-fg' : 'bg-danger-bg text-danger-fg')

const SOP_STYLE = { indexed: 'bg-success-bg text-success-fg', thin: 'bg-warning-bg text-warning-fg', missing: 'bg-danger-bg text-danger-fg', indexing: 'bg-info-bg text-info-fg' }

// Fake file picker for SOP uploads. Picking a file adds it as "Indexing",
// then flips to Indexed after a beat.
function UploadMenu({ onPick }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="h-6 rounded-sm bg-navy-900 px-2 text-[11.5px] font-semibold text-white">{copy.knowledge.upload}</button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-72 rounded-md border border-gray-15 bg-white p-1 shadow-sm">
          <div className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-gray-40">{copy.knowledge.pickFile}</div>
          {copy.uploadFiles.map((f) => (
            <button
              key={f.title}
              onClick={() => { setOpen(false); onPick(f) }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[12.5px] text-gray-80 hover:bg-gray-5"
            >
              <span className="h-4 w-3.5 shrink-0 rounded-[2px] border border-gray-30" />
              <span className="min-w-0 flex-1 truncate">{f.file}</span>
              <span className="shrink-0 text-[10.5px] text-gray-40">{f.size}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Chevron({ open }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 shrink-0 text-gray-40 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

// One lettered group. Collapsed by default — the seven headers are the map,
// the 28 processes underneath are detail you open when you want it.
function SopGroup({ group: g, filled }) {
  const [open, setOpen] = useState(false)
  const covered = g.processes.reduce((n, p) => n + p.covered, 0)
  const of = g.processes.length * SOP_QUESTIONS
  return (
    <section className="overflow-hidden rounded-md border border-gray-15 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-left hover:bg-gray-5"
      >
        <Chevron open={open} />
        <span className="w-3 shrink-0 text-[11px] font-semibold text-gray-40">{g.letter}</span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-gray-90">{g.title}</span>
        <span className="shrink-0 text-[10.5px] tabular-nums text-gray-40">{g.processes.length}</span>
        {filled ? (
          <span className={`w-12 shrink-0 rounded-sm px-1 py-0.5 text-center text-[10px] font-semibold tabular-nums ${COVER_STYLE(Math.round((covered / of) * SOP_QUESTIONS))}`}>
            {covered}/{of}
          </span>
        ) : (
          <span className="w-12 shrink-0 rounded-sm bg-gray-10 px-1 py-0.5 text-center text-[10px] font-semibold tabular-nums text-gray-40">—/{of}</span>
        )}
      </button>
      {open && (
        <ul className="divide-y divide-gray-10 border-t border-gray-10">
          {g.processes.map((p) => (
            <li key={p.id} className="flex items-center gap-2.5 py-1.5 pl-8 pr-2.5">
              <span className="w-4 shrink-0 text-right text-[10.5px] tabular-nums text-gray-40">{p.n}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium leading-[1.3] text-gray-90">{p.title}</span>
                <span className="block truncate text-[10.5px] leading-[1.4] text-gray-50">
                  {filled ? (p.detail || `${SOP_QUESTIONS - p.covered} of ${SOP_QUESTIONS} questions still open`) : copy.setup.sopUndefined}
                </span>
              </span>
              <span className={`w-10 shrink-0 rounded-sm px-1 py-0.5 text-center text-[10px] font-semibold tabular-nums ${filled ? COVER_STYLE(p.covered) : 'bg-gray-10 text-gray-40'}`}>
                {filled ? `${p.covered}/${SOP_QUESTIONS}` : `—/${SOP_QUESTIONS}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Compact view of the 28-process framework. Undefined until an SOP manual is
// read in setup — that empty state is deliberate, it shows what is missing.
function FrameworkSummary({ filled, onOpen }) {
  const s = copy.setup
  const pct = filled ? Math.round((SOP_COVERED_TOTAL / SOP_POSSIBLE_TOTAL) * 100) : 0
  return (
    <div className="mb-2 rounded-md border border-gray-15 bg-white px-3 py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[12.5px] font-semibold text-gray-90">{SOP_TOTAL} standard processes</span>
        <span className="text-[11px] text-gray-50">{filled ? s.answered(SOP_COVERED_TOTAL, SOP_POSSIBLE_TOTAL) : s.sopUndefined}</span>
        <button onClick={onOpen} className="ml-auto shrink-0 text-[11.5px] text-brand-blue hover:underline">{filled ? 'Review' : 'Define these'}</button>
      </div>
      <div className="mt-2 flex gap-1">
        {sopGroups.map((g) => {
          const covered = g.processes.reduce((n, p) => n + p.covered, 0)
          const of = g.processes.length * SOP_QUESTIONS
          return (
            <span key={g.id} className="min-w-0 flex-1" title={`${g.letter}. ${g.title}`}>
              <span className="block h-1.5 overflow-hidden rounded-full bg-gray-10">
                <span className="block h-full rounded-full bg-success-fg" style={{ width: filled ? `${(covered / of) * 100}%` : 0 }} />
              </span>
              <span className="mt-0.5 block truncate text-[10px] text-gray-40">{g.letter}</span>
            </span>
          )
        })}
      </div>
      {filled && <div className="mt-1 text-right text-[11px] tabular-nums text-gray-50">{pct}% answered</div>}
    </div>
  )
}

export default function KnowledgePanel() {
  const ui = useStore(selectUi)
  const knowledge = useStore(selectKnowledge)
  const bots = useStore(selectBots)
  const dispatch = useDispatch()
  const docs = useStore((s) => s.documents)
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  if (ui.panel !== 'knowledge') return null

  const global = !!ui.panelContext?.global
  const bot = global ? null : bots.byId[ui.activeConvId]
  const close = () => dispatch({ type: A.SET_UI, payload: { panel: null, panelContext: null } })
  const k = copy.knowledge
  const openSetup = () => dispatch({ type: A.SET_UI, payload: { panel: 'setup', panelContext: null } })
  const filled = knowledge.framework === 'filled'

  const upload = (f) => {
    const id = `upload-${f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    dispatch({ type: A.KNOWLEDGE_ADD_UPLOAD, payload: { upload: { id, title: f.title, file: f.file, pages: f.pages, status: 'indexing' } } })
    timers.current.push(setTimeout(() => {
      dispatch({ type: A.KNOWLEDGE_ADD_UPLOAD, payload: { upload: { id, status: 'indexed', updated: 'Today' } } })
    }, 2200))
  }

  // Documents the company has actually uploaded or written. The 28 processes
  // above are the framework; these are the source files behind them.
  const sopRows = [
    ...sopDocuments.map((d) => ({ ...d, status: knowledge.sops[d.id]?.status ?? d.status, live: docs[`sop-${d.id}`] })),
    ...(knowledge.uploads ?? []).map((u) => ({ ...u, gap: u.status === 'indexing' ? k.indexing : null })),
  ]

  return (
    <PanelShell
      title={k.title}
      subtitle={global ? `${company.name} · ${k.globalNote}` : `${bot?.name ?? ''} · ${k.sharedNote}`}
      onClose={close}
    >
      {!knowledge.setupDone && (
        <button
          onClick={openSetup}
          className="mb-4 flex w-full items-center gap-3 rounded-md border border-brand-blue/30 bg-info-bg px-3 py-2.5 text-left hover:border-brand-blue/60"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" /><path d="m3 12 9 4.5L21 12" /><path d="m3 16.5 9 4.5 9-4.5" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold text-gray-90">{copy.setup.open}</span>
            <span className="block text-[11.5px] text-gray-60">{copy.setup.subtitle}</span>
          </span>
          <span className="shrink-0 text-[11.5px] font-medium text-brand-blue">Start</span>
        </button>
      )}

      <Section title={k.bt} note={`${prebuiltSources.filter((p) => p.locked || knowledge.prebuilt?.[p.id]).length} sources on`}>
        <div className="flex items-center gap-3 rounded-md border border-gray-15 bg-gray-5 px-3 py-2.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-50" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" /><path d="m3 12 9 4.5L21 12" /><path d="m3 16.5 9 4.5 9-4.5" /></svg>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold text-gray-90">{buildertrendKnowledge.title}</span>
            <span className="block text-[11px] text-gray-50">{buildertrendKnowledge.blurb}</span>
          </span>
          <span className="shrink-0 text-[11.5px] tabular-nums text-gray-70">{buildertrendKnowledge.line}</span>
        </div>
        <ul className="mt-1.5 flex flex-wrap gap-1">
          {prebuiltSources.filter((p) => !p.locked && knowledge.prebuilt?.[p.id]).map((p) => (
            <li key={p.id} className="rounded-sm bg-gray-10 px-1.5 py-0.5 text-[10.5px] text-gray-60">{p.title}</li>
          ))}
        </ul>
      </Section>

      <Section title={k.business} note={k.businessNote}>
        <div className="space-y-2">
          <div className="rounded-md border border-gray-15 bg-white px-3 py-2.5">
            <div className="text-[12.5px] font-semibold text-gray-90">{derivedFromJobs.title}</div>
            <ul className="mt-1.5 space-y-1 text-[12.5px] text-gray-80">
              {derivedFromJobs.facts.map((f) => <li key={f} className="flex gap-2"><span className="text-gray-30">·</span>{f}</li>)}
            </ul>
          </div>
          {businessSources.map((s) => <SourceCard key={s.id} source={s} state={knowledge.sources[s.id]} />)}
        </div>
      </Section>

      <Section title={k.sop} note={k.sopNote} action={<UploadMenu onPick={upload} />}>
        <FrameworkSummary filled={filled} onOpen={openSetup} />
        <div className="space-y-1.5">
          {sopGroups.map((g) => <SopGroup key={g.id} group={g} filled={filled} />)}
        </div>

        {sopRows.length > 0 && (
          <>
            <h4 className="mt-3 mb-1 px-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-gray-50">{k.sources}</h4>
            <ul className="divide-y divide-gray-10 rounded-md border border-gray-15 bg-white">
              {sopRows.map((d) => (
                <li key={d.id} className={`flex items-center gap-3 px-3 py-2 text-[12.5px] ${d.status === 'indexing' ? 'bb-msg-in' : ''}`}>
                  <span className="h-5 w-4 shrink-0 rounded-[2px] border border-gray-30" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-gray-90">{d.title}</span>
                    <span className="block truncate text-[11px] text-gray-50">
                      {d.status === 'indexed'
                        ? (d.live ? d.live.written : d.file ? `${d.file} · ${d.pages} pages · ${d.updated}` : `${d.pages} pages · updated ${d.updated}`)
                        : d.gap}
                    </span>
                  </span>
                  {d.live && (
                    <button onClick={() => { dispatch({ type: A.LIVE_OPEN, payload: { mode: 'document', targetId: d.live.id, title: d.live.title } }); close() }} className="text-[11.5px] text-brand-blue hover:underline">{k.open}</button>
                  )}
                  {d.status === 'indexing' && <span className="h-1.5 w-1.5 rounded-full bg-brand-blue bb-pulse" />}
                  <span className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium capitalize ${SOP_STYLE[d.status]}`}>{d.status}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-2 px-1 text-[11px] text-gray-50">{k.sopHint}</p>
      </Section>
    </PanelShell>
  )
}
