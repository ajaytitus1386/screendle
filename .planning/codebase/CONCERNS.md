# Codebase Concerns

**Analysis Date:** 2026-02-27

## Tech Debt

**Type Safety in Database Conversion Functions:**
- Issue: Row-to-Movie conversion functions use untyped `any` parameter
- Files: `src/lib/db.ts` - `rowToMovie()` and `rowToMovieFromAlias()` functions
- Impact: Database column name typos or schema changes won't be caught at compile time; runtime errors possible
- Fix approach: Define a typed `MovieRow` interface matching the D1 schema, use that instead of `any`

**Console Debug Logging in Production:**
- Issue: Multiple `console.error()` and `console.warn()` calls across API routes remain in production code
- Files:
  - `src/routes/api/daily/+server.ts` (lines 26, 49, 66)
  - `src/routes/api/scales/+server.ts` (lines 45, 47, 96)
  - `src/routes/api/search/+server.ts` (line 23)
  - `src/routes/classic/+page.svelte` (line 67)
  - `src/routes/scales/+page.svelte` (line 90)
  - `src/lib/components/SearchInput.svelte` (line 40)
- Impact: Client console logs expose internal error details; server logs fill with warnings when database schedule is not pre-populated
- Fix approach: Move to structured logging with environment-based levels; keep only warnings/errors in production

**Unsafe Type Casts in Svelte Components:**
- Issue: Multiple `as string[]` casts without validation in `src/lib/components/GameRow.svelte` (lines 69, 73, 75, 146, 150, 152)
- Files: `src/lib/components/GameRow.svelte`
- Impact: If `PropertyMatch.value` doesn't contain expected array, will silently fail or display broken UI
- Fix approach: Add type guards or discriminated unions in `PropertyMatch` to ensure correct value types for each property

**SQL LIKE Injection Risk (Low):**
- Issue: `src/routes/api/search/+server.ts` (line 15-16) uses parameterized binding for search, but `%` wildcards are hardcoded
- Files: `src/routes/api/search/+server.ts`
- Impact: Low risk due to parameterized queries, but query behavior depends on user input containing `%` characters
- Fix approach: Consider ESCAPE clause or alternative search strategy; currently acceptable as percent signs are literal search characters

## Performance Bottlenecks

**Image Preloading Strategy in Scales Mode:**
- Problem: `preloadAllImages()` waits for all 20 poster images sequentially before rendering game board
- Files: `src/routes/scales/+page.svelte` (lines 52-59, 82)
- Cause: Sequential Promise resolution, even with `Promise.all()` waits for slowest image
- Improvement path: Load images asynchronously without blocking game start; show placeholder while loading; implement lazy loading as user scrolls through result review

**Database Query for Scales Pairs (Multiple Fallback Paths):**
- Problem: When `scales_rounds` table is empty, queries all 20 movies individually then performs O(n²) pairing and sorting in-memory
- Files: `src/routes/api/scales/+server.ts` (lines 50-92)
- Cause: Fallback to seeded RNG requires fetching movies by ID list, building lookup map, then sorting by rating gap
- Improvement path: Pre-compute and cache Scales pairs in database; avoid fallback path in production

**Search Query Orders by IMDb Rating Globally:**
- Problem: `src/routes/api/search/+server.ts` (line 15) orders all matching results by rating; could be slow with large result set
- Files: `src/routes/api/search/+server.ts`
- Cause: No index on `title LIKE` queries; LIMIT 8 helps but index would improve
- Improvement path: Add compound index on `(title, imdb_rating)` if available; consider full-text search for larger datasets

## Scaling Limits

**Movie Pool Dependency:**
- Current capacity: 119 curated movies in `DAILY_MOVIE_IDS` (plus unlimited DB fallback)
- Limit: Only 119 unique daily puzzles without database expansion or rotation
- Scaling path: Phase 2 strategy requires expanded curated DB (~5000 movies); ingest pipeline (`scripts/ingest.ts`) exists but needs validation

**Scales Pairs Generation (Hard Limit):**
- Current capacity: Maximum 10 pairs per day from 20 movies; requires at least 20 unique rated movies available
- Limit: If database has <20 movies with `imdb_rating > 0`, Scales mode will fail
- Scaling path: Add validation in schedule generation; ensure 20+ movies always selected for Scales

