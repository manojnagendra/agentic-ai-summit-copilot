import type { DayId } from './types.js'

/** Summit runs Aug 1–2, 2026 in America/Los_Angeles */
const SUMMIT = {
  saturday: '2026-08-01',
  sunday: '2026-08-02',
} as const

export function todayDayId(now = new Date()): DayId {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const key = fmt.format(now)
  if (key >= SUMMIT.sunday) return 'sunday'
  return 'saturday'
}

export function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function formatTime(hhmm: string): string {
  const [hRaw, m] = hhmm.split(':').map(Number)
  const suffix = hRaw >= 12 ? 'PM' : 'AM'
  const h = ((hRaw + 11) % 12) + 1
  return `${h}:${String(m).padStart(2, '0')} ${suffix}`
}

export function formatRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

export function nowMinutesPT(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now)
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const as = parseMinutes(aStart)
  const ae = parseMinutes(aEnd)
  const bs = parseMinutes(bStart)
  const be = parseMinutes(bEnd)
  return as < be && bs < ae
}

export function dayLabel(day: DayId): string {
  return day === 'saturday' ? 'Saturday, Aug 1' : 'Sunday, Aug 2'
}

export function hopNote(fromStage: string, toStage: string): string | undefined {
  if (fromStage === toStage) return undefined
  const zellerbach = new Set(['plenary', 'nexus'])
  const mlk = new Set(['atlas', 'compass'])
  if (zellerbach.has(fromStage) && zellerbach.has(toStage)) {
    return 'Quick hop inside Zellerbach Hall (~2 min)'
  }
  if (mlk.has(fromStage) && mlk.has(toStage)) {
    return 'Indoor hop Pauley West ↔ East (~2 min)'
  }
  if (
    (zellerbach.has(fromStage) && mlk.has(toStage)) ||
    (mlk.has(fromStage) && zellerbach.has(toStage))
  ) {
    return 'Cross Lower Sproul Plaza (~5 min) — leave a little early'
  }
  if (toStage === 'campus' || fromStage === 'campus') return 'Use Lower Sproul for food / sponsors'
  return 'Budget walking time between venues'
}
