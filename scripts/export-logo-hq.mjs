/**
 * Exports highest-quality logo assets from public/images/logo-icon.png
 * Run: node scripts/export-logo-hq.mjs
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const INPUT = path.join(ROOT, 'public/images/logo-icon.png')
const OUT_DIR = path.join(ROOT, 'public/images')

async function removeWhiteToBuffer(inputBuffer, threshold = 235) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = new Uint8ClampedArray(data.buffer)
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    if (r >= threshold && g >= threshold && b >= threshold) pixels[i + 3] = 0
  }

  return sharp(Buffer.from(pixels.buffer), {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png({ compressionLevel: 6, adaptiveFiltering: true })
}

async function main() {
  const meta = await sharp(INPUT).metadata()
  console.log(`Source: ${meta.width}x${meta.height}`)

  const native = await removeWhiteToBuffer(await sharp(INPUT).toBuffer())
  await native
    .clone()
    .toFile(path.join(OUT_DIR, 'logo-icon-transparent.png'))
  console.log('✓ logo-icon-transparent.png (native)')

  const w2 = meta.width * 2
  const h2 = meta.height * 2
  const upscaled = await removeWhiteToBuffer(
    await sharp(INPUT).resize(w2, h2, { kernel: sharp.kernel.lanczos3 }).sharpen({ sigma: 0.6 }).toBuffer()
  )

  await upscaled
    .clone()
    .toFile(path.join(OUT_DIR, 'logo-icon-hq.png'))
  console.log(`✓ logo-icon-hq.png (${w2}x${h2})`)

  await upscaled
    .clone()
    .webp({ quality: 98, lossless: false, effort: 6 })
    .toFile(path.join(OUT_DIR, 'logo-icon-hq.webp'))
  console.log('✓ logo-icon-hq.webp')

  await upscaled
    .clone()
    .webp({ quality: 100, lossless: true, effort: 6 })
    .toFile(path.join(OUT_DIR, 'logo-icon-hq-lossless.webp'))
  console.log('✓ logo-icon-hq-lossless.webp')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
