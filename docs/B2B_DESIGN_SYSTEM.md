# B2B Design System — Settlement Reconciliation & Receivables

**Module:** B2B (FMCG brand receivables / settlement reconciliation) · Demo customer: **SuperYou**
**Status:** Authoritative spec. Every later B2B prompt and PR must conform to this document.
**Scope:** Frontend-only, mock-data. No backend, no API calls.

---

## ⛔ HARD CONSTRAINTS — NON-NEGOTIABLE

1. **Square corners only.** `border-radius: 0` on every surface — cards, buttons, inputs, chips, containers, menus, dialogs. A 2px maximum is tolerated *only* if a global reset physically forces it; never by choice.
2. **Monochrome + exactly ONE accent.** Near-black ink, white, a 4-step grey ramp, and a single accent (`#7A5DBF`). No other hues. No red / amber / green for status.
3. **One consistent sans font. No serif, no display font.** Reuse the B2C UI font (Inter, system-ui fallback). Weights limited to **400 / 500 / 600**.

If a request conflicts with any of the three, this document wins. Flag the conflict; do not silently break the rule.

---

## 0. Context — what B2C already uses (source of truth inspected)

| Concern | B2C reality | B2B decision |
| --- | --- | --- |
| Styling engine | MUI v6 + Emotion (`sx` props, `createTheme` in `src/App.tsx`) | Same engine. Add a dedicated B2B theme/tokens file. |
| Tokens location | Inline in the `createTheme` object, `src/App.tsx` | New file: `src/b2b/theme/b2bTokens.ts` |
| Font | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | Reuse Inter + system fallback. |
| Corners | Rounded (Paper 16px, Button/Chip/Input 8px) | **Diverge → 0px everywhere.** This is the deliberate B2B signature. |
| Accent | Brand black `#111` as `primary`; signature purple **`#7A5DBF`** documented in `UI_UX_BEST_PRACTICES.md` | Reuse `#7A5DBF` as the single accent. |
| Icons | `@mui/icons-material` (Outlined set) | Reuse MUI Outlined icons — do **not** introduce lucide; consistency with B2C beats the suggestion. |
| Motion | `framer-motion`; count-up via `useSpring` in `KPICard` | Reuse; add `prefers-reduced-motion` guard. |

> The B2B module keeps B2C's font, icon set, and engine for family resemblance, but asserts its own discipline through **square corners, hairline structure, and strict monochrome-plus-one color**.

---

## 1. PRINCIPLES

- **Modern, classy, restrained, data-forward.** The numbers — money owed, recovered, reconciled — are the only visual interest.
- **Nothing decorative.** No gradients, no glow, no illustrative flourish, no colored badges-for-decoration.
- **Structure over ornament.** Hierarchy comes from whitespace, hairline borders, type weight, and alignment — not from shadow or color.
- **Color signals, never decorates.** If a color isn't communicating state or directing the single most important action, it doesn't appear.
- **Quiet confidence.** Dense where data lives, generous in margins. The interface should feel like a well-set financial statement.

---

## 2. TYPOGRAPHY

**Family (single, sans, no serif/display):**
```
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

**Weights — only these three:** `400` (regular), `500` (medium), `600` (semibold). Never 700+.

**Type scale (exact px):**

| Token | px | Line height | Weight | Notes |
| --- | --- | --- | --- | --- |
| Page title | **28** | 36 | 600 | One per view, top of canvas. |
| Section title | **18** | 26 | 600 | Card headers, table group headers. |
| Card metric (large number) | **36** | 40 | 500 | The hero number in a stat block. `tabular-nums`. |
| Body | **14** | 20 | 400 | Default text, table cells. |
| Label / caption | **11** | 16 | 500 | Uppercase, `letter-spacing: 0.06em`. Column headers, field labels. |

**Tabular figures (mandatory for all numerics):**
```css
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum" 1;
```
Apply to every currency value, count, percentage, date column, and the card metric so digits align in columns and don't jitter on count-up.

---

## 3. COLOR — STRICT

**Base ink & paper**

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#111111` | Primary text, primary-button fill, icons. |
| `paper` | `#FFFFFF` | Canvas, card, table background. |

**Grey ramp (4 steps)**

| Token | Hex | Use |
| --- | --- | --- |
| `grey-700` | `#6B7280` | Secondary text, captions, inactive nav labels. |
| `grey-500` | `#9CA3AF` | Disabled text, placeholder, de-emphasized numbers. |
| `grey-200` (**hairline**) | `#E5E7EB` | **All borders / dividers / table rules.** The structural workhorse. |
| `grey-100` | `#F5F5F5` | Subtle fills: chip background, table header band, hover row, zebra. |

