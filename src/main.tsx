import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles/global.css'
import './styles/components.css'
import { App } from './App'
import { EntriesProvider } from './hooks/useEntries'
import { ReminderProvider } from './hooks/useReminderSettings'
import { ThemeProvider } from './hooks/useTheme'
import { InstallPromptProvider } from './hooks/useInstallPrompt'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <InstallPromptProvider>
        <EntriesProvider>
          <ReminderProvider>
            <App />
          </ReminderProvider>
        </EntriesProvider>
      </InstallPromptProvider>
    </ThemeProvider>
  </StrictMode>,
)
