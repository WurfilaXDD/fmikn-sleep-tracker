import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import * as db from '../db/db'
import type { ExportPayload, SleepEntry } from '../types'

interface EntriesContextValue {
  entries: SleepEntry[]
  loading: boolean
  saveEntry: (entry: SleepEntry) => Promise<SleepEntry>
  clearAll: () => Promise<void>
  importEntries: (payload: ExportPayload) => Promise<number>
  refresh: () => Promise<void>
}

const EntriesContext = createContext<EntriesContextValue | null>(null)

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const all = await db.getAllEntries()
    setEntries(all)
  }, [])

  useEffect(() => {
    db.seedIfEmpty()
      .then(refresh)
      .finally(() => setLoading(false))
  }, [refresh])

  const saveEntry = useCallback(
    async (entry: SleepEntry) => {
      const saved = await db.upsertEntry(entry)
      await refresh()
      return saved
    },
    [refresh],
  )

  const clearAll = useCallback(async () => {
    await db.clearAllEntries()
    await refresh()
  }, [refresh])

  const importEntries = useCallback(
    async (payload: ExportPayload) => {
      const count = await db.importData(payload)
      await refresh()
      return count
    },
    [refresh],
  )

  return (
    <EntriesContext.Provider value={{ entries, loading, saveEntry, clearAll, importEntries, refresh }}>
      {children}
    </EntriesContext.Provider>
  )
}

export function useEntries() {
  const ctx = useContext(EntriesContext)
  if (!ctx) throw new Error('useEntries must be used within EntriesProvider')
  return ctx
}
