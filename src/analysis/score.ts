import type { DreamType } from '../types'

export interface ScoreInput {
  hours: number
  quality: 1 | 2 | 3 | 4 | 5
  dream: DreamType
  wellbeing: 1 | 2 | 3 | 4 | 5
}

export type TagKind = 'g' | 'w'
export interface Tag {
  label: string
  kind: TagKind
}

export interface Analysis {
  score: number
  tags: Tag[]
  head: string
  body: string
  tip: string
}

const DREAM_MOD: Record<DreamType, number> = {
  none: 0,
  pleasant: 3,
  anxious: -8,
  vivid: -2,
  everyday: 0,
  lucid: 4,
}

export function fmtHours(h: number): string {
  const whole = Math.floor(h)
  const half = h - whole >= 0.5
  let s = whole + ' ч'
  if (half) s += ' 30 мин'
  return s
}

function hoursScore(hours: number): number {
  if (hours < 4) return 28
  if (hours < 5) return 44
  if (hours < 6) return 60
  if (hours < 6.5) return 76
  if (hours <= 9) return 100
  if (hours <= 10) return 80
  return 60
}

type Factor = 'short' | 'anxious' | 'fragmented' | 'lowrec' | 'long' | 'great' | 'ok'

const PARAGRAPHS: Record<Factor, (hl: string) => { h: string; b: string; t: string }> = {
  short: (hl) => ({
    h: 'Организму не хватило сна',
    b: `Вы спали около ${hl} — это меньше нормы для полного восстановления. Одна короткая ночь не страшна, но пара подряд бьёт по вниманию и настроению.`,
    t: 'Сегодня лягте на 30–45 минут раньше и уберите экраны за час до сна.',
  }),
  anxious: (hl) => ({
    h: 'Сон был неспокойным',
    b: `Тревожные сны при ${hl} сна часто говорят о накопленном стрессе или позднем плотном ужине.`,
    t: 'Перед сном попробуйте 4 минуты медленного дыхания: вдох на 4 счёта, выдох на 6.',
  }),
  fragmented: (hl) => ({
    h: 'Сон получился поверхностным',
    b: `Часов набралось достаточно (${hl}), но глубина просела. Обычно причина — духота, свет или кофеин во второй половине дня.`,
    t: 'Проветрите спальню и снизьте температуру до 18–19 °C.',
  }),
  lowrec: (hl) => ({
    h: 'Утро даётся тяжело',
    b: `Сон был приемлемым (${hl}), но самочувствие низкое. Иногда дело в фазе пробуждения или обезвоживании за ночь.`,
    t: 'Выпейте стакан воды и постойте 5 минут у окна на дневном свете.',
  }),
  long: (hl) => ({
    h: 'Сна было даже с избытком',
    b: `Вы проспали ${hl}. Длинный сон не всегда бодрит — часто это признак недосыпа в прошлые дни или сбитого ритма.`,
    t: 'Старайтесь вставать в одно и то же время, даже в выходные.',
  }),
  great: (hl) => ({
    h: 'Отличная ночь восстановления',
    b: `${hl} крепкого сна и бодрое утро — организм хорошо перезагрузился. Так держать.`,
    t: 'Сохраните ритм: тот же режим отхода ко сну работает на вас.',
  }),
  ok: (hl) => ({
    h: 'Ровная, спокойная ночь',
    b: `Показатели в норме: ${hl} сна без явных проблем. Есть куда расти по глубине отдыха.`,
    t: 'Небольшая прогулка вечером поможет засыпать быстрее.',
  }),
}

export function computeAnalysis(a: ScoreInput): Analysis {
  const { hours, quality, dream, wellbeing } = a
  const hScore = hoursScore(hours)
  const qScore = (quality / 5) * 100
  const wScore = (wellbeing / 5) * 100
  const dreamMod = DREAM_MOD[dream] || 0
  let score = Math.round(0.4 * hScore + 0.3 * qScore + 0.25 * wScore + dreamMod)
  score = Math.max(6, Math.min(100, score))

  const tags: Tag[] = []
  if (hours < 6) tags.push({ label: 'Недосып', kind: 'w' })
  else if (hours > 9.5) tags.push({ label: 'Пересып', kind: 'w' })
  else tags.push({ label: 'Норма по времени', kind: 'g' })

  if (quality >= 4) tags.push({ label: 'Крепкий сон', kind: 'g' })
  else if (quality <= 2) tags.push({ label: 'Прерывистый', kind: 'w' })

  if (dream === 'anxious') tags.push({ label: 'Тревожные сны', kind: 'w' })
  if (dream === 'lucid') tags.push({ label: 'Осознанный сон', kind: 'g' })

  if (wellbeing >= 4) tags.push({ label: 'Бодрое утро', kind: 'g' })
  else if (wellbeing <= 2) tags.push({ label: 'Тяжёлое утро', kind: 'w' })

  const hl = fmtHours(hours)
  let factor: Factor
  if (hours < 6) factor = 'short'
  else if (dream === 'anxious') factor = 'anxious'
  else if (quality <= 2) factor = 'fragmented'
  else if (wellbeing <= 2) factor = 'lowrec'
  else if (hours > 9.5) factor = 'long'
  else if (score >= 82) factor = 'great'
  else factor = 'ok'

  const p = PARAGRAPHS[factor](hl)
  return { score, tags, head: p.h, body: p.b, tip: p.t }
}

export function colorForScore(s: number): string {
  if (s >= 80) return '#6FD8C6'
  if (s >= 65) return '#8E93F7'
  if (s >= 45) return '#F4B472'
  return '#F58BA6'
}

export function verdictForScore(s: number): string {
  if (s >= 80) return 'Отличный сон'
  if (s >= 65) return 'Хороший сон'
  if (s >= 45) return 'Средний сон'
  return 'Мало восстановления'
}
