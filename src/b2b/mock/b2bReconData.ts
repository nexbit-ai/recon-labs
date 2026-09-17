// B2B Reconciliation Data Model for Brand: Kapiva
// Supports 20 Clients, Zoho ERP Sales Invoices, Lump-sum Payment Receipts (Bank UTRs),
// Credit Notes (CN), Debit Notes (DN), and FIFO Allocation Engine.

export interface B2BClient {
  id: string;
  name: string;
  code: string;
  entityType: 'Pharmacy Chain' | 'Retail Distributor' | 'Modern Trade' | 'Wholesale';
  city: string;
  state: string;
  gstin: string;
  zohoContactId: string;
  creditPeriodDays: number;
  totalOutstanding: number;
  totalInvoices: number;
}

export interface CreditDebitNote {
  id: string;
  type: 'Credit Note' | 'Debit Note';
  invoiceId: string;
  referenceNo: string;
  date: string;
  amount: number;
  reason: 'Damaged in Transit' | 'Expiry Stock Return' | 'Trade Discount / Rebate' | 'Rate Difference' | 'Short Supply';
  status: 'Approved' | 'Pending Approval' | 'Disputed';
  raisedBy: 'Kapiva (Zoho)' | 'Client (Deduction)';
}

export interface B2BInvoice {
  id: string; // e.g. "SI-25-KPV-1041"
  clientId: string;
  clientName: string;
  invoiceDate: string; // ISO date format YYYY-MM-DD for reliable sorting
  displayDate: string; // e.g. "10 Jan 2025"
  dueDate: string;
  grossAmount: number;
  tds: number;
  creditNotesTotal: number;
  debitNotesTotal: number;
  netPayable: number;
  // Computed via FIFO:
  settledAmount: number;
  balanceDue: number;
  fifoStatus: 'Fully Settled' | 'Partially Settled' | 'Unpaid';
  settlingUtrId?: string;
  settledDate?: string;
  fifoRank?: number;
  notes?: CreditDebitNote[];
}

export interface B2BPaymentReceipt {
  id: string; // UTR Number, e.g. "UTR-ICICI-20250315-7821"
  clientId: string;
  clientName: string;
  date: string; // YYYY-MM-DD
  displayDate: string;
  bankName: string;
  paymentMode: 'NEFT' | 'RTGS' | 'IMPS' | 'Cheque';
  totalLumpSum: number;
  allocatedAmount: number;
  unallocatedBalance: number;
  invoicesSettledCount: number;
  invoicesPartialCount: number;
  totalInvoicesImpacted: number;
  confidence: 'High' | 'Medium' | 'Low' | 'Unmapped';
  allocationLogic: 'FIFO (Oldest Invoices First)' | 'Exact Single Match' | 'Direct Reference';
  erpSource: 'Zoho Books' | 'Manual Bank Upload';
  zohoReceiptNo: string;
  narration: string;
  allocations: FIFOAllocationRecord[];
}

export interface FIFOAllocationRecord {
  fifoSequence: number;
  invoiceId: string;
  invoiceDisplayDate: string;
  grossInvoiceAmount: number;
  tds: number;
  adjustments: number; // CN / DN applied
  netPayable: number;
  allocatedFromThisPayment: number;
  priorPaymentsSettled: number;
  remainingBalance: number;
  status: 'Fully Settled' | 'Partially Settled' | 'Unpaid';
  notes: string;
}

