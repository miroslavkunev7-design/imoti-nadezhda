import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { runCrmAssistant } from '@/lib/ai/crm-assistant'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const message = String(body.message ?? '').trim()
    const history = Array.isArray(body.history) ? body.history : []

    const result = await runCrmAssistant(message, history)

    return NextResponse.json({
      success: result.ok,
      message: result.message,
      contract: result.contract ?? null,
      data: result.data ?? null,
    })
  } catch (error) {
    console.error('[POST /api/admin/ai]', error)
    return NextResponse.json(
      { success: false, error: 'Грешка в AI асистента' },
      { status: 500 }
    )
  }
}
