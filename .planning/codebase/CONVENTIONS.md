# Coding Conventions

**Analysis Date:** 2026-02-27

## Naming Patterns

**Files:**
- Svelte components: PascalCase (e.g., `GameRow.svelte`, `SearchInput.svelte`, `HowToPlay.svelte`)
- Utility/library files: camelCase (e.g., `daily.ts`, `utils.ts`, `types.ts`, `db.ts`)
- API routes: use SvelteKit convention `+server.ts` for endpoints
- UI components: Organized in subdirectories like `ui/button/`, `ui/input/`, `ui/card/`

**Functions:**
- camelCase for all functions (e.g., `seededRandom()`, `getTodaysSeed()`, `getDailyMovieId()`, `handleGuess()`, `buildShareText()`)
- Async functions follow same naming convention (e.g., `fetchPairs()`, `searchMovies()`, `loadGame()`)
- Event handlers use `handle` prefix for clarity (e.g., `handleInput()`, `handleSelect()`, `handleKeydown()`, `handleBlur()`)
- Helper functions often prefixed with get/is/format/build based on purpose

**Variables:**
- camelCase consistently used for state variables (e.g., `guesses`, `targetMovie`, `loading`, `error`, `shareCopied`)
- State declaration in Svelte 5 uses `$state()` rune (e.g., `let guesses = $state([])`)
- Derived state uses `$derived` or `$derived.by()` (e.g., `let filteredResults = $derived(results.filter(...))`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `DAILY_MOVIE_IDS`, `STORAGE_KEY`, `TOTAL_ROUNDS`, `TMDB_IMAGE_BASE`)
- Boolean variables often use `is`/`has` prefix (e.g., `isLoading`, `showDropdown`, `gameOver`, `gameComplete`)

**Types:**
- Interface names: PascalCase (e.g., `Movie`, `GuessResult`, `GameState`, `ScalesRound`, `PropertyMatch`)
- Type aliases: PascalCase (e.g., `MatchType`, `Direction`)
- Props interfaces use `Props` suffix (e.g., `interface Props { ... }` in components)

## Code Style

**Formatting:**
- Svelte uses 2-space indentation (visible in `.svelte` files)
- TypeScript uses 2-space indentation (visible in `.ts` files)
- Trailing commas in multi-line objects/arrays
- Double quotes for strings (consistent across codebase)

**Linting:**
- Tool: Not explicitly configured (no eslint config files found, but `svelte-check` is used)
- Svelte type checking: Enabled via `npm run check` which runs `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json`
- TypeScript: Strict mode enabled in `tsconfig.json` with `"strict": true`
- Type checking enforced: `checkJs: true` and `forceConsistentCasingInFileNames: true` in tsconfig

## Import Organization

**Order:**
1. Svelte imports (lifecycle, stores, etc.) - e.g., `import { onMount } from 'svelte'`
2. Type imports - e.g., `import type { GuessResult, Movie } from '$lib/types'`
3. Relative/absolute imports from $lib - e.g., `import { getTodaysDateKey } from '$lib/daily'`
4. Component imports - e.g., `import GameRow from '$lib/components/GameRow.svelte'`
5. External package imports for specific functions - e.g., `import { json } from '@sveltejs/kit'`

**Path Aliases:**
- `$lib` points to `src/lib/` (configured in SvelteKit)
- Used consistently for importing utilities, types, components, and db functions
- Prevents relative path chaos in deeply nested files

## Error Handling

**Patterns:**
- Try-catch blocks with console.error logging at API level
- Examples: `console.error('Search error:', error)` in `+server.ts` files
- Returns JSON with `{ status: 500 }` for failures: `return json({ error: 'Failed to fetch movie' }, { status: 500 })`
- Frontend uses try-catch with fallback UI states (loading, error display)
- Errors displayed to user in red-tinted containers (e.g., `bg-red-500/20` with `text-red-400`)
- Silent catch blocks with comments for expected failures: `} catch { /* fall through to fresh game */ }`

**Validation:**
- Input validation at API layer (e.g., query string length check: `if (!query || query.length < 2)`)
- Optional chaining and nullish coalescing used for safety (e.g., `data?.movie`, `args['days'] as string ?? '60'`)
- Database fallbacks when primary query returns no results

## Logging

**Framework:** console object only (no logging library)

**Patterns:**
- `console.error()` for errors and diagnostics (e.g., 'Search error:', 'Daily movie fetch error:')
- `console.warn()` for non-critical issues (e.g., `No daily_puzzles entry for ${today}, using seeded RNG fallback`)
- Error/warn calls in try-catch blocks, API endpoints, and lifecycle hooks
- Messages include context (file type, operation, values) for debugging

## Comments

**When to Comment:**
- Multi-line comments explain complex logic (e.g., seeded RNG algorithm explanation)
- Block comments delineate major sections in large files (e.g., `// -----------`, `// D1 query helpers`)
- Inline comments rare but used for non-obvious behavior (e.g., database field mapping, special case handling)
- JSDoc-style comments used for public utility functions in scripts (e.g., `schedule.ts` has detailed usage doc at top)

**JSDoc/TSDoc:**
- Used minimally; primary doc is in-function comments
- Function parameters and returns documented in comments when complex
- Example: `/** Convert a D1 row into a Movie object */` in `db.ts`

## Function Design

**Size:**
- Small, focused functions preferred
- Utility functions 5-25 lines (e.g., `seededRandom()`, `getTodaysSeed()`, `formatArray()`)
- Component functions may be longer (30-100 lines) when handling multiple concerns
- API handlers lean toward readable mid-size (50-100 lines) with clear fallback paths

**Parameters:**
- Props interfaces used in components: single destructured `Props` parameter
- API handlers receive `{ url, platform }` from SvelteKit RequestHandler
- Optional parameters use trailing `?` and default values in destructuring
- Examples: `getDailyMovieId(seed?: number)`, `let { onSelect, disabled = false, guessedIds = [] }`

**Return Values:**
- Explicit return types for async functions (e.g., `Promise<Movie[]>`, `Promise<void>`)
- API handlers return JSON via `json()` helper from `@sveltejs/kit`
- Utility functions return computed values or transformed data
- Event handlers typically return void or undefined

## Module Design

**Exports:**
- Named exports preferred for utility functions and types
- Example: `export function seededRandom(seed: number): number`
- Type exports use `export type` or `export interface`
- Components export as default via Svelte implicit export

**Barrel Files:**
- Used in UI component directories (e.g., `src/lib/components/ui/button/index.ts`)
- Re-export components with named exports for convenience: `export { Root, ...props }`
- `src/lib/index.ts` is minimal (just a comment) - no central barrel

---

*Convention analysis: 2026-02-27*
