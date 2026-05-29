import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/site'
import { FALLBACK_CITIES, getQuartersForCity } from '@/lib/data/fallback'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, '')
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/buy`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${base}/sell`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.88 },
    { url: `${base}/contacts`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
  ]

  const cityRoutes: MetadataRoute.Sitemap = FALLBACK_CITIES.flatMap(city => {
    const quarters = getQuartersForCity(city.slug)
    return [
      {
        url: `${base}/cities/${city.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.88,
      },
      ...quarters.map(q => ({
        url: `${base}/cities/${city.slug}/${q.slug}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.82,
      })),
    ]
  })

  let propertyRoutes: MetadataRoute.Sitemap = []
  try {
    const { getProperties } = await import('@/lib/queries/properties')
    const { data } = await getProperties({ page: '1' })
    propertyRoutes = data.map(p => ({
      url: `${base}/cities/${p.city_slug}/${p.quarter_slug}/property/${p.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    /* DB optional */
  }

  return [...staticRoutes, ...cityRoutes, ...propertyRoutes]
}
