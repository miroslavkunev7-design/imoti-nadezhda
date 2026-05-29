import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const input = join(root, 'public/images/logo-panel.png')
const output = join(root, 'public/images/logo-panel-cut.png')

const meta = await sharp(input).metadata()
const width = meta.width ?? 634
const height = meta.height ?? 177

// Alpha mask: keep the marble panel + gold ribbon, remove the rectangular sky area.
// Coordinates are based on the uploaded 634x177 panel and scale with the image.
const mask = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 634 177" xmlns="http://www.w3.org/2000/svg">
  <rect width="634" height="177" fill="transparent"/>

  <!-- White marble panel area -->
  <path
    d="M0 0 H288
       C278 30 268 64 246 98
       C216 145 160 166 0 177
       Z"
    fill="white"
  />

  <!-- Gold ribbon / curved metallic component only (narrow band) -->
  <path
    d="M334 0 H634 V22
       C535 17 438 26 365 45
       C328 55 304 77 286 105
       L270 100
       C296 66 314 28 334 0
       Z"
    fill="white"
  />
</svg>`)

await sharp(input)
  .ensureAlpha()
  .composite([{ input: mask, blend: 'dest-in' }])
  .png({ compressionLevel: 9 })
  .toFile(output)

console.log(`Wrote ${output}`)
