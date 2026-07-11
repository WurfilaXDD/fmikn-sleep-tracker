import { useState } from 'react'
import { useEntries } from '../../hooks/useEntries'
import { formatDateHuman, weekdayShort } from '../../utils/date'
import { DREAM_LABELS } from '../../types'
import { DayDetail } from './DayDetail'

export function HistoryView() {
  const { entries, loading } = useEntries()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const selected = selectedDate ? entries.find((e) => e.date === selectedDate) : null
  if (selected) {
    return <DayDetail entry={selected} onBack={() => setSelectedDate(null)} />
  }

  return (
    <>
      <div className="app-header">
        <h1>История</h1>
        <p>{entries.length > 0 ? `Записей: ${entries.length}` : 'Пока пусто'}</p>
      </div>

      {!loading && entries.length === 0 && (
        <div className="empty-state">
          Здесь появятся ваши записи о сне, начиная с сегодняшней анкеты.
        </div>
      )}

      {entries.length > 0 && (
        <div className="card">
          {entries.map((e) => (
            <div key={e.date} className="history-item" onClick={() => setSelectedDate(e.date)}>
              <div>
                <div className="history-item-date">
                  {formatDateHuman(e.date)}, {weekdayShort(e.date)}
                </div>
                <div className="history-item-sub">{DREAM_LABELS[e.dream]}</div>
              </div>
              <div className="history-item-hours">{e.hoursSlept} ч</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
