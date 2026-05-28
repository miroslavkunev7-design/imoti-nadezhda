import type { Metadata, Viewport } from 'next'
import './globals.css'
import './luxury.css'
import ConditionalShell from '@/components/layout/ConditionalShell'
import ThemeProvider    from '@/components/providers/ThemeProvider'

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
    <html lang="bg" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
      </head>
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
