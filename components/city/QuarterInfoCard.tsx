import type { Quarter } from '@/types'

interface QuarterInfoCardProps {
  quarter: Quarter
  cityImageUrl?: string | null
}

export default function QuarterInfoCard({ quarter, cityImageUrl }: QuarterInfoCardProps) {
  const photoUrl = quarter.image_url || cityImageUrl
  return (
    <div className="info-card luxury-info-card flex flex-col">
      {photoUrl && (
        <div className="relative overflow-hidden" style={{ height: 160 }}>
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${photoUrl})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(4,2,12,0.25) 0%, rgba(4,2,12,0.65) 100%)',
            }}
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display text-[1.1rem] font-semibold text-themed-primary mb-3">
          {quarter.name}
        </h3>

        {quarter.description && (
          <p className="text-sm text-themed-secondary leading-relaxed mb-4 flex-1">
            {quarter.description}
          </p>
        )}

        <div
          className="grid grid-cols-3 gap-2 pt-4 divider-themed"
        >
          <StatItem
            icon={<PeopleIcon />}
            label="Население"
            value={quarter.population ? `~${(quarter.population / 1000).toFixed(0)} 000 души` : '—'}
          />
          <StatItem
            icon={<AreaIcon />}
            label="Площ"
            value={quarter.area_km2 ? `${quarter.area_km2} км²` : '—'}
          />
          <StatItem
            icon={<HomeIcon />}
            label="Имоти"
            value={quarter.property_count ? `${quarter.property_count}` : '0'}
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
function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
