// Per-channel contracts (rate cards) and the secondary-discount register.
// Frontend-only fixtures — no backend. The rate cards define each channel's
// standing fee structure; the secondary discounts are the time-and-SKU-scoped
// promos the brand co-funds. Together they define the "expected amount to
// receive" that reconciliation checks the settlement sheet against.
import type { ChannelContract, SecondaryDiscount, DiscountStatus, ChannelName } from './types';
import { blinkitRateCard } from './rateCard';

// Fixed "today" for the demo so discount statuses are deterministic (Q1 FY26).
export const TODAY = '2026-07-13';

// ── PER-CHANNEL CONTRACTS ───────────────────────────────────────────────────
// Contracted rates chosen to agree with the reconciliation fixtures: Instamart
// commission 16% (RC-2048 flags 20% vs 16%), Zepto Platform Support 2% (RC-6627
// flags 4% vs 2%), Blinkit carries the unauthorised "Storage Fee v2" (FL-001).
export const channelContracts: ChannelContract[] = [
  {
    channel: 'Amazon',
    model: 'FBA / Seller Flex',
    contractRef: 'AMZ-CTR-FY26',
    effective: 'FY26',
    source: 'Extracted from Seller Central terms + 2 rate revisions',
    rateCard: [
      { code: 'REF', label: 'Referral fee', contracted: '15% of GMV', authorised: true },
      { code: 'FBA', label: 'FBA fulfilment fee', contracted: '₹28 / unit · 1kg band', authorised: true },
      { code: 'WT', label: 'Weight handling', contracted: 'Per band · ≤ 1kg', authorised: true },
      { code: 'STOR', label: 'Storage', contracted: '₹22 / cu.ft / month', authorised: true },
      { code: 'RTV', label: 'Removal / disposal', contracted: 'Actuals', authorised: true },
      { code: 'TCS', label: 'TCS', contracted: '1% · Sec 206C(1H)', authorised: true },
    ],
  },
  {
    channel: 'Flipkart',
    model: 'F-Assured',
    contractRef: 'FLP-CTR-FY26',
    effective: 'FY26',
    source: 'Extracted from seller agreement + 1 email amendment',
    rateCard: [
      { code: 'COMM', label: 'Commission', contracted: '18% of GMV', authorised: true },
      { code: 'COLL', label: 'Collection fee', contracted: '₹12 / order', authorised: true },
      { code: 'FIX', label: 'Fixed fee', contracted: '₹10 / order', authorised: true },
      { code: 'SHIP', label: 'Shipping fee', contracted: 'Per weight slab', authorised: true },
      { code: 'RET', label: 'Cancellation / return', contracted: 'Actuals', authorised: true },
      { code: 'TCS', label: 'TCS', contracted: '1% · Sec 206C(1H)', authorised: true },
    ],
  },
  {
    channel: 'Blinkit',
    model: 'Quick-commerce (SOR)',
    contractRef: 'BLK-CTR-FY26',
    effective: 'FY26',
    source: 'Extracted from agreement + 3 email amendments',
    rateCard: blinkitRateCard, // carries the flagged "Storage Fee v2" (FL-001)
  },
  {
    channel: 'Zepto',
    model: 'Quick-commerce (SOR)',
    contractRef: 'ZEP-CTR-FY26',
    effective: 'FY26',
    source: 'Extracted from agreement + 2 email amendments',
    rateCard: [
      { code: 'MARGIN', label: 'Base margin', contracted: '22% of GMV', authorised: true },
      { code: 'FUL', label: 'Fulfilment fee', contracted: '₹15 / order', authorised: true },
      { code: 'PLAT', label: 'Platform support', contracted: '2% of GMV', authorised: true },
      { code: 'STOR', label: 'Storage', contracted: '₹5 / unit / month', authorised: true },
      { code: 'MKTG', label: 'Visibility cap', contracted: '≤ 6% of GMV', authorised: true },
      { code: 'TCS', label: 'TCS', contracted: '1% · Sec 206C(1H)', authorised: true },
    ],
  },
  {
    channel: 'Instamart',
    model: 'Quick-commerce (OR)',
    contractRef: 'IM-CTR-FY26',
    effective: 'FY26',
    source: 'Extracted from agreement + 1 email amendment',
    rateCard: [
      { code: 'MARGIN', label: 'Base margin', contracted: '16% of GMV', authorised: true },
      { code: 'FUL', label: 'Fulfilment fee', contracted: '₹16 / order', authorised: true },
      { code: 'HAND', label: 'Handling fee', contracted: '₹4 / unit', authorised: true },
      { code: 'STOR', label: 'Storage', contracted: '₹5 / unit / month', authorised: true },
      { code: 'MKTG', label: 'Marketing cap', contracted: '≤ 7% of GMV', authorised: true },
      { code: 'TCS', label: 'TCS', contracted: '1% · Sec 206C(1H)', authorised: true },
    ],
  },
];

