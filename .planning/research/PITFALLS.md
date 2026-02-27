# Pitfalls Research

**Domain:** CRT-retro themed design system for SvelteKit game app
**Researched:** 2026-02-27
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Accessibility Violations from Visual Effects

**What goes wrong:**
Scanline overlays, CRT flicker effects, and phosphor glow reduce text contrast below WCAG AA (4.5:1 for normal text, 3:1 for large text). Continuous spinning animations and flickering trigger vestibular disorders affecting 70+ million people. Photosensitive epilepsy can be triggered by flickering CRT effects.

**Why it happens:**
Developers prioritize aesthetic authenticity over usability. "Make it look like a real CRT" mentality leads to implementing realistic flickering, heavy scanlines, and constant motion without testing contrast or considering motion sensitivities.

**How to avoid:**
1. Test all text with scanline overlays using contrast checkers — ensure WCAG AA minimum (4.5:1)
2. Implement `prefers-reduced-motion` media query from day one — disable all spinning decorative elements and transitions when set
3. Never add constant flickering effects (realistic CRT flicker is a readability killer)
4. Use text-shadow/glow strategically: according to WCAG, glow halos can count as background for contrast measurement if they maintain 4.5:1 ratio with actual background
5. Provide explicit motion toggle in UI (beyond OS-level preference) for user control

**Warning signs:**
- Text becomes hard to read when scanlines are active
- Users report eye strain or discomfort after 2-3 minutes of use
- Flickering is visible in recordings/screenshots
- Contrast checker fails when measuring text over scanline pseudo-elements
- No `@media (prefers-reduced-motion: reduce)` blocks in CSS

**Phase to address:**
Phase 1: Foundation — establish accessibility rules before implementing any visual effects. Test contrast early, implement prefers-reduced-motion from start.

---

### Pitfall 2: Tailwind JIT Tree-Shaking Kills Dynamic Theme Classes

**What goes wrong:**
Custom CRT theme classes (e.g., decorative elements with dynamic opacity variations, rotating elements with computed transform values) get purged during build. Design system classes defined in components don't appear in production CSS because Tailwind JIT compiler doesn't detect usage in node_modules or dynamically constructed class names.

**Why it happens:**
Tailwind's JIT compiler only includes classes it finds via static analysis. When theme classes are: (a) in separate component libraries, (b) constructed dynamically (`class="${baseClass}-${variant}"`), or (c) conditionally applied via JavaScript, they're invisible to the compiler and get tree-shaken.

**How to avoid:**
1. List ALL theme classes statically somewhere in the app — even if just in a safelist comment
2. Configure `content` paths in Tailwind config to scan component library files in node_modules
3. Never construct class names dynamically — use complete class strings in ternaries: `class={isActive ? 'rotate-slow opacity-80' : 'opacity-40'}`
4. For retro palette colors (amber, yellow, cyan, lime, deep-red), add explicit safelist entries for all variants (bg-, text-, border-, from-, to-)
5. Test production build early and often — dev mode doesn't tree-shake

**Warning signs:**
- Styles work in dev (`npm run dev`) but disappear in production build
- Custom retro theme colors render as default Tailwind colors
- Decorative spinning elements lose animation classes
- Grid backgrounds with varying yellow opacities all render at same opacity
- Console shows class names in HTML but no matching CSS rules

**Phase to address:**
Phase 1: Foundation — configure Tailwind content paths and safelist before adding any custom classes. Verify production build after each new theme token addition.

---

### Pitfall 3: Scope Creep from "Just One More Visual Element"

**What goes wrong:**
Initial scope is "CRT color palette + scanlines + bezel" but expands to animated starfield backgrounds, parallax scrolling, particle effects, sound design, full screen transitions, illustrated TV frame, VHS tape rewind animations. Original 2-week design milestone becomes 6-week scope with half-shipped features.

**Why it happens:**
Retro aesthetics are inherently nostalgic and fun to implement. Each new effect feels small ("just add some stars") but compounds. No clear boundaries between "core visual identity" and "nice-to-have decorations." Design references (Cassette Futurism aesthetic, retro UI libraries) showcase fully-realized systems, creating pressure to match that polish.

**How to avoid:**
1. Define explicit "out of scope" list upfront (see PROJECT.md) — revisit before each phase
2. Categorize all visual elements as Foundation (must-have), Enhancement (nice-to-have), or Future (post-MVP)
3. Limit decorative motion to ONE pattern: slowly spinning elements only, no parallax/particles/page transitions
4. Set hard constraint: all effects must be CSS-only (no canvas/WebGL) — creates natural scope boundary
5. Time-box implementation: if a single effect takes >4 hours, it's too complex for this phase

