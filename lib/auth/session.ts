import { cookies, headers } from 'next/headers'
import { query, queryOne } from '@/lib/db'

export type SessionRole = 'admin' | 'agent' | 'broker'

export interface SessionUser {
  id: number
  role: SessionRole
  name?: string
  email?: string
  phone?: string | null
  avatar_url?: string | null
}

const ADMIN_COOKIE = 'admin_session'

function expectedHash(userId: string, role: string): string {
  return Buffer.from(`${userId}${role}${process.env.NEXTAUTH_SECRET ?? 'dev_secret'}`)
    .toString('base64')
    .slice(0, 16)
}

export function parseSessionToken(token: string): SessionUser | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userId, role, hash] = decoded.split(':')
    if (!userId || !role || hash !== expectedHash(userId, role)) return null
    if (!['admin', 'agent', 'broker'].includes(role)) return null
    return { id: parseInt(userId, 10), role: role as SessionRole }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const h = headers()
  const headerId = h.get('x-user-id')
  const headerRole = h.get('x-user-role')
  if (headerId && headerRole) {
    const base = { id: parseInt(headerId, 10), role: headerRole as SessionRole }
    const row = await queryOne<{ name: string; email: string; phone: string | null; avatar_url: string | null }>(
      `SELECT name, email, phone, avatar_url FROM users WHERE id = ? LIMIT 1`,
      [base.id]
    )
    return row ? { ...base, ...row } : base
  }

  const token = cookies().get(ADMIN_COOKIE)?.value
  if (!token) return null
  const parsed = parseSessionToken(token)
  if (!parsed) return null

  try {
    const row = await queryOne<{ name: string; email: string; phone: string | null; avatar_url: string | null }>(
      `SELECT name, email, phone, avatar_url FROM users WHERE id = ? LIMIT 1`,
      [parsed.id]
    )
    return row ? { ...parsed, ...row } : parsed
  } catch {
    return parsed
  }
}

export async function getBrokerRestrictions(userId: number): Promise<string[]> {
  try {
    const rows = await query<{ page_slug: string }>(
      `SELECT page_slug FROM broker_restrictions WHERE user_id = ?`,
      [userId]
    )
    return rows.map(r => r.page_slug)
  } catch {
    return []
  }
}

export function isAdmin(session: SessionUser | null): boolean {
  return session?.role === 'admin'
}
