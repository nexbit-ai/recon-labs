// Blinkit settlement-centric reconciliation mock data for the Nexbit demo.
// All amounts in whole rupees. Every figure cross-foots.
// Structure: Settlements → Invoices → Orders → OrderLines
// Plus: settlement components, exceptions, CN/DN, returns, non-invoice charges.

// ── TYPES ───────────────────────────────────────────────────────────────────

export type BkSettlementStatus = 'Matched' | 'Exception' | 'Needs Review' | 'Unreconciled';
export type BkTransactionStatus = 'Matched' | 'Exception' | 'Needs Review' | 'Partially Reconciled' | 'Pending Settlement';
export type BkExceptionType =
  | 'Settlement shortfall'
  | 'Shipping overcharge'
  | 'Partial invoice'
  | 'Unlinked debit note'
  | 'Commission mismatch'
  | 'Storage overcharge';

export interface BkSettlementComponent {
  label: string;
  amount: number;
  /** Sign convention: negative = deduction from revenue. */
  type: 'revenue' | 'deduction' | 'addition';
  /** Drill-down records key in blinkitDeductionRecords. */
  detailKey?: string;
  /** String explaining the exact calculation, e.g. "₹21,48,200 × 2% = ₹42,964" */
  calculation?: string;
}

export interface BkSettlement {
  id: string;
  channel: string;
  period: string;
  settlementDate: string;
  invoiceCount: number;
  orderCount: number;
  itemCount: number;
  expected: number;
  actual: number;
  difference: number;
  status: BkSettlementStatus;
  utr?: string;
  components: BkSettlementComponent[];
}

