// ─── B2B Mock Data ─────────────────────────────────────────────────
// All data is frontend-only mockups for the B2B demo.
// Organized around business outcomes for D2C finance teams
// selling on marketplaces (Zepto, Blinkit, Instamart, Amazon, Flipkart).

// ─── Types ──────────────────────────────────────────────────────────

export type PlatformName = 'Zepto' | 'Blinkit' | 'Instamart' | 'Amazon' | 'Flipkart';

export interface B2BOverviewKPIs {
  totalGMV: number;
  totalSettled: number;
  totalOutstanding: number;
  totalRecovered: number;
  totalInDispute: number;
  recoveryRate: number; // percentage
  platformCount: number;
  anomaliesDetected: number;
}

export interface PlatformSummary {
  name: PlatformName;
  gmv: number;
  settled: number;
  outstanding: number;
  recovered: number;
  inDispute: number;
  healthScore: number; // 0-100
  avgSettlementDays: number;
  commissionRate: number; // actual %
  expectedCommissionRate: number; // contractual %
  lastSettlement: string;
  status: 'Healthy' | 'Needs Attention' | 'Critical';
}

export interface Recovery {
  id: string;
  platform: PlatformName;
  type: 'Commission Overcharge' | 'Weight Discrepancy' | 'Return Not Received' | 'Damaged in Transit' | 'Short Payment' | 'Promo Deduction Error' | 'TDS Mismatch';
  amount: number;
  status: 'Recovered' | 'In Progress' | 'Filed' | 'Identified';
  identifiedDate: string;
  resolvedDate: string | null;
  description: string;
  confidence: number;
  recommendedAction: string;
  assignee: string | null;
  aiReasoning: string;
  evidence: string[];
  relatedDocuments: string[];
  discussion: { id: string; user: string; text: string; time: string }[];
  timeline: { id: string; date: string; user: string; action: string }[];
}

export interface OutstandingItem {
  id: string;
  platform: PlatformName;
  orderPeriod: string;
  amount: number;
  expectedDate: string;
  agingDays: number;
  agingBucket: '0-7' | '8-15' | '16-30' | '30+';
  risk: 'Low' | 'Medium' | 'High';
  reason: string;
}

export interface Dispute {
  id: string;
  platform: PlatformName;
  type: string;
  amount: number;
  filedDate: string;
  status: 'Open' | 'Under Review' | 'Escalated' | 'Won' | 'Lost' | 'Partially Won';
  daysOpen: number;
  description: string;
  aiSuggestion: string;
}

export interface AccountingItem {
  id: string;
  platform: PlatformName;
  type: 'Settlement' | 'TDS' | 'TCS' | 'GST' | 'Commission';
  bookValue: number;
  platformValue: number;
  difference: number;
  status: 'Matched' | 'Mismatch' | 'Pending Review';
  period: string;
}

export interface ActivityItem {
  id: string;
  type: 'recovery' | 'settlement' | 'dispute' | 'anomaly' | 'accounting' | 'ai_insight';
  title: string;
  description: string;
  platform: PlatformName | null;
  amount: number | null;
  timestamp: string;
  isNew: boolean;
}

// ─── Overview KPIs ──────────────────────────────────────────────────

export const b2bOverviewKPIs: B2BOverviewKPIs = {
  totalGMV: 8_42_00_000,
  totalSettled: 7_68_42_000,
  totalOutstanding: 48_56_000,
  totalRecovered: 12_84_000,
  totalInDispute: 25_18_000,
  recoveryRate: 73.4,
  platformCount: 5,
  anomaliesDetected: 14,
};

// ─── Monthly trend ──────────────────────────────────────────────────

