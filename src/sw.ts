/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)

const REMINDER_KEY = 'sleep-tracker-reminder'
const LAST_NOTIFIED_KEY = 'sleep-tracker-last-notified'

/**
 * Best-effort background reminder. Periodic Background Sync only fires on
 * installed PWAs in Chromium-based browsers (mainly Android) when the
 * browser's engagement heuristics allow it — there is no real background
 * delivery on iOS Safari without a push server, which this app intentionally
 * doesn't have (no backend). The reliable path stays the foreground check in
 * src/notifications/reminders.ts, run whenever the app is open.
 */
self.addEventListener('periodicsync', (event) => {
  const syncEvent = event as unknown as { tag: string; waitUntil: (p: Promise<unknown>) => void }
  if (syncEvent.tag !== 'daily-reminder') return
  syncEvent.waitUntil(checkReminder())
})

async function checkReminder() {
  const clientsList = await self.clients.matchAll({ type: 'window' })
  if (clientsList.length > 0) return // app is open, foreground check already covers this

  const cache = await caches.open('sleep-tracker-settings')
  const [reminderRes, lastNotifiedRes] = await Promise.all([
    cache.match(REMINDER_KEY),
    cache.match(LAST_NOTIFIED_KEY),
  ])
  if (!reminderRes) return

  const reminder = (await reminderRes.json()) as { enabled: boolean; time: string }
  if (!reminder.enabled) return

  const today = new Date().toISOString().slice(0, 10)
  const lastNotified = lastNotifiedRes ? await lastNotifiedRes.text() : ''
  if (lastNotified === today) return

  const now = new Date()
  const [h, m] = reminder.time.split(':').map(Number)
  const due = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
  if (!due) return

  await self.registration.showNotification('Трекер сна', {
    body: 'Не забудьте заполнить сегодняшнюю анкету о сне.',
    icon: 'icons/icon-192.png',
    tag: 'daily-reminder',
  })
  await cache.put(LAST_NOTIFIED_KEY, new Response(today))
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsList) => {
      if (clientsList.length > 0) {
        return clientsList[0].focus()
      }
      return self.clients.openWindow('.')
    }),
  )
})
