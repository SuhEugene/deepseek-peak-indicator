/**
 * DeepSeek off-peak logic.
 *
 * Official (api-docs.deepseek.com): peak hours are 01:00–04:00 and 06:00–10:00
 * UTC, Monday through Friday, excluding Chinese public holidays. All other
 * hours are off-peak, including weekends and holidays in full.
 *
 * China is UTC+8 with no DST, and both peak windows (+8 = 09:00–12:00 and
 * 14:00–18:00) fall on the same China calendar date as their UTC date — so the
 * UTC date can be matched directly against the China holiday list.
 */

// Rest-day ranges (mmdd, inclusive) per year.
// 2026: official — 国办发明电〔2025〕7号 (gov.cn, 2025-11-04).
// 2027: projected — the State Council notice is not published yet (due
// Nov 2026); statutory lunar dates plus the codified bridging pattern.
// shortcut: 2027 dates are estimates, update when the official notice lands.
export const HOLIDAYS: Record<number, Array<[number, number]>> = {
  2026: [
    [101, 103],
    [215, 223],
    [404, 406],
    [501, 505],
    [619, 621],
    [925, 927],
    [1001, 1007],
  ],
  2027: [
    [101, 101],
    [205, 214],
    [403, 405],
    [501, 505],
    [609, 609],
    [915, 915],
    [1001, 1007],
  ],
}

// UTC hours [start, end)
const PEAK_WINDOWS: Array<[number, number]> = [
  [1, 4],
  [6, 10],
]

const md = (d: Date) => (d.getUTCMonth() + 1) * 100 + d.getUTCDate()

export function isChinaHoliday(d: Date): boolean {
  const year = d.getUTCFullYear()
  const day = md(d)
  return (HOLIDAYS[year] ?? []).some(([a, b]) => day >= a && day <= b)
}

function peakWindows(d: Date): Array<[number, number]> {
  const wd = d.getUTCDay()
  if (wd === 0 || wd === 6 || isChinaHoliday(d)) return []
  return PEAK_WINDOWS
}

/** Milliseconds since that date's 00:00 UTC. */
function dayMs(d: Date): number {
  return d.getUTCHours() * 3_600_000 + d.getUTCMinutes() * 60_000 + d.getUTCSeconds() * 1000 + d.getUTCMilliseconds()
}

export type PeakStatus = { peak: boolean; ms: number }

/**
 * Current state and time until it flips: `ms` counts down to the end of the
 * current peak window, or up to the start of the next one.
 */
export function peakStatus(now: Date): PeakStatus {
  let day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const t = dayMs(now)

  for (const [start, end] of peakWindows(day)) {
    if (t >= start * 3_600_000 && t < end * 3_600_000) {
      return { peak: true, ms: end * 3_600_000 - t }
    }
  }

  // Off-peak: find the next window start, at most ~3 weeks out (longest gap:
  // a long Spring Festival break, ~12 days).
  for (let i = 0; i < 21; i++) {
    const windows = peakWindows(day)
    for (const [start] of windows) {
      const s = start * 3_600_000
      if (i > 0 || s > t) return { peak: false, ms: s - t + i * 86_400_000 }
    }
    day = new Date(day.getTime() + 86_400_000)
  }
  return { peak: false, ms: 0 }
}

/** "HHh MMm" (or "Xd Hh" over a day, "Mm" under an hour). */
export function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60_000)) + 1
  const d = Math.floor(total / 60 / 24)
  const h = Math.floor(total / 60) % 24
  const m = total % 60

  if (d > 0) return `${d}d ${h}h`

  if (h == 0) return `${m}m`

  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`
}
