# Stack Research: CRT-Retro Design System

**Domain:** Frontend design system implementation (CRT/retro TV aesthetic)
**Researched:** 2026-02-27
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Tailwind CSS | v4.1.18 | CSS framework with CSS-first configuration | Already installed. v4's `@theme` directive enables design tokens as native CSS variables, perfect for runtime theming. Fully compatible with existing setup. |
| @theme directive | v4+ | Design token definition | CSS-first configuration eliminates JavaScript config. All design tokens automatically exposed as CSS variables for runtime access. |
| @theme inline | v4+ | Variable reference resolution | Solves CSS variable fallback issues when using `var()` references in theme definitions. Critical for font loading patterns. |
| CSS @property | Universal support (2024+) | Registered custom properties | Enables gradient animations and smooth transitions of previously unanimatable properties. Baseline feature across all modern browsers. |
| OKLCH color space | Native CSS | Color definitions | Already used in project (app.css). Superior perceptual uniformity vs HSL. Tailwind v4 default for shadcn-svelte. |
| CSS Cascade Layers | @layer | Style precedence control | Tailwind v4 foundation. Already in use (`@layer base`, etc.). Provides predictable specificity management. |

### Supporting Libraries & Patterns

| Library/Pattern | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tw-animate-css | ^1.4.0 | Animation utilities | Already installed. Use for standard animations. Define custom animations in `@theme` for brand-specific motion. |
| Self-hosted WOFF2 fonts | N/A | Font loading | Use for all custom fonts. 30% smaller than WOFF, universal browser support. Place in `/static/fonts/`. |
| Adobe Fonts web embed | N/A | Minerva Modern (commercial font) | Adobe Fonts web service ONLY. Cannot self-host—use embed code in `<head>` per licensing terms. |
| Google Fonts | N/A | Accent fonts (Audiowide, Orbitron, Space Mono, VT323) | Use Google Fonts CDN or self-host WOFF2. Self-hosting recommended for performance (no DNS lookup, no GDPR issues). |
| Variable fonts | WOFF2 format | Single file, multiple weights | Use if available for primary font (Minerva Modern may not be variable). Reduces file count by 30-60%. |
| CSS repeating-linear-gradient | Native CSS | Scanline texture | Lightweight, GPU-friendly. Use on pseudo-element (`::before`/`::after`) to avoid layout thrashing. |
| SVG inline components | Svelte 5 | Decorative elements (stars, asterisks) | Rename `.svg` to `.svelte` and import as components. Enables CSS styling and animation of paths. |
| CSS transform + opacity | Native CSS | All animations | GPU-accelerated by default. Never animate width/height/top/left—causes layout recalculation. |
| will-change | Native CSS | Animation performance hints | Apply only to actively animating elements. Add before animation, remove after. Don't overuse. |
| prefers-reduced-motion | Media query | Accessibility | REQUIRED. Disable non-essential animations. Replace motion with fade/dissolve/color-change effects. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| @tailwindcss/vite | Vite integration | Already installed (v4.1.18). First-party plugin for Tailwind v4. |
| svelte-check | Type checking | Already installed. Validates Svelte components and CSS integration. |
| Browser DevTools | CSS variable inspection | Use Chrome/Firefox DevTools to debug CSS variables in runtime. |

## Installation

### Core (Already Installed)
```bash
# Project already has:
# - tailwindcss ^4.1.18
# - @tailwindcss/vite ^4.1.18
# - tw-animate-css ^1.4.0
```

### Fonts Setup

#### Adobe Fonts (Minerva Modern - Commercial License Required)

**Option 1: Adobe Fonts Web Project (Recommended)**
```html
<!-- In src/app.html <head> -->
<link rel="stylesheet" href="https://use.typekit.net/PROJECT_ID.css">
```

**Why:** Adobe Fonts licensing prohibits self-hosting. Must use embed code. Requires Creative Cloud subscription or Typekit plan.

**Option 2: Purchase Desktop + Web License from Foundry**
- If self-hosting is critical, purchase web license directly from font foundry
- Foundry contact: https://www.myfonts.com/products/complete-family-minerva-modern-347537

**Confidence:** HIGH - Adobe Fonts licensing verified from official documentation

#### Google Fonts (Audiowide, Orbitron, Space Mono, VT323)

