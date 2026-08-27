// Single export surface for the entire B2B (Nexbit) mock-data layer - Cosmix demo.
// Frontend-only - no backend, no fetch. Import everything from '@/b2b/mock'.
export * from './types';
export * from './brands';
export * from './settlements';
export * from './rateCard';
export * from './contracts';

export * from './blinkitRecon';
export * from './actions';
export * from './accountingSync';

import { headlineByKey, channelPerformance } from './settlements';
import { actionItems } from './actions';

// ── Dev-only cross-foot checks (stripped from production build) ──────────────
// These guarantee the fixtures stay internally consistent as they're edited.
if (import.meta.env.DEV) {
  const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
  const expect = (label: string, got: number, want: number) => {
    if (Math.abs(got - want) > 1) console.warn(`[b2b/mock] ${label}: ${got} ≠ expected ${want}`);
  };

  // Invoice / PO totals
  expect('Σ channel invoiceRaised = ₹1.00 Cr', sum(channelPerformance.map((c) => c.invoiceRaised)), headlineByKey('invoiceRaised').value);
  expect('Σ channel poGenerated = ₹1.30 Cr', sum(channelPerformance.map((c) => c.poGenerated)), headlineByKey('poGenerated').value);
  // Expected payout
  expect('Σ channel expectedPayout = ₹80.01L', sum(channelPerformance.map((c) => c.expectedPayout)), headlineByKey('expectedPayout').value);
  // Received
  expect('Σ channel received = ₹76.01L', sum(channelPerformance.map((c) => c.received)), headlineByKey('received').value);
  // Unsettled
  expect('Σ channel unsettled = ₹2.48L', sum(channelPerformance.map((c) => c.unsettled)), headlineByKey('unsettled').value);
  // Wrong deductions
  expect('Σ channel wrongDeductions = ₹1.52L', sum(channelPerformance.map((c) => c.wrongDeductions)), headlineByKey('wrongDeductions').value);
  // Critical identity: Received + Unsettled = Expected Payout
  const totalRcvd = sum(channelPerformance.map((c) => c.received));
  const totalUnsettled = sum(channelPerformance.map((c) => c.unsettled));
  const totalExpPayout = sum(channelPerformance.map((c) => c.expectedPayout));
  expect('Received + Unsettled = Expected Payout', totalRcvd + totalUnsettled, totalExpPayout);
  // Legacy compat
  expect('Σ channel expected = ₹1.00 Cr', sum(channelPerformance.map((c) => c.expected)), headlineByKey('expected').value);
  expect('Σ channel unresolved = ₹2.48L', sum(channelPerformance.map((c) => c.unresolved)), headlineByKey('unresolved').value);
}
