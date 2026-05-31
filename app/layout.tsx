import type { Metadata, Viewport } from 'next'
import './globals.css'
import './design-system.css'
import './collage-theme.css'
import './redesign.css'
import './home-exact.css'
import './city-burgas-exact.css'
import './globals-luxury.css'
import './virtual-tour.css'
import ConditionalShell from '@/components/layout/ConditionalShell'
import ThemeProvider    from '@/components/providers/ThemeProvider'
import SiteJsonLd from '@/components/seo/SiteJsonLd'
import { SEO_KEYWORDS, SITE_NAME, SITE_URL } from '@/lib/seo/site'

const siteUrl = SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Имоти Надежда — imotinadezhda.bg | Сайт за имоти',
    template: '%s | Имоти Надежда',
  },
  description:
    'Имоти Надежда (imoti nadezhda) — официален сайт за имоти imotinadezhda.bg. ' +
    'Апартаменти, къщи и парцели в Шумен, Варна, Бургас и Нови пазар. Купи или продай имот с Надежда.',
  keywords: SEO_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: siteUrl,
    siteName: SITE_NAME,
    title: 'Имоти Надежда — imotinadezhda.bg',
    description:
      'Сайтове за имоти №1 в региона — Имоти Надежда. Търсене, огледи, 360° виртуални турове.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Имоти Надежда — imotinadezhda.bg',
    description: 'Луксозни и достъпни имоти в Североизточна България.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
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
    <html lang="bg" className="light" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={siteUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body antialiased luxury-site-body"
        style={{ backgroundColor: 'var(--rd-marble)', color: 'var(--rd-burg)' }}
      >
        <SiteJsonLd />
        <ThemeProvider>
          <ConditionalShell>
            {children}
          </ConditionalShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
