// Workspace, connected channels, fiscal period, and Cosmix SKU catalogue.
import type { Channel, Sku } from './types';

export const workspace = {
  brand: 'Cosmix',
  category: 'Wellness & Functional Foods',
  channelsConnectedLabel: 'FXT · 9 channels connected',
} as const;

export const fiscalPeriod = {
  label: 'Aug 2026',
  range: '1-15 Aug',
  pill: 'Aug 2026 · 1-15 Aug',
} as const;

export const channels: Channel[] = [
  { name: 'Blinkit', model: 'Quick-commerce (SOR)', connected: true },
  { name: 'Zepto', model: 'Quick-commerce (SOR)', connected: true },
  { name: 'Amazon', model: 'Marketplace', connected: true },
  { name: 'Reliance Retail', model: 'Modern Trade (Credit terms)', connected: true },
  { name: 'Third Wave Coffee', model: 'Direct Supply', connected: true },
  { name: 'Blue Tokai Coffee', model: 'Direct Supply', connected: true },
  { name: 'Subko Coffee', model: 'Direct Supply', connected: true },
  { name: 'Starbucks', model: 'Direct Supply', connected: true },
  { name: 'Hatti Kaapi', model: 'Direct Supply', connected: true },
];

// Cosmix product catalogue: wellness / functional food SKUs.
export const skus: Sku[] = [
  { id: 'COS-PRO', product: 'Plant Protein', variant: '250g', label: 'Plant Protein - 250g' },
  { id: 'COS-COL', product: 'Collagen Boost', variant: '200g', label: 'Collagen Boost - 200g' },
  { id: 'COS-IMM', product: 'Immunity Mix', variant: '150g', label: 'Immunity Mix - 150g' },
  { id: 'COS-SKN', product: 'Skin Magic', variant: '200g', label: 'Skin Magic - 200g' },
  { id: 'COS-SLP', product: 'Sleep Easy', variant: '100g', label: 'Sleep Easy - 100g' },
  { id: 'COS-ENR', product: 'Energy Blend', variant: '250g', label: 'Energy Blend - 250g' },
];

export const skuById = (id: string): Sku | undefined => skus.find((s) => s.id === id);
