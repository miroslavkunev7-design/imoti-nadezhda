import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { runVirtualTourBatch } from '@/lib/virtual-tour/batch'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const auth = requireAdminApi(req)
  if ('error' in auth) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const force = Boolean(body.force)
    const propertyIds = Array.isArray(body.propertyIds)
      ? body.propertyIds.map((id: unknown) => Number(id)).filter((n: number) => Number.isFinite(n))
      : undefined

    const summary = await runVirtualTourBatch({ force, propertyIds })

    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Грешка при batch генериране'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
