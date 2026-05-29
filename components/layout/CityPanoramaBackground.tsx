import { getCityPanoramaAsset } from '@/lib/data/city-background'

interface Props {
  imageUrl: string
  slug?: string
}

export default function CityPanoramaBackground({ imageUrl, slug }: Props) {
  const asset = slug
    ? getCityPanoramaAsset(slug, imageUrl)
    : { jpg: imageUrl, position: 'center center' as const }

  const position = asset.position ?? 'center center'

  return (
    <>
      <div className="fixed inset-0 -z-20 bg-themed-base" aria-hidden />
      <picture className="city-panorama-picture" aria-hidden>
        {asset.webp && <source srcSet={asset.webp} type="image/webp" />}
        <img
          src={asset.jpg}
          alt=""
          className="city-panorama-img-el"
          style={{ objectPosition: position }}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="fixed inset-0 -z-10 city-panorama-vignette" aria-hidden />
      <div className="fixed inset-0 -z-10 city-panorama-shade" aria-hidden />
    </>
  )
}
