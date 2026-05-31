# Handoff за нов агент — Имоти Надежда (31 май 2026)

Прочети този файл **първо**, ако продължаваш работа след Cloud Agent сесия. Обхваща целия проект, базата данни, деплой и всичко свършено днес по Burgas.

**Постоянни правила за всеки следващ агент:** [`docs/AGENT-HANDOFF-RULES.md`](AGENT-HANDOFF-RULES.md)

---

## 1. Какво е проектът

**Имоти Надежда** — луксозна платформа за недвижими имоти (България): Шумен, Варна, **Бургас**, Нови пазар.

| Слой | Технология |
|------|------------|
| Frontend | **Next.js 14** App Router, TypeScript, Tailwind |
| Hosting | **Vercel** — production: https://imoti-nadezhda.vercel.app |
| База данни | **PostgreSQL на Supabase** (не MySQL) |
| Media | Cloudinary + `/public/images` |
| Auth admin | NextAuth (`/admin`) |
| Package manager | **npm** |

Repo: `miroslavkunev7-design/imoti-nadezhda`  
Активен PR branch (Burgas): `cursor/burgas-city-page-11f4` → PR **#2** → `master`

---

## 2. База данни — Supabase + Vercel (важно)

- Приложението говори с Postgres през `pg` pool в `lib/db.ts`.
- Connection string идва от Vercel env (често auto-provision при свързан Supabase):

```
POSTGRES_URL=              # основен (pooler)
DATABASE_URL=              # алтернатива
POSTGRES_URL_NON_POOLING=  # migrations / тежки задачи
```

- Supabase client (Auth/Storage API): `lib/supabase/server.ts`  
  - `NEXT_PUBLIC_SUPABASE_URL`  
  - `SUPABASE_SERVICE_ROLE_KEY` (или `SUPABASE_SECRET_KEY`)

- **Без `POSTGRES_URL`**: `query()` връща `[]`, имотите идват от `data/local-properties.json` (`lib/local-store/properties.ts`, `lib/properties/merge-local.ts`).

- Миграции: `supabase/migrations/*.sql` (initial schema, CRM, virtual tours, mortgage, secrets).

- Health check: `GET /api/admin/health` — показва дали DB е конфигуриран.

- Статус в host DB: `available` (не `active`) — мапва се в `lib/db/mappers.ts` → UI `active`.

---

## 3. Environment

```bash
cp .env.example .env.local
# Попълни от Vercel Dashboard → Settings → Environment Variables
# или: vercel env pull .env.local
```

Задължително за production: `POSTGRES_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`.

Локално dev работи и без DB (fallback JSON).

---

