import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import {
  getVirtualTourById,
  updateTourSettings,
  finalizeTour,
  replaceTourFrames,
  listTourFrames,
} from '@/lib/virtual-tour/repository'
import { buildManifest } from '@/lib/virtual-tour/manifest'
import { totalDurationMs } from '@/lib/virtual-tour/smoothing'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminApi(req)
  if ('error' in auth) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
  }
  const id = parseInt(params.id, 10)
  const tour = await getVirtualTourById(id)
  if (!tour) {
    return NextResponse.json({ success: false, error: 'Турът не е намерен' }, { status: 404 })
  }
  return NextResponse.json({ success: true, tour })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminApi(req)
  if ('error' in auth) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
  }
  const id = parseInt(params.id, 10)
  const tour = await getVirtualTourById(id)
  if (!tour) {
    return NextResponse.json({ success: false, error: 'Турът не е намерен' }, { status: 404 })
  }

  try {
    const body = await req.json()

    if (body.settings) {
      await updateTourSettings(id, body.settings)
    }

    if (body.frames && Array.isArray(body.frames)) {
      await replaceTourFrames(id, body.frames)
      const frames = await listTourFrames(id)
      const settings = body.settings ?? tour.settings
      const manifest = buildManifest({
        propertyId: tour.propertyId,
        tourId: id,
        mode: tour.mode,
        frames,
        settings: settings!,
        fallbackSlideshow: tour.mode === 'slideshow',
      })
      await finalizeTour({
        tourId: id,
        propertyId: tour.propertyId,
        manifest,
        mode: tour.mode,
        status: body.publish ? 'published' : tour.status,
        thumbnailUrl: tour.thumbnailUrl,
        frameCount: frames.length,
        durationSec: totalDurationMs(frames) / 1000,
        publish: Boolean(body.publish),
      })
    } else if (body.publish) {
      const frames = await listTourFrames(id)
      const manifest = buildManifest({
        propertyId: tour.propertyId,
        tourId: id,
        mode: tour.mode,
        frames,
        settings: tour.settings!,
        fallbackSlideshow: tour.mode === 'slideshow',
      })
      await finalizeTour({
        tourId: id,
        propertyId: tour.propertyId,
        manifest,
        mode: tour.mode,
        status: 'published',
        thumbnailUrl: tour.thumbnailUrl,
        frameCount: frames.length,
        durationSec: totalDurationMs(frames) / 1000,
        publish: true,
      })
    }

    const updated = await getVirtualTourById(id)
    return NextResponse.json({ success: true, tour: updated })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Грешка при запис'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