// ── 20 B2B Clients for Kapiva ───────────────────────────────────────────────
export const KAPIVA_CLIENTS: B2BClient[] = [
  { id: 'cli-001', name: 'New Welcome Pharma', code: 'NWPL', entityType: 'Pharmacy Chain', city: 'Mumbai', state: 'Maharashtra', gstin: '27AABCN1234F1ZP', zohoContactId: 'ZC-90182', creditPeriodDays: 45, totalOutstanding: 2500000, totalInvoices: 10 },
  { id: 'cli-002', name: 'Apollo Pharmacy Ltd', code: 'APOL', entityType: 'Pharmacy Chain', city: 'Hyderabad', state: 'Telangana', gstin: '36AAACA2221E1Z0', zohoContactId: 'ZC-90183', creditPeriodDays: 60, totalOutstanding: 4250000, totalInvoices: 14 },
  { id: 'cli-003', name: 'Wellness Forever Medicare', code: 'WLFR', entityType: 'Retail Distributor', city: 'Mumbai', state: 'Maharashtra', gstin: '27AAACW8890K1Z5', zohoContactId: 'ZC-90184', creditPeriodDays: 45, totalOutstanding: 1820000, totalInvoices: 8 },
  { id: 'cli-004', name: 'MedPlus Health Services', code: 'MDPL', entityType: 'Pharmacy Chain', city: 'Hyderabad', state: 'Telangana', gstin: '36AAECM4455H1Z3', zohoContactId: 'ZC-90185', creditPeriodDays: 60, totalOutstanding: 3100000, totalInvoices: 11 },
  { id: 'cli-005', name: 'Reliance Retail (JioMart B2B)', code: 'RLNC', entityType: 'Modern Trade', city: 'Navi Mumbai', state: 'Maharashtra', gstin: '27AABCR6789P1ZZ', zohoContactId: 'ZC-90186', creditPeriodDays: 60, totalOutstanding: 5800000, totalInvoices: 16 },
  { id: 'cli-006', name: 'Frank Ross Pharmacy', code: 'FRRS', entityType: 'Pharmacy Chain', city: 'Kolkata', state: 'West Bengal', gstin: '19AAACF3412M1Z2', zohoContactId: 'ZC-90187', creditPeriodDays: 45, totalOutstanding: 1450000, totalInvoices: 6 },
  { id: 'cli-007', name: 'Noble Plus Healthcare', code: 'NBPL', entityType: 'Pharmacy Chain', city: 'Mumbai', state: 'Maharashtra', gstin: '27AAACN5566R1Z9', zohoContactId: 'ZC-90188', creditPeriodDays: 30, totalOutstanding: 890000, totalInvoices: 5 },
  { id: 'cli-008', name: 'Tata 1mg Retail Distribution', code: '1MG', entityType: 'Modern Trade', city: 'Gurugram', state: 'Haryana', gstin: '06AAACT9900L1ZX', zohoContactId: 'ZC-90189', creditPeriodDays: 45, totalOutstanding: 3600000, totalInvoices: 12 },
  { id: 'cli-009', name: 'Hetero Pharmacy Outlets', code: 'HTRO', entityType: 'Pharmacy Chain', city: 'Hyderabad', state: 'Telangana', gstin: '36AAACH7788C1Z4', zohoContactId: 'ZC-90190', creditPeriodDays: 45, totalOutstanding: 1200000, totalInvoices: 6 },
  { id: 'cli-010', name: 'Fortis Healthworld', code: 'FRTS', entityType: 'Pharmacy Chain', city: 'Delhi', state: 'Delhi', gstin: '07AAACF8811K1Z1', zohoContactId: 'ZC-90191', creditPeriodDays: 45, totalOutstanding: 950000, totalInvoices: 4 },
  { id: 'cli-011', name: 'Avenue Supermarts (DMart B2B)', code: 'DMRT', entityType: 'Modern Trade', city: 'Thane', state: 'Maharashtra', gstin: '27AABCA3344N1ZV', zohoContactId: 'ZC-90192', creditPeriodDays: 30, totalOutstanding: 4800000, totalInvoices: 15 },
  { id: 'cli-012', name: "Nature's Basket Fine Foods", code: 'NTBK', entityType: 'Modern Trade', city: 'Mumbai', state: 'Maharashtra', gstin: '27AAACN9922P1Z8', zohoContactId: 'ZC-90193', creditPeriodDays: 45, totalOutstanding: 780000, totalInvoices: 4 },
  { id: 'cli-013', name: 'Zepto Darkstores Supply', code: 'ZPTO', entityType: 'Modern Trade', city: 'Bengaluru', state: 'Karnataka', gstin: '29AAACZ1122D1ZG', zohoContactId: 'ZC-90194', creditPeriodDays: 30, totalOutstanding: 2850000, totalInvoices: 9 },
  { id: 'cli-014', name: 'Blinkit Commerce Pvt Ltd', code: 'BLNK', entityType: 'Modern Trade', city: 'Gurugram', state: 'Haryana', gstin: '06AAACB4433E1ZQ', zohoContactId: 'ZC-90195', creditPeriodDays: 30, totalOutstanding: 3400000, totalInvoices: 10 },
  { id: 'cli-015', name: 'Amazon Retail Wholesale', code: 'AMZN', entityType: 'Modern Trade', city: 'Bengaluru', state: 'Karnataka', gstin: '29AABCA0011K1ZM', zohoContactId: 'ZC-90196', creditPeriodDays: 60, totalOutstanding: 6200000, totalInvoices: 18 },
  { id: 'cli-016', name: 'Flipkart India Wholesale', code: 'FLPK', entityType: 'Modern Trade', city: 'Bengaluru', state: 'Karnataka', gstin: '29AAACF2233G1ZT', zohoContactId: 'ZC-90197', creditPeriodDays: 60, totalOutstanding: 5400000, totalInvoices: 17 },
  { id: 'cli-017', name: 'Guardian Pharmacy Chain', code: 'GRDN', entityType: 'Pharmacy Chain', city: 'Gurugram', state: 'Haryana', gstin: '06AAACG8899J1ZB', zohoContactId: 'ZC-90198', creditPeriodDays: 45, totalOutstanding: 1100000, totalInvoices: 5 },
  { id: 'cli-018', name: 'Netmeds Offline Distributors', code: 'NTMD', entityType: 'Retail Distributor', city: 'Chennai', state: 'Tamil Nadu', gstin: '33AAACN4455Q1ZY', zohoContactId: 'ZC-90199', creditPeriodDays: 45, totalOutstanding: 1650000, totalInvoices: 7 },
  { id: 'cli-019', name: 'Wellness Care Distributors', code: 'WLCD', entityType: 'Wholesale', city: 'Ahmedabad', state: 'Gujarat', gstin: '24AAACW1199F1ZU', zohoContactId: 'ZC-90200', creditPeriodDays: 30, totalOutstanding: 820000, totalInvoices: 4 },
  { id: 'cli-020', name: 'Metro Cash & Carry India', code: 'MTRC', entityType: 'Wholesale', city: 'Bengaluru', state: 'Karnataka', gstin: '29AABCM9988H1ZS', zohoContactId: 'ZC-90201', creditPeriodDays: 45, totalOutstanding: 2900000, totalInvoices: 9 },
];

