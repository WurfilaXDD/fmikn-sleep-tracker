import type { DreamType, SleepEntry } from '../types'
import { DREAM_LABELS } from '../types'
import { addDays, todayKey, weekdayFull } from '../utils/date'

export interface AggregateStats {
  count: number
  avgHours: number | null
  avgQuality: number | null
  avgWellbeing: number | null
  mostCommonDream: { dream: DreamType; label: string; count: number } | null
  bestWeekday: { label: string; avgWellbeing: number } | null
  worstWeekday: { label: string; avgWellbeing: number } | null
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

/** Entries from the last `days` days (including today), most recent first. */
export function windowEntries(entries: SleepEntry[], days: number): SleepEntry[] {
  const cutoff = addDays(todayKey(), -(days - 1))
  return entries.filter((e) => e.date >= cutoff)
}

export function computeAggregateStats(entries: SleepEntry[]): AggregateStats {
  const count = entries.length
  const avgHours = average(entries.map((e) => e.hoursSlept))
  const avgQuality = average(entries.map((e) => e.quality))
  const avgWellbeing = average(entries.map((e) => e.wellbeing))

  const dreamCounts = new Map<DreamType, number>()
  for (const e of entries) {
    dreamCounts.set(e.dream, (dreamCounts.get(e.dream) ?? 0) + 1)
  }
  let mostCommonDream: AggregateStats['mostCommonDream'] = null
  for (const [dream, dreamCount] of dreamCounts) {
    if (!mostCommonDream || dreamCount > mostCommonDream.count) {
      mostCommonDream = { dream, label: DREAM_LABELS[dream], count: dreamCount }
    }
  }

  const byWeekday = new Map<string, number[]>()
  for (const e of entries) {
    const label = weekdayFull(e.date)
    const list = byWeekday.get(label) ?? []
    list.push(e.wellbeing)
    byWeekday.set(label, list)
  }
  let bestWeekday: AggregateStats['bestWeekday'] = null
  let worstWeekday: AggregateStats['worstWeekday'] = null
  for (const [label, values] of byWeekday) {
    if (values.length < 2) continue // avoid noisy single-sample conclusions
    const avg = average(values)!
    if (!bestWeekday || avg > bestWeekday.avgWellbeing) bestWeekday = { label, avgWellbeing: avg }
    if (!worstWeekday || avg < worstWeekday.avgWellbeing) worstWeekday = { label, avgWellbeing: avg }
  }

  return { count, avgHours, avgQuality, avgWellbeing, mostCommonDream, bestWeekday, worstWeekday }
}
