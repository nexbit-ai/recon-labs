// B2B Exceptions mock — mirrors the Anx-1 to Anx-4 sheets from the
// Kapiva ↔ New Welcome ledger recon working file. All amounts in whole rupees.
// Entity mapping: "Kapiva" (Adret) is OUR side; "New Welcome" is counterparty.

export type ExceptionDocType = 'Invoice' | 'Credit Note' | 'Debit Note' | 'Payment' | 'TDS' | 'Other';
export type ExceptionSide = 'In Kapiva, not in New Welcome' | 'In New Welcome, not in Kapiva';
export type ExceptionStatus = 'OPEN' | 'RESOLVED' | 'DISPUTE_RAISED' | 'FOLLOW_UP';
export type ReconMatchStatus =
  | 'MATCHED'
  | 'AMOUNT_DIFF'
  | 'NOT_IN_COUNTERPARTY'
  | 'NOT_IN_OUR_BOOKS'
  | 'TDS'
  | 'PENDING';

export interface ExceptionItem {
  id: string;
  docType: ExceptionDocType;
  side: ExceptionSide;
  date: string;
  reference: string;
  narration: string;
  amount: number; // signed — negative for credits
  status: ExceptionStatus;
  remark?: string;
}

// ── Anx-1: Invoice gaps ───────────────────────────────────────────────────────
export const invoiceExceptions: ExceptionItem[] = [
  // Left panel: in Kapiva (Adret), not in New Welcome
  {
    id: 'EX-INV-001',
    docType: 'Invoice',
    side: 'In Kapiva, not in New Welcome',
    date: '03 Jul 2025',
    reference: 'SI25-MUM7-2134',
    narration: 'Sales invoice to New Welcome',
    amount: 149268,
    status: 'OPEN',
  },
  {
    id: 'EX-INV-002',
    docType: 'Invoice',
    side: 'In Kapiva, not in New Welcome',
    date: '03 Jul 2025',
    reference: 'SI25-MUM7-2135',
    narration: 'Sales invoice to New Welcome',
    amount: 33231,
    status: 'OPEN',
  },
  // Right panel: in New Welcome, not in Kapiva (cash purchases, no PO)
  {
    id: 'EX-INV-003',
    docType: 'Invoice',
    side: 'In New Welcome, not in Kapiva',
    date: '06 Aug 2025',
    reference: 'INVOICE NO. XZX2-10850',
    narration: 'Cash purchase — Anuj Dharamnath Pandey',
    amount: -548,
    status: 'OPEN',
  },
  {
    id: 'EX-INV-004',
    docType: 'Invoice',
    side: 'In New Welcome, not in Kapiva',
    date: '23 Aug 2025',
    reference: 'INVOICE NO. BOM5-209',
    narration: 'Cash purchase — Anuj Dharamnath Pandey',
    amount: -436,
    status: 'OPEN',
  },
  {
    id: 'EX-INV-005',
    docType: 'Invoice',
    side: 'In New Welcome, not in Kapiva',
    date: '01 Sep 2025',
    reference: 'INVOICE NO. XZX2-13166',
    narration: 'Cash purchase — Anuj Dharamnath Pandey',
    amount: -548,
    status: 'OPEN',
  },
  {
    id: 'EX-INV-006',
    docType: 'Invoice',
    side: 'In New Welcome, not in Kapiva',
    date: '03 Sep 2025',
    reference: 'INVOICE NO. XZX2-13322',
    narration: 'Cash purchase — Anuj Dharamnath Pandey',
    amount: -548,
    status: 'OPEN',
  },
  {
    id: 'EX-INV-007',
    docType: 'Invoice',
    side: 'In New Welcome, not in Kapiva',
    date: '13 Nov 2025',
    reference: 'INVOICE NO. XZX2-25104',
    narration: 'Cash purchase — Anuj Dharamnath Pandey',
    amount: -655,
    status: 'OPEN',
  },
  {
    id: 'EX-INV-008',
    docType: 'Invoice',
    side: 'In New Welcome, not in Kapiva',
    date: '23 Feb 2026',
    reference: 'INVOICE NO. XZX2-42014',
    narration: 'Cash purchase — Anuj Dharamnath Pandey',
    amount: -521,
    status: 'OPEN',
  },
];

