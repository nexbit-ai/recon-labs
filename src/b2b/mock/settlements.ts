// Canonical headline numbers, per-channel performance, flagged leakage, and
// reconciliation line items for the Cosmix demo. Every figure here cross-foots.
// Scenario: ₹1 Crore expected from B2B channels on 10 August, ₹90L received.
// Amounts in whole rupees unless noted.
import type {
  HeadlineMetric,
  ChannelPerformance,
  FlaggedIssue,
  ReconLineItem,
  ReconPurchaseOrder,
  ReconStatus,
  ThreeWayMatch,
} from './types';

// ── HEADLINE METRICS (the single source of truth for all later views) ───────
// Core scenario: Expected ₹1.00 Cr, Received ₹90.00L, Gap ₹10.00L
export const headline: HeadlineMetric[] = [
  { key: 'receivable', label: 'Total Receivables Due', value: 1_00_00_000, display: '₹1.00 Cr', unit: 'inr' },
  { key: 'settled', label: 'Total Received', value: 90_00_000, display: '₹90.00L', unit: 'inr' },
  { key: 'leakage', label: 'Shortfall / Gap', value: 10_00_000, display: '₹10.00L', unit: 'inr' },
  { key: 'recoverable', label: 'Recoverable now', value: 6_80_000, display: '₹6.80L', unit: 'inr' },
  { key: 'expiring', label: 'Recoverable expiring within ~10 days', value: 1_50_000, display: '₹1.50L', unit: 'inr' },
  { key: 'recoveredYtd', label: 'Recovered YTD', value: 8_40_000, display: '₹8.40L', unit: 'inr' },
  { key: 'netRealisation', label: 'True net realisation', value: 78.2, display: '78.2%', unit: 'percent' },
  { key: 'underDispute', label: 'Under dispute', value: 3_20_000, display: '₹3.20L', unit: 'inr' },
];

// Reference for views: the assumption brand planned against, vs reality.
export const netRealisationAssumptionPct = 82;

// Claims won that make up Recovered YTD (₹8.40L), shown as a caption.
export const recoveredYtdClaimsWon = 94;

// Total open issues detected this quarter; the feed surfaces the top few by value.
export const flaggedIssuesTotal = 18;

export const headlineByKey = (key: string): HeadlineMetric =>
  headline.find((m) => m.key === key)!;

