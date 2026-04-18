# Decodificador de Contratos — Design System

> Last updated: 2026-04-17
> Status: Source of truth for all visual and structural patterns

---

## 1. Architecture Overview

**Stack:** Pure HTML + CSS custom properties + vanilla JavaScript
**Naming:** BEM (Block__Element--Modifier)
**Responsive:** Mobile-first, 3 breakpoints
**Icons:** Inline SVG (Lucide-style, `stroke="currentColor"`, `stroke-width="2"`)
**Fonts:** Google Fonts loaded via `<link>` with `display=swap`

### File Structure

```
css/
  tokens.css          — Design tokens (CSS custom properties, single source of truth)
  reset.css           — Modern CSS reset + skip-link + .sr-only
  base.css            — Body defaults, typography, global components (btn, badge, card, icon)
  layout.css          — Container, grid helpers, flex helpers, section spacing
  animations.css      — Scroll-triggered fade-in-up + stagger delays
  components/         — One file per section/block, BEM-scoped
js/
  main.js             — Navbar scroll + mobile menu toggle
  accordion.js        — FAQ one-at-a-time accordion
  animation.js        — IntersectionObserver scroll animations + count-up
  demo.js             — Demo panel sequential highlight
  upload.js           — Drag/drop + file select + progress simulation
  guided-review.js    — Clause expand/collapse + progress bar
```

---

## 2. Design Tokens (`tokens.css`)

### 2.1 Color Palette

| Token                    | Value     | Usage                                |
|--------------------------|-----------|--------------------------------------|
| `--color-primary-50`     | `#eff6ff` | Light blue backgrounds, badge fill   |
| `--color-primary-100`    | `#dbeafe` | Hover states, light borders          |
| `--color-primary-200`    | `#bfdbfe` | Button borders, dividers             |
| `--color-primary-500`    | `#3b82f6` | Focus rings, interactive accents     |
| `--color-primary-600`    | `#2563eb` | Primary buttons, links, active states|
| `--color-primary-700`    | `#1d4ed8` | Button hover                         |
| `--color-primary-800`    | `#1e40af` | Text on light backgrounds            |
| `--color-primary-900`    | `#1e3a5f` | Hero/dark section text, headings     |
| `--color-deep-700`       | `#0f2942` | Dark gradient sections               |
| `--color-deep-800`       | `#0a1f36` | Dark gradient background             |
| `--color-deep-900`       | `#061525` | Deepest dark (hero bottom, footer)   |
| `--color-gold-400`       | `#fbbf24` | Premium accents, keyword highlights  |
| `--color-gold-500`       | `#f59e0b` | Gold hover, emphasis                 |
| `--color-gold-600`       | `#d97706` | Gold text on dark                    |
| `--color-danger-50`      | `#fef2f2` | Critical badge fill                  |
| `--color-danger-500`     | `#ef4444` | Risk indicators, critical borders    |
| `--color-danger-600`     | `#dc2626` | Critical text, danger badge text     |
| `--color-danger-700`     | `#b91c1c` | Deep danger text                     |
| `--color-warning-50`     | `#fffbeb` | Attention badge fill                 |
| `--color-warning-500`    | `#f59e0b` | Attention indicators                 |
| `--color-warning-600`    | `#d97706` | Attention text                       |
| `--color-success-50`     | `#f0fdf4` | Safe/resolved badge fill             |
| `--color-success-500`    | `#22c55e` | Safe indicators, success checkmarks  |
| `--color-success-600`    | `#16a34a` | Safe/resolved text                   |
| `--color-neutral-50`     | `#f8fafc` | Page background, alt section bg      |
| `--color-neutral-100`    | `#f1f5f9` | Hover backgrounds, muted fills       |
| `--color-neutral-200`    | `#e2e8f0` | Borders, dividers                    |
| `--color-neutral-300`    | `#cbd5e1` | Disabled text, subtle dividers       |
| `--color-neutral-400`    | `#94a3b8` | Placeholder text, secondary muted    |
| `--color-neutral-500`    | `#64748b` | Body muted text, descriptions        |
| `--color-neutral-600`    | `#475569` | Secondary text, ghost button text    |
| `--color-neutral-700`    | `#334155` | Body text on white                   |
| `--color-neutral-800`    | `#1e293b` | Strong text                          |
| `--color-neutral-900`    | `#0f172a` | Headings, primary text               |

