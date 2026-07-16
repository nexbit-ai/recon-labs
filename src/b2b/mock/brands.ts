// Workspace, connected channels, fiscal period, and SuperYou's SKU catalogue.
import type { Channel, Sku } from './types';

export const workspace = {
  brand: 'SuperYou',
  category: 'FMCG · Protein-forward snacking',
  channelsConnectedLabel: 'FXT · 5 channels connected',
} as const;

export const fiscalPeriod = {
  label: 'Q1 FY26',
  range: 'Apr–Jun',
  pill: 'Q1 FY26 · Apr–Jun',
} as const;

export const channels: Channel[] = [
  { name: 'Amazon', model: 'FBA / Seller Flex', connected: true },
  { name: 'Flipkart', model: 'F-Assured', connected: true },
  { name: 'Blinkit', model: 'Quick-commerce (SOR)', connected: true },
  { name: 'Zepto', model: 'Quick-commerce (SOR)', connected: true },
  { name: 'Instamart', model: 'Quick-commerce (OR)', connected: true },
];

// Generic SKU catalogue used across the contract / discount fixtures. Ids are
// stable internal codes (referenced by secondaryDiscounts); product & label are
// shown as neutral SKU-N handles rather than real product names.
export const skus: Sku[] = [
  { id: 'PW6-CHO', product: 'SKU-8F2K', variant: '', label: 'SKU-8F2K' },
  { id: 'PW6-PB', product: 'SKU-QN41', variant: '', label: 'SKU-QN41' },
  { id: 'MGC-CO', product: 'SKU-7XR2', variant: '', label: 'SKU-7XR2' },
  { id: 'MGC-CHE', product: 'SKU-B93V', variant: '', label: 'SKU-B93V' },
  { id: 'SYP-CHO', product: 'SKU-K5T0', variant: '', label: 'SKU-K5T0' },
  { id: 'SYP-CC', product: 'SKU-2W9M', variant: '', label: 'SKU-2W9M' },
  { id: 'SYP-MC', product: 'SKU-DZ63', variant: '', label: 'SKU-DZ63' },
  { id: 'SYP-UNF', product: 'SKU-5HJ8', variant: '', label: 'SKU-5HJ8' },
];

export const skuById = (id: string): Sku | undefined => skus.find((s) => s.id === id);
