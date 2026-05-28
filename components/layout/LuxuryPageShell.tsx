'use client'

export default function LuxuryPageShell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`lux-page-bg relative ${className}`}>
      <div className="relative z-[1] lux-main-offset">{children}</div>
    </div>
  )
}