**Self-Hosted (Recommended)**
```bash
# 1. Download WOFF2 files from Google Fonts
# 2. Place in static/fonts/
# 3. Create static/fonts/fonts.css
```

```css
/* static/fonts/fonts.css */
@font-face {
  font-family: 'Audiowide';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/audiowide-v20-latin-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Space Mono';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/space-mono-variable.woff2') format('woff2-variations');
  /* Use variable font if available */
}
```

**Preload Critical Fonts**
```html
<!-- In src/app.html <head> -->
<link
  rel="preload"
  href="%sveltekit.assets%/fonts/audiowide-v20-latin-regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin
>
```

**CDN (Alternative - Faster Setup, Slower Runtime)**
```html
<!-- In src/app.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Orbitron:wght@400;700&family=Space+Mono:wght@400;700&family=VT323&display=swap" rel="stylesheet">
```

**Confidence:** HIGH - Google Fonts patterns verified, self-hosting documented

## CSS Theme Architecture

### Design Token Definition

```css
/* src/app.css */
@import "tailwindcss";
@import "tw-animate-css";

/* Import custom fonts if self-hosted */
@import "/fonts/fonts.css";

/* CRT Color Palette */
:root {
  /* Brand colors (CRT retro palette) */
  --amber: oklch(0.78 0.15 65);        /* #faa622 → OKLCH */
  --yellow: oklch(0.91 0.19 95);       /* #ffe52c → OKLCH */
  --cyan: oklch(0.87 0.11 195);        /* #7fe6ef → OKLCH */
  --lime: oklch(0.83 0.19 115);        /* #c4d70c → OKLCH */
  --deep-red: oklch(0.50 0.21 25);     /* #c22303 → OKLCH */

  /* Base colors */
  --dirt-black: oklch(0.15 0.01 0);    /* ~#1a1a1a */
  --near-white: oklch(0.96 0.01 85);   /* ~#f5f0e8 */

  /* Font families */
  --font-minerva: 'Minerva Modern', ui-sans-serif, system-ui, sans-serif;
  --font-headline: 'Audiowide', 'Orbitron', monospace;
  --font-timer: 'VCR OSD Mono', monospace;
  --font-data: 'Space Mono', monospace;
  --font-system: 'VT323', monospace;

  /* CRT Effects */
  --scanline-opacity: 0.15;
  --scanline-size: 2px;
  --crt-glow: 0 0 10px var(--yellow), 0 0 20px var(--yellow);
  --bezel-radius: 1.5rem;

  /* Animation timing */
  --ease-crt: cubic-bezier(0.23, 1, 0.32, 1);
  --duration-slow-spin: 20s;
}

.dark {
  /* Dark mode already defined in app.css */
  /* Override CRT-specific values if needed */
  --scanline-opacity: 0.12;  /* Lighter scanlines on dark */
}

/* Map to Tailwind utilities via @theme inline */
@theme inline {
  /* Colors */
  --color-amber: var(--amber);
  --color-yellow: var(--yellow);
  --color-cyan: var(--cyan);
  --color-lime: var(--lime);
  --color-deep-red: var(--deep-red);
  --color-dirt-black: var(--dirt-black);
  --color-near-white: var(--near-white);

  /* Fonts */
  --font-minerva: var(--font-minerva);
  --font-headline: var(--font-headline);
  --font-timer: var(--font-timer);
  --font-data: var(--font-data);
  --font-system: var(--font-system);

  /* Custom animations */
  --animate-slow-spin: slow-spin var(--duration-slow-spin) linear infinite;

  @keyframes slow-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

/* Existing @theme inline block for shadcn-svelte */
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  /* ... existing mappings ... */
}
```

**Confidence:** HIGH - Tailwind v4 @theme patterns verified from official docs

### Why @theme inline for fonts?

Without `inline`, Tailwind generates utilities that reference the variable itself:
```css
.font-minerva {
  font-family: var(--font-minerva);  /* References variable */
}
```

If `--font-minerva` is redefined in a child scope, it breaks fallback chains.

With `inline`, Tailwind uses the variable's computed value:
```css
.font-minerva {
  font-family: 'Minerva Modern', ui-sans-serif, system-ui, sans-serif;
}
```

