/** Синтетични 2:1 кадри — не са истинска 360°; на сфера дават „вихър“. */
export function isSyntheticPanoramaUrl(url: string): boolean {
  if (!url) return false
  if (url.startsWith('data:image')) return true
  return /virtual-tours\/panoramas/i.test(url)
}

export function shouldRenderPanoramaSphere(imageUrl: string, aspectRatio?: number): boolean {
  if (!aspectRatio || aspectRatio < 1.92 || aspectRatio > 2.12) return false
  return !isSyntheticPanoramaUrl(imageUrl)
}