**Semantic aliases:**

| Token              | Maps to                   | Usage              |
|--------------------|---------------------------|---------------------|
| `--color-bg`       | `--color-neutral-50`      | Page background     |
| `--color-bg-alt`   | `--color-neutral-100`     | Alternating sections|
| `--color-surface`  | `#ffffff`                 | Cards, panels       |
| `--color-text`     | `--color-neutral-900`     | Body text           |
| `--color-text-muted` | `--color-neutral-500`   | Descriptions        |
| `--color-border`   | `--color-neutral-200`     | Default borders     |

**Color usage rules:**
- **Trust blue** (`primary-600`): Primary interactive elements, section labels, links, CTA buttons
- **Deep blue** (`deep-800` → `primary-900`): Hero, dashboard, final CTA dark gradient bookends
- **Gold** (`gold-400/500`): Premium feel, keyword emphasis (the italic word in hero title), accent on trust items
- **Risk palette**: Always `danger` (red) / `warning` (amber) / `success` (green) — never arbitrary colors
- **Neutral grays**: Text hierarchy and borders. Use 50-step jumps for contrast (e.g., `neutral-900` text on `neutral-50` bg)

### 2.2 Typography Scale

| Token              | Size       | Usage                                  |
|--------------------|------------|----------------------------------------|
| `--text-display`   | `3.5rem`   | Hero title only (56px)                 |
| `--text-h1`        | `2.5rem`   | Not currently used in sections         |
| `--text-h2`        | `2rem`     | Section headings (32px)                |
| `--text-h3`        | `1.25rem`  | Card titles, step titles (20px)        |
| `--text-body-lg`   | `1.125rem` | Section subtitles, descriptions (18px) |
| `--text-body`      | `1rem`     | Body text, card descriptions (16px)    |
| `--text-sm`        | `0.875rem` | Buttons, tags, labels (14px)           |
| `--text-xs`        | `0.75rem`  | Badges, format labels, meta text (12px)|

**Font families:**

| Token              | Family                         | Usage              |
|--------------------|--------------------------------|---------------------|
| `--font-heading`   | `"Roboto", "Helvetica Neue", Arial, sans-serif` | All headings, hero title, logo, dashboard nav |
| `--font-body`      | `"Roboto", "Helvetica Neue", Arial, sans-serif` | Body text, buttons, labels, nav |
| `--font-mono`      | `"Roboto Mono", "Courier New", monospace`  | Contract text, clause excerpts      |

**Font weights used:** 400 (body), 500 (nav links, labels), 600 (buttons, headings, labels), 700 (h1, h2, pricing amounts)

**Line heights:** Headings `1.2`, Body `1.65`

**Heading hierarchy in practice:**
- `<h1>` — Hero title only (one per page)
- `<h2>` — Section headings
- `<h3>` — Card titles, step titles, clause titles
- `<h4>` — Sub-sections (footer column titles, demo panel headers)

### 2.3 Spacing Scale

| Token         | Value    | Usage                                    |
|---------------|----------|------------------------------------------|
| `--space-1`   | `0.25rem`| Tight icon gaps, micro padding           |
| `--space-2`   | `0.5rem` | Badge padding, small gaps                |
| `--space-3`   | `0.75rem`| Badge horizontal padding, small margins   |
| `--space-4`   | `1rem`   | Standard padding, text margins            |
| `--space-5`   | `1.5rem` | Container padding (tablet), medium gaps   |
| `--space-6`   | `2rem`   | Container padding (desktop), grid gap     |
| `--space-8`   | `3rem`   | Section padding (mobile)                  |
| `--space-10`  | `4rem`   | Section padding (tablet), large margins   |
| `--space-12`  | `5rem`   | Not currently used                        |
| `--space-16`  | `6rem`   | Section padding (desktop)                 |
| `--space-20`  | `8rem`   | Not currently used                        |

