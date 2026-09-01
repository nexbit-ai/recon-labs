// AP Demo Data — hardcoded for sales demo at /b2b/payable/*
// Covers all test cases: perfect match, qty mismatch, HSN mismatch, GST mismatch,
// freight unmapped, short GRN + credit note.

// ── VENDORS ──────────────────────────────────────────────────────────────────
export interface Vendor {
  id: string;
  name: string;
  gstin: string;
  pan: string;
  paymentTerms: string;
  bank: string;
  contactEmail: string;
  state: string;
  vendorCode: string;
}

export const VENDORS: Vendor[] = [
  {
    id: 'V001',
    name: 'Tata Motors Ancillaries Ltd',
    gstin: '27AAACT2727Q1Z5',
    pan: 'AAACT2727Q',
    paymentTerms: 'Net 45',
    bank: 'HDFC Bank · A/C 00110034872',
    contactEmail: 'ap@tataancillaries.in',
    state: 'Maharashtra',
    vendorCode: 'VM-0041',
  },
  {
    id: 'V002',
    name: 'Shree Cements Ltd',
    gstin: '08AAACS1429G1Z6',
    pan: 'AAACS1429G',
    paymentTerms: 'Net 30',
    bank: 'SBI · A/C 38812004521',
    contactEmail: 'finance@shreecements.com',
    state: 'Rajasthan',
    vendorCode: 'VM-0089',
  },
  {
    id: 'V003',
    name: 'Infosys BPO Services',
    gstin: '29AAACI1681G1ZM',
    pan: 'AAACI1681G',
    paymentTerms: 'Net 60',
    bank: 'ICICI Bank · A/C 777501289012',
    contactEmail: 'billing@infosysbpo.com',
    state: 'Karnataka',
    vendorCode: 'VM-0212',
  },
];

// ── PURCHASE ORDERS ───────────────────────────────────────────────────────────
export interface POLineItem {
  hsn: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  gstRate: number; // %
}

export interface PurchaseOrder {
  id: string;
  vendor: string; // Vendor.id
  date: string;
  lineItems: POLineItem[];
  freightTerms: boolean; // whether freight is included in PO
  totalValue: number;
  status: 'Open' | 'Partially received' | 'Closed';
}

export const POS: PurchaseOrder[] = [
  {
    id: 'PO-2024-001',
    vendor: 'V001',
    date: '2024-06-01',
    lineItems: [
      { hsn: '87089900', description: 'Brake Assembly – Model X', qty: 500, unit: 'PCS', rate: 1200, gstRate: 18 },
      { hsn: '87089100', description: 'Radiator Grille', qty: 300, unit: 'PCS', rate: 850, gstRate: 18 },
    ],
    freightTerms: true,
    totalValue: 855000,
    status: 'Partially received',
  },
  {
    id: 'PO-2024-002',
    vendor: 'V002',
    date: '2024-06-05',
    lineItems: [
      { hsn: '25231000', description: 'Portland Cement (50kg Bag)', qty: 2000, unit: 'BAG', rate: 380, gstRate: 28 },
    ],
    freightTerms: false, // freight not in PO — triggers exception on INV-7825
    totalValue: 760000,
    status: 'Open',
  },
  {
    id: 'PO-2024-003',
    vendor: 'V003',
    date: '2024-06-08',
    lineItems: [
      { hsn: '99836931', description: 'Payroll Processing Services – Jun', qty: 1, unit: 'MONTH', rate: 180000, gstRate: 18 },
    ],
    freightTerms: false,
    totalValue: 180000,
    status: 'Open',
  },
  {
    id: 'PO-2024-004',
    vendor: 'V001',
    date: '2024-06-10',
    lineItems: [
      { hsn: '87089900', description: 'Brake Assembly – Model Y', qty: 200, unit: 'PCS', rate: 1350, gstRate: 18 },
    ],
    freightTerms: true,
    totalValue: 270000,
    status: 'Open',
  },
  {
    id: 'PO-2024-005',
    vendor: 'V002',
    date: '2024-06-15',
    lineItems: [
      { hsn: '25232100', description: 'White Cement (25kg Bag)', qty: 1000, unit: 'BAG', rate: 620, gstRate: 28 },
    ],
    freightTerms: true,
    totalValue: 620000,
    status: 'Open',
  },
];

