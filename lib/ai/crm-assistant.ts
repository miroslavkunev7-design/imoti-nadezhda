import { isDbConfigured, query, queryOne, execute } from '@/lib/db'
import { toHostClientStatus } from '@/lib/db/mappers'
import {
  createLocalClient,
  deleteLocalClient,
  findLocalClientByName,
  listLocalClients,
} from '@/lib/local-store/clients'
import {
  buildContract,
  type ContractClientData,
  type ContractType,
} from '@/lib/ai/contract-templates'

export interface AiActionResult {
  ok: boolean
  message: string
  contract?: { title: string; content: string; filename: string }
  data?: Record<string, unknown>
}

export interface ClientContext {
  id: number
  name: string
  email: string
  phone: string
  status: string
  budget_min: number
  budget_max: number
  notes: string[]
  docHints: string[]
}

const EGN_RE = /\b\d{10}\b/g
const ID_CARD_RE = /(?:л\.?\s*к\.?|лична\s*карта|ЛК)[^\d]*(\d{6,9})/gi

export async function findClientByName(name: string): Promise<ClientContext | null> {
  const q = name.trim()
  if (!q) return null

  if (isDbConfigured()) {
    const row = await queryOne<{
      id: number
      name: string
      email: string
      phone: string
      status: string
      budget_min: number
      budget_max: number
    }>(
      `SELECT id, name, email, phone, status, budget_min, budget_max
       FROM crm_clients WHERE LOWER(name) LIKE LOWER(?) ORDER BY created_at DESC LIMIT 1`,
      [`%${q}%`]
    )
    if (row) return enrichClient(row)
  }

  const local = await findLocalClientByName(q)
  if (local) {
    return enrichClient({
      id: local.id,
      name: local.name,
      email: local.email,
      phone: local.phone,
      status: local.status,
      budget_min: local.budget_min,
      budget_max: local.budget_max,
    })
  }
  return null
}

async function enrichClient(row: {
  id: number
  name: string
  email: string
  phone: string
  status: string
  budget_min: number
  budget_max: number
}): Promise<ClientContext> {
  const notes: string[] = []
  const docHints: string[] = []

  if (isDbConfigured()) {
    try {
      const noteRows = await query<{ note: string }>(
        `SELECT note FROM crm_notes WHERE client_id = ? ORDER BY created_at DESC LIMIT 20`,
        [row.id]
      )
      notes.push(...noteRows.map(n => n.note))
    } catch { /* optional */ }

    try {
      const mortgages = await query<{ files: unknown; notes: string | null }>(
        `SELECT files, notes FROM crm_mortgage_applications WHERE client_id = ? ORDER BY created_at DESC LIMIT 5`,
        [row.id]
      )
      for (const m of mortgages) {
        if (m.notes) docHints.push(m.notes)
        const files = m.files as Record<string, { name?: string; url?: string }[]>
        if (files && typeof files === 'object') {
          for (const arr of Object.values(files)) {
            if (Array.isArray(arr)) {
              for (const f of arr) {
                if (f?.name) docHints.push(f.name)
                if (f?.url) docHints.push(f.url)
              }
            }
          }
        }
      }
    } catch { /* optional */ }
  }

  return { ...row, notes, docHints }
}

function extractIdData(text: string): Partial<ContractClientData> {
  const blob = text
  const egn = blob.match(EGN_RE)?.[0]
  const idMatch = [...blob.matchAll(ID_CARD_RE)][0]
  return {
    egn: egn ?? undefined,
    id_card: idMatch?.[1] ?? undefined,
  }
}

function clientToContractData(ctx: ClientContext): ContractClientData {
  const merged = [ctx.name, ctx.email, ctx.phone, ...ctx.notes, ...ctx.docHints].join('\n')
  const extracted = extractIdData(merged)
  return {
    name: ctx.name,
    email: ctx.email ?? '',
    phone: ctx.phone ?? '',
    egn: extracted.egn,
    id_card: extracted.id_card,
    notes: ctx.notes.slice(0, 3).join('; ') || undefined,
  }
}

function detectContractType(text: string): ContractType {
  const t = text.toLowerCase()
  if (t.includes('наем')) return 'rent'
  if (t.includes('резерва')) return 'reservation'
  if (t.includes('покупко') || t.includes('продажба')) return 'sale'
  return 'preliminary'
}

function extractClientNameFromPrompt(text: string): string | null {
  const patterns = [
    /(?:клиент|на\s+клиент|за)\s+([А-Яа-яA-Za-z][А-Яа-яA-Za-z\s.-]{2,40})/i,
    /договор\s+(?:за|на)\s+([А-Яа-я][А-Яа-я\s.-]{2,40})/i,
    /([А-Яа-я][а-я]+(?:\s+[А-Яа-я][а-я]+)?)\s*$/i,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m?.[1]) {
      const name = m[1].trim().replace(/\s+(пример|моля|бързо)$/i, '')
      if (name.length > 2 && !/договор|предварителен|напиши/i.test(name)) return name
    }
  }
  return null
}

