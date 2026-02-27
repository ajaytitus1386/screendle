# Project Research Summary

**Project:** Screendle CRT-Retro Design System
**Domain:** Themed frontend design system (CRT/Cassette Futurism aesthetic)
**Researched:** 2026-02-27
**Confidence:** HIGH

## Executive Summary

This research examines how to integrate a CRT-retro themed visual design system into Screendle's existing SvelteKit + Tailwind CSS v4 + shadcn-svelte stack. The project already has a functioning game with POC modes (Classic and Scales). The design system will add a distinctive Cassette Futurism visual identity through warm amber/yellow palette, scanline overlays, retro typography, and subtle motion design.

The recommended approach is a **non-destructive theme layer** that enhances existing components without modifying their source code. Using Tailwind CSS v4's `@theme` directive for design tokens, CSS Cascade Layers for precedence control, and decorative Svelte components that wrap game content via slots. This architecture allows the theme to be applied incrementally and potentially toggled or swapped in future. Core technologies are already in place; implementation focuses on CSS configuration and component composition patterns.

Key risks are **accessibility violations** (scanlines reducing contrast, spinning elements triggering motion sensitivity) and **performance degradation** (layering multiple GPU effects). Mitigation requires WCAG contrast testing from day one, mandatory `prefers-reduced-motion` implementation, and selective effect application (container-level scanlines, not per-component). Font licensing for Minerva Modern (commercial) requires verification before production use; free alternatives (Audiowide, Space Mono) provide MVP fallback.

## Key Findings

### Recommended Stack

Modern CSS architecture enables retro aesthetics without legacy limitations. Tailwind CSS v4's CSS-first configuration via `@theme` directive eliminates JavaScript config complexity while exposing all design tokens as CSS variables for runtime theming. All core technologies are already installed (Tailwind v4.1.18, SvelteKit 2.x, Svelte 5.x, shadcn-svelte).

**Core technologies:**
- **Tailwind CSS v4 with @theme directive**: Design token definition in CSS, auto-generates utilities (bg-amber, text-yellow), enables runtime theme switching via CSS variables
- **CSS Cascade Layers (@layer)**: Non-destructive theme application, explicit precedence control (base → components → theme → utilities), safe to overlay on shadcn-svelte
- **Self-hosted WOFF2 fonts**: 30% smaller than WOFF, universal browser support, preload critical fonts, use font-display: swap to prevent FOIT
- **CSS-only effects (repeating-linear-gradient, text-shadow, transform)**: GPU-accelerated, no JavaScript overhead, mobile-performant when applied selectively
- **CSS @property**: Enables gradient animations (registered custom properties can transition), universal browser support as of July 2024

**Critical decisions:**
- Minerva Modern (primary font) is **commercial** — requires Adobe Fonts subscription or MyFonts purchase; license must allow web embedding
- Use Audiowide/Space Mono/VT323 (Google Fonts) as free alternatives for MVP; defer Minerva Modern until licensing secured
- All animations **must** respect `prefers-reduced-motion` — WCAG compliance, not optional

### Expected Features

Eight table stakes features establish core CRT identity and meet modern web standards. Nine differentiators create distinctive visual signature. Eight anti-features explicitly avoided to prevent scope creep and UX problems.

**Must have (table stakes):**
- Scanline overlay — defining CRT visual element (CSS repeating-linear-gradient)
- Cohesive color palette — 5-color warm retro palette (amber, yellow, cyan, lime, deep-red)
- Dark theme foundation — CRT screens are dark by nature
- Typography system — differentiated fonts for headings/body/data
- Responsive design — maintain aesthetic across mobile/tablet/desktop
- WCAG color contrast — 4.5:1 minimum with scanlines enabled
- Focus indicators — keyboard navigation with enhanced styling
- prefers-reduced-motion — disable animations for users with motion sensitivity

**Should have (competitive differentiators):**
- Slowly spinning decorative elements — unique motion signature (20-40s rotation cycles)
- Phosphor glow effect — text-shadow with radial gradient, authentic CRT detail
- TV guide grid backgrounds — rounded rectangles at varying opacity, Cassette Futurism specific
- Subtle CRT bezel frame — rounded corners + shadow hints at physical TV
- Modal-only transitions — scope animation to contained UI changes, avoid disruptive page-wide effects

