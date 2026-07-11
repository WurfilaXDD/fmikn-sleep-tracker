export type DreamType = 'none' | 'pleasant' | 'anxious' | 'vivid' | 'everyday' | 'lucid'

export interface SleepEntry {
  /** YYYY-MM-DD, primary key — one entry per day */
  date: string
  hours: number
  quality: 1 | 2 | 3 | 4 | 5
  dream: DreamType
  wellbeing: 1 | 2 | 3 | 4 | 5
  /** 0-100, computed by analysis/score.ts at save time */
  score: number
}

export interface ReminderSettings {
  bed: boolean
  morning: boolean
}

export const BED_TIME = '23:00'
export const MORNING_TIME = '08:00'

export interface ExportPayload {
  app: 'Трекер сна'
  format: 'sleep-diary'
  version: 1
  exportedAt: string
  entries: SleepEntry[]
  reminders?: ReminderSettings
}

export const DREAM_ORDER: DreamType[] = ['none', 'pleasant', 'anxious', 'vivid', 'everyday', 'lucid']

export const DREAM_META: Record<DreamType, { emoji: string; label: string }> = {
  none: { emoji: '🌙', label: 'Не помню' },
  pleasant: { emoji: '🌤️', label: 'Приятные' },
  anxious: { emoji: '🌧️', label: 'Тревожные' },
  vivid: { emoji: '🎬', label: 'Яркие, сюжетные' },
  everyday: { emoji: '🔁', label: 'Повседневные' },
  lucid: { emoji: '✨', label: 'Осознанные' },
}

export interface Face {
  v: 1 | 2 | 3 | 4 | 5
  emoji: string
  label: string
}

export const FACES: Face[] = [
  { v: 1, emoji: '😣', label: 'Совсем разбит' },
  { v: 2, emoji: '😕', label: 'Вяло' },
  { v: 3, emoji: '😐', label: 'Нормально' },
  { v: 4, emoji: '🙂', label: 'Бодро' },
  { v: 5, emoji: '😄', label: 'Отлично' },
]

export const QUALITY_LABELS = ['', 'Плохо', 'Так себе', 'Средне', 'Хорошо', 'Отлично'] as const
export const QUALITY_COLORS = ['', '#F58BA6', '#F4B472', '#E9D27A', '#9BD98C', '#6FD8C6'] as const
