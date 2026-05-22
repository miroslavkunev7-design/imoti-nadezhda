export interface PublishChannel {
  id: string
  name: string
  color: string
  postUrl: string
}

export const PUBLISH_CHANNELS: PublishChannel[] = [
  { id: 'olx',      name: 'OLX.bg',     color: '#23E5DB', postUrl: 'https://www.olx.bg/adding/' },
  { id: 'imot',     name: 'Imot.bg',    color: '#e4002b', postUrl: 'https://www.imot.bg/addListing' },
  { id: 'bazar',    name: 'Bazar.bg',   color: '#ff6600', postUrl: 'https://bazar.bg/user/login' },
  { id: 'alo',      name: 'Alo.bg',     color: '#0066cc', postUrl: 'https://www.alo.bg/add' },
  { id: 'facebook', name: 'Facebook',   color: '#1877F2', postUrl: 'https://www.facebook.com/marketplace/create/item' },
]

export interface ListingDraft {
  title: string
  description: string
  price_eur: string | number
  area_sqm: string | number
  cityName: string
  quarterName: string
  type: string
  siteUrl?: string
}

export function buildListingText(draft: ListingDraft): string {
  const price = Number(draft.price_eur).toLocaleString('bg-BG')
  const area  = draft.area_sqm
  return [
    draft.title,
    '',
    `${draft.type} · ${draft.quarterName}, ${draft.cityName}`,
    `Цена: €${price} · ${area} м²`,
    '',
    draft.description || '',
    '',
    draft.siteUrl ? `Виж повече: ${draft.siteUrl}` : '',
    '',
    'Имоти Надежда',
  ].filter(Boolean).join('\n')
}

export function getPublishLinks(draft: ListingDraft, channels: string[]) {
  const text = encodeURIComponent(buildListingText(draft))
  const title = encodeURIComponent(draft.title)

  return PUBLISH_CHANNELS
    .filter(ch => channels.includes(ch.id))
    .map(ch => {
      let url = ch.postUrl
      if (ch.id === 'facebook') {
        url = `https://www.facebook.com/sharer/sharer.php?quote=${text}`
      }
      return { ...ch, openUrl: url, copyText: buildListingText(draft) }
    })
}
