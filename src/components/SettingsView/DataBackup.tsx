import { useRef, useState } from 'react'
import { useEntries } from '../../hooks/useEntries'
import { exportData } from '../../db/db'
import type { ExportPayload } from '../../types'

export function DataBackup() {
  const { entries, clearAll, importEntries } = useEntries()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmingClear, setConfirmingClear] = useState(false)

  async function handleExport() {
    const payload = await exportData()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sleep-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const payload = JSON.parse(text) as ExportPayload
      const count = await importEntries(payload)
      setMessage(`Импортировано записей: ${count}.`)
    } catch (err) {
      setMessage(err instanceof Error ? `Ошибка импорта: ${err.message}` : 'Не удалось прочитать файл.')
    }
  }

  async function handleClear() {
    await clearAll()
    setConfirmingClear(false)
    setMessage('Все записи удалены.')
  }

  return (
    <div className="card">
      <div className="card-title">Резервная копия</div>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
        Все данные хранятся только на этом устройстве. Экспортируйте их перед переустановкой приложения или
        очисткой браузера, чтобы не потерять историю.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-secondary" onClick={handleExport} disabled={entries.length === 0}>
          Экспортировать данные ({entries.length})
        </button>

        <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
          Импортировать данные
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            e.target.value = ''
          }}
        />

        {!confirmingClear ? (
          <button className="btn btn-danger" onClick={() => setConfirmingClear(true)} disabled={entries.length === 0}>
            Удалить все данные
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setConfirmingClear(false)}>
              Отмена
            </button>
            <button className="btn btn-danger" onClick={handleClear}>
              Подтвердить удаление
            </button>
          </div>
        )}
      </div>

      {message && <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text)' }}>{message}</p>}
    </div>
  )
}
