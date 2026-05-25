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
  const dbBridge = (process.env.DB_BRIDGE_URL ?? '').trim()
  return Boolean(dbBridge && getUploadBridgeKey())
}

// 40 KB binary per chunk → ~53 KB base64 → safely below InfinityFree bot-protection threshold
const CHUNK_SIZE = 40 * 1024

async function sendChunk(
  bridgeUrl: string,
  key: string,
  uploadId: string,
  chunkIndex: number,
  totalChunks: number,
  fileName: string,
  data: string
): Promise<{ success: boolean; url?: string; path?: string; partial?: boolean; error?: string }> {
  const res = await fetch(bridgeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, action: 'upload_chunk', uploadId, chunkIndex, totalChunks, fileName, data }),
    cache: 'no-store',
  })

  const text = await res.text()
  try {
    return JSON.parse(text) as { success: boolean; url?: string; path?: string; partial?: boolean; error?: string }
  } catch {
    const hint = text.trimStart().startsWith('<')
      ? 'api.php връща HTML (bot protection). Намали снимката или провери DB_BRIDGE_URL.'
      : 'api.php не връща JSON'
    throw new Error(`${hint} (HTTP ${res.status})`)
  }
}

export async function uploadImageViaApiBridge(
  buffer: Buffer,
  fileName: string
): Promise<{ url: string; path: string }> {
  const url = (process.env.DB_BRIDGE_URL ?? '').trim()
  const key = getUploadBridgeKey()
  if (!url || !key) throw new Error('Upload bridge not configured')

  const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE)
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  for (let i = 0; i < totalChunks; i++) {
    const chunk = buffer.subarray(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    const json = await sendChunk(url, key, uploadId, i, totalChunks, fileName, chunk.toString('base64'))

    if (!json.success) {
      throw new Error(json.error ?? `Upload chunk ${i} failed`)
    }

    if (json.url) {
      return { url: json.url, path: json.path ?? json.url }
    }
    // json.partial === true — continue to next chunk
  }

  throw new Error('Upload completed but no URL returned')
}

/** @deprecated Prefer uploadImageViaApiBridge — upload.php often blocked by bot protection */
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
  form.append(
    'file',
    new File([new Uint8Array(buffer)], fileName, { type: mimeType })
  )

  const res = await fetch(url, { method: 'POST', body: form, cache: 'no-store' })
  const text = await res.text()

  let json: { success: boolean; url?: string; path?: string; error?: string }
  try {
    json = JSON.parse(text) as typeof json
  } catch {
    const hint = text.trimStart().startsWith('<')
      ? `upload.php връща HTML (грешен URL?). Провери DB_BRIDGE_URL → .../db-bridge/upload.php на imotinadezhda.infinityfree.me`
      : 'upload.php не връща JSON'
    throw new Error(`${hint} (HTTP ${res.status})`)
  }

  if (!json.success || !json.url) {
    throw new Error(json.error ?? 'Upload bridge failed')
  }

  return { url: json.url, path: json.path ?? json.url }
}
