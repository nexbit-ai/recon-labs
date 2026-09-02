# B2B UX & UI Design Rules

> **Scope**: These rules are mandatory for all B2B interfaces, dashboards, summary cards, tables, and future UI components within the Nexbit platform. Every new screen or modification must adhere strictly to these guidelines.

---

## 1. Strict Color Palette (Only 5 Colors Allowed)

All interfaces must strictly adhere to the restrained 5-color palette. Do not introduce arbitrary colors (no blues, purples, cyans, or bright reds).

| Color Role | Hex Codes | Permitted Usage |
| :--- | :--- | :--- |
| **Black** | `#09090b` / `#111827` | Primary metric numbers, primary CTA buttons, active filter pills, progress bar fill, and high-emphasis ink. |
| **White** | `#ffffff` | Page canvas background, card backgrounds, modal surfaces, and table container surfaces. |
| **Greys** | `Border: #eaecf0`<br>`Fills/Hover: #f4f4f5 / #fafafa`<br>`Labels: #71717a`<br>`Timestamps: #a1a1aa` | Hairline borders, dividers, subtle secondary fills, sentence-case field labels, and muted footnote timestamps. |
| **Green** | `#16a34a` (tint: `#f0fdf4`, border: `#bbf7d0`) | Positive trend indicators (`↗ +12.4%`), SLA/target achievements, and `Closed` / `Settled` status tags. |
| **Yellow / Amber** | `#ca8a04` (tint: `#fefce8`, border: `#fef08a`) | Down trends (`↘ -2 pts`), alerts, quantity shortages, discrepancy amounts, and warning tags. Replaces loud red and orange. |

### ❌ Strictly Prohibited Colors
- **NO `#F8F9FA` background**: The page canvas must be pure crisp white (`#ffffff`).
- **NO rainbow / accent clutter**: No blue, purple, cyan, or red badge colors in cards or headers.

---

## 2. Summary KPI Tiles (No Icons Rule)

Summary cards and KPI metric tiles must follow the minimalist intelligence style:

1. **NO ICONS**: Do not place icon boxes, colored squares, or decorative symbols in summary tiles.
2. **Card Structure**:
   * **Label**: Sentence-case, neutral grey (`#71717a`), font size ~`12.5px`, font weight `450`–`500` (e.g. `Total purchase orders`, `Serviced orders`). Never loud uppercase.
   * **Value**: Stark black (`#09090b`), font size ~`25px`–`28px`, bold (`700`), with `tabular-nums`.
   * **Trend Line**: Inline text with diagonal arrows (`↗` for green positive, `↘` for yellow/amber warning). **No heavy colored pill background**.
   * **Progress Bar** *(where applicable)*: 3px minimalist black bar (`#09090b`) with light grey track (`#e4e4e7`) and target description below.
   * **Footer Timestamp**: Small muted grey text (`#a1a1aa`, `11px`), e.g. `ERP sync · 2 min ago`, `Warehouse dispatch · 06:02`.
3. **Card Container**: Pure white background (`#ffffff`), `1px solid #eaecf0` hairline border, `12px` border radius, subtle hover elevation.

---

## 3. Pill Geometry (`border-radius: 9999px`)

All interactive chips, filters, segmented toggles, and action buttons must use full pill geometry:

- **Active Filter Pills**: Solid black background (`#09090b`), crisp white text (`#ffffff`), font weight `600`.
- **Inactive Filter Pills**: Pure white background (`#ffffff`), hairline border (`1px solid #eaecf0`), dark grey text (`#475569`), hover `#f4f4f5`.
- **Segmented Controls** *(e.g. Amount \| Units \| Quantity)*: Pill container (`#f1f5f9`), with a pure white elevated pill (`#ffffff`, shadow `0 1px 3px rgba(0,0,0,0.08)`) for the selected mode.
- **Action Buttons** *(e.g. Filters, Export, Columns)*: Full pill geometry (`border-radius: 9999px`), white background, hairline border (`#eaecf0`), black/grey text.

---

## 4. Typography & Numerical Precision

- **Tabular Numbers**: All quantities, currency figures, and percentages must have `font-variant-numeric: tabular-nums` (or `fontVariantNumeric: 'tabular-nums'`) to ensure vertical column alignment.
- **Sentence Case**: Use sentence case for all labels, action buttons, tooltips, and footnote timestamps (e.g. `Average deal size`, not `AVERAGE DEAL SIZE`).
- **Column Headers**: Tracked small uppercase (`letter-spacing: 0.04em`–`0.06em`, `font-size: 10.5px`–`11px`, `font-weight: 700`, color `#475569`) is strictly reserved for data table headers.

---

## 5. Table Standards

1. **Containers**: Rounded outer container (`border-radius: 14px`–`16px`), hairline border (`1px solid #eaecf0`), white background.
2. **Headers**: Subtle light grey header row (`#fafafa`), bottom border `1px solid #eaecf0`.
3. **Sticky Column**: Primary identifier column (e.g. `PO ID`) must remain sticky on horizontal scroll with a hairline divider.
4. **Row States**: Default white (`#ffffff`), hover state subtle `#fafafa` or `#f4f4f5`.
5. **Status Badges**:
   - `Closed` / `Settled`: Green `#16a34a`, background `#f0fdf4`, border `#bbf7d0`.
   - `Dispatched` / `Open`: Dark ink `#09090b` / `#27272a`, background `#f4f4f5`, border `#e4e4e7`.
   - `Discrepancy` / `Expired`: Yellow/Amber `#ca8a04`, background `#fefce8`, border `#fef08a`.

---

## 6. Page Layouts & Spacing

- **Fluid Layout**: Do not use `maxWidth` or `mx: 'auto'` on page-level container components. Pages should span the full width (`width: '100%'`).
- **Height Constraints**: Do not use `minHeight: '100vh'` on page-level components, as the `B2BShell` already manages vertical scrolling and viewport height.
- **No Extra Padding**: Do not add extra outer padding (e.g. `p: 3`) to the root container of a page component. The `B2BShell` layout wrapper already applies standard shell padding (`px` and `pt`). Adding extra padding will result in cramped content and double margins.
- **Top Bar Back Navigation**: Include an icon button (e.g. `ArrowBackIcon`) in the top-left of the page content header when a view is a drill-down or child page.

---

## 7. Checklist Before Merging Any UI Change

- [ ] Does the page canvas use `#ffffff` (and NOT `#f8f9fa`)?
- [ ] Are summary cards completely free of icons and colored icon boxes?
- [ ] Are all metrics rendered in `#09090b` with `tabular-nums`?
- [ ] Are positive trends green (`#16a34a`) with `↗` and warnings yellow/amber (`#ca8a04`) with `↘`?
- [ ] Do all filter pills, buttons, and switches use `border-radius: 9999px`?
- [ ] Are all non-table labels in sentence case?
- [ ] Are there zero unauthorized colors (no blues, purples, oranges, or reds)?
- [ ] Does the page layout fill `100%` width without hardcoded `maxWidth` or extra root padding?
