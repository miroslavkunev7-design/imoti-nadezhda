import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public/images/logo-nadezhda-v2.svg'))

// 1 — transparent
await sharp(svg, { density: 400 })
  .resize(1440)
  .png({ compressionLevel: 9 })
  .toFile(join(root, 'public/images/logo-nadezhda-v2-transparent.png'))

// 2 — preview on marble background
const transparent = readFileSync(join(root, 'public/images/logo-nadezhda-v2-transparent.png'))
await sharp({
  create: { width: 1440, height: 1040, channels: 4, background: '#FAF7F2' },
})
  .composite([{ input: transparent, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile(join(root, 'public/images/logo-nadezhda-v2-preview.png'))

console.log('Done')