// ── GOODS RECEIPT NOTES ───────────────────────────────────────────────────────
export interface GRNLineItem {
  description: string;
  orderedQty: number;
  receivedQty: number;
  unit: string;
  rate: number;
}

export interface GRN {
  id: string;
  po: string;
  vendor: string;
  date: string;
  lineItems: GRNLineItem[];
  inspectionStatus: 'Passed' | 'Short receipt' | 'Damage noted';
  totalValue: number;
}

export const GRNS: GRN[] = [
  {
    id: 'GRN-001',
    po: 'PO-2024-001',
    vendor: 'V001',
    date: '2024-06-10',
    lineItems: [
      { description: 'Brake Assembly – Model X', orderedQty: 500, receivedQty: 500, unit: 'PCS', rate: 1200 },
      { description: 'Radiator Grille', orderedQty: 300, receivedQty: 300, unit: 'PCS', rate: 850 },
    ],
    inspectionStatus: 'Passed',
    totalValue: 855000,
  },
  {
    id: 'GRN-002',
    po: 'PO-2024-002',
    vendor: 'V002',
    date: '2024-06-14',
    lineItems: [
      { description: 'Portland Cement (50kg Bag)', orderedQty: 2000, receivedQty: 1800, unit: 'BAG', rate: 380 }, // short receipt
    ],
    inspectionStatus: 'Short receipt',
    totalValue: 684000,
  },
  {
    id: 'GRN-003',
    po: 'PO-2024-003',
    vendor: 'V003',
    date: '2024-06-09',
    lineItems: [
      { description: 'Payroll Processing Services – Jun', orderedQty: 1, receivedQty: 1, unit: 'MONTH', rate: 180000 },
    ],
    inspectionStatus: 'Passed',
    totalValue: 180000,
  },
  {
    id: 'GRN-004',
    po: 'PO-2024-004',
    vendor: 'V001',
    date: '2024-06-18',
    lineItems: [
      { description: 'Brake Assembly – Model Y', orderedQty: 200, receivedQty: 200, unit: 'PCS', rate: 1350 },
    ],
    inspectionStatus: 'Passed',
    totalValue: 270000,
  },
  {
    id: 'GRN-005',
    po: 'PO-2024-005',
    vendor: 'V002',
    date: '2024-06-22',
    lineItems: [
      { description: 'White Cement (25kg Bag)', orderedQty: 1000, receivedQty: 1000, unit: 'BAG', rate: 620 },
    ],
    inspectionStatus: 'Passed',
    totalValue: 620000,
  },
];

// ── INVOICES ──────────────────────────────────────────────────────────────────
export type InvoiceMatchStatus = 'Match' | 'Within tolerance' | 'Needs review' | 'Block payment';
export type InvoiceStatus = 'Approved' | 'Pending review' | 'Exception' | 'Blocked' | 'Paid';

export interface InvoiceLineItem {
  hsn: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  gstRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  po: string;
  grn: string;
  vendor: string;
  date: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  freightCharge?: number;
  totalTaxable: number;
  totalGST: number;
  totalAmount: number;
  matchStatus: InvoiceMatchStatus;
  invoiceStatus: InvoiceStatus;
  exceptionIds: string[]; // references to EXCEPTIONS
  notes: string;
}

