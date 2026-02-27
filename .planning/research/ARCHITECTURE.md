# Architecture Research: CRT-Retro Design System Integration

**Domain:** Themed design system for SvelteKit game frontend
**Researched:** 2026-02-27
**Confidence:** HIGH

## Executive Summary

This research examines how to integrate a CRT-retro themed design system into an existing SvelteKit + Tailwind CSS + shadcn-svelte application. The architecture follows a layered approach: design tokens define the visual language, theme components provide decorative elements, and CSS effects layer over existing UI without breaking functionality.

**Key Finding:** Modern CSS architecture patterns (Tailwind CSS v4 theme variables, CSS Cascade Layers, shadcn-svelte's headless design) enable non-destructive theming. The retro aesthetic can be applied as an overlay layer that enhances but doesn't replace existing components.

## Standard Architecture for Themed Design Systems

### Three-Layer Design Token Hierarchy

The modern design system architecture follows a three-tier token structure:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRIMITIVE TOKENS                         │
│  (Raw values: hex colors, pixel spacing, font files)        │
│  --primitive-amber: #faa622                                  │
│  --primitive-yellow: #ffe52c                                 │
│  --primitive-spacing-sm: 8px                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    SEMANTIC TOKENS                           │
│  (Purpose-driven: brand colors, spacing scale)               │
│  --color-accent: var(--primitive-amber)                      │
│  --color-brand: var(--primitive-yellow)                      │
│  --spacing-card: var(--primitive-spacing-sm)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   COMPONENT TOKENS                           │
│  (Component-specific overrides)                              │
│  --button-primary-bg: var(--color-brand)                     │
│  --card-padding: var(--spacing-card)                         │
└─────────────────────────────────────────────────────────────┘
```

**Source:** [Design Tokens Explained - Contentful](https://www.contentful.com/blog/design-token-system/) demonstrates the three-tier hierarchy (Primitive → Semantic → Component) as industry standard.

### System Overview with Theme Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    DECORATIVE LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Scanline │  │   CRT    │  │ Spinning │  │   Grid   │    │
│  │ Overlay  │  │  Bezel   │  │ Elements │  │ Background│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│                     THEME LAYER                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Design Tokens (colors, typography, effects)         │    │
│  │  @theme { --color-amber: #faa622; }                  │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                   COMPONENT LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ shadcn-  │  │  Game    │  │  Search  │  │  Modal   │    │
│  │  svelte  │  │  Board   │  │  Input   │  │ Dialog   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         API Routes + D1 Database                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Rationale:** This architecture enables non-destructive theming. Existing game components continue to function unchanged while theme layer provides visual identity through tokens and decorative layer adds retro atmosphere through effects.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Design Tokens** | Define visual primitives (colors, spacing, typography) | Tailwind CSS v4 `@theme` directive in app.css |
| **Theme Variables** | Map primitives to semantic purpose | CSS custom properties in `:root` and `.dark` |
| **Base Components** | Headless UI primitives (buttons, cards, inputs) | shadcn-svelte components using theme tokens |
| **Game Components** | Game-specific logic (GameRow, SearchInput) | Svelte components with game state |
| **Decorative Components** | Visual atmosphere (scanlines, bezel, animations) | CSS pseudo-elements and Svelte overlays |
| **Effect Utilities** | Reusable CSS effects (glow, spin, noise) | Tailwind utilities and @layer components |

## Recommended Project Structure

```
src/
├── lib/
│   ├── styles/                 # Theme layer
│   │   ├── tokens.css          # Design tokens (@theme directive)
│   │   ├── effects.css         # CRT effects (scanlines, glow, etc.)
│   │   ├── animations.css      # Keyframe animations (spin, flicker)
│   │   └── decorative.css      # Decorative element utilities
│   ├── components/
│   │   ├── ui/                 # shadcn-svelte base components (unchanged)
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   └── input/
│   │   ├── theme/              # Theme-specific decorative components
│   │   │   ├── CRTBezel.svelte
│   │   │   ├── ScanlineOverlay.svelte
│   │   │   ├── GridBackground.svelte
│   │   │   ├── SpinningAsterisk.svelte
│   │   │   └── ConcentricCircles.svelte
│   │   ├── GameRow.svelte      # Game logic (minimal theme coupling)
│   │   ├── SearchInput.svelte
│   │   └── HowToPlay.svelte
│   ├── types.ts
│   ├── utils.ts
│   └── api.ts
├── routes/
│   ├── +layout.svelte          # Import theme CSS, apply .dark class
│   ├── +page.svelte            # Landing page with theme decorations
│   ├── classic/+page.svelte
│   └── scales/+page.svelte
├── app.css                     # Import statements + base theme
└── fonts/                      # Custom font files (Minerva, VCR OSD, etc.)
```

### Structure Rationale

**`lib/styles/` folder:**
- Centralizes all theme-related CSS in one location
- Separates concerns: tokens, effects, animations, decorative utilities
- Makes it easy to toggle theme on/off by commenting out imports
- Aligns with CSS Cascade Layers pattern for theme management

**`components/theme/` folder:**
- Isolates decorative components from functional game components
- Clear boundary: `theme/` components are purely visual, can be removed without breaking game logic
- Makes it obvious which components are part of the design system vs. game logic

**Font organization:**
- Custom fonts live in `src/fonts/` or `static/fonts/` for direct @font-face imports
- Avoid external CDN dependencies for performance and offline support

**Existing structure preserved:**
- `components/ui/` (shadcn-svelte) remains untouched — receives theme via CSS variables
- Game components (GameRow, SearchInput) continue to work as-is
- API routes and data layer completely unaffected

## Architectural Patterns

### Pattern 1: Non-Destructive Theme Layer via CSS Cascade Layers

**What:** Use CSS Cascade Layers to apply theme styling without modifying existing component classes.

**When to use:** When integrating a design system into an existing codebase with established components (like shadcn-svelte).

**Trade-offs:**
- **Pros:** Zero risk of breaking existing components, easy to toggle theme on/off, explicit precedence control
- **Cons:** Requires CSS Cascade Layers support (Chrome 99+, Firefox 97+, Safari 15.4+) — not an issue for modern browsers

**Example:**

```css
/* app.css */
@import "tailwindcss";

/* Define layer order explicitly */
@layer base, components, theme, utilities;

/* Base shadcn-svelte styles in base/components layers */
@layer base {
  body { @apply bg-background text-foreground; }
}

/* Theme overrides in theme layer (higher precedence than components) */
@layer theme {
  .crt-bezel {
    border: 2px solid oklch(0.4 0.1 50);
    border-radius: 12px;
    box-shadow: inset 0 0 20px oklch(0 0 0 / 40%);
  }

  .scanlines::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      oklch(0 0 0 / 5%) 0px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
  }
}
```

**Source:** [Mastering CSS Cascade Layers for Scalable Design Systems](https://www.designsystemscollective.com/mastering-css-cascade-layers-for-scalable-design-systems-981fdab2a961) explains how cascade layers prevent style conflicts and enable safe theme overlays.

### Pattern 2: Tailwind CSS v4 Theme Variables for Token Management

**What:** Define design tokens using Tailwind CSS v4's `@theme` directive, which generates utility classes from CSS variables.

**When to use:** When you want design tokens (colors, spacing, fonts) to be available as both CSS variables AND Tailwind utility classes.

**Trade-offs:**
- **Pros:** Single source of truth, utilities auto-generate, runtime theme switching possible
- **Cons:** Requires Tailwind CSS v4+, theme variables must be top-level (cannot nest under media queries)

**Example:**

```css
/* lib/styles/tokens.css */
@theme {
  /* CRT Color Palette */
  --color-amber: #faa622;
  --color-yellow: #ffe52c;
  --color-cyan: #7fe6ef;
  --color-lime: #c4d70c;
  --color-deep-red: #c22303;
  --color-dirt-black: #1a1a1a;
  --color-near-white: #f5f0e8;

  /* Typography Scale */
  --font-family-primary: 'Minerva Modern', sans-serif;
  --font-family-headline: 'Audiowide', sans-serif;
  --font-family-mono: 'VCR OSD Mono', monospace;

  /* Spacing for CRT effects */
  --spacing-bezel: 20px;
  --radius-crt: 12px;
}
```

Now you can use utilities like `bg-amber`, `text-yellow`, `font-primary`, or access via CSS as `var(--color-amber)`.

**Source:** [Tailwind CSS v4 Theme Variables Documentation](https://tailwindcss.com/docs/theme) explains the `@theme` directive and how it generates utilities.

### Pattern 3: Decorative Components with Svelte Slots

**What:** Build reusable decorative wrappers (bezel, scanlines, grid background) as Svelte components that accept game content via slots.

**When to use:** When decorative effects need to wrap existing page content without modifying game components.

**Trade-offs:**
- **Pros:** Composable, easy to apply/remove, keeps decoration separate from logic
- **Cons:** Adds component nesting, slight performance overhead for complex effects

**Example:**

```svelte
<!-- lib/components/theme/CRTBezel.svelte -->
<script lang="ts">
  let { class: className, children } = $props();
