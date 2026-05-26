import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { listLeads } from '@/lib/marketplace/leads-repository'
import type { LeadStatus } from '@/lib/marketplace/types'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран достъп' }, { status: 401 })
  }

  const status = req.nextUrl.searchParams.get('status') as LeadStatus | null
  const leads = await listLeads(status ?? undefined)
  return NextResponse.json({ success: true, leads })
}
