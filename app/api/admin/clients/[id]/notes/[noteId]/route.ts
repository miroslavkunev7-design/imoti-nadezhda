import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const noteId = parseInt(params.noteId, 10)
    await execute(`DELETE FROM crm_notes WHERE id = ?`, [noteId])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE note]', error)
    return NextResponse.json({ success: false, error: 'Грешка при изтриване' }, { status: 500 })
  }
}
