# Имоти Надежда (Imoti Nadezhda) - Real Estate Platform

## Cursor Cloud specific instructions

### Overview
Single Next.js 14 app (App Router) — luxury real estate platform for Bulgarian cities. Uses npm as package manager.

### Running the app
```bash
npm run dev    # starts on http://localhost:3000
```

### Key commands
- **Lint**: `npm run lint` (has pre-existing warnings; exits 0 with current `.eslintrc.json`)
- **Build**: `npm run build`
- **Dev**: `npm run dev`

### Database
PostgreSQL on Supabase via `POSTGRES_URL` (or `DATABASE_URL`). Without it, DB queries return empty arrays and CRUD falls back to `data/local-properties.json`.

### Environment file
Copy `.env.example` to `.env.local`. Required for production: `POSTGRES_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`.
