import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Run once to add avatar_url column to users table and create extra tables.
 * Called automatically from broker page on first load.
 */
export async function POST() {
  const url = process.env.DB_BRIDGE_URL?.trim()
  const key = process.env.DB_BRIDGE_KEY?.trim()
  if (!url || !key) {
    return NextResponse.json({ success: false, error: 'Bridge not configured' })
  }

  const results: Record<string, boolean> = {}

  // Add avatar_url column
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, action: 'add_avatar_column' }),
      cache: 'no-store',
    })
    const j = await r.json() as { success: boolean }
    results.avatar_col = j.success
  } catch { results.avatar_col = false }

  // Create crm_messages table
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, action: 'create_table', table: 'crm_messages' }),
      cache: 'no-store',
    })
    const j = await r.json() as { success: boolean }
    results.crm_messages = j.success
  } catch { results.crm_messages = false }

  // Create broker_restrictions table
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, action: 'create_table', table: 'broker_restrictions' }),
      cache: 'no-store',
    })
    const j = await r.json() as { success: boolean }
    results.broker_restrictions = j.success
  } catch { results.broker_restrictions = false }

  return NextResponse.json({ success: true, results })
}
