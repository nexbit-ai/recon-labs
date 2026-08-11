import re

with open('src/pages/TransactionSheet.tsx', 'r') as f:
    content = f.read()

# We look for `{getCurrentColumns().map((column, index) => (`
# And we want to replace the `<TableCell ...>` block up to its closing `</TableCell>`

blocks = content.split("{getCurrentColumns().map((column, index) => (")
if len(blocks) != 4:
    print(f"Error: Found {len(blocks)} blocks instead of 4.")
    exit(1)

new_content = blocks[0]

for idx in range(1, 4):
    block = blocks[idx]
    
    # The block starts immediately after `(`
    # It should look like: `\n<TableCell ... \n`
    
    start_idx = block.find("<TableCell")
    
    # We need to find the matching </TableCell>
    cell_count = 0
    end_idx = -1
    i = start_idx
    while i < len(block):
        if block[i:i+10] == "<TableCell":
            cell_count += 1
            i += 10
        elif block[i:i+11] == "</TableCell":
            cell_count -= 1
            if cell_count == 0:
                end_idx = i + 12
                break
            i += 11
        else:
            i += 1
            
    if end_idx != -1:
        old_cell = block[start_idx:end_idx]
        
        # We need to modify old_cell to render the search inline.
        # old_cell has:
        # <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        #   {/* Column Header */}
        #   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        #   ... text and icons ...
        #   </Box>
        #   {/* Order ID Search Bar - Floating Popover */}
        #   {column === 'Order ID' && ... <Box ... <TextField ... /> </Box>}
        #   {/* Sales Report Search Bar - Floating Popover */}
        #   {activeTab === 4 && ... <Box ... <TextField ... /> </Box>}
        # </Box>
        
        # We will rip out the two TextFields.
        # Order ID TextField:
        order_tf_start = old_cell.find("<TextField", old_cell.find("Order ID Search Bar - Floating Popover"))
        order_tf_end = old_cell.find("</Box>", order_tf_start)
        order_tf = old_cell[order_tf_start:order_tf_end].strip() if order_tf_start != -1 else ""
        
        # Sales Report TextField:
        sales_tf_start = old_cell.find("<TextField", old_cell.find("Sales Report Search Bar - Floating Popover"))
        sales_tf_end = old_cell.find("</Box>", sales_tf_start)
        sales_tf = old_cell[sales_tf_start:sales_tf_end].strip() if sales_tf_start != -1 else ""
        
        # Replace the <InputAdornment> inside order_tf to include a CloseIcon
        if order_tf:
            order_tf = order_tf.replace(
                "<InputAdornment position=\"end\">",
                "<InputAdornment position=\"end\">\n" +
                "                                        <IconButton size=\"small\" onClick={() => { setShowOrderIdSearch(false); handleOrderIdSearchClear(); }} sx={{ p: 0.5, mr: 0.25 }}><CloseIcon sx={{ fontSize: '1rem', color: '#6b7280' }} /></IconButton>"
            )
            # Remove the fixed width and background from TextField styles, make it fill
            order_tf = order_tf.replace("width: '100%',", "flex: 1,")

        if sales_tf:
            sales_tf = sales_tf.replace(
                "<InputAdornment position=\"end\">",
                "<InputAdornment position=\"end\">\n" +
                "                                          <IconButton size=\"small\" onClick={() => { setShowSalesReportSearch(false); handleSalesReportSearchClear(); }} sx={{ p: 0.5, mr: 0.25 }}><CloseIcon sx={{ fontSize: '1rem', color: '#6b7280' }} /></IconButton>"
            )
            # Find and replace the width: '280px' with flex: 1
            sales_tf = re.sub(r"width:\s*'[^']+',", "flex: 1,", sales_tf)
            
        # Extract the original header (text + icons)
        header_box_start = old_cell.find("<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>")
        header_box_end = old_cell.find("{/* Order ID Search Bar", header_box_start)
        # backtrack to </Box>
        header_box_end = old_cell.rfind("</Box>", header_box_start, header_box_end) + 6
        header_box = old_cell[header_box_start:header_box_end]
        
        # Now we replace the outer box with our new inline logic
        outer_box_start = old_cell.find("<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>")
        outer_box_end = old_cell.rfind("</Box>") + 6
        
        new_outer_box = """<Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '32px' }}>
                              {(column === 'Order ID' && showOrderIdSearch && activeTab !== 4) ? (
                                __ORDER_TF__
                              ) : (activeTab === 4 && showSalesReportSearch && 
                                  (['Order ID', 'Order Item ID', 'HSN', 'Marketplace SKU Code'].includes(column) || 
                                   ['order_id', 'order_item_id', 'hsn', 'marketplace_sku_code'].includes(salesReportData?.columns?.find(col => col.title === column)?.key || ''))) ? (
                                __SALES_TF__
                              ) : (
                                __HEADER_BOX__
                              )}
                            </Box>""".replace("__ORDER_TF__", order_tf).replace("__SALES_TF__", sales_tf).replace("__HEADER_BOX__", header_box)
        
        new_cell = old_cell[:outer_box_start] + new_outer_box + old_cell[outer_box_end:]
        new_content += "{getCurrentColumns().map((column, index) => (" + block[:start_idx] + new_cell + block[end_idx:]
    else:
        print(f"Could not find closing TableCell for block {idx}")

with open('src/pages/TransactionSheet.tsx', 'w') as f:
    f.write(new_content)

print("Done")
