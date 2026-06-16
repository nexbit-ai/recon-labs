# Premium UI/UX Guidelines: Zero-Jitter & High-Fidelity Dashboards

This document outlines the strict UI/UX best practices that must be followed when building or refactoring components in this repository, ensuring a rock-solid, enterprise-grade feel with absolutely zero layout shifts or jitter.

## 1. Zero-Jitter Tables
Data tables must never shift, expand, or collapse based on the data they contain.
- **Fixed Layout**: Always use `tableLayout: 'fixed'` on `<Table>` components. This prevents the browser from dynamically recalculating column widths based on the varying content inside the body rows.
- **Fixed Header Widths**: Define strict `width` properties (e.g., `width: '160px'`) on header cells (`TableCell` inside `TableHead`). The columns will lock rigidly to these dimensions.
- **Permanent Scrollbars**: If a table container uses `overflowY: 'auto'`, switching between high-row-count data (which triggers a scrollbar) and low-row-count data (which hides it) will cause a horizontal column jump (~15px) as the container expands to reclaim the scrollbar space. Fix this by enforcing `overflowY: 'scroll'` on the `TableContainer` to make the scrollbar track permanent.
- **Height Locking**: Never use `maxHeight` on table containers. Use fixed `height` (e.g., `height: 'calc(100vh - 200px)'`) to guarantee that the pagination footer remains anchored at the exact same vertical pixel coordinate regardless of whether the table returns 10,000 rows or 1 row.

## 2. Stable Navigation & Tabs
Horizontal navigation elements and tabs must never resize based on their content, as this causes horizontal cascading shifts.
- **Rigid Dimensions**: Instead of relying on `minWidth` and content padding, explicitly set `width`, `minWidth`, and `maxWidth` to a hardcoded value (e.g., `180px`). This ensures the tab never shrinks or grows when internal counts (e.g., `Matched (10,000)` vs `Matched (1)`) fluctuate.
- **Anchored Text Alignment**: Avoid `justifyContent: 'center'` for dynamic text blocks inside fixed-width containers. Center-alignment causes text to drift left/right as the total character count changes. Instead, anchor content to a specific edge (e.g., `justifyContent: 'flex-start'`) to ensure titles remain perfectly motionless.

## 3. Non-Intrusive Floating Overlays
Interactive elements like search bars or popovers must not disrupt the document flow.
- **Absolute Positioning**: Expanding search bars or filter dropdowns must use `position: 'absolute'` with a high `zIndex`. This completely removes them from the table layout flow, preventing them from violently expanding row heights or column widths.
- **Alignment Boundary**: Anchor popovers carefully. If a popover belongs to the first column, align it to the left edge (`left: 0`) rather than the center (`left: 50%`, `transform: translateX(-50%)`) to prevent the popover from overflowing off the screen viewport.
- **Width Constraint**: Ensure floating elements within table cells respect their bounding box boundaries (e.g., using `width: 'calc(100% - 16px)'`) to prevent them from visually bleeding over adjacent columns.

## 4. Unified Loading States
- Avoid injecting loading bars directly into the document flow where they force surrounding elements down. Use a single, absolutely positioned premium gradient loading bar anchored to the top of the container (`position: 'absolute', top: 0, left: 0, right: 0, height: '3px'`). This provides immediate feedback while guaranteeing zero vertical layout shifts.

## 5. Enterprise Color Palette
To maintain a professional, high-fidelity enterprise appearance, avoid "vibe coded" aesthetics that rely heavily on bright primary colors (e.g., generic reds, greens, yellows, blues).
- **Core Palette**: Stick strictly to a monochrome scale of **Black, White, and Greys**.
- **Accent Color**: Use **`#7A5DBF`** (signature purple) sparingly for active states, primary actions, or in-progress status indicators.
- **Status Indicators**: Instead of vividly colored chips, use soft grey backgrounds (`#f3f4f6`, `#f9fafb`, `#e5e7eb`) with dark text (`#111827`, `#4b5563`). Only use `#7A5DBF` (with a low-opacity background like `rgba(122, 93, 191, 0.05)`) to draw attention to items currently being worked on.