**Defer (v2+):**
- Light noise/grain texture — performance concerns (SVG feTurbulence is CPU-heavy, must rasterize)
- Chromatic aberration — subtle RGB channel separation on hover/focus
- Theme customization — user-selectable color palettes (amber/green/blue CRT modes)
- Sound design — CRT startup sound, button clicks (separate sensory dimension)

**Explicitly avoid (anti-features):**
- Constant CRT flickering/distortion — causes eye strain, headaches, accessibility violation
- Heavy WebGL/Canvas effects — performance hit, framework conflicts, breaks SSR
- Full-screen page transitions — disruptive, contradicts accent-only motion philosophy
- Literal illustrated CRT TV frame — too kitschy, reduces usable space

### Architecture Approach

The architecture follows a **three-layer design token hierarchy** (Primitive → Semantic → Component) overlaid on existing SvelteKit structure. Theme is applied as non-destructive layer using CSS Cascade Layers, keeping decoration separate from game logic. This enables existing shadcn-svelte components to inherit theme automatically via CSS variable mapping without source code modification.

**Major components:**
1. **Design Token Layer** (`lib/styles/tokens.css`) — Tailwind v4 `@theme` directive defines CRT palette, typography, spacing; maps to shadcn-svelte semantic tokens (--accent, --primary)
2. **Effect Utilities** (`lib/styles/effects.css`, `animations.css`) — Reusable CSS effects (scanlines, phosphor glow, slow rotation) in `@layer theme` for precedence control
3. **Decorative Components** (`lib/components/theme/`) — Svelte wrappers (CRTBezel, ScanlineOverlay, GridBackground) accept game content via slots, purely visual with no game logic coupling
4. **Theme Integration Points** — `+layout.svelte` imports theme CSS once, decorative components wrap pages, existing game components unchanged

**Key patterns:**
- **Non-destructive overlay**: CSS Cascade Layers enable theme to override base components but be overridden by utilities
- **Slot-based decoration**: Decorative components wrap content (`<CRTBezel><GameBoard /></CRTBezel>`) without modifying game logic
- **GPU-accelerated effects**: Use `transform`/`opacity` only (never animate width/height/position), apply `will-change` sparingly to actively animating elements
- **Semantic token mapping**: CRT colors map to shadcn-svelte tokens (--color-amber → --accent), existing buttons/cards automatically adopt theme

### Critical Pitfalls

Top pitfalls from research with prevention strategies:

1. **Accessibility violations from visual effects** — Scanlines reduce text contrast below WCAG AA (4.5:1), spinning animations trigger vestibular disorders (70M+ people affected). **Prevention**: Test all text with contrast checker with scanlines enabled, implement `prefers-reduced-motion` from day one, never add constant flickering, use text-shadow strategically (maintain 4.5:1 with background)

2. **Tailwind JIT tree-shaking kills dynamic theme classes** — Custom CRT classes (decorative elements with opacity variations, rotating elements) get purged during production build. Classes work in dev but disappear in production. **Prevention**: Configure Tailwind `content` paths to scan component library, never construct class names dynamically (use complete strings in ternaries), add custom colors to safelist, test production build early and often

3. **Scope creep from "just one more visual element"** — Initial scope "CRT palette + scanlines + bezel" expands to animated starfield, parallax scrolling, particle effects, sound design. 2-week milestone becomes 6-week scope. **Prevention**: Define explicit "out of scope" list upfront, categorize all elements as Foundation/Enhancement/Future, limit motion to ONE pattern (slow spinning only), set hard constraint (CSS-only effects, no canvas/WebGL), time-box implementation (>4 hours = too complex)

4. **Performance death by a thousand visual effects** — Scanlines + phosphor glow + noise texture + rotation combine to cause dropped frames on mobile, battery drain, layout thrashing. Each effect benchmarks fine in isolation but cumulative GPU/CPU load only shows under real usage. **Prevention**: Apply effects selectively (scanlines on container only, not per-component), use `will-change` sparingly (actively animating elements only), animate `transform`/`opacity` only, test on mobile devices from day one, profile with Chrome DevTools Performance tab (target 60fps)

