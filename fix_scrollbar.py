import re

with open('src/pages/MarketplaceReconciliation.tsx', 'r') as f:
    content = f.read()

# Modify TableContainer scrollbars
table_container_style_pattern = r'(<TableContainer\s+sx=\{\{[^}]*overflowX:\s*\'auto\'[^}]*)(\}\})'
table_container_replacement = r"""\1,
                    pb: 1,
                    '&::-webkit-scrollbar': { height: '4px' },
                    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px' },
                    '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(0,0,0,0.2)' }
                  \2"""
content = re.sub(table_container_style_pattern, table_container_replacement, content)

with open('src/pages/MarketplaceReconciliation.tsx', 'w') as f:
    f.write(content)

print("Applied scrollbar fix.")
