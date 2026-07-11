const STAR_COUNT = 42

const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
  const size = (Math.sin(i * 12.9) * 0.5 + 0.5) * 1.6 + 0.8
  const top = (Math.sin(i * 78.2) * 0.5 + 0.5) * 62
  const left = (Math.cos(i * 41.7) * 0.5 + 0.5) * 100
  const duration = 2.5 + (i % 5)
  const delay = (i % 7) * 0.4
  return { key: i, size, top, left, duration, delay }
})

/** Deterministic twinkling starfield + drifting blur blobs, sits behind all app content. */
export function AmbientBackground() {
  return (
    <div className="ambient-bg">
      <div className="ambient-blob ambient-blob-1" />
      <div className="ambient-blob ambient-blob-2" />
      {stars.map((s) => (
        <div
          key={s.key}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animation: `twk ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
