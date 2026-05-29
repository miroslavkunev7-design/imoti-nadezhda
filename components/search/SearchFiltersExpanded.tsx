'use client'

import { PROPERTY_TYPES_BG, EXTRA_FILTERS_BG } from '@/lib/data/fallback'

const BATHROOMS = ['1', '2', '3', '4', '4+']

interface Props {
  detailedType: string
  setDetailedType: (v: string) => void
  bathrooms: string
  setBathrooms: (v: string | ((p: string) => string)) => void
  propType: string
  setPropType: (v: string | ((p: string) => string)) => void
  priceMax: number
  setPriceMax: (v: number) => void
  features: string[]
  toggleFeature: (key: string) => void
  priceMin: number
  priceMaxLimit: number
  formatPrice: (v: number) => string
  showTypeChips?: boolean
  areaMin?: number
  setAreaMin?: (v: number) => void
  areaMax?: number
  setAreaMax?: (v: number) => void
  priceMinVal?: number
  setPriceMinVal?: (v: number) => void
}

export default function SearchFiltersExpanded({
  detailedType,
  setDetailedType,
  bathrooms,
  setBathrooms,
  propType,
  setPropType,
  priceMax,
  setPriceMax,
  features,
  toggleFeature,
  priceMin,
  priceMaxLimit,
  formatPrice,
  showTypeChips,
  areaMin = 0,
  setAreaMin,
  areaMax = 0,
  setAreaMax,
  priceMinVal = priceMin,
  setPriceMinVal,
}: Props) {
  return (
    <div className="space-y-3">
      {showTypeChips && (
        <div>
          <label className="filter-label block mb-1.5">Тип имот</label>
          <div className="flex flex-wrap gap-1.5">
            {PROPERTY_TYPES_BG.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setPropType(prev => (prev === type ? '' : type))}
                className={`type-chip${propType === type ? ' active' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="filter-label">Подробен тип</label>
          <select value={detailedType} onChange={e => setDetailedType(e.target.value)} className="input-dark text-sm">
            <option value="">Въведете тип имот</option>
            <option value="ново строителство">Ново строителство</option>
            <option value="тухла">Тухла</option>
            <option value="панел">Панел</option>
            <option value="епк">ЕПК</option>
            <option value="монолит">Монолит</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="filter-label">Бани</label>
          <div className="flex gap-1">
            {BATHROOMS.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setBathrooms(prev => (prev === b ? '' : b))}
                className={`bath-btn${bathrooms === b ? ' active' : ''}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="filter-label">Цена</label>
          <span className="text-xs text-themed-primary font-medium">
            €{(priceMin / 1000).toFixed(0)}к — {formatPrice(priceMax)}
          </span>
        </div>
        <input
          type="range"
          min={priceMin}
          max={priceMaxLimit}
          step={10_000}
          value={priceMax}
          onChange={e => setPriceMax(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--gold) 0%, var(--gold) ${((priceMax - priceMin) / (priceMaxLimit - priceMin)) * 100}%, var(--border-subtle) ${((priceMax - priceMin) / (priceMaxLimit - priceMin)) * 100}%, var(--border-subtle) 100%)`,
          }}
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="filter-label whitespace-nowrap">Допълнителни филтри</span>
        {EXTRA_FILTERS_BG.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-1.5 cursor-pointer group">
            <span
              className={[
                'w-4 h-4 rounded flex items-center justify-center flex-shrink-0',
                features.includes(key) ? 'bg-crimson-700 border-crimson-700 border' : 'border border-themed group-hover:border-crimson-700',
              ].join(' ')}
              onClick={() => toggleFeature(key)}
            >
              {features.includes(key) && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </span>
            <span className="text-xs text-themed-secondary whitespace-nowrap">{label}</span>
          </label>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="filter-label">Площ от (м²)</label>
          <input type="number" placeholder="напр. 50" className="input-dark text-sm"
            value={areaMin || ''} onChange={e => setAreaMin?.(Number(e.target.value) || 0)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="filter-label">Площ до (м²)</label>
          <input type="number" placeholder="напр. 200" className="input-dark text-sm"
            value={areaMax || ''} onChange={e => setAreaMax?.(Number(e.target.value) || 0)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="filter-label">Спални</label>
          <div className="flex gap-1">
            {['1', '2', '3', '4+'].map(b => (
              <button key={b} type="button" className="bath-btn">{b}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
