// Single export surface for the entire B2B (Nexbit) mock-data layer.
// Frontend-only — no backend, no fetch. Import everything from '@/b2b/mock'.
export * from './types';
export * from './brands';
export * from './settlements';
export * from './receivables';
export * from './rateCard';
export * from './askNex';

import { headlineByKey, channelPerformance, reconLineItems } from './settlements';
import { expiringSoonDisputes, sumAmount } from './receivables';

// ── Dev-only cross-foot checks (stripped from production build) ──────────────
// These guarantee the fixtures stay internally consistent as they're edited.
if (import.meta.env.DEV) {
  const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
  const expect = (label: string, got: number, want: number) => {
    if (got !== want) console.warn(`[b2b/mock] ${label}: ${got} ≠ expected ${want}`);
  };

  expect('Σ channel settled = ₹14.2 Cr', sum(channelPerformance.map((c) => c.settled)), headlineByKey('settled').value);
  expect('Σ channel leakage = ₹38.6L', sum(channelPerformance.map((c) => c.leakage)), headlineByKey('leakage').value);
  expect('Σ channel recoverable = ₹22.4L', sum(channelPerformance.map((c) => c.recoverable)), headlineByKey('recoverable').value);
  expect('Σ expiring-soon disputes = ₹6.8L', sumAmount(expiringSoonDisputes), headlineByKey('expiring').value);

  // Each recon line's breakdown must explain the gap exactly (residual = ₹0).
  reconLineItems.forEach((li) => {
    const residual = li.paid - li.expected - sum(li.varianceBreakdown.map((v) => v.amount));
    expect(`recon ${li.id} residual = ₹0`, residual, 0);
    expect(`recon ${li.id} variance = expected - paid`, li.variance, li.expected - li.paid);
  });
}
