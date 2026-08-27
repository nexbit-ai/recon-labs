import re

with open('src/b2b/mock/blinkitRecon.ts', 'r') as f:
    content = f.read()

# Fix hero variables
content = re.sub(r'const heroCommission = 39_690;', 'const heroCommission = 3_96_900;', content)
content = re.sub(r'const heroCommissionGST = 7_144;', 'const heroCommissionGST = 71_442;', content)
content = re.sub(r'const heroExpected = heroRevenue - heroCommission - heroCommissionGST - heroShipping - heroShippingGST - heroStorage - heroCourier - heroTDS - heroTCS - heroCNDN \+ heroOther;\n// heroExpected = 16,87,420 ✓\nconst heroActual = 15_35_420; // 16,87,420 - 1,52,000\nconst heroDifference = heroExpected - heroActual; // 1,52,000 ✓', 
'''const heroExpected = heroRevenue - heroCommission - heroCommissionGST - heroShipping - heroShippingGST - heroStorage - heroCourier - heroTDS - heroTCS - heroCNDN + heroOther;
// heroExpected = 12,65,912
const heroActual = 11_13_912; // 12,65,912 - 1,52,000
const heroDifference = heroExpected - heroActual; // 1,52,000 ✓''', content)

# Fix BLK-SET-1025 text
content = re.sub(r'calculation: \'₹19,84,500 × 2\.0% = ₹39,690\'', 'calculation: \'₹19,84,500 × 20.0% = ₹3,96,900\'', content)
content = re.sub(r'calculation: \'₹39,690 × 18\.0% = ₹7,144\'', 'calculation: \'₹3,96,900 × 18.0% = ₹71,442\'', content)

# Fix BLK-SET-1024
content = re.sub(r'expected: 10_00_000,\n    actual: 10_00_000,', 'expected: 7_33_270,\n    actual: 7_33_270,', content)
content = re.sub(r"\{ label: 'Commission', amount: 25_116, type: 'deduction', detailKey: 'commission_1024' \}", "{ label: 'Commission', amount: 2_51_155, type: 'deduction', detailKey: 'commission_1024' }", content)
content = re.sub(r"\{ label: 'Commission GST', amount: 4_521, type: 'deduction' \}", "{ label: 'Commission GST', amount: 45_208, type: 'deduction' }", content)
content = re.sub(r"\{ label: 'TCS', amount: 25_116, type: 'deduction' \}", "{ label: 'TCS', amount: 25_116, type: 'deduction' }", content)

# Write back
with open('src/b2b/mock/blinkitRecon.ts', 'w') as f:
    f.write(content)
print("Updated blinkitRecon.ts")
