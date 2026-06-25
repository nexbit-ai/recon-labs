// Indian-currency formatting helpers for the B2B (Nexbit) module.
// All raw amounts in the mock layer are stored in whole rupees (paise ignored).

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

/** Percentage with one decimal, e.g. 71.3 -> "71.3%". */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
