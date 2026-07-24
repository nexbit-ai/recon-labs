const fs = require('fs');
const path = './src/pages/TransactionSheet.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes('import { mockTransactionsApi }')) {
  content = content.replace(
    "import { api } from '../services/api';",
    "import { api } from '../services/api';\nimport { mockTransactionsApi } from './mockTransactionsApi';"
  );
}

// Replace api.transactions.getTotalTransactions with mockTransactionsApi.getTotalTransactions
content = content.replace(/api\.transactions\.getTotalTransactions/g, 'mockTransactionsApi.getTotalTransactions');

// Replace api.transactions.getSalesTransactions with mockTransactionsApi.getSalesTransactions
content = content.replace(/api\.transactions\.getSalesTransactions/g, 'mockTransactionsApi.getSalesTransactions');

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced API calls with mockTransactionsApi in TransactionSheet.tsx');
