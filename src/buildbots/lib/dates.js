// Small date helpers for authored ISO dates (YYYY-MM-DD). No timezones.
const DAY = 86400000

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function toISO(date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(iso, n) {
  return toISO(new Date(parseISO(iso).getTime() + n * DAY))
}

export function isWeekend(iso) {
  const d = parseISO(iso).getUTCDay()
  return d === 0 || d === 6
}

// Next `count` working days starting at `startIso` (inclusive, Mon–Fri).
export function workingDays(startIso, count) {
  const out = []
  let cur = startIso
  while (out.length < count) {
    if (!isWeekend(cur)) out.push(cur)
    cur = addDays(cur, 1)
  }
  return out
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fmtShort(iso) {
  const d = parseISO(iso)
  return `${DOW[d.getUTCDay()]} ${MON[d.getUTCMonth()]} ${d.getUTCDate()}`
}

export function fmtDay(iso) {
  return String(parseISO(iso).getUTCDate())
}

export function fmtDow(iso) {
  return DOW[parseISO(iso).getUTCDay()]
}

export function fmtMonthDay(iso) {
  const d = parseISO(iso)
  return `${MON[d.getUTCMonth()]} ${d.getUTCDate()}`
}

export function fmtMoney(n) {
  if (n == null) return '—'
  return '$' + Math.round(n).toLocaleString('en-US')
}

export function fmtPct(x, digits = 1) {
  if (x == null) return '—'
  return (x * 100).toFixed(digits) + '%'
}