export const b2bMonthlyTrend = [
  { month: 'Jan', gmv: 1_28_00_000, settled: 1_16_80_000, recovered: 1_42_000, outstanding: 9_78_000 },
  { month: 'Feb', gmv: 1_34_00_000, settled: 1_23_40_000, recovered: 1_86_000, outstanding: 8_74_000 },
  { month: 'Mar', gmv: 1_42_00_000, settled: 1_31_60_000, recovered: 2_24_000, outstanding: 8_16_000 },
  { month: 'Apr', gmv: 1_38_00_000, settled: 1_28_20_000, recovered: 2_48_000, outstanding: 7_32_000 },
  { month: 'May', gmv: 1_46_00_000, settled: 1_35_80_000, recovered: 2_62_000, outstanding: 7_58_000 },
  { month: 'Jun', gmv: 1_54_00_000, settled: 1_32_62_000, recovered: 2_22_000, outstanding: 6_98_000 },
];

// ─── Platform Summaries ─────────────────────────────────────────────

export const b2bPlatforms: PlatformSummary[] = [
  {
    name: 'Zepto',
    gmv: 2_24_00_000,
    settled: 2_04_60_000,
    outstanding: 12_40_000,
    recovered: 3_82_000,
    inDispute: 3_18_000,
    healthScore: 82,
    avgSettlementDays: 8,
    commissionRate: 18.2,
    expectedCommissionRate: 16.5,
    lastSettlement: '2026-06-23',
    status: 'Needs Attention',
  },
  {
    name: 'Blinkit',
    gmv: 1_96_00_000,
    settled: 1_82_40_000,
    outstanding: 8_60_000,
    recovered: 2_64_000,
    inDispute: 2_36_000,
    healthScore: 88,
    avgSettlementDays: 6,
    commissionRate: 15.8,
    expectedCommissionRate: 15.0,
    lastSettlement: '2026-06-24',
    status: 'Healthy',
  },
  {
    name: 'Instamart',
    gmv: 1_68_00_000,
    settled: 1_48_20_000,
    outstanding: 14_80_000,
    recovered: 2_18_000,
    inDispute: 2_82_000,
    healthScore: 64,
    avgSettlementDays: 14,
    commissionRate: 22.4,
    expectedCommissionRate: 18.0,
    lastSettlement: '2026-06-18',
    status: 'Critical',
  },
  {
    name: 'Amazon',
    gmv: 1_42_00_000,
    settled: 1_32_80_000,
    outstanding: 6_20_000,
    recovered: 2_12_000,
    inDispute: 3_88_000,
    healthScore: 91,
    avgSettlementDays: 4,
    commissionRate: 12.8,
    expectedCommissionRate: 12.5,
    lastSettlement: '2026-06-25',
    status: 'Healthy',
  },
  {
    name: 'Flipkart',
    gmv: 1_12_00_000,
    settled: 1_00_42_000,
    outstanding: 6_56_000,
    recovered: 2_08_000,
    inDispute: 12_94_000,
    healthScore: 72,
    avgSettlementDays: 10,
    commissionRate: 16.4,
    expectedCommissionRate: 14.0,
    lastSettlement: '2026-06-22',
    status: 'Needs Attention',
  },
];

// ─── Recoveries ─────────────────────────────────────────────────────

