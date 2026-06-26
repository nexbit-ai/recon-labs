// Disputes (claims in flight + recovered), pipeline counts, and recoverable
// selectors. Amounts in whole rupees. Statuses carry no colour — views render
// them with labels + weight/border only (see B2B_DESIGN_SYSTEM.md §6).
import type { Dispute, DisputePipeline } from './types';

// The high-value claims (highValue) are surfaced in the Disputes table. The
// remaining active claims keep the "expiring within ~10 days = ₹6.8L" invariant
// that the Overview reads (windowDaysRemaining <= 10 sum to ₹6,80,000, max 9).
export const disputes: Dispute[] = [
  // ── High-value named claims (shown in the Disputes table) ──
  { id: 'D-1041', channel: 'Instamart', reason: 'Short-paid vs GRN-IM-2291', amount: 2_85_200, status: 'Filed', windowDaysRemaining: 18, highValue: true },
  { id: 'D-1042', channel: 'Amazon', reason: 'FBA weight band misclassification', amount: 1_42_000, status: 'Drafted', windowDaysRemaining: 73, highValue: true },
  { id: 'D-1043', channel: 'Blinkit', reason: 'Storage Fee v2 — no contractual basis', amount: 83_400, status: 'Drafted', windowDaysRemaining: 11, urgent: true, highValue: true },
  { id: 'D-1044', channel: 'Flipkart', reason: 'Commission 22% vs 18% contracted', amount: 64_500, status: 'In review', windowDaysRemaining: 22, highValue: true },
  { id: 'D-1045', channel: 'Zepto', reason: 'Duplicate visibility fee (W24)', amount: 41_200, status: 'Recovered', windowDaysRemaining: 0, highValue: true },

  // ── Other active claims expiring within ~10 days (Σ = ₹6,80,000 = ₹6.8L, max 9) ──
  { id: 'D-1051', channel: 'Blinkit', reason: 'Spoilage wrongly charged to brand', amount: 2_05_700, status: 'Drafted', windowDaysRemaining: 5, urgent: true },
  { id: 'D-1052', channel: 'Amazon', reason: 'Lost inventory not reimbursed', amount: 2_12_000, status: 'Filed', windowDaysRemaining: 9 },
  { id: 'D-1053', channel: 'Blinkit', reason: 'Promo funding not credited', amount: 1_54_000, status: 'In review', windowDaysRemaining: 8 },
  { id: 'D-1054', channel: 'Zepto', reason: 'Weight discrepancy on GRN', amount: 1_08_300, status: 'Drafted', windowDaysRemaining: 7 },

  // ── Recovered (recent settlements; subset of Recovered YTD ₹41.2L) ──
  { id: 'D-0977', channel: 'Amazon', reason: 'FBA reimbursement — damaged in FC', amount: 3_84_000, status: 'Recovered', windowDaysRemaining: 0 },
  { id: 'D-0962', channel: 'Flipkart', reason: 'SPF overcharge reversed', amount: 2_16_500, status: 'Recovered', windowDaysRemaining: 0 },
  { id: 'D-0948', channel: 'Blinkit', reason: 'Duplicate handling fee refunded', amount: 1_73_200, status: 'Recovered', windowDaysRemaining: 0 },
  { id: 'D-0931', channel: 'Zepto', reason: 'Ad-recovery double charge reversed', amount: 1_46_000, status: 'Recovered', windowDaysRemaining: 0 },
];

// Pipeline aggregates (the full book, larger than the illustrative array above).
// `recovered` equals recoveredYtdClaimsWon (214); banner reads `drafted` (47).
export const disputePipeline: DisputePipeline = {
  drafted: 47,
  filed: 18,
  inReview: 9,
  recovered: 214,
};

export const disputeAvgTurnaroundDays = 22;

// ── Selectors ────────────────────────────────────────────────────────────────
export const activeDisputes = disputes.filter((d) => d.status !== 'Recovered');
export const recoveredDisputes = disputes.filter((d) => d.status === 'Recovered');
export const expiringSoonDisputes = activeDisputes.filter((d) => d.windowDaysRemaining <= 10);
export const highValueDisputes = disputes.filter((d) => d.highValue);

export const sumAmount = (rows: Dispute[]): number => rows.reduce((t, d) => t + d.amount, 0);
