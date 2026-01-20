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

## Next Steps
1. ~~Explore TMDB and OMDB APIs to finalize property list~~ ✅
2. ~~Choose tech stack~~ ✅ SvelteKit + shadcn-svelte
3. **Get API keys** (TMDB + OMDB)
4. **Initialize SvelteKit project**
5. **Build POC** - Frontend calling APIs directly
6. **Test and tune gameplay**
7. Design database schema (Phase 2)
8. Build movie ingestion script (Phase 2)
