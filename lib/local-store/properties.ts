import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE_PATH = path.join(DATA_DIR, 'local-properties.json')

export type StoredProperty = {
  id: number
  user_id: number
  title: string
  slug: string
  description: string | null
  price: number
  city: string
  quarter: string
  city_slug: string
  quarter_slug: string
  property_type: string
  status: string
  area: number
  bedrooms: number | null
  bathrooms: number | null
  floor: number | null
  total_floors: number | null
  furnished: string
  main_image: string | null
  images: string[]
  features: string[]
  views: number
  created_at: string
  updated_at: string
}

async function readStore(): Promise<StoredProperty[]> {
  try {
    const raw = await readFile(FILE_PATH, 'utf-8')
    return JSON.parse(raw) as StoredProperty[]
  } catch {
    return []
  }
}

async function writeStore(items: StoredProperty[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(FILE_PATH, JSON.stringify(items, null, 2), 'utf-8')
}

export async function listLocalProperties(): Promise<StoredProperty[]> {
  return readStore()
}

export async function getLocalProperty(id: number): Promise<StoredProperty | null> {
  const items = await readStore()
  return items.find(p => p.id === id) ?? null
}

export async function createLocalProperty(
  input: Omit<StoredProperty, 'id' | 'created_at' | 'updated_at' | 'views'>
): Promise<StoredProperty> {
  const items = await readStore()
  const id = items.length ? Math.max(...items.map(p => p.id)) + 1 : 900_001
  const now = new Date().toISOString()
  const record: StoredProperty = { ...input, id, views: 0, created_at: now, updated_at: now }
  items.unshift(record)
  await writeStore(items)
  return record
}

export async function deleteLocalProperty(id: number): Promise<boolean> {
  const items = await readStore()
  const next = items.filter(p => p.id !== id)
  if (next.length === items.length) return false
  await writeStore(next)
  return true
}

export function localToPropertyRow(p: StoredProperty): Record<string, unknown> {
  return {
    ...p,
    type: p.property_type,
    price_eur: p.price,
    area_sqm: p.area,
    city_name: p.city,
    quarter_name: p.quarter,
    city_slug: p.city_slug,
    quarter_slug: p.quarter_slug,
    primary_image: p.main_image,
    is_new: true,
    is_featured: p.id === 900001 || p.id === 900003,
  }
}
