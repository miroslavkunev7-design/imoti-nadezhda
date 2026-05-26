CREATE TABLE IF NOT EXISTS crm_leads_queue (
  id SERIAL PRIMARY KEY,
  source VARCHAR(64) NOT NULL DEFAULT 'realistimo',
  external_id VARCHAR(255),
  city VARCHAR(128) NOT NULL,
  city_slug VARCHAR(64),
  district VARCHAR(128) NOT NULL DEFAULT '',
  district_slug VARCHAR(64),
  title VARCHAR(512) NOT NULL,
  description TEXT,
  phone VARCHAR(64),
  price NUMERIC(12,2),
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'pending_review',
  source_url VARCHAR(512),
  property_type VARCHAR(128) DEFAULT 'Апартамент',
  area_sqm NUMERIC(10,2),
  duplicate_key VARCHAR(255),
  published_property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_leads_external
  ON crm_leads_queue (source, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads_queue (status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_city ON crm_leads_queue (city_slug);
CREATE INDEX IF NOT EXISTS idx_crm_leads_duplicate_key ON crm_leads_queue (duplicate_key);

ALTER TABLE crm_leads_queue ENABLE ROW LEVEL SECURITY;
