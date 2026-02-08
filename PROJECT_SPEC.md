# Screendle - Project Specification

## Overview
Screendle is a daily movie guessing game inspired by Wordle and Scrandle. Players guess a mystery movie and receive feedback on how their guess compares across various movie properties.

## Core Concept
- Users guess a movie each day
- For each guess, we compare properties (Genre, Director, Runtime, Release Date, etc.)
- Feedback indicates: **exact match** (green), **partial match** (orange), or **no match** (red)
- Numeric properties (like year, runtime) can show **higher/lower** indicators

## Game Mechanics

### Guesses
- **Attempts per day**: 5-10 (to be tuned based on difficulty testing)
- **Daily sync**: One movie per day, same for all players (like Wordle)
- **History**: Keep archive of past daily puzzles for replay

### Property Matching (Finalized)
| # | Property | Exact Match (Green) | Partial Match (Orange) | No Match (Red) | Source |
|---|----------|---------------------|------------------------|----------------|--------|
| 1 | Genre | All genres match | At least one genre overlaps | No overlap | TMDB/OMDB |
| 2 | Year | Same year | - | Different (show ↑/↓) | TMDB/OMDB |
| 3 | Runtime | Same (±5 min?) | - | Different (show ↑/↓) | TMDB/OMDB |
| 4 | IMDb Rating | Same (±0.5?) | - | Different (show ↑/↓) | OMDB |
| 5 | Director | Same director | - | Different | OMDB |
| 6 | Keywords | All keywords match | At least one keyword overlaps | No overlap | TMDB |
| 7 | Country | Same country | - | Different | OMDB |

**Notes:**
- Keywords pulled as-is from TMDB; filtering/weighting to be tuned during testing
- Tolerances for "exact" numeric matches (runtime, rating) to be determined during gameplay testing

### Themes (Future)
- Themed days/weeks: Christmas movies, Classic films, Horror month, etc.
- Schedule-based theme rotation to drive engagement
- Random selection from applicable theme pool

## Data Architecture

### Custom Movie Database
- **Why not use TMDB/OMDB directly?**
  - Those databases are massive; we need a curated "guessable" subset
  - Combine properties from multiple sources (TMDB + OMDB)
  - Control over what's included

- **Target size**: ~5,000 movies
- **Inclusion criteria**:
  - Threshold of views/reviews (popularity, regardless of sentiment)
  - English language only (for now)
  - Data sources: TMDB, OMDB (combine best properties from each)

### Properties to Store (Finalized)
| Property | Source | Notes |
|----------|--------|-------|
| Title | TMDB/OMDB | |
| Genre(s) | TMDB/OMDB | Array, for partial matching |
| Director | OMDB | |
| Runtime | TMDB/OMDB | In minutes |
| Year | TMDB/OMDB | Release year |
| IMDb Rating | OMDB | User consensus score (0-10) |
| Keywords | TMDB | Array, for partial matching |
| Country | OMDB | Production country |

## Technical Decisions

### Search Functionality
- **Decision**: Server-side search (not frontend-based)
- **Rationale**: Better control, don't expose full movie list to client
- **Open questions** (for later):
  - Fuzzy matching for typos?
  - Max autocomplete suggestions?

### Tech Stack (Decided)
- **Frontend**: SvelteKit (Svelte 5)
- **UI Components**: shadcn-svelte (Tailwind CSS based)
- **Phase 1 (POC)**: Frontend calls TMDB/OMDB APIs directly
- **Phase 2**: Proper backend with curated database
- **Hosting**: TBD

### User Data
- **Phase 1**: Anonymous play with local storage
- **Later**: Consider accounts if needed for features

## Feature Roadmap

### MVP (Phase 1)
- [ ] Daily synchronized movie puzzle
- [ ] Core guessing mechanics with property comparison
- [ ] Server-side movie search
- [ ] Curated movie database (~5000 movies)
- [ ] Basic UI showing guess history and feedback
- [ ] Local storage for current progress

### Phase 2
- [ ] Shareable results (emoji grid format)
- [ ] Past puzzle archive/history
- [ ] Basic stats tracking

### Future/Later
- [ ] Hint system
- [ ] Themed days/scheduling system
- [ ] Advanced stats (streaks, guess distribution)
- [ ] User accounts (if needed)
- [ ] Fuzzy search improvements

## Open Questions

1. **Daily Schedule System**: How to manage the daily movie selection and theme scheduling?
2. ~~**Exact properties to use**~~: ✅ Decided - 7 properties (see Property Matching)
3. ~~**Partial match rules**~~: ✅ Decided - Genre and Keywords use overlap matching
4. ~~**Tech stack selection**~~: ✅ Decided - SvelteKit + shadcn-svelte
5. **Hosting solution**: TBD
6. **Shareable format**: How to represent results visually
7. **Keyword tuning**: How many keywords per movie? Filter by frequency?
8. **Numeric tolerances**: What counts as "exact" for runtime/rating?

## Data Sources

### TMDB (The Movie Database)
- API: https://www.themoviedb.org/documentation/api
- Good for: Popularity metrics, genres, images

