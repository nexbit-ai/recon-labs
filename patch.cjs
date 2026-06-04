const fs = require('fs');
let code = fs.readFileSync('src/pages/MarketplaceReconciliation.tsx', 'utf8');

// 1. Add syncView state
code = code.replace(
  'const [syncOpen, setSyncOpen] = useState(false);\n  const [syncStep, setSyncStep] = useState(0);',
  `const [syncOpen, setSyncOpen] = useState(false);\n  const [syncStep, setSyncStep] = useState(0);\n  const [syncView, setSyncView] = useState<'syncing' | 'connect-prompt' | 'credentials'>('syncing');`
);

// 2. Add TextField import if not present
if (!code.includes('TextField,')) {
  code = code.replace('import {\n', 'import {\n  TextField,\n');
}

// 3. Update totalSyncSteps
code = code.replace(
  'const totalSyncSteps = isD2C ? 5 : 3;',
  'const totalSyncSteps = isD2C ? 8 : 6;'
);

// 4. Update handleSyncClick to extract startSyncSimulation and add the new prompt logic
const handleSyncRegex = /const handleSyncClick = \(\) => \{[\s\S]*?\}\n    \}\n  \};\n/m;
code = code.replace(handleSyncRegex, `const startSyncSimulation = () => {
    setSyncView('syncing');
    setSyncStep(1);
    if (isD2C) {
      setTimeout(() => {
        setSyncStep(2);
        setTimeout(() => {
          setSyncStep(3);
          setTimeout(() => {
            setSyncStep(4);
            setTimeout(() => {
              setSyncStep(5);
              setTimeout(() => {
                setSyncStep(6);
                setTimeout(() => {
                  setSyncStep(7);
                  setTimeout(() => {
                    setSyncStep(8);
                    setSyncTriggered(true);
                    window.dispatchEvent(new Event('dashboard-sync-complete'));
                  }, 1200);
                }, 1200);
              }, 1200);
            }, 1200);
          }, 1200);
        }, 1200);
      }, 1200);
    } else {
      setTimeout(() => {
        setSyncStep(2);
        setTimeout(() => {
          setSyncStep(3);
          setTimeout(() => {
            setSyncStep(4);
            setTimeout(() => {
              setSyncStep(5);
              setTimeout(() => {
                setSyncStep(6);
                setSyncTriggered(true);
                window.dispatchEvent(new Event('dashboard-sync-complete'));
              }, 1500);
            }, 1500);
          }, 1500);
        }, 1500);
      }, 1500);
    }
  };

  const handleSyncClick = () => {
    setSyncOpen(true);
    const isMarketplace = selectedPlatform === 'amazon' || selectedPlatform === 'flipkart' || selectedPlatform === 'amazon_uk';
    if (isMarketplace && !localStorage.getItem(\`\${selectedPlatform}_connected\`)) {
      setSyncView('connect-prompt');
    } else {
      startSyncSimulation();
    }
  };
`);