async function callOpenAi(userMessage: string, context: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) return null

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'Ти си CRM асистент на български за агенция „Имоти Надежда". ' +
              'Помагаш с клиенти, обяви, график, брокери и договори. Отговаряй кратко и ясно. ' +
              'При договори използвай официален правен стил на български.\n\n' +
              `Контекст от системата:\n${context}`,
          },
          { role: 'user', content: userMessage },
        ],
      }),
    })
    const json = await res.json()
    return json.choices?.[0]?.message?.content?.trim() ?? null
  } catch {
    return null
  }
}

export async function runCrmAssistant(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<AiActionResult> {
  const text = userMessage.trim()
  const lower = text.toLowerCase()

  if (!text) {
    return { ok: false, message: 'Напишете какво искате да направя.' }
  }

  // ── Договор ──
  if (/договор|предварителен|споразумение|наемен/i.test(lower)) {
    const name = extractClientNameFromPrompt(text)
    if (!name) {
      return {
        ok: false,
        message: 'Посочете името на клиента, напр.: „Напиши предварителен договор за клиент Златомир".',
      }
    }
    const client = await findClientByName(name)
    if (!client) {
      return {
        ok: false,
        message: `Не намерих клиент „${name}" в базата. Добавете го първо от Клиенти → Добави клиент.`,
      }
    }
    const type = detectContractType(text)
    const contract = buildContract(type, clientToContractData(client))
    const docNote =
      client.docHints.length > 0
        ? `\n\n📎 Използвах ${client.docHints.length} прикачен/и документ/а (имена/бележки) за данни.`
        : ''
    return {
      ok: true,
      message: `Готов ${contract.title} за ${client.name}.${docNote} Натиснете „Изтегли файл".`,
      contract,
      data: { clientId: client.id, clientName: client.name },
    }
  }

  // ── Добави клиент ──
  if (/добави\s+клиент|нов\s+клиент|създай\s+клиент/i.test(lower)) {
    const nameMatch = text.match(/(?:име|клиент)\s+([А-Яа-я][А-Яа-я\s.-]{2,40})/i)
    const emailMatch = text.match(/([\w.+-]+@[\w.-]+\.\w+)/)
    const phoneMatch = text.match(/(0\d{9,10}|\+359\d{8,9})/)
    const name = nameMatch?.[1]?.trim()
    const email = emailMatch?.[1]
    if (!name || !email) {
      return {
        ok: false,
        message:
          'За нов клиент посочете име и имейл, напр.: „Добави клиент име Мария Иванова имейл maria@mail.bg тел 0888123456".',
      }
    }
    return createClientRecord({
      name,
      email,
      phone: phoneMatch?.[1] ?? '',
      source: 'direct',
      budget_min: '',
      budget_max: '',
    })
  }

  // ── Изтрий клиент ──
  if (/изтрий\s+клиент|премахни\s+клиент/i.test(lower)) {
    const name = extractClientNameFromPrompt(text) ?? text.replace(/изтрий|клиент|премахни/gi, '').trim()
    const client = await findClientByName(name)
    if (!client) return { ok: false, message: `Клиент „${name}" не е намерен.` }
    if (isDbConfigured()) {
      try {
        await execute(`DELETE FROM crm_notes WHERE client_id = ?`, [client.id])
        await execute(`DELETE FROM crm_clients WHERE id = ?`, [client.id])
      } catch {
        return { ok: false, message: 'Грешка при изтриване от базата.' }
      }
    } else {
      await deleteLocalClient(client.id)
    }
    return { ok: true, message: `Клиентът „${client.name}" е изтрит.`, data: { clientId: client.id } }
  }

  // ── График / среща ──
  if (/график|среща|час|календар|запиши/i.test(lower)) {
    const dateMatch = text.match(/(\d{1,2}[./]\d{1,2}[./]\d{2,4})/)
    const timeMatch = text.match(/(\d{1,2}:\d{2})/)
    const clientName = extractClientNameFromPrompt(text)
    if (!dateMatch) {
      return {
        ok: false,
        message: 'Посочете дата, напр.: „Запиши среща на 25.05.2026 в 10:30 за клиент Златомир".',
      }
    }
    const [d, m, y] = dateMatch[1].replace(/\./g, '/').split('/')
    const isoDate = `${y.length === 2 ? '20' + y : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    let clientId: number | null = null
    if (clientName) {
      const c = await findClientByName(clientName)
      clientId = c?.id ?? null
    }
    if (isDbConfigured()) {
      try {
        await execute(
          `INSERT INTO appointments (appointment_date, appointment_time, client_id, status, notes)
           VALUES (?, ?, ?, 'scheduled', ?)`,
          [isoDate, timeMatch?.[1] ?? '10:00', clientId, text.slice(0, 500)]
        )
        return {
          ok: true,
          message: `Записах среща на ${isoDate}${timeMatch ? ' в ' + timeMatch[1] : ''}${clientName ? ' за ' + clientName : ''}.`,
        }
      } catch {
        return { ok: false, message: 'Грешка при запис в календара.' }
      }
    }
    return { ok: false, message: 'Календарът изисква връзка с базата данни.' }
  }

  // ── Обяви ──
  if (/изтрий\s+обява|изтрии\s+имот|премахни\s+обява/i.test(lower)) {
    const idMatch = text.match(/#?(\d{1,6})/)
    if (!idMatch) return { ok: false, message: 'Посочете номер на обявата, напр. „Изтрий обява #12".' }
    const id = parseInt(idMatch[1], 10)
    if (isDbConfigured()) {
      try {
        await execute(`DELETE FROM property_images WHERE property_id = ?`, [id])
        await execute(`DELETE FROM properties WHERE id = ?`, [id])
        return { ok: true, message: `Обявата #${id} е изтрита.` }
      } catch {
        return { ok: false, message: 'Грешка при изтриване на обявата.' }
      }
    }
    const { deleteLocalProperty } = await import('@/lib/local-store/properties')
    const ok = await deleteLocalProperty(id)
    return ok
      ? { ok: true, message: `Локалната обява #${id} е изтрита.` }
      : { ok: false, message: `Обява #${id} не е намерена.` }
  }

  // ── Помощ ──
  if (/помощ|какво\s+можеш|команди/i.test(lower)) {
    return {
      ok: true,
      message:
        'Мога да:\n' +
        '• Добавя/изтрива клиенти\n' +
        '• Записва срещи в каленара\n' +
        '• Изтрива обяви по номер\n' +
        '• Генерира договор (предварителен, продажба, наем) — използвам данни и прикачени документи на клиента\n\n' +
        'Примери:\n' +
        '„Напиши предварителен договор за клиент Златомир"\n' +
        '„Добави клиент име Иван Петров имейл ivan@test.com"\n' +
        '„Запиши среща на 20.06.2026 в 11:00 за Мария"',
    }
  }

  // ── OpenAI fallback ──
  const clients = isDbConfigured()
    ? await query<{ name: string; email: string }>(
        `SELECT name, email FROM crm_clients ORDER BY created_at DESC LIMIT 15`
      )
    : await listLocalClients()

  const context =
    `Последни клиенти: ${clients.map(c => c.name).join(', ') || 'няма'}\n` +
    history
      .slice(-4)
      .map(h => `${h.role}: ${h.content}`)
      .join('\n')

  const ai = await callOpenAi(text, context)
  if (ai) return { ok: true, message: ai }

  return {
    ok: true,
    message:
      'Не успях да обработя заявката автоматично. Активирайте Милена с OPENAI_API_KEY в настройките на сървъра за свободен разговор.',
  }
}

