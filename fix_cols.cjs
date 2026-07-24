const fs = require('fs');
const path = './src/pages/TransactionSheet.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetFunctionStart = 'const getCurrentColumns = () => {';
let modifiedContent = content.replace(
  'const getCurrentColumns = () => {',
  `const getCurrentColumns = () => {
    const filterColumnsForActiveTab = (cols) => {
      if (activeTab === 0) {
        return cols.filter(title => title !== 'Difference');
      }
      return cols;
    };`
);

modifiedContent = modifiedContent.replace(
  'return [...prioritized, ...remaining].map(col => col.title);',
  'return filterColumnsForActiveTab([...prioritized, ...remaining].map(col => col.title));'
);

modifiedContent = modifiedContent.replace(
  'return currentData.columns?.map(col => col.title) || [];',
  'return filterColumnsForActiveTab(currentData.columns?.map(col => col.title) || []);'
);

modifiedContent = modifiedContent.replace(
  'return totalTransactionsData.columns?.map(col => col.title) || [];',
  'return filterColumnsForActiveTab(totalTransactionsData.columns?.map(col => col.title) || []);'
);

modifiedContent = modifiedContent.replace(
  'return visibleColumns;\n  };\n\n\n  // Rely on MUI Menu',
  'return filterColumnsForActiveTab(visibleColumns);\n  };\n\n\n  // Rely on MUI Menu'
);

fs.writeFileSync(path, modifiedContent, 'utf8');
console.log('Fixed getCurrentColumns in TransactionSheet.tsx');
