import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import type { LeadStatus, MarketplaceLead } from '@/lib/marketplace/types'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE_PATH = path.join(DATA_DIR, 'local-crm-leads-queue.json')

type StoredLead = Omit<MarketplaceLead, 'images'> & { images: string[] }

async function readStore(): Promise<StoredLead[]> {
  try {
    const raw = await readFile(FILE_PATH, 'utf-8')
    return JSON.parse(raw) as StoredLead[]
  } catch {
    return []
  }
}

async function writeStore(items: StoredLead[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(FILE_PATH, JSON.stringify(items, null, 2), 'utf-8')
}

function now() {
  return new Date().toISOString()
}

export async function listLocalLeads(status?: LeadStatus): Promise<MarketplaceLead[]> {
  const items = await readStore()
  const filtered = status ? items.filter(l => l.status === status) : items
  return filtered.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getLocalLead(id: number): Promise<MarketplaceLead | null> {
  return (await readStore()).find(l => l.id === id) ?? null
}

export async function createLocalLead(
  input: Omit<MarketplaceLead, 'id' | 'created_at' | 'updated_at'>
): Promise<MarketplaceLead> {
  const items = await readStore()
  const id = items.length ? Math.max(...items.map(l => l.id)) + 1 : 900_001
  const ts = now()
  const record: MarketplaceLead = { ...input, id, created_at: ts, updated_at: ts }
  items.unshift(record)
  await writeStore(items)
  return record
}

export async function updateLocalLead(
  id: number,
  patch: Partial<MarketplaceLead>
): Promise<MarketplaceLead | null> {
  const items = await readStore()
  const idx = items.findIndex(l => l.id === id)
  if (idx < 0) return null
  items[idx] = { ...items[idx], ...patch, updated_at: now() }
  await writeStore(items)
  return items[idx]
}

export async function findLocalLeadByExternal(
  source: string,
  external_id: string
): Promise<MarketplaceLead | null> {
  return (
    (await readStore()).find(l => l.source === source && l.external_id === external_id) ?? null
  )
}

export async function findLocalLeadByDuplicateKey(key: string): Promise<MarketplaceLead | null> {
  return (await readStore()).find(l => l.duplicate_key === key && l.status !== 'rejected') ?? null
}
