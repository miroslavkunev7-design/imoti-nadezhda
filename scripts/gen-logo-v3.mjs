import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Build SVG programmatically to guarantee clean UTF-8 without control chars
const t1 = '\u041D\u0415\u0414\u0412\u0418\u0416\u0418\u041C\u0418\u0020\u0418\u041C\u041E\u0422\u0418'
const t2 = '\u2022\u0020\u041D\u0410\u0414\u0415\u0416\u0414\u0410\u0020\u2022'

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260" fill="none">
  <g fill="#6B001C">
    <path d="M28 148 L28 108 L72 68 L116 108 L116 148 Z"/>
    <rect x="62" y="116" width="20" height="18" fill="white"/>
    <line x1="72" y1="116" x2="72" y2="134" stroke="white" stroke-width="2"/>
    <line x1="62" y1="125" x2="82" y2="125" stroke="white" stroke-width="2"/>
    <path d="M102 148 L102 96 L174 28 L246 96 L246 148 Z"/>
    <rect x="218" y="36" width="16" height="24" rx="2"/>
    <rect x="152" y="104" width="44" height="32" fill="white"/>
    <line x1="174" y1="104" x2="174" y2="136" stroke="white" stroke-width="2.5"/>
    <line x1="152" y1="120" x2="196" y2="120" stroke="white" stroke-width="2.5"/>
    <path d="M232 148 L232 110 L278 72 L324 110 L324 148 Z"/>
    <rect x="268" y="118" width="20" height="18" fill="white"/>
    <line x1="278" y1="118" x2="278" y2="136" stroke="white" stroke-width="2"/>
    <line x1="268" y1="127" x2="288" y2="127" stroke="white" stroke-width="2"/>
  </g>
  <line x1="80" y1="157" x2="280" y2="157" stroke="#CFA54A" stroke-width="1.5"/>
  <text x="180" y="182" text-anchor="middle" fill="#6B001C"
        font-family="Georgia, serif" font-size="17" font-weight="600" letter-spacing="3">${t1}</text>
  <line x1="60" y1="191" x2="300" y2="191" stroke="#CFA54A" stroke-width="1"/>
  <text x="180" y="232" text-anchor="middle" fill="#6B001C"
        font-family="Georgia, serif" font-size="34" font-weight="700" letter-spacing="6">${t2}</text>
</svg>`

// Verify clean
const bad = [...svg].filter(c => c.charCodeAt(0) < 32 && c !== '\n' && c !== '\t')
if (bad.length) throw new Error('Control chars found: ' + bad.map(c => c.charCodeAt(0)))

const svgBuf = Buffer.from(svg, 'utf8')

const transparentPath = join(root, 'public/images/logo-nadezhda-v3-transparent.png')
const previewPath     = join(root, 'public/images/logo-nadezhda-v3-preview.png')

await sharp(svgBuf, { density: 400 })
  .resize(1440)
  .png({ compressionLevel: 9 })
  .toFile(transparentPath)

const trans = await sharp(transparentPath).toBuffer()
const meta  = await sharp(trans).metadata()

await sharp({
  create: { width: meta.width, height: meta.height, channels: 4, background: '#FAF7F2' },
})
  .composite([{ input: trans, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile(previewPath)

console.log('OK', transparentPath)
console.log('OK', previewPath)
