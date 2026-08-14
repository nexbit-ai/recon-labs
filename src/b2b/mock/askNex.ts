// Ask Nex Q&A pairs - Cosmix-specific questions about receivables,
// channels, cafes, and reconciliation.
import type { AskNexQA } from './types';

export const askNexQA: AskNexQA[] = [
  {
    id: 'q1',
    question: "Why is Zepto's August payout ₹3.2L short?",
    answer:
      'Zepto owes Cosmix ₹31.2L for the 1–15 Aug period. ₹28L has been received. The ₹3.2L gap breaks down as: (1) Visibility fee deducted twice for the "Aug Launch Push" campaign - ₹1.84L duplicate, confirmed against settlement STL-ZEP-0391. (2) Returns deduction of ₹41,200 on 38 units of Energy Blend that were already credited via RTO claim D-0931 - a double recovery. (3) Platform support excess of ₹46,800 billed at 3.5% vs contracted 2%. Two disputes are ready to file - total recoverable ₹2.25L.',
  },
  {
    id: 'q2',
    question: 'Which cafes have overdue invoices right now?',
    answer:
      '8 cafe accounts have overdue invoices totalling ₹1.20L. The oldest is Third Wave Coffee - their July order (₹48,000) is overdue by 6 days. A 7-day auto-reminder was sent on 10 Aug. Dyu Art Cafe has a disputed invoice (₹20,500) - they report a quantity discrepancy on Skin Magic (received 20 vs ordered 25 units). Hatti Kaapi and 5 other accounts have smaller overdue amounts. Nudge emails have been sent for all accounts past the 7-day mark.',
  },
  {
    id: 'q3',
    question: 'Show me all pending GRNs for Blinkit this week.',
    answer:
      'There is 1 pending GRN for Blinkit this week: PO-BLK-2026-0923 - 120 units of Collagen Boost dispatched on 3 Aug. The Blinkit dark store warehouse has not confirmed GRN acceptance after 10 days. Invoice INV-BLK-0923 (₹96,000) is on hold until GRN is accepted. A 7-day auto-reminder was sent on 10 Aug. Dispatch proof (AWB-BLK-0923) is available for follow-up.',
  },
  {
    id: 'q4',
    question: "What's our net realisation on Reliance this quarter?",
    answer:
      'Reliance net realisation is currently 80.1% - slightly below the 82% target. Total receivable this period is ₹19.8L, of which ₹18L has been received. The ₹1.8L pending breaks down as: (1) Settlement overdue - INV-REL-0112 for ₹2.4L submitted 28 Jul, 45-day credit terms expired 10 Aug. (2) Invoice INV-REL-0087 (₹68,000) missing from Reliance Vendor Portal - needs re-upload. Deduction terms are on-contract: 18% trade margin, listing, shelf, and promo fees all at agreed rates.',
  },
  {
    id: 'q5',
    question: 'What are the top 3 recoverable items right now?',
    answer:
      '(1) Reliance settlement overdue - ₹2.40L. Invoice and GRN both confirmed. 45-day credit terms expired. Escalation email scheduled. (2) Zepto visibility fee duplicate - ₹1.84L. Same fee deducted twice on settlement STL-ZEP-0391. Dispute ready to file. (3) Blinkit debit note DN-0847 - ₹1.52L for transit damages. GRN accepted full quantity with no damage flag. Evidence request sent to warehouse. Total top-3 recoverable: ₹5.76L of the ₹6.80L total.',
  },
];
