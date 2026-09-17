const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/data/mockPOData.ts',
  'src/pages/PODashboard.tsx',
  'src/pages/PODetailsPage.tsx',
  'src/components/po-dashboard/POSummaryCard.tsx',
  'src/components/po-dashboard/POColumnsModal.tsx',
  'src/components/po-dashboard/POFiltersDrawer.tsx',
  'src/components/po-dashboard/POExpandedRow.tsx',
];

const workspaceDir = '/Users/krishna/repos/recon-labs';

filesToUpdate.forEach((relPath) => {
  const filePath = path.join(workspaceDir, relPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace IDs
    content = content.replace(/PO-/g, 'INV-');
    
    // Replace keys
    content = content.replace(/poAmount/g, 'invoiceAmount');
    content = content.replace(/poDate/g, 'invoiceDate');
    content = content.replace(/totalPos/g, 'totalInvoices');
    content = content.replace(/poSummaryMetrics/g, 'invoiceSummaryMetrics');
    
    // Some mock data fixes
    content = content.replace(/Purchase Orders/g, 'Invoices');
    content = content.replace(/Purchase Order/g, 'Invoice');
    content = content.replace(/purchase orders/gi, 'invoices');
    content = content.replace(/purchase order/gi, 'invoice');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
