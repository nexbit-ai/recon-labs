import re

with open('src/b2b/mock/blinkitRecon.ts', 'r') as f:
    content = f.read()

# Add missing variables that were accidentally deleted
content = re.sub(
    r"const heroPayable = 25_00_000;",
    "const heroCourier = 8_500;\nconst heroTCS = 0;\nconst heroPayable = 25_00_000;",
    content
)

with open('src/b2b/mock/blinkitRecon.ts', 'w') as f:
    f.write(content)
print("Fixed compiler errors")
