'use client'

import { getCityPanoramaAsset } from '@/lib/data/city-background'

interface Props {
  citySlug: string
  cityCardImage?: string | null
  className?: string
}

export default function TerraceBackground({ citySlug, cityCardImage, className = '' }: Props) {
  const asset = getCityPanoramaAsset(citySlug, cityCardImage ?? null)

  return (
    <div
      className={`terrace-bg ${className}`.trim()}
      style={{ '--terrace-bg-url': `url(${asset.jpg})` } as React.CSSProperties}
      aria-hidden
    >
      <picture className="terrace-bg__picture">
        {asset.webp && <source srcSet={asset.webp} type="image/webp" />}
        <img
          src={asset.jpg}
          alt=""
          className="terrace-bg__img"
          style={{ objectPosition: asset.position ?? 'center 42%' }}
        />
      </picture>
      <div className="terrace-bg__shade" />
    </div>
  )
}
