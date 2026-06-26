// Blinkit rate card for SuperYou — authorised contracted lines plus the flagged
// "Storage Fee v2" charge that has no signed basis (FL-001 / dispute D-1043).
import type { RateCardLine } from './types';
import { disputes } from './receivables';

export const blinkitRateCard: RateCardLine[] = [
  { code: 'MARGIN', label: 'Base margin', contracted: '16% of GMV', authorised: true },
  { code: 'FUL', label: 'Fulfilment fee', contracted: '₹18 / order', authorised: true },
  { code: 'STOR', label: 'Storage', contracted: '₹6 / unit / month', authorised: true },
  { code: 'MKTG', label: 'Marketing / visibility cap', contracted: '≤ 8% of GMV', authorised: true },
  { code: 'RTV', label: 'Damage / RTV', contracted: 'Actuals, ≤ 2% of units', authorised: true },
  { code: 'TCS', label: 'TCS', contracted: '1% · Sec 206C(1H)', authorised: true },
  // Flagged: appears on settlements but not in the signed rate card.
  { code: 'STOR2', label: 'Storage Fee v2', contracted: '6%', authorised: false, note: 'no signed basis' },
];

export const blinkitRateCardMeta = {
  channel: 'Blinkit' as const,
  contractRef: 'BLK-SUPERYOU-FY26',
  effective: 'FY26',
  source: 'Extracted from agreement + 3 email amendments',
} as const;

// Structured breach context. Amount + window are sourced from dispute D-1043 so
// they stay consistent with the Disputes view and flagged issue FL-001.
const breachDispute = disputes.find((d) => d.id === 'D-1043');
export const blinkitBreach = {
  feeLabel: 'Storage Fee v2',
  feePct: 6,
  skuCount: 38,
  since: 'Jun 14',
  amount: breachDispute?.amount ?? 83_400,
  windowDaysRemaining: breachDispute?.windowDaysRemaining ?? 11,
} as const;
