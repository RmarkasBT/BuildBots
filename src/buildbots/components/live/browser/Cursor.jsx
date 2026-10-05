// Absolutely positioned cursor. Moves with a CSS transform transition; a
// click fires a short ripple ring. The single most persuasive thing in
// the prototype, so it is deliberate: eased, not instant, never bouncy.
export default function Cursor({ x, y, visible, clicking }) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-10 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
      style={{ transform: `translate(${x}px, ${y}px)`, opacity: visible ? 1 : 0, transitionProperty: 'transform, opacity' }}
    >
      {clicking && <span className="bb-click absolute -left-3 -top-3 h-6 w-6 rounded-full border-2 border-brand-blue" />}
      <svg viewBox="0 0 24 24" className="h-5 w-5 drop-shadow-[0_1px_1px_rgba(0,0,0,.4)]">
        <path d="M5 3l14 8-6 1.5L10 19z" fill="#111" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
