# Architecture

**Analysis Date:** 2025-02-27

## Pattern Overview

**Overall:** Client-side SvelteKit game frontend with Cloudflare Workers backend (D1 database).

**Key Characteristics:**
- Full-stack Svelte 5 with SvelteKit framework
- Server-side rendering with Cloudflare Pages adapter
- API routes handle database queries and game logic
- Local storage for game state persistence
- Two distinct game modes (Classic, Scales) with unified data layer

## Layers

**Presentation Layer (Frontend Components):**
- Purpose: Render game UI, handle user interaction, manage component state
- Location: `src/routes/` (page components), `src/lib/components/` (reusable components)
- Contains: Page layouts, game boards, search interfaces, modals
- Depends on: Game types, utilities, UI component library
- Used by: Browser (direct rendering)

**Game Logic Layer:**
- Purpose: Calculate match results, scoring, game state transitions
- Location: `src/routes/classic/+page.svelte` (lines 137-204), `src/routes/scales/+page.svelte` (lines 97-137)
- Contains: Movie comparison functions (`compareMovies`), point calculations, win/lose logic
- Depends on: Movie types, scoring rules
- Used by: Presentation layer

**API Layer:**
- Purpose: Server-side data retrieval from D1 database
- Location: `src/routes/api/{daily,scales,search}/+server.ts`
- Contains: Database queries, daily puzzle scheduling, search filtering
- Depends on: Database connection (platform.env.DB), daily seed logic, row mappers
- Used by: Presentation layer (via fetch calls)

**Persistence Layer:**
- Purpose: Convert D1 database rows to application types
- Location: `src/lib/db.ts` (mapping functions), localStorage (client state)
- Contains: `rowToMovie()`, `rowToMovieFromAlias()` converters
- Depends on: Movie type definition
- Used by: API layer, presentation layer

**Utility & Configuration Layer:**
- Purpose: Shared seeding, dating, and styling utilities
- Location: `src/lib/{daily.ts, utils.ts, types.ts}`
- Contains: Seeded RNG, date keys, type definitions, Tailwind class merging
- Depends on: None (foundational)
- Used by: All layers

## Data Flow

**Classic Mode - New Game:**

1. User navigates to `/classic`
2. Page component (`src/routes/classic/+page.svelte`) mounts, checks localStorage for saved game
3. If no save or save is stale (wrong date), fetches `/api/daily`
4. API endpoint queries D1 for today's movie (from `daily_puzzles` table or seeded RNG fallback)
5. Movie object hydrated via `rowToMovie()` converter
6. Movie returned as JSON to frontend
7. Game board renders with target movie loaded but hidden

**Classic Mode - Making a Guess:**

1. User types movie title in `SearchInput` component
2. Input debounced (300ms), triggers `/api/search?q={query}`
3. API queries D1 `WHERE title LIKE ? ORDER BY imdb_rating DESC LIMIT 8`
4. Results mapped to Movie objects, returned to frontend
5. User selects from dropdown
6. `handleGuess()` called with selected Movie
7. `compareMovies()` compares all 7 properties:
   - Genre/Keywords: partial overlap detection
   - Year/Runtime/IMDb: exact match or direction arrows (up/down)
   - Director/Country: case-insensitive exact match
8. Result added to `guesses[]` array
9. Win condition checked: guess.movie.id === targetMovie.id?
10. Game state saved to localStorage with date key
11. GameRow component renders guess with color-coded cells (green/orange/red)
12. Accumulated clues derived and displayed (year range, runtime range, etc.)

**Scales Mode - New Game:**

1. User navigates to `/scales`
2. Page component checks localStorage for today's save
3. Fetches `/api/scales` (no params)
4. API queries `scales_rounds` table for today's 10 pairs (primary path) or generates from seeded RNG (fallback)
5. Both tables return movie pairs with poster URLs and ratings
6. Frontend preloads all poster images (via `preloadAllImages()`)
7. Game board renders first pair

**Scales Mode - Answering Round:**

1. User clicks Movie A or Movie B button
2. `pickMovie()` function records user answer and marks round as revealed
3. Correct answer determined: `movieA.imdb_rating >= movieB.imdb_rating ? 'A' : 'B'`
4. Score incremented if correct
5. Feedback badge animates ("Correct!" or "Wrong!")
6. After 2-second delay, transitions to next round
7. Progress bar updates, score displayed
8. After 10th round completes, game state marked complete, results screen shown
9. Results screen displays final score, round history grid, detailed pair reviews

