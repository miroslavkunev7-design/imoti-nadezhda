/** Base URL for media stored on InfinityFree */
export function getMediaBaseUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_MEDIA_URL ?? '').trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const dbBridge = (process.env.DB_BRIDGE_URL ?? '').trim()
  if (dbBridge) {
    try {
      return new URL(dbBridge).origin
    } catch {
      /* ignore */
    }
  }
  return ''
}

/** Resolve image URL — supports absolute IF URLs and local paths */
export function resolveMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = getMediaBaseUrl()
  if (base && path.startsWith('/uploads/')) return `${base}${path}`
  return path
}

export function getUploadBridgeUrl(): string | null {
  const explicit = process.env.UPLOAD_BRIDGE_URL?.trim()
  if (explicit) return explicit

  const dbBridge = process.env.DB_BRIDGE_URL?.trim()
  if (!dbBridge) return null

  return dbBridge.replace(/api\.php$/i, 'upload.php')
}

export function getUploadBridgeKey(): string | null {
  return process.env.DB_BRIDGE_KEY?.trim() || null
}

export function isRemoteUploadConfigured(): boolean {
  return Boolean(getUploadBridgeUrl() && getUploadBridgeKey())
}

export async function uploadToBridge(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ url: string; path: string }> {
  const url = getUploadBridgeUrl()
  const key = getUploadBridgeKey()
  if (!url || !key) throw new Error('Upload bridge not configured')

  const form = new FormData()
  form.append('key', key)
  form.append('file', new Blob([new Uint8Array(buffer)], { type: mimeType }), fileName)

  const res = await fetch(url, { method: 'POST', body: form, cache: 'no-store' })
  const json = await res.json() as { success: boolean; url?: string; path?: string; error?: string }

  if (!json.success || !json.url) {
    throw new Error(json.error ?? 'Upload bridge failed')
  }

  return { url: json.url, path: json.path ?? json.url }
}
