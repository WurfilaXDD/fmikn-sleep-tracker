const WEEKDAY_LABELS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const WEEKDAY_LABELS_FULL = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
]
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

export function weekdayFull(date: string): string {
  return WEEKDAY_LABELS_FULL[parseKey(date).getDay()]
}

const DATIVE_PLURAL: Record<string, string> = {
  'воскресенье': 'воскресеньям',
  'понедельник': 'понедельникам',
  'вторник': 'вторникам',
  'среда': 'средам',
  'четверг': 'четвергам',
  'пятница': 'пятницам',
  'суббота': 'субботам',
}

/** "понедельник" -> "по понедельникам" style phrasing for weekday labels. */
export function weekdayDativePlural(weekdayNominative: string): string {
  return DATIVE_PLURAL[weekdayNominative] ?? weekdayNominative
}

export function addDays(date: string, delta: number): string {
  const d = parseKey(date)
  d.setDate(d.getDate() + delta)
  return todayKey(d)
}

export function isToday(date: string): boolean {
  return date === todayKey()
}

/** Small deterministic hash for a string, used to pick phrasing variants without flicker on re-render. */
export function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}
