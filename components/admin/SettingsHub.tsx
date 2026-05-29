'use client'

import Link from 'next/link'
import { cardStyle } from '@/components/admin/AdminCard'
import { ADMIN_PAGE_OPTIONS } from '@/lib/auth/pages'

const SECTIONS = [
  {
    title: 'Профил',
    icon: '👤',
    items: [
      { label: 'Мой профил', href: '/admin/profile' },
      { label: 'Настройки на Милена', href: '/admin/settings#milena' },
    ],
  },
  {
    title: 'Система',
    icon: '⚙️',
    items: [
      { label: 'Статус на връзките', href: '/admin/settings#status' },
      { label: 'Маркетинг', href: '/admin/marketing' },
      { label: 'Документи', href: '/admin/documents' },
    ],
  },
  {
    title: 'Екип и права',
    icon: '👥',
    items: [
      { label: 'Брокери', href: '/admin/brokers' },
      { label: 'Клиенти', href: '/admin/clients' },
      { label: 'Чат', href: '/admin/chat' },
    ],
  },
  {
    title: 'Данни',
    icon: '📊',
    items: ADMIN_PAGE_OPTIONS.filter(p =>
      ['properties', 'marketplace', 'inquiries', 'tasks', 'finance', 'contracts'].includes(p.slug)
    ).map(p => ({ label: p.label, href: p.path })),
  },
]

export default function SettingsHub() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {SECTIONS.map(section => (
        <div key={section.title} className="rounded-xl p-5" style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{section.icon}</span>
            <h2 className="font-display text-white font-semibold text-sm">{section.title}</h2>
          </div>
          <div className="flex flex-col gap-1">
            {section.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-left text-sm text-[rgba(255,255,255,0.55)] hover:text-white transition-colors py-2 px-2 rounded-lg hover:bg-[rgba(196,30,58,0.08)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
