import { useState } from 'react'
import { useReminderSettings } from '../../hooks/useReminderSettings'
import { getNotificationPermission, requestNotificationPermission } from '../../notifications/reminders'
import type { ReminderSettings } from '../../types'

export function ReminderSettingsCard() {
  const { settings, updateSettings } = useReminderSettings()
  const [permission, setPermission] = useState(getNotificationPermission())

  if (!settings) return null
  const current: ReminderSettings = settings

  async function handleToggle(enabled: boolean) {
    if (enabled && permission !== 'granted') {
      const result = await requestNotificationPermission()
      setPermission(result)
      if (result !== 'granted') return
    }
    await updateSettings({ ...current, enabled })
  }

  function handleTimeChange(time: string) {
    updateSettings({ ...current, time })
  }

  return (
    <div className="card">
      <div className="card-title">Ежедневное напоминание</div>

      <div className="switch-row field-row">
        <span>Напоминать заполнить анкету</span>
        <input type="checkbox" checked={current.enabled} onChange={(e) => handleToggle(e.target.checked)} />
      </div>

      {current.enabled && (
        <div className="field-row" style={{ marginBottom: 0 }}>
          <label className="field-label" htmlFor="reminder-time">
            Время напоминания
          </label>
          <input
            id="reminder-time"
            type="time"
            className="time-input"
            value={current.time}
            onChange={(e) => handleTimeChange(e.target.value)}
          />
        </div>
      )}

      {permission === 'denied' && (
        <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>
          Уведомления заблокированы в браузере — разрешите их в настройках сайта, чтобы напоминания работали.
        </p>
      )}

      <p style={{ color: 'var(--text-muted)', fontSize: 12.5, marginTop: 12, lineHeight: 1.5 }}>
        На Android напоминания работают надёжно, если приложение установлено. На iPhone уведомления доступны
        только после установки приложения на экран «Домой» (iOS 16.4+) и могут срабатывать не всегда — это
        ограничение самой iOS, а не приложения.
      </p>
    </div>
  )
}
