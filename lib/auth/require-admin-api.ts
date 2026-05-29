import { NextRequest } from 'next/server'
import { parseSessionToken, type SessionUser } from '@/lib/auth/session'

export function getAdminFromRequest(req: NextRequest): SessionUser | null {
  const token = req.cookies.get('admin_session')?.value
  if (!token) return null
  return parseSessionToken(token)
}

export function requireAdminApi(req: NextRequest): SessionUser | { error: string; status: number } {
  const user = getAdminFromRequest(req)
  if (!user) return { error: 'Неоторизиран достъп', status: 401 }
  return user
}
