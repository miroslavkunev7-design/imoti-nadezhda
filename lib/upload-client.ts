/**
 * Browser → InfinityFree upload.php (заобикаля bot protection на Vercel сървъра)
 */

export function getClientUploadConfig(): { url: string; key: string } | null {
  const url = (process.env.NEXT_PUBLIC_UPLOAD_BRIDGE_URL ?? '').trim()
  const key = (process.env.NEXT_PUBLIC_UPLOAD_BRIDGE_KEY ?? '').trim()
  if (!url || !key) return null
  return { url, key }
}

async function parseUploadResponse(res: Response): Promise<{ success: boolean; url?: string; error?: string }> {
  const text = await res.text()
  try {
    return JSON.parse(text) as { success: boolean; url?: string; error?: string }
  } catch {
    if (text.trimStart().startsWith('<')) {
      throw new Error(
        'upload.php връща HTML вместо JSON. Качи отново upload.php с CORS на InfinityFree.'
      )
    }
    throw new Error(`Невалиден отговор от upload.php (HTTP ${res.status})`)
  }
}

/** Качи снимка — директно към InfinityFree на production, локално през /api/admin/upload */
export async function uploadPropertyImage(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const bridge = getClientUploadConfig()

  if (bridge) {
    const form = new FormData()
    form.append('key', bridge.key)
    form.append('file', file, fileName)

    const res = await fetch(bridge.url, { method: 'POST', body: form })
    const json = await parseUploadResponse(res)

    if (!json.success || !json.url) {
      throw new Error(json.error ?? 'Upload bridge failed')
    }
    return json.url
  }

  const form = new FormData()
  form.append('file', file, fileName)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  const json = await parseUploadResponse(res)

  if (!json.success || !json.url) {
    throw new Error(json.error ?? 'Upload failed')
  }
  return json.url
}
