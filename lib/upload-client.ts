/**
 * Browser → /api/admin/upload (Vercel) → Cloudinary (server-side signed)
 * API secret never leaves the server.
 */

export async function uploadPropertyImage(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const form = new FormData()
  form.append('file', file, fileName)

  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })

  let json: { success: boolean; url?: string; error?: string }
  try {
    json = await res.json() as typeof json
  } catch {
    throw new Error(`Невалиден отговор от сървъра (HTTP ${res.status})`)
  }

  if (!json.success || !json.url) {
    throw new Error(json.error ?? 'Грешка при качване')
  }
  return json.url
}
