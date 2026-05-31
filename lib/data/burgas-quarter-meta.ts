import { quarterImageUrl } from '@/lib/data/quarter-images'
import { resolveMediaUrl } from '@/lib/upload-bridge'

/** Approximate map centers for Burgas quarters (OpenStreetMap embed). */
const BURGAS_MAP_CENTERS: Record<string, { lat: number; lng: number }> = {
  centar: { lat: 42.4978, lng: 27.4712 },
  lazur: { lat: 42.5045, lng: 27.4705 },
  'meden-rudnik': { lat: 42.448, lng: 27.455 },
  slaveykov: { lat: 42.512, lng: 27.448 },
  zornica: { lat: 42.518, lng: 27.462 },
  izgrev: { lat: 42.508, lng: 27.485 },
  vazrajdane: { lat: 42.495, lng: 27.465 },
  'bratya-miladinovi': { lat: 42.501, lng: 27.468 },
  sarafovo: { lat: 42.436, lng: 27.515 },
  horizont: { lat: 42.522, lng: 27.478 },
  kraimorie: { lat: 42.44, lng: 27.42 },
}

const DEFAULT_CENTER = { lat: 42.5, lng: 27.47 }

export function burgasQuarterHeroImage(
  quarterSlug: string,
  imageUrl?: string | null
): string {
  const resolved = imageUrl ? resolveMediaUrl(imageUrl) : null
  if (resolved) return resolved
  return (
    quarterImageUrl('burgas', quarterSlug) ??
    '/images/cities/burgas-city-hero-sunset.jpg'
  )
}

export function burgasQuarterMapEmbedUrl(quarterSlug: string): string {
  const c = BURGAS_MAP_CENTERS[quarterSlug] ?? DEFAULT_CENTER
  const pad = 0.025
  const bbox = [
    c.lng - pad,
    c.lat - pad,
    c.lng + pad,
    c.lat + pad,
  ]
    .map(n => n.toFixed(4))
    .join('%2C')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${c.lat}%2C${c.lng}`
}
