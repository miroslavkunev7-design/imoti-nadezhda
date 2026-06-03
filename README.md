# Имоти Надежда

Luxury real estate platform for Shumen, Varna, Burgas, and Novi Pazar.

**Production:** https://imoti-nadezhda.vercel.app

## Quick Start

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Deploy (Vercel)

1. Import this repo on [Vercel](https://vercel.com/new)
2. Framework: **Next.js** (auto-detected)
3. Add env vars from `.env.example` (minimum: `NEXTAUTH_SECRET`, Supabase/Postgres if used)
4. Deploy — each push to `master` triggers a new build

## Tech Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- PostgreSQL via Supabase (`POSTGRES_URL`)
- Vercel hosting

See `AGENTS.md` and `docs/AGENT-HANDOFF.md` for full project context.
