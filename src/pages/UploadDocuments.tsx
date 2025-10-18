import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Breadcrumbs, Link, Chip, Button, Alert, CircularProgress } from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { API_CONFIG } from '../services/api/config';
import { tokenManager } from '../services/api/tokenManager';
import JWTService from '../services/auth/jwtService';
import { useStytchMemberSession } from '@stytch/react/b2b';

interface Vendor {
  id: string;
  name: string;
  logo?: string;
}

interface UploadedDocument {
  id: string;
  document_id: string;
  filename: string;
  report_type: string;
  year: string;
  month: string;
  upload_date: string;
}

interface UploadListResponse {
  uploads: UploadedDocument[];
}

const vendors: Vendor[] = [
  { id: 'delhivery', name: 'Delhivery' },
  { id: 'bluedart', name: 'Blue Dart' },
  { id: 'blitznow', name: 'BlitzNow' },
  { id: 'xpressbees', name: 'Xpressbees' },
  { id: 'shiprocket', name: 'Shiprocket' },
  { id: 'shadowfax', name: 'Shadowfax' },
  { id: 'dtdc', name: 'DTDC' }
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = [2024, 2025];

// Hardcoded completed months (format: "YYYY-MM")
const completedMonths = [
  '2024-01', '2024-02', '2024-03', '2024-06', '2024-09',
  '2025-01', '2025-02'
];

type ViewType = 'years' | 'months' | 'vendors';

const UploadDocuments: React.FC = () => {
  const { session } = useStytchMemberSession();
  const [currentView, setCurrentView] = useState<ViewType>('years');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [uploadingVendor, setUploadingVendor] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  const handleYearClick = (year: number) => {
    setSelectedYear(year);
    setCurrentView('months');
  };

  const handleMonthClick = async (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setCurrentView('vendors');
    setUploadStatus(null); // Clear any previous status
    
    // Fetch uploaded documents for this month
    if (selectedYear !== null) {
      await fetchUploadedDocuments(selectedYear, monthIndex);
    }
  };

  const handleBackToYears = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setCurrentView('years');
    setUploadStatus(null);
  };

  const handleBackToMonths = () => {
    setSelectedMonth(null);
    setCurrentView('months');
    setUploadStatus(null);
    setUploadedDocuments([]); // Clear uploaded documents
  };

  // Fetch list of already uploaded documents for a specific month
  const fetchUploadedDocuments = async (year: number, monthIndex: number) => {
    setLoadingUploads(true);
    try {
      // Generate custom JWT token
      let customToken: string | null = null;
      
      if (session) {
        const customSessionData = {
          member_id: session.member_id,
          member_session_id: session.member_session_id,
          organization_id: API_CONFIG.ORG_ID,
          organization_slug: session.organization_slug,
          roles: session.roles,
        };
        customToken = await JWTService.generateToken(customSessionData);
      }
      
      const headers: Record<string, string> = {
        'x-api-key': API_CONFIG.API_KEY,
        'x-org-id': API_CONFIG.ORG_ID,
      };
      
      if (customToken) {
        headers['Authorization'] = `Bearer ${customToken}`;
      }
      
      const monthName = months[monthIndex].toLowerCase();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/v1/recon/upload-list?year=${year}&month=${monthName}`,
        {
          method: 'GET',
          headers,
        }
      );
      
      if (response.ok) {
        const data: UploadListResponse = await response.json();
        setUploadedDocuments(data.uploads || []);
        console.log('📋 Fetched uploaded documents:', data.uploads);
      } else {
        console.error('Failed to fetch uploaded documents');
        setUploadedDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching uploaded documents:', error);
      setUploadedDocuments([]);
    } finally {
      setLoadingUploads(false);
    }
  };

  const handleFileUpload = async (vendorId: string, file: File | null) => {
    if (!file || selectedYear === null || selectedMonth === null) {
      return;
    }

    setUploadingVendor(vendorId);
    setUploadStatus(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `${vendors.find(v => v.id === vendorId)?.name} settlement sheet for ${months[selectedMonth]} ${selectedYear}`);
      formData.append('month', months[selectedMonth]);
      formData.append('year', selectedYear.toString());
      formData.append('report_type', vendorId.toLowerCase());

      // Generate a custom JWT token with the hardcoded organization_id
      let customToken: string | null = null;
      
      if (session) {
        try {
          // Create a custom session data with the hardcoded org_id
          const customSessionData = {
            member_id: session.member_id,
            member_session_id: session.member_session_id,
            organization_id: API_CONFIG.ORG_ID, // Use hardcoded org_id instead of Stytch's
            organization_slug: session.organization_slug,
            roles: session.roles,
          };
          
          // Generate a custom JWT token
          customToken = await JWTService.generateToken(customSessionData);
          console.log('✅ Generated custom JWT token with hardcoded org_id');
        } catch (error) {
          console.error('❌ Failed to generate custom token:', error);
        }
      }
      
      // Build headers with API key and custom JWT token
      const headers: Record<string, string> = {
        'x-api-key': API_CONFIG.API_KEY,
        'x-org-id': API_CONFIG.ORG_ID,
      };
      
      // Add custom JWT token
      if (customToken) {
        headers['Authorization'] = `Bearer ${customToken}`;
      }
      
      console.log('🔐 Using API key + custom JWT token:', headers);
      
      // Make API call with proper headers
      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/recon/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        console.error('❌ Upload error response:', errorData);
        throw new Error(errorData.message || errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Upload successful:', data);
      
      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${file.name} for ${vendors.find(v => v.id === vendorId)?.name}`
      });
      
      // Refresh the uploaded documents list
      if (selectedYear !== null && selectedMonth !== null) {
        await fetchUploadedDocuments(selectedYear, selectedMonth);
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload file. Please try again.'
      });
    } finally {
      setUploadingVendor(null);
    }
  };

  const isMonthCompleted = (year: number, monthIndex: number) => {
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    return completedMonths.includes(monthKey);
  };

  // Check if a vendor already has an uploaded document
  const isVendorUploaded = (vendorId: string): boolean => {
    return uploadedDocuments.some(doc => doc.report_type.toLowerCase() === vendorId.toLowerCase());
  };

  // Get uploaded document for a vendor
  const getUploadedDocument = (vendorId: string): UploadedDocument | undefined => {
    return uploadedDocuments.find(doc => doc.report_type.toLowerCase() === vendorId.toLowerCase());
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: '100%', mx: 0 }}>
        {/* Page Title and Breadcrumbs */}
        <Box mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
            Upload Settlement Sheets
          </Typography>
          
          <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} aria-label="breadcrumb">
            <Link
              component="button"
              variant="body2"
              onClick={handleBackToYears}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: currentView === 'years' ? '#111111' : '#6b7280',
                textDecoration: 'none',
                fontWeight: currentView === 'years' ? 600 : 400,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <HomeIcon fontSize="small" />
              Years
            </Link>
            {currentView !== 'years' && (
              <Link
                component="button"
                variant="body2"
                onClick={handleBackToMonths}
                sx={{
                  color: currentView === 'months' ? '#111111' : '#6b7280',
                  textDecoration: 'none',
                  fontWeight: currentView === 'months' ? 600 : 400,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {selectedYear}
              </Link>
            )}
            {currentView === 'vendors' && (
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                {months[selectedMonth!]}
              </Typography>
            )}
          </Breadcrumbs>
        </Box>

        {/* Years View */}
        {currentView === 'years' && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              minHeight: '60vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ maxWidth: 600, width: '100%' }}>
              <Typography 
                variant="h6" 
                fontWeight={600} 
                color="#64748b" 
                mb={4}
                textAlign="center"
                sx={{ fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase' }}
              >
                Select Year
              </Typography>
              <Grid container spacing={3} justifyContent="center">
                {years.map((year) => (
                  <Grid item xs={6} sm={6} key={year}>
                    <Box
                      onClick={() => handleYearClick(year)}
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        background: '#ffffff',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '16px',
                        p: 5,
                        textAlign: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-6px) scale(1.02)',
                          border: '1.5px solid #111111',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                          background: '#fafafa',
                        },
                        '&:active': {
                          transform: 'translateY(-2px) scale(0.98)',
                        }
                      }}
                    >
                      <Typography 
                        variant="h3" 
                        fontWeight={700} 
                        sx={{ 
                          color: '#111111',
                          fontSize: '48px',
                          letterSpacing: '-2px',
                          lineHeight: 1
                        }}
                      >
                        {year}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        )}

        {/* Months View */}
        {currentView === 'months' && selectedYear && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              minHeight: '60vh'
            }}
          >
            <Typography 
              variant="h6" 
              fontWeight={600} 
              color="#64748b" 
              mb={4}
              sx={{ fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase' }}
            >
              Select Month - {selectedYear}
            </Typography>
            <Grid container spacing={2.5}>
              {months.map((month, index) => {
                const isCompleted = isMonthCompleted(selectedYear, index);
                return (
                  <Grid item xs={6} sm={4} md={3} key={month}>
                    <Box
                      onClick={() => handleMonthClick(index)}
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        background: '#ffffff',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '12px',
                        p: 3,
                        textAlign: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          border: '1.5px solid #111111',
                          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)',
                          background: '#fafafa',
                        },
                        '&:active': {
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      {isCompleted && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 20, color: '#22c55e' }} />
                        </Box>
                      )}
                      <Typography 
                        variant="h6" 
                        fontWeight={700} 
                        sx={{ 
                          color: '#111111',
                          fontSize: '18px',
                          letterSpacing: '-0.5px'
                        }}
                      >
                        {month}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}

        {/* Vendors View */}
        {currentView === 'vendors' && selectedMonth !== null && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              minHeight: '60vh'
            }}
          >
            <Typography variant="h6" fontWeight={700} color="#1e293b" mb={3}>
              Select Vendor - {months[selectedMonth]} {selectedYear}
            </Typography>

            {/* Upload Status Alert */}
            {uploadStatus && (
              <Alert 
                severity={uploadStatus.type} 
                sx={{ mb: 3 }}
                onClose={() => setUploadStatus(null)}
              >
                {uploadStatus.message}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 800 }}>
              {vendors.map((vendor) => {
                const isUploading = uploadingVendor === vendor.id;
                const isUploaded = isVendorUploaded(vendor.id);
                const uploadedDoc = getUploadedDocument(vendor.id);
                
                return (
                  <Paper
                    key={vendor.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      border: isUploaded ? '2px solid #dcfce7' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      opacity: isUploading ? 0.6 : 1,
                      background: isUploaded ? '#f0fdf4' : '#ffffff',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderColor: isUploaded ? '#bbf7d0' : '#d1d5db'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '8px',
                          background: isUploaded ? '#dcfce7' : '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isUploaded ? (
                          <CheckCircleIcon sx={{ fontSize: 24, color: '#16a34a' }} />
                        ) : (
                          <ShippingIcon sx={{ fontSize: 24, color: '#111111' }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700} color="#111111">
                            {vendor.name}
                          </Typography>
                          {isUploaded && (
                            <Chip 
                              label="Uploaded" 
                              size="small" 
                              sx={{ 
                                background: '#16a34a',
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '10px',
                                height: '20px'
                              }} 
                            />
                          )}
                        </Box>
                        {isUploaded && uploadedDoc ? (
                          <Typography variant="caption" color="#16a34a" sx={{ display: 'block', mt: 0.5 }}>
                            {uploadedDoc.filename} • {new Date(uploadedDoc.upload_date).toLocaleDateString()}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {isUploading ? 'Uploading...' : 'Upload settlement sheet'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    <input
                      accept=".xlsx,.xls,.csv"
                      style={{ display: 'none' }}
                      id={`file-upload-${vendor.id}`}
                      type="file"
                      onChange={(e) => {
                        handleFileUpload(vendor.id, e.target.files?.[0] || null);
                        e.target.value = ''; // Reset input so same file can be uploaded again
                      }}
                      disabled={isUploading}
                    />
                    <label htmlFor={`file-upload-${vendor.id}`}>
                      <Button
                        variant={isUploaded ? "outlined" : "contained"}
                        component="span"
                        disabled={isUploading}
                        startIcon={isUploading ? <CircularProgress size={16} sx={{ color: isUploaded ? '#111111' : '#ffffff' }} /> : <CloudUploadIcon />}
                        sx={{
                          background: isUploaded ? '#ffffff' : '#111111',
                          color: isUploaded ? '#111111' : '#ffffff',
                          borderColor: isUploaded ? '#e5e7eb' : 'transparent',
                          fontWeight: 600,
                          px: 3,
                          py: 1.2,
                          '&:hover': {
                            background: isUploaded ? '#f8fafc' : '#333333',
                            borderColor: isUploaded ? '#d1d5db' : 'transparent',
                          },
                          '&:disabled': {
                            background: '#94a3b8',
                            color: '#ffffff',
                          }
                        }}
                      >
                        {isUploading ? 'Uploading...' : (isUploaded ? 'Re-upload' : 'Upload File')}
                      </Button>
                    </label>
                  </Paper>
                );
              })}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default UploadDocuments;

