const fs = require('fs');
const path = require('path');

const mockDataPath = path.join('/Users/krishna/repos/recon-labs/src/data/mockPOData.ts');

if (fs.existsSync(mockDataPath)) {
  let content = fs.readFileSync(mockDataPath, 'utf8');

  // Replace IDs
  content = content.replace(/PO-/g, 'INV-');

  // Replace labels in ALL_PO_COLUMNS
  content = content.replace(/{ key: 'id', label: 'PO ID'/g, "{ key: 'id', label: 'Invoice ID'");
  content = content.replace(/{ key: 'poDate', label: 'PO DATE'/g, "{ key: 'poDate', label: 'INVOICE DATE'");
  content = content.replace(/{ key: 'poAmount', label: 'PO AMOUNT'/g, "{ key: 'poAmount', label: 'INVOICE AMOUNT'");

  // Replace purchase order text in comments and data
  content = content.replace(/Purchase Orders/g, 'Invoices');
  content = content.replace(/purchase orders/g, 'invoices');
  content = content.replace(/Purchase Order/g, 'Invoice');
  content = content.replace(/purchase order/g, 'invoice');

  fs.writeFileSync(mockDataPath, content, 'utf8');
  console.log(`Updated mockPOData.ts`);
} else {
  console.log('mockPOData.ts not found');
}