</script>

<div class="crt-bezel relative {className}">
  <!-- Scanline overlay -->
  <div class="scanlines absolute inset-0 pointer-events-none"></div>

  <!-- Content slot -->
  {@render children()}

  <!-- Corner decorations (spinning asterisks) -->
  <div class="absolute top-4 left-4">
    <SpinningAsterisk color="amber" />
  </div>
</div>

<style>
  .crt-bezel {
    background: var(--color-dirt-black);
    border-radius: var(--radius-crt);
    border: 3px solid oklch(0.3 0.05 50);
    box-shadow:
      inset 0 0 30px oklch(0 0 0 / 50%),
      0 0 50px oklch(0.6 0.2 50 / 20%);
    padding: var(--spacing-bezel);
  }

  .scanlines::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      oklch(0 0 0 / 3%) 1px,
      transparent 2px
    );
    border-radius: inherit;
  }
</style>
```

Usage:
```svelte
<!-- routes/classic/+page.svelte -->
<CRTBezel class="max-w-2xl mx-auto my-8">
  <GameBoard />
</CRTBezel>
```

### Pattern 4: GPU-Accelerated CSS Effects with `will-change`

**What:** Apply CRT effects (scanlines, glow, animations) using CSS properties that trigger GPU acceleration.

**When to use:** For visual effects that need to be performant (animations, overlays, shadows).

**Trade-offs:**
- **Pros:** Hardware-accelerated, smooth 60fps, no JavaScript overhead
- **Cons:** Overuse of `will-change` can reduce performance; limit to actively animating elements

**Example:**

```css
/* lib/styles/effects.css */
.phosphor-glow {
  text-shadow:
    0 0 4px currentColor,
    0 0 8px currentColor,
    0 0 12px oklch(0.7 0.2 50 / 40%);
  will-change: text-shadow; /* GPU acceleration */
}

