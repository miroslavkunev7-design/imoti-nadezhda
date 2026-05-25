import { cookies } from 'next/headers'

export interface Session {
  userId: number
  role: 'admin' | 'broker' | 'agent'
}

export function getSession(): Session | null {
  try {
    const session = cookies().get('admin_session')?.value
    if (!session) return null
    const decoded = Buffer.from(session, 'base64').toString('utf-8')
    const [userId, role] = decoded.split(':')
    if (!userId || !role) return null
    return { userId: parseInt(userId, 10), role: role as Session['role'] }
  } catch {
    return null
  }
}

/** Decode session from raw cookie header value (for API routes / middleware) */
export function decodeSessionValue(value: string): Session | null {
  try {
    const decoded = Buffer.from(value, 'base64').toString('utf-8')
    const [userId, role] = decoded.split(':')
    if (!userId || !role) return null
    return { userId: parseInt(userId, 10), role: role as Session['role'] }
  } catch {
    return null
  }
}
