/** Admin page slugs used for broker restrictions (without /admin prefix) */
export const ADMIN_PAGE_OPTIONS = [
  { slug: 'dashboard',   label: 'Табло',       path: '/admin' },
  { slug: 'properties',  label: 'Имоти',       path: '/admin/properties' },
  { slug: 'brokers',     label: 'Брокери',     path: '/admin/brokers' },
  { slug: 'clients',     label: 'Клиенти',     path: '/admin/clients' },
  { slug: 'owners',      label: 'Собственици', path: '/admin/owners' },
  { slug: 'marketplace', label: 'Извлечени имоти', path: '/admin/marketplace' },
  { slug: 'inquiries',   label: 'Запитвания',  path: '/admin/inquiries' },
  { slug: 'chat',        label: 'Чат',         path: '/admin/chat' },
  { slug: 'calendar',    label: 'Календар',    path: '/admin/calendar' },
  { slug: 'contracts',   label: 'Договори',    path: '/admin/contracts' },
  { slug: 'finance',     label: 'Финанси',     path: '/admin/finance' },
  { slug: 'marketing',   label: 'Маркетинг',   path: '/admin/marketing' },
  { slug: 'tasks',       label: 'Задачи',      path: '/admin/tasks' },
  { slug: 'documents',   label: 'Документи',   path: '/admin/documents' },
  { slug: 'settings',    label: 'Настройки',   path: '/admin/settings' },
] as const

export function pathnameToPageSlug(pathname: string): string {
  if (pathname === '/admin' || pathname === '/admin/') return 'dashboard'
  const match = pathname.match(/^\/admin\/([^/]+)/)
  return match?.[1] ?? 'dashboard'
}

export function isPathRestricted(pathname: string, restricted: string[]): boolean {
  const slug = pathnameToPageSlug(pathname)
  if (slug === 'dashboard' || slug === 'profile') return false
  return restricted.includes(slug)
}
