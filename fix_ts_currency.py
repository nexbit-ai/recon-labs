import re

with open('src/pages/TransactionSheet.tsx', 'r') as f:
    content = f.read()

# 1. formatCurrency inside TransactionSheet component
old_format_1 = """  // Format currency values
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };"""

new_format_1 = """  const getCurrencySymbol = () => selectedPlatform === 'amazon_uk' ? '£' : '₹';
  const getCurrencyLocale = () => selectedPlatform === 'amazon_uk' ? 'en-GB' : 'en-IN';

  // Format currency values
  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()}${amount.toLocaleString(getCurrencyLocale(), { minimumFractionDigits: 2 })}`;
  };"""

content = content.replace(old_format_1, new_format_1)

# There is also one in TransactionDetailsPopover
old_format_2 = """  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };"""

new_format_2 = """  // Format currency value
  const formatCurrency = (value: number) => {
    // In Popover, we should ideally use the platform, but it's not passed. 
    // Wait, the main component's formatCurrency is already passed as a prop!
    // But there is a local formatCurrency here. Let's just use the prop.
  };"""

# Wait! TransactionDetailsPopover has `formatCurrency` passed as a prop!
# `formatCurrency: (amount: number) => string;`
# BUT it defines its own `formatCurrency` inside? Let me see.
