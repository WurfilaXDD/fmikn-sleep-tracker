import { useInstallPrompt } from '../hooks/useInstallPrompt'

export function InstallBanner() {
  const { isStandalone, shouldShowBanner, canInstallAndroid, installOrOpenSheet, dismiss } = useInstallPrompt()

  if (isStandalone || !shouldShowBanner) return null

  return (
    <div className="install-banner" style={{ margin: '16px 22px 0', position: 'relative' }}>
      <button
        onClick={dismiss}
        aria-label="Закрыть"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,.08)',
          color: 'var(--text-muted)',
          fontSize: 15,
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        ×
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 24 }}>
        <div className="install-banner-icon">
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#0d1018' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>Установить «Трекер сна»</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Быстрый доступ с главного экрана и работа офлайн</div>
        </div>
      </div>
      <button className="btn btn-secondary" style={{ marginTop: 12, height: 42, background: '#EEF1F6', color: '#0d1018', border: 'none' }} onClick={installOrOpenSheet}>
        {canInstallAndroid ? 'Установить' : 'Как установить'}
      </button>
    </div>
  )
}
