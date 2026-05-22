# Имоти Надежда

Luxury real estate platform for Shumen, Varna, Burgas, and Novi Pazar.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
copy .env.example .env.local
# Then open .env.local and fill in your MySQL credentials
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** — luxury dark crimson design tokens
- **Framer Motion** — cinematic animations
- **mysql2** — direct MySQL connection to InfinityFree
- **NextAuth.js** — authentication

## Database
MySQL hosted on InfinityFree (`sql100.infinityfree.com`).  
15 tables: cities, quarters, properties, property_images, property_features,  
users, favorites, inquiries, appointments, crm_clients, crm_notes, crm_tasks,  
activity_logs, settings, uploads.

## Project Structure
```
app/                  Next.js App Router pages + API routes
  layout.tsx          Root layout (Navbar + BottomBar)
  page.tsx            Homepage
  cities/[slug]/      City pages
  buy/                Browse all listings
  sell/               Publish a property
  admin/              CRM dashboard
  api/                REST API routes
components/
  layout/             Navbar, BottomBar
  ui/                 Logo, Breadcrumb, Badges, Skeletons
  cards/              CityCard, NeighborhoodCard, PropertyCard
  search/             SearchWidget and filter components
lib/
  db.ts               MySQL pool + typed query helpers
  queries/            Server-side data access functions
  utils.ts            Formatting, slugs, constants
types/
  index.ts            All shared TypeScript interfaces
```