// ── Anx-2: Credit / Debit note gaps ──────────────────────────────────────────
export const cnDnExceptions: ExceptionItem[] = [
  // Left: credit notes raised by Kapiva, not acknowledged by New Welcome
  {
    id: 'EX-CN-001',
    docType: 'Credit Note',
    side: 'In Kapiva, not in New Welcome',
    date: '13 Aug 2025',
    reference: 'FY25-CN-066',
    narration: 'Credit note — return',
    amount: -162,
    status: 'OPEN',
  },
  {
    id: 'EX-CN-002',
    docType: 'Credit Note',
    side: 'In Kapiva, not in New Welcome',
    date: '19 Sep 2025',
    reference: 'SRI25-MUM7-0344',
    narration: 'Credit note — return',
    amount: -389,
    status: 'OPEN',
  },
  {
    id: 'EX-CN-003',
    docType: 'Credit Note',
    side: 'In Kapiva, not in New Welcome',
    date: '30 Oct 2025',
    reference: 'CN-MUM-MT-SEP01',
    narration: 'Credit note — monthly trade',
    amount: -14112,
    status: 'OPEN',
  },
  {
    id: 'EX-CN-004',
    docType: 'Credit Note',
    side: 'In Kapiva, not in New Welcome',
    date: '31 Oct 2025',
    reference: 'CN-MUM-MT-OCT02',
    narration: 'Credit note — monthly trade',
    amount: -8755,
    status: 'OPEN',
  },
  {
    id: 'EX-CN-005',
    docType: 'Credit Note',
    side: 'In Kapiva, not in New Welcome',
    date: '30 Nov 2025',
    reference: 'CN-MUM-MT-NOV01',
    narration: 'Credit note — monthly trade',
    amount: -14419,
    status: 'OPEN',
  },
  // Right: debit notes raised by New Welcome, no corresponding CN from Kapiva
  {
    id: 'EX-DN-001',
    docType: 'Debit Note',
    side: 'In New Welcome, not in Kapiva',
    date: '28 Jul 2025',
    reference: 'PR/5266',
    narration: 'Purchase return no. 5266',
    amount: 2725,
    status: 'OPEN',
  },
  {
    id: 'EX-DN-002',
    docType: 'Debit Note',
    side: 'In New Welcome, not in Kapiva',
    date: '31 Jul 2025',
    reference: 'PE/2461',
    narration: 'Purchase return — expiry',
    amount: 9389,
    status: 'OPEN',
  },
  {
    id: 'EX-DN-003',
    docType: 'Debit Note',
    side: 'In New Welcome, not in Kapiva',
    date: '28 Sep 2025',
    reference: 'PE/3042',
    narration: 'Purchase return — expiry',
    amount: 14444,
    status: 'OPEN',
  },
  {
    id: 'EX-DN-004',
    docType: 'Debit Note',
    side: 'In New Welcome, not in Kapiva',
    date: '26 Jan 2026',
    reference: 'PE/4054',
    narration: 'Purchase return — expiry',
    amount: 8177,
    status: 'OPEN',
  },
  {
    id: 'EX-DN-005',
    docType: 'Debit Note',
    side: 'In New Welcome, not in Kapiva',
    date: '02 Feb 2026',
    reference: 'PR/7720',
    narration: 'Purchase return no. 7720',
    amount: 23384,
    status: 'OPEN',
  },
  {
    id: 'EX-DN-006',
    docType: 'Debit Note',
    side: 'In New Welcome, not in Kapiva',
    date: '18 Feb 2026',
    reference: 'PE/4394',
    narration: 'Purchase return — expiry',
    amount: 5194,
    status: 'OPEN',
  },
  {
    id: 'EX-DN-007',
    docType: 'Debit Note',
    side: 'In New Welcome, not in Kapiva',
    date: '08 Mar 2026',
    reference: 'PE/4570',
    narration: 'Purchase return — expiry',
    amount: 4508,
    status: 'OPEN',
  },
  {
    id: 'EX-DN-008',
    docType: 'Debit Note',
    side: 'In New Welcome, not in Kapiva',
    date: '06 Jun 2025',
    reference: 'PE/1910',
    narration: 'Return not accounted by Kapiva — expiry',
    amount: 15474,
    status: 'OPEN',
  },
];

