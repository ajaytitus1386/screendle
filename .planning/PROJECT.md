# Screendle — Frontend Design Milestone

## What This Is

Screendle is a daily movie guessing game with two modes: Classic (guess the movie from property clues) and Scales (pick which movie has the higher rating). This milestone focuses on establishing a cohesive visual identity — a modern retro CRT television aesthetic — across the entire frontend.

## Core Value

The game must feel like playing on a warm, nostalgic CRT television without sacrificing usability or readability.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Classic mode: daily movie guessing with 7-property feedback (genre, year, runtime, IMDb, director, keywords, country) — existing
- ✓ Scales mode: 10 daily higher/lower rating rounds with difficulty ramp — existing
- ✓ Landing page with mode selection cards — existing
- ✓ How to Play modal with Classic + Scales tabs — existing
- ✓ Movie search with autocomplete (server-side, D1-backed) — existing
- ✓ Shareable results grid for both modes — existing
- ✓ Daily puzzle synchronization (same puzzle for all players per day) — existing
- ✓ Local storage game state persistence — existing
- ✓ Cloudflare Pages deployment with D1 database — existing
- ✓ CI/CD pipeline (GitHub Actions auto-deploy on push to main) — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] CRT-inspired color palette applied across all pages
- [ ] Typography system (Minerva Modern primary + accent fonts)
- [ ] TV guide grid backgrounds (rounded rectangles at varying yellow opacity)
- [ ] Subtle CRT bezel frame around main content area
- [ ] Decorative graphical elements (rounded asterisks, rounded stars)
- [ ] Concentric circle motifs in palette colors
- [ ] Scanline texture overlay (subtle, CSS-based)
- [ ] Slowly spinning decorative animations (stars, asterisks, concentric circles)
- [ ] Modal transitions (How to Play, results, etc.)
- [ ] Dark theme foundation (dirt black background, near-white text)
- [ ] Responsive design maintained with new visual identity

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Full-screen page transitions — too heavy, contradicts accent-only motion philosophy
- Literal illustrated CRT TV frame — too kitschy, subtle bezel chosen instead
- Constant CRT flickering/distortion — causes discomfort, clashes with usability goal
- Sound design — separate concern, not part of visual design milestone
- Game logic changes — this milestone is purely visual/CSS
- Backend changes — no API or database work needed
- User accounts / auth — deferred to future milestone
- Percentile stats — requires backend, deferred

## Context

**Existing codebase:** SvelteKit 2 + Svelte 5, Tailwind CSS 4, shadcn-svelte components, deployed on Cloudflare Pages with D1 database. Two game modes fully functional. Current styling is basic dark theme with minimal visual identity.

**Design direction:** "Cassette Futurism" — the aesthetic of 1970s-90s analog technology (CRT monitors, VHS, TV guides) rendered with modern web polish. Think warm amber screens, not cold cyberpunk.

**Color palette:**

| Name | Hex | RGB | Role |
|------|-----|-----|------|
| Amber | #faa622 | (250,166,34) | Accent, warmth |
| Yellow | #ffe52c | (255,229,44) | Primary brand, headlines |
| Cyan | #7fe6ef | (127,230,239) | Contrast accent, highlights |
| Lime | #c4d70c | (196,215,12) | Success states |
| Deep Red | #c22303 | (194,35,3) | Error/negative states |

Extended palette: dirt black (~#1a1a1a) for backgrounds, near-white (~#f5f0e8) for text on dark surfaces.

**Typography system:**

| Element | Font | Source |
|---------|------|--------|
| Primary / UI / Body | Minerva Modern (6 weights) | Adobe Fonts or MyFonts (commercial) |
| Headlines / Logo | Audiowide or Orbitron | Google Fonts (free) |
| Timers / Counters | VCR OSD Mono | DaFont (free commercial) |
| Data / Values | Space Mono | Google Fonts (free) |
| System Messages | VT323 | Google Fonts (free) |

**Visual elements:**
- Backgrounds: grid of rounded rectangles at varying opacity in yellow shades (TV guide motif)
- Decorative: rounded asterisks and rounded stars for emphasis/pop
- Motif: concentric circles in palette colors (bullseye/target shapes)
- Frame: subtle CRT bezel (rounded corners + bevel + gradient), not a literal TV drawing
- Texture: light scanline overlay via CSS `repeating-linear-gradient`

**Animation philosophy:** Accent-only. Mostly static UI.
- Primary motion: slowly spinning decorative elements (stars, asterisks, concentric circles)
- Transitions: modal-only (How to Play, results screens) — no page-wide transitions
- No constant flickering, heavy glitch effects, or persistent distortion

**CSS techniques confirmed performant:**
- Scanlines: `repeating-linear-gradient` pseudo-element
- Slow spin: `@keyframes rotate` with `transform: rotate()`
- Phosphor glow: `text-shadow` + radial gradient
- Noise/grain: SVG `feTurbulence` at low opacity
- Screen bezel: `border-radius` + subtle `box-shadow` + gradient

**Key references:**
- Cassette Futurism aesthetic (https://aesthetics.fandom.com/wiki/Cassette_Futurism)
- Retro-futuristic UI components (https://github.com/Imetomi/retro-futuristic-ui-design)
- CRT CSS effects (https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh)
- SMPTE color bars cultural touchstone (https://tedium.co/2025/01/19/television-test-patterns-history/)

## Constraints

- **Tech stack**: Must work within existing SvelteKit + Tailwind CSS + shadcn-svelte setup
- **Performance**: All effects must be CSS-based and GPU-accelerated; no heavy JS animation libraries
- **Accessibility**: Respect `prefers-reduced-motion`; maintain WCAG contrast with scanline overlays
- **Font licensing**: Minerva Modern requires commercial license (Adobe Fonts or MyFonts purchase)
- **Browser support**: Chrome 90+, Firefox 88+, Safari 14+, mobile browsers

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Minerva Modern as primary font | Clean, elegant, 6 weights — modern foundation that lets retro accents shine | — Pending |
| Accent-only animation | Retro feel from texture/palette, not constant motion — better usability | — Pending |
| Subtle bezel over literal TV frame | Keeps it classy, avoids kitsch, hints at CRT without being cartoonish | — Pending |
| Slowly spinning elements as primary motion | Distinctive, calming, evokes analog dials/reels — unique identity | — Pending |
| Modal-only transitions | Scope transitions to contained UI changes; avoid disruptive page-wide effects | — Pending |
| CSS-only effects (no canvas/WebGL) | Performance, simplicity, Svelte transition compatibility | — Pending |

---
*Last updated: 2026-02-27 after initialization*
