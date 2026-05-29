/**
 * Legacy bridge stub — kept for backward compatibility with imports.
 * All database access now uses PostgreSQL (Supabase) via lib/db.ts.
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
): Promise<{ insertId: number; affectedRows: number }> {
  throw new Error('Bridge removed. Use direct PostgreSQL via DATABASE_URL.')
}
