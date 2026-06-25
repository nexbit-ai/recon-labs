// Workspace, connected channels, fiscal period, and SuperYou's SKU catalogue.
import type { Channel, Sku } from './types';

export const workspace = {
  brand: 'SuperYou',
  category: 'FMCG · Protein-forward snacking',
  channelsConnectedLabel: 'SuperYou · 5 channels connected',
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

// SuperYou's real product range used across reconciliation fixtures.
export const skus: Sku[] = [
  { id: 'PW6-CHO', product: 'Protein Wafer 6-pack', variant: 'Choco', label: 'Protein Wafer 6-pack — Choco' },
  { id: 'PW6-PB', product: 'Protein Wafer 6-pack', variant: 'Peanut Butter', label: 'Protein Wafer 6-pack — Peanut Butter' },
  { id: 'MGC-CO', product: 'Multigrain Chips', variant: 'Cream & Onion', label: 'Multigrain Chips — Cream & Onion' },
  { id: 'MGC-CHE', product: 'Multigrain Chips', variant: 'Cheese', label: 'Multigrain Chips — Cheese' },
  { id: 'SYP-CHO', product: 'SuperYou Pro 1kg', variant: 'Chocolate', label: 'SuperYou Pro 1kg — Chocolate' },
  { id: 'SYP-CC', product: 'SuperYou Pro 1kg', variant: 'Cold Coffee', label: 'SuperYou Pro 1kg — Cold Coffee' },
  { id: 'SYP-MC', product: 'SuperYou Pro 1kg', variant: 'Masala Chai', label: 'SuperYou Pro 1kg — Masala Chai' },
  { id: 'SYP-UNF', product: 'SuperYou Pro 1kg', variant: 'Unflavoured', label: 'SuperYou Pro 1kg — Unflavoured' },
];

export const skuById = (id: string): Sku | undefined => skus.find((s) => s.id === id);