export const INVOICES: Invoice[] = [
  // ① Perfect match
  {
    id: 'INV-7821',
    po: 'PO-2024-001',
    grn: 'GRN-001',
    vendor: 'V001',
    date: '2024-06-12',
    dueDate: '2024-07-27',
    lineItems: [
      { hsn: '87089900', description: 'Brake Assembly – Model X', qty: 500, unit: 'PCS', rate: 1200, gstRate: 18, amount: 600000 },
      { hsn: '87089100', description: 'Radiator Grille', qty: 300, unit: 'PCS', rate: 850, gstRate: 18, amount: 255000 },
    ],
    totalTaxable: 855000,
    totalGST: 153900,
    totalAmount: 1008900,
    matchStatus: 'Match',
    invoiceStatus: 'Approved',
    exceptionIds: [],
    notes: 'All 3-way checks passed. SAP-ready.',
  },
  // ② Qty mismatch
  {
    id: 'INV-7822',
    po: 'PO-2024-001',
    grn: 'GRN-001',
    vendor: 'V001',
    date: '2024-06-13',
    dueDate: '2024-07-28',
    lineItems: [
      { hsn: '87089900', description: 'Brake Assembly – Model X', qty: 520, unit: 'PCS', rate: 1200, gstRate: 18, amount: 624000 }, // 520 vs 500
      { hsn: '87089100', description: 'Radiator Grille', qty: 300, unit: 'PCS', rate: 850, gstRate: 18, amount: 255000 },
    ],
    totalTaxable: 879000,
    totalGST: 158220,
    totalAmount: 1037220,
    matchStatus: 'Needs review',
    invoiceStatus: 'Exception',
    exceptionIds: ['EXC-004'],
    notes: 'Invoice claims 520 units vs GRN/PO of 500. Δ₹24,000.',
  },
  // ③ HSN mismatch
  {
    id: 'INV-7823',
    po: 'PO-2024-002',
    grn: 'GRN-002',
    vendor: 'V002',
    date: '2024-06-16',
    dueDate: '2024-07-16',
    lineItems: [
      { hsn: '25231090', description: 'Portland Cement (50kg Bag)', qty: 1800, unit: 'BAG', rate: 380, gstRate: 28, amount: 684000 }, // HSN mismatch: should be 25231000
    ],
    totalTaxable: 684000,
    totalGST: 191520,
    totalAmount: 875520,
    matchStatus: 'Needs review',
    invoiceStatus: 'Exception',
    exceptionIds: ['EXC-002'],
    notes: 'HSN code on invoice (25231090) differs from PO (25231000). May affect GST rate.',
  },
  // ④ GST mismatch
  {
    id: 'INV-7824',
    po: 'PO-2024-003',
    grn: 'GRN-003',
    vendor: 'V003',
    date: '2024-06-11',
    dueDate: '2024-08-10',
    lineItems: [
      { hsn: '99836931', description: 'Payroll Processing Services – Jun', qty: 1, unit: 'MONTH', rate: 180000, gstRate: 28, amount: 180000 }, // GST claimed at 28% vs 18% in PO
    ],
    totalTaxable: 180000,
    totalGST: 50400, // 28% applied vs 32400 at 18%
    totalAmount: 230400,
    matchStatus: 'Block payment',
    invoiceStatus: 'Blocked',
    exceptionIds: ['EXC-003'],
    notes: 'Vendor charged GST @ 28%. SAC 99836931 attracts 18% only. Overpayment risk ₹18,000.',
  },
  // ⑤ Freight not in PO
  {
    id: 'INV-7825',
    po: 'PO-2024-002',
    grn: 'GRN-002',
    vendor: 'V002',
    date: '2024-06-17',
    dueDate: '2024-07-17',
    lineItems: [
      { hsn: '25231000', description: 'Portland Cement (50kg Bag)', qty: 2000, unit: 'BAG', rate: 380, gstRate: 28, amount: 760000 },
    ],
    freightCharge: 22000,
    totalTaxable: 782000,
    totalGST: 215040,
    totalAmount: 997040,
    matchStatus: 'Needs review',
    invoiceStatus: 'Exception',
    exceptionIds: ['EXC-005', 'EXC-006'],
    notes: 'Freight ₹22,000 not contracted in PO-2024-002. Needs procurement sign-off.',
  },
  // ⑥ Short GRN + credit note
  {
    id: 'INV-7826',
    po: 'PO-2024-005',
    grn: 'GRN-005',
    vendor: 'V002',
    date: '2024-06-24',
    dueDate: '2024-07-24',
    lineItems: [
      { hsn: '25232100', description: 'White Cement (25kg Bag)', qty: 1000, unit: 'BAG', rate: 620, gstRate: 28, amount: 620000 },
    ],
    totalTaxable: 620000,
    totalGST: 173600,
    totalAmount: 793600,
    matchStatus: 'Within tolerance',
    invoiceStatus: 'Pending review',
    exceptionIds: ['EXC-001'],
    notes: 'Short GRN on prior PO. Credit note CN-001 covers ₹76,000 offset.',
  },
  // ⑦ - ⑫ Extra mock data to populate list
  {
    id: 'INV-7827',
    po: 'PO-2024-004',
    grn: 'GRN-004',
    vendor: 'V001',
    date: '2024-06-25',
    dueDate: '2024-08-09',
    lineItems: [{ hsn: '87089900', description: 'Brake Assembly – Model Y', qty: 200, unit: 'PCS', rate: 1350, gstRate: 18, amount: 270000 }],
    totalTaxable: 270000,
    totalGST: 48600,
    totalAmount: 318600,
    matchStatus: 'Match',
    invoiceStatus: 'Approved',
    exceptionIds: [],
    notes: 'Auto-approved.',
  },
  {
    id: 'INV-7828',
    po: 'PO-2024-005',
    grn: 'GRN-005',
    vendor: 'V002',
    date: '2024-06-26',
    dueDate: '2024-07-26',
    lineItems: [{ hsn: '25232100', description: 'White Cement (25kg Bag)', qty: 1000, unit: 'BAG', rate: 620, gstRate: 28, amount: 620000 }],
    totalTaxable: 620000,
    totalGST: 173600,
    totalAmount: 793600,
    matchStatus: 'Match',
    invoiceStatus: 'Paid',
    exceptionIds: [],
    notes: 'Cleared for payment.',
  },
  {
    id: 'INV-7829',
    po: 'PO-2024-001',
    grn: 'GRN-001',
    vendor: 'V001',
    date: '2024-06-27',
    dueDate: '2024-08-11',
    lineItems: [{ hsn: '87089900', description: 'Brake Assembly – Model X', qty: 100, unit: 'PCS', rate: 1200, gstRate: 18, amount: 120000 }],
    totalTaxable: 120000,
    totalGST: 21600,
    totalAmount: 141600,
    matchStatus: 'Within tolerance',
    invoiceStatus: 'Approved',
    exceptionIds: [],
    notes: 'Slight rounding diff on GST, within tolerance.',
  },
  {
    id: 'INV-7830',
    po: 'PO-2024-003',
    grn: 'GRN-003',
    vendor: 'V003',
    date: '2024-06-28',
    dueDate: '2024-08-27',
    lineItems: [{ hsn: '99836931', description: 'Payroll Processing Services – Jun', qty: 1, unit: 'MONTH', rate: 180000, gstRate: 18, amount: 180000 }],
    totalTaxable: 180000,
    totalGST: 32400,
    totalAmount: 212400,
    matchStatus: 'Match',
    invoiceStatus: 'Approved',
    exceptionIds: [],
    notes: 'Perfect match.',
  },
  {
    id: 'INV-7831',
    po: 'PO-2024-002',
    grn: 'GRN-002',
    vendor: 'V002',
    date: '2024-06-29',
    dueDate: '2024-07-29',
    lineItems: [{ hsn: '25231000', description: 'Portland Cement (50kg Bag)', qty: 500, unit: 'BAG', rate: 380, gstRate: 28, amount: 190000 }],
    totalTaxable: 190000,
    totalGST: 53200,
    totalAmount: 243200,
    matchStatus: 'Match',
    invoiceStatus: 'Paid',
    exceptionIds: [],
    notes: 'Paid on due date.',
  },
  {
    id: 'INV-7832',
    po: 'PO-2024-004',
    grn: 'GRN-004',
    vendor: 'V001',
    date: '2024-06-30',
    dueDate: '2024-08-14',
    lineItems: [{ hsn: '87089900', description: 'Brake Assembly – Model Y', qty: 50, unit: 'PCS', rate: 1350, gstRate: 18, amount: 67500 }],
    totalTaxable: 67500,
    totalGST: 12150,
    totalAmount: 79650,
    matchStatus: 'Match',
    invoiceStatus: 'Approved',
    exceptionIds: [],
    notes: 'Perfect match.',
  },
];