**Browser LocalStorage (Implicit Limit):**
- Problem: Game state persisted via `localStorage.setItem()` without size checks
- Files:
  - `src/routes/classic/+page.svelte` (line 109)
  - `src/routes/scales/+page.svelte` (line 105)
- Limit: Typical 5-10MB per domain; storing full `GuessResult[]` arrays with nested movie data could accumulate
- Scaling path: Implement quota checking; archive old games to IndexedDB or server; limit stored guesses per date

## Fragile Areas

**Seeded RNG Fallback Logic (Critical Synchronization Risk):**
- Files: `src/lib/daily.ts` (lines 122-170), `src/routes/api/daily/+server.ts` (lines 48-64), `src/routes/api/scales/+server.ts` (lines 43-92)
- Why fragile: Client and server both use seeded RNG as fallback; if `daily_puzzles` or `scales_rounds` tables are empty, clients get procedurally-generated movies that may differ from each other if RNG seed differs (timezone issues, drift)
- Safe modification: Always ensure `daily_puzzles` and `scales_rounds` are pre-populated via schedule script; do not rely on seeded RNG for production
- Test coverage: No integration tests for fallback path; test that pre-scheduled data is always available
- Recommendation: Add health check endpoint that verifies today's puzzle is scheduled; alert if missing

**Movie Comparison Logic (Tolerance-Dependent):**
- Files: `src/routes/classic/+page.svelte` (lines 137-192) - `compareMovies()` function
- Why fragile: Runtime matching uses hardcoded `Math.abs(guess.runtime - target.runtime) <= 5` (line 156); IMDb rating compares exact match (line 166)
- Safe modification: Extract tolerances to constants; test with edge cases (movies exactly 5 min apart, rating differences like 7.0 vs 7.1)
- Test coverage: No tests for boundary conditions
- Recommendation: Parameterize tolerances; add unit tests for comparison logic

**Array Overlap Logic (Case Sensitivity Edge Cases):**
- Files: `src/routes/classic/+page.svelte` (lines 194-204) - `arraysEqual()` and `arraysOverlap()` functions
- Why fragile: Converts to lowercase for comparison but doesn't trim whitespace; genres/keywords with inconsistent casing or leading/trailing spaces may fail to match
- Safe modification: Normalize input arrays on ingestion (database schema); or add trim/lowercase at comparison time; add tests for "Drama" vs "drama" vs " Drama"
- Test coverage: No tests for case sensitivity or whitespace handling

**Poster Image Fallback (UI Inconsistency):**
- Files:
  - `src/lib/components/GameRow.svelte` (lines 48-58)
  - `src/lib/components/SearchInput.svelte` (lines 128-137)
  - `src/routes/scales/+page.svelte` (lines 359-369, 398-407)
- Why fragile: Multiple placeholder renders with inconsistent dimensions and text ("No img", "No Poster", "?"); users see inconsistent UI; if TMDB poster_path is null, unclear if data is missing or image failed to load
- Safe modification: Unify placeholder component; add explicit error logging for failed image loads
- Test coverage: No tests for image loading failures

## Known Bugs

**New Game Button Inline Fetch (Anti-Pattern):**
- Symptoms: Clicking "New Game" button shows visual glitch (code on line 400 of `src/routes/classic/+page.svelte`)
- Files: `src/routes/classic/+page.svelte` (line 400)
- Trigger: Click "New Game" after winning
- Issue: Uses inline `fetch()` with `.then()` chain instead of calling `loadGame()` function; doesn't properly reset error state; doesn't show loading indicator
- Workaround: Reload page manually
- Fix: Replace inline fetch with `await loadGame()` call

**Share Button Fallback Missing (Silent Failure):**
- Symptoms: Share button fails silently if clipboard API unavailable (no fallback mechanism)
- Files: `src/routes/classic/+page.svelte` (line 93), `src/routes/scales/+page.svelte` (line 165)
- Trigger: Click Share on device/browser without clipboard API support (iOS Safari, older browsers)
- Issue: Empty catch block; no fallback to copy-to-textarea or show share text
- Workaround: Manual copy from browser console
- Fix: Add TextArea fallback or alert with share text

## Security Considerations

**Database Access (Cloudflare D1 - Platform Handled):**
- Risk: Direct D1 binding without explicit auth checks
- Files: All API routes (`src/routes/api/*/+server.ts`)
- Current mitigation: Running on Cloudflare Pages (authenticated environment); D1 bound at deploy time; no public DB credentials exposed in code
- Recommendations: No changes needed for MVP; monitor D1 access patterns; consider rate limiting if scales large