5. **Font loading destroys initial experience** — Minerva Modern (6 weights) + Audiowide + VCR OSD Mono = 500KB+ font files. Users see FOIT (Flash of Invisible Text) for 3+ seconds on slow connections, or jarring FOUT with massive layout shifts. **Prevention**: Use `font-display: swap` to prevent FOIT, subset fonts aggressively (Latin basic only), preload critical fonts with `<link rel="preload" as="font">`, size fallback fonts to match retro fonts, load accent fonts asynchronously, consider WOFF2 only (30% smaller)

6. **Nested CSS variable chains break maintainability** — CRT tokens reference shadcn tokens which reference Tailwind utilities. Adding retro palette creates parallel token systems. Changing a color requires updates in 4+ places. Chrome DevTools freezes with excessive nested variables. **Prevention**: Keep retro palette as flat independent tokens, limit nesting to 2 levels max, document token hierarchy in comments, define theme-specific colors once in :root and reference directly, don't override shadcn tokens unless necessary

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Design Tokens & Base Effects)
**Rationale:** Establish visual language before any visible implementation. Design tokens are dependency for all other phases. Early WCAG testing prevents costly accessibility refactoring later.

**Delivers:**
- CRT color palette as Tailwind utilities (bg-amber, text-yellow, etc.)
- Typography system with free fonts only (Audiowide, Space Mono, VT323)
- CSS effect utilities (scanlines, phosphor glow, slow rotation)
- Semantic token mapping to shadcn-svelte (existing components adopt theme)
- Accessibility foundation (prefers-reduced-motion, contrast validation, focus indicators)

**Addresses (from FEATURES.md):**
- Cohesive color palette (table stakes)
- Typography system (table stakes, MVP uses free fonts)
- WCAG contrast validation (table stakes)
- Focus indicators (table stakes)
- prefers-reduced-motion implementation (table stakes)

**Avoids (from PITFALLS.md):**
- Accessibility violations (implement WCAG testing from start)
- Tailwind tree-shaking (configure content paths, safelist before adding custom classes)
- Nested CSS variable chains (establish flat token architecture upfront)
- Font loading issues (font-display: swap, preload critical, subset fonts)

**Research flags:** Standard patterns (Tailwind v4 theming is well-documented) — skip deep research.

---

### Phase 2: Decorative Components (Theme Atmosphere)
**Rationale:** Tokens from Phase 1 enable decorative component implementation. Build reusable wrappers (CRTBezel, ScanlineOverlay, GridBackground) that consume effect utilities. Keep decoration separate from game logic via slot-based composition.

**Delivers:**
- CRTBezel.svelte — bezel frame with shadow, scanline overlay
- ScanlineOverlay.svelte — fullscreen scanline texture (global alternative)
- GridBackground.svelte — TV guide grid pattern at varying opacity
- SpinningAsterisk.svelte — decorative corner elements with slow rotation
- ConcentricCircles.svelte — background motif for hero sections

**Uses (from STACK.md):**
- Svelte 5 component patterns (slots for composition)
- CSS Cascade Layers (decorative styles in @layer theme)
- GPU-accelerated animations (transform + will-change)
- Self-hosted fonts from Phase 1

**Implements (from ARCHITECTURE.md):**
- Decorative Component Layer (lib/components/theme/)
- Slot-based decoration pattern
- Non-destructive theme overlay

**Avoids (from PITFALLS.md):**
- Scope creep (build only 5 decorative components, resist additions)
- Performance degradation (apply effects selectively, profile after each component)
- Component library conflicts (never modify shadcn-svelte source)

**Research flags:** Standard patterns (Svelte component composition is well-known) — skip deep research.

---

### Phase 3: Page-Level Integration (Layout Application)
**Rationale:** Decorative components from Phase 2 enable page-level theming. Apply theme to actual game pages, verify responsive design, test cross-browser compatibility.

