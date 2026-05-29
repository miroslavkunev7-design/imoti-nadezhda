'use client'

import TerraceBackground from '@/components/layout/TerraceBackground'
import { getSelectedCityFromCookie } from '@/lib/client/selected-city'
import { useEffect, useState } from 'react'

interface Props {
  citySlug?: string
  children: React.ReactNode
}

export default function CollageListingLayout({ citySlug, children }: Props) {
  const [slug, setSlug] = useState(citySlug || 'shumen')

  useEffect(() => {
    if (citySlug) {
      setSlug(citySlug)
      return
    }
    const fromCookie = getSelectedCityFromCookie()
    if (fromCookie) setSlug(fromCookie)
  }, [citySlug])

  return (
    <div className="collage-listing-page">
      <div className="collage-listing-page__hero">
        <TerraceBackground citySlug={slug} />
      </div>
      <div className="collage-listing-page__body">{children}</div>
    </div>
  )
}
