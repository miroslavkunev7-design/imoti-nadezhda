import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { runVirtualTourPipeline } from '@/lib/virtual-tour/pipeline'
import type { SceneType } from '@/types/virtual-tour'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const auth = requireAdminApi(req)
  if ('error' in auth) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const propertyId = Number(body.propertyId)
    const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls.map(String) : []
    const publish = Boolean(body.publish ?? true)
    const clientHints = Array.isArray(body.clientHints)
      ? body.clientHints.map((h: { sceneType?: string; confidence?: number; embedding?: number[] }) =>
          h?.sceneType
            ? {
                sceneType: h.sceneType as SceneType,
                confidence: Number(h.confidence ?? 0),
                embedding: h.embedding,
              }
            : undefined
        )
      : undefined

    if (!propertyId || !imageUrls.length) {
      return NextResponse.json(
        { success: false, error: 'propertyId и imageUrls са задължителни' },
        { status: 400 }
      )
    }

    const result = await runVirtualTourPipeline({
      propertyId,
      imageUrls,
      clientHints,
      publish,
    })

    return NextResponse.json({
      success: true,
      tourId: result.tourId,
      mode: result.mode,
      manifest: result.manifest,
      frameCount: result.frameCount,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Грешка при генериране'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
