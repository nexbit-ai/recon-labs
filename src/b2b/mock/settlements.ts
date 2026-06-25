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
  { key: 'settled', label: 'Settled this quarter', value: 14_20_00_000, display: '₹14.2 Cr', unit: 'inr' },
  { key: 'leakage', label: 'Leakage detected (Q1)', value: 38_60_000, display: '₹38.6L', unit: 'inr' },
  { key: 'recoverable', label: 'Recoverable now', value: 22_40_000, display: '₹22.4L', unit: 'inr' },
  { key: 'expiring', label: 'Recoverable expiring within ~10 days', value: 6_80_000, display: '₹6.8L', unit: 'inr' },
  { key: 'recoveredYtd', label: 'Recovered YTD', value: 41_20_000, display: '₹41.2L', unit: 'inr' },
  { key: 'netRealisation', label: 'True net realisation', value: 71.3, display: '71.3%', unit: 'percent' },
];

// Reference for views: the assumption SuperYou planned against, vs reality (71.3%).
export const netRealisationAssumptionPct = 74;

// Claims won that make up Recovered YTD (₹41.2L), shown as a caption.
export const recoveredYtdClaimsWon = 214;

// Total open issues detected this quarter; the feed surfaces the top few by value.
export const flaggedIssuesTotal = 63;

export const headlineByKey = (key: string): HeadlineMetric =>
  headline.find((m) => m.key === key)!;

// ── PER-CHANNEL PERFORMANCE (sums to the headline totals) ───────────────────
// settled Σ = ₹14.2 Cr · leakage Σ = ₹38.6L · recoverable Σ = ₹22.4L
export const channelPerformance: ChannelPerformance[] = [
  { channel: 'Amazon', settled: 5_10_00_000, leakage: 14_20_000, netRealisationPct: 64, recoverable: 8_60_000 },
  { channel: 'Flipkart', settled: 3_20_00_000, leakage: 6_10_000, netRealisationPct: 70, recoverable: 4_00_000 },
  { channel: 'Blinkit', settled: 2_40_00_000, leakage: 8_30_000, netRealisationPct: 66, recoverable: 4_70_000 },
  { channel: 'Zepto', settled: 1_90_00_000, leakage: 5_40_000, netRealisationPct: 69, recoverable: 2_90_000 },
  { channel: 'Instamart', settled: 1_60_00_000, leakage: 4_60_000, netRealisationPct: 68, recoverable: 2_20_000 },
];

// ── FLAGGED ISSUES (the five canonical exceptions) ──────────────────────────
export const flaggedIssues: FlaggedIssue[] = [
  {
    id: 'FL-001',
    channel: 'Blinkit',
    title: "'Storage Fee v2' — not in your rate card",
    detail: 'Applied to 38 SKUs from Jun 14, no signed basis',
    amount: 83_400,
    type: 'Contract breach',
    confidence: 'High',
  },
  {
    id: 'FL-002',
    channel: 'Instamart',
    title: 'Short-paid against GRN',
    detail: '1,240 Protein Wafer 6-packs accepted on GRN-IM-2291, never settled',
    amount: 2_85_200,
    type: 'Short payment',
    confidence: 'High',
  },
  {
    id: 'FL-003',
    channel: 'Amazon',
    title: 'FBA weight band misclassified',
    detail: '980 units of SuperYou Pro 1kg billed at the 2kg band',
    amount: 1_42_000,
    type: 'Overcharge',
    confidence: 'High',
  },
  {
    id: 'FL-004',
    channel: 'Flipkart',
    title: 'Commission above contracted rate',
    detail: 'Multigrain Chips charged 22% vs 18% agreed',
    amount: 64_500,
    type: 'Rate variance',
    confidence: 'High',
  },
  {
    id: 'FL-005',
    channel: 'Zepto',
    title: 'Visibility fee deducted twice',
    detail: 'Cycle W24 ad-recovery on two lines',
    amount: 41_200,
    type: 'Duplicate',
    confidence: 'Med',
  },
];