// ── Credit and Debit Notes for New Welcome Pharma ──────────────────────────
export const MOCK_NOTES_NWPL: CreditDebitNote[] = [
  {
    id: 'CN-2025-014',
    type: 'Credit Note',
    invoiceId: 'SI25-KPV-1002',
    referenceNo: 'CN-ZO-9921',
    date: '20 Jan 2025',
    amount: 50000,
    reason: 'Trade Discount / Rebate',
    status: 'Approved',
    raisedBy: 'Kapiva (Zoho)',
  },
  {
    id: 'DN-2025-088',
    type: 'Debit Note',
    invoiceId: 'SI25-KPV-1004',
    referenceNo: 'NWPL-DN-4421',
    date: '06 Feb 2025',
    amount: 50000,
    reason: 'Damaged in Transit',
    status: 'Approved',
    raisedBy: 'Client (Deduction)',
  },
  {
    id: 'DN-2025-102',
    type: 'Debit Note',
    invoiceId: 'SI25-KPV-1007',
    referenceNo: 'NWPL-DN-4590',
    date: '10 Mar 2025',
    amount: 35000,
    reason: 'Short Supply',
    status: 'Pending Approval',
    raisedBy: 'Client (Deduction)',
  },
];

// ── 10 Invoices for New Welcome Pharma (Sorted chronologically by date) ─────
// Total Gross = ₹75,00,000. Total Adjustments = ₹1,00,000 approved, ₹35,000 pending.
// Lump sum payment: ₹50,00,000.
// FIFO settlement result:
// Inv 1: ₹8,00,000 -> 100% settled (Paid ₹8L)
// Inv 2: ₹12,00,000 - ₹50k CN = ₹11,50,000 -> 100% settled (Paid ₹11.5L)
// Inv 3: ₹6,50,000 -> 100% settled (Paid ₹6.5L)
// Inv 4: ₹9,00,000 - ₹50k DN = ₹8,50,000 -> 100% settled (Paid ₹8.5L)
// Inv 5: ₹7,50,000 -> 100% settled (Paid ₹7.5L)
// Inv 6: ₹5,00,000 -> 100% settled (Paid ₹5.0L)
//   Subtotal settled so far = 8 + 11.5 + 6.5 + 8.5 + 7.5 + 5 = ₹47,00,000.
// Inv 7: ₹8,00,000 -> Partially Settled (Remaining ₹3,00,000 allocated, ₹5,00,000 balance left).
// Inv 8: ₹10,00,000 -> Unpaid (₹0 allocated)
// Inv 9: ₹4,00,000 -> Unpaid (₹0 allocated)
// Inv 10: ₹5,00,000 -> Unpaid (₹0 allocated)
export const RAW_INVOICES_NWPL: Omit<B2BInvoice, 'settledAmount' | 'balanceDue' | 'fifoStatus' | 'settlingUtrId' | 'fifoRank' | 'tds'>[] = [
  {
    id: 'SI25-KPV-1001',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    invoiceDate: '2025-01-10',
    displayDate: '10 Jan 2025',
    dueDate: '24 Feb 2025',
    grossAmount: 800000,
    creditNotesTotal: 0,
    debitNotesTotal: 0,
    netPayable: 800000,
    notes: [],
  },
  {
    id: 'SI25-KPV-1002',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    invoiceDate: '2025-01-18',
    displayDate: '18 Jan 2025',
    dueDate: '04 Mar 2025',
    grossAmount: 1200000,
    creditNotesTotal: 50000,
    debitNotesTotal: 0,
    netPayable: 1150000,
    notes: [MOCK_NOTES_NWPL[0]],
  },
  {
    id: 'SI25-KPV-1003',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    invoiceDate: '2025-01-25',
    displayDate: '25 Jan 2025',
    dueDate: '11 Mar 2025',
    grossAmount: 650000,
    creditNotesTotal: 0,
    debitNotesTotal: 0,
    netPayable: 650000,
    notes: [],
  },
  {
    id: 'SI25-KPV-1004',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    invoiceDate: '2025-02-02',
    displayDate: '02 Feb 2025',
    dueDate: '19 Mar 2025',
    grossAmount: 900000,
    creditNotesTotal: 0,
    debitNotesTotal: 50000,
    netPayable: 850000,
    notes: [MOCK_NOTES_NWPL[1]],
  },
  {
    id: 'SI25-KPV-1005',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    invoiceDate: '2025-02-15',
    displayDate: '15 Feb 2025',
    dueDate: '01 Apr 2025',
    grossAmount: 750000,
    creditNotesTotal: 0,
    debitNotesTotal: 0,
    netPayable: 750000,
    notes: [],
  },
  {
    id: 'SI25-KPV-1006',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    invoiceDate: '2025-02-28',
    displayDate: '28 Feb 2025',
    dueDate: '14 Apr 2025',
    grossAmount: 500000,
    creditNotesTotal: 0,
    debitNotesTotal: 0,
    netPayable: 500000,
    notes: [],
  },
  {
    id: 'SI25-KPV-1007',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    invoiceDate: '2025-03-05',
    displayDate: '05 Mar 2025',
    dueDate: '19 Apr 2025',
    grossAmount: 800000,
    creditNotesTotal: 0,
    debitNotesTotal: 35000,
    netPayable: 800000, // Pending approval doesn't reduce payable until accepted
    notes: [MOCK_NOTES_NWPL[2]],
  },
  {
    id: 'SI25-KPV-1008',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    invoiceDate: '2025-03-12',
    displayDate: '12 Mar 2025',
    dueDate: '26 Apr 2025',
    grossAmount: 1000000,
    creditNotesTotal: 0,
    debitNotesTotal: 0,
    netPayable: 1000000,
    notes: [],
  },
  {
    id: 'SI25-KPV-1009',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    invoiceDate: '2025-03-20',
    displayDate: '20 Mar 2025',
    dueDate: '04 May 2025',
    grossAmount: 400000,
    creditNotesTotal: 0,
    debitNotesTotal: 0,
    netPayable: 400000,
    notes: [],
  },
  {
    id: 'SI25-KPV-1010',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    invoiceDate: '2025-03-25',
    displayDate: '25 Mar 2025',
    dueDate: '09 May 2025',
    grossAmount: 500000,
    creditNotesTotal: 0,
    debitNotesTotal: 0,
    netPayable: 500000,
    notes: [],
  },
];