.slow-spin {
  animation: spin 20s linear infinite;
  will-change: transform;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .slow-spin {
    animation: none;
  }
  .phosphor-glow {
    text-shadow: none;
  }
}
```

**Source:** [Retro CRT Terminal Screen in CSS + JS](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh) demonstrates performant CRT effects using CSS-only techniques.

### Pattern 5: Semantic Color Mapping for shadcn-svelte Integration

**What:** Map CRT palette colors to shadcn-svelte's semantic token names (--accent, --primary, --destructive) so existing components automatically adopt theme.

**When to use:** Always when using shadcn-svelte — this is how to theme it without modifying component code.

**Trade-offs:**
- **Pros:** Existing components inherit theme automatically, maintains shadcn-svelte's accessibility features
- **Cons:** Limited to shadcn-svelte's semantic naming structure

**Example:**

```css
/* app.css */
:root {
  /* Map CRT colors to shadcn-svelte semantic tokens */
  --background: oklch(0.1 0.02 50); /* dirt black */
  --foreground: oklch(0.95 0.01 80); /* near white */
  --accent: oklch(0.75 0.15 70); /* amber */
  --primary: oklch(0.85 0.12 90); /* yellow */
  --destructive: oklch(0.6 0.2 25); /* deep red */
  --border: oklch(0.4 0.08 60 / 20%); /* dim amber */
  --ring: oklch(0.7 0.15 70 / 40%); /* amber glow */
}

