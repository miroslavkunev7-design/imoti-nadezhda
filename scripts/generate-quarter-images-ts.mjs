import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'realistimo-image-paths.json'), 'utf8')
)

let out = `/** Auto-generated from scripts/realistimo-image-paths.json — Realistimo quarter photos */\nexport const QUARTER_IMAGES: Record<string, Record<string, string>> = {\n`

for (const [city, quarters] of Object.entries(manifest)) {
  if (!Object.keys(quarters).length) continue
  out += `  ${city.includes('-') ? `'${city}'` : city}: {\n`
  for (const [slug, url] of Object.entries(quarters).sort(([a], [b]) => a.localeCompare(b))) {
    const key = slug.includes('-') ? `'${slug}'` : slug
    out += `    ${key}: '${url}',\n`
  }
  out += `  },\n`
}

out += `}\n\nexport function quarterImageUrl(citySlug: string, quarterSlug: string): string | null {\n`
out += `  return QUARTER_IMAGES[citySlug]?.[quarterSlug] ?? null\n}\n`

fs.writeFileSync(path.join(__dirname, '..', 'lib', 'data', 'quarter-images.ts'), out)
console.log('Wrote lib/data/quarter-images.ts')
