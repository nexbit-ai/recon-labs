// B2B design tokens — single source of truth for the Nexbit B2B module.
// Mirrors docs/B2B_DESIGN_SYSTEM.md exactly. Do not add colours or rounded corners.
import { createTheme } from '@mui/material/styles';

// ── COLOUR (monochrome + exactly one accent) ───────────────────────────────
export const colors = {
  ink: '#111111',
  paper: '#FFFFFF',
  grey700: '#6B7280',
  grey500: '#9CA3AF',
  grey200: '#E5E7EB', // hairline — all borders / dividers / rules
  grey100: '#F5F5F5', // subtle fills
  accent: '#7A5DBF',
  accentHover: '#6A4FB0',
  accentWash: 'rgba(122, 93, 191, 0.06)',
} as const;

// Semantic aliases
export const hairline = `1px solid ${colors.grey200}`;

// ── TYPOGRAPHY ──────────────────────────────────────────────────────────────
export const fontFamily =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Exact px type scale. Weights limited to 400 / 500 / 600.
export const type = {
  pageTitle: { fontSize: 28, lineHeight: '36px', fontWeight: 600 },
  sectionTitle: { fontSize: 18, lineHeight: '26px', fontWeight: 600 },
  metric: { fontSize: 36, lineHeight: '40px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' as const },
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

// ── SHELL DIMENSIONS ────────────────────────────────────────────────────────
export const shell = {
  sidebarWidth: 240,
  topBarHeight: 56,
  canvasMaxWidth: 1280,
  canvasPaddingX: 32,
  canvasPaddingTop: 24,
  gridGutter: 24,
} as const;

// ── B2B MUI THEME (scoped — never leaks into B2C) ──────────────────────────
// Square corners everywhere, no shadows, hairline structure.
export const b2bTheme = createTheme({
  palette: {
    mode: 'light',
    background: { default: colors.paper, paper: colors.paper },
    primary: { main: colors.ink, contrastText: colors.paper },
    secondary: { main: colors.accent, contrastText: colors.paper },
    text: { primary: colors.ink, secondary: colors.grey700, disabled: colors.grey500 },
    divider: colors.grey200,
  },
  shape: { borderRadius: 0 },
  spacing: 8,
  typography: {
    fontFamily,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: { ...type.pageTitle },
    h2: { ...type.sectionTitle },
    body1: { ...type.body },
    body2: { fontSize: 13, lineHeight: '18px', fontWeight: 400 },
    button: { fontSize: 13, fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    caption: { ...type.label },
  },
  components: {
    // Kill rounded corners and shadows globally within the B2B subtree.
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: 0, boxShadow: 'none', border: hairline, backgroundImage: 'none' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 0, boxShadow: 'none', textTransform: 'none', fontWeight: 600, padding: '10px 20px' },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 0, fontWeight: 500 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiInputBase: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiSelect: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: 0, border: hairline, boxShadow: 'none' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 0 } } },
    MuiDivider: { styleOverrides: { root: { borderColor: colors.grey200 } } },
    MuiAvatar: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: colors.grey200 } } },
  },
});
