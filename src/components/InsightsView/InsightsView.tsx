import { useEntries } from '../../hooks/useEntries'
import { computeAggregateStats, windowEntries } from '../../insights/stats'
import { weekdayDativePlural } from '../../utils/date'
import { TrendChart } from './TrendChart'

function fmt(value: number | null, suffix = ''): string {
  return value === null ? '—' : `${value.toFixed(1)}${suffix}`
}

export function InsightsView() {
  const { entries, loading } = useEntries()

  if (!loading && entries.length === 0) {
    return (
      <>
        <div className="app-header">
          <h1>Инсайты</h1>
        </div>
        <div className="empty-state">
          Статистика появится, как только накопится несколько записей о сне.
        </div>
      </>
    )
  }

  const last7 = computeAggregateStats(windowEntries(entries, 7))
  const last30 = computeAggregateStats(windowEntries(entries, 30))

  return (
    <>
      <div className="app-header">
        <h1>Инсайты</h1>
        <p>Статистика по накопленным записям</p>
      </div>

      <div className="card">
        <div className="card-title">Тренд сна</div>
        <TrendChart entries={entries} />
      </div>

      <div className="card">
        <div className="card-title">Последние 7 дней</div>
        <div className="stat-grid">
          <div className="stat-tile">
            <div className="stat-tile-value">{fmt(last7.avgHours, ' ч')}</div>
            <div className="stat-tile-label">Среднее время сна</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-value">{fmt(last7.avgQuality, ' / 5')}</div>
            <div className="stat-tile-label">Качество сна</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-value">{fmt(last7.avgWellbeing, ' / 5')}</div>
            <div className="stat-tile-label">Самочувствие</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-value" style={{ fontSize: 15 }}>
              {last7.mostCommonDream?.label ?? '—'}
            </div>
            <div className="stat-tile-label">Частый тип сна</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Последние 30 дней</div>
        <div className="stat-grid">
          <div className="stat-tile">
            <div className="stat-tile-value">{fmt(last30.avgHours, ' ч')}</div>
            <div className="stat-tile-label">Среднее время сна</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-value">{last30.count}</div>
            <div className="stat-tile-label">Заполнено анкет</div>
          </div>
        </div>
      </div>

      {(last30.bestWeekday || last30.worstWeekday) && (
        <div className="card">
          <div className="card-title">По дням недели (30 дней)</div>
          {last30.bestWeekday && (
            <p style={{ marginBottom: 8, color: 'var(--text-muted)' }}>
              Лучше всего самочувствие обычно по{' '}
              <span style={{ color: 'var(--text)' }}>{weekdayDativePlural(last30.bestWeekday.label)}</span>.
            </p>
          )}
          {last30.worstWeekday && last30.worstWeekday.label !== last30.bestWeekday?.label && (
            <p style={{ color: 'var(--text-muted)' }}>
              Хуже всего — по {weekdayDativePlural(last30.worstWeekday.label)}.
            </p>
          )}
        </div>
      )}
    </>
  )
}
