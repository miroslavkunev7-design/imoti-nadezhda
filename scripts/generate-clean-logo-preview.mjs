import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = join(root, 'public/images/logo-nadezhda-clean.svg')
const svg = readFileSync(svgPath)

const transparent = join(root, 'public/images/logo-nadezhda-clean.png')
const preview = join(root, 'public/images/logo-nadezhda-clean-preview.png')

await sharp(svg, { density: 320 })
  .resize(1600)
  .png({ quality: 100, compressionLevel: 9 })
  .toFile(transparent)

await sharp({
  create: {
    width: 1600,
    height: 952,
    channels: 4,
    background: '#FAF7F2',
  },
})
  .composite([{ input: transparent, gravity: 'center' }])
  .png({ quality: 100, compressionLevel: 9 })
  .toFile(preview)

console.log(`Wrote ${transparent}`)
console.log(`Wrote ${preview}`)
