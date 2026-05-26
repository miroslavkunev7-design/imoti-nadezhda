import postgres from 'postgres'

export type ResultSetHeader = {
  insertId: number
  affectedRows: number
}

declare global {
  // eslint-disable-next-line no-var
  var _postgres: ReturnType<typeof postgres> | undefined
}

function getDatabaseUrl(): string | null {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.SUPABASE_DB_URL?.trim()
  return url || null
}

export function isDbConfigured(): boolean {
  return Boolean(getDatabaseUrl())
}

function getSql(): ReturnType<typeof postgres> {
  const url = getDatabaseUrl()
  if (!url) throw new Error('Database is not configured')
  if (!global._postgres) {
    global._postgres = postgres(url, {
      ssl: 'require',
      max: 10,
      idle_timeout: 60,
      connect_timeout: 8,
      prepare: false,
    })
  }
  return global._postgres
}

function toPgSql(sql: string): string {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

const QUERY_TIMEOUT_MS = 8000
let dbCircuitOpenUntil = 0

function isDbCircuitOpen(): boolean {
  return Date.now() < dbCircuitOpenUntil
}

function openDbCircuit(): void {
  dbCircuitOpenUntil = Date.now() + 60_000
}

async function withTimeout<T>(promise: Promise<T>, ms = QUERY_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('DB timeout')), ms)
    ),
  ])
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  if (!isDbConfigured() || isDbCircuitOpen()) return []

  try {
    const pgSql = toPgSql(sql)
    const rows = await withTimeout(getSql().unsafe(pgSql, params ?? []))
    return rows as unknown as T[]
  } catch (error) {
    openDbCircuit()
    console.error('[DB query]', error instanceof Error ? error.message : error)
    return []
  }
}

export async function execute(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<ResultSetHeader> {
  if (!isDbConfigured()) {
    throw new Error('Database is not configured')
  }

  const pgSql = toPgSql(sql)
  const isInsert = /^\s*INSERT\s/i.test(sql)

  try {
    if (isInsert && !/\bRETURNING\b/i.test(pgSql)) {
      const rows = await withTimeout(
        getSql().unsafe(`${pgSql} RETURNING id`, params ?? [])
      )
      return {
        insertId: Number(rows[0]?.id ?? 0),
        affectedRows: rows.length,
      }
    }

    const result = await withTimeout(getSql().unsafe(pgSql, params ?? []))
    const count = (result as unknown as { count?: number }).count
    return {
      insertId: Number(result[0]?.id ?? 0),
      affectedRows: count ?? result.length,
    }
  } catch (error) {
    console.error('[DB execute]', error instanceof Error ? error.message : error)
    throw error
  }
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

export default getSql
