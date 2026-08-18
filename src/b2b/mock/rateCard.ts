// Blinkit rate card for the Cosmix demo - FMCG/wellness terms.
// Carries one unauthorised "Cold Storage Surcharge" line that reconciliation
// flags as a contract breach.
import type { RateCardLine } from './types';

export const blinkitRateCard: RateCardLine[] = [
  { code: 'COMM', label: 'Base commission', contracted: '20% of GMV', authorised: true },
  { code: 'FUL', label: 'Fulfilment fee', contracted: '₹12 / order', authorised: true },
  { code: 'HAND', label: 'Handling fee', contracted: '₹4 / unit', authorised: true },
  { code: 'STOR', label: 'Dark store storage', contracted: '₹3 / unit / month', authorised: true },
  { code: 'MKTG', label: 'Visibility / ad cap', contracted: '≤ 5% of GMV', authorised: true },
  { code: 'FL-001', label: 'Cold Storage Surcharge', contracted: '2.5% of GMV', authorised: false, note: 'Not in signed agreement - first appeared Jun 2026, applied across all wellness SKUs' },
  { code: 'TCS', label: 'TCS', contracted: '1% · Sec 206C(1H)', authorised: true },
];

// The breach meta for the unauthorised cold storage surcharge.
export const blinkitBreach = {
  feeLabel: 'Cold Storage Surcharge',
  feePct: 2.5,
  amount: 82_000,
  since: 'Jun 2026',
  skuCount: 6,
  windowDaysRemaining: 38,
} as const;
