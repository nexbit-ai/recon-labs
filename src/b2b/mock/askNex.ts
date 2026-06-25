// "Ask Nex" canned question/answer pairs. Nex is the Nexbit assistant. Answers
// reference the canonical headline figures so the demo stays internally consistent.
import type { AskNexQA } from './types';

export const askNexQA: AskNexQA[] = [
  {
    id: 'AN-1',
    question: 'How much can I recover right now?',
    answer:
      '₹22.4L is recoverable across all 5 channels. ₹6.8L of that expires within ~10 days — Instamart GRN-IM-2291 (₹2.85L) and the Blinkit spoilage claim (₹2.06L) are the largest time-critical items.',
  },
  {
    id: 'AN-2',
    question: 'Why is my net realisation below plan?',
    answer:
      'True net realisation is 71.3% against your 74% assumption. The 2.7pt gap is driven by Amazon (64%) — FBA weight-band misclassification and unreimbursed losses — and Blinkit (66%), where an uncontracted "Storage Fee v2" is being applied.',
  },
  {
    id: 'AN-3',
    question: "What's the Blinkit Storage Fee v2 issue?",
    answer:
      "'Storage Fee v2' has been deducted on 38 SKUs since Jun 14 with no line in your signed rate card (BLK-SUPERYOU-FY26). Exposure is ₹83,400 this quarter and it is filed as dispute DSP-1042 — contract breach, high confidence.",
  },
  {
    id: 'AN-4',
    question: 'Which channel is leaking the most?',
    answer:
      'Of ₹38.6L total leakage this quarter, Amazon leads at ₹14.2L, followed by Blinkit (₹8.3L) and Flipkart (₹6.1L). Amazon also carries the lowest net realisation at 64%.',
  },
];