export const b2bRecoveries: Recovery[] = [
  { 
    id: 'R001', platform: 'Zepto', type: 'Commission Overcharge', amount: 142000, status: 'Recovered', identifiedDate: '2026-05-12', resolvedDate: '2026-06-02', 
    description: 'Commission charged at 18.2% vs contracted 16.5% on 340 orders',
    confidence: 99, recommendedAction: 'No Action (Resolved)', assignee: 'kp@nexbit.ai',
    aiReasoning: 'Exact mismatch identified between contracted rate (16.5%) and applied rate (18.2%) across 340 order IDs from May 1-10.',
    evidence: ['Zepto_Agreement_v2.pdf', 'Order_Level_Commission_Extract.csv'],
    relatedDocuments: ['Settlement_May_Zepto.xml'],
    discussion: [
      { id: 'm1', user: 'AI System', text: 'Anomaly detected in commission rates for 340 orders.', time: 'May 12, 10:00 AM' },
      { id: 'm2', user: 'kp@nexbit.ai', text: 'Dispute filed via platform portal with evidence attached.', time: 'May 14, 2:30 PM' }
    ],
    timeline: [
      { id: 't1', date: 'May 12', user: 'System', action: 'Identified Anomaly' },
      { id: 't2', date: 'May 14', user: 'kp@nexbit.ai', action: 'Filed Dispute' },
      { id: 't3', date: 'Jun 02', user: 'Zepto', action: 'Credit Issued' }
    ]
  },
  { 
    id: 'R002', platform: 'Instamart', type: 'Weight Discrepancy', amount: 86000, status: 'In Progress', identifiedDate: '2026-06-08', resolvedDate: null, 
    description: 'Volumetric weight billed 22% higher than actual on 180 shipments',
    confidence: 85, recommendedAction: 'Follow Up', assignee: 'kp@nexbit.ai',
    aiReasoning: 'Warehouse dispatch weights (avg 450g) differ significantly from platform billed weights (avg 550g). Variance is consistent across same SKU.',
    evidence: ['Warehouse_Manifest_Jun_1_7.pdf'],
    relatedDocuments: ['Instamart_Logistics_Bill_W23.pdf'],
    discussion: [
      { id: 'm1', user: 'AI System', text: 'Consistent 100g variance detected on SKU-9921.', time: 'Jun 08, 9:15 AM' }
    ],
    timeline: [
      { id: 't1', date: 'Jun 08', user: 'System', action: 'Identified Anomaly' },
      { id: 't2', date: 'Jun 10', user: 'kp@nexbit.ai', action: 'Raised Dispute' }
    ]
  },
  { 
    id: 'R003', platform: 'Amazon', type: 'Return Not Received', amount: 124000, status: 'Recovered', identifiedDate: '2026-05-18', resolvedDate: '2026-06-10', 
    description: '47 returns marked but products never received back at warehouse',
    confidence: 96, recommendedAction: 'No Action (Resolved)', assignee: null,
    aiReasoning: 'Platform marked returns as "Customer Refunded" but no matching inbound tracking IDs found in warehouse WMS logs after 30 days.',
    evidence: ['WMS_Inbound_Report_May.xlsx'],
    relatedDocuments: ['Amazon_Return_Report_May.csv'],
    discussion: [],
    timeline: [
      { id: 't1', date: 'May 18', user: 'System', action: 'Identified Anomaly' },
      { id: 't2', date: 'May 20', user: 'System', action: 'Auto-Filed Claim' },
      { id: 't3', date: 'Jun 10', user: 'Amazon', action: 'Reimbursed' }
    ]
  },
  { 
    id: 'R004', platform: 'Flipkart', type: 'Short Payment', amount: 68000, status: 'Filed', identifiedDate: '2026-06-15', resolvedDate: null, 
    description: 'Settlement amount ₹68K less than expected for May 21-31 period',
    confidence: 92, recommendedAction: 'Await Platform Response', assignee: 'kp@nexbit.ai',
    aiReasoning: 'Order-level net receivable calculation comes to ₹4.24L, but actual settlement received is ₹3.56L. Gap mapped to missing remittance for 42 specific order IDs.',
    evidence: ['Missing_Orders_List.csv'],
    relatedDocuments: ['Flipkart_Settlement_May21_31.pdf'],
    discussion: [
      { id: 'm1', user: 'AI System', text: 'Short payment of exactly ₹68,000 detected.', time: 'Jun 15, 8:40 AM' },
      { id: 'm2', user: 'kp@nexbit.ai', text: 'Raised ticket #FL-492911 on Seller Portal.', time: 'Jun 16, 11:20 AM' }
    ],
    timeline: [
      { id: 't1', date: 'Jun 15', user: 'System', action: 'Identified Anomaly' },
      { id: 't2', date: 'Jun 16', user: 'kp@nexbit.ai', action: 'Filed Dispute' }
    ]
  },
  { 
    id: 'R005', platform: 'Blinkit', type: 'Promo Deduction Error', amount: 94000, status: 'In Progress', identifiedDate: '2026-06-10', resolvedDate: null, 
    description: 'Brand-funded promo deducted from merchant settlement instead of platform',
    confidence: 88, recommendedAction: 'Escalate to Account Manager', assignee: 'am@nexbit.ai',
    aiReasoning: 'Promo code "SUMMER20" was contracted as platform-funded, but settlement shows line-item deductions under "Merchant Funded Discount".',
    evidence: ['Blinkit_Summer_Promo_Contract.pdf'],
    relatedDocuments: ['Blinkit_Settlement_Jun1_7.xml'],
    discussion: [
      { id: 'm1', user: 'AI System', text: 'Wrong funding source applied to SUMMER20 promo.', time: 'Jun 10, 10:05 AM' }
    ],
    timeline: [
      { id: 't1', date: 'Jun 10', user: 'System', action: 'Identified Anomaly' },
      { id: 't2', date: 'Jun 12', user: 'kp@nexbit.ai', action: 'Raised Dispute' },
      { id: 't3', date: 'Jun 18', user: 'am@nexbit.ai', action: 'Escalated' }
    ]
  },
  { 
    id: 'R006', platform: 'Zepto', type: 'Damaged in Transit', amount: 56000, status: 'Identified', identifiedDate: '2026-06-20', resolvedDate: null, 
    description: '23 units damaged during delivery, not yet credited back',
    confidence: 96, recommendedAction: 'Ready for Dispute', assignee: null,
    aiReasoning: `Platform deducted ₹56,000.
Claimed reason: Damage.
Evidence searched:
• No damage approval found.
• No debit note found.
• No warehouse confirmation found.
Historical average damage for this platform is 0.4%.
Current deduction equals 3.2%.
Confidence: 96%.
Recommendation:
Raise dispute.`,
    evidence: ['Damage_Refund_Report.csv'],
    relatedDocuments: [],
    discussion: [],
    timeline: [
      { id: 't1', date: 'Jun 20', user: 'System', action: 'Identified Anomaly' }
    ]
  }
];

