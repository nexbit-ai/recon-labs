import re

with open('src/pages/TransactionSheet.tsx', 'r') as f:
    content = f.read()

old_func = """  // Format currency values
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };"""

new_func = """  const getCurrencySymbol = () => selectedPlatform === 'amazon_uk' ? '£' : '₹';
  const getCurrencyLocale = () => selectedPlatform === 'amazon_uk' ? 'en-GB' : 'en-IN';

  // Format currency values
  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()}${amount.toLocaleString(getCurrencyLocale(), { minimumFractionDigits: 2 })}`;
  };"""

content = content.replace(old_func, new_func)

# Also update replacing regex to support £
content = content.replace(".replace(/[₹$,\\s]/g, '')", ".replace(/[£₹$,\\s]/g, '')")
content = content.replace(".replace(/[₹,$\\s]/g, '')", ".replace(/[£₹,$\\s]/g, '')")

with open('src/pages/TransactionSheet.tsx', 'w') as f:
    f.write(content)
