const fs = require('fs');

function replaceInFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/'Order Value'/g, "'Expected Payout'");
  content = content.replace(/"Order Value"/g, '"Expected Payout"');
  // Also replace in the mock data objects just in case
  content = content.replace(/"Order Value":/g, '"Expected Payout":');
  fs.writeFileSync(path, content, 'utf8');
}

replaceInFile('./src/pages/mockTransactionsApi.ts');
replaceInFile('./src/pages/TransactionSheet.tsx');
console.log('Renamed Order Value to Expected Payout');
