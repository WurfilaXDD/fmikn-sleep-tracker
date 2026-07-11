import { colorForScore, fmtHours } from '../../analysis/score'
import { useEntries } from '../../hooks/useEntries'
import { QUALITY_LABELS, FACES } from '../../types'
import { dateLabelFull, weekdayShort } from '../../utils/date'

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

export function TrendsTab() {
  const { entries, loading } = useEntries()

  if (!loading && entries.length === 0) {
    return (
      <div style={{ padding: '8px 22px 40px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ margin: '6px 0 2px', fontSize: 28, fontWeight: 700, letterSpacing: '-.4px' }}>Тренды</h1>
        <div className="empty-state">Здесь появится статистика, когда накопится несколько ночей.</div>
      </div>
    )
  }

  const avgScore = entries.length ? Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length) : 0
  const avgHours = entries.length ? (entries.reduce((s, e) => s + e.hours, 0) / entries.length).toFixed(1).replace('.', ',') : '0'

  const bars = entries
    .slice(0, 7)
    .reverse()
    .map((e, i) => ({
      date: e.date,
      score: e.score,
      day: weekdayShort(e.date),
      h: `${Math.max(6, (e.score / 100) * 118)}px`,
      color: colorForScore(e.score),
      delay: `${i * 70}ms`,
    }))

  const log = entries.slice(0, 6).map((e) => {
    const color = colorForScore(e.score)
    return {
      date: e.date,
      score: e.score,
      dateFull: dateLabelFull(e.date),
      sub: `${fmtHours(e.hours)} · ${QUALITY_LABELS[e.quality].toLowerCase()}`,
      emoji: FACES[e.wellbeing - 1].emoji,
      chipBg: hexToRgba(color, 0.16),
      chipFg: color,
    }
  })

  return (
    <div style={{ padding: '8px 22px 40px', position: 'relative', zIndex: 1 }}>
      <div style={{ animation: 'fadeUp .5s both' }}>
        <h1 style={{ margin: '6px 0 2px', fontSize: 28, fontWeight: 700, letterSpacing: '-.4px' }}>Тренды</h1>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)' }}>Последние 7 ночей</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20, animation: 'fadeUp .5s .05s both' }}>
        <div className="trend-tile">
          <div className="trend-tile-label">Средний балл</div>
          <div className="trend-tile-value" style={{ color: 'var(--purple)' }}>
            {avgScore}
          </div>
        </div>
        <div className="trend-tile">
          <div className="trend-tile-label">Сон в среднем</div>
          <div className="trend-tile-value" style={{ color: 'var(--teal)' }}>
            {avgHours}
            <span style={{ fontSize: 16, color: 'var(--text-muted)' }}> ч</span>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: 12, padding: '22px 20px 18px', animation: 'fadeUp .5s .1s both' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 20 }}>Динамика балла</div>
        <div className="bar-chart">
          {bars.map((b) => (
            <div key={b.date} className="bar-col">
              <div className="bar-col-score">{b.score}</div>
              <div className="bar-col-bar" style={{ height: b.h, background: b.color, animationDelay: b.delay }} />
              <div className="bar-col-day">{b.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, animation: 'fadeUp .5s .15s both' }}>
        <div className="section-label">Журнал</div>
        {log.map((e) => (
          <div key={e.date} className="journal-item">
            <div className="journal-chip" style={{ background: e.chipBg, color: e.chipFg }}>
              {e.score}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="journal-date">{e.dateFull}</div>
              <div className="journal-sub">{e.sub}</div>
            </div>
            <div style={{ fontSize: 22 }}>{e.emoji}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
