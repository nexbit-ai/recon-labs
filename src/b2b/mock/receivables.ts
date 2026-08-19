// Disputes (claims in flight + resolved), pipeline counts, follow-up nudges,
// and recoverable selectors for the Cosmix demo.
// 5-stage workflow: Detected → Awaiting documents → Ready to dispute → Disputed → Resolved
import type { Dispute, DisputePipeline, FollowUpNudge } from './types';
import { reconLineItems } from './settlements';

export const disputes: Dispute[] = [
  // ── High-value named claims (shown in the Disputes table) ──
  { id: 'D-2001', channel: 'Blinkit', reason: 'Transit damage debit note - no damage evidence in GRN', amount: 1_52_000, status: 'Ready to dispute', windowDaysRemaining: 8, highValue: true, lineItems: reconLineItems.filter(li => li.id === 'RC-0847') },

  // ── Resolved (recent - subset of Recovered YTD ₹8.40L) ──
  { id: 'D-1901', channel: 'Blinkit', reason: 'Handling fee overcharge reversed (May batch)', amount: 2_10_000, status: 'Resolved', windowDaysRemaining: 0 },
  { id: 'D-1902', channel: 'Zepto', reason: 'Duplicate ad-recovery fee refunded', amount: 1_64_000, status: 'Resolved', windowDaysRemaining: 0 },
  { id: 'D-1903', channel: 'Reliance', reason: 'Shelf placement fee credited back', amount: 92_000, status: 'Resolved', windowDaysRemaining: 0 },
  { id: 'D-1904', channel: 'Cafes – Bangalore', reason: 'Third Wave Coffee - overdue payment collected', amount: 74_000, status: 'Resolved', windowDaysRemaining: 0 },
];

// Pipeline aggregates (the full book, larger than the illustrative array above).
export const disputePipeline: DisputePipeline = {
  detected: 0,
  awaitingDocuments: 0,
  readyToDispute: 1,
  disputed: 0,
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
    history: [
      { date: '2026-08-03', action: 'PO dispatched, AWB generated', status: 'Sent' },
      { date: '2026-08-10', action: '7-day GRN SLA breached, auto-reminder sent', status: 'Sent' }
    ]
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
    history: [
      { date: '2026-08-10', action: '45-day credit term expired', status: 'Sent' },
      { date: '2026-08-13', action: 'Auto-identified as overdue in recon run', status: 'Sent' },
      { date: '2026-08-25', action: 'Queue 15-day escalation to Reliance finance', status: 'Scheduled' }
    ]
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
    history: [
      { date: '2026-08-01', action: 'Invoice generated, 7-day payment term started', status: 'Sent' },
      { date: '2026-08-08', action: 'Payment overdue, 7-day reminder sent', status: 'Sent' }
    ]
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
    history: [
      { date: '2026-07-15', action: 'Payment overdue, 7-day reminder sent', status: 'Sent' },
      { date: '2026-08-01', action: 'Owner contact notified via escalation', status: 'Sent' }
    ]
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
    history: [
      { date: '2026-08-13', action: 'Dispute D-2002 raised for duplicate visibility fee', status: 'Sent' },
      { date: '2026-08-20', action: 'Pending escalation to Zepto finance team', status: 'Pending' }
    ]
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
    history: [
      { date: '2026-08-11', action: 'Requested damage evidence photos from warehouse', status: 'Sent' },
      { date: '2026-08-18', action: '7-day follow-up reminder pending', status: 'Pending' }
    ]
  },
];

// ── Selectors ────────────────────────────────────────────────────────────────
export const activeDisputes = disputes.filter((d) => d.status !== 'Resolved');
export const resolvedDisputes = disputes.filter((d) => d.status === 'Resolved');
export const expiringSoonDisputes = activeDisputes.filter((d) => d.windowDaysRemaining <= 10);
export const highValueDisputes = disputes.filter((d) => d.highValue);

export const sumAmount = (rows: Dispute[]): number => rows.reduce((t, d) => t + d.amount, 0);
