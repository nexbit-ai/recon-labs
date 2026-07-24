// Disputes (claims in flight + recovered), pipeline counts, and recoverable
// selectors. Amounts in whole rupees. Statuses carry no colour — views render
// them with labels + weight/border only (see B2B_DESIGN_SYSTEM.md §6).
import type { Dispute, DisputePipeline } from './types';

// The high-value claims (highValue) are surfaced in the Disputes table. The
// remaining active claims keep the "expiring within ~10 days = ₹1.4L" invariant
// that the Overview reads (windowDaysRemaining <= 10 sum to ₹1,40,000, max 9).
export const disputes: Dispute[] = [
  // ── High-value named claims (shown in the Disputes table) ──
  { id: 'D-1041', channel: 'Instamart', reason: 'Short-paid vs GRN (Thaw rejection)', amount: 85_200, status: 'Filed', windowDaysRemaining: 18, highValue: true },
  { id: 'D-1042', channel: 'Blinkit', reason: 'Spoilage incorrectly charged to brand', amount: 1_12_400, status: 'Drafted', windowDaysRemaining: 73, highValue: true },
  { id: 'D-1043', channel: 'Zepto', reason: 'Visibility fee deducted twice', amount: 41_200, status: 'Drafted', windowDaysRemaining: 11, urgent: true, highValue: true },
  { id: 'D-1044', channel: 'Offline Stores', reason: 'Promotional Endcap mismatch', amount: 18_500, status: 'In review', windowDaysRemaining: 22, highValue: true },
  { id: 'D-1045', channel: 'Amazon', reason: 'FBA dry-ice surcharge error', amount: 32_000, status: 'Recovered', windowDaysRemaining: 0, highValue: true },

  // ── Other active claims expiring within ~10 days (Σ = ₹1,40,000 = ₹1.4L, max 9) ──
  { id: 'D-1051', channel: 'Blinkit', reason: 'Cold chain penalty disputed', amount: 55_000, status: 'Drafted', windowDaysRemaining: 5, urgent: true },
  { id: 'D-1052', channel: 'Zepto', reason: 'Weight discrepancy on GRN', amount: 45_000, status: 'Filed', windowDaysRemaining: 9 },
  { id: 'D-1053', channel: 'Instamart', reason: 'Promo funding not credited', amount: 40_000, status: 'In review', windowDaysRemaining: 8 },

  // ── Recovered (recent settlements; subset of Recovered YTD ₹7.80L) ──
  { id: 'D-0977', channel: 'Amazon', reason: 'Lost inventory reimbursed', amount: 1_84_000, status: 'Recovered', windowDaysRemaining: 0 },
  { id: 'D-0962', channel: 'Offline Stores', reason: 'Display fee overcharge reversed', amount: 1_16_500, status: 'Recovered', windowDaysRemaining: 0 },
  { id: 'D-0948', channel: 'Blinkit', reason: 'Duplicate placement fee refunded', amount: 73_200, status: 'Recovered', windowDaysRemaining: 0 },
  { id: 'D-0931', channel: 'Zepto', reason: 'Ad-recovery double charge reversed', amount: 46_000, status: 'Recovered', windowDaysRemaining: 0 },
];

// Pipeline aggregates (the full book, larger than the illustrative array above).
// `recovered` equals recoveredYtdClaimsWon (82); banner reads `drafted` (14).
export const disputePipeline: DisputePipeline = {
  drafted: 14,
  filed: 8,
  inReview: 3,
  recovered: 82,
};

export const disputeAvgTurnaroundDays = 22;

// ── Selectors ────────────────────────────────────────────────────────────────
export const activeDisputes = disputes.filter((d) => d.status !== 'Recovered');
export const recoveredDisputes = disputes.filter((d) => d.status === 'Recovered');
export const expiringSoonDisputes = activeDisputes.filter((d) => d.windowDaysRemaining <= 10);
export const highValueDisputes = disputes.filter((d) => d.highValue);

export const sumAmount = (rows: Dispute[]): number => rows.reduce((t, d) => t + d.amount, 0);

