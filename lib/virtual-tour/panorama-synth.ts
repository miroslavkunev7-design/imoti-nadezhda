import sharp from 'sharp'
import { isEquirectangularAspect } from '@/lib/virtual-tour/panorama-detect'

const OUT_W = 2048
const OUT_H = 1024

/**
 * Превръща обикновена снимка в 2:1 equirectangular-подобен кадър
 * (централна перспектива + разширени странични панели) за Street View сфера.
 */
export async function synthesizeEquirectangular(input: Buffer): Promise<Buffer> {
  const rotated = sharp(input).rotate()
  const meta = await rotated.metadata()
  const srcW = meta.width ?? 1200
  const srcH = meta.height ?? 900
  if (isEquirectangularAspect(srcW / srcH)) {
    return rotated.resize(OUT_W, OUT_H, { fit: 'cover' }).jpeg({ quality: 86 }).toBuffer()
  }

  const centerW = Math.round(OUT_W * 0.72)
  const sideW = Math.round((OUT_W - centerW) / 2)

  const center = await rotated
    .resize(centerW, OUT_H, { fit: 'cover', position: 'centre' })
    .toBuffer()

  const stripW = Math.min(140, Math.floor(centerW * 0.22))
  const leftSrc = await sharp(center)
    .extract({ left: 0, top: 0, width: stripW, height: OUT_H })
    .flop()
    .resize(sideW, OUT_H, { fit: 'fill' })
    .blur(10)
    .modulate({ brightness: 0.72 })
    .toBuffer()

  const rightSrc = await sharp(center)
    .extract({ left: Math.max(0, centerW - stripW), top: 0, width: stripW, height: OUT_H })
    .flip()
    .resize(sideW, OUT_H, { fit: 'fill' })
    .blur(10)
    .modulate({ brightness: 0.72 })
    .toBuffer()

  return sharp({
    create: {
      width: OUT_W,
      height: OUT_H,
      channels: 3,
      background: { r: 18, g: 10, b: 14 },
    },
  })
    .composite([
      { input: leftSrc, left: 0, top: 0 },
      { input: center, left: sideW, top: 0 },
      { input: rightSrc, left: sideW + centerW, top: 0 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer()
}

export function panoramaSynthEnabled(): boolean {
  if (process.env.VIRTUAL_TOUR_PANORAMA_SYNTH === '0') return false
  return true
}
