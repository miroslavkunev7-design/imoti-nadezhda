import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { runMilena, type MilenaAttachment, milenaConfigured } from '@/lib/ai/milena/run'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран' }, { status: 401 })
  }
  const ready = await milenaConfigured()
  return NextResponse.json({
    success: true,
    milenaReady: ready,
    model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o',
    hint: ready
      ? 'Милена е готова за свободен разговор.'
      : 'Админ → Настройки → Милена AI → въведете OpenAI ключ.',
  })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const message = String(body.message ?? '').trim()
    const history = Array.isArray(body.history) ? body.history : []
    const attachments: MilenaAttachment[] = Array.isArray(body.attachments)
      ? body.attachments
          .filter((a: unknown) => a && typeof a === 'object' && 'url' in (a as object))
          .map((a: { url: string; name?: string; type?: string }) => ({
            url: String(a.url),
            name: String(a.name ?? 'file'),
            type: String(a.type ?? 'application/octet-stream'),
          }))
      : []

    const result = await runMilena(message, history, session, attachments)

    return NextResponse.json({
      success: result.ok,
      message: result.message,
      contract: result.contract ?? null,
      imageUrl: result.imageUrl ?? null,
      data: result.data ?? null,
    })
  } catch (error) {
    console.error('[POST /api/admin/ai]', error)
    return NextResponse.json(
      { success: false, error: 'Грешка в AI асистента Милена' },
      { status: 500 }
    )
  }
}