### OMDB (Open Movie Database)
- API: http://www.omdbapi.com/
- Good for: Ratings, director, runtime, awards

## Phase 2: Backend Plan

### Current State (POC)
- ~117 hardcoded TMDB IDs in `src/lib/daily.ts`
- Every search/guess hits TMDB + OMDB APIs live (slow, rate-limited)
- Classic mode uses 1 movie/day, Scales uses 20 movies/day (10 pairs)
- No local database — all data fetched on demand

### Goal
Replace live API calls with a curated local database of ~5,000 movies. Server-side search against our own data. Faster, no rate limits, no API costs during gameplay.

---

### Database Decision

**Researched options** (Feb 2026):

| | **Turso** | **Cloudflare D1** | **Neon** | **Supabase** | **Local SQLite** |
|---|---|---|---|---|---|
| Engine | LibSQL (SQLite fork) | SQLite at edge | Serverless Postgres | Postgres | SQLite file |
| Free storage | 5 GB | 5 GB | 0.5 GB | 0.5 GB | Unlimited |
| Free reads | 500M rows/mo | 5M rows/day | 100 CU-hrs/mo | 2 GB egress/mo | Unlimited |
| FTS support | FTS5 | FTS5 | tsvector + pg_trgm | tsvector + pg_trgm | FTS5 |
| Cold starts | <130ms (edge) | <5ms (edge) | 3-8ms warm, ~1s cold | ~3s | 0ms |
| Works with | Any platform | Cloudflare only | Any platform | Any platform | Node.js hosts only |
| Auto-pause? | No | No | Yes (5min idle) | Yes (7 days!) | No |

**Eliminated:**
- **PlanetScale** — no free tier anymore
- **Supabase** — auto-pauses after 7 days of inactivity on free tier, risky for production
- **Neon** — 0.5 GB storage is tight for 5K movies with metadata, limited room to grow

**Top picks:**
- **Turso** — best flexibility (works with any host), 5 GB free, edge replication, no lock-in
- **Cloudflare D1** — tightest integration if hosting on Cloudflare Pages, same SQLite/FTS5 story
- **Local SQLite** — simplest, fastest, zero cost, but only works on Node.js hosts (Railway, Fly.io)

**Pending decision:** Pick after choosing hosting platform (DB and host are coupled).

---

### Hosting Decision

**Researched options** (Feb 2026):

| | **Cloudflare Pages** | **Vercel** | **Netlify** | **Railway** |
|---|---|---|---|---|
| Free bandwidth | Unlimited | 100 GB/mo | 100 GB/mo | $5 credit/mo |
| Free functions | 100K req/day | 1M edge req/mo | Limited | Always-on |
| Cold starts | <5ms | ~50-70ms edge | 3s+ serverless | None (always-on) |
| SvelteKit adapter | Official | Official | Official | adapter-node |
| Commercial use | Yes | **No (free tier)** | Yes | Yes |
| Best DB pairing | D1, Turso | Neon, Turso | Any external | Postgres, SQLite file |

**Eliminated:**
- **Fly.io** — free tier essentially gone in 2026
- **Render** — requires paid plan for SSR apps
- **Netlify** — 3+ second cold starts on serverless functions, bad for autocomplete UX

**Top picks:**
- **Cloudflare Pages** — unlimited bandwidth, <5ms cold starts, commercial use allowed. Tradeoff: edge runtime (no Node.js core modules like `fs`, `path`, `crypto`)
- **Vercel** — best developer experience, smooth SvelteKit integration. Tradeoff: free tier prohibits commercial use, 100 GB bandwidth cap

**Pending decision:** Need to verify current dependencies work on Cloudflare's edge runtime.

---

### Recommended Stack Combos

| Combo | Pros | Cons |
|---|---|---|
| **Cloudflare Pages + D1** | Tightest integration, both free, edge-native, unlimited bandwidth | Cloudflare lock-in, edge runtime constraints |
| **Cloudflare Pages + Turso** | Same hosting benefits, DB is portable | Slight extra latency vs native D1 |
| **Vercel + Turso** | Best DX, flexible DB | No commercial use on free tier, 100 GB cap |
| **Railway + SQLite file** | Simplest, zero external deps, no cold starts | $5/mo credit burns, single region |

---

### Database Schema

```sql
CREATE TABLE movies (
    id INTEGER PRIMARY KEY,        -- TMDB ID
    imdb_id TEXT,                   -- e.g. "tt0111161"
    title TEXT NOT NULL,
    poster_path TEXT,               -- TMDB poster path
    release_date TEXT,
    year INTEGER,
    genres TEXT,                    -- JSON array: '["Action","Thriller"]'
    runtime INTEGER,               -- minutes
    director TEXT,
    imdb_rating REAL,              -- 0.0-10.0
    keywords TEXT,                 -- JSON array: '["heist","revenge"]'
    country TEXT
);

-- Full-text search index (SQLite FTS5)
CREATE VIRTUAL TABLE movies_fts USING fts5(
    title,
    content=movies,
    content_rowid=id,
    prefix='2 3 4'                 -- prefix indexes for autocomplete
);

-- Keep FTS in sync
CREATE TRIGGER movies_fts_insert AFTER INSERT ON movies BEGIN
    INSERT INTO movies_fts(rowid, title) VALUES (new.id, new.title);
END;

-- For Scales mode: need movies with valid ratings
CREATE INDEX idx_movies_rating ON movies(imdb_rating) WHERE imdb_rating > 0;
```

