import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Breadcrumbs, Link, Chip, Button, Alert, CircularProgress, Drawer, Divider } from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  CloudUpload as CloudUploadIcon,
  ArrowForward as ArrowForwardIcon
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
  { id: 'amazon', name: 'Amazon' },
  { id: 'flipkart', name: 'Flipkart' },
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
  // Marketplace files (per kind)
  const [marketplaceFiles, setMarketplaceFiles] = useState<Record<string, { sales: File | null; settlement: File | null }>>({
    amazon: { sales: null, settlement: null },
    flipkart: { sales: null, settlement: null },
  });
  // D2C files (sales and settlement)
  const [d2cFiles, setD2cFiles] = useState<Record<string, { sales: File | null; settlement: File | null }>>({});
  // Last Mile Status file
  const [lastMileStatusFile, setLastMileStatusFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelVendor, setRightPanelVendor] = useState<'amazon' | 'flipkart' | null>(null);

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

  const openRightPanel = (vendorId: 'amazon' | 'flipkart') => {
    setRightPanelVendor(vendorId);
    setRightPanelOpen(true);
  };

  const closeRightPanel = () => {
    setRightPanelOpen(false);
    setRightPanelVendor(null);
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

  // Marketplace uploads (Amazon/Flipkart) with separate Sales and Settlement
  const setMarketplaceFile = (vendorId: 'amazon' | 'flipkart', kind: 'sales' | 'settlement', file: File | null) => {
    setMarketplaceFiles((prev) => ({
      ...prev,
      [vendorId]: { ...prev[vendorId], [kind]: file },
    }));
  };

  const handleMarketplaceUpload = async (vendorId: 'amazon' | 'flipkart', kind: 'sales' | 'settlement') => {
    const file = marketplaceFiles[vendorId]?.[kind];
    if (!file || selectedYear === null || selectedMonth === null) return;

    const key = `${vendorId}_${kind}`;
    setUploadingVendor(key);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `${vendorId} ${kind} sheet for ${months[selectedMonth]} ${selectedYear}`);
      formData.append('month', months[selectedMonth]);
      formData.append('year', selectedYear.toString());
      formData.append('report_type', key.toLowerCase());

      let customToken: string | null = null;
      if (session) {
        try {
          const customSessionData = {
            member_id: session.member_id,
            member_session_id: session.member_session_id,
            organization_id: API_CONFIG.ORG_ID,
            organization_slug: session.organization_slug,
            roles: session.roles,
          };
          customToken = await JWTService.generateToken(customSessionData);
        } catch (error) {
          console.error('❌ Failed to generate custom token:', error);
        }
      }

      const headers: Record<string, string> = {
        'x-api-key': API_CONFIG.API_KEY,
        'x-org-id': API_CONFIG.ORG_ID,
      };
      if (customToken) headers['Authorization'] = `Bearer ${customToken}`;

      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/recon/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || errorData.error || `Upload failed with status ${response.status}`);
      }

      await response.json();
      setUploadStatus({ type: 'success', message: `Successfully uploaded ${kind} file for ${vendorId}` });

      // refresh list
      if (selectedYear !== null && selectedMonth !== null) {
        await fetchUploadedDocuments(selectedYear, selectedMonth);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to upload file. Please try again.' });
    } finally {
      setUploadingVendor(null);
    }
  };

  const handleMarketplaceBulkUpload = async (vendorId: 'amazon' | 'flipkart') => {
    const salesFile = marketplaceFiles[vendorId]?.sales;
    const settlementFile = marketplaceFiles[vendorId]?.settlement;
    if (!salesFile || !settlementFile || selectedYear === null || selectedMonth === null) return;
    setUploadingVendor(`${vendorId}_bulk`);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', salesFile);
      formData.append('file2', settlementFile);
      formData.append('description', `${vendorId} sales/settlement bulk upload for ${months[selectedMonth]} ${selectedYear}`);
      formData.append('month', months[selectedMonth]);
      formData.append('year', selectedYear.toString());
      formData.append('report_type', `${vendorId}_sales`);
      formData.append('report_type2', `${vendorId}_settlement`);
      formData.append('bulk', 'true');
      let customToken: string | null = null;
      if (session) {
        try {
          const customSessionData = {
            member_id: session.member_id,
            member_session_id: session.member_session_id,
            organization_id: API_CONFIG.ORG_ID,
            organization_slug: session.organization_slug,
            roles: session.roles,
          };
          customToken = await JWTService.generateToken(customSessionData);
        } catch (error) {
          console.error('❌ Failed to generate custom token:', error);
        }
      }
      const headers: Record<string, string> = {
        'x-api-key': API_CONFIG.API_KEY,
        'x-org-id': API_CONFIG.ORG_ID,
      };
      if (customToken) headers['Authorization'] = `Bearer ${customToken}`;
      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/recon/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Bulk upload failed' }));
        throw new Error(errorData.message || errorData.error || `Bulk upload failed with status ${response.status}`);
      }
      setUploadStatus({ type: 'success', message: `Successfully uploaded both files for ${vendorId}` });
      // refresh list
      if (selectedYear !== null && selectedMonth !== null) {
        await fetchUploadedDocuments(selectedYear, selectedMonth);
      }
    } catch (error:
      any) {
      console.error('❌ Bulk upload error:', error);
      setUploadStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to upload files. Please try again.' });
    } finally {
      setUploadingVendor(null);
    }
  };

  // D2C file handlers
  const setD2cFile = (vendorId: string, kind: 'sales' | 'settlement', file: File | null) => {
    setD2cFiles((prev) => ({
      ...prev,
      [vendorId]: { ...prev[vendorId], [kind]: file },
    }));
  };

  const handleD2cUpload = async (vendorId: string, kind: 'sales' | 'settlement') => {
    const file = d2cFiles[vendorId]?.[kind];
    if (!file || selectedYear === null || selectedMonth === null) return;

    const key = `${vendorId}_${kind}`;
    setUploadingVendor(key);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `${vendors.find(v => v.id === vendorId)?.name} ${kind} sheet for ${months[selectedMonth]} ${selectedYear}`);
      formData.append('month', months[selectedMonth]);
      formData.append('year', selectedYear.toString());
      formData.append('report_type', key.toLowerCase());

      let customToken: string | null = null;
      if (session) {
        try {
          const customSessionData = {
            member_id: session.member_id,
            member_session_id: session.member_session_id,
            organization_id: API_CONFIG.ORG_ID,
            organization_slug: session.organization_slug,
            roles: session.roles,
          };
          customToken = await JWTService.generateToken(customSessionData);
        } catch (error) {
          console.error('❌ Failed to generate custom token:', error);
        }
      }

      const headers: Record<string, string> = {
        'x-api-key': API_CONFIG.API_KEY,
        'x-org-id': API_CONFIG.ORG_ID,
      };
      if (customToken) headers['Authorization'] = `Bearer ${customToken}`;

      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/recon/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || errorData.error || `Upload failed with status ${response.status}`);
      }

      await response.json();
      setUploadStatus({ type: 'success', message: `Successfully uploaded ${kind} file for ${vendors.find(v => v.id === vendorId)?.name}` });

      // Clear the file after successful upload
      setD2cFile(vendorId, kind, null);

      // refresh list
      if (selectedYear !== null && selectedMonth !== null) {
        await fetchUploadedDocuments(selectedYear, selectedMonth);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to upload file. Please try again.' });
    } finally {
      setUploadingVendor(null);
    }
  };

  // Last Mile Status Upload handler
  const handleLastMileStatusUpload = async () => {
    if (!lastMileStatusFile || selectedYear === null || selectedMonth === null) return;

    setUploadingVendor('lastmile_status');
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', lastMileStatusFile);
      formData.append('description', `Last Mile Status file for ${months[selectedMonth]} ${selectedYear}`);
      formData.append('month', months[selectedMonth]);
      formData.append('year', selectedYear.toString());
      formData.append('report_type', 'lastmile_status');

      let customToken: string | null = null;
      if (session) {
        try {
          const customSessionData = {
            member_id: session.member_id,
            member_session_id: session.member_session_id,
            organization_id: API_CONFIG.ORG_ID,
            organization_slug: session.organization_slug,
            roles: session.roles,
          };
          customToken = await JWTService.generateToken(customSessionData);
        } catch (error) {
          console.error('❌ Failed to generate custom token:', error);
        }
      }

      const headers: Record<string, string> = {
        'x-api-key': API_CONFIG.API_KEY,
        'x-org-id': API_CONFIG.ORG_ID,
      };
      if (customToken) headers['Authorization'] = `Bearer ${customToken}`;

      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/recon/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || errorData.error || `Upload failed with status ${response.status}`);
      }

      await response.json();
      setUploadStatus({ type: 'success', message: `Successfully uploaded Last Mile Status file` });
      setLastMileStatusFile(null);

      // refresh list
      if (selectedYear !== null && selectedMonth !== null) {
        await fetchUploadedDocuments(selectedYear, selectedMonth);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to upload file. Please try again.' });
    } finally {
      setUploadingVendor(null);
    }
  };

  const isMonthCompleted = (year: number, monthIndex: number) => {
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    return completedMonths.includes(monthKey);
  };

  // Check if a vendor already has an uploaded document
  const isVendorUploaded = (vendorId: string, kind?: 'sales' | 'settlement'): boolean => {
    const key = kind ? `${vendorId}_${kind}` : vendorId;
    return uploadedDocuments.some(doc => doc.report_type.toLowerCase() === key.toLowerCase());
  };

  // Get uploaded document for a vendor
  const getUploadedDocument = (vendorId: string, kind?: 'sales' | 'settlement'): UploadedDocument | undefined => {
    const key = kind ? `${vendorId}_${kind}` : vendorId;
    return uploadedDocuments.find(doc => doc.report_type.toLowerCase() === key.toLowerCase());
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
            sx={{ p: 4, background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', minHeight: '60vh' }}
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
            {/* Marketplace section */}
            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 700 }} color="primary.main">Marketplace</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 800, mb: 4 }}>
              {vendors.filter(v => v.id === 'amazon' || v.id === 'flipkart').map((vendor) => {
                const isUploaded = isVendorUploaded(vendor.id, 'sales') || isVendorUploaded(vendor.id, 'settlement');
                const uploadedDoc = getUploadedDocument(vendor.id, 'sales') || getUploadedDocument(vendor.id, 'settlement');
                const isUploading = uploadingVendor === `${vendor.id}_sales` || uploadingVendor === `${vendor.id}_settlement` || uploadingVendor === vendor.id;
                return (
                  <Paper
                    key={vendor.id}
                    elevation={0}
                    sx={{ p: 3, border: isUploaded ? '2px solid #dcfce7' : '2px solid #e5e7eb', borderRadius: '12px', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, opacity: isUploading ? 0.9 : 1, background: isUploaded ? '#f0fdf4' : '#ffffff', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderColor: isUploaded ? '#bbf7d0' : '#d1d5db' } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '8px', background: isUploaded ? '#dcfce7' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isUploaded ? (
                          <CheckCircleIcon sx={{ fontSize: 24, color: '#16a34a' }} />
                        ) : (
                          <ShippingIcon sx={{ fontSize: 24, color: '#111111' }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700} color="#111111">{vendor.name}</Typography>
                          {isUploaded && (<Chip label="Uploaded" size="small" sx={{ background: '#16a34a', color: '#ffffff', fontWeight: 600, fontSize: '10px', height: '20px' }} />)}
                        </Box>
                        {isUploaded && uploadedDoc ? (
                          <Typography variant="caption" color="#16a34a" sx={{ display: 'block', mt: 0.5 }}>{uploadedDoc.filename} • {new Date(uploadedDoc.upload_date).toLocaleDateString()}</Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">Upload sales and settlement sheets</Typography>
                        )}
                      </Box>
                    </Box>
                    <Button
                      variant={isUploaded ? 'outlined' : 'contained'}
                      onClick={() => openRightPanel(vendor.id as 'amazon' | 'flipkart')}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ background: isUploaded ? '#ffffff' : '#111111', color: isUploaded ? '#111111' : '#ffffff', borderColor: isUploaded ? '#e5e7eb' : 'transparent', fontWeight: 600, px: 3, py: 1.2, '&:hover': { background: isUploaded ? '#f8fafc' : '#333333', borderColor: isUploaded ? '#d1d5db' : 'transparent' } }}
                    >
                      Upload files
                    </Button>
                  </Paper>
                );
              })}
            </Box>
            <Divider sx={{ mb: 3 }} />
            {/* D2C Partners section */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }} color="primary.main">D2C Partners</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 800, mb: 4 }}>
              {vendors.filter(v => v.id !== 'amazon' && v.id !== 'flipkart').map((vendor) => {
                const isSalesUploaded = isVendorUploaded(vendor.id, 'sales');
                const isSettlementUploaded = isVendorUploaded(vendor.id, 'settlement');
                const isUploaded = isSalesUploaded || isSettlementUploaded;
                const uploadedSalesDoc = getUploadedDocument(vendor.id, 'sales');
                const uploadedSettlementDoc = getUploadedDocument(vendor.id, 'settlement');
                const isSalesUploading = uploadingVendor === `${vendor.id}_sales`;
                const isSettlementUploading = uploadingVendor === `${vendor.id}_settlement`;
                const salesFile = d2cFiles[vendor.id]?.sales;
                const settlementFile = d2cFiles[vendor.id]?.settlement;

                return (
                  <Paper
                    key={vendor.id}
                    elevation={0}
                    sx={{ p: 3, border: isUploaded ? '2px solid #dcfce7' : '2px solid #e5e7eb', borderRadius: '12px', transition: 'all 0.3s ease', background: isUploaded ? '#f0fdf4' : '#ffffff', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderColor: isUploaded ? '#bbf7d0' : '#d1d5db' } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '8px', background: isUploaded ? '#dcfce7' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isUploaded ? (
                          <CheckCircleIcon sx={{ fontSize: 24, color: '#16a34a' }} />
                        ) : (
                          <ShippingIcon sx={{ fontSize: 24, color: '#111111' }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700} color="#111111">{vendor.name}</Typography>
                          {isUploaded && (
                            <Chip label="Uploaded" size="small" sx={{ background: '#16a34a', color: '#ffffff', fontWeight: 600, fontSize: '10px', height: '20px' }} />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Sales File Upload */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }} color="text.secondary">Sales File</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <input
                          accept=".xlsx,.xls,.csv"
                          style={{ display: 'none' }}
                          id={`d2c-sales-upload-${vendor.id}`}
                          type="file"
                          onChange={(e) => {
                            setD2cFile(vendor.id, 'sales', e.target.files?.[0] || null);
                            e.target.value = '';
                          }}
                          disabled={isSalesUploading}
                        />
                        <label htmlFor={`d2c-sales-upload-${vendor.id}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            disabled={isSalesUploading}
                            startIcon={<CloudUploadIcon />}
                            size="small"
                            sx={{ minWidth: 120 }}
                          >
                            Choose file
                          </Button>
                        </label>
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                          {salesFile?.name || (isSalesUploaded && uploadedSalesDoc ? uploadedSalesDoc.filename : 'No file selected')}
                        </Typography>
                        {salesFile && (
                          <Button
                            variant="contained"
                            size="small"
                            disabled={isSalesUploading}
                            onClick={() => handleD2cUpload(vendor.id, 'sales')}
                            startIcon={isSalesUploading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CloudUploadIcon />}
                            sx={{ background: '#111111', '&:hover': { background: '#333333' } }}
                          >
                            {isSalesUploading ? 'Uploading...' : 'Upload'}
                          </Button>
                        )}
                      </Box>
                    </Box>

                    {/* Settlement File Upload */}
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }} color="text.secondary">Settlement File</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <input
                          accept=".xlsx,.xls,.csv"
                          style={{ display: 'none' }}
                          id={`d2c-settlement-upload-${vendor.id}`}
                          type="file"
                          onChange={(e) => {
                            setD2cFile(vendor.id, 'settlement', e.target.files?.[0] || null);
                            e.target.value = '';
                          }}
                          disabled={isSettlementUploading}
                        />
                        <label htmlFor={`d2c-settlement-upload-${vendor.id}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            disabled={isSettlementUploading}
                            startIcon={<CloudUploadIcon />}
                            size="small"
                            sx={{ minWidth: 120 }}
                          >
                            Choose file
                          </Button>
                        </label>
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                          {settlementFile?.name || (isSettlementUploaded && uploadedSettlementDoc ? uploadedSettlementDoc.filename : 'No file selected')}
                        </Typography>
                        {settlementFile && (
                          <Button
                            variant="contained"
                            size="small"
                            disabled={isSettlementUploading}
                            onClick={() => handleD2cUpload(vendor.id, 'settlement')}
                            startIcon={isSettlementUploading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CloudUploadIcon />}
                            sx={{ background: '#111111', '&:hover': { background: '#333333' } }}
                          >
                            {isSettlementUploading ? 'Uploading...' : 'Upload'}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            {/* Last Mile Status Upload section */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }} color="primary.main">Last Mile Status Upload</Typography>
            <Paper
              elevation={0}
              sx={{ 
                p: 3, 
                border: isVendorUploaded('lastmile_status') ? '2px solid #dcfce7' : '2px solid #e5e7eb', 
                borderRadius: '12px', 
                transition: 'all 0.3s ease', 
                maxWidth: 800,
                background: isVendorUploaded('lastmile_status') ? '#f0fdf4' : '#ffffff', 
                '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderColor: isVendorUploaded('lastmile_status') ? '#bbf7d0' : '#d1d5db' } 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '8px', background: isVendorUploaded('lastmile_status') ? '#dcfce7' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isVendorUploaded('lastmile_status') ? (
                    <CheckCircleIcon sx={{ fontSize: 24, color: '#16a34a' }} />
                  ) : (
                    <ShippingIcon sx={{ fontSize: 24, color: '#111111' }} />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="#111111">Last Mile Status</Typography>
                    {isVendorUploaded('lastmile_status') && (
                      <Chip label="Uploaded" size="small" sx={{ background: '#16a34a', color: '#ffffff', fontWeight: 600, fontSize: '10px', height: '20px' }} />
                    )}
                  </Box>
                  {isVendorUploaded('lastmile_status') && getUploadedDocument('lastmile_status') ? (
                    <Typography variant="caption" color="#16a34a" sx={{ display: 'block', mt: 0.5 }}>
                      {getUploadedDocument('lastmile_status')?.filename} • {new Date(getUploadedDocument('lastmile_status')!.upload_date).toLocaleDateString()}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Upload Last Mile Status file
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  id="lastmile-status-upload"
                  type="file"
                  onChange={(e) => {
                    setLastMileStatusFile(e.target.files?.[0] || null);
                    e.target.value = '';
                  }}
                  disabled={uploadingVendor === 'lastmile_status'}
                />
                <label htmlFor="lastmile-status-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    disabled={uploadingVendor === 'lastmile_status'}
                    startIcon={<CloudUploadIcon />}
                    sx={{ minWidth: 120 }}
                  >
                    Choose file
                  </Button>
                </label>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                  {lastMileStatusFile?.name || 'No file selected'}
                </Typography>
                {lastMileStatusFile && (
                  <Button
                    variant="contained"
                    disabled={uploadingVendor === 'lastmile_status'}
                    onClick={handleLastMileStatusUpload}
                    startIcon={uploadingVendor === 'lastmile_status' ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CloudUploadIcon />}
                    sx={{ background: '#111111', '&:hover': { background: '#333333' }, fontWeight: 600, px: 3, py: 1.2 }}
                  >
                    {uploadingVendor === 'lastmile_status' ? 'Uploading...' : 'Upload File'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Paper>
        )}
      </Box>
      {/* Right-side drawer for marketplace uploads */}
      <Drawer anchor="right" open={rightPanelOpen} onClose={closeRightPanel} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            {rightPanelVendor ? (rightPanelVendor === 'amazon' ? 'Amazon' : 'Flipkart') : 'Marketplace'} uploads
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedYear !== null && selectedMonth !== null ? `${months[selectedMonth]} ${selectedYear}` : 'Select a month and year'}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {rightPanelVendor && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Both file pickers */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Sales report (XLSX/CSV)</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    id={`drawer-${rightPanelVendor}-sales`}
                    type="file"
                    onChange={(e) => {
                      setMarketplaceFile(rightPanelVendor, 'sales', e.target.files?.[0] || null);
                      e.target.value = '';
                    }}
                  />
                  <label htmlFor={`drawer-${rightPanelVendor}-sales`}>
                    <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>Choose file</Button>
                  </label>
                  <Typography variant="caption" color="text.secondary">
                    {marketplaceFiles[rightPanelVendor]?.sales?.name || 'No file selected'}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Settlement report (XLSX/CSV)</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    id={`drawer-${rightPanelVendor}-settlement`}
                    type="file"
                    onChange={(e) => {
                      setMarketplaceFile(rightPanelVendor, 'settlement', e.target.files?.[0] || null);
                      e.target.value = '';
                    }}
                  />
                  <label htmlFor={`drawer-${rightPanelVendor}-settlement`}>
                    <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>Choose file</Button>
                  </label>
                  <Typography variant="caption" color="text.secondary">
                    {marketplaceFiles[rightPanelVendor]?.settlement?.name || 'No file selected'}
                  </Typography>
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Button
                    size="large"
                    variant="contained"
                    fullWidth
                    disabled={uploadingVendor === `${rightPanelVendor}_bulk` || !marketplaceFiles[rightPanelVendor]?.sales || !marketplaceFiles[rightPanelVendor]?.settlement}
                    onClick={() => handleMarketplaceBulkUpload(rightPanelVendor)}
                    startIcon={uploadingVendor === `${rightPanelVendor}_bulk` ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CloudUploadIcon />}
                    sx={{ background: '#111111', '&:hover': { background: '#333333' }, fontWeight: 700 }}
                  >
                    {uploadingVendor === `${rightPanelVendor}_bulk` ? 'Uploading…' : 'Upload both files'}
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}

          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ my: 2 }} />
            <Button fullWidth variant="outlined" onClick={closeRightPanel}>Close</Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default UploadDocuments;

