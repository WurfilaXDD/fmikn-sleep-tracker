import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles/global.css'
import './styles/components.css'
import { App } from './App'
import { EntriesProvider } from './hooks/useEntries'
import { ReminderProvider } from './hooks/useReminderSettings'
import { InstallPromptProvider } from './hooks/useInstallPrompt'
import { ToastProvider } from './hooks/useToast'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <InstallPromptProvider>
        <EntriesProvider>
          <ReminderProvider>
            <App />
          </ReminderProvider>
        </EntriesProvider>
      </InstallPromptProvider>
    </ToastProvider>
  </StrictMode>,
)