// ── Anx-3: Payment gaps ───────────────────────────────────────────────────────
export const paymentExceptions: ExceptionItem[] = [
  {
    id: 'EX-PAY-001',
    docType: 'Payment',
    side: 'In Kapiva, not in New Welcome',
    date: '07 Jul 2025',
    reference: 'Op-AR-175',
    narration: 'Payment recorded in Kapiva — no acknowledgement from New Welcome',
    amount: -47259,
    status: 'OPEN',
  },
];

// ── Anx-4 (left): TDS gaps ────────────────────────────────────────────────────
export const tdsExceptions: ExceptionItem[] = [
  {
    id: 'EX-TDS-001',
    docType: 'TDS',
    side: 'In New Welcome, not in Kapiva',
    date: '17 Feb 2026',
    reference: 'JV/5479',
    narration: 'TDS deducted by NWPL — not in Kapiva',
    amount: 469,
    status: 'OPEN',
  },
  {
    id: 'EX-TDS-002',
    docType: 'TDS',
    side: 'In New Welcome, not in Kapiva',
    date: '24 Feb 2026',
    reference: 'PB/49071',
    narration: 'TDS deducted by NWPL — not in Kapiva',
    amount: 43,
    status: 'OPEN',
  },
  {
    id: 'EX-TDS-003',
    docType: 'TDS',
    side: 'In New Welcome, not in Kapiva',
    date: '26 Feb 2026',
    reference: 'PB/49788',
    narration: 'TDS deducted by NWPL — not in Kapiva',
    amount: 2,
    status: 'OPEN',
  },
  {
    id: 'EX-TDS-004',
    docType: 'TDS',
    side: 'In New Welcome, not in Kapiva',
    date: '06 Mar 2026',
    reference: 'PB/51163',
    narration: 'TDS deducted by NWPL — not in Kapiva',
    amount: 58,
    status: 'OPEN',
  },
  {
    id: 'EX-TDS-005',
    docType: 'TDS',
    side: 'In New Welcome, not in Kapiva',
    date: '06 Mar 2026',
    reference: 'PB/51166',
    narration: 'TDS deducted by NWPL — not in Kapiva',
    amount: 71,
    status: 'OPEN',
  },
  {
    id: 'EX-TDS-006',
    docType: 'TDS',
    side: 'In New Welcome, not in Kapiva',
    date: '10 Mar 2026',
    reference: 'PB/51162',
    narration: 'TDS deducted by NWPL — not in Kapiva',
    amount: 6,
    status: 'OPEN',
  },
  {
    id: 'EX-TDS-007',
    docType: 'TDS',
    side: 'In New Welcome, not in Kapiva',
    date: '10 Mar 2026',
    reference: 'PR/8195',
    narration: 'TDS adjustment — not in Kapiva',
    amount: -15,
    status: 'OPEN',
  },
  {
    id: 'EX-TDS-008',
    docType: 'TDS',
    side: 'In New Welcome, not in Kapiva',
    date: '16 Mar 2026',
    reference: 'PB/52223',
    narration: 'TDS deducted by NWPL — not in Kapiva',
    amount: 59,
    status: 'OPEN',
  },
  {
    id: 'EX-TDS-009',
    docType: 'TDS',
    side: 'In New Welcome, not in Kapiva',
    date: '23 Mar 2026',
    reference: 'PB/53349',
    narration: 'TDS deducted by NWPL — not in Kapiva',
    amount: 27,
    status: 'OPEN',
  },
  {
    id: 'EX-TDS-010',
    docType: 'TDS',
    side: 'In New Welcome, not in Kapiva',
    date: '23 Mar 2026',
    reference: 'PB/53350',
    narration: 'TDS deducted by NWPL — not in Kapiva',
    amount: 29,
    status: 'OPEN',
  },
];

