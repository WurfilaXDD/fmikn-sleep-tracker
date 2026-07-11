import { useTheme } from '../hooks/useTheme'
import { MoonIcon, SunIcon } from './icons'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button type="button" className="btn btn-secondary" onClick={toggleTheme}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
    </button>
  )
}
