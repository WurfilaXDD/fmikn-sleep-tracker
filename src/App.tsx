import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { TodayView } from './components/TodayView/TodayView'
import { HistoryView } from './components/HistoryView/HistoryView'
import { InsightsView } from './components/InsightsView/InsightsView'
import { SettingsView } from './components/SettingsView/SettingsView'
import { WelcomeScreen } from './components/Welcome/WelcomeScreen'
import { InstallBanner } from './components/InstallBanner'
import { useReminderSettings } from './hooks/useReminderSettings'
import { useReminderWatcher } from './notifications/reminders'
import { useTodayEntry } from './hooks/useTodayEntry'

const WELCOME_SEEN_KEY = 'sleep-tracker-welcome-seen'

export function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem(WELCOME_SEEN_KEY))
  const { settings } = useReminderSettings()
  const todayEntry = useTodayEntry()
  useReminderWatcher(settings, todayEntry !== null)

  function handleWelcomeClose() {
    localStorage.setItem(WELCOME_SEEN_KEY, '1')
    setShowWelcome(false)
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {showWelcome ? (
          <WelcomeScreen isFirstRun onClose={handleWelcomeClose} />
        ) : (
          <>
            <InstallBanner />
            {tab === 'today' && <TodayView />}
            {tab === 'history' && <HistoryView />}
            {tab === 'insights' && <InsightsView />}
            {tab === 'settings' && <SettingsView />}
          </>
        )}
      </main>
      {!showWelcome && <TabBar active={tab} onChange={setTab} />}
    </div>
  )
}