// ── CREDIT NOTES ──────────────────────────────────────────────────────────────
export interface CreditNote {
  id: string;
  linkedInvoice: string;
  vendor: string;
  date: string;
  amount: number;
  reason: string;
  status: 'Applied' | 'Pending';
}

export const CREDIT_NOTES: CreditNote[] = [
  {
    id: 'CN-001',
    linkedInvoice: 'INV-7826',
    vendor: 'V002',
    date: '2024-06-25',
    amount: 76000,
    reason: 'Short GRN — 200 bags of Portland Cement not delivered (PO-2024-002)',
    status: 'Pending',
  },
  {
    id: 'CN-002',
    linkedInvoice: 'INV-7822',
    vendor: 'V001',
    date: '2024-06-20',
    amount: 24000,
    reason: 'Qty overbilling — 20 extra Brake Assembly units invoiced vs GRN',
    status: 'Applied',
  },
];

// ── LEDGER FILES ──────────────────────────────────────────────────────────────
export interface LedgerFile {
  id: string;
  period: string;
  vendor: string;
  uploadedAt: string;
  lineCount: number;
  reconciled: boolean;
  openAmount: number;
}

export const LEDGER_FILES: LedgerFile[] = [
  {
    id: 'LEDGER-Q1',
    period: 'Apr–Jun 2024 Q1',
    vendor: 'V001',
    uploadedAt: '2024-07-02',
    lineCount: 148,
    reconciled: true,
    openAmount: 0,
  },
  {
    id: 'LEDGER-Q2',
    period: 'Apr–Jun 2024 Q2',
    vendor: 'V002',
    uploadedAt: '2024-07-05',
    lineCount: 92,
    reconciled: false,
    openAmount: 246200,
  },
];

