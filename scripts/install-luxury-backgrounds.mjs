import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const assets =
  process.env.CURSOR_ASSETS ||
  path.join('C:', 'Users', 'milena', '.cursor', 'projects', 'd-programi-imoti-nadezhda', 'assets')

const MAP = [
  {
    src: 'c__Users_milena_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_91b3991b-a8c1-4641-99eb-c3f97f5d9c47-7b3d0bf6-4a78-4ea4-8e76-f41ef7e5c014.png',
    dest: 'public/images/hero-bg-source.jpg',
  },
  {
    src: 'c__Users_milena_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_4af97860-9611-4d26-9ca7-0dd8835f8d27-1bef2735-9d6f-4c43-8423-2a20f89cd96a.png',
    dest: 'public/images/cities/burgas-page.jpg',
  },
  {
    src: 'c__Users_milena_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_5cc15d4a-31d9-4b74-bbd7-6b640df401bc-da48daca-f08f-465e-9a08-f59bcab85bee.png',
    dest: 'public/images/cities/shumen-page.jpg',
  },
]

async function main() {
  for (const { src, dest } of MAP) {
    const input = path.join(assets, src)
    const output = path.join(root, dest)
    if (!fs.existsSync(input)) {
      console.error('Missing:', input)
      continue
    }
    fs.mkdirSync(path.dirname(output), { recursive: true })
    await sharp(input)
      .resize({ width: 2400, withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(output)
    console.log('OK', dest)
  }
}

main()
