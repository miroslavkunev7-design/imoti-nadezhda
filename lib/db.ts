import mysql from 'mysql2/promise'

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined
}

function isDirectDbConfigured(): boolean {
  return Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME)
}

export function isDbConfigured(): boolean {
  return isDirectDbConfigured()
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host:            process.env.DB_HOST!,
    port:            parseInt(process.env.DB_PORT || '3306'),
    user:            process.env.DB_USER!,
    password:        process.env.DB_PASSWORD!,
    database:        process.env.DB_NAME!,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    timezone:           '+00:00',
    charset:            'utf8mb4',
    connectTimeout:  5000,
    idleTimeout:     60000,
  })
}

function getPool(): mysql.Pool {
  if (!isDirectDbConfigured()) {
    throw new Error('Database is not configured')
  }
  return (global._mysqlPool ??= createPool())
}

export default getPool

const QUERY_TIMEOUT_MS = 5000

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

/** Execute a SELECT query and return typed rows. Returns [] if DB is unavailable. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  if (!isDbConfigured() || isDbCircuitOpen()) return []

  try {
    const [rows] = await withTimeout(getPool().execute(sql, params ?? []))
    return rows as T[]
  } catch (error) {
    openDbCircuit()
    console.error('[DB query]', (error as NodeJS.ErrnoException).message ?? error)
    return []
  }
}

/** Execute an INSERT/UPDATE/DELETE and return result metadata. */
export async function execute(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<mysql.ResultSetHeader> {
  if (!isDbConfigured()) {
    throw new Error('Database is not configured')
  }

  try {
    const [result] = await withTimeout(getPool().execute(sql, params ?? []))
    return result as mysql.ResultSetHeader
  } catch (error) {
    console.error('[DB execute]', (error as NodeJS.ErrnoException).message ?? error)
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
  fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getPool().getConnection()
  await conn.beginTransaction()
  try {
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
