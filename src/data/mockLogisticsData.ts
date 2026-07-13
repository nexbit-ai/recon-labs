// Frontend-only mock data for the Logistics Cost Intelligence page (demo branch).
// Everything the page renders — KPIs, slab/zone/reason distributions, the
// mismatched-orders table and the rate-card config dialog — is generated here.
// Numbers cross-foot: reason counts/values and zone values sum exactly to the
// headline mismatch count and absolute leakage per provider.

export type MockLogisticOrder = {
  id: string;
  display_order_code: string;
  awb: string;
  order_date: string;
  payment_mode: string;
  courier_partner: string;
  account_code: string;
  shipping_address_city: string;
  uploaded_pincode_zone: string;
  clickpost_unified_status: string;
  charged_weight: number;
  expected_weight: number;
  items_quantity: number;
  product_sku_code: string;
  total_cost: number;
  expected_cost: number;
  difference: number;
  reason: string;
  breakups: string;
  dispute_raised: boolean;
};

export type MockDistribution = { label: string; value: number; count: number };

export type MockSlabRow = {
  label: string;
  count: number;
  order_share: number;
  revenue_share: number;
  avg_cost: number;
};

export type MockSummary = {
  total_orders: number;
  mismatch_orders: number;
  matched_orders: number;
  disputed_orders: number;
  total_actual_cost: number;
  total_expected_cost: number;
  net_difference: number;
  abs_difference: number;
  match_rate: number;
  reason_distribution: MockDistribution[];
  zone_distribution: MockDistribution[];
  slab_distribution: MockSlabRow[];
};

export type MockRateCardRow = {
  id: string;
  section_name: string;
  provider_name: string;
  service_type: string;
  zone: string;
  row_label: string;
  slab_label: string;
  raw_value: string;
  numeric_value: number | null;
  formula_text: string | null;
};

// ── Deterministic PRNG so the demo renders identically every session ────────
const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Same "last fiscal year" window the page defaults to, so mock order dates
// always land inside the default filter.
const lastFiscalYear = () => {
  const today = new Date();
  const fyStart = today.getMonth() < 3 ? today.getFullYear() - 2 : today.getFullYear() - 1;
  return { startYear: fyStart, start: `${fyStart}-04-01`, end: `${fyStart + 1}-03-31` };
};

const FY = lastFiscalYear();

const SKUS = [
  { code: 'ZB-KOMBUCHA-GINGER-330ML', weight: 380 },
  { code: 'ZB-KOMBUCHA-BERRY-330ML', weight: 380 },
  { code: 'ZB-ENERGY-MANGO-250ML', weight: 290 },
  { code: 'ZB-ENERGY-ORIGINAL-250ML-P4', weight: 1160 },
  { code: 'ZB-SPARKLING-LIME-500ML', weight: 545 },
  { code: 'ZB-COLDBREW-COFFEE-200ML-P6', weight: 1420 },
  { code: 'ZB-PROTEIN-CHOCO-300ML', weight: 350 },
  { code: 'ZB-JUICE-ORANGE-1L', weight: 1080 },
];

const ZONE_CITIES: Record<string, string[]> = {
  A: ['New Delhi', 'Gurugram', 'Noida'],
  B: ['Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'],
  C: ['Jaipur', 'Lucknow', 'Indore', 'Chandigarh', 'Ahmedabad'],
  D: ['Patna', 'Bhubaneswar', 'Raipur', 'Kochi', 'Coimbatore'],
  E: ['Guwahati', 'Dehradun', 'Ranchi', 'Jammu'],
  F: ['Imphal', 'Shillong', 'Leh', 'Srinagar'],
};

// Contract rate card: base freight for first 500g per zone, ₹20 per addl 500g.
const BASE_RATE: Record<string, number> = { A: 32, B: 36, C: 40, D: 46, E: 52, F: 65 };
const INCREMENT_RATE = 20;

const round2 = (n: number) => Math.round(n * 100) / 100;

