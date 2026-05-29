import type { City } from '@/types'
import { getCityPanoramaAsset } from '@/lib/data/city-background'

interface Props { city: City }

export default function CityHeroBand({ city }: Props) {
  const asset = getCityPanoramaAsset(city.slug, city.image_url ?? null)
  return (
    <div className="rd-hero-band">
      <div
        className="terrace-bg"
        style={{ '--terrace-bg-url': `url(${asset.jpg})` } as React.CSSProperties}
      >
      <picture className="terrace-bg__picture">
        {asset.webp && <source srcSet={asset.webp} type="image/webp" />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.jpg}
          alt={city.name}
          className="terrace-bg__img"
          style={{ objectPosition: asset.position ?? 'center 42%' }}
        />
      </picture>
      </div>
      <div className="rd-hero-band__shade" />
      <h2 className="rd-hero-band__title">{city.name}</h2>
    </div>
  )
}
