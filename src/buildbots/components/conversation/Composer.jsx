import { useState, useRef, useEffect } from 'react'
import { copy } from '../../data'
import { useStore, useRunner } from '../../store/useBuildbots'
import { selectConversation } from '../../store/selectors'

function IconMic({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  )
}
function IconClip({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5l-8.5 8.5a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8" />
    </svg>
  )
}
function IconSend({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

// Voice is a visual state with a scripted transcript: the waveform runs,
// the first suggested prompt types itself in word by word, then submits.
// No speech recognition anywhere.
function Listening({ text, onDone, onCancel }) {
  const [shown, setShown] = useState(0)
  const words = text.split(' ')
  useEffect(() => {
    let i = 0
    const timers = []
    timers.push(setTimeout(function tick() {
      i += 1
      setShown(i)
      if (i < words.length) timers.push(setTimeout(tick, 140 + Math.random() * 120))
      else timers.push(setTimeout(onDone, 650))
    }, 900))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])
  const bars = [0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.85, 0.55, 0.95, 0.65, 0.45, 0.8]
  return (
    <div className="flex h-12 items-center gap-3 rounded-md border border-brand-blue bg-info-bg/40 px-3">
      <span className="flex h-6 items-center gap-[3px]">
        {bars.map((h, i) => (
          <span key={i} className="bb-wave w-[3px] rounded-full bg-brand-blue" style={{ height: `${h * 100}%`, animationDelay: `${i * 70}ms`, animationDuration: `${700 + (i % 4) * 110}ms` }} />
        ))}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-info-fg">{copy.composer.listening}</span>
      <span className="min-w-0 flex-1 truncate text-[13.5px] text-gray-90">
        {words.slice(0, shown).join(' ')}
        {shown < words.length && <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-gray-70 align-middle" />}
      </span>
      <button onClick={onCancel} className="text-[11.5px] text-gray-50 hover:text-gray-90">{copy.composer.cancel}</button>
    </div>
  )
}

export default function Composer({ convId, crew = false }) {
  const conv = useStore(selectConversation(convId))
  const runner = useRunner()
  const [text, setText] = useState('')
  const [files, setFiles] = useState(false)
  const [listening, setListening] = useState(null) // { text, chip }
  const inputRef = useRef(null)
  const chips = conv?.chips ?? []
  const hidden = !!conv?.chipsHidden
  const voice = !!conv?.voice
  const chipsKey = chips.map((c) => c.label).join('|')

  // Hands-free: with the voice toggle on, each new set of prompts starts
  // listening on its own after a beat.
  useEffect(() => {
    if (!voice || !chips.length || hidden || listening) return
    const t = setTimeout(() => startListening(chips[0]), 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice, chipsKey, hidden])

  const send = (value, chip) => {
    const v = (value ?? text).trim()
    if (!v) return
    runner.resumeFromUser(convId, v, chip)
    setText('')
    inputRef.current?.focus()
  }

  const startListening = (chip) => {
    const c = chip ?? chips[0]
    if (!c) return
    setListening({ text: c.send ?? c.label, chip: c })
  }

  return (
    <div className="shrink-0 border-t border-gray-15 bg-white px-6 py-3">
      <div className="mx-auto max-w-[860px]">
        {chips.length > 0 && !hidden && !listening && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <button
                key={c.label}
                onClick={() => send(c.send ?? c.label, c)}
                className="bb-msg-in rounded-full border border-gray-25 bg-white px-3 py-1 text-[12.5px] text-gray-80 hover:border-brand-blue hover:text-brand-blue"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {listening ? (
          <Listening
            text={listening.text}
            onDone={() => { const l = listening; setListening(null); send(l.text, l.chip) }}
            onCancel={() => setListening(null)}
          />
        ) : (
          <div className="relative flex items-end gap-1.5 rounded-md border border-gray-20 bg-white px-2 py-1.5 focus-within:border-brand-blue">
            <button
              title={copy.composer.attach}
              onClick={() => setFiles((v) => !v)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-gray-50 hover:bg-gray-5 hover:text-gray-80"
            >
              <IconClip className="h-4 w-4" />
            </button>
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={crew ? copy.composer.placeholderCrew : copy.composer.placeholder}
              className="max-h-32 min-h-8 flex-1 resize-none bg-transparent px-1 py-1.5 text-[13.5px] text-gray-90 outline-none placeholder:text-gray-40"
            />
            <button
              title={copy.composer.mic}
              onClick={() => startListening()}
              disabled={!chips.length}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm hover:bg-gray-5 ${voice ? 'text-brand-blue' : 'text-gray-50 hover:text-gray-80'} disabled:opacity-40`}
            >
              <IconMic className="h-4 w-4" />
            </button>
            <button
              title={copy.composer.send}
              onClick={() => send()}
              disabled={!text.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-navy-900 text-white disabled:bg-gray-15 disabled:text-gray-40"
            >
              <IconSend className="h-4 w-4" />
            </button>

            {files && (
              <div className="absolute bottom-full left-0 mb-1 w-80 rounded-md border border-gray-15 bg-white p-1 shadow-sm">
                {copy.files.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFiles(false)
                      setText((t) => (t ? `${t} ` : '') + f)
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[12.5px] text-gray-80 hover:bg-gray-5"
                  >
                    <span className="h-4 w-3.5 shrink-0 rounded-[2px] border border-gray-30" />
                    <span className="truncate">{f}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
