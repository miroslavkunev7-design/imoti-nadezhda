import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { mapUserRole } from '@/lib/db/mappers'

const ADMIN_COOKIE = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function createSessionToken(userId: number, role: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? 'dev_secret'
  const hash = Buffer.from(`${userId}${role}${secret}`).toString('base64').slice(0, 16)
  return Buffer.from(`${userId}:${role}:${hash}`).toString('base64')
}

function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   COOKIE_MAX_AGE,
    path:     '/',
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Попълни всички полета' }, { status: 400 })
    }

    const MASTER_EMAIL    = process.env.ADMIN_EMAIL    ?? 'agenciq_nadejdi@abv.bg'
    const MASTER_PASSWORD = process.env.ADMIN_PASSWORD ?? 'nadia740608!'

    if (email === MASTER_EMAIL && password === MASTER_PASSWORD) {
      const token = createSessionToken(1, 'admin')
      const response = NextResponse.json({
        success: true,
        user: { id: 1, name: 'Администратор', role: 'admin' },
      })
      setSessionCookie(response, token)
      return response
    }

    const user = await queryOne<{
      id: number
      name: string
      email: string
      password: string
      role: string
      status: string
    }>(
      `SELECT id, name, email, password, role, status
       FROM users WHERE email = ? AND role IN ('admin','broker') LIMIT 1`,
      [email]
    )

    if (!user || user.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Невалиден имейл или парола' }, { status: 401 })
    }

    const storedPw = user.password ?? ''
    const passwordMatch =
      storedPw === password ||
      storedPw === `hashed_${password}` ||
      (storedPw.startsWith('hashed_') && storedPw.slice(7) === password)

    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'Невалиден имейл или парола' }, { status: 401 })
    }

    const sessionRole = mapUserRole(user.role)
    const token = createSessionToken(user.id, sessionRole)

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, role: sessionRole },
    })
    setSessionCookie(response, token)
    return response
  } catch (error) {
    console.error('[POST /api/auth/admin-login]', error)
    return NextResponse.json({ success: false, error: 'Грешка при влизане' }, { status: 500 })
  }
}
