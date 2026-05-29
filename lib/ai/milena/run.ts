import { isDbConfigured, query } from '@/lib/db'
import type { SessionUser } from '@/lib/auth/session'
import { detectBlockedIntent, denyMessage } from '@/lib/ai/milena/permissions'
import { getMemoryContext } from '@/lib/ai/milena/memory'
import { MILENA_OPENAI_TOOLS } from '@/lib/ai/milena/tools-schema'
import { executeMilenaTool, type MilenaToolResult } from '@/lib/ai/milena/tools'
import { runLocalMilenaBackup } from '@/lib/ai/milena/local-commands'
import { resolveMilenaLlmConfig, milenaLlmAvailable } from '@/lib/ai/milena/provider'
import { listLocalClients } from '@/lib/local-store/clients'

export interface MilenaReply {
  ok: boolean
  message: string
  contract?: { title: string; content: string; filename: string }
  imageUrl?: string
  data?: Record<string, unknown>
}

export interface MilenaAttachment {
  url: string
  name: string
  type: string
}

const MAX_ROUNDS = Number(process.env.MILENA_MAX_TOOL_ROUNDS) || 22

export async function getMilenaApiKey(): Promise<string | null> {
  const cfg = await resolveMilenaLlmConfig()
  return cfg?.apiKey ?? null
}

function buildSystemPrompt(session: SessionUser, memory: string, crmBrief: string): string {
  const role =
    session.role === 'admin'
      ? 'Администратор - пълен достъп до всички функции.'
      : 'Брокер - без изтриване/експорт на клиенти.'

  return `Ти си Милена - AI асистент на агенция "Имоти Надежда". Говориш САМО на български.

Потребител: ${session.name ?? 'Потребител'} (${session.role})
Роля: ${role}

== ОСНОВНИ ПРАВИЛА ==
1. НИКОГА не казвай "опитайте по-конкретна команда" - ЗАБРАНЕНО.
2. НИКОГА не показвай списъци с шаблони или примерни команди.
3. Разбираш свободен разговор - потребителите пишат как им е удобно.
4. При задача - изпълни я директно с инструментите. При въпрос - отговори директно.
5. Отговаряй кратко и ясно, като опитен колега-брокер.
6. Имаш достъп до цялата база данни: имоти, клиенти, запитвания, договори, собственици.

== СВОБОДЕН РАЗГОВОР ==
- Можеш да говориш на всякакви теми - пазар на имоти, лихви, квартали, съвети за купуване.
- При поздрав - отговори приятелски и попитай с какво можеш да помогнеш.
- При неясна задача - интерпретирай смисъла от контекста и действай.

== CRM ЗАДАЧИ (използвай tools) ==
- Промяна на цена: update_property (property_id + price_eur)
- Добавяне на клиент: add_client (email не е задължителен)
- Насрочване на среща: schedule_appointment
- Договор: create_contract
- Търсене на клиент: search_client
- Извличане на имоти от сайтове: sync_marketplace_leads
- Изтриване: delete_property или delete_client (само за admin)

${memory ? `== ПАМЕТ ==\n${memory}\n` : ''}== ТЕКУЩИ ДАННИ ==
${crmBrief}`
}

async function crmBrief(): Promise<string> {
  const clients = isDbConfigured()
    ? await query<{ name: string; city?: string; property_type?: string }>(`SELECT name, city, property_type FROM crm_clients ORDER BY created_at DESC LIMIT 15`)
    : await listLocalClients()
  const props = isDbConfigured()
    ? await query<{ id: number; title: string; price: number; city: string; quarter: string }>(
        `SELECT id, title, price, city, quarter FROM properties WHERE status != 'archived' ORDER BY id DESC LIMIT 12`
      )
    : []
  const propLine = props.length
    ? `Имоти: ${props.map(p => `#${p.id} "${p.title}" ${p.city}/${p.quarter} - ${Number(p.price).toLocaleString('bg-BG')} EUR`).join('; ')}`
    : 'Няма активни имоти.'
  const clientLine = clients.length
    ? `Клиенти: ${clients.map(c => c.name).join(', ')}`
    : 'Няма клиенти.'
  return `${clientLine}\n${propLine}`
}