**State Management Pattern:**

- **Reactive State:** Svelte 5 `$state()` for reactive variables (`guesses`, `score`, `gameOver`)
- **Derived State:** `$derived` for computed values (accumulated clues, current round data)
- **Persistence:** JSON saved to localStorage on every meaningful state change
- **Synchronization:** Page checks localStorage on mount before fetching fresh data

## Key Abstractions

**Movie Type:**
- Purpose: Unified representation of movie data across app
- Examples: `src/lib/types.ts` lines 1-14
- Pattern: Single source of truth for 7 properties (id, title, genres, year, runtime, director, imdb_rating, keywords, country)

**GuessResult Type:**
- Purpose: Encapsulates a single guess with all match calculations
- Pattern: Contains both guessed movie and PropertyMatch objects (match type + direction)
- Used by: Classic mode to display row feedback

**ScalesRound Type:**
- Purpose: Encapsulates a single Scales pair with user answer and correctness
- Pattern: Contains movieA, movieB, correctAnswer, userAnswer, revealed flag
- Used by: Scales mode for round state and results display

**PropertyMatch Type:**
- Purpose: Atomic match result for a single property
- Pattern: value + match type (exact/partial/none) + optional direction (up/down/match)
- Used by: GameRow component to style cells and display arrows

**Daily Seeding Strategy:**
- Purpose: Generate deterministic daily puzzle without server clock dependency
- Pattern: Convert client date (YYYYMMDD) to seed, use seededRandom() to pick from curated pool
- Fallback: If daily_puzzles table is empty, seeded RNG ensures same puzzle all day for all players

## Entry Points

**Classic Mode Page:**
- Location: `src/routes/classic/+page.svelte`
- Triggers: User navigates to `/classic` or direct URL
- Responsibilities: Load daily movie, manage 10-guess game state, handle search input, display results, calculate accumulated clues

**Scales Mode Page:**
- Location: `src/routes/scales/+page.svelte`
- Triggers: User navigates to `/scales`
- Responsibilities: Load 10 daily pairs, manage round progression, score tracking, animate feedback, show final results

**Landing Page:**
- Location: `src/routes/+page.svelte`
- Triggers: User navigates to `/` or starts app
- Responsibilities: Display mode selection cards, link to Classic and Scales

**Root Layout:**
- Location: `src/routes/+layout.svelte`
- Triggers: Every page load
- Responsibilities: Initialize navbar, manage how-to-play modal, apply dark theme CSS, show favicon

**Daily API Endpoint:**
- Location: `src/routes/api/daily/+server.ts`
- Triggers: GET /api/daily (with optional ?random=true)
- Responsibilities: Return today's movie or random movie, handle scheduled vs. fallback logic

**Scales API Endpoint:**
- Location: `src/routes/api/scales/+server.ts`
- Triggers: GET /api/scales
- Responsibilities: Return 10 daily pairs with difficulty ordering, handle scheduled vs. seeded RNG fallback

**Search API Endpoint:**
- Location: `src/routes/api/search/+server.ts`
- Triggers: GET /api/search?q={query}
- Responsibilities: Query D1 for movies matching title prefix, return sorted by IMDb rating

## Error Handling

**Strategy:** Try-catch in API endpoints and page components; fallback to safe defaults.

**Patterns:**
- API endpoints catch database errors and return JSON error objects with HTTP status codes
- Page components display user-friendly error messages ("Failed to load puzzle") without exposing DB details
- Database fallbacks: If today's scheduled puzzle missing, seeded RNG recomputes same puzzle (deterministic)
- Search errors: Empty results array returned instead of throwing (graceful degradation)
- Image preload errors: Silently ignore (no crash on missing poster)

## Cross-Cutting Concerns

**Logging:** Console.error() in API endpoints for debugging (database failures, search errors). Lines like `console.warn('No daily_puzzles entry...')` for fallback detection.

**Validation:** Search requires minimum 2-character query. API returns early if query too short. Classic mode deduplicates guesses (prevent same movie guessed twice).

**Authentication:** Not applicable (anonymous play, no user accounts)

**Date Handling:** `getTodaysDateKey()` converts client local time to YYYY-MM-DD string (used for localStorage key and DB lookup). Same seed used for all players on same calendar day (timezone-agnostic).

---

*Architecture analysis: 2025-02-27*
