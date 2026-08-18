import re

with open('src/b2b/mock/settlements.ts', 'r') as f:
    content = f.read()

# 1. Update Headline
content = re.sub(
    r"export const headline: HeadlineMetric\[\] = \[.*?\];",
    """export const headline: HeadlineMetric[] = [
  { key: 'receivable', label: 'Total Receivables Due', value: 1_00_00_000, display: '₹1.00 Cr', unit: 'inr' },
  { key: 'settled', label: 'Total Received', value: 97_52_000, display: '₹97.52L', unit: 'inr' },
  { key: 'leakage', label: 'Shortfall / Gap', value: 2_48_000, display: '₹2.48L', unit: 'inr' },
  { key: 'recoverable', label: 'Recoverable now', value: 1_52_000, display: '₹1.52L', unit: 'inr' },
  { key: 'expiring', label: 'Recoverable expiring within ~10 days', value: 0, display: '₹0L', unit: 'inr' },
  { key: 'recoveredYtd', label: 'Recovered YTD', value: 8_40_000, display: '₹8.40L', unit: 'inr' },
  { key: 'netRealisation', label: 'True net realisation', value: 97.5, display: '97.5%', unit: 'percent' },
  { key: 'underDispute', label: 'Under dispute', value: 1_52_000, display: '₹1.52L', unit: 'inr' },
];""",
    content,
    flags=re.DOTALL
)

# 2. Update flaggedIssuesTotal
content = re.sub(
    r"export const flaggedIssuesTotal = 18;",
    "export const flaggedIssuesTotal = 2;",
    content
)

# 3. Update channelPerformance
content = re.sub(
    r"export const channelPerformance: ChannelPerformance\[\] = \[.*?\];",
    """export const channelPerformance: ChannelPerformance[] = [
  { channel: 'Blinkit',            settled: 33_32_000, leakage: 2_48_000, netRealisationPct: 93.0, recoverable: 1_52_000 },
  { channel: 'Zepto',              settled: 31_20_000, leakage: 0, netRealisationPct: 100, recoverable: 0 },
  { channel: 'Reliance',           settled: 19_80_000, leakage: 0, netRealisationPct: 100, recoverable: 0 },
  { channel: 'Cafes – Bangalore',  settled: 13_20_000, leakage: 0, netRealisationPct: 100, recoverable: 0 },
];""",
    content,
    flags=re.DOTALL
)

# 4. Update flaggedIssues
content = re.sub(
    r"export const flaggedIssues: FlaggedIssue\[\] = \[.*?\];",
    """export const flaggedIssues: FlaggedIssue[] = [
  {
    id: 'OR-001',
    channel: 'Blinkit',
    title: 'PO-BLK-2026-0847',
    detail: 'GRN accepted for 500 units of Plant Protein but 42 units deducted via Debit Note DN-0847 for damages not reported at warehouse. ₹7,560 deducted.',
    amount: 1_52_000,
    type: 'Debit note – damages',
    confidence: 'High',
    poNumber: 'PO-BLK-2026-0847',
  },
  {
    id: 'OR-005',
    channel: 'Blinkit',
    title: 'PO-BLK-2026-0923',
    detail: 'GRN pending for 120 units of Collagen Boost dispatched on 3 Aug. Warehouse has not confirmed acceptance. Invoice INV-BLK-0923 on hold.',
    amount: 96_000,
    type: 'Pending GRN',
    confidence: 'High',
    poNumber: 'PO-BLK-2026-0923',
  },
];""",
    content,
    flags=re.DOTALL
)