async function runOpenAiChat(
  session: SessionUser,
  userContent: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<MilenaReply> {
  const llm = await resolveMilenaLlmConfig()
  if (!llm) {
    throw new Error('NO_API_KEY')
  }

  const memory = await getMemoryContext(session.id)
  const { apiKey: key, chatUrl, model } = llm

  const messages: Array<Record<string, unknown>> = [
    { role: 'system', content: buildSystemPrompt(session, memory, await crmBrief()) },
    ...history.slice(-40).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: userContent },
  ]

  let lastContract: MilenaReply['contract']
  let lastImage: string | undefined
  let lastData: Record<string, unknown> | undefined
  const toolSummaries: string[] = []

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const res = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.55,
        max_tokens: 4096,
        messages,
        tools: MILENA_OPENAI_TOOLS,
        tool_choice: 'auto',
      }),
      signal: AbortSignal.timeout(120_000),
    })

    const json = await res.json()
    if (!res.ok) {
      const err = json.error?.message ?? `OpenAI HTTP ${res.status}`
      throw new Error(err)
    }

    const choice = json.choices?.[0]?.message
    if (!choice) {
      throw new Error('Празен отговор от AI.')
    }

    const toolCalls = choice.tool_calls as
      | Array<{ id: string; function: { name: string; arguments: string } }>
      | undefined

    if (!toolCalls?.length) {
      const reply = String(choice.content ?? '').trim()
      if (reply) {
        if (/\bзапомни\b/i.test(userContent)) {
          await import('@/lib/ai/milena/memory').then(m =>
            m.rememberFact(session.id, userContent.slice(0, 400))
          )
        }
        return {
          ok: true,
          message: reply,
          contract: lastContract,
          imageUrl: lastImage,
          data: lastData,
        }
      }
      break
    }

    messages.push(choice)

    for (const tc of toolCalls) {
      let args: Record<string, unknown> = {}
      try {
        args = JSON.parse(tc.function.arguments || '{}')
      } catch {
        args = {}
      }
      const result: MilenaToolResult = await executeMilenaTool(tc.function.name, args, session)
      if (result.contract) lastContract = result.contract
      if (result.imageUrl) lastImage = result.imageUrl
      if (result.data) lastData = result.data
      toolSummaries.push(result.content)

      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: result.content + (result.imageUrl ? `\nURL: ${result.imageUrl}` : ''),
      })
    }
  }

  if (toolSummaries.length) {
    const summary = toolSummaries.join('\n')
    return {
      ok: true,
      message: summary,
      contract: lastContract,
      imageUrl: lastImage,
      data: lastData,
    }
  }

  return {
    ok: true,
    message: 'Готово. Какво друго мога да направя?',
    contract: lastContract,
    imageUrl: lastImage,
    data: lastData,
  }
}

export async function runMilena(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
  session: SessionUser,
  attachments: MilenaAttachment[] = []
): Promise<MilenaReply> {
  const text = userMessage.trim()
  if (!text && !attachments.length) {
    return { ok: false, message: 'Напишете съобщение.' }
  }

  const blocked = detectBlockedIntent(text, session)
  if (blocked) {
    return { ok: false, message: denyMessage(blocked) }
  }

  const attachBlock =
    attachments.length > 0
      ? '\n\nПрикачени файлове:\n' +
        attachments.map(a => `- ${a.name}: ${a.url}`).join('\n')
      : ''
  const userContent = (text || 'Анализирай прикачените файлове.') + attachBlock

  try {
    return await runOpenAiChat(session, userContent, history)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Грешка'

    if (msg === 'NO_API_KEY') {
      const backup = await runLocalMilenaBackup(text, session)
      if (backup) return backup
      return {
        ok: false,
        message:
          'Милена работи без AI ключ. За пълни функции добавете OpenAI ключ в Настройки -> Милена AI.',
      }
    }

    const backup = await runLocalMilenaBackup(text, session)
    if (backup) {
      return {
        ...backup,
        message: `${backup.message}\n\n(Временно без пълен AI: ${msg})`,
      }
    }

    const hint = /401|invalid.*api.*key|incorrect.*key/i.test(msg)
      ? ' OpenAI ключът е невалиден - Admin -> Настройки -> Милена AI -> въведете нов sk- ключ.'
      : ' Проверете ключ в Настройки -> Милена AI или баланса на OpenAI.'
    return {
      ok: false,
      message: `Не успях да се свържа с AI: ${msg}.${hint}`,
    }
  }
}

export async function milenaConfigured(): Promise<boolean> {
  return milenaLlmAvailable()
}
