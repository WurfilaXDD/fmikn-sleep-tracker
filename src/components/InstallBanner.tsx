import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { DownloadIcon, ShareIcon } from './icons'

export function InstallBanner() {
  const { isIOS, canInstallAndroid, shouldShowBanner, promptInstall, dismiss } = useInstallPrompt()

  if (!shouldShowBanner) return null

  return (
    <div className="card install-banner">
      <button className="install-banner-close" onClick={dismiss} aria-label="Закрыть">
        ×
      </button>
      <div className="install-banner-row">
        <div className="install-banner-icon">{isIOS ? <ShareIcon /> : <DownloadIcon />}</div>
        <div>
          <div className="card-title" style={{ marginBottom: 4 }}>
            Установите приложение
          </div>
          {isIOS ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
              Нажмите «Поделиться» в Safari и выберите «На экран «Домой»» — приложение появится как обычное, без
              браузерной строки.
            </p>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
              Добавьте Трекер сна на главный экран для быстрого доступа и работы офлайн.
            </p>
          )}
        </div>
      </div>
      <div className="install-banner-actions">
        {!isIOS && canInstallAndroid && (
          <button className="btn btn-primary" onClick={promptInstall}>
            Установить
          </button>
        )}
        <button className="btn btn-secondary" onClick={dismiss}>
          {isIOS ? 'Понятно' : 'Не сейчас'}
        </button>
      </div>
    </div>
  )
}
