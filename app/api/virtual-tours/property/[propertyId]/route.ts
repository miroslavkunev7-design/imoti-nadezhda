import { NextResponse } from 'next/server'
import { getPublishedTourByProperty, listTourFrames, getTourSettings } from '@/lib/virtual-tour/repository'
import { buildManifest } from '@/lib/virtual-tour/manifest'
import { CDN_CACHE_HEADERS } from '@/lib/virtual-tour/constants'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { propertyId: string } }
) {
  const propertyId = parseInt(params.propertyId, 10)
  if (!propertyId) {
    return NextResponse.json({ success: false, error: 'Невалиден имот' }, { status: 400 })
  }

  const tour = await getPublishedTourByProperty(propertyId)
  if (!tour) {
    return NextResponse.json({ success: false, error: 'Няма публикуван тур' }, { status: 404 })
  }

  let manifest = tour.manifest
  if (!manifest?.frames?.length) {
    const frames = await listTourFrames(tour.id)
    const settings = tour.settings ?? (await getTourSettings(tour.id))
    if (frames.length) {
      manifest = buildManifest({
        propertyId: tour.propertyId,
        tourId: tour.id,
        mode: tour.mode,
        frames,
        settings,
        fallbackSlideshow: tour.mode === 'slideshow',
      })
    }
  }

  if (!manifest?.frames?.length) {
    return NextResponse.json({ success: false, error: 'Няма публикуван тур' }, { status: 404 })
  }

  return NextResponse.json(
    {
      success: true,
      tour: {
        id: tour.id,
        propertyId: tour.propertyId,
        mode: tour.mode,
        manifest,
        thumbnailUrl: tour.thumbnailUrl,
        frameCount: tour.frameCount,
        durationSec: tour.durationSec,
      },
    },
    { headers: CDN_CACHE_HEADERS }
  )
}
