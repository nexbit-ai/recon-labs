// The Nexbit B2B sections — single source for both the sidebar nav and routing.
import {
  DashboardOutlined,
  ReceiptLongOutlined,
  GavelOutlined,
  StorefrontOutlined,
  DescriptionOutlined,
  AutoAwesomeOutlined,
  FileUploadOutlined,
  AssignmentOutlined,
  WarningAmberOutlined,
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
  { key: 'overview', label: 'Agent', title: '', path: 'overview', icon: DashboardOutlined },
  { key: 'reconciliation', label: 'Reconciliation', title: '', path: 'reconciliation', icon: ReceiptLongOutlined },
  { key: 'po-dashboard', label: 'Orders', title: '', path: 'po-dashboard', icon: AssignmentOutlined },
  { key: 'payments', label: 'Payments', title: '', path: 'payments', icon: ReceiptLongOutlined },
  { key: 'contracts', label: 'Contracts', title: '', path: 'contracts', icon: DescriptionOutlined },
  { key: 'exceptions', label: 'Exceptions', title: '', path: 'exceptions', icon: WarningAmberOutlined },
];