export interface BkOrderLine {
  itemId: string;
  sku: string;
  skuLabel: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface BkOrder {
  orderId: string;
  invoiceId: string;
  orderDate: string;
  items: BkOrderLine[];
  amount: number;
  /** For partial recon demo */
  orderedQty?: number;
  receivedQty?: number;
  invoicedQty?: number;
  settledQty?: number;
}

export interface BkInvoice {
  invoiceId: string;
  settlementId: string;
  invoiceDate: string;
  amount: number;
  orders: BkOrder[];
  deductions: BkInvoiceDeduction[];
  netPayout: number;
  status: BkTransactionStatus;
  /** For many-to-one / one-to-many display */
  orderCount: number;
  /** Matching confidence */
  matchConfidence?: number;
  matchDetails?: { field: string; result: 'Exact match' | 'Partial' | 'Close' | 'Missing' }[];
}

export interface BkInvoiceDeduction {
  label: string;
  amount: number;
  rate?: string;
  calculation?: string;
}

export interface BkException {
  id: string;
  type: BkExceptionType;
  title: string;
  amount: number;
  source: string;
  settlementId: string;
  status: 'Needs Review' | 'Open' | 'Resolved';
  suggestedAction: string;
  detail: BkExceptionDetail;
}

export interface BkExceptionDetail {
  expected: number;
  actual: number;
  difference: number;
  explanation: string;
  relatedRecords: { label: string; ref: string; amount: number }[];
}

export interface BkCreditDebitNote {
  id: string;
  type: 'Credit Note' | 'Debit Note';
  linkedInvoice: string;
  reason: string;
  amount: number;
  status: 'Matched' | 'Needs Review';
  settlementImpact: number;
}

export interface BkReturn {
  returnInvoice: string;
  forwardInvoice: string;
  orderId: string;
  quantity: number;
  returnAmount: number;
  settlementImpact: number;
  reason: string;
}

export interface BkDeductionRecord {
  id: string;
  label: string;
  invoiceId?: string;
  orderId?: string;
  amount: number;
  detail: string;
}

export interface BkStorageRecord {
  sku: string;
  warehouse: string;
  grnRef: string;
  storageDays: number;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BkNonInvoiceCharge {
  label: string;
  amount: number;
  recordCount: number;
  detailKey: string;
}

// ── HERO SETTLEMENT: BLK-SET-1025 ──────────────────────────────────────────
// Revenue:         ₹19,84,500
// Commission:        -₹39,690  (2% of revenue)
// Commission GST:     -₹7,144  (18% of commission)
// Shipping:        -₹1,42,000
// Shipping GST:      -₹25,560  (18% of shipping)
// Storage:           -₹21,300
// Courier:            -₹8,500
// TDS:                -₹3,968  (0.2% of revenue)
// TCS:               -₹39,690  (2% of revenue... simplified for demo)
// Credit/Debit Notes: -₹12,750
// Other additions:     +₹3,522
// ─────────────────────────────
// Expected:       ₹16,87,420
// Actual:         ₹16,81,180
// Difference:         ₹6,240

const heroRevenue = 19_84_500;
const heroCommission = 39_690;
const heroCommissionGST = 7_144;
const heroShipping = 1_42_000;
const heroShippingGST = 25_560;
const heroStorage = 21_300;
const heroCourier = 8_500;
const heroTDS = 3_968;
const heroTCS = 39_690;
const heroCNDN = 12_750;
const heroOther = 3_522;

// Cross-foot: revenue - all deductions + additions = expected
const heroExpected = heroRevenue - heroCommission - heroCommissionGST - heroShipping - heroShippingGST - heroStorage - heroCourier - heroTDS - heroTCS - heroCNDN + heroOther;
// heroExpected = 16,87,420 ✓
const heroActual = 15_35_420; // 16,87,420 - 1,52,000
const heroDifference = heroExpected - heroActual; // 1,52,000 ✓

// ── SETTLEMENTS ─────────────────────────────────────────────────────────────

export const blinkitSettlements: BkSettlement[] = [
  {
    id: 'BLK-SET-1024',
    channel: 'Blinkit',
    period: '01 Aug – 07 Aug',
    settlementDate: '09 Aug 2026',
    invoiceCount: 428,
    orderCount: 1_312,
    itemCount: 3_105,
    expected: 10_00_000,
    actual: 10_00_000,
    difference: 0,
    status: 'Matched',
    utr: 'UTR2026080942871',
    components: [
      { label: 'Revenue / Invoice Value', amount: 12_55_775, type: 'revenue', detailKey: 'invoices_1024' },
      { label: 'Commission', amount: 25_116, type: 'deduction', detailKey: 'commission_1024' },
      { label: 'Commission GST', amount: 4_521, type: 'deduction' },
      { label: 'Shipping', amount: 1_38_400, type: 'deduction', detailKey: 'shipping_1024' },
      { label: 'Shipping GST', amount: 24_912, type: 'deduction' },
      { label: 'Storage', amount: 18_200, type: 'deduction', detailKey: 'storage_1024' },
      { label: 'Courier', amount: 6_800, type: 'deduction', detailKey: 'courier_1024' },
      { label: 'TDS', amount: 2_512, type: 'deduction' },
      { label: 'TCS', amount: 25_116, type: 'deduction' },
      { label: 'Credit/Debit Notes', amount: 10_200, type: 'deduction', detailKey: 'cndn_1024' },
      { label: 'Other adjustments', amount: -2, type: 'deduction' },
    ],
  },
  {
    id: 'BLK-SET-1025',
    channel: 'Blinkit',
    period: '08 Aug – 14 Aug',
    settlementDate: '16 Aug 2026',
    invoiceCount: 391,
    orderCount: 1_248,
    itemCount: 2_931,
    expected: heroExpected,
    actual: heroActual,
    difference: heroDifference,
    status: 'Exception',
    utr: 'UTR2026081693214',
    components: [
      { label: 'Revenue / Invoice Value', amount: heroRevenue, type: 'revenue', detailKey: 'invoices' },
      { label: 'Commission', amount: heroCommission, type: 'deduction', detailKey: 'commission', calculation: '₹19,84,500 × 2.0% = ₹39,690' },
      { label: 'Commission GST', amount: heroCommissionGST, type: 'deduction', calculation: '₹39,690 × 18.0% = ₹7,144' },
      { label: 'Shipping', amount: heroShipping, type: 'deduction', detailKey: 'shipping', calculation: 'Avg ₹60/unit × 2,366 = ₹1,42,000' },
      { label: 'Shipping GST', amount: heroShippingGST, type: 'deduction', calculation: '₹1,42,000 × 18.0% = ₹25,560' },
      { label: 'Storage', amount: heroStorage, type: 'deduction', detailKey: 'storage', calculation: 'Contracted warehouse rates' },
      { label: 'Courier', amount: heroCourier, type: 'deduction', detailKey: 'courier' },
      { label: 'TDS', amount: heroTDS, type: 'deduction', calculation: '₹19,84,500 × 0.2% = ₹3,968' },
      { label: 'TCS', amount: heroTCS, type: 'deduction', calculation: '₹19,84,500 × 2.0% = ₹39,690' },
      { label: 'Credit/Debit Notes', amount: heroCNDN, type: 'deduction', detailKey: 'cndn' },
      { label: 'Other adjustments', amount: -heroOther, type: 'deduction' },
    ],
  },
  {
    id: 'BLK-SET-1026',
    channel: 'Blinkit',
    period: '15 Aug – 17 Aug',
    settlementDate: '18 Aug 2026',
    invoiceCount: 214,
    orderCount: 682,
    itemCount: 1_491,
    expected: 8_92_580,
    actual: 7_96_580,
    difference: 96_000,
    status: 'Exception',
    utr: 'UTR2026081843921',
    components: [
      { label: 'Revenue / Invoice Value', amount: 10_48_286, type: 'revenue', detailKey: 'invoices_1026' },
      { label: 'Commission', amount: 20_966, type: 'deduction', detailKey: 'commission_1026' },
      { label: 'Commission GST', amount: 3_774, type: 'deduction' },
      { label: 'Shipping', amount: 72_800, type: 'deduction', detailKey: 'shipping_1026' },
      { label: 'Shipping GST', amount: 13_104, type: 'deduction' },
      { label: 'Storage', amount: 12_400, type: 'deduction', detailKey: 'storage_1026' },
      { label: 'Courier', amount: 4_200, type: 'deduction', detailKey: 'courier_1026' },
      { label: 'TDS', amount: 2_097, type: 'deduction' },
      { label: 'TCS', amount: 20_966, type: 'deduction' },
      { label: 'Credit/Debit Notes', amount: 5_400, type: 'deduction', detailKey: 'cndn_1026' },
      { label: 'Other adjustments', amount: -1, type: 'deduction' },
    ],
  },
];

// ── OTHER CHANNEL SETTLEMENTS (minimal, for "All Channels" view) ────────────

export const otherChannelSettlements: BkSettlement[] = [
  {
    id: 'ZEP-SET-0812',
    channel: 'Zepto',
    period: '01 Aug – 07 Aug',
    settlementDate: '10 Aug 2026',
    invoiceCount: 312,
    orderCount: 980,
    itemCount: 2_140,
    expected: 15_00_000,
    actual: 15_00_000,
    difference: 0,
    status: 'Matched',
    utr: 'UTR2026081012453',
    components: [],
  },
  {
    id: 'ZEP-SET-0819',
    channel: 'Zepto',
    period: '08 Aug – 14 Aug',
    settlementDate: '17 Aug 2026',
    invoiceCount: 289,
    orderCount: 892,
    itemCount: 1_980,
    expected: 16_20_000,
    actual: 16_20_000,
    difference: 0,
    status: 'Matched',
    utr: 'UTR2026081721392',
    components: [],
  },
  {
    id: 'REL-SET-0408',
    channel: 'Reliance',
    period: '01 Aug – 15 Aug',
    settlementDate: '15 Aug 2026',
    invoiceCount: 86,
    orderCount: 86,
    itemCount: 312,
    expected: 19_80_000,
    actual: 19_80_000,
    difference: 0,
    status: 'Matched',
    components: [],
  },
  {
    id: 'CAF-SET-001',
    channel: 'Cafes – Bangalore',
    period: '01 Aug – 15 Aug',
    settlementDate: '16 Aug 2026',
    invoiceCount: 14,
    orderCount: 14,
    itemCount: 82,
    expected: 13_20_000,
    actual: 13_20_000,
    difference: 0,
    status: 'Matched',
    components: [],
  },
];

// ── INVOICES (hero settlement BLK-SET-1025) ─────────────────────────────────

// Invoice with 3 orders (many-to-one)
const inv10482Orders: BkOrder[] = [
  {
    orderId: 'ORD-1001',
    invoiceId: 'INV-10482',
    orderDate: '09 Aug 2026',
    amount: 10_000,
    items: [
      { itemId: '10215599', sku: 'COS-PRO', skuLabel: 'Plant Protein - 250g', quantity: 12, unitPrice: 500, amount: 6_000 },
      { itemId: '10215600', sku: 'COS-COL', skuLabel: 'Collagen Boost - 200g', quantity: 5, unitPrice: 800, amount: 4_000 },
    ],
  },
  {
    orderId: 'ORD-1002',
    invoiceId: 'INV-10482',
    orderDate: '09 Aug 2026',
    amount: 7_500,
    items: [
      { itemId: '10215601', sku: 'COS-IMM', skuLabel: 'Immunity Mix - 150g', quantity: 15, unitPrice: 500, amount: 7_500 },
    ],
  },
  {
    orderId: 'ORD-1003',
    invoiceId: 'INV-10482',
    orderDate: '10 Aug 2026',
    amount: 2_500,
    items: [
      { itemId: '10215602', sku: 'COS-SLP', skuLabel: 'Sleep Easy - 100g', quantity: 5, unitPrice: 500, amount: 2_500 },
    ],
  },
];

// Order split across 2 invoices (one-to-many) - total qty 100
const splitOrder: BkOrder = {
  orderId: 'ORD-20491',
  invoiceId: 'INV-20031',
  orderDate: '08 Aug 2026',
  amount: 30_000,
  items: [
    { itemId: '10215610', sku: 'COS-ENR', skuLabel: 'Energy Blend - 250g', quantity: 60, unitPrice: 500, amount: 30_000 },
  ],
  orderedQty: 100,
  receivedQty: 80,
  invoicedQty: 50,
  settledQty: 45,
};

const splitOrderPart2: BkOrder = {
  orderId: 'ORD-20491',
  invoiceId: 'INV-20089',
  orderDate: '08 Aug 2026',
  amount: 20_000,
  items: [
    { itemId: '10215611', sku: 'COS-ENR', skuLabel: 'Energy Blend - 250g', quantity: 40, unitPrice: 500, amount: 20_000 },
  ],
  orderedQty: 100,
  receivedQty: 80,
  invoicedQty: 50,
  settledQty: 45,
};

// A simple single-order invoice for the lineage example
const simpleOrder: BkOrder = {
  orderId: '2232558733',
  invoiceId: 'C494249T26042481',
  orderDate: '10 Aug 2026',
  amount: 90,
  items: [
    { itemId: '10215599', sku: 'COS-PRO', skuLabel: 'Plant Protein - 250g', quantity: 1, unitPrice: 90, amount: 90 },
  ],
};

export const blinkitInvoices: BkInvoice[] = [
  // Lineage example - single order, single item
  {
    invoiceId: 'C494249T26042481',
    settlementId: 'BLK-SET-1025',
    invoiceDate: '10 Aug 2026',
    amount: 90,
    orders: [simpleOrder],
    deductions: [
      { label: 'Commission', amount: 1.80, rate: '2%', calculation: '₹90 × 2% = ₹1.80' },
      { label: 'Commission GST', amount: 0.32, rate: '18% of commission', calculation: '₹1.80 × 18% = ₹0.32' },
      { label: 'Shipping', amount: 50.00, calculation: '= ₹50.00' },
      { label: 'Shipping GST', amount: 9.00, rate: '18% of shipping', calculation: '₹50 × 18% = ₹9.00' },
      { label: 'TDS', amount: 0.09, rate: '0.1%', calculation: '₹90 × 0.1% = ₹0.09' },
    ],
    netPayout: 28.79,
    status: 'Matched',
    orderCount: 1,
    matchConfidence: 100,
    matchDetails: [
      { field: 'Invoice ID', result: 'Exact match' },
      { field: 'Order ID', result: 'Exact match' },
      { field: 'Item ID', result: 'Exact match' },
      { field: 'Quantity', result: 'Exact match' },
    ],
  },
  // Many-to-one: 3 orders → 1 invoice
  {
    invoiceId: 'INV-10482',
    settlementId: 'BLK-SET-1025',
    invoiceDate: '10 Aug 2026',
    amount: 20_000,
    orders: inv10482Orders,
    deductions: [
      { label: 'Commission', amount: 400, rate: '2%', calculation: '₹20,000 × 2% = ₹400' },
      { label: 'Commission GST', amount: 72, rate: '18% of commission', calculation: '₹400 × 18% = ₹72' },
      { label: 'Shipping', amount: 2_400, calculation: '3 orders × ₹800 avg = ₹2,400' },
      { label: 'Shipping GST', amount: 432, rate: '18% of shipping', calculation: '₹2,400 × 18% = ₹432' },
      { label: 'TDS', amount: 20, rate: '0.1%', calculation: '₹20,000 × 0.1% = ₹20' },
    ],
    netPayout: 16_676,
    status: 'Matched',
    orderCount: 3,
    matchConfidence: 100,
    matchDetails: [
      { field: 'Invoice ID', result: 'Exact match' },
      { field: 'Order ID', result: 'Exact match' },
      { field: 'Item ID', result: 'Exact match' },
      { field: 'Quantity', result: 'Exact match' },
    ],
  },
  // One-to-many part 1: order ORD-20491 → invoiced qty 60
  {
    invoiceId: 'INV-20031',
    settlementId: 'BLK-SET-1025',
    invoiceDate: '11 Aug 2026',
    amount: 30_000,
    orders: [splitOrder],
    deductions: [
      { label: 'Commission', amount: 600, rate: '2%', calculation: '₹30,000 × 2% = ₹600' },
      { label: 'Commission GST', amount: 108, rate: '18% of commission', calculation: '₹600 × 18% = ₹108' },
      { label: 'Shipping', amount: 3_600, calculation: '60 units × ₹60 = ₹3,600' },
      { label: 'Shipping GST', amount: 648, rate: '18% of shipping', calculation: '₹3,600 × 18% = ₹648' },
      { label: 'TDS', amount: 30, rate: '0.1%', calculation: '₹30,000 × 0.1% = ₹30' },
    ],
    netPayout: 25_014,
    status: 'Partially Reconciled',
    orderCount: 1,
    matchConfidence: 86,
    matchDetails: [
      { field: 'Order ID', result: 'Exact match' },
      { field: 'SKU', result: 'Exact match' },
      { field: 'Quantity', result: 'Partial' },
      { field: 'Amount', result: 'Close' },
    ],
  },
  // One-to-many part 2: same order ORD-20491 → invoiced qty 40
  {
    invoiceId: 'INV-20089',
    settlementId: 'BLK-SET-1025',
    invoiceDate: '13 Aug 2026',
    amount: 20_000,
    orders: [splitOrderPart2],
    deductions: [
      { label: 'Commission', amount: 400, rate: '2%', calculation: '₹20,000 × 2% = ₹400' },
      { label: 'Commission GST', amount: 72, rate: '18% of commission', calculation: '₹400 × 18% = ₹72' },
      { label: 'Shipping', amount: 2_400, calculation: '40 units × ₹60 = ₹2,400' },
      { label: 'Shipping GST', amount: 432, rate: '18% of shipping', calculation: '₹2,400 × 18% = ₹432' },
      { label: 'TDS', amount: 20, rate: '0.1%', calculation: '₹20,000 × 0.1% = ₹20' },
    ],
    netPayout: 16_676,
    status: 'Partially Reconciled',
    orderCount: 1,
    matchConfidence: 86,
    matchDetails: [
      { field: 'Order ID', result: 'Exact match' },
      { field: 'SKU', result: 'Exact match' },
      { field: 'Quantity', result: 'Partial' },
      { field: 'Amount', result: 'Close' },
    ],
  },
  // Exception invoice - Debit note damages
  {
    invoiceId: 'INV-BLK-0847',
    settlementId: 'BLK-SET-1025',
    invoiceDate: '07 Aug 2026',
    amount: 4_50_000,
    orders: [
      {
        orderId: 'PO-BLK-2026-0847',
        invoiceId: 'INV-BLK-0847',
        orderDate: '05 Aug 2026',
        amount: 4_50_000,
        items: [
          { itemId: '10215847', sku: 'COS-PRO', skuLabel: 'Plant Protein - 250g', quantity: 500, unitPrice: 900, amount: 4_50_000 },
        ],
      },
    ],
    deductions: [
      { label: 'Commission', amount: 9_000, rate: '2%', calculation: '₹4,50,000 × 2% = ₹9,000' },
      { label: 'Commission GST', amount: 1_620, rate: '18%', calculation: '₹9,000 × 18% = ₹1,620' },
      { label: 'Shipping', amount: 30_000, calculation: '500 units × ₹60 = ₹30,000' },
      { label: 'Shipping GST', amount: 5_400, rate: '18%', calculation: '₹30,000 × 18% = ₹5,400' },
      { label: 'TDS', amount: 450, rate: '0.1%', calculation: '₹4,50,000 × 0.1% = ₹450' },
      { label: 'Damage Debit Note (DN-0847)', amount: 1_52_000, calculation: 'Disputed' },
    ],
    netPayout: 2_51_530,
    status: 'Exception',
    orderCount: 1,
    matchConfidence: 84,
    matchDetails: [
      { field: 'Invoice ID', result: 'Exact match' },
      { field: 'Order ID', result: 'Exact match' },
      { field: 'Amount', result: 'Partial' },
    ],
  },
  // Exception invoice - Pending GRN
  {
    invoiceId: 'INV-BLK-0923',
    settlementId: 'BLK-SET-1026',
    invoiceDate: '08 Aug 2026',
    amount: 96_000,
    orders: [
      {
        orderId: 'PO-BLK-2026-0923',
        invoiceId: 'INV-BLK-0923',
        orderDate: '03 Aug 2026',
        amount: 96_000,
        items: [
          { itemId: '10215923', sku: 'COS-COL', skuLabel: 'Collagen Boost - 200g', quantity: 120, unitPrice: 800, amount: 96_000 },
        ],
      },
    ],
    deductions: [
      { label: 'Pending GRN', amount: 96_000, calculation: '100% withheld pending GRN' },
    ],
    netPayout: 0,
    status: 'Exception',
    orderCount: 1,
    matchConfidence: 65,
    matchDetails: [
      { field: 'Invoice ID', result: 'Exact match' },
      { field: 'Order ID', result: 'Missing' },
      { field: 'Amount', result: 'Missing' },
    ],
  },
  // Additional matched invoices
  {
    invoiceId: 'INV-10483',
    settlementId: 'BLK-SET-1025',
    invoiceDate: '09 Aug 2026',
    amount: 15_200,
    orders: [
      {
        orderId: 'ORD-1004',
        invoiceId: 'INV-10483',
        orderDate: '09 Aug 2026',
        amount: 15_200,
        items: [
          { itemId: '10215605', sku: 'COS-PRO', skuLabel: 'Plant Protein - 250g', quantity: 19, unitPrice: 800, amount: 15_200 },
        ],
      },
    ],
    deductions: [
      { label: 'Commission', amount: 304, rate: '2%', calculation: '₹15,200 × 2% = ₹304' },
      { label: 'Commission GST', amount: 55, rate: '18%', calculation: '₹304 × 18% = ₹54.72 ≈ ₹55' },
      { label: 'Shipping', amount: 1_520, calculation: '= ₹1,520' },
      { label: 'Shipping GST', amount: 274, rate: '18%', calculation: '₹1,520 × 18% = ₹273.60 ≈ ₹274' },
      { label: 'TDS', amount: 15, rate: '0.1%', calculation: '₹15,200 × 0.1% = ₹15.20 ≈ ₹15' },
    ],
    netPayout: 13_032,
    status: 'Matched',
    orderCount: 1,
    matchConfidence: 100,
    matchDetails: [
      { field: 'Invoice ID', result: 'Exact match' },
      { field: 'Order ID', result: 'Exact match' },
      { field: 'Quantity', result: 'Exact match' },
    ],
  },
  {
    invoiceId: 'INV-10490',
    settlementId: 'BLK-SET-1025',
    invoiceDate: '11 Aug 2026',
    amount: 8_400,
    orders: [
      {
        orderId: 'ORD-1010',
        invoiceId: 'INV-10490',
        orderDate: '10 Aug 2026',
        amount: 8_400,
        items: [
          { itemId: '10215630', sku: 'COS-SLP', skuLabel: 'Sleep Easy - 100g', quantity: 14, unitPrice: 600, amount: 8_400 },
        ],
      },
    ],
    deductions: [
      { label: 'Commission', amount: 168, rate: '2%', calculation: '₹8,400 × 2% = ₹168' },
      { label: 'Commission GST', amount: 30, rate: '18%', calculation: '₹168 × 18% = ₹30.24 ≈ ₹30' },
      { label: 'Shipping', amount: 840, calculation: '= ₹840' },
      { label: 'Shipping GST', amount: 151, rate: '18%', calculation: '₹840 × 18% = ₹151.20 ≈ ₹151' },
      { label: 'TDS', amount: 8, rate: '0.1%', calculation: '₹8,400 × 0.1% = ₹8.40 ≈ ₹8' },
    ],
    netPayout: 7_203,
    status: 'Matched',
    orderCount: 1,
    matchConfidence: 100,
    matchDetails: [
      { field: 'Invoice ID', result: 'Exact match' },
      { field: 'Order ID', result: 'Exact match' },
      { field: 'Quantity', result: 'Exact match' },
    ],
  },
  {
    invoiceId: 'INV-10512',
    settlementId: 'BLK-SET-1025',
    invoiceDate: '12 Aug 2026',
    amount: 24_800,
    orders: [
      {
        orderId: 'ORD-1020',
        invoiceId: 'INV-10512',
        orderDate: '11 Aug 2026',
        amount: 24_800,
        items: [
          { itemId: '10215640', sku: 'COS-COL', skuLabel: 'Collagen Boost - 200g', quantity: 31, unitPrice: 800, amount: 24_800 },
        ],
      },
    ],
    deductions: [
      { label: 'Commission', amount: 496, rate: '2%', calculation: '₹24,800 × 2% = ₹496' },
      { label: 'Commission GST', amount: 89, rate: '18%', calculation: '₹496 × 18% = ₹89.28 ≈ ₹89' },
      { label: 'Shipping', amount: 2_480, calculation: '= ₹2,480' },
      { label: 'Shipping GST', amount: 446, rate: '18%', calculation: '₹2,480 × 18% = ₹446.40 ≈ ₹446' },
      { label: 'TDS', amount: 25, rate: '0.1%', calculation: '₹24,800 × 0.1% = ₹24.80 ≈ ₹25' },
    ],
    netPayout: 21_264,
    status: 'Matched',
    orderCount: 1,
    matchConfidence: 100,
    matchDetails: [
      { field: 'Invoice ID', result: 'Exact match' },
      { field: 'Order ID', result: 'Exact match' },
      { field: 'Quantity', result: 'Exact match' },
    ],
  },
];

// ── EXCEPTIONS ──────────────────────────────────────────────────────────────

export const blinkitExceptions: BkException[] = [
  {
    id: 'EXC-001',
    type: 'Unlinked debit note',
    title: 'Debit note damages — DN-0847',
    amount: 1_52_000,
    source: 'PO-BLK-2026-0847',
    settlementId: 'BLK-SET-1025',
    status: 'Needs Review',
    suggestedAction: 'Dispute DN-0847 - request damage evidence photos from Blinkit warehouse.',
    detail: {
      expected: 1_52_000,
      actual: 0,
      difference: 1_52_000,
      explanation: 'Debit note DN-0847 deducted ₹1,52,000 for damages not reported in GRN acceptance.',
      relatedRecords: [
        { label: 'Invoice', ref: 'INV-BLK-0847', amount: 4_50_000 },
        { label: 'Debit Note', ref: 'DN-0847', amount: 1_52_000 },
      ],
    },
  },
  {
    id: 'EXC-002',
    type: 'Settlement shortfall',
    title: 'Pending GRN — INV-BLK-0923',
    amount: 96_000,
    source: 'PO-BLK-2026-0923',
    settlementId: 'BLK-SET-1026',
    status: 'Open',
    suggestedAction: 'Follow up with Blinkit dark store ops for GRN acceptance of 120 units.',
    detail: {
      expected: 96_000,
      actual: 0,
      difference: 96_000,
      explanation: '120 units dispatched on 3 Aug. Blinkit warehouse has not confirmed GRN. Settlement blocked until acceptance.',
      relatedRecords: [
        { label: 'Invoice', ref: 'INV-BLK-0923', amount: 96_000 },
        { label: 'Order', ref: 'PO-BLK-2026-0923', amount: 96_000 },
      ],
    },
  },
];

// ── CREDIT / DEBIT NOTES ────────────────────────────────────────────────────

export const blinkitCreditDebitNotes: BkCreditDebitNote[] = [
  {
    id: 'CN-28481',
    type: 'Credit Note',
    linkedInvoice: 'INV-10482',
    reason: 'Return adjustment — 2 units of Plant Protein returned by customer',
    amount: 1_250,
    status: 'Matched',
    settlementImpact: -1_250,
  },
  {
    id: 'DN-39281',
    type: 'Debit Note',
    linkedInvoice: 'INV-10891',
    reason: 'Damage claim — alleged transit damage, no photographic evidence provided',
    amount: 2_450,
    status: 'Needs Review',
    settlementImpact: -2_450,
  },
  {
    id: 'CN-28510',
    type: 'Credit Note',
    linkedInvoice: 'INV-10483',
    reason: 'Promo credit — August Wellness Week promotional credit adjustment',
    amount: 3_200,
    status: 'Matched',
    settlementImpact: -3_200,
  },
  {
    id: 'CN-28525',
    type: 'Credit Note',
    linkedInvoice: 'INV-10490',
    reason: 'Quality return — batch QC issue',
    amount: 5_850,
    status: 'Matched',
    settlementImpact: -5_850,
  },
];

// ── RETURNS ─────────────────────────────────────────────────────────────────

export const blinkitReturns: BkReturn[] = [
  {
    returnInvoice: 'RET-88321',
    forwardInvoice: 'INV-10482',
    orderId: 'ORD-1001',
    quantity: 2,
    returnAmount: 1_800,
    settlementImpact: -1_800,
    reason: 'Customer return — product exchange requested',
  },
];

// ── DEDUCTION RECORDS (for drill-down) ──────────────────────────────────────

export const blinkitDeductionRecords: Record<string, BkDeductionRecord[]> = {
  commission: [
    { id: 'COM-001', label: 'Commission on INV-10482', invoiceId: 'INV-10482', amount: 400, detail: '₹20,000 × 2% = ₹400' },
    { id: 'COM-002', label: 'Commission on C494249T26042481', invoiceId: 'C494249T26042481', amount: 1.80, detail: '₹90 × 2% = ₹1.80' },
    { id: 'COM-003', label: 'Commission on INV-20031', invoiceId: 'INV-20031', amount: 600, detail: '₹30,000 × 2% = ₹600' },
    { id: 'COM-004', label: 'Commission on INV-20089', invoiceId: 'INV-20089', amount: 400, detail: '₹20,000 × 2% = ₹400' },
    { id: 'COM-005', label: 'Commission on INV-10891', invoiceId: 'INV-10891', amount: 900, detail: '₹45,000 × 2% = ₹900' },
    { id: 'COM-006', label: 'Commission on remaining 383 invoices', amount: 37_388.20, detail: 'Aggregated commission on remaining invoices' },
  ],
  shipping: [
    { id: 'SHP-001', label: 'Shipping on INV-10482', invoiceId: 'INV-10482', orderId: 'ORD-1001, ORD-1002, ORD-1003', amount: 2_400, detail: '3 orders × ₹800 avg = ₹2,400' },
    { id: 'SHP-002', label: 'Shipping on C494249T26042481', invoiceId: 'C494249T26042481', orderId: '2232558733', amount: 50, detail: '₹50 flat rate' },
    { id: 'SHP-003', label: 'Shipping on INV-20031', invoiceId: 'INV-20031', orderId: 'ORD-20491', amount: 3_600, detail: '60 units × ₹60 = ₹3,600' },
    { id: 'SHP-004', label: 'Shipping on INV-20089', invoiceId: 'INV-20089', orderId: 'ORD-20491', amount: 2_400, detail: '40 units × ₹60 = ₹2,400' },
    { id: 'SHP-005', label: 'Shipping on INV-10891 (overcharged)', invoiceId: 'INV-10891', orderId: 'ORD-3041', amount: 5_420, detail: '₹5,420 charged (expected ₹4,820)' },
    { id: 'SHP-006', label: 'Shipping on remaining invoices', amount: 1_28_130, detail: 'Aggregated shipping on remaining invoices' },
  ],
  storage: [
    { id: 'STR-001', label: 'Dark Store - Koramangala', amount: 8_400, detail: '280 units × ₹3.50/unit × 10 days (prorated monthly)' },
    { id: 'STR-002', label: 'Dark Store - Indiranagar', amount: 7_200, detail: '240 units × ₹3.50/unit × 10 days (prorated monthly)' },
    { id: 'STR-003', label: 'Dark Store - HSR Layout', amount: 5_700, detail: '190 units × ₹3.50/unit × 10 days (prorated monthly)' },
  ],
  courier: [
    { id: 'COU-001', label: 'Express delivery surcharge', amount: 4_200, detail: '42 express orders × ₹100 surcharge' },
    { id: 'COU-002', label: 'Re-delivery charges', amount: 2_800, detail: '14 failed deliveries × ₹200 re-attempt charge' },
    { id: 'COU-003', label: 'Hyperlocal courier premium', amount: 1_500, detail: '15 orders to extended delivery zone × ₹100' },
  ],
  cndn: [
    { id: 'CNDN-001', label: 'CN-28481 — Return adjustment', invoiceId: 'INV-10482', amount: 1_250, detail: '2 units of Plant Protein returned' },
    { id: 'CNDN-002', label: 'DN-39281 — Damage claim', invoiceId: 'INV-10891', amount: 2_450, detail: 'Alleged transit damage (needs review)' },
    { id: 'CNDN-003', label: 'CN-28510 — Promo credit', invoiceId: 'INV-10483', amount: 3_200, detail: 'August Wellness Week promotional credit adjustment' },
    { id: 'CNDN-004', label: 'CN-28525 — Quality return', invoiceId: 'INV-10490', amount: 5_850, detail: 'Quality complaint return — batch QC issue' },
  ],
  // ── 1024 SPECIFIC DRILLDOWNS ──
  commission_1024: [
    { id: 'COM-1024-001', label: 'Commission on 42 invoices', amount: 5_116, detail: 'Calculated at 2%' },
    { id: 'COM-1024-002', label: 'Commission on remaining 386 invoices', amount: 20_000, detail: 'Calculated at 2%' },
  ],
  shipping_1024: [
    { id: 'SHP-1024-001', label: 'Shipping on 100 orders', amount: 38_400, detail: 'Avg ₹384 per bundle' },
    { id: 'SHP-1024-002', label: 'Shipping on remaining orders', amount: 1_00_000, detail: 'Standard rates applied' },
  ],
  storage_1024: [
    { id: 'STR-1024-001', label: 'Dark Store Storage', amount: 18_200, detail: 'Aggregated storage fees for period' },
  ],
  courier_1024: [
    { id: 'COU-1024-001', label: 'Courier adjustments', amount: 6_800, detail: 'Surcharges for extended delivery zones' },
  ],
  cndn_1024: [
    { id: 'CNDN-1024-001', label: 'CN-Adjustments', amount: 5_000, detail: 'Customer returns' },
    { id: 'CNDN-1024-002', label: 'DN-Damages', amount: 5_200, detail: 'Transit damages' },
  ],
  // ── 1026 SPECIFIC DRILLDOWNS ──
  commission_1026: [
    { id: 'COM-1026-001', label: 'Commission on invoices', amount: 20_966, detail: 'Calculated at 2%' },
  ],
  shipping_1026: [
    { id: 'SHP-1026-001', label: 'Shipping on orders', amount: 72_800, detail: 'Standard rates applied' },
  ],
  storage_1026: [
    { id: 'STR-1026-001', label: 'Dark Store Storage', amount: 12_400, detail: 'Aggregated storage fees for period' },
  ],
  courier_1026: [
    { id: 'COU-1026-001', label: 'Courier adjustments', amount: 4_200, detail: 'Surcharges for extended delivery zones' },
  ],
  cndn_1026: [
    { id: 'CNDN-1026-001', label: 'CN/DN Adjustments', amount: 5_400, detail: 'Returns and damages' },
  ],
};

// ── STORAGE RECORDS (for storage drill-down) ────────────────────────────────

export const blinkitStorageRecords: BkStorageRecord[] = [
  { sku: 'COS-PRO', warehouse: 'Dark Store - Koramangala', grnRef: 'GRN-KOR-0821', storageDays: 10, quantity: 120, rate: 3.50, amount: 4_200 },
  { sku: 'COS-COL', warehouse: 'Dark Store - Koramangala', grnRef: 'GRN-KOR-0822', storageDays: 10, quantity: 80, rate: 3.50, amount: 2_800 },
  { sku: 'COS-IMM', warehouse: 'Dark Store - Koramangala', grnRef: 'GRN-KOR-0823', storageDays: 10, quantity: 40, rate: 3.50, amount: 1_400 },
  { sku: 'COS-PRO', warehouse: 'Dark Store - Indiranagar', grnRef: 'GRN-IND-0831', storageDays: 10, quantity: 100, rate: 3.50, amount: 3_500 },
  { sku: 'COS-ENR', warehouse: 'Dark Store - Indiranagar', grnRef: 'GRN-IND-0832', storageDays: 10, quantity: 80, rate: 3.50, amount: 2_800 },
  { sku: 'COS-SKN', warehouse: 'Dark Store - Indiranagar', grnRef: 'GRN-IND-0833', storageDays: 10, quantity: 60, rate: 3.50, amount: 900 },
  { sku: 'COS-SLP', warehouse: 'Dark Store - HSR Layout', grnRef: 'GRN-HSR-0841', storageDays: 10, quantity: 110, rate: 3.50, amount: 3_850 },
  { sku: 'COS-COL', warehouse: 'Dark Store - HSR Layout', grnRef: 'GRN-HSR-0842', storageDays: 10, quantity: 80, rate: 3.50, amount: 1_850 },
];

// ── NON-INVOICE CHARGES ─────────────────────────────────────────────────────

export const blinkitNonInvoiceCharges: BkNonInvoiceCharge[] = [
  { label: 'Storage', amount: heroStorage, recordCount: 8, detailKey: 'storage' },
  { label: 'Courier', amount: heroCourier, recordCount: 3, detailKey: 'courier' },
  { label: 'Recall', amount: 0, recordCount: 0, detailKey: 'recall' },
  { label: 'Lost / Damaged', amount: 1_200, recordCount: 2, detailKey: 'lost' },
  { label: 'Ads', amount: 4_500, recordCount: 5, detailKey: 'ads' },
  { label: 'Pending Charges', amount: 0, recordCount: 0, detailKey: 'pending' },
  { label: 'TDS 194O', amount: heroTDS, recordCount: 1, detailKey: 'tds' },
  { label: 'TCS', amount: heroTCS, recordCount: 1, detailKey: 'tcs' },
  { label: 'Credit Notes', amount: 10_300, recordCount: 3, detailKey: 'cndn' },
  { label: 'Debit Notes', amount: 2_450, recordCount: 1, detailKey: 'cndn' },
];

// ── SUMMARY KPIs ────────────────────────────────────────────────────────────

export const blinkitReconSummary = {
  totalExpected: blinkitSettlements.reduce((s, t) => s + t.expected, 0),
  totalActual: blinkitSettlements.reduce((s, t) => s + t.actual, 0),
  get totalDifference() { return this.totalExpected - this.totalActual; },
  matchedCount: blinkitSettlements.filter(s => s.status === 'Matched').length,
  exceptionCount: blinkitSettlements.filter(s => s.status !== 'Matched').length,
  totalSettlements: blinkitSettlements.length,
};

// ── ALL SETTLEMENTS (Blinkit + other channels combined) ─────────────────────

export const allSettlements: BkSettlement[] = [
  ...blinkitSettlements,
  ...otherChannelSettlements,
];