const expectedCostFor = (provider: string, zone: string, weightG: number, isCod: boolean): number => {
  const steps = Math.max(0, Math.ceil(weightG / 500) - 1);
  if (provider === 'shadowfax') {
    // Linear pro-rata above 2.5kg, flat COD fee ₹25.
    const freight =
      weightG <= 2500
        ? BASE_RATE[zone] + steps * (INCREMENT_RATE - 2)
        : BASE_RATE[zone] + 4 * (INCREMENT_RATE - 2) + (weightG - 2500) * 0.042;
    return round2(freight + (isCod ? 25 : 0));
  }
  // Delhivery: ceil slab + 20% contractual discount, flat COD fee ₹30.
  return round2((BASE_RATE[zone] + steps * INCREMENT_RATE) * 0.8 + (isCod ? 30 : 0));
};

// Split a bucket's total leakage across `count` orders (2dp, sums exactly).
const distribute = (total: number, count: number, rand: () => number): number[] => {
  const weights = Array.from({ length: count }, () => 0.4 + rand());
  const wSum = weights.reduce((a, b) => a + b, 0);
  const out: number[] = [];
  let acc = 0;
  for (let i = 0; i < count; i++) {
    const v = i === count - 1 ? round2(total - acc) : round2((weights[i] / wSum) * total);
    acc = round2(acc + v);
    out.push(v);
  }
  return out;
};

type ProviderSpec = {
  provider: string;
  courier: string;
  accountCode: string;
  seed: number;
  awbBase: number;
  orderBase: number;
  summary: MockSummary;
};

// Reason values/counts sum exactly to abs_difference / mismatch_orders.
const DELHIVERY_SPEC: ProviderSpec = {
  provider: 'delhivery',
  courier: 'Delhivery',
  accountCode: 'ZAPP-DEL-SURFACE',
  seed: 20250401,
  awbBase: 33110001000000,
  orderBase: 410000,
  summary: {
    total_orders: 256756,
    matched_orders: 252909,
    mismatch_orders: 3847,
    disputed_orders: 212,
    total_actual_cost: 16432180.4,
    total_expected_cost: 16333394.4,
    net_difference: 98786,
    abs_difference: 98786,
    match_rate: 98.5,
    reason_distribution: [
      { label: 'Physical Weight Mismatch', count: 1412, value: 38420 },
      { label: 'Wrong Slab Mapping', count: 826, value: 21730 },
      { label: 'Operational: Box Too Large', count: 594, value: 15660 },
      { label: 'Weight Slab Inconsistency', count: 438, value: 9870 },
      { label: 'Shipping Rate Dispute', count: 312, value: 7240 },
      { label: 'COD Service Fee Variance', count: 186, value: 3610 },
      { label: 'Master Data Gap (0g)', count: 79, value: 2256 },
    ],
    zone_distribution: [
      { label: 'Zone A', count: 428, value: 12340 },
      { label: 'Zone B', count: 704, value: 18972 },
      { label: 'Zone C', count: 986, value: 24518 },
      { label: 'Zone D', count: 852, value: 21414 },
      { label: 'Zone E', count: 641, value: 15782 },
      { label: 'Zone F', count: 236, value: 5760 },
    ],
    slab_distribution: [
      { label: '0.5kg', count: 148205, order_share: 58.6, revenue_share: 41.2, avg_cost: 52 },
      { label: '1kg', count: 61320, order_share: 24.2, revenue_share: 27.8, avg_cost: 74 },
      { label: '1.5kg', count: 22470, order_share: 8.9, revenue_share: 13.4, avg_cost: 96 },
      { label: '2kg', count: 12876, order_share: 5.1, revenue_share: 9.6, avg_cost: 118 },
      { label: '2.5kg', count: 5340, order_share: 2.1, revenue_share: 4.3, avg_cost: 141 },
      { label: '>2.5kg', count: 2698, order_share: 1.1, revenue_share: 3.7, avg_cost: 187 },
    ],
  },
};

