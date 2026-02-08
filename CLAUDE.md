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

## Game Modes

### Classic Mode
The original mode. Guess the daily movie, get feedback on 7 properties per guess. See Properties table above.

### Scales Mode
Two movies shown side by side — pick which one has the higher rating. 10 fixed rounds per day, same for all players. Score out of 10.

**Decided:**
- **Pairs**: Mix of easy (wide gap), medium, and hard (close gap) — difficulty should ramp up
- **Rating**: Uniform combined score (IMDb + RT + Metacritic normalized). Same score shown everywhere
- **Scoring**: Right/wrong tally, final score out of 10
- **Display**: Poster + title only per movie
- **Synced daily**: Same 10 pairs for all players each day
- **Reveal**: Show actual ratings immediately after each pick
- **Stats**: Percentile ranking ("better than 73% of players") — requires backend, defer to Phase 2

**Rating**: IMDb only for MVP. Clean, intuitive, near-universal coverage.
**Difficulty ramp**: Rounds get harder — 1-3 easy (wide gap), 4-7 medium, 8-10 hard (close gap).
**Percentile stats**: Needs backend, defer to Phase 2. MVP tracks local score history only.

**Future**: Let player select rating source (IMDb, RT, Metacritic) when starting Scales. Each source plays differently.

## Current Status
- [x] Project spec documented
- [x] Explore TMDB/OMDB APIs
- [x] Choose tech stack (SvelteKit + shadcn-svelte)
- [x] Get API keys (TMDB + OMDB)
- [x] Initialize SvelteKit project
- [x] Build POC - Classic mode (frontend calling APIs directly)
- [x] Design Scales mode
- [x] Build Scales mode POC
- [x] Landing page + route restructure (/, /classic, /scales)
- [x] How to Play modal
- [x] Research backend options (DB, hosting, ingestion) — see PROJECT_SPEC.md Phase 2
- [ ] Choose hosting + DB combo (decision pending)
- [ ] Build movie ingestion script (Phase 2)
- [ ] Replace live API calls with DB reads (Phase 2)
- [ ] Deploy to production
- [ ] Tune Classic mode difficulty

## Project Structure
```
src/
├── lib/
│   ├── api.ts                      # Shared getEnrichedMovie() (server-only)
│   ├── daily.ts                    # Curated movie IDs, seeded RNG, daily selection
│   ├── types.ts                    # Movie, ScalesRound, game state types
│   ├── utils.ts                    # Utility functions (cn)
│   └── components/
│       ├── ui/                     # shadcn-svelte components
│       ├── GameRow.svelte          # Guess row with colored cells
│       ├── HowToPlay.svelte        # How to play modal (Classic + Scales tabs)
│       └── SearchInput.svelte      # Autocomplete movie search
├── routes/
│   ├── +layout.svelte              # Root layout (navbar, how-to-play)
│   ├── +page.svelte                # Landing page (mode selection)
│   ├── classic/+page.svelte        # Classic mode game board
│   ├── scales/+page.svelte         # Scales mode (higher/lower)
│   └── api/
│       ├── daily/+server.ts        # Daily movie endpoint
│       ├── search/+server.ts       # Movie search endpoint
│       └── scales/+server.ts       # Scales pairs endpoint
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
