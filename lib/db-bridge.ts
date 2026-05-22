import type { ResultSetHeader } from 'mysql2'

const BRIDGE_TIMEOUT_MS = 8000

function bridgeUrl(): string | null {
  const url = process.env.DB_BRIDGE_URL?.trim()
  return url || null
}

function bridgeKey(): string | null {
  const key = process.env.DB_BRIDGE_KEY?.trim()
  return key || null
}

export function isBridgeConfigured(): boolean {
  return Boolean(bridgeUrl() && bridgeKey())
}

async function callBridge(
  action: 'query' | 'execute',
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<unknown> {
  const url = bridgeUrl()
  const key = bridgeKey()
  if (!url || !key) throw new Error('DB bridge not configured')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), BRIDGE_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, action, sql, params }),
      signal: controller.signal,
      cache: 'no-store',
    })

    const json = await res.json() as {
      success: boolean
      rows?: unknown[]
      insertId?: number
      affectedRows?: number
      error?: string
    }

    if (!json.success) {
      throw new Error(json.error ?? 'Bridge error')
    }

    return json
  } finally {
    clearTimeout(timer)
  }
}

export async function bridgeQuery<T>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  const json = await callBridge('query', sql, params) as { rows: T[] }
  return json.rows ?? []
}

export async function bridgeExecute(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<ResultSetHeader> {
  const json = await callBridge('execute', sql, params) as {
    insertId?: number
    affectedRows?: number
  }
  return {
    insertId: json.insertId ?? 0,
    affectedRows: json.affectedRows ?? 0,
  } as ResultSetHeader
}
