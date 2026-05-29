import { Pool, type QueryResultRow } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

function getConnectionString(): string | null {
  const url = (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  ).trim()
  return url || null
}

export function isDbConfigured(): boolean {
  return Boolean(getConnectionString())
}

function getPool(): Pool {
  if (!getConnectionString()) {
    throw new Error('Database is not configured')
  }
  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString: getConnectionString()!,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 5000,
    })
  }
  return global._pgPool
}

export default getPool

let dbCircuitOpenUntil = 0

function isDbCircuitOpen(): boolean {
  return Date.now() < dbCircuitOpenUntil
}

function openDbCircuit(): void {
  dbCircuitOpenUntil = Date.now() + 60_000
}

function convertPlaceholders(sql: string): string {
  let idx = 0
  return sql.replace(/\?/g, () => `$${++idx}`)
}

/** Execute a SELECT query and return typed rows. Returns [] if DB is unavailable. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  if (!isDbConfigured() || isDbCircuitOpen()) return []

  try {
    const result = await getPool().query(convertPlaceholders(sql), params ?? [])
    return result.rows as T[]
  } catch (error) {
    openDbCircuit()
    console.error('[DB query]', (error as Error).message ?? error)
    return []
  }
}

/** Execute an INSERT/UPDATE/DELETE and return result metadata. */
export async function execute(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<{ insertId: number; affectedRows: number }> {
  if (!isDbConfigured()) {
    throw new Error('Database is not configured')
  }

  try {
    const pgSql = convertPlaceholders(sql)
    const isInsert = sql.trim().toUpperCase().startsWith('INSERT')
    const finalSql = isInsert && !pgSql.toUpperCase().includes('RETURNING')
      ? `${pgSql} RETURNING id`
      : pgSql

    const result = await getPool().query(finalSql, params ?? [])
    return {
      insertId: result.rows?.[0]?.id ?? 0,
      affectedRows: result.rowCount ?? 0,
    }
  } catch (error) {
    console.error('[DB execute]', (error as Error).message ?? error)
    throw error
  }
}

/** Get a single row or null. */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

/** Run multiple statements inside a transaction. */
export async function withTransaction<T>(
  fn: (client: import('pg').PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect()
  await client.query('BEGIN')
  try {
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