.dark {
  /* Dark mode is default for CRT theme */
  --background: oklch(0.08 0.01 50);
  --foreground: oklch(0.96 0.005 85);
}

@theme inline {
  /* Expose to Tailwind utilities */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --color-primary: var(--primary);
  --color-destructive: var(--destructive);
}
```

Now shadcn-svelte buttons, cards, and inputs automatically use CRT colors without modification.

**Source:** [shadcn-svelte Theming Documentation](https://www.shadcn-svelte.com/docs/theming) explains the semantic token system.

## Data Flow: Theme Application

### Token Flow (Build Time)

```
Design Tokens (tokens.css @theme)
    ↓
Tailwind CSS Compiler
    ↓
Generated Utilities (bg-amber, text-yellow, etc.)
    ↓
Component Classes (applied in .svelte files)
    ↓
Final CSS Bundle
```

### Runtime Theme Switching (Future Enhancement)

```
User Interaction (theme toggle button)
    ↓
JavaScript updates <html> class or data-theme attribute
    ↓
CSS variables re-evaluate (via .theme-crt class)
    ↓
All components re-render with new token values
    ↓
GPU-accelerated transition animations
```

### Component Rendering with Theme Layers

```
Page Load
    ↓
+layout.svelte imports app.css (tokens + effects)
    ↓
Decorative components mount (CRTBezel, GridBackground)
    ↓
Game components mount (use theme tokens via Tailwind utilities)
    ↓
CSS Cascade Layers apply in order: base → components → theme → utilities
    ↓
shadcn-svelte components inherit semantic token values
    ↓
