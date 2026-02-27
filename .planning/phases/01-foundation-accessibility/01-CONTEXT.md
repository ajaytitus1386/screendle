# Phase 1: Foundation & Accessibility - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the CRT color palette as CSS custom properties and Tailwind utilities, apply a dark theme globally, add a scanline overlay on main content, ensure accessibility (contrast, reduced motion), set up font loading infrastructure with the headline font, and configure Tailwind safelist for production builds. No game logic changes, no decorative elements beyond scanlines, no full typography rollout.

</domain>

<decisions>
## Implementation Decisions

### Color Application
- Yellow (#ffe52c) is the main background color for larger content areas
- Dark header/navbar gives the impression of TV bezels — not yellow
- Cyan (#7fe6ef) for all interactive elements (buttons, links, hover states)
- Red (#c22303) used both semantically (errors, wrong guesses) and decoratively (accent graphics, borders)
- Amber (#faa622), lime (#c4d70c) as accent colors for graphical elements, strips, and rings
- The yellow background areas use the rounded rectangle grid pattern (DECO-03) to create texture

### Scanline Overlay
- Subtle texture at ~5-8% opacity — noticeable subconsciously, not distracting
- Warm/amber-tinted lines (not pure black) to match CRT phosphor aesthetic
- Medium line spacing (4-5px) — visible as scanlines without moiré artifacts
- Static — no animation or drift
- Main content area only — not on the dark header/navbar
- Same opacity everywhere (no per-surface adjustment)
- **Must be implemented as an isolated, easily removable layer** — clearly identifiable code and dependencies so it can be tweaked or removed after visual review

### Dark Theme Feel
- Slightly warm dark background — not pure neutral #1a1a1a, push a touch toward brown/amber warmth
- Near-white text uses #f5f0e8 (warm cream) as specified
- Subtle gradient/shadow at transitions between dark header and yellow content area — like a TV bezel casting shadow
- Dark cards/panels on yellow backgrounds — game boards and content panels use the dark background color, creating "screens within the TV"
- Moderate border radius (8-12px) on rectangles — clearly rounded but not pill-shaped

### Color Combination Patterns for Text Visibility
- Dark background + light text (#f5f0e8) — primary reading pattern
- Amber background + primary yellow text/content — good for icons, graphics, and simple text
- Lighter shade of primary yellow + amber text — alternate combination
- Amber border + light yellow background + amber text — for cell/card content
- Amber border cells can have a header zone on top with light yellow text (like a column header above a cell value)

### Font Loading
- Include Audiowide headline font now in Phase 1 (not waiting for Phase 2)
- Self-hosted as WOFF2 in `static/fonts/` directory
- font-display: swap with system sans-serif fallback stack
- Audiowide preloaded in app.html as critical font
- Other fonts (VCR OSD Mono, Space Mono, VT323) deferred to Phase 2

### Claude's Discretion
- Exact scanline opacity value within the 5-8% range
- Exact warm dark background hex value (starting from ~#1a1a1a, warming slightly)
- Shadow/gradient intensity at dark-to-yellow transitions
- Tailwind safelist strategy for custom classes
- prefers-reduced-motion implementation details

</decisions>

<specifics>
## Specific Ideas

- Header/navbar dark like TV bezels, content area yellow — the overall page should feel like looking at a warm CRT TV
- Scanlines are experimental — implement so the code is clearly isolated and easy to find/remove if the visual result isn't right
- Dark cards on yellow create a "screen within the TV" effect — game boards should feel like displays embedded in the yellow TV guide surface
- Color combination patterns listed above are specific UI recipes to follow when building components

</specifics>

<deferred>
## Deferred Ideas

- Rounded rectangle grid pattern on yellow backgrounds (DECO-03) — Phase 3 decorative work
- Concentric circles and spinning star elements — Phase 3
- CRT bezel frame around content — Phase 3
- Phosphor glow on headings — Phase 3
- Full typography rollout (VCR OSD Mono, Space Mono, VT323) — Phase 2

</deferred>

---

*Phase: 01-foundation-accessibility*
*Context gathered: 2026-02-27*
