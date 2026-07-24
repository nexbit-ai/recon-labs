const fs = require('fs');
const path = './src/pages/mockTransactionsApi.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace MOCK_COLUMNS
content = content.replace(
  /{ key: 'event_type', title: 'Event Type', type: 'enum', values: \['Sale', 'Return', 'Cancelled'\] },\n\s*{ key: 'recon_status', title: 'Recon Status', type: 'enum', values: \['settlement_matched', 'less_payment_received', 'more_payment_received', 'unsettled'\] },/g,
  "{ key: 'recon_status', title: 'Status', type: 'enum', values: ['settlement_matched', 'less_payment_received', 'more_payment_received', 'unsettled'] },"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated MOCK_COLUMNS in mockTransactionsApi.ts');
