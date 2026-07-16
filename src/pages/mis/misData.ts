// Single source of truth for the AI-Powered MIS page (Tata 1mg demo).
// Frontend-only fixtures — no backend, no fetch, no async. All amounts are in
// whole rupees; percentages are plain numbers (e.g. 82.0 = 82.0%). These figures
// are pre-built to tie out (channel GMV sums to total GMV, waterfall subtotals
// resolve) — do not alter them.

/** The seven channels Tata 1mg sells across in this demo. */
export type MISChannelName =
  | 'Amazon'
  | 'Own website'
  | 'Flipkart'
  | 'HealthKart'
  | 'Blinkit'
  | 'Zepto'
  | 'BigBasket';

/** Waterfall rows are either a running cost/deduction (`flow`) or a running total (`subtotal`). */
export type PnLLineKind = 'flow' | 'subtotal';

export interface PnLLine {
  key: string;
  label: string;
  /** Signed rupees. Negative = a cost/deduction; subtotals are positive running totals. */
  amount: number;
  /** Share of GMV, e.g. 82.0 = 82.0% of GMV. */
  pctOfGmv: number;
  kind: PnLLineKind;
}

/** Prior-month headline figures — used only to compute delta arrows on the current period. */
export interface PriorMonthSummary {
  period: string;
  gmv: number;
  netRevenue: number;
  cm1: number;
  ebitda: number;
}

/** Qualitative read on a channel's contribution margin, drives the callout treatment. */
export type ChannelHealth = 'best' | 'strong' | 'healthy' | 'thin' | 'negative' | 'loss';

export interface ChannelMISPerformance {
  channel: MISChannelName;
  /** Gross merchandise value this period, in rupees. */
  gmv: number;
  /** Contribution Margin 1 as a percentage of the channel's GMV. */
  cm1Pct: number;
  health: ChannelHealth;
  /** Short editorial reason surfaced next to the channel (optional). */
  note?: string;
}

export interface ReconciliationCompleteness {
  period: string;
  totalTransactions: number;
  reconciledMatchedPct: number;
  inDisputePct: number;
  inDisputeAmount: number;
  inDisputeExceptions: number;
  pendingSettlementPct: number;
  pendingSettlementAmount: number;
  /** Disputes filed & won on channel portals this month, in rupees. */
  recoveredThisMonth: number;
}

export interface SkuProfitability {
  sku: string;
  channel: MISChannelName;
  /** Net margin as a percentage; negative = loss-making. */
  marginPct: number;
  /** True for negative-margin SKUs surfaced on the kill list. */
  isKillList: boolean;
}

/** Everything the AI-Powered MIS page renders, for one selected period. */
export interface MISDataset {
  period: string;
  priorPeriod: string;
  pnl: PnLLine[];
  priorMonth: PriorMonthSummary;
  channels: ChannelMISPerformance[];
  reconciliation: ReconciliationCompleteness;
  skus: SkuProfitability[];
}