// ── EXCEPTIONS ────────────────────────────────────────────────────────────────
export type ExceptionType =
  | 'OCR uncertainty'
  | 'HSN/SAC mismatch'
  | 'GST mismatch'
  | 'Qty mismatch'
  | 'Price mismatch'
  | 'Freight not in PO'
  | 'Missing vendor code';

export type Reviewer = 'AP team' | 'Procurement' | 'Requester' | 'Vendor';

export interface APException {
  id: string;
  invoice: string;
  type: ExceptionType;
  issue: string;
  whyFlagged: string;
  suggestedAction: string;
  confidence: number; // 0–100 AI confidence
  reviewer: Reviewer;
  riskAmount?: number;
  createdAt: string;
  resolved: boolean;
}

export const EXCEPTIONS: APException[] = [
  {
    id: 'EXC-001',
    invoice: 'INV-7826',
    type: 'OCR uncertainty',
    issue: 'Invoice total unreadable — scan quality below threshold',
    whyFlagged: 'OCR confidence 41% on total amount field. Extracted ₹7,93,600 but digit "9" uncertain.',
    suggestedAction: 'Request vendor to re-send invoice as a searchable PDF or rescan at 300 DPI.',
    confidence: 41,
    reviewer: 'AP team',
    riskAmount: 793600,
    createdAt: '2024-06-24',
    resolved: false,
  },
  {
    id: 'EXC-002',
    invoice: 'INV-7823',
    type: 'HSN/SAC mismatch',
    issue: 'HSN 25231090 on invoice ≠ HSN 25231000 on PO',
    whyFlagged:
      'Vendor used 8-digit sub-classification (25231090 — Other Portland Cement) vs PO 6-digit (25231000 — Generic). GST rate remains 28% but ITC claim may be flagged during GSTR-2B reconciliation.',
    suggestedAction:
      'Accept if vendor confirms same material. Request revised invoice with correct HSN if mismatch is substantive.',
    confidence: 88,
    reviewer: 'Procurement',
    riskAmount: 0,
    createdAt: '2024-06-16',
    resolved: false,
  },
  {
    id: 'EXC-003',
    invoice: 'INV-7824',
    type: 'GST mismatch',
    issue: 'GST charged @ 28% vs applicable 18% for SAC 99836931',
    whyFlagged:
      'AI verified SAC 99836931 (IT/BPO services) is taxable at 18% under HSN master. Vendor applied 28% — overstated tax by ₹18,000. ITC will not match GSTR-2B, causing reconciliation failure.',
    suggestedAction: 'Block payment. Request a revised invoice @ 18% GST or obtain a credit note for ₹18,000.',
    confidence: 97,
    reviewer: 'AP team',
    riskAmount: 18000,
    createdAt: '2024-06-11',
    resolved: false,
  },
  {
    id: 'EXC-004',
    invoice: 'INV-7822',
    type: 'Qty mismatch',
    issue: '520 Brake Assembly units invoiced vs 500 units in PO and GRN',
    whyFlagged:
      '3-way match: PO qty = 500, GRN qty = 500, Invoice qty = 520. Overbilling of 20 units @ ₹1,200 = ₹24,000 (before GST).',
    suggestedAction:
      'Reject the excess qty. Request revised invoice for 500 units, or raise debit note CN-002 of ₹24,000 + 18% GST.',
    confidence: 99,
    reviewer: 'AP team',
    riskAmount: 24000,
    createdAt: '2024-06-13',
    resolved: false,
  },
  {
    id: 'EXC-005',
    invoice: 'INV-7825',
    type: 'Freight not in PO',
    issue: 'Freight charge ₹22,000 not present in PO-2024-002',
    whyFlagged:
      'PO-2024-002 was issued on "Ex-works" basis (no freight terms). Vendor added ₹22,000 freight line item in invoice. This is outside contract scope.',
    suggestedAction:
      'Hold for procurement approval. If freight is accepted, issue a supplementary PO amendment before payment.',
    confidence: 95,
    reviewer: 'Procurement',
    riskAmount: 22000,
    createdAt: '2024-06-17',
    resolved: false,
  },
  {
    id: 'EXC-006',
    invoice: 'INV-7825',
    type: 'Missing vendor code',
    issue: 'Freight line item has no SAC/HSN code and no vendor item mapping',
    whyFlagged:
      'Freight is classified as a service (SAC 996511 — Road transport) but vendor did not include SAC. Cannot post to correct GL. Vendor item code not in master data.',
    suggestedAction:
      'Send back to vendor to include SAC 996511 on freight line. Map to GL account 6-4020 (Freight inward).',
    confidence: 83,
    reviewer: 'AP team',
    riskAmount: 22000,
    createdAt: '2024-06-17',
    resolved: false,
  },
];

