import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardActionArea, 
  Button, 
  Alert, 
  Chip,
  Grid,
  Paper,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Storefront as StorefrontIcon, 
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Link as LinkIcon,
  Description as ReportIcon,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Search as SearchIcon, Refresh as RefreshIcon, Download as DownloadIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { reconciliationAPI } from '../services/api';

interface DataSource {
  id: string;
  name: string;
  logo: string;
  icon?: React.ReactNode;
  isConnected?: boolean;
}

interface UploadResponse {
  document_id: string;
  duplicate_detection: {
    cutoff_field: string;
    enabled: boolean;
    note: string;
  };
  message: string;
  note: string;
  processing_delay: string;
  processing_id: string;
  s3_key: string;
  status_url: string;
  upload_url: string;
}

const dataSources: DataSource[] = [
  { id: 'shopify', name: 'Shopify', logo: 'https://cdn.worldvectorlogo.com/logos/shopify.svg' },
  { id: 'amazon', name: 'Amazon', logo: 'https://cdn.worldvectorlogo.com/logos/logo-amazon.svg',  isConnected: true},
  { id: 'flipkart', name: 'Flipkart', logo: 'https://cdn.worldvectorlogo.com/logos/flipkart.svg', isConnected: true },
  { id: 'myntra', name: 'Myntra', logo: 'https://cdn.worldvectorlogo.com/logos/myntra-1.svg' },
  { id: 'nykaa', name: 'Nykaa', logo: 'https://cdn.worldvectorlogo.com/logos/nykaa-1.svg' },
  { id: 'zoho', name: 'Zoho', logo: 'https://cdn.worldvectorlogo.com/logos/zoho-1.svg',  isConnected: true},
  { id: 'payu', name: 'PayU', logo: 'https://cdn.worldvectorlogo.com/logos/payu-1.svg' },
  { id: 'razorpay', name: 'Razorpay', logo: 'https://cdn.worldvectorlogo.com/logos/razorpay.svg' },
  { id: 'tally', name: 'Tally', logo: 'https://cdn.worldvectorlogo.com/logos/tally-solutions.svg' },
  { id: 'xero', name: 'Xero', logo: 'https://cdn.worldvectorlogo.com/logos/xero-1.svg' },
  { id: 'sap', name: 'SAP', logo: 'https://cdn.worldvectorlogo.com/logos/sap-3.svg' },
  { id: 'netsuite', name: 'Netsuite', logo: 'https://cdn.worldvectorlogo.com/logos/netsuite-1.svg' },
  { id: 'oracle', name: 'Oracle', logo: 'https://cdn.worldvectorlogo.com/logos/oracle-1.svg' },
];

