// Per-channel drilldown data for the Cosmix demo.
// Each channel has: payout logic, sales, deductions, receivable, received,
// pending, deduction breakdown, issue flags, and upcoming payouts.
import type { ChannelDrilldownData } from './types';

export const channelDrilldownData: Record<string, ChannelDrilldownData> = {
  blinkit: {
    channel: 'Blinkit',
    model: 'Quick-commerce (SOR)',
    contractRef: 'BLK-CTR-FY26',
    payoutLogic: 'Weekly settlement cycle (every Tuesday). Sale-or-return model - Cosmix retains ownership until consumer purchase. Settlement = GMV less commission, fulfilment, visibility, and handling fees.',
    salesInPeriod: 35_80_000,
    grossDeductions: 7_52_000,
    expectedReceivable: 35_80_000,
    receivedAmount: 32_00_000,
    pendingBalance: 3_80_000,
    deductionBreakdown: [
      { label: 'Base commission (20%)', contracted: '20% of GMV', actual: 7_16_000, expected: 7_16_000, variance: 0 },
      { label: 'Fulfilment fee', contracted: '₹12 / order', actual: 84_000, expected: 84_000, variance: 0 },
      { label: 'Handling fee', contracted: '₹4 / unit', actual: 1_43_200, expected: 1_14_400, variance: 28_800 },
      { label: 'Dark store storage', contracted: '₹3 / unit / month', actual: 42_900, expected: 42_900, variance: 0 },
      { label: 'Visibility / ad spend', contracted: '≤ 5% of GMV', actual: 1_79_000, expected: 1_79_000, variance: 0 },
      { label: 'Cold Storage Surcharge', contracted: 'NOT IN CONTRACT', actual: 89_500, expected: 0, variance: 89_500 },
      { label: 'TCS (1%)', contracted: '1%', actual: 35_800, expected: 35_800, variance: 0 },
    ],
    issueFlags: [
      { type: 'Debit note – damages', count: 2, amount: 1_52_000 },
      { type: 'Pending GRN', count: 1, amount: 96_000 },
      { type: 'Rate variance', count: 1, amount: 38_000 },
    ],
    upcomingPayouts: [
      { date: '14 Aug 2026', amount: 5_60_000, status: 'Expected' },
      { date: '21 Aug 2026', amount: 4_80_000, status: 'Expected' },
      { date: '28 Aug 2026', amount: 5_20_000, status: 'Expected' },
    ],
  },

  zepto: {
    channel: 'Zepto',
    model: 'Quick-commerce (SOR)',
    contractRef: 'ZEP-CTR-FY26',
    payoutLogic: 'Weekly settlement cycle (every Wednesday). Sale-or-return - Zepto owns the dark-store shelf, Cosmix retains product ownership. Settlement = GMV less margin, fulfilment, platform support, and visibility fees.',
    salesInPeriod: 31_20_000,
    grossDeductions: 6_86_400,
    expectedReceivable: 31_20_000,
    receivedAmount: 28_00_000,
    pendingBalance: 3_20_000,
    deductionBreakdown: [
      { label: 'Base margin (22%)', contracted: '22% of GMV', actual: 6_86_400, expected: 6_86_400, variance: 0 },
      { label: 'Fulfilment fee', contracted: '₹14 / order', actual: 72_800, expected: 72_800, variance: 0 },
      { label: 'Platform support', contracted: '2% of GMV', actual: 1_09_200, expected: 62_400, variance: 46_800 },
      { label: 'Dark store storage', contracted: '₹4 / unit / month', actual: 36_000, expected: 36_000, variance: 0 },
      { label: 'Visibility / ad cap', contracted: '≤ 6% of GMV', actual: 1_87_200, expected: 1_87_200, variance: 0 },
      { label: 'TCS (1%)', contracted: '1%', actual: 31_200, expected: 31_200, variance: 0 },
    ],
    issueFlags: [
      { type: 'Visibility fee duplicate', count: 1, amount: 1_84_000 },
      { type: 'Short payment', count: 1, amount: 41_200 },
    ],
    upcomingPayouts: [
      { date: '12 Aug 2026', amount: 4_20_000, status: 'Expected' },
      { date: '19 Aug 2026', amount: 3_90_000, status: 'Expected' },
      { date: '26 Aug 2026', amount: 4_10_000, status: 'Expected' },
    ],
  },

  reliance: {
    channel: 'Reliance',
    model: 'Modern Trade (Credit terms)',
    contractRef: 'REL-CTR-FY26',
    payoutLogic: '45-day credit terms from invoice date. PO → dispatch → GRN → invoice uploaded to Reliance Vendor Portal → payment after 45 days. Trade margin + listing + shelf placement deducted from invoice value.',
    salesInPeriod: 19_80_000,
    grossDeductions: 3_56_400,
    expectedReceivable: 19_80_000,
    receivedAmount: 18_00_000,
    pendingBalance: 1_80_000,
    deductionBreakdown: [
      { label: 'Trade margin (18% of MRP)', contracted: '18% of MRP', actual: 3_56_400, expected: 3_56_400, variance: 0 },
      { label: 'Listing fee', contracted: '₹5,000 / SKU / quarter', actual: 30_000, expected: 30_000, variance: 0 },
      { label: 'Shelf placement', contracted: '₹2,500 / month / store', actual: 25_000, expected: 25_000, variance: 0 },
      { label: 'Promotional co-fund', contracted: '3% of GMV', actual: 59_400, expected: 59_400, variance: 0 },
      { label: 'Logistics deduction', contracted: '≤ 2% of invoice', actual: 39_600, expected: 39_600, variance: 0 },
      { label: 'TCS (1%)', contracted: '1%', actual: 19_800, expected: 19_800, variance: 0 },
    ],
    issueFlags: [
      { type: 'Settlement pending', count: 1, amount: 2_40_000 },
      { type: 'Invoice missing', count: 1, amount: 68_000 },
    ],
    upcomingPayouts: [
      { date: '15 Aug 2026', amount: 2_40_000, status: 'Overdue' },
      { date: '28 Aug 2026', amount: 1_85_000, status: 'Expected' },
    ],
  },

  'cafes-bangalore': {
    channel: 'Cafes – Bangalore',
    model: 'Direct Supply (120+ accounts)',
    contractRef: 'CAF-BLR-FY26',
    payoutLogic: 'Direct supply to 120+ cafe accounts across Bangalore. Wholesale pricing (MRP less 30–40%). Payment terms: 7 days from delivery (most cafes). Orders arrive via email, WhatsApp, or phone. No portal - all email-based.',
    salesInPeriod: 13_20_000,
    grossDeductions: 0,
    expectedReceivable: 13_20_000,
    receivedAmount: 12_00_000,
    pendingBalance: 1_20_000,
    deductionBreakdown: [
      { label: 'Wholesale discount (30–40%)', contracted: 'MRP less 30–40%', actual: 0, expected: 0, variance: 0 },
      { label: 'Delivery / logistics', contracted: 'Included', actual: 0, expected: 0, variance: 0 },
    ],
    issueFlags: [
      { type: 'Overdue', count: 8, amount: 1_20_000 },
    ],
    upcomingPayouts: [
      { date: '16 Aug 2026', amount: 1_80_000, status: 'Partial' },
      { date: '23 Aug 2026', amount: 1_40_000, status: 'Expected' },
    ],
    accounts: [
      { name: 'Third Wave Coffee - Koramangala', salesInPeriod: 2_40_000, receivedAmount: 1_92_000, pendingBalance: 48_000, status: 'Overdue' },
      { name: 'Starbucks - Indiranagar', salesInPeriod: 3_10_000, receivedAmount: 3_10_000, pendingBalance: 0, status: 'Settled' },
      { name: 'Paper and Pie - Whitefield', salesInPeriod: 1_80_000, receivedAmount: 1_50_000, pendingBalance: 30_000, status: 'Partial' },
      { name: 'Blue Tokai - Jayanagar', salesInPeriod: 2_20_000, receivedAmount: 2_20_000, pendingBalance: 0, status: 'Settled' },
      { name: 'Hatti Kaapi - MG Road', salesInPeriod: 1_50_000, receivedAmount: 1_08_000, pendingBalance: 42_000, status: 'Overdue' }
    ]
  },
};