**Confidence:** HIGH - Tailwind v4 inline behavior verified from official documentation

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @theme directive (v4) | JavaScript config (v3) | Never—you're on v4. JavaScript config deprecated. |
| Self-hosted WOFF2 | Google Fonts CDN | Rapid prototyping only. Self-hosted is faster, no privacy concerns. |
| Adobe Fonts embed | Self-hosted Minerva Modern | If you purchase web license from foundry directly. Not available via Adobe Fonts. |
| CSS @property | CSS.registerProperty() | Only if you need runtime property registration. @property is preferred for static definitions. |
| SVG as Svelte components | External SVG files | If SVGs don't need styling/animation. Inline is best for dynamic color/transform. |
| repeating-linear-gradient | Canvas/WebGL scanlines | Never—CSS is faster, simpler, more accessible. |
| transform + opacity | width/height/top/left animations | Never—causes layout thrashing, jank on mobile. |
| Variable fonts | Multiple static font files | If font doesn't offer variable version. Variable fonts reduce bandwidth by 30-60%. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Tailwind v3 JavaScript config | Deprecated in v4. No longer supported. | `@theme` directive in CSS |
| Non-WOFF2 formats (TTF, OTF) | 30% larger than WOFF2. Slower load times. | WOFF2 with WOFF fallback |
| Animating non-GPU properties (width, height, top, left) | Triggers layout recalculation. Causes jank. | `transform: scale()`, `transform: translate()` |
| Heavy filter usage without compositing | Can block main thread. Inconsistent GPU acceleration. | Apply to composited layers (elements with `transform: translateZ(0)`) |
| will-change on all elements | Consumes excessive GPU memory. Degrades performance. | Apply selectively to actively animating elements only |
| Excessive SVG filter complexity | Not GPU-accelerated in all browsers. Can cause jank. | Use CSS filters (drop-shadow, blur) when possible |
| Adobe Fonts self-hosted files | Violates Terms of Service. Legal liability. | Use Adobe Fonts embed code or purchase foundry license |
| Ignoring prefers-reduced-motion | WCAG 2.3.3 violation. Causes discomfort for vestibular disorders. | Always provide reduced-motion alternative |
| JavaScript animation libraries (GSAP, Anime.js, Framer Motion) | Adds bundle weight. Svelte has built-in transitions. | Use Svelte transitions + CSS animations |
| Canvas/WebGL for simple effects | Complexity, accessibility issues, SEO problems. | CSS effects (gradients, filters, transforms) |

## Stack Patterns by Use Case

### Pattern 1: Scanline Overlay

**Use Case:** CRT scanline texture across entire app

```css
/* Global scanlines */
@layer base {
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, var(--scanline-opacity)) 0px,
      transparent var(--scanline-size)
    );
  }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  body::before {
    opacity: 0.5;  /* Reduce intensity, don't remove entirely */
  }
}
```

**Why:** Pseudo-element keeps scanlines off main DOM. `pointer-events: none` prevents interaction blocking. `repeating-linear-gradient` is GPU-friendly.

**Confidence:** HIGH - CSS scanline patterns verified from multiple sources

### Pattern 2: Slowly Spinning Decorative Elements

**Use Case:** Rotating stars, asterisks, concentric circles

```svelte
<script>
  import Star from './Star.svelte';  // SVG as Svelte component
</script>

<div class="relative">
  <Star class="animate-slow-spin absolute -top-4 -right-4 text-yellow" />
  <div class="content">...</div>
</div>

<style>
  /* Respect reduced motion - replace spin with pulse */
  @media (prefers-reduced-motion: reduce) {
    :global(.animate-slow-spin) {
      animation: pulse 3s ease-in-out infinite !important;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  }
</style>
```

**Why:** Svelte component allows CSS styling of SVG paths. `transform: rotate()` is GPU-accelerated. Reduced-motion replaces motion with fade.

**Confidence:** HIGH - Svelte 5 animation patterns verified

### Pattern 3: CRT Phosphor Glow

**Use Case:** Text glow effect on headings

```css
@layer utilities {
  .text-glow-yellow {
    text-shadow:
      0 0 10px var(--yellow),
      0 0 20px var(--yellow),
      0 0 30px var(--yellow);
  }

  .text-glow-cyan {
    text-shadow:
      0 0 10px var(--cyan),
      0 0 20px var(--cyan);
  }
}

/* Respect reduced motion - reduce glow intensity */
@media (prefers-reduced-motion: reduce) {
  .text-glow-yellow,
  .text-glow-cyan {
    text-shadow: 0 0 5px currentColor;
  }
}
```

