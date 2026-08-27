import re

with open('src/b2b/mock/blinkitRecon.ts', 'r') as f:
    content = f.read()

# Fix commission
content = content.replace(
    "    { id: 'COM-001', label: 'Commission on INV-10482', invoiceId: 'INV-10482', amount: 400, detail: '₹20,000 × 2% = ₹400' },\n"
    "    { id: 'COM-002', label: 'Commission on C494249T26042481', invoiceId: 'C494249T26042481', amount: 1.80, detail: '₹90 × 2% = ₹1.80' },\n"
    "    { id: 'COM-003', label: 'Commission on INV-20031', invoiceId: 'INV-20031', amount: 600, detail: '₹30,000 × 2% = ₹600' },\n"
    "    { id: 'COM-004', label: 'Commission on INV-20089', invoiceId: 'INV-20089', amount: 400, detail: '₹20,000 × 2% = ₹400' },\n"
    "    { id: 'COM-005', label: 'Commission on INV-10891', invoiceId: 'INV-10891', amount: 900, detail: '₹45,000 × 2% = ₹900' },\n"
    "    { id: 'COM-006', label: 'Commission on remaining 383 invoices', amount: 37_388.20, detail: 'Aggregated commission on remaining invoices' },",
    "    { id: 'COM-001', label: 'Commission on INV-10482', invoiceId: 'INV-10482', amount: 4_000, detail: '₹20,000 × 20% = ₹4,000' },\n"
    "    { id: 'COM-002', label: 'Commission on C494249T26042481', invoiceId: 'C494249T26042481', amount: 18, detail: '₹90 × 20% = ₹18' },\n"
    "    { id: 'COM-003', label: 'Commission on INV-20031', invoiceId: 'INV-20031', amount: 6_000, detail: '₹30,000 × 20% = ₹6,000' },\n"
    "    { id: 'COM-004', label: 'Commission on INV-20089', invoiceId: 'INV-20089', amount: 4_000, detail: '₹20,000 × 20% = ₹4,000' },\n"
    "    { id: 'COM-005', label: 'Commission on INV-10891', invoiceId: 'INV-10891', amount: 9_000, detail: '₹45,000 × 20% = ₹9,000' },\n"
    "    { id: 'COM-006', label: 'Commission on remaining 383 invoices', amount: 3_73_882, detail: 'Aggregated commission on remaining invoices' },"
)

# Fix commission_1024
content = content.replace(
    "    { id: 'COM-1024-001', label: 'Commission on INV-10021', invoiceId: 'INV-10021', amount: 300, detail: '₹15,000 × 2% = ₹300' },\n"
    "    { id: 'COM-1024-002', label: 'Commission on INV-10045', invoiceId: 'INV-10045', amount: 440, detail: '₹22,000 × 2% = ₹440' },\n"
    "    { id: 'COM-1024-003', label: 'Commission on INV-10112', invoiceId: 'INV-10112', amount: 170, detail: '₹8,500 × 2% = ₹170' },\n"
    "    { id: 'COM-1024-004', label: 'Commission on INV-10255', invoiceId: 'INV-10255', amount: 900, detail: '₹45,000 × 2% = ₹900' },\n"
    "    { id: 'COM-1024-005', label: 'Commission on INV-10334', invoiceId: 'INV-10334', amount: 240, detail: '₹12,000 × 2% = ₹240' },\n"
    "    { id: 'COM-1024-006', label: 'Commission on INV-10401', invoiceId: 'INV-10401', amount: 630, detail: '₹31,500 × 2% = ₹630' },\n"
    "    { id: 'COM-1024-007', label: 'Commission on remaining 422 invoices', amount: 22_436, detail: 'Aggregated commission on remaining invoices' },",
    "    { id: 'COM-1024-001', label: 'Commission on INV-10021', invoiceId: 'INV-10021', amount: 3_000, detail: '₹15,000 × 20% = ₹3,000' },\n"
    "    { id: 'COM-1024-002', label: 'Commission on INV-10045', invoiceId: 'INV-10045', amount: 4_400, detail: '₹22,000 × 20% = ₹4,400' },\n"
    "    { id: 'COM-1024-003', label: 'Commission on INV-10112', invoiceId: 'INV-10112', amount: 1_700, detail: '₹8,500 × 20% = ₹1,700' },\n"
    "    { id: 'COM-1024-004', label: 'Commission on INV-10255', invoiceId: 'INV-10255', amount: 9_000, detail: '₹45,000 × 20% = ₹9,000' },\n"
    "    { id: 'COM-1024-005', label: 'Commission on INV-10334', invoiceId: 'INV-10334', amount: 2_400, detail: '₹12,000 × 20% = ₹2,400' },\n"
    "    { id: 'COM-1024-006', label: 'Commission on INV-10401', invoiceId: 'INV-10401', amount: 6_300, detail: '₹31,500 × 20% = ₹6,300' },\n"
    "    { id: 'COM-1024-007', label: 'Commission on remaining 422 invoices', amount: 2_24_355, detail: 'Aggregated commission on remaining invoices' },"
)

