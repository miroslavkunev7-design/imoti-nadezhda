# Постоянни правила за handoff (агент → агент)

**Важност:** Тези правила са задължителни за **всяка** Cloud Agent сесия, докато не бъдат отменени от потребителя (минимум следващите **10** сесии).

## 1. Кога се прави handoff

- Веднага след като страница/флоу достигне **~90–95%** визуално съвпадение с макета (или при предаване на нова задача).
- При всяко предаване на контекст към **нов агент** — без изключение.

## 2. Какво се обновява автоматично

1. **`docs/AGENT-HANDOFF.md`** — пълен контекст: DB (Supabase/Vercel), маршрути, Burgas zip, demo данни, последни commit-и, URL-и за QA.
2. **`AGENTS.md`** — кратък линк към handoff + команди (`npm run dev`, env).
3. **Команда за новия агент** (в края на сесията / PR):

   ```
   Прочети първо docs/AGENT-HANDOFF.md и docs/AGENT-HANDOFF-RULES.md.
   Цел: ≥90–95% mockup match на Burgas (и други активни страници).
   Работи напълно автоматично без въпроси, докато не се стигне целта.
   ```

## 3. Burgas — технически бележки (актуални)

| URL | Файлове |
|-----|---------|
| `/cities/burgas` | `burgas-complete/city/CityBurgasView.tsx`, `city-burgas-exact.css` |
| Hero снимка | `/public/images/cities/burgas-city-hero-sunset.jpg` (+ `.webp`) |
| Layout city | Hero (прелят) → **търсене в `cb-search-band`** → квартали |
| `/cities/burgas/[quarter]` | `QuarterBurgasView.tsx` |
| Property | `PropertyDetailBurgasView.tsx` |

Zip (1:1 от дизайнера): `bash scripts/install-burgas-complete.sh` — **не редактирай** файловете след копиране.

## 4. Deploy

- Production: push към `master` → Vercel auto-deploy.
- Generic routes redirect: `/cities/burgas` → dedicated `app/cities/burgas/*`.

## 5. Замяна на hero снимка (Бургас град)

Потребителят може да качи точния файл в:

`public/images/cities/burgas-city-hero-sunset.jpg`

След това: `node -e "require('sharp')('public/images/cities/burgas-city-hero-sunset.jpg').webp({quality:90}).toFile('public/images/cities/burgas-city-hero-sunset.webp')"`

---

*Последна актуализация: 31.05.2026*
