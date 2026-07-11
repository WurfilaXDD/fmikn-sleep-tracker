import { DREAM_LABELS, type DreamType } from '../../types'

const ORDER: DreamType[] = ['none', 'neutral', 'pleasant', 'vivid', 'anxious', 'nightmare']

export function DreamPicker({ value, onChange }: { value: DreamType; onChange: (value: DreamType) => void }) {
  return (
    <div className="chip-group">
      {ORDER.map((dream) => (
        <button
          key={dream}
          type="button"
          className={`chip${value === dream ? ' active' : ''}`}
          onClick={() => onChange(dream)}
        >
          {DREAM_LABELS[dream]}
        </button>
      ))}
    </div>
  )
}
