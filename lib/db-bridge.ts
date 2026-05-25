import type { ResultSetHeader } from 'mysql2'

/**
 * InfinityFree bridge has been removed.
 * This module is kept as a stub for backward compatibility with imports.
 * All database access now uses direct mysql2 connection or local JSON fallback.
 */

export function isBridgeConfigured(): boolean {
  return false
}

export async function bridgeQuery<T>(
  _sql: string,
  _params?: (string | number | boolean | null)[]
): Promise<T[]> {
  return []
}

export async function bridgeExecute(
  _sql: string,
  _params?: (string | number | boolean | null)[]
): Promise<ResultSetHeader> {
  throw new Error('DB bridge removed. Use direct MySQL (DB_HOST).')
}
