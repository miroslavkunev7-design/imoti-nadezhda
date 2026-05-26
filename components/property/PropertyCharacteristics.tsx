import type { Property } from '@/types'

interface PropertyCharacteristicsProps {
  property: Property
  compact?: boolean
  variant?: 'default' | 'detail'
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--pd-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function PropertyCharacteristics({
  property,
  compact = false,
  variant = 'default',
}: PropertyCharacteristicsProps) {
  const isDetail = variant === 'detail'

  const items = [
    { label: 'Тип имот',         value: property.type },
    { label: 'Вид строителство', value: property.construction },
    { label: 'Година на строеж', value: property.year_built ? `${property.year_built} г.` : null },
    { label: 'Етаж',             value: property.floor ? `${property.floor} от ${property.total_floors ?? '?'}` : null },
    { label: 'Асансьор',         value: property.elevator ? 'Да' : 'Не' },
    { label: 'Отопление',        value: property.heating },
    { label: 'Състояние',        value: property.condition },
    { label: 'Обзаведен',        value: property.furnished ? 'Да' : 'Не' },
  ].filter(item => item.value)

  if (isDetail) {
    return (
      <>
        <h2 className="pd-panel-title">Характеристики</h2>
        <div className="pd-panel-scroll">
          <div className="pd-chars-list">
            {items.map(item => (
              <div key={item.label} className="pd-char-row">
                <span className="pd-char-label">
                  <CheckIcon />
                  {item.label}
                </span>
                <span className="pd-char-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (compact) {
    return (
      <div className="rounded-xl h-full p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h2 className="font-display text-sm font-semibold mb-2">Характеристики</h2>
        {items.map(item => (
          <div key={item.label} className="flex justify-between text-[10px] py-1">
            <span className="text-themed-secondary">{item.label}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <h2 className="font-display text-[1.2rem] font-semibold text-themed-primary mb-4">Характеристики</h2>
      {items.map(item => (
        <div key={item.label} className="flex justify-between py-2 text-sm">
          <span className="text-themed-secondary">{item.label}</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
