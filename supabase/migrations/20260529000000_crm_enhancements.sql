-- CRM enhancements: client fields + property_owners table

-- Extend crm_clients with new optional fields
ALTER TABLE crm_clients
  ADD COLUMN IF NOT EXISTS source VARCHAR(64) DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS city VARCHAR(128),
  ADD COLUMN IF NOT EXISTS property_type VARCHAR(128),
  ADD COLUMN IF NOT EXISTS search_description TEXT;

-- Property owners extracted from marketplace listings
CREATE TABLE IF NOT EXISTS property_owners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(64),
  city VARCHAR(128),
  city_slug VARCHAR(64),
  district VARCHAR(128),
  district_slug VARCHAR(64),
  source VARCHAR(64),
  source_url VARCHAR(512),
  lead_id INTEGER REFERENCES crm_leads_queue(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_owners_city ON property_owners(city_slug);
CREATE INDEX IF NOT EXISTS idx_property_owners_phone ON property_owners(phone);
CREATE INDEX IF NOT EXISTS idx_property_owners_lead ON property_owners(lead_id);

ALTER TABLE property_owners ENABLE ROW LEVEL SECURITY;
