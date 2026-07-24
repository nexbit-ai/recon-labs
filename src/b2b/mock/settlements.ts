// Canonical headline numbers, per-channel performance, flagged leakage, and
// reconciliation line items. Every figure here cross-foots — see assertions at
// the bottom of mock/index.ts. Amounts in whole rupees unless noted.
import type {
  HeadlineMetric,
  ChannelPerformance,
  FlaggedIssue,
  ReconLineItem,
} from './types';

// ── HEADLINE METRICS (the single source of truth for all later views) ───────
export const headline: HeadlineMetric[] = [
  { key: 'settled', label: 'Settled this quarter', value: 2_90_00_000, display: '₹2.90 Cr', unit: 'inr' },
  { key: 'leakage', label: 'Leakage detected (Q1)', value: 10_60_000, display: '₹10.6L', unit: 'inr' },
  // Receivable = what all 5 portals owed you this quarter = settled + leakage.
  // Received = the settled portion; the gap is the leakage.
  { key: 'receivable', label: 'Receivable this quarter', value: 3_00_60_000, display: '₹3.01 Cr', unit: 'inr' },
  { key: 'recoverable', label: 'Recoverable now', value: 6_20_000, display: '₹6.20L', unit: 'inr' },
  { key: 'expiring', label: 'Recoverable expiring within ~10 days', value: 1_40_000, display: '₹1.40L', unit: 'inr' },
  { key: 'recoveredYtd', label: 'Recovered YTD', value: 7_80_000, display: '₹7.80L', unit: 'inr' },
  { key: 'netRealisation', label: 'True net realisation', value: 76.4, display: '76.4%', unit: 'percent' },
];

// Reference for views: the assumption brand planned against, vs reality.
export const netRealisationAssumptionPct = 80;

// Claims won that make up Recovered YTD (₹7.80L), shown as a caption.
export const recoveredYtdClaimsWon = 82;

// Total open issues detected this quarter; the feed surfaces the top few by value.
export const flaggedIssuesTotal = 24;

export const headlineByKey = (key: string): HeadlineMetric =>
  headline.find((m) => m.key === key)!;

// ── PER-CHANNEL PERFORMANCE (sums to the headline totals) ───────────────────
// settled Σ = ₹2.90 Cr · leakage Σ = ₹10.6L · recoverable Σ = ₹6.20L
export const channelPerformance: ChannelPerformance[] = [
  { channel: 'Blinkit', settled: 95_00_000, leakage: 3_50_000, netRealisationPct: 74, recoverable: 2_20_000 },
  { channel: 'Zepto', settled: 85_00_000, leakage: 3_00_000, netRealisationPct: 75, recoverable: 2_00_000 },
  { channel: 'Instamart', settled: 75_00_000, leakage: 2_50_000, netRealisationPct: 77, recoverable: 1_20_000 },
  { channel: 'Amazon', settled: 25_00_000, leakage: 1_00_000, netRealisationPct: 72, recoverable: 50_000 },
  { channel: 'Offline Stores', settled: 10_00_000, leakage: 60_000, netRealisationPct: 84, recoverable: 30_000 },
];

// ── RECEIVED vs RECEIVABLE, per portal ──────────────────────────────────────
export const channelReceived = channelPerformance.map((c) => ({
  channel: c.channel,
  receivable: c.settled + c.leakage,
  received: c.settled,
  pctReceived: (c.settled / (c.settled + c.leakage)) * 100,
}));

export const totalReceivable = channelPerformance.reduce((t, c) => t + c.settled + c.leakage, 0);
export const totalReceived = channelPerformance.reduce((t, c) => t + c.settled, 0);
export const pctReceivedOverall = (totalReceived / totalReceivable) * 100;

// ── FLAGGED ISSUES (the five canonical exceptions) ──────────────────────────
export const flaggedIssues: FlaggedIssue[] = [
  {
    id: 'OR-001',
    channel: 'Blinkit',
    title: 'PO-2026-BL-940',
    detail: 'Invoice INV-8822 generated for 2,400 units of Plant-based Nuggets. Payment overdue by 4 days.',
    amount: 3_12_400,
    type: 'Overdue',
    confidence: 'High',
  },
  {
    id: 'OR-002',
    channel: 'Instamart',
    title: 'PO-2026-IM-112',
    detail: 'GRN accepted for Vegan Keema. Settlement window open until Jun 28.',
    amount: 1_85_200,
    type: 'Pending',
    confidence: 'High',
  },
  {
    id: 'OR-003',
    channel: 'Zepto',
    title: 'PO-2026-ZP-445',
    detail: 'Partial payment received for Supergrain Puffs. Short by ₹41,200 pending reconciliation.',
    amount: 41_200,
    type: 'Partial Pay',
    confidence: 'High',
  },
  {
    id: 'OR-004',
    channel: 'Amazon',
    title: 'PO-2026-AMZ-092',
    detail: 'FBA inventory received. Awaiting payout cycle on Jul 1.',
    amount: 1_32_000,
    type: 'Pending',
    confidence: 'High',
  },
  {
    id: 'OR-005',
    channel: 'Offline Stores',
    title: 'PO-2026-OS-554',
    detail: 'Nature\'s Basket PO fulfilled. 45-day credit term active.',
    amount: 2_18_500,
    type: 'In Term',
    confidence: 'High',
  },
];