Final render: themed UI with CRT atmosphere
```

## Integration Strategy: Build Order

The build order matters when integrating a design system. Dependencies flow from tokens → utilities → components → decorations.

### Phase 1: Foundation (Design Tokens)

**Build first:** Establishes the visual language before any components.

**Files to create:**
1. `src/lib/styles/tokens.css` — Define all CRT palette colors, typography, spacing
2. Update `src/app.css` — Import tokens, map to shadcn-svelte semantic tokens
3. Test: Verify Tailwind utilities generate (`bg-amber`, `text-yellow`)

**Validation:** Run `npm run dev`, inspect DevTools for `--color-amber` in computed styles.

**Dependencies:** None (foundational)

### Phase 2: Base Effects (CSS Utilities)

**Build second:** Reusable effect utilities that decorative components will consume.

**Files to create:**
1. `src/lib/styles/effects.css` — Scanline, phosphor glow, noise texture utilities
2. `src/lib/styles/animations.css` — Spin, flicker, fade keyframes
3. Import in `app.css` via `@layer theme { ... }`

**Validation:** Apply `.scanlines` class to a test div, verify overlay appears.

**Dependencies:** Tokens (colors for glow effects)

### Phase 3: Semantic Token Mapping (shadcn-svelte Integration)

**Build third:** Connect CRT palette to existing component library.

**Files to modify:**
1. `src/app.css` — Map `--color-amber` → `--accent`, `--color-yellow` → `--primary`, etc.
2. Test existing components (buttons, cards) to confirm they adopt new colors

**Validation:** Existing `<Button>` components should now render in amber/yellow without code changes.

**Dependencies:** Tokens

### Phase 4: Decorative Components (Theme Atmosphere)

**Build fourth:** Visual atmosphere elements that wrap or augment pages.

**Files to create:**
1. `src/lib/components/theme/CRTBezel.svelte` — Bezel frame with shadow
2. `src/lib/components/theme/ScanlineOverlay.svelte` — Fullscreen scanline texture
3. `src/lib/components/theme/GridBackground.svelte` — TV guide grid pattern
4. `src/lib/components/theme/SpinningAsterisk.svelte` — Decorative corner element
5. `src/lib/components/theme/ConcentricCircles.svelte` — Background motif

**Validation:** Import and render each component in isolation to verify appearance.

**Dependencies:** Effects utilities, animations

### Phase 5: Typography Integration (Font Loading)

**Build fifth:** Load custom fonts and apply to existing text elements.

**Files to create/modify:**
1. `src/fonts/` or `static/fonts/` — Add font files (.woff2 for modern browsers)
2. `src/lib/styles/fonts.css` — `@font-face` declarations
3. Update `tokens.css` — Set `--font-family-primary: 'Minerva Modern'`
4. Test on headings, body text, UI components

**Validation:** Inspect fonts in DevTools, verify correct font files load.

**Dependencies:** Tokens, font licensing resolved (Minerva Modern requires purchase)

### Phase 6: Page-Level Application (Layout Integration)

**Build sixth:** Apply decorative components to actual game pages.

**Files to modify:**
1. `src/routes/+layout.svelte` — Wrap app in `<ScanlineOverlay>` or `<GridBackground>`
2. `src/routes/+page.svelte` — Apply bezel to mode selection cards
3. `src/routes/classic/+page.svelte` — Wrap game board in `<CRTBezel>`
4. `src/routes/scales/+page.svelte` — Same treatment

**Validation:** Navigate through app, confirm visual consistency across all pages.

**Dependencies:** Decorative components, typography

### Phase 7: Refinement (Polish & Accessibility)

**Build last:** Fine-tune effects, ensure accessibility compliance.

**Tasks:**
1. Add `@media (prefers-reduced-motion)` rules to disable animations
2. Verify color contrast meets WCAG AA standards (scanlines at low opacity)
3. Test keyboard navigation with visual effects enabled
4. Performance audit (Chrome DevTools → Performance tab)
5. Cross-browser testing (Chrome, Firefox, Safari)

**Validation:** Lighthouse audit scores, axe DevTools accessibility scan.

**Dependencies:** All previous phases complete

## Anti-Patterns

### Anti-Pattern 1: Modifying shadcn-svelte Component Source

**What people do:** Edit `src/lib/components/ui/button/button.svelte` directly to add CRT styling.

**Why it's wrong:**
- Loses ability to update shadcn-svelte components (future bug fixes, accessibility improvements)
- Couples game logic to theme (can't switch themes later)
- Violates shadcn-svelte's headless design philosophy

**Do this instead:**
- Use CSS variables to theme components via `app.css`
- Wrap components in decorative containers if needed (`<CRTBezel><Button /></CRTBezel>`)
- Create variant utilities in `@layer components` that compose with base components

### Anti-Pattern 2: JavaScript-Heavy Animation Effects

**What people do:** Use JavaScript libraries (GSAP, Three.js) for scanlines, glow, rotation effects.

**Why it's wrong:**
- Heavy performance overhead (JavaScript runs on main thread, blocks UI)
- Harder to respect `prefers-reduced-motion`
- Svelte's reactive system can cause unnecessary re-animations
- Adds significant bundle size

**Do this instead:**
- CSS animations and transitions (GPU-accelerated via `transform`, `opacity`)
- `@keyframes` for rotation, flicker effects
- CSS `filter` and `backdrop-filter` for blur, glow
- `will-change` hint for actively animating elements only

**Source:** [Using CSS Animations to Mimic CRT Monitor](https://medium.com/@dovid11564/using-css-animations-to-mimic-the-look-of-a-crt-monitor-3919de3318e2) demonstrates CSS-only approach.

### Anti-Pattern 3: Global CSS Overrides Without Cascade Layers

**What people do:** Add theme styles directly in `@layer base` or at root level, overriding everything.

**Why it's wrong:**
- Specificity conflicts with shadcn-svelte and Tailwind utilities
- Impossible to toggle theme on/off
- Hard to debug "why isn't my style applying?"
- Utility classes may stop working as expected

**Do this instead:**
- Use `@layer theme` for all theme-specific styles
- Define layer order explicitly: `@layer base, components, theme, utilities;`
- Theme layer sits between components and utilities (can override components, can be overridden by utilities)
- Clean separation enables theme switching

**Source:** [Getting Started with CSS Cascade Layers](https://www.smashingmagazine.com/2022/01/introduction-css-cascade-layers/) explains layer ordering.

### Anti-Pattern 4: Inline Styles for Theme Values

**What people do:** Hardcode colors in Svelte components: `<div style="color: #faa622;">`.

**Why it's wrong:**
- Theme cannot be changed at runtime
- No single source of truth (duplicate color values scattered across files)
- Accessibility issues (can't adapt to user's contrast preferences)
- Harder to maintain (find-replace becomes error-prone)

**Do this instead:**
- Always use CSS variables: `<div style="color: var(--color-amber);">`
- Better yet, use Tailwind utilities: `<div class="text-amber">`
- Keep all design token values in `tokens.css`, reference them everywhere else

### Anti-Pattern 5: Decorative Components with Game Logic

**What people do:** Build `CRTGameBoard.svelte` that combines bezel styling with game state management.

**Why it's wrong:**
- Couples decoration to functionality (can't reuse bezel for other content)
- Harder to test (decoration interferes with game logic tests)
- Violates single responsibility principle
- Can't easily disable theme without refactoring

**Do this instead:**
- Keep decoration and logic in separate components
- Use composition: `<CRTBezel><GameBoard /></CRTBezel>`
- Game components should be theme-agnostic (use semantic tokens like `--accent`, not `--color-amber`)

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **1-5 pages** (current Screendle state) | Single `app.css` with all theme definitions. Decorative components directly in `lib/components/theme/`. Simple token structure (primitive → semantic). |
| **5-20 pages** | Split theme into multiple CSS files (`tokens.css`, `effects.css`, `animations.css`). Create utility components for common patterns (GlowText, CRTCard). Consider CSS Cascade Layers for better organization. |
| **20+ pages / multi-theme support** | Design token generator (define themes in JSON/YAML, compile to CSS). Dynamic theme switching with JavaScript. Component library documentation site. Consider CSS-in-JS or Svelte's style preprocessors for complex theming logic. |

### Scaling Priorities

**First bottleneck:** CSS bundle size grows as more effects/decorative components are added.

**How to fix:**
- Lazy-load decorative components (only import on pages that use them)
- Use CSS `@import` with media queries to conditionally load heavy effects
- Tree-shake unused Tailwind utilities with PurgeCSS (Tailwind CSS v4 does this automatically)

**Second bottleneck:** Performance degrades with many animated decorative elements (spinning asterisks, scanlines on every page).

**How to fix:**
- Limit animated elements to 3-5 per page maximum
- Use `prefers-reduced-motion` to disable all animations for users who request it
- Replace CSS animations with static images where motion isn't essential
- Implement intersection observer to pause animations when off-screen

## Integration Points

### External Dependencies

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Adobe Fonts** (Minerva Modern) | Web Project → `<link>` in `<svelte:head>` or self-hosted `.woff2` files | Requires commercial license; consider fallback font |
| **Google Fonts** (Audiowide, VCR OSD Mono) | Direct `@import` in `tokens.css` or self-hosted | Free, no licensing concerns |
| **Tailwind CSS v4** | Vite plugin in `vite.config.ts`, `@import "tailwindcss"` in `app.css` | Already configured in existing project |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Theme Layer ↔ Component Layer** | CSS variables (one-way: tokens → components) | Components consume tokens; never modify them |
| **Decorative Components ↔ Game Components** | Svelte slots (decorative wraps game content) | No direct coupling; game components unaware of decoration |
| **Effects CSS ↔ Decorative Components** | CSS classes applied to component templates | Decorative components import and apply effect utilities |
| **App Layout ↔ Page Routes** | Theme CSS imported once in `+layout.svelte` | All child routes inherit theme automatically |

## Accessibility Considerations

### Motion Safety

**Pattern:** All animations must respect `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  .slow-spin { animation: none; }
  .phosphor-glow { text-shadow: 0 0 2px currentColor; } /* Minimal glow */
  * { transition-duration: 0.01ms !important; }
}
```

### Color Contrast

**Pattern:** Scanline overlays and textures must maintain WCAG AA contrast ratios.

- Background scanlines: max 5% opacity
- Text shadows (phosphor glow): increase base text contrast to compensate
- Test with Chrome DevTools → Accessibility → Contrast Ratio

### Keyboard Navigation

**Pattern:** Decorative overlays must use `pointer-events: none` to avoid blocking focus.

```css
.scanlines {
  pointer-events: none; /* Allows clicks/focus to pass through */
}
```

## Performance Optimization

### GPU Acceleration Checklist

✓ Use `transform` and `opacity` for animations (not `left`, `top`, `width`)
✓ Add `will-change: transform` only to actively animating elements
✓ Limit `will-change` usage (max 3-5 elements per page)
✓ Remove `will-change` when animation completes

### Critical CSS

**Pattern:** Inline critical theme CSS in `<svelte:head>` for instant paint.

1. Extract above-the-fold styles (color tokens, typography)
2. Inline in `+layout.svelte`
3. Defer non-critical effects (animations, decorative backgrounds)

### Font Loading Strategy

**Pattern:** Use `font-display: swap` to prevent FOIT (Flash of Invisible Text).

```css
@font-face {
  font-family: 'Minerva Modern';
  src: url('/fonts/minerva-modern.woff2') format('woff2');
  font-display: swap; /* Show fallback until custom font loads */
}
```

## Sources

### High Confidence (Official Documentation)

- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) — `@theme` directive and utility generation
- [shadcn-svelte Theming Documentation](https://www.shadcn-svelte.com/docs/theming) — Semantic token system
- [SvelteKit Project Structure](https://svelte.dev/docs/kit/project-structure) — Recommended folder organization
- [CSS Cascade Layers - MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers) — Layer syntax and precedence

### Medium Confidence (Verified Community Resources)

- [Design Tokens Explained - Contentful](https://www.contentful.com/blog/design-token-system/) — Token hierarchy patterns
- [Mastering CSS Cascade Layers for Design Systems](https://www.designsystemscollective.com/mastering-css-cascade-layers-for-scalable-design-systems-981fdab2a961) — Theme layer architecture
- [Getting Started with CSS Cascade Layers - Smashing Magazine](https://www.smashingmagazine.com/2022/01/introduction-css-cascade-layers/) — Layer ordering and organization
- [Retro CRT Terminal Screen in CSS + JS](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh) — Performance-optimized CRT effects
- [Design Tokens That Scale in 2026 (Tailwind v4)](https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026) — Token organization with Tailwind CSS v4

### Community Examples (Inspiration)

- [Retro Futuristic UI Design - GitHub](https://github.com/Imetomi/retro-futuristic-ui-design) — CRT effect examples
- [CSS Retro Style Examples](https://freefrontend.com/css-retro-style/) — Typography and color techniques

---

*Architecture research for: Screendle CRT-Retro Design System*
*Researched: 2026-02-27*
