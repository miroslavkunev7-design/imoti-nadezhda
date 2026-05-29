import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <rect width="1200" height="700" fill="none"/>

  <g transform="translate(175 55)" fill="#6B001C">
    <!-- left house -->
    <path d="M95 255 V170 L220 60 L345 170 V255 H285 V192 L220 132 L155 192 V255 Z"/>
    <rect x="195" y="190" width="58" height="52" fill="none" stroke="#6B001C" stroke-width="18"/>
    <path d="M224 190 V242 M195 216 H253" stroke="#6B001C" stroke-width="12"/>

    <!-- center house -->
    <path d="M315 255 V145 L505 0 L695 145 V255 H615 V178 L505 86 L395 178 V255 Z"/>
    <rect x="590" y="20" width="52" height="82" rx="4"/>
    <rect x="450" y="175" width="110" height="72" fill="none" stroke="#6B001C" stroke-width="20"/>
    <path d="M505 175 V247 M450 211 H560" stroke="#6B001C" stroke-width="13"/>

    <!-- right house -->
    <path d="M665 255 V170 L790 62 L915 170 V255 H855 V193 L790 136 L725 193 V255 Z"/>
    <rect x="762" y="190" width="58" height="52" fill="none" stroke="#6B001C" stroke-width="18"/>
    <path d="M791 190 V242 M762 216 H820" stroke="#6B001C" stroke-width="12"/>
  </g>

  <text x="600" y="425"
        text-anchor="middle"
        fill="#6B001C"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="58"
        font-weight="700"
        letter-spacing="8">НЕДВИЖИМИ ИМОТИ</text>

  <text x="600" y="540"
        text-anchor="middle"
        fill="#6B001C"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="88"
        font-weight="800"
        letter-spacing="12">• НАДЕЖДА •</text>
</svg>`

const transparentOut = join(root, 'public/images/generated-logo-nadezhda-transparent.png')
const previewOut = join(root, 'public/images/generated-logo-nadezhda-preview.png')

await sharp(Buffer.from(svg), { density: 300 })
  .png({ compressionLevel: 9 })
  .toFile(transparentOut)

await sharp({
  create: {
    width: 1200,
    height: 700,
    channels: 4,
    background: { r: 250, g: 247, b: 242, alpha: 1 },
  },
})
  .composite([
    {
      input: Buffer.from(svg),
      top: 0,
      left: 0,
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(previewOut)

console.log(transparentOut)
console.log(previewOut)
