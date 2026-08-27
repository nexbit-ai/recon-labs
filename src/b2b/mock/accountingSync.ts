// Mock data for the Accounting → ERP Sync view.
// All transactions start as 'Pending' and flip to 'Synced' on push.
import type { ChannelName } from './types';

export type ERPSyncStatus = 'Pending' | 'Synced' | 'Failed';
export type ERPTransactionType = 'Receivable' | 'Deduction' | 'Settlement';

export interface ERPTransaction {
  id: string;
  channel: ChannelName;
  invoiceRef: string;
  date: string;
  amount: number;
  type: ERPTransactionType;
  syncStatus: ERPSyncStatus;
}

export interface ERPSyncSummary {
  erpName: string;
  connected: boolean;
  lastSyncedAt: string;
  totalPending: number;
  totalPendingAmount: number;
}

export const erpTransactions: ERPTransaction[] = [
  // ── Blinkit ───────────────────────────────────────────────────────────────
  { id: 'ERP-001', channel: 'Blinkit', invoiceRef: 'INV-BLK-08-001', date: '02 Aug 2026', amount: 4_80_000, type: 'Receivable',  syncStatus: 'Pending' },
  { id: 'ERP-002', channel: 'Blinkit', invoiceRef: 'INV-BLK-08-002', date: '05 Aug 2026', amount: 3_52_000, type: 'Receivable',  syncStatus: 'Pending' },
  { id: 'ERP-003', channel: 'Blinkit', invoiceRef: 'DN-BLK-08-001',  date: '06 Aug 2026', amount: -1_20_000, type: 'Deduction',  syncStatus: 'Pending' },
  { id: 'ERP-004', channel: 'Blinkit', invoiceRef: 'STL-BLK-08-001', date: '10 Aug 2026', amount: 7_12_000, type: 'Settlement',  syncStatus: 'Pending' },
  { id: 'ERP-005', channel: 'Blinkit', invoiceRef: 'INV-BLK-08-003', date: '14 Aug 2026', amount: 5_40_000, type: 'Receivable',  syncStatus: 'Pending' },

  // ── Zepto ─────────────────────────────────────────────────────────────────
  { id: 'ERP-006', channel: 'Zepto', invoiceRef: 'INV-ZPT-08-001', date: '01 Aug 2026', amount: 3_90_000, type: 'Receivable',  syncStatus: 'Pending' },
  { id: 'ERP-007', channel: 'Zepto', invoiceRef: 'INV-ZPT-08-002', date: '04 Aug 2026', amount: 4_20_000, type: 'Receivable',  syncStatus: 'Pending' },
  { id: 'ERP-008', channel: 'Zepto', invoiceRef: 'DN-ZPT-08-001',  date: '08 Aug 2026', amount: -65_000,  type: 'Deduction',   syncStatus: 'Pending' },
  { id: 'ERP-009', channel: 'Zepto', invoiceRef: 'STL-ZPT-08-001', date: '12 Aug 2026', amount: 7_45_000, type: 'Settlement',  syncStatus: 'Pending' },
  { id: 'ERP-010', channel: 'Zepto', invoiceRef: 'INV-ZPT-08-003', date: '18 Aug 2026', amount: 3_10_000, type: 'Receivable',  syncStatus: 'Pending' },

  // ── Reliance Retail ───────────────────────────────────────────────────────
  { id: 'ERP-011', channel: 'Reliance Retail', invoiceRef: 'INV-REL-08-001', date: '03 Aug 2026', amount: 5_60_000, type: 'Receivable',  syncStatus: 'Pending' },
  { id: 'ERP-012', channel: 'Reliance Retail', invoiceRef: 'DN-REL-08-001',  date: '07 Aug 2026', amount: -42_000,  type: 'Deduction',   syncStatus: 'Pending' },
  { id: 'ERP-013', channel: 'Reliance Retail', invoiceRef: 'STL-REL-08-001', date: '15 Aug 2026', amount: 5_18_000, type: 'Settlement',  syncStatus: 'Pending' },
  { id: 'ERP-014', channel: 'Reliance Retail', invoiceRef: 'INV-REL-08-002', date: '20 Aug 2026', amount: 4_80_000, type: 'Receivable',  syncStatus: 'Pending' },

  // ── Cafes – Bangalore ─────────────────────────────────────────────────────
  { id: 'ERP-015', channel: 'Cafes – Bangalore', invoiceRef: 'INV-CAF-08-001', date: '02 Aug 2026', amount: 2_80_000, type: 'Receivable',  syncStatus: 'Pending' },
  { id: 'ERP-016', channel: 'Cafes – Bangalore', invoiceRef: 'INV-CAF-08-002', date: '09 Aug 2026', amount: 3_40_000, type: 'Receivable',  syncStatus: 'Pending' },
  { id: 'ERP-017', channel: 'Cafes – Bangalore', invoiceRef: 'DN-CAF-08-001',  date: '11 Aug 2026', amount: -28_000,  type: 'Deduction',   syncStatus: 'Pending' },
  { id: 'ERP-018', channel: 'Cafes – Bangalore', invoiceRef: 'STL-CAF-08-001', date: '16 Aug 2026', amount: 5_92_000, type: 'Settlement',  syncStatus: 'Pending' },
];

export const erpSyncSummary: ERPSyncSummary = {
  erpName: 'Tally Prime',
  connected: true,
  lastSyncedAt: '25 Aug 2026, 11:42 AM',
  totalPending: erpTransactions.filter((t) => t.syncStatus === 'Pending').length,
  totalPendingAmount: erpTransactions.filter((t) => t.syncStatus === 'Pending').reduce((s, t) => s + t.amount, 0),
};