**Section spacing pattern:**
- Desktop: `padding-top/bottom: var(--space-16)` (6rem / 96px)
- Tablet (≤1023px): `var(--space-10)` (4rem / 64px)
- Mobile (≤767px): `var(--space-8)` (3rem / 48px)

### 2.4 Border Radius

| Token           | Value    | Usage                                    |
|-----------------|----------|------------------------------------------|
| `--radius-sm`   | `6px`    | Small inputs, inner elements              |
| `--radius-md`   | `10px`   | Medium containers, panels                 |
| `--radius-lg`   | `16px`   | Cards, dropzone, major containers         |
| `--radius-xl`   | `24px`   | Large panels (not currently used)         |
| `--radius-full` | `9999px` | Buttons, badges, pills, score rings       |

### 2.5 Shadows

| Token        | Value                                                        | Usage                    |
|--------------|--------------------------------------------------------------|--------------------------|
| `--shadow-0` | `none`                                                       | Flat elements             |
| `--shadow-1` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`   | Default cards             |
| `--shadow-2` | `0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)`   | Elevated cards, panels    |
| `--shadow-3` | `0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)`| Modals, dropdowns         |
| `--shadow-4` | `0 20px 50px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)`| Hero mockup, large panels |

**Shadow usage:**
- Base cards: `--shadow-1` with `border: 1px solid var(--color-border)`
- Interactive panels (mockup, dashboard): `--shadow-3` or `--shadow-4`
- Navbar scrolled: `--shadow-1` or `--shadow-2`

### 2.6 Transitions

| Token               | Value          | Usage                       |
|----------------------|----------------|-----------------------------|
| `--transition-fast`  | `150ms ease-out` | Hover color changes        |
| `--transition-base`  | `200ms ease-out` | Button hover, card hover   |
| `--transition-slow`  | `300ms ease-out` | Accordion expand, overlays |

### 2.7 Z-Index

| Token              | Value | Usage             |
|---------------------|-------|--------------------|
| `--z-navbar`        | 100   | Sticky navbar      |
| `--z-mobile-menu`   | 200   | Mobile menu panel  |
| `--z-overlay`       | 300   | Overlays, modals   |

---

## 3. Layout System

### 3.1 Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);  /* 2rem desktop */
}
/* Tablet: padding 0 var(--space-5) */
/* Mobile: padding 0 var(--space-4) */
```

### 3.2 Grid Helpers

| Class       | Columns         | Tablet  | Mobile |
|-------------|-----------------|---------|--------|
| `.grid--2`  | `repeat(2, 1fr)`| 2 cols  | 1 col  |
| `.grid--3`  | `repeat(3, 1fr)`| 2 cols  | 1 col  |
| `.grid--4`  | `repeat(4, 1fr)`| 2 cols  | 1 col  |

Default gap: `var(--space-6)` (2rem)

### 3.3 Flex Helpers

| Class           | Behavior                                  |
|-----------------|-------------------------------------------|
| `.flex`         | `display: flex`                           |
| `.flex--center` | `align-items: center; justify-content: center` |
| `.flex--between`| `align-items: center; justify-content: space-between` |
| `.flex--col`    | `flex-direction: column`                  |

Gap utilities: `.gap-2` through `.gap-6`

### 3.4 Breakpoints

| Name    | Max-width  | Usage                              |
|---------|------------|------------------------------------|
| Tablet  | `1023px`   | 2-col grids, reduced section padding |
| Mobile  | `767px`    | Single column, stacked layouts     |

---

## 4. Reusable Components

### 4.1 Buttons

All buttons use `.btn` base class with modifier variants:

