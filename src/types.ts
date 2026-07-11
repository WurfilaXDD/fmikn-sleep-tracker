export type DreamType = 'none' | 'neutral' | 'pleasant' | 'vivid' | 'anxious' | 'nightmare'

export interface SleepEntry {
  /** YYYY-MM-DD, primary key — one entry per day */
  date: string
  hoursSlept: number
  quality: 1 | 2 | 3 | 4 | 5
  dream: DreamType
  wellbeing: 1 | 2 | 3 | 4 | 5
  note?: string
  createdAt: number
  updatedAt: number
}

export type NewSleepEntry = Omit<SleepEntry, 'createdAt' | 'updatedAt'>

export interface ReminderSettings {
  enabled: boolean
  /** "HH:MM" 24h local time */
  time: string
}

export interface ExportPayload {
  version: 1
  exportedAt: string
  entries: SleepEntry[]
}

export const DREAM_LABELS: Record<DreamType, string> = {
  none: 'Не снилось / не помню',
  neutral: 'Обычный сон',
  pleasant: 'Приятный сон',
  vivid: 'Яркий, необычный сон',
  anxious: 'Тревожный сон',
  nightmare: 'Кошмар',
}
