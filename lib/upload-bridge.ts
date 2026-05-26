/**
 * Media URL resolution for property images.
 * Cloudinary and absolute URLs pass through directly.
 */

const CLOUDINARY_BASE = 'https://res.cloudinary.com/djh3tkfuu'

export function getMediaBaseUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_MEDIA_URL ?? '').trim()
  if (explicit) return explicit.replace(/\/$/, '')
  return CLOUDINARY_BASE
}

/** Resolve image URL — absolute URLs pass through, local paths get site or Cloudinary base */
export function resolveMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/images/')) {
    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim().replace(/\/$/, '')
    return site ? `${site}${path}` : path
  }
  const base = getMediaBaseUrl()
  if (base && path.startsWith('/')) return `${base}${path}`
  return path
}
