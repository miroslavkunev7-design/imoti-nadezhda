import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = req.cookies.get(ADMIN_COOKIE)?.value

    if (!session) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    let userId = '0'
    let role   = 'broker'
    try {
      const decoded = Buffer.from(session, 'base64').toString('utf-8')
      const parts = decoded.split(':')
      userId = parts[0]
      role   = parts[1]
      const hash = parts[2]
      const expectedHash = Buffer.from(
        `${userId}${role}${process.env.NEXTAUTH_SECRET ?? 'dev_secret'}`
      ).toString('base64').slice(0, 16)

      if (!userId || !role || hash !== expectedHash) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }

      if (!['admin', 'agent', 'broker'].includes(role)) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Forward user info on the REQUEST (readable by server components via headers())
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', userId)
    requestHeaders.set('x-user-role', role)
    requestHeaders.set('x-pathname', pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
