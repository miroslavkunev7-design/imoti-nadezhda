/**
 * Calls production (or local) batch API with admin login.
 * Usage: node scripts/generate-virtual-tours-remote.mjs [--force] [--base=https://imoti-nadezhda.vercel.app]
 */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
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

const force = process.argv.includes('--force')
const baseArg = process.argv.find(a => a.startsWith('--base='))
const base = (baseArg?.split('=')[1] ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://imoti-nadezhda.vercel.app').replace(/\/$/, '')

const email = (process.env.ADMIN_EMAIL?.trim() || 'agenciq_nadejdi@abv.bg')
const password = (process.env.ADMIN_PASSWORD?.trim() || 'nadia740608!')

async function main() {
  console.log(`\n🔐 Вход в ${base}...`)
  const loginRes = await fetch(`${base}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const loginJson = await loginRes.json()
  if (!loginJson.success) {
    console.error('❌ Login failed:', loginJson.error)
    process.exit(1)
  }

  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0]
  if (!cookie) {
    console.error('❌ Няма session cookie')
    process.exit(1)
  }

  console.log(`⚙️  Batch генериране${force ? ' (force)' : ''}...`)
  const batchRes = await fetch(`${base}/api/admin/virtual-tours/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({ force }),
  })

  const batchJson = await batchRes.json()
  if (!batchJson.success) {
    console.error('❌ Batch failed:', batchJson.error)
    process.exit(1)
  }

  const { summary } = batchJson
  console.log(`\n✅ Готово: ${summary.ok} турa, ${summary.skip} пропуснати, ${summary.fail} грешки\n`)
  for (const r of summary.results) {
    if (r.status === 'ok') {
      console.log(`  ✅ #${r.propertyId} „${r.title}" → тур #${r.tourId} (${r.frameCount} кадъра, ${r.mode})`)
    } else if (r.status === 'skip') {
      console.log(`  ⏭  #${r.propertyId} „${r.title}" — вече има тур`)
    } else {
      console.log(`  ❌ #${r.propertyId} „${r.title}" — ${r.error}`)
    }
  }
  console.log('\nТествай: страница на имот → „3D Виртуален Оглед"\n')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
