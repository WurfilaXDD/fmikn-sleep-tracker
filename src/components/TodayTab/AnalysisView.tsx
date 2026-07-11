import { ScoreRing } from '../ScoreRing'
import { computeAnalysis, colorForScore, verdictForScore, fmtHours } from '../../analysis/score'
import { DREAM_META, FACES, QUALITY_LABELS, type SleepEntry } from '../../types'
import { dateLabelUpper } from '../../utils/date'

export function AnalysisView({ entry, onEdit }: { entry: SleepEntry; onEdit: () => void }) {
  const analysis = computeAnalysis(entry)
  const recap = [
    { k: 'Время сна', v: fmtHours(entry.hours) },
    { k: 'Качество', v: QUALITY_LABELS[entry.quality] },
    { k: 'Сны', v: DREAM_META[entry.dream].label },
    { k: 'Самочувствие', v: FACES[entry.wellbeing - 1].label },
  ]

  return (
    <div style={{ padding: '8px 22px 40px', position: 'relative', zIndex: 1 }}>
      <div style={{ animation: 'fadeUp .5s both' }}>
        <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600, letterSpacing: '.4px' }}>{dateLabelUpper(entry.date)}</div>
        <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-.4px' }}>Анализ ночи</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20, animation: 'pop .6s both' }}>
        <ScoreRing score={analysis.score} size={176} />
      </div>
      <div
        style={{
          textAlign: 'center',
          marginTop: 8,
          fontSize: 17,
          fontWeight: 700,
          color: colorForScore(analysis.score),
          animation: 'fadeUp .5s .2s both',
        }}
      >
        {verdictForScore(analysis.score)}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16, animation: 'fadeUp .5s .25s both' }}>
        {analysis.tags.map((t) => (
          <span key={t.label} className={`tag-chip ${t.kind}`}>
            {t.label}
          </span>
        ))}
      </div>

      <div className="glass-card" style={{ marginTop: 22, animation: 'fadeUp .5s .3s both' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 700, letterSpacing: '-.3px' }}>{analysis.head}</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--text-2)' }}>{analysis.body}</p>
      </div>

      <div className="tip-card" style={{ marginTop: 14, animation: 'fadeUp .5s .35s both' }}>
        <div className="tip-icon">
          <div className="tip-dot" />
        </div>
        <div>
          <div className="tip-eyebrow">Совет на сегодня</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: '#d5dae3' }}>{analysis.tip}</p>
        </div>
      </div>

      <div className="recap-grid" style={{ marginTop: 14, animation: 'fadeUp .5s .4s both' }}>
        {recap.map((r) => (
          <div key={r.k} className="recap-tile">
            <div className="recap-tile-k">{r.k}</div>
            <div className="recap-tile-v">{r.v}</div>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={onEdit}>
        Изменить ответы
      </button>
    </div>
  )
}
