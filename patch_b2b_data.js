const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/b2b/mock/b2bReconData.ts');
let code = fs.readFileSync(file, 'utf8');

// 1. Add tds to B2BInvoice
code = code.replace(/grossAmount: number;\n/g, "grossAmount: number;\n  tds: number;\n");

// 2. Add tds to FIFOAllocationRecord
code = code.replace(/grossInvoiceAmount: number;\n/g, "grossInvoiceAmount: number;\n  tds: number;\n");

// 3. Update the Omit type in RAW_INVOICES_*
code = code.replace(/Omit<B2BInvoice, 'settledAmount' \| 'balanceDue' \| 'fifoStatus' \| 'settlingUtrId' \| 'fifoRank'>/g, "Omit<B2BInvoice, 'settledAmount' | 'balanceDue' | 'fifoStatus' | 'settlingUtrId' | 'fifoRank' | 'tds'>");

// 4. Before runFIFOAllocation, we map over the arrays. Wait, we can just edit runFIFOAllocation to take in Omit<...|'tds'> and add TDS inside it!
code = code.replace(
  /export function runFIFOAllocation\(\n  invoices: Omit<B2BInvoice, 'settledAmount' \| 'balanceDue' \| 'fifoStatus' \| 'settlingUtrId' \| 'fifoRank' \| 'tds'>\[\],\n  lumpSumAmount: number,\n  utrId: string\n\)/,
  "export function runFIFOAllocation(\n  rawInvoices: Omit<B2BInvoice, 'settledAmount' | 'balanceDue' | 'fifoStatus' | 'settlingUtrId' | 'fifoRank' | 'tds'>[],\n  lumpSumAmount: number,\n  utrId: string\n)"
);

code = code.replace(
  /\/\/ 1. Sort invoices strictly chronologically \(Oldest first\)\n  const sorted = \[\.\.\.invoices\]/g,
  "const invoices = rawInvoices.map(inv => {\n    const tds = inv.grossAmount * 0.1;\n    const netPayable = inv.grossAmount - tds - inv.creditNotesTotal - inv.debitNotesTotal;\n    return { ...inv, tds, netPayable };\n  });\n\n  // 1. Sort invoices strictly chronologically (Oldest first)\n  const sorted = [...invoices]"
);

code = code.replace(
  /grossInvoiceAmount: inv.grossAmount,\n      adjustments: netAdjustments,/g,
  "grossInvoiceAmount: inv.grossAmount,\n      tds: inv.tds,\n      adjustments: netAdjustments,"
);

fs.writeFileSync(file, code);
