/**
 * Тест на DB bridge — node scripts/test-bridge.mjs
 * Чете DB_BRIDGE_URL и DB_BRIDGE_KEY от .env.local
 */
import fs from 'fs'

function loadEnv() {
  const path = '.env.local'
  if (!fs.existsSync(path)) {
    console.error('Липсва .env.local — копирай от .env.example')
    process.exit(1)
  }
  return Object.fromEntries(
    fs
      .readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
      })
  )
}

const env = loadEnv()
const url = env.DB_BRIDGE_URL?.trim()
const key = env.DB_BRIDGE_KEY?.trim()

if (!url || !key) {
  console.error('Задай DB_BRIDGE_URL и DB_BRIDGE_KEY в .env.local')
  process.exit(1)
}

console.log('URL:', url)
console.log('POST test query...')

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key,
    action: 'query',
    sql: 'SELECT 1 AS ok',
    params: [],
  }),
})

const text = await res.text()
console.log('HTTP:', res.status)
console.log('Content-Type:', res.headers.get('content-type') ?? '(none)')

try {
  const json = JSON.parse(text)
  if (json.success) {
    console.log('OK — bridge работи:', json.rows)
  } else {
    console.log('Bridge грешка:', json.error)
    process.exit(1)
  }
} catch {
  console.log('Отговорът НЕ е JSON (обикновено HTML страница):')
  console.log(text.slice(0, 400))
  process.exit(1)
}