# 5. Update reconLineItems to clean up non-Blinkit or extra Blinkit
content = re.sub(
    r"// ── Zepto: Visibility fee deducted twice \(flagged\) ──.*?nextAction: 'File duplicate deduction dispute with Zepto ops - attach settlement sheet showing VIS-ZEP-0391 appearing on lines 14 and 28 for identical campaign.',\n  },",
    """// ── Zepto: Matched (clean) ──
  {
    id: 'RC-0391',
    channel: 'Zepto',
    skuId: 'COS-COL',
    skuLabel: 'COS-COL · Collagen Boost - 200g',
    poNumber: 'PO-ZEP-2026-0391',
    invoiceNumber: 'INV-ZEP-0391',
    grn: 'GRN-ZEP-0391',
    grnStatus: 'Accepted',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 3_80_000,
    paid: 3_80_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Zepto settlement reconciled successfully.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (420 units)' },
      { label: 'Deduction variance', amount: 0, why: 'All deductions reconcile to the Zepto rate card' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-ZEP-2026-0391', status: 'Matched', amount: 3_80_000 },
      { ref: 'GRN-ZEP-0391', status: 'Matched', amount: 3_80_000, unitsAccepted: 420, unitsOrdered: 420 },
      { ref: 'INV-ZEP-0391', status: 'Matched', amount: 3_80_000 },
    ),
  },""",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"// ── Zepto: Short payment / returns double-dip \(flagged\) ──.*?nextAction: 'Raise dispute - attach prior RTO claim D-0931 settlement confirmation showing the 38 units already credited.',\n  },",
    """// ── Zepto: Matched (clean) ──
  {
    id: 'RC-0445',
    channel: 'Zepto',
    skuId: 'COS-ENR',
    skuLabel: 'COS-ENR · Energy Blend - 250g',
    poNumber: 'PO-ZEP-2026-0445',
    invoiceNumber: 'INV-ZEP-0445',
    grn: 'GRN-ZEP-0445',
    grnStatus: 'Accepted',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 2_88_000,
    paid: 2_88_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Zepto settlement reconciled successfully.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (320 units)' },
      { label: 'Deduction variance', amount: 0, why: 'All deductions reconcile to the Zepto rate card' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-ZEP-2026-0445', status: 'Matched', amount: 2_88_000 },
      { ref: 'GRN-ZEP-0445', status: 'Matched', amount: 2_88_000, unitsAccepted: 320, unitsOrdered: 320 },
      { ref: 'INV-ZEP-0445', status: 'Matched', amount: 2_88_000 },
    ),
  },""",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"// ── Reliance: Settlement pending - overdue \(flagged\) ──.*?nextAction: 'Escalate to Reliance finance - 45-day credit term expired. Send payment reminder with invoice copy and GRN confirmation.',\n  },",
    """// ── Reliance: Matched (clean) ──
  {
    id: 'RC-0112',
    channel: 'Reliance',
    skuId: 'COS-IMM',
    skuLabel: 'COS-IMM · Immunity Mix - 150g',
    poNumber: 'PO-REL-2026-0112',
    invoiceNumber: 'INV-REL-0112',
    grn: 'GRN-REL-0112',
    grnStatus: 'Accepted',
    salePeriod: '15–31 Jul 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 2_40_000,
    paid: 2_40_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Reliance vendor portal settlement reconciled. 45-day credit terms met.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (400 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Margin and listing fees at contracted rates' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-REL-2026-0112', status: 'Matched', amount: 2_40_000 },
      { ref: 'GRN-REL-0112', status: 'Matched', amount: 2_40_000, unitsAccepted: 400, unitsOrdered: 400 },
      { ref: 'INV-REL-0112', status: 'Matched', amount: 2_40_000 },
    ),
  },""",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"// ── Reliance: Invoice missing \(flagged\) ──.*?nextAction: 'Re-upload invoice INV-REL-0087 to Reliance Vendor Portal. Attach GRN-REL-0087 confirmation as supporting document.',\n  },",
    """// ── Reliance: Matched (clean) ──
  {
    id: 'RC-0087',
    channel: 'Reliance',
    skuId: 'COS-IMM',
    skuLabel: 'COS-IMM · Immunity Mix - 150g',
    poNumber: 'PO-REL-2026-0087',
    invoiceNumber: 'INV-REL-0087',
    grn: 'GRN-REL-0087',
    grnStatus: 'Accepted',
    salePeriod: '1–15 Jul 2026',
    expectedPayoutDate: '14 Aug 2026',
    expected: 68_000,
    paid: 68_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - Reliance vendor portal settlement reconciled. 45-day credit terms met.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (113 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Margin and listing fees at contracted rates' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST and TCS credited as expected' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-REL-2026-0087', status: 'Matched', amount: 68_000 },
      { ref: 'GRN-REL-0087', status: 'Matched', amount: 68_000, unitsAccepted: 113, unitsOrdered: 113 },
      { ref: 'INV-REL-0087', status: 'Matched', amount: 68_000 },
    ),
  },""",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"// ── Cafes – Bangalore: Overdue batch \(flagged\) ──.*?nextAction: 'Send 7-day payment reminder to Third Wave Coffee \(finance@thirdwavecoffee.com\). Attach invoice INV-CAF-0034.',\n  },",
    """// ── Cafes – Bangalore: Matched (clean) ──
  {
    id: 'RC-CAF-001',
    channel: 'Cafes – Bangalore',
    skuId: 'COS-PRO',
    skuLabel: 'COS-PRO · Plant Protein - 250g',
    poNumber: 'ORD-TWC-2026-Jul',
    invoiceNumber: 'INV-CAF-0034',
    grn: 'DEL-CAF-0034',
    grnStatus: 'Accepted',
    salePeriod: '1–31 Jul 2026',
    expectedPayoutDate: '7 Aug 2026',
    expected: 48_000,
    paid: 48_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Payment via NEFT reference XYZ123 matched against invoice INV-CAF-0034.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units delivered match order (80 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Zero deductions' },
      { label: 'Tax / TCS variance', amount: 0, why: 'Tax component correctly settled' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'ORD-TWC-2026-Jul', status: 'Matched', amount: 48_000 },
      { ref: 'DEL-CAF-0034', status: 'Matched', amount: 48_000, unitsAccepted: 80, unitsOrdered: 80 },
      { ref: 'INV-CAF-0034', status: 'Matched', amount: 48_000 },
    ),
  },""",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"// ── Blinkit: Rate variance \(flagged\) ──.*?nextAction: 'File rate variance dispute - attach contract BLK-CTR-FY26 showing 20% commission clause. Excess ₹34,200 recoverable.',\n  },",
    """// ── Blinkit: Matched (clean) ──
  {
    id: 'RC-0876',
    channel: 'Blinkit',
    skuId: 'COS-SKN',
    skuLabel: 'COS-SKN · Skin Magic - 200g',
    poNumber: 'PO-BLK-2026-0876',
    invoiceNumber: 'INV-BLK-0876',
    grn: 'GRN-BLK-0876',
    grnStatus: 'Accepted',
    salePeriod: '1–7 Aug 2026',
    expectedPayoutDate: '10 Aug 2026',
    expected: 2_20_000,
    paid: 2_20_000,
    variance: 0,
    status: 'Matched',
    matchNote: 'Exact reference match - settlement ID resolved on first pass, amount within ±₹1 tolerance.',
    varianceBreakdown: [
      { label: 'Quantity variance', amount: 0, why: 'Units settled match units accepted (300 units)' },
      { label: 'Deduction variance', amount: 0, why: 'Commission charged at contracted 20%' },
      { label: 'Tax / TCS variance', amount: 0, why: 'GST matches invoice' },
    ],
    threeWayMatch: mkThreeWay(
      { ref: 'PO-BLK-2026-0876', status: 'Matched', amount: 2_20_000 },
      { ref: 'GRN-BLK-0876', status: 'Matched', amount: 2_20_000, unitsAccepted: 300, unitsOrdered: 300 },
      { ref: 'INV-BLK-0876', status: 'Matched', amount: 2_20_000 },
    ),
  },""",
    content,
    flags=re.DOTALL
)

with open('src/b2b/mock/settlements.ts', 'w') as f:
    f.write(content)