**Warning signs:**
- GitHub issues accumulate faster than they close
- Conversations shift from "implement palette" to "should stars pulse or just rotate?"
- Multiple animation libraries appear in package.json
- Requests for sound effects or custom cursor shapes
- "It would be cool if..." sentences increasing in frequency

**Phase to address:**
Phase 0: Planning — lock scope before starting implementation. Create explicit decision log for "no" items with rationale to prevent re-adding later.

---

### Pitfall 4: Performance Death by a Thousand Visual Effects

**What goes wrong:**
Scanlines (repeating-linear-gradient on every component) + phosphor glow (multiple text-shadows) + noise texture (SVG filter) + slow rotation (transform) + grain overlay combine to cause: dropped frames on mobile, battery drain, layout thrashing, high CPU usage even on idle screens.

**Why it happens:**
Each individual effect benchmarks fine in isolation. Scanlines are just a pseudo-element, glow is hardware-accelerated text-shadow, rotation uses transform. But layering 5+ effects per component creates cumulative GPU/CPU load that only shows under real-world usage (mobile devices, multiple browser tabs, older hardware).

**How to avoid:**
1. Apply effects selectively, not globally — scanlines on main container only, not every card/button
2. Use `will-change` sparingly (only on actively animating elements) — overuse prevents GPU optimization
3. Animate `transform` and `opacity` only (GPU-accelerated), never animate gradient colors or background-position without transform wrapper
4. For repeating-linear-gradient scanlines: use oversized gradient with background-position animation, not color animation
5. Test on mobile (actual devices, not just browser devtools) from day one
6. Use Chrome DevTools Performance tab to profile: target 60fps (16ms per frame), watch for layout thrashing

**Warning signs:**
- Scrolling feels janky (missed frames visible)
- Mobile devices get warm after 5 minutes of use
- Chrome DevTools Performance shows >16ms frames
- CSS Custom Properties cause DevTools to freeze (known Chrome issue with excessive variables)
- Users with 2+ tabs open report slowdowns

**Phase to address:**
Phase 2: Polish — after core theme is implemented, run performance audit. Add effects incrementally with benchmarking between each addition.

---

### Pitfall 5: Font Loading Destroys Initial Experience

**What goes wrong:**
Minerva Modern (6 weights) + Audiowide + VCR OSD Mono + Space Mono = 10+ font files totaling 500KB+. Users see FOIT (Flash of Invisible Text) for 3+ seconds on slow connections, or jarring FOUT (Flash of Unstyled Text) with massive layout shifts when retro fonts load and fallbacks swap out.

**Why it happens:**
Retro typography requires specialized fonts not available in system stacks. Multiple fonts across weights/styles create large download overhead. Default browser font-loading behavior (FOIT in Safari/IE, FOUT in Chrome/Firefox) punishes users on slow networks. Cumulative Layout Shift penalty from font swaps isn't tested until production.

**How to avoid:**
1. Use `font-display: swap` to prevent FOIT — show fallback text immediately, swap when ready
2. Subset fonts aggressively — only include characters/weights actually used (Latin basic if possible)
3. Preload critical fonts (Minerva Modern Regular for body text) with `<link rel="preload" as="font">`
4. Size fallback fonts to match retro fonts — adjust line-height/letter-spacing to minimize layout shift
5. Load accent fonts (VCR OSD Mono, Audiowide) asynchronously — they're decorative, not critical
6. Consider WOFF2 only (drops old browser support but 30% smaller than TTF/OTF)
7. For Minerva Modern (commercial font): verify license allows web embedding and self-hosting

**Warning signs:**
- Text is invisible for >500ms on page load
- Layout shifts noticeably when fonts load
- Lighthouse reports poor CLS (Cumulative Layout Shift) score
- Font file requests block page rendering (synchronous loads)
- Network tab shows 300KB+ font downloads

**Phase to address:**
Phase 1: Foundation — configure font loading strategy before applying fonts to components. Test on throttled network (slow 3G) from start.

---

### Pitfall 6: Nested CSS Variable Chains Break Maintainability

**What goes wrong:**
CRT theme tokens reference shadcn-svelte tokens which reference Tailwind utilities: `--crt-glow-color: var(--accent-foreground)` → `--accent-foreground: var(--color-accent-foreground)` → `oklch(...)`. Adding retro palette (amber, yellow, cyan) creates parallel token systems. Changing a color requires updates in 4+ places. Tokens reference each other in circles. Chrome DevTools freezes with excessive nested variables.

**Why it happens:**
Attempting to "properly" layer theme tokens following design system best practices, but shadcn-svelte already has a token system, Tailwind has utilities, and CRT theme needs its own palette. Trying to make everything reference everything else for "flexibility" creates token spaghetti.

**How to avoid:**
1. Keep retro palette as flat, independent tokens — don't try to map to shadcn semantic tokens
2. Limit token nesting to 2 levels max: `--crt-amber: oklch(...)` → `bg-[var(--crt-amber)]`
3. Document token hierarchy in comments — which tokens are sources vs references
4. For theme-specific colors (amber, yellow, cyan), define once in :root, reference directly
5. Don't override shadcn tokens unless necessary — keep CRT theme as additive layer
6. Known issue: Chrome DevTools freezes with excessive CSS custom properties — minimize total token count

**Warning signs:**
- Changing one color requires hunting through 5+ files
- Can't remember which token references which
- Circular dependencies: `--a` references `--b`, which references `--a`
- Chrome DevTools Styles panel freezes or lags when opened
- Multiple token files with overlapping/conflicting definitions

**Phase to address:**
Phase 1: Foundation — establish token architecture upfront. Create single source of truth file (e.g., `crt-theme.css`) with all retro palette tokens, import once in app.css.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline styles for one-off retro effects | Fast prototyping, no class naming | Unmaintainable, defeats design system, can't reuse | Acceptable in early prototyping only — must refactor to utility classes before Phase 1 complete |
| Hard-coded color values instead of CSS variables | No token setup needed | Impossible to theme, breaking changes when palette evolves | Never — always use CSS custom properties even for "one-off" colors |
| Skipping `prefers-reduced-motion` "to ship faster" | Saves 30 minutes of implementation | Accessibility violation, excludes users with vestibular disorders | Never — required for WCAG compliance |
| Using all 6 Minerva Modern weights | Maximum typography flexibility | 300KB+ font download, slow page loads, FOUT/FOIT issues | Acceptable only if: (a) fonts are subsetted, (b) preloaded strategically, (c) measured CLS <0.1 |
| Applying scanlines globally to all components | Consistent retro aesthetic everywhere | Performance degradation (repeating-linear-gradient on 50+ elements), hard to disable selectively | Never — apply to container level only, not per-component |
| Copy-pasting shadcn components and modifying directly | Quick visual customization | Loses upstream updates, forks component library, maintenance nightmare | Never — use Tailwind utility overrides or CSS variable theming instead |

---

## Integration Gotchas