// ─── Recovery summary by type ───────────────────────────────────────

export const b2bRecoveryByType = [
  { type: 'Commission Overcharge', amount: 2_60_000, count: 2, recovered: 1_42_000 },
  { type: 'Weight Discrepancy', amount: 1_20_000, count: 2, recovered: 34_000 },
  { type: 'Return Not Received', amount: 2_02_000, count: 2, recovered: 1_24_000 },
  { type: 'Short Payment', amount: 1_80_000, count: 2, recovered: 0 },
  { type: 'Promo Deduction Error', amount: 2_42_000, count: 2, recovered: 0 },
  { type: 'Damaged in Transit', amount: 56_000, count: 1, recovered: 0 },
  { type: 'TDS Mismatch', amount: 42_000, count: 1, recovered: 0 },
];

// ─── Outstanding ────────────────────────────────────────────────────

export const b2bOutstanding: OutstandingItem[] = [
  { id: 'O001', platform: 'Instamart', orderPeriod: 'Jun 1-10', amount: 6_42_000, expectedDate: '2026-06-24', agingDays: 1, agingBucket: '0-7', risk: 'Medium', reason: 'Settlement delayed — under platform review' },
  { id: 'O002', platform: 'Zepto', orderPeriod: 'Jun 8-15', amount: 4_18_000, expectedDate: '2026-06-27', agingDays: 0, agingBucket: '0-7', risk: 'Low', reason: 'Within normal settlement cycle' },
  { id: 'O003', platform: 'Flipkart', orderPeriod: 'May 25-31', amount: 3_86_000, expectedDate: '2026-06-18', agingDays: 7, agingBucket: '0-7', risk: 'Medium', reason: 'Pending return reconciliation from platform' },
  { id: 'O004', platform: 'Instamart', orderPeriod: 'May 21-31', amount: 5_24_000, expectedDate: '2026-06-14', agingDays: 11, agingBucket: '8-15', risk: 'High', reason: 'Commission dispute holding up settlement' },
  { id: 'O005', platform: 'Zepto', orderPeriod: 'Jun 1-7', amount: 3_82_000, expectedDate: '2026-06-20', agingDays: 5, agingBucket: '0-7', risk: 'Low', reason: 'Normal processing' },
  { id: 'O006', platform: 'Flipkart', orderPeriod: 'May 15-24', amount: 2_70_000, expectedDate: '2026-06-08', agingDays: 17, agingBucket: '16-30', risk: 'High', reason: 'Marketplace system migration delay' },
  { id: 'O007', platform: 'Amazon', orderPeriod: 'Jun 10-17', amount: 3_48_000, expectedDate: '2026-06-28', agingDays: 0, agingBucket: '0-7', risk: 'Low', reason: 'Scheduled for next settlement cycle' },
  { id: 'O008', platform: 'Blinkit', orderPeriod: 'Jun 5-12', amount: 4_12_000, expectedDate: '2026-06-26', agingDays: 0, agingBucket: '0-7', risk: 'Low', reason: 'Within SLA' },
  { id: 'O009', platform: 'Instamart', orderPeriod: 'May 1-10', amount: 3_14_000, expectedDate: '2026-05-24', agingDays: 32, agingBucket: '30+', risk: 'High', reason: 'Escalated to platform account manager' },
  { id: 'O010', platform: 'Amazon', orderPeriod: 'Jun 1-10', amount: 2_72_000, expectedDate: '2026-06-25', agingDays: 0, agingBucket: '0-7', risk: 'Low', reason: 'Normal cycle' },
  { id: 'O011', platform: 'Blinkit', orderPeriod: 'May 28-Jun 4', amount: 4_48_000, expectedDate: '2026-06-22', agingDays: 3, agingBucket: '0-7', risk: 'Low', reason: 'Processing' },
];

