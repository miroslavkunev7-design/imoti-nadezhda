import type { Property } from '@/types'

interface PropertyCharacteristicsProps {
  property: Property
}

export default function PropertyCharacteristics({ property }: PropertyCharacteristicsProps) {
  const items = [
    { label: 'Тип имот',        value: property.type },
    { label: 'Вид строителство',value: property.construction },
    { label: 'Година на строеж',value: property.year_built ? `${property.year_built} г.` : null },
    { label: 'Етаж',            value: property.floor ? `${property.floor} от ${property.total_floors ?? '?'}` : null },
    { label: 'Асансьор',        value: property.elevator ? 'Да' : 'Не' },
    { label: 'Отопление',       value: property.heating },
    { label: 'Състояние',       value: property.condition },
    { label: 'Обзаведен',       value: property.furnished ? 'Да' : 'Не' },
  ].filter(item => item.value)

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <h2 className="font-display text-[1.2rem] font-semibold text-themed-primary mb-4">
        Характеристики
      </h2>
      <div className="flex flex-col gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        {items.map((item, i) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: i % 2 === 0 ? 'var(--bg-elevated)' : 'transparent',
              borderBottom: i < items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div className="flex items-center gap-2">
              <svg className="text-crimson-700 flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm text-themed-secondary">{item.label}</span>
            </div>
            <span className="text-sm text-themed-primary font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
