# Имоти Надежда (Imoti Nadezhda) - Real Estate Platform

## Handoff за нов агент (прочети първо при ~95% контекст)

**Пълен контекст от днешната сесия + DB + Burgas:** [`docs/AGENT-HANDOFF.md`](docs/AGENT-HANDOFF.md)

Там е описано: Supabase Postgres през Vercel, 3-те Burgas страници, `burgas-complete/`, PR #2, demo имот `900001`, правила на потребителя.

---

## Overview

Single **Next.js 14** app (App Router) — luxury real estate for Bulgarian cities (Shumen, Varna, Burgas, Novi Pazar). **npm** only.

## Running the app

```bash
npm run dev    # http://localhost:3000
```

## Key commands

- **Lint**: `npm run lint` (pre-existing warnings; exits 0)
- **Build**: `npm run build`
- **Dev**: `npm run dev`

## Database — Supabase on Vercel (PostgreSQL, not MySQL)

| What | Where |
|------|--------|
| Runtime queries | `lib/db.ts` — `pg` pool, `POSTGRES_URL` or `DATABASE_URL` from **Vercel env** (Supabase integration) |
| Supabase API | `lib/supabase/server.ts` — `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Migrations | `supabase/migrations/*.sql` |
| No DB configured | Queries return `[]`; properties fall back to `data/local-properties.json` |

Copy `.env.example` → `.env.local` or `vercel env pull .env.local`.

Production: `POSTGRES_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`.

Deploy: **Vercel** — https://imoti-nadezhda.vercel.app

## Burgas pages (active work — branch `cursor/burgas-city-page-11f4`, PR #2)

| URL | Source |
|-----|--------|
| `/cities/burgas` | `burgas-complete/city/` — do not edit; replace from zip |
| `/cities/burgas/lazur` | `burgas-complete/quarter/` |
| `/cities/burgas/lazur/property/900001` | `burgas-complete/property/` + demo in `data/local-properties.json` |

Install zip: `bash scripts/install-burgas-complete.sh` (after extracting to `burgas-COMPLETE/`).

## Site shell exceptions

- `/` — `main--home-exact` (no default header/footer)
- `/cities/burgas` and `/cities/burgas/[quarter]` — `main--city-burgas-exact`
- `/cities/burgas/.../property/[id]` — `main--property-detail`

See `components/layout/SiteShell.tsx`.