**Delivers:**
- Themed layout (+layout.svelte imports theme CSS, optional global scanline overlay)
- Landing page with bezel frames and grid backgrounds
- Classic mode game board wrapped in CRTBezel
- Scales mode themed consistently
- How to Play modal with themed styling

**Addresses (from FEATURES.md):**
- Scanline overlay (table stakes)
- Dark theme foundation (table stakes, already exists)
- Responsive design (table stakes, verify theme maintains across breakpoints)
- Slowly spinning decorative elements (differentiator)
- TV guide grid backgrounds (differentiator)
- Subtle CRT bezel frame (differentiator)
- Modal-only transitions (differentiator)

**Avoids (from PITFALLS.md):**
- Scope creep (apply decorative components to existing pages only, no new features)
- Performance degradation (mobile device testing, Chrome DevTools profiling)
- UX pitfalls (scanlines max 10% opacity, limit spinning elements to 2-3 per page)

**Research flags:** Standard patterns (SvelteKit layout composition) — skip deep research.

---

### Phase 4: Polish & Accessibility Audit (Refinement)
**Rationale:** All theme elements implemented, now verify quality and compliance. Performance audit, cross-browser testing, accessibility scan with real tools.

**Delivers:**
- WCAG AA compliance verified (Lighthouse audit, axe DevTools scan)
- Performance benchmarks met (60fps on mobile, <0.1 CLS)
- Cross-browser compatibility confirmed (Chrome, Firefox, Safari)
- Production build verified (all custom classes present)
- Documentation (token hierarchy, component usage)

**Addresses (from FEATURES.md):**
- Loading states (themed skeleton screens or spinners)
- Phosphor glow effect (differentiator, add after core theme validated)

**Avoids (from PITFALLS.md):**
- "Looks done but isn't" (checklist verification)
- Accessibility violations (final audit catches any gaps)
- Performance degradation (final profiling, recovery if needed)

**Research flags:** Standard patterns (Lighthouse/axe auditing is established) — skip deep research.

---

### Phase 5: Commercial Font Integration (Optional)
**Rationale:** Theme fully functional with free fonts. Minerva Modern adds polish but requires commercial license procurement. Defer until license secured or skip entirely if budget constraints.

**Delivers:**
- Minerva Modern license acquired (Adobe Fonts or MyFonts)
- Font files integrated (self-hosted WOFF2 or Adobe Fonts embed)
- Typography system updated (Minerva Modern as primary, existing fonts as fallbacks)
- Font loading optimized (preload, subset, CLS validation)

**Uses (from STACK.md):**
- Adobe Fonts web embed OR self-hosted WOFF2 (licensing determines approach)
- font-display: swap, preload, subsetting

**Avoids (from PITFALLS.md):**
- Font loading issues (FOIT/FOUT prevention)
- Security mistakes (verify license allows web use, don't commit license files to public repo)

**Research flags:** Needs research if pursued — Adobe Fonts licensing terms, font subsetting tools, CLS optimization techniques.

---

### Phase Ordering Rationale

- **Tokens first (Phase 1)** — Foundation dependency for all visual implementation. Early accessibility validation prevents costly late-stage refactoring.
- **Components before pages (Phase 2 → Phase 3)** — Build reusable decorative wrappers in isolation, then compose into page layouts. Separation enables testing and prevents game logic coupling.
- **Polish after implementation (Phase 4)** — Audit and optimize after full theme applied. Performance bottlenecks only visible under complete effect layering.
- **Commercial fonts last (Phase 5)** — Non-blocking, MVP viable with free fonts. License procurement is business process separate from technical implementation.

**Dependency flow:**
```
Phase 1 (Tokens)
    ↓
Phase 2 (Decorative Components — consume tokens)
    ↓
Phase 3 (Page Integration — compose components)
    ↓
Phase 4 (Polish — audit complete system)
    ↓
Phase 5 (Commercial Fonts — enhancement, optional)
```

**Pitfall avoidance strategy:**
- Accessibility violations → Phase 1 foundation prevents
- Tailwind tree-shaking → Phase 1 configuration prevents
- Scope creep → Explicit phase boundaries prevent
- Performance degradation → Incremental Phase 2-3 implementation with profiling catches early
- Font loading issues → Phase 1 free fonts establish pattern, Phase 5 applies to commercial
- CSS variable nesting → Phase 1 flat architecture prevents

### Research Flags

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation)**: Tailwind v4 theming is well-documented, CSS Cascade Layers are standard, WCAG testing tools are established
- **Phase 2 (Decorative Components)**: Svelte 5 component composition is well-known, GPU-accelerated CSS animations are documented
- **Phase 3 (Page Integration)**: SvelteKit layout patterns are standard, responsive design is established practice
- **Phase 4 (Polish)**: Lighthouse/axe DevTools auditing is documented, performance profiling is standard

