// Design tokens for the AI-Powered MIS page, retuned to the B2C (recon-labs)
// look: rounded cards with a soft shadow on a light canvas, Inter type. Derived
// from the B2B token set but with radii + card treatment swapped to match the
// main app. Self-contained - the MIS feature imports everything from here so a
// single edit restyles every region.

// ── COLOUR (monochrome + one accent, on the B2C neutral ramp) ───────────────
export const colors = {
  ink: '#111111',
  paper: '#FFFFFF',
  grey700: '#6B7280',
  grey500: '#9CA3AF',
  grey200: '#E5E7EB', // hairline - internal dividers / rules
  grey100: '#F5F5F5', // subtle fills
  canvas: '#F8FAFC', // page background (matches Logistics / other B2C pages)
  accent: '#7A5DBF', // AI accent - the one non-neutral hue on the page
  accentHover: '#6A4FB0',
  accentWash: 'rgba(122, 93, 191, 0.08)',
  inkHover: '#000000',
} as const;

// Internal hairline rule (dividers within a card).
export const hairline = `1px solid ${colors.grey200}`;

// ── CARD SURFACE (rounded + soft shadow, mirrors the B2C MuiPaper) ──────────
export const cardBorder = `1.5px solid ${colors.grey200}`;
export const cardShadow = '0 2px 12px 0 rgba(16,30,54,0.04)';

// ── RADII (the defining B2C restyle - square → rounded) ─────────────────────
export const radii = {
  card: 16, // outer cards / regions
  panel: 12, // inner panels, answer cards, highlighted rows
  control: 10, // buttons, period selector, send button, chat bubbles
  chip: 8, // health / channel tags
  bar: 4, // progress + waterfall bars
  dot: '50%', // legend + freshness dots
} as const;

// Accent keyboard focus ring for custom (non-MUI) interactive elements.
export const focusRingSx = {
  outline: 'none',
  '&:focus-visible': { outline: `2px solid ${colors.accent}`, outlineOffset: '2px' },
} as const;

// ── TYPOGRAPHY ──────────────────────────────────────────────────────────────
export const fontFamily =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const type = {
  pageTitle: { fontSize: 28, lineHeight: '36px', fontWeight: 600 },
  sectionTitle: { fontSize: 18, lineHeight: '26px', fontWeight: 600 },
  metric: { fontSize: 36, lineHeight: '40px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' as const },
  statValue: { fontSize: 24, lineHeight: '30px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' as const },
  body: { fontSize: 14, lineHeight: '20px', fontWeight: 400 },
  label: {
    fontSize: 11,
    lineHeight: '16px',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
} as const;

// Apply to anything numeric.
export const tabularNums = {
  fontVariantNumeric: 'tabular-nums',
  fontFeatureSettings: '"tnum" 1',
} as const;

// ── SPACING (4 / 8 based) ─────────────────────────────────────────────────
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
} as const;

// ── LAYOUT DIMENSIONS ────────────────────────────────────────────────────────
export const shell = {
  canvasMaxWidth: 1280,
  canvasPaddingTop: 24,
  gridGutter: 24,
} as const;
