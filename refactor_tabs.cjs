const fs = require('fs');
let content = fs.readFileSync('src/pages/OperationsCentre.tsx', 'utf8');

// Replace tab state initialization
content = content.replace(
  /const \[disputeSubTab, setDisputeSubTab\] = useState<number>\(0\); \/\/ 0: unreconciled, 1: manually reconciled, 2: disputed/,
  'const [disputeSubTab, setDisputeSubTab] = useState<number>(0); // 0: disputed, 1: unreconciled'
);

// getApiRows
content = content.replace(
  /if \(disputeSubTab === 0\) return unreconciledRows;\n    if \(disputeSubTab === 1\) return manuallyReconciledRows;\n    return disputedRows;/,
  'if (disputeSubTab === 1) return unreconciledRows;\n    return disputedRows;'
);

// buildQueryParams
content = content.replace(
  /if \(currentTab === 0 && !f\['Status'\]\)/,
  "if (currentTab === 1 && !f['Status'])"
);

// useEffect for filtered data
content = content.replace(
  /if \(disputeSubTab === 0\) rows = unreconciledRows;\n    else if \(disputeSubTab === 1\) rows = manuallyReconciledRows;\n    else rows = disputedRows;/,
  'if (disputeSubTab === 1) rows = unreconciledRows;\n    else rows = disputedRows;'
);

// visibleIds
content = content.replace(
  /const visibleIds: string\[\] = disputeSubTab === 0\n      \? paginatedCurrent\.map\(\(row: any\) => row\["Order ID"\] || row\.originalData\?\.order_item_id || row\.originalData\?\.order_id || ''\)\n      : current\.map\(\(row: any\) => row\["Order ID"\] || row\.originalData\?\.order_item_id || row\.originalData\?\.order_id || ''\);/,
  'const visibleIds: string[] = disputeSubTab === 1\n      ? paginatedCurrent.map((row: any) => row["Order ID"] || row.originalData?.order_item_id || row.originalData?.order_id || "")\n      : current.map((row: any) => row["Order ID"] || row.originalData?.order_item_id || row.originalData?.order_id || "");'
);

content = content.replace(
  /if \(disputeSubTab === 0\) {/,
  'if (disputeSubTab === 1) {'
);

// useEffect dep
content = content.replace(
  /}, \[unreconciledRows, disputeSubTab, current, columnFilters, activeFilterColumn\]\);/,
  '}, [unreconciledRows, disputeSubTab, current, columnFilters, activeFilterColumn]);'
);

// handleSelectAllClick
content = content.replace(
  /if \(disputeSubTab === 0 && Array\.isArray\(unreconciledRows\)\)/,
  'if (disputeSubTab === 1 && Array.isArray(unreconciledRows))'
);

// renderHistoryPopup
content = content.replace(
  /\{\(disputeSubTab === 1 \|\| disputeSubTab === 2\) && \(/,
  '{(disputeSubTab === 0) && ('
);

// Tabs render
content = content.replace(
  /<Tabs value=\{disputeSubTab\} onChange=\{\(_, v\) => \{ setDisputeSubTab\(v\); setPage\(0\); \}\} sx=\{\{ '& \.MuiTab-root': \{ textTransform: 'none', minHeight: 32 \} \}\}>\n              <Tab label=\{`Mismatched Orders \(\$\{getUnreconciledTotalCount\(\)\}\)`\} \/>\n              <Tab label=\{`Manually Reconciled \(\$\{getManuallyReconciledCount\(\)\}\)`\} \/>\n              <Tab label=\{`Disputed \(\$\{getDisputedCount\(\)\}\)`\} \/>\n            <\/Tabs>/,
  '<Tabs value={disputeSubTab} onChange={(_, v) => { setDisputeSubTab(v); setPage(0); }} sx={{ \'& .MuiTab-root\': { textTransform: \'none\', minHeight: 32 } }}>\n              <Tab label={`Disputed (${getDisputedCount()})`} />\n              <Tab label={`Mismatched Orders (${getUnreconciledTotalCount()})`} />\n            </Tabs>'
);

// renderDisputedTiles conditional
content = content.replace(
  /\{disputeSubTab === 2 \? \(/,
  '{disputeSubTab === 0 ? ('
);

// Filter icon
content = content.replace(
  /\{disputeSubTab === 0 \? \(/g,
  '{disputeSubTab === 1 ? ('
);

content = content.replace(
  /colSpan=\{disputeSubTab === 0 \? 12 : 9\}/g,
  'colSpan={disputeSubTab === 1 ? 12 : 9}'
);

content = content.replace(
  /\(disputeSubTab === 0 \? paginatedCurrent : current\)/g,
  '(disputeSubTab === 1 ? paginatedCurrent : current)'
);

// TableRow render
content = content.replace(
  /\} else if \(disputeSubTab === 1 \|\| disputeSubTab === 2\) \{/g,
  '} else if (disputeSubTab === 0) {'
);

// Chip label
content = content.replace(
  /label=\{disputeSubTab === 1 \? 'Manually Reconciled' : 'Disputed'\}/,
  'label={"Disputed"}'
);
content = content.replace(
  /background: disputeSubTab === 1 \? '#dcfce7' : '#fee2e2',\n *color: disputeSubTab === 1 \? '#059669' : '#dc2626',/,
  "background: '#fee2e2',\n                                color: '#dc2626',"
);

// TablePagination condition
content = content.replace(
  /\{disputeSubTab === 0 && \(/g,
  '{disputeSubTab === 1 && ('
);


fs.writeFileSync('src/pages/OperationsCentre.tsx', content);
console.log('Replaced disputeSubTab usages successfully.');
