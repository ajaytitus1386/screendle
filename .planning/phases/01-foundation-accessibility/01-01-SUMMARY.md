---
phase: 01-foundation-accessibility
plan: 01
subsystem: design-system-foundation
tags: [crt-palette, dark-theme, typography, tailwind, self-hosting]
dependency_graph:
  requires: []
  provides:
    - CRT color palette as Tailwind utilities
    - Warm dark theme foundation
    - Audiowide headline font (self-hosted)
    - Production-safe Tailwind safelist
  affects:
    - All subsequent visual work (scanlines, typography, decorative elements)
tech_stack:
  added:
    - Audiowide font (self-hosted WOFF2)
    - CRT color palette (5 phosphor colors)
  patterns:
    - Tailwind v4 @theme for custom color tokens
    - Font preloading with crossorigin for performance
    - Safelist for dynamic class protection
key_files:
  created:
    - static/fonts/audiowide/audiowide-regular.woff2
    - safelist-tailwindcss.txt
  modified:
    - src/app.css
    - src/app.html
    - src/routes/+layout.svelte
    - src/routes/+page.svelte
decisions:
  - CRT colors use oklch color space for perceptual uniformity
  - Warm dark theme (~56 degree hue) instead of cold blue defaults
  - Cyan for interactive elements (Classic mode), amber for secondary (Scales mode)
  - Font preload with crossorigin="anonymous" to prevent double download
  - Safelist file auto-detected by Tailwind v4 to prevent tree-shaking
metrics:
  duration_minutes: 3
  tasks_completed: 2
  files_created: 2
  files_modified: 4
  commits: 2
  completed_date: 2026-02-27
---

# Phase 1 Plan 1: CRT Theme Foundation Summary

Established CRT color palette, warm dark theme, and Audiowide headline font as foundational design system layer.

## Tasks Completed

| Task | Name                                          | Commit  | Files                     |
| ---- | --------------------------------------------- | ------- | ------------------------- |
| 1    | Define CRT palette and dark theme in app.css  | 02f5f3c | src/app.css               |
| 2    | Font hosting, preload, safelist, page updates | c09b1db | app.html, +layout, +page, safelist, font |

## Work Summary

### Task 1: CRT Palette and Dark Theme

Added foundational color system to app.css:

**@font-face declaration:**
- Self-hosted Audiowide font with font-display: swap to prevent FOIT

**@theme block with CRT colors:**
- 5 phosphor colors (amber, yellow, cyan, lime, red) in oklch color space
- 3 dark theme foundation colors (dark-warm, dark-surface, text-cream)
- Headline font stack (Audiowide with fallbacks)

**.dark CSS variables update:**
- Shifted from cold blue hues (~265 degrees) to warm amber hues (~56 degrees)
- Background: oklch(0.15 0.01 56) — warm dark
- Foreground: oklch(0.95 0.01 56) — warm cream text
- Borders/inputs: amber-tinted at 15-20% opacity
- Focus ring: cyan (interactive element color)

**Scrollbar styling:**
- Updated to amber-tinted (oklch(0.69 0.14 56 / 20%))

### Task 2: Font Hosting, Safelist, and UI Application

**Font self-hosting:**
- Downloaded Audiowide WOFF2 from Google Fonts (14KB)
- Placed in static/fonts/audiowide/

**app.html preload:**
- Added `<link rel="preload">` for Audiowide font
- Included `crossorigin="anonymous"` to prevent double download (critical pitfall fix)

**safelist-tailwindcss.txt:**
- Created with all CRT color utilities (bg-*, text-*, border-*)
- Dark theme utilities (bg-dark-warm, bg-dark-surface, text-text-cream)
- Font-headline utility
- Prevents Tailwind v4 production tree-shaking of dynamically-used classes

**UI updates:**

+layout.svelte (navbar):
- Border: `border-crt-amber/10` (warm amber tint)
- Help button hover: `hover:bg-crt-amber/10`

+page.svelte (landing):
- Heading: Added `font-headline` class (Audiowide)
- Subtitle: Changed to `text-text-cream/70` for warm muted
- Classic card: Cyan theme (interactive) — `bg-crt-cyan/20`, `hover:border-crt-cyan/50`
- Scales card: Amber theme — `bg-crt-amber/20`, `hover:border-crt-amber/50`
- Both cards: `bg-dark-surface/80` instead of `bg-black/40`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing npm dependencies**
- **Found during:** Task 1 verification
- **Issue:** `npm run check` failed with "svelte-kit: not found" — node_modules not installed
- **Fix:** Ran `npm install` to install all project dependencies
- **Files modified:** node_modules/ (generated)
- **Outcome:** Type checking now runs (reveals pre-existing TS error in scales/+server.ts)

### Deferred Items

**Pre-existing TypeScript error:**
- File: `src/routes/api/scales/+server.ts:36:39`
- Error: `Parameter 'row' implicitly has an 'any' type`
- Scope: Out of scope for this plan (not related to CRT theme foundation work)
- Action: Logged to deferred-items.md, will be addressed in future work

## Verification Results

All verification criteria passed:

- ✅ Production build completes without errors
- ✅ Font file exists at static/fonts/audiowide/audiowide-regular.woff2 (14KB)
- ✅ Safelist file exists in project root
- ✅ CRT colors found in production CSS (all 5 colors: amber, yellow, cyan, lime, red)
- ✅ Audiowide font-face declaration in app.css (2 references)
- ✅ app.html contains preload with crossorigin
- ✅ Navbar uses warm amber-tinted borders
- ✅ Landing page heading uses Audiowide font
- ✅ Cards use CRT palette colors (cyan/amber)

## Self-Check: PASSED

Created files verification:
```
FOUND: static/fonts/audiowide/audiowide-regular.woff2
FOUND: safelist-tailwindcss.txt
```

Commits verification:
```
FOUND: 02f5f3c
FOUND: c09b1db
```

## Impact Assessment

This plan establishes the foundational layer for the entire CRT design system:

**Immediate benefits:**
- Warm, nostalgic color palette available as Tailwind utilities
- Audiowide headline font loads efficiently (preload + swap)
- Dark theme no longer uses cold blue tones
- Production builds include all CRT classes (safelist protection)

**Enables future work:**
- Plan 02 (scanlines) can layer on warm dark background
- Phase 2 typography can use CRT colors for emphasis
- Phase 3 decorative elements have consistent palette to build from

**Color role decisions made:**
- Cyan = interactive/primary (Classic mode)
- Amber = secondary (Scales mode, warm accents)
- Yellow/lime = feedback states (future)
- Red = destructive/error

## Notes

- Tailwind v4 auto-detects safelist-tailwindcss.txt in project root
- CRT colors use oklch for perceptual uniformity and better color manipulation
- Font preload is critical for performance — without it, Audiowide would cause layout shift
- Pre-existing TS error in scales/+server.ts is unrelated to this work, deferred to future fix