const SHADOWFAX_SPEC: ProviderSpec = {
  provider: 'shadowfax',
  courier: 'Shadowfax',
  accountCode: 'ZAPP-SFX-EXPRESS',
  seed: 20250402,
  awbBase: 78220004000000,
  orderBase: 720000,
  summary: {
    total_orders: 49477,
    matched_orders: 48213,
    mismatch_orders: 1264,
    disputed_orders: 64,
    total_actual_cost: 3287410.6,
    total_expected_cost: 3246172.6,
    net_difference: 41238,
    abs_difference: 41238,
    match_rate: 97.4,
    reason_distribution: [
      { label: 'Physical Weight Mismatch', count: 486, value: 16420 },
      { label: 'Wrong Slab Mapping', count: 214, value: 7850 },
      { label: 'Operational: Box Too Large', count: 198, value: 6930 },
      { label: 'COD Service Fee Variance', count: 176, value: 4868 },
      { label: 'Shipping Rate Dispute', count: 118, value: 3240 },
      { label: 'Master Data Gap (0g)', count: 72, value: 1930 },
    ],
    zone_distribution: [
      { label: 'Zone A', count: 152, value: 5120 },
      { label: 'Zone B', count: 244, value: 7842 },
      { label: 'Zone C', count: 318, value: 10236 },
      { label: 'Zone D', count: 276, value: 8914 },
      { label: 'Zone E', count: 197, value: 6530 },
      { label: 'Zone F', count: 77, value: 2596 },
    ],
    slab_distribution: [
      { label: '0.5kg', count: 27412, order_share: 56.9, revenue_share: 39.8, avg_cost: 48 },
      { label: '1kg', count: 11206, order_share: 23.2, revenue_share: 26.4, avg_cost: 68 },
      { label: '1.5kg', count: 4821, order_share: 10.0, revenue_share: 14.2, avg_cost: 89 },
      { label: '2kg', count: 2624, order_share: 5.4, revenue_share: 9.1, avg_cost: 108 },
      { label: '2.5kg', count: 1318, order_share: 2.7, revenue_share: 5.6, avg_cost: 126 },
      { label: '>2.5kg', count: 832, order_share: 1.7, revenue_share: 4.9, avg_cost: 158 },
    ],
  },
};

const buildBreakup = (
  provider: string,
  reason: string,
  zone: string,
  billedWeight: number,
  expected: number,
  billed: number,
  isCod: boolean
): string => {
  const steps = Math.max(0, Math.ceil(billedWeight / 500) - 1);
  const slabKg = (steps + 1) * 0.5;
  const base = BASE_RATE[zone];
  const disc = provider === 'delhivery' ? ' − 20% disc' : '';
  const cod = isCod ? (provider === 'delhivery' ? ' + COD ₹30.00' : ' + COD ₹25.00') : '';
  switch (reason) {
    case 'COD Service Fee Variance':
      return `Freight OK; COD billed ₹35.00 vs contract ₹${provider === 'delhivery' ? '30.00' : '25.00'} | Δ ₹${(billed - expected).toFixed(2)}`;
    case 'Shipping Rate Dispute':
      return `Zone ${zone} base billed ₹${(base + 6).toFixed(2)} vs rate-card ₹${base.toFixed(2)}${cod}${disc} | Exp ₹${expected.toFixed(2)} vs Billed ₹${billed.toFixed(2)}`;
    case 'Wrong Slab Mapping':
      return `Billed as Zone ${zone === 'F' ? 'F' : String.fromCharCode(zone.charCodeAt(0) + 1)}; pincode map says Zone ${zone}${cod}${disc} | Exp ₹${expected.toFixed(2)} vs Billed ₹${billed.toFixed(2)}`;
    case 'Master Data Gap (0g)':
      return `SKU weight 0g in master; audit on volumetric ${billedWeight}g only${cod} | Exp ₹${expected.toFixed(2)} vs Billed ₹${billed.toFixed(2)}`;
    default:
      return `Slab ${slabKg}kg @ Zone ${zone}: ₹${base.toFixed(2)} + ${steps}×₹${INCREMENT_RATE.toFixed(2)}${cod}${disc} = ₹${expected.toFixed(2)} | Billed ₹${billed.toFixed(2)} @ ${billedWeight}g`;
  }
};