**Autocomplete query:**
```sql
SELECT m.* FROM movies m
JOIN movies_fts ON movies_fts.rowid = m.id
WHERE movies_fts MATCH ?
LIMIT 8
```
(Append `*` to the search term for prefix matching)

---

### Ingestion Strategy

#### Phase 1: Bulk import from Kaggle dataset
- Download "TMDB 5000 Movie Dataset" from Kaggle (has title, genres, keywords, year, runtime, popularity)
- Filter to English-language, popular movies
- Bulk import into SQLite — takes minutes, no API calls needed

#### Phase 2: OMDB enrichment
- Kaggle data is missing: `imdb_rating`, `director`, `country`, `imdb_id`
- OMDB free tier: 1,000 requests/day → 5 days to enrich 5K movies
- Alternative: pay $20 OMDB for one month (100K requests) to do it in an hour
- Script must checkpoint progress and be resumable (in case of interruption)

#### Phase 3: Ongoing maintenance
- Re-ingest quarterly (ratings change minimally day-to-day)
- Add new popular movies to the pool as they come out
- Movie metadata (director, genre, runtime) essentially never changes

**Script structure:**
```
1. Parse Kaggle CSV → insert into movies table
2. For each movie missing OMDB data:
   a. Fetch from OMDB API (rate-limited: 100/min, 1000/day)
   b. Update director, country, imdb_rating, imdb_id
   c. Checkpoint every 100 movies
   d. Exponential backoff on 429 responses
3. Build FTS5 index
4. Validate: ensure all movies have imdb_rating > 0 (required for Scales)
```

---

### Search Strategy

At 5,000 records, all approaches are fast enough (<50ms):

| Approach | Speed | Typo tolerance | Ranking | Complexity |
|---|---|---|---|---|
| `LIKE 'term%'` | <5ms | None | None | Trivial |
| SQLite FTS5 | 10-30ms | None | BM25 built-in | Moderate |
| Postgres tsvector | ~50ms | None | Built-in | Moderate |
| Postgres pg_trgm | ~50ms | Yes | Similarity | Moderate (Postgres only) |

**Plan:** Start with FTS5 (since we're using SQLite anyway). Gives us prefix search + relevance ranking out of the box. Simple LIKE is the fallback if FTS5 proves fiddly.

Typo tolerance (pg_trgm) requires Postgres — not available in SQLite. At 5K movies, users can generally find what they need without fuzzy matching.

---

### What Changes from Current Code

| Current (POC) | Phase 2 (Backend) |
|---|---|
| `DAILY_MOVIE_IDS` hardcoded array (~117 movies) | Query from DB (~5,000 movies) |
| `getEnrichedMovie()` calls TMDB + OMDB live | Read from local DB (instant) |
| Search proxies to TMDB API | FTS5 query against local DB |
| `getDailyScalesMovieIds()` shuffles hardcoded array | Query DB with seed-based selection |
| Pair difficulty sorted at request time | Could precompute daily pairs via cron/first-request cache |

**Files affected:**
- `src/lib/api.ts` — replace API calls with DB reads
- `src/routes/api/search/+server.ts` — replace TMDB search with FTS5
- `src/routes/api/daily/+server.ts` — read from DB
- `src/routes/api/scales/+server.ts` — query DB for pairs
- `src/lib/daily.ts` — keep seeded random logic, remove hardcoded IDs
- New: `scripts/ingest.ts` — ingestion script
- New: `src/lib/server/db.ts` — database connection/queries

---

### Implementation Order

1. **Choose hosting + DB** (decision needed)
2. **Set up database** (schema, connection module)
3. **Build ingestion script** (Kaggle import + OMDB enrichment)
4. **Run ingestion** (5 days on free OMDB, or 1 hour on paid)
5. **Replace API endpoints** (search, daily, scales → read from DB)
6. **Remove live API calls** (no more TMDB/OMDB at runtime)
7. **Deploy** to chosen hosting platform
8. **Validate** everything works end-to-end

---

## Next Steps
1. ~~Explore TMDB and OMDB APIs to finalize property list~~ ✅
2. ~~Choose tech stack~~ ✅ SvelteKit + shadcn-svelte
3. ~~Get API keys~~ ✅ (TMDB + OMDB)
4. ~~Initialize SvelteKit project~~ ✅
5. ~~Build POC~~ ✅ Classic mode + Scales mode working
6. [ ] **Choose hosting + DB combo** (see Phase 2 plan above)
7. [ ] Build ingestion script
8. [ ] Replace live API calls with DB reads
9. [ ] Deploy to production
10. [ ] Tune Classic mode difficulty
11. [ ] Shareable results (emoji grid format)
