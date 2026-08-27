import type {
  HeadlineMetric,
  ChannelPerformance,
  UpcomingPayout,
  TrendDataPoint,
} from './types';

// ── HEADLINE METRICS ────────────────────────────────────────────────────────
// Single source of truth for the dashboard hero numbers.
// Cross-foot: Received (95,04,000) + Unsettled (2,48,000) = Expected Payout (97,52,000)
// Wrong Deductions (1,52,000) is a subset of Unsettled — deductions we believe are incorrect.
export const headline: HeadlineMetric[] = [
  { key: 'invoiceRaised',   label: 'Total Invoice Raised',    value: 1_00_00_000, display: '₹1.00 Cr',  unit: 'inr' },
  { key: 'poGenerated',     label: 'Total PO Generated',      value: 1_30_00_000, display: '₹1.30 Cr',  unit: 'inr' },
  { key: 'expectedPayout',  label: 'Total Expected Payout',   value: 80_01_000,   display: '₹80.01L',   unit: 'inr' },
  { key: 'received',        label: 'Total Received',          value: 76_01_000,   display: '₹76.01L',   unit: 'inr' },
  { key: 'unsettled',       label: 'Unsettled',               value: 2_48_000,    display: '₹2.48L',    unit: 'inr' },
  { key: 'wrongDeductions', label: 'Wrong Deductions',        value: 1_52_000,    display: '₹1.52L',    unit: 'inr' },
  // Legacy keys kept for backward compat with action pipeline etc.
  { key: 'expected',        label: 'Total Expected',          value: 1_00_00_000, display: '₹1.00 Cr',  unit: 'inr' },
  { key: 'unresolved',      label: 'Total Unresolved',        value: 2_48_000,    display: '₹2.48L',    unit: 'inr' },
  { key: 'recoveredYtd',    label: 'Recovered YTD',           value: 8_40_000,    display: '₹8.40L',    unit: 'inr' },
];

export const headlineByKey = (key: string): HeadlineMetric =>
  headline.find((m) => m.key === key)!;

export const recoveredYtdClaimsWon = 94;

// ── PER-CHANNEL PERFORMANCE ─────────────────────────────────────────────────
// Wrong deductions on Blinkit:
//   ISS-001: Excess commission (22% vs 20%) = ₹59,000
//   ISS-002: Unauthorized cold storage      = ₹49,560
//   ISS-003: Debit note without evidence    = ₹43,440
//   Total = ₹1,52,000
// All other channels have 0 wrong deductions.
export const channelPerformance: ChannelPerformance[] = [
  { channel: 'Blinkit',           invoiceRaised: 35_80_000, poGenerated: 45_00_000, expectedPayout: 27_57_000, received: 23_57_000, unsettled: 2_48_000, wrongDeductions: 1_52_000, expected: 35_80_000, unresolved: 2_48_000, netRealisationPct: 91.0 },
  { channel: 'Zepto',             invoiceRaised: 31_20_000, poGenerated: 40_00_000, expectedPayout: 23_40_000, received: 23_40_000, unsettled: 0,        wrongDeductions: 0,        expected: 31_20_000, unresolved: 0,        netRealisationPct: 100.0 },
  { channel: 'Reliance Retail',   invoiceRaised: 19_80_000, poGenerated: 25_00_000, expectedPayout: 15_84_000, received: 15_84_000, unsettled: 0,        wrongDeductions: 0,        expected: 19_80_000, unresolved: 0,        netRealisationPct: 100.0 },
  { channel: 'Cafes – Bangalore', invoiceRaised: 13_20_000, poGenerated: 20_00_000, expectedPayout: 13_20_000, received: 13_20_000, unsettled: 0,        wrongDeductions: 0,        expected: 13_20_000, unresolved: 0,        netRealisationPct: 100.0 },
];

export const totalExpected = channelPerformance.reduce((t, c) => t + c.invoiceRaised, 0);
export const totalReceived = channelPerformance.reduce((t, c) => t + c.received, 0);
export const pctReceivedOverall = (totalReceived / totalExpected) * 100;

// ── TREND DATA ──────────────────────────────────────────────────────────────
export const trendData: TrendDataPoint[] = [
  { month: 'Mar 2026', expectedLakhs: 65.60, receivedLakhs: 64.10, gapLakhs: 1.50 },
  { month: 'Apr 2026', expectedLakhs: 70.40, receivedLakhs: 69.20, gapLakhs: 1.20 },
  { month: 'May 2026', expectedLakhs: 68.00, receivedLakhs: 67.20, gapLakhs: 0.80 },
  { month: 'Jun 2026', expectedLakhs: 76.00, receivedLakhs: 73.80, gapLakhs: 2.20 },
  { month: 'Jul 2026', expectedLakhs: 73.60, receivedLakhs: 72.10, gapLakhs: 1.50 },
  { month: 'Aug 2026', expectedLakhs: 80.01, receivedLakhs: 76.01, gapLakhs: 4.00 },
];

// ── UPCOMING EXPECTED PAYOUTS ───────────────────────────────────────────────
export const upcomingPayouts: UpcomingPayout[] = [
  { channel: 'Zepto', date: '19 Aug 2026', amount: 3_90_000, status: 'Expected' },
  { channel: 'Blinkit', date: '21 Aug 2026', amount: 4_80_000, status: 'Expected' },
  { channel: 'Reliance', date: '28 Aug 2026', amount: 1_85_000, status: 'Expected' },
  { channel: 'Cafes – Bangalore', date: '23 Aug 2026', amount: 1_40_000, status: 'Partial' },
];
