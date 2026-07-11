import { useState } from 'react'
import type { SleepEntry } from '../../types'
import { DREAM_LABELS } from '../../types'
import { composeInsight } from '../../insights/engine'
import { formatDateHuman, weekdayFull } from '../../utils/date'
import { useEntries } from '../../hooks/useEntries'
import { InsightCard } from '../TodayView/InsightCard'

export function DayDetail({ entry, onBack }: { entry: SleepEntry; onBack: () => void }) {
  const { removeEntry } = useEntries()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    await removeEntry(entry.date)
    onBack()
  }

  return (
    <>
      <button className="btn btn-secondary" style={{ marginBottom: 14 }} onClick={onBack}>
        ← Назад к истории
      </button>

      <div className="app-header" style={{ padding: 0, marginBottom: 14 }}>
        <h1 style={{ textTransform: 'capitalize' }}>{weekdayFull(entry.date)}</h1>
        <p>{formatDateHuman(entry.date)}</p>
      </div>

      <InsightCard text={composeInsight(entry)} />

      <div className="stat-grid" style={{ marginBottom: 14 }}>
        <div className="stat-tile">
          <div className="stat-tile-value">{entry.hoursSlept} ч</div>
          <div className="stat-tile-label">Сон</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-value">{entry.quality} / 5</div>
          <div className="stat-tile-label">Качество сна</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-value">{entry.wellbeing} / 5</div>
          <div className="stat-tile-label">Самочувствие</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-value" style={{ fontSize: 15 }}>
            {DREAM_LABELS[entry.dream]}
          </div>
          <div className="stat-tile-label">Сны</div>
        </div>
      </div>

      {entry.note && (
        <div className="card">
          <div className="card-title">Заметка</div>
          <p style={{ color: 'var(--text-muted)' }}>{entry.note}</p>
        </div>
      )}

      {!confirming ? (
        <button className="btn btn-danger" onClick={() => setConfirming(true)}>
          Удалить запись
        </button>
      ) : (
        <div className="card">
          <p style={{ marginBottom: 12 }}>Удалить запись за этот день без возможности восстановления?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setConfirming(false)}>
              Отмена
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Удалить
            </button>
          </div>
        </div>
      )}
    </>
  )
}
