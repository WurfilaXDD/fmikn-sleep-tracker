import { useEffect } from 'react'
import { BED_TIME, MORNING_TIME, type ReminderSettings } from '../types'

const SETTINGS_CACHE = 'sleep-tracker-settings'
const REMINDER_KEY = 'sleep-tracker-reminder'
const LOCAL_LAST_NOTIFIED_BED = 'sleep-tracker-last-notified-bed'
const LOCAL_LAST_NOTIFIED_MORNING = 'sleep-tracker-last-notified-morning'

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
 * Mirrors reminder settings into Cache Storage so the service worker can read
 * them during a (best-effort) periodicsync event, and tries to register
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
    if ((settings.bed || settings.morning) && reg.periodicSync) {
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

async function notify(title: string, body: string) {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, { body, icon: 'icons/icon-192.png', tag: 'daily-reminder' })
  } else {
    new Notification(title, { body })
  }
}

async function maybeNotifyBed(enabled: boolean) {
  if (!enabled) return
  if (getNotificationPermission() !== 'granted') return
  if (!isDue(BED_TIME)) return
  const today = new Date().toISOString().slice(0, 10)
  if (localStorage.getItem(LOCAL_LAST_NOTIFIED_BED) === today) return
  await notify('Пора спать', 'Уже поздно — самое время подготовиться ко сну.')
  localStorage.setItem(LOCAL_LAST_NOTIFIED_BED, today)
}

async function maybeNotifyMorning(enabled: boolean, hasTodayEntry: boolean) {
  if (!enabled || hasTodayEntry) return
  if (getNotificationPermission() !== 'granted') return
  if (!isDue(MORNING_TIME)) return
  const today = new Date().toISOString().slice(0, 10)
  if (localStorage.getItem(LOCAL_LAST_NOTIFIED_MORNING) === today) return
  await notify('Доброе утро', 'Расскажите, как прошла ваша ночь.')
  localStorage.setItem(LOCAL_LAST_NOTIFIED_MORNING, today)
}

/** Foreground-reliable reminder check: runs while the app is open, regardless of active tab. */
export function useReminderWatcher(settings: ReminderSettings | null, hasTodayEntry: boolean) {
  useEffect(() => {
    if (!settings) return
    const check = () => {
      maybeNotifyBed(settings.bed)
      maybeNotifyMorning(settings.morning, hasTodayEntry)
    }
    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [settings, hasTodayEntry])
}
