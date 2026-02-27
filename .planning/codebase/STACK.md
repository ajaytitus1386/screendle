# Technology Stack

**Analysis Date:** 2025-02-27

## Languages

**Primary:**
- **TypeScript** 5.9.3 - Core application and scripts
- **Svelte** 5.45.6 - Frontend UI components and pages
- **SQL** - Database schema and migrations
- **YAML** - GitHub Actions CI/CD workflows

**Secondary:**
- JavaScript - Configuration files (vite.config.ts, svelte.config.js)

## Runtime

**Environment:**
- **Node.js** 24.x (via nvm) - Development and script execution
- **Cloudflare Workers** - Production runtime for API endpoints and frontend

**Package Manager:**
- **npm** 11.8.0
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- **SvelteKit** 2.49.1 - Full-stack web framework, pages and API routes
- **Vite** 7.2.6 - Build tool and dev server
- **Tailwind CSS** 4.1.18 - Utility-first styling

**UI Components:**
- **shadcn-svelte** (implicit via components) - Accessible UI components
- **Lucide Icons** (@lucide/svelte) 0.562.0 - SVG icon library

**Testing & Checking:**
- **svelte-check** 4.3.4 - Type checking for Svelte components
- **TypeScript** 5.9.3 - Language and type system

**Build/Dev:**
- **@sveltejs/adapter-cloudflare** 7.2.6 - SvelteKit adapter for Cloudflare Workers
- **@sveltejs/vite-plugin-svelte** 6.2.1 - Vite plugin for Svelte
- **@tailwindcss/vite** 4.1.18 - Tailwind CSS Vite plugin
- **tsx** 4.21.0 - Execute TypeScript scripts without compilation step
- **wrangler** 4.63.0 - Cloudflare Workers CLI for deployment and D1 database management

**Utilities:**
- **clsx** 2.1.1 - Utility for constructing className strings
- **tailwind-merge** 3.4.0 - Merge Tailwind CSS classes intelligently
- **tailwind-variants** 3.2.2 - Create component variants with Tailwind
- **tw-animate-css** 1.4.0 - CSS animation utilities for Tailwind
- **dotenv** 17.2.4 - Load environment variables from .env files

## Key Dependencies

**Critical:**
- **SvelteKit** - Application framework; handles routing, server-side code, and client rendering
- **@sveltejs/adapter-cloudflare** - Enables deployment to Cloudflare Workers with D1 database integration
- **wrangler** - CLI tool for interacting with Cloudflare services (deployment, D1 management)

**Infrastructure:**
- **Tailwind CSS** - Styling engine for responsive design
- **Lucide** - Icon system for UI consistency

## Configuration

**Environment:**
- `.env.example` - Template for required environment variables (TMDB_API_KEY, TMDB_ACCESS_TOKEN, OMDB_API_KEY)
- Environment variables needed only for ingestion scripts, not runtime
- Runtime environment variables handled via Cloudflare bindings

**Build:**
- `svelte.config.js` - SvelteKit configuration with Cloudflare adapter
- `vite.config.ts` - Vite build configuration with Tailwind CSS plugin
- `tsconfig.json` - TypeScript compiler options (strict mode enabled, esModuleInterop enabled)
- `wrangler.toml` - Cloudflare Workers project configuration with D1 database binding
- `tailwind.config.ts` (implicit via Tailwind CSS v4) - Styling configuration
- `.npmrc` - npm configuration
- `components.json` - shadcn-svelte component configuration

## Platform Requirements

**Development:**
- Node.js 24.x
- npm 11.8.0+
- Cloudflare CLI (wrangler) for local D1 testing
- `.env` file with TMDB and OMDB API keys (for ingestion only)

**Production:**
- **Deployment Target:** Cloudflare Pages + Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **CI/CD:** GitHub Actions (automated deployment on push to main, scheduled daily puzzle generation)

## Build Targets

**Development:**
```bash
npm run dev              # Vite dev server at localhost:5173
npm run check           # Type checking for TS and Svelte
npm run check:watch    # Watch mode for type checking
```

**Production:**
```bash
npm run build           # Vite build → .svelte-kit/cloudflare (Cloudflare-optimized output)
npx wrangler pages deploy .svelte-kit/cloudflare  # Deploy to Cloudflare Pages
```

## Database

**System:** Cloudflare D1 (SQLite)
- **Local Development:** `wrangler d1` with `--local` flag
- **Remote Production:** Cloudflare-managed D1 instance
- **Connection:** Via SvelteKit `platform.env.DB` binding

**Schema Management:**
- `scripts/schema.sql` - Initial table definitions (movies, daily_puzzles, scales_rounds)
- `scripts/migrate-schedule.sql` - Schema migrations applied on workflow runs
- Tables: `movies`, `daily_puzzles`, `scales_rounds`

## Scripts

**Package scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check
- `npm run check:watch` - Watch mode type checking
- `npm run schedule` - Generate daily puzzle schedules (local D1)
- `npm run schedule:remote` - Generate schedules using remote D1
- `npm run schedule:apply:local` - Apply schedules to local D1
- `npm run schedule:apply:remote` - Apply schedules to remote D1
- `npm run db:migrate:local` - Run schema migrations on local D1
- `npm run db:migrate:remote` - Run schema migrations on remote D1

**Manual utility scripts:**
- `scripts/ingest.ts` - Fetch movies from TMDB/OMDB and generate seed SQL
- `scripts/schedule.ts` - Pre-schedule N days of daily puzzles
- `scripts/fix-ratings.sql` - Utility SQL for data cleanup

---

*Stack analysis: 2025-02-27*
