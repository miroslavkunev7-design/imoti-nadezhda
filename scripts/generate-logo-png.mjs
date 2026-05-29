import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const fullSvg = readFileSync(join(root, 'public/images/logo-nadezhda.svg'))
const iconSvg = readFileSync(join(root, 'public/images/logo-nadezhda-icon.svg'))

const exports = [
  { input: fullSvg, name: 'logo-nadezhda.png', width: 640 },
  { input: fullSvg, name: 'logo-nadezhda@2x.png', width: 1280 },
  { input: fullSvg, name: 'logo-nadezhda-hq.png', width: 1920 },
  { input: iconSvg, name: 'logo-nadezhda-icon.png', width: 560 },
  { input: iconSvg, name: 'logo-nadezhda-icon-hq.png', width: 1120 },
]

for (const { input, name, width } of exports) {
  const out = join(root, 'public/images', name)
  await sharp(input, { density: 300 })
    .resize(width)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(out)
  console.log('Wrote', out)
}
