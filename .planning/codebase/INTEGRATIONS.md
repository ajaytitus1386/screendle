# External Integrations

**Analysis Date:** 2025-02-27

## APIs & External Services

**Movie Data (Ingestion Only):**
- **TMDB (The Movie Database)** - Source of canonical movie data (titles, genres, directors, credits, keywords, posters)
  - SDK/Client: Built-in `fetch` calls
  - Auth: `TMDB_ACCESS_TOKEN` (Bearer token in .env)
  - Endpoint: `https://api.themoviedb.org/3`
  - Methods Used: `/discover/movie` (pagination), `/movie/{id}?append_to_response=credits,keywords` (detailed data)
  - Rate Limit: ~40 requests per 10 seconds (250ms delay between requests in scripts/ingest.ts)
  - Implementation: `scripts/ingest.ts` - Discovery and detail fetching with checkpointing for resumable runs

- **OMDB (Open Movie Database)** - IMDb ratings source
  - SDK/Client: Built-in `fetch` calls
  - Auth: `OMDB_API_KEY` (query param in .env)
  - Endpoint: `https://www.omdbapi.com/?i={imdbId}&apikey={key}`
  - Rate Limit: 1000 requests/day (100ms delay between requests in scripts/ingest.ts)
  - Implementation: `scripts/ingest.ts` - Called once per movie for IMDb rating enrichment

**Cloudflare API (Schedule Generation):**
- **Cloudflare REST API** - D1 database queries for schedule generation
  - Endpoint: `https://api.cloudflare.com/client/v4/accounts/{accountId}/d1/database/{databaseId}/query`
  - Auth: `CLOUDFLARE_API_TOKEN` (Bearer token, GitHub Actions secret)
  - Implementation: `scripts/schedule.ts` queryD1Remote() function
  - Used in: Automated monthly schedule generation workflow

## Data Storage

**Primary Database:**
- **Cloudflare D1** (SQLite)
  - Database Name: `screendle-db`
  - Database ID: `4b5e7481-ca5a-46c9-969e-205d64c30ea3`
  - Binding: `DB` (accessible via `platform.env.DB` in SvelteKit)
  - Tables:
    - `movies` - Curated movie database (~5000 movies), indexed on title and tmdb_id
    - `daily_puzzles` - Pre-scheduled daily movie selections (one per date)
    - `scales_rounds` - Pre-scheduled Scales mode round pairs (10 per date)

**Query Patterns:**
- Read-only at runtime (no writes from frontend)
- Used by: `src/routes/api/daily/+server.ts`, `src/routes/api/search/+server.ts`, `src/routes/api/scales/+server.ts`

**File Storage:**
- **None** - Posters stored as external URLs (TMDB poster URLs cached in `movies.poster_url` column)

**Caching:**
- **None** - Client-side localStorage used for game state persistence (not external cache)

## Authentication & Identity

**Auth Provider:**
- **None** - Application is completely anonymous
- No user accounts, sessions, or authentication required
- Game state persisted to browser localStorage only

**Authorization:**
- No role-based or permission logic
- All users have equal access to all public endpoints

## Monitoring & Observability

**Error Tracking:**
- **None** - No external error tracking service configured
- Console.error() calls log to stdout/stderr

**Logs:**
- **Stdout/Stderr** - All logging via `console.error()` and `console.log()`
- Error handling: JSON error responses returned to client (e.g., `{ error: 'Failed to fetch movie' }`)
- Deployment logs: Captured by Cloudflare Pages deployment system

## CI/CD & Deployment

**Hosting:**
- **Cloudflare Pages** - Static site hosting with Functions support
  - Project Name: `screendle`
  - Branch: `main` (auto-deploys on push)
  - Builds: `.svelte-kit/cloudflare` directory deployed as project

**CI Pipeline:**
- **GitHub Actions**
  - `.github/workflows/deploy.yml` - Auto-deploys on push to main (Node 20, npm build, wrangler pages deploy)
  - `.github/workflows/schedule.yml` - Monthly (1st of month 00:00 UTC) puzzle scheduling, with manual trigger support
    - Runs: `npm run schedule:remote`, applies migrations, uploads SQL artifact

**Continuous Deployment:**
- Every push to `main` triggers automatic build and deployment to Cloudflare Pages
- No staging environment; `main` is production

## Environment Configuration

**Required env vars (development/scripts):**
- `TMDB_ACCESS_TOKEN` - Bearer token for TMDB API (used in scripts/ingest.ts)
- `OMDB_API_KEY` - API key for OMDB ratings (used in scripts/ingest.ts)
- `CLOUDFLARE_API_TOKEN` - API token for Cloudflare REST API (GitHub Actions secret, used for schedule generation)
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID (GitHub Actions secret, used for schedule generation)

**Runtime env (Cloudflare binding):**
- `DB` - D1 database binding (automatically injected by Cloudflare Workers)

**Secrets location:**
- GitHub Actions: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` configured as repository secrets
- Local development: `.env` file (not committed, see .gitignore)
- Template: `.env.example`

## Webhooks & Callbacks

**Incoming:**
- None - Application is purely pull-based

**Outgoing:**
- None - No external service notifications or callbacks

## Movie Data Flow

**Ingestion (One-time or periodic):**
1. `scripts/ingest.ts` discovers movies via TMDB `/discover/movie` API
2. For each movie, fetches detailed info via `/movie/{id}` endpoint
3. Calls OMDB API for IMDb rating enrichment
4. Generates SQL INSERT statements (batched in transactions of 500)
5. Writes to `scripts/seed.sql` with checkpointing for resumable runs
6. Manual step: Apply seed.sql to D1 via `wrangler d1 execute screendle-db --local --file=scripts/seed.sql`

**Schedule Generation (Automated monthly):**
1. GitHub Actions triggers `schedule.yml` workflow (1st of month at 00:00 UTC)
2. `scripts/schedule.ts` queries D1 for:
   - Existing daily_puzzles and scales_rounds (to avoid duplicates)
   - Eligible movies with imdb_rating >= 6.5
3. Generates deterministic shuffles using seeded RNG (mirrors frontend logic)
4. Creates SQL for 60 days of daily puzzles and scales rounds
5. Applies migrations via `migrate-schedule.sql`
6. Applies generated SQL to remote D1
7. Artifacts uploaded for audit trail

**Game Runtime (Per request):**
1. Client requests `/api/daily` for today's movie
   - Reads from `daily_puzzles` table (pre-scheduled)
   - Falls back to seeded RNG if not found
2. Client requests `/api/search?q=...` to search movies
   - Reads from `movies` table, LIKE query on title
   - Returns top 8 by imdb_rating
3. Client requests `/api/scales` for 10 rating comparison pairs
   - Reads from `scales_rounds` table (pre-scheduled)
   - Falls back to seeded RNG if not found

## Cross-System Connections

**Data Lineage:**
```
TMDB API → ingest.ts → seed.sql → D1 movies table
OMDB API → ingest.ts → seed.sql → D1 movies.imdb_rating

D1 movies → schedule.ts → schedule.sql → D1 daily_puzzles & scales_rounds
                          (monthly via GitHub Actions)

D1 → SvelteKit API routes → Frontend (read-only)
```

**Dependency Order:**
1. Movies must be ingested to D1 (one-time setup)
2. Schedule must be generated and applied (monthly)
3. Frontend can serve game (ongoing)

---

*Integration audit: 2025-02-27*
