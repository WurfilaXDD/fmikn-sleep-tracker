import { useState } from 'react'
import { useEntries } from '../../hooks/useEntries'
import { computeAnalysis } from '../../analysis/score'
import { todayKey } from '../../utils/date'
import { InstallBanner } from '../InstallBanner'
import { SurveyForm, type Answers } from './SurveyForm'
import { AnalysisView } from './AnalysisView'

export function TodayTab() {
  const { entries, saveEntry } = useEntries()
  const [editing, setEditing] = useState(false)
  const today = todayKey()
  const todayEntry = entries.find((e) => e.date === today) ?? null

  async function handleSubmit(answers: Answers) {
    const { score } = computeAnalysis(answers)
    await saveEntry({ date: today, ...answers, score })
    setEditing(false)
  }

  return (
    <>
      <InstallBanner />
      {todayEntry && !editing ? (
        <AnalysisView entry={todayEntry} onEdit={() => setEditing(true)} />
      ) : (
        <SurveyForm initial={todayEntry} onSubmit={handleSubmit} />
      )}
    </>
  )
}
