import { useEffect } from 'react'
import type { ReminderSettings } from '../types'

const SETTINGS_CACHE = 'sleep-tracker-settings'
const REMINDER_KEY = 'sleep-tracker-reminder'
const LAST_NOTIFIED_KEY = 'sleep-tracker-last-notified'
const LOCAL_LAST_NOTIFIED = 'sleep-tracker-last-notified-local'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.requestPermission()
}

/**
 * Mirrors reminder settings into the Cache Storage so the service worker can
 * read them during a (best-effort) periodicsync event, and tries to register
 * periodic background sync where the browser supports it (mainly Android
 * Chrome on an installed PWA — most browsers, including iOS Safari, will
 * silently ignore this).
 */
export async function syncReminderToServiceWorker(settings: ReminderSettings): Promise<void> {
  if (!('caches' in window)) return
  const cache = await caches.open(SETTINGS_CACHE)
  await cache.put(REMINDER_KEY, new Response(JSON.stringify(settings)))

  if (!('serviceWorker' in navigator)) return
  try {
    const registration = await navigator.serviceWorker.ready
    const reg = registration as ServiceWorkerRegistration & {
      periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void> }
    }
    if (settings.enabled && reg.periodicSync) {
      await reg.periodicSync.register('daily-reminder', { minInterval: 12 * 60 * 60 * 1000 })
    }
  } catch {
    // Periodic Background Sync isn't supported/allowed here — the foreground
    // watcher below remains the reliable path.
  }
}

function isDue(time: string): boolean {
  const [h, m] = time.split(':').map(Number)
  const now = new Date()
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
}

async function maybeNotify(settings: ReminderSettings, hasTodayEntry: boolean) {
  if (!settings.enabled || hasTodayEntry) return
  if (getNotificationPermission() !== 'granted') return
  if (!isDue(settings.time)) return

  const today = new Date().toISOString().slice(0, 10)
  if (localStorage.getItem(LOCAL_LAST_NOTIFIED) === today) return

  const body = 'Не забудьте заполнить сегодняшнюю анкету о сне.'
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification('Трекер сна', { body, icon: 'icons/icon-192.png', tag: 'daily-reminder' })
  } else {
    new Notification('Трекер сна', { body })
  }
  localStorage.setItem(LOCAL_LAST_NOTIFIED, today)
  if ('caches' in window) {
    const cache = await caches.open(SETTINGS_CACHE)
    await cache.put(LAST_NOTIFIED_KEY, new Response(today))
  }
}

/** Foreground-reliable reminder check: runs while the app is open, regardless of active tab. */
export function useReminderWatcher(settings: ReminderSettings | null, hasTodayEntry: boolean) {
  useEffect(() => {
    if (!settings) return
    maybeNotify(settings, hasTodayEntry)
    const interval = setInterval(() => maybeNotify(settings, hasTodayEntry), 60_000)
    return () => clearInterval(interval)
  }, [settings, hasTodayEntry])
}