export const contractByChannel = (channel: ChannelName): ChannelContract | undefined =>
  channelContracts.find((c) => c.channel === channel);

// ── SECONDARY DISCOUNTS (the promo register) ────────────────────────────────
// Multiple promos, multiple SKUs, different windows across the month — exactly
// the shape recon needs declared. Statuses are derived from TODAY, not stored.
export const secondaryDiscounts: SecondaryDiscount[] = [
  {
    id: 'SD-101',
    channel: 'Blinkit',
    name: 'Month-Start Blitz',
    skuIds: ['PW6-CHO', 'PW6-PB', 'MGC-CO'],
    discountType: 'percent',
    discountValue: 15,
    brandFundedPct: 60,
    startDate: '2026-07-01',
    endDate: '2026-07-07',
    unitsInWindow: 4200,
    avgSellingPrice: 180,
  },
  {
    id: 'SD-102',
    channel: 'Blinkit',
    name: 'Mid-Month Mania',
    skuIds: ['SYP-CHO', 'SYP-CC'],
    discountType: 'perUnit',
    discountValue: 45,
    brandFundedPct: 50,
    startDate: '2026-07-10',
    endDate: '2026-07-16',
    unitsInWindow: 2600,
    avgSellingPrice: 899,
  },
  {
    id: 'SD-103',
    channel: 'Blinkit',
    name: 'Weekend Flash',
    skuIds: ['MGC-CHE'],
    discountType: 'percent',
    discountValue: 20,
    brandFundedPct: 100,
    startDate: '2026-07-18',
    endDate: '2026-07-20',
    unitsInWindow: 1500,
    avgSellingPrice: 165,
  },
  {
    id: 'SD-201',
    channel: 'Zepto',
    name: 'Protein Push',
    skuIds: ['SYP-CHO', 'SYP-MC'],
    discountType: 'perUnit',
    discountValue: 40,
    brandFundedPct: 50,
    startDate: '2026-07-05',
    endDate: '2026-07-12',
    unitsInWindow: 1900,
    avgSellingPrice: 899,
  },
  {
    id: 'SD-301',
    channel: 'Amazon',
    name: 'Lightning Deal',
    skuIds: ['SYP-UNF'],
    discountType: 'percent',
    discountValue: 10,
    brandFundedPct: 100,
    startDate: '2026-07-11',
    endDate: '2026-07-14',
    unitsInWindow: 2200,
    avgSellingPrice: 849,
  },
  {
    id: 'SD-401',
    channel: 'Flipkart',
    name: 'Big Billion Warm-up',
    skuIds: ['PW6-CHO', 'PW6-PB'],
    discountType: 'percent',
    discountValue: 12,
    brandFundedPct: 70,
    startDate: '2026-07-20',
    endDate: '2026-07-25',
    unitsInWindow: 3100,
    avgSellingPrice: 179,
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
 *  - brandFunded: the slice the brand pays — this is the amount by which the
 *    "expected amount to receive" drops. Un-declared, this same figure shows up
 *    on the settlement as an unexplained deduction and is flagged as variance.
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