const ConnectDataSources: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [settlementReport, setSettlementReport] = useState<File | null>(null);
  const [salesReport, setSalesReport] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [reportsOpen, setReportsOpen] = useState(false);
  const [reportType, setReportType] = useState<'all' | 'Sales' | 'Settlement' | 'System'>('all');
  const [reportQuery, setReportQuery] = useState('');

  // Per-vendor marketplace uploads state (Amazon, Flipkart)
  const [marketplaceFiles, setMarketplaceFiles] = useState<Record<string, { sales: File | null; settlement: File | null }>>({
    amazon: { sales: null, settlement: null },
    flipkart: { sales: null, settlement: null },
  });
  const [marketplaceStatus, setMarketplaceStatus] = useState<Record<string, { state: 'idle' | 'uploading' | 'success' | 'error'; message: string }>>({
    amazon: { state: 'idle', message: '' },
    flipkart: { state: 'idle', message: '' },
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFileUpload = (file: File | null, type: 'settlement' | 'sales') => {
    if (type === 'settlement') {
      setSettlementReport(file);
    } else {
      setSalesReport(file);
    }
  };

  const uploadFileToS3 = async (file: File, uploadUrl: string): Promise<boolean> => {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('S3 upload error:', error);
      return false;
    }
  };

  const getUploadUrl = async (file: File, reportType: 'Sales' | 'SettleMent'): Promise<UploadResponse | null> => {
    try {
      const response = await reconciliationAPI.uploadFile({
        file_name: file.name,
        file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        file_size: file.size,
        description: '',
        report_type: reportType,
      });

      return response.data;
    } catch (error) {
      console.error('API call error:', error);
      return null;
    }
  };

  const setMarketplaceFile = (vendorId: 'amazon' | 'flipkart', kind: 'sales' | 'settlement', file: File | null) => {
    setMarketplaceFiles((prev) => ({
      ...prev,
      [vendorId]: { ...prev[vendorId], [kind]: file },
    }));
  };

  const uploadMarketplaceReports = async (vendorId: 'amazon' | 'flipkart') => {
    const files = marketplaceFiles[vendorId];
    if (!files?.sales || !files?.settlement) {
      setMarketplaceStatus((prev) => ({
        ...prev,
        [vendorId]: { state: 'error', message: 'Please select both Sales and Settlement files.' },
      }));
      return;
    }

    setMarketplaceStatus((prev) => ({ ...prev, [vendorId]: { state: 'uploading', message: 'Preparing uploads…' } }));
    try {
      // Settlement first
      const settlementUploadData = await getUploadUrl(files.settlement, 'SettleMent');
      if (!settlementUploadData) throw new Error('Failed to get upload URL for settlement report');
      const settlementOk = await uploadFileToS3(files.settlement, settlementUploadData.upload_url);
      if (!settlementOk) throw new Error('Failed to upload settlement report');

      // Sales next
      const salesUploadData = await getUploadUrl(files.sales, 'Sales');
      if (!salesUploadData) throw new Error('Failed to get upload URL for sales report');
      const salesOk = await uploadFileToS3(files.sales, salesUploadData.upload_url);
      if (!salesOk) throw new Error('Failed to upload sales report');

      setMarketplaceStatus((prev) => ({ ...prev, [vendorId]: { state: 'success', message: 'Files uploaded successfully.' } }));
    } catch (err: any) {
      setMarketplaceStatus((prev) => ({
        ...prev,
        [vendorId]: { state: 'error', message: err?.message || 'Upload failed. Please try again.' },
      }));
    }
  };

  const handleSubmit = async () => {
    if (!settlementReport || !salesReport) {
      setUploadStatus('error');
      setUploadMessage('Please select both files before uploading.');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Starting upload process...');

    try {
      // Upload settlement report
      setUploadMessage('Getting upload URL for settlement report...');
      const settlementUploadData = await getUploadUrl(settlementReport, 'SettleMent');
      
      if (!settlementUploadData) {
        throw new Error('Failed to get upload URL for settlement report');
      }

      setUploadMessage('Uploading settlement report to S3...');
      const settlementUploadSuccess = await uploadFileToS3(settlementReport, settlementUploadData.upload_url);
      
      if (!settlementUploadSuccess) {
        throw new Error('Failed to upload settlement report to S3');
      }

      // Upload sales report
      setUploadMessage('Getting upload URL for sales report...');
      const salesUploadData = await getUploadUrl(salesReport, 'Sales');
      
      if (!salesUploadData) {
        throw new Error('Failed to get upload URL for sales report');
      }

      setUploadMessage('Uploading sales report to S3...');
      const salesUploadSuccess = await uploadFileToS3(salesReport, salesUploadData.upload_url);
      
      if (!salesUploadSuccess) {
        throw new Error('Failed to upload sales report to S3');
      }

      setUploadStatus('success');
      setUploadMessage('Files uploaded successfully!');
      
      console.log('Upload completed successfully');
      console.log('Settlement report processing ID:', settlementUploadData.processing_id);
      console.log('Sales report processing ID:', salesUploadData.processing_id);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    }
  };

  const isSubmitDisabled = selected.length === 0 || !settlementReport || !salesReport;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: '100%', mx: 0 }}>
        {/* Page Title aligned left like other screens */}
        <Box mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Connect Your Data Sources
          </Typography>
        </Box>

        {/* Upload Documents Button Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderColor: '#111111'
            }
          }}
          onClick={() => navigate('/upload-documents')}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  background: '#111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UploadFileIcon sx={{ fontSize: 32, color: '#ffffff' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="#1e293b" mb={0.5}>
                  Upload Settlement Sheets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload and manage your settlement sheets from D2C vendors.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              sx={{
                background: '#111111',
                color: '#ffffff',
                fontWeight: 700,
                px: 3,
                py: 1.5,
                '&:hover': {
                  background: '#333333',
                }
              }}
            >
              Get Started
            </Button>
          </Box>
        </Paper>

        {/* Connected Sources Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}
        >
          <Box display="flex" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={700} color="#1e293b">
              Connected Sources
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {dataSources.filter(ds => ds.isConnected).map((ds) => (
              <Grid item xs={12} sm={6} md={4} key={ds.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 1.5,
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  
                  <CardActionArea
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: 3,
                      cursor: 'pointer'
                    }}
                    onClick={() => setReportsOpen(true)}
                  >
                    <img 
                      src={ds.logo} 
                      alt={ds.name} 
                      style={{ 
                        width: 56, 
                        height: 56, 
                        objectFit: 'contain', 
                        marginBottom: 12,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }} 
                    />
                    <Typography variant="subtitle1" fontWeight={700} textAlign="center" color="#1e293b">
                      {ds.name}
                    </Typography>
                    <Chip 
                      label="Connected" 
                      size="small" 
                      sx={{ 
                        mt: 0.5,
                        background: '#10b981',
                        color: 'white',
                        fontWeight: 500
                      }} 
                    />
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Marketplace Uploads: Amazon & Flipkart */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}
        >
          <Box display="flex" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={700} color="#1e293b">
              Marketplace Uploads
            </Typography>
            <Chip label="Amazon & Flipkart" size="small" sx={{ ml: 1 }} />
          </Box>

          <Grid container spacing={3}>
            {(['amazon', 'flipkart'] as const).map((vendorId) => {
              const vendor = dataSources.find((d) => d.id === vendorId);
              const files = marketplaceFiles[vendorId];
              const status = marketplaceStatus[vendorId];
              const canUpload = Boolean(files?.sales && files?.settlement) && status?.state !== 'uploading';
              return (
                <Grid item xs={12} md={6} key={vendorId}>
                  <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      {vendor?.logo && (
                        <img src={vendor.logo} alt={vendor.name} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                      )}
                      <Typography variant="subtitle1" fontWeight={700}>{vendor?.name}</Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Sales report (XLSX)</Typography>
                        <input
                          accept=".xlsx,.xls"
                          style={{ display: 'none' }}
                          id={`${vendorId}-sales-upload`}
                          type="file"
                          onChange={(e) => setMarketplaceFile(vendorId, 'sales', e.target.files?.[0] || null)}
                        />
                        <label htmlFor={`${vendorId}-sales-upload`}>
                          <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} sx={{ mr: 1 }}>
                            {files?.sales ? 'Change file' : 'Choose file'}
                          </Button>
                          <Typography variant="caption" color="text.secondary">
                            {files?.sales ? files.sales.name : 'No file selected'}
                          </Typography>
                        </label>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Settlement report (XLSX)</Typography>
                        <input
                          accept=".xlsx,.xls"
                          style={{ display: 'none' }}
                          id={`${vendorId}-settlement-upload`}
                          type="file"
                          onChange={(e) => setMarketplaceFile(vendorId, 'settlement', e.target.files?.[0] || null)}
                        />
                        <label htmlFor={`${vendorId}-settlement-upload`}>
                          <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} sx={{ mr: 1 }}>
                            {files?.settlement ? 'Change file' : 'Choose file'}
                          </Button>
                          <Typography variant="caption" color="text.secondary">
                            {files?.settlement ? files.settlement.name : 'No file selected'}
                          </Typography>
                        </label>
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Button
                            variant="contained"
                            onClick={() => uploadMarketplaceReports(vendorId)}
                            disabled={!canUpload}
                            startIcon={status?.state === 'uploading' ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : undefined}
                            sx={{ background: '#111111', '&:hover': { background: '#333333' } }}
                          >
                            {status?.state === 'uploading' ? 'Uploading…' : 'Upload both files'}
                          </Button>
                          {status?.state !== 'idle' && (
                            <Typography variant="caption" color={status.state === 'success' ? '#16a34a' : status.state === 'error' ? '#dc2626' : 'text.secondary'}>
                              {status.message}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* Available Sources Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}
        >
          <Box display="flex" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={700} color="#1e293b">
              Available Sources
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {dataSources.filter(ds => !ds.isConnected).map((ds) => {
              const isSelected = selected.includes(ds.id);
              return (
                <Grid item xs={6} sm={4} md={2} key={ds.id}>
                  <Card
                    sx={{
                      height: '100%',
                      border: '1px solid #e5e7eb',
                      borderRadius: 1.5,
                    }}
                  >
                    <CardActionArea
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 3,
                      }}
                      disableRipple
                      onClick={() => toggleSelect(ds.id)}
                    >
                      <img 
                        src={ds.logo} 
                        alt={ds.name} 
                        style={{ 
                          width: 56, 
                          height: 56, 
                          objectFit: 'contain', 
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }} 
                      />
                      <Typography variant="subtitle2" fontWeight={700} textAlign="center" color="#1e293b" style={{ marginTop: 8 }}>
                        {ds.name}
                      </Typography>

                      {isSelected && (
                        <Chip 
                          label="Selected" 
                          size="small" 
                          sx={{ 
                            mt: 0.5,
                            background: '#3b82f6',
                            color: 'white',
                            fontWeight: 500
                          }} 
                        />
                      )}
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* File Upload Section */}
        {selected.length > 0 && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #e5e7eb'
            }}
          >
            <Box display="flex" alignItems="center" mb={4}>
              <CloudUploadIcon sx={{ color: '#64748b', mr: 2, fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700} color="#1e293b">
                Upload Required Reports
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              {/* Settlement Report Upload */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" mb={2} color="#1e293b" fontWeight={700}>
                    Settlement Report
                  </Typography>
                  <Typography variant="body2" mb={3} color="text.secondary">
                    Upload your settlement report in XLSX format
                  </Typography>
                  <input
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    id="settlement-report-upload"
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'settlement')}
                  />
                  <label htmlFor="settlement-report-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      sx={{ 
                        py: 2,
                        borderColor: '#64748b',
                        color: '#64748b',
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: '#475569',
                          backgroundColor: 'rgba(100, 116, 139, 0.04)'
                        }
                      }}
                    >
                      Choose Settlement Report
                    </Button>
                  </label>
                  {settlementReport && (
                    <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                      Selected: {settlementReport.name}
                    </Alert>
                  )}
                </Box>
              </Grid>

              {/* Sales Report Upload */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" mb={2} color="#1e293b" fontWeight={700}>
                    Sales Report
                  </Typography>
                  <Typography variant="body2" mb={3} color="text.secondary">
                    Upload your sales report in XLSX format
                  </Typography>
                  <input
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    id="sales-report-upload"
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'sales')}
                  />
                  <label htmlFor="sales-report-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      sx={{ 
                        py: 2,
                        borderColor: '#64748b',
                        color: '#64748b',
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: '#475569',
                          backgroundColor: 'rgba(100, 116, 139, 0.04)'
                        }
                      }}
                    >
                      Choose Sales Report
                    </Button>
                  </label>
                  {salesReport && (
                    <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                      Selected: {salesReport.name}
                    </Alert>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Upload Status */}
            {uploadStatus === 'uploading' && (
              <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                {uploadMessage}
              </Alert>
            )}
            {uploadStatus === 'success' && (
              <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
                {uploadMessage}
              </Alert>
            )}
            {uploadStatus === 'error' && (
              <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                {uploadMessage}
              </Alert>
            )}

            <Box mt={3} textAlign="center">
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                size="large"
                sx={{ 
                  px: 3.5, 
                  py: 1.1,
                  background: '#1f2937',
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  '&:hover': {
                    background: '#374151',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(30, 41, 59, 0.15)'
                  },
                  '&:disabled': {
                    background: '#e2e8f0',
                    color: '#94a3b8',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                Upload Reports
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
      {/* Flipkart Reports dialog - enterprise styled */}
      <Dialog open={reportsOpen} onClose={() => setReportsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src="https://cdn.worldvectorlogo.com/logos/flipkart.svg" alt="Flipkart" style={{ width: 24, height: 24 }} />
            <Typography variant="h6" fontWeight={700}>Flipkart — Past fetched reports</Typography>
          </Box>
          <Box>
            <Tooltip title="Refresh"><IconButton size="small"><RefreshIcon /></IconButton></Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search reports"
              size="small"
              value={reportQuery}
              onChange={(e) => setReportQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
            <Select size="small" value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Settlement">Settlement</MenuItem>
              <MenuItem value="System">System</MenuItem>
            </Select>
          </Box>
          <Table size="small" sx={{ '& td, & th': { borderBottom: '1px solid #eee' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Fetched at</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { id: 1, type: 'Sales', period: 'March 2025', fetchedAt: 'Apr 1, 2025 10:15 AM', status: 'Success'},
                { id: 2, type: 'Sales', period: 'April 2025', fetchedAt: 'May 1, 2025 10:10 AM', status: 'Success'},
                { id: 3, type: 'Settlement', period: 'March 2025', fetchedAt: 'Apr 2, 2025 11:40 AM', status: 'Success'},
                { id: 4, type: 'Settlement', period: 'April 2025', fetchedAt: 'May 2, 2025 11:20 AM', status: 'Success'},
                { id: 5, type: 'System', period: 'March 2025', fetchedAt: 'Apr 2, 2025 12:10 PM', status: 'Completed: Reconciliation'},
                { id: 6, type: 'System', period: 'March 2025', fetchedAt: 'Apr 2, 2025 12:15 PM', status: 'Found 1000 unreconciled'},
              ]
                .filter(r => (reportType === 'all' || r.type === reportType) && (reportQuery === '' || `${r.type} ${r.period} ${r.status}`.toLowerCase().includes(reportQuery.toLowerCase())))
                .map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.period}</TableCell>
                  <TableCell>{r.fetchedAt}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Preview">
                      <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton size="small"><DownloadIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConnectDataSources; 