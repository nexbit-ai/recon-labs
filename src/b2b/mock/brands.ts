// Workspace, connected channels, fiscal period, and Nexbit Gear's SKU catalogue.
import type { Channel, Sku } from './types';

export const workspace = {
  brand: 'Nexbit Gear',
  category: 'Consumer Electronics · Tech Accessories & Peripherals',
  channelsConnectedLabel: 'FXT · 5 channels connected',
} as const;

export const fiscalPeriod = {
  label: 'Q1 FY26',
  range: 'Apr–Jun',
  pill: 'Q1 FY26 · Apr–Jun',
} as const;

export const channels: Channel[] = [
  { name: 'Amazon', model: 'FBA / Seller Flex', connected: true },
  { name: 'Blinkit', model: 'Quick-commerce (SOR)', connected: true },
  { name: 'Zepto', model: 'Quick-commerce (SOR)', connected: true },
  { name: 'Instamart', model: 'Quick-commerce (OR)', connected: true },
  { name: 'Offline Stores', model: 'Modern Trade & HoReCa', connected: true },
];

// Generic SKU catalogue used across the contract / discount fixtures. Ids are
// stable internal codes (referenced by secondaryDiscounts); product & label are
// shown as neutral SKU-N handles rather than real product names.
export const skus: Sku[] = [
  { id: 'TECH-KBD', product: 'Mechanical Keyboard', variant: '', label: 'Mechanical Keyboard' },
  { id: 'TECH-MOU', product: 'Wireless Mouse', variant: '', label: 'Wireless Mouse' },
  { id: 'TECH-SPK', product: 'Bluetooth Speakers', variant: '', label: 'Bluetooth Speakers' },
  { id: 'TECH-CHR', product: 'Ergonomic Chair', variant: '', label: 'Ergonomic Chair' },
  { id: 'TECH-ARM', product: 'Dual Monitor Arm', variant: '', label: 'Dual Monitor Arm' },
  { id: 'TECH-HUB', product: 'USB-C Docking Station', variant: '', label: 'USB-C Docking Station' },
];

export const skuById = (id: string): Sku | undefined => skus.find((s) => s.id === id);