const generateOrders = (spec: ProviderSpec): MockLogisticOrder[] => {
  const rand = mulberry32(spec.seed);
  const orders: MockLogisticOrder[] = [];
  const zoneWeights = spec.summary.zone_distribution;
  const zoneTotal = zoneWeights.reduce((a, z) => a + z.count, 0);
  const fyStartMs = new Date(`${FY.start}T00:00:00Z`).getTime();
  let seq = 0;

  const pickZone = () => {
    let roll = rand() * zoneTotal;
    for (const z of zoneWeights) {
      roll -= z.count;
      if (roll <= 0) return z.label.replace('Zone ', '');
    }
    return 'C';
  };

  for (const bucket of spec.summary.reason_distribution) {
    const diffs = distribute(bucket.value, bucket.count, rand);
    for (let i = 0; i < bucket.count; i++) {
      const zone = pickZone();
      const sku = SKUS[Math.floor(rand() * SKUS.length)];
      const qty = rand() < 0.72 ? 1 : rand() < 0.8 ? 2 : 3;
      const isCod = rand() < 0.44;
      const isGap = bucket.label === 'Master Data Gap (0g)';
      const expectedWeight = isGap ? 0 : sku.weight * qty;
      const auditWeight = isGap ? 500 + Math.floor(rand() * 4) * 500 : expectedWeight;
      const inflate =
        bucket.label === 'Physical Weight Mismatch' || bucket.label === 'Operational: Box Too Large'
          ? (1 + Math.floor(rand() * 3)) * 500
          : bucket.label === 'Weight Slab Inconsistency'
            ? 500
            : 0;
      const chargedWeight = Math.ceil(auditWeight / 500) * 500 + inflate;
      const expectedCost = expectedCostFor(spec.provider, zone, auditWeight, isCod);
      const totalCost = round2(expectedCost + diffs[i]);
      const dayOffset = Math.floor(rand() * 364);
      const orderDate = new Date(fyStartMs + dayOffset * 86400000).toISOString().split('T')[0];
      const cities = ZONE_CITIES[zone];
      seq += 1;
      orders.push({
        id: `${spec.provider}-${seq}`,
        display_order_code: `#ZB${spec.orderBase + seq}`,
        awb: String(spec.awbBase + seq * 7),
        order_date: orderDate,
        payment_mode: isCod ? 'COD' : 'Prepaid',
        courier_partner: spec.courier,
        account_code: spec.accountCode,
        shipping_address_city: cities[Math.floor(rand() * cities.length)],
        uploaded_pincode_zone: zone,
        clickpost_unified_status: 'Delivered',
        charged_weight: chargedWeight,
        expected_weight: expectedWeight,
        items_quantity: qty,
        product_sku_code: qty > 1 ? `${sku.code} x${qty}` : sku.code,
        total_cost: totalCost,
        expected_cost: expectedCost,
        difference: diffs[i],
        reason: bucket.label,
        breakups: buildBreakup(spec.provider, bucket.label, zone, chargedWeight, expectedCost, totalCost, isCod),
        dispute_raised: rand() < 0.055,
      });
    }
  }

  // Interleave reasons so any table page shows a mix, sorted by leakage desc.
  orders.sort((a, b) => b.difference - a.difference);
  return orders;
};

const DATASETS: Record<string, { summary: MockSummary; orders: MockLogisticOrder[] }> = {
  delhivery: { summary: DELHIVERY_SPEC.summary, orders: generateOrders(DELHIVERY_SPEC) },
  shadowfax: { summary: SHADOWFAX_SPEC.summary, orders: generateOrders(SHADOWFAX_SPEC) },
};

export type MockDashboardParams = {
  provider: string;
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  reason?: string;
};

export const getMockLogisticsDashboard = (params: MockDashboardParams) => {
  const dataset = DATASETS[params.provider];
  if (!dataset) {
    return { summary: undefined, orders: [], pagination: {} };
  }

  let filtered = dataset.orders;
  if (params.start_date) filtered = filtered.filter((o) => o.order_date >= params.start_date!);
  if (params.end_date) filtered = filtered.filter((o) => o.order_date <= params.end_date!);
  if (params.reason) filtered = filtered.filter((o) => o.reason.includes(params.reason!));
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.display_order_code.toLowerCase().includes(q) ||
        o.awb.includes(q) ||
        o.product_sku_code.toLowerCase().includes(q)
    );
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 25);
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

  return {
    summary: dataset.summary,
    orders: filtered.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total_count: filtered.length,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  };
};

