import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { buildDuplicateKey, isDuplicateListing } from '@/lib/marketplace/duplicates'
import {
  insertScrapedListing,
  listLeads,
  loadPropertyDuplicateKeys,
} from '@/lib/marketplace/leads-repository'
import { syncRealistimoMarketplace } from '@/lib/marketplace/realistimo-sync'
import type { MarketplaceLead } from '@/lib/marketplace/types'

export const maxDuration = 60

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран достъп' }, { status: 401 })
  }

  const { listings, errors, citiesScanned } = await syncRealistimoMarketplace()
  const existing = await listLeads()
  const propertyKeys = await loadPropertyDuplicateKeys()

  let added = 0
  let duplicates = 0
  let skipped = 0

  for (const listing of listings) {
    const isDup = isDuplicateListing(listing, existing, propertyKeys)
    const result = await insertScrapedListing(listing, isDup)
    if (result === 'added') {
      added++
      const stub: MarketplaceLead = {
        id: -1,
        source: listing.source,
        external_id: listing.external_id,
        city: listing.city,
        city_slug: listing.city_slug,
        district: listing.district,
        district_slug: listing.district_slug,
        title: listing.title,
        description: listing.description,
        phone: listing.phone,
        price: listing.price,
        images: listing.images,
        status: 'pending_review',
        source_url: listing.source_url,
        property_type: listing.property_type,
        area_sqm: listing.area_sqm,
        duplicate_key: buildDuplicateKey(listing),
        published_property_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      existing.unshift(stub)
      propertyKeys.add(buildDuplicateKey(listing))
    } else if (result === 'duplicate') duplicates++
    else skipped++
  }

  return NextResponse.json({
    success: true,
    added,
    duplicates,
    skipped,
    scanned: listings.length,
    citiesScanned,
    errors,
  })
}
