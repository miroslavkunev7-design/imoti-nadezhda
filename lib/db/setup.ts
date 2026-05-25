/** Ensure CRM tables/columns exist — safe to call on every admin load */
export async function ensureDbSetup(): Promise<void> {
  const url = process.env.DB_BRIDGE_URL?.trim()
  const key = process.env.DB_BRIDGE_KEY?.trim()
  if (!url || !key) return

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, action: 'migrate' }),
      cache: 'no-store',
    })
  } catch {
    /* non-fatal */
  }
}
