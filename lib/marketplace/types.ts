export type LeadStatus = 'pending_review' | 'editing' | 'duplicate' | 'published' | 'rejected'

export interface MarketplaceLead {
  id: number
  source: string
  external_id: string | null
  city: string
  city_slug: string | null
  district: string
  district_slug: string | null
  title: string
  description: string | null
  phone: string | null
  price: number | null
  images: string[]
  status: LeadStatus
  source_url: string | null
  property_type: string | null
  area_sqm: number | null
  duplicate_key: string | null
  published_property_id: number | null
  created_at: string
  updated_at: string
}

export interface ScrapedListing {
  source: string
  external_id: string
  source_url: string
  city: string
  city_slug: string
  district: string
  district_slug: string
  title: string
  description: string
  phone: string
  price: number
  images: string[]
  property_type: string
  area_sqm: number | null
}
