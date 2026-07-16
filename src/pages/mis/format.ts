// Indian-currency formatting helpers for the AI-Powered MIS page.
// All raw amounts are stored in whole rupees (paise ignored).

/** Format whole rupees with Indian digit grouping, e.g. 285200 -> "₹2,85,200". */
export function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

/** Compact Cr / L formatting, e.g. 142000000 -> "₹14.2 Cr", 3860000 -> "₹38.6L". */
export function formatCompactINR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(1)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}

/**
 * Two-decimal Indian short currency for the MIS page, e.g.
 * 11644000 -> "₹1.16 Cr", 680000 -> "₹6.80 L", -213000 -> "-₹2.13 L".
 */
export function formatINRShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}

/** Percentage with one decimal, e.g. 71.3 -> "71.3%". */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
