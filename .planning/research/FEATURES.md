# Feature Research: Retro CRT TV Design System

**Domain:** Frontend design systems with retro/themed aesthetics (specifically CRT television / Cassette Futurism)
**Researched:** 2026-02-27
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = themed design feels incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Scanline overlay** | Defining visual element of CRT screens; missing feels "fake retro" | LOW | CSS `repeating-linear-gradient` pseudo-element; lightweight, GPU-accelerated |
| **Cohesive color palette** | Themed designs need consistent brand colors throughout | LOW | Define CSS variables/Tailwind tokens; 5-color palette already specified |
| **Dark theme foundation** | CRT screens are dark by nature; retro aesthetic expects dark background | LOW | Tailwind dark mode utilities; already standard practice |
| **Typography system** | Differentiated fonts for headings/body/data establish visual hierarchy | MEDIUM | Multiple font sources (Adobe Fonts, Google Fonts, DaFont); licensing varies |
| **Responsive design maintenance** | Modern users expect mobile/tablet/desktop support | MEDIUM | Must preserve retro aesthetic across breakpoints without breaking |
| **Focus indicators (keyboard nav)** | WCAG requirement; 8%+ users need clear focus states | LOW | CSS `:focus-visible` with enhanced styling; ~2px outline minimum |
| **WCAG color contrast** | Minimum 4.5:1 text contrast, 3:1 UI components | MEDIUM | Dark themes often fail contrast; test with scanlines enabled |
| **Loading states** | Modern web expectation; users need feedback during async operations | LOW | Skeleton screens or spinners styled to match retro aesthetic |