**Why:** `text-shadow` is GPU-accelerated. Multiple shadows create layered glow. `currentColor` in reduced-motion preserves subtle effect.

**Confidence:** MEDIUM - CSS glow effects are standard, but performance impact depends on text quantity

### Pattern 4: Modal Transitions

**Use Case:** How to Play modal, results screen

```svelte
<script>
  import { fade, fly } from 'svelte/transition';

  let showModal = $state(false);
</script>

{#if showModal}
  <div
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 bg-dirt-black/80 backdrop-blur-sm"
  >
    <div
      transition:fly={{ y: 20, duration: 300 }}
      class="modal-content"
    >
      <!-- Modal content -->
    </div>
  </div>
{/if}

<style>
  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    div {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
</style>
```

**Why:** Svelte transitions run off main thread. `fade` + `fly` are GPU-accelerated (opacity + transform). Reduced-motion shortens duration to near-instant.

**Confidence:** HIGH - Svelte 5 transition patterns verified from official docs

### Pattern 5: Registered Custom Properties for Gradient Animation

**Use Case:** Animating gradient backgrounds (TV guide grid)

```css
/* Register custom property for animation */
@property --grid-opacity {
  syntax: '<number>';
  initial-value: 0.15;
  inherits: false;
}

@layer utilities {
  .bg-tv-grid {
    background-image:
      repeating-linear-gradient(
        0deg,
        oklch(0.91 0.19 95 / var(--grid-opacity)) 0px,
        transparent 20px
      ),
      repeating-linear-gradient(
        90deg,
        oklch(0.91 0.19 95 / var(--grid-opacity)) 0px,
        transparent 20px
      );
    background-size: 100px 100px;
    border-radius: var(--bezel-radius);
  }

  .bg-tv-grid:hover {
    --grid-opacity: 0.25;
    transition: --grid-opacity 0.3s var(--ease-crt);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bg-tv-grid:hover {
    transition: none;
  }
}
```

**Why:** `@property` allows opacity to transition smoothly. Without registration, custom properties can't animate. Universal browser support as of 2024.

**Confidence:** HIGH - @property verified from MDN and web.dev (Baseline feature)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Tailwind CSS v4.1.18 | SvelteKit 2.x | Requires @tailwindcss/vite plugin (installed) |
| Tailwind CSS v4.1.18 | Svelte 5.x | Full compatibility confirmed |
| tw-animate-css 1.4.0 | Tailwind CSS v4 | Works but consider migrating custom animations to @theme |
| shadcn-svelte (latest) | Tailwind CSS v4 | Full support with @theme inline pattern |
| OKLCH colors | All modern browsers | Safari 15+, Chrome 111+, Firefox 113+ |
| CSS @property | All modern browsers | Chrome 85+, Safari 16.4+, Firefox 128+ (universal July 2024) |
| Variable fonts (woff2-variations) | All modern browsers | Chrome 62+, Safari 11+, Firefox 62+ |
| prefers-reduced-motion | All modern browsers | Chrome 74+, Safari 10.1+, Firefox 63+ |

**Confidence:** HIGH - Browser support verified from MDN compatibility tables

## Sources

