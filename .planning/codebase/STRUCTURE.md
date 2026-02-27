# Codebase Structure

**Analysis Date:** 2025-02-27

## Directory Layout

```
screendle/
├── src/                             # Source code (Svelte + SvelteKit)
│   ├── lib/                         # Shared utilities, types, components
│   │   ├── assets/                  # Static assets (favicon.svg, etc.)
│   │   ├── components/              # Reusable Svelte components
│   │   │   ├── ui/                  # shadcn-svelte base components
│   │   │   │   ├── button/          # Button component (styled)
│   │   │   │   ├── card/            # Card component family
│   │   │   │   └── input/           # Input field component
│   │   │   ├── GameRow.svelte       # Single guess row (7 property cells)
│   │   │   ├── SearchInput.svelte   # Debounced autocomplete search
│   │   │   └── HowToPlay.svelte     # Modal with game rules
│   │   ├── db.ts                    # D1 row mappers (rowToMovie, etc.)
│   │   ├── daily.ts                 # Seeded RNG, date keys, movie pool
│   │   ├── types.ts                 # TypeScript types (Movie, GuessResult, etc.)
│   │   ├── utils.ts                 # Helper functions (cn for Tailwind)
│   │   └── index.ts                 # Entry point (empty)
│   ├── routes/                      # SvelteKit file-based routing
│   │   ├── +layout.svelte           # Root layout (navbar, theme, modals)
│   │   ├── +page.svelte             # Home page (mode selection)
│   │   ├── classic/
│   │   │   └── +page.svelte         # Classic mode (guess the movie)
│   │   ├── scales/
│   │   │   └── +page.svelte         # Scales mode (higher/lower)
│   │   └── api/                     # Server-side API endpoints
│   │       ├── daily/
│   │       │   └── +server.ts       # GET /api/daily
│   │       ├── scales/
│   │       │   └── +server.ts       # GET /api/scales
│   │       └── search/
│   │           └── +server.ts       # GET /api/search?q={query}
│   ├── app.css                      # Global styles (Tailwind + CSS variables)
│   └── app.d.ts                     # TypeScript ambient declarations
├── scripts/                         # Build and automation scripts
│   ├── schedule.ts                  # Generate daily_puzzles table entries
│   ├── migrate-schedule.sql         # Migration SQL for schedule table
│   └── schedule.sql                 # DDL for daily_puzzles, scales_rounds
├── static/                          # Static files (served as-is)
├── .claude/                         # Claude AI context and progress
│   └── progress/                    # Session logs
├── .planning/                       # GSD planning documents
│   └── codebase/                    # Architecture analysis documents
├── .github/
│   └── workflows/                   # CI/CD (auto-deploy on push)
├── package.json                     # Node dependencies, scripts
├── wrangler.toml                    # Cloudflare Workers config (D1 binding)
├── svelte.config.js                 # SvelteKit + Cloudflare adapter
├── tsconfig.json                    # TypeScript compiler options
├── vite.config.ts                   # Vite bundler config
└── components.json                  # shadcn-svelte component registry
```

## Directory Purposes

**`src/lib/`:**
- Purpose: Reusable, shared code (types, utilities, components, API helpers)
- Contains: TypeScript types, Svelte components, database mappers, utilities
- Key files: `types.ts`, `daily.ts`, `db.ts`, `utils.ts`

**`src/lib/components/`:**
- Purpose: Reusable Svelte components for both game modes
- Contains: Game row renderer, movie search, how-to-play modal, UI primitives
- Key files: `GameRow.svelte`, `SearchInput.svelte`, `HowToPlay.svelte`

**`src/lib/components/ui/`:**
- Purpose: Base UI component library (shadcn-svelte)
- Contains: Button, Card, Input primitives
- Pattern: Each component in its own directory with `index.ts` barrel file

**`src/routes/`:**
- Purpose: SvelteKit file-based routing (pages and API endpoints)
- Contains: Page components and server route handlers
- Pattern: `+page.svelte` for pages, `+server.ts` for API endpoints, `+layout.svelte` for shared layout

**`src/routes/classic/` and `src/routes/scales/`:**
- Purpose: Game mode pages
- Contains: Game board layout, state management, user interactions
- Key files: `+page.svelte` (contains entire game logic + UI)

**`src/routes/api/`:**
- Purpose: Server-side HTTP endpoints (Cloudflare Workers)
- Contains: Database queries, puzzle logic, search functionality
- Pattern: Each endpoint in named subdirectory with `+server.ts`

**`scripts/`:**
- Purpose: Standalone scripts for data generation and migrations
- Contains: Database scheduling script, migration SQL
- Usage: Run via npm scripts (`npm run schedule`, `npm run db:migrate:local`)

## Key File Locations

