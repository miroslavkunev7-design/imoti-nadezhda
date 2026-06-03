import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_session'

function validateSession(session: string): { userId: string; role: string } | null {
  try {
    const decoded = Buffer.from(session, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    const userId = parts[0]
    const role   = parts[1]
    const hash   = parts[2]
    const expectedHash = Buffer.from(
      `${userId}${role}${process.env.NEXTAUTH_SECRET ?? 'dev_secret'}`
    ).toString('base64').slice(0, 16)

    if (!userId || !role || hash !== expectedHash) return null
    if (!['admin', 'agent', 'broker'].includes(role)) return null
    return { userId, role }
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Admin API routes (/api/admin/*) — return JSON 401 if unauthenticated ──
  if (pathname.startsWith('/api/admin/')) {
    const session = req.cookies.get(ADMIN_COOKIE)?.value
    if (!session) {
      return NextResponse.json({ error: 'Неоторизиран достъп' }, { status: 401 })
    }
    const user = validateSession(session)
    if (!user) {
      return NextResponse.json({ error: 'Невалидна сесия' }, { status: 401 })
    }
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', user.userId)
    requestHeaders.set('x-user-role', user.role)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // ── Admin page routes (/admin/*) — redirect to login if unauthenticated ──
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = req.cookies.get(ADMIN_COOKIE)?.value

    if (!session) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const user = validateSession(session)
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', user.userId)
    requestHeaders.set('x-user-role', user.role)
    requestHeaders.set('x-pathname', pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
