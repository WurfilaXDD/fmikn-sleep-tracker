import { useRef, useState } from 'react'
import { DREAM_ORDER, DREAM_META, FACES, QUALITY_LABELS, QUALITY_COLORS, type DreamType, type SleepEntry } from '../../types'
import { dateLabelUpper, greeting, todayKey } from '../../utils/date'

export interface Answers {
  hours: number
  quality: 1 | 2 | 3 | 4 | 5
  dream: DreamType
  wellbeing: 1 | 2 | 3 | 4 | 5
}

export function SurveyForm({ initial, onSubmit }: { initial: SleepEntry | null; onSubmit: (a: Answers) => void }) {
  const [answers, setAnswers] = useState<Answers>(() =>
    initial
      ? { hours: initial.hours, quality: initial.quality, dream: initial.dream, wellbeing: initial.wellbeing }
      : { hours: 7.5, quality: 4, dream: 'none', wellbeing: 4 },
  )
  const [hoursDisplay, setHoursDisplay] = useState(answers.hours)
  const rafRef = useRef<number | undefined>(undefined)

  function animateHoursTo(target: number, from: number) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const start = performance.now()
    const dur = 320
    function tick(now: number) {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setHoursDisplay(from + (target - from) * eased)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
      else setHoursDisplay(target)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function setHours(h: number) {
    animateHoursTo(h, hoursDisplay)
    setAnswers((a) => ({ ...a, hours: h }))
  }

  const totalMin = Math.round(hoursDisplay * 60)
  const hoursHH = String(Math.floor(totalMin / 60))
  const hoursMM = String(totalMin % 60).padStart(2, '0')
  const hoursW = `${(hoursDisplay / 12) * 100}%`
  const today = todayKey()

  return (
    <div style={{ padding: '8px 22px 40px', position: 'relative', zIndex: 1 }}>
      <div style={{ animation: 'fadeUp .5s both' }}>
        <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600, letterSpacing: '.4px' }}>{dateLabelUpper(today)}</div>
        <h1 style={{ margin: '6px 0 4px', fontSize: 28, fontWeight: 700, letterSpacing: '-.4px' }}>{greeting()}</h1>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)' }}>Как прошла ваша ночь?</p>
      </div>

      <div className="glass-card" style={{ marginTop: 24, animation: 'fadeUp .5s .05s both' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)' }}>Сколько вы спали</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <button className="stepper-btn" onClick={() => setHours(Math.max(0, answers.hours - 0.5))}>
            −
          </button>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 44, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {hoursHH}
            </span>
            <span style={{ fontSize: 18, color: 'var(--text-muted)', margin: '0 3px' }}>ч</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 44, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {hoursMM}
            </span>
            <span style={{ fontSize: 18, color: 'var(--text-muted)', marginLeft: 3 }}>мин</span>
          </div>
          <button className="stepper-btn" onClick={() => setHours(Math.min(12, answers.hours + 0.5))}>
            +
          </button>
        </div>
        <div className="hours-track">
          <div className="hours-track-fill" style={{ width: hoursW }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-faint)' }}>
          <span>0</span>
          <span>6</span>
          <span>9</span>
          <span>12</span>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: 14, animation: 'fadeUp .5s .1s both' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)' }}>Как крепко спали</div>
        <div className="quality-row">
          {([1, 2, 3, 4, 5] as const).map((v) => (
            <button
              key={v}
              className={`quality-pill${answers.quality === v ? ' active' : ''}`}
              onClick={() => setAnswers((a) => ({ ...a, quality: v }))}
            >
              {v}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 14, fontWeight: 600, color: QUALITY_COLORS[answers.quality] }}>
          {QUALITY_LABELS[answers.quality]}
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: 14, animation: 'fadeUp .5s .15s both' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)' }}>Что снилось</div>
        <div className="dream-list">
          {DREAM_ORDER.map((key) => {
            const meta = DREAM_META[key]
            return (
              <button
                key={key}
                className={`dream-chip${answers.dream === key ? ' active' : ''}`}
                onClick={() => setAnswers((a) => ({ ...a, dream: key }))}
              >
                <span className="dream-chip-emoji">{meta.emoji}</span>
                <span className="dream-chip-label">{meta.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: 14, animation: 'fadeUp .5s .2s both' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)' }}>Как самочувствие</div>
        <div className="face-row">
          {FACES.map((f) => {
            const on = f.v === answers.wellbeing
            return (
              <button
                key={f.v}
                className="face-btn"
                style={{ transform: `scale(${on ? 1.14 : 1})` }}
                onClick={() => setAnswers((a) => ({ ...a, wellbeing: f.v }))}
              >
                <span
                  className="face-circle"
                  style={{
                    filter: on ? 'none' : 'grayscale(.7)',
                    opacity: on ? 1 : 0.5,
                    borderColor: on ? 'var(--purple)' : 'transparent',
                    background: on ? 'rgba(142,147,247,.15)' : 'transparent',
                  }}
                >
                  {f.emoji}
                </span>
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--purple)' }}>
          {FACES[answers.wellbeing - 1].label}
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ marginTop: 24, height: 58, borderRadius: 19, boxShadow: '0 14px 34px -12px rgba(142,147,247,.7)' }}
        onClick={() => onSubmit(answers)}
      >
        Проанализировать ночь
      </button>
    </div>
  )
}
