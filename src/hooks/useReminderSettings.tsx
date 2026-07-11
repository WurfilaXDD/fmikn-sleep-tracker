import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import * as db from '../db/db'
import { syncReminderToServiceWorker } from '../notifications/reminders'
import type { ReminderSettings } from '../types'

interface ReminderContextValue {
  settings: ReminderSettings | null
  updateSettings: (settings: ReminderSettings) => Promise<void>
}

const ReminderContext = createContext<ReminderContextValue | null>(null)

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReminderSettings | null>(null)

  useEffect(() => {
    db.getReminderSettings().then(setSettings)
  }, [])

  const updateSettings = useCallback(async (next: ReminderSettings) => {
    await db.setReminderSettings(next)
    await syncReminderToServiceWorker(next)
    setSettings(next)
  }, [])

  return <ReminderContext.Provider value={{ settings, updateSettings }}>{children}</ReminderContext.Provider>
}

export function useReminderSettings() {
  const ctx = useContext(ReminderContext)
  if (!ctx) throw new Error('useReminderSettings must be used within ReminderProvider')
  return ctx
}
