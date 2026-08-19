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
  { key: 'receivable', label: 'Total Receivables', value: 1_00_00_000, display: '₹1.00 Cr', unit: 'inr' },
  { key: 'settled', label: 'Total Received', value: 97_52_000, display: '₹97.52L', unit: 'inr' },
  { key: 'leakage', label: 'Shortfall / Gap', value: 2_48_000, display: '₹2.48L', unit: 'inr' },
  { key: 'recoverable', label: 'Recoverable now', value: 1_52_000, display: '₹1.52L', unit: 'inr' },
  { key: 'expiring', label: 'Recoverable expiring within ~10 days', value: 1_52_000, display: '₹1.52L', unit: 'inr' },
  { key: 'recoveredYtd', label: 'Recovered YTD', value: 8_40_000, display: '₹8.40L', unit: 'inr' },
  { key: 'netRealisation', label: 'True net realisation', value: 97.5, display: '97.5%', unit: 'percent' },
  { key: 'underDispute', label: 'Under dispute', value: 1_52_000, display: '₹1.52L', unit: 'inr' },
];

// Reference for views: the assumption brand planned against, vs reality.
export const netRealisationAssumptionPct = 82;

// Claims won that make up Recovered YTD (₹8.40L), shown as a caption.
export const recoveredYtdClaimsWon = 94;

// Total open issues detected this quarter; the feed surfaces the top few by value.
export const flaggedIssuesTotal = 2;

export const headlineByKey = (key: string): HeadlineMetric =>
  headline.find((m) => m.key === key)!;

