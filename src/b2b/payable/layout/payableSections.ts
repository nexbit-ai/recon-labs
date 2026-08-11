// AP sidebar section definitions — single source for nav + routing.
import {
  DashboardOutlined,
  ReceiptLongOutlined,
  WarningAmberOutlined,
  DescriptionOutlined,
  UploadFileOutlined,
  PeopleAltOutlined,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface PayableSectionDef {
  key: string;
  label: string;
  title: string;
  path: string;
  icon: SvgIconComponent;
  pinBottom?: boolean;
}

export const PAYABLE_SECTIONS: PayableSectionDef[] = [
  { key: 'overview',   label: 'Dashboard',  title: 'AP Dashboard',             path: 'overview',   icon: DashboardOutlined },
  { key: 'invoices',   label: 'Invoices',   title: 'Invoice 3-Way Match',       path: 'invoices',   icon: ReceiptLongOutlined },
  { key: 'exceptions', label: 'Exceptions', title: 'Exception Review Queue',    path: 'exceptions', icon: WarningAmberOutlined },
  { key: 'suppliers',  label: 'Suppliers',  title: 'Supplier Management',       path: 'suppliers',  icon: PeopleAltOutlined },
  { key: 'ingest',     label: 'Ingest',     title: 'Document Intake',           path: 'ingest',     icon: UploadFileOutlined, pinBottom: true },
];