Common mistakes when connecting to external services/libraries.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| shadcn-svelte theming | Modifying component source files directly to add retro classes | Override via Tailwind utilities in consuming components OR extend CSS variables in app.css — never edit node_modules |
| Tailwind CSS 4 | Using deprecated `@apply` directives for retro theme (no longer supported in v4) | Use `@theme inline` for custom tokens OR direct utility classes — `@apply` is removed in Tailwind v4 |
| Adobe Fonts (Minerva Modern) | Embedding via JavaScript kit (slow, FOIT, blocks rendering) | Self-host WOFF2 files (requires commercial license), use `font-display: swap`, preload critical weights |
| Google Fonts (Audiowide, VCR OSD Mono) | Default `<link>` import loads all weights/variants | Use Fonts API with `&display=swap` param, specify only needed weights: `?family=Audiowide&display=swap` |
| CSS repeating-linear-gradient (scanlines) | Animating gradient colors directly (CPU-heavy) | Use oversized gradient + animate `background-position` with `transform: translateZ(0)` for GPU acceleration |
| Svelte 5 reactivity | Using stores for theme state when CSS variables would suffice | Theme colors should be CSS variables, not reactive stores — only use stores for user preferences (motion enabled/disabled) |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Repeating-linear-gradient on every element | Smooth on desktop Chrome, janky on mobile | Apply scanlines to single container pseudo-element, not per-component | 20+ elements with scanlines OR single mobile device |
| Multiple text-shadow layers for phosphor glow | Looks great on high-end GPUs, kills old laptops | Limit to 2 shadows max, apply only to headings (not body text) | 50+ glowing elements OR integrated graphics |
| Slow rotation animations without `will-change` | Works fine with 1-2 elements, stutters at scale | Use `will-change: transform` on rotating elements, remove when animation ends | 10+ simultaneously rotating elements |
| Unoptimized retro font files | 500KB fonts load fine on fiber, timeout on 3G | Subset fonts (Latin only), use WOFF2, preload critical, async load decorative | User on slow connection (>2s download) |
| SVG noise filter over entire viewport | Subtle grain looks good, kills frame rate | Use low-opacity PNG noise background (CSS `background-image`), not SVG `feTurbulence` | Any mobile device OR viewport >1920px |
| CSS custom property recalculation on scroll | Theme changes responsive, but janky scrolling | Never change CSS variables on scroll — pre-calculate values, use classes | Any scrolling with variable updates |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Loading retro fonts from untrusted CDNs | MITM attacks, tracking, privacy violations | Self-host all fonts OR use official Google Fonts/Adobe Fonts CDN with SRI (Subresource Integrity) |
| Inline styles from user input (if theming is user-customizable) | XSS via CSS injection (e.g., `background: url('javascript:...')`) | Never allow user-provided CSS — only predefined theme options from safelist |
| Exposing commercial font license in client-side code | License violations, legal risk if Minerva Modern license is visible | Verify Minerva Modern license allows web use, host fonts securely, don't commit license files to public repo |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Scanlines too dense/opaque | Text becomes unreadable, users strain to read | Use 2px spacing minimum, max 10% opacity, test with real content (not Lorem Ipsum) |
| Constant spinning decorations everywhere | Motion sickness, cognitive overload, "too busy" feeling | Limit to 2-3 slowly rotating elements as focal points, respect `prefers-reduced-motion` |
| Authentic CRT flicker/distortion | Eye strain, headaches, accessibility violations | Skip flicker entirely — use static texture/scanlines for retro feel without discomfort |
| Retro fonts for all text (body copy included) | Reduced readability, slower reading speed | Modern sans-serif (Minerva Modern) for body, retro fonts (Audiowide, VCR OSD) for headings/accents only |
| Overly aggressive CRT bezel/frame | Reduces usable screen space, feels claustrophobic on mobile | Subtle gradient bezel on desktop, remove entirely on mobile (<768px) |
| No visual hierarchy (everything glows) | Users can't distinguish important UI from decoration | Reserve phosphor glow for interactive elements (buttons, links), not static text |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Retro color palette:** Often missing dark mode variants — verify all 5 colors (amber, yellow, cyan, lime, deep-red) have dark theme equivalents
- [ ] **Scanline effect:** Often missing GPU acceleration — verify `transform: translateZ(0)` or `will-change` is applied
- [ ] **Custom fonts:** Often missing `font-display: swap` — verify all @font-face declarations include display property
- [ ] **Spinning animations:** Often missing `prefers-reduced-motion` fallback — verify `@media (prefers-reduced-motion: reduce)` disables animation
- [ ] **Theme tokens:** Often missing documentation — verify token hierarchy is documented (which tokens are sources vs references)
- [ ] **Mobile optimization:** Often missing bezel/effect removal — verify heavy effects disabled on mobile viewports
- [ ] **Production build:** Often missing Tailwind safelist — verify custom classes appear in production CSS (`npm run build && preview`)
- [ ] **Accessibility:** Often missing contrast verification — verify all text + scanlines passes WCAG AA (4.5:1 minimum)
- [ ] **Font licensing:** Often missing commercial license verification — verify Minerva Modern license allows web embedding
- [ ] **Performance benchmarking:** Often missing mobile device testing — verify 60fps on actual mobile device (not emulator)

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Tailwind classes purged in production | LOW | Add missing classes to safelist in Tailwind config, rebuild, verify in production preview |
| Accessibility violations (contrast/motion) | MEDIUM | Audit all text with contrast checker, implement `prefers-reduced-motion`, reduce scanline opacity, test with screen reader |
| Performance degradation | MEDIUM-HIGH | Profile with Chrome DevTools Performance tab, identify bottleneck (scanlines/shadows/fonts), remove effects incrementally until 60fps restored |
| Scope creep (too many visual effects) | HIGH | Audit against original PROJECT.md scope, categorize effects as Foundation/Enhancement/Future, cut everything in "Future" category |
| Font loading FOIT/FOUT | LOW-MEDIUM | Add `font-display: swap`, preload critical fonts, subset fonts, measure CLS, adjust fallback font sizing |
| Nested CSS variable chaos | HIGH | Refactor to flat token structure, create single source of truth file (`crt-theme.css`), document token hierarchy, remove circular references |
| Component library conflicts (shadcn) | MEDIUM | Stop modifying node_modules, use Tailwind utility overrides instead, document all shadcn customizations in separate file |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Accessibility violations | Phase 1: Foundation | Contrast checker shows 4.5:1+ for all text, `prefers-reduced-motion` tested manually |
| Tailwind tree-shaking | Phase 1: Foundation | Production build (`npm run build`) includes all custom retro classes |
| Scope creep | Phase 0: Planning | PROJECT.md "Out of Scope" section locked, decision log tracks all "no" items |
| Performance degradation | Phase 2: Polish | Chrome DevTools shows 60fps during scroll/interaction, mobile device testing confirms |
| Font loading issues | Phase 1: Foundation | Network throttled to slow 3G, fonts load with swap (no invisible text), CLS <0.1 |
| CSS variable nesting | Phase 1: Foundation | Token hierarchy documented, Chrome DevTools Styles panel doesn't freeze, changes require <3 file edits |
| Component library conflicts | Phase 1: Foundation | No modified files in node_modules, all shadcn overrides via Tailwind utilities or CSS variables |