// ── RECONCILIATION LINE ITEMS ───────────────────────────────────────────────
// Every line carries a 3-part variance breakdown (Quantity · Deduction · Tax/TCS)
// whose signed amounts sum to (paid - expected), so the unexplained residual is
// always ₹0. Exception lines trace back to the five flagged issues; matched lines
// reconcile exactly (±₹1 tolerance).
export const reconLineItems: ReconLineItem[] = [
  {
    id: 'RC-2291',
    channel: 'Instamart',
    skuId: 'PW6-CHO',
    skuLabel: 'Protein Wafer 6-pack — Choco',
    ref: 'GRN-IM-2291',
    expected: 5_46_000,
    paid: 2_60_800,
    variance: 2_85_200, // gap = expected - paid
    status: 'Unpaid',
    matchNote:
      'Composite-key match (SKU + GRN qty + cycle). Goods accepted on the GRN but no settlement line was raised — flagged as unpaid.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: -2_72_800, why: '1,240 of 1,240 units accepted on GRN-IM-2291, never settled' },
      { label: 'Deduction variance', amount: -9_600, why: 'Handling deduction applied to units that were never paid' },
      { label: 'Tax / TCS variance', amount: -2_800, why: 'TCS not credited on the unsettled invoice value' },
    ],
  },
  {
    id: 'RC-8841',
    channel: 'Amazon',
    skuId: 'SYP-CHO',
    skuLabel: 'SuperYou Pro 1kg — Chocolate',
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
    skuId: 'MGC-CO',
    skuLabel: 'Multigrain Chips — Cream & Onion',
    ref: 'STL-BLK-7732',
    expected: 4_12_000,
    paid: 3_28_600,
    variance: 83_400,
    status: 'Over-deducted',
    matchNote:
      "Exact reference match on STL-BLK-7732. An extra deduction line — 'Storage Fee v2' — has no counterpart in the signed rate card.",
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units reconciled exactly against the cycle' },
      { label: 'Deduction variance', amount: -78_200, why: "'Storage Fee v2' applied to 38 SKUs with no rate-card basis" },
      { label: 'Tax / TCS variance', amount: -5_200, why: 'GST charged on the unauthorised storage fee' },
    ],
  },
  {
    id: 'RC-5519',
    channel: 'Flipkart',
    skuId: 'MGC-CHE',
    skuLabel: 'Multigrain Chips — Cheese',
    ref: 'STL-FLP-5519',
    expected: 3_61_500,
    paid: 2_97_000,
    variance: 64_500,
    status: 'Rate variance',
    matchNote:
      'Exact reference match on STL-FLP-5519. Commission recomputed at the contracted 18% — settlement applied 22%.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Order quantities reconciled exactly' },
      { label: 'Deduction variance', amount: -58_600, why: 'Commission charged at 22% vs 18% contracted on Multigrain Chips' },
      { label: 'Tax / TCS variance', amount: -5_900, why: 'GST charged on the excess commission' },
    ],
  },
  {
    id: 'RC-4410',
    channel: 'Zepto',
    skuId: 'SYP-CC',
    skuLabel: 'SuperYou Pro 1kg — Cold Coffee',
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
    skuId: 'SYP-MC',
    skuLabel: 'SuperYou Pro 1kg — Masala Chai',
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
    channel: 'Flipkart',
    skuId: 'PW6-PB',
    skuLabel: 'Protein Wafer 6-pack — Peanut Butter',
    ref: 'STL-FLP-3301',
    expected: 3_92_000,
    paid: 3_92_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match — settlement ID resolved on first pass, amount within ±₹1 tolerance.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted' },
      { label: 'Deduction variance', amount: 0, why: 'Commission charged at the contracted 18%' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
  },
  {
    id: 'RC-1180',
    channel: 'Blinkit',
    skuId: 'SYP-UNF',
    skuLabel: 'SuperYou Pro 1kg — Unflavoured',
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
];