// ── Realistic FIFO Allocation Calculation Function ──────────────────────────
export function runFIFOAllocation(
  rawInvoices: Omit<B2BInvoice, 'settledAmount' | 'balanceDue' | 'fifoStatus' | 'settlingUtrId' | 'fifoRank' | 'tds'>[],
  lumpSumAmount: number,
  utrId: string
): {
  reconciledInvoices: B2BInvoice[];
  allocationTrail: FIFOAllocationRecord[];
  totalAllocated: number;
  unallocatedSurplus: number;
  settledCount: number;
  partialCount: number;
  unpaidCount: number;
} {
  const invoices: B2BInvoice[] = rawInvoices.map(inv => {
    const tds = inv.grossAmount * 0.1;
    const netPayable = inv.grossAmount - tds - inv.creditNotesTotal - inv.debitNotesTotal;
    return { ...inv, tds, netPayable } as B2BInvoice;
  });

  // 1. Sort invoices strictly chronologically (Oldest first)
  const sorted = [...invoices].sort((a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime());

  let moneyLeft = lumpSumAmount;
  let settledCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;

  const allocationTrail: FIFOAllocationRecord[] = [];
  const reconciledInvoices: B2BInvoice[] = [];

  sorted.forEach((inv, index) => {
    const payable = inv.netPayable;
    let allocated = 0;
    let status: 'Fully Settled' | 'Partially Settled' | 'Unpaid' = 'Unpaid';
    let balance = payable;

    if (moneyLeft >= payable) {
      // Full settlement of this invoice
      allocated = payable;
      moneyLeft -= payable;
      balance = 0;
      status = 'Fully Settled';
      settledCount++;
    } else if (moneyLeft > 0) {
      // Partial settlement
      allocated = moneyLeft;
      balance = payable - moneyLeft;
      moneyLeft = 0;
      status = 'Partially Settled';
      partialCount++;
    } else {
      // No funds left
      allocated = 0;
      balance = payable;
      status = 'Unpaid';
      unpaidCount++;
    }

    const netAdjustments = (inv.creditNotesTotal || 0) + (inv.debitNotesTotal || 0);

    allocationTrail.push({
      fifoSequence: index + 1,
      invoiceId: inv.id,
      invoiceDisplayDate: inv.displayDate,
      grossInvoiceAmount: inv.grossAmount,
      tds: inv.tds,
      adjustments: netAdjustments,
      netPayable: payable,
      allocatedFromThisPayment: allocated,
      priorPaymentsSettled: 0,
      remainingBalance: balance,
      status,
      notes: status === 'Fully Settled'
        ? `100% Settled via FIFO (#${index + 1})`
        : status === 'Partially Settled'
          ? `Partially paid (₹${(allocated / 100000).toFixed(1)}L of ₹${(payable / 100000).toFixed(1)}L)`
          : `Awaiting future remittance`,
    });

    reconciledInvoices.push({
      ...inv,
      settledAmount: allocated,
      balanceDue: balance,
      fifoStatus: status,
      settlingUtrId: allocated > 0 ? utrId : undefined,
      fifoRank: index + 1,
    });
  });

  return {
    reconciledInvoices,
    allocationTrail,
    totalAllocated: lumpSumAmount - moneyLeft,
    unallocatedSurplus: moneyLeft,
    settledCount,
    partialCount,
    unpaidCount,
  };
}

// ── Precompute New Welcome Pharma FIFO Waterfall ─────────────────────────────
export const NWPL_FIFO_RESULT = runFIFOAllocation(
  RAW_INVOICES_NWPL,
  5000000, // ₹50,00,000 lump sum
  'UTR-ICICI-20250315-7821'
);

// ── Invoices for Apollo Pharmacy (Sample 8 Invoices) ──────────────────────────
export const RAW_INVOICES_APOLLO: Omit<B2BInvoice, 'settledAmount' | 'balanceDue' | 'fifoStatus' | 'settlingUtrId' | 'fifoRank' | 'tds'>[] = [
  { id: 'SI25-KPV-2001', clientId: 'cli-002', clientName: 'Apollo Pharmacy Ltd', invoiceDate: '2025-01-05', displayDate: '05 Jan 2025', dueDate: '06 Mar 2025', grossAmount: 500000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 500000, notes: [] },
  { id: 'SI25-KPV-2002', clientId: 'cli-002', clientName: 'Apollo Pharmacy Ltd', invoiceDate: '2025-01-15', displayDate: '15 Jan 2025', dueDate: '16 Mar 2025', grossAmount: 650000, creditNotesTotal: 25000, debitNotesTotal: 0, netPayable: 625000, notes: [{ id: 'CN-2025-A1', type: 'Credit Note', invoiceId: 'SI25-KPV-2002', referenceNo: 'AP-CN-01', date: '01 Feb 2025', amount: 25000, reason: 'Trade Discount / Rebate', status: 'Approved', raisedBy: 'Kapiva (Zoho)' }] },
  { id: 'SI25-KPV-2003', clientId: 'cli-002', clientName: 'Apollo Pharmacy Ltd', invoiceDate: '2025-02-01', displayDate: '01 Feb 2025', dueDate: '02 Apr 2025', grossAmount: 850000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 850000, notes: [] },
  { id: 'SI25-KPV-2004', clientId: 'cli-002', clientName: 'Apollo Pharmacy Ltd', invoiceDate: '2025-02-14', displayDate: '14 Feb 2025', dueDate: '15 Apr 2025', grossAmount: 700000, creditNotesTotal: 0, debitNotesTotal: 30000, netPayable: 670000, notes: [{ id: 'DN-2025-A2', type: 'Debit Note', invoiceId: 'SI25-KPV-2004', referenceNo: 'AP-DN-02', date: '01 Mar 2025', amount: 30000, reason: 'Damaged in Transit', status: 'Approved', raisedBy: 'Client (Deduction)' }] },
  { id: 'SI25-KPV-2005', clientId: 'cli-002', clientName: 'Apollo Pharmacy Ltd', invoiceDate: '2025-03-01', displayDate: '01 Mar 2025', dueDate: '30 Apr 2025', grossAmount: 900000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 900000, notes: [] },
  { id: 'SI25-KPV-2006', clientId: 'cli-002', clientName: 'Apollo Pharmacy Ltd', invoiceDate: '2025-03-10', displayDate: '10 Mar 2025', dueDate: '09 May 2025', grossAmount: 800000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 800000, notes: [] },
  { id: 'SI25-KPV-2007', clientId: 'cli-002', clientName: 'Apollo Pharmacy Ltd', invoiceDate: '2025-03-18', displayDate: '18 Mar 2025', dueDate: '17 May 2025', grossAmount: 600000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 600000, notes: [] },
  { id: 'SI25-KPV-2008', clientId: 'cli-002', clientName: 'Apollo Pharmacy Ltd', invoiceDate: '2025-03-24', displayDate: '24 Mar 2025', dueDate: '23 May 2025', grossAmount: 450000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 450000, notes: [] },
];

export const APOLLO_FIFO_RESULT = runFIFOAllocation(
  RAW_INVOICES_APOLLO,
  2500000, // ₹25,00,000 lump sum
  'UTR-HDFC-20250320-1194'
);

// ── Invoices for Wellness Forever (Sample 6 Invoices) ─────────────────────────
export const RAW_INVOICES_WELLNESS: Omit<B2BInvoice, 'settledAmount' | 'balanceDue' | 'fifoStatus' | 'settlingUtrId' | 'fifoRank' | 'tds'>[] = [
  { id: 'SI25-KPV-3001', clientId: 'cli-003', clientName: 'Wellness Forever Medicare', invoiceDate: '2025-01-12', displayDate: '12 Jan 2025', dueDate: '26 Feb 2025', grossAmount: 420000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 420000, notes: [] },
  { id: 'SI25-KPV-3002', clientId: 'cli-003', clientName: 'Wellness Forever Medicare', invoiceDate: '2025-01-28', displayDate: '28 Jan 2025', dueDate: '14 Mar 2025', grossAmount: 580000, creditNotesTotal: 18000, debitNotesTotal: 0, netPayable: 562000, notes: [{ id: 'CN-2025-W1', type: 'Credit Note', invoiceId: 'SI25-KPV-3002', referenceNo: 'WF-CN-01', date: '15 Feb 2025', amount: 18000, reason: 'Rate Difference', status: 'Approved', raisedBy: 'Kapiva (Zoho)' }] },
  { id: 'SI25-KPV-3003', clientId: 'cli-003', clientName: 'Wellness Forever Medicare', invoiceDate: '2025-02-10', displayDate: '10 Feb 2025', dueDate: '27 Mar 2025', grossAmount: 390000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 390000, notes: [] },
  { id: 'SI25-KPV-3004', clientId: 'cli-003', clientName: 'Wellness Forever Medicare', invoiceDate: '2025-02-22', displayDate: '22 Feb 2025', dueDate: '08 Apr 2025', grossAmount: 640000, creditNotesTotal: 0, debitNotesTotal: 22000, netPayable: 618000, notes: [{ id: 'DN-2025-W2', type: 'Debit Note', invoiceId: 'SI25-KPV-3004', referenceNo: 'WF-DN-02', date: '10 Mar 2025', amount: 22000, reason: 'Short Supply', status: 'Approved', raisedBy: 'Client (Deduction)' }] },
  { id: 'SI25-KPV-3005', clientId: 'cli-003', clientName: 'Wellness Forever Medicare', invoiceDate: '2025-03-08', displayDate: '08 Mar 2025', dueDate: '22 Apr 2025', grossAmount: 710000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 710000, notes: [] },
  { id: 'SI25-KPV-3006', clientId: 'cli-003', clientName: 'Wellness Forever Medicare', invoiceDate: '2025-03-19', displayDate: '19 Mar 2025', dueDate: '03 May 2025', grossAmount: 450000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 450000, notes: [] },
];

export const WELLNESS_FIFO_RESULT = runFIFOAllocation(
  RAW_INVOICES_WELLNESS,
  1200000, // ₹12,00,000 lump sum
  'UTR-AXIS-20250322-9012'
);

// ── Invoices for MedPlus Health Services (Sample 5 Invoices) ──────────────────
export const RAW_INVOICES_MEDPLUS: Omit<B2BInvoice, 'settledAmount' | 'balanceDue' | 'fifoStatus' | 'settlingUtrId' | 'fifoRank' | 'tds'>[] = [
  { id: 'SI25-KPV-4001', clientId: 'cli-004', clientName: 'MedPlus Health Services', invoiceDate: '2024-12-10', displayDate: '10 Dec 2024', dueDate: '08 Feb 2025', grossAmount: 950000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 950000, notes: [] },
  { id: 'SI25-KPV-4002', clientId: 'cli-004', clientName: 'MedPlus Health Services', invoiceDate: '2024-12-25', displayDate: '25 Dec 2024', dueDate: '23 Feb 2025', grossAmount: 820000, creditNotesTotal: 0, debitNotesTotal: 15000, netPayable: 805000, notes: [{ id: 'DN-2024-M1', type: 'Debit Note', invoiceId: 'SI25-KPV-4002', referenceNo: 'MP-DN-01', date: '15 Jan 2025', amount: 15000, reason: 'Expiry Stock Return', status: 'Approved', raisedBy: 'Client (Deduction)' }] },
  { id: 'SI25-KPV-4003', clientId: 'cli-004', clientName: 'MedPlus Health Services', invoiceDate: '2025-01-15', displayDate: '15 Jan 2025', dueDate: '16 Mar 2025', grossAmount: 760000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 760000, notes: [] },
  { id: 'SI25-KPV-4004', clientId: 'cli-004', clientName: 'MedPlus Health Services', invoiceDate: '2025-02-05', displayDate: '05 Feb 2025', dueDate: '06 Apr 2025', grossAmount: 890000, creditNotesTotal: 12000, debitNotesTotal: 0, netPayable: 878000, notes: [{ id: 'CN-2025-M2', type: 'Credit Note', invoiceId: 'SI25-KPV-4004', referenceNo: 'MP-CN-02', date: '25 Feb 2025', amount: 12000, reason: 'Trade Discount / Rebate', status: 'Approved', raisedBy: 'Kapiva (Zoho)' }] },
  { id: 'SI25-KPV-4005', clientId: 'cli-004', clientName: 'MedPlus Health Services', invoiceDate: '2025-02-28', displayDate: '28 Feb 2025', dueDate: '29 Apr 2025', grossAmount: 510000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 510000, notes: [] },
];

export const MEDPLUS_FIFO_RESULT = runFIFOAllocation(
  RAW_INVOICES_MEDPLUS,
  2000000, // ₹20,00,000 lump sum
  'UTR-SBIN-20250325-4567'
);

// ── Invoices for Reliance Retail (Sample 5 Invoices) ──────────────────────────
export const RAW_INVOICES_RELIANCE: Omit<B2BInvoice, 'settledAmount' | 'balanceDue' | 'fifoStatus' | 'settlingUtrId' | 'fifoRank' | 'tds'>[] = [
  { id: 'SI25-KPV-5001', clientId: 'cli-005', clientName: 'Reliance Retail', invoiceDate: '2025-01-08', displayDate: '08 Jan 2025', dueDate: '09 Mar 2025', grossAmount: 1250000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 1250000, notes: [] },
  { id: 'SI25-KPV-5002', clientId: 'cli-005', clientName: 'Reliance Retail', invoiceDate: '2025-01-20', displayDate: '20 Jan 2025', dueDate: '21 Mar 2025', grossAmount: 1400000, creditNotesTotal: 50000, debitNotesTotal: 0, netPayable: 1350000, notes: [{ id: 'CN-2025-R1', type: 'Credit Note', invoiceId: 'SI25-KPV-5002', referenceNo: 'RR-CN-01', date: '10 Feb 2025', amount: 50000, reason: 'Rate Difference', status: 'Approved', raisedBy: 'Kapiva (Zoho)' }] },
  { id: 'SI25-KPV-5003', clientId: 'cli-005', clientName: 'Reliance Retail', invoiceDate: '2025-02-12', displayDate: '12 Feb 2025', dueDate: '13 Apr 2025', grossAmount: 1100000, creditNotesTotal: 0, debitNotesTotal: 25000, netPayable: 1075000, notes: [{ id: 'DN-2025-R2', type: 'Debit Note', invoiceId: 'SI25-KPV-5003', referenceNo: 'RR-DN-02', date: '28 Feb 2025', amount: 25000, reason: 'Short Supply', status: 'Approved', raisedBy: 'Client (Deduction)' }] },
  { id: 'SI25-KPV-5004', clientId: 'cli-005', clientName: 'Reliance Retail', invoiceDate: '2025-03-02', displayDate: '02 Mar 2025', dueDate: '01 May 2025', grossAmount: 950000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 950000, notes: [] },
  { id: 'SI25-KPV-5005', clientId: 'cli-005', clientName: 'Reliance Retail', invoiceDate: '2025-03-18', displayDate: '18 Mar 2025', dueDate: '17 May 2025', grossAmount: 1600000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 1600000, notes: [] },
];

export const RELIANCE_FIFO_RESULT = runFIFOAllocation(
  RAW_INVOICES_RELIANCE,
  3500000, // ₹35,00,000 lump sum
  'UTR-KKBK-20250328-8901'
);

// ── Dynamic Invoices for Aging Filters (Sample 8 Invoices) ──────────────────
const now = Date.now();
const date35 = new Date(now - 35 * 86400000).toISOString().split('T')[0]; // Pending 30 Days bucket
const date50 = new Date(now - 50 * 86400000).toISOString().split('T')[0]; // Pending 45 Days bucket
const date70 = new Date(now - 70 * 86400000).toISOString().split('T')[0]; // Pending 60 Days bucket
const date100 = new Date(now - 100 * 86400000).toISOString().split('T')[0]; // Pending 90 Days bucket

export const RAW_INVOICES_AGING: Omit<B2BInvoice, 'settledAmount' | 'balanceDue' | 'fifoStatus' | 'settlingUtrId' | 'fifoRank' | 'tds'>[] = [
  { id: 'SI25-KPV-6001', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date35, displayDate: new Date(date35).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 5 * 86400000).toISOString().split('T')[0], grossAmount: 420000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 420000, notes: [] },
  { id: 'SI25-KPV-6002', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date35, displayDate: new Date(date35).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 5 * 86400000).toISOString().split('T')[0], grossAmount: 510000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 510000, notes: [] },
  { id: 'SI25-KPV-6011', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date35, displayDate: new Date(date35).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 3 * 86400000).toISOString().split('T')[0], grossAmount: 180000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 180000, notes: [] },
  { id: 'SI25-KPV-6012', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date35, displayDate: new Date(date35).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 2 * 86400000).toISOString().split('T')[0], grossAmount: 250000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 250000, notes: [] },
  { id: 'SI25-KPV-6013', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date35, displayDate: new Date(date35).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 1 * 86400000).toISOString().split('T')[0], grossAmount: 340000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 340000, notes: [] },
  { id: 'SI25-KPV-6003', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date50, displayDate: new Date(date50).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 20 * 86400000).toISOString().split('T')[0], grossAmount: 640000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 640000, notes: [] },
  { id: 'SI25-KPV-6004', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date50, displayDate: new Date(date50).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 20 * 86400000).toISOString().split('T')[0], grossAmount: 720000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 720000, notes: [] },
  { id: 'SI25-KPV-6005', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date70, displayDate: new Date(date70).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 40 * 86400000).toISOString().split('T')[0], grossAmount: 850000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 850000, notes: [] },
  { id: 'SI25-KPV-6006', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date70, displayDate: new Date(date70).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 40 * 86400000).toISOString().split('T')[0], grossAmount: 390000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 390000, notes: [] },
  { id: 'SI25-KPV-6007', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date100, displayDate: new Date(date100).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 70 * 86400000).toISOString().split('T')[0], grossAmount: 1150000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 1150000, notes: [] },
  { id: 'SI25-KPV-6008', clientId: 'cli-006', clientName: 'Frank Ross Pharmacy', invoiceDate: date100, displayDate: new Date(date100).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), dueDate: new Date(now - 70 * 86400000).toISOString().split('T')[0], grossAmount: 930000, creditNotesTotal: 0, debitNotesTotal: 0, netPayable: 930000, notes: [] },
];

