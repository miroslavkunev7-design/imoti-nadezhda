#!/usr/bin/env node
/**
 * Подготвя Burgas city assets:
 * - burgas-page-bg.*     — снимка 3, full-page hero background
 * - burgas-about-card.*  — снимка 2, фото в картата „ЗА ГРАДА“
 * Премахва типични watermark зони (горе-ляво / долу-дясно).
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'public/images/cities')

const SRC_BG =
  process.env.BURGAS_SRC_BG ??
  path.join(outDir, 'burgas-city-hero-sunset.jpg')
const SRC_CARD =
  process.env.BURGAS_SRC_CARD ??
  path.join(outDir, 'burgas-page.jpg')

/** Clone-fill corner bands where agency logos usually sit. */
async function stripLogoCorners(input, { w, h }) {
  const img = sharp(input)
  const meta = await img.metadata()
  const width = meta.width ?? w
  const height = meta.height ?? h

  const patches = [
    { left: 0, top: 0, width: Math.round(width * 0.22), height: Math.round(height * 0.14) },
    { left: Math.round(width * 0.72), top: Math.round(height * 0.82), width: Math.round(width * 0.28), height: Math.round(height * 0.18) },
  ]

  let pipeline = sharp(input)
  for (const region of patches) {
    const { left, top, width: rw, height: rh } = region
    if (rw < 2 || rh < 2 || left + rw > width || top + rh > height) continue
    const sampleLeft = Math.min(left + rw + 2, width - 4)
    const sampleTop = Math.min(top + Math.floor(rh / 2), height - 4)
    const sample = await sharp(input)
      .extract({
        left: Math.max(0, sampleLeft),
        top: Math.max(0, sampleTop),
        width: Math.min(4, width - sampleLeft),
        height: Math.min(4, height - sampleTop),
      })
      .resize(rw, rh, { fit: 'fill' })
      .toBuffer()
    pipeline = sharp(await pipeline.toBuffer()).composite([{ input: sample, left, top }])
  }
  return pipeline
}

async function writePair(base, name, resize) {
  const jpgPath = path.join(outDir, `${name}.jpg`)
  const webpPath = path.join(outDir, `${name}.webp`)
  let pipeline = base
  if (resize) pipeline = pipeline.resize(resize.width, resize.height, { fit: 'cover', position: resize.position ?? 'centre' })
  await pipeline.jpeg({ quality: 90, mozjpeg: true }).toFile(jpgPath)
  await sharp(jpgPath).webp({ quality: 88 }).toFile(webpPath)
  console.log('OK', name)
}

async function main() {
  const bgClean = await stripLogoCorners(SRC_BG, {})
  await writePair(bgClean, 'burgas-page-bg', { width: 1920, height: 1080, position: 'right' })

  const cardClean = await stripLogoCorners(SRC_CARD, {})
  await writePair(cardClean, 'burgas-about-card', { width: 900, height: 620, position: 'centre' })

  // Keep legacy alias for hero
  await sharp(path.join(outDir, 'burgas-page-bg.jpg'))
    .jpeg({ quality: 90 })
    .toFile(path.join(outDir, 'burgas-city-hero-sunset.jpg'))
  await sharp(path.join(outDir, 'burgas-page-bg.webp'))
    .webp({ quality: 88 })
    .toFile(path.join(outDir, 'burgas-city-hero-sunset.webp'))
  console.log('OK legacy burgas-city-hero-sunset')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
