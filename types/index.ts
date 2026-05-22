// ── Cities ────────────────────────────────────────────────────
export interface City {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  population: number | null
  area_km2: number | null
  region: string | null
  sort_order: number
  property_count?: number
  quarter_count?: number
}

// ── Quarters (Neighborhoods) ──────────────────────────────────
export interface Quarter {
  id: number
  city_id: number
  city_slug?: string
  city_name?: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  population: number | null
  area_km2: number | null
  property_count?: number
}

// ── Properties ────────────────────────────────────────────────
export type PropertyType =
  | 'Апартамент'
  | 'Къща'
  | 'Мезонет'
  | 'Парцел'
  | 'Гараж'
  | 'Пентхаус'

export type PropertyStatus = 'active' | 'sold' | 'rented' | 'draft'

export interface Property {
  id: number
  city_id: number
  city_name?: string
  city_slug?: string
  quarter_id: number
  quarter_name?: string
  quarter_slug?: string
  user_id: number
  title: string
  type: PropertyType
  detailed_type: string | null
  price_eur: number
  area_sqm: number
  floor: number | null
  total_floors: number | null
  bedrooms: number | null
  bathrooms: number | null
  orientation: string | null
  construction: string | null
  year_built: number | null
  condition: string | null
  elevator: boolean
  furnished: boolean
  heating: string | null
  is_featured: boolean
  is_new: boolean
  status: PropertyStatus
  views: number
  description: string | null
  created_at: string
  updated_at: string
  // Joined
  primary_image?: string
  images?: PropertyImage[]
  features?: string[]
}

export interface PropertyImage {
  id: number
  property_id: number
  image_url: string
  is_primary: boolean
  sort_order: number
}

// ── Search / Filters ──────────────────────────────────────────
export interface SearchParams {
  city?: string
  quarter?: string
  type?: string
  detailed_type?: string
  price_min?: string
  price_max?: string
  bathrooms?: string
  bedrooms?: string
  area_min?: string
  area_max?: string
  features?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc'
  page?: string
}

// ── Users ─────────────────────────────────────────────────────
export type UserRole = 'admin' | 'agent' | 'client'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

// ── Inquiries ─────────────────────────────────────────────────
export type InquiryStatus = 'new' | 'read' | 'replied' | 'closed'

export interface Inquiry {
  id: number
  property_id: number | null
  user_id: number | null
  name: string
  email: string
  phone: string | null
  message: string
  status: InquiryStatus
  created_at: string
  // Joined
  property_title?: string
  property_slug?: string
}

// ── Favorites ─────────────────────────────────────────────────
export interface Favorite {
  id: number
  user_id: number
  property_id: number
  created_at: string
  property?: Property
}

// ── Appointments ──────────────────────────────────────────────
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Appointment {
  id: number
  property_id: number
  client_id: number
  agent_id: number | null
  scheduled_at: string
  notes: string | null
  status: AppointmentStatus
  created_at: string
  property?: Property
}

// ── CRM ───────────────────────────────────────────────────────
export type CrmClientStatus = 'lead' | 'active' | 'closed' | 'lost'
export type CrmClientSource = 'website' | 'referral' | 'direct' | 'social'

export interface CrmClient {
  id: number
  name: string
  email: string
  phone: string | null
  source: CrmClientSource
  assigned_agent_id: number | null
  status: CrmClientStatus
  budget_min: number | null
  budget_max: number | null
  preferred_city_id: number | null
  preferred_type: string | null
  created_at: string
  notes?: CrmNote[]
  tasks?: CrmTask[]
}

export interface CrmNote {
  id: number
  client_id: number
  note: string
  created_by: number
  created_at: string
  author_name?: string
}

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TaskStatus   = 'pending' | 'in_progress' | 'done' | 'cancelled'

export interface CrmTask {
  id: number
  assigned_to: number
  client_id: number | null
  property_id: number | null
  title: string
  description: string | null
  due_date: string | null
  priority: TaskPriority
  status: TaskStatus
}

// ── Pagination ────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// ── API Response ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
