import { MoreTabIcon, TodayTabIcon, TrendsTabIcon } from './icons'

export type Tab = 'today' | 'trends' | 'more'

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Сон' },
  { id: 'trends', label: 'Тренды' },
  { id: 'more', label: 'Ещё' },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="tab-bar">
      {TABS.map(({ id, label }) => (
        <button key={id} className={`tab-button${active === id ? ' active' : ''}`} onClick={() => onChange(id)}>
          {id === 'today' && <TodayTabIcon active={active === 'today'} />}
          {id === 'trends' && <TrendsTabIcon />}
          {id === 'more' && <MoreTabIcon />}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