# Fix commission_1026
content = content.replace(
    "    { id: 'COM-1026-001', label: 'Commission on INV-21011', invoiceId: 'INV-21011', amount: 300, detail: '₹15,000 × 2% = ₹300' },\n"
    "    { id: 'COM-1026-002', label: 'Commission on INV-21045', invoiceId: 'INV-21045', amount: 440, detail: '₹22,000 × 2% = ₹440' },\n"
    "    { id: 'COM-1026-003', label: 'Commission on INV-21112', invoiceId: 'INV-21112', amount: 170, detail: '₹8,500 × 2% = ₹170' },\n"
    "    { id: 'COM-1026-004', label: 'Commission on INV-21255', invoiceId: 'INV-21255', amount: 900, detail: '₹45,000 × 2% = ₹900' },\n"
    "    { id: 'COM-1026-005', label: 'Commission on INV-21334', invoiceId: 'INV-21334', amount: 240, detail: '₹12,000 × 2% = ₹240' },\n"
    "    { id: 'COM-1026-006', label: 'Commission on INV-21401', invoiceId: 'INV-21401', amount: 630, detail: '₹31,500 × 2% = ₹630' },\n"
    "    { id: 'COM-1026-007', label: 'Commission on remaining 208 invoices', amount: 18_286, detail: 'Aggregated commission on remaining invoices' },",
    "    { id: 'COM-1026-001', label: 'Commission on INV-21011', invoiceId: 'INV-21011', amount: 3_000, detail: '₹15,000 × 20% = ₹3,000' },\n"
    "    { id: 'COM-1026-002', label: 'Commission on INV-21045', invoiceId: 'INV-21045', amount: 4_400, detail: '₹22,000 × 20% = ₹4,400' },\n"
    "    { id: 'COM-1026-003', label: 'Commission on INV-21112', invoiceId: 'INV-21112', amount: 1_700, detail: '₹8,500 × 20% = ₹1,700' },\n"
    "    { id: 'COM-1026-004', label: 'Commission on INV-21255', invoiceId: 'INV-21255', amount: 9_000, detail: '₹45,000 × 20% = ₹9,000' },\n"
    "    { id: 'COM-1026-005', label: 'Commission on INV-21334', invoiceId: 'INV-21334', amount: 2_400, detail: '₹12,000 × 20% = ₹2,400' },\n"
    "    { id: 'COM-1026-006', label: 'Commission on INV-21401', invoiceId: 'INV-21401', amount: 6_300, detail: '₹31,500 × 20% = ₹6,300' },\n"
    "    { id: 'COM-1026-007', label: 'Commission on remaining 208 invoices', amount: 1_82_860, detail: 'Aggregated commission on remaining invoices' },"
)

# Fix 1026 top level
content = content.replace("expected: 7_61_800,\n    actual: 7_61_800,", "expected: 5_39_141,\n    actual: 5_39_141,")
content = content.replace("{ label: 'Commission', amount: 20_966, type: 'deduction', detailKey: 'commission_1026' },", "{ label: 'Commission', amount: 2_09_660, type: 'deduction', detailKey: 'commission_1026' },")
content = content.replace("{ label: 'Commission GST', amount: 3_774, type: 'deduction' },", "{ label: 'Commission GST', amount: 37_739, type: 'deduction' },")

with open('src/b2b/mock/blinkitRecon.ts', 'w') as f:
    f.write(content)
print("done")