export const AGING_FIFO_RESULT = runFIFOAllocation(
  RAW_INVOICES_AGING,
  0, // ₹0 lump sum to keep them all unpaid
  'NONE'
);

// ── All Consolidated Invoices ───────────────────────────────────────────────
export const ALL_KAPIVA_INVOICES: B2BInvoice[] = [
  ...NWPL_FIFO_RESULT.reconciledInvoices,
  ...APOLLO_FIFO_RESULT.reconciledInvoices,
  ...WELLNESS_FIFO_RESULT.reconciledInvoices,
  ...MEDPLUS_FIFO_RESULT.reconciledInvoices,
  ...RELIANCE_FIFO_RESULT.reconciledInvoices,
  ...AGING_FIFO_RESULT.reconciledInvoices,
];

// ── Lump Sum Payment Receipts (Fetched from Zoho Books & Bank statements) ────
export const MOCK_PAYMENT_RECEIPTS: B2BPaymentReceipt[] = [
  {
    id: 'UTR-ICICI-20250315-7821',
    clientId: 'cli-001',
    clientName: 'New Welcome Pharma',
    date: '2025-03-15',
    displayDate: '15 Mar 2025',
    bankName: 'ICICI Bank (A/c ...4819)',
    paymentMode: 'NEFT',
    totalLumpSum: 5000000, // ₹50.00 Lakh
    allocatedAmount: 5000000,
    unallocatedBalance: 0,
    invoicesSettledCount: NWPL_FIFO_RESULT.settledCount, // 6
    invoicesPartialCount: NWPL_FIFO_RESULT.partialCount, // 1
    totalInvoicesImpacted: NWPL_FIFO_RESULT.settledCount + NWPL_FIFO_RESULT.partialCount, // 7
    confidence: 'High',
    allocationLogic: 'FIFO (Oldest Invoices First)',
    erpSource: 'Zoho Books',
    zohoReceiptNo: 'RCP-2025-09142',
    narration: 'Lump-sum NEFT settlement for Q4 pending invoices — 6 fully cleared, 1 partial',
    allocations: NWPL_FIFO_RESULT.allocationTrail,
  },
  {
    id: 'UTR-HDFC-20250320-1194',
    clientId: 'cli-002',
    clientName: 'Apollo Pharmacy Ltd',
    date: '2025-03-20',
    displayDate: '20 Mar 2025',
    bankName: 'HDFC Bank (A/c ...1092)',
    paymentMode: 'RTGS',
    totalLumpSum: 2500000, // ₹25.00 Lakh
    allocatedAmount: 2500000,
    unallocatedBalance: 0,
    invoicesSettledCount: APOLLO_FIFO_RESULT.settledCount, // 3
    invoicesPartialCount: APOLLO_FIFO_RESULT.partialCount, // 1
    totalInvoicesImpacted: APOLLO_FIFO_RESULT.settledCount + APOLLO_FIFO_RESULT.partialCount,
    confidence: 'High',
    allocationLogic: 'FIFO (Oldest Invoices First)',
    erpSource: 'Zoho Books',
    zohoReceiptNo: 'RCP-2025-09201',
    narration: 'Fortnightly consolidated remittance allocated across oldest open bills',
    allocations: APOLLO_FIFO_RESULT.allocationTrail,
  },
  {
    id: 'UTR-AXIS-20250322-9012',
    clientId: 'cli-003',
    clientName: 'Wellness Forever Medicare',
    date: '2025-03-22',
    displayDate: '22 Mar 2025',
    bankName: 'Axis Bank (A/c ...8821)',
    paymentMode: 'NEFT',
    totalLumpSum: 1200000, // ₹12.00 Lakh
    allocatedAmount: 1200000,
    unallocatedBalance: 0,
    invoicesSettledCount: WELLNESS_FIFO_RESULT.settledCount, // 2
    invoicesPartialCount: WELLNESS_FIFO_RESULT.partialCount, // 1
    totalInvoicesImpacted: WELLNESS_FIFO_RESULT.settledCount + WELLNESS_FIFO_RESULT.partialCount,
    confidence: 'High',
    allocationLogic: 'FIFO (Oldest Invoices First)',
    erpSource: 'Zoho Books',
    zohoReceiptNo: 'RCP-2025-09255',
    narration: 'Monthly clearing payment against Jan-Feb supplies',
    allocations: WELLNESS_FIFO_RESULT.allocationTrail,
  },
  {
    id: 'UTR-SBI-20250326-4401',
    clientId: 'cli-005',
    clientName: 'Reliance Retail (JioMart B2B)',
    date: '2025-03-26',
    displayDate: '26 Mar 2025',
    bankName: 'SBI Commercial (A/c ...6120)',
    paymentMode: 'RTGS',
    totalLumpSum: 3800000, // ₹38.00 Lakh
    allocatedAmount: 3800000,
    unallocatedBalance: 0,
    invoicesSettledCount: 4,
    invoicesPartialCount: 1,
    totalInvoicesImpacted: 5,
    confidence: 'High',
    allocationLogic: 'FIFO (Oldest Invoices First)',
    erpSource: 'Zoho Books',
    zohoReceiptNo: 'RCP-2025-09310',
    narration: 'Corporate payment cycle March batch remittance',
    allocations: [],
  },
  {
    id: 'UTR-KOTAK-20250328-5529',
    clientId: 'cli-013',
    clientName: 'Zepto Darkstores Supply',
    date: '2025-03-28',
    displayDate: '28 Mar 2025',
    bankName: 'Kotak Mahindra Bank (A/c ...3309)',
    paymentMode: 'IMPS',
    totalLumpSum: 1850000, // ₹18.50 Lakh
    allocatedAmount: 1850000,
    unallocatedBalance: 0,
    invoicesSettledCount: 3,
    invoicesPartialCount: 0,
    totalInvoicesImpacted: 3,
    confidence: 'High',
    allocationLogic: 'FIFO (Oldest Invoices First)',
    erpSource: 'Zoho Books',
    zohoReceiptNo: 'RCP-2025-09419',
    narration: 'Weekly settlement round cleared against oldest delivery challans',
    allocations: [],
  },
  {
    id: 'UTR-ICICI-20250330-0012',
    clientId: 'cli-004',
    clientName: 'MedPlus Health Services',
    date: '2025-03-30',
    displayDate: '30 Mar 2025',
    bankName: 'ICICI Bank (A/c ...4819)',
    paymentMode: 'NEFT',
    totalLumpSum: 2100000, // ₹21.00 Lakh
    allocatedAmount: 2100000,
    unallocatedBalance: 0,
    invoicesSettledCount: 3,
    invoicesPartialCount: 1,
    totalInvoicesImpacted: 4,
    confidence: 'High',
    allocationLogic: 'FIFO (Oldest Invoices First)',
    erpSource: 'Zoho Books',
    zohoReceiptNo: 'RCP-2025-09488',
    narration: 'Consolidated settlement batch for Southern cluster stores',
    allocations: [],
  },
  {
    id: 'UTR-UNMAPPED-20250401-99',
    clientId: '',
    clientName: 'Unknown Counterparty / Advance',
    date: '2025-04-01',
    displayDate: '01 Apr 2025',
    bankName: 'ICICI Bank (A/c ...4819)',
    paymentMode: 'NEFT',
    totalLumpSum: 350000,
    allocatedAmount: 0,
    unallocatedBalance: 350000,
    invoicesSettledCount: 0,
    invoicesPartialCount: 0,
    totalInvoicesImpacted: 0,
    confidence: 'Unmapped',
    allocationLogic: 'FIFO (Oldest Invoices First)',
    erpSource: 'Zoho Books',
    zohoReceiptNo: 'RCP-2025-09512',
    narration: 'Direct NEFT inward without client code in remarks. Pending client mapping.',
    allocations: [],
  },
];
