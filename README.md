# Screendle

A daily movie guessing game. Guess the movie from property feedback — genre, director, runtime, IMDb rating, keywords, country, and release year. Two game modes: **Classic** (guess the movie) and **Scales** (pick the higher-rated movie).

**Live:** [screendle.pages.dev](https://screendle.pages.dev)

---

## Game Modes

### Classic
Guess the daily movie in up to 10 tries. Each guess reveals color-coded feedback across 7 properties:
- **Green** — exact match
- **Orange** — partial match (shared genre or keyword)
- **Red** — no match, with ↑/↓ arrows for numeric properties

### Scales
Ten rounds per day. Two movie posters shown side-by-side — pick the one with the higher IMDb rating. Rounds ramp up in difficulty (wide gap → close call).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | SvelteKit (Svelte 5) + Tailwind CSS |
| Database | Cloudflare D1 (SQLite at the edge) |
| Hosting | Cloudflare Pages |
| Movie data | TMDB + OMDB APIs (ingested, not live) |

---

## Project Structure

```
src/
├── lib/
│   ├── daily.ts                    # Seeded RNG, date helpers
│   ├── db.ts                       # D1 row → Movie type helpers
│   ├── types.ts                    # Movie, GuessResult, GameSave types
│   └── components/
│       ├── GameRow.svelte          # Colored feedback row
│       ├── HowToPlay.svelte        # How to Play modal
│       └── SearchInput.svelte      # Autocomplete movie search
├── routes/
│   ├── +layout.svelte              # Root layout (navbar, modal)
│   ├── +page.svelte                # Landing page
│   ├── classic/+page.svelte        # Classic mode
│   ├── scales/+page.svelte         # Scales mode
│   └── api/
│       ├── daily/+server.ts        # Today's Classic movie
│       ├── search/+server.ts       # Movie autocomplete search
│       └── scales/+server.ts       # Today's Scales pairs
scripts/
├── ingest.ts                       # One-time: fetch movies from TMDB + OMDB → seed.sql
├── schedule.ts                     # Recurring: generate daily puzzle schedule → schedule.sql
├── schema.sql                      # D1 table definitions
├── migrate-schedule.sql            # Schema migration (category column)
└── fix-ratings.sql                 # Patch for 6 movies with missing IMDb ratings
.github/
└── workflows/
    └── schedule.yml                # Monthly cron: auto-generate + apply puzzle schedule
```

---

## Local Development

### Prerequisites
- Node.js 20+
- A Cloudflare account (free tier is fine)
- TMDB API key — [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- OMDB API key — [omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)

### Setup

```bash
npm install
```

Create `.dev.vars` (used by `wrangler dev`, never committed):
```
TMDB_API_KEY=your_key
TMDB_ACCESS_TOKEN=your_token
OMDB_API_KEY=your_key
```

### Running locally

The app uses Cloudflare D1 — use `wrangler pages dev` (not `vite dev`) to get the database binding:

```bash
npm run build
npx wrangler pages dev .svelte-kit/cloudflare --port=8788
```

Open [localhost:8788](http://localhost:8788).

---

## Database

### Schema

```sql
movies          -- 4,980 movies: title, genres, director, runtime, imdb_rating, keywords, country
daily_puzzles   -- Pre-scheduled Classic puzzles: date → movie
scales_rounds   -- Pre-scheduled Scales pairs: date + round_number → movie_a, movie_b
```

### First-time setup (local D1)

```bash
# 1. Apply schema
npx wrangler d1 execute screendle-db --local --file=scripts/schema.sql

# 2. Ingest movies (requires .dev.vars with TMDB + OMDB keys)
npx tsx scripts/ingest.ts
# Apply the generated seed.sql in chunks (see scripts/chunks/ after ingestion)

# 3. Generate and apply a puzzle schedule
npm run schedule -- --days 60
npm run schedule:apply:local
```

### Remote D1 (production)

```bash
npx wrangler d1 execute screendle-db --file=scripts/schema.sql
# Apply seed chunks with --remote flag
npm run schedule:apply:remote
```

---

## Schedule System

Daily puzzles are pre-generated and stored in D1 rather than computed at request time. The `scripts/schedule.ts` script:

- Picks movies using a deterministic seeded shuffle (same input → same output)
- Enforces a 180-day repeat-avoidance window for Classic mode
- Generates Scales pairs sorted by IMDb rating gap (widest = round 1, narrowest = round 10)
- Emits `INSERT OR IGNORE` SQL — safe to re-run on overlapping date ranges

```bash
npm run schedule -- --days 60              # generate 60 days from tomorrow (local D1)
npm run schedule -- --days 30 --dry-run    # preview without writing a file
npm run schedule:remote -- --days 60       # read existing schedule from remote D1
npm run schedule:apply:local               # apply to local D1
npm run schedule:apply:remote              # apply to production D1
```

If no schedule entry exists for today, the API falls back to seeded RNG automatically.

### Automated scheduling (GitHub Actions)

`.github/workflows/schedule.yml` runs on the 1st of each month and can also be triggered manually. Add these secrets to the repository:

| Secret | Where to get it |
|--------|----------------|
| `CLOUDFLARE_API_TOKEN` | [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) — use the "Edit Cloudflare Workers" template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard sidebar or `npx wrangler whoami` |

---

## Deployment

```bash
npm run build
npx wrangler pages deploy --commit-dirty=true
```

The D1 binding is picked up automatically from `wrangler.toml`.

---

## NPM Scripts

| Script | What it does |
|--------|-------------|
| `npm run build` | Build for Cloudflare Pages |
| `npm run check` | TypeScript + Svelte type check |
| `npm run schedule` | Generate puzzle schedule SQL (reads local D1) |
| `npm run schedule:remote` | Generate puzzle schedule SQL (reads remote D1) |
| `npm run schedule:apply:local` | Apply `scripts/schedule.sql` to local D1 |
| `npm run schedule:apply:remote` | Apply `scripts/schedule.sql` to remote D1 |
| `npm run db:migrate:local` | Run schema migrations on local D1 |
| `npm run db:migrate:remote` | Run schema migrations on remote D1 |
