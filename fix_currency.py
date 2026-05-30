import re

with open('src/pages/MarketplaceReconciliation.tsx', 'r') as f:
    content = f.read()

# 1. Update formatCurrency definition
old_format = """  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };"""

new_format = """  const getCurrencySymbol = () => selectedPlatform === 'amazon_uk' ? '£' : '₹';
  const getCurrencyLocale = () => selectedPlatform === 'amazon_uk' ? 'en-GB' : 'en-IN';

  const formatCurrency = (amount: number, noFractions: boolean = false) => {
    const symbol = getCurrencySymbol();
    const locale = getCurrencyLocale();
    if (noFractions) {
      return `${symbol}${amount.toLocaleString(locale)}`;
    }
    return `${symbol}${amount.toLocaleString(locale, { minimumFractionDigits: 2 })}`;
  };"""

content = content.replace(old_format, new_format)

# 2. Replace hardcoded ₹ and en-IN in specific places
# Metric amount
content = content.replace("₹{Math.round(Number(amount || 0)).toLocaleString('en-IN')}",
                          "{getCurrencySymbol()}{Math.round(Number(amount || 0)).toLocaleString(getCurrencyLocale())}")

# Prev returns amount
content = content.replace("₹{Math.round(prevReturnOrCancelledAmount).toLocaleString('en-IN')}",
                          "{getCurrencySymbol()}{Math.round(prevReturnOrCancelledAmount).toLocaleString(getCurrencyLocale())}")

# Table columns
content = content.replace("{ key: 'sales', label: 'Sales (₹)' },",
                          "{ key: 'sales', label: `Sales (${getCurrencySymbol()})` },")
content = content.replace("{ key: 'settlement', label: 'Settlement (₹)' }",
                          "{ key: 'settlement', label: `Settlement (${getCurrencySymbol()})` }")

content = content.replace(">Sales (₹)<", ">{`Sales (${getCurrencySymbol()})`}<")
content = content.replace(">Settlement (₹)<", ">{`Settlement (${getCurrencySymbol()})`}<")

with open('src/pages/MarketplaceReconciliation.tsx', 'w') as f:
    f.write(content)
