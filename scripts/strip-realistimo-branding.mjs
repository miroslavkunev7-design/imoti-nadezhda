/**
 * Re-downloads clean quarter thumbnails from Realistimo city pages (no OG composites).
 * For quarters only available as OG composites, crops the photo area (removes banner/logo).
 */
import fs from 'fs'
import path from 'path'
import https from 'https'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const manifestPath = path.join(__dirname, 'realistimo-clean-thumbs.json')

/** Realistimo buy slug → our site slug */
const SITE_SLUG = {
  shumen: {
    center: 'centar',
    trakiya: 'trakiya',
    dobrudzhanski: 'dobrudjanski',
    pazara: 'pazara',
    bolnitsata: 'bolnicata',
    'peti-polk': 'peti-polk',
    'voenno-uchilishte': 'voenno-uchilishte',
    'boyan-balgaranov-2': 'boyan-bulgarov-2',
    divdiadovo: 'divdyadovo',
    'boyan-balgaranov-1': 'boyan-bulgarov',
    pozharnata: 'pozharnata',
    herson: 'herson',
    'pod-manastira': 'pod-manastira',
    'vtori-korpus': 'vtori-korpus',
    grivitsa: 'grivitsa',
    'divizionna-bolnitsa': 'divizionna-bolnitsa',
    'matematicheskata-gimnazia': 'matematicheska-gimnazia',
    'tombul-djamia': 'tombul-djamia',
    mtnitsa: 'mtnitsa',
    everest: 'everest',
    'promishlena-zona-zapad': 'promishlena-zona-zapad',
    tophane: 'tophane',
    'kurshun-cheshma': 'kurshun-cheshma',
    makak: 'makak',
    chashka: 'chashka',
    sakarka: 'sakarka',
    smese: 'smese',
    'promishlena-zona-yug': 'promishlena-zona-yug',
  },
  varna: {
    vinica: 'vinica',
    vladislavovo: 'vladislavovo',
    asparuhovo: 'asparuhovo',
    'kaysiyeva-gradina': 'kaysiyeva-gradina',
    briz: 'briz',
    'mladost-1': 'mladost',
    'alen-mak': 'alen-mak',
    'levski-1': 'levski',
    center: 'centar',
    troshevo: 'troshevo',
    izgrev: 'izgrev',
    chaika: 'chayka',
    galata: 'galata',
    'mladost-2': 'mladost-2',
    pchelina: 'pchelina',
    pobeda: 'pobeda',
    'slnchev-den': 'slanchev-den',
    'liatno-kino-trakia': 'lyatno-kino-trakiya',
  },
  burgas: {
    'meden-rudnik': 'meden-rudnik',
    sarafovo: 'sarafovo',
    izgrev: 'izgrev',
    tsentr: 'centar',
    slaveykov: 'slaveykov',
    'bratya-miladinovi': 'bratya-miladinovi',
    vzrazhdane: 'vazrajdane',
    zornitsa: 'zornica',
    lazur: 'lazur',
    horizont: 'horizont',
    kraymoriye: 'kraimorie',
  },
}

/** Embedded clean thumbnails from Realistimo listing pages */
const CLEAN_THUMBS = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

const OG_ONLY = new Set([
  // legacy og hashes — crop if no clean thumb
  'b370ca22a94d51f1869661a1134023bd08e98dbf.jpg',
  '8382a551296d688df967a8388c5108afe1d38abd.jpg',
  '472db01900ea378da775641fdbc78d76ee9e60dd.jpg',
  'cef9c2c802a394a6d364198662e8f7f9ae88fdee.jpg',
  '632dbe18f3f225cccfbb58dd8a5cc0391ff03b55.jpg',
  '14b4e40db8f15fd86909fc053e1ebdc066d5bff2.jpg',
  '71d43a3c633180d8bd48fce0f0f6ea216ead31ea.jpg',
  'b033b3f2028b1f4084a9607a2b0b6d5f152dfd00.jpg',
  '1c23121af76e986464e4d41ebc991b781b8ba22a.jpg',
  'a1ff266f29fcbad73e15bd9512e69a0b1cbbeef6.jpg',
  '5546844cdc161df490571e3b8c5613ce6b98607c.jpg',
  '2c83ce3e4e870560585dcefec69ed51a1e5cb6a6.jpg',
  '63c469429ed3cf4bf185c910a3287e6a20f2c024.jpg',
  '44264983dd72349340e89fc7555cc142975af16f.jpg',
  '4ce92ec59f508676d30dec748ca01902e3d162bf.jpg',
  '91f6609173f6c5dea2ac273fd15587337abcfe0f.jpg',
])

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://realistimo.com/',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      }, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return download(res.headers.location).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`))
        }
        const chunks = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', reject)
  })
}