| Variant          | Class            | Background        | Text color          | Border               |
|------------------|------------------|-------------------|---------------------|----------------------|
| Primary          | `.btn--primary`  | `primary-600`     | `#fff`              | none                 |
| Secondary        | `.btn--secondary`| `surface` (white) | `primary-700`       | `1px solid primary-200` |
| Outline (dark)   | `.btn--outline`  | transparent       | `#fff`              | `1.5px solid rgba(255,255,255,0.4)` |
| Ghost            | `.btn--ghost`    | transparent       | `neutral-600`       | none                 |

**Base specs:**
- `padding: 0.8rem 1.75rem`
- `border-radius: var(--radius-full)` (pill shape)
- `font-size: var(--text-sm)` (14px)
- `font-weight: 600`
- `gap: var(--space-2)` for icon + text
- `transition: all var(--transition-base)`

**Hover behaviors:**
- Primary: darker bg + blue box-shadow
- Secondary: blue-50 bg + stronger border
- Outline: white-10 bg + stronger white border
- Ghost: neutral-100 bg + darker text

**Focus:** `outline: 2px solid primary-500; outline-offset: 2px` (all variants)

**Special button variants (component-scoped):**
- `.hero__cta-primary` — Full white button with upload icon on dark bg
- `.hero__cta-secondary` — Ghost-style with arrow on dark bg
- `.cta-final__primary` — Same pattern as hero primary
- `.cta-final__secondary` — Same pattern as hero secondary
- `.upload__btn--primary` / `.upload__btn--ghost` — Upload action buttons
- `.pricing-card` CTA — Uses `.btn--primary` or `.btn--secondary` at full width

### 4.2 Badges

Base: `.badge` — `font-size: xs`, `font-weight: 600`, `border-radius: full`, inline-flex with icon gap

| Variant         | Class             | Bg           | Text          |
|-----------------|-------------------|--------------|---------------|
| Danger/Critical | `.badge--danger`  | `danger-50`  | `danger-600`  |
| Warning/Attn    | `.badge--warning` | `warning-50` | `warning-600` |
| Success/Safe    | `.badge--success` | `success-50` | `success-600` |

**Component-scoped badges:**
- `.risk-card__badge--critical/attention/safe`
- `.guided__clause-badge--critical/attention/safe`
- `.dash__table-badge--critical/attention/safe/processing`
- `.check-item__tag--resolved/pending/critical`
- `.mockup__tab-badge`

### 4.3 Cards

Base: `.card` — `bg: surface`, `border-radius: lg`, `shadow-1`, `border: 1px solid border`

**Card variants in use:**

| Component        | Class             | Pattern                                            |
|------------------|-------------------|----------------------------------------------------|
| Trust cards      | `.trust-card`     | Icon (colored bg circle) + title + description     |
| Feature cards    | `.feature-card`   | Icon + title + description (6-col grid)            |
| Analysis cards   | `.analysis__card` | Icon + title + text + example block                |
| Risk cards       | `.risk-card`      | Head (badge + clause) + body (title + impact) + footer (source quote) |
| Step cards       | `.step`           | Number + icon + title + text + tag                 |
| Pricing cards    | `.pricing-card`   | Tier + price + period + feature list + CTA         |
| Testimonial cards| `.testimonial-card`| Stars + quote + author (avatar + name/role)       |
| FAQ items        | `.faq-item`       | Question button + collapsible answer               |
| Check items      | `.check-item`     | Checkbox + content (title + desc + tag)            |

**Card elevation patterns:**
- Flat (border only): trust cards, feature cards
- Elevated (shadow-1): analysis cards, pricing cards
- Simulated UI (shadow-3/4): mockup, dashboard, demo panel

### 4.4 Section Labels

`.section-label` — Pill-shaped kicker above section headings:
- `font-family: body`, `font-size: xs`, `font-weight: 600`
- `text-transform: uppercase`, `letter-spacing: 0.08em`
- `color: primary-600`, `bg: primary-50`
- `padding: space-2 space-4`, `border-radius: full`

Used inside `.section-header` (centered block with label + h2 + description p).

### 4.5 Icons

Base: `.icon` (inline-flex, centered), sized via `.icon--sm/md/lg/xl`

**SVG convention:**
- All icons inline SVG
- Attributes: `xmlns`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`
- Color inherited from parent via `currentColor`
- Size controlled by parent container width/height

### 4.6 Score Rings

Repeated pattern across hero mockup, analysis panel, dashboard widget, checklist sidebar:
- Circular container with gradient border (conic-gradient)
- Inner content: score number + "/10" or "/100" + label text
- Variants: danger/warning/safe based on score value

### 4.7 Progress Bars

`.upload__progress-fill` and `.guided__progress-fill`:
- Track: full-width bar with neutral bg
- Fill: colored fill (primary or success) with width animated via JS
- `border-radius: full`

---

## 5. Section Patterns

### 5.1 Section Structure

Every section follows this pattern:

```html
<section class="[section-name] section" id="[id]">
  <div class="container">
    <div class="section-header fade-in-up">
      <span class="section-label">[Kicker]</span>
      <h2>[Heading]</h2>
      <p>[Description]</p>
    </div>
    <!-- Section-specific content -->
  </div>
</section>
```

### 5.2 Dark Sections

Hero, Dashboard, and Final CTA use dark gradient backgrounds:
- Background: `linear-gradient(135deg, var(--color-deep-900), var(--color-primary-900))` or similar
- Text color: `#fff` or `rgba(255,255,255,0.7)`
- No border on cards; use subtle `rgba(255,255,255,0.1)` borders

### 5.3 Alternating Sections

Light sections alternate between:
- `--color-bg` (`neutral-50`) — default
- `--color-surface` (`#ffffff`) — explicit white
- `--color-bg-alt` (`neutral-100`) — subtle gray

---

## 6. Interactive Patterns

### 6.1 Scroll Animations

- Class `.fade-in-up` + IntersectionObserver adds `.fade-in-up--visible`
- Stagger delays via `.stagger-1` through `.stagger-6` (100ms–600ms)
- `prefers-reduced-motion` disables all animations

### 6.2 Accordion (FAQ + Guided Review)

- Button trigger with `aria-expanded` and `aria-controls`
- Content panel with `role="region"`
- One-at-a-time for FAQ; independent for guided review
- Icon rotates on expand (FAQ `+` → `×`, guided review chevron)

### 6.3 Upload Zone

- `.upload__dropzone` acts as drag-and-drop target
- Hidden `<input type="file">` triggered by label click
- JS handles drag/drop events, file selection, progress simulation
- States: default → dragover → uploading → complete

### 6.4 Navbar States

- Default: transparent (over hero)
- Scrolled: white background with `shadow-1`
- Mobile: hamburger → slide-in panel with overlay

---

## 7. Responsive Behavior

### 7.1 Grid Collapse

| Layout           | Desktop        | Tablet          | Mobile       |
|------------------|----------------|-----------------|--------------|
| Trust grid       | 3×2            | 2×3             | 1×6          |
| How-it-works     | 4-col row      | 2×2             | 1×4 stack    |
| Features grid    | 3×2            | 2×3             | 1×6          |
| Pricing grid     | 3-col          | Stack (popular first) | Stack  |
| Testimonials     | 3-col          | Stack           | Stack        |
| Analysis grid    | 5:7 two-col    | Stack           | Stack        |
| Risks layout     | Sidebar + main | Stack           | Stack        |
| Checklist layout | Items + sidebar| Stack           | Stack        |
| Hero grid        | 5:7 two-col    | Stack           | Stack        |
| Dashboard mockup | Full mockup    | Simplified      | Simplified   |

### 7.2 Typography Scaling

Currently fixed sizes. For future improvement, consider adding responsive font sizing via `clamp()`.

---

## 8. Accessibility Patterns

- **Skip link**: `.skip-link` hidden until focused
- **Screen reader only**: `.sr-only` class
- **Focus visible**: All interactive elements have `:focus-visible` outlines
- **ARIA**: Accordion buttons use `aria-expanded`, `aria-controls`; panels use `role="region"`
- **Semantic HTML**: `<header>`, `<main>`, `<nav>`, `<section>`, `<aside>`, `<footer>`
- **Reduced motion**: `prefers-reduced-motion: reduce` disables animations
- **Color contrast**: Risk indicators use both color AND text labels (badge text)
- **Alt text**: Icons use `aria-label` where they are the only content (social links, nav toggle)

---

## 9. Component Inventory

| #  | Component       | CSS File                  | JS File            | Section ID     |
|----|-----------------|---------------------------|--------------------|----------------|
| 1  | Navbar          | `components/navbar.css`   | `main.js`          | `#navbar`      |
| 2  | Hero + Mockup   | `components/hero.css`     | —                  | `#hero`        |
| 3  | Trust Grid      | `components/trust.css`    | —                  | `#confianca`   |
| 4  | How It Works    | `components/how-it-works.css` | —              | `#como-funciona`|
| 5  | Upload Zone     | `components/upload.css`   | `upload.js`        | `#enviar`      |
| 6  | Analysis Panel  | `components/analysis.css` | —                  | `#analise`     |
| 7  | Risk Viewing    | `components/risk-viewing.css` | —              | `#riscos`      |
| 8  | Guided Review   | `components/guided-review.css` | `guided-review.js` | `#leitura`  |
| 9  | Dashboard       | `components/dashboard.css`| —                  | `#painel`      |
| 10 | Features Grid   | `components/features.css` | —                  | `#recursos`    |
| 11 | Demo Panel      | `components/demo.css`     | `demo.js`          | `#demo`        |
| 12 | Pricing         | `components/pricing.css`  | —                  | `#precos`      |
| 13 | Testimonials    | `components/testimonials.css` | —              | `#depoimentos` |
| 14 | FAQ             | `components/faq.css`      | `accordion.js`     | `#faq`         |
| 15 | Checklist       | `components/checklist.css`| —                  | `#checklist`   |
| 16 | Final CTA       | `components/cta-final.css`| —                  | `#cta`         |
| 17 | Footer          | `components/footer.css`   | —                  | `#footer`      |

---

## 10. Naming Conventions

### BEM Pattern

```
.block              — Component root
.block__element     — Child within component
.block--modifier    — Variant of block
.block__element--modifier — Variant of element
```

**Examples:**
- `.risk-card` / `.risk-card__head` / `.risk-card--critical` / `.risk-card__badge--critical`
- `.dash` / `.dash__sidebar` / `.dash__nav-icon--active`
- `.check-item` / `.check-item__box` / `.check-item--resolved`

### File Naming

- CSS: `kebab-case.css` matching the BEM block name
- JS: `kebab-case.js` matching functionality
- One component per CSS file

---

## 11. Do's and Don'ts

### Do
- Use CSS custom properties from `tokens.css` — never hardcode colors, spacing, or sizes
- Follow BEM naming strictly — no nested BEM (`.block__element__sub-element`)
- Use inline SVG for icons with the standard attribute set
- Add `fade-in-up` + stagger classes for scroll animations
- Use semantic HTML elements
- Test mobile layout at 375px and desktop at 1440px

### Don't
- Don't introduce new color values — extend `tokens.css` first
- Don't use emoji for icons — always use inline SVG
- Don't use `!important` — increase specificity via BEM instead
- Don't add JavaScript dependencies — vanilla JS only
- Don't create one-off styles in `style` attributes (exceptions: dynamic widths like progress bars)
- Don't use `id` for styling — only for JS hooks and anchor links

---

## 12. Future Considerations

- **Responsive typography**: Replace fixed `rem` sizes with `clamp()` for fluid scaling
- **Dark mode**: Token structure supports it via `prefers-color-scheme` overrides
- **CSS consolidation**: Consider combining small component files into bundles for production
- **Image optimization**: Add favicon, OG image, and structured data
- **Performance**: Add `font-display: swap` verification, preconnect for Google Fonts
- **Accessibility audit**: Verify heading hierarchy, color contrast ratios, focus order
