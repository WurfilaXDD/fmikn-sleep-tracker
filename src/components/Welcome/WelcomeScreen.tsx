import { ThemeToggle } from '../ThemeToggle'

const FEATURES = [
  'Каждый день — короткая анкета: сколько вы спали, насколько хорошо, что снилось и как самочувствие.',
  'Сразу после сохранения — локальный разбор ответов по заранее заданным правилам, без ИИ и без интернета.',
  'История и статистика по дням, неделям и месяцам прямо на устройстве.',
  'Все данные хранятся только у вас в браузере — нет аккаунта, нет сервера, нет отправки данных куда-либо.',
]

export function WelcomeScreen({ isFirstRun, onClose }: { isFirstRun: boolean; onClose: () => void }) {
  return (
    <>
      <div className="app-header" style={{ padding: 0, marginBottom: 14 }}>
        <h1>Добро пожаловать в Трекер сна</h1>
        <p>Простой дневник сна с мгновенным локальным анализом</p>
      </div>

      <div className="card">
        <div className="card-title">Что умеет приложение</div>
        <ul className="feature-list">
          {FEATURES.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="card-title">Тема оформления</div>
        <ThemeToggle />
      </div>

      <button className="btn btn-primary" onClick={onClose}>
        {isFirstRun ? 'Начать' : 'Закрыть'}
      </button>
    </>
  )
}