// ─── Outstanding aging summary ──────────────────────────────────────

export const b2bOutstandingAging = [
  { bucket: '0-7 days', amount: 26_86_000, count: 7, color: '#22c55e' },
  { bucket: '8-15 days', amount: 5_24_000, count: 1, color: '#f59e42' },
  { bucket: '16-30 days', amount: 2_70_000, count: 1, color: '#ef4444' },
  { bucket: '30+ days', amount: 3_14_000, count: 1, color: '#991b1b' },
];

// ─── Disputes ───────────────────────────────────────────────────────

export const b2bDisputes: Dispute[] = [
  { id: 'D001', platform: 'Flipkart', type: 'Commission Rate', amount: 8_42_000, filedDate: '2026-05-20', status: 'Under Review', daysOpen: 36, description: 'Commission rate applied at 16.4% instead of contracted 14%', aiSuggestion: 'Attach contract amendment from March. Historical data shows 92% win rate on rate disputes with documentation.' },
  { id: 'D002', platform: 'Instamart', type: 'Settlement Shortfall', amount: 5_24_000, filedDate: '2026-06-05', status: 'Open', daysOpen: 20, description: 'May second-half settlement ₹5.24L short vs order-level calculation', aiSuggestion: 'Discrepancy maps to 340 orders where platform deducted return shipping on non-returnable items. File category-wise breakdown.' },
  { id: 'D003', platform: 'Zepto', type: 'Return Abuse', amount: 3_18_000, filedDate: '2026-06-10', status: 'Escalated', daysOpen: 15, description: '23% return rate on category vs 8% benchmark — suspected buyer abuse', aiSuggestion: 'Flag top 12 repeat-return customers. Platform has a fraud review process — request buyer account audit.' },
  { id: 'D004', platform: 'Amazon', type: 'Damaged Goods Credit', amount: 3_88_000, filedDate: '2026-06-01', status: 'Won', daysOpen: 24, description: 'Warehouse damage not credited for 156 units across 3 ASINs', aiSuggestion: 'Credit confirmed. ₹3.88L will appear in next settlement cycle (June 28).' },
  { id: 'D005', platform: 'Blinkit', type: 'Promo Cost Attribution', amount: 2_36_000, filedDate: '2026-06-12', status: 'Open', daysOpen: 13, description: 'Platform-funded flash sale costs deducted from brand settlement', aiSuggestion: 'Promo agreement clearly states platform-funded. Share signed promo brief as evidence.' },
  { id: 'D006', platform: 'Flipkart', type: 'Late Settlement Penalty', amount: 4_52_000, filedDate: '2026-05-28', status: 'Partially Won', daysOpen: 28, description: 'Requested penalty for 18-day settlement delay on April orders', aiSuggestion: 'Platform agreed to waive ₹2.8L in fees but rejected cash penalty. Consider accepting — 62% recovery on penalties is above market avg.' },
  { id: 'D007', platform: 'Instamart', type: 'Commission Tier', amount: 2_82_000, filedDate: '2026-06-08', status: 'Under Review', daysOpen: 17, description: 'Tier not updated after crossing ₹1.5Cr monthly GMV threshold', aiSuggestion: 'Attach GMV proof from platform dashboard. Similar cases resolved in 10-14 days with documentation.' },
];

