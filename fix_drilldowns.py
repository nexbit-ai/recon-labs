import re

with open('src/b2b/mock/blinkitRecon.ts', 'r') as f:
    content = f.read()

# Replace shipping
content = re.sub(r'  shipping: \[.*?\],', '''  shipping: [
    { id: 'SHP-001', label: 'Standard Shipping Fee', amount: 48_000, detail: '₹12/order × ~4,000 orders' },
  ],''', content, flags=re.DOTALL)

# Replace shipping_1024
content = re.sub(r'  shipping_1024: \[.*?\],', '''  shipping_1024: [
    { id: 'SHP-1024-001', label: 'Standard Shipping Fee', amount: 42_000, detail: '₹12/order × ~3,500 orders' },
  ],''', content, flags=re.DOTALL)

# Replace storage
content = re.sub(r'  storage: \[.*?\],', '''  storage: [
    { id: 'STR-001', label: 'Contracted Storage', amount: 15_000, detail: '₹3/unit/month (prorated)' },
    { id: 'STR-002', label: 'Cold Storage Surcharge (Disputed)', amount: 42_000, detail: '2.5% of GMV — Not in contract' },
  ],''', content, flags=re.DOTALL)

# Replace storage_1024
content = re.sub(r'  storage_1024: \[.*?\],', '''  storage_1024: [
    { id: 'STR-1024-001', label: 'Contracted Storage', amount: 10_000, detail: '₹3/unit/month (prorated)' },
  ],''', content, flags=re.DOTALL)

with open('src/b2b/mock/blinkitRecon.ts', 'w') as f:
    f.write(content)
print("Fixed drilldowns")
