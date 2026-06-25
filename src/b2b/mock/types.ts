// Shared types for the B2B (Nexbit) mock-data layer.
// Frontend-only fixtures — no backend, no fetch. All amounts in whole rupees.

export type ChannelName = 'Amazon' | 'Flipkart' | 'Blinkit' | 'Zepto' | 'Instamart';

export interface Channel {
  name: ChannelName;
  /** Marketplace settlement model, shown as context only. */
  model: string;
  connected: boolean;
}

export interface Sku {
  id: string;
  product: string;
  variant: string;
  /** Display name, e.g. "Protein Wafer 6-pack — Choco". */
  label: string;
}

/** Canonical, cross-footed headline numbers. Later views reference these — never redefine. */
export interface HeadlineMetric {
  key: string;
  label: string;
  /** Raw value in rupees (or percent for ratio metrics). */
  value: number;
  /** Pre-formatted display string matching the design spec. */
  display: string;
  unit: 'inr' | 'percent';
}

export interface ChannelPerformance {
  channel: ChannelName;
  settled: number; // rupees settled this quarter
  leakage: number; // rupees of leakage detected
  netRealisationPct: number; // true net realisation %
  recoverable: number; // rupees recoverable now
}

export type IssueType = 'Contract breach' | 'Short payment' | 'Overcharge' | 'Rate variance' | 'Duplicate';
export type Confidence = 'High' | 'Med' | 'Low';

export interface FlaggedIssue {
  id: string;
  channel: ChannelName;
  title: string;
  detail: string;
  amount: number;
  type: IssueType;
  confidence: Confidence;
}

export type ReconStatus = 'Matched' | 'Unpaid' | 'Over-deducted' | 'Rate variance' | 'Disputed';

export interface VariancePart {
  label: string;
  /** Signed rupee effect on payout. Negative = reduced payout (underpayment). */
  amount: number;
  /** Plain-language reason this component arose. */
  why: string;
}

export interface ReconLineItem {
  id: string;
  channel: ChannelName;
  skuId: string;
  skuLabel: string;
  ref: string; // GRN / settlement reference
  expected: number;
  paid: number;
  variance: number; // gap = expected - paid (positive = underpaid)
  status: ReconStatus;
  /** "How this matched" note — references the matching policy. */
  matchNote: string;
  /** Always three parts: Quantity, Deduction, Tax / TCS. Σ(amount) = paid - expected. */
  varianceBreakdown: VariancePart[];
}

export type DisputeStatus = 'Drafted' | 'Filed' | 'In review' | 'Recovered';

export interface Dispute {
  id: string;
  channel: ChannelName;
  reason: string;
  amount: number;
  status: DisputeStatus;
  /** Dispute-window days remaining; 0 once recovered/closed. */
  windowDaysRemaining: number;
  /** Nearest-deadline claims that need attention. */
  urgent?: boolean;
  /** Surfaced in the high-value claims table. */
  highValue?: boolean;
}

/** Aggregate counts across the dispute pipeline (more than the illustrative array). */
export interface DisputePipeline {
  drafted: number;
  filed: number;
  inReview: number;
  recovered: number;
}

export interface RateCardLine {
  code: string;
  label: string;
  /** Contracted basis, e.g. "8% of GMV" or "₹14 / unit". */
  contracted: string;
  authorised: boolean;
}

export interface AskNexQA {
  id: string;
  question: string;
  answer: string;
}