**Entry Points:**
- `src/routes/+page.svelte`: Landing page (mode selection)
- `src/routes/classic/+page.svelte`: Classic mode game
- `src/routes/scales/+page.svelte`: Scales mode game

**Configuration:**
- `wrangler.toml`: Cloudflare Workers + D1 database binding
- `svelte.config.js`: SvelteKit adapter (Cloudflare Pages)
- `tsconfig.json`: TypeScript strict mode, path alias configuration
- `vite.config.ts`: Vite + Tailwind integration

**Core Logic:**
- `src/lib/types.ts`: All game type definitions (Movie, GuessResult, ScalesRound, etc.)
- `src/lib/daily.ts`: Seeded RNG, movie pool, date utilities
- `src/lib/db.ts`: D1 row-to-object mappers
- `src/routes/classic/+page.svelte` (lines 137-204): Movie comparison logic
- `src/routes/scales/+page.svelte` (lines 97-137): Score calculation and feedback

**Testing:**
- Not present (no test suite configured)

**Styling:**
- `src/app.css`: Tailwind CSS imports, dark theme CSS variables, custom animations
- Component styles: Inline Tailwind classes in `.svelte` files

## Naming Conventions

**Files:**
- Pages: `+page.svelte` (SvelteKit convention)
- API routes: `+server.ts` (SvelteKit convention)
- Components: PascalCase `.svelte` (e.g., `SearchInput.svelte`)
- Utilities: camelCase `.ts` (e.g., `daily.ts`, `db.ts`)
- Types: `types.ts` (single file, grouped)

**Directories:**
- Feature/route directories: kebab-case (e.g., `search`, `classic`, `scales`)
- Component categories: kebab-case (e.g., `ui`, `components`)
- Library folder: `lib` (SvelteKit convention)

**Functions:**
- Async functions: camelCase, descriptive verbs (e.g., `fetchPairs()`, `loadGame()`, `handleGuess()`)
- Helper functions: camelCase, concise (e.g., `cn()`, `rowToMovie()`)
- React-like handlers: `handle{Event}` pattern (e.g., `handleInput()`, `handleSelect()`, `handleGuess()`)

**Variables:**
- Component props: `let { prop } = $props()` (Svelte 5)
- State: `let variable = $state(value)`
- Derived: `let computed = $derived(calculation)` or `$derived.by(()=>{})`
- Constants: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`, `DAILY_MOVIE_IDS`, `TOTAL_ROUNDS`)

**Types:**
- Interfaces: PascalCase (e.g., `Movie`, `GuessResult`, `ScalesRound`)
- Type unions: PascalCase (e.g., `MatchType`, `Direction`)
- Props types: `Props` convention in component scripts

## Where to Add New Code

**New Feature (e.g., new game mode):**
- Primary code: `src/routes/{mode}/+page.svelte` (new page)
- API endpoint: `src/routes/api/{mode}/+server.ts` (new endpoint)
- Types: Add to `src/lib/types.ts`
- Components: Reusable UI pieces go in `src/lib/components/`

**New Component/Module:**
- Reusable component: `src/lib/components/{ComponentName}.svelte`
- Utility function: Add to `src/lib/{purpose}.ts` or create new file if domain-specific
- Export: Use barrel files (`index.ts`) for component groups

**Utilities:**
- Shared helpers: `src/lib/utils.ts` (general) or `src/lib/{purpose}.ts` (specific domain)
- Format: Export named functions, avoid default exports

**Database Schema Changes:**
- Migration files: `scripts/{purpose}.sql` (DDL)
- Execution: Add npm script calling `wrangler d1 execute screendle-db --file=scripts/{file}.sql`
- Mappers: Update `src/lib/db.ts` row conversion functions if schema changes

## Special Directories

**`src/lib/components/ui/`:**
- Purpose: shadcn-svelte base component library (auto-generated)
- Generated: Yes (via `shadcn-svelte init` and `shadcn-svelte add {component}`)
- Committed: Yes (dependencies included in `package-lock.json`)
- Note: Each component has separate directory to allow selective removal/updates

**`.svelte-kit/`:**
- Purpose: Auto-generated SvelteKit artifacts (type info, bundle output)
- Generated: Yes (during `npm run check` and `npm run build`)
- Committed: No (.gitignore)

**`node_modules/`:**
- Purpose: NPM dependencies
- Generated: Yes (via `npm install`)
- Committed: No (.gitignore)

**`.planning/codebase/`:**
- Purpose: Architecture documentation (GSD generated)
- Files: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md
- Committed: Yes (part of project documentation)

**`scripts/`:**
- Purpose: Build-time scripts (not part of browser bundle)
- Files: TypeScript scripts for data generation, migrations
- Execution: Via npm scripts or direct `npx tsx` invocation

---

*Structure analysis: 2025-02-27*
