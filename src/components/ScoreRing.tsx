import { useEffect, useRef, useState } from 'react'

interface ScoreRingProps {
  score: number
  size?: number
  animate?: boolean
}

/** Animated circular progress ring for the 0-100 sleep score, purple-to-teal gradient. */
export function ScoreRing({ score, size = 176, animate = true }: ScoreRingProps) {
  const [display, setDisplay] = useState(animate ? 0 : score)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!animate) {
      setDisplay(score)
      return
    }
    const start = performance.now()
    const duration = 1100
    function tick(now: number) {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(score * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // Intentionally re-run only when the target score (or animate flag) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, animate])

  const strokeWidth = Math.round(size * 0.08)
  const radius = size / 2 - strokeWidth / 2 - 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - display / 100)
  const gradientId = `score-ring-gradient-${size}`

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8E93F7" />
            <stop offset="1" stopColor="#6FD8C6" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="score-ring-value" style={{ fontSize: size * 0.3 }}>
          {display}
        </div>
        <div className="score-ring-label">балл сна</div>
      </div>
    </div>
  )
}