async function processImage(buffer, url) {
  const hash = url.split('/').pop() ?? ''
  const meta = await sharp(buffer).metadata()
  const w = meta.width ?? 800
  const h = meta.height ?? 600

  const isOgComposite = OG_ONLY.has(hash) || url.includes('og:image')

  if (!isOgComposite && (hash.endsWith('.jpeg') || hash.endsWith('.jpg'))) {
    const meta2 = await sharp(buffer).metadata()
    const w2 = meta2.width ?? 800
    const h2 = meta2.height ?? 600
    // Trim bottom-right corner where Realistimo sometimes stamps a faint logo
    return sharp(buffer)
      .extract({
        left: 0,
        top: 0,
        width: Math.max(100, Math.floor(w2 * 0.92)),
        height: Math.max(100, Math.floor(h2 * 0.92)),
      })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer()
  }

  // OG composite: keep upper photo only (above red title bar + logo)
  const cropH = Math.max(120, Math.floor(h * 0.36))
  return sharp(buffer)
    .extract({ left: 0, top: 0, width: w, height: cropH })
    .resize({ width: 960, withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}

async function main() {
  const out = {}

  for (const [city, quarters] of Object.entries(CLEAN_THUMBS)) {
    const dir = path.join(root, 'public', 'images', 'quarters', city)
    fs.mkdirSync(dir, { recursive: true })
    out[city] = {}

    for (const [buySlug, data] of Object.entries(quarters)) {
      const siteSlug = SITE_SLUG[city]?.[buySlug]
      if (!siteSlug) {
        console.warn(`No site slug: ${city}/${buySlug}`)
        continue
      }

      try {
        const buf = await download(data.image)
        const clean = await processImage(buf, data.image)
        const dest = path.join(dir, `${siteSlug}.jpg`)
        await sharp(clean).toFile(dest)
        out[city][siteSlug] = `/images/quarters/${city}/${siteSlug}.jpg`
        console.log(`OK ${city}/${siteSlug}.jpg`)
      } catch (e) {
        console.error(`FAIL ${city}/${buySlug}:`, e.message)
      }
    }
  }

  /** Quarter buy path → clean .jpeg from listing page (fallback: OG .jpg cropped) */
  const EXTRA = {
    shumen: {
      'pod-manastira': { path: 'pod-manastira', og: 'b370ca22a94d51f1869661a1134023bd08e98dbf.jpg' },
      'vtori-korpus': { path: 'vtori-korpus', og: '8382a551296d688df967a8388c5108afe1d38abd.jpg' },
      grivitsa: { path: 'grivitsa', og: '472db01900ea378da775641fdbc78d76ee9e60dd.jpg' },
      'divizionna-bolnitsa': { path: 'divizionna-bolnitsa', og: 'cef9c2c802a394a6d364198662e8f7f9ae88fdee.jpg' },
      'matematicheska-gimnazia': { path: 'matematicheskata-gimnazia', og: '632dbe18f3f225cccfbb58dd8a5cc0391ff03b55.jpg' },
      'tombul-djamia': { path: 'tombul-djamia', og: '14b4e40db8f15fd86909fc053e1ebdc066d5bff2.jpg' },
      mtnitsa: { path: 'mtnitsa', og: '71d43a3c633180d8bd48fce0f0f6ea216ead31ea.jpg' },
      everest: { path: 'everest', og: 'b033b3f2028b1f4084a9607a2b0b6d5f152dfd00.jpg' },
      'promishlena-zona-zapad': { path: 'promishlena-zona-zapad', og: '1c23121af76e986464e4d41ebc991b781b8ba22a.jpg' },
      tophane: { path: 'tophane', og: 'a1ff266f29fcbad73e15bd9512e69a0b1cbbeef6.jpg' },
      'kurshun-cheshma': { path: 'kurshun-cheshma', og: '5546844cdc161df490571e3b8c5613ce6b98607c.jpg' },
      makak: { path: 'makak', og: '2c83ce3e4e870560585dcefec69ed51a1e5cb6a6.jpg' },
      chashka: { path: 'chashka', og: '63c469429ed3cf4bf185c910a3287e6a20f2c024.jpg' },
      sakarka: { path: 'sakarka', og: '44264983dd72349340e89fc7555cc142975af16f.jpg' },
      smese: { path: 'smese', og: '4ce92ec59f508676d30dec748ca01902e3d162bf.jpg' },
      'promishlena-zona-yug': {
        path: 'promishlena-zona-yug',
        og: '91f6609173f6c5dea2ac273fd15587337abcfe0f.jpg',
      },
    },
    varna: {
      izgrev: { path: 'izgrev', jpeg: 'https://static.realistimo.com/images/e52a00dc962920b6c317d04f4a65aa633098c4d2.jpeg' },
      chayka: { path: 'chaika', og: 'd9ff587e4a2f61abc8dc3655a24b7d8e6af45a52.jpg' },
      galata: { path: 'galata', jpeg: 'https://static.realistimo.com/images/45c8cd9f3ead65baea5ace6f6c4068336e583594.jpeg' },
      'mladost-2': { path: 'mladost-2', og: '589548c167541d37e9fea75cafd9bd442dba1ae7.jpg' },
      pchelina: { path: 'pchelina', jpeg: 'https://static.realistimo.com/images/b601c1ac307a7af70baf603bbcc9e359436369d5.jpeg' },
      pobeda: { path: 'pobeda', jpeg: 'https://static.realistimo.com/images/08febab068cf640921ab59393dbaaddde830e3a5.jpeg' },
      'slanchev-den': { path: 'slnchev-den', og: 'fa1a0a24074a7304fafe555b8cca901e0e152131.jpg' },
      'lyatno-kino-trakiya': {
        path: 'liatno-kino-trakia',
        jpeg: 'https://static.realistimo.com/images/24fe770c108bfc3f34669f86fa2d9a09ee3a7165.jpeg',
      },
    },
  }

  async function fetchQuarterJpeg(buyPath, city) {
    return new Promise((resolve, reject) => {
      const url = `https://realistimo.com/bg/buy/${buyPath}-${city}-bg/`
      https
        .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
          let data = ''
          res.on('data', c => (data += c))
          res.on('end', () => {
            const m = data.match(/https:\/\/static\.realistimo\.com\/images\/[a-f0-9]+\.jpeg/i)
            resolve(m ? m[0] : null)
          })
        })
        .on('error', reject)
    })
  }

  for (const [city, map] of Object.entries(EXTRA)) {
    if (!out[city]) out[city] = {}
    const dir = path.join(root, 'public', 'images', 'quarters', city)
    for (const [siteSlug, spec] of Object.entries(map)) {
      try {
        let url = spec.jpeg ?? null
        if (!url && spec.path) {
          url = await fetchQuarterJpeg(spec.path, city)
        }
        if (!url && spec.og) {
          url = `https://static.realistimo.com/images/${spec.og}`
        }
        if (!url) {
          console.warn(`SKIP ${city}/${siteSlug}: no image`)
          continue
        }
        const buf = await download(url)
        const clean = await processImage(buf, url)
        await sharp(clean).toFile(path.join(dir, `${siteSlug}.jpg`))
        out[city][siteSlug] = `/images/quarters/${city}/${siteSlug}.jpg`
        console.log(`${url.includes('.jpeg') ? 'JPEG' : 'CROP'} ${city}/${siteSlug}.jpg`)
      } catch (e) {
        console.error(`FAIL ${city}/${siteSlug}:`, e.message)
      }
    }
  }

  out['novi-pazar'] = {
    centar: '/images/cities/novi-pazar.jpg',
    zapad: '/images/cities/novi-pazar.jpg',
    iztok: '/images/cities/novi-pazar.jpg',
    'vilna-zona': '/images/cities/novi-pazar.jpg',
  }

  fs.writeFileSync(
    path.join(__dirname, 'realistimo-image-paths.json'),
    JSON.stringify(out, null, 2)
  )
}

main()