// ── Rate-card config (Config dialog) ────────────────────────────────────────
const buildRateCardRows = (): MockRateCardRow[] => {
  const rows: MockRateCardRow[] = [];
  const zones = ['A', 'B', 'C', 'D', 'E', 'F'];

  for (const zone of zones) {
    rows.push({
      id: `del-fwd-${zone}-base`,
      section_name: 'Forward Charges',
      provider_name: 'delhivery',
      service_type: 'Surface',
      zone: `Zone ${zone}`,
      row_label: 'Base freight',
      slab_label: 'First 500g',
      raw_value: BASE_RATE[zone].toFixed(2),
      numeric_value: BASE_RATE[zone],
      formula_text: null,
    });
    rows.push({
      id: `del-fwd-${zone}-inc`,
      section_name: 'Forward Charges',
      provider_name: 'delhivery',
      service_type: 'Surface',
      zone: `Zone ${zone}`,
      row_label: 'Increment',
      slab_label: 'Addl 500g',
      raw_value: INCREMENT_RATE.toFixed(2),
      numeric_value: INCREMENT_RATE,
      formula_text: null,
    });
  }
  rows.push(
    {
      id: 'del-disc',
      section_name: 'Contract Terms',
      provider_name: 'delhivery',
      service_type: 'Surface',
      zone: 'All',
      row_label: 'Contractual discount',
      slab_label: 'All slabs',
      raw_value: '20%',
      numeric_value: 20,
      formula_text: 'freight * 0.8',
    },
    {
      id: 'del-cod-flat',
      section_name: 'COD Charges',
      provider_name: 'delhivery',
      service_type: 'Surface',
      zone: 'All',
      row_label: 'COD flat fee',
      slab_label: 'Per shipment',
      raw_value: '30.00',
      numeric_value: 30,
      formula_text: 'max(30, 1.5% of order value)',
    },
    {
      id: 'del-fuel',
      section_name: 'Surcharges',
      provider_name: 'delhivery',
      service_type: 'Surface',
      zone: 'All',
      row_label: 'Fuel surcharge',
      slab_label: '% of freight',
      raw_value: '0%',
      numeric_value: 0,
      formula_text: 'included in base',
    }
  );

  for (const zone of zones) {
    rows.push({
      id: `sfx-fwd-${zone}-base`,
      section_name: 'Forward Charges',
      provider_name: 'shadowfax',
      service_type: 'Express',
      zone: `Zone ${zone}`,
      row_label: 'Base freight',
      slab_label: 'First 500g',
      raw_value: BASE_RATE[zone].toFixed(2),
      numeric_value: BASE_RATE[zone],
      formula_text: null,
    });
  }
  rows.push(
    {
      id: 'sfx-fwd-inc',
      section_name: 'Forward Charges',
      provider_name: 'shadowfax',
      service_type: 'Express',
      zone: 'All',
      row_label: 'Increment',
      slab_label: 'Addl 500g (≤2.5kg)',
      raw_value: '18.00',
      numeric_value: 18,
      formula_text: null,
    },
    {
      id: 'sfx-prorata',
      section_name: 'Forward Charges',
      provider_name: 'shadowfax',
      service_type: 'Express',
      zone: 'All',
      row_label: 'Pro-rata rate',
      slab_label: 'Per gram >2.5kg',
      raw_value: '0.042',
      numeric_value: 0.042,
      formula_text: 'base(2.5kg) + 0.042 * (g - 2500)',
    },
    {
      id: 'sfx-cod-flat',
      section_name: 'COD Charges',
      provider_name: 'shadowfax',
      service_type: 'Express',
      zone: 'All',
      row_label: 'COD flat fee',
      slab_label: 'Per shipment',
      raw_value: '25.00',
      numeric_value: 25,
      formula_text: null,
    }
  );

  return rows;
};

const RATE_CARD_ROWS = buildRateCardRows();

export const getMockRateCardRows = (provider: string): MockRateCardRow[] =>
  RATE_CARD_ROWS.filter((r) => r.provider_name === provider);

// Persists edits for the session so the Config dialog feels live.
export const updateMockRateCardRows = (updates: Array<{ id: string; raw_value: string }>): void => {
  for (const u of updates) {
    const row = RATE_CARD_ROWS.find((r) => r.id === u.id);
    if (row) {
      row.raw_value = u.raw_value;
      const parsed = parseFloat(u.raw_value.replace(/[^\d.-]/g, ''));
      row.numeric_value = Number.isFinite(parsed) ? parsed : null;
    }
  }
};

// Small artificial latency so loading states still render naturally in the demo.
export const mockDelay = (ms = 350) => new Promise<void>((resolve) => setTimeout(resolve, ms));