// ─── Dispute stats ──────────────────────────────────────────────────

export const b2bDisputeStats = {
  totalActive: 6,
  totalAmount: 26_54_000,
  avgResolutionDays: 22,
  winRate: 68,
  wonAmount: 3_88_000,
  partiallyWonAmount: 4_52_000,
};

// ─── Accounting ─────────────────────────────────────────────────────

export const b2bAccounting: AccountingItem[] = [
  { id: 'A001', platform: 'Zepto', type: 'Settlement', bookValue: 42_18_000, platformValue: 42_18_000, difference: 0, status: 'Matched', period: 'Jun 1-15' },
  { id: 'A002', platform: 'Zepto', type: 'Commission', bookValue: 6_86_000, platformValue: 7_24_000, difference: -38_000, status: 'Mismatch', period: 'Jun 1-15' },
  { id: 'A003', platform: 'Blinkit', type: 'Settlement', bookValue: 38_42_000, platformValue: 38_42_000, difference: 0, status: 'Matched', period: 'Jun 1-15' },
  { id: 'A004', platform: 'Blinkit', type: 'TDS', bookValue: 38_420, platformValue: 36_800, difference: 1_620, status: 'Mismatch', period: 'Jun 1-15' },
  { id: 'A005', platform: 'Instamart', type: 'Settlement', bookValue: 28_64_000, platformValue: 26_42_000, difference: 2_22_000, status: 'Mismatch', period: 'Jun 1-15' },
  { id: 'A006', platform: 'Instamart', type: 'GST', bookValue: 4_82_000, platformValue: 4_82_000, difference: 0, status: 'Matched', period: 'Jun 1-15' },
  { id: 'A007', platform: 'Amazon', type: 'Settlement', bookValue: 34_56_000, platformValue: 34_56_000, difference: 0, status: 'Matched', period: 'Jun 1-15' },
  { id: 'A008', platform: 'Amazon', type: 'TCS', bookValue: 34_560, platformValue: 34_560, difference: 0, status: 'Matched', period: 'Jun 1-15' },
  { id: 'A009', platform: 'Flipkart', type: 'Settlement', bookValue: 22_84_000, platformValue: 21_42_000, difference: 1_42_000, status: 'Mismatch', period: 'Jun 1-15' },
  { id: 'A010', platform: 'Flipkart', type: 'Commission', bookValue: 3_64_000, platformValue: 4_12_000, difference: -48_000, status: 'Mismatch', period: 'Jun 1-15' },
  { id: 'A011', platform: 'Zepto', type: 'TDS', bookValue: 42_180, platformValue: 42_180, difference: 0, status: 'Matched', period: 'Jun 1-15' },
  { id: 'A012', platform: 'Amazon', type: 'Commission', bookValue: 4_42_000, platformValue: 4_48_000, difference: -6_000, status: 'Pending Review', period: 'Jun 1-15' },
];

// ─── Accounting summary ─────────────────────────────────────────────

