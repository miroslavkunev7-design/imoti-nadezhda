/**
 * Browser → same-origin /api/admin/upload → Vercel → api.php (base64 JSON)
 */

async function parseUploadResponse(res: Response): Promise<{ success: boolean; url?: string; error?: string }> {
  const text = await res.text()
  try {
    return JSON.parse(text) as { success: boolean; url?: string; error?: string }
  } catch {
    throw new Error(`Невалиден отговор от сървъра (HTTP ${res.status})`)
  }
}

export async function uploadPropertyImage(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const form = new FormData()
  form.append('file', file, fileName)

  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  const json = await parseUploadResponse(res)

  if (!json.success || !json.url) {
    throw new Error(json.error ?? 'Upload failed')
  }
  return json.url
}
