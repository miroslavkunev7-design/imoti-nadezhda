import type { City } from '@/types'

interface CityInfoCardProps {
  city: City
}

export default function CityInfoCard({ city }: CityInfoCardProps) {
  return (
    <div className="info-card flex flex-col">
      {/* City photo */}
      {city.image_url && (
        <div className="relative overflow-hidden" style={{ height: 160 }}>
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${city.image_url})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(4,2,12,0.25) 0%, rgba(4,2,12,0.65) 100%)',
            }}
          />
        </div>
      )}

      {/* Info */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display text-[1.1rem] font-semibold text-themed-primary mb-3">
          За {city.name}
        </h3>

        {city.description && (
          <p className="text-sm text-themed-secondary leading-relaxed mb-4 flex-1">
            {city.description}
          </p>
        )}

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-2 pt-4 divider-themed"
        >
          <StatItem
            icon={<PeopleIcon />}
            label="Население"
            value={city.population ? `~${(city.population / 1000).toFixed(0)} 000 души` : '—'}
          />
          <StatItem
            icon={<AreaIcon />}
            label="Площ"
            value={city.area_km2 ? `${city.area_km2} км²` : '—'}
          />
          <StatItem
            icon={<RegionIcon />}
            label="Регион"
            value={city.region ?? '—'}
          />
        </div>
      </div>
    </div>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <span className="text-crimson-700">{icon}</span>
      <span className="text-[10px] text-themed-muted uppercase tracking-wider">{label}</span>
      <span className="text-xs text-themed-primary font-medium leading-tight">{value}</span>
    </div>
  )
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
function AreaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
  )
}
function RegionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