**Accent — exactly one**

| Token | Hex | Allowed uses (and *only* these) |
| --- | --- | --- |
| `accent` | `#7A5DBF` | (1) the primary action, (2) the single most important metric on a view, (3) active sidebar nav state, (4) "recovered" amounts. |
| `accent-wash` | `rgba(122,93,191,0.06)` | Low-opacity fill behind an active nav item or an in-progress row. Never a large surface. |

**Forbidden:** any red / amber / green / blue for status. Warnings, exceptions, overdue items, and emphasis are expressed through **type weight (500/600), hairline borders, grey-100 fills, and the accent only** — never a second hue.

- Overdue / needs-attention → weight 600 ink + a hairline-bordered chip, optionally accent-left-rule. Not red.
- Reconciled / settled / neutral → grey-700 text, grey-100 chip. Not green.
- Recovered → this is the one positive signal worth the accent: render the amount in `accent`.

---

## 4. SHAPE & SURFACE

- **`border-radius: 0`** on cards, buttons, inputs, selects, chips, menus, dialogs, avatars, tabs. No exceptions by choice (2px ceiling only if a reset forces it).
- **Structure = 1px hairline.** Border color is **`#E5E7EB`** (`grey-200`), `1px solid`. Use it for card outlines, table row rules, sidebar/topbar edges, input borders, and section separators.
- **No drop shadows.** Build depth with borders and whitespace. If a shadow is unavoidable (e.g. a floating menu over content), it must be near-invisible: `0 1px 0 rgba(17,17,17,0.04)` maximum. No elevation ramps.
- **Hover/active** on surfaces is communicated by a grey-100 fill or a hairline darkening to ink — never a shadow lift or scale transform.

---

## 5. SPACING & LAYOUT

**Spacing scale (4 / 8 based):**
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` (px). Base unit 8 (matches B2C `spacing: 8`); 4 and 12 allowed for tight intra-component gaps. Avoid arbitrary values.

**The B2B shell:**

```
┌──────────────┬───────────────────────────────────────────────┐
│              │  TOP BAR  (h 56px, hairline bottom)            │
│  SIDEBAR     ├───────────────────────────────────────────────┤
│  (w 240px)   │                                                │
│  hairline    │   CONTENT CANVAS                               │
│  right edge  │   max-width 1280px, centered                   │
│              │   horizontal padding 32px, top padding 24px    │
│  nav items   │   12-column grid, 24px gutter                  │
│  active=      │                                                │
│  accent      │                                                │
└──────────────┴───────────────────────────────────────────────┘
```

- **Sidebar:** fixed width **240px**, white, `1px` hairline right edge, square nav items. (B2C uses 168px; B2B widens for longer receivables labels.)
- **Top bar:** height **56px**, white, `1px` hairline bottom; holds page context / org switcher / account.
- **Content canvas:** `max-width: 1280px`, centered; horizontal padding **32px**, top padding **24px**; **12-column grid, 24px gutter**. Stat blocks typically span 3 or 4 columns each.

---

## 6. COMPONENT CONVENTIONS

All square (`border-radius: 0`). All borders `1px solid #E5E7EB` unless stated.

**Primary button**
- Fill `#111111` (ink) by default; the single most important CTA on a view may instead fill `accent` `#7A5DBF`. Text white, weight 600, 13px, `letter-spacing: 0.01em`.
- Padding `10px 20px`. No shadow.
- Hover: ink → `#000`; accent → `#6A4FB0`. Active: 1px inset hairline. Disabled: grey-100 fill, grey-500 text. Focus: 1px accent outline offset 2px.

**Secondary button**
- Transparent fill, `1px solid #E5E7EB`, ink text weight 500. Hover: grey-100 fill. Same padding/square as primary.

**Card**
- White, `1px solid #E5E7EB`, **no shadow**, radius 0. Inner padding 24px.
- Optional header row: section title (18/600) left, optional secondary action right, hairline divider below.

**Data table**
- Header row: grey-100 band, labels in **label/caption** style (11px, uppercase, 500, `letter-spacing 0.06em`, grey-700).
- Body rows separated by `1px` hairline rules (no vertical grid lines). Row height 48px. Optional hover fill grey-100.
- All numeric/currency/date cells right-aligned with `tabular-nums`. Recovered amounts render in `accent`.
- Zero-jitter rules from `UI_UX_BEST_PRACTICES.md` apply: fixed layout, fixed header widths, permanent scrollbar, height-locked container.

