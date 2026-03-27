# Hearth Product Catalog

A SaaS platform for the hearth industry that aggregates manufacturer product catalogs, streams them to dealer websites via an embeddable widget, and provides dealers with self-service catalog management, sales tools, and lead generation.

**Primary Competitor:** WhyFire.com (~3,500 products, ~60 manufacturers). This platform targets 80+ manufacturers and a superior dealer experience.

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
# → http://localhost:5000
```

---

## Development

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at **http://localhost:5000** |
| `npm run build` | Build for production |
| `npm run start` | Start production server at **http://localhost:5000** |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema changes (dev only) |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:seed-hearth` | Seed hearth-specific brands/configs |
| `npm run db:backup` | Backup current database state |
| `npm run db:restore` | Restore from backup |
| `npm run db:studio` | Open Prisma Studio (DB browser) |

> **Important:** Always stop `npm run dev` before running any `db:migrate`, `db:push`, or `db:generate` commands. Next.js holds a file lock on Prisma engine binaries that causes `EPERM` errors.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Redis (for BullMQ job queue)
REDIS_URL=redis://localhost:6379

# App
NEXT_PUBLIC_APP_URL=http://localhost:5000
NODE_ENV=development
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 5 |
| Auth | Supabase Auth |
| Job Queue | BullMQ + Redis (ioredis) |
| Scraper | Puppeteer |
| CSV Parsing | PapaParse |
| Styling | Tailwind CSS |
| Rich Text | React Quill |
| Validation | Zod |
| External APIs | Airtable, Axios |

---

## Project Structure

```
src/
  app/
    admin/           # Admin UI (manufacturers, products, categories, scraper)
      manufacturers/
      products/
      categories/
      scraper/
      dealer-portal/
      audit/
    api/             # API routes
      products/
      categories/
      scraper/
      widget/        # Public widget API endpoints
      admin/
    (auth)/          # Auth pages (login, forgot-password, welcome)
    (portal)/        # Dealer portal pages
  scraper/           # Scraper engine
    ScraperEngine.ts
    BrandScraper.ts
    ImagePipeline.ts
    queue.ts
    types.ts
  widget/            # Embeddable widget build
  middleware.ts      # Auth routing + session guards
prisma/
  schema.prisma      # Full data model
  seed.ts            # Database seed script
  backup.ts
  restore.ts
OldWebScraperProject/
  configs/           # Per-brand scraper configurations (JSON)
```

---

## Admin Routes

| Route | Purpose |
|---|---|
| `/admin` | Admin dashboard |
| `/admin/manufacturers` | Manage manufacturers and brands |
| `/admin/manufacturers/[id]/integration` | Per-manufacturer integration tracker |
| `/admin/products` | Browse/edit all products |
| `/admin/products/import` | Bulk CSV import |
| `/admin/categories` | Hierarchical category tree |
| `/admin/scraper` | Scraper config editor + job status |
| `/admin/scraper/health` | Scraper health dashboard |
| `/admin/audit` | Full audit log |
| `/admin/dealer-portal/dealers` | Manage dealer accounts |
| `/admin/dealer-portal/users` | Manage portal users |

---

## Dealer Portal Routes

| Route | Purpose |
|---|---|
| `/portal/dashboard` | Summary stats, recent activity, sync health |
| `/portal/catalog` | Browse manufacturers and activate products |
| `/portal/catalog/[manufacturerSlug]` | Per-manufacturer product browser |
| `/portal/activity` | Change feed (new/discontinued/updated products) |
| `/portal/estimates` | Employee estimate builder and list |
| `/portal/leads` | Lead pipeline (Kanban/table) |
| `/portal/widget` | Widget config builder + embed code |
| `/portal/settings` | Notification preferences, pricing config, CRM integration |

---

## Public Widget API

All endpoints are public and authenticated via a dealer token. No Supabase session required.

| Endpoint | Description |
|---|---|
| `GET /api/widget/[dealerToken]/products` | Paginated dealer product list (filterable) |
| `GET /api/widget/[dealerToken]/products/[slug]` | Full product detail |
| `GET /api/widget/[dealerToken]/config` | Widget colors, fonts, feature flags |
| `POST /api/widget/[dealerToken]/lead` | Submit a consumer lead |
| `POST /api/widget/[dealerToken]/analytics` | Widget usage event tracking |

