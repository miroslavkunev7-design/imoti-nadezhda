import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

const BASE_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data')
const DIR = path.join(BASE_DIR, 'milena-memory')
const MAX_FACTS = 80

interface MemoryFile {
  userId: number
  facts: string[]
  projects: MilenaProject[]
  updatedAt: string
}

export interface MilenaProject {
  id: string
  title: string
  notes: string
  attachments: string[]
  createdAt: string
  updatedAt: string
}

async function ensureDir() {
  try {
    await mkdir(DIR, { recursive: true })
  } catch { /* /tmp may already exist or fail gracefully */ }
}

function filePath(userId: number) {
  return path.join(DIR, `${userId}.json`)
}

async function load(userId: number): Promise<MemoryFile> {
  await ensureDir()
  try {
    const raw = await readFile(filePath(userId), 'utf-8')
    const j = JSON.parse(raw) as MemoryFile
    return {
      userId,
      facts: Array.isArray(j.facts) ? j.facts : [],
      projects: Array.isArray(j.projects) ? j.projects : [],
      updatedAt: j.updatedAt ?? new Date().toISOString(),
    }
  } catch {
    return { userId, facts: [], projects: [], updatedAt: new Date().toISOString() }
  }
}

async function save(data: MemoryFile) {
  try {
    await ensureDir()
    data.updatedAt = new Date().toISOString()
    await writeFile(filePath(data.userId), JSON.stringify(data, null, 2), 'utf-8')
  } catch { /* graceful — memory is best-effort on serverless */ }
}

export async function getMemoryContext(userId: number): Promise<string> {
  const data = await load(userId)
  const parts: string[] = []
  if (data.facts.length) {
    parts.push('## Постоянна памет\n' + data.facts.map((f, i) => `${i + 1}. ${f}`).join('\n'))
  }
  if (data.projects.length) {
    parts.push(
      '## Проекти\n' +
        data.projects
          .slice(0, 12)
          .map(p => `- [${p.id}] ${p.title}: ${p.notes.slice(0, 200)}`)
          .join('\n')
    )
  }
  return parts.join('\n\n')
}

export async function rememberFact(userId: number, fact: string): Promise<void> {
  const t = fact.trim()
  if (!t || t.length < 4) return
  const data = await load(userId)
  if (data.facts.some(f => f.toLowerCase() === t.toLowerCase())) return
  data.facts.unshift(t.slice(0, 500))
  data.facts = data.facts.slice(0, MAX_FACTS)
  await save(data)
}

export async function listProjects(userId: number): Promise<MilenaProject[]> {
  return (await load(userId)).projects
}

export async function upsertProject(
  userId: number,
  input: { id?: string; title: string; notes?: string; attachments?: string[] }
): Promise<MilenaProject> {
  const data = await load(userId)
  const now = new Date().toISOString()
  const id = input.id ?? `p-${Date.now()}`
  const existing = data.projects.find(p => p.id === id)
  const project: MilenaProject = {
    id,
    title: input.title.slice(0, 120),
    notes: (input.notes ?? existing?.notes ?? '').slice(0, 4000),
    attachments: input.attachments ?? existing?.attachments ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  data.projects = [project, ...data.projects.filter(p => p.id !== id)].slice(0, 30)
  await save(data)
  return project
}
