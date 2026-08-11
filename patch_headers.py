import re

with open('src/pages/TransactionSheet.tsx', 'r') as f:
    content = f.read()

# We need to find the Box containing the Column Header and replace it with a conditional.
# We also want to integrate the TextFields inline.

# The pattern is basically:
# <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
#   {/* Column Header */}
#   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
# ...
#                             {/* Order ID Search Bar - Floating Popover */}
#                             {column === 'Order ID' && showOrderIdSearch && activeTab !== 4 && (
# ...
#                             )}
#                             {/* Sales Report Search Bar - Floating Popover */}
#                             {activeTab === 4 && showSalesReportSearch && ...
# ...
#                             )}
#                           </Box>

# It's better to just write a simple state machine to replace these blocks.

blocks = content.split("getCurrentColumns().map((column, index) => (")
if len(blocks) == 1:
    blocks = content.split("getCurrentColumns().map((column, colIndex) => {") # check if there's any mismatch
    print("Could not split by getCurrentColumns().map((column, index) => (")

new_content = blocks[0]
for idx in range(1, len(blocks)):
    block = blocks[idx]
    
    # Check if this is the TableHead block by looking for "Column Header"
    if "{/* Column Header */}" in block and "Order ID Search Bar" in block:
        # We replace the entire <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}> ... </Box>
        start_idx = block.find("<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>")
        
        # find the matching closing </Box>
        box_count = 0
        end_idx = -1
        i = start_idx
        while i < len(block):
            if block[i:i+4] == "<Box":
                box_count += 1
            elif block[i:i+6] == "</Box>":
                box_count -= 1
                if box_count == 0:
                    end_idx = i + 6
                    break
            i += 1
            
        if end_idx != -1:
            original_box = block[start_idx:end_idx]
            
            # Extract the header part
            header_start = original_box.find("{/* Column Header */}")
            header_end = original_box.find("{/* Order ID Search Bar")
            header_content = original_box[header_start:header_end]
            
            # Extract the Order ID search bar TextField
            order_id_tf_start = original_box.find("<TextField", header_end)
            order_id_tf_end = original_box.find("</Box>", order_id_tf_start)
            order_id_tf = original_box[order_id_tf_start:order_id_tf_end].strip()
            
            # Add close button to Order ID TextField Adornment
            order_id_tf = order_id_tf.replace(
                "<InputAdornment position=\"end\">",
                "<InputAdornment position=\"end\">\n" +
                "                                        <IconButton size=\"small\" onClick={() => { setShowOrderIdSearch(false); if(orderIdSearch) { handleOrderIdSearchClear(); } }} sx={{ p: 0.5, mr: 0.25 }}>\n" +
                "                                          <CloseIcon sx={{ fontSize: '1rem', color: '#6b7280' }} />\n" +
                "                                        </IconButton>"
            )
            # Remove the old Floating Popover box styles from textfield
            
            # Extract the Sales Report search bar TextField
            sales_tf_box_start = original_box.find("{/* Sales Report Search Bar")
            sales_tf_start = original_box.find("<TextField", sales_tf_box_start)
            sales_tf_end = original_box.find("</Box>", sales_tf_start)
            if sales_tf_start != -1 and sales_tf_end != -1:
                sales_tf = original_box[sales_tf_start:sales_tf_end].strip()
                sales_tf = sales_tf.replace(
                    "<InputAdornment position=\"end\">",
                    "<InputAdornment position=\"end\">\n" +
                    "                                          <IconButton size=\"small\" onClick={() => { setShowSalesReportSearch(false); if(salesReportSearch) { handleSalesReportSearchClear(); } }} sx={{ p: 0.5, mr: 0.25 }}>\n" +
                    "                                            <CloseIcon sx={{ fontSize: '1rem', color: '#6b7280' }} />\n" +
                    "                                          </IconButton>"
                )
            else:
                sales_tf = "null"

            replacement = """
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', minHeight: '32px', justifyContent: 'center' }}>
                            {(column === 'Order ID' && showOrderIdSearch && activeTab !== 4) ? (
                              __ORDER_ID_TF__
                            ) : (activeTab === 4 && showSalesReportSearch && 
                                (['Order ID', 'Order Item ID', 'HSN', 'Marketplace SKU Code'].includes(column) || 
                                 ['order_id', 'order_item_id', 'hsn', 'marketplace_sku_code'].includes(salesReportData?.columns?.find(col => col.title === column)?.key || ''))) ? (
                              __SALES_TF__
                            ) : (
                              __HEADER_CONTENT__
                            )}
                          </Box>
            """.replace("__ORDER_ID_TF__", order_id_tf).replace("__SALES_TF__", sales_tf).replace("__HEADER_CONTENT__", header_content)
            
            new_content += "getCurrentColumns().map((column, index) => (" + block[:start_idx] + replacement + block[end_idx:]
        else:
            print("Could not find end of Box in block", idx)
            new_content += "getCurrentColumns().map((column, index) => (" + block
    else:
        new_content += "getCurrentColumns().map((column, index) => (" + block

with open('src/pages/TransactionSheet.tsx', 'w') as f:
    f.write(new_content)

print("Done")
