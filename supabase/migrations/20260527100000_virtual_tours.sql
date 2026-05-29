-- AI Virtual Tour Engine — Imoti Nadezhda

CREATE TABLE IF NOT EXISTS virtual_tours (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  mode VARCHAR(32) NOT NULL DEFAULT 'walkthrough_3d',
  progress_step VARCHAR(64) NOT NULL DEFAULT 'idle',
  progress_percent SMALLINT NOT NULL DEFAULT 0,
  error_message TEXT,
  manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  frame_count INTEGER NOT NULL DEFAULT 0,
  duration_sec NUMERIC(8,2) NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_virtual_tours_property_published
  ON virtual_tours (property_id)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_virtual_tours_property ON virtual_tours (property_id);
CREATE INDEX IF NOT EXISTS idx_virtual_tours_status ON virtual_tours (status);

CREATE TABLE IF NOT EXISTS tour_frames (
  id SERIAL PRIMARY KEY,
  tour_id INTEGER NOT NULL REFERENCES virtual_tours(id) ON DELETE CASCADE,
  image_url VARCHAR(512) NOT NULL,
  scene_type VARCHAR(48) NOT NULL DEFAULT 'living_room',
  sort_order INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 3200,
  camera_position JSONB NOT NULL DEFAULT '{"x":0,"y":1.6,"z":0}'::jsonb,
  camera_target JSONB NOT NULL DEFAULT '{"x":0,"y":1.6,"z":-1}'::jsonb,
  transition JSONB NOT NULL DEFAULT '{"style":"cinematic","ease":"power2.inOut"}'::jsonb,
  stabilized_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_frames_tour_order ON tour_frames (tour_id, sort_order);

CREATE TABLE IF NOT EXISTS scene_analysis (
  id SERIAL PRIMARY KEY,
  tour_id INTEGER NOT NULL REFERENCES virtual_tours(id) ON DELETE CASCADE,
  frame_id INTEGER REFERENCES tour_frames(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  scene_type VARCHAR(48) NOT NULL,
  confidence NUMERIC(5,4) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  depth_estimate NUMERIC(8,4),
  light_azimuth NUMERIC(6,2),
  light_elevation NUMERIC(6,2),
  embedding JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scene_analysis_tour ON scene_analysis (tour_id);

CREATE TABLE IF NOT EXISTS tour_settings (
  id SERIAL PRIMARY KEY,
  tour_id INTEGER NOT NULL UNIQUE REFERENCES virtual_tours(id) ON DELETE CASCADE,
  autoplay_speed NUMERIC(4,2) NOT NULL DEFAULT 1,
  transition_style VARCHAR(32) NOT NULL DEFAULT 'cinematic',
  easing VARCHAR(48) NOT NULL DEFAULT 'power2.inOut',
  stabilization BOOLEAN NOT NULL DEFAULT TRUE,
  frame_blend BOOLEAN NOT NULL DEFAULT TRUE,
  trim_start_ms INTEGER NOT NULL DEFAULT 0,
  trim_end_ms INTEGER NOT NULL DEFAULT 0,
  editor_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE virtual_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_settings ENABLE ROW LEVEL SECURITY;
