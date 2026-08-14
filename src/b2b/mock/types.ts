// Shared types for the B2B (Nexbit) mock-data layer - Cosmix demo.
// Frontend-only fixtures - no backend, no fetch. All amounts in whole rupees.

export type ChannelName = 'Blinkit' | 'Zepto' | 'Reliance' | 'Cafes – Bangalore' | 'Amazon' | 'Reliance Retail' | 'Third Wave Coffee' | 'Blue Tokai Coffee' | 'Subko Coffee' | 'Starbucks' | 'Hatti Kaapi';

export interface Channel {
  name: ChannelName;
  /** Marketplace / channel settlement model, shown as context only. */
  model: string;
  connected: boolean;
}

export interface Sku {
  id: string;
  product: string;
  variant: string;
  /** Display name, e.g. "Plant Protein - 250g". */
  label: string;
}

/** Canonical, cross-footed headline numbers. Later views reference these - never redefine. */
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

export type IssueType =
  | 'Pending GRN'
  | 'Short payment'
  | 'Debit note – damages'
  | 'Debit note – returns'
  | 'Visibility fee duplicate'
  | 'Invoice missing'
  | 'Settlement pending'
  | 'Rate variance'
  | 'Overdue';

export type Confidence = 'High' | 'Med' | 'Low';

export interface FlaggedIssue {
  id: string;
  channel: ChannelName;
  title: string;
  detail: string;
  amount: number;
  type: IssueType;
  confidence: Confidence;
  poNumber?: string;
}

export type GRNStatus = 'Accepted' | 'Pending' | 'Partial' | 'Missing';

export type ReconStatus = 'Matched' | 'Pending GRN' | 'Short paid' | 'Over-deducted' | 'Disputed' | 'Missing invoice';

export interface VariancePart {
  label: string;
  /** Signed rupee effect on payout. Negative = reduced payout (underpayment). */
  amount: number;
  /** Plain-language reason this component arose. */
  why: string;
}

/** Three-way matching status for a reconciliation line item. */
export interface ThreeWayMatch {
  po: { ref: string; status: 'Matched' | 'Pending' | 'Missing' | 'Disputed'; amount: number };
  grn: { ref: string; status: 'Matched' | 'Pending' | 'Missing' | 'Disputed'; amount: number; unitsAccepted: number; unitsOrdered: number };
  invoice: { ref: string; status: 'Matched' | 'Pending' | 'Missing' | 'Disputed'; amount: number };
}

export interface ReconLineItem {
  id: string;
  channel: ChannelName;
  skuId: string;
  skuLabel: string;
  /** PO reference number. */
  poNumber: string;
  /** Invoice reference number. */
  invoiceNumber: string;
  /** GRN reference number. */
  grn: string;
  grnStatus: GRNStatus;
  /** Sale period label, e.g. "1–15 Aug 2026". */
  salePeriod: string;
  /** Expected payout date, e.g. "10 Aug 2026". */
  expectedPayoutDate: string;
  expected: number;
  paid: number;
  variance: number; // gap = expected - paid (positive = underpaid)
  status: ReconStatus;
  issueType?: IssueType;
  /** "How this matched" note - references the matching policy. */
  matchNote: string;
  /** Always three parts: Quantity, Deduction, Tax / TCS. Σ(amount) = paid - expected. */
  varianceBreakdown: VariancePart[];
  /** PO vs GRN vs Invoice three-way matching detail. */
  threeWayMatch: ThreeWayMatch;
  /** What exact next action is needed to resolve this issue. */
  nextAction?: string;
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

// ── Cosmix 5-stage dispute workflow ──────────────────────────────────────────
export type DisputeStatus = 'Detected' | 'Awaiting documents' | 'Ready to dispute' | 'Disputed' | 'Resolved';

export interface Dispute {
  id: string;
  channel: ChannelName;
  reason: string;
  amount: number;
  status: DisputeStatus;
  /** Dispute-window days remaining; 0 once resolved/closed. */
  windowDaysRemaining: number;
  /** Nearest-deadline claims that need attention. */
  urgent?: boolean;
  /** Surfaced in the high-value claims table. */
  highValue?: boolean;
  /** Related line items for this dispute. */
  lineItems?: ReconLineItem[];
}

/** Aggregate counts across the dispute pipeline (more than the illustrative array). */
export interface DisputePipeline {
  detected: number;
  awaitingDocuments: number;
  readyToDispute: number;
  disputed: number;
  resolved: number;
}

// ── Follow-up automation / nudge system ──────────────────────────────────────
export type NudgeType = '7-day' | '15-day';
export type NudgeStatus = 'Sent' | 'Pending' | 'Scheduled';

export interface FollowUpNudge {
  id: string;
  channel: ChannelName;
  /** Reference to the related receivable / dispute / PO. */
  relatedRef: string;
  nudgeType: NudgeType;
  daysSinceIssue: number;
  message: string;
  status: NudgeStatus;
  /** ISO date when nudge was sent or is scheduled. */
  date: string;
  /** Timeline of events for this nudge. */
  history: { date: string; action: string; status: NudgeStatus }[];
}

// ── Rate card & contract types ───────────────────────────────────────────────
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
  /** Channel settlement model, e.g. "Quick-commerce (SOR)". */
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
 * A secondary (promotional) discount a channel runs on specific SKUs for a
 * bounded date window - e.g. Blinkit marks down three SKUs in week 1 of the
 * month. The brand co-funds it. Recon needs this declared so the settlement
 * deduction reconciles instead of flagging as unexplained variance.
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
  /** Units sold on these SKUs during the window - drives the impact math. */
  unitsInWindow: number;
  /** Avg selling price (₹/unit) - used to cost a percent discount. */
  avgSellingPrice: number;
}

// ── Email ingestion types (cafe workflow) ────────────────────────────────────
export type ExtractionConfidence = 'High' | 'Medium' | 'Low';

export interface ExtractedLineItem {
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface EmailIngestRecord {
  id: string;
  /** Cafe account name. */
  cafeAccount: string;
  /** Sender email address. */
  senderEmail: string;
  subject: string;
  /** ISO date received. */
  receivedDate: string;
  /** Email body snippet. */
  bodySnippet: string;
  /** Attachment filenames. */
  attachments: string[];
  /** Extracted order/invoice data from attachment or body. */
  extractedItems: ExtractedLineItem[];
  totalExtracted: number;
  extractionConfidence: ExtractionConfidence;
  /** Whether this has been mapped to a receivable. */
  mapped: boolean;
  /** Resulting receivable ID if mapped. */
  receivableId?: string;
  /** Note from the AI extraction. */
  extractionNote?: string;
}

// ── Channel drilldown types ─────────────────────────────────────────────────
export interface DeductionBreakdownLine {
  label: string;
  contracted: string;
  actual: number;
  expected: number;
  variance: number;
}

export interface ChannelDrilldownData {
  channel: ChannelName;
  model: string;
  contractRef: string;
  payoutLogic: string;
  salesInPeriod: number;
  grossDeductions: number;
  expectedReceivable: number;
  receivedAmount: number;
  pendingBalance: number;
  deductionBreakdown: DeductionBreakdownLine[];
  issueFlags: { type: IssueType; count: number; amount: number }[];
  upcomingPayouts: { date: string; amount: number; status: 'Expected' | 'Overdue' | 'Partial' }[];
}

export interface AskNexQA {
  id: string;
  question: string;
  answer: string;
}
