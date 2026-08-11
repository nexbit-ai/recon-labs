import re

with open('src/pages/TransactionSheet.tsx', 'r') as f:
    content = f.read()

# Replace Order ID Search Bar - Floating Popover styles
old_order_box_styles = """                                  position: 'absolute',
                                  top: 'calc(100% + 4px)',
                                  left: 0,
                                  zIndex: 20,
                                  background: '#ffffff',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                  padding: '4px',
                                  border: '1px solid #e5e7eb',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  width: 'calc(100% - 16px)',
                                  animation: 'slideDown 0.2s ease-out forwards',
                                  '@keyframes slideDown': {
                                    '0%': { transform: 'translateY(-10px)', opacity: 0 },
                                    '100%': { transform: 'translateY(0)', opacity: 1 }
                                  }"""

new_order_box_styles = """                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  zIndex: 20,
                                  background: '#f3f4f6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0 4px'"""
content = content.replace(old_order_box_styles, new_order_box_styles)

# Replace Sales Report Search Bar - Floating Popover styles (has a slightly different comma placement)
old_sales_box_styles = """                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0,
                                    zIndex: 20,
                                    background: '#ffffff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    padding: '4px',
                                    border: '1px solid #e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    width: 'calc(100% - 16px)',
                                    animation: 'slideDown 0.2s ease-out forwards'
                                    , '@keyframes slideDown': {
                                      '0%': { transform: 'translateY(-10px)', opacity: 0 },
                                      '100%': { transform: 'translateY(0)', opacity: 1 }
                                    }"""
new_sales_box_styles = """                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 20,
                                    background: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 4px'"""
content = content.replace(old_sales_box_styles, new_sales_box_styles)

# Modify InputProps to add Close icon for Order ID
old_order_input = """                                      <InputAdornment position="end">
                                        {orderIdSearch?.trim() && (
                                          <IconButton
                                            size="small"
                                            onClick={handleOrderIdSearchClear}
                                            disabled={(loading || quadApiLoading) && !isSorting}
                                            sx={{ p: 0.5, mr: 0.25 }}
                                          >
                                            <ClearIcon sx={{ fontSize: '1rem', color: '#6b7280' }} />
                                          </IconButton>
                                        )}
                                        <IconButton
                                          size="small"
                                          onClick={handleOrderIdSearchClick}
                                          disabled={(loading || quadApiLoading) && !isSorting}
                                          sx={{ p: 0.5 }}
                                        >
                                          <SearchIcon sx={{ fontSize: '1rem', color: '#3b82f6' }} />
                                        </IconButton>
                                      </InputAdornment>"""
new_order_input = """                                      <InputAdornment position="end">
                                        {orderIdSearch?.trim() && (
                                          <IconButton
                                            size="small"
                                            onClick={handleOrderIdSearchClear}
                                            disabled={(loading || quadApiLoading) && !isSorting}
                                            sx={{ p: 0.5, mr: 0.25 }}
                                          >
                                            <ClearIcon sx={{ fontSize: '1rem', color: '#6b7280' }} />
                                          </IconButton>
                                        )}
                                        <IconButton
                                          size="small"
                                          onClick={() => { setShowOrderIdSearch(false); handleOrderIdSearchClear(); }}
                                          sx={{ p: 0.5, mr: 0.25 }}
                                        >
                                          <CloseIcon sx={{ fontSize: '1rem', color: '#ef4444' }} />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={handleOrderIdSearchClick}
                                          disabled={(loading || quadApiLoading) && !isSorting}
                                          sx={{ p: 0.5 }}
                                        >
                                          <SearchIcon sx={{ fontSize: '1rem', color: '#3b82f6' }} />
                                        </IconButton>
                                      </InputAdornment>"""
content = content.replace(old_order_input, new_order_input)

# Modify InputProps to add Close icon for Sales Report
old_sales_input = """                                        <InputAdornment position="end">
                                          {salesReportSearch?.trim() && (
                                            <IconButton
                                              size="small"
                                              onClick={handleSalesReportSearchClear}
                                              disabled={salesReportLoading && !isSorting}
                                              sx={{ p: 0.5, mr: 0.25 }}
                                            >
                                              <ClearIcon sx={{ fontSize: '1rem', color: '#6b7280' }} />
                                            </IconButton>
                                          )}
                                          <IconButton
                                            size="small"
                                            onClick={handleSalesReportSearchClick}
                                            disabled={salesReportLoading && !isSorting}
                                            sx={{ p: 0.5 }}
                                          >
                                            <SearchIcon sx={{ fontSize: '1rem', color: '#3b82f6' }} />
                                          </IconButton>
                                        </InputAdornment>"""
new_sales_input = """                                        <InputAdornment position="end">
                                          {salesReportSearch?.trim() && (
                                            <IconButton
                                              size="small"
                                              onClick={handleSalesReportSearchClear}
                                              disabled={salesReportLoading && !isSorting}
                                              sx={{ p: 0.5, mr: 0.25 }}
                                            >
                                              <ClearIcon sx={{ fontSize: '1rem', color: '#6b7280' }} />
                                            </IconButton>
                                          )}
                                          <IconButton
                                            size="small"
                                            onClick={() => { setShowSalesReportSearch(false); handleSalesReportSearchClear(); }}
                                            sx={{ p: 0.5, mr: 0.25 }}
                                          >
                                            <CloseIcon sx={{ fontSize: '1rem', color: '#ef4444' }} />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={handleSalesReportSearchClick}
                                            disabled={salesReportLoading && !isSorting}
                                            sx={{ p: 0.5 }}
                                          >
                                            <SearchIcon sx={{ fontSize: '1rem', color: '#3b82f6' }} />
                                          </IconButton>
                                        </InputAdornment>"""
content = content.replace(old_sales_input, new_sales_input)

with open('src/pages/TransactionSheet.tsx', 'w') as f:
    f.write(content)

print("Done")
