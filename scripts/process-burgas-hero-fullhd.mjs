#!/usr/bin/env node
/**
 * Full HD Burgas city hero — 3840×2160 + 2560×1440 webp/jpg
 * BURGAS_SRC_HERO=/path/to/user-photo.jpg node scripts/process-burgas-hero-fullhd.mjs
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../public/images/cities')

const DEFAULT_SRC = [
  path.join(outDir, 'burgas-city-hero-user-upload.jpg'),
  path.join(outDir, 'burgas-city-hero-sunset-wikimedia.jpg'),
  path.join(outDir, 'burgas-pier-source-hq.jpg'),
  path.join(outDir, 'burgas-city-hero-sunset.jpg'),
].find(p => fs.existsSync(p))

const SRC =
  process.env.BURGAS_SRC_HERO ??
  process.env.BURGAS_SRC_BG ??
  DEFAULT_SRC

if (!SRC || !fs.existsSync(SRC)) {
  console.error('No hero source found. Set BURGAS_SRC_HERO or add burgas-city-hero-user-upload.jpg')
  process.exit(1)
}

/** Casino + pier + Sea Garden framing (mockup / user ref) */
const CROP_POSITION = process.env.BURGAS_HERO_POSITION ?? 'centre'

async function writeHero(width, height, name) {
  const jpg = path.join(outDir, `${name}.jpg`)
  const webp = path.join(outDir, `${name}.webp`)
  await sharp(SRC)
    .rotate()
    .resize(width, height, {
      fit: 'cover',
      position: CROP_POSITION,
      withoutEnlargement: false,
    })
    .sharpen({ sigma: 0.5, m1: 0.45, m2: 0.3 })
    .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(jpg)
  await sharp(jpg).webp({ quality: 90, effort: 4 }).toFile(webp)
  const meta = await sharp(jpg).metadata()
  console.log('OK', name, `${meta.width}x${meta.height}`, fs.statSync(jpg).size, 'bytes')
}

async function main() {
  fs.copyFileSync(SRC, path.join(outDir, 'burgas-pier-source-hq.jpg'))
  await writeHero(3840, 2160, 'burgas-hero-pier-4k')
  await writeHero(2560, 1440, 'burgas-hero-pier')
  await writeHero(1920, 1080, 'burgas-hero-pier-hd')
  console.log('Source:', SRC)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