---

## Sources

**Accessibility & Motion:**
- [Design accessible animation and movement](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) — 70M+ people affected by vestibular disorders, prefers-reduced-motion best practices
- [Retro CRT terminal screen in CSS + JS](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh) — Realistic scanline patterns cause eye strain and flickering
- [prefers-reduced-motion - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — Official spec and implementation guidance
- [WebAIM: Contrast and Color Accessibility](https://webaim.org/articles/contrast/) — WCAG contrast requirements (4.5:1 AA, 7:1 AAA)
- [Text-shadow and WCAG compliance discussion](https://github.com/w3c/wcag/issues/98) — Glow halos can count as background for contrast measurement

**Performance:**
- [CSS gradient performance](https://tryhoverify.com/blog/i-wish-i-had-known-this-sooner-about-css-gradient-performance/) — Animate background-position, not colors
- [CSS background animation avoiding high CPU usage](https://medium.com/iporaitech/css-background-animation-avoiding-high-cpu-usage-58947ff50900) — GPU acceleration techniques with transform/will-change
- [Boosting Web Performance With CSS GPU Acceleration](https://www.testmu.ai/blog/css-gpu-acceleration/) — Transform/opacity are GPU-accelerated, others aren't
- [CSS Custom Properties performance issues](https://github.com/primefaces/primevue/issues/8309) — Chrome DevTools freezes with excessive CSS variables (Dec 2025)

**Font Loading:**
- [Optimizing Web Fonts: FOIT vs FOUT vs Font Display Strategies](https://talent500.com/blog/optimizing-fonts-foit-fout-font-display-strategies/) — font-display: swap as recommended default
- [The Ultimate Guide to Font Performance Optimization](https://www.debugbear.com/blog/website-font-performance) — Subset fonts, WOFF2, preload critical, CLS optimization
- [You're loading fonts wrong](https://www.jonoalderson.com/performance/youre-loading-fonts-wrong/) — Common mistakes and best practices

**Tailwind & SvelteKit:**
- [Fix Missing CSS when Using Tailwind to Write a Svelte Component Library](https://adamtuttle.codes/blog/2023/tailwind-svelte-design-system/) — JIT purging solution for component libraries
- [SvelteKit and Tailwind and Colors](https://medium.com/@bneeman/sveltekit-and-tailwind-and-colors-oh-my-d3e0891315d3) — Dynamic class name pitfalls, tree-shaking issues

**Design System Theming:**
- [Theming in Modern Design Systems](https://whoisryosuke.com/blog/2020/theming-in-modern-design-systems) — Token architecture and common pitfalls
- [Pushing at the edges of themes in design systems](https://medium.com/@hereinthehive/pushing-at-the-edges-of-themes-in-design-systems-a8b2e508c69b) — Conditional logic sprawl, maintenance issues
- [An approach to theming Design Systems](https://dev.to/danieldelcore/how-to-approach-theming-a-design-system-5829) — Scope creep, nested theme challenges

**Retro CRT Aesthetics:**
- [Cassette Futurism | Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Cassette_Futurism) — Design philosophy and historical context
- [Using CSS to create a CRT](https://aleclownes.com/2017/02/01/crt-display.html) — Technical implementation of CRT effects
- [Cassette: POSIX application framework](https://github.com/fraawlen/cassette) — Real-world implementation challenges (Unicode support, widget availability)

**General Web Design:**
- [7 Practical Tips for Cheating at Design](https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886) — Visual hierarchy, restraint in effects
- [How to Control Scope Creep in UX Design Projects](https://www.linkedin.com/advice/0/how-do-you-control-scope-creep-ux-design) — Definition, documentation, communication

---
*Pitfalls research for: CRT-retro themed design system for SvelteKit game app*
*Researched: 2026-02-27*
