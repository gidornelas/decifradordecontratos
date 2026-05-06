# Decodificador de Contratos — Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium SaaS landing page for an AI-powered contract decoding platform that helps users understand legal documents before signing.

**Architecture:** Single-page application using pure HTML + CSS + vanilla JS (no framework). Mobile-first responsive design with a component-based CSS architecture using BEM naming. All sections rendered server-side in a single `index.html` file with modular CSS files per component.

**Tech Stack:** HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JavaScript, Google Fonts (Playfair Display + Inter), Lucide Icons (SVG sprite)

---

## 1. PAGE ARCHITECTURE

### Section Order (top to bottom)

```
┌─────────────────────────────────────────────┐
│  NAVBAR (sticky)                            │
│  Logo | Nav Links | CTA Button              │
├─────────────────────────────────────────────┤
│  HERO                                       │
│  Headline + Subtext + Email Capture +       │
│  Dashboard Preview Mockup                   │
├─────────────────────────────────────────────┤
│  SOCIAL PROOF BAR                           │
│  Logos / Stats (users, contracts decoded)   │
├─────────────────────────────────────────────┤
│  PROBLEM SECTION                            │
│  "The Problem" — pain points with contracts │
│  Risk illustration cards                    │
├─────────────────────────────────────────────┤
│  HOW IT WORKS (3-step flow)                 │
│  Step 1: Upload → Step 2: Decode →          │
│  Step 3: Understand                         │
├─────────────────────────────────────────────┤
│  FEATURES GRID                              │
│  6 feature cards in 3x2 grid               │
│  With icons + micro-illustrations           │
├─────────────────────────────────────────────┤
│  INTERACTIVE DEMO / PRODUCT PREVIEW         │
│  Animated contract analysis simulation      │
│  Before/After view                          │
├─────────────────────────────────────────────┤
│  PRICING                                    │
│  3 tiers: Free | Pro | Premium              │
│  Feature comparison cards                   │
├─────────────────────────────────────────────┤
│  TESTIMONIALS                               │
│  3 testimonial cards + ratings              │
├─────────────────────────────────────────────┤
│  FAQ                                        │
│  8-10 collapsible accordion items           │
├─────────────────────────────────────────────┤
│  FINAL CTA                                 │
│  Big headline + email capture + trust badge │
├─────────────────────────────────────────────┤
│  FOOTER                                    │
│  Links | Legal | Social | Copyright         │
└─────────────────────────────────────────────┘
```

### File Structure

```
TESTANDO/
├── index.html
├── css/
│   ├── tokens.css          — Design tokens (CSS custom properties)
│   ├── reset.css           — CSS reset / normalize
│   ├── base.css            — Base typography, body, utilities
│   ├── layout.css          — Grid system, container, section spacing
│   ├── components/
│   │   ├── navbar.css      — Sticky navigation
│   │   ├── hero.css        — Hero section + dashboard mockup
│   │   ├── social-proof.css — Logo/stats bar
│   │   ├── problem.css     — Problem/pain points section
│   │   ├── how-it-works.css — 3-step process flow
│   │   ├── features.css    — Feature grid cards
│   │   ├── demo.css        — Interactive demo / product preview
│   │   ├── pricing.css     — Pricing tier cards
│   │   ├── testimonials.css — Testimonial cards
│   │   ├── faq.css         — Accordion FAQ
│   │   ├── cta-final.css   — Final CTA section
│   │   └── footer.css      — Footer
│   └── animations.css      — Scroll-triggered animations
├── js/
│   ├── main.js             — Entry point, scroll observer, nav toggle
│   ├── accordion.js        — FAQ accordion logic
│   ├── animation.js        — Intersection Observer animations
│   └── demo.js             — Interactive demo simulation
├── assets/
│   ├── icons/              — Lucide SVG icons (inline)
│   └── images/             — Any raster images (if needed)
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-04-17-decodificador-contratos.md
```

---

## 2. DESIGN SYSTEM DIRECTION

### Style: Layered Premium Minimalism

- Clean, structured layout inspired by modern legal-tech SaaS
- Layered card surfaces with subtle elevation
- Soft gradient backgrounds (not flat white)
- Gold accents used sparingly for premium trust signals
- Dashboard-style UI elements to convey intelligence and analysis

### Color Palette (CSS Custom Properties)

```css
:root {
  /* Primary — Trust Blue */
  --color-primary-50:  #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a5f;

  /* Deep Blue — Structure & Clarity */
  --color-deep-700: #0f2942;
  --color-deep-800: #0a1f36;
  --color-deep-900: #061525;

  /* Neutral — Calm Background */
  --color-neutral-50:  #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1e293b;
  --color-neutral-900: #0f172a;

  /* Gold Accent — Premium Trust */
  --color-gold-400: #fbbf24;
  --color-gold-500: #f59e0b;
  --color-gold-600: #d97706;

  /* Risk Colors */
  --color-danger-50:  #fef2f2;
  --color-danger-500: #ef4444;
  --color-danger-600: #dc2626;
  --color-danger-700: #b91c1c;

  --color-warning-50:  #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;

  --color-success-50:  #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;

  /* Semantic Tokens */
  --color-bg:         var(--color-neutral-50);
  --color-bg-alt:     var(--color-neutral-100);
  --color-surface:    #ffffff;
  --color-text:       var(--color-neutral-900);
  --color-text-muted: var(--color-neutral-500);
  --color-border:     var(--color-neutral-200);
}
```

### Background Treatment

- Main background: soft gradient from `--color-neutral-50` to very subtle blue-gray tint
- Alternate sections: white surfaces vs light gray backgrounds for visual rhythm
- Hero: deep blue gradient (`--color-deep-900` → `--color-primary-900`)
- CTA sections: deep blue backgrounds for contrast and emphasis

### Typography

```
Headings:    "Playfair Display" — elegant serif
Body:        "Inter" — highly readable sans-serif
Monospace:   "JetBrains Mono" — for contract excerpts, code-like legal text

Scale:
  - Display (Hero):    3.5rem / 700 / 1.15 line-height
  - H1:                2.5rem / 700 / 1.2
  - H2 (Section):      2rem   / 600 / 1.25
  - H3 (Card):         1.25rem / 600 / 1.3
  - Body Large:        1.125rem / 400 / 1.7
  - Body:              1rem    / 400 / 1.65
  - Small:             0.875rem / 400 / 1.5
  - Caption:           0.75rem / 500 / 1.4
```

### Spacing Scale (8px base)

```
--space-1:  0.25rem  (4px)
--space-2:  0.5rem   (8px)
--space-3:  0.75rem  (12px)
--space-4:  1rem     (16px)
--space-5:  1.5rem   (24px)
--space-6:  2rem     (32px)
--space-8:  3rem     (48px)
--space-10: 4rem     (64px)
--space-12: 5rem     (80px)
--space-16: 6rem     (96px)
--space-20: 8rem     (128px)
```

### Shadows & Elevation

```
Level 0: none (flat surface)
Level 1: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
Level 2: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)
Level 3: 0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)
Level 4: 0 20px 50px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)
```

### Border Radius

```
--radius-sm:  6px
--radius-md:  10px
--radius-lg:  16px
--radius-xl:  24px
--radius-full: 9999px
```

### Breakpoints

```
Mobile:        < 768px   (base, mobile-first)
Tablet:        >= 768px
Desktop:       >= 1024px
Large Desktop: >= 1440px
```

### Container

```
Max-width: 1200px
Padding:   1.5rem mobile / 2rem tablet / 3rem desktop
```

---

## 3. REUSABLE COMPONENTS LIST

### Atoms (smallest units)

| Component       | CSS File       | Description                                    |
|----------------|----------------|------------------------------------------------|
| Button         | base.css       | `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--outline`, `.btn--ghost` |
| Badge          | base.css       | `.badge` — risk level, status indicator        |
| Icon           | base.css       | `.icon`, `.icon--sm`, `.icon--md`, `.icon--lg` |
| Section Label  | base.css       | `.section-label` — small caps category tag     |
| Tooltip        | —              | CSS-only tooltip on hover                      |

### Molecules (combinations of atoms)

| Component         | CSS File       | Description                                    |
|------------------|----------------|------------------------------------------------|
| Card             | base.css       | `.card` — elevated surface with padding, radius |
| Feature Card     | features.css   | `.feature-card` — icon + title + description   |
| Pricing Card     | pricing.css    | `.pricing-card` — tier name + price + features + CTA |
| Testimonial Card | testimonials.css | `.testimonial-card` — quote + avatar + name + role |
| Risk Indicator   | problem.css    | `.risk-indicator` — colored badge (amber/red/green) |
| Step Card        | how-it-works.css | `.step-card` — number + icon + title + description |
| Stat Counter     | social-proof.css | `.stat` — number + label                        |
| FAQ Item         | faq.css        | `.faq-item` — question + collapsible answer     |
| Input + CTA      | hero.css       | `.email-capture` — email input + submit button  |
| Trust Badge      | cta-final.css  | `.trust-badge` — lock icon + security text      |

### Organisms (full sections)

| Component         | CSS File       | Description                                    |
|------------------|----------------|------------------------------------------------|
| Navbar           | navbar.css     | Logo + nav links + CTA + mobile menu toggle    |
| Hero             | hero.css       | Headline + subtext + email capture + mockup    |
| Social Proof Bar | social-proof.css | Stats row / logo strip                        |
| Problem Section  | problem.css    | Pain point headline + risk illustration cards  |
| How It Works     | how-it-works.css | 3-step horizontal flow with connector lines  |
| Features Grid    | features.css   | 3x2 responsive grid of feature cards          |
| Product Demo     | demo.css       | Animated contract analysis simulation panel    |
| Pricing          | pricing.css    | 3 pricing tier cards with highlighted popular  |
| Testimonials     | testimonials.css | 3-column testimonial cards                    |
| FAQ              | faq.css        | Accordion list of questions                    |
| Final CTA        | cta-final.css  | Full-width CTA with email capture              |
| Footer           | footer.css     | Multi-column footer with links                 |

---

## 4. SECTION-BY-SECTION UX RATIONALE

### NAVBAR
**Why:** Persistent access to navigation and primary CTA. Sticky so users can act at any scroll point. Mobile: hamburger menu to preserve space. Logo on left, links center, CTA right. Uses `position: sticky` with subtle shadow on scroll for elevation feedback.

**Behavior:** Transparent on hero (over deep blue), gains white background + shadow after scrolling past hero. Smooth transition (`200ms ease-out`). Mobile hamburger slides in from right.

### HERO
**Why:** First impression must convey trust, intelligence, and simplicity. Deep blue gradient background creates authority. Serif heading ("Entenda contratos antes de assinar") creates gravitas. Subtext in Inter for readability. Email capture form for lead generation. Dashboard mockup preview below hero text shows the product in action — users immediately understand what they're getting.

**Layout:** Two-column on desktop (text left, mockup right). Single column on mobile (text top, mockup below). Mockup uses a CSS-only simulated dashboard panel with contract text, highlighted clauses, and risk indicators.

### SOCIAL PROOF BAR
**Why:** Trust signals immediately after hero reduce skepticism. Stats format ("50.000+ contratos analisados", "98% satisfação") gives social proof. Optional logo strip of press/partner logos. Light background to visually separate from hero.

**Layout:** Horizontal row of 3-4 stats centered. Animated count-up on scroll into view.

### PROBLEM SECTION
**Why:** Agitate the pain before presenting the solution. Users need to feel the problem viscerally. Present 3 risk cards showing common contract dangers: hidden fees, automatic renewals, unfair liability clauses. Each card has a risk indicator (amber/red) and specific examples.

**UX Pattern:** Problem → Agitation → Resolution (PAS copy framework). Cards use risk-colored left borders and warning icons.

### HOW IT WORKS
**Why:** Reduce cognitive load by showing simplicity in 3 steps. Users fear complexity. Numbered steps with connecting lines create a guided flow. Icons for each step (Upload, Analyze, Understand).

**Layout:** 3 columns on desktop, vertical stack on mobile with numbered circles and connecting line. Each step has: number badge, icon, title, short description.

### FEATURES GRID
**Why:** Detailed capabilities for users who need convincing. 6 features in 3x2 grid covers the main value propositions: clause detection, risk scoring, plain language translation, obligation mapping, deadline tracking, comparison tools.

**Layout:** CSS Grid `repeat(3, 1fr)` on desktop, 2-col on tablet, 1-col on mobile. Each card: icon (Lucide SVG), title (H3), description (body). Subtle hover elevation effect.

### INTERACTIVE DEMO / PRODUCT PREVIEW
**Why:** Show, don't tell. A simulated contract analysis (CSS-only or light JS animation) where a dense contract clause gets "decoded" in real-time — risk phrases highlight, plain translation appears, risk score fills up. This is the "aha moment" section.

**UX Pattern:** Before/After panel. Left: original dense legal text. Right: decoded version with color-coded highlights (red = risk, amber = caution, green = safe), plain language summary, risk score gauge. Animation triggers on scroll.

### PRICING
**Why:** Clear, honest pricing builds trust. 3 tiers: Free (trial), Pro (individual), Premium (professional). Middle tier highlighted as "Most Popular" with gold border. Each card: tier name, price, feature list, CTA button.

**Layout:** 3-column cards. Popular tier slightly elevated (scale + shadow). Free tier minimal, Premium tier has gold accents. Annual/monthly toggle (optional, can be Phase 2).

### TESTIMONIALS
**Why:** Social proof from real users. 3 testimonials with quote, name, role, avatar (placeholder), star rating. Cards have subtle border and elevation.

**Layout:** 3 columns on desktop, horizontal scroll or stack on mobile. Alternating slight background.

### FAQ
**Why:** Address objections and reduce support load. 8-10 common questions with collapsible answers. Uses accessible accordion pattern with `aria-expanded`. Only one item open at a time.

**UX Pattern:** Click question to expand/collapse answer. Smooth max-height transition. Plus/minus icon rotation. `aria-expanded`, `aria-controls` for accessibility.

### FINAL CTA
**Why:** Users who scrolled this far are interested. Strong CTA with email capture, trust badge ("Sem spam. Cancele quando quiser."), and a brief value recap. Deep blue background (matching hero) for bookend visual effect.

**Layout:** Centered text + email capture form. Trust badge below. Full-width section.

### FOOTER
**Why:** Standard navigation, legal links, social media. Multi-column layout. Dark background (deepest blue) to anchor the page. Copyright, terms, privacy policy links.

**Layout:** 4 columns on desktop (Product, Company, Resources, Legal), 2x2 on tablet, stack on mobile. Social icons row at bottom.

---

## 5. IMPLEMENTATION TASKS

### Task 1: Project Scaffolding + Design Tokens

**Files:**
- Create: `css/tokens.css`
- Create: `css/reset.css`
- Create: `css/base.css`
- Create: `css/layout.css`
- Create: `index.html` (empty shell with all CSS links and section containers)

- [ ] **Step 1: Create `css/tokens.css`** with all CSS custom properties (colors, spacing, typography, shadows, radii, breakpoints as media query references)

- [ ] **Step 2: Create `css/reset.css`** with modern CSS reset (box-sizing border-box, margin/padding reset, font inheritance, smooth scroll)

- [ ] **Step 3: Create `css/base.css`** with body defaults, typography styles (heading sizes, body, small), utility classes (.container, .sr-only, .text-center, etc.), button variants, card base, badge base, icon sizing, section-label

- [ ] **Step 4: Create `css/layout.css`** with .container (max-width 1200px, responsive padding), .section (vertical padding with --space-16/20), .grid helpers

- [ ] **Step 5: Create `index.html`** shell with `<!DOCTYPE html>`, `<head>` with meta viewport, Google Fonts link (Playfair Display 600,700 + Inter 400,500,600,700), all CSS file links in correct order, semantic `<section>` containers for each section with placeholder IDs

- [ ] **Step 6: Verify in browser** — open index.html, confirm fonts load, CSS cascade is correct, no console errors

---

### Task 2: Navbar Component

**Files:**
- Create: `css/components/navbar.css`
- Modify: `index.html` (navbar section)

- [ ] **Step 1: Create `css/components/navbar.css`** with `.navbar` (sticky, transparent initially, white bg after scroll via `.navbar--scrolled`), `.navbar__inner` (container, flex, space-between), `.navbar__logo` (Playfair Display, bold, white on hero/blue on scroll), `.navbar__links` (flex gap, hidden on mobile), `.navbar__link` (nav items, hover underline), `.navbar__cta` (btn btn--primary), `.navbar__toggle` (hamburger, visible on mobile), `.navbar__mobile-menu` (slide-in from right)

- [ ] **Step 2: Add navbar HTML** to index.html — `<header class="navbar" id="navbar">` with logo, nav links (Como Funciona, Recursos, Preços, FAQ), CTA button "Começar Grátis", mobile toggle button, mobile menu overlay

- [ ] **Step 3: Add scroll behavior in `js/main.js`** — Intersection Observer on hero section to toggle `.navbar--scrolled` class. Mobile menu toggle (hamburger click opens/closes mobile menu, close on link click)

- [ ] **Step 4: Verify** — Navbar starts transparent over hero, turns white on scroll, mobile menu works

---

### Task 3: Hero Section

**Files:**
- Create: `css/components/hero.css`
- Modify: `index.html` (hero section)

- [ ] **Step 1: Create `css/components/hero.css`** with `.hero` (deep blue gradient bg, min-height 90vh, flex center), `.hero__grid` (2-col desktop, 1-col mobile), `.hero__content` (text column), `.hero__title` (Playfair Display, 3.5rem, white, line-height 1.15), `.hero__subtitle` (Inter, 1.125rem, blue-200, max-width 520px), `.hero__form` (email capture), `.hero__input` (rounded input, white bg), `.hero__mockup` (dashboard preview panel, bg white, rounded-xl, shadow level 4, slight rotation/perspective)

- [ ] **Step 2: Add hero HTML** to index.html — `<section class="hero" id="hero">` with section-label "Decodificador de Contratos", H1 "Entenda cada cláusula antes de assinar", subtitle "Transforme linguagem jurídica complexa em ..." form with email input + "Analisar Grátis" button, trust text "Grátis · Sem cartão de crédito", and the dashboard mockup panel (CSS-only simulated interface with contract text, highlighted clauses in red/amber/green, risk score gauge)

- [ ] **Step 3: Style the dashboard mockup** — `.mockup` with inner elements: header bar (with dots), sidebar (clause list), main area (contract text with highlighted ranges), risk indicator panel. Use monospace font for contract text. Highlights use semi-transparent red/amber/green backgrounds

- [ ] **Step 4: Verify** — Hero renders with gradient background, two-column layout, email form functional, mockup looks like a real dashboard preview

---

### Task 4: Social Proof Bar

**Files:**
- Create: `css/components/social-proof.css`
- Modify: `index.html` (social proof section)

- [ ] **Step 1: Create `css/components/social-proof.css`** with `.social-proof` (white bg, border-y neutral-200), `.social-proof__grid` (flex, justify-around, gap), `.stat` (text-center), `.stat__number` (2rem, bold, primary-700), `.stat__label` (0.875rem, neutral-500)

- [ ] **Step 2: Add HTML** — 4 stats: "50.000+" / "Contratos Analisados", "12.000+" / "Usuários Ativos", "98%" / "Taxa de Satisfação", "4.9/5" / "Avaliação Média"

- [ ] **Step 3: Add count-up animation** in `js/animation.js` — Intersection Observer triggers `animateValue()` to count from 0 to target number over 2 seconds with easing

- [ ] **Step 4: Verify** — Stats animate on scroll

---

### Task 5: Problem Section

**Files:**
- Create: `css/components/problem.css`
- Modify: `index.html` (problem section)

- [ ] **Step 1: Create `css/components/problem.css`** with `.problem` (neutral-100 bg), `.problem__header` (text-center), `.problem__grid` (3-col desktop, 1-col mobile), `.risk-card` (white bg, rounded-lg, shadow 1, border-l 4px colored), `.risk-card--danger` (border-l red-500), `.risk-card--warning` (border-l amber-500), `.risk-card__icon` (risk icon, colored bg circle), `.risk-card__title` (h3), `.risk-card__text` (body text), `.risk-card__example` (monospace, small, neutral-600, italic)

- [ ] **Step 2: Add HTML** — section-label "O Problema", H2 "Contratos escondem armadilhas que você não deveria ignorar", 3 risk cards: (1) "Cláusulas Abusivas" (red) — hidden fees, unfair terms, example quote, (2) "Renovações Automáticas" (amber) — trapped subscriptions, (3) "Responsabilidade Oculta" (red) — liability you didn't agree to

- [ ] **Step 3: Verify** — Cards render with colored left borders, icons, proper spacing

---

### Task 6: How It Works Section

**Files:**
- Create: `css/components/how-it-works.css`
- Modify: `index.html` (how it works section)

- [ ] **Step 1: Create `css/components/how-it-works.css`** with `.how-it-works` (white bg), `.how-it-works__grid` (3-col with step connectors), `.step` (text-center, position relative), `.step__number` (circle 48px, primary-600 bg, white text, centered), `.step__connector` (horizontal line between steps on desktop, vertical on mobile), `.step__icon` (64px icon container, primary-50 bg, rounded-full), `.step__title` (h3, mt), `.step__text` (body, neutral-600)

- [ ] **Step 2: Add HTML** — section-label "Como Funciona", H2 "Três passos para entender qualquer contrato", 3 steps: (1) "Envie o Contrato" — Upload icon, "Cole o texto ou faça upload do PDF", (2) "Análise Inteligente" — Scan icon, "Nossa IA identifica cláusulas de risco automaticamente", (3) "Entenda e Decida" — Check icon, "Receba uma tradução clara com alertas de riscos"

- [ ] **Step 3: Add connector line styling** — dashed horizontal line between steps on desktop (using ::after pseudo-element), vertical on mobile

- [ ] **Step 4: Verify** — 3-step flow renders horizontally on desktop, vertically on mobile, with connectors

---

### Task 7: Features Grid

**Files:**
- Create: `css/components/features.css`
- Modify: `index.html` (features section)

- [ ] **Step 1: Create `css/components/features.css`** with `.features` (neutral-50 bg), `.features__grid` (CSS Grid, 3x2 desktop, 2-col tablet, 1-col mobile, gap 1.5rem), `.feature-card` (white bg, rounded-lg, padding 1.5rem, shadow 1, border neutral-100, hover shadow 2 + translateY -2px, transition 200ms), `.feature-card__icon` (48px, primary-50 bg, rounded-md, flex center), `.feature-card__title` (h3), `.feature-card__text` (body, neutral-500)

- [ ] **Step 2: Add HTML** — section-label "Recursos", H2 "Tudo o que você precisa para ler contratos com confiança", 6 feature cards: (1) "Detecção de Cláusulas de Risco" — Shield icon, (2) "Tradução para Linguagem Simples" — Languages icon, (3) "Mapa de Obrigações" — ListChecks icon, (4) "Alerta de Prazos e Multas" — Clock icon, (5) "Score de Risco" — BarChart3 icon, (6) "Comparação de Versões" — GitCompare icon

- [ ] **Step 3: Verify** — Grid renders correctly at all breakpoints, hover effects work

---

### Task 8: Interactive Demo / Product Preview

**Files:**
- Create: `css/components/demo.css`
- Create: `js/demo.js`
- Modify: `index.html` (demo section)

- [ ] **Step 1: Create `css/components/demo.css`** with `.demo` (white bg), `.demo__container` (max-width 1000px, centered), `.demo__panel` (rounded-xl, shadow 3, overflow hidden, border neutral-200), `.demo__panel-header` (flex, neutral-100 bg, dots), `.demo__panel-body` (flex, min-height 300px), `.demo__original` (flex-1, p 1.5rem, monospace, text-sm, neutral-700, border-r), `.demo__decoded` (flex-1, p 1.5rem), `.demo__highlight--risk` (bg red-50, text red-700, rounded px-1), `.demo__highlight--caution` (bg amber-50, text amber-700), `.demo__highlight--safe` (bg green-50, text green-700), `.demo__score` (risk score gauge at bottom of decoded panel)

- [ ] **Step 2: Add HTML** — section-label "Veja em Ação", H2 "Como o Decodificador transforma seu contrato", the demo panel with: left side showing a dense Portuguese legal clause (in monospace), right side showing the "decoded" version with colored highlights and a summary, plus a circular risk score indicator (medium risk, amber)

- [ ] **Step 3: Create `js/demo.js`** — On scroll into view (Intersection Observer), trigger animation: original text fades in, then highlights appear sequentially (red → amber → green) with 300ms delays, then risk score fills up. Use CSS classes toggled by JS for animation states

- [ ] **Step 4: Verify** — Demo animates on scroll, highlights appear sequentially, risk score fills

---

### Task 9: Pricing Section

**Files:**
- Create: `css/components/pricing.css`
- Modify: `index.html` (pricing section)

- [ ] **Step 1: Create `css/components/pricing.css`** with `.pricing` (neutral-50 bg), `.pricing__grid` (3-col desktop, 1-col mobile, items-start, gap 1.5rem), `.pricing-card` (white bg, rounded-xl, shadow 1, padding 2rem, border neutral-200, flex column), `.pricing-card--popular` (border-primary-500 border-2, shadow 3, relative, scale 1.02), `.pricing-card__badge` (absolute top, "Mais Popular", primary-600 bg, white text, pill shape), `.pricing-card__tier` (h3, text-center), `.pricing-card__price` (text-center, 3rem, bold, primary-700), `.pricing-card__period` (text-center, neutral-500, small), `.pricing-card__features` (list, check icons, mt 1.5rem), `.pricing-card__cta` (btn, full-width, mt-auto)

- [ ] **Step 2: Add HTML** — section-label "Planos e Preços", H2 "Escolha o plano ideal para você", 3 cards: (1) "Grátis" / "R$ 0" / "3 contratos/mês" — features: basic analysis, risk detection, email support — CTA "Começar Grátis", (2) "Pro" / "R$ 29/mês" — "Mais Popular" badge — features: unlimited contracts, detailed analysis, obligation map, deadline alerts, priority support — CTA "Assinar Pro" (primary), (3) "Premium" / "R$ 79/mês" — features: everything in Pro + version comparison, API access, team collaboration, dedicated support, custom reports — CTA "Falar com Vendas"

- [ ] **Step 3: Verify** — 3 cards render, popular card highlighted, responsive stacking

---

### Task 10: Testimonials

**Files:**
- Create: `css/components/testimonials.css`
- Modify: `index.html` (testimonials section)

- [ ] **Step 1: Create `css/components/testimonials.css`** with `.testimonials` (white bg), `.testimonials__grid` (3-col desktop, 1-col mobile, gap 1.5rem), `.testimonial-card` (white bg, rounded-xl, shadow 2, padding 2rem, border neutral-100, flex column), `.testimonial-card__stars` (gold-400, flex, gap 2px), `.testimonial-card__quote` (body-large, italic, neutral-700, mt 1rem, flex-grow), `.testimonial-card__author` (flex, items-center, gap 0.75rem, mt 1.5rem, pt 1rem, border-t neutral-100), `.testimonial-card__avatar` (48px circle, neutral-200 bg, flex center, neutral-400 — placeholder initial), `.testimonial-card__name` (font-600), `.testimonial-card__role` (small, neutral-500)

- [ ] **Step 2: Add HTML** — section-label "Depoimentos", H2 "O que nossos usuários dizem", 3 testimonials: (1) 5 stars, quote about saving money on hidden fees, Maria Silva, "Empreendedora", (2) 5 stars, quote about understanding a rental contract before signing, Carlos Mendes, "Advogado", (3) 5 stars, quote about feeling safer with online terms, Ana Costa, "Designer"

- [ ] **Step 3: Verify** — Cards render with stars, quotes, author info

---

### Task 11: FAQ Accordion

**Files:**
- Create: `css/components/faq.css`
- Create: `js/accordion.js`
- Modify: `index.html` (FAQ section)

- [ ] **Step 1: Create `css/components/faq.css`** with `.faq` (neutral-50 bg), `.faq__list` (max-width 800px, mx-auto), `.faq-item` (border-b neutral-200), `.faq-item__question` (flex, justify-between, items-center, padding 1.25rem 0, cursor pointer, font-600, w-full, text-left, bg none, border none), `.faq-item__icon` (plus/minus, transition transform 200ms), `.faq-item__icon--open` (rotate 45deg), `.faq-item__answer` (max-height 0, overflow hidden, transition max-height 300ms ease-out), `.faq-item__answer--open` (max-height 300px), `.faq-item__answer-inner` (padding 0 0 1.25rem, neutral-600)

- [ ] **Step 2: Add HTML** — section-label "Perguntas Frequentes", H2 "Tire suas dúvidas", 8 FAQ items with `button[aria-expanded][aria-controls]` and `div[role=region][id]`. Questions: "O que é o Decodificador de Contratos?", "Meus documentos ficam seguros?", "Quantos contratos posso analisar?", "Funciona com qualquer tipo de contrato?", "Qual a diferença entre o plano Grátis e o Pro?", "Posso cancelar a qualquer momento?", "Como funciona a análise de risco?", "Vocês oferecem suporte?"

- [ ] **Step 3: Create `js/accordion.js`** — Click handler on `.faq-item__question`: toggle `aria-expanded`, toggle `.faq-item__icon--open`, toggle `.faq-item__answer--open`. Only one open at a time (close others when opening new)

- [ ] **Step 4: Verify** — Accordion opens/closes smoothly, only one item open at a time, aria attributes update correctly

---

### Task 12: Final CTA Section

**Files:**
- Create: `css/components/cta-final.css`
- Modify: `index.html` (CTA section)

- [ ] **Step 1: Create `css/components/cta-final.css`** with `.cta-final` (deep-blue-900 bg, py 6rem), `.cta-final__content` (text-center, max-width 600px, mx-auto), `.cta-final__title` (Playfair Display, 2.5rem, white), `.cta-final__text` (neutral-300, mt 1rem), `.cta-final__form` (flex, gap 0.75rem, mt 2rem, justify-center), `.cta-final__input` (rounded-full, px 1.5rem, py 0.75rem, flex-grow, max-width 360px), `.cta-final__btn` (btn btn--primary rounded-full), `.trust-badge` (flex, items-center, justify-center, gap 0.5rem, mt 1.5rem, neutral-400, small)

- [ ] **Step 2: Add HTML** — H2 "Comece a ler contratos com confiança", subtitle "Junte-se a milhares de pessoas que já protegemos de cláusulas abusivas", email capture form, trust badge "🔒 Seus dados estão seguros. Sem spam."

- [ ] **Step 3: Verify** — Section renders with deep blue bg, white text, form works

---

### Task 13: Footer

**Files:**
- Create: `css/components/footer.css`
- Modify: `index.html` (footer section)

- [ ] **Step 1: Create `css/components/footer.css`** with `.footer` (deep-blue-900 bg, pt 4rem, pb 2rem, border-t primary-800), `.footer__grid` (4-col desktop, 2x2 tablet, 1-col mobile), `.footer__section` (mb 2rem), `.footer__title` (white, font-600, mb 1rem), `.footer__link` (neutral-400, hover white, transition 150ms, block, py 0.25rem), `.footer__bottom` (border-t primary-800, pt 2rem, mt 2rem, flex, justify-between, items-center, flex-wrap), `.footer__copyright` (neutral-500, small), `.footer__social` (flex, gap 1rem)

- [ ] **Step 2: Add HTML** — 4 columns: "Produto" (Recursos, Como Funciona, Preços, API), "Empresa" (Sobre, Blog, Carreiras, Contato), "Recursos" (Central de Ajuda, Tutoriais, Status, Documentação), "Legal" (Termos de Uso, Política de Privacidade, LGPD, Cookies). Bottom row: copyright + social icons

- [ ] **Step 3: Verify** — Footer renders with proper columns, links, social icons

---

### Task 14: Animations + Scroll Effects

**Files:**
- Create: `css/animations.css`
- Modify: `js/animation.js`

- [ ] **Step 1: Create `css/animations.css`** with `.fade-in-up` (opacity 0, translateY 30px, transition 600ms ease-out), `.fade-in-up--visible` (opacity 1, translateY 0), `.fade-in` (opacity 0, transition 600ms), `.fade-in--visible` (opacity 1), `.stagger-1` through `.stagger-6` (transition-delay 100ms increments)

- [ ] **Step 2: Add animation classes** to all section content in index.html — section headers get `.fade-in-up`, cards get `.fade-in-up .stagger-N`

- [ ] **Step 3: Update `js/animation.js`** — Single Intersection Observer with threshold 0.1 that adds `--visible` classes when elements enter viewport. `prefers-reduced-motion` check: if user prefers reduced motion, elements start visible (no animation)

- [ ] **Step 4: Verify** — Sections animate in on scroll, respects reduced motion preference

---

### Task 15: Final Polish + Responsive QA

**Files:**
- Modify: all CSS files as needed

- [ ] **Step 1: Test on 375px width** — verify no horizontal scroll, all sections readable, mobile menu works, touch targets >= 44px

- [ ] **Step 2: Test on 768px width** — verify tablet layout transitions, 2-column grids

- [ ] **Step 3: Test on 1440px width** — verify max-width container, proper centering

- [ ] **Step 4: Accessibility audit** — verify all images have alt text, buttons have labels, focus states visible, heading hierarchy correct (h1 → h2 → h3), color contrast meets 4.5:1, keyboard navigation works, skip-link present

- [ ] **Step 5: Performance check** — verify Google Fonts loaded with `display=swap`, no render-blocking resources, CSS files are in correct order

- [ ] **Step 6: Fix any issues found** in steps 1-5
