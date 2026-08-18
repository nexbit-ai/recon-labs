// Single export surface for the entire B2B (Nexbit) mock-data layer - Cosmix demo.
// Frontend-only - no backend, no fetch. Import everything from '@/b2b/mock'.
export * from './types';
export * from './brands';
export * from './settlements';
export * from './receivables';
export * from './rateCard';
export * from './contracts';
export * from './askNex';
export * from './emailIngest';
export * from './channelDrilldown';

import { headlineByKey, channelPerformance, reconLineItems, reconPurchaseOrders } from './settlements';
import { expiringSoonDisputes, sumAmount } from './receivables';

// ── Dev-only cross-foot checks (stripped from production build) ──────────────
// These guarantee the fixtures stay internally consistent as they're edited.
if (import.meta.env.DEV) {
  const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
  const expect = (label: string, got: number, want: number) => {
    if (Math.abs(got - want) > 1) console.warn(`[b2b/mock] ${label}: ${got} ≠ expected ${want}`);
  };

  expect('Σ channel settled = ₹90.00L', sum(channelPerformance.map((c) => c.settled)), headlineByKey('settled').value);
  expect('Σ channel leakage = ₹10.00L', sum(channelPerformance.map((c) => c.leakage)), headlineByKey('leakage').value);
  expect('Σ channel recoverable = ₹6.80L', sum(channelPerformance.map((c) => c.recoverable)), headlineByKey('recoverable').value);
  expect('Σ channel receivable = ₹1.00 Cr', sum(channelPerformance.map((c) => c.settled + c.leakage)), headlineByKey('receivable').value);
  expect('Σ expiring-soon disputes = ₹1.50L', sumAmount(expiringSoonDisputes), headlineByKey('expiring').value);

  // Each recon line's breakdown must explain the gap exactly (residual = ₹0).
  reconLineItems.forEach((li) => {
    const residual = li.paid - li.expected - sum(li.varianceBreakdown.map((v) => v.amount));
    expect(`recon ${li.id} residual = ₹0`, residual, 0);
    expect(`recon ${li.id} variance = expected - paid`, li.variance, li.expected - li.paid);
  });

  // Verify Purchase Orders
  reconPurchaseOrders.forEach((po) => {
    const expected = sum(po.lineItems.map(li => li.expected));
    const paid = sum(po.lineItems.map(li => li.paid));
    expect(`po ${po.id} expected = sum(lineItems)`, po.expected, expected);
    expect(`po ${po.id} paid = sum(lineItems)`, po.paid, paid);
    expect(`po ${po.id} variance = expected - paid`, po.variance, po.expected - po.paid);
  });
}
