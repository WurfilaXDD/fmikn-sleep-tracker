import { useRef, useState } from 'react'
import { useEntries } from '../../hooks/useEntries'
import { useReminderSettings } from '../../hooks/useReminderSettings'
import { useToast } from '../../hooks/useToast'
import { exportData } from '../../db/db'
import { getNotificationPermission, requestNotificationPermission } from '../../notifications/reminders'
import { BED_TIME, MORNING_TIME, type ExportPayload, type ReminderSettings } from '../../types'
import { todayKey } from '../../utils/date'

const WELCOME_SEEN_KEY = 'sleep-tracker-onboarding-seen'

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button className={`switch ${on ? 'on' : 'off'}`} onClick={onClick}>
      <span className="switch-knob" />
    </button>
  )
}

export function MoreTab() {
  const { entries, clearAll, importEntries } = useEntries()
  const { settings, updateSettings } = useReminderSettings()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  async function toggleReminder(key: keyof ReminderSettings) {
    if (!settings) return
    const next = { ...settings, [key]: !settings[key] }
    if (next[key] && getNotificationPermission() !== 'granted') {
      const result = await requestNotificationPermission()
      if (result !== 'granted') return
    }
    await updateSettings(next)
  }

  async function handleExport() {
    const payload = await exportData()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `son-data-${todayKey()}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1500)
    showToast(`Экспортировано записей: ${entries.length}`)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const payload = JSON.parse(text) as ExportPayload
      const count = await importEntries(payload)
      showToast(`Импортировано записей: ${count}`)
    } catch (err) {
      showToast(err instanceof Error && err.message ? err.message : 'Не удалось прочитать файл')
    }
  }

  async function handleReset() {
    await clearAll()
    localStorage.removeItem(WELCOME_SEEN_KEY)
    setConfirmReset(false)
    location.reload()
  }

  return (
    <div style={{ padding: '8px 22px 40px', position: 'relative', zIndex: 1 }}>
      <h1 style={{ margin: '6px 0 2px', fontSize: 28, fontWeight: 700, letterSpacing: '-.4px', animation: 'fadeUp .5s both' }}>Ещё</h1>

      <div style={{ marginTop: 20, animation: 'fadeUp .5s .05s both' }}>
        <div className="section-label">Напоминания</div>
        <div className="list-group">
          <div className="list-row">
            <div
              style={{
                flex: 'none',
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(142,147,247,.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#b9bcff,#7a7ff0)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Пора спать</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 1 }}>Каждый день в {BED_TIME}</div>
            </div>
            <Switch on={!!settings?.bed} onClick={() => toggleReminder('bed')} />
          </div>
          <div className="list-divider" style={{ marginLeft: 68 }} />
          <div className="list-row">
            <div
              style={{
                flex: 'none',
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(111,216,198,.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#9ff0e2,#6FD8C6)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Утренний опрос</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 1 }}>Каждый день в {MORNING_TIME}</div>
            </div>
            <Switch on={!!settings?.morning} onClick={() => toggleReminder('morning')} />
          </div>
        </div>
        {getNotificationPermission() === 'denied' && (
          <p style={{ margin: '10px 4px 0', fontSize: 12.5, color: 'var(--pink)', lineHeight: 1.5 }}>
            Уведомления заблокированы в браузере — разрешите их в настройках сайта, чтобы напоминания работали.
          </p>
        )}
        <p style={{ margin: '10px 4px 0', fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.5 }}>
          На iPhone напоминания доступны только после установки на экран «Домой» (iOS 16.4+) и могут срабатывать не
          всегда — это ограничение iOS, а не приложения.
        </p>
      </div>

      <div style={{ marginTop: 20, animation: 'fadeUp .5s .1s both' }}>
        <div className="section-label">Данные</div>
        <div className="list-group">
          <div className="list-row">
            <div style={{ flex: 1 }}>
              <span className="data-row-title">Только на устройстве</span>
              <span className="data-row-sub">Записи и анализ хранятся локально в этом браузере</span>
            </div>
            <div className="badge-on">ON</div>
          </div>
          <div className="list-divider" />
          <button
            className="list-row"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            onClick={handleExport}
            disabled={entries.length === 0}
          >
            <div style={{ flex: 1 }}>
              <span className="data-row-title">Экспорт в JSON</span>
              <span className="data-row-sub">Резервная копия всех записей</span>
            </div>
            <span className="data-row-icon" style={{ background: 'rgba(111,216,198,.14)', color: 'var(--teal)' }}>
              ↓
            </span>
          </button>
          <div className="list-divider" />
          <button
            className="list-row"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            onClick={handleImportClick}
          >
            <div style={{ flex: 1 }}>
              <span className="data-row-title">Импорт из JSON</span>
              <span className="data-row-sub">Загрузить записи из файла</span>
            </div>
            <span className="data-row-icon" style={{ background: 'rgba(142,147,247,.14)', color: 'var(--purple)' }}>
              ↑
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImportFile(file)
              e.target.value = ''
            }}
          />
          <div className="list-divider" />
          <button
            style={{
              width: '100%',
              textAlign: 'left',
              padding: 16,
              background: 'none',
              border: 'none',
              color: 'var(--pink)',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
            onClick={() => setConfirmReset(true)}
          >
            Сбросить все записи
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20, animation: 'fadeUp .5s .15s both' }}>
        <div className="section-label">О приложении</div>
        <div className="list-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <span style={{ fontSize: 15, color: 'var(--text-2)' }}>Версия</span>
            <span style={{ fontSize: 15, color: 'var(--text-faint)', fontVariantNumeric: 'tabular-nums' }}>1.0 · PWA</span>
          </div>
        </div>
      </div>

      {confirmReset && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2.5px solid var(--pink)' }} />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>Сбросить все записи?</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14.5, lineHeight: 1.5, color: 'var(--text-muted)' }}>
              Дневник сна и настройки будут удалены с этого устройства. Действие необратимо.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-danger" onClick={handleReset}>
                Сбросить
              </button>
              <button className="btn btn-secondary" onClick={() => setConfirmReset(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
