/**
 * @deprecated Use scripts/strip-realistimo-branding.mjs instead (clean photos without Realistimo overlays).
 * Downloads quarter images from static.realistimo.com (source: realistimo.bg / realistimo.com).
 * Run: node scripts/strip-realistimo-branding.mjs && node scripts/generate-quarter-images-ts.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const manifestPath = path.join(__dirname, 'realistimo-quarter-links.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

/** Our site slug from Realistimo quarter name */
const SLUG_MAP = {
  shumen: {
    'Център': 'centar',
    'Тракия': 'trakiya',
    'Добруджански': 'dobrudjanski',
    'Пазара': 'pazara',
    'Болницата': 'bolnicata',
    'Пети полк': 'peti-polk',
    'Военно училище': 'voenno-uchilishte',
    'Боян Българанов 2': 'boyan-bulgarov-2',
    'Боян Българанов 1': 'boyan-bulgarov',
    'Дивдядово': 'divdyadovo',
    'Пожарната': 'pozharnata',
    'Херсон': 'herson',
    'Под манастира': 'pod-manastira',
    'Втори корпус': 'vtori-korpus',
    'Гривица': 'grivitsa',
    'Дивизионна болница': 'divizionna-bolnitsa',
    'Математическата гимназия': 'matematicheska-gimnazia',
    'Томбул Джамия': 'tombul-djamia',
    'Мътница': 'mtnitsa',
    'Еверест': 'everest',
    'Промишлена зона - Запад': 'promishlena-zona-zapad',
    'Топхане': 'tophane',
    'Куршун чешма': 'kurshun-cheshma',
    'Макак': 'makak',
    'Чашка': 'chashka',
    'м-ст Сакарка': 'sakarka',
    'Смесе': 'smese',
    'Промишлена зона - Юг': 'promishlena-zona-yug',
  },
  varna: {
    'Виница': 'vinica',
    'Владиславово': 'vladislavovo',
    'Аспарухово': 'asparuhovo',
    'Кайсиева градина': 'kaysiyeva-gradina',
    'Бриз': 'briz',
    'Младост 1': 'mladost',
    'Младост 2': 'mladost-2',
    'Ален мак': 'alen-mak',
    'Левски': 'levski',
    'Център': 'centar',
    'Трошево': 'troshevo',
    'Изгрев': 'izgrev',
    'Чайка': 'chayka',
    'Галата': 'galata',
    'Слънчев ден': 'slanchev-den',
    'Пчелина': 'pchelina',
    'Лятно кино Тракия': 'lyatno-kino-trakiya',
    'Победа': 'pobeda',
  },
  burgas: {
    'Меден Рудник': 'meden-rudnik',
    'Сарафово': 'sarafovo',
    'Изгрев': 'izgrev',
    'Славейков': 'slaveykov',
    'Център': 'centar',
    'Братя Миладинови': 'bratya-miladinovi',
    'Възраждане': 'vazrajdane',
    'Зорница': 'zornica',
    'Лазур': 'lazur',
    'Хоризонт': 'horizont',
    'Крайморие': 'kraimorie',
  },
  'novi-pazar': {
    'Център': 'centar',
    'Запад': 'zapad',
    'Изток': 'iztok',
    'Вилна зона': 'vilna-zona',
  },
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close()
          fs.unlinkSync(dest)
          return download(res.headers.location, dest).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) {
          file.close()
          fs.unlinkSync(dest)
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        }
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve(dest)))
      })
      .on('error', reject)
  })
}

async function main() {
  const out = {}
  for (const [city, quarters] of Object.entries(manifest)) {
    const dir = path.join(root, 'public', 'images', 'quarters', city)
    fs.mkdirSync(dir, { recursive: true })
    out[city] = {}

    for (const q of quarters) {
      const siteSlug = SLUG_MAP[city]?.[q.name]
      if (!siteSlug) {
        console.warn(`No slug map for ${city} / ${q.name}`)
        continue
      }
      if (!q.image) {
        console.warn(`No image URL for ${city} / ${q.name}`)
        continue
      }
      const dest = path.join(dir, `${siteSlug}.jpg`)
      try {
        await download(q.image, dest)
        out[city][siteSlug] = `/images/quarters/${city}/${siteSlug}.jpg`
        console.log(`OK ${city}/${siteSlug}.jpg`)
      } catch (e) {
        console.error(`FAIL ${city}/${siteSlug}:`, e.message)
      }
    }
  }
  fs.writeFileSync(path.join(__dirname, 'realistimo-image-paths.json'), JSON.stringify(out, null, 2))
}

main()
