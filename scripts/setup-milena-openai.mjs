#!/usr/bin/env node
/**
 * Добавя OPENAI_API_KEY локално и във Vercel (production + preview + development).
 * Употреба: node scripts/setup-milena-openai.mjs sk-...
 * или: set OPENAI_SETUP_KEY=sk-... && node scripts/setup-milena-openai.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { spawnSync } from 'child_process'
import { join } from 'path'

const key = (process.argv[2] || process.env.OPENAI_SETUP_KEY || '').trim()
const model = (process.env.OPENAI_MODEL || 'gpt-4o').trim()

if (!key.startsWith('sk-')) {
  console.error('Нужен е валиден OpenAI ключ (започва с sk-).')
  console.error('Пример: node scripts/setup-milena-openai.mjs sk-proj-...')
  process.exit(1)
}

const root = process.cwd()
const localPath = join(root, '.env.local')

function upsertEnvFile(filePath, entries) {
  let lines = []
  if (existsSync(filePath)) {
    lines = readFileSync(filePath, 'utf8').split(/\r?\n/)
  }
  const keys = new Set(entries.map(([k]) => k))
  const kept = lines.filter(line => {
    const m = line.match(/^([A-Z0-9_]+)=/)
    return !m || !keys.has(m[1])
  })
  const trimmed = kept.join('\n').replace(/\n+$/, '')
  const block = entries.map(([k, v]) => `${k}=${v}`).join('\n')
  const out = trimmed ? `${trimmed}\n\n# Milena AI\n${block}\n` : `# Milena AI\n${block}\n`
  writeFileSync(filePath, out, 'utf8')
}

upsertEnvFile(localPath, [
  ['OPENAI_API_KEY', key],
  ['OPENAI_MODEL', model],
])

function vercelEnvAdd(name, value, environment) {
  const r = spawnSync(
    'npx',
    [
      'vercel',
      'env',
      'add',
      name,
      environment,
      '--value',
      value,
      '--yes',
      '--force',
      '--sensitive',
    ],
    {
      cwd: root,
      encoding: 'utf8',
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    }
  )
  if (r.status !== 0) {
    const err = (r.stderr || r.stdout || '').trim()
    console.warn(`[${environment}] ${name}: ${err || 'failed'}`)
    return false
  }
  console.log(`[${environment}] ${name} — OK`)
  return true
}

for (const env of ['production', 'preview', 'development']) {
  vercelEnvAdd('OPENAI_API_KEY', key, env)
  vercelEnvAdd('OPENAI_MODEL', model, env)
}

console.log('\nГотово. Стартирай: npx vercel --prod --yes')
