import type { Metadata } from 'next'
import { BRAND } from '@/lib/design/brand'

export const metadata: Metadata = {
  title: 'Контакти',
  description: `Свържете се с ${BRAND.fullName}.`,
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
