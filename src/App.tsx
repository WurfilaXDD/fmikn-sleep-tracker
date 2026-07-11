import { useMemo, useState } from 'react'
import { AmbientBackground } from './components/AmbientBackground'
import { TabBar, type Tab } from './components/TabBar'
import { TodayTab } from './components/TodayTab/TodayTab'
import { TrendsTab } from './components/TrendsTab/TrendsTab'
import { MoreTab } from './components/MoreTab/MoreTab'
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow'
import { InstallSheet } from './components/InstallSheet'
import { Toast } from './components/Toast'
import { useEntries } from './hooks/useEntries'
import { useReminderSettings } from './hooks/useReminderSettings'
import { useReminderWatcher } from './notifications/reminders'
import { todayKey } from './utils/date'

const ONBOARDING_SEEN_KEY = 'sleep-tracker-onboarding-seen'

export function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_SEEN_KEY))
  const { entries } = useEntries()
  const { settings } = useReminderSettings()

  const hasTodayEntry = useMemo(() => entries.some((e) => e.date === todayKey()), [entries])
  useReminderWatcher(settings, hasTodayEntry)

  function finishOnboarding() {
    localStorage.setItem(ONBOARDING_SEEN_KEY, '1')
    setShowOnboarding(false)
  }

  return (
    <div className="app-shell">
      <AmbientBackground />
      {showOnboarding ? (
        <OnboardingFlow onFinish={finishOnboarding} />
      ) : (
        <>
          <main className="app-main">
            {tab === 'today' && <TodayTab />}
            {tab === 'trends' && <TrendsTab />}
            {tab === 'more' && <MoreTab />}
          </main>
          <TabBar active={tab} onChange={setTab} />
        </>
      )}
      <InstallSheet />
      <Toast />
    </div>
  )
}