export const b2bAccountingSummary = {
  totalMatched: 8,
  totalMismatched: 4,
  totalMismatchAmount: 4_55_620,
  reconciledPercentage: 94.2,
  pendingReview: 1,
};

// ─── Activity Feed ──────────────────────────────────────────────────

export const b2bActivities: ActivityItem[] = [
  { id: 'ACT01', type: 'ai_insight', title: 'Commission overcharge detected', description: 'Zepto charged 18.2% vs contracted 16.5% on 142 orders this week. Estimated impact: ₹2.4L', platform: 'Zepto', amount: 2_40_000, timestamp: '12 min ago', isNew: true },
  { id: 'ACT02', type: 'settlement', title: 'Settlement received', description: 'Jun 8-15 settlement of ₹18.4L credited to bank account', platform: 'Blinkit', amount: 18_40_000, timestamp: '2 hours ago', isNew: true },
  { id: 'ACT03', type: 'dispute', title: 'Dispute won — credit incoming', description: 'Damaged goods claim for 156 units resolved. ₹3.88L credit in next settlement', platform: 'Amazon', amount: 3_88_000, timestamp: '4 hours ago', isNew: true },
  { id: 'ACT04', type: 'anomaly', title: 'Unusual return spike detected', description: 'Return rate jumped to 23% vs 8% average on personal care category', platform: 'Zepto', amount: null, timestamp: '6 hours ago', isNew: false },
  { id: 'ACT05', type: 'recovery', title: 'Recovery claim filed', description: 'Filed claim for ₹1.48L promo deduction error on monsoon sale', platform: 'Instamart', amount: 1_48_000, timestamp: '8 hours ago', isNew: false },
  { id: 'ACT06', type: 'accounting', title: 'Settlement mismatch flagged', description: 'Jun 1-15 settlement ₹2.22L less than expected. Auto-generated discrepancy report.', platform: 'Instamart', amount: 2_22_000, timestamp: '1 day ago', isNew: false },
  { id: 'ACT07', type: 'settlement', title: 'Settlement received', description: 'Jun 1-10 settlement of ₹34.56L credited', platform: 'Amazon', amount: 34_56_000, timestamp: '1 day ago', isNew: false },
  { id: 'ACT08', type: 'ai_insight', title: 'Payment terms opportunity', description: 'Flipkart settlement averaging 10 days vs contracted 7. Recommend escalation — ₹18L opportunity cost', platform: 'Flipkart', amount: null, timestamp: '1 day ago', isNew: false },
  { id: 'ACT09', type: 'recovery', title: 'Weight discrepancy recovered', description: '₹34K recovered from dead weight overcharge on 96 orders', platform: 'Blinkit', amount: 34_000, timestamp: '2 days ago', isNew: false },
  { id: 'ACT10', type: 'dispute', title: 'Dispute escalated', description: 'Return abuse dispute escalated to platform account manager after 15 days', platform: 'Zepto', amount: 3_18_000, timestamp: '2 days ago', isNew: false },
  { id: 'ACT11', type: 'anomaly', title: 'Commission tier change missed', description: 'Crossed ₹1.5Cr monthly GMV on Instamart but tier not updated. ₹1.18L at risk.', platform: 'Instamart', amount: 1_18_000, timestamp: '3 days ago', isNew: false },
  { id: 'ACT12', type: 'accounting', title: 'TDS reconciliation complete', description: 'Q1 TDS matched across all platforms. 26AS filed.', platform: null, amount: null, timestamp: '3 days ago', isNew: false },
];

// ─── Platform colors ────────────────────────────────────────────────

export const platformColors: Record<PlatformName, string> = {
  Zepto: '#7C3AED',
  Blinkit: '#F5C518',
  Instamart: '#FF6B2C',
  Amazon: '#FF9900',
  Flipkart: '#2874F0',
};

// ─── Homepage Redesign Data ─────────────────────────────────────────

export interface HomeFeedItem {
  id: string;
  platform: PlatformName;
  title: string;
  description: string;
  amount?: number;
  timeAgo: string;
  type: 'alert' | 'success' | 'warning' | 'info';
  actions: ('Review' | 'Accept' | 'Raise Dispute' | 'Ignore')[];
}

