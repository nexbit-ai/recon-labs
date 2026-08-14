// The Nexbit B2B sections - single source for both the sidebar nav and routing.
import {
  DashboardOutlined,
  ReceiptLongOutlined,
  GavelOutlined,
  StorefrontOutlined,
  DescriptionOutlined,
  AutoAwesomeOutlined,
  FileUploadOutlined,
  EmailOutlined,
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
  { key: 'overview', label: 'Overview', title: 'Receivables overview', path: 'overview', icon: DashboardOutlined },
  { key: 'reconciliation', label: 'Reconciliation', title: 'Reconciliation', path: 'reconciliation', icon: ReceiptLongOutlined },
  { key: 'disputes', label: 'Disputes', title: 'Disputes & recovery', path: 'disputes', icon: GavelOutlined },
  { key: 'channels', label: 'Channels', title: 'Channel overview', path: 'channels', icon: StorefrontOutlined },

  { key: 'contracts', label: 'Contracts', title: 'Contracts & rate cards', path: 'contracts', icon: DescriptionOutlined },
  { key: 'ask', label: 'Ask Nex', title: 'Ask Nex', path: 'ask', icon: AutoAwesomeOutlined },
];
