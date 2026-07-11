export function HoursSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <div className="hours-value">{value.toLocaleString('ru-RU')} ч</div>
      <input
        className="hours-slider"
        type="range"
        min={0}
        max={12}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="scale-labels">
        <span>0 ч</span>
        <span>12 ч</span>
      </div>
    </div>
  )
}
