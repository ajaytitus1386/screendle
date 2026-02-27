# Requirements: Screendle Design System

**Defined:** 2026-02-27
**Core Value:** The game must feel like playing on a warm, nostalgic CRT television without sacrificing usability or readability.

## v1 Requirements

### Foundation
- [ ] **FOUN-01**: CRT color palette defined as CSS custom properties and Tailwind utilities (amber #faa622, yellow #ffe52c, cyan #7fe6ef, lime #c4d70c, red #c22303)
- [ ] **FOUN-02**: Dark theme base applied globally (dirt black ~#1a1a1a background, near-white ~#f5f0e8 text)
- [ ] **FOUN-03**: Subtle scanline overlay on main content container via repeating-linear-gradient pseudo-element with pointer-events: none
- [ ] **FOUN-04**: prefers-reduced-motion support disables/reduces all animations and spinning elements
- [ ] **FOUN-05**: All text with scanline overlay passes WCAG AA contrast (4.5:1 minimum)

### Typography
- [ ] **TYPO-01**: Headline font loaded and applied (Audiowide or Orbitron from Google Fonts)
- [ ] **TYPO-02**: Counter/timer font loaded and applied (VCR OSD Mono)
- [ ] **TYPO-03**: Data/property values font loaded and applied (Space Mono)
- [ ] **TYPO-04**: System message font loaded and applied (VT323)
- [ ] **TYPO-05**: All fonts self-hosted as WOFF2 with font-display: swap
- [ ] **TYPO-06**: Critical fonts preloaded in app.html, accent fonts loaded asynchronously

### Decorative
- [ ] **DECO-01**: Subtle CRT bezel frame around main content area (rounded corners + bevel + gradient shadow)
- [ ] **DECO-02**: Slowly spinning decorative star/asterisk elements as accent graphics
- [ ] **DECO-03**: TV guide grid background pattern (rounded rectangles at varying yellow opacity)
- [ ] **DECO-04**: Concentric circle motifs in palette colors as decorative accents
- [ ] **DECO-05**: Spinning elements use CSS transform: rotate with @keyframes (GPU-accelerated)

### Polish
- [ ] **POLI-01**: Phosphor glow effect on headings and interactive elements via text-shadow
- [ ] **POLI-02**: Subtle noise/grain texture via SVG feTurbulence filter at low opacity

### Integration
- [ ] **INTG-01**: All existing game functionality preserved (Classic mode, Scales mode, search, results)
- [ ] **INTG-02**: Responsive design maintained across mobile and desktop
- [ ] **INTG-03**: Production build includes all custom theme classes (Tailwind safelist configured)

## v2 Requirements

### Typography
- **TYPO-07**: Minerva Modern commercial font as primary body/UI font (requires license purchase)

### Transitions
- **TRAN-01**: CRT-themed modal transitions for How to Play dialog
- **TRAN-02**: CRT-themed transitions for results/game-over screens

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full-screen page transitions | Contradicts accent-only motion philosophy |
| Literal illustrated CRT TV frame | Too kitschy; subtle bezel chosen instead |
| Constant CRT flickering/distortion | Causes motion sickness, accessibility violation |
| Sound design | Separate concern, not part of visual milestone |
| Game logic changes | This milestone is purely visual/CSS |
| Backend/API changes | No server-side work needed |
| Canvas/WebGL effects | CSS-only constraint for performance and simplicity |
| User accounts/auth | Deferred to future milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Pending |
| FOUN-02 | Phase 1 | Pending |
| FOUN-03 | Phase 1 | Pending |
| FOUN-04 | Phase 1 | Pending |
| FOUN-05 | Phase 1 | Pending |
| TYPO-01 | Phase 2 | Pending |
| TYPO-02 | Phase 2 | Pending |
| TYPO-03 | Phase 2 | Pending |
| TYPO-04 | Phase 2 | Pending |
| TYPO-05 | Phase 1 | Pending |
| TYPO-06 | Phase 1 | Pending |
| DECO-01 | Phase 3 | Pending |
| DECO-02 | Phase 3 | Pending |
| DECO-03 | Phase 3 | Pending |
| DECO-04 | Phase 3 | Pending |
| DECO-05 | Phase 3 | Pending |
| POLI-01 | Phase 3 | Pending |
| POLI-02 | Phase 3 | Pending |
| INTG-01 | Phase 4 | Pending |
| INTG-02 | Phase 4 | Pending |
| INTG-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21/21 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-02-27*
*Last updated: 2026-02-27 after roadmap creation*
