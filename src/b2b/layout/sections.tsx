// The Nexbit B2B sections - single source for both the sidebar nav and routing.
import {
  DashboardOutlined,
  ReceiptLongOutlined,
  GavelOutlined,
  AccountBalanceOutlined,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface SectionDef {
  key: string;
  /** Sidebar label + uppercase top-bar eyebrow. */
  label: string;
  /** Top-bar / canvas page title. */
  title: string;
  /** Route path segment under /b2b. */
  path: string;
  icon: SvgIconComponent;
}

export const SECTIONS: SectionDef[] = [
  { key: 'overview', label: 'Dashboard', title: 'Receivables Dashboard', path: 'overview', icon: DashboardOutlined },
  { key: 'ledger', label: 'Channel Ledger', title: 'Channel Ledger', path: 'ledger', icon: ReceiptLongOutlined },
  { key: 'actions', label: 'Action Centre', title: 'Action Centre', path: 'actions', icon: GavelOutlined },
  { key: 'accounting', label: 'Accounting', title: 'ERP Sync', path: 'accounting', icon: AccountBalanceOutlined },
];
