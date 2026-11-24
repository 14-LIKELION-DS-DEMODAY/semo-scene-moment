import type { Moment } from '../types/moment'

// 예: 2026-10-29 + 12:00 → "2026.10.29 12:00"
export const formatMomentDateTime = (m: Moment) => `${m.date.replace(/-/g, '.')} ${m.time}`

// 예: "26.10.29 12:00"
export const formatMomentDateTimeShort = (m: Moment) => `${formatMomentDateTime(m).slice(2)}`
