with open('src/pages/TransactionSheet.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "{activeTab === 4 && showSalesReportSearch &&",
    "{activeTab === 4 && showSalesReportSearch === column &&"
)

with open('src/pages/TransactionSheet.tsx', 'w') as f:
    f.write(content)

print("Done")
