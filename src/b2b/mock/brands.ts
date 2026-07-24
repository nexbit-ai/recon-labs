// Workspace, connected channels, fiscal period, and SuperYou's SKU catalogue.
import type { Channel, Sku } from './types';

export const workspace = {
  brand: 'Blue Tribe Foods',
  category: 'FMCG · Plant-based Meats & Snacking',
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
  { id: 'BTF-NUG', product: 'Plant-based Chicken Nuggets', variant: '', label: 'Plant-based Chicken Nuggets' },
  { id: 'BTF-KEE', product: 'Vegan Keema', variant: '', label: 'Vegan Keema' },
  { id: 'BTF-SAU', product: 'Plant-based Sausages', variant: '', label: 'Plant-based Sausages' },
  { id: 'BTF-KEB', product: 'Plant-based Kebabs', variant: '', label: 'Plant-based Kebabs' },
  { id: 'KLW-PUF', product: 'Supergrain Puffs', variant: '', label: 'Supergrain Puffs' },
  { id: 'KLW-SPR', product: 'Sprout Sticks', variant: '', label: 'Sprout Sticks' },
];

export const skuById = (id: string): Sku | undefined => skus.find((s) => s.id === id);
