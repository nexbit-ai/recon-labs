import re

with open('src/b2b/mock/blinkitRecon.ts', 'r') as f:
    content = f.read()

# 1. Replace hero block
hero_block_old = r"const heroRevenue = 19_84_500;.*?const heroDifference = heroExpected - heroActual; // 1,52,000 ✓"
hero_block_new = """const heroPayable = 25_00_000;
const heroInvAdj = -18_000;
const heroCreditNote = 18_840;
const heroCommission = 5_50_000;
const heroCommissionExpected = 5_00_000;
const heroCommissionGST = 99_000;
const heroCommissionGSTExpected = 90_000;
const heroShipping = 48_000;
const heroShippingGST = 8_640;
const heroStorage = 57_000;
const heroStorageExpected = 15_00_000; # Actually expected is 15_000
const heroStorageGST = 10_260;
const heroStorageGSTExpected = 2_700;
const heroTDS = 2_500;
const heroDebitNote = 43_440;

const heroExpected = heroPayable + heroInvAdj + heroCreditNote - heroCommissionExpected - heroCommissionGSTExpected - heroShipping - heroShippingGST - 15_000 - 2_700 - heroTDS;
// Expected = 18,34,000
const heroActual = 16_82_000;
const heroDifference = heroExpected - heroActual; // 1,52,000 ✓"""

content = re.sub(hero_block_old, hero_block_new, content, flags=re.DOTALL)

# 2. Replace blinkitSettlements array
settlements_old = r"export const blinkitSettlements: BkSettlement\[\] = \[.*?\n\];"
settlements_new = """export const blinkitSettlements: BkSettlement[] = [
  {
    id: 'BLK-SET-1024',
    channel: 'Blinkit',
    period: '01 Aug – 07 Aug',
    settlementDate: '09 Aug 2026',
    invoiceCount: 428,
    orderCount: 1_312,
    itemCount: 3_105,
    expected: 16_50_000,
    actual: 16_50_000,
    difference: 0,
    status: 'Matched',
    utr: 'UTR2026080942871',
    components: [
      { label: 'Payable (goods sold)', amount: 22_50_000, type: 'revenue', detailKey: 'invoices_1024' },
      { label: 'Inventory Adjustment', amount: -12_000, type: 'deduction' },
      { label: 'Credit Note', amount: 6_610, type: 'revenue' },
      { label: 'Commission', amount: 4_50_000, type: 'deduction', detailKey: 'commission_1024', calculation: '₹22,50,000 × 20.0% = ₹4,50,000' },
      { label: 'Commission GST', amount: 81_000, type: 'deduction', calculation: '₹4,50,000 × 18.0% = ₹81,000' },
      { label: 'Shipping', amount: 42_000, type: 'deduction', detailKey: 'shipping_1024', calculation: '₹12/order × ~3,500 orders' },
      { label: 'Shipping GST', amount: 7_560, type: 'deduction', calculation: '₹42,000 × 18.0% = ₹7,560' },
      { label: 'Storage', amount: 10_000, type: 'deduction', detailKey: 'storage_1024', calculation: '₹3/unit/month prorated' },
      { label: 'Storage GST', amount: 1_800, type: 'deduction', calculation: '₹10,000 × 18.0% = ₹1,800' },
      { label: 'TDS', amount: 2_250, type: 'deduction', calculation: '₹22,50,000 × 0.1% = ₹2,250' }
    ],
  },
  {
    id: 'BLK-SET-1025',
    channel: 'Blinkit',
    period: '08 Aug – 14 Aug',
    settlementDate: '16 Aug 2026',
    invoiceCount: 428,
    orderCount: 1_480,
    itemCount: 2_931,
    expected: 18_34_000,
    actual: 16_82_000,
    difference: 1_52_000,
    status: 'Exception',
    utr: 'UTR2026081693214',
    components: [
      { label: 'Payable (goods sold)', amount: 25_00_000, type: 'revenue', detailKey: 'invoices' },
      { label: 'Inventory Adjustment', amount: -18_000, type: 'deduction' },
      { label: 'Credit Note', amount: 18_840, type: 'revenue' },
      { label: 'Commission', amount: 5_50_000, type: 'deduction', detailKey: 'commission', calculation: 'Charged 22% (Contract: 20% = ₹5,00,000)' },
      { label: 'Commission GST', amount: 99_000, type: 'deduction', calculation: '₹5,50,000 × 18.0% = ₹99,000' },
      { label: 'Shipping', amount: 48_000, type: 'deduction', detailKey: 'shipping', calculation: '₹12/order × ~4,000 orders' },
      { label: 'Shipping GST', amount: 8_640, type: 'deduction', calculation: '₹48,000 × 18.0% = ₹8,640' },
      { label: 'Storage', amount: 57_000, type: 'deduction', detailKey: 'storage', calculation: 'Includes ₹42k unauthorized cold storage' },
      { label: 'Storage GST', amount: 10_260, type: 'deduction', calculation: '₹57,000 × 18.0% = ₹10,260' },
      { label: 'TDS', amount: 2_500, type: 'deduction', calculation: '₹25,00,000 × 0.1% = ₹2,500' },
      { label: 'Debit Note (damages)', amount: 43_440, type: 'deduction', detailKey: 'cndn', calculation: 'DN raised without evidence' }
    ],
  }
];"""

content = re.sub(settlements_old, settlements_new, content, flags=re.DOTALL)

with open('src/b2b/mock/blinkitRecon.ts', 'w') as f:
    f.write(content)
print("Updated blinkitRecon.ts")
