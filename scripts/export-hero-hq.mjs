import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.dirname(fileURLToPath(import.meta.url))
const project = path.join(root, '..')
const assets = path.join('C:', 'Users', 'milena', '.cursor', 'projects', 'd-programi-imoti-nadezhda', 'assets')
const src =
  'c__Users_milena_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_91b3991b-a8c1-4641-99eb-c3f97f5d9c47-16e93fa4-6cc6-4fc6-bb04-d3705dcc0711.png'
const input = path.join(assets, src)
const outJpg = path.join(project, 'public/images/hero-bg.jpg')
const outWebp = path.join(project, 'public/images/hero-bg.webp')

if (!fs.existsSync(input)) {
  console.error('Missing', input)
  process.exit(1)
}

const meta = await sharp(input).metadata()
console.log('Source:', meta.width, 'x', meta.height)

const pipeline = sharp(input).resize({
  width: Math.min(4096, Math.max(meta.width || 2400, 3200)),
  withoutEnlargement: false,
})

await pipeline
  .clone()
  .jpeg({ quality: 94, mozjpeg: true, chromaSubsampling: '4:4:4' })
  .toFile(outJpg)

await pipeline
  .clone()
  .webp({ quality: 90, effort: 6 })
  .toFile(outWebp)

const j = await sharp(outJpg).metadata()
console.log('hero-bg.jpg', j.width, 'x', j.height, Math.round(fs.statSync(outJpg).size / 1024), 'KB')
