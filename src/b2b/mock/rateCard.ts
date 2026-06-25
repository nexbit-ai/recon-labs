// Blinkit rate card for SuperYou — authorised contracted lines plus the
// flagged "Storage Fee v2" charge that has no signed basis (FL-001).
import type { RateCardLine } from './types';

export const blinkitRateCard: RateCardLine[] = [
  { code: 'COMM', label: 'Marketplace commission', contracted: '16% of GMV', authorised: true },
  { code: 'FUL', label: 'Fulfilment fee', contracted: '₹18 / order', authorised: true },
  { code: 'STOR', label: 'Storage fee', contracted: '₹6 / unit / month', authorised: true },
  { code: 'PICK', label: 'Pick & pack', contracted: '₹9 / unit', authorised: true },
  { code: 'RTO', label: 'Return handling', contracted: '₹22 / return', authorised: true },
  { code: 'ADS', label: 'Visibility / ad-recovery', contracted: 'Per signed media plan', authorised: true },
  // Flagged: appears on settlements but not in the signed rate card.
  { code: 'STOR2', label: "Storage Fee v2", contracted: 'No signed basis — applied to 38 SKUs from Jun 14', authorised: false },
];

export const blinkitRateCardMeta = {
  channel: 'Blinkit' as const,
  contractRef: 'BLK-SUPERYOU-FY26',
  effective: 'FY26',
} as const;
