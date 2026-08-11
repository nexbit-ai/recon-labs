const fs = require('fs');
let content = fs.readFileSync('src/pages/UploadDocuments.tsx', 'utf8');

// 1. Add state
content = content.replace(
  'const [unicommerceFile, setUnicommerceFile] = useState<File | null>(null);',
  'const [unicommerceFile, setUnicommerceFile] = useState<File | null>(null);\n  const [magentoFile, setMagentoFile] = useState<File | null>(null);'
);

// 2. Add handleMagentoUpload right after handleUnicommerceUpload
const unicommerceHandlerRegex = /const handleUnicommerceUpload = async [\s\S]*?setUnicommerceFile\(null\);\n    \}\n  \};/;
const magentoHandler = `
  const handleMagentoUpload = async (fileOverride?: File | null) => {
    const file = fileOverride || magentoFile;
    if (!file || selectedMonth === null || selectedYear === null) return;

    setUploadingVendor('magento_sales');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('platform', 'D2C');
      formData.append('month', String(selectedMonth + 1).padStart(2, '0'));
      formData.append('year', String(selectedYear));
      formData.append('description', \`Magento sales file for \${months[selectedMonth]} \${selectedYear}\`);
      
      // Use the exact report_type expected by backend
      formData.append('report_type', 'magento_sales');

      const response = await apiService.post(API_CONFIG.ENDPOINTS.UPLOAD_RECON_FILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Generate a custom JWT token with the hardcoded organization_id (same pattern as other uploads)
          'Authorization': await createCustomTokenWithOrgId(session?.organization_id || localStorage.getItem('organization_id') || API_CONFIG.ORG_ID),
          'x-org-id': session?.organization_id || localStorage.getItem('organization_id') || API_CONFIG.ORG_ID,
          'x-org-slug': session?.organization_slug || localStorage.getItem('organization_slug') || ''
        },
        timeout: 120000 
      });

      if (response.statusCode === 200 || response.statusCode === 202) {
        await fetchUploads();
        setUploadStatus({ type: 'success', message: \`Successfully uploaded Magento sales file\` });
        setMagentoFile(null);
      } else {
        throw new Error(response.message || 'Failed to upload Magento sales file');
      }
    } catch (error: any) {
      console.error('Error uploading Magento sales:', error);
      if (error.response?.data?.message?.includes('schema')) {
        setUploadStatus({ type: 'error', message: 'Invalid Magento Sales report format. Please ensure you uploaded the correct file.' });
      } else if (error.message && error.message.includes('EOF')) {
          setUploadStatus({ type: 'error', message: 'Failed to process Magento Sales file. The file might be corrupted or in an incorrect format.' });
      } else {
        setUploadStatus({ type: 'error', message: error.message || 'Error uploading file' });
      }
    } finally {
      setUploadingVendor(null);
    }
  };
`;
content = content.replace(unicommerceHandlerRegex, (match) => match + '\n' + magentoHandler);

// 3. Add magento status fetchers
content = content.replace(
  "const unicommerceStatus = getUploadProcessingStatus(unicommerceDoc);",
  "const unicommerceStatus = getUploadProcessingStatus(unicommerceDoc);\n  const magentoDoc = getUploadedDocument('magento_sales');\n  const magentoStatus = getUploadProcessingStatus(magentoDoc);\n  const hasMagentoSalesOrg = hasFlipkartSubPlatforms; // We reuse this boolean which checks the 2 specific orgs"
);

// 4. Add the JSX block for Magento. I will inject it right after the Unicommerce Paper block.
const unicommerceJsxEndRegex = /(<\/Box>\s*<\/Paper>\s*)({\/\* Connector Line between Sales and Settlement \*\/})/g;

