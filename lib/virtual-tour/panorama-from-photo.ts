import { synthesizeEquirectangular } from '@/lib/virtual-tour/panorama-synth'
import { uploadPanoramaBuffer } from '@/lib/virtual-tour/panorama-upload'

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    if (url.startsWith('/') && !url.startsWith('//')) {
      const { readFile } = await import('fs/promises')
      const { join } = await import('path')
      return await readFile(join(process.cwd(), 'public', url.replace(/^\//, '')))
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

/** Обикновена снимка → 2:1 панорама (Cloudinary URL). */
export async function convertPhotoToPanoramaUrl(imageUrl: string): Promise<string | null> {
  const input = await fetchImageBuffer(imageUrl)
  if (!input) return null
  const panoBuf = await synthesizeEquirectangular(input)
  const tag = `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return uploadPanoramaBuffer(panoBuf, tag)
}

export async function convertPhotosToPanoramaUrls(
  urls: string[],
  max = 24
): Promise<{ original: string; panorama: string }[]> {
  const out: { original: string; panorama: string }[] = []
  for (const url of urls.filter(Boolean).slice(0, max)) {
    const panorama = await convertPhotoToPanoramaUrl(url)
    if (panorama) out.push({ original: url, panorama })
  }
  return out
}