// ── DASHBOARD KPIs ────────────────────────────────────────────────────────────
export const AP_DASHBOARD = {
  totalInvoicesToday: 6,
  totalInvoicesProcessed: 1450,
  straightThrough: 2,
  straightThroughPercent: 95.6,
  invoicesPendingReview: 14,
  exceptionsPending: 5,
  highRiskAnomalies: 2,
  readyForSAP: 1,
  avgProcessingTimeHrs: 3.4,
  blockedMissingPO: 1,
  reconciliationBacklog: 3,
  totalPayableValue: 4842160,
  overdueAmount: 230400,
};

// ── CONTRACTS ────────────────────────────────────────────────────────────────
export interface ContractRecord {
  vendorId: string;
  contractId: string;
  effectiveDate: string;
  expiryDate: string;
  paymentTerms: string;
  creditLimit: number;
  gstRegistrations: { state: string; gstin: string }[];
  pocName: string;
  pocEmail: string;
  autoRenew: boolean;
  status: 'Active' | 'Expiring soon' | 'Expired';
}

export const CONTRACTS: ContractRecord[] = [
  {
    vendorId: 'V001',
    contractId: 'CT-2024-0041',
    effectiveDate: '2024-01-01',
    expiryDate: '2024-12-31',
    paymentTerms: 'Net 45 · 2/10 net 45',
    creditLimit: 5000000,
    gstRegistrations: [
      { state: 'Maharashtra', gstin: '27AAACT2727Q1Z5' },
      { state: 'Gujarat',     gstin: '24AAACT2727Q1Z8' },
    ],
    pocName: 'Rajesh Nair',
    pocEmail: 'ap@tataancillaries.in',
    autoRenew: true,
    status: 'Active',
  },
  {
    vendorId: 'V002',
    contractId: 'CT-2024-0089',
    effectiveDate: '2024-04-01',
    expiryDate: '2024-09-30',
    paymentTerms: 'Net 30 · No early payment discount',
    creditLimit: 2000000,
    gstRegistrations: [
      { state: 'Rajasthan', gstin: '08AAACS1429G1Z6' },
    ],
    pocName: 'Priya Sharma',
    pocEmail: 'finance@shreecements.com',
    autoRenew: false,
    status: 'Expiring soon',
  },
  {
    vendorId: 'V003',
    contractId: 'CT-2024-0212',
    effectiveDate: '2024-01-15',
    expiryDate: '2025-01-14',
    paymentTerms: 'Net 60 · Milestone-based',
    creditLimit: 3600000,
    gstRegistrations: [
      { state: 'Karnataka', gstin: '29AAACI1681G1ZM' },
    ],
    pocName: 'Anil Kumar',
    pocEmail: 'billing@infosysbpo.com',
    autoRenew: true,
    status: 'Active',
  },
];
