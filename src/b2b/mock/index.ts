// Single export surface for the entire B2B (Nexbit) mock-data layer - Cosmix demo.
// Frontend-only - no backend, no fetch. Import everything from '@/b2b/mock'.
export * from './types';
export * from './brands';
export * from './settlements';
export * from './rateCard';
export * from './contracts';

export * from './blinkitRecon';
export * from './actions';

import { headlineByKey, channelPerformance } from './settlements';
import { actionItems } from './actions';

// ── Dev-only cross-foot checks (stripped from production build) ──────────────
// These guarantee the fixtures stay internally consistent as they're edited.
if (import.meta.env.DEV) {
  const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
  const expect = (label: string, got: number, want: number) => {
    if (Math.abs(got - want) > 1) console.warn(`[b2b/mock] ${label}: ${got} ≠ expected ${want}`);
  };

  expect('Σ channel received = ₹97.52L', sum(channelPerformance.map((c) => c.received)), headlineByKey('received').value);
  expect('Σ channel unresolved = ₹2.48L', sum(channelPerformance.map((c) => c.unresolved)), headlineByKey('unresolved').value);
  expect('Σ channel expected = ₹1.00 Cr', sum(channelPerformance.map((c) => c.expected)), headlineByKey('expected').value);
}
