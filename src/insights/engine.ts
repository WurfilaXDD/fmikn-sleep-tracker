import type { SleepEntry } from '../types'
import { bucketize } from './buckets'
import { ADVICE, DREAM_FRAGMENTS, HOURS_QUALITY } from './fragments'
import { NOTABLE_PATTERNS } from './notablePatterns'
import { hashString } from '../utils/date'

function pickVariant(list: string[], seed: number): string {
  return list[seed % list.length]
}

/**
 * Composes a rule-based insight for a single entry. Every (hours, quality,
 * dream, wellbeing) combination is covered: either by a hand-written
 * "notable pattern" or by stitching together independently-authored
 * fragments for each dimension, so nothing ever falls through unhandled.
 */
export function composeInsight(entry: SleepEntry): string {
  const buckets = bucketize(entry)

  const notable = NOTABLE_PATTERNS.find((p) => p.match(buckets))
  if (notable) return notable.text

  const seed = hashString(entry.date)

  const hoursQualityKey = `${buckets.hours}_${buckets.quality}` as keyof typeof HOURS_QUALITY
  const adviceKey = `${buckets.hours}_${buckets.wellbeing}` as keyof typeof ADVICE

  const opening = pickVariant(HOURS_QUALITY[hoursQualityKey], seed)
  const dream = pickVariant(DREAM_FRAGMENTS[buckets.dream], seed >> 2)
  const advice = pickVariant(ADVICE[adviceKey], seed >> 4)

  return `${opening} ${dream} ${advice}`
}
