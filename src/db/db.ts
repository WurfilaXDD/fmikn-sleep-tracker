import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { ExportPayload, ReminderSettings, SleepEntry } from '../types'

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
const DB_VERSION = 2
const REMINDER_KEY = 'reminder'

let dbPromise: Promise<IDBPDatabase<SleepDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SleepDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // v1 -> v2 changed the entry shape (numeric score, new dream set) —
        // no other users yet, so we just start the store fresh rather than migrate.
        if (oldVersion > 0 && oldVersion < 2 && db.objectStoreNames.contains('entries')) {
          db.deleteObjectStore('entries')
        }
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

export async function upsertEntry(entry: SleepEntry): Promise<SleepEntry> {
  const db = await getDB()
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

export async function clearAllEntries(): Promise<void> {
  const db = await getDB()
  await db.clear('entries')
}

export async function exportData(): Promise<ExportPayload> {
  const entries = await getAllEntries()
  return {
    app: 'Трекер сна',
    format: 'sleep-diary',
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
  }
}

export async function importData(payload: { entries?: unknown }): Promise<number> {
  const entries = Array.isArray(payload?.entries) ? payload.entries.filter(isValidEntry) : []
  if (!entries.length) {
    throw new Error('В файле нет записей сна')
  }
  const db = await getDB()
  const tx = db.transaction('entries', 'readwrite')
  for (const entry of entries) {
    await tx.store.put(entry)
  }
  await tx.done
  return entries.length
}

function isValidEntry(value: unknown): value is SleepEntry {
  if (!value || typeof value !== 'object') return false
  const e = value as Record<string, unknown>
  return (
    typeof e.date === 'string' &&
    typeof e.hours === 'number' &&
    typeof e.quality === 'number' &&
    typeof e.dream === 'string' &&
    typeof e.wellbeing === 'number' &&
    typeof e.score === 'number'
  )
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  const db = await getDB()
  const value = await db.get('settings', REMINDER_KEY)
  return (value as ReminderSettings | undefined) ?? { bed: true, morning: true }
}

export async function setReminderSettings(settings: ReminderSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', settings, REMINDER_KEY)
}
