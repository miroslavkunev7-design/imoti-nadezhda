import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const EXTRA = [
  ['shumen', 'mtnitsa', 'https://static.realistimo.com/images/71d43a3c633180d8bd48fce0f0f6ea216ead31ea.jpg'],
  ['shumen', 'promishlena-zona-zapad', 'https://static.realistimo.com/images/1c23121af76e986464e4d41ebc991b781b8ba22a.jpg'],
  ['shumen', 'tophane', 'https://static.realistimo.com/images/a1ff266f29fcbad73e15bd9512e69a0b1cbbeef6.jpg'],
  ['shumen', 'kurshun-cheshma', 'https://static.realistimo.com/images/5546844cdc161df490571e3b8c5613ce6b98607c.jpg'],
  ['shumen', 'makak', 'https://static.realistimo.com/images/2c83ce3e4e870560585dcefec69ed51a1e5cb6a6.jpg'],
  ['shumen', 'chashka', 'https://static.realistimo.com/images/63c469429ed3cf4bf185c910a3287e6a20f2c024.jpg'],
  ['shumen', 'sakarka', 'https://static.realistimo.com/images/44264983dd72349340e89fc7555cc142975af16f.jpg'],
  ['shumen', 'smese', 'https://static.realistimo.com/images/4ce92ec59f508676d30dec748ca01902e3d162bf.jpg'],
  ['shumen', 'promishlena-zona-yug', 'https://static.realistimo.com/images/91f6609173f6c5dea2ac273fd15587337abcfe0f.jpg'],
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close()
          try {
            fs.unlinkSync(dest)
          } catch {
            /* */
          }
          return download(res.headers.location, dest).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) {
          file.close()
          try {
            fs.unlinkSync(dest)
          } catch {
            /* */
          }
          return reject(new Error(`HTTP ${res.statusCode}`))
        }
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve(dest)))
      })
      .on('error', reject)
  })
}

async function main() {
  const manifestPath = path.join(__dirname, 'realistimo-image-paths.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

  for (const [city, slug, url] of EXTRA) {
    const dir = path.join(root, 'public', 'images', 'quarters', city)
    fs.mkdirSync(dir, { recursive: true })
    const dest = path.join(dir, `${slug}.jpg`)
    await download(url, dest)
    if (!manifest[city]) manifest[city] = {}
    manifest[city][slug] = `/images/quarters/${city}/${slug}.jpg`
    console.log(`OK ${city}/${slug}`)
  }

  const npCity = '/images/cities/novi-pazar.jpg'
  if (!manifest['novi-pazar']) manifest['novi-pazar'] = {}
  for (const slug of ['centar', 'zapad', 'iztok', 'vilna-zona']) {
    manifest['novi-pazar'][slug] = npCity
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

main()