// ── Anx-4 (right): Other / JV / GST exceptions ───────────────────────────────
export const otherExceptions: ExceptionItem[] = [
  {
    id: 'EX-OTH-001',
    docType: 'Other',
    side: 'In New Welcome, not in Kapiva',
    date: '11 Jul 2025',
    reference: 'JV/2164',
    narration: 'Balance transferred from customer ledger — co-pool expense',
    amount: -11779,
    status: 'OPEN',
    remark: 'Amount not in Adret',
  },
  {
    id: 'EX-OTH-002',
    docType: 'Other',
    side: 'In New Welcome, not in Kapiva',
    date: '25 Feb 2026',
    reference: 'JV/5594',
    narration: 'Co-pool balance transfer',
    amount: 170662,
    status: 'OPEN',
    remark: 'Amount not in Adret',
  },
  {
    id: 'EX-OTH-003',
    docType: 'Other',
    side: 'In New Welcome, not in Kapiva',
    date: '27 Mar 2026',
    reference: 'JV/6324',
    narration: 'Customer ledger balance transferred to supplier ledger (Ref VS 483)',
    amount: 147838,
    status: 'OPEN',
    remark: 'Amount not in Adret',
  },
  {
    id: 'EX-OTH-004',
    docType: 'Other',
    side: 'In New Welcome, not in Kapiva',
    date: '31 Mar 2026',
    reference: 'JV/6460',
    narration: 'Customer ledger balance transferred to supplier ledger (Ref VS 538)',
    amount: 144244,
    status: 'OPEN',
    remark: 'Amount not in Adret',
  },
  {
    id: 'EX-OTH-005',
    docType: 'Other',
    side: 'In Kapiva, not in New Welcome',
    date: '29 Nov 2024',
    reference: 'JV/1331',
    narration: 'Balance transfer from customer ledger VS-24-49/50/51/52',
    amount: 270866,
    status: 'OPEN',
    remark: 'To be accounted',
  },
  {
    id: 'EX-OTH-006',
    docType: 'Other',
    side: 'In New Welcome, not in Kapiva',
    date: '17 Mar 2026',
    reference: '000/25-J 242540',
    narration: 'GST payable — Emami promo offer Feb\'26 (SGST ₹2,220 + CGST ₹2,220 + Discount ₹24,676)',
    amount: 29118,
    status: 'OPEN',
    remark: 'GST Payable not matched with Adret',
  },
  {
    id: 'EX-OTH-007',
    docType: 'Other',
    side: 'In New Welcome, not in Kapiva',
    date: '08 Sep 2025',
    reference: 'JV/2155',
    narration: 'MRP rate difference / discount booked in New Welcome',
    amount: 3,
    status: 'OPEN',
  },
  {
    id: 'EX-OTH-008',
    docType: 'Other',
    side: 'In New Welcome, not in Kapiva',
    date: '15 Nov 2025',
    reference: 'JV/3142',
    narration: 'Loss on expiry booked in New Welcome',
    amount: -24,
    status: 'OPEN',
  },
  {
    id: 'EX-OTH-009',
    docType: 'Other',
    side: 'In New Welcome, not in Kapiva',
    date: '19 Dec 2025',
    reference: 'JV/4001',
    narration: 'Loss on expiry booked in New Welcome',
    amount: -634,
    status: 'OPEN',
  },
];

