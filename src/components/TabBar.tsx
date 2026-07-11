import { ChartIcon, GearIcon, HistoryIcon, MoonIcon } from './icons'

export type Tab = 'today' | 'history' | 'insights' | 'settings'

const TABS: { id: Tab; label: string; icon: () => React.JSX.Element }[] = [
  { id: 'today', label: 'Сегодня', icon: MoonIcon },
  { id: 'history', label: 'История', icon: HistoryIcon },
  { id: 'insights', label: 'Инсайты', icon: ChartIcon },
  { id: 'settings', label: 'Настройки', icon: GearIcon },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="tab-bar">
      <div className="tab-bar-inner">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tab-button${active === id ? ' active' : ''}`}
            onClick={() => onChange(id)}
            aria-current={active === id}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
