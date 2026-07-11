import type { SleepEntry } from '../types'

export type HoursLevel = 'low' | 'belowNormal' | 'normal' | 'high'
export type ScaleLevel = 'poor' | 'fair' | 'good'

export function hoursLevel(hours: number): HoursLevel {
  if (hours < 6) return 'low'
  if (hours < 7) return 'belowNormal'
  if (hours <= 9) return 'normal'
  return 'high'
}

export function scaleLevel(value: number): ScaleLevel {
  if (value <= 2) return 'poor'
  if (value === 3) return 'fair'
  return 'good'
}

export interface EntryBuckets {
  hours: HoursLevel
  quality: ScaleLevel
  wellbeing: ScaleLevel
  dream: SleepEntry['dream']
}

export function bucketize(entry: Pick<SleepEntry, 'hoursSlept' | 'quality' | 'wellbeing' | 'dream'>): EntryBuckets {
  return {
    hours: hoursLevel(entry.hoursSlept),
    quality: scaleLevel(entry.quality),
    wellbeing: scaleLevel(entry.wellbeing),
    dream: entry.dream,
  }
}