**Phase likely needing deeper research:**
- **Phase 5 (Commercial Fonts)**: Adobe Fonts licensing terms vary, font subsetting tools have learning curve, web font optimization is nuanced (only if pursued)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core technologies already installed and verified compatible. Tailwind v4 patterns documented in official sources. CSS-only effects have universal browser support. |
| Features | HIGH | Multiple sources confirm table stakes (scanlines, contrast, reduced-motion) and differentiators (spinning elements, glow effects). Anti-features validated via retro design retrospectives. |
| Architecture | HIGH | Three-layer token hierarchy is industry standard. CSS Cascade Layers documented in MDN. Svelte slot patterns verified in official docs. Non-destructive overlay approach proven in shadcn-svelte integration guides. |
| Pitfalls | HIGH | Accessibility violations documented in WCAG sources. Tailwind tree-shaking issues verified in community troubleshooting. Performance traps validated via Chrome DevTools docs. Font loading patterns verified in web.dev articles. |

**Overall confidence:** HIGH

All four research areas have official documentation sources (Tailwind CSS docs, MDN, WCAG, shadcn-svelte theming guide). Community resources corroborate patterns (Smashing Magazine, CSS-Tricks, DEV Community). No reliance on single-source claims or unverified techniques.

### Gaps to Address

**Resolved through research:**
- CSS vs WebGL for effects → CSS-only validated as performant and simpler
- Animation performance on mobile → GPU-accelerated transform properties confirmed
- Typography licensing → Minerva Modern is commercial (Adobe Fonts or MyFonts), free alternatives identified

**Remaining questions (validate during implementation):**

- **Scanline opacity threshold**: What opacity preserves CRT feel without compromising readability? Research suggests 5-15% range. **Validation**: A/B test 10%, 12%, 15% opacity during Phase 1, measure contrast with WCAG tools.

- **Spinning element speed**: 20s, 30s, or 40s rotation cycle for "calming" effect? **Validation**: User testing during Phase 2 with 3 speed variants, gather feedback on "distracting" vs "ambient."

- **CRT bezel visibility on mobile**: Should bezel be visible on mobile, or desktop-only? Research suggests bezel reduces usable space on small screens. **Validation**: Responsive design testing in Phase 3, check if bezel feels claustrophobic on <768px viewports.

- **Phosphor glow intensity**: How much text-shadow blur before it looks "wrong"? **Validation**: Phase 4 polish testing with 2-shadow vs 3-shadow variants, verify readability impact.

- **Modal transition duration**: 200ms, 250ms, or 300ms for optimal UX? **Validation**: Phase 3 integration testing, measure perceived speed vs smoothness.

