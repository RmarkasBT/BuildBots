import { useEffect, useRef, useState } from 'react'

// Plays a declarative step script against a mounted site component.
// Finds each step's target by [data-target], moves the cursor to it,
// types text character by character, clicks, and swaps pages.
// Restarts whenever mockId/scriptId change (the pane shows a new target).
export default function useBrowserScript(containerRef, mock, script, { onStep } = {}) {
  const [state, setState] = useState(() => initial(script))
  const timers = useRef(new Set())

  useEffect(() => {
    setState(initial(script))
    const T = timers.current
    const clearAll = () => { T.forEach(clearTimeout); T.clear() }
    const after = (ms, fn) => { const t = setTimeout(() => { T.delete(t); fn() }, ms); T.add(t) }

    if (!script) return clearAll
    const steps = script.steps

    const rectFor = (target) => {
      const root = containerRef.current
      const el = root?.querySelector(`[data-target="${target}"]`)
      if (!el || !root) return null
      const r = el.getBoundingClientRect()
      const b = root.getBoundingClientRect()
      return { x: r.left - b.left + Math.min(r.width * 0.5, 120), y: r.top - b.top + r.height * 0.55 }
    }

    const run = (i) => {
      if (i >= steps.length) {
        setState((s) => ({ ...s, done: true, highlighted: null, caption: s.caption }))
        return
      }
      const st = steps[i]
      onStep?.(i)
      // One frame so a freshly navigated page has laid out before we measure.
      requestAnimationFrame(() => {
        const pos = st.target ? rectFor(st.target) : null
        setState((s) => ({
          ...s, stepIndex: i, caption: st.caption, highlighted: st.target ?? null,
          cursor: pos ? { x: pos.x, y: pos.y, visible: true, clicking: false } : s.cursor,
        }))
        const travel = 520
        if (st.action === 'type') {
          const text = st.text ?? ''
          const perChar = Math.max(28, Math.min(90, (st.duration - travel) / Math.max(text.length, 1)))
          let n = 0
          const tick = () => {
            n += 1
            setState((s) => ({ ...s, typed: { ...s.typed, [st.target]: text.slice(0, n) } }))
            if (n < text.length) after(perChar, tick)
            else after(260, () => finish(i, st))
          }
          after(travel, tick)
        } else if (st.action === 'click') {
          after(travel, () => {
            setState((s) => ({ ...s, cursor: { ...s.cursor, clicking: true } }))
            after(380, () => {
              setState((s) => ({ ...s, cursor: { ...s.cursor, clicking: false } }))
              finish(i, st)
            })
          })
        } else if (st.action === 'navigate') {
          after(200, () => finish(i, st))
        } else {
          after(Math.max(travel, st.duration), () => run(i + 1))
        }
      })
    }

    const finish = (i, st) => {
      if (st.page) {
        setState((s) => ({ ...s, loading: true }))
        after(450, () => {
          setState((s) => ({ ...s, loading: false, page: st.page, typed: {}, highlighted: null }))
          after(Math.max(0, st.duration - 450), () => run(i + 1))
        })
      } else {
        after(Math.max(0, st.duration - 500), () => run(i + 1))
      }
    }

    after(600, () => run(0))
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mock?.id, script])

  return state
}

function initial(script) {
  return {
    stepIndex: -1,
    page: script?.startPage ?? null,
    typed: {},
    highlighted: null,
    caption: '',
    loading: false,
    done: false,
    cursor: { x: 40, y: 40, visible: false, clicking: false },
  }
}
