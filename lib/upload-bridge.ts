/**
 * Media URL resolution for property images.
 * Cloudinary URLs (https://res.cloudinary.com/...) pass through directly.
 * Local /uploads/ paths are resolved with NEXT_PUBLIC_MEDIA_URL or site URL.
 */

export function getMediaBaseUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_MEDIA_URL ?? '').trim()
  if (explicit) return explicit.replace(/\/$/, '')
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim()
  if (siteUrl) return siteUrl.replace(/\/$/, '')
  return ''
}

/** Resolve image URL — absolute Cloudinary URLs pass through, local paths get base prefix */
export function resolveMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = getMediaBaseUrl()
  if (base && path.startsWith('/')) return `${base}${path}`
  return path
}
