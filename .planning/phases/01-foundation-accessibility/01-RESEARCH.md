# Phase 1: Foundation & Accessibility - Research

**Researched:** 2026-02-27
**Domain:** Tailwind CSS v4 theming, CSS custom properties, accessibility, font loading, CRT visual effects
**Confidence:** HIGH

## Summary

Phase 1 establishes the CRT color palette, dark theme foundation, and accessibility baseline using Tailwind CSS v4's CSS-first configuration approach. The research reveals that Tailwind v4 fundamentally changes theming from JavaScript config files to CSS `@theme` directives, making color definitions and custom properties more direct. The phase requires careful attention to WCAG AA contrast ratios (4.5:1) when overlaying scanlines, proper font preloading for performance, and comprehensive `prefers-reduced-motion` support.

The project uses Tailwind CSS v4.1.18 with the new Tailwind Vite plugin, SvelteKit with Cloudflare adapter, and already has a dark theme foundation in `src/app.css`. The existing shadcn-svelte components use oklch color space, which aligns well with modern accessibility contrast checking tools.

**Primary recommendation:** Use Tailwind v4's `@theme` directive to define CRT palette colors as CSS custom properties, implement scanlines as a fixed pseudo-element overlay with `pointer-events: none`, safelist dynamic color classes in `safelist-tailwindcss.txt`, and preload only the critical Audiowide font in `app.html`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Color Application:**
- Yellow (#ffe52c) is the main background color for larger content areas
- Dark header/navbar gives the impression of TV bezels — not yellow
- Cyan (#7fe6ef) for all interactive elements (buttons, links, hover states)
- Red (#c22303) used both semantically (errors, wrong guesses) and decoratively (accent graphics, borders)
- Amber (#faa622), lime (#c4d70c) as accent colors for graphical elements, strips, and rings
- The yellow background areas use the rounded rectangle grid pattern (DECO-03) to create texture (deferred to Phase 3)

**Scanline Overlay:**
- Subtle texture at ~5-8% opacity — noticeable subconsciously, not distracting
- Warm/amber-tinted lines (not pure black) to match CRT phosphor aesthetic
- Medium line spacing (4-5px) — visible as scanlines without moiré artifacts
- Static — no animation or drift
- Main content area only — not on the dark header/navbar
- Same opacity everywhere (no per-surface adjustment)
- **Must be implemented as an isolated, easily removable layer** — clearly identifiable code and dependencies so it can be tweaked or removed after visual review

**Dark Theme Feel:**
- Slightly warm dark background — not pure neutral #1a1a1a, push a touch toward brown/amber warmth
- Near-white text uses #f5f0e8 (warm cream) as specified
- Subtle gradient/shadow at transitions between dark header and yellow content area — like a TV bezel casting shadow
- Dark cards/panels on yellow backgrounds — game boards and content panels use the dark background color, creating "screens within the TV"
- Moderate border radius (8-12px) on rectangles — clearly rounded but not pill-shaped

**Color Combination Patterns for Text Visibility:**
- Dark background + light text (#f5f0e8) — primary reading pattern
- Amber background + primary yellow text/content — good for icons, graphics, and simple text
- Lighter shade of primary yellow + amber text — alternate combination
- Amber border + light yellow background + amber text — for cell/card content
- Amber border cells can have a header zone on top with light yellow text (like a column header above a cell value)

**Font Loading:**
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

### Deferred Ideas (OUT OF SCOPE)
- Rounded rectangle grid pattern on yellow backgrounds (DECO-03) — Phase 3 decorative work
- Concentric circles and spinning star elements — Phase 3
- CRT bezel frame around content — Phase 3
- Phosphor glow on headings — Phase 3
- Full typography rollout (VCR OSD Mono, Space Mono, VT323) — Phase 2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | CRT color palette defined as CSS custom properties and Tailwind utilities | Tailwind v4 @theme directive, oklch color space support |
| FOUN-02 | Dark theme base applied globally (dirt black ~#1a1a1a background, near-white ~#f5f0e8 text) | Existing app.css theme structure, warm dark mode best practices |
| FOUN-03 | Subtle scanline overlay on main content container via repeating-linear-gradient pseudo-element with pointer-events: none | CSS repeating-linear-gradient patterns, fixed overlay techniques |
| FOUN-04 | prefers-reduced-motion support disables/reduces all animations and spinning elements | CSS @media prefers-reduced-motion, accessibility best practices |
| FOUN-05 | All text with scanline overlay passes WCAG AA contrast (4.5:1 minimum) | WCAG contrast requirements, oklch-compatible contrast checkers |
| TYPO-05 | All fonts self-hosted as WOFF2 with font-display: swap | Font loading best practices, WOFF2 format, SvelteKit static assets |
| TYPO-06 | Critical fonts preloaded in app.html, accent fonts loaded asynchronously | Font preloading techniques, performance optimization |
| INTG-03 | Production build includes all custom theme classes (Tailwind safelist configured) | Tailwind v4 safelist file approach, tree-shaking prevention |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 4.1.18 | CSS framework with theme system | Already installed, v4 uses CSS-first configuration via @theme directive |
| @tailwindcss/vite | 4.1.18 | Vite plugin for Tailwind v4 | Required for Tailwind v4, replaces PostCSS setup |
| SvelteKit | 2.49.1 | Framework with SSR/SSG support | Already installed, provides static asset handling |
| WOFF2 | - | Font format | Best compression (30% better than WOFF), universal modern browser support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| oklch() color function | Native CSS | P3 color space, better perceptual uniformity | Already used in app.css, ideal for CRT palette |
| @media prefers-reduced-motion | Native CSS | Accessibility media query | Required for FOUN-04 compliance |
| repeating-linear-gradient() | Native CSS | Scanline texture generation | Recommended for CRT effects, GPU-accelerated |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 @theme | Tailwind v3 config.js | v4 is already installed, v3 approach deprecated in v4 |
| Self-hosted WOFF2 | Google Fonts CDN | Self-hosting avoids third-party requests, GDPR-friendly, faster |
| oklch() color space | hex/rgb | oklch provides perceptual uniformity, P3 gamut, better for accessibility tools |
| CSS gradients for scanlines | Canvas/WebGL | CSS is simpler, more performant, easier to remove/tweak |

**Installation:**
```bash
# All dependencies already installed
# Only need to download Audiowide font files
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app.css                      # Theme configuration with @theme directive
├── app.html                     # Font preloading, meta tags
├── routes/
│   └── +layout.svelte          # Dark theme class, scanline overlay container
static/
└── fonts/
    └── audiowide/
        ├── audiowide-regular.woff2
        └── LICENSE.txt
safelist-tailwindcss.txt         # Safelist for dynamic color classes (project root)
```

### Pattern 1: Tailwind v4 Theme Configuration

**What:** Define CRT palette colors using @theme directive in app.css

**When to use:** All custom color definitions that need corresponding Tailwind utilities

**Example:**
```css
/* src/app.css */
@import "tailwindcss";

@theme {
  /* CRT Palette - creates utilities like bg-crt-amber, text-crt-cyan, etc. */
  --color-crt-amber: oklch(0.69 0.14 56);     /* #faa622 */
  --color-crt-yellow: oklch(0.93 0.15 97);    /* #ffe52c */
  --color-crt-cyan: oklch(0.87 0.09 211);     /* #7fe6ef */
  --color-crt-lime: oklch(0.81 0.14 108);     /* #c4d70c */
  --color-crt-red: oklch(0.45 0.19 25);       /* #c22303 */

  /* Dark theme colors */
  --color-dark-warm: oklch(0.15 0.01 56);     /* Warm dark bg ~#1c1a18 */
  --color-text-cream: oklch(0.95 0.01 56);    /* Warm cream #f5f0e8 */
}

/* Reference theme variables in custom CSS */
.scanline-overlay::before {
  background-color: var(--color-crt-amber);
}
```

**Source:** [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme)

### Pattern 2: Scanline Overlay with Pseudo-Element

**What:** Fixed overlay using repeating-linear-gradient with pointer-events: none

**When to use:** CRT scanline effect that doesn't interfere with user interaction

**Example:**
```css
/* Isolated scanline implementation - easy to remove */
.scanline-container {
  position: relative;
  isolation: isolate; /* Create stacking context */
}

.scanline-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Click-through to content */
  z-index: 9999;

  /* Amber-tinted horizontal scanlines, 4px spacing */
  background: repeating-linear-gradient(
    0deg,
    rgba(250, 166, 34, 0.06) 0px,     /* Warm amber line */
    rgba(250, 166, 34, 0.06) 1px,
    transparent 1px,
    transparent 4px
  );

  /* Removed by prefers-reduced-motion if needed */
  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
}
```

**Sources:**
- [CSS Scanline Patterns](https://codepen.io/meduzen/pen/zxbwRV)
- [Retro CRT Terminal in CSS](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh)
- [Using CSS to create a CRT](https://aleclownes.com/2017/02/01/crt-display.html)

### Pattern 3: Font Loading with Preload

**What:** Self-hosted WOFF2 fonts with preload for critical fonts

**When to use:** All font loading to avoid FOIT/FOUT and improve performance

**Example:**
```html
<!-- src/app.html -->
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Preload critical Audiowide font -->
  <link rel="preload"
        href="/fonts/audiowide/audiowide-regular.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous" />

  %sveltekit.head%
</head>
```

```css
/* src/app.css */
@font-face {
  font-family: 'Audiowide';
  src: url('/fonts/audiowide/audiowide-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* Show fallback immediately, swap when loaded */
}

@theme {
  --font-headline: 'Audiowide', 'Impact', 'Arial Black', sans-serif;
}
```

**Sources:**
- [Font Display Swap Guide 2026](https://font-converters.com/performance/font-display-swap)
- [Self-Hosting Web Fonts: WOFF2 Best Practices](https://www.dchost.com/blog/en/self-hosting-web-fonts-moving-from-google-fonts-to-woff2-on-your-own-server/)
- [SvelteKit Font Loading](https://blog.cupofcraft.dev/how-load-custom-fonts-sveltekit)

### Pattern 4: Accessibility - Reduced Motion

**What:** Disable/reduce animations and effects when user prefers reduced motion

**When to use:** All animations, transitions, and effects (required for WCAG 2.1 AAA)

**Example:**
```css
/* Remove scanlines for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .scanline-container::before {
    display: none;
  }

  /* Disable any other animations in Phase 1 */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Sources:**
- [prefers-reduced-motion MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [WCAG 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [Design Accessible Animation 2026](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/)

### Pattern 5: Safelist for Dynamic Classes

**What:** Prevent Tailwind from purging dynamically generated class names

**When to use:** When class names are constructed programmatically (e.g., `bg-crt-${color}`)

**Example:**
```
# safelist-tailwindcss.txt (project root)
# CRT color utilities - all variants
bg-crt-amber
bg-crt-yellow
bg-crt-cyan
bg-crt-lime
bg-crt-red
text-crt-amber
text-crt-yellow
text-crt-cyan
text-crt-lime
text-crt-red
border-crt-amber
border-crt-yellow
border-crt-cyan
border-crt-lime
border-crt-red

# Dark theme utilities
bg-dark-warm
text-text-cream
```

**Source:** [How to Safelist Classes in Tailwind CSS V4](https://www.sujalvanjare.com/blog/safelist-classes-tailwind-css-v4)

### Anti-Patterns to Avoid

- **Using :root for theme colors instead of @theme:** Theme variables in @theme generate Tailwind utilities; :root variables do not. Use @theme for colors that need bg-*, text-*, border-* utilities.

- **High opacity scanlines (>10%):** Reduces text contrast, can fail WCAG AA. Keep scanlines subtle (5-8% max).

- **Animated or drifting scanlines:** Violates reduced motion preferences, causes distraction. Keep scanlines static.

- **Pure black (#000000) dark backgrounds:** Creates harsh contrast, eye strain. Use dark grays (#121212 to #1E1E1E) or warm dark colors.

- **Preloading all fonts:** Wastes bandwidth, delays critical resources. Only preload 1-2 fonts used above the fold.

- **Using arbitrary Tailwind values for CRT colors:** Makes colors inconsistent. Define all CRT colors in @theme for design token consistency.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color format conversion (hex to oklch) | Manual converter script | [OddContrast](https://www.oddcontrast.com/) or browser DevTools | oklch values are perceptually uniform, accurate conversion matters |
| Contrast ratio validation | Manual calculation | [OddContrast](https://www.oddcontrast.com/), [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) | WCAG compliance requires precise measurement, validators handle edge cases |
| Font file conversion | Custom converter | [Google Fonts Download Helper](https://gwfh.mranftl.com/fonts/audiowide?subsets=latin), [Fontsource](https://fontsource.org/fonts/audiowide) | Proper WOFF2 compression, subsetting, licensing handled |
| WOFF2 subsetting | Manual glyph selection | Online font tools or use full font (Audiowide is small) | Character range edge cases, unicode normalization |
| Scanline pattern generation | Canvas/WebGL rendering | CSS repeating-linear-gradient | GPU-accelerated, simpler, easier to adjust, no JS needed |

**Key insight:** Modern CSS (oklch colors, repeating-linear-gradient, @property) handles most visual effects natively. Only use JavaScript for interactivity, not styling.

## Common Pitfalls

### Pitfall 1: Tailwind v4 Safelist File Not Created

**What goes wrong:** Custom CRT color classes work in development but disappear in production builds

**Why it happens:** Tailwind v4 removed the config.js safelist option. Dynamic class names (e.g., constructed from variables) aren't detected by static analysis.

**How to avoid:** Create `safelist-tailwindcss.txt` in project root with all dynamically-used class names. Tailwind automatically scans this file during builds.

**Warning signs:**
- Classes appear in dev mode but not after `npm run build`
- Color utilities missing from production CSS
- Console errors about undefined Tailwind classes

**Source:** [Safelist in V4 Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/15291)

### Pitfall 2: Scanline Overlay Reduces Text Contrast Below WCAG AA

**What goes wrong:** Scanline overlay at 8% opacity reduces text contrast from 4.6:1 to 4.2:1, failing WCAG AA

**Why it happens:** Semi-transparent overlays blend with both background and text, reducing effective contrast ratio

**How to avoid:**
1. Test contrast with scanlines enabled using OddContrast or WebAIM
2. Start with 5% opacity and increase gradually while testing
3. Use warm amber tint that blends with warm dark background (less impact on contrast)
4. Measure contrast at worst-case locations (lightest background + darkest text)

**Warning signs:**
- Text appears washed out or hard to read
- Contrast checker shows ratio below 4.5:1
- User reports readability issues

**Sources:**
- [WCAG Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Text Over Images Accessibility](https://www.smashingmagazine.com/2023/08/designing-accessible-text-over-images-part1/)

### Pitfall 3: Font Preload Missing crossorigin Attribute

**What goes wrong:** Preloaded fonts are fetched twice (once for preload, once for CSS), wasting bandwidth

**Why it happens:** Font preloads without `crossorigin="anonymous"` use a different cache than @font-face, causing duplicate requests

**How to avoid:** Always include `crossorigin="anonymous"` on font preload link tags, even for same-origin fonts

```html
<!-- Correct -->
<link rel="preload" href="/fonts/audiowide.woff2" as="font" type="font/woff2" crossorigin="anonymous" />

<!-- Wrong - causes double download -->
<link rel="preload" href="/fonts/audiowide.woff2" as="font" type="font/woff2" />
```

**Warning signs:**
- Network tab shows font downloaded twice
- Slow initial paint despite preload
- Browser console warnings about CORS

**Source:** [Optimize Web Fonts](https://web.dev/learn/performance/optimize-web-fonts)

### Pitfall 4: oklch Colors Not Converting from Hex Correctly

**What goes wrong:** Copying hex values and eyeballing oklch conversion results in wrong colors

**Why it happens:** oklch is perceptually uniform but non-linear; simple RGB math doesn't work

**How to avoid:**
1. Use browser DevTools color picker to convert hex to oklch
2. Use online tools like [OddContrast](https://www.oddcontrast.com/)
3. Verify converted colors visually in actual UI

**Warning signs:**
- Colors look duller or more saturated than expected
- Hue shifts (red becomes orange, cyan becomes blue)
- Inconsistent appearance across browsers

**Source:** [OKLCH Color Contrast Checker](https://www.sbwfc.co.kr/color-contrast-checker/)

### Pitfall 5: Dark Mode Hard-Coded Instead of Class-Based

**What goes wrong:** Dark theme only works if OS prefers dark mode, can't be toggled independently

**Why it happens:** Using `@media (prefers-color-scheme: dark)` instead of class-based theming

**How to avoid:** Apply dark theme via class on root element (already done in +layout.svelte with `class="dark"`). This allows manual theme control while respecting user preferences.

```svelte
<!-- Correct - already in +layout.svelte -->
<div class="dark min-h-screen bg-background text-foreground">
```

**Warning signs:**
- Theme changes when OS setting changes unexpectedly
- Can't override theme preference per-site
- Theme flickers on initial load

**Source:** [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode)

### Pitfall 6: Warm Dark Background Too Warm (Brown Instead of Dark)

**What goes wrong:** Attempting to add warmth to #1a1a1a results in a brown muddy color instead of warm dark gray

**Why it happens:** At low lightness values, small hue/chroma changes have outsized perceptual impact

**How to avoid:**
1. Start with neutral dark gray oklch(0.15 0 0)
2. Add minimal chroma: 0.01-0.02 max
3. Use amber/orange hue (40-60 degrees)
4. Test in actual UI with CRT yellow areas visible for context

**Recommended value:** `oklch(0.15 0.01 56)` - very subtle warmth, not brown

**Warning signs:**
- Background looks brown or muddy
- Too much color shift from neutral
- Doesn't feel like "dark" anymore

**Source:** [Dark Mode Design Best Practices 2026](https://www.tech-rz.com/blog/dark-mode-design-best-practices-in-2026/)

## Code Examples

Verified patterns from official sources:

### Define CRT Palette in app.css

```css
/* src/app.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* CRT Color Palette - generates Tailwind utilities */
@theme {
  /* CRT phosphor colors */
  --color-crt-amber: oklch(0.69 0.14 56);     /* #faa622 */
  --color-crt-yellow: oklch(0.93 0.15 97);    /* #ffe52c */
  --color-crt-cyan: oklch(0.87 0.09 211);     /* #7fe6ef */
  --color-crt-lime: oklch(0.81 0.14 108);     /* #c4d70c */
  --color-crt-red: oklch(0.45 0.19 25);       /* #c22303 */

  /* Dark theme foundation */
  --color-dark-warm: oklch(0.15 0.01 56);     /* Warm dark ~#1c1a18 */
  --color-text-cream: oklch(0.95 0.01 56);    /* Warm cream ~#f5f0e8 */

  /* Override shadcn-svelte theme for dark mode */
  --color-background: var(--color-dark-warm);
  --color-foreground: var(--color-text-cream);
}

/* Keep existing shadcn-svelte theme variables */
:root {
  --radius: 0.625rem;
  /* ... existing theme vars ... */
}
```

**Source:** [Tailwind CSS v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4)

### Scanline Overlay Component

```css
/* src/app.css - add to end of file */

/* Scanline overlay - isolated for easy removal/tweaking */
.crt-scanlines {
  position: relative;
  isolation: isolate;
}

.crt-scanlines::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;

  /* Amber-tinted scanlines, 4px spacing, 6% opacity */
  background: repeating-linear-gradient(
    0deg,
    rgba(250, 166, 34, 0.06) 0px,
    rgba(250, 166, 34, 0.06) 1px,
    transparent 1px,
    transparent 4px
  );
}

/* Remove scanlines for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .crt-scanlines::before {
    display: none;
  }
}
```

```svelte
<!-- src/routes/+layout.svelte -->
<div class="dark min-h-screen bg-background text-foreground crt-scanlines">
  <!-- navbar, content, etc. -->
</div>
```

### Font Loading in app.html

```html
<!-- src/app.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Preload critical Audiowide font -->
    <link rel="preload"
          href="/fonts/audiowide/audiowide-regular.woff2"
          as="font"
          type="font/woff2"
          crossorigin="anonymous" />

    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

```css
/* src/app.css - add before @theme */
@font-face {
  font-family: 'Audiowide';
  src: url('/fonts/audiowide/audiowide-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@theme {
  --font-headline: 'Audiowide', 'Impact', 'Arial Black', sans-serif;
  /* ... other theme vars ... */
}
```

### Reduced Motion Support

```css
/* src/app.css - add after scanline definition */

/* Comprehensive reduced motion support */
@media (prefers-reduced-motion: reduce) {
  /* Remove scanlines */
  .crt-scanlines::before {
    display: none;
  }

  /* Disable animations globally */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind config.js | @theme directive in CSS | v4.0 (2023) | Simpler configuration, CSS-first workflow, no JS config needed |
| Manual content array | Automatic content detection | v4.0 (2023) | Zero-config by default, respects .gitignore |
| safelist in config.js | safelist-tailwindcss.txt file | v4.0 (2023) | Manual enumeration required, more explicit |
| hex/rgb colors | oklch color space | Ongoing (2024-2026) | Better perceptual uniformity, P3 gamut support, accessibility tools |
| font-display: auto | font-display: swap | 2019-2020 | Better perceived performance, no FOIT |
| WOFF format | WOFF2 format | 2018-2019 | 30% better compression, universal browser support |
| Google Fonts CDN | Self-hosted WOFF2 | 2021-2026 | GDPR compliance, faster, no third-party requests |

**Deprecated/outdated:**
- **Tailwind v3 tailwind.config.js approach:** Replaced by @theme directive in v4
- **@tailwind directives:** Replaced by `@import "tailwindcss"` in v4
- **postcss-import plugin:** Built into Tailwind v4
- **Pure black (#000000) dark mode:** Modern guidance recommends dark grays (#121212-#1E1E1E)
- **font-display: auto:** Modern best practice is `swap` or `optional`

## Open Questions

1. **Exact warm dark background color value**
   - What we know: Should start from ~#1a1a1a and warm slightly toward amber/brown
   - What's unclear: Exact oklch values that achieve "warm but not brown"
   - Recommendation: Start with `oklch(0.15 0.01 56)` and adjust chroma if needed. Test in actual UI with yellow content areas visible.

2. **Scanline opacity sweet spot within 5-8% range**
   - What we know: Must maintain WCAG AA contrast (4.5:1), amber-tinted
   - What's unclear: Exact opacity that's "noticeable subconsciously, not distracting"
   - Recommendation: Start at 6%, measure contrast on lightest backgrounds, adjust down if needed

3. **Should safelist include responsive variants?**
   - What we know: Safelist file prevents tree-shaking of dynamic classes
   - What's unclear: Whether to include `sm:bg-crt-amber`, `md:text-crt-cyan`, etc.
   - Recommendation: Only safelist base utilities for Phase 1. Add responsive variants if they're used dynamically in later phases.

4. **Contrast testing with scanlines - measurement technique**
   - What we know: WCAG requires 4.5:1 for normal text, overlay affects contrast
   - What's unclear: Should we measure contrast before overlay, after overlay, or both?
   - Recommendation: Measure without overlay first, then verify with overlay enabled. Browser DevTools color picker can sample actual rendered colors.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) - Theme configuration with @theme directive
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) - CSS-first approach, automatic content detection, performance
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) - Accessibility media query
- [MDN: pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/pointer-events) - Click-through overlays
- [WCAG 2.1 Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) - 4.5:1 ratio requirement
- [WCAG 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) - Reduced motion requirements
- [web.dev: Optimize Web Fonts](https://web.dev/learn/performance/optimize-web-fonts) - Font loading best practices
- [web.dev: Font Best Practices](https://web.dev/articles/font-best-practices) - WOFF2, preload, font-display

### Secondary (MEDIUM confidence)
- [How to Safelist Classes in Tailwind CSS V4](https://www.sujalvanjare.com/blog/safelist-classes-tailwind-css-v4) - Safelist file approach
- [Tailwind v4 Safelist Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/15291) - Community consensus
- [Font Display Swap Guide 2026](https://font-converters.com/performance/font-display-swap) - font-display property
- [Self-Hosting Web Fonts: WOFF2](https://www.dchost.com/blog/en/self-hosting-web-fonts-moving-from-google-fonts-to-woff2-on-your-own-server/) - WOFF2 migration
- [SvelteKit Font Loading](https://blog.cupofcraft.dev/how-load-custom-fonts-sveltekit) - static/fonts directory
- [Retro CRT Terminal in CSS](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh) - Scanline patterns
- [Using CSS to create a CRT](https://aleclownes.com/2017/02/01/crt-display.html) - CRT effect techniques
- [CSS Scanlines CodePen](https://codepen.io/meduzen/pen/zxbwRV) - Gradient patterns
- [Dark Mode Design Best Practices 2026](https://www.tech-rz.com/blog/dark-mode-design-best-practices-in-2026/) - Warm dark backgrounds
- [Complete Accessibility Guide for Dark Mode](https://blog.greeden.me/en/2026/02/23/complete-accessibility-guide-for-dark-mode-and-high-contrast-color-design-contrast-validation-respecting-os-settings-icons-images-and-focus-visibility-wcag-2-1-aa/) - Contrast validation
- [Designing Accessible Text Over Images](https://www.smashingmagazine.com/2023/08/designing-accessible-text-over-images-part1/) - Overlay techniques
- [OddContrast](https://www.oddcontrast.com/) - OKLCH contrast checker
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG validation
- [Audiowide on Google Fonts Helper](https://gwfh.mranftl.com/fonts/audiowide?subsets=latin) - WOFF2 download
- [Audiowide on Fontsource](https://fontsource.org/fonts/audiowide) - Self-hosting package

### Tertiary (LOW confidence)
- [CRT Amber Phosphor Theme (GitHub)](https://github.com/takk8is/amber-monochrome-monitor-crt-phosphor-theme-for-zed) - Amber color inspiration
- [Simulating CRT Monitors with FFmpeg](https://int10h.org/blog/2021/02/simulating-crt-monitors-ffmpeg-pt-2-monochrome/) - CRT phosphor characteristics

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Tailwind v4 and SvelteKit already installed, official docs clear
- Architecture: HIGH - Patterns well-documented, multiple verified examples
- Pitfalls: MEDIUM-HIGH - Based on community reports and official migration guides

**Research date:** 2026-02-27
**Valid until:** 2026-03-29 (30 days - stable technologies, minimal churn expected)
