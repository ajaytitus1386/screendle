# Screendle

Daily movie guessing game (like Wordle but for movies). Guess a movie, get feedback on properties (Genre, Director, Runtime, Release Date, etc.) showing exact/partial/no match.

## Quick Context
- **Full spec**: See `PROJECT_SPEC.md` for detailed decisions
- **Session logs**: `.claude/progress/` for past session summaries

## Key Decisions Made
- Custom curated DB of ~5000 popular English movies (Phase 2)
- Combine data from TMDB + OMDB APIs
- Server-side search (Phase 2, POC uses direct API calls)
- 5-10 guesses per day (tune based on difficulty)
- Synchronized daily puzzle for all players
- Anonymous play with local storage (MVP)
- **Tech Stack**: SvelteKit + shadcn-svelte (Tailwind CSS)

## Properties (7 Total)
| Property | Match Type | Source |
|----------|------------|--------|
| Genre | Partial overlap | TMDB/OMDB |
| Year | ↑/↓ arrows | TMDB/OMDB |
| Runtime | ↑/↓ arrows | TMDB/OMDB |
| IMDb Rating | ↑/↓ arrows | OMDB |
| Director | Exact | OMDB |
| Keywords | Partial overlap | TMDB |
| Country | Exact | OMDB |

## Matching Rules
- **Green**: Exact match
- **Orange**: Partial match (e.g., one genre overlaps)
- **Red**: No match
- **Arrows**: Higher/lower for numeric properties

## Current Status
- [x] Project spec documented
- [x] Explore TMDB/OMDB APIs
- [x] Choose tech stack (SvelteKit + shadcn-svelte)
- [x] Get API keys (TMDB + OMDB)
- [x] Initialize SvelteKit project
- [x] Build POC (frontend calling APIs directly)
- [ ] Test and tune gameplay
- [ ] Design database schema (Phase 2)
- [ ] Build movie ingestion script (Phase 2)

## Project Structure
```
src/
├── lib/
│   ├── types.ts                    # Movie & game state types
│   ├── utils.ts                    # Utility functions (cn)
│   └── components/
│       ├── ui/                     # shadcn-svelte components
│       ├── GameRow.svelte          # Guess row with colored cells
│       └── SearchInput.svelte      # Autocomplete movie search
├── routes/
│   ├── +layout.svelte              # Root layout (dark theme)
│   ├── +page.svelte                # Main game board
│   └── api/search/+server.ts       # Movie search API endpoint
└── app.css                         # Tailwind + theme variables
```

## Running the Project
```bash
npm run dev    # Start dev server at localhost:5173
npm run build  # Build for production
npm run check  # TypeScript/Svelte type checking
```

## Future Features (not MVP)
- Shareable results grid
- Themed days (Christmas movies, etc.)
- Hint system
- Stats tracking
