import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { isDbConfigured, queryOne, execute } from '@/lib/db'

const SECRET_KEY = 'openai_api_key'
const BASE_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data')
const LOCAL_FILE = path.join(BASE_DIR, 'app-secrets.json')

async function readLocalSecrets(): Promise<Record<string, string>> {
  try {
    if (!existsSync(LOCAL_FILE)) return {}
    const raw = await readFile(LOCAL_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

async function writeLocalSecret(key: string, value: string): Promise<void> {
  try {
    const dir = path.dirname(LOCAL_FILE)
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
    const all = await readLocalSecrets()
    all[key] = value
    await writeFile(LOCAL_FILE, JSON.stringify(all, null, 2), 'utf8')
  } catch { /* graceful on serverless */ }
}

function cleanApiKey(raw?: string | null): string | null {
  if (!raw) return null
  const v = raw.trim().replace(/^["']|["']$/g, '')
  if (!v.startsWith('sk-') || v.length < 20) return null
  return v
}

export async function getStoredOpenAiKey(): Promise<string | null> {
  const env =
    cleanApiKey(process.env.OPENAI_API_KEY) ||
    cleanApiKey(process.env.MILENA_OPENAI_API_KEY)
  if (env) return env

  if (isDbConfigured()) {
    try {
      const row = await queryOne<{ value: string }>(
        `SELECT value FROM app_secrets WHERE key = $1 LIMIT 1`,
        [SECRET_KEY]
      )
      const v = cleanApiKey(row?.value)
      if (v) return v
    } catch {
      /* table may not exist yet */
    }
  }

  const local = await readLocalSecrets()
  return cleanApiKey(local[SECRET_KEY])
}

export async function saveOpenAiKey(value: string): Promise<{ db: boolean; file: boolean }> {
  const key = value.trim()
  if (!key.startsWith('sk-')) {
    throw new Error('Невалиден OpenAI ключ (трябва да започва с sk-).')
  }

  let db = false
  let file = false

  if (isDbConfigured()) {
    try {
      await execute(
        `INSERT INTO app_secrets (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [SECRET_KEY, key]
      )
      db = true
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!/app_secrets|does not exist|relation/i.test(msg)) throw e
    }
  }

  await writeLocalSecret(SECRET_KEY, key)
  file = true

  return { db, file }
}

export async function hasStoredOpenAiKey(): Promise<boolean> {
  return Boolean(await getStoredOpenAiKey())
}