// ── P&L waterfall (June 2026) ────────────────────────────────────────────────
const pnl: PnLLine[] = [
  { key: 'gmv', label: 'GMV', amount: 1_42_00_000, pctOfGmv: 100.0, kind: 'subtotal' },
  { key: 'discounts', label: 'Discounts', amount: -11_36_000, pctOfGmv: 8.0, kind: 'flow' },
  { key: 'returnsRto', label: 'Returns & RTO', amount: -14_20_000, pctOfGmv: 10.0, kind: 'flow' },
  { key: 'netRevenue', label: 'Net Revenue', amount: 1_16_44_000, pctOfGmv: 82.0, kind: 'subtotal' },
  { key: 'cogs', label: 'COGS', amount: -46_58_000, pctOfGmv: 32.8, kind: 'flow' },
  { key: 'grossMargin', label: 'Gross Margin', amount: 69_86_000, pctOfGmv: 49.2, kind: 'subtotal' },
  { key: 'marketplaceCommission', label: 'Marketplace commission', amount: -19_88_000, pctOfGmv: 14.0, kind: 'flow' },
  { key: 'paymentGatewayFees', label: 'Payment gateway fees', amount: -2_84_000, pctOfGmv: 2.0, kind: 'flow' },
  { key: 'shippingLogistics', label: 'Shipping / logistics', amount: -12_78_000, pctOfGmv: 9.0, kind: 'flow' },
  { key: 'packaging', label: 'Packaging', amount: -2_13_000, pctOfGmv: 1.5, kind: 'flow' },
  { key: 'fulfilmentStorage', label: 'Fulfilment / storage fees', amount: -3_55_000, pctOfGmv: 2.5, kind: 'flow' },
  { key: 'cm1', label: 'CM1 (Contribution Margin 1)', amount: 28_68_000, pctOfGmv: 20.2, kind: 'subtotal' },
  { key: 'marketingAds', label: 'Marketing / ads', amount: -17_04_000, pctOfGmv: 12.0, kind: 'flow' },
  { key: 'cm2', label: 'CM2', amount: 11_64_000, pctOfGmv: 8.2, kind: 'subtotal' },
  { key: 'fixedOverheads', label: 'Fixed overheads (salaries, rent, tech)', amount: -8_52_000, pctOfGmv: 6.0, kind: 'flow' },
  { key: 'ebitda', label: 'EBITDA', amount: 3_12_000, pctOfGmv: 2.2, kind: 'subtotal' },
];

// ── Prior month (May 2026), for delta arrows only ────────────────────────────
const priorMonth: PriorMonthSummary = {
  period: 'May 2026',
  gmv: 1_31_00_000,
  netRevenue: 1_07_42_000,
  cm1: 24_89_000,
  ebitda: 1_96_000,
};

// ── Channel performance (GMV sums to ₹1.42 Cr) ───────────────────────────────
const channels: ChannelMISPerformance[] = [
  { channel: 'Amazon', gmv: 38_00_000, cm1Pct: 22, health: 'healthy' },
  { channel: 'Own website', gmv: 24_00_000, cm1Pct: 31, health: 'best', note: 'No marketplace commission' },
  { channel: 'Flipkart', gmv: 22_00_000, cm1Pct: 9, health: 'thin' },
  { channel: 'HealthKart', gmv: 20_00_000, cm1Pct: 24, health: 'strong', note: 'Category specialist' },
  { channel: 'Blinkit', gmv: 16_00_000, cm1Pct: -4, health: 'loss', note: 'Loss-making — negative CM1' },
  { channel: 'Zepto', gmv: 12_00_000, cm1Pct: -2, health: 'negative' },
  { channel: 'BigBasket', gmv: 10_00_000, cm1Pct: 6, health: 'thin' },
];

// ── Reconciliation completeness (June 2026) ──────────────────────────────────
const reconciliation: ReconciliationCompleteness = {
  period: 'June 2026',
  totalTransactions: 2_68_400,
  reconciledMatchedPct: 91.4,
  inDisputePct: 6.2,
  inDisputeAmount: 6_80_000,
  inDisputeExceptions: 1_240,
  pendingSettlementPct: 2.4,
  pendingSettlementAmount: 3_10_000,
  recoveredThisMonth: 4_15_000,
};

// ── SKU profitability (winners + kill list) ──────────────────────────────────
const skus: SkuProfitability[] = [
  { sku: 'Whey Protein Isolate 1kg', channel: 'Amazon', marginPct: 34, isKillList: false },
  { sku: 'Omega-3 Fish Oil 60 caps', channel: 'HealthKart', marginPct: 29, isKillList: false },
  { sku: 'Magnesium Glycinate 60 tabs', channel: 'Blinkit', marginPct: -7, isKillList: true },
  { sku: 'Daily Multivitamin 90 tabs', channel: 'Zepto', marginPct: -5, isKillList: true },
  { sku: 'Vitamin D3 + K2 Drops 30ml', channel: 'Blinkit', marginPct: -3, isKillList: true },
];

/** The one dataset the AI-Powered MIS page reads from. */
export const misData: MISDataset = {
  period: 'June 2026',
  priorPeriod: 'May 2026',
  pnl,
  priorMonth,
  channels,
  reconciliation,
  skus,
};
