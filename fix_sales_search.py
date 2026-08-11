import re

with open('src/pages/TransactionSheet.tsx', 'r') as f:
    content = f.read()

# 1. Change color from #ef4444 to #111827
content = content.replace("color: '#ef4444'", "color: '#111827'")

# 2. Change state definition
content = content.replace(
    "const [showSalesReportSearch, setShowSalesReportSearch] = useState(false);",
    "const [showSalesReportSearch, setShowSalesReportSearch] = useState<string | null>(null);"
)

# 3. Change setShowSalesReportSearch(false) to setShowSalesReportSearch(null)
content = content.replace("setShowSalesReportSearch(false)", "setShowSalesReportSearch(null)")

# 4. Change toggle logic
content = content.replace(
    "setShowSalesReportSearch(!showSalesReportSearch);",
    "setShowSalesReportSearch(showSalesReportSearch === column ? null : column);"
)

# 5. Change active logic for the button styles
content = content.replace(
    "color: showSalesReportSearch ? '#1f2937' : '#6b7280',",
    "color: showSalesReportSearch === column ? '#1f2937' : '#6b7280',"
)
content = content.replace(
    "background: showSalesReportSearch ? '#e5e7eb' : 'transparent',",
    "background: showSalesReportSearch === column ? '#e5e7eb' : 'transparent',"
)

# 6. Change display logic for the Textfield Box
# We need to change:
# `(activeTab === 4 && showSalesReportSearch && ` to `(activeTab === 4 && showSalesReportSearch === column && `
content = content.replace(
    "(activeTab === 4 && showSalesReportSearch &&",
    "(activeTab === 4 && showSalesReportSearch === column &&"
)

with open('src/pages/TransactionSheet.tsx', 'w') as f:
    f.write(content)

print("Done")