// ── MARKETING & TRADE SPENDS (Ad deductions and Promotions) ────────────────
export interface MarketingSpend {
  performanceAds: number;
  tradePromos: number;
  roas: number;
}

export const marketingSpends: Record<string, MarketingSpend> = {
  all: { performanceAds: 1250000, tradePromos: 840000, roas: 4.2 },
  blinkit: { performanceAds: 450000, tradePromos: 320000, roas: 3.8 },
  zepto: { performanceAds: 380000, tradePromos: 250000, roas: 4.5 },
  instamart: { performanceAds: 320000, tradePromos: 210000, roas: 4.1 },
  amazon: { performanceAds: 100000, tradePromos: 60000, roas: 5.2 },
  entitya: { performanceAds: 250000, tradePromos: 150000, roas: 3.9 },
  entityb: { performanceAds: 120000, tradePromos: 80000, roas: 4.8 },
  offlinestores: { performanceAds: 0, tradePromos: 50000, roas: 0 }, // offline stores mostly just trade promos
};

// ── RECONCILIATION LINE ITEMS ───────────────────────────────────────────────
export const reconLineItems: ReconLineItem[] = [
  {
    id: 'RC-2291',
    channel: 'Instamart',
    skuId: 'BTF-KEE',
    skuLabel: 'BTF-KEE · Vegan Keema',
    ref: 'GRN-IM-2291',
    expected: 5_46_000,
    paid: 2_60_800,
    variance: 2_85_200,
    status: 'Unpaid',
    matchNote:
      'Composite-key match (SKU + GRN qty + cycle). Goods accepted on the GRN but no settlement line was raised — flagged as unpaid.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: -2_72_800, why: '1,240 units accepted on GRN, never settled (likely thaw rejection)' },
      { label: 'Deduction variance', amount: -9_600, why: 'Handling deduction applied to units that were never paid' },
      { label: 'Tax / TCS variance', amount: -2_800, why: 'TCS not credited on the unsettled invoice value' },
    ],
  },
  {
    id: 'RC-8841',
    channel: 'Amazon',
    skuId: 'BTF-SAU',
    skuLabel: 'BTF-SAU · Plant-based Sausages',
    ref: 'STL-AMZ-8841',
    expected: 7_18_000,
    paid: 5_76_000,
    variance: 1_42_000,
    status: 'Over-deducted',
    matchNote:
      'Exact reference match on STL-AMZ-8841. FBA fee reconciled to weight band — billed band (2kg) ≠ catalog weight (1kg).',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'All 980 units reconciled — no quantity gap' },
      { label: 'Deduction variance', amount: -1_35_200, why: '980 units billed at the 2kg FBA band vs contracted 1kg band' },
      { label: 'Tax / TCS variance', amount: -6_800, why: 'GST charged on the excess weight-band fee' },
    ],
  },
  {
    id: 'RC-7732',
    channel: 'Blinkit',
    skuId: 'BTF-NUG',
    skuLabel: 'BTF-NUG · Plant-based Chicken Nuggets',
    ref: 'STL-BLK-7732',
    expected: 4_12_000,
    paid: 3_28_600,
    variance: 83_400,
    status: 'Over-deducted',
    matchNote:
      "Exact reference match on STL-BLK-7732. An extra deduction line — 'Storage Fee v2' — has no counterpart in the signed rate card.",
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units reconciled exactly against the cycle' },
      { label: 'Deduction variance', amount: -78_200, why: "'Cold Store Spoilage' applied to 38 SKUs with no rate-card basis" },
      { label: 'Tax / TCS variance', amount: -5_200, why: 'GST charged on the unauthorised storage fee' },
    ],
  },
  {
    id: 'RC-5519',
    channel: 'Offline Stores',
    skuId: 'KLW-PUF',
    skuLabel: 'KLW-PUF · Supergrain Puffs',
    ref: 'STL-NB-5519',
    expected: 3_61_500,
    paid: 2_97_000,
    variance: 64_500,
    status: 'Rate variance',
    matchNote:
      'Exact reference match on STL-NB-5519. Margin recomputed at the contracted 18% — settlement applied 22%.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Order quantities reconciled exactly' },
      { label: 'Deduction variance', amount: -58_600, why: 'Margin charged at 22% vs 18% contracted' },
      { label: 'Tax / TCS variance', amount: -5_900, why: 'GST charged on the excess margin' },
    ],
  },
  {
    id: 'RC-4410',
    channel: 'Zepto',
    skuId: 'KLW-SPR',
    skuLabel: 'KLW-SPR · Sprout Sticks',
    ref: 'STL-ZEP-4410',
    expected: 2_88_000,
    paid: 2_46_800,
    variance: 41_200,
    status: 'Disputed',
    matchNote:
      'FIFO match across W24 cycles. The visibility-fee line appears twice for the same campaign — duplicate deduction.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units reconciled — variance is fee-side only' },
      { label: 'Deduction variance', amount: -36_800, why: 'Visibility / ad-recovery fee deducted twice in cycle W24' },
      { label: 'Tax / TCS variance', amount: -4_400, why: 'GST charged on the duplicate visibility fee' },
    ],
  },
  {
    id: 'RC-9920',
    channel: 'Amazon',
    skuId: 'BTF-KEB',
    skuLabel: 'BTF-KEB · Plant-based Kebabs',
    ref: 'STL-AMZ-9920',
    expected: 6_04_000,
    paid: 6_04_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match — GRN ↔ settlement ID, amount within ±₹1 tolerance.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted' },
      { label: 'Deduction variance', amount: 0, why: 'All deductions reconcile to the rate card' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
  },
  {
    id: 'RC-3301',
    channel: 'Offline Stores',
    skuId: 'BTF-SAU',
    skuLabel: 'BTF-SAU · Plant-based Sausages',
    ref: 'STL-NB-3301',
    expected: 3_92_000,
    paid: 3_92_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match — settlement ID resolved on first pass, amount within ±₹1 tolerance.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted' },
      { label: 'Deduction variance', amount: 0, why: 'Margin charged at the contracted 18%' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
  },
  {
    id: 'RC-1180',
    channel: 'Blinkit',
    skuId: 'BTF-NUG',
    skuLabel: 'BTF-NUG · Plant-based Chicken Nuggets',
    ref: 'STL-BLK-1180',
    expected: 2_15_000,
    paid: 2_15_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Composite-key match (SKU + cycle); all deduction lines reconcile to the rate card within ±₹1.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted' },
      { label: 'Deduction variance', amount: 0, why: 'Only contracted rate-card fees applied' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
  },
  {
    id: 'RC-6627',
    channel: 'Zepto',
    skuId: 'KLW-PUF',
    skuLabel: 'KLW-PUF · Supergrain Puffs',
    ref: 'STL-ZEP-6627',
    expected: 4_80_000,
    paid: 4_05_300,
    variance: 74_700,
    status: 'Over-deducted',
    matchNote:
      "Exact reference match on STL-ZEP-6627. A 'Platform Support' line was deducted at twice the contracted slab for the cycle.",
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units reconciled exactly against the cycle' },
      { label: 'Deduction variance', amount: -69_900, why: "'Platform Support' fee billed at 4% vs contracted 2%" },
      { label: 'Tax / TCS variance', amount: -4_800, why: 'GST charged on the excess support fee' },
    ],
  },
  {
    id: 'RC-2048',
    channel: 'Instamart',
    skuId: 'BTF-KEE',
    skuLabel: 'BTF-KEE · Vegan Keema',
    ref: 'STL-IM-2048',
    expected: 3_36_000,
    paid: 2_84_700,
    variance: 51_300,
    status: 'Rate variance',
    matchNote:
      'Exact reference match on STL-IM-2048. Commission recomputed at the contracted 16% — settlement applied 20%.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Order quantities reconciled exactly' },
      { label: 'Deduction variance', amount: -46_600, why: 'Commission charged at 20% vs 16% contracted' },
      { label: 'Tax / TCS variance', amount: -4_700, why: 'GST charged on the excess commission' },
    ],
  },
  {
    id: 'RC-7165',
    channel: 'Blinkit',
    skuId: 'BTF-KEB',
    skuLabel: 'BTF-KEB · Plant-based Kebabs',
    ref: 'GRN-BLK-7165',
    expected: 4_25_000,
    paid: 1_98_400,
    variance: 2_26_600,
    status: 'Unpaid',
    matchNote:
      'Composite-key match (SKU + GRN qty + cycle). 820 units accepted on the GRN remain unsettled — partial payment only.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: -2_16_000, why: '820 units accepted on GRN-BLK-7165, never settled' },
      { label: 'Deduction variance', amount: -7_800, why: 'Handling deduction applied to units that were never paid' },
      { label: 'Tax / TCS variance', amount: -2_800, why: 'TCS not credited on the unsettled invoice value' },
    ],
  },
  {
    id: 'RC-8473',
    channel: 'Amazon',
    skuId: 'KLW-SPR',
    skuLabel: 'KLW-SPR · Sprout Sticks',
    ref: 'STL-AMZ-8473',
    expected: 5_52_000,
    paid: 5_10_700,
    variance: 41_300,
    status: 'Disputed',
    matchNote:
      'FIFO match across the cycle. A returns-recovery line was charged for orders already credited under a prior RTO claim — duplicate deduction.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units reconciled — variance is fee-side only' },
      { label: 'Deduction variance', amount: -37_000, why: 'Returns recovery deducted on orders already credited via RTO claim' },
      { label: 'Tax / TCS variance', amount: -4_300, why: 'GST charged on the duplicate returns-recovery fee' },
    ],
  },
  {
    id: 'RC-3958',
    channel: 'Blinkit',
    skuId: 'BTF-SAU',
    skuLabel: 'BTF-SAU · Plant-based Sausages',
    ref: 'STL-BLK-3958',
    expected: 3_74_000,
    paid: 3_15_500,
    variance: 58_500,
    status: 'Over-deducted',
    matchNote:
      "Exact reference match on STL-BLK-3958. A 'Dark Store Placement' charge has no counterpart in the signed rate card.",
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units reconciled exactly against the cycle' },
      { label: 'Deduction variance', amount: -54_100, why: "'Dark Store Placement' charge applied with no rate-card basis" },
      { label: 'Tax / TCS variance', amount: -4_400, why: 'GST charged on the unauthorised placement charge' },
    ],
  },
  {
    id: 'RC-5006',
    channel: 'Zepto',
    skuId: 'BTF-KEE',
    skuLabel: 'BTF-KEE · Vegan Keema',
    ref: 'STL-ZEP-5006',
    expected: 2_68_000,
    paid: 2_68_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match — settlement ID resolved on first pass, amount within ±₹1 tolerance.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted' },
      { label: 'Deduction variance', amount: 0, why: 'All deductions reconcile to the rate card' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
  },
  {
    id: 'RC-4127',
    channel: 'Instamart',
    skuId: 'KLW-PUF',
    skuLabel: 'KLW-PUF · Supergrain Puffs',
    ref: 'STL-IM-4127',
    expected: 3_05_000,
    paid: 3_05_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Composite-key match (SKU + cycle); all deduction lines reconcile to the rate card within ±₹1.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted' },
      { label: 'Deduction variance', amount: 0, why: 'Only contracted rate-card fees applied' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
  },
  {
    id: 'RC-9314',
    channel: 'Amazon',
    skuId: 'BTF-NUG',
    skuLabel: 'BTF-NUG · Plant-based Chicken Nuggets',
    ref: 'STL-AMZ-9314',
    expected: 4_92_000,
    paid: 4_92_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match — GRN ↔ settlement ID, amount within ±₹1 tolerance.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted' },
      { label: 'Deduction variance', amount: 0, why: 'FBA fee reconciled to the correct weight band' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
  },
  {
    id: 'RC-2570',
    channel: 'Blinkit',
    skuId: 'KLW-SPR',
    skuLabel: 'KLW-SPR · Sprout Sticks',
    ref: 'STL-BLK-2570',
    expected: 1_88_000,
    paid: 1_88_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Composite-key match (SKU + cycle); all deduction lines reconcile to the rate card within ±₹1.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted' },
      { label: 'Deduction variance', amount: 0, why: 'Only contracted rate-card fees applied' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
  },
];

import { type ReconPurchaseOrder, type ReconStatus } from './types';

export const reconPurchaseOrders: ReconPurchaseOrder[] = (() => {
  const basePOs = (['Instamart', 'Blinkit', 'Amazon', 'Offline Stores', 'Zepto'] as const).map((channel, idx) => {
    const items = reconLineItems.filter((li) => li.channel === channel);
    const expected = items.reduce((t, li) => t + li.expected, 0);
    const paid = items.reduce((t, li) => t + li.paid, 0);
    const variance = expected - paid;

    let status: ReconStatus = 'Matched';
    if (variance > 0) {
      const errorStatuses = items.map((li) => li.status).filter((s) => s !== 'Matched');
      status = (errorStatuses.length > 0 ? errorStatuses[0] : 'Unpaid') as ReconStatus;
    }

    return {
      id: `PO-${channel.substring(0, 3).toUpperCase()}-90${idx + 1}`,
      channel,
      date: 'W24 · Jun 2024',
      expected,
      paid,
      variance,
      status,
      lineItems: items,
    };
  });

  return [
    ...basePOs,
    ...basePOs.map((po, idx) => ({ ...po, id: `PO-${po.channel.substring(0, 3).toUpperCase()}-91${idx + 1}`, date: 'W23 · Jun 2024' })),
    ...basePOs.map((po, idx) => ({ ...po, id: `PO-${po.channel.substring(0, 3).toUpperCase()}-92${idx + 1}`, date: 'W22 · May 2024' }))
  ];
})();
