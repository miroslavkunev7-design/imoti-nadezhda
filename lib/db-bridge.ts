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

    const text = await res.text()
    const contentType = res.headers.get('content-type') ?? ''

    let json: {
      success: boolean
      rows?: unknown[]
      insertId?: number
      affectedRows?: number
      error?: string
    }

    try {
      json = JSON.parse(text) as typeof json
    } catch {
      const hint = text.trimStart().startsWith('<')
        ? 'Bridge URL връща HTML. Провери DB_BRIDGE_URL на InfinityFree.'
        : 'Bridge URL не връща валиден JSON.'
      throw new Error(`${hint} HTTP ${res.status}, Content-Type: ${contentType || 'unknown'}`)
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

/** Run DB migrations on InfinityFree (crm_messages, broker_restrictions, avatar_url) */
export async function runBridgeMigrate(): Promise<boolean> {
  const url = bridgeUrl()
  const key = bridgeKey()
  if (!url || !key) return false

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, action: 'migrate' }),
      cache: 'no-store',
    })
    const json = await res.json() as { success?: boolean }
    return json.success === true
  } catch {
    return false
  }
}
