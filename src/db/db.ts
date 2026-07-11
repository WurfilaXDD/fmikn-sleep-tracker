import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { ExportPayload, NewSleepEntry, ReminderSettings, SleepEntry } from '../types'

interface SleepDB extends DBSchema {
  entries: {
    key: string
    value: SleepEntry
  }
  settings: {
    key: string
    value: unknown
  }
}

const DB_NAME = 'sleep-tracker'
const DB_VERSION = 1
const REMINDER_KEY = 'reminder'

let dbPromise: Promise<IDBPDatabase<SleepDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SleepDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('entries')) {
          db.createObjectStore('entries', { keyPath: 'date' })
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
      },
    })
  }
  return dbPromise
}

export async function upsertEntry(input: NewSleepEntry): Promise<SleepEntry> {
  const db = await getDB()
  const existing = await db.get('entries', input.date)
  const now = Date.now()
  const entry: SleepEntry = {
    ...input,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await db.put('entries', entry)
  return entry
}

export async function getEntry(date: string): Promise<SleepEntry | undefined> {
  const db = await getDB()
  return db.get('entries', date)
}

export async function getAllEntries(): Promise<SleepEntry[]> {
  const db = await getDB()
  const all = await db.getAll('entries')
  return all.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function deleteEntry(date: string): Promise<void> {
  const db = await getDB()
  await db.delete('entries', date)
}

export async function clearAllEntries(): Promise<void> {
  const db = await getDB()
  await db.clear('entries')
}

export async function exportData(): Promise<ExportPayload> {
  const entries = await getAllEntries()
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
  }
}

export async function importData(payload: ExportPayload): Promise<number> {
  if (!payload || payload.version !== 1 || !Array.isArray(payload.entries)) {
    throw new Error('Неверный формат файла резервной копии')
  }
  const db = await getDB()
  const tx = db.transaction('entries', 'readwrite')
  for (const entry of payload.entries) {
    if (!isValidEntry(entry)) continue
    await tx.store.put(entry)
  }
  await tx.done
  return payload.entries.length
}

function isValidEntry(value: unknown): value is SleepEntry {
  if (!value || typeof value !== 'object') return false
  const e = value as Record<string, unknown>
  return (
    typeof e.date === 'string' &&
    typeof e.hoursSlept === 'number' &&
    typeof e.quality === 'number' &&
    typeof e.dream === 'string' &&
    typeof e.wellbeing === 'number'
  )
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  const db = await getDB()
  const value = await db.get('settings', REMINDER_KEY)
  return (value as ReminderSettings | undefined) ?? { enabled: false, time: '21:30' }
}

export async function setReminderSettings(settings: ReminderSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', settings, REMINDER_KEY)
}
