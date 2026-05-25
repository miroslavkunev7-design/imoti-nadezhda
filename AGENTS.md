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

### Database fallback
The app gracefully degrades when no MySQL database is configured. Without `DB_BRIDGE_URL`/`DB_BRIDGE_KEY` or `DB_HOST`/`DB_USER`/`DB_NAME` env vars, all DB queries return empty arrays and CRUD operations use a local JSON store at `data/local-properties.json`. This means you can run the full app locally without any external database.

### Admin login (local dev)
Credentials are set via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`. Default local values:
- Email: `admin@imotinadejda.bg`
- Password: `admin123`

### ESLint configuration
The repo ships without an `.eslintrc.json`; one was added (extends `next/core-web-vitals` with `react/no-unescaped-entities` set to `warn`) so that `next lint` and `next build` run non-interactively.

### Environment file
`.env.local` is gitignored and must exist for the dev server. Copy from `.env.example` and adjust as needed. The minimal local-dev configuration requires no secrets — just set empty `DB_BRIDGE_URL`/`DB_BRIDGE_KEY` and a dummy `NEXTAUTH_SECRET`.
