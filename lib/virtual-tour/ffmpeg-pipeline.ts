import { execFile } from 'child_process'
import { promisify } from 'util'
import sharp from 'sharp'
import { isEquirectangularAspect } from '@/lib/virtual-tour/panorama-detect'
import { panoramaSynthEnabled, synthesizeEquirectangular } from '@/lib/virtual-tour/panorama-synth'
import { uploadPanoramaBuffer } from '@/lib/virtual-tour/panorama-upload'

const execFileAsync = promisify(execFile)

export interface ProcessedFrame {
  originalUrl: string
  stabilizedUrl: string
  width: number
  height: number
  /** Готова 2:1 панорама за Street View сфера */
  isEquirectangular?: boolean
  aspectRatio?: number
}

function ffmpegAvailable(): boolean {
  return process.env.VIRTUAL_TOUR_FFMPEG === '1' || process.env.FFMPEG_PATH !== undefined
}

/**
 * Optional ffmpeg stabilization + WebP compression for CDN.
 * Falls back to sharp resize/compress when ffmpeg is unavailable (Vercel default).
 */
export async function processFrameForTour(
  imageUrl: string,
  stabilization: boolean
): Promise<ProcessedFrame> {
  let input: Buffer | null = null
  try {
    if (imageUrl.startsWith('/')) {
      const { readFile } = await import('fs/promises')
      const { join } = await import('path')
      input = await readFile(join(process.cwd(), 'public', imageUrl.replace(/^\//, '')))
    } else {
      const res = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) })
      if (res.ok) input = Buffer.from(await res.arrayBuffer())
    }
  } catch {
    input = null
  }

  if (!input) {
    return {
      originalUrl: imageUrl,
      stabilizedUrl: imageUrl,
      width: 0,
      height: 0,
      isEquirectangular: false,
      aspectRatio: 1.5,
    }
  }

  const metaIn = await sharp(input).rotate().metadata()
  const inAspect = (metaIn.width ?? 1) / (metaIn.height ?? 1)
  const already360 = isEquirectangularAspect(inAspect)

  if (panoramaSynthEnabled() && !already360) {
    try {
      const panoBuf = await synthesizeEquirectangular(input)
      const tag = `p${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const uploaded = await uploadPanoramaBuffer(panoBuf, tag)
      if (uploaded) {
        return {
          originalUrl: imageUrl,
          stabilizedUrl: uploaded,
          width: 2048,
          height: 1024,
          isEquirectangular: true,
          aspectRatio: 2,
        }
      }
      const b64 = `data:image/jpeg;base64,${panoBuf.toString('base64')}`
      if (panoBuf.length < 900_000) {
        return {
          originalUrl: imageUrl,
          stabilizedUrl: b64,
          width: 2048,
          height: 1024,
          isEquirectangular: true,
          aspectRatio: 2,
        }
      }
    } catch {
      /* sharp fallback below */
    }
  }

  if (already360) {
    const out = await sharp(input).rotate().resize(2048, 1024, { fit: 'cover' }).jpeg({ quality: 86 }).toBuffer()
    const tag = `p360-${Date.now()}`
    const uploaded = await uploadPanoramaBuffer(out, tag)
    const url = uploaded ?? imageUrl
    return {
      originalUrl: imageUrl,
      stabilizedUrl: url,
      width: 2048,
      height: 1024,
      isEquirectangular: true,
      aspectRatio: 2,
    }
  }

  if (ffmpegAvailable() && stabilization) {
    try {
      const { writeFile, readFile, mkdtemp } = await import('fs/promises')
      const { join } = await import('path')
      const { tmpdir } = await import('os')
      const dir = await mkdtemp(join(tmpdir(), 'vtour-'))
      const inPath = join(dir, 'in.jpg')
      const outPath = join(dir, 'out.webp')
      await writeFile(inPath, input)
      const ffmpeg = process.env.FFMPEG_PATH ?? 'ffmpeg'
      await execFileAsync(ffmpeg, [
        '-y',
        '-i',
        inPath,
        '-vf',
        'deshake',
        '-frames:v',
        '1',
        '-q:v',
        '2',
        outPath,
      ])
      const outBuf = await readFile(outPath)
      const meta = await sharp(outBuf).metadata()
      return {
        originalUrl: imageUrl,
        stabilizedUrl: imageUrl,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
      }
    } catch {
      /* sharp fallback */
    }
  }

  const out = await sharp(input)
    .rotate()
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true })

  const meta = out.info
  const aspect = meta.width && meta.height ? meta.width / meta.height : inAspect
  return {
    originalUrl: imageUrl,
    stabilizedUrl: imageUrl,
    width: meta.width,
    height: meta.height,
    isEquirectangular: isEquirectangularAspect(aspect),
    aspectRatio: aspect,
  }
}

export async function processAllFrames(
  urls: string[],
  stabilization: boolean
): Promise<ProcessedFrame[]> {
  const out: ProcessedFrame[] = []
  for (const url of urls) {
    out.push(await processFrameForTour(url, stabilization))
  }
  return out
}
