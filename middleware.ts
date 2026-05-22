import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect all /admin routes EXCEPT /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = req.cookies.get(ADMIN_COOKIE)?.value

    if (!session) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Validate session format: base64(userId:role:secret_hash)
    try {
      const decoded = Buffer.from(session, 'base64').toString('utf-8')
      const [userId, role, hash] = decoded.split(':')
      const expectedHash = Buffer.from(
        `${userId}${role}${process.env.NEXTAUTH_SECRET ?? 'dev_secret'}`
      ).toString('base64').slice(0, 16)

      if (!userId || !role || hash !== expectedHash) {
        const loginUrl = new URL('/admin/login', req.url)
        return NextResponse.redirect(loginUrl)
      }

      if (!['admin', 'agent', 'broker'].includes(role)) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch {
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
