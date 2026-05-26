ALTER TABLE crm_clients ADD COLUMN IF NOT EXISTS source VARCHAR(32) DEFAULT 'website';

CREATE TABLE IF NOT EXISTS crm_mortgage_applications (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  bank_target VARCHAR(32) NOT NULL,
  files JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(32) NOT NULL DEFAULT 'sent',
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mortgage_client ON crm_mortgage_applications(client_id);

ALTER TABLE crm_mortgage_applications ENABLE ROW LEVEL SECURITY;
