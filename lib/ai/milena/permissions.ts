import type { SessionUser } from '@/lib/auth/session'

export type MilenaAction = 'delete_client' | 'export_clients' | 'general'

const BROKER_DENIED: MilenaAction[] = ['delete_client', 'export_clients']

export function isMilenaAdmin(session: SessionUser | null): boolean {
  return session?.role === 'admin'
}

export function canPerform(session: SessionUser | null, action: MilenaAction): boolean {
  if (!session) return false
  if (isMilenaAdmin(session)) return true
  return !BROKER_DENIED.includes(action)
}

export function denyMessage(action: MilenaAction): string {
  if (action === 'delete_client') return 'Изтриване на клиенти — само за администратор.'
  if (action === 'export_clients') return 'Експорт на клиентски данни — само за администратор.'
  return 'Нужен е администраторски достъп.'
}

const EXPORT_RE =
  /експорт|export|csv|excel|извади\s+(всички\s+)?клиент|изтегли\s+клиент|списък\s+с\s+(имейл|телефон)/i
const DELETE_CLIENT_RE = /изтрий\s+клиент|премахни\s+клиент/i

export function detectBlockedIntent(text: string, session: SessionUser | null): MilenaAction | null {
  if (isMilenaAdmin(session)) return null
  const t = text.toLowerCase()
  if (DELETE_CLIENT_RE.test(t)) return 'delete_client'
  if (EXPORT_RE.test(t)) return 'export_clients'
  return null
}
