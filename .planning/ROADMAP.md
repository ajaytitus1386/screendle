# Roadmap: Screendle CRT Design System

## Overview

Transform Screendle's functional game interface into a distinctive CRT-retro experience through four incremental phases. Starting with design tokens and accessibility foundation, layering in typography, adding decorative visual elements, and culminating in full integration validation. Each phase delivers observable visual enhancements while preserving all existing game functionality.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Accessibility** - Design tokens, dark theme, scanline overlays, accessibility compliance
- [ ] **Phase 2: Typography System** - Retro font loading and application across UI
- [ ] **Phase 3: Decorative Layer** - Visual elements, animations, and polish effects
- [ ] **Phase 4: Integration Validation** - Game functionality preservation and responsive design verification

## Phase Details

### Phase 1: Foundation & Accessibility
**Goal**: Establish CRT color palette, dark theme foundation, and accessibility baseline that all subsequent visual work builds upon
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, TYPO-05, TYPO-06, INTG-03
**Success Criteria** (what must be TRUE):
  1. All CRT palette colors (amber, yellow, cyan, lime, red) available as Tailwind utilities and CSS custom properties
  2. Dark theme applied globally with dirt black backgrounds and near-white text on all pages
  3. Scanline overlay visible on main content areas without reducing text contrast below WCAG AA (4.5:1)
  4. All animations and spinning elements disappear when user has prefers-reduced-motion enabled
  5. Production build includes all custom theme classes (no Tailwind tree-shaking issues)
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md -- CRT palette, warm dark theme, Audiowide font loading, Tailwind safelist (2 tasks, 3 min)
- [ ] 01-02-PLAN.md -- Scanline overlay, reduced-motion accessibility, visual verification

### Phase 2: Typography System
**Goal**: Load and apply retro font stack across all UI elements with optimized performance
**Depends on**: Phase 1
**Requirements**: TYPO-01, TYPO-02, TYPO-03, TYPO-04
**Success Criteria** (what must be TRUE):
  1. Headlines display in Audiowide or Orbitron with distinctive retro character
  2. Countdown timers and game statistics render in VCR OSD Mono
  3. Property values and game data display in Space Mono for technical readability
  4. System messages and hints appear in VT323 terminal-style font
  5. Font loading does not cause FOIT (Flash of Invisible Text) or jarring layout shifts
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Decorative Layer
**Goal**: Apply CRT visual atmosphere through bezel frames, backgrounds, decorative elements, and polish effects
**Depends on**: Phase 2
**Requirements**: DECO-01, DECO-02, DECO-03, DECO-04, DECO-05, POLI-01, POLI-02
**Success Criteria** (what must be TRUE):
  1. Main game area displays subtle CRT bezel frame (rounded corners with bevel and gradient shadow)
  2. Decorative spinning stars or asterisks rotate slowly (20-40s cycles) as accent graphics without being distracting
  3. TV guide grid background pattern (rounded rectangles at varying yellow opacity) visible behind content sections
  4. Concentric circle motifs in palette colors appear as decorative accents on landing page
  5. Headings and interactive elements display phosphor glow effect (text-shadow) that enhances retro feel
  6. Subtle noise/grain texture visible via SVG filter without impacting performance
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Integration Validation
**Goal**: Verify all existing game functionality preserved and responsive design maintained across devices
**Depends on**: Phase 3
**Requirements**: INTG-01, INTG-02
**Success Criteria** (what must be TRUE):
  1. Classic mode daily guessing game functions identically (search, guesses, feedback, win states)
  2. Scales mode 10-round rating comparison works unchanged (selection, scoring, results)
  3. Shareable results grids for both modes generate correctly with theme styling
  4. How to Play modal opens, displays content clearly, and closes on all devices
  5. All pages display correctly and remain usable on mobile (320px+), tablet (768px+), and desktop (1024px+) viewports
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Accessibility | 1/2 | In progress | - |
| 2. Typography System | 0/TBD | Not started | - |
| 3. Decorative Layer | 0/TBD | Not started | - |
| 4. Integration Validation | 0/TBD | Not started | - |
