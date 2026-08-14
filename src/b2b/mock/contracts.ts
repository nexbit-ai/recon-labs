// Per-channel contracts (rate cards) and the secondary-discount register for Cosmix.
// Channels: Blinkit (Quick-commerce SOR), Zepto (Quick-commerce SOR),
//           Reliance (Modern Trade), Cafes – Bangalore (Direct Supply).
import type { ChannelContract, SecondaryDiscount, DiscountStatus, ChannelName } from './types';
import { blinkitRateCard } from './rateCard';

// Fixed "today" for the demo so discount statuses are deterministic.
export const TODAY = '2026-08-13';

// ── PER-CHANNEL CONTRACTS ───────────────────────────────────────────────────
export const channelContracts: ChannelContract[] = [
  {
    channel: 'Blinkit',
    model: 'Quick-commerce (SOR)',
    contractRef: 'BLK-CTR-FY26',
    effective: 'FY26',
    source: 'Extracted from agreement + 3 email amendments',
    rateCard: blinkitRateCard, // carries the flagged "Cold Storage Surcharge" (FL-001)
  },
  {
    channel: 'Zepto',
    model: 'Quick-commerce (SOR)',
    contractRef: 'ZEP-CTR-FY26',
    effective: 'FY26',
    source: 'Extracted from agreement + 2 email amendments',
    rateCard: [
      { code: 'MARGIN', label: 'Base margin', contracted: '22% of GMV', authorised: true },
      { code: 'FUL', label: 'Fulfilment fee', contracted: '₹14 / order', authorised: true },
      { code: 'PLAT', label: 'Platform support', contracted: '2% of GMV', authorised: true },
      { code: 'STOR', label: 'Dark store storage', contracted: '₹4 / unit / month', authorised: true },
      { code: 'MKTG', label: 'Visibility cap', contracted: '≤ 6% of GMV', authorised: true },
      { code: 'TCS', label: 'TCS', contracted: '1% · Sec 206C(1H)', authorised: true },
    ],
  },
  {
    channel: 'Reliance',
    model: 'Modern Trade (Credit terms)',
    contractRef: 'REL-CTR-FY26',
    effective: 'FY26',
    source: 'Vendor portal agreement + 1 email amendment',
    rateCard: [
      { code: 'MARGIN', label: 'Trade margin', contracted: '18% of MRP', authorised: true },
      { code: 'LIST', label: 'Listing fee', contracted: '₹5,000 / SKU / quarter', authorised: true },
      { code: 'SHELF', label: 'Shelf placement', contracted: '₹2,500 / month / store', authorised: true },
      { code: 'PROMO', label: 'Promotional co-fund', contracted: '3% of GMV (during campaigns)', authorised: true },
      { code: 'LOG', label: 'Logistics deduction', contracted: 'Actuals - capped at 2% of invoice', authorised: true },
      { code: 'RET', label: 'Returns / damages', contracted: 'Actuals - brand-inspected returns only', authorised: true },
      { code: 'CREDIT', label: 'Credit terms', contracted: '45 days from invoice date', authorised: true },
      { code: 'TCS', label: 'TCS', contracted: '1% · Sec 206C(1H)', authorised: true },
    ],
  },
  {
    channel: 'Cafes – Bangalore',
    model: 'Direct Supply (120+ accounts)',
    contractRef: 'CAF-BLR-FY26',
    effective: 'FY26',
    source: 'Email agreements - terms vary by cafe (some verbal)',
    rateCard: [
      { code: 'PRICE', label: 'Wholesale price', contracted: 'MRP less 30–40% (varies by cafe)', authorised: true },
      { code: 'LOG', label: 'Delivery / logistics', contracted: 'Included (Bangalore dispatch)', authorised: true },
      { code: 'PAY', label: 'Payment terms', contracted: '7 days from delivery (most cafes)', authorised: true },
      { code: 'RET', label: 'Returns', contracted: 'Case-by-case - no standard policy', authorised: true, note: 'No signed returns SLA - handled informally' },
      { code: 'PROMO', label: 'Sampling / promos', contracted: 'Ad-hoc - brand absorbs cost', authorised: true },
    ],
  },
];

export const contractByChannel = (channel: ChannelName): ChannelContract | undefined =>
  channelContracts.find((c) => c.channel === channel);

// ── SECONDARY DISCOUNTS (the promo register) ────────────────────────────────
export const secondaryDiscounts: SecondaryDiscount[] = [
  {
    id: 'SD-101',
    channel: 'Blinkit',
    name: 'August Wellness Week',
    skuIds: ['COS-PRO', 'COS-COL', 'COS-IMM'],
    discountType: 'percent',
    discountValue: 15,
    brandFundedPct: 60,
    startDate: '2026-08-01',
    endDate: '2026-08-07',
    unitsInWindow: 3800,
    avgSellingPrice: 420,
  },
  {
    id: 'SD-102',
    channel: 'Blinkit',
    name: 'Independence Day Flash',
    skuIds: ['COS-SKN', 'COS-ENR'],
    discountType: 'perUnit',
    discountValue: 50,
    brandFundedPct: 50,
    startDate: '2026-08-13',
    endDate: '2026-08-16',
    unitsInWindow: 2200,
    avgSellingPrice: 380,
  },
  {
    id: 'SD-201',
    channel: 'Zepto',
    name: 'Protein Push',
    skuIds: ['COS-PRO', 'COS-ENR'],
    discountType: 'perUnit',
    discountValue: 40,
    brandFundedPct: 50,
    startDate: '2026-08-05',
    endDate: '2026-08-12',
    unitsInWindow: 1600,
    avgSellingPrice: 450,
  },
  {
    id: 'SD-301',
    channel: 'Reliance',
    name: 'In-Store Tasting Week',
    skuIds: ['COS-IMM', 'COS-SLP'],
    discountType: 'percent',
    discountValue: 10,
    brandFundedPct: 100,
    startDate: '2026-08-10',
    endDate: '2026-08-17',
    unitsInWindow: 900,
    avgSellingPrice: 520,
  },
];

/** Live status of a discount relative to `today` (default: the demo's TODAY). */
export function discountStatus(d: SecondaryDiscount, today: string = TODAY): DiscountStatus {
  if (today < d.startDate) return 'Scheduled';
  if (today > d.endDate) return 'Ended';
  return 'Active';
}

/**
 * The reconciliation impact of a configured discount for its window:
 *  - gross: total markdown value across the window,
 *  - brandFunded: the slice the brand pays - this is the amount by which the
 *    "expected amount to receive" drops.
 */
export function discountImpact(d: SecondaryDiscount): {
  gross: number;
  brandFunded: number;
  platformFunded: number;
} {
  const gross =
    d.discountType === 'percent'
      ? d.unitsInWindow * d.avgSellingPrice * (d.discountValue / 100)
      : d.unitsInWindow * d.discountValue;
  const brandFunded = Math.round(gross * (d.brandFundedPct / 100));
  return { gross: Math.round(gross), brandFunded, platformFunded: Math.round(gross) - brandFunded };
}

/** Short discount value label, e.g. "15% off" or "₹40 / unit". */
export function discountValueLabel(d: SecondaryDiscount): string {
  return d.discountType === 'percent' ? `${d.discountValue}% off` : `₹${d.discountValue} / unit`;
}
