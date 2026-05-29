import { isDbConfigured, query, queryOne, execute } from '@/lib/db'
import { toHostClientStatus } from '@/lib/db/mappers'
import type { SessionUser } from '@/lib/auth/session'
import {
  findClientByName,
  type AiActionResult,
} from '@/lib/ai/crm-assistant'
import { buildContract, type ContractType } from '@/lib/ai/contract-templates'
import { canPerform, denyMessage } from '@/lib/ai/milena/permissions'
import { rememberFact, upsertProject } from '@/lib/ai/milena/memory'
import { generatePropertyImage, improvePropertyImage } from '@/lib/ai/milena/images'
import { syncAllMarketplaces } from '@/lib/marketplace/sync-all'
import { buildDuplicateKey, isDuplicateListing } from '@/lib/marketplace/duplicates'
import {
  insertScrapedListing,
  listLeads,
  loadPropertyDuplicateKeys,
} from '@/lib/marketplace/leads-repository'
import type { MarketplaceLead } from '@/lib/marketplace/types'

export interface MilenaToolResult {
  content: string
  contract?: AiActionResult['contract']
  imageUrl?: string
  data?: Record<string, unknown>
}

export async function executeMilenaTool(
  name: string,
  args: Record<string, unknown>,
  session: SessionUser
): Promise<MilenaToolResult> {
  switch (name) {
    case 'remember_fact':
      await rememberFact(session.id, String(args.fact ?? ''))
      return { content: 'Запомних.' }

    case 'save_project': {
      const p = await upsertProject(session.id, {
        id: args.project_id ? String(args.project_id) : undefined,
        title: String(args.title ?? 'Проект'),
        notes: String(args.notes ?? ''),
        attachments: Array.isArray(args.attachment_urls)
          ? args.attachment_urls.map(String)
          : [],
      })
      return { content: `Проект „${p.title}" е записан (ID ${p.id}).`, data: { projectId: p.id } }
    }

    case 'add_client':
      return createClientQuick(args, session)

    case 'delete_client': {
      if (!canPerform(session, 'delete_client')) {
        return { content: denyMessage('delete_client') }
      }
      const name = String(args.name ?? '')
      if (!isDbConfigured()) return { content: 'Няма база.' }
      const row = await queryOne<{ id: number; name: string }>(
        `SELECT id, name FROM crm_clients WHERE LOWER(name) LIKE LOWER(?) LIMIT 1`,
        [`%${name}%`]
      )
      if (!row) return { content: `Не намерих клиент „${name}".` }
      await execute(`DELETE FROM crm_notes WHERE client_id = ?`, [row.id])
      await execute(`DELETE FROM crm_clients WHERE id = ?`, [row.id])
      return { content: `Клиентът „${row.name}" е изтрит.` }
    }

    case 'export_clients':
      if (!canPerform(session, 'export_clients')) {
        return { content: denyMessage('export_clients') }
      }
      if (!isDbConfigured()) return { content: 'Базата не е конфигурирана.' }
      const rows = await query<{ name: string; email: string; phone: string; status: string }>(
        `SELECT name, email, phone, status FROM crm_clients ORDER BY created_at DESC LIMIT 500`
      )
      const csv =
        'name,email,phone,status\n' +
        rows.map(r => `"${r.name}","${r.email}","${r.phone ?? ''}","${r.status}"`).join('\n')
      return {
        content: `Експорт: ${rows.length} клиента.\n\n${csv.slice(0, 6000)}${csv.length > 6000 ? '\n...(съкратено)' : ''}`,
      }

    case 'search_client': {
      const c = await findClientByName(String(args.name ?? ''))
      if (!c) return { content: 'Клиентът не е намерен.' }
      return {
        content: `Намерих: ${c.name}, ${c.email}, ${c.phone || '—'}, статус ${c.status}, бюджет ${c.budget_min}-${c.budget_max}.`,
        data: { clientId: c.id },
      }
    }

    case 'create_contract': {
      const client = await findClientByName(String(args.client_name ?? ''))
      if (!client) return { content: 'Клиентът не е намерен.' }
      const type = (args.contract_type as ContractType) || 'preliminary'
      const contract = buildContract(type, {
        name: client.name,
        email: client.email ?? '',
        phone: client.phone ?? '',
        notes: client.notes.slice(0, 3).join('; ') || undefined,
      })
      return {
        content: `Готов ${contract.title} за ${client.name}.`,
        contract,
      }
    }

    case 'schedule_appointment': {
      const date = String(args.date ?? '')
      const time = String(args.time ?? '10:00')
      if (!isDbConfigured()) return { content: 'Календарът изисква база данни.' }
      let clientId: number | null = null
      const cname = String(args.client_name ?? '')
      if (cname) {
        const c = await findClientByName(cname)
        clientId = c?.id ?? null
      }
      await execute(
        `INSERT INTO appointments (appointment_date, appointment_time, client_id, status, notes)
         VALUES (?, ?, ?, 'scheduled', ?)`,
        [date, time, clientId, String(args.notes ?? '').slice(0, 500)]
      )
      return {
        content: `Записах среща на ${date} в ${time}${cname ? ` за ${cname}` : ''}.`,
      }
    }

    case 'update_property': {
      const propertyId = Number(args.property_id)
      const price = args.price_eur != null ? Number(args.price_eur) : null
      if (!propertyId) return { content: 'Нужен е property_id.' }
      if (price != null && Number.isFinite(price)) {
        const row = await queryOne<{ title: string; price: number }>(
          `SELECT title, price FROM properties WHERE id = ?`,
          [propertyId]
        )
        if (!row) return { content: `Имот #${propertyId} не е намерен.` }
        await execute(`UPDATE properties SET price = ?, updated_at = NOW() WHERE id = ?`, [
          price,
          propertyId,
        ])
        return {
          content: `Цената на „${row.title}" (#${propertyId}) е ${Number(row.price).toLocaleString('bg-BG')} € → ${price.toLocaleString('bg-BG')} €.`,
          data: { propertyId, price },
        }
      }
      if (!isDbConfigured()) return { content: 'Базата не е конфигурирана.' }
      const fields: string[] = []
      const vals: (string | number)[] = []
      if (args.title) {
        fields.push('title = ?')
        vals.push(String(args.title))
      }
      if (args.description) {
        fields.push('description = ?')
        vals.push(String(args.description))
      }
      if (!fields.length) return { content: 'Няма полета за обновяване (price_eur, title, description).' }
      vals.push(propertyId)
      await execute(`UPDATE properties SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, vals)
      return { content: `Имот #${propertyId} е обновен.` }
    }

    case 'delete_property': {
      const id = Number(args.property_id)
      if (!id) return { content: 'Невалиден ID.' }
      if (!isDbConfigured()) return { content: 'Няма база.' }
      await execute(`DELETE FROM property_images WHERE property_id = ?`, [id])
      await execute(`DELETE FROM properties WHERE id = ?`, [id])
      return { content: `Обявата #${id} е изтрита.` }
    }

    case 'sync_marketplace_leads': {
      if (!isMilenaAdmin(session)) {
        return { content: 'Синхронизация на пазара — препоръчително от администратор.' }
      }
      const { listings, errors, bySource } = await syncAllMarketplaces()
      const existing = await listLeads()
      const propertyKeys = await loadPropertyDuplicateKeys()
      let added = 0
      let duplicates = 0
      for (const listing of listings) {
        const isDup = isDuplicateListing(listing, existing, propertyKeys)
        const result = await insertScrapedListing(listing, isDup)
        if (result === 'added') {
          added++
          existing.unshift({
            id: -1,
            ...listing,
            status: 'pending_review',
            duplicate_key: buildDuplicateKey(listing),
            published_property_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as MarketplaceLead)
          propertyKeys.add(buildDuplicateKey(listing))
        } else if (result === 'duplicate') duplicates++
      }
      const src = Object.entries(bySource)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
      return {
        content: `Извличане завършено. Добавени ${added}, дубликати ${duplicates}, сканирани ${listings.length}. По източник: ${src}.${errors.length ? ' Грешки: ' + errors.slice(0, 5).join('; ') : ''}`,
        data: { added, duplicates, bySource },
      }
    }

    case 'convert_images_to_panoramas': {
      const urls = Array.isArray(args.image_urls)
        ? args.image_urls.map(String).filter(Boolean)
        : []
      if (!urls.length) return { content: 'Нужни са URL на снимки.' }
      const { convertPhotosToPanoramaUrls } = await import(
        '@/lib/virtual-tour/panorama-from-photo'
      )
      const converted = await convertPhotosToPanoramaUrls(urls, 24)
      if (!converted.length) {
        return { content: 'Неуспешно преобразуване — проверете URL-ите.' }
      }
      const panoramaUrls = converted.map(c => c.panorama)
      const propertyId = Number(args.property_id)
      if (propertyId > 0) {
        const { runVirtualTourPipeline } = await import('@/lib/virtual-tour/pipeline')
        const result = await runVirtualTourPipeline({
          propertyId,
          imageUrls: panoramaUrls,
          publish: true,
        })
        return {
          content: `Готови ${converted.length} панорами 2:1. Виртуален тур #${result.tourId} (${result.frameCount} изгледа).`,
          data: { panoramaUrls, tourId: result.tourId },
        }
      }
      return {
        content:
          `Готови ${converted.length} панорами 2:1 за оглед:\n` +
          panoramaUrls.map((u, i) => `${i + 1}. ${u}`).join('\n'),
        data: { panoramaUrls },
      }
    }

    case 'generate_property_image': {
      const url = await generatePropertyImage(String(args.prompt ?? ''))
      if (!url) return { content: 'Генерирането не успя — проверете OPENAI_API_KEY.' }
      return { content: 'Генерирана снимка:', imageUrl: url }
    }

    case 'improve_property_image': {
      const url = await improvePropertyImage(
        String(args.image_url ?? ''),
        String(args.instructions ?? '')
      )
      if (!url) return { content: 'Подобряването не успя.' }
      return { content: 'Подобрена снимка:', imageUrl: url }
    }

    default:
      return { content: `Неизвестен инструмент: ${name}` }
  }
}

function isMilenaAdmin(session: SessionUser) {
  return session.role === 'admin'
}

function wrap(r: AiActionResult): MilenaToolResult {
  return {
    content: r.message,
    contract: r.contract,
    data: r.data,
  }
}

async function createClientQuick(
  args: Record<string, unknown>,
  _session: SessionUser
): Promise<MilenaToolResult> {
  const name = String(args.name ?? '').trim()
  const email = String(args.email ?? '').trim()
  if (!name || !email) return { content: 'Нужни са име и имейл.' }
  if (!isDbConfigured()) {
    const { createLocalClient } = await import('@/lib/local-store/clients')
    const r = await createLocalClient({
      name,
      email,
      phone: String(args.phone ?? ''),
      source: 'milena',
      status: 'lead',
      budget_min: 0,
      budget_max: 0,
    })
    return { content: `Клиент „${r.name}" добавен локално (ID ${r.id}).` }
  }
  const result = await execute(
    `INSERT INTO crm_clients (name, email, phone, status, source) VALUES (?, ?, ?, ?, 'milena')`,
    [name, email, String(args.phone ?? '').trim() || null, toHostClientStatus('lead')]
  )
  return { content: `Клиент „${name}" добавен (ID ${result.insertId}).` }
}