**Client-Side Movie Data Exposure (Low Risk):**
- Risk: Movie search results and daily movie are sent to client; attackers could theoretically harvest full movie list via brute-force search
- Files: `src/routes/api/search/+server.ts`, `src/routes/api/daily/+server.ts`
- Current mitigation: Search limited to 8 results; daily endpoint requires no auth (intentional for public game)
- Recommendations: Acceptable for public game; if data becomes sensitive, add rate limiting

**localStorage Injection (Low Risk for This Game):**
- Risk: Game state stored as JSON without validation; malformed saves could cause crashes
- Files: `src/routes/classic/+page.svelte` (line 50), `src/routes/scales/+page.svelte` (line 35)
- Current mitigation: Try/catch blocks skip invalid saves gracefully
- Recommendations: Add schema validation; consider moving to IndexedDB for better separation

## Test Coverage Gaps

**API Endpoints - No Integration Tests:**
- Untested: All three API routes (`daily`, `scales`, `search`)
- Files: `src/routes/api/*/+server.ts`
- What's not tested: Database queries, error states, fallback paths, edge cases (empty DB, missing columns)
- Risk: Fallback to seeded RNG could break sync if database is unavailable
- Priority: High

**Comparison Logic - No Unit Tests:**
- Untested: Movie comparison and array matching logic
- Files: `src/routes/classic/+page.svelte` (lines 137-204)
- What's not tested: Genre/keyword partial matches, case sensitivity, runtime tolerance, exact matching edge cases
- Risk: Changed tolerances could break expected behavior without detection
- Priority: High

**Search Component - No Component Tests:**
- Untested: Keyboard navigation, debouncing, dropdown interaction
- Files: `src/lib/components/SearchInput.svelte`
- What's not tested: ArrowUp/ArrowDown cycling, Enter key selection, blur delay, filtering already-guessed movies
- Risk: Refactoring search could break keyboard a11y
- Priority: Medium

**Game State Persistence - No Tests:**
- Untested: localStorage save/load across page reloads, date rollover, storage quota handling
- Files: `src/routes/classic/+page.svelte` (lines 31-52, 98-110), `src/routes/scales/+page.svelte` (lines 19-106)
- What's not tested: Corrupted saves, missing targetMovieId, different dates
- Risk: Bad save data could permanently break game for user
- Priority: Medium

**Image Preloading - No Tests:**
- Untested: Image load success/failure, preload race conditions
- Files: `src/routes/scales/+page.svelte` (lines 43-59)
- What's not tested: Network errors, broken poster URLs, mixed content warnings
- Risk: Failed preloads could block UI indefinitely
- Priority: Low

## Missing Critical Features (Blocking Production Use)

**Database Health Check:**
- Problem: No way to verify that daily_puzzles and scales_rounds are populated for today
- Blocks: Confident production launch
- Recommendation: Add `/api/health` endpoint that checks if today's puzzle is scheduled; use in client-side error recovery

**Daily Schedule Verification:**
- Problem: No monitoring or alerts if schedule generation fails
- Blocks: Guarantee of fresh daily content
- Recommendation: Add cron job monitoring (notify if schedule.ts hasn't run in 24h); add timestamps to scheduled records

**User Analytics / Error Reporting:**
- Problem: Errors logged to console/server logs only; no structured error tracking
- Blocks: Debugging issues in production
- Recommendation: Integrate Sentry or similar error tracking; track user funnel (start game → guess → win/lose)

## Dependencies at Risk

**Seeded RNG Implementation (Risk: Fragility):**
- Risk: Custom `seededRandom()` uses `Math.sin()` — non-cryptographic, may have poor distribution for certain seeds
- Impact: If seed calculation changes (e.g., timezone handling), daily puzzles could shift
- Migration plan: Switch to well-tested library like `seedrandom` or `mulberry32` if RNG becomes primary (Phase 2)

**Cloudflare D1 (Risk: Vendor Lock-in):**
- Risk: Custom D1 API bindings; no abstraction layer
- Impact: Switching databases would require rewriting all API routes
- Migration plan: Consider repository pattern or query builder layer if DB portability becomes important; currently acceptable for greenfield project

---

*Concerns audit: 2026-02-27*
