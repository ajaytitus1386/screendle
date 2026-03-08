# Session: 2026-03-08 — Guess Table Rework Round 2

## Session Info
| Field | Value |
|-------|-------|
| Started | 2026-03-08 |
| Project | screendle |
| Scope | Classic mode guess table polish (6 items) |

## Changes Made

### 1. Colored Clue Values (`src/routes/classic/+page.svelte`)
- Refactored `formatYearClue`, `formatRuntimeClue`, `formatRatingClue` to return `{ label, value }` instead of a single string
- Clue chips now render two spans: white `text-foreground` label + colored value
- Orange (`text-orange-400`) for range constraints and partial overlaps
- Green (`text-green-400`) for exact matches (director, country, year/runtime/IMDb when min===max)
- Year clue uses `Math.min`/`Math.max` to always show lower year first
- Runtime clue uses `Math.min`/`Math.max` to always show shorter runtime first

### 2. Column-Aligned Collapsed Rows (`src/lib/components/CollapsedRow.svelte`)
- Replaced compact layout (title + tiny 3px squares) with full column-width-aligned colored blocks
- Each match property gets a solid colored rectangle matching the column header width (w-28, w-20, etc.)
- Title shown truncated in the poster column (w-14)
- Aligns visually under the expanded row column headers

### 3. Arrow Repositioning (`src/lib/components/GameRow.svelte`)
- Changed from stacked `flex-col` to `relative` container with absolutely positioned arrows
- Arrows centered over value text at `text-white/20` opacity
- Replaced Unicode arrow characters with Lucide `ArrowBigUp`/`ArrowBigDown` icons (w-12 h-12)
- Extracted into reusable `{#snippet directionArrow(direction)}` to avoid redundancy across Year/Runtime/IMDb cells

### 4. Poster Size Increase
- `GameRow.svelte`: Poster from `w-12 h-[72px]` → `w-14 h-[84px]`
- `+page.svelte`: Poster column width in `columns` array: `w-12` → `w-14`

### 5. Column Header Tooltips (attempted, reverted)
- CSS `[data-tooltip]::after` approach didn't work because `overflow-x-auto` on the game board container clips elements rendered outside bounds
- Reverted to original icon-to-text hover swap (`group`/`group-hover`)

### 6. Trophy Icon for Answer Row
- When game is lost, the answer row (guessNumber === 'A') shows a `Trophy` icon in CRT amber instead of the letter "A" in the # column

## Files Modified
- `src/app.css` — (tooltip CSS added then removed, net: no change)
- `src/lib/components/CollapsedRow.svelte` — column-aligned layout rewrite
- `src/lib/components/GameRow.svelte` — arrow icons, snippet extraction, poster size, trophy icon
- `src/routes/classic/+page.svelte` — clue chip colors, format function refactors, poster column width, header hover behavior
- `CLAUDE.md` — documented UI details and new components