**Future research flags (if scope expands):**
- Phase 2+ theme customization → Research Tailwind CSS 4 multi-theme architecture if user-selectable palettes pursued
- Phase 2+ sound design → Research Web Audio API if CRT startup sound effects pursued
- Phase 3+ animated backgrounds → Research Canvas performance on low-end mobile if complex motion pursued

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) — @theme directive, CSS-first configuration
- [Tailwind CSS Theme Variables](https://tailwindcss.com/docs/theme) — @theme vs @theme inline, utility generation
- [shadcn-svelte Theming Documentation](https://www.shadcn-svelte.com/docs/theming) — Semantic token system
- [shadcn-svelte Tailwind v4 Migration](https://www.shadcn-svelte.com/docs/migration/tailwind-v4) — Integration patterns
- [CSS Cascade Layers - MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers) — Layer syntax and precedence
- [CSS @property - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) — Registered custom properties
- [prefers-reduced-motion - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — Accessibility media query
- [Svelte 5 Transitions](https://svelte.dev/docs/svelte/transition) — Official API reference

**WCAG & Accessibility:**
- [WebAIM: Contrast and Color Accessibility](https://webaim.org/articles/contrast/) — WCAG contrast requirements (4.5:1 AA, 7:1 AAA)
- [Design accessible animation and movement](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) — 70M+ people with vestibular disorders, prefers-reduced-motion best practices
- [WCAG 2.1 Success Criterion 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions) — Animation from interactions

### Secondary (MEDIUM confidence)

**Design Systems & Architecture:**
- [Design Tokens Explained - Contentful](https://www.contentful.com/blog/design-token-system/) — Three-tier token hierarchy (Primitive → Semantic → Component)
- [Mastering CSS Cascade Layers for Design Systems](https://www.designsystemscollective.com/mastering-css-cascade-layers-for-scalable-design-systems-981fdab2a961) — Theme layer architecture, non-destructive overlay patterns
- [Getting Started with CSS Cascade Layers - Smashing Magazine](https://www.smashingmagazine.com/2022/01/introduction-css-cascade-layers/) — Layer ordering best practices

**Performance & GPU Acceleration:**
- [CSS GPU Animation: Doing It Right - Smashing Magazine](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) — Transform + opacity for GPU acceleration
- [Hardware-accelerated animation capabilities - Chrome Developers](https://developer.chrome.com/blog/hardware-accelerated-animations) — Browser GPU capabilities
- [Boosting Web Performance With CSS GPU Acceleration](https://www.testmu.ai/blog/css-gpu-acceleration/) — will-change best practices
- [CSS gradient performance](https://tryhoverify.com/blog/i-wish-i-had-known-this-sooner-about-css-gradient-performance/) — Animate background-position, not colors

**Font Loading:**
- [The Ultimate Guide to Font Performance Optimization - DebugBear](https://www.debugbear.com/blog/website-font-performance) — Subset fonts, WOFF2, preload, CLS optimization
- [Optimizing Web Fonts: FOIT vs FOUT](https://talent500.com/blog/optimizing-fonts-foit-fout-font-display-strategies/) — font-display: swap as default
- [SvelteKit Fontaine: Reduce Custom Font CLS](https://rodneylab.com/sveltekit-fontaine/) — Font loading optimization for SvelteKit

**Retro CRT Effects:**
- [Retro CRT terminal screen in CSS + JS - DEV Community](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh) — Performant scanline implementation, CSS-only approach
- [Using CSS to create a CRT](https://aleclownes.com/2017/02/01/crt-display.html) — Comprehensive CRT effects guide
- [Cassette Futurism | Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Cassette_Futurism) — Design philosophy and historical context

**Pitfalls & Troubleshooting:**
- [Fix Missing CSS with Tailwind Component Library](https://adamtuttle.codes/blog/2023/tailwind-svelte-design-system/) — JIT purging solutions
- [SvelteKit and Tailwind and Colors](https://medium.com/@bneeman/sveltekit-and-tailwind-and-colors-oh-my-d3e0891315d3) — Dynamic class name pitfalls
- [CSS Custom Properties performance issues](https://github.com/primefaces/primevue/issues/8309) — Chrome DevTools freeze with excessive variables (Dec 2025)

### Community Examples (Inspiration)

- [Retro Futuristic UI Design - GitHub](https://github.com/Imetomi/retro-futuristic-ui-design) — CRT effect examples
- [30 Unique Retro Website Designs](https://reallygooddesigns.com/retro-website-designs/) — Typography and color techniques
- [9 New CRT Television Concepts - Accio](https://www.accio.com/blog/new-crt-television-concepts-redefining-retro-tech) — Modern CRT design trends

---

*Research completed: 2026-02-27*
*Ready for roadmap: YES*
