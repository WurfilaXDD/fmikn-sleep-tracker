import { useState } from 'react'
import type { SleepEntry } from '../../types'
import { addDays, formatDateHuman, todayKey, weekdayShort } from '../../utils/date'

const DAYS = 14
const CHART_HEIGHT = 140
const BAR_GAP = 4

export function TrendChart({ entries }: { entries: SleepEntry[] }) {
  const [activeDate, setActiveDate] = useState<string | null>(null)

  const byDate = new Map(entries.map((e) => [e.date, e]))
  const days = Array.from({ length: DAYS }, (_, i) => addDays(todayKey(), -(DAYS - 1 - i)))
  const maxHours = Math.max(12, ...days.map((d) => byDate.get(d)?.hoursSlept ?? 0))

  const barWidth = `calc((100% - ${(DAYS - 1) * BAR_GAP}px) / ${DAYS})`
  const active = activeDate ? byDate.get(activeDate) : null

  return (
    <div>
      <div style={{ minHeight: 20, marginBottom: 8, fontSize: 13, color: 'var(--text-muted)' }}>
        {active
          ? `${formatDateHuman(active.date)}: ${active.hoursSlept} ч сна`
          : 'Часы сна за последние 14 дней'}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: BAR_GAP, height: CHART_HEIGHT }}>
        {days.map((date) => {
          const entry = byDate.get(date)
          const hours = entry?.hoursSlept ?? 0
          const heightPx = entry ? Math.max(4, (hours / maxHours) * CHART_HEIGHT) : 2
          return (
            <button
              key={date}
              onClick={() => setActiveDate(date === activeDate ? null : date)}
              style={{
                width: barWidth,
                height: CHART_HEIGHT,
                background: 'none',
                border: 'none',
                padding: 0,
                display: 'flex',
                alignItems: 'flex-end',
                cursor: entry ? 'pointer' : 'default',
              }}
              disabled={!entry}
              aria-label={entry ? `${formatDateHuman(date)}: ${hours} ч` : `${formatDateHuman(date)}: нет данных`}
            >
              <div
                style={{
                  width: '100%',
                  height: heightPx,
                  borderRadius: '4px 4px 2px 2px',
                  background:
                    date === activeDate
                      ? 'var(--accent)'
                      : entry
                        ? 'var(--accent-strong)'
                        : 'var(--border)',
                  transition: 'background 0.15s ease',
                }}
              />
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: BAR_GAP, marginTop: 6 }}>
        {days.map((date) => (
          <div key={date} style={{ width: barWidth, textAlign: 'center', fontSize: 10, color: 'var(--text-muted)' }}>
            {weekdayShort(date)}
          </div>
        ))}
      </div>
    </div>
  )
}
