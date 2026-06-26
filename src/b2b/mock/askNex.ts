// "Ask Nex" canned question/answer pairs. Nex is the Nexbit assistant. Answers
// reference the canonical settlement figures so the demo stays internally consistent.
import type { AskNexQA } from './types';

export const askNexQA: AskNexQA[] = [
  {
    id: 'AN-1',
    question: "Why was Zepto's payout ₹2.1L lower this week?",
    answer:
      'Three drivers. ₹41.2K is a duplicate visibility-fee deduction — flagged and disputable. ₹86K is legitimate Diwali-promo RTV returns. ₹83K is timing: 360 units received Jun 25 settle next cycle. Only the ₹41.2K is recoverable.',
  },
  {
    id: 'AN-2',
    question: "What's our true net realisation on SuperYou Pro?",
    answer:
      "68.4% blended vs the 74% list assumption. Amazon drags it to 64% via weight-band fees; Blinkit sits at 66% after 'Storage Fee v2'. Clearing both lifts blended realisation to ~71%.",
  },
  {
    id: 'AN-3',
    question: 'Which channel leaks the most?',
    answer:
      'Amazon — ₹14.2L this quarter, 37% of total leakage, almost entirely FBA weight-band and fee misclassification on the 1kg powders.',
  },
  {
    id: 'AN-4',
    question: 'How much recovery is about to expire?',
    answer:
      "₹6.8L across 12 disputes hit their platform dispute windows within 10 days. The most urgent is Blinkit's ₹83.4K 'Storage Fee v2', which closes in 11 days.",
  },
];
