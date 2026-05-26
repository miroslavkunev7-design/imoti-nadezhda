/**
 * Fetches og:image from Realistimo quarter pages and downloads to public/images/quarters/
 */
import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const QUARTERS = {
  shumen: [
    ['mtnitsa', 'mtnitsa-shumen-bg'],
    ['promishlena-zona-zapad', 'promishlena-zona-zapad-shumen-bg'],
    ['tophane', 'tophane-shumen-bg'],
    ['kurshun-cheshma', 'kurshun-cheshma-shumen-bg'],
    ['makak', 'makak-shumen-bg'],
    ['chashka', 'chashka-shumen-bg'],
    ['sakarka', 'sakarka-shumen-bg'],
    ['smese', 'smese-shumen-bg'],
    ['promishlena-zona-yug', 'promishlena-zona-yug-shumen-bg'],
  ],
  'novi-pazar': [
    ['centar', 'centar-novi-pazar-bg'],
    ['zapad', 'zapad-novi-pazar-bg'],
    ['iztok', 'iztok-novi-pazar-bg'],
    ['vilna-zona', 'vilna-zona-novi-pazar-bg'],
  ],
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return fetchText(res.headers.location).then(resolve).catch(reject)
        }
        let data = ''
        res.on('data', c => (data += c))
        res.on('end', () => resolve(data))
      })
      .on('error', reject)
  })
}

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

  for (const [city, items] of Object.entries(QUARTERS)) {
    const dir = path.join(root, 'public', 'images', 'quarters', city)
    fs.mkdirSync(dir, { recursive: true })
    if (!manifest[city]) manifest[city] = {}

    for (const [slug, buySlug] of items) {
      const pageUrl = `https://realistimo.com/bg/buy/${buySlug}/`
      try {
        const html = await fetchText(pageUrl)
        const image = html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1]
        if (!image) {
          console.warn(`No og:image ${city}/${slug}`)
          continue
        }
        const dest = path.join(dir, `${slug}.jpg`)
        await download(image, dest)
        manifest[city][slug] = `/images/quarters/${city}/${slug}.jpg`
        console.log(`OK ${city}/${slug}.jpg`)
      } catch (e) {
        console.error(`FAIL ${city}/${slug}:`, e.message)
      }
      await new Promise(r => setTimeout(r, 200))
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

main()