### Tailwind CSS v4
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) - Official announcement, @theme directive, CSS-first configuration
- [Theme variables documentation](https://tailwindcss.com/docs/theme) - @theme vs @theme inline, namespaces, custom animations
- [A dev's guide to Tailwind CSS in 2026](https://blog.logrocket.com/tailwind-css-guide/) - Migration patterns, best practices
- [Tailwind CSS v4: The Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide) - Comprehensive overview
- [Best method to use CSS variables for multiple themes - GitHub Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/15600) - Theme patterns

### Font Loading
- [SvelteKit Fontaine: Reduce Custom Font CLS](https://rodneylab.com/sveltekit-fontaine/) - Font loading optimization
- [Self-hosting a font with Tailwind (JIT) and SvelteKit](https://jeffpohlmeyer.com/self-hosting-a-font-with-tailwind-jit-and-sveltekit) - WOFF2 setup
- [How to Load and Use Custom Fonts in Svelte](https://www.w3tutorials.net/blog/how-do-you-load-and-use-a-custom-font-in-svelte/) - @font-face patterns
- [Adobe Fonts web font licensing](https://helpx.adobe.com/fonts/using/webfont-licensing.html) - Self-hosting restrictions
- [CSS Custom Fonts Guide 2025](https://dev.to/satyam_gupta_0d1ff2152dcc/css-custom-fonts-guide-2025-how-to-use-font-face-best-practices-30g8) - @font-face best practices
- [Variable fonts on the web using CSS](https://www.digitalocean.com/community/tutorials/css-variable-fonts) - Variable font syntax

### Svelte 5 Animations
- [Svelte Motion & Theming Guide](https://dev.to/a1guy/svelte-motion-theming-guide-transitions-animations-and-dark-mode-explained-4e3h) - Transitions, performance
- [Essential transitions and animations in Svelte](https://blog.logrocket.com/essential-transitions-and-animations-in-svelte/) - FLIP technique, GPU acceleration
- [Create Amazing User Interfaces Using Animation With Svelte](https://joyofcode.xyz/animation-with-svelte) - Performance best practices
- [Svelte transition documentation](https://svelte.dev/docs/svelte/transition) - Official API reference

### Performance & GPU Acceleration
- [CSS GPU Acceleration: will-change & translate3d Guide](https://www.lexo.ch/blog/2025/01/boost-css-performance-with-will-change-and-transform-translate3d-why-gpu-acceleration-matters/) - GPU optimization
- [How to create high-performance CSS animations](https://web.dev/articles/animations-guide) - Transform + opacity best practices
- [Hardware-accelerated animation capabilities](https://developer.chrome.com/blog/hardware-accelerated-animations) - Browser capabilities
- [High Performance SVGs](https://css-tricks.com/high-performance-svgs/) - SVG optimization
- [Platform News: GPU-Accelerated SVG Animations](https://css-tricks.com/platform-news-rounded-outlines-gpu-accelerated-svg-animations-how-css-variables-are-resolved/) - Browser support

### CSS @property
- [@property: Next-gen CSS variables](https://web.dev/blog/at-property-baseline) - Universal browser support, gradient animation
- [CSS @property documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property) - MDN reference
- [Exploring @property and its Animating Powers](https://css-tricks.com/exploring-property-and-its-animating-powers/) - Use cases
- [CSS @property: Guide with Live Animated Examples](https://savvy.co.il/en/blog/css/css-at-property-guide/) - Practical examples

### Accessibility
- [prefers-reduced-motion documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) - MDN reference
- [Design accessible animation and movement](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) - WCAG 2.3.3 compliance
- [prefers-reduced-motion: Taking a no-motion-first approach](https://www.tatianamac.com/posts/prefers-reduced-motion) - Implementation philosophy
- [Using media queries for accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility) - Best practices

### CRT Effects
- [Retro CRT terminal screen in CSS + JS](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh) - Scanline implementation
- [Using CSS to create a CRT](https://aleclownes.com/2017/02/01/crt-display.html) - Comprehensive CRT effects
- [Make some hacky noise with CSS gradients](https://nerdy.dev/hacky-css-noise-with-repeating-gradients) - Noise patterns

### shadcn-svelte + Tailwind v4
- [Tailwind v4 - shadcn-svelte](https://www.shadcn-svelte.com/docs/migration/tailwind-v4) - Migration guide
- [Theming - shadcn-svelte](https://www.shadcn-svelte.com/docs/theming) - CSS variable patterns
- [Theming Shadcn with Tailwind v4 and CSS Variables](https://medium.com/@joseph.goins/theming-shadcn-with-tailwind-v4-and-css-variables-d602f6b3c258) - Integration patterns

### SVG in Svelte
- [How to Embed, Inline, and Reference SVG Files in Svelte](https://joshuatz.com/posts/2021/using-svg-files-in-svelte/) - Multiple approaches
- [What is the official best method to import svg?](https://github.com/sveltejs/kit/discussions/11399) - Community best practices
- [Working With SVGs in Svelte](https://natclark.com/tutorials/svelte-working-with-svgs/) - Component patterns

---
*Stack research for: CRT-retro design system implementation in SvelteKit + Tailwind v4*
*Researched: 2026-02-27*