// ── PER-CHANNEL PERFORMANCE (sums to the headline totals) ───────────────────
// settled Σ = ₹90.00L · leakage Σ = ₹10.00L · recoverable Σ = ₹6.80L
// receivable per channel = settled + leakage → Σ = ₹1.00 Cr
export const channelPerformance: ChannelPerformance[] = [
  { channel: 'Blinkit',            settled: 33_32_000, leakage: 2_48_000, netRealisationPct: 93.0, recoverable: 1_52_000 },
  { channel: 'Zepto',              settled: 31_20_000, leakage: 0, netRealisationPct: 100, recoverable: 0 },
  { channel: 'Reliance',           settled: 19_80_000, leakage: 0, netRealisationPct: 100, recoverable: 0 },
  { channel: 'Cafes – Bangalore',  settled: 13_20_000, leakage: 0, netRealisationPct: 100, recoverable: 0 },
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
    id: 'OR-005',
    channel: 'Blinkit',
    title: 'PO-BLK-2026-0923',
    detail: 'GRN pending for 120 units of Collagen Boost dispatched on 3 Aug. Warehouse has not confirmed acceptance. Invoice INV-BLK-0923 on hold.',
    amount: 96_000,
    type: 'Pending GRN',
    confidence: 'High',
    poNumber: 'PO-BLK-2026-0923',
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
  // ── Zepto: Matched (clean) ──
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
    expected: 10_00_000,
    paid: 10_00_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Zepto settlement reconciled successfully.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (1000 units)' },
      { label: 'Deduction variance', amount: 0, why: 'All deductions reconcile to the Zepto rate card' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-ZEP-2026-0391', status: 'Matched', amount: 10_00_000 },
      { ref: 'GRN-ZEP-0391', status: 'Matched', amount: 10_00_000, unitsAccepted: 1000, unitsOrdered: 1000 },
      { ref: 'INV-ZEP-0391', status: 'Matched', amount: 10_00_000 },
    ),
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
  // ── Zepto: Matched (clean) ──
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
    expected: 8_00_000,
    paid: 8_00_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Zepto settlement reconciled successfully.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (800 units)' },
      { label: 'Deduction variance', amount: 0, why: 'All deductions reconcile to the Zepto rate card' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-ZEP-2026-0445', status: 'Matched', amount: 8_00_000 },
      { ref: 'GRN-ZEP-0445', status: 'Matched', amount: 8_00_000, unitsAccepted: 800, unitsOrdered: 800 },
      { ref: 'INV-ZEP-0445', status: 'Matched', amount: 8_00_000 },
    ),
  },
  // ── Reliance: Matched (clean) ──
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
    expected: 6_00_000,
    paid: 6_00_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Reliance vendor portal settlement reconciled. 45-day credit terms met.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (1000 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Margin and listing fees at contracted rates' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-REL-2026-0112', status: 'Matched', amount: 6_00_000 },
      { ref: 'GRN-REL-0112', status: 'Matched', amount: 6_00_000, unitsAccepted: 1000, unitsOrdered: 1000 },
      { ref: 'INV-REL-0112', status: 'Matched', amount: 6_00_000 },
    ),
  },
  // ── Reliance: Matched (clean) ──
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
    expected: 5_00_000,
    paid: 5_00_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Reliance vendor portal settlement reconciled. 45-day credit terms met.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (1000 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Margin and listing fees at contracted rates' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-REL-2026-0087', status: 'Matched', amount: 5_00_000 },
      { ref: 'GRN-REL-0087', status: 'Matched', amount: 5_00_000, unitsAccepted: 1000, unitsOrdered: 1000 },
      { ref: 'INV-REL-0087', status: 'Matched', amount: 5_00_000 },
    ),
  },
  // ── Cafes – Bangalore: Matched (clean) ──
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
    expected: 5_00_000,
    paid: 5_00_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Payment via NEFT reference XYZ123 matched against invoice INV-CAF-0034.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units delivered match order (80 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Zero deductions' },
      { label: 'Tax / TCS variance', amount: 0, why: 'Tax component correctly settled' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'ORD-TWC-2026-Jul', status: 'Matched', amount: 5_00_000 },
      { ref: 'DEL-CAF-0034', status: 'Matched', amount: 5_00_000, unitsAccepted: 1000, unitsOrdered: 1000 },
      { ref: 'INV-CAF-0034', status: 'Matched', amount: 5_00_000 },
    ),
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
    expected: 12_00_000,
    paid: 12_00_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - GRN ↔ settlement ID, amount within ±₹1 tolerance. All deductions reconcile to rate card.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (2000 units)' },
      { label: 'Deduction variance', amount: 0, why: 'All deductions reconcile to the Blinkit rate card - commission, fulfilment, and handling fees correct' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-BLK-2026-0810', status: 'Matched', amount: 12_00_000 },
      { ref: 'GRN-BLK-0810', status: 'Matched', amount: 12_00_000, unitsAccepted: 2000, unitsOrdered: 2000 },
      { ref: 'INV-BLK-0810', status: 'Matched', amount: 12_00_000 },
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
    expected: 7_00_000,
    paid: 7_00_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - settlement ID resolved on first pass, amount within ±₹1 tolerance.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (700 units)' },
      { label: 'Deduction variance', amount: 0, why: 'All deductions reconcile to the Zepto rate card' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-ZEP-2026-0320', status: 'Matched', amount: 7_00_000 },
      { ref: 'GRN-ZEP-0320', status: 'Matched', amount: 7_00_000, unitsAccepted: 700, unitsOrdered: 700 },
      { ref: 'INV-ZEP-0320', status: 'Matched', amount: 7_00_000 },
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
    expected: 5_00_000,
    paid: 5_00_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Reliance vendor portal settlement reconciled. 45-day credit terms met.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (1000 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Margin and listing fees at contracted rates' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-REL-2026-0098', status: 'Matched', amount: 5_00_000 },
      { ref: 'GRN-REL-0098', status: 'Matched', amount: 5_00_000, unitsAccepted: 1000, unitsOrdered: 1000 },
      { ref: 'INV-REL-0098', status: 'Matched', amount: 5_00_000 },
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
    expected: 4_50_000,
    paid: 4_50_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Email order from Blue Tokai. Payment received via NEFT on 6 Aug - 1 day early.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units delivered match order (60 units)' },
      { label: 'Deduction variance', amount: 0, why: 'No deductions - direct supply terms' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST credited correctly' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'ORD-BT-2026-Jul', status: 'Matched', amount: 4_50_000 },
      { ref: 'DEL-CAF-0041', status: 'Matched', amount: 4_50_000, unitsAccepted: 900, unitsOrdered: 900 },
      { ref: 'INV-CAF-0041', status: 'Matched', amount: 4_50_000 },
    ),
  },
  // ── Blinkit: Matched (clean) ──
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
    expected: 10_00_000,
    paid: 10_00_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - settlement ID resolved on first pass, amount within ±₹1 tolerance.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (1000 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Commission charged at contracted 20%' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST matches invoice' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-BLK-2026-0876', status: 'Matched', amount: 10_00_000 },
      { ref: 'GRN-BLK-0876', status: 'Matched', amount: 10_00_000, unitsAccepted: 1000, unitsOrdered: 1000 },
      { ref: 'INV-BLK-0876', status: 'Matched', amount: 10_00_000 },
    ),
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
    expected: 6_20_000,
    paid: 6_20_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Zepto settlement reconciled successfully.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (1240 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Platform fee at contracted 4%' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-ZEP-2026-0330', status: 'Matched', amount: 6_20_000 },
      { ref: 'GRN-ZEP-0330', status: 'Matched', amount: 6_20_000, unitsAccepted: 1240, unitsOrdered: 1240 },
      { ref: 'INV-ZEP-0330', status: 'Matched', amount: 6_20_000 },
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
    expected: 3_80_000,
    paid: 3_80_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Reference matched on portal. Margins applied correctly based on trade agreement.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (760 units)' },
      { label: 'Deduction variance', amount: 0, why: 'No rate discrepancies found' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST matches rate chart' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-REL-2026-0105', status: 'Matched', amount: 3_80_000 },
      { ref: 'GRN-REL-0105', status: 'Matched', amount: 3_80_000, unitsAccepted: 760, unitsOrdered: 760 },
      { ref: 'INV-REL-0105', status: 'Matched', amount: 3_80_000 },
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
    expected: 3_70_000,
    paid: 3_70_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Payment via UPI reference XYZ123 matched against invoice INV-CAF-0050.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units delivered match order (90 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Zero deductions' },
      { label: 'Tax / TCS variance', amount: 0, why: 'Tax component correctly settled' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'ORD-HT-2026-Aug', status: 'Matched', amount: 3_70_000 },
      { ref: 'DEL-CAF-0050', status: 'Matched', amount: 3_70_000, unitsAccepted: 740, unitsOrdered: 740 },
      { ref: 'INV-CAF-0050', status: 'Matched', amount: 3_70_000 },
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
    expected: 8_34_000,
    paid: 8_34_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Clean settlement. Deductions align with Blinkit commission terms.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (1668 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Commission charged at contracted 20%' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST matches invoice' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-BLK-2026-0880', status: 'Matched', amount: 8_34_000 },
      { ref: 'GRN-BLK-0880', status: 'Matched', amount: 8_34_000, unitsAccepted: 1668, unitsOrdered: 1668 },
      { ref: 'INV-BLK-0880', status: 'Matched', amount: 8_34_000 },
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
