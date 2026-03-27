# Hearth Product Catalog — Claude Instructions

## Project Overview
A Next.js 14 product catalog engine for hearth industry dealers. Built with Next.js App Router, Prisma ORM, Supabase (PostgreSQL + Storage), and TypeScript.

## Dev Commands
```bash
npm run dev          # Start dev server on port 5000
npm run build        # Generate Prisma client + Next.js build
npm run test         # Run Vitest tests
npm run lint         # ESLint
npm run db:safe-migrate -- --name <label>  # THE ONLY safe way to migrate
npm run db:seed                            # Re-seed reference data
npm run db:seed:snapshot -- --label <lbl>  # Snapshot live DB before migrate
npm run db:seed:restore                    # Roll back from latest snapshot
npm run db:backup    # JSON backup of ALL tables (prisma/backups/)
npm run db:restore   # Restore from latest JSON backup
npm run db:studio    # Prisma Studio UI
```

## Project Structure
```
src/app/
  admin/         # Admin panel (products, scraper, manufacturers, categories, etc.)
  (auth)/        # Auth routes
  (portal)/      # Customer-facing portal
  dealer/        # Dealer portal
  api/           # API routes
prisma/          # Schema, seed scripts, backup/restore, migrations
scripts/         # One-time utility and setup scripts
public/          # Static assets
tests/           # Test data files (gitignored)
logs/            # Log output files (gitignored)
prompts/         # Planning docs and AI session prompts (gitignored)
```

## File Organization Rules

**Always follow these conventions — apply them proactively without being asked:**

| File type | Correct location |
|-----------|-----------------|
| Test data files, fixture CSVs, import test files | `tests/` |
| Log files, compiler output, runtime error logs | `logs/` |
| Planning docs, implementation plans, handoff notes, design docs, AI prompts | `prompts/` |
| One-time utility/setup scripts | `scripts/` |
| Project config files | Root (never move these) |

- **Never place test files, logs, or planning docs in the project root.**
- All three folders (`tests/`, `logs/`, `prompts/`) are gitignored. If a file needs to be tracked, add a specific `!exception` to `.gitignore` — do not remove the folder-level ignore.
- `vitest.config.ts`, `next.config.js`, `tsconfig.json`, `vercel.json`, and similar config files always stay in the root.

## Database Rules

**The ONLY safe way to run a migration:**
```bash
npm run db:safe-migrate -- --name <descriptive-name>
```
This command automatically: backs up all tables → snapshots the live seed state → generates the migration SQL (create-only) → **pauses for review** → applies the reviewed migration → regenerates the Prisma client → re-seeds reference data. Never use `db:migrate` or `db:push` directly — they are blocked.

**Before any schema change:**
1. **Introspect the live database first** — query `information_schema` to get actual column types, nullability, FK relationships, and row counts. Never plan a migration from the schema file alone.
2. **Run the non-destructive decision tree** in `.agent/skills/non-destructive-migrations/SKILL.md`.

Both steps are mandatory. Full introspection queries are in the skill file.

### Migration SQL Must Always Be Reviewed Before Applying

All migrations use the **create-only → review → deploy** pattern:

```bash
# 1. Generate SQL only — does NOT apply it
npx prisma migrate dev --create-only --name <descriptive-name>

# 2. Open prisma/migrations/<timestamp>_<name>/migration.sql
#    Replace any destructive DDL with safe SQL (see skill for table of replacements)

# 3. Apply the reviewed migration
npx prisma migrate deploy
npx prisma generate
```

**Never run `prisma migrate dev` without `--create-only` on any change that touches existing columns.**

- **Never run `prisma db push` on a database with real data.**
- **Never use `--accept-data-loss`** without exhausting all non-destructive options first.
- All backups live in `prisma/backups/` and seed snapshots in `prisma/seeds/snapshots/` (both gitignored).
- Exception: adding a new nullable column with no existing data to migrate may use `prisma migrate dev` directly.

### Seed System
```
prisma/seeds/
  01-categories.ts       ← product category taxonomy (reference data)
  02-manufacturers-brands.ts ← manufacturers & brands (reference data)
  03-scraper-configs.ts  ← legacy scraper configs (reference data)
  index.ts               ← orchestrator (add new seed modules here)
  generate-seed.ts       ← snapshots live DB to prisma/seeds/snapshots/
  restore-snapshot.ts    ← rolls back from a snapshot
  snapshots/             ← gitignored; timestamped pre-migration snapshots
```

### Non-Destructive Migration Priority (in order)

1. **Migrate in-place with raw SQL** — use `--create-only`, rewrite Prisma's DDL with safe `ALTER TABLE` statements.
2. **Reuse an unused field** — repurpose an existing unused column instead of adding a new one.
3. **Backup → Migrate → Rehydrate** — write remaps in `restore.ts` first, then `db:safe-migrate`.
4. **If all 3 fail → STOP AND ASK THE USER.** Do not force the migration.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL via Prisma ORM
- **Storage**: Supabase Storage (`products` bucket)
- **Auth**: Supabase Auth (SSR)
- **Testing**: Vitest + Testing Library
- **Deployment**: Vercel

## Modal System

All modals, dialogs, confirmation prompts, and overlays must use the shared `Modal` component from `@/components/Modal`. Never build ad-hoc overlays.

- **Import**: `import Modal from '@/components/Modal'`
- **Sizes**: `sm` (400px), `md` (600px), `lg` (800px), `xl` (1100px), `full`, `excel`
- **Backdrop click does NOT close** the modal — Escape key and the × button are the only dismiss paths.
- **Body padding is 0** — child content owns its own padding.
- Full patterns, props table, and examples: `.agent/skills/modal-system/SKILL.md`
- Live preview: `/admin/modal-test`

