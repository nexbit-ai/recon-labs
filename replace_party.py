import re

with open('src/pages/MarketplaceReconciliation.tsx', 'r') as f:
    content = f.read()

start_marker = "                <Grid container spacing={3}>"
end_marker = "                {/* Courier breakdown table */}"

# Using regex to match from the Grid container start down to the end of the CardContent where Party Composition ends.
# The card ends before:
#         {/* Payment Ageing Analysis (replaces Sales Dashboard) */}

pattern = r'<Grid container spacing=\{3\}>.*?(?=</CardContent>)'

replacement = """<Grid container spacing={4} alignItems="center">
                  {/* Left: Donut Chart & KPIs */}
                  <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                     <Box sx={{ height: 320, width: '100%', position: 'relative' }}>
                        {courierData.length > 0 ? (
                          <>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={courierData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius="65%"
                                  outerRadius="85%"
                                  paddingAngle={2}
                                  cornerRadius={4}
                                  dataKey="orderCount"
                                  stroke="none"
                                >
                                  {courierData.map((p, idx) => (
                                    <Cell key={`courier-${idx}`} fill={p.color} />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  formatter={(value: any, name: string, props: any) => [
                                    `${Number(value).toLocaleString('en-IN')} orders (${props.payload.percentage.toFixed(1)}%)`,
                                    props.payload.name
                                  ]}
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <Box sx={{
                               position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                               display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
                            }}>
                               <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total Orders</Typography>
                               <Typography variant="h4" sx={{ color: '#1f2937', fontWeight: 700, mt: 0.5 }}>{totalOrderCount.toLocaleString('en-IN')}</Typography>
                            </Box>
                          </>
                        ) : (
                          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #e5e7eb', borderRadius: '16px' }}>
                            <Typography color="text.secondary">No data</Typography>
                          </Box>
                        )}
                     </Box>
                  </Grid>

                  {/* Right: Sleek Data Table */}
                  <Grid item xs={12} md={7}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                       <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Selling Price</Typography>
                          <Typography variant="h5" sx={{ color: '#1f2937', fontWeight: 700 }}>{formatCurrency(d2cTotal?.total_selling_price || 0)}</Typography>
                       </Box>
                    </Box>
                    <TableContainer component={Box} sx={{ border: '1px solid #f1f3f4', borderRadius: '12px', overflow: 'hidden' }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ color: '#475569', fontWeight: 600, borderBottom: '1px solid #f1f3f4', py: 1.5 }}>Courier Partner</TableCell>
                            <TableCell align="right" sx={{ color: '#475569', fontWeight: 600, borderBottom: '1px solid #f1f3f4', py: 1.5 }}>Orders</TableCell>
                            <TableCell sx={{ color: '#475569', fontWeight: 600, borderBottom: '1px solid #f1f3f4', py: 1.5 }}>Share</TableCell>
                            <TableCell align="right" sx={{ color: '#475569', fontWeight: 600, borderBottom: '1px solid #f1f3f4', py: 1.5 }}>Revenue</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {courierData.map((courier, idx) => (
                            <TableRow key={courier.name} sx={{ '&:last-child td': { borderBottom: 0 }, '&:hover': { bgcolor: '#f8fafc' }, transition: 'background-color 0.2s' }}>
                              <TableCell sx={{ borderBottom: '1px solid #f1f3f4', py: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: courier.color }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{courier.name}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: '1px solid #f1f3f4', py: 1.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                  {courier.orderCount.toLocaleString('en-IN')}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ width: '35%', borderBottom: '1px solid #f1f3f4', py: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Box sx={{ flex: 1, height: 6, bgcolor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                    <Box sx={{ width: `${courier.percentage}%`, height: '100%', bgcolor: courier.color, borderRadius: 3 }} />
                                  </Box>
                                  <Typography variant="caption" sx={{ width: 36, color: '#64748b', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                    {courier.percentage.toFixed(1)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: '1px solid #f1f3f4', py: 1.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                  {formatCurrency(courier.totalSellingPrice)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
"""

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/pages/MarketplaceReconciliation.tsx', 'w') as f:
    f.write(new_content)

print("Done replacing Party Composition")
