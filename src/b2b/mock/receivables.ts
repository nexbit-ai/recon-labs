// Disputes (claims in flight + resolved), pipeline counts, follow-up nudges,
// and recoverable selectors for the Cosmix demo.
// 5-stage workflow: Detected → Awaiting documents → Ready to dispute → Disputed → Resolved
import type { Dispute, DisputePipeline, FollowUpNudge } from './types';

export const disputes: Dispute[] = [
  // ── High-value named claims (shown in the Disputes table) ──
  { id: 'D-2001', channel: 'Blinkit', reason: 'Transit damage debit note - no damage evidence in GRN', amount: 1_52_000, status: 'Ready to dispute', windowDaysRemaining: 28, highValue: true },
  { id: 'D-2002', channel: 'Zepto', reason: 'Visibility fee deducted twice for same campaign', amount: 1_84_000, status: 'Detected', windowDaysRemaining: 45, urgent: true, highValue: true },
  { id: 'D-2003', channel: 'Reliance', reason: 'Settlement overdue - 45-day credit term expired', amount: 2_40_000, status: 'Awaiting documents', windowDaysRemaining: 30, highValue: true },
  { id: 'D-2004', channel: 'Cafes – Bangalore', reason: 'Batch of 8 cafes - overdue invoices', amount: 1_20_000, status: 'Detected', windowDaysRemaining: 60, highValue: true },
  { id: 'D-2005', channel: 'Blinkit', reason: 'Commission rate charged at 24% vs contracted 20%', amount: 38_000, status: 'Disputed', windowDaysRemaining: 14, urgent: true, highValue: true },
  { id: 'D-2006', channel: 'Zepto', reason: 'Returns deduction on units already credited via RTO', amount: 41_200, status: 'Ready to dispute', windowDaysRemaining: 22, highValue: true },

  // ── Other active claims expiring within ~10 days (Σ = ₹1,50,000 = ₹1.5L) ──
  { id: 'D-2011', channel: 'Blinkit', reason: 'Dark store placement fee not in rate card', amount: 62_000, status: 'Detected', windowDaysRemaining: 8, urgent: true },
  { id: 'D-2012', channel: 'Zepto', reason: 'Platform support excess - 3.5% vs 2% contracted', amount: 48_000, status: 'Ready to dispute', windowDaysRemaining: 9 },
  { id: 'D-2013', channel: 'Cafes – Bangalore', reason: 'Dyu Art Cafe - disputed invoice amount', amount: 40_000, status: 'Awaiting documents', windowDaysRemaining: 7 },

  // ── Resolved (recent - subset of Recovered YTD ₹8.40L) ──
  { id: 'D-1901', channel: 'Blinkit', reason: 'Handling fee overcharge reversed (May batch)', amount: 2_10_000, status: 'Resolved', windowDaysRemaining: 0 },
  { id: 'D-1902', channel: 'Zepto', reason: 'Duplicate ad-recovery fee refunded', amount: 1_64_000, status: 'Resolved', windowDaysRemaining: 0 },
  { id: 'D-1903', channel: 'Reliance', reason: 'Shelf placement fee credited back', amount: 92_000, status: 'Resolved', windowDaysRemaining: 0 },
  { id: 'D-1904', channel: 'Cafes – Bangalore', reason: 'Third Wave Coffee - overdue payment collected', amount: 74_000, status: 'Resolved', windowDaysRemaining: 0 },
];

// Pipeline aggregates (the full book, larger than the illustrative array above).
export const disputePipeline: DisputePipeline = {
  detected: 6,
  awaitingDocuments: 4,
  readyToDispute: 5,
  disputed: 3,
  resolved: 94,
};

export const disputeAvgTurnaroundDays = 18;

// ── Follow-up Automation / Nudges ────────────────────────────────────────────
export const followUpNudges: FollowUpNudge[] = [
  {
    id: 'N-001',
    channel: 'Blinkit',
    relatedRef: 'PO-BLK-2026-0923',
    nudgeType: '7-day',
    daysSinceIssue: 10,
    message: 'GRN pending for 120 units of Collagen Boost dispatched on 3 Aug - auto-reminder sent to Blinkit warehouse ops',
    status: 'Sent',
    date: '2026-08-10',
  },
  {
    id: 'N-002',
    channel: 'Reliance',
    relatedRef: 'INV-REL-0112',
    nudgeType: '15-day',
    daysSinceIssue: 3,
    message: 'Payment overdue - ₹2.4L settlement from Reliance due 10 Aug. Escalation email queued to Reliance finance contact',
    status: 'Scheduled',
    date: '2026-08-25',
  },
  {
    id: 'N-003',
    channel: 'Cafes – Bangalore',
    relatedRef: 'INV-CAF-0034',
    nudgeType: '7-day',
    daysSinceIssue: 6,
    message: 'Third Wave Coffee - Jul invoice ₹48,000 overdue. 7-day payment reminder sent to finance@thirdwavecoffee.com',
    status: 'Sent',
    date: '2026-08-08',
  },
  {
    id: 'N-004',
    channel: 'Cafes – Bangalore',
    relatedRef: 'INV-CAF-0052',
    nudgeType: '15-day',
    daysSinceIssue: 18,
    message: 'Dyu Art Cafe - Jun invoice ₹32,000 overdue 18 days. Escalation: owner contact notified. Second reminder scheduled.',
    status: 'Sent',
    date: '2026-08-01',
  },
  {
    id: 'N-005',
    channel: 'Zepto',
    relatedRef: 'D-2002',
    nudgeType: '7-day',
    daysSinceIssue: 7,
    message: 'Visibility fee duplicate dispute D-2002 - no response from Zepto ops in 7 days. Auto-escalation to Zepto finance team',
    status: 'Pending',
    date: '2026-08-20',
  },
  {
    id: 'N-006',
    channel: 'Blinkit',
    relatedRef: 'D-2001',
    nudgeType: '7-day',
    daysSinceIssue: 5,
    message: 'Debit note DN-0847 dispute - damage evidence request sent to Blinkit warehouse. 7-day follow-up pending.',
    status: 'Pending',
    date: '2026-08-18',
  },
];

// ── Selectors ────────────────────────────────────────────────────────────────
export const activeDisputes = disputes.filter((d) => d.status !== 'Resolved');
export const resolvedDisputes = disputes.filter((d) => d.status === 'Resolved');
export const expiringSoonDisputes = activeDisputes.filter((d) => d.windowDaysRemaining <= 10);
export const highValueDisputes = disputes.filter((d) => d.highValue);

export const sumAmount = (rows: Dispute[]): number => rows.reduce((t, d) => t + d.amount, 0);
