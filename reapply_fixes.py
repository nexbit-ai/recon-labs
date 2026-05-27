import re

with open('src/pages/MarketplaceReconciliation.tsx', 'r') as f:
    content = f.read()

# 1. Reconciliation Summary -> Summary
content = content.replace('>Reconciliation Summary<', '>Summary<')

# 2. Reconciliation Status -> Status
content = content.replace('>Reconciliation Status<', '>Status<')

# 3. Remove Title Reconciliation
# We find: <Typography variant="h2" ...> Reconciliation </Typography>
content = re.sub(r'<Typography variant="h2"[^>]*>(\s*)Reconciliation(\s*)</Typography>', '', content)

# 4. Flatten MoM Table Design and freeze Month column
# First, apply size="small" to the Sales vs Settlement table
content = content.replace('<Table stickyHeader>', '<Table stickyHeader size="small">')

# Modify TableContainer scrollbars
table_container_style_pattern = r'<TableContainer\s+sx=\{\{([^}]*overflowX:\s*\'auto\',[^}]*)\}\}'
table_container_replacement = r"""<TableContainer sx={{\1
                    pb: 1,
                    '&::-webkit-scrollbar': { height: '4px' },
                    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px' },
                    '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(0,0,0,0.2)' }
                  }}"""
content = re.sub(table_container_style_pattern, table_container_replacement, content)

# Modify TableCell styling for Month column headers to be sticky
content = re.sub(
    r'<TableCell sx=\{\{\s*backgroundColor:\s*\'#f8fafc\',\s*fontWeight:\s*700,\s*color:\s*\'#374151\',\s*borderBottom:\s*\'2px solid #e5e7eb\',\s*minWidth:\s*100\s*\}\}>(\s*)Month(\s*)</TableCell>',
    r'''<TableCell sx={{
                            backgroundColor: '#ffffff',
                            fontWeight: 600,
                            color: '#64748b',
                            borderBottom: '1px solid #f1f3f4',
                            borderRight: '1px solid #e5e7eb',
                            minWidth: 100,
                            position: 'sticky',
                            left: 0,
                            zIndex: 3
                          }}>
                            Month
                          </TableCell>''',
    content
)

# Modify other headers to be flattened
content = re.sub(
    r'backgroundColor:\s*\'#f8fafc\',\s*fontWeight:\s*700,(\s*color:\s*[^,]+,)\s*borderBottom:\s*\'2px solid #e5e7eb\'',
    r"backgroundColor: '#ffffff',\n                                fontWeight: 600,\1\n                                borderBottom: '1px solid #f1f3f4'",
    content
)

# Modify Row zebra striping and Month cell sticky body
content = re.sub(
    r"backgroundColor: index % 2 === 0 \? '#ffffff' : '#f9fafb',\s*'&:hover': \{ backgroundColor: '#f5f3ff' \}",
    r"backgroundColor: '#ffffff',\n                                '&:hover': { backgroundColor: '#f1f5f9' }",
    content
)

# Make month cell sticky inside rows
content = re.sub(
    r"<TableCell sx=\{\{\s*fontWeight:\s*500,\s*color:\s*'#1f2937'\s*\}\}>\{row\.month\}</TableCell>",
    r"""<TableCell sx={{
                                fontWeight: 500,
                                color: '#1f2937',
                                position: 'sticky',
                                left: 0,
                                backgroundColor: 'inherit',
                                borderRight: '1px solid #e5e7eb',
                                zIndex: 1
                              }}>
                                {row.month}
                              </TableCell>""",
    content
)

# Make summary Total row sticky
content = re.sub(
    r"<TableCell sx=\{\{\s*fontWeight:\s*700,\s*color:\s*'#1f2937',\s*borderTop:\s*'2px solid #e5e7eb'\s*\}\}>Total</TableCell>",
    r"""<TableCell sx={{
                            fontWeight: 700,
                            color: '#1f2937',
                            borderTop: '2px solid #e5e7eb',
                            borderRight: '1px solid #e5e7eb',
                            position: 'sticky',
                            left: 0,
                            backgroundColor: 'inherit',
                            zIndex: 2
                          }}>
                            Total
                          </TableCell>""",
    content
)

with open('src/pages/MarketplaceReconciliation.tsx', 'w') as f:
    f.write(content)

print("Applied lost changes.")
