import React, { useState } from 'react';
import { Box, Typography, Card, CardActionArea, Button, Alert, TextField } from '@mui/material';
import { Storefront as StorefrontIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface DataSource {
  id: string;
  name: string;
  logo: string;
  icon?: React.ReactNode;
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
  // { id: 'shopify', name: 'Shopify', logo: 'https://cdn.worldvectorlogo.com/logos/shopify.svg' },
  // { id: 'amazon', name: 'Amazon', logo: 'https://cdn.worldvectorlogo.com/logos/logo-amazon.svg' },
  { id: 'flipkart', name: 'Flipkart', logo: 'https://cdn.worldvectorlogo.com/logos/flipkart.svg' },
  // { id: 'myntra', name: 'Myntra', logo: 'https://cdn.worldvectorlogo.com/logos/myntra-1.svg' },
  // { id: 'nykaa', name: 'Nykaa', logo: 'https://cdn.worldvectorlogo.com/logos/nykaa-1.svg' },
  // { id: 'offline', name: 'Offline Stores', logo: '', icon: <StorefrontIcon fontSize="large" /> },
  // { id: 'razorpay', name: 'Razorpay', logo: 'https://cdn.worldvectorlogo.com/logos/razorpay.svg' },
  // { id: 'tally', name: 'Tally', logo: 'https://cdn.worldvectorlogo.com/logos/tally-solutions.svg' },
  // { id: 'xero', name: 'Xero', logo: 'https://cdn.worldvectorlogo.com/logos/xero-1.svg' },
  // { id: 'sap', name: 'SAP', logo: 'https://cdn.worldvectorlogo.com/logos/sap-3.svg' },
  // { id: 'netsuite', name: 'Netsuite', logo: 'https://cdn.worldvectorlogo.com/logos/netsuite-1.svg' },
  // { id: 'oracle', name: 'Oracle', logo: 'https://cdn.worldvectorlogo.com/logos/oracle-1.svg' },
];

const ConnectDataSources: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [settlementReport, setSettlementReport] = useState<File | null>(null);
  const [salesReport, setSalesReport] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');

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

  const getUploadUrl = async (file: File): Promise<UploadResponse | null> => {
    try {
      const response = await fetch('http://43.204.236.42:8080/v1/recon/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: file.name,
          file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          file_size: file.size,
          description: '',
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data: UploadResponse = await response.json();
      return data;
    } catch (error) {
      console.error('API call error:', error);
      return null;
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
      const settlementUploadData = await getUploadUrl(settlementReport);
      
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
      const salesUploadData = await getUploadUrl(salesReport);
      
      if (!salesUploadData) {
        throw new Error('Failed to get upload URL for sales report');
      }

      setUploadMessage('Uploading sales report to S3...');
      const salesUploadSuccess = await uploadFileToS3(salesReport, salesUploadData.upload_url);
      
      if (!salesUploadSuccess) {
        throw new Error('Failed to upload sales report to S3');
      }

      setUploadStatus('success');
      setUploadMessage('Both files uploaded successfully! Processing will start automatically after 10 seconds.');
      
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
    <Box sx={{ p: 4, minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={700} mb={4} textAlign="center">
        Connect Your Data Sources
      </Typography>

      {/* Data Source Cards */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
          },
        }}
      >
        {dataSources.map((ds) => {
          const isSelected = selected.includes(ds.id);
          return (
            <Card
              key={ds.id}
              sx={{
                height: '100%',
                border: isSelected ? '2px solid #14B8A6' : '1px solid',
                borderColor: isSelected ? '#14B8A6' : 'divider',
                borderRadius: 3,
                boxShadow: 'none',
              }}
            >
              <CardActionArea
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 4,
                }}
                onClick={() => toggleSelect(ds.id)}
              >
                {ds.logo ? (
                  <img 
                    src={ds.logo} 
                    alt={ds.name} 
                    style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 16 }} 
                  />
                ) : (
                  <Box sx={{ width: 64, height: 64, mb: 2, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                    {ds.icon}
                  </Box>
                )}
                <Typography variant="subtitle1" fontWeight={600} textAlign="center">
                  {ds.name}
                </Typography>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {/* File Upload Section */}
      {selected.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" mb={3}>
            Upload Required Reports
          </Typography>
          
          {/* Settlement Report Upload */}
          <Box mb={3}>
            <Typography variant="subtitle1" mb={2}>
              Settlement Report (XLSX)
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
                sx={{ 
                  mb: 1,
                  borderColor: '#14B8A6',
                  color: '#14B8A6',
                  '&:hover': {
                    borderColor: '#0D9488',
                    backgroundColor: 'rgba(20, 184, 166, 0.04)'
                  }
                }}
              >
                Choose Settlement Report
              </Button>
            </label>
            {settlementReport && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Selected: {settlementReport.name}
              </Alert>
            )}
          </Box>

          {/* Sales Report Upload */}
          <Box mb={3}>
            <Typography variant="subtitle1" mb={2}>
              Sales Report (XLSX)
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
                sx={{ 
                  mb: 1,
                  borderColor: '#14B8A6',
                  color: '#14B8A6',
                  '&:hover': {
                    borderColor: '#0D9488',
                    backgroundColor: 'rgba(20, 184, 166, 0.04)'
                  }
                }}
              >
                Choose Sales Report
              </Button>
            </label>
            {salesReport && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Selected: {salesReport.name}
              </Alert>
            )}
          </Box>

          {/* Upload Status */}
          {uploadStatus === 'uploading' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {uploadMessage}
            </Alert>
          )}
          {uploadStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {uploadMessage}
            </Alert>
          )}
          {uploadStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadMessage}
            </Alert>
          )}

          <Box mt={4} textAlign="right">
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              sx={{ 
                px: 4, 
                py: 1.25,
                backgroundColor: '#14B8A6',
                '&:hover': {
                  backgroundColor: '#0D9488'
                },
                '&:disabled': {
                  backgroundColor: '#E5E7EB',
                  color: '#9CA3AF'
                }
              }}
            >
              Upload Reports
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ConnectDataSources; 