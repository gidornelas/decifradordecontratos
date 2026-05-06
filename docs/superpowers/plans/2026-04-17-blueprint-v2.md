# Decodificador de Contratos — Page Blueprint v2

> Structural layout and content architecture only. No final code.
> Builds on the design system established in PROMPT 1 (tokens.css).

---

## FLOW LOGIC

The 10 sections follow a **product-journey narrative**:

```
HOOK           →  HERO — emotional hook, value proposition
TRUST          →  CREDIBILITY — proof this works
PRODUCT STEP 1 →  UPLOAD — show the input experience
PRODUCT STEP 2 →  ANALYSIS OVERVIEW — show the AI processing
PRODUCT STEP 3 →  RISK VIEWING — show the core output (risks)
PRODUCT STEP 4 →  GUIDED REVIEW — show the reading experience
PRODUCT DEEP   →  DASHBOARD PREVIEW — full product panoramic
ACTION         →  CHECKLIST — tangible takeaway + urgency
CONVERSION     →  FINAL CTA — close with email capture
NAVIGATION     →  FOOTER — standard SaaS footer
```

**Why this order works:**
The page mirrors the user's actual workflow (upload → analyze → view risks → read guided → see dashboard → check off items → sign with confidence). Each section answers the question "what happens next?" so the user never feels lost. It sells by **demonstrating**, not by describing.

---

## VISUAL RHYTHM MAP

```
Section              BG                  Content Density   Height
─────────────────────────────────────────────────────────────────
Navbar               transparent→white   low (nav only)    auto
Hero                 deep-blue gradient  high (2-col)      90vh
Trust/Credibility    white               low (stats row)   compact (80px py)
Upload               neutral-50          medium (centered)  standard (96px py)
Analysis Overview    white               high (split)      tall (128px py)
Risk Viewing         neutral-50          high (split)      tall (128px py)
Guided Review        white               high (split)      tall (128px py)
Dashboard Preview    deep-blue gradient  high (full mock)  tall (128px py)
Checklist            white               medium (list)     standard (96px py)
Final CTA            deep-blue gradient  medium (centered) tall (128px py)
Footer               deep-900            low (columns)     auto
```

Background alternation pattern:
- Sections 1, 3, 5, 7, 9 — **dark or neutral-50** (breathing room)
- Sections 2, 4, 6, 8, 10 — **white** (clean surfaces for UI blocks)
- Dark gradient bookends (Hero, Dashboard, Final CTA) create visual anchors

---

## SECTION 1 — HERO

### Purpose
Emotional hook. The visitor must understand the product, feel the pain it solves, and be compelled to act — all within 3 seconds of landing.

### Content

```
Section Label:    "Decodificador de Contratos" (gold pill badge)
Headline (H1):    "Entenda cada cláusula antes de assinar"
  — Gold gradient on "cláusula" for emphasis
Subtext:          "Transforme linguagem jurídica complexa em texto claro.
                  Identifique riscos ocultos, compreenda suas obrigações
                  e tome decisões mais seguras — em segundos."
```

### UI Blocks

**Left column (55% width):**
1. Section label badge (gold pill)
2. Headline (Playfair Display, 3.5rem, white)
3. Subtitle (Inter, 1.125rem, blue-200)
4. Email capture form — input + "Analisar Grátis" button (inline, rounded-full)
5. Trust micro-text: "Grátis · Sem cartão de crédito · Cancele quando quiser" + shield icon

**Right column (45% width):**
1. Dashboard mockup card (white surface, shadow-4, slight 3D perspective)
2. Inside mockup: simulated contract analysis UI
   - Sidebar with clause list (color-coded dots: red/amber/green)
   - Main area with contract text + inline highlights
   - Risk score ring (conic-gradient) at bottom

### CTA Logic
- **Primary:** Email capture form → "Analisar Grátis" (triggers signup)
- **Secondary:** Scroll indicator (subtle animated chevron below hero)
- CTA repeats trust language to reduce friction

### Hierarchy & Spacing
```
Section:     padding 96px 0 (top accounts for navbar overlap)
Grid:        2-column (55/45), gap 64px
Label:       margin-bottom 24px
Headline:    margin-bottom 20px
Subtitle:    margin-bottom 40px
Form:        margin-bottom 16px
Trust text:  margin-bottom 0
```

---

## SECTION 2 — TRUST / CREDIBILITY

### Purpose
Immediate social proof after the emotional hook. Reduces skepticism before the visitor sees the product details. Compact and scannable — the eye should pass through this in under 3 seconds.

### Content

```
No section label, no headline.
Pure stats row — numbers speak.
```

```
Stat 1:   50.000+       Contratos Analisados
Stat 2:   12.000+       Usuários Ativos
Stat 3:   98%           Taxa de Satisfação
Stat 4:   4.9/5         Avaliação Média
```

### UI Blocks
1. Full-width white strip with top/bottom borders (neutral-200)
2. 4 stat blocks in horizontal flex (justify-around)
3. Each stat: large number (2rem, Playfair, primary-700) + label below (0.875rem, neutral-500)
4. Numbers animate (count-up) when section enters viewport
5. Optional: small press/partner logo strip below stats (grayscale, muted)

### CTA Logic
No CTA. This section is passive trust-building.

### Hierarchy & Spacing
```
Section:     padding 48px 0 (compact — not a full section)
Stats:       flex row, gap 48px
Number:      2rem, font-weight 700
Label:       0.875rem, margin-top 8px
Mobile:      2x2 grid
```

---

## SECTION 3 — UPLOAD

### Purpose
Show the first tangible product interaction. The user visualizes themselves pasting or uploading a contract. This is where the product journey begins — the "aha, that's easy" moment.

### Content

```
Section Label:    "Primeiro Passo"
Headline (H2):    "Envie seu contrato em segundos"
Subtext:          "Cole o texto, faça upload do PDF ou arraste o arquivo.
                  Aceitamos qualquer tipo de documento legal."
```

### UI Blocks

**Centered layout (max-width 800px):**

1. Section header (centered): label + H2 + subtext

2. **Upload panel** (the main visual block):
   - White card, rounded-xl, shadow-3
   - Dashed border dropzone area (neutral-300, 2px dashed)
   - Center content:
     - Upload icon (48px, neutral-400)
     - "Arraste seu contrato aqui" (body, neutral-500)
     - "ou" divider line
     - "Selecionar arquivo" button (btn--secondary)
     - "Cole o texto do contrato" text link below
   - Supported formats strip: "PDF, DOCX, TXT, imagens · até 50 MB"
   - Subtle file icon decorations around the dropzone

3. **Mini illustration** below the panel:
   - 3 small file-type badges (PDF, DOCX, TXT) in a row
   - Arrow pointing down to the next section (visual flow connector)

### CTA Logic
- **Visual CTA:** The upload panel itself IS the CTA — it's interactive-looking
- **Secondary:** Small text link "Cole o texto do contrato" for alternative input
- Scroll connector subtly suggests "keep scrolling to see what happens next"

### Hierarchy & Spacing
```
Section:     padding 96px 0
Header:      margin-bottom 48px (text-center)
Upload panel: max-width 560px, margin 0 auto
Dropzone:    padding 64px 32px, min-height 280px
Format strip: margin-top 16px
File badges:  margin-top 32px, gap 12px
```

---

## SECTION 4 — ANALYSIS OVERVIEW

### Purpose
Show what happens after upload — the AI processing phase. The user sees that their document goes through intelligent analysis. This section sells the technology and builds confidence in the product's depth.

### Content

```
Section Label:    "Análise Inteligente"
Headline (H2):    "Sua IA legal analisa cada cláusula automaticamente"
Subtext:          "Em segundos, o Decodificador mapeia riscos, identifica
                  obrigações e traduz o jargão jurídico para linguagem clara."
```

### UI Blocks

**Two-column split (text left, visual right):**

**Left column (45%):**
1. Section label + H2 + subtext
2. **Analysis steps list** (4 mini-steps, vertical):
   - (1) "Escaneamento de cláusulas" — icon: Scan, small check badge
   - (2) "Detecção de riscos" — icon: ShieldAlert, small check badge
   - (3) "Mapeamento de obrigações" — icon: ListChecks, small check badge
   - (4) "Tradução para linguagem simples" — icon: Languages, small check badge
   - Each step: icon circle (32px) + text + subtle progress indicator
   - Visual: steps "light up" sequentially on scroll (staggered animation)

**Right column (55%):**
1. **Analysis simulation panel** (white card, shadow-3, rounded-xl):
   - Header bar: file name "contrato_aluguel.pdf" + progress indicator
   - Progress bar (70% filled, primary-500, animated fill on scroll)
   - Mini clause list being "scanned" — 4-5 lines of contract text
   - Lines highlight sequentially: neutral → blue (scanning) → red/amber/green (result)
   - Status text: "Analisando cláusula 4 de 12..."
   - Animated scanning effect (subtle blue pulse moving through text)

### CTA Logic
No explicit CTA. The visual flow naturally leads to the next section (risk viewing).

### Hierarchy & Spacing
```
Section:     padding 128px 0 (tall — this is a hero-level product section)
Grid:        2-column (45/55), gap 64px, align-items center
Header:      margin-bottom 0 (left column handles its own spacing)
Steps list:  gap 24px, each step item padding 12px 0
Panel:       min-height 400px
Progress:    margin 16px 0
```

---

## SECTION 5 — RISK VIEWING

### Purpose
The core value proposition visualized. This is the most important product section — it shows the actual output the user cares about: risks identified, scored, and color-coded. This section must make the user think "I need this for my next contract."

### Content

```
Section Label:    "Visualização de Riscos"
Headline (H2):    "Veja os riscos antes de assinar"
Subtext:          "Cada cláusula recebe um nível de risco com explicação clara.
                  Você nunca mais assinará algo sem entender o que está aceitando."
```

### UI Blocks

**Two-column split (visual left, text right) — reversed from previous:**

**Left column (55%):**
1. **Risk visualization panel** (white card, shadow-3, rounded-xl):
   - Header: "Score de Risco" + overall score gauge (large conic-gradient ring)
     - Score: "6/10 — Risco Moderado" (amber)
   - Below gauge: risk breakdown bar (horizontal stacked bar):
     - Red segment (2 cláusulas), Amber segment (1), Green segment (1), Gray (rest)
   - Risk clause list (3 items, each a mini-card):
     - **Risk card 1 (red):** "Cláusula 4.2 — Multa de 100%" — danger-50 bg, left border danger-500
     - **Risk card 2 (red):** "Cláusula 8.3 — Reajuste sem aviso" — danger-50 bg
     - **Risk card 3 (amber):** "Cláusula 7.1 — Renovação automática" — warning-50 bg
   - Each mini-card: risk badge + clause title + one-line plain translation

**Right column (45%):**
1. Section label + H2 + subtext
2. **Legend** (color explanation):
   - 🔴 Alto risco — "Pode prejudicar seus direitos ou finanças" (danger-600)
   - 🟡 Atenção — "Requer atenção, pode conter armadilhas" (warning-600)
   - 🟢 Seguro — "Cláusula padrão sem riscos identificados" (success-600)
3. Small CTA link: "Ver análise completa →" (scrolls to guided review)

### CTA Logic
- **Embedded:** "Ver análise completa →" links to next section
- **Implied:** The risk visualization IS the persuasion — seeing red flags makes users want the product

### Hierarchy & Spacing
```
Section:     padding 128px 0 (tall — high-value section)
Grid:        2-column (55/45), gap 64px, align-items center
Score gauge: 120px diameter, margin-bottom 24px
Breakdown:   height 12px, margin-bottom 32px, rounded-full
Risk cards:  gap 12px, each padding 16px
Legend:      margin-top 32px, gap 16px
```

---

## SECTION 6 — GUIDED REVIEW

### Purpose
Show the reading experience. The user sees how the product helps them actually understand each clause — not just flag risks, but translate them into plain language. This is the "education" section that differentiates from simple risk scanners.

### Content

```
Section Label:    "Leitura Guiada"
Headline (H2):    "Cada cláusula traduzida para a sua linguagem"
Subtext:          "Navegue pelo contrato com anotações inteligentes.
                  Entenda o que cada trecho significa para você."
```

### UI Blocks

**Full-width panel layout (max-width 1000px, centered):**

1. Section header (centered): label + H2 + subtext

2. **Guided review panel** (white card, shadow-3, rounded-xl):
   - **Split view** (50/50):

   **Left half — "Original":**
   - Header: "Contrato Original" (small, neutral-500, mono font)
   - 3-4 lines of dense legal text (monospace, small, neutral-600)
   - Key phrases highlighted with colored backgrounds:
     - Red bg: "multa correspondente a 100% dos valores restantes"
     - Amber bg: "eventuais custos operacionais"
     - Green bg: "serviços descritos no Anexo I"
   - Line numbers on the left gutter (like a code editor)

   **Right half — "Traduzido":**
   - Header: "Tradução Clara" (small, primary-600, sans font)
   - Corresponding plain translations for each highlighted phrase:
     - Red block: "⚠️ Se você cancelar, pagará tudo que restaria no contrato. Multa abusiva."
     - Amber block: "⚠️ 'Custos operacionais' não está definido. Podem cobrar qualquer valor."
     - Green block: "✅ Os serviços estão listados no Anexo I — verifique separadamente."
   - Each block: colored left border, icon, plain text
   - Smooth animation: highlights appear sequentially on scroll

3. **Bottom bar** below panel:
   - Navigation dots (indicating "page 1 of 3")
   - Left/right arrows (decorative — suggests multi-page review)

### CTA Logic
No explicit CTA. The panel's sophistication sells the product depth.

### Hierarchy & Spacing
```
Section:     padding 128px 0 (tall — major product section)
Header:      margin-bottom 48px
Panel:       max-width 1000px, min-height 380px
Split:       50/50, gap 0 (border between halves)
Left half:   padding 32px, font mono, size 0.8rem
Right half:  padding 32px, gap 20px between blocks
Bottom bar:  margin-top 16px, flex center
```

---

## SECTION 7 — DASHBOARD PREVIEW

### Purpose
The panoramic product view. After seeing individual features (upload, analysis, risks, guided review), the user sees the complete dashboard — the command center. This section sells the "professional tool" feeling and shows breadth of capability.

### Content

```
Section Label:    "Painel Completo"
Headline (H2):    "Seu painel de controle para contratos"
Subtext:          "Acompanhe análises, compare versões, monitore prazos e
                  gerencie todos os seus documentos em um só lugar."
```

### UI Blocks

**Full-width, dark background (deep-blue gradient, matching hero):**

1. Section header (centered, white text): label (gold pill on dark) + H2 + subtext (blue-200)

2. **Full dashboard mockup** (the showpiece of the page):
   - Large card (max-width 1100px, centered, shadow-4)
   - Simulated dashboard with:
     - **Top nav bar:** "Decodificador" logo + search bar + user avatar
     - **Left sidebar (narrow):** nav icons (Dashboard, Contratos, Alertas, Configurações)
     - **Main area — grid of widgets:**
       - Widget 1 (top-left): Score gauge (circular, large) — "Risco Geral: 6/10"
       - Widget 2 (top-right): Recent contracts list (3 rows: name + date + risk badge)
       - Widget 3 (bottom-left): Risk distribution bar chart (horizontal bars: red/amber/green)
       - Widget 4 (bottom-right): Upcoming deadlines (2-3 date items with countdown)
     - Each widget: rounded card, shadow-1, subtle border
   - Color coding throughout: risk badges, status indicators, score colors
   - Realistic enough to feel like a real product, not a wireframe

3. **Feature callout row** below mockup (4 items, horizontal):
   - "Análise em lote" | "Comparação de versões" | "Alertas de prazo" | "Relatórios PDF"
   - Each: small icon + label, neutral-300 text on dark bg

### CTA Logic
- **Secondary:** Small "Experimentar o painel →" link below mockup (gold text on dark)
- The dashboard itself is the motivator — users want to access this tool

### Hierarchy & Spacing
```
Section:     padding 128px 0, deep-blue gradient bg
Header:      margin-bottom 64px
Dashboard:   max-width 1100px, aspect-ratio ~16/9
Widget grid: 2x2 inside the main area
Callout row: margin-top 48px, gap 40px
```

---

## SECTION 8 — CHECKLIST

### Purpose
Provide a tangible, actionable takeaway. The checklist frames the product as solving specific, real problems. It also creates urgency — "how many of these have you missed?" This section converts passive interest into active desire.

### Content

```
Section Label:    "Antes de Assinar"
Headline (H2):    "Seu checklist de verificação"
Subtext:          "O Decodificador verifica automaticamente cada um destes pontos
                  para você. Quantos deles você costuma ignorar?"
```

### UI Blocks

**Two-column layout (list left, visual right):**

**Left column (55%):**
1. Section label + H2 + subtext

2. **Checklist items** (8 items, vertical list):
   Each item:
   - Custom checkbox (circle, primary-600 when checked, with checkmark icon)
   - Item text (body, neutral-700)
   - Brief risk description (small, neutral-500, below item text)
   
   Items:
   - ☑ "Cláusulas de multa e cancelamento" — "Penalidades por rescisão antecipada"
   - ☑ "Renovações automáticas" — "Prazos e condições de renovação sem aviso"
   - ☑ "Limitação de responsabilidade" — "Quem assume o risco em cada situação"
   - ☑ "Reajustes de preço" — "Como e quando os valores podem mudar"
   - ☑ "Compartilhamento de dados" — "O que acontece com suas informações"
   - ☑ "Prazos de aviso prévio" — "Quantos dias para cancelar ou reclamar"
   - ☑ "Exclusões de garantia" — "O que NÃO está coberto pelo contrato"
   - ☑ "Foro e resolução de conflitos" — "Onde e como disputas serão resolvidas"

   Visual: items "check off" sequentially on scroll (stagger animation)
   Each check triggers a subtle green pulse

**Right column (45%):**
1. **Summary card** (white surface, rounded-xl, shadow-2):
   - "Score de Verificação" — large percentage (87%) with circular progress ring
   - Text: "7 de 8 pontos verificados"
   - Small risk badge: "1 ponto requer atenção" (amber)
   - Divider
   - Bottom: small confidence message + shield icon
   - "Seu contrato está pronto para revisão" (success-600)

### CTA Logic
- **Implied CTA:** The unchecked items create FOMO — "I should use this tool"
- The summary card shows the desired end state the user wants to reach
- No explicit button needed here

### Hierarchy & Spacing
```
Section:     padding 96px 0 (standard — less than product-heavy sections)
Grid:        2-column (55/45), gap 64px, align-items center
Checklist:   gap 4px (compact list)
Each item:   padding 12px 0, checkbox gap 12px
Summary card: padding 32px, sticky on desktop (optional)
```

---

## SECTION 9 — FINAL CTA

### Purpose
The conversion moment. Users who scrolled this far have seen the full product journey and understand the value. This section must close with urgency, clarity, and minimal friction.

### Content

```
Headline (H2):    "Comece a ler contratos com confiança"
Subtext:          "Junte-se a mais de 12.000 pessoas que já protegemos de
                  cláusulas abusivas. Entenda seus direitos antes de assinar
                  qualquer documento."
```

### UI Blocks

**Centered layout (max-width 640px) on dark gradient background:**

1. Headline (Playfair Display, 2.5rem, white, center)
2. Subtext (Inter, 1.125rem, blue-200, center)
3. Email capture form (centered, max-width 480px):
   - Input: "Seu melhor e-mail" (rounded-full, semi-transparent bg)
   - Button: "Começar Grátis" (btn--primary, rounded-full)
   - Same inline layout as hero form
4. Trust badge (below form):
   - Lock icon + "Seus dados estão seguros. Sem spam. Cancele quando quiser."
5. **Three micro-trust points** (horizontal row below):
   - "Grátis para começar" — Gift icon
   - "Sem cartão de crédito" — CreditCard icon
   - "Análise em 30 segundos" — Zap icon
   - Each: small icon (16px) + label (xs, neutral-400)

### CTA Logic
- **Primary:** Email form → "Começar Grátis" (single conversion action)
- **Trust layer:** Badge + 3 micro-points eliminate last objections
- **Visual bookend:** Matches hero's dark gradient for cohesive page framing

### Hierarchy & Spacing
```
Section:     padding 128px 0, deep-blue gradient bg
Content:     max-width 640px, margin 0 auto, text-center
Headline:    margin-bottom 16px
Subtext:     margin-bottom 40px
Form:        margin-bottom 16px
Trust badge: margin-bottom 32px
Micro-trust: gap 32px, flex justify-center
```

---

## SECTION 10 — FOOTER

### Purpose
Standard SaaS footer for navigation, legal compliance, and brand presence. Must feel complete but not overwhelming.

### Content

No section label or headline. Straight to content.

### UI Blocks

**4-column grid on dark background (deep-900):**

**Column 1 — Brand:**
- Logo: "Decodificador" (Playfair Display, white) + document icon
- Tagline: "Inteligência artificial a serviço dos seus direitos." (neutral-400, small)
- Small LGPD compliance badge

**Column 2 — Produto:**
- "Produto" heading (white, semibold)
- Links: Recursos, Como Funciona, Preços, API, Status

**Column 3 — Empresa:**
- "Empresa" heading
- Links: Sobre, Blog, Carreiras, Contato, Imprensa

**Column 4 — Legal:**
- "Legal" heading
- Links: Termos de Uso, Política de Privacidade, LGPD, Cookies, Segurança

**Bottom row:**
- Left: © 2026 Decodificador de Contratos. Todos os direitos reservados.
- Right: Social icons (Instagram, LinkedIn, X) in circular buttons

### CTA Logic
No primary CTA. Secondary CTAs via navigation links.

### Hierarchy & Spacing
```
Section:     padding 64px 0 32px, deep-900 bg
Grid:        4-column, gap 48px
Column title: margin-bottom 16px
Links:       gap 4px (compact), py 4px each
Bottom row:  border-top rgba(white,0.08), pt 32px, mt 64px
             flex space-between, flex-wrap
Social:      gap 16px
Mobile:      2x2 grid → single column
```

---

## CROSS-SECTION HIERARCHY & SPACING LOGIC

### Spacing Tiers

| Element                    | Token          | Value   | Usage                         |
|---------------------------|----------------|---------|-------------------------------|
| Section padding (compact) | --space-10     | 4rem    | Trust bar, Upload             |
| Section padding (standard)| --space-16     | 6rem    | Checklist                     |
| Section padding (tall)    | --space-20     | 8rem    | Analysis, Risk, Guided, Dash  |
| Section header gap        | --space-10     | 4rem    | Below header, before content  |
| Grid column gap           | --space-10     | 4rem    | Two-column splits             |
| Component internal gap    | --space-5      | 1.5rem  | Between UI blocks inside card |
| List item gap             | --space-3~4    | 0.75-1rem | Checklist items, steps       |
| Micro gap                 | --space-2      | 0.5rem  | Between badge and text        |

### Typography Hierarchy (applied consistently)

| Level       | Font          | Size     | Weight | Color           | Where                           |
|------------|---------------|----------|--------|-----------------|---------------------------------|
| Display    | Playfair      | 3.5rem   | 700    | white           | Hero H1 only                    |
| H1         | Playfair      | 2.5rem   | 700    | white/neutral-900| Final CTA                      |
| H2         | Playfair      | 2rem     | 600    | neutral-900     | All section headlines           |
| H2 (dark)  | Playfair      | 2rem     | 600    | white           | Dashboard section               |
| H3         | Playfair      | 1.25rem  | 600    | neutral-900     | Card titles, step titles        |
| Body LG    | Inter         | 1.125rem | 400    | neutral-600/blue-200 | Subtitles                 |
| Body       | Inter         | 1rem     | 400    | neutral-600     | Descriptions, card text         |
| Body SM    | Inter         | 0.875rem | 400    | neutral-500     | Labels, feature text            |
| Caption    | Inter         | 0.75rem  | 500/600| neutral-400     | Format strip, badges, meta      |
| Mono       | JetBrains Mono| 0.8rem   | 400    | neutral-500     | Contract text in panels         |

### Component Reuse Map

```
Component         Used In                    Instances
──────────────────────────────────────────────────────
Section label     Hero, S3-S9               8x
Card surface      S3 Upload, S4-S7 panels    5x
Risk badge        S5, S6, S8                 10x+
Score ring        S5, S7, S8                 3x
Email form        Hero, S9 Final CTA         2x
Trust text        Hero, S9 Final CTA         2x
Split panel       S4, S5, S6                 3x
Stat block        S2 Trust                   4x
Check icon        S8 Checklist               8x
```

### Animation Staging

| Section         | Trigger                   | Animation                              |
|----------------|---------------------------|----------------------------------------|
| S2 Trust        | Scroll into viewport       | Count-up numbers (2s, eased)          |
| S3 Upload       | Scroll into viewport       | Fade-in panel                          |
| S4 Analysis     | Scroll into viewport       | Steps light up sequentially (200ms stagger) |
| S4 Analysis     | Scroll into viewport       | Progress bar fills, lines highlight    |
| S5 Risk         | Scroll into viewport       | Score gauge fills, risk cards stagger in |
| S6 Guided       | Scroll into viewport       | Highlights appear sequentially (300ms) |
| S7 Dashboard    | Scroll into viewport       | Fade-in with slight scale (0.98→1)    |
| S8 Checklist    | Scroll into viewport       | Items check off sequentially (150ms)   |
| All             | pref-reduced-motion        | Everything starts visible, no animation|

### Responsive Behavior

| Breakpoint   | Layout Changes                                                  |
|-------------|------------------------------------------------------------------|
| >= 1024px    | Full 2-column layouts, full dashboard mockup, horizontal stats   |
| 768-1023px   | 2-col grids → 2-col where possible, dashboard mockup scales down |
| < 768px      | All grids → 1 column, panels stack vertically, stats → 2x2 grid  |
| < 768px      | Upload panel fills width, dashboard mockup simplified/hidden     |
| < 768px      | Hero: single column, mockup below text, form stacks              |

### Z-Index Layer Map

```
100  — Navbar (sticky)
200  — Mobile menu (slide-in panel)
300  — Overlay (mobile menu backdrop)
9999 — Skip-link (accessibility)
```

---

## SECTION INTERCONNECTION FLOW

```
HERO ──→ "What is this?"
  │         ↓ Stats build trust
TRUST ──→ "Does it work?"
  │         ↓ Show the input
UPLOAD ──→ "How do I start?"
  │         ↓ Show the processing
ANALYSIS ──→ "What happens next?"
  │         ↓ Show the results
RISK VIEW ──→ "What will I see?"
  │         ↓ Show the reading experience
GUIDED ──→ "How do I understand it?"
  │         ↓ Show the full picture
DASHBOARD ──→ "What's the complete tool?"
  │         ↓ Show the checklist
CHECKLIST ──→ "What exactly do I get?"
  │         ↓ Close the sale
FINAL CTA ──→ "Start now"
  │
FOOTER ──→ Navigation + legal
```

Each section answers the natural question the previous section raises. The user never thinks "but what about ___?" because the next section already addresses it.
