// Disputes (claims in flight + recovered) and recoverable selectors.
// Amounts in whole rupees. Statuses carry no colour — views render them with
// labels + weight/border only (see B2B_DESIGN_SYSTEM.md §6 status indicator).
import type { Dispute } from './types';

// Each active dispute traces back to a flagged issue or reconciliation variance.
// Disputes with windowDaysRemaining <= 10 sum to ₹6.8L (the "expiring soon" headline).
export const disputes: Dispute[] = [
  // ── Expiring within ~10 days (Σ = ₹6,80,000 = ₹6.8L) ──
  { id: 'DSP-1039', channel: 'Instamart', reason: 'Short-paid against GRN-IM-2291', amount: 2_85_200, status: 'In review', windowDaysRemaining: 9 },
  { id: 'DSP-1051', channel: 'Blinkit', reason: 'Spoilage wrongly charged to brand', amount: 2_05_700, status: 'Drafted', windowDaysRemaining: 5 },
  { id: 'DSP-1042', channel: 'Blinkit', reason: "'Storage Fee v2' not in rate card", amount: 83_400, status: 'Filed', windowDaysRemaining: 8 },
  { id: 'DSP-1031', channel: 'Flipkart', reason: 'Commission 22% vs 18% contracted', amount: 64_500, status: 'Filed', windowDaysRemaining: 6 },
  { id: 'DSP-1024', channel: 'Zepto', reason: 'Visibility fee deducted twice (W24)', amount: 41_200, status: 'In review', windowDaysRemaining: 7 },

  // ── Active, longer window (> 10 days) ──
  { id: 'DSP-1036', channel: 'Amazon', reason: 'FBA weight band misclassified', amount: 1_42_000, status: 'Drafted', windowDaysRemaining: 21 },
  { id: 'DSP-1028', channel: 'Amazon', reason: 'Lost inventory not reimbursed', amount: 2_12_000, status: 'Filed', windowDaysRemaining: 18 },
  { id: 'DSP-1019', channel: 'Blinkit', reason: 'Promo funding not credited', amount: 1_54_000, status: 'In review', windowDaysRemaining: 14 },

  // ── Recovered (recent settlements; subset of Recovered YTD ₹41.2L) ──
  { id: 'DSP-0977', channel: 'Amazon', reason: 'FBA reimbursement — damaged in FC', amount: 3_84_000, status: 'Recovered', windowDaysRemaining: 0 },
  { id: 'DSP-0962', channel: 'Flipkart', reason: 'SPF overcharge reversed', amount: 2_16_500, status: 'Recovered', windowDaysRemaining: 0 },
  { id: 'DSP-0948', channel: 'Blinkit', reason: 'Duplicate handling fee refunded', amount: 1_73_200, status: 'Recovered', windowDaysRemaining: 0 },
  { id: 'DSP-0931', channel: 'Zepto', reason: 'Ad-recovery double charge reversed', amount: 1_46_000, status: 'Recovered', windowDaysRemaining: 0 },
];

// ── Selectors ────────────────────────────────────────────────────────────────
export const activeDisputes = disputes.filter((d) => d.status !== 'Recovered');
export const recoveredDisputes = disputes.filter((d) => d.status === 'Recovered');
export const expiringSoonDisputes = activeDisputes.filter((d) => d.windowDaysRemaining <= 10);

export const sumAmount = (rows: Dispute[]): number => rows.reduce((t, d) => t + d.amount, 0);
