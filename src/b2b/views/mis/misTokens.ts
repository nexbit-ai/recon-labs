// Local semantic status colours for the AI-Powered MIS page only.
// The core B2B system is monochrome + one accent and has no positive/warning
// tokens, but the reconciliation-completeness bar needs three semantically
// distinct segments. These are deliberately DESATURATED (enterprise, not neon)
// to stay in the spirit of the monochrome look, and centralised here so no
// component hardcodes a hex value inline. MIS-scoped — never imported by the
// shared shell/views.
import { colors } from '../../theme/b2bTokens';

export const statusColors = {
  /** Matched / reconciled — muted green. */
  positive: '#2F7D57',
  positiveWash: 'rgba(47, 125, 87, 0.08)',
  /** In dispute — muted amber. */
  warning: '#B7791F',
  warningWash: 'rgba(183, 121, 31, 0.08)',
  /** Pending settlement — neutral grey (reuses the core token). */
  neutral: colors.grey500,
} as const;

export type StatusTone = keyof typeof statusColors;
