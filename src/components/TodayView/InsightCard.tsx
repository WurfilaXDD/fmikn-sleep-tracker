export function InsightCard({ text }: { text: string }) {
  return (
    <div className="insight-card">
      <div className="insight-card-title">Что говорят ваши ответы</div>
      <p>{text}</p>
    </div>
  )
}
