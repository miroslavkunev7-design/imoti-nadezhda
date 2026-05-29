import type { ScrapedListing } from '@/lib/marketplace/types'
import { syncRealistimoMarketplace } from '@/lib/marketplace/realistimo-sync'
import { syncOlxMarketplace } from '@/lib/marketplace/sources/olx'
import { syncImotBgMarketplace } from '@/lib/marketplace/sources/imotbg'
import { syncBazarMarketplace } from '@/lib/marketplace/sources/bazar'
import { syncHomeBgMarketplace } from '@/lib/marketplace/sources/homebg'

export const MARKETPLACE_SOURCE_LABELS: Record<string, string> = {
  realistimo: 'Realistimo',
  olx: 'OLX.bg',
  imotibg: 'Imoti.bg',
  bazar: 'Bazar.bg',
  homebg: 'Home.bg',
}

export interface MarketplaceSyncReport {
  listings: ScrapedListing[]
  errors: string[]
  citiesScanned: number
  bySource: Record<string, number>
}

export async function syncAllMarketplaces(): Promise<MarketplaceSyncReport> {
  const listings: ScrapedListing[] = []
  const errors: string[] = []
  const bySource: Record<string, number> = {}
  let citiesScanned = 0

  const runners = [
    { name: 'realistimo', run: syncRealistimoMarketplace },
    { name: 'imotibg', run: syncImotBgMarketplace },
    { name: 'olx', run: syncOlxMarketplace },
    { name: 'bazar', run: syncBazarMarketplace },
    { name: 'homebg', run: syncHomeBgMarketplace },
  ] as const

  for (const { name, run } of runners) {
    try {
      const result = await run()
      listings.push(...result.listings)
      bySource[name] = result.listings.length
      errors.push(...result.errors.map(e => `[${name}] ${e}`))
      if ('citiesScanned' in result && typeof result.citiesScanned === 'number') {
        citiesScanned += result.citiesScanned
      }
    } catch (e) {
      errors.push(`[${name}] ${e instanceof Error ? e.message : 'грешка'}`)
      bySource[name] = 0
    }
  }

  return { listings, errors, citiesScanned, bySource }
}