## 4. Команди

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint     # има legacy warnings, exit 0
```

---

## 5. Архитектура на страници (публични)

| URL | Описание |
|-----|----------|
| `/` | Homepage — `HomeHero`, `app/home-exact.css`, `main--home-exact` |
| `/cities/burgas` | **Dedicated Burgas** — не ползва `[slug]` |
| `/cities/burgas/lazur` | Квартал (динамично: `lazur`, `centar`, `slaveykov`, …) |
| `/cities/burgas/centar` | Пример — друг квартал |
| `/cities/burgas/lazur/property/900001` | Детайл — demo локален имот |
| `/cities/[slug]` | Други градове (burgas изключен от SSG) |
| `/cities/[slug]/[quarter]` | Generic quarter (Burgas има по-специфичен route) |
| `/buy`, `/sell`, `/admin/*` | Стандартни |

**SiteShell** (`components/layout/SiteShell.tsx`):

- `/` → `main--home-exact` (без SiteHeader/Footer)
- `/cities/burgas` → `main--city-burgas-exact`
- `/cities/burgas/:quarter` → `main--quarter-burgas-exact` (scroll, без SiteHeader/Footer)
- `/cities/burgas/:quarter/property/:id` → `main--property-detail`
- Останалите → SiteHeader + `rd-page-content` + SiteFooter

---

## 6. Работа днес — Burgas (3 страници)

### Цел на потребителя

1:1 страници от пакет **`burgas-COMPLETE (2).zip`** (Desktop: `c:\Users\milena\Desktop\new im\`).  
**Забрана**: не „подобрявай“ кода от zip — само интеграция/wiring.  
Zip **не беше** в cloud workspace — кодът е в `burgas-complete/` + install script.

### Структура `burgas-complete/` (каноничен изходен код)

```
burgas-complete/
  city/     → CityBurgasView.tsx, city-burgas-exact.css, MarbleQuarterCard.tsx (git 81ac8f8)
  quarter/  → QuarterBurgasView.tsx, QuarterBurgasPage.tsx, quarter-burgas-exact.css (bq-*, динамичен slug)
  property/ → PropertyDetailBurgasView.tsx, property-burgas-exact.css (mockup 3 hero + search)
  shared/   → BurgasChrome.tsx (BurgasHeader)
```

Re-export в app (не пипай логиката в `burgas-complete/`):

- `components/city/CityBurgasView.tsx` → `@/burgas-complete/city/...`
- `app/city-burgas-exact.css` → `@import` от burgas-complete
- `components/property/PropertyDetailScreen.tsx` → burgas-complete/property

### Маршрути

- `app/cities/burgas/page.tsx` + `layout.tsx`
- `app/cities/burgas/[quarter]/page.tsx` — вика `QuarterBurgasPage` с `slug: 'burgas'`
- `app/cities/burgas/[quarter]/property/[id]/page.tsx`

### Demo имот (без Supabase)

`data/local-properties.json` — ids **900001–900006** (lazur, centar, slaveykov, izgrev). Детайл: **900001**.

### Инсталация на zip (когато потребителят качи файловете)

```bash
# Разархивирай в /workspace/burgas-COMPLETE/{city,quarter,property}/
bash scripts/install-burgas-complete.sh
npm run dev
```

### История на layout Burgas (не бъркай макетите)

1. Първо: full-bleed hero (грешно спрямо mockup)
2. Mockup 2: dark hero + ЗА ГРАДА + 6 полета search
3. Vertical mockup: header → gold frame hero → 3 search fields → marble quarters
4. **Текущо city**: `81ac8f8` — hero секция с cb-hero, nav, about panel, search, долу cb-quarters
5. **Quarter**: `QuarterBurgasView` — hero + search + филтри + карти + карта (bq-*)
6. **Property**: `PropertyDetailBurgasView` — hero interior + search overlay + 6 stats + gallery

### Hero изображение (`/cities/burgas`)

- **Активно:** `public/images/cities/burgas-city-hero-sunset.jpg` (+ `.webp`) — HQ залез/пирс/Морска градина
- `lib/data/city-background.ts` → `getCityPanoramaAsset('burgas')`
- **Layout (31.05):** hero с прелята info карта (`cb-about--blend`) → търсене в `cb-search-band` (център) → квартали
- За 1:1 с прикачен PNG от потребителя: замени `burgas-city-hero-sunset.jpg` и регенерирай `.webp`

### PR

https://github.com/miroslavkunev7-design/imoti-nadezhda/pull/2  
Branch: `cursor/burgas-city-page-11f4` (suffix `-11f4` за cloud agents)

---

## 7. Правила от потребителя (workflow)

- Работи **страница по страница** преди production.
- **Не променяй** проекта автоматично, докато не каже „промени“ / explicit go-ahead (Burgas work беше изрично поискано).
- За Burgas zip: **нулева промяна** на файловете в `burgas-complete/` — само копиране от zip + route wiring.
- Дизайн: Claude/mockup → готови файлове; агентът интегрира API/код когато е поискано.
- Composer agent в Cursor Cloud; branch pattern: `cursor/<name>-11f4`.

---

## 8. Ключови файлове (бърз индекс)

| Област | Файлове |
|--------|---------|
| DB | `lib/db.ts`, `lib/queries/*`, `lib/db/mappers.ts` |
| Supabase | `lib/supabase/server.ts`, `supabase/migrations/` |
| Fallback data | `lib/data/fallback.ts`, `lib/data/quarters.ts`, `data/local-properties.json` |
| Homepage | `components/home/HomeHero.tsx`, `app/home-exact.css` |
| Burgas | `burgas-complete/**`, `app/cities/burgas/**`, `app/city-burgas-exact.css` |
| Property detail CSS | `app/cities/[slug]/[quarter]/property/[id]/property-detail.css` |
| Shell | `components/layout/SiteShell.tsx` |
| Admin CRM | `app/admin/**`, `app/admin/admin-luxury.css` |

---

## 9. Чести проблеми

| Симптом | Решение |
|---------|---------|
| Dev 500 `Cannot find module './8948.js'` | `rm -rf .next && npm run dev` |
| Празни имоти | Провери `POSTGRES_URL` или добави в `local-properties.json` |
| Burgas не изглежда „едно“ | Сравни с zip; инсталирай `burgas-complete` от zip |
| Детайл 404 | Използвай id `900001` или seed в DB |
| `body overflow` конфликт | Burgas/home pages ползват `100dvh` + scoped CSS |

---

## 10. Следващи стъпки (препоръка)

1. Потребителят качва `burgas-COMPLETE (2).zip` → `bash scripts/install-burgas-complete.sh`
2. Визуален QA на 3-те URL (city / lazur / property/900001)
3. Merge PR #2 след одобрение
4. Varna/Shumen — същият pattern (`burgas-complete` като шаблон) само ако е поискано

---

## 11. Vercel deploy

- Push към `master` → Vercel auto deploy
- Env vars от Supabase integration в Vercel project settings
- Preview URLs от PR branches

---

*Последна актуализация: 31.05.2026 — динамични Burgas quarter + property views, demo listings 900001–900006.*
