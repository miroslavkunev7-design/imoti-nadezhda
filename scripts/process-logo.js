// Removes white background from logo-icon.png and saves as logo-icon-transparent.png
// Run with: node scripts/process-logo.js

const sharp = require('sharp')
const path  = require('path')

const INPUT  = path.join(__dirname, '../public/images/logo-icon.png')
const OUTPUT = path.join(__dirname, '../public/images/logo-icon-transparent.png')

async function removeWhiteBackground(threshold = 235) {
  const { data, info } = await sharp(INPUT)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = new Uint8ClampedArray(data.buffer)

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2]
    if (r >= threshold && g >= threshold && b >= threshold) {
      pixels[i+3] = 0  // make white → fully transparent
    }
  }

  await sharp(Buffer.from(pixels.buffer), {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toFile(OUTPUT)

  console.log(`✓ Saved: ${OUTPUT}`)
  console.log(`  Size: ${info.width}x${info.height}`)
}

removeWhiteBackground().catch(console.error)
