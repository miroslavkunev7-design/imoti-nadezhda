import { cardStyle, PageHeader } from '@/components/admin/AdminCard'

const SECTIONS = [
  {
    title: 'Профил',
    icon: '👤',
    items: ['Мой профил', 'Промяна на парола', 'Известия', 'Сигурност'],
  },
  {
    title: 'Система',
    icon: '⚙️',
    items: ['Основни настройки', 'Известия', 'Интеграции', 'Архив и бекъп'],
  },
  {
    title: 'Екип и права',
    icon: '👥',
    items: ['Потребители', 'Роли и права', 'Активност на потребителите'],
  },
  {
    title: 'Данни',
    icon: '📊',
    items: ['Импорт на данни', 'Експорт на данни', 'Почистване на данни'],
  },
]

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Настройки" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS.map(section => (
          <div key={section.title} className="rounded-xl p-5" style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{section.icon}</span>
              <h2 className="font-display text-white font-semibold text-sm">{section.title}</h2>
            </div>
            <div className="flex flex-col gap-1">
              {section.items.map(item => (
                <button key={item}
                  className="text-left text-sm text-[rgba(255,255,255,0.55)] hover:text-white hover:text-crimson-400 transition-colors py-2 px-2 rounded-lg hover:bg-[rgba(196,30,58,0.08)]">
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* About section */}
      <div className="mt-5 rounded-xl p-6" style={cardStyle}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-white font-semibold mb-1">Имоти Надежда — Admin v1.0</h2>
            <p className="text-[rgba(255,255,255,0.4)] text-sm">Модерен дизайн · Интуитивен интерфейс · Всички необходими инструменти</p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white">Системата работи нормално</span>
          </div>
        </div>
      </div>
    </div>
  )
}