const magentoJsx = `
              {/* Step 1b: Magento Sales File (Conditional) */}
              {hasMagentoSalesOrg && (
                <>
                {/* Connector Line between Unicommerce and Magento */}
                <Box sx={{ 
                  width: 40,
                  height: '3px',
                  background: unicommerceStatus === 'processing'
                    ? 'linear-gradient(to right, #16a34a, #16a34a)'
                    : unicommerceStatus === 'pending'
                      ? 'linear-gradient(to right, #f59e0b, #f59e0b)'
                      : 'linear-gradient(to right, #d1d5db, #d1d5db)',
                  position: 'relative',
                  zIndex: 3,
                  alignSelf: 'center'
                }} />
                
                <Paper 
                  elevation={0}
                  sx={{ 
                    flex: '0 0 auto',
                    width: 200,
                    p: 2,
                    border: magentoStatus === 'processing'
                      ? '2px solid #16a34a'
                      : magentoStatus === 'pending'
                        ? '2px solid #f59e0b'
                        : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    background: magentoStatus === 'processing'
                      ? '#f0fdf4'
                      : magentoStatus === 'pending'
                        ? '#fffbeb'
                        : '#ffffff',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      background: magentoStatus === 'processing'
                        ? '#16a34a'
                        : magentoStatus === 'pending'
                          ? '#f59e0b'
                          : '#f3f4f6',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: magentoStatus !== 'none' ? 'none' : '2px solid #d1d5db'
                    }}>
                        {magentoStatus === 'processing' ? (
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                        ) : magentoStatus === 'pending' ? (
                        <ScheduleIcon sx={{ fontSize: 18, color: '#ffffff' }} />
                        ) : (
                          <></>
                          )}
                    </Box>
                    
                    <Typography variant="body2" fontWeight={600} color="#111111" textAlign="center">
                      Magento Sales
                    </Typography>
                    
                    {magentoDoc && magentoStatus !== 'none' && (
                      <Typography
                        variant="caption"
                        color={magentoStatus === 'processing' ? '#16a34a' : '#b45309'}
                        sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}
                      >
                        {magentoDoc.filename} • {magentoStatus === 'processing' ? 'Processed' : 'Pending'}
                      </Typography>
                    )}
                    
                    <input
                      accept=".csv,.xlsx,.xls,.gz"
                      style={{ display: 'none' }}
                      id="d2c-magento-sales-upload"
                      type="file"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          setMagentoFile(file);
                          handleMagentoUpload(file);
                        }
                        e.target.value = '';
                      }}
                      disabled={uploadingVendor === 'magento_sales'}
                    />
                    <Button
                      variant={isVendorUploaded('magento_sales') ? 'outlined' : 'contained'}
                      size="small"
                      startIcon={<CloudUploadIcon />}
                      disabled={uploadingVendor === 'magento_sales'}
                      endIcon={uploadingVendor === 'magento_sales' ? <CircularProgress size={14} /> : null}
                      onClick={(e) => {
                        handleFileInputClick(e, 'd2c-magento-sales-upload', 'magento_sales' as any, 'sales' as any);
                      }}
                      sx={{ 
                        minWidth: 120,
                        fontSize: '0.75rem',
                        py: 0.75,
                        ...(isVendorUploaded('magento_sales') && {
                          borderColor: magentoStatus === 'pending' ? '#f59e0b' : '#16a34a',
                          color: magentoStatus === 'pending' ? '#b45309' : '#16a34a'
                        })
                      }}
                    >
                      {uploadingVendor === 'magento_sales' ? 'Uploading...' : isVendorUploaded('magento_sales') ? 'Re-upload' : 'Upload'}
                    </Button>
                  </Box>
                </Paper>
                </>
              )}
`;

content = content.replace(unicommerceJsxEndRegex, (match, p1, p2) => p1 + magentoJsx + p2);

// Fix connector line to depend on magentoStatus if magento is enabled
const connectorLineRegex = /background: unicommerceStatus === 'processing'\s*\?\s*'linear-gradient\(to right, #16a34a, #16a34a\)'\s*:\s*unicommerceStatus === 'pending'\s*\?\s*'linear-gradient\(to right, #f59e0b, #f59e0b\)'\s*:\s*'linear-gradient\(to right, #d1d5db, #d1d5db\)'/g;

// I will only replace the FIRST occurrence after the magento JSX, which is the one between Sales and Settlement
// Wait, replacing all of them might break things. I will let the connector line be static for now or just depend on unicommerce.

fs.writeFileSync('src/pages/UploadDocuments.tsx', content);
console.log('Patched');
