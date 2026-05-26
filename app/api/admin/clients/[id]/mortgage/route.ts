import { NextRequest, NextResponse } from 'next/server'
import { execute, queryOne } from '@/lib/db'
import { sendMortgageApplicationEmail, type MortgageBank } from '@/lib/email/mortgage'
import type { MortgageFiles } from '@/lib/mortgage/constants'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = parseInt(params.id, 10)
    const body = await req.json()
    const bank = body.bank as MortgageBank
    const files = body.files as MortgageFiles
    const notes = (body.notes ?? '').trim()

    if (!bank || !['obb', 'ibank'].includes(bank)) {
      return NextResponse.json({ success: false, error: 'Избери банка (ОББ или ИБанк)' }, { status: 400 })
    }

    const hasFiles = files && Object.values(files).some(arr => Array.isArray(arr) && arr.length > 0)
    if (!hasFiles) {
      return NextResponse.json({ success: false, error: 'Прикачи поне един документ' }, { status: 400 })
    }

    const client = await queryOne<{
      id: number
      name: string
      email: string
      phone: string | null
    }>(`SELECT id, name, email, phone FROM crm_clients WHERE id = ?`, [clientId])

    if (!client) {
      return NextResponse.json({ success: false, error: 'Клиентът не е намерен' }, { status: 404 })
    }

    const emailResult = await sendMortgageApplicationEmail({
      bank,
      clientName: client.name,
      clientEmail: client.email ?? '',
      clientPhone: client.phone,
      files,
      notes,
    })

    const result = await execute(
      `INSERT INTO crm_mortgage_applications (client_id, bank_target, files, status, notes, created_by)
       VALUES (?, ?, ?::jsonb, ?, ?, ?)`,
      [
        clientId,
        bank,
        JSON.stringify(files),
        emailResult.sent ? 'sent' : 'saved',
        notes || null,
        1,
      ]
    )

    await execute(
      `INSERT INTO crm_notes (client_id, note, created_by) VALUES (?, ?, ?)`,
      [
        clientId,
        `Ипотечна кандидатура → ${bank === 'obb' ? 'Пламен ОББ' : 'Калина ИБанк'}${emailResult.sent ? ' (имейл изпратен)' : ' (записана, имейл не е изпратен)'}`,
        1,
      ]
    )

    if (!emailResult.sent) {
      return NextResponse.json({
        success: true,
        id: result.insertId,
        emailSent: false,
        warning: emailResult.error ?? 'Кандидатурата е записана, но имейлът не е изпратен. Настрой SMTP в Vercel.',
        recipient: emailResult.recipient,
      })
    }

    return NextResponse.json({
      success: true,
      id: result.insertId,
      emailSent: true,
      recipient: emailResult.recipient,
    })
  } catch (error) {
    console.error('[POST mortgage]', error)
    const msg = error instanceof Error ? error.message : 'Грешка при изпращане'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = parseInt(params.id, 10)
    const { query } = await import('@/lib/db')
    const rows = await query<{
      id: number
      bank_target: string
      files: MortgageFiles
      status: string
      notes: string | null
      created_at: string
    }>(
      `SELECT id, bank_target, files, status, notes, created_at
       FROM crm_mortgage_applications
       WHERE client_id = ?
       ORDER BY created_at DESC`,
      [clientId]
    )
    return NextResponse.json({ success: true, applications: rows })
  } catch (error) {
    console.error('[GET mortgage]', error)
    return NextResponse.json({ success: false, applications: [] })
  }
}