**Chip / label**
- Square, grey-100 fill, grey-700 text, weight 500, 12px, padding `4px 8px`. "Attention" variant: white fill + `1px` ink hairline + ink text 600. No colored chips.

**Sidebar nav item**
- Height 44px, square, label 14/500 grey-700 + Outlined icon.
- **Active:** label + icon in `accent` `#7A5DBF`, `accent-wash` fill, and a 2px accent left rule. Inactive hover: grey-100 fill, no color change.

**Metric / stat block**
- Label/caption on top (11px uppercase grey-700), metric below (**36px / 500**, `tabular-nums`). The one most-important metric per view is `accent`; all others ink.
- Optional sub-line: 14px grey-700 (e.g. "vs last cycle"). No colored deltas — use ▲/▼ glyphs + ink/grey weight, never red/green.

**Monochrome status indicator**
- A small square 8px dot or a hairline-bordered chip carrying a text status. Differentiate states by **fill darkness** (white → grey-100 → grey-500 → ink) and **weight**, plus accent only for "in progress / recovered". Always pair with a text label — never rely on the swatch alone.

---

## 7. ICONOGRAPHY & MOTION

- **Icons:** `@mui/icons-material`, **Outlined** variants only (consistency with B2C). Nominal size **20px** in nav/buttons, **16px** inline; uniform stroke. Inherit text color (ink / grey-700 / accent when active). No multicolor or filled icons.
- **Motion (subtle only, via `framer-motion`):**
  - Fades / short slides on mount: `150–200ms`, ease-out. No bounce, no scale-pop.
  - Count-up on key metrics (reuse the `KPICard` `useSpring` pattern) with `tabular-nums` so digits don't reflow.
  - **`prefers-reduced-motion: reduce` → disable count-up and transitions; render final values instantly.** Mandatory.
  - No looping, parallax, or attention animation.

---

## 8. B2B MODULE ARCHITECTURE

**Frontend-only. No backend, no API calls, no fetch.** Every number comes from a single in-repo mock-data layer with realistic, internally consistent values (settlements reconcile to receivables; recovered + outstanding + reconciled tie out).

**Proposed folder structure:**
```
src/b2b/
├─ theme/
│  └─ b2bTokens.ts        # the tokens file: colors, type scale, spacing, the b2b MUI theme (radius 0)
├─ mock/
│  ├─ index.ts            # single export surface for all mock data
│  ├─ settlements.ts      # settlement/reconciliation records
│  ├─ receivables.ts      # outstanding / recovered / aged receivables
│  └─ brands.ts           # SuperYou + demo entities, retailers, cycles
├─ components/            # B2B-only primitives: StatBlock, DataTable, Chip, NavItem, etc.
├─ views/                 # page-level screens: Overview, Reconciliation, Receivables, Disputes...
├─ layout/
│  └─ B2BShell.tsx        # sidebar + top bar + content canvas
└─ B2BApp.tsx             # B2B root: wraps views in the b2b theme + shell
```

**Mock-data principles:** one source module per domain, re-exported through `mock/index.ts`; figures cross-foot (totals equal the sum of their rows); currency in INR (FMCG / SuperYou context); dates within a coherent recent window. No randomness at render time — fixtures are static so the demo is reproducible.

**B2C / B2B toggle (design intent, not implemented here):**
- A single top-level switch selects which product renders. **B2C → the existing app unchanged** (`src/App.tsx` routes, current theme). **B2B → `B2BApp`** with its own `B2BShell` sidebar and the B2B theme.
- The two products do **not** share a sidebar or theme instance; the B2B theme (radius 0, monochrome+accent) is scoped to the B2B tree only and must never leak into B2C, nor vice-versa.
- The toggle is the only shared surface; everything below it is isolated per product.

---

## Quick token reference

```
INK        #111111      ACCENT       #7A5DBF
PAPER      #FFFFFF      ACCENT-WASH  rgba(122,93,191,0.06)
GREY-700   #6B7280      HAIRLINE     #E5E7EB
GREY-500   #9CA3AF      FILL         #F5F5F5
RADIUS     0            SPACING      4·8·12·16·24·32·48·64
WEIGHTS    400/500/600  NUMERICS     font-variant-numeric: tabular-nums
FONT       Inter, system-ui, …  (no serif / no display)
```
