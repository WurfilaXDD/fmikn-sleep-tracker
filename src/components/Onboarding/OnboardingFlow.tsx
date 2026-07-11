import { useState } from 'react'
import { ScoreRing } from '../ScoreRing'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

const SLIDE_COUNT = 4

export function OnboardingFlow({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const { canInstallAndroid, installOrOpenSheet } = useInstallPrompt()

  function next() {
    if (step < SLIDE_COUNT - 1) setStep(step + 1)
    else onFinish()
  }

  const isLast = step === SLIDE_COUNT - 1

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            transition: 'transform .55s cubic-bezier(.4,0,.2,1)',
            transform: `translateX(-${step * 100}%)`,
          }}
        >
          <div className="onboard-slide">
            <div className="onboard-orb-wrap">
              <div className="onboard-orb-ring-1" />
              <div className="onboard-orb-ring-2" />
              <div className="onboard-orb-core" />
              <div className="onboard-orb-shadow" />
            </div>
            <h1>
              Спокойный сон
              <br />
              начинается с внимания
            </h1>
            <p>Каждое утро — короткий опрос о вашей ночи. Одна минута, чтобы понять себя.</p>
          </div>

          <div className="onboard-slide">
            <div style={{ marginBottom: 44 }}>
              <ScoreRing score={82} size={180} animate={false} />
            </div>
            <h1>
              Понятная картина
              <br />
              вашего отдыха
            </h1>
            <p>Приложение считает балл сна и простым языком объясняет, что на него повлияло.</p>
          </div>

          <div className="onboard-slide">
            <div className="onboard-privacy-icon">
              <div style={{ width: 44, height: 52, borderRadius: 9, border: '2.5px solid #b9bcff', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 26,
                    height: 26,
                    border: '2.5px solid #b9bcff',
                    borderBottom: 'none',
                    borderRadius: '13px 13px 0 0',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#6FD8C6',
                  }}
                />
              </div>
            </div>
            <h1>
              Всё остаётся
              <br />
              на вашем устройстве
            </h1>
            <p>Анализ работает локально — без облака, аккаунтов и передачи данных.</p>
          </div>

          <div className="onboard-slide">
            <div className="onboard-install-icon">
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0d1018' }} />
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#6FD8C6',
                  color: '#06302a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: 1,
                  boxShadow: '0 6px 16px rgba(0,0,0,.5)',
                }}
              >
                +
              </div>
            </div>
            <h1>
              Добавьте на
              <br />
              главный экран
            </h1>
            <p>Запуск в одно касание и работа офлайн — как у обычного приложения, без магазина.</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 'none', padding: '0 30px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: SLIDE_COUNT }, (_, i) => (
            <span
              key={i}
              className="onboard-dot"
              style={{ width: i === step ? 22 : 7, background: i === step ? 'var(--purple)' : 'rgba(255,255,255,.2)' }}
            />
          ))}
        </div>
        <button className="btn btn-primary" onClick={isLast ? installOrOpenSheet : next}>
          {isLast ? (canInstallAndroid ? 'Установить' : 'Как установить') : 'Далее'}
        </button>
        <button className="btn-ghost" style={{ marginTop: -8 }} onClick={onFinish}>
          {isLast ? 'Продолжить' : 'Пропустить'}
        </button>
      </div>
    </div>
  )
}
