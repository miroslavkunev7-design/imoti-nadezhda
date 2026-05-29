import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { isMilenaAdmin } from '@/lib/ai/milena/permissions'
import { hasStoredOpenAiKey, saveOpenAiKey } from '@/lib/ai/milena/secrets'
import { milenaConfigured } from '@/lib/ai/milena/run'
import { resolveMilenaLlmConfig } from '@/lib/ai/milena/provider'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран' }, { status: 401 })
  }

  const ready = await milenaConfigured()
  const cfg = await resolveMilenaLlmConfig()
  return NextResponse.json({
    success: true,
    milenaReady: ready,
    hasKey: await hasStoredOpenAiKey(),
    provider: cfg?.provider ?? null,
    model: cfg?.model ?? (process.env.OPENAI_MODEL?.trim() || 'openai/gpt-4o'),
    vercelGateway: Boolean(process.env.VERCEL === '1' || process.env.VERCEL_ENV),
    canConfigure: isMilenaAdmin(session),
  })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран' }, { status: 401 })
  }
  if (!isMilenaAdmin(session)) {
    return NextResponse.json({ success: false, error: 'Само администратор' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const apiKey = String(body.apiKey ?? '').trim()
    const result = await saveOpenAiKey(apiKey)
    const ready = await milenaConfigured()

    return NextResponse.json({
      success: true,
      milenaReady: ready,
      savedToDb: result.db,
      savedToFile: result.file,
      message: ready
        ? 'Милена е активирана. Можете да пишете свободно в чата.'
        : 'Ключът е записан, но проверката не мина.',
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Грешка'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
