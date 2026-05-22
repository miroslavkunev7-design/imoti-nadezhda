'use client'

import LocationPin from '@/components/ui/LocationPin'
import Breadcrumb, { type BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { useTheme } from '@/components/providers/ThemeProvider'

interface InteriorHeroProps {
  title: string
  breadcrumbs: BreadcrumbItem[]
  bgImage?: string | null
  children: React.ReactNode  // left: SearchWidget, right: InfoCard
}

export default function InteriorHero({
  title,
  breadcrumbs,
  bgImage,
  children,
}: InteriorHeroProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <section
      className="relative transition-colors duration-500"
      style={{ paddingTop: 76 }}
    >
      {/* Background image */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      {/* Base overlay */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isLight
            ? 'rgba(245, 238, 225, 0.88)'
            : 'rgba(6,4,14,0.88)',
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-colors duration-500"
        style={{
          height: 120,
          background: isLight
            ? 'linear-gradient(to bottom, transparent, #f5f0e8)'
            : 'linear-gradient(to bottom, transparent, #080810)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-3">
          <Breadcrumb items={breadcrumbs} />
        </div>

        {/* City / Quarter title */}
        <div className="flex items-center gap-2 mb-6">
          <LocationPin size={22} />
          <h1 className="font-display text-city text-themed-primary">{title}</h1>
        </div>

        {/* Two-column: search (left) + info card (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
          {children}
        </div>
      </div>
    </section>
  )
}
