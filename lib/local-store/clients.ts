import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE_PATH = path.join(DATA_DIR, 'local-crm-clients.json')

export type StoredClient = {
  id: number
  name: string
  email: string
  phone: string
  source: string
  status: string
  budget_min: number
  budget_max: number
  created_at: string
}

async function readStore(): Promise<StoredClient[]> {
  try {
    const raw = await readFile(FILE_PATH, 'utf-8')
    return JSON.parse(raw) as StoredClient[]
  } catch {
    return []
  }
}

async function writeStore(items: StoredClient[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(FILE_PATH, JSON.stringify(items, null, 2), 'utf-8')
}

export async function listLocalClients(): Promise<StoredClient[]> {
  return readStore()
}

export async function createLocalClient(
  input: Omit<StoredClient, 'id' | 'created_at'>
): Promise<StoredClient> {
  const items = await readStore()
  const id = items.length ? Math.max(...items.map(c => c.id)) + 1 : 800_001
  const record: StoredClient = {
    ...input,
    id,
    created_at: new Date().toISOString(),
  }
  items.unshift(record)
  await writeStore(items)
  return record
}

export async function updateLocalClient(
  id: number,
  patch: Partial<StoredClient>
): Promise<StoredClient | null> {
  const items = await readStore()
  const idx = items.findIndex(c => c.id === id)
  if (idx < 0) return null
  items[idx] = { ...items[idx], ...patch }
  await writeStore(items)
  return items[idx]
}

export async function deleteLocalClient(id: number): Promise<boolean> {
  const items = await readStore()
  const next = items.filter(c => c.id !== id)
  if (next.length === items.length) return false
  await writeStore(next)
  return true
}

export async function findLocalClientByName(name: string): Promise<StoredClient | null> {
  const q = name.trim().toLowerCase()
  return (await readStore()).find(c => c.name.toLowerCase().includes(q)) ?? null
}
