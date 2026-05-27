import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import ConditionalShell from '@/components/layout/ConditionalShell'
import ThemeProvider    from '@/components/providers/ThemeProvider'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  title: {
    default:  'Имоти Надежда — Луксозни недвижими имоти',
    template: '%s | Имоти Надежда',
  },
  description:
    'Намерете мечтания си имот в Шумен, Варна, Бургас и Нови пазар. ' +
    'Апартаменти, къщи, мезонети и парцели от водещата агенция за недвижими имоти.',
  keywords: [
    'имоти', 'недвижими имоти', 'Шумен', 'Варна', 'Бургас', 'Нови пазар',
    'апартаменти', 'къщи', 'имоти Надежда',
  ],
  openGraph: {
    type:        'website',
    locale:      'bg_BG',
    siteName:    'Имоти Надежда',
    title:       'Имоти Надежда — Луксозни недвижими имоти',
    description: 'Водещата агенция за недвижими имоти в Североизточна България.',
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor:     '#080810',
  width:          'device-width',
  initialScale:   1,
  maximumScale:   5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" className={`dark ${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body
        className="font-body antialiased transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-primary)',
        }}
      >
        <ThemeProvider>
          <ConditionalShell>
            {children}
          </ConditionalShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