// ── Recon summary counts (used by Overview + Reconciliation exception chips) ──
export const reconSummary = {
  invoices:     { matched: 138, unmatched: invoiceExceptions.filter(e => e.status === 'OPEN').length },
  creditNotes:  { matched: 11,  unmatched: cnDnExceptions.filter(e => e.docType === 'Credit Note' && e.status === 'OPEN').length },
  debitNotes:   { matched: 8,   unmatched: cnDnExceptions.filter(e => e.docType === 'Debit Note' && e.status === 'OPEN').length },
  payments:     { matched: 38,  unmatched: paymentExceptions.filter(e => e.status === 'OPEN').length },
  tds:          { matched: 0,   unmatched: tdsExceptions.filter(e => e.status === 'OPEN').length },
};

// ── Reconciliation table: enhanced rows with dual-ledger columns ──────────────
export type DualReconStatus = ReconMatchStatus;

export interface DualReconRow {
  id: string;
  entity: 'Kapiva' | 'New Welcome';
  reference: string;
  docType: ExceptionDocType | 'Purchase Order';
  date: string;
  ourRecord: number | null;     // Kapiva (Adret / Zoho)
  counterpartyRecord: number | null; // New Welcome (email doc)
  difference: number;
  matchStatus: DualReconStatus;
  ourDocSource: string;
  counterpartyDocSource: string;
  narration: string;
}

