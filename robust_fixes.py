import re

with open('src/pages/MarketplaceReconciliation.tsx', 'r') as f:
    content = f.read()

# 1. Summary and Status text
content = re.sub(r'Reconciliation Summary', 'Summary', content)
content = re.sub(r'Reconciliation Status', 'Status', content)

# 2. Top Title "Reconciliation"
# The original code might look like:
# <Typography variant="h2" sx={{ fontWeight: 700, ... }}>
#   Reconciliation
# </Typography>
content = re.sub(r'<Typography[^>]*variant="h2"[^>]*>\s*Reconciliation\s*</Typography>', '', content)

# 3. Add height: 4px to all webkit-scrollbars if not already added properly
# I will find all `overflowX: 'auto'` and append the scrollbar styles.
# Wait, I already did this. Let's make sure.

with open('src/pages/MarketplaceReconciliation.tsx', 'w') as f:
    f.write(content)

print("Text replaced.")