// 5. Update Dialog rendering
const dialogRegex = /<Dialog[\s\S]*?<\/Dialog>/m;
const newDialog = `
            <Dialog
              open={syncOpen}
              onClose={(syncView !== 'syncing' || syncStep === totalSyncSteps) ? () => setSyncOpen(false) : undefined}
              PaperProps={{
                sx: {
                  borderRadius: '16px',
                  p: 3,
                  width: 460,
                  minWidth: 460,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, pb: 1 }}>
                {syncView === 'connect-prompt' && (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: isD2C ? 456 : 376 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(107, 114, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: 32, color: '#6B7280' }}>⚡</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', textAlign: 'center' }}>
                      {selectedPlatform === 'amazon' ? 'Amazon' : selectedPlatform === 'amazon_uk' ? 'Amazon UK' : 'Flipkart'} Not Connected
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center', mb: 2 }}>
                      You need to connect your seller account to sync data automatically.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setSyncView('credentials')}
                      sx={{
                        borderColor: '#d1d5db',
                        color: '#374151',
                        textTransform: 'none',
                        px: 4,
                        py: 1,
                        borderRadius: '8px',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#111827',
                          backgroundColor: 'rgba(107, 114, 128, 0.04)',
                        }
                      }}
                    >
                      Connect Account
                    </Button>
                  </Box>
                )}
                {syncView === 'credentials' && (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5, minHeight: isD2C ? 456 : 376 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', textAlign: 'center', mb: 1 }}>
                      Connect {selectedPlatform === 'amazon' ? 'Amazon' : selectedPlatform === 'amazon_uk' ? 'Amazon UK' : 'Flipkart'}
                    </Typography>
                    <TextField
                      fullWidth
                      label="Seller ID"
                      variant="outlined"
                      size="small"
                      placeholder="Enter your Seller ID"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                    <TextField
                      fullWidth
                      label="API Token / Secret"
                      variant="outlined"
                      size="small"
                      type="password"
                      placeholder="Enter your API token"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        localStorage.setItem(\`\${selectedPlatform}_connected\`, 'true');
                        startSyncSimulation();
                      }}
                      sx={{
                        mt: 2,
                        bgcolor: '#111827',
                        color: '#fff',
                        textTransform: 'none',
                        py: 1.2,
                        borderRadius: '8px',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#374151',
                          boxShadow: 'none',
                        }
                      }}
                    >
                      Save & Continue
                    </Button>
                  </Box>
                )}
                {syncView === 'syncing' && (
                  <>
                    {syncStep < totalSyncSteps ? (
                      <CircularProgress size={56} sx={{ color: '#111111' }} />
                    ) : (
                      <CheckCircleIcon sx={{ fontSize: 56, color: '#10b981' }} />
                    )}
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', textAlign: 'center' }}>
                      {syncStep < totalSyncSteps ? 'Reconciliation in Progress' : 'Sync Complete'}
                    </Typography>
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minHeight: isD2C ? 320 : 240 }}>
                      {(() => {
                        const s = mainSummary?.summary as any;
                        const sd = reconciliationData?.summaryData as any;
                        
                        const rawCount = s?.total_transaction_orders !== undefined ? Number(s.total_transaction_orders) : Number(sd?.totalTransaction?.number || 0);
                        const rawAmount = s?.total_transactions_amount !== undefined ? Math.abs(Number(s.total_transactions_amount)) : Number(sd?.totalTransaction?.amount || reconciliationData?.grossSales || 0);
                        const countVal = typeof rawCount === 'number' && isFinite(rawCount) ? rawCount : parseFloat(String(rawCount || '0')) || 0;
                        const amountVal = typeof rawAmount === 'number' && isFinite(rawAmount) ? rawAmount : parseFloat(String(rawAmount || '0')) || 0;

                        const ordersCountStr = countVal > 0 ? countVal.toLocaleString('en-IN') + ' ' : '';
                        const ordersAmountStr = amountVal > 0 ? \`(\${getCurrencySymbol()}\${Math.round(amountVal).toLocaleString(getCurrencyLocale())}) \` : '';
                        
                        const platformName = selectedPlatform === 'amazon' ? 'Amazon' : selectedPlatform === 'amazon_uk' ? 'Amazon UK' : selectedPlatform === 'flipkart' ? 'Flipkart' : selectedPlatform === 'other' ? 'CRED' : 'Marketplace';
                        
                        const shouldShowNumbers = isD2C ? syncStep >= 4 : syncStep >= 2;
                        const message = shouldShowNumbers ? \`Reconciling your \${ordersCountStr}orders \${ordersAmountStr}\`.trim() : 'Reconciling your orders';

                        return isD2C ? [
                          { step: 1, label: 'Fetching orders from Shopify' },
                          { step: 2, label: 'Finding settlement reports from Paytm, PayU' },
                          { step: 3, label: 'Syncing with logistics partners — Delhivery, BlueDart, Shiprocket' },
                          { step: 4, label: message },
                          { step: 5, label: 'Calculating expected settlement amount' },
                          { step: 6, label: 'Calculating difference between expected and actual' },
                          { step: 7, label: 'Finding the reasons of mismatch' },
                          { step: 8, label: 'Reconciliation done' },
                        ] : [
                          { step: 1, label: \`Fetching data from \${platformName}\` },
                          { step: 2, label: message },
                          { step: 3, label: 'Calculating expected settlement amount' },
                          { step: 4, label: 'Calculating difference between expected and actual' },
                          { step: 5, label: 'Finding the reasons of mismatch' },
                          { step: 6, label: 'Reconciliation done' },
                        ];
                      })().filter(({ step }) => step <= syncStep).map(({ step, label }) => (
                        <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {syncStep > step ? (
                            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                          ) : syncStep === step ? (
                            step === totalSyncSteps ? (
                              <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                            ) : (
                              <CircularProgress size={16} sx={{ color: '#111111' }} />
                            )
                          ) : (
                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #d1d5db' }} />
                          )}
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: syncStep === step ? 600 : 400, color: syncStep >= step ? '#1f2937' : '#9ca3af' }}>
                            {label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </DialogContent>
              {syncView === 'syncing' && (
                <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
                  <Button
                    variant="contained"
                    disabled={syncStep < totalSyncSteps}
                    onClick={() => setSyncOpen(false)}
                    sx={{
                      bgcolor: '#111827',
                      color: '#fff',
                      textTransform: 'none',
                      px: 6,
                      py: 1,
                      borderRadius: '8px',
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#374151',
                        boxShadow: 'none',
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#e5e7eb',
                        color: '#9ca3af',
                      }
                    }}
                  >
                    Done
                  </Button>
                </DialogActions>
              )}
            </Dialog>`;

code = code.replace(dialogRegex, newDialog);

fs.writeFileSync('src/pages/MarketplaceReconciliation.tsx', code);
console.log('Patched');
