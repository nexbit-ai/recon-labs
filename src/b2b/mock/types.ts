// Shared types for the B2B (Nexbit) mock-data layer.
// Frontend-only fixtures — no backend, no fetch. All amounts in whole rupees.

export type ChannelName = 'Amazon' | 'Flipkart' | 'Blinkit' | 'Zepto' | 'Instamart' | 'Offline Stores';

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

export type IssueType = 'Contract breach' | 'Short payment' | 'Overcharge' | 'Rate variance' | 'Duplicate' | 'Overdue' | 'Pending' | 'Partial Pay' | 'In Term';
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

export interface ReconPurchaseOrder {
  id: string; // e.g., 'PO-ZEP-1049'
  channel: ChannelName;
  date: string;
  expected: number; // Sum of expected across line items
  paid: number; // Sum of paid across line items
  variance: number; // expected - paid
  status: ReconStatus;
  lineItems: ReconLineItem[];
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
  /** Contracted basis / value, e.g. "16% of GMV" or "₹18 / order". */
  contracted: string;
  authorised: boolean;
  /** Short note for an unauthorised line, e.g. "no signed basis". */
  note?: string;
}

/** One channel's full signed contract: the rate card plus its provenance. */
export interface ChannelContract {
  channel: ChannelName;
  /** Marketplace settlement model, e.g. "Quick-commerce (SOR)". */
  model: string;
  contractRef: string;
  effective: string;
  /** How Nex assembled the rate card, e.g. "Agreement + 3 email amendments". */
  source: string;
  rateCard: RateCardLine[];
}

export type DiscountType = 'percent' | 'perUnit';
export type DiscountStatus = 'Active' | 'Scheduled' | 'Ended';

/**
 * A secondary (promotional) discount a marketplace runs on specific SKUs for a
 * bounded date window — e.g. Blinkit marks down three SKUs in week 1 of the
 * month. The brand co-funds it. Recon needs this declared so the settlement
 * deduction reconciles instead of flagging as unexplained variance: the
 * "expected amount to receive" is lowered by the brand-funded promo cost for
 * exactly this window and SKU set.
 */
export interface SecondaryDiscount {
  id: string;
  channel: ChannelName;
  /** Human name of the promo, e.g. "Month-Start Blitz". */
  name: string;
  /** SKUs the discount applies to (ids into `skus`). */
  skuIds: string[];
  discountType: DiscountType;
  /** Percent off (percent) or ₹ off per unit (perUnit). */
  discountValue: number;
  /** Share of the markdown the brand funds, 0–100. Rest is platform-funded. */
  brandFundedPct: number;
  /** ISO date 'YYYY-MM-DD', inclusive. */
  startDate: string;
  endDate: string;
  /** Units sold on these SKUs during the window — drives the impact math. */
  unitsInWindow: number;
  /** Avg selling price (₹/unit) — used to cost a percent discount. */
  avgSellingPrice: number;
}

export interface AskNexQA {
  id: string;
  question: string;
  answer: string;
}
