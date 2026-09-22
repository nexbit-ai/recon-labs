const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'src/pages/PODashboard.tsx',
    changes: [
      { from: 'Purchase_Orders_MTD_', to: 'Invoices_MTD_' },
      { from: 'purchase order records', to: 'invoice records' },
      { from: 'Total purchase orders', to: 'Total invoices' },
      { from: '<span>PO ID</span>', to: '<span>Invoice ID</span>' },
      { from: 'No purchase orders match', to: 'No invoices match' },
      { from: 'placeholder="Filter PO ID..."', to: 'placeholder="Filter Invoice ID..."' },
    ]
  },
  {
    file: 'src/pages/PODetailsPage.tsx',
    changes: [
      { from: 'Total PO Amount', to: 'Total Invoice Amount' },
      { from: 'PO Details', to: 'Invoice Details' },
      { from: '<DetailItem label="PO ID"', to: '<DetailItem label="INVOICE ID"' },
      { from: '<DetailItem label="PO DATE"', to: '<DetailItem label="INVOICE DATE"' },
      { from: 'label="PO AMOUNT"', to: 'label="INVOICE AMOUNT"' },
      { from: 'There is currently no invoice associated with this Purchase Order. You can automate the invoice creation process based on the PO details.', to: 'There is currently no external invoice associated with this Invoice. You can automate the external invoice creation process based on the invoice details.' },
      { from: 'description="Fetched PO from email contents"', to: 'description="Fetched Invoice from email contents"' }
    ]
  },
  {
    file: 'src/components/po-dashboard/POFiltersDrawer.tsx',
    changes: [
      { from: 'Filter Purchase Orders', to: 'Filter Invoices' },
      { from: 'PO Date Range', to: 'Invoice Date Range' }
    ]
  },
  {
    file: 'src/components/po-dashboard/POExpandedRow.tsx',
    changes: [
      { from: "title: 'PO Created'", to: "title: 'Invoice Created'" },
      { from: '{/* Vero AI Intelligence Banner for the PO */}', to: '{/* Vero AI Intelligence Banner for the Invoice */}' },
      { from: 'PO Fulfillment Health Score', to: 'Invoice Fulfillment Health Score' },
      { from: 'in this purchase order', to: 'in this invoice' }
    ]
  }
];

const workspaceDir = '/Users/krishna/repos/recon-labs';

replacements.forEach(({ file, changes }) => {
  const filePath = path.join(workspaceDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    changes.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated UI strings in ${file}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
