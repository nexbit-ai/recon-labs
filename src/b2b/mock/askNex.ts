// "Ask Nex" canned question/answer pairs. Nex is the Nexbit assistant. Answers
// reference the canonical settlement figures so the demo stays internally consistent.
import type { AskNexQA } from './types';

export const askNexQA: AskNexQA[] = [
  {
    id: 'AN-1',
    question: "how much is outstanding for client A",
    answer:
      "Client A currently has an outstanding balance of ₹4.2L, of which ₹1.5L is overdue by 15 days.",
  },
  {
    id: 'AN-2',
    question: "show ageing of outstanding balance for all clients for last month",
    answer:
      "For the last month, the total outstanding balance is ₹18.5L. Breakdown: 0-30 days: ₹12.0L | 31-60 days: ₹4.5L | 61-90 days: ₹2.0L.",
  },
];
