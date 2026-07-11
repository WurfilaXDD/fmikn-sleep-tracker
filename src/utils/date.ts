const WEEKDAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MONTH_LABELS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

export function todayKey(d = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseKey(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateHuman(date: string): string {
  const d = parseKey(date)
  return `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`
}

export function weekdayShort(date: string): string {
  return WEEKDAY_LABELS[parseKey(date).getDay()]
}

/** "СБ, 11 ИЮЛЯ" — used for the small date eyebrow above the survey/analysis heading. */
export function dateLabelUpper(date: string): string {
  return `${weekdayShort(date)}, ${formatDateHuman(date)}`.toUpperCase()
}

/** "Сб, 11 июля" — used for trends journal entries. */
export function dateLabelFull(date: string): string {
  return `${weekdayShort(date)}, ${formatDateHuman(date)}`
}

export function addDays(date: string, delta: number): string {
  const d = parseKey(date)
  d.setDate(d.getDate() + delta)
  return todayKey(d)
}

export function isToday(date: string): boolean {
  return date === todayKey()
}

export function greeting(now = new Date()): string {
  const hh = now.getHours()
  if (hh < 5) return 'Доброй ночи'
  if (hh < 12) return 'Доброе утро'
  if (hh < 18) return 'Добрый день'
  return 'Добрый вечер'
}
