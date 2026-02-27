# Testing Patterns

**Analysis Date:** 2026-02-27

## Test Framework

**Status:** No automated test framework detected

**Current State:**
- No test files (*.test.ts, *.spec.ts) found in codebase
- No Jest, Vitest, Cypress, or Playwright config files present
- No testing dependencies in `package.json`
- Manual testing only - developer verification via `npm run dev` and browser

**Type Checking:**
- Svelte/TypeScript checking via `svelte-check` (run with `npm run check`)
- Config: `tsconfig.json` with `strict: true`, `checkJs: true`
- Watch mode available: `npm run check:watch` for development

## Code Structure for Testability

**Test Data & Mocking:**

The codebase demonstrates potential test patterns through careful data separation:

- **Seeded RNG isolation**: `seededRandom()` and `seededShuffle()` in `src/lib/daily.ts` are pure functions with deterministic output, highly testable
  - Used identically in both `schedule.ts` (backend) and frontend for schedule generation consistency
  - Pattern: `seededRandom(seed: number): number` - no side effects

- **Movie data transformation**: `rowToMovie()` and `rowToMovieFromAlias()` in `src/lib/db.ts` cleanly convert database rows to typed Movie objects
  - Pure functions, ideal for unit testing with mock row data

- **Type-safe data structures**: All game state defined in `src/lib/types.ts` (Movie, GuessResult, GameState, ScalesRound, ScalesGameSave)
  - Enables property-based testing and fixture generation

**Fixtures Pattern (Observed):**

Movie lists in `src/lib/daily.ts`:
```typescript
export const DAILY_MOVIE_IDS = [
  155,    // The Dark Knight
  238,    // The Godfather
  // ... ~117 more movies
];
```

Could serve as test data. Similar approach could be extended:
```typescript
// Example: fixtures/movies.ts
export const MOCK_MOVIES = {
  darkKnight: { id: 155, title: 'The Dark Knight', imdb_rating: 9.0, ... },
  godfather: { id: 238, title: 'The Godfather', imdb_rating: 9.2, ... },
};
```

## Where Tests Should Go

**Recommended Structure:**
```
src/lib/
├── daily.ts              # Pure RNG, scheduling logic - TEST
├── __tests__/
│   ├── daily.test.ts     # seededRandom, getDailyMovieId, getDailyScalesMovieIds
│   ├── db.test.ts        # rowToMovie, rowToMovieFromAlias transformations
│   └── comparison.test.ts # compareMovies logic from +page.svelte

src/routes/
├── api/
│   ├── daily/
│   │   ├── +server.ts     # API route
│   │   └── __tests__/+server.test.ts  # Integration test
│   ├── scales/+server.ts
│   └── search/+server.ts

src/lib/components/
└── __tests__/
    ├── GameRow.test.ts      # Component rendering, match display
    └── SearchInput.test.ts   # Autocomplete, keyboard handling
```

## Testing Approach Recommendations

**Unit Testing - High Priority:**

1. **Seeded RNG and scheduling** (`src/lib/daily.ts`):
   ```typescript
   // Test deterministic output
   describe('seededRandom', () => {
     it('returns same value for same seed', () => {
       expect(seededRandom(123)).toBe(seededRandom(123));
     });

     it('returns different values for different seeds', () => {
       expect(seededRandom(123)).not.toBe(seededRandom(124));
     });
   });
   ```

2. **Movie comparison logic** (from `src/routes/classic/+page.svelte` `compareMovies()`):
   ```typescript
   describe('compareMovies', () => {
     it('marks exact genre match as exact', () => {
       // Test exact genre match
     });

     it('marks partial genre overlap as partial', () => {
       // Test 1+ overlapping genre
     });

     it('marks year within ±0 as exact, otherwise direction arrow', () => {
       // Test year comparison with direction
     });
   });
   ```

3. **Data transformation** (`src/lib/db.ts`):
   ```typescript
   describe('rowToMovie', () => {
     it('converts D1 row to Movie object correctly', () => {
       const row = { tmdb_id: 155, title: 'Dark Knight', genres: '["Action","Crime"]', ... };
       const movie = rowToMovie(row);
       expect(movie.genres).toEqual(['Action', 'Crime']);
     });
   });
   ```

**Integration Testing - Medium Priority:**

1. **API endpoints** - Test D1 fallback paths:
   - `/api/daily` with and without scheduled puzzle
   - `/api/scales` with partial/missing scheduled rounds
   - `/api/search` with query validation

2. **Component behavior** - Test user interactions:
   - SearchInput debounce and keyboard navigation
   - GameRow conditional rendering and expansion
   - Game state lifecycle (load, guess, win/lose, save)

**E2E Testing - Low Priority (Future):**
- Full game flow: load puzzle → make guesses → win/lose
- Scales mode: 10 rounds, difficulty progression, scoring

## Common Patterns to Test

**Async Testing Pattern:**

Games use `onMount()` with async fetches. Test pattern:
```typescript
describe('Game initialization', () => {
  it('loads game on mount', async () => {
    // Mock fetch
    // Render component
    // Wait for load
    // Assert state updated
  });

  it('restores saved game if date matches', async () => {
    // Setup localStorage with matching date
    // Render component
    // Assert guesses restored
  });
});
```

**Error Testing Pattern:**

API error scenarios:
```typescript
describe('Error handling', () => {
  it('returns 500 with error message on DB failure', async () => {
    // Mock DB to throw
    // Call API
    // Assert { status: 500, error: '...' }
  });

  it('shows fallback UI when fetch fails', async () => {
    // Mock fetch to reject
    // Render component
    // Assert error message displayed
  });
});
```

**localStorage Testing:**

Game persistence pattern:
```typescript
describe('Game persistence', () => {
  it('saves game state to localStorage', () => {
    // Perform actions
    // Assert localStorage contains GameSave
  });

  it('clears save when date changes', () => {
    // Set old date in localStorage
    // Advance time
    // Assert fresh game loaded
  });
});
```

## Recommended Test Framework

**Framework: Vitest**
- Native TypeScript support (critical for this project)
- Fast, SvelteKit-compatible
- Built on Vite (already in project)

**Setup:**
```bash
npm install -D vitest @vitest/ui happy-dom
```

**Config file** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
  }
});
```

**package.json scripts:**
```json
{
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:coverage": "vitest --coverage"
}
```

## Mocking Strategy

**What to Mock:**
- D1 database queries in API tests
- Fetch calls in component tests
- localStorage in game persistence tests
- Image loading in SearchInput (already preloads images)

**What NOT to Mock:**
- Pure utility functions like `seededRandom()` - test directly
- Type transformations like `rowToMovie()` - test with real shape data
- Component rendering logic - test actual Svelte compilation

**Mock Example:**

Mock D1 database:
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('GET /api/daily', () => {
  it('returns movie from daily_puzzles', async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().resolvedValue({
            tmdb_id: 155, title: 'Dark Knight', ...
          })
        })
      })
    };

    // Call handler with mocked platform
    // Assert response
  });
});
```

## Test Coverage Goals

**Recommended Minimum:**
- `src/lib/daily.ts`: 95%+ (deterministic, critical scheduling)
- `src/lib/db.ts`: 90%+ (data transformation)
- `src/lib/types.ts`: 100% (type definitions)
- `src/routes/api/*`: 80%+ (API contracts, error paths)
- `src/lib/components/`: 60%+ (critical user interactions)

**Not Required:**
- UI component snapshots (brittle in Svelte)
- HTML structure tests (rely on visual regression)
- Theme/style tests

---

*Testing analysis: 2026-02-27*
