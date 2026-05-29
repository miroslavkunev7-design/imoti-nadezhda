import { SITE_NAME, SITE_URL } from '@/lib/seo/site'

const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+359899620262'
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'agenciq_nadejdi@abv.bg'

export default function SiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateAgent',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: ['Имоти Надежда', 'Imoti Nadezhda', 'imotinadezhda.bg'],
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        telephone: PHONE,
        email: EMAIL,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'BG',
          addressRegion: 'Шумен',
        },
        areaServed: [
          { '@type': 'City', name: 'Шумен' },
          { '@type': 'City', name: 'Варна' },
          { '@type': 'City', name: 'Бургас' },
          { '@type': 'City', name: 'Нови пазар' },
        ],
        sameAs: [SITE_URL],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'bg-BG',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/buy?city={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