---

## Database Models (Key Entities)

| Model | Description |
|---|---|
| `Manufacturer` | Top-level manufacturer (e.g., Hearth & Home Technologies) |
| `Brand` | Brand under a manufacturer (e.g., Heat & Glo, Majestic) |
| `Product` | Individual product with specs, images, documents |
| `ProductImage` | Product images with hash deduplication |
| `ProductSpec` | Key-value spec pairs per product |
| `ProductDocument` | Spec sheets, manuals |
| `ProductCategory` | Hierarchical category assignments |
| `ManufacturerIntegration` | Per-manufacturer integration tracking |
| `ScraperConfig` | Per-brand CSS selectors and scrape settings |
| `ScraperJob` | Scrape job run records (status, counts, errors) |
| `ScraperWorkflow` | Multi-step scraper workflows |
| `AuditLog` | Full before/after change log for all entities |
| `DealerAccount` | Dealer company account (linked to Supabase user) |
| `DealerCatalogSelection` | Dealer's active/inactive product selections |
| `DealerActivityLog` | Per-dealer change feed entries |
| `WidgetConfig` | Widget branding and feature configuration per dealer |
| `Lead` | Consumer leads from widget and estimator |
| `Estimate` / `EstimateItem` | Project estimates with line items |
| `CrmIntegration` | Dealer CRM connection (HubSpot, Salesforce, etc.) |

---

## Roadmap Overview

### Phase 1 — Master Product Catalog Engine (CRITICAL)
Automated data ingestion from 80+ hearth manufacturers. Scraper engine (Puppeteer), CSV import, audit logging, scraper health monitoring.
See: `phase1_plan.md.resolved`

### Phase 2 — Client Operations Portal (HIGH)
Dealer authentication, self-service catalog curation, real-time activity feed, dashboard, Airtable client DB sync.
See: `phase2_plan.md.resolved`

### Phase 3 — Website Embed / Streaming Catalog (HIGH — Revenue)
Public widget API, embeddable Vanilla JS widget, product comparison, favorites, lead capture, SEO (SSR mode), Cloudflare CDN delivery.
See: `phase3_plan.md.resolved`

### Phase 4 — Sales Tools & Lead Generation (MEDIUM-HIGH)
Pricing configuration, project estimate engine, consumer estimator widget, employee in-store estimate tool, CRM integration (HubSpot, Salesforce, Jobber, ServiceTitan), automated follow-up sequences.
See: `phase4_plan.md.resolved`

---

## Scraper Configuration

Per-brand scraper configs live in `OldWebScraperProject/configs/`. The active brand lists are:

| File | Purpose |
|---|---|
| `configs/brands-hearth.json` | Hearth product brands |
| `configs/brands-grill.json` | Grill brands |
| `configs/brands-outdoor.json` | Outdoor furniture brands |
| `configs/brands-images.json` | Image-only scrape configs |
| `configs/all-brands.json` | Combined active brand list |
| `configs/brands/` | Individual brand scraper JSON configs |

### Integration Methods (Priority Order)

| Method | Description |
|---|---|
| A — Direct API | Manufacturer provides a product data API or dealer portal |
| B — Web Scrape | Puppeteer scraper with per-brand CSS selector config |
| C — Distributor Feed | CSV/EDI import from distributors |
| D — Manual | Admin UI CRUD (last resort) |

---

## Schema Migrations

Always follow this sequence to avoid Prisma lock errors:

1. Stop `npm run dev`
2. Edit `prisma/schema.prisma`
3. Run `npm run db:generate`
4. Run `npm run db:migrate` (creates a versioned migration file)
5. Run `npm run db:seed` if needed
6. Restart `npm run dev` — check **http://localhost:5000**

Never use `db:push` in place of `db:migrate` on shared or production databases — it skips migration history.

---

## Seed Strategy

The seed script (`prisma/seed.ts`) uses an **application-level find-then-update** pattern rather than database unique constraints for upsert logic. This prevents data loss and preserves any UI edits made after the initial seed.

```ts
const existing = await prisma.scraperConfig.findFirst({
  where: { name: 'BrandName - Categories', type: 'CATEGORY' }
});
if (existing) {
  await prisma.scraperConfig.update({ where: { id: existing.id }, data: { ... } });
} else {
  await prisma.scraperConfig.create({ data: { ... } });
}
```
