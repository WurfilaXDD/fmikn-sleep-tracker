import { useEffect, useState } from 'react'
import { useEntries } from '../../hooks/useEntries'
import { useTodayEntry } from '../../hooks/useTodayEntry'
import { composeInsight } from '../../insights/engine'
import { todayKey, weekdayFull } from '../../utils/date'
import type { DreamType, SleepEntry } from '../../types'
import { HoursSlider } from './HoursSlider'
import { ScaleInput } from '../ScaleInput'
import { DreamPicker } from './DreamPicker'
import { InsightCard } from './InsightCard'

export function TodayView() {
  const { saveEntry } = useEntries()
  const todayEntry = useTodayEntry()

  const [hoursSlept, setHoursSlept] = useState(7)
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [dream, setDream] = useState<DreamType>('none')
  const [wellbeing, setWellbeing] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState<SleepEntry | null>(null)

  useEffect(() => {
    if (todayEntry) {
      setHoursSlept(todayEntry.hoursSlept)
      setQuality(todayEntry.quality)
      setDream(todayEntry.dream)
      setWellbeing(todayEntry.wellbeing)
      setNote(todayEntry.note ?? '')
      setSaved(todayEntry)
    }
  }, [todayEntry])

  async function handleSave() {
    const entry = await saveEntry({
      date: todayKey(),
      hoursSlept,
      quality,
      dream,
      wellbeing,
      note: note.trim() || undefined,
    })
    setSaved(entry)
  }

  const today = todayKey()

  return (
    <>
      <div className="app-header">
        <h1>Сегодня</h1>
        <p style={{ textTransform: 'capitalize' }}>{weekdayFull(today)}</p>
      </div>

      {saved && <InsightCard text={composeInsight(saved)} />}

      <div className="card">
        <div className="card-title">Сколько вы спали?</div>
        <HoursSlider value={hoursSlept} onChange={setHoursSlept} />
      </div>

      <div className="card">
        <div className="card-title">Как хорошо вы спали?</div>
        <ScaleInput value={quality} onChange={setQuality} lowLabel="Плохо" highLabel="Отлично" />
      </div>

      <div className="card">
        <div className="card-title">Что снилось?</div>
        <DreamPicker value={dream} onChange={setDream} />
      </div>

      <div className="card">
        <div className="card-title">Как самочувствие сегодня?</div>
        <ScaleInput value={wellbeing} onChange={setWellbeing} lowLabel="Плохо" highLabel="Отлично" />
      </div>

      <div className="card">
        <div className="card-title">Заметка (необязательно)</div>
        <textarea
          className="text-input"
          rows={3}
          placeholder="Что-то ещё стоит запомнить об этой ночи?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" onClick={handleSave}>
        {saved ? 'Обновить запись' : 'Сохранить'}
      </button>
    </>
  )
}
