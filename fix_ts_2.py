import re

with open('src/pages/TransactionSheet.tsx', 'r') as f:
    content = f.read()

# Remove the local formatCurrency in TransactionDetailsPopover
old_func = """  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };"""

content = content.replace(old_func, "")

with open('src/pages/TransactionSheet.tsx', 'w') as f:
    f.write(content)
