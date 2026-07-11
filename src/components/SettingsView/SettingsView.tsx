import { useState } from 'react'
import { ReminderSettingsCard } from './ReminderSettings'
import { DataBackup } from './DataBackup'
import { ThemeToggle } from '../ThemeToggle'
import { WelcomeScreen } from '../Welcome/WelcomeScreen'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

export function SettingsView() {
  const [showAbout, setShowAbout] = useState(false)
  const { isIOS, isStandalone, canInstallAndroid, promptInstall } = useInstallPrompt()

  if (showAbout) {
    return <WelcomeScreen isFirstRun={false} onClose={() => setShowAbout(false)} />
  }

  return (
    <>
      <div className="app-header">
        <h1>Настройки</h1>
      </div>

      <div className="card">
        <div className="card-title">Тема оформления</div>
        <ThemeToggle />
      </div>

      {!isStandalone && (isIOS || canInstallAndroid) && (
        <div className="card">
          <div className="card-title">Установка на устройство</div>
          {isIOS ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 12 }}>
              Нажмите «Поделиться» в Safari и выберите «На экран «Домой»».
            </p>
          ) : (
            <button className="btn btn-primary" onClick={promptInstall}>
              Установить приложение
            </button>
          )}
        </div>
      )}

      <ReminderSettingsCard />
      <DataBackup />

      <div className="card">
        <div className="card-title">О приложении</div>
        <button className="btn btn-secondary" onClick={() => setShowAbout(true)}>
          Что умеет приложение
        </button>
      </div>
    </>
  )
}