// ── PER-CHANNEL PERFORMANCE (sums to the headline totals) ───────────────────
// settled Σ = ₹90.00L · leakage Σ = ₹10.00L · recoverable Σ = ₹6.80L
// receivable per channel = settled + leakage → Σ = ₹1.00 Cr
export const channelPerformance: ChannelPerformance[] = [
  { channel: 'Blinkit',            settled: 32_00_000, leakage: 3_80_000, netRealisationPct: 76.5, recoverable: 2_40_000 },
  { channel: 'Zepto',              settled: 28_00_000, leakage: 3_20_000, netRealisationPct: 77.8, recoverable: 2_10_000 },
  { channel: 'Reliance',           settled: 18_00_000, leakage: 1_80_000, netRealisationPct: 80.1, recoverable: 1_30_000 },
  { channel: 'Cafes – Bangalore',  settled: 12_00_000, leakage: 1_20_000, netRealisationPct: 79.6, recoverable: 1_00_000 },
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

// ── FLAGGED ISSUES (the canonical exceptions - Cosmix-specific) ─────────────
export const flaggedIssues: FlaggedIssue[] = [
  {
    id: 'OR-001',
    channel: 'Blinkit',
    title: 'PO-BLK-2026-0847',
    detail: 'GRN accepted for 500 units of Plant Protein but 42 units deducted via Debit Note DN-0847 for damages not reported at warehouse. ₹7,560 deducted.',
    amount: 1_52_000,
    type: 'Debit note – damages',
    confidence: 'High',
    poNumber: 'PO-BLK-2026-0847',
  },
  {
    id: 'OR-002',
    channel: 'Zepto',
    title: 'PO-ZEP-2026-0391',
    detail: 'Visibility fee (₹18,400) deducted twice in settlement STL-ZEP-0391 for the same campaign period. Duplicate charge confirmed against rate card.',
    amount: 1_84_000,
    type: 'Visibility fee duplicate',
    confidence: 'High',
    poNumber: 'PO-ZEP-2026-0391',
  },
  {
    id: 'OR-003',
    channel: 'Reliance',
    title: 'PO-REL-2026-0112',
    detail: 'Invoice INV-REL-0112 for ₹2.4L submitted on 28 Jul. Payment due 10 Aug per 45-day credit terms. Settlement not received.',
    amount: 2_40_000,
    type: 'Settlement pending',
    confidence: 'High',
    poNumber: 'PO-REL-2026-0112',
  },
  {
    id: 'OR-004',
    channel: 'Cafes – Bangalore',
    title: 'Cafe batch - 8 accounts',
    detail: '8 cafe accounts have overdue invoices totalling ₹1.2L. Oldest overdue: Third Wave Coffee (32 days). Inconsistent email confirmations.',
    amount: 1_20_000,
    type: 'Overdue',
    confidence: 'Med',
    poNumber: 'ORD-TWC-2026-Jul',
  },
  {
    id: 'OR-005',
    channel: 'Blinkit',
    title: 'PO-BLK-2026-0923',
    detail: 'GRN pending for 120 units of Collagen Boost dispatched on 3 Aug. Warehouse has not confirmed acceptance. Invoice INV-BLK-0923 on hold.',
    amount: 96_000,
    type: 'Pending GRN',
    confidence: 'High',
    poNumber: 'PO-BLK-2026-0923',
  },
  {
    id: 'OR-006',
    channel: 'Zepto',
    title: 'PO-ZEP-2026-0445',
    detail: 'Short payment of ₹41,200 on settlement STL-ZEP-0445. 38 units of Energy Blend deducted as returns but RTO claim already processed.',
    amount: 41_200,
    type: 'Short payment',
    confidence: 'High',
    poNumber: 'PO-ZEP-2026-0445',
  },
  {
    id: 'OR-007',
    channel: 'Reliance',
    title: 'PO-REL-2026-0087',
    detail: 'Invoice INV-REL-0087 for Immunity Mix not found in Reliance portal. PO exists, GRN accepted. Invoice needs to be re-uploaded.',
    amount: 68_000,
    type: 'Invoice missing',
    confidence: 'High',
    poNumber: 'PO-REL-2026-0087',
  },
];

// ── MARKETING & TRADE SPENDS (Ad deductions and Promotions) ────────────────
export interface MarketingSpend {
  performanceAds: number;
  tradePromos: number;
  roas: number;
}

export const marketingSpends: Record<string, MarketingSpend> = {
  all:                { performanceAds: 980000, tradePromos: 620000, roas: 3.8 },
  blinkit:            { performanceAds: 380000, tradePromos: 240000, roas: 3.5 },
  zepto:              { performanceAds: 320000, tradePromos: 200000, roas: 4.1 },
  reliance:           { performanceAds: 180000, tradePromos: 120000, roas: 3.9 },
  'cafes-bangalore':  { performanceAds: 100000, tradePromos: 60000, roas: 4.2 },
};

// ── UPCOMING EXPECTED PAYOUTS ───────────────────────────────────────────────
export interface UpcomingPayout {
  channel: string;
  date: string;
  amount: number;
  status: 'Expected' | 'Overdue' | 'Partial';
}

export const upcomingPayouts: UpcomingPayout[] = [
  { channel: 'Zepto', date: '12 Aug 2026', amount: 4_20_000, status: 'Expected' },
  { channel: 'Blinkit', date: '14 Aug 2026', amount: 5_60_000, status: 'Expected' },
  { channel: 'Reliance', date: '15 Aug 2026', amount: 2_40_000, status: 'Overdue' },
  { channel: 'Cafes – Bangalore', date: '16 Aug 2026', amount: 1_80_000, status: 'Partial' },
];

// ── RECONCILIATION LINE ITEMS ───────────────────────────────────────────────
// Each line item has full 3-way matching (PO ↔ GRN ↔ Invoice) and operationally
// detailed variance breakdowns. SKUs are Cosmix products. Issue types are
// Cosmix-specific (pending GRN, debit note damages, visibility fee duplicate, etc.)

const mkThreeWay = (
  po: { ref: string; status: 'Matched' | 'Pending' | 'Missing' | 'Disputed'; amount: number },
  grn: { ref: string; status: 'Matched' | 'Pending' | 'Missing' | 'Disputed'; amount: number; unitsAccepted: number; unitsOrdered: number },
  inv: { ref: string; status: 'Matched' | 'Pending' | 'Missing' | 'Disputed'; amount: number },
): ThreeWayMatch => {
  let unitPrice = 0;
  if (grn.unitsAccepted > 0) unitPrice = grn.amount / grn.unitsAccepted;
  else if (grn.unitsOrdered > 0) unitPrice = grn.amount / grn.unitsOrdered;
  else unitPrice = 1000;

  const unitsInvoiced = grn.unitsAccepted > 0 ? grn.unitsAccepted + 5 : grn.unitsOrdered + 5;
  const unitsOrderedNew = unitsInvoiced + 10;

  const poAmount = Math.round(unitsOrderedNew * unitPrice);
  const invoiceAmount = Math.round(unitsInvoiced * unitPrice);

  return { 
    po: { ...po, amount: poAmount }, 
    grn: { ...grn, unitsOrdered: unitsOrderedNew }, 
    invoice: { ...inv, amount: invoiceAmount } 
  };
};

export const reconLineItems: ReconLineItem[] = [
  // ── Blinkit: Debit note for damages (flagged) ──
  {
    id: 'RC-0847',
    channel: 'Blinkit',
    skuId: 'COS-PRO',
    skuLabel: 'COS-PRO · Plant Protein - 250g',
    poNumber: 'PO-BLK-2026-0847',
    invoiceNumber: 'INV-BLK-0847',
    grn: 'GRN-BLK-0847',
    grnStatus: 'Accepted',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 4_50_000,
    paid: 2_98_000,
    variance: 1_52_000,
    status: 'Over-deducted',
    issueType: 'Debit note – damages',
    matchNote: 'Exact reference match on STL-BLK-0847. Debit note DN-0847 deducted ₹7,560 for damages not reported in GRN acceptance.',
    varianceBreakdown: [
      { label: 'Debit note – transit damages', amount: -1_42_400, why: 'DN-0847 raised for 42 units of Plant Protein at ₹180/unit. Damage report absent from GRN; brand disputes claim' },
      { label: 'Shelf placement fee', amount: -6_800, why: 'Dark store placement fee at 1.5% vs contracted 1.0% - ₹6,800 excess on ₹4.5L GMV' },
      { label: 'TCS variance', amount: -2_800, why: 'TCS calculated on gross before debit note adjustment' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-BLK-2026-0847', status: 'Matched', amount: 4_50_000 },
      { ref: 'GRN-BLK-0847', status: 'Matched', amount: 4_50_000, unitsAccepted: 500, unitsOrdered: 500 },
      { ref: 'INV-BLK-0847', status: 'Matched', amount: 4_50_000 },
    ),
    nextAction: 'Dispute DN-0847 - request damage evidence photos from Blinkit warehouse. GRN accepted full 500 units with no damage flag.',
  },
  // ── Zepto: Visibility fee deducted twice (flagged) ──
  {
    id: 'RC-0391',
    channel: 'Zepto',
    skuId: 'COS-COL',
    skuLabel: 'COS-COL · Collagen Boost - 200g',
    poNumber: 'PO-ZEP-2026-0391',
    invoiceNumber: 'INV-ZEP-0391',
    grn: 'GRN-ZEP-0391',
    grnStatus: 'Accepted',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 3_80_000,
    paid: 1_96_000,
    variance: 1_84_000,
    status: 'Over-deducted',
    issueType: 'Visibility fee duplicate',
    matchNote: 'FIFO match across W31 cycles. Visibility fee line VIS-ZEP-0391 appears twice for the same campaign period - confirmed duplicate deduction.',
    varianceBreakdown: [
      { label: 'Visibility fee (duplicate)', amount: -1_72_600, why: 'Visibility / ad-recovery fee ₹18,400 deducted twice in settlement STL-ZEP-0391 for campaign "Aug Launch Push"' },
      { label: 'Platform support fee excess', amount: -7_200, why: 'Platform support billed at 3.5% vs contracted 2% on ₹3.8L GMV' },
      { label: 'TCS variance', amount: -4_200, why: 'TCS on the duplicate visibility fee amount' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-ZEP-2026-0391', status: 'Matched', amount: 3_80_000 },
      { ref: 'GRN-ZEP-0391', status: 'Matched', amount: 3_80_000, unitsAccepted: 420, unitsOrdered: 420 },
      { ref: 'INV-ZEP-0391', status: 'Matched', amount: 3_80_000 },
    ),
    nextAction: 'File duplicate deduction dispute with Zepto ops - attach settlement sheet showing VIS-ZEP-0391 appearing on lines 14 and 28 for identical campaign.',
  },
  // ── Blinkit: Pending GRN (flagged) ──
  {
    id: 'RC-0923',
    channel: 'Blinkit',
    skuId: 'COS-COL',
    skuLabel: 'COS-COL · Collagen Boost - 200g',
    poNumber: 'PO-BLK-2026-0923',
    invoiceNumber: 'INV-BLK-0923',
    grn: 'GRN-BLK-0923',
    grnStatus: 'Pending',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '12 Aug 2026',
    expected: 96_000,
    paid: 0,
    variance: 96_000,
    status: 'Pending GRN',
    issueType: 'Pending GRN',
    matchNote: 'PO and invoice exist but GRN-BLK-0923 has not been confirmed by Blinkit warehouse. Dispatched on 3 Aug - 10 days pending.',
    varianceBreakdown: [
      { label: 'GRN not accepted', amount: -96_000, why: '120 units of Collagen Boost dispatched 3 Aug. Blinkit warehouse has not confirmed GRN. Settlement blocked until acceptance.' },
      { label: 'Deduction variance', amount: 0, why: 'No deductions - settlement has not been initiated' },
      { label: 'Tax / TCS variance', amount: 0, why: 'No settlement to reconcile' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-BLK-2026-0923', status: 'Matched', amount: 96_000 },
      { ref: 'GRN-BLK-0923', status: 'Pending', amount: 0, unitsAccepted: 0, unitsOrdered: 120 },
      { ref: 'INV-BLK-0923', status: 'Pending', amount: 96_000 },
    ),
    nextAction: 'Follow up with Blinkit dark store ops for GRN acceptance of 120 units. Dispatch proof (AWB-BLK-0923) available.',
  },
  // ── Zepto: Short payment / returns double-dip (flagged) ──
  {
    id: 'RC-0445',
    channel: 'Zepto',
    skuId: 'COS-ENR',
    skuLabel: 'COS-ENR · Energy Blend - 250g',
    poNumber: 'PO-ZEP-2026-0445',
    invoiceNumber: 'INV-ZEP-0445',
    grn: 'GRN-ZEP-0445',
    grnStatus: 'Accepted',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 2_88_000,
    paid: 2_46_800,
    variance: 41_200,
    status: 'Short paid',
    issueType: 'Short payment',
    matchNote: 'FIFO match across W31 cycles. 38 units deducted as returns but RTO claim D-0931 already credited ₹36,800 for same units - double deduction.',
    varianceBreakdown: [
      { label: 'Returns deduction (duplicate)', amount: -36_800, why: '38 units of Energy Blend deducted as returns. RTO claim D-0931 already processed for these units - duplicate recovery.' },
      { label: 'Deduction variance', amount: -2_200, why: 'Handling charge on returned units already reversed in prior claim' },
      { label: 'TCS variance', amount: -2_200, why: 'TCS on the duplicate returns deduction' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-ZEP-2026-0445', status: 'Matched', amount: 2_88_000 },
      { ref: 'GRN-ZEP-0445', status: 'Matched', amount: 2_88_000, unitsAccepted: 320, unitsOrdered: 320 },
      { ref: 'INV-ZEP-0445', status: 'Disputed', amount: 2_88_000 },
    ),
    nextAction: 'Raise dispute - attach prior RTO claim D-0931 settlement confirmation showing the 38 units already credited.',
  },
  // ── Reliance: Settlement pending - overdue (flagged) ──
  {
    id: 'RC-0112',
    channel: 'Reliance',
    skuId: 'COS-IMM',
    skuLabel: 'COS-IMM · Immunity Mix - 150g',
    poNumber: 'PO-REL-2026-0112',
    invoiceNumber: 'INV-REL-0112',
    grn: 'GRN-REL-0112',
    grnStatus: 'Accepted',
    salePeriod: '15–31 Jul 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 2_40_000,
    paid: 0,
    variance: 2_40_000,
    status: 'Short paid',
    issueType: 'Settlement pending',
    matchNote: 'PO, GRN, and invoice all match. 45-day credit term expired 10 Aug. Settlement not received from Reliance - overdue.',
    varianceBreakdown: [
      { label: 'Settlement not received', amount: -2_40_000, why: 'Full invoice amount ₹2,40,000 pending. 45-day credit term (from 28 Jun invoice) expired on 10 Aug. No payment initiated by Reliance.' },
      { label: 'Deduction variance', amount: 0, why: 'No settlement initiated - no deductions to reconcile' },
      { label: 'Tax / TCS variance', amount: 0, why: 'No settlement to reconcile' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-REL-2026-0112', status: 'Matched', amount: 2_40_000 },
      { ref: 'GRN-REL-0112', status: 'Matched', amount: 2_40_000, unitsAccepted: 400, unitsOrdered: 400 },
      { ref: 'INV-REL-0112', status: 'Matched', amount: 2_40_000 },
    ),
    nextAction: 'Escalate to Reliance finance - 45-day credit term expired. Send payment reminder with invoice copy and GRN confirmation.',
  },
  // ── Reliance: Invoice missing (flagged) ──
  {
    id: 'RC-0087',
    channel: 'Reliance',
    skuId: 'COS-IMM',
    skuLabel: 'COS-IMM · Immunity Mix - 150g',
    poNumber: 'PO-REL-2026-0087',
    invoiceNumber: 'INV-REL-0087',
    grn: 'GRN-REL-0087',
    grnStatus: 'Accepted',
    salePeriod: '1–15 Jul 2026',
    expectedPayoutDate: '14 Aug 2026',
    expected: 68_000,
    paid: 0,
    variance: 68_000,
    status: 'Missing invoice',
    issueType: 'Invoice missing',
    matchNote: 'PO and GRN exist but invoice INV-REL-0087 not found in Reliance portal. Cannot initiate settlement without invoice on file.',
    varianceBreakdown: [
      { label: 'Invoice not on portal', amount: -68_000, why: 'Invoice INV-REL-0087 for 113 units of Immunity Mix not uploaded to Reliance Vendor Portal. GRN accepted. Payment blocked.' },
      { label: 'Deduction variance', amount: 0, why: 'No settlement - invoice missing' },
      { label: 'Tax / TCS variance', amount: 0, why: 'No settlement to reconcile' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-REL-2026-0087', status: 'Matched', amount: 68_000 },
      { ref: 'GRN-REL-0087', status: 'Matched', amount: 68_000, unitsAccepted: 113, unitsOrdered: 113 },
      { ref: 'INV-REL-0087', status: 'Missing', amount: 0 },
    ),
    nextAction: 'Re-upload invoice INV-REL-0087 to Reliance Vendor Portal. Attach GRN-REL-0087 confirmation as supporting document.',
  },
  // ── Cafes – Bangalore: Overdue batch (flagged) ──
  {
    id: 'RC-CAF-001',
    channel: 'Cafes – Bangalore',
    skuId: 'COS-PRO',
    skuLabel: 'COS-PRO · Plant Protein - 250g',
    poNumber: 'ORD-TWC-2026-Jul',
    invoiceNumber: 'INV-CAF-0034',
    grn: 'DEL-CAF-0034',
    grnStatus: 'Accepted',
    salePeriod: '1–31 Jul 2026',
    expectedPayoutDate: '7 Aug 2026',
    expected: 48_000,
    paid: 0,
    variance: 48_000,
    status: 'Short paid',
    issueType: 'Overdue',
    matchNote: 'Email-based order from Third Wave Coffee. Delivery confirmed via WhatsApp. Invoice sent via email. Payment overdue by 6 days.',
    varianceBreakdown: [
      { label: 'Payment overdue', amount: -48_000, why: 'Third Wave Coffee - Jul order ₹48,000 invoiced on 1 Aug, 7-day payment terms. No payment received as of 13 Aug.' },
      { label: 'Deduction variance', amount: 0, why: 'No deductions - payment not initiated' },
      { label: 'Tax / TCS variance', amount: 0, why: 'No payment to reconcile' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'ORD-TWC-2026-Jul', status: 'Matched', amount: 48_000 },
      { ref: 'DEL-CAF-0034', status: 'Matched', amount: 48_000, unitsAccepted: 80, unitsOrdered: 80 },
      { ref: 'INV-CAF-0034', status: 'Matched', amount: 48_000 },
    ),
    nextAction: 'Send 7-day payment reminder to Third Wave Coffee (finance@thirdwavecoffee.com). Attach invoice INV-CAF-0034.',
  },
  // ── Blinkit: Matched (clean) ──
  {
    id: 'RC-0810',
    channel: 'Blinkit',
    skuId: 'COS-IMM',
    skuLabel: 'COS-IMM · Immunity Mix - 150g',
    poNumber: 'PO-BLK-2026-0810',
    invoiceNumber: 'INV-BLK-0810',
    grn: 'GRN-BLK-0810',
    grnStatus: 'Accepted',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 3_60_000,
    paid: 3_60_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - GRN ↔ settlement ID, amount within ±₹1 tolerance. All deductions reconcile to rate card.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (600 units)' },
      { label: 'Deduction variance', amount: 0, why: 'All deductions reconcile to the Blinkit rate card - commission, fulfilment, and handling fees correct' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-BLK-2026-0810', status: 'Matched', amount: 3_60_000 },
      { ref: 'GRN-BLK-0810', status: 'Matched', amount: 3_60_000, unitsAccepted: 600, unitsOrdered: 600 },
      { ref: 'INV-BLK-0810', status: 'Matched', amount: 3_60_000 },
    ),
  },
  // ── Zepto: Matched (clean) ──
  {
    id: 'RC-0320',
    channel: 'Zepto',
    skuId: 'COS-SKN',
    skuLabel: 'COS-SKN · Skin Magic - 200g',
    poNumber: 'PO-ZEP-2026-0320',
    invoiceNumber: 'INV-ZEP-0320',
    grn: 'GRN-ZEP-0320',
    grnStatus: 'Accepted',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 2_92_000,
    paid: 2_92_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - settlement ID resolved on first pass, amount within ±₹1 tolerance.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (365 units)' },
      { label: 'Deduction variance', amount: 0, why: 'All deductions reconcile to the Zepto rate card' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-ZEP-2026-0320', status: 'Matched', amount: 2_92_000 },
      { ref: 'GRN-ZEP-0320', status: 'Matched', amount: 2_92_000, unitsAccepted: 365, unitsOrdered: 365 },
      { ref: 'INV-ZEP-0320', status: 'Matched', amount: 2_92_000 },
    ),
  },
  // ── Reliance: Matched (clean) ──
  {
    id: 'RC-0098',
    channel: 'Reliance',
    skuId: 'COS-SLP',
    skuLabel: 'COS-SLP · Sleep Easy - 100g',
    poNumber: 'PO-REL-2026-0098',
    invoiceNumber: 'INV-REL-0098',
    grn: 'GRN-REL-0098',
    grnStatus: 'Accepted',
    salePeriod: '1–15 Jul 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 1_85_000,
    paid: 1_85_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Reliance vendor portal settlement reconciled. 45-day credit terms met.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (370 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Margin and listing fees at contracted rates' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-REL-2026-0098', status: 'Matched', amount: 1_85_000 },
      { ref: 'GRN-REL-0098', status: 'Matched', amount: 1_85_000, unitsAccepted: 370, unitsOrdered: 370 },
      { ref: 'INV-REL-0098', status: 'Matched', amount: 1_85_000 },
    ),
  },
  // ── Cafes – Bangalore: Matched (clean) ──
  {
    id: 'RC-CAF-002',
    channel: 'Cafes – Bangalore',
    skuId: 'COS-ENR',
    skuLabel: 'COS-ENR · Energy Blend - 250g',
    poNumber: 'ORD-BT-2026-Jul',
    invoiceNumber: 'INV-CAF-0041',
    grn: 'DEL-CAF-0041',
    grnStatus: 'Accepted',
    salePeriod: '1–31 Jul 2026',
    expectedPayoutDate: '7 Aug 2026',
    expected: 36_000,
    paid: 36_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Email order from Blue Tokai. Payment received via NEFT on 6 Aug - 1 day early.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units delivered match order (60 units)' },
      { label: 'Deduction variance', amount: 0, why: 'No deductions - direct supply terms' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST credited correctly' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'ORD-BT-2026-Jul', status: 'Matched', amount: 36_000 },
      { ref: 'DEL-CAF-0041', status: 'Matched', amount: 36_000, unitsAccepted: 60, unitsOrdered: 60 },
      { ref: 'INV-CAF-0041', status: 'Matched', amount: 36_000 },
    ),
  },
  // ── Blinkit: Rate variance (flagged) ──
  {
    id: 'RC-0876',
    channel: 'Blinkit',
    skuId: 'COS-SKN',
    skuLabel: 'COS-SKN · Skin Magic - 200g',
    poNumber: 'PO-BLK-2026-0876',
    invoiceNumber: 'INV-BLK-0876',
    grn: 'GRN-BLK-0876',
    grnStatus: 'Accepted',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 2_20_000,
    paid: 1_82_000,
    variance: 38_000,
    status: 'Over-deducted',
    issueType: 'Rate variance',
    matchNote: 'Exact reference match on STL-BLK-0876. Commission charged at 24% vs contracted 20% - ₹8,800 excess on ₹2.2L GMV.',
    varianceBreakdown: [
      { label: 'Commission rate variance', amount: -34_200, why: 'Commission charged at 24% vs contracted 20% on ₹2.2L GMV. Excess = ₹8,800. Additional handling fee variance ₹25,400.' },
      { label: 'Deduction variance', amount: -1_800, why: 'Handling fee applied at ₹6/unit vs contracted ₹4/unit on 300 units' },
      { label: 'Tax / TCS variance', amount: -2_000, why: 'GST charged on the excess commission' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-BLK-2026-0876', status: 'Matched', amount: 2_20_000 },
      { ref: 'GRN-BLK-0876', status: 'Matched', amount: 2_20_000, unitsAccepted: 300, unitsOrdered: 300 },
      { ref: 'INV-BLK-0876', status: 'Matched', amount: 2_20_000 },
    ),
    nextAction: 'File rate variance dispute - attach contract BLK-CTR-FY26 showing 20% commission clause. Excess ₹34,200 recoverable.',
  },
  // ── Zepto: Matched (clean) ──
  {
    id: 'RC-0330',
    channel: 'Zepto',
    skuId: 'COS-IMM',
    skuLabel: 'COS-IMM · Immunity Mix - 150g',
    poNumber: 'PO-ZEP-2026-0330',
    invoiceNumber: 'INV-ZEP-0330',
    grn: 'GRN-ZEP-0330',
    grnStatus: 'Accepted',
    salePeriod: '8–14 Aug 2026',
    expectedPayoutDate: '18 Aug 2026',
    expected: 1_25_000,
    paid: 1_25_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Zepto settlement reconciled successfully.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (250 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Platform fee at contracted 4%' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-ZEP-2026-0330', status: 'Matched', amount: 1_25_000 },
      { ref: 'GRN-ZEP-0330', status: 'Matched', amount: 1_25_000, unitsAccepted: 250, unitsOrdered: 250 },
      { ref: 'INV-ZEP-0330', status: 'Matched', amount: 1_25_000 },
    ),
  },
  // ── Reliance: Matched (clean) ──
  {
    id: 'RC-0105',
    channel: 'Reliance',
    skuId: 'COS-ENR',
    skuLabel: 'COS-ENR · Energy Blend - 250g',
    poNumber: 'PO-REL-2026-0105',
    invoiceNumber: 'INV-REL-0105',
    grn: 'GRN-REL-0105',
    grnStatus: 'Accepted',
    salePeriod: '1–15 Jul 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 95_000,
    paid: 95_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Reference matched on portal. Margins applied correctly based on trade agreement.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (190 units)' },
      { label: 'Deduction variance', amount: 0, why: 'No rate discrepancies found' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST matches rate chart' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-REL-2026-0105', status: 'Matched', amount: 95_000 },
      { ref: 'GRN-REL-0105', status: 'Matched', amount: 95_000, unitsAccepted: 190, unitsOrdered: 190 },
      { ref: 'INV-REL-0105', status: 'Matched', amount: 95_000 },
    ),
  },
  // ── Cafes – Bangalore: Matched (clean) ──
  {
    id: 'RC-CAF-003',
    channel: 'Cafes – Bangalore',
    skuId: 'COS-PRO',
    skuLabel: 'COS-PRO · Plant Protein - 250g',
    poNumber: 'ORD-HT-2026-Aug',
    invoiceNumber: 'INV-CAF-0050',
    grn: 'DEL-CAF-0050',
    grnStatus: 'Accepted',
    salePeriod: '1–10 Aug 2026',
    expectedPayoutDate: '15 Aug 2026',
    expected: 54_000,
    paid: 54_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Payment via UPI reference XYZ123 matched against invoice INV-CAF-0050.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units delivered match order (90 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Zero deductions' },
      { label: 'Tax / TCS variance', amount: 0, why: 'Tax component correctly settled' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'ORD-HT-2026-Aug', status: 'Matched', amount: 54_000 },
      { ref: 'DEL-CAF-0050', status: 'Matched', amount: 54_000, unitsAccepted: 90, unitsOrdered: 90 },
      { ref: 'INV-CAF-0050', status: 'Matched', amount: 54_000 },
    ),
  },
  // ── Blinkit: Matched (clean) ──
  {
    id: 'RC-0880',
    channel: 'Blinkit',
    skuId: 'COS-SLP',
    skuLabel: 'COS-SLP · Sleep Easy - 100g',
    poNumber: 'PO-BLK-2026-0880',
    invoiceNumber: 'INV-BLK-0880',
    grn: 'GRN-BLK-0880',
    grnStatus: 'Accepted',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 1_60_000,
    paid: 1_60_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Clean settlement. Deductions align with Blinkit commission terms.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (320 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Commission charged at contracted 20%' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST matches invoice' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-BLK-2026-0880', status: 'Matched', amount: 1_60_000 },
      { ref: 'GRN-BLK-0880', status: 'Matched', amount: 1_60_000, unitsAccepted: 320, unitsOrdered: 320 },
      { ref: 'INV-BLK-0880', status: 'Matched', amount: 1_60_000 },
    ),
  },
];

// ── PURCHASE ORDERS (grouped from line items) ───────────────────────────────
export const reconPurchaseOrders: ReconPurchaseOrder[] = (() => {
  const grouped: Record<string, ReconLineItem[]> = {};
  for (const item of reconLineItems) {
    if (!grouped[item.poNumber]) {
      grouped[item.poNumber] = [];
    }
    grouped[item.poNumber].push(item);
  }

  return Object.entries(grouped).map(([poNumber, items]) => {
    const channel = items[0].channel;
    const expected = items.reduce((t, li) => t + li.expected, 0);
    const paid = items.reduce((t, li) => t + li.paid, 0);
    const variance = expected - paid;

    let status: ReconStatus = 'Matched';
    if (variance > 0) {
      const errorStatuses = items.map((li) => li.status).filter((s) => s !== 'Matched');
      status = (errorStatuses.length > 0 ? errorStatuses[0] : 'Short paid') as ReconStatus;
    }

    return {
      id: poNumber,
      channel,
      date: items[0].salePeriod,
      expected,
      paid,
      variance,
      status,
      lineItems: items,
    };
  });
})();