export const b2bHomeFeed: HomeFeedItem[] = [
  {
    id: 'HF001',
    platform: 'Zepto',
    title: 'Short Payment Detected',
    description: 'Zepto short paid ₹2.1L yesterday.',
    amount: 210000,
    timeAgo: '2 hours ago',
    type: 'warning',
    actions: ['Review', 'Raise Dispute', 'Ignore'],
  },
  {
    id: 'HF002',
    platform: 'Amazon',
    title: 'Disputes Ready',
    description: 'Three settlements are ready for dispute.',
    timeAgo: '4 hours ago',
    type: 'info',
    actions: ['Review', 'Ignore'],
  },
  {
    id: 'HF003',
    platform: 'Instamart',
    title: 'Repeated Deduction',
    description: 'Instamart repeated a logistics deduction already accepted last month.',
    amount: 45000,
    timeAgo: '5 hours ago',
    type: 'alert',
    actions: ['Raise Dispute', 'Ignore'],
  },
  {
    id: 'HF004',
    platform: 'Blinkit',
    title: 'Payment Received',
    description: 'Blinkit payment received. Expected cash tomorrow ₹42L.',
    amount: 4200000,
    timeAgo: '8 hours ago',
    type: 'success',
    actions: ['Accept', 'Review'],
  }
];

export const b2bHomeKPIs = {
  recoverableToday: 1450000,
  outstandingReceivables: 4856000,
  openDisputes: 6,
  automationRate: 94.2
};

// ─── Inbox Data ─────────────────────────────────────────────────────

export interface InboxDocument {
  id: string;
  filename: string;
  type: string;
  source: 'Email Forward' | 'Drag & Drop' | 'Auto-fetch';
  receivedAt: string;
  status: 'Processed' | 'Needs Review' | 'Processing';
  confidence: number;
  explanation?: string;
  amount?: number;
}

export const b2bInboxStats = {
  detected: [
    { type: 'Purchase Orders', count: 8 },
    { type: 'GRNs', count: 14 },
    { type: 'Invoices', count: 22 },
    { type: 'Settlements', count: 6 },
    { type: 'Bank Statements', count: 1 },
    { type: 'Debit/Credit Notes', count: 4 }
  ],
  matchedRate: 96,
  needsReviewRate: 4
};

export const b2bInboxDocuments: InboxDocument[] = [
  {
    id: 'DOC01',
    filename: 'PO_Zepto_48291.pdf',
    type: 'Purchase Order',
    source: 'Auto-fetch',
    receivedAt: '10 mins ago',
    status: 'Processed',
    confidence: 99,
    amount: 145000
  },
  {
    id: 'DOC02',
    filename: 'Instamart_GRN_Weekly.xlsx',
    type: 'GRN',
    source: 'Email Forward',
    receivedAt: '25 mins ago',
    status: 'Needs Review',
    confidence: 65,
    explanation: 'AI inferred as GRN based on item codes, but warehouse signature is missing.',
  },
  {
    id: 'DOC03',
    filename: 'Amazon_Settlement_Jun24.csv',
    type: 'Settlement',
    source: 'Drag & Drop',
    receivedAt: '1 hour ago',
    status: 'Processed',
    confidence: 100,
    amount: 3456000
  },
  {
    id: 'DOC04',
    filename: 'HDFC_Statement_Jun.pdf',
    type: 'Bank Statement',
    source: 'Email Forward',
    receivedAt: '2 hours ago',
    status: 'Processed',
    confidence: 98,
  },
  {
    id: 'DOC05',
    filename: 'Debit_Note_Blinkit_Shortage.pdf',
    type: 'Debit Note',
    source: 'Drag & Drop',
    receivedAt: '3 hours ago',
    status: 'Needs Review',
    confidence: 72,
    explanation: 'Detected as Debit Note, but the counter-party GSTIN does not match our records.',
    amount: 12500
  }
];
