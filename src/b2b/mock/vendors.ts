// Enriched B2B Vendors / Clients dataset for Brand: Kapiva (20 B2B Counterparties)
// Fully populated with invoices, receipts, GSTIN, credit terms, and reconciliation status.

export interface VendorInvoiceSummary {
  id: string;
  date: string;
  grossAmount: number;
  netPayable: number;
  settledAmount: number;
  balanceDue: number;
  status: 'Settled' | 'Partial' | 'Unpaid';
}

export interface VendorPaymentSummary {
  utrId: string;
  date: string;
  amount: number;
  allocatedAmount: number;
  mode: string;
  invoicesCleared: number;
}

export interface VendorCreditNote {
  id: string;
  date: string;
  amount: number;
  reason: string;
  status: 'Applied' | 'Pending';
}

export interface VendorDebitNote {
  id: string;
  date: string;
  amount: number;
  reason: string;
  status: 'Applied' | 'Pending';
}

export interface VendorEmail {
  id: string;
  date: string;
  subject: string;
  sender: string;
  snippet: string;
}

export interface B2BVendor {
  id: string;
  code: string;
  name: string;
  category: 'Pharmacy Chain' | 'Modern Trade' | 'Retail Distributor' | 'Wholesale';
  city: string;
  state: string;
  gstin: string;
  zohoContactId: string;
  creditPeriodDays: number;
  invoiceCount: number;
  totalBilled: number;
  totalSettled: number;
  outstandingBalance: number;
  settlementRatePct: number;
  reconStatus: 'Reconciled' | 'Pending' | 'Action Required';
  lastPaymentDate: string;
  lastUtr: string;
  recentInvoices: VendorInvoiceSummary[];
  recentPayments: VendorPaymentSummary[];
  creditNotes?: VendorCreditNote[];
  debitNotes?: VendorDebitNote[];
  emails?: VendorEmail[];
}