export const dualReconRows: DualReconRow[] = [
  // ── Matched invoices ────────────────────────────────────────────────────────
  { id: 'DR-001', entity: 'Kapiva', reference: 'SI25-MUM7-2363', docType: 'Invoice', date: '11 Jul 2025', ourRecord: 109076, counterpartyRecord: 109076, difference: 0, matchStatus: 'MATCHED', ourDocSource: 'Zoho ERP · Sales Invoice', counterpartyDocSource: 'Email attachment · PB/15358', narration: 'Order No. 40286' },
  { id: 'DR-002', entity: 'Kapiva', reference: 'SI25-MUM7-2360', docType: 'Invoice', date: '11 Jul 2025', ourRecord: 211583, counterpartyRecord: 211583, difference: 0, matchStatus: 'MATCHED', ourDocSource: 'Zoho ERP · Sales Invoice', counterpartyDocSource: 'Email attachment · PB/15437', narration: 'Order No. 40286' },
  { id: 'DR-003', entity: 'Kapiva', reference: 'SI25-MUM7-2505', docType: 'Invoice', date: '17 Jul 2025', ourRecord: 53005, counterpartyRecord: 53005, difference: 0, matchStatus: 'MATCHED', ourDocSource: 'Zoho ERP · Sales Invoice', counterpartyDocSource: 'Email attachment · PB/15793', narration: 'Order No. 40956' },
  { id: 'DR-004', entity: 'Kapiva', reference: 'SI25-MUM7-2504', docType: 'Invoice', date: '17 Jul 2025', ourRecord: 25654, counterpartyRecord: 25654, difference: 0, matchStatus: 'MATCHED', ourDocSource: 'Zoho ERP · Sales Invoice', counterpartyDocSource: 'Email attachment · PB/15812', narration: 'Order No. 40956' },
  { id: 'DR-005', entity: 'Kapiva', reference: 'SI25-MUM7-8703', docType: 'Invoice', date: '16 Mar 2026', ourRecord: 62251, counterpartyRecord: 62251, difference: 0, matchStatus: 'MATCHED', ourDocSource: 'Zoho ERP · Sales Invoice', counterpartyDocSource: 'Email attachment · PB/52223', narration: 'Order No. 65485' },
  { id: 'DR-006', entity: 'Kapiva', reference: 'SI25-MUM7-8702', docType: 'Invoice', date: '16 Mar 2026', ourRecord: 31340, counterpartyRecord: 31340, difference: 0, matchStatus: 'MATCHED', ourDocSource: 'Zoho ERP · Sales Invoice', counterpartyDocSource: 'Email attachment · PB/52225', narration: 'Order No. 65485' },
  // ── Matched payments ────────────────────────────────────────────────────────
  { id: 'DR-010', entity: 'Kapiva', reference: 'NEFT-17Jul25', docType: 'Payment', date: '17 Jul 2025', ourRecord: -25022, counterpartyRecord: -25022, difference: 0, matchStatus: 'MATCHED', ourDocSource: 'Zoho ERP · Receipt entry · PT/22940', counterpartyDocSource: 'Bank statement · ICICI NEFT', narration: 'Ref: SI25-MUM7-1723' },
  { id: 'DR-011', entity: 'Kapiva', reference: 'NEFT-21Mar26', docType: 'Payment', date: '21 Mar 2026', ourRecord: -577761, counterpartyRecord: -577761, difference: 0, matchStatus: 'MATCHED', ourDocSource: 'Zoho ERP · Receipt entry · PT/42156', counterpartyDocSource: 'Bank statement · ICICI NEFT', narration: 'Multi-invoice payment — 7 invoices' },
  // ── Invoices not in counterparty ────────────────────────────────────────────
  { id: 'DR-020', entity: 'Kapiva', reference: 'SI25-MUM7-2134', docType: 'Invoice', date: '03 Jul 2025', ourRecord: 149268, counterpartyRecord: null, difference: 149268, matchStatus: 'NOT_IN_COUNTERPARTY', ourDocSource: 'Zoho ERP · Sales Invoice', counterpartyDocSource: '— No document received', narration: 'No corresponding purchase entry found in New Welcome' },
  { id: 'DR-021', entity: 'Kapiva', reference: 'SI25-MUM7-2135', docType: 'Invoice', date: '03 Jul 2025', ourRecord: 33231, counterpartyRecord: null, difference: 33231, matchStatus: 'NOT_IN_COUNTERPARTY', ourDocSource: 'Zoho ERP · Sales Invoice', counterpartyDocSource: '— No document received', narration: 'No corresponding purchase entry found in New Welcome' },
  // ── Credit notes not acknowledged ───────────────────────────────────────────
  { id: 'DR-030', entity: 'Kapiva', reference: 'FY25-CN-066', docType: 'Credit Note', date: '13 Aug 2025', ourRecord: -162, counterpartyRecord: null, difference: -162, matchStatus: 'NOT_IN_COUNTERPARTY', ourDocSource: 'Zoho ERP · Credit Note', counterpartyDocSource: '— No debit note received', narration: 'Credit note not acknowledged by New Welcome' },
  { id: 'DR-031', entity: 'Kapiva', reference: 'CN-MUM-MT-SEP01', docType: 'Credit Note', date: '30 Oct 2025', ourRecord: -14112, counterpartyRecord: null, difference: -14112, matchStatus: 'NOT_IN_COUNTERPARTY', ourDocSource: 'Zoho ERP · Credit Note', counterpartyDocSource: '— No debit note received', narration: 'Monthly trade credit note not acknowledged' },
  { id: 'DR-032', entity: 'Kapiva', reference: 'CN-MUM-MT-NOV01', docType: 'Credit Note', date: '30 Nov 2025', ourRecord: -14419, counterpartyRecord: null, difference: -14419, matchStatus: 'NOT_IN_COUNTERPARTY', ourDocSource: 'Zoho ERP · Credit Note', counterpartyDocSource: '— No debit note received', narration: 'Monthly trade credit note not acknowledged' },
  // ── Debit notes not in our books ────────────────────────────────────────────
  { id: 'DR-040', entity: 'Kapiva', reference: 'PE/2461', docType: 'Debit Note', date: '31 Jul 2025', ourRecord: null, counterpartyRecord: 9389, difference: -9389, matchStatus: 'NOT_IN_OUR_BOOKS', ourDocSource: '— No matching CN in Zoho', counterpartyDocSource: 'Email attachment · Purchase return expiry', narration: 'New Welcome raised debit note — no credit note from Kapiva' },
  { id: 'DR-041', entity: 'Kapiva', reference: 'PE/3042', docType: 'Debit Note', date: '28 Sep 2025', ourRecord: null, counterpartyRecord: 14444, difference: -14444, matchStatus: 'NOT_IN_OUR_BOOKS', ourDocSource: '— No matching CN in Zoho', counterpartyDocSource: 'Email attachment · Purchase return expiry', narration: 'New Welcome raised debit note — no credit note from Kapiva' },
  // ── Payment not acknowledged ────────────────────────────────────────────────
  { id: 'DR-050', entity: 'Kapiva', reference: 'Op-AR-175', docType: 'Payment', date: '07 Jul 2025', ourRecord: -47259, counterpartyRecord: null, difference: -47259, matchStatus: 'NOT_IN_COUNTERPARTY', ourDocSource: 'Zoho ERP · Receipt entry', counterpartyDocSource: '— No payment advice received', narration: 'Payment recorded in Kapiva — NWPL has no corresponding entry' },
  // ── TDS entries ─────────────────────────────────────────────────────────────
  { id: 'DR-060', entity: 'Kapiva', reference: 'JV/5479', docType: 'TDS', date: '17 Feb 2026', ourRecord: null, counterpartyRecord: 469, difference: -469, matchStatus: 'TDS', ourDocSource: '— TDS certificate pending', counterpartyDocSource: 'Email · NWPL TDS deduction', narration: 'TDS deducted by New Welcome — no matching entry in Kapiva' },
  { id: 'DR-061', entity: 'Kapiva', reference: 'PB/49071', docType: 'TDS', date: '24 Feb 2026', ourRecord: null, counterpartyRecord: 43, difference: -43, matchStatus: 'TDS', ourDocSource: '— TDS certificate pending', counterpartyDocSource: 'Email · NWPL TDS deduction', narration: 'TDS deducted by New Welcome' },
  { id: 'DR-062', entity: 'Kapiva', reference: 'PB/53349', docType: 'TDS', date: '23 Mar 2026', ourRecord: null, counterpartyRecord: 27, difference: -27, matchStatus: 'TDS', ourDocSource: '— TDS certificate pending', counterpartyDocSource: 'Email · NWPL TDS deduction', narration: 'TDS deducted by New Welcome' },
];

