const fs = require('fs');

const file = '/Users/krishna/repos/recon-labs/src/pages/OperationsCentre.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove manuallyReconciledRows state and getManuallyReconciledCount
content = content.replace(/const \[manuallyReconciledRows, setManuallyReconciledRows\] = useState<any\[\]>\(\[\]\);\n/g, '');
content = content.replace(/const getManuallyReconciledCount = \(\) => manuallyReconciledRows\?\.length \|\| 0;\n/g, '');

// 2. Remove fetchManuallyReconciledOrders method completely
content = content.replace(/  \/\/ Fetch manually reconciled orders from API[\s\S]*?setManuallyReconciledRows\(\[\]\);\n    }\n  };\n/g, '');

// 3. Remove fetchManuallyReconciledOrders call from fetchAllTabsData
content = content.replace(/      } else if \(activeTab === 1\) {\n        await fetchManuallyReconciledOrders\(filtersOverride, sortOverride, applySortOverride, orderIdsCsvOverride, pageOverride, rowsPerPageOverride, activeTab\);\n/g, '');

// 4. Update Tabs rendering block
const oldTabs = `            <Tabs value={disputeSubTab} onChange={(_, v) => { setDisputeSubTab(v); setPage(0); }} sx={{ '& .MuiTab-root': { textTransform: 'none', minHeight: 32 } }}>
              <Tab label={\`Mismatched Orders (\${getUnreconciledTotalCount()})\`} />
              <Tab label={\`Manually Reconciled (\${getManuallyReconciledCount()})\`} />
              <Tab label={\`Disputed (\${getDisputedCount()})\`} />
              <Tab label="Claims Dashboard" />
            </Tabs>`;

const newTabs = `            <Tabs value={disputeSubTab} onChange={(_, v) => { setDisputeSubTab(v); setPage(0); }} sx={{ '& .MuiTab-root': { textTransform: 'none', minHeight: 32, minWidth: 200, maxWidth: 200, justifyContent: 'flex-start' } }}>
              <Tab label={\`Mismatched Orders (\${getUnreconciledTotalCount()})\`} />
              <Tab label={\`Dispute Required (\${getDisputedCount()})\`} />
              <Tab label="Claims Dashboard" />
            </Tabs>`;
content = content.replace(oldTabs, newTabs);

// 5. Replace references to disputeSubTab logic
content = content.replace(/} else if \(activeTab === 2\) {/g, '} else if (activeTab === 1) {');
content = content.replace(/} else if \(activeTab === 3\) {/g, '} else if (activeTab === 2) {');

content = content.replace(/disputeSubTab === 3/g, 'disputeSubTab === 2');
content = content.replace(/disputeSubTab !== 3/g, 'disputeSubTab !== 2');

content = content.replace(/if \(disputeSubTab === 1\) return manuallyReconciledRows;\n/g, '');
content = content.replace(/if \(disputeSubTab === 2\) return disputeRaisedRows;/g, 'if (disputeSubTab === 1) return disputeRaisedRows;');

content = content.replace(/\(disputeSubTab === 1 \|\| disputeSubTab === 2\)/g, '(disputeSubTab === 1)');

const oldLabelChip = `                              label={disputeSubTab === 1 ? 'Manually Reconciled' : 'Disputed'}
                              size="small"
                              sx={{
                                background: disputeSubTab === 1 ? '#dcfce7' : '#fee2e2',
                                color: disputeSubTab === 1 ? '#059669' : '#dc2626',`;

const newLabelChip = `                              label='Dispute Required'
                              size="small"
                              sx={{
                                background: '#fee2e2',
                                color: '#dc2626',`;
content = content.replace(oldLabelChip, newLabelChip);

fs.writeFileSync(file, content);
console.log("Refactored tabs successfully");
