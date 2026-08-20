import type {
  HeadlineMetric,
  ChannelPerformance,
  UpcomingPayout,
  TrendDataPoint,
} from './types';

// ── HEADLINE METRICS ────────────────────────────────────────────────────────
// Single source of truth for the dashboard hero numbers.
export const headline: HeadlineMetric[] = [
  { key: 'expected', label: 'Total Expected', value: 1_00_00_000, display: '₹1.00 Cr', unit: 'inr' },
  { key: 'received', label: 'Total Received', value: 97_52_000, display: '₹97.52L', unit: 'inr' },
  { key: 'unresolved', label: 'Total Unresolved', value: 2_48_000, display: '₹2.48L', unit: 'inr' },
  { key: 'recoveredYtd', label: 'Recovered YTD', value: 8_40_000, display: '₹8.40L', unit: 'inr' },
];

export const headlineByKey = (key: string): HeadlineMetric =>
  headline.find((m) => m.key === key)!;

export const recoveredYtdClaimsWon = 94;

// ── PER-CHANNEL PERFORMANCE ─────────────────────────────────────────────────
export const channelPerformance: ChannelPerformance[] = [
  { channel: 'Blinkit',            expected: 35_80_000, received: 33_32_000, unresolved: 2_48_000, netRealisationPct: 93.1 },
  { channel: 'Zepto',              expected: 31_20_000, received: 31_20_000, unresolved: 0,        netRealisationPct: 100.0 },
  { channel: 'Reliance Retail',    expected: 19_80_000, received: 19_80_000, unresolved: 0,        netRealisationPct: 100.0 },
  { channel: 'Cafes – Bangalore',  expected: 13_20_000, received: 13_20_000, unresolved: 0,        netRealisationPct: 100.0 },
];

export const totalExpected = channelPerformance.reduce((t, c) => t + c.expected, 0);
export const totalReceived = channelPerformance.reduce((t, c) => t + c.received, 0);
export const pctReceivedOverall = (totalReceived / totalExpected) * 100;

// ── TREND DATA ──────────────────────────────────────────────────────────────
export const trendData: TrendDataPoint[] = [
  { month: 'Mar 2026', expectedLakhs: 82.00, receivedLakhs: 80.50, gapLakhs: 1.50 },
  { month: 'Apr 2026', expectedLakhs: 88.00, receivedLakhs: 86.80, gapLakhs: 1.20 },
  { month: 'May 2026', expectedLakhs: 85.00, receivedLakhs: 84.20, gapLakhs: 0.80 },
  { month: 'Jun 2026', expectedLakhs: 95.00, receivedLakhs: 92.80, gapLakhs: 2.20 },
  { month: 'Jul 2026', expectedLakhs: 92.00, receivedLakhs: 90.50, gapLakhs: 1.50 },
  { month: 'Aug 2026', expectedLakhs: 100.00, receivedLakhs: 97.52, gapLakhs: 2.48 },
];

// ── UPCOMING EXPECTED PAYOUTS ───────────────────────────────────────────────
export const upcomingPayouts: UpcomingPayout[] = [
  { channel: 'Zepto', date: '19 Aug 2026', amount: 3_90_000, status: 'Expected' },
  { channel: 'Blinkit', date: '21 Aug 2026', amount: 4_80_000, status: 'Expected' },
  { channel: 'Reliance', date: '28 Aug 2026', amount: 1_85_000, status: 'Expected' },
  { channel: 'Cafes – Bangalore', date: '23 Aug 2026', amount: 1_40_000, status: 'Partial' },
];