// ── "Awaiting from New Welcome" — pending docs panel for Upload tab ───────────
export interface PendingDoc {
  id: string;
  what: string;
  reference: string;
  dueSince: string;
  amount: number | null;
  overdue: boolean;
}

export const pendingFromCounterparty: PendingDoc[] = [
  { id: 'PD-001', what: 'Debit note for CN-MUM-MT-SEP01', reference: 'Kapiva CN-MUM-MT-SEP01', dueSince: '30 Oct 2025', amount: -14112, overdue: true },
  { id: 'PD-002', what: 'Debit note for CN-MUM-MT-OCT02', reference: 'Kapiva CN-MUM-MT-OCT02', dueSince: '31 Oct 2025', amount: -8755, overdue: true },
  { id: 'PD-003', what: 'Debit note for CN-MUM-MT-NOV01', reference: 'Kapiva CN-MUM-MT-NOV01', dueSince: '30 Nov 2025', amount: -14419, overdue: true },
  { id: 'PD-004', what: 'Payment acknowledgement for NEFT', reference: 'Op-AR-175 · ₹47,259', dueSince: '07 Jul 2025', amount: null, overdue: true },
  { id: 'PD-005', what: 'TDS certificate Q1–Q3 FY26', reference: 'JV/5479, PB/49071, PB/49788', dueSince: '15 Oct 2025', amount: null, overdue: true },
  { id: 'PD-006', what: 'Purchase entry acknowledgement', reference: 'SI25-MUM7-2134', dueSince: '03 Jul 2025', amount: 149268, overdue: true },
  { id: 'PD-007', what: 'Purchase entry acknowledgement', reference: 'SI25-MUM7-2135', dueSince: '03 Jul 2025', amount: 33231, overdue: true },
  { id: 'PD-008', what: 'Credit note acknowledgement', reference: 'FY25-CN-066', dueSince: '13 Aug 2025', amount: -162, overdue: true },
];