**Sources:**
- [Using CSS to create a CRT (aleclownes.com)](https://aleclownes.com/2017/02/01/crt-display.html)
- [Retro CRT terminal screen in CSS + JS (DEV Community)](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh)
- [Color Contrast for Accessibility: WCAG Guide (2026)](https://www.webability.io/blog/color-contrast-for-accessibility)
- [Focus Indicator Complete Guide (WebAbility)](https://www.webability.io/glossary/focus-indicator)
- [Skeleton Screens 101 (Nielsen Norman Group)](https://www.nngroup.com/articles/skeleton-screens/)

### Differentiators (Competitive Advantage)

Features that set this CRT theme apart. Not required, but valuable for distinctive identity.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Slowly spinning decorative elements** | Unique motion signature; evokes analog dials/VHS reels; calming not distracting | LOW | CSS `@keyframes rotate` + `transform`; 20-40 second rotation cycles |
| **Phosphor glow effect** | Authentic CRT detail; warm analog feel vs cold digital | LOW | `text-shadow` with radial gradient + subtle blur; GPU-accelerated |
| **TV guide grid backgrounds** | Specific to Cassette Futurism; distinct from generic retro | MEDIUM | Rounded rectangles at varying yellow opacity; CSS Grid or absolute positioning |
| **Concentric circle motifs** | Bullseye/target shapes reinforce broadcast/TV theme | LOW | SVG or CSS `border-radius` rings; static or subtle animation |
| **Subtle CRT bezel frame** | Hints at physical TV without being kitschy | MEDIUM | Rounded corners + `box-shadow` inset/bevel + gradient; container styling |
| **Rounded asterisk/star decorative elements** | Retro graphical accents; 70s-90s visual language | LOW | Unicode characters or SVG with `border-radius`; accent placement only |
| **Modal-only transitions** | Scope animation to contained UI changes; avoid disruptive page-wide effects | MEDIUM | Svelte transitions on modals; 200-300ms duration with easing |
| **`prefers-reduced-motion` implementation** | Respect accessibility preferences; shows polish and care | LOW | CSS media query disables animations/reduces motion; WCAG best practice |
| **Custom design tokens (Tailwind config)** | Centralized theme values; easy iteration and consistency | LOW | Colors, spacing, shadows in `tailwind.config.js`; standard pattern |

**Sources:**
- [9 'New' CRT Television Concepts Redefining Retro Tech in 2026 (Accio)](https://www.accio.com/blog/new-crt-television-concepts-redefining-retro-tech)
- [GitHub: retro-futuristic-ui-design](https://github.com/Imetomi/retro-futuristic-ui-design)
- [CSS GPU Animation: Doing It Right (Smashing Magazine)](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)
- [Respecting Users' Motion Preferences (Smashing Magazine)](https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/)
- [Mastering Modal UX: Best Practices (Eleken)](https://www.eleken.co/blog-posts/modal-ux)

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for themed UIs.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Constant CRT flickering/distortion** | "Looks authentic" | Causes eye strain, headaches, motion sickness; fails accessibility | Subtle static texture at low opacity; `prefers-reduced-motion` removes entirely |
| **Heavy WebGL/Canvas effects** | "Professional" shaders look impressive | Performance hit on mobile; framework compatibility issues; breaks SSR | CSS-only effects (gradients, shadows, filters); GPU-accelerated transforms |
| **Full-screen page transitions** | "Smooth" navigation | Disruptive, slow, contradicts accent-only motion philosophy | Modal-only transitions; instant page loads with CSS fade-ins |
| **Literal illustrated CRT TV frame** | "On-brand" retro theming | Too kitschy, reduces usable space, looks cartoonish | Subtle bezel (rounded corners + shadow) hints at CRT without dominating |
| **Over-saturated neon colors** | Cyberpunk/synthwave confusion | Readability issues, contrast failures, not Cassette Futurism aesthetic | Warm amber/yellow palette; 70s-80s analog warmth vs 80s neon |
| **Excessive noise/grain texture** | "Film grain" retro look | Performance: SVG `feTurbulence` is CPU-heavy; cross-browser issues | Light noise at ~5% opacity; convert to raster image (WebP/AVIF) |
| **Multiple font families per screen** | "Variety" in typography | Inconsistent, cluttered, dilutes brand identity | Strict hierarchy: primary (Minerva Modern) + 3 accent fonts max; clear use cases |
| **Auto-playing background video/animations** | "Dynamic" landing page | Performance killer, battery drain, accessibility violation | Static images with CSS effects; user-initiated animations only |

**Sources:**
- [Common UI Design Mistakes in Unity Games (Moldstud)](https://moldstud.com/articles/p-common-ui-design-mistakes-in-unity-games-and-how-to-avoid-them-a-comprehensive-guide)
- [The Modern Retro Mistakes of Game Developers (Super Jump Magazine)](https://www.superjumpmagazine.com/the-modern-retro-mistakes-of-game-dev/)
- [Creating Grainy CSS Backgrounds Using SVG Filters (freeCodeCamp)](https://www.freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/)
- [Complete Accessibility Guide for Dark Mode (IT & Life Hacks Blog)](https://blog.greeden.me/en/2026/02/23/complete-accessibility-guide-for-dark-mode-and-high-contrast-color-design-contrast-validation-respecting-os-settings-icons-images-and-focus-visibility-wcag-2-1-aa/)
- [Guide: Shaders and Overlays on Retro Handhelds (Retro Game Corps)](https://retrogamecorps.com/2024/09/01/guide-shaders-and-overlays-on-retro-handhelds/)

## Feature Dependencies

```
[Dark Theme Foundation]
    └──requires──> [Color Palette Definition]
                       └──requires──> [WCAG Contrast Testing]

[Scanline Overlay]
    └──conflicts──> [Excessive Noise/Grain] (visual clutter)
    └──requires──> [WCAG Contrast Testing] (preserve readability)

[Typography System]
    └──requires──> [Font Licensing] (Minerva Modern commercial)
    └──enhances──> [Visual Hierarchy]

[Slowly Spinning Elements]
    └──requires──> [prefers-reduced-motion Implementation]
    └──enhances──> [Decorative Graphical Elements]

[Modal Transitions]
    └──requires──> [Animation Duration Standards] (200-300ms)
    └──conflicts──> [Full-Screen Page Transitions] (philosophy clash)

[Phosphor Glow Effect]
    └──requires──> [GPU Acceleration] (text-shadow performance)
    └──enhances──> [Typography System]

[CRT Bezel Frame]
    └──requires──> [Responsive Design] (maintain on all breakpoints)
    └──enhances──> [Scanline Overlay]

[Loading States]
    └──requires──> [Themed Component Styling]
    └──enhances──> [User Experience]
```

### Dependency Notes

- **Dark Theme requires Color Palette:** Can't implement dark mode without defined color variables; palette must be validated for WCAG contrast before use
- **Scanline Overlay conflicts with Excessive Noise:** Layering multiple texture effects creates visual clutter and performance issues; choose one or keep grain very subtle
- **Scanline Overlay requires WCAG Testing:** Overlays reduce effective contrast; must test with overlay enabled to ensure 4.5:1 minimum
- **Slowly Spinning Elements require prefers-reduced-motion:** Animation is a differentiator but must be disabled for users with motion sensitivity; not optional
- **Modal Transitions conflict with Full-Screen Transitions:** Design philosophy is "accent-only motion"; page-wide animations contradict this principle
- **Typography System requires Font Licensing:** Minerva Modern is commercial (Adobe Fonts or MyFonts); must secure license before production deployment
- **Phosphor Glow requires GPU Acceleration:** `text-shadow` with multiple shadows can be expensive; ensure `transform` or `will-change` triggers GPU layer

## MVP Definition

### Launch With (v1)

Minimum viable themed design — what's needed to establish CRT identity.

- [x] **Dark theme foundation** — Essential for CRT aesthetic; already standard in modern web
- [x] **Color palette definition** — 5 colors already specified; implement as CSS variables/Tailwind tokens
- [ ] **Scanline overlay** — Defining CRT visual; simple CSS repeating gradient
- [ ] **Typography system (free fonts only)** — Start with Audiowide (headlines), Space Mono (data), VT323 (system); defer Minerva Modern until licensing secured
- [ ] **WCAG contrast validation** — Test all text/UI components with scanlines enabled; fix failures
- [ ] **Focus indicators** — Enhanced `:focus-visible` styling in theme colors
- [ ] **Responsive design** — Maintain retro aesthetic on mobile/tablet/desktop
- [ ] **`prefers-reduced-motion` implementation** — Disable animations for users with motion sensitivity

**Rationale:** These features establish the core CRT identity (scanline, dark theme, typography) while meeting accessibility requirements (contrast, focus, reduced motion). Defers complex effects and commercial fonts until foundation is validated.

### Add After Validation (v1.x)

Features to add once core identity is working and user feedback collected.

- [ ] **Phosphor glow effect** — Subtle `text-shadow` on key text elements
- [ ] **Slowly spinning decorative elements** — Stars, asterisks with 20-40s rotation
- [ ] **TV guide grid backgrounds** — Rounded rectangle patterns at varying opacity
- [ ] **Concentric circle motifs** — Bullseye shapes in hero sections or page breaks
- [ ] **Subtle CRT bezel frame** — Container styling with rounded corners + shadow
- [ ] **Modal transitions** — Svelte transitions for How to Play, results screens
- [ ] **Loading states (themed)** — Skeleton screens or spinners with CRT styling
- [ ] **Minerva Modern licensing** — Acquire commercial license and integrate as primary font

**Rationale:** These enhance the theme but aren't critical for launch. Spinning elements and glow effects are differentiators but need motion/performance testing. Grid backgrounds and bezel frame add polish but require careful responsive design. Modal transitions improve UX but existing instant modals are functional.

### Future Consideration (v2+)

Features to defer until product-market fit is established and theme is validated.

- [ ] **Light noise/grain texture** — SVG `feTurbulence` at 5% opacity, rasterized for performance
- [ ] **Chromatic aberration accent** — RGB channel separation on hover/focus states
- [ ] **Theme customization** — User-selectable color palettes (amber, green, blue CRT)
- [ ] **Advanced typography pairing** — Additional accent fonts for specific contexts
- [ ] **Animated background elements** — Slow-moving grid lines or scan patterns
- [ ] **Sound design** — CRT startup sound, button clicks (separate milestone)

**Rationale:** Nice-to-have refinements that add depth but aren't core to CRT identity. Noise/grain has performance concerns. Chromatic aberration is subtle and may not be noticed. Theme customization requires design system architecture expansion. Sound design is a separate sensory dimension.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Dark theme foundation | HIGH | LOW | P1 |
| Color palette definition | HIGH | LOW | P1 |
| Scanline overlay | HIGH | LOW | P1 |
| Typography system (free fonts) | HIGH | MEDIUM | P1 |
| WCAG contrast validation | HIGH | MEDIUM | P1 |
| Focus indicators | HIGH | LOW | P1 |
| Responsive design | HIGH | MEDIUM | P1 |
| `prefers-reduced-motion` | HIGH | LOW | P1 |
| Phosphor glow effect | MEDIUM | LOW | P2 |
| Slowly spinning elements | MEDIUM | LOW | P2 |
| TV guide grid backgrounds | MEDIUM | MEDIUM | P2 |
| Concentric circle motifs | MEDIUM | LOW | P2 |
| CRT bezel frame | MEDIUM | MEDIUM | P2 |
| Modal transitions | MEDIUM | MEDIUM | P2 |
| Loading states (themed) | LOW | LOW | P2 |
| Minerva Modern licensing | MEDIUM | HIGH | P2 |
| Noise/grain texture | LOW | MEDIUM | P3 |
| Chromatic aberration | LOW | LOW | P3 |
| Theme customization | LOW | HIGH | P3 |
| Advanced typography | LOW | MEDIUM | P3 |
| Animated backgrounds | LOW | MEDIUM | P3 |

**Priority key:**
- **P1**: Must have for launch — establishes CRT identity + meets accessibility standards
- **P2**: Should have, add when possible — enhances theme, improves UX, nice differentiators
- **P3**: Nice to have, future consideration — polish, advanced features, optional customization

## Design System Patterns for Themed UIs

### Pattern 1: Design Tokens for Theming

**What:** Centralize all theme values (colors, spacing, shadows, typography) in a single configuration file that can be consumed by CSS variables or framework config.

**When:** Essential for any themed design system; enables consistency and rapid iteration.

**Example (Tailwind CSS 4):**
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        'crt-amber': '#faa622',
        'crt-yellow': '#ffe52c',
        'crt-cyan': '#7fe6ef',
        'crt-lime': '#c4d70c',
        'crt-red': '#c22303',
        'crt-black': '#1a1a1a',
        'crt-white': '#f5f0e8',
      },
      fontFamily: {
        'headline': ['Audiowide', 'sans-serif'],
        'body': ['Space Mono', 'monospace'],
        'data': ['VCR OSD Mono', 'monospace'],
        'system': ['VT323', 'monospace'],
      },
    },
  },
}
```

**Complexity:** LOW
**Sources:**
- [Tailwind CSS Best Practices 2025-2026: Design Tokens (Frontend Tools)](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns)
- [Accelerating Themeable Design Systems with shadcn/ui (Perpetual)](https://www.perpetualny.com/blog/accelerating-themeable-design-systems-with-shadcn-ui-a-step-by-step-guide)

### Pattern 2: CSS-Only GPU-Accelerated Effects

**What:** Use CSS `transform`, `opacity`, and `filter` properties (not layout properties like `width`/`top`/`left`) to trigger GPU acceleration and achieve 60fps animations.

**When:** Any animation or visual effect that needs to be performant on mobile devices.

**Example:**
```css
/* GPU-accelerated scanlines */
.crt-scanlines::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  will-change: transform; /* GPU layer hint */
}

/* GPU-accelerated spinning */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning-element {
  animation: rotate 30s linear infinite;
  will-change: transform;
}
```

**Complexity:** LOW
**Sources:**
- [CSS GPU Animation: Doing It Right (Smashing Magazine)](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)
- [Improving HTML5 App Performance with GPU Accelerated CSS Transitions (Urban Insight)](https://www.urbaninsight.com/article/improving-html5-app-performance-gpu-accelerated-css-transitions)
- [Updates in hardware-accelerated animation capabilities (Chrome Developers)](https://developer.chrome.com/blog/hardware-accelerated-animations)

### Pattern 3: Layered Accessibility (Progressive Enhancement)

**What:** Implement accessibility features as layers that don't interfere with visual design — focus indicators, reduced motion, high contrast — so themed design is accessible by default.

**When:** All themed UIs; accessibility isn't optional.

**Example:**
```css
/* Default: spinning animation */
.decorative-star {
  animation: rotate 30s linear infinite;
}

/* Respect user preference: disable animation */
@media (prefers-reduced-motion: reduce) {
  .decorative-star {
    animation: none;
  }
}

/* Enhanced focus indicator in theme colors */
*:focus-visible {
  outline: 2px solid var(--crt-yellow);
  outline-offset: 2px;
  box-shadow: 0 0 8px rgba(255, 229, 44, 0.5);
}
```

**Complexity:** LOW
**Sources:**
- [prefers-reduced-motion CSS Media Feature (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Reducing Motion to Improve Accessibility (a11y with Lindsey)](https://www.a11ywithlindsey.com/blog/reducing-motion-improve-accessibility/)
- [How To Design Useful and Usable Focus Indicators (Deque)](https://www.deque.com/blog/give-site-focus-tips-designing-usable-focus-indicators/)

## Competitor Feature Analysis

Analysis of successful retro/themed game and web designs:

| Feature | Shovel Knight (game) | Alien: Isolation (game) | Lost in Space (website) | Our Approach (Screendle) |
|---------|---------------------|------------------------|------------------------|--------------------------|
| **Retro aesthetic** | 8-bit pixel art | Cassette Futurism UI | Neon grids + pixelated fonts | CRT scanlines + warm amber palette |
| **Modern UX** | Contemporary UI/menus | Clean readable overlays | Smooth transitions | Modal-only transitions, no full-page |
| **Accessibility** | Modern options menu | Subtitle support | Unknown | WCAG contrast, focus indicators, reduced motion |
| **Typography** | Single pixel font | Monospace data displays | Arcade-style fonts | 4-font system: Minerva Modern + 3 accents |
| **Motion design** | Minimal animation | Slow panning, subtle flicker | Unknown | Accent-only: slow spinning decorative elements |
| **Color palette** | Limited 8-bit colors | Beige, amber, green CRT | Neon cyan, magenta | Warm amber/yellow + cyan/lime accents |
| **Performance** | Native app | Native app | Web (unknown stack) | CSS-only effects, GPU-accelerated, mobile-first |

**Key Insights:**
- Successful retro designs **don't replicate frustrating limitations** of old tech (Shovel Knight: modern UI despite 8-bit graphics)
- **Readability trumps authenticity** (Alien: Isolation: clean overlays despite retro aesthetic)
- **Motion should be subtle and purposeful** (not constant distraction)
- **Modern web expectations still apply** (responsive, accessible, performant)

**Sources:**
- [The Modern Retro Mistakes of Game Developers (Super Jump Magazine)](https://www.superjumpmagazine.com/the-modern-retro-mistakes-of-game-dev/)
- [30 Unique Retro Website Designs Inspired By The Past (Really Good Designs)](https://reallygooddesigns.com/retro-website-designs/)
- [Cassette Futurism aesthetic (Aesthetics Wiki)](https://aesthetics.fandom.com/wiki/Cassette_Futurism)

## Implementation Complexity Assessment

### LOW Complexity (1-2 hours each)
- Dark theme foundation (Tailwind utilities)
- Color palette definition (CSS variables)
- Scanline overlay (CSS `repeating-linear-gradient`)
- Focus indicators (CSS `:focus-visible`)
- `prefers-reduced-motion` (CSS media query)
- Phosphor glow effect (`text-shadow`)
- Slowly spinning elements (`@keyframes rotate`)
- Rounded asterisk/star elements (Unicode or SVG)
- Concentric circle motifs (CSS borders or SVG)

### MEDIUM Complexity (4-8 hours each)
- Typography system (font sourcing, integration, hierarchy definition)
- WCAG contrast validation (testing with tools, fixing failures)
- Responsive design (breakpoint testing, layout adjustments)
- TV guide grid backgrounds (CSS Grid positioning, opacity variations)
- CRT bezel frame (multiple `box-shadow` layers, gradient tuning)
- Modal transitions (Svelte transition directives, easing curves)
- Noise/grain texture (SVG generation, rasterization for performance)

### HIGH Complexity (16+ hours each)
- Minerva Modern licensing (procurement process, legal review, payment)
- Theme customization system (architecture for swappable palettes, user preferences, local storage)
- Advanced animated backgrounds (performance optimization, canvas/WebGL investigation)
- Chromatic aberration on interactions (event handling, performance testing)

## Cross-Browser and Performance Notes

### Browser Support (2026)
- **Scanlines (CSS gradients)**: Universal support; IE11 and below excluded
- **`prefers-reduced-motion`**: Chrome 74+, Firefox 63+, Safari 10.1+, mobile browsers
- **CSS Grid**: Universal support; IE11 has partial support with prefixes
- **`text-shadow` (multiple)**: Universal support
- **`will-change`**: Chrome 36+, Firefox 36+, Safari 9.1+; mobile support good
- **SVG filters (`feTurbulence`)**: Universal but CPU-heavy; rasterize for production

### Performance Considerations
- **Mobile GPU limitations**: Test spinning animations on mid-range Android; reduce complexity if jank detected
- **Scanline overlay**: Negligible performance impact (pseudo-element with GPU-accelerated layer)
- **Multiple `text-shadow`**: Can be expensive with many shadows; limit to 2-3 per element
- **SVG noise**: CPU-intensive; convert to WebP/AVIF raster image for production use
- **Modal transitions**: Svelte transitions are performant; keep duration ≤300ms

**Sources:**
- [Guide: Shaders and Overlays on Retro Handhelds (Retro Game Corps)](https://retrogamecorps.com/2024/09/01/guide-shaders-and-overlays-on-retro-handhelds/)
- [Creating Grainy CSS Backgrounds Using SVG Filters (freeCodeCamp)](https://www.freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/)

## Gaps and Open Questions

### Resolved Through Research
- ✓ **CSS vs WebGL for effects**: CSS-only approach validated; WebGL adds complexity without value for this project
- ✓ **Animation performance on mobile**: GPU-accelerated `transform` properties confirmed performant; avoid layout animations
- ✓ **Accessibility with overlays**: WCAG testing with scanlines enabled is critical; several dark themes fail contrast
- ✓ **Typography licensing**: Minerva Modern is commercial; free alternatives (Audiowide, Space Mono) available for MVP

### Remaining Questions (to validate during implementation)
- **Scanline opacity threshold**: What opacity preserves CRT feel without compromising readability? (Test: 10%, 15%, 20%)
- **Spinning element speed**: 20s, 30s, or 40s rotation cycle? (User testing for "calming" vs "distracting")
- **CRT bezel visibility**: Should bezel be visible on mobile, or desktop-only? (Responsive design decision)
- **Phosphor glow intensity**: How much `text-shadow` blur before it looks "wrong"? (A/B test subtle vs moderate)
- **Modal transition duration**: 200ms, 250ms, or 300ms? (UX testing for perceived speed vs smoothness)

### Future Research Flags
- **Phase 2+**: If theme customization pursued, research Tailwind CSS 4 multi-theme architecture patterns
- **Phase 2+**: If sound design pursued, research Web Audio API for CRT startup sound effects
- **Phase 3+**: If animated backgrounds pursued, research Canvas performance on low-end mobile devices

---

## Summary

**Table Stakes (8 features):** Establish core CRT identity and meet modern web standards — scanlines, dark theme, typography, contrast, focus, responsive, reduced motion. **These are non-negotiable for launch.**

**Differentiators (9 features):** Set Screendle apart from generic retro designs — spinning elements (unique motion signature), phosphor glow (authentic detail), TV guide grids (specific to Cassette Futurism), bezel frame (hints at physical TV). **These create distinctive identity.**

**Anti-Features (8 features):** Explicitly avoid common mistakes — constant flickering (accessibility violation), heavy WebGL (performance), full-page transitions (contradicts motion philosophy), kitschy TV frame (not classy), over-saturated neon (wrong aesthetic). **These prevent scope creep and UX problems.**

**Implementation path:** Start with P1 features (8 items, ~LOW-MEDIUM complexity) to establish foundation. Add P2 features (8 items) after validation. Defer P3 features (5 items) until product-market fit confirmed.

**Key insight from research:** Modern retro designs succeed when they **capture the aesthetic without replicating the limitations**. Screendle should feel like playing on a warm CRT TV, but with the usability, accessibility, and performance expectations of a modern web app.

---

*Feature research for: Screendle CRT-Retro TV Visual Design System*
*Researched: 2026-02-27*