async function createClientRecord(form: {
  name: string
  email: string
  phone: string
  source: string
  budget_min: string
  budget_max: string
}): Promise<AiActionResult> {
  try {
    if (isDbConfigured()) {
      const result = await execute(
        `INSERT INTO crm_clients (name, email, phone, status, budget_min, budget_max, source)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          form.name.trim(),
          form.email.trim(),
          form.phone?.trim() || null,
          toHostClientStatus('lead'),
          form.budget_min ? Number(form.budget_min) : null,
          form.budget_max ? Number(form.budget_max) : null,
          form.source || 'website',
        ]
      )
      if (!result.insertId) {
        return { ok: false, message: 'Клиентът не беше записан — проверете базата.' }
      }
      return {
        ok: true,
        message: `Клиентът „${form.name}" е добавен (ID ${result.insertId}).`,
        data: { clientId: result.insertId },
      }
    }

    const record = await createLocalClient({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone?.trim() || '',
      source: form.source || 'website',
      status: 'lead',
      budget_min: Number(form.budget_min) || 0,
      budget_max: Number(form.budget_max) || 0,
    })
    return {
      ok: true,
      message: `Клиентът „${record.name}" е добавен локално (ID ${record.id}).`,
      data: { clientId: record.id },
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Грешка'
    return { ok: false, message: `Неуспешно добавяне: ${msg}` }
  }
}
