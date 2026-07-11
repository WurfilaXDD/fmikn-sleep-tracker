import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISSED_AT_KEY = 'sleep-tracker-install-dismissed-at'
const SNOOZE_DAYS = 7

function detectIOS(): boolean {
  const ua = window.navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return true
  // iPadOS 13+ reports as "Macintosh" but has touch support, unlike a real Mac.
  return window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1
}

function detectSafari(): boolean {
  return /^((?!chrome|android|crios|fxios|edg|opr).)*safari/i.test(window.navigator.userAgent)
}

function detectMac(): boolean {
  return /macintosh/i.test(window.navigator.userAgent)
}

function detectStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

function isSnoozed(): boolean {
  const raw = localStorage.getItem(DISMISSED_AT_KEY)
  if (!raw) return false
  const elapsedDays = (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24)
  return elapsedDays < SNOOZE_DAYS
}

export interface InstallHintStep {
  n: number
  text: string
}

interface InstallPromptContextValue {
  isIOS: boolean
  isStandalone: boolean
  canInstallAndroid: boolean
  shouldShowBanner: boolean
  promptInstall: () => Promise<void>
  dismiss: () => void
  showSheet: boolean
  openSheet: () => void
  closeSheet: () => void
  installOrOpenSheet: () => void
  hintLead: string
  hintSteps: InstallHintStep[]
}

const InstallPromptContext = createContext<InstallPromptContextValue | null>(null)

export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(detectStandalone)
  const [dismissed, setDismissed] = useState(isSnoozed)
  const [isIOS] = useState(detectIOS)
  const [isSafari] = useState(detectSafari)
  const [isMac] = useState(detectMac)
  const [showSheet, setShowSheet] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredEvent(event as BeforeInstallPromptEvent)
    }
    function handleAppInstalled() {
      setDeferredEvent(null)
      setIsStandalone(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    await deferredEvent.userChoice
    setDeferredEvent(null)
  }, [deferredEvent])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()))
    setDismissed(true)
  }, [])

  const openSheet = useCallback(() => setShowSheet(true), [])
  const closeSheet = useCallback(() => setShowSheet(false), [])

  const canInstallAndroid = deferredEvent !== null
  const shouldShowBanner = !isStandalone && (isIOS || canInstallAndroid) && !dismissed

  const installOrOpenSheet = useCallback(() => {
    if (canInstallAndroid) promptInstall()
    else openSheet()
  }, [canInstallAndroid, promptInstall, openSheet])

  let hintLead: string
  let hintSteps: string[]
  if (isIOS) {
    hintLead = 'Safari не устанавливает приложения сам — добавьте «Трекер сна» вручную:'
    hintSteps = [
      'Нажмите значок «Поделиться» в нижней панели Safari',
      'Пролистайте вниз и выберите «На экран „Домой“»',
      'Нажмите «Добавить» в правом верхнем углу',
    ]
  } else if (isSafari && isMac) {
    hintLead = 'В Safari на Mac приложение добавляется вручную:'
    hintSteps = ['Нажмите значок «Поделиться» в панели Safari', 'Выберите «Добавить в Dock»', '«Трекер сна» появится в Dock как приложение']
  } else {
    hintLead = 'Установите «Трекер сна» через меню браузера:'
    hintSteps = ['Откройте меню браузера в правом верхнем углу', 'Выберите «Установить приложение»', 'Подтвердите установку']
  }

  return (
    <InstallPromptContext.Provider
      value={{
        isIOS,
        isStandalone,
        canInstallAndroid,
        shouldShowBanner,
        promptInstall,
        dismiss,
        showSheet,
        openSheet,
        closeSheet,
        installOrOpenSheet,
        hintLead,
        hintSteps: hintSteps.map((text, i) => ({ n: i + 1, text })),
      }}
    >
      {children}
    </InstallPromptContext.Provider>
  )
}

export function useInstallPrompt() {
  const ctx = useContext(InstallPromptContext)
  if (!ctx) throw new Error('useInstallPrompt must be used within InstallPromptProvider')
  return ctx
}
