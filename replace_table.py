import re

with open('src/pages/TransactionSheet.tsx', 'r') as f:
    content = f.read()

# 1. Add import
if "import { TableVirtuoso } from 'react-virtuoso';" not in content:
    content = content.replace(
        "import ColumnFilterControls from '../components/ColumnFilterControls';",
        "import { TableVirtuoso } from 'react-virtuoso';\nimport ColumnFilterControls from '../components/ColumnFilterControls';"
    )

# 2. Extract TableHead logic
table_head_match = re.search(r'<TableHead sx={{.*?}}>\s*<TableRow>(.*?)</TableRow>\s*</TableHead>', content, re.DOTALL)
if not table_head_match:
    print("Could not find TableHead")
    exit(1)
table_head_content = table_head_match.group(1)

# 3. Extract Table cell logic
# We need everything inside the mapping: getCurrentColumns().map((column, colIndex) => { ... })
cell_logic_match = re.search(r'\{getCurrentColumns\(\)\.map\(\(column, colIndex\) => \{(.*?return \(\s*<TableCell.*?>.*?</TableCell>\s*\);\s*)\}\)\}', content, re.DOTALL)
if not cell_logic_match:
    print("Could not find cell logic")
    exit(1)
cell_logic = cell_logic_match.group(1)

# Modify the borderLeft logic to be on the first TableCell instead of TableRow
row_border_logic = """
                                  borderLeft: colIndex === 0 ? `4px solid ${activeTab === 0 ? '#10b981' : // Matched - green
                                      activeTab === 1 ? '#f59e0b' : // Mismatched - orange
                                        activeTab === 2 ? '#ef4444' : // Unsettled - red
                                          activeTab === 4 ? '#8b5cf6' : // Sales Report - purple
                                            '#6366f1' // All - indigo
                                    }` : 'none',
"""

# Find the TableCell in the cell logic and inject the borderLeft
cell_logic = re.sub(r'(<TableCell\s+key=\{.*?\}\s+sx=\{\{)', r'\1\n' + row_border_logic, cell_logic, count=1)

# 4. Replace the entire TableContainer block
table_container_pattern = r'<TableContainer sx=\{\{.*?</TableContainer>'

virtuoso_code = f"""<Paper sx={{{{ height: 'calc(100vh - 200px)', width: '100%', boxShadow: 'none', background: 'transparent' }}}}>
                <TableVirtuoso
                  data={{getCurrentData()}}
                  components={{{{
                    Scroller: React.forwardRef((props, ref) => <TableContainer {{...props}} ref={{ref}} />),
                    Table: (props) => <Table {{...props}} sx={{{{ tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0, '& .MuiTableCell-root': {{ border: 'none !important' }} }}}} />,
                    TableHead: React.forwardRef((props, ref) => <TableHead {{...props}} ref={{ref}} sx={{{{ '& .MuiTableCell-root': {{ border: 'none !important', borderBottom: '0.5px solid #e5e7eb !important', backgroundColor: '#f3f4f6' }} }}}} />),
                    TableRow: (props) => <TableRow {{...props}} sx={{{{ background: '#ffffff' }}}} />,
                    TableBody: React.forwardRef((props, ref) => <TableBody {{...props}} ref={{ref}} />),
                    EmptyPlaceholder: () => (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={{getCurrentColumns().length}} sx={{{{ textAlign: 'center', py: 4 }}}}>
                            {{paginationLoading && !isSorting ? (
                              <Box sx={{{{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}}}>
                                <CircularProgress size={{30}} sx={{{{ color: '#3b82f6' }}}} />
                                <Typography variant="body2" sx={{{{ color: '#6b7280', fontWeight: 500 }}}}>
                                  Loading page {{currentPage}}...
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{{{ color: '#6b7280' }}}}>
                                {{totalTransactionsData ? 'No transactions found.' : 'No data available.'}}
                              </Typography>
                            )}}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )
                  }}}}
                  fixedHeaderContent={{() => (
                    <TableRow>
                      {table_head_content}
                    </TableRow>
                  )}}
                  itemContent={{(index, row) => (
                    <>
                      {{getCurrentColumns().map((column, colIndex) => {{
{cell_logic}
                      }})}}
                    </>
                  )}}
                />
              </Paper>"""

new_content = re.sub(table_container_pattern, virtuoso_code, content, flags=re.DOTALL)

with open('src/pages/TransactionSheet.tsx', 'w') as f:
    f.write(new_content)

print("Done replacing")
