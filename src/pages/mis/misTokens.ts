// Local semantic status colours for the AI-Powered MIS page only.
// Three semantically distinct segments for the reconciliation-completeness bar
// and channel/SKU health. Deliberately DESATURATED (enterprise, not neon) to
// stay calm within the mostly-monochrome page. Centralised so no component
// hardcodes a hex value inline.
import { colors } from './tokens';

export const statusColors = {
  /** Matched / reconciled - muted green. */
  positive: '#2F7D57',
  positiveWash: 'rgba(47, 125, 87, 0.08)',
  /** In dispute - muted amber. */
  warning: '#B7791F',
  warningWash: 'rgba(183, 121, 31, 0.08)',
  /** Pending settlement - neutral grey (reuses the core token). */
  neutral: colors.grey500,
} as const;

export type StatusTone = keyof typeof statusColors;