export const mockB2BVendors: B2BVendor[] = [
  {
    id: 'VND-001',
    code: 'NWPL',
    name: 'New Welcome Pharma',
    category: 'Pharmacy Chain',
    city: 'Mumbai',
    state: 'Maharashtra',
    gstin: '27AABCN1234F1ZP',
    zohoContactId: 'ZC-90182',
    creditPeriodDays: 45,
    invoiceCount: 10,
    totalBilled: 7500000,
    totalSettled: 5000000,
    outstandingBalance: 2500000,
    settlementRatePct: 66.7,
    reconStatus: 'Reconciled',
    lastPaymentDate: '15 Mar 2025',
    lastUtr: 'UTR-ICICI-20250315-7821',
    recentInvoices: [
      { id: 'SI25-KPV-1001', date: '10 Jan 2025', grossAmount: 800000, netPayable: 800000, settledAmount: 800000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-1002', date: '18 Jan 2025', grossAmount: 1200000, netPayable: 1150000, settledAmount: 1150000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-1003', date: '25 Jan 2025', grossAmount: 650000, netPayable: 650000, settledAmount: 650000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-1004', date: '02 Feb 2025', grossAmount: 900000, netPayable: 850000, settledAmount: 850000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-1005', date: '15 Feb 2025', grossAmount: 750000, netPayable: 750000, settledAmount: 750000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-1006', date: '28 Feb 2025', grossAmount: 500000, netPayable: 500000, settledAmount: 500000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-1007', date: '05 Mar 2025', grossAmount: 800000, netPayable: 800000, settledAmount: 300000, balanceDue: 500000, status: 'Partial' },
      { id: 'SI25-KPV-1008', date: '12 Mar 2025', grossAmount: 1000000, netPayable: 1000000, settledAmount: 0, balanceDue: 1000000, status: 'Unpaid' },
    ],
    recentPayments: [
      { utrId: 'UTR-ICICI-20250315-7821', date: '15 Mar 2025', amount: 5000000, allocatedAmount: 5000000, mode: 'NEFT', invoicesCleared: 6 },
    ],
    creditNotes: [
      { id: 'CN-25-001', date: '01 Mar 2025', amount: 50000, reason: 'Damaged Goods', status: 'Applied' },
    ],
    debitNotes: [
      { id: 'DN-25-001', date: '10 Feb 2025', amount: 15000, reason: 'Late Delivery Penalty', status: 'Pending' },
    ],
    emails: [
      { id: 'MSG-001', date: '14 Mar 2025, 10:30 AM', subject: 'Re: Pending Invoices and Credit Note CN-25-001', sender: 'accounts@newwelcome.com', snippet: 'Hi team, we have applied the credit note CN-25-001 to the outstanding balance. Please verify.' },
      { id: 'MSG-002', date: '12 Feb 2025, 02:15 PM', subject: 'Debit Note DN-25-001 Details', sender: 'finance@kapiva.in', snippet: 'Please find attached the debit note for the late delivery penalty on order PO-9921.' },
    ],
  },
  {
    id: 'VND-002',
    code: 'APOL',
    name: 'Apollo Pharmacy Ltd',
    category: 'Pharmacy Chain',
    city: 'Hyderabad',
    state: 'Telangana',
    gstin: '36AAACA2221E1Z0',
    zohoContactId: 'ZC-90183',
    creditPeriodDays: 60,
    invoiceCount: 14,
    totalBilled: 8450000,
    totalSettled: 5950000,
    outstandingBalance: 2500000,
    settlementRatePct: 70.4,
    reconStatus: 'Reconciled',
    lastPaymentDate: '20 Mar 2025',
    lastUtr: 'UTR-HDFC-20250320-1194',
    recentInvoices: [
      { id: 'SI25-KPV-2001', date: '05 Jan 2025', grossAmount: 500000, netPayable: 500000, settledAmount: 500000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-2002', date: '15 Jan 2025', grossAmount: 650000, netPayable: 625000, settledAmount: 625000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-2003', date: '01 Feb 2025', grossAmount: 850000, netPayable: 850000, settledAmount: 850000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-2004', date: '14 Feb 2025', grossAmount: 700000, netPayable: 670000, settledAmount: 525000, balanceDue: 145000, status: 'Partial' },
    ],
    recentPayments: [
      { utrId: 'UTR-HDFC-20250320-1194', date: '20 Mar 2025', amount: 2500000, allocatedAmount: 2500000, mode: 'RTGS', invoicesCleared: 3 },
    ],
  },
  {
    id: 'VND-003',
    code: 'WLFR',
    name: 'Wellness Forever Medicare',
    category: 'Retail Distributor',
    city: 'Mumbai',
    state: 'Maharashtra',
    gstin: '27AAACW8890K1Z5',
    zohoContactId: 'ZC-90184',
    creditPeriodDays: 45,
    invoiceCount: 8,
    totalBilled: 3190000,
    totalSettled: 1200000,
    outstandingBalance: 1990000,
    settlementRatePct: 37.6,
    reconStatus: 'Pending',
    lastPaymentDate: '22 Mar 2025',
    lastUtr: 'UTR-AXIS-20250322-9012',
    recentInvoices: [
      { id: 'SI25-KPV-3001', date: '12 Jan 2025', grossAmount: 420000, netPayable: 420000, settledAmount: 420000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-3002', date: '28 Jan 2025', grossAmount: 580000, netPayable: 562000, settledAmount: 562000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-3003', date: '10 Feb 2025', grossAmount: 390000, netPayable: 390000, settledAmount: 218000, balanceDue: 172000, status: 'Partial' },
    ],
    recentPayments: [
      { utrId: 'UTR-AXIS-20250322-9012', date: '22 Mar 2025', amount: 1200000, allocatedAmount: 1200000, mode: 'NEFT', invoicesCleared: 2 },
    ],
  },
  {
    id: 'VND-004',
    code: 'MDPL',
    name: 'MedPlus Health Services',
    category: 'Pharmacy Chain',
    city: 'Hyderabad',
    state: 'Telangana',
    gstin: '36AAECM4455H1Z3',
    zohoContactId: 'ZC-90185',
    creditPeriodDays: 60,
    invoiceCount: 11,
    totalBilled: 5200000,
    totalSettled: 3100000,
    outstandingBalance: 2100000,
    settlementRatePct: 59.6,
    reconStatus: 'Reconciled',
    lastPaymentDate: '30 Mar 2025',
    lastUtr: 'UTR-ICICI-20250330-0012',
    recentInvoices: [
      { id: 'SI25-KPV-4001', date: '08 Jan 2025', grossAmount: 620000, netPayable: 620000, settledAmount: 620000, balanceDue: 0, status: 'Settled' },
      { id: 'SI25-KPV-4002', date: '22 Jan 2025', grossAmount: 780000, netPayable: 780000, settledAmount: 780000, balanceDue: 0, status: 'Settled' },
    ],
    recentPayments: [
      { utrId: 'UTR-ICICI-20250330-0012', date: '30 Mar 2025', amount: 2100000, allocatedAmount: 2100000, mode: 'NEFT', invoicesCleared: 3 },
    ],
  },
  {
    id: 'VND-005',
    code: 'RLNC',
    name: 'Reliance Retail (JioMart B2B)',
    category: 'Modern Trade',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    gstin: '27AABCR6789P1ZZ',
    zohoContactId: 'ZC-90186',
    creditPeriodDays: 60,
    invoiceCount: 16,
    totalBilled: 9600000,
    totalSettled: 3800000,
    outstandingBalance: 5800000,
    settlementRatePct: 39.6,
    reconStatus: 'Action Required',
    lastPaymentDate: '26 Mar 2025',
    lastUtr: 'UTR-SBI-20250326-4401',
    recentInvoices: [],
    recentPayments: [
      { utrId: 'UTR-SBI-20250326-4401', date: '26 Mar 2025', amount: 3800000, allocatedAmount: 3800000, mode: 'RTGS', invoicesCleared: 4 },
    ],
  },
  {
    id: 'VND-006',
    code: 'FRRS',
    name: 'Frank Ross Pharmacy',
    category: 'Pharmacy Chain',
    city: 'Kolkata',
    state: 'West Bengal',
    gstin: '19AAACF3412M1Z2',
    zohoContactId: 'ZC-90187',
    creditPeriodDays: 45,
    invoiceCount: 6,
    totalBilled: 2100000,
    totalSettled: 1450000,
    outstandingBalance: 650000,
    settlementRatePct: 69.0,
    reconStatus: 'Reconciled',
    lastPaymentDate: '12 Feb 2025',
    lastUtr: 'UTR-HDFC-20250212-0891',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-007',
    code: 'NBPL',
    name: 'Noble Plus Healthcare',
    category: 'Pharmacy Chain',
    city: 'Mumbai',
    state: 'Maharashtra',
    gstin: '27AAACN5566R1Z9',
    zohoContactId: 'ZC-90188',
    creditPeriodDays: 30,
    invoiceCount: 5,
    totalBilled: 1480000,
    totalSettled: 890000,
    outstandingBalance: 590000,
    settlementRatePct: 60.1,
    reconStatus: 'Reconciled',
    lastPaymentDate: '18 Feb 2025',
    lastUtr: 'UTR-KOTAK-20250218-1922',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-008',
    code: '1MG',
    name: 'Tata 1mg Retail Distribution',
    category: 'Modern Trade',
    city: 'Gurugram',
    state: 'Haryana',
    gstin: '06AAACT9900L1ZX',
    zohoContactId: 'ZC-90189',
    creditPeriodDays: 45,
    invoiceCount: 12,
    totalBilled: 5800000,
    totalSettled: 3600000,
    outstandingBalance: 2200000,
    settlementRatePct: 62.1,
    reconStatus: 'Pending',
    lastPaymentDate: '04 Mar 2025',
    lastUtr: 'UTR-AXIS-20250304-4110',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-009',
    code: 'HTRO',
    name: 'Hetero Pharmacy Outlets',
    category: 'Pharmacy Chain',
    city: 'Hyderabad',
    state: 'Telangana',
    gstin: '36AAACH7788C1Z4',
    zohoContactId: 'ZC-90190',
    creditPeriodDays: 45,
    invoiceCount: 6,
    totalBilled: 1850000,
    totalSettled: 1200000,
    outstandingBalance: 650000,
    settlementRatePct: 64.9,
    reconStatus: 'Reconciled',
    lastPaymentDate: '27 Feb 2025',
    lastUtr: 'UTR-ICICI-20250227-7721',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-010',
    code: 'FRTS',
    name: 'Fortis Healthworld',
    category: 'Pharmacy Chain',
    city: 'Delhi',
    state: 'Delhi',
    gstin: '07AAACF8811K1Z1',
    zohoContactId: 'ZC-90191',
    creditPeriodDays: 45,
    invoiceCount: 4,
    totalBilled: 1350000,
    totalSettled: 950000,
    outstandingBalance: 400000,
    settlementRatePct: 70.4,
    reconStatus: 'Reconciled',
    lastPaymentDate: '19 Feb 2025',
    lastUtr: 'UTR-SBI-20250219-0922',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-011',
    code: 'DMRT',
    name: 'Avenue Supermarts (DMart B2B)',
    category: 'Modern Trade',
    city: 'Thane',
    state: 'Maharashtra',
    gstin: '27AABCA3344N1ZV',
    zohoContactId: 'ZC-90192',
    creditPeriodDays: 30,
    invoiceCount: 15,
    totalBilled: 7400000,
    totalSettled: 4800000,
    outstandingBalance: 2600000,
    settlementRatePct: 64.9,
    reconStatus: 'Action Required',
    lastPaymentDate: '10 Mar 2025',
    lastUtr: 'UTR-HDFC-20250310-8819',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-012',
    code: 'NTBK',
    name: "Nature's Basket Fine Foods",
    category: 'Modern Trade',
    city: 'Mumbai',
    state: 'Maharashtra',
    gstin: '27AAACN9922P1Z8',
    zohoContactId: 'ZC-90193',
    creditPeriodDays: 45,
    invoiceCount: 4,
    totalBilled: 1120000,
    totalSettled: 780000,
    outstandingBalance: 340000,
    settlementRatePct: 69.6,
    reconStatus: 'Reconciled',
    lastPaymentDate: '14 Feb 2025',
    lastUtr: 'UTR-ICICI-20250214-5501',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-013',
    code: 'ZPTO',
    name: 'Zepto Darkstores Supply',
    category: 'Modern Trade',
    city: 'Bengaluru',
    state: 'Karnataka',
    gstin: '29AAACZ1122D1ZG',
    zohoContactId: 'ZC-90194',
    creditPeriodDays: 30,
    invoiceCount: 9,
    totalBilled: 4200000,
    totalSettled: 1850000,
    outstandingBalance: 2350000,
    settlementRatePct: 44.0,
    reconStatus: 'Pending',
    lastPaymentDate: '28 Mar 2025',
    lastUtr: 'UTR-KOTAK-20250328-5529',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-014',
    code: 'BLNK',
    name: 'Blinkit Commerce Pvt Ltd',
    category: 'Modern Trade',
    city: 'Gurugram',
    state: 'Haryana',
    gstin: '06AAACB4433E1ZQ',
    zohoContactId: 'ZC-90195',
    creditPeriodDays: 30,
    invoiceCount: 10,
    totalBilled: 4900000,
    totalSettled: 3400000,
    outstandingBalance: 1500000,
    settlementRatePct: 69.4,
    reconStatus: 'Reconciled',
    lastPaymentDate: '16 Mar 2025',
    lastUtr: 'UTR-AXIS-20250316-0911',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-015',
    code: 'AMZN',
    name: 'Amazon Retail Wholesale',
    category: 'Modern Trade',
    city: 'Bengaluru',
    state: 'Karnataka',
    gstin: '29AABCA0011K1ZM',
    zohoContactId: 'ZC-90196',
    creditPeriodDays: 60,
    invoiceCount: 18,
    totalBilled: 9800000,
    totalSettled: 6200000,
    outstandingBalance: 3600000,
    settlementRatePct: 63.3,
    reconStatus: 'Action Required',
    lastPaymentDate: '11 Mar 2025',
    lastUtr: 'UTR-ICICI-20250311-6620',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-016',
    code: 'FLPK',
    name: 'Flipkart India Wholesale',
    category: 'Modern Trade',
    city: 'Bengaluru',
    state: 'Karnataka',
    gstin: '29AAACF2233G1ZT',
    zohoContactId: 'ZC-90197',
    creditPeriodDays: 60,
    invoiceCount: 17,
    totalBilled: 8600000,
    totalSettled: 5400000,
    outstandingBalance: 3200000,
    settlementRatePct: 62.8,
    reconStatus: 'Action Required',
    lastPaymentDate: '09 Mar 2025',
    lastUtr: 'UTR-SBI-20250309-8812',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-017',
    code: 'GRDN',
    name: 'Guardian Pharmacy Chain',
    category: 'Pharmacy Chain',
    city: 'Gurugram',
    state: 'Haryana',
    gstin: '06AAACG8899J1ZB',
    zohoContactId: 'ZC-90198',
    creditPeriodDays: 45,
    invoiceCount: 5,
    totalBilled: 1650000,
    totalSettled: 1100000,
    outstandingBalance: 550000,
    settlementRatePct: 66.7,
    reconStatus: 'Reconciled',
    lastPaymentDate: '23 Feb 2025',
    lastUtr: 'UTR-HDFC-20250223-1490',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-018',
    code: 'NTMD',
    name: 'Netmeds Offline Distributors',
    category: 'Retail Distributor',
    city: 'Chennai',
    state: 'Tamil Nadu',
    gstin: '33AAACN4455Q1ZY',
    zohoContactId: 'ZC-90199',
    creditPeriodDays: 45,
    invoiceCount: 7,
    totalBilled: 2450000,
    totalSettled: 1650000,
    outstandingBalance: 800000,
    settlementRatePct: 67.3,
    reconStatus: 'Reconciled',
    lastPaymentDate: '01 Mar 2025',
    lastUtr: 'UTR-AXIS-20250301-7788',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-019',
    code: 'WLCD',
    name: 'Wellness Care Distributors',
    category: 'Wholesale',
    city: 'Ahmedabad',
    state: 'Gujarat',
    gstin: '24AAACW1199F1ZU',
    zohoContactId: 'ZC-90200',
    creditPeriodDays: 30,
    invoiceCount: 4,
    totalBilled: 1220000,
    totalSettled: 820000,
    outstandingBalance: 400000,
    settlementRatePct: 67.2,
    reconStatus: 'Reconciled',
    lastPaymentDate: '17 Feb 2025',
    lastUtr: 'UTR-KOTAK-20250217-3310',
    recentInvoices: [],
    recentPayments: [],
  },
  {
    id: 'VND-020',
    code: 'MTRC',
    name: 'Metro Cash & Carry India',
    category: 'Wholesale',
    city: 'Bengaluru',
    state: 'Karnataka',
    gstin: '29AABCM9988H1ZS',
    zohoContactId: 'ZC-90201',
    creditPeriodDays: 45,
    invoiceCount: 9,
    totalBilled: 4100000,
    totalSettled: 2900000,
    outstandingBalance: 1200000,
    settlementRatePct: 70.7,
    reconStatus: 'Reconciled',
    lastPaymentDate: '24 Feb 2025',
    lastUtr: 'UTR-SBI-20250224-6611',
    recentInvoices: [],
    recentPayments: [],
  },
];

// Re-export for backward compatibility
export const mockVendors = mockB2BVendors as any;
export type Vendor = B2BVendor;
