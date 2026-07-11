interface ScaleInputProps {
  value: number
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void
  lowLabel: string
  highLabel: string
}

export function ScaleInput({ value, onChange, lowLabel, highLabel }: ScaleInputProps) {
  return (
    <div>
      <div className="scale-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`scale-dot${value === n ? ' active' : ''}`}
            onClick={() => onChange(n as 1 | 2 | 3 | 4 | 5)}
            aria-label={`${n} из 5`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="scale-labels">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}
