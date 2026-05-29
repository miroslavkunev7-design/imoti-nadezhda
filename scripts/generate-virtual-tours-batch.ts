/**
 * Batch-generate published virtual tours for all properties with ≥2 images.
 * Usage: npx tsx scripts/generate-virtual-tours-batch.ts [--force]
 */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) return
  const raw = readFileSync(path, 'utf-8')
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 1) continue
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvLocal()

import { isDbConfigured } from '../lib/db'
import { runVirtualTourBatch } from '../lib/virtual-tour/batch'
import { MIN_FRAMES_SLIDESHOW } from '../lib/virtual-tour/constants'

async function main() {
  const force = process.argv.includes('--force')

  if (!isDbConfigured()) {
    console.error('❌ Няма DB URL — пусни: npm run vtour:remote (production) или попълни POSTGRES_URL в .env.local')
    process.exit(1)
  }

  const targets = await import('../lib/virtual-tour/batch').then(m => m.listPropertiesForVirtualTourBatch())
  console.log(`\n🏠 Имоти с ≥${MIN_FRAMES_SLIDESHOW} снимки: ${targets.length}\n`)

  const summary = await runVirtualTourBatch({ force })

  for (const r of summary.results) {
    if (r.status === 'ok') {
      console.log(`✅ #${r.propertyId} „${r.title}" → тур #${r.tourId} (${r.frameCount} кадъра)`)
    } else if (r.status === 'skip') {
      console.log(`⏭  #${r.propertyId} „${r.title}" — вече има тур`)
    } else {
      console.log(`❌ #${r.propertyId} „${r.title}" — ${r.error}`)
    }
  }

  console.log(`\nГотово: ${summary.ok} генерирани, ${summary.skip} пропуснати, ${summary.fail} грешки.\n`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
