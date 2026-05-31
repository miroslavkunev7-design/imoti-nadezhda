#!/usr/bin/env node
/**
 * Seed demo Burgas properties (900001–900006) into Supabase/Postgres.
 * Requires POSTGRES_URL or DATABASE_URL in .env.local
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    const p = path.join(root, f)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
      }
    }
  }
}

loadEnv()

const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!url) {
  console.error('Missing POSTGRES_URL — seed via Supabase MCP instead')
  process.exit(2)
}

const listings = JSON.parse(
  fs.readFileSync(path.join(root, 'data/local-properties.json'), 'utf8')
)

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

async function main() {
  await client.connect()

  const userRes = await client.query('SELECT id FROM users ORDER BY id LIMIT 1')
  const userId = userRes.rows[0]?.id ?? 1

  for (const p of listings) {
    if (p.city_slug !== 'burgas') continue

    await client.query(
      `INSERT INTO properties (
        id, user_id, title, slug, description, price, city, quarter,
        property_type, status, area, bedrooms, bathrooms, floor, total_floors,
        furnished, main_image, views, created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,'available',$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        city = EXCLUDED.city,
        quarter = EXCLUDED.quarter,
        property_type = EXCLUDED.property_type,
        status = EXCLUDED.status,
        area = EXCLUDED.area,
        bedrooms = EXCLUDED.bedrooms,
        bathrooms = EXCLUDED.bathrooms,
        floor = EXCLUDED.floor,
        total_floors = EXCLUDED.total_floors,
        furnished = EXCLUDED.furnished,
        main_image = EXCLUDED.main_image,
        views = EXCLUDED.views,
        updated_at = EXCLUDED.updated_at`,
      [
        p.id,
        p.user_id ?? userId,
        p.title,
        p.slug,
        p.description,
        p.price,
        p.city,
        p.quarter,
        p.property_type,
        p.area,
        p.bedrooms,
        p.bathrooms,
        p.floor,
        p.total_floors,
        p.furnished ?? 'no',
        p.main_image,
        p.views ?? 0,
        p.created_at,
        p.updated_at,
      ]
    )

    await client.query('DELETE FROM property_images WHERE property_id = $1', [p.id])
    const imgs = p.images?.length ? p.images : [p.main_image]
    for (let i = 0; i < imgs.length; i++) {
      await client.query(
        `INSERT INTO property_images (property_id, image_path, sort_order) VALUES ($1,$2,$3)`,
        [p.id, imgs[i], i]
      )
    }

    await client.query('DELETE FROM property_features WHERE property_id = $1', [p.id])
    for (const f of p.features ?? []) {
      await client.query(
        `INSERT INTO property_features (property_id, feature_name) VALUES ($1,$2)`,
        [p.id, f]
      )
    }

    console.log('OK property', p.id, p.title)
  }

  await client.query(
    `SELECT setval(pg_get_serial_sequence('properties', 'id'), GREATEST((SELECT MAX(id) FROM properties), 900006))`
  )

  const count = await client.query(
    `SELECT COUNT(*)::int AS n FROM properties WHERE city ILIKE '%ургас%'`
  )
  console.log('Burgas properties in DB:', count.rows[0].n)
  await client.end()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
