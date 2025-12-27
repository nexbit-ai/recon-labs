import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, Grid, Breadcrumbs, Link, Chip, Button, Alert, CircularProgress, Drawer, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem } from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  CloudUpload as CloudUploadIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Lock as LockIcon
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
  { id: 'ecomexpress', name: 'Ecom Express' },
  { id: 'bluedart', name: 'Blue Dart' },
  { id: 'growsimplee', name: 'BlitzNow' },
  { id: 'xpressbees', name: 'Xpressbees' },
  { id: 'shiprocket', name: 'Shiprocket' },
  { id: 'shadowfax', name: 'Shadowfax' },
  { id: 'dtdc', name: 'DTDC' },
  { id: 'paytm', name: 'Paytm' },
  { id: 'payu', name: 'PayU' },
  // D2C payment gateway partner - uses report_type "cashfree"
  { id: 'cashfree', name: 'Cashfree' },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = [2024, 2025];

const CSV_ONLY_EXTENSIONS = ['.csv'];
const FLIPKART_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

const isFlipkartVendor = (vendorId?: string | null) => vendorId?.toLowerCase() === 'flipkart';
const getExtensionsForVendor = (vendorId?: string | null) =>
  isFlipkartVendor(vendorId) ? FLIPKART_EXTENSIONS : CSV_ONLY_EXTENSIONS;
const getAcceptForVendor = (vendorId?: string | null) => getExtensionsForVendor(vendorId).join(',');
const getFormatLabelForVendor = (vendorId?: string | null) =>
  isFlipkartVendor(vendorId) ? 'CSV/XLSX' : 'CSV only';

type ViewType = 'years' | 'marketplace' | 'd2c';

const UploadDocuments: React.FC = () => {
  const { session } = useStytchMemberSession();
  const [currentView, setCurrentView] = useState<ViewType>('years');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [uploadingVendor, setUploadingVendor] = useState<string | null>(null);
  // Marketplace files (per kind)
  const [marketplaceFiles, setMarketplaceFiles] = useState<Record<string, { sales: File | null; sales_b2b?: File | null; settlement: File | null }>>({
    amazon: { sales: null, sales_b2b: null, settlement: null },
    flipkart: { sales: null, settlement: null },
  });
  // D2C files (sales and settlement)
  const [d2cFiles, setD2cFiles] = useState<Record<string, { sales: File | null; settlement: File | null }>>({});
  // Last Mile Status file
  const [lastMileStatusFile, setLastMileStatusFile] = useState<File | null>(null);
  // Unicommerce Sales file
  const [unicommerceFile, setUnicommerceFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelVendor, setRightPanelVendor] = useState<'amazon' | 'flipkart' | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ vendorId: 'amazon' | 'flipkart'; kind: 'sales' | 'sales_b2b' | 'settlement' } | null>(null);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<{ year: number; month: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateFileType = (file: File, vendorId?: string | null, label?: string) => {
    const normalizedName = file.name.toLowerCase();
    const isAllowed = getExtensionsForVendor(vendorId).some((ext) => normalizedName.endsWith(ext));

    if (!isAllowed) {
      const friendlyName =
        label ||
        vendors.find((v) => v.id === vendorId)?.name ||
        vendorId ||
        'This upload';

      setUploadStatus({
        type: 'error',
        message: `${friendlyName} accepts ${getFormatLabelForVendor(vendorId)} uploads.`,
      });
    }

    return isAllowed;
  };

  // Map vendor/kind to backend report_type
  // Marketplace (amazon/flipkart): use format {vendorid}_{kind}
  // All others: just use vendor name in lowercase
  const getReportType = (vendorId: string, kind?: 'sales' | 'sales_b2b' | 'settlement'): string => {
    const vendorIdLower = vendorId.toLowerCase();
    // Marketplace vendors use format: {vendorid}_{kind}
    if (vendorIdLower === 'amazon' || vendorIdLower === 'flipkart') {
      if (kind === 'sales_b2b') {
        return 'amazon_sales_b2b';
      }
      return kind ? `${vendorIdLower}_${kind}` : vendorIdLower;
    }
    // All other vendors: just return vendor name in lowercase
    return vendorIdLower;
  };

  const handleNavigateToMarketplace = async (year: number, monthIndex: number) => {
    setSelectedYear(year);
    setSelectedMonth(monthIndex);
    setCurrentView('marketplace');
    setUploadStatus(null);
    setHoveredYear(null);
    setHoveredMonth(null);
    
    // Fetch uploaded documents for this month
    await fetchUploadedDocuments(year, monthIndex);
  };

  const handleNavigateToD2C = async (year: number, monthIndex: number) => {
    setSelectedYear(year);
    setSelectedMonth(monthIndex);
    setCurrentView('d2c');
    setUploadStatus(null);
    setHoveredYear(null);
    setHoveredMonth(null);
    
    // Fetch uploaded documents for this month
    await fetchUploadedDocuments(year, monthIndex);
  };

  const handleBackToYears = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setCurrentView('years');
    setUploadStatus(null);
    setHoveredYear(null);
    setHoveredMonth(null);
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
      formData.append('report_type', getReportType(vendorId));

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
        if (response.status === 400) {
          const vendorName = vendors.find(v => v.id === vendorId)?.name || vendorId;
          throw new Error(`Please upload the correct file for ${vendorName}`);
        }
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
  const setMarketplaceFile = (vendorId: 'amazon' | 'flipkart', kind: 'sales' | 'sales_b2b' | 'settlement', file: File | null) => {
    setMarketplaceFiles((prev) => ({
      ...prev,
      [vendorId]: { ...prev[vendorId], [kind]: file },
    }));
  };

  const handleMarketplaceUploadClick = (vendorId: 'amazon' | 'flipkart', kind: 'sales' | 'sales_b2b' | 'settlement') => {
    const file = marketplaceFiles[vendorId]?.[kind];
    if (!file || selectedYear === null || selectedMonth === null) return;

    // Check if file is already uploaded
    if (isVendorUploaded(vendorId, kind)) {
      // Show confirmation dialog
      setPendingUpload({ vendorId, kind });
      setConfirmDialogOpen(true);
    } else {
      // Proceed directly with upload
      performMarketplaceUpload(vendorId, kind);
    }
  };

  const handleConfirmReupload = () => {
    if (pendingUpload) {
      setConfirmDialogOpen(false);
      performMarketplaceUpload(pendingUpload.vendorId, pendingUpload.kind);
      setPendingUpload(null);
    }
  };

  const handleCancelReupload = () => {
    setConfirmDialogOpen(false);
    setPendingUpload(null);
  };

  const performMarketplaceUpload = async (vendorId: 'amazon' | 'flipkart', kind: 'sales' | 'sales_b2b' | 'settlement') => {
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
      formData.append('report_type', getReportType(vendorId, kind));

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
        if (response.status === 400) {
          const vendorName = vendorId === 'amazon' ? 'Amazon' : vendorId === 'flipkart' ? 'Flipkart' : vendorId;
          throw new Error(`Please upload the correct ${kind} file for ${vendorName}`);
        }
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
    const salesB2bFile = vendorId === 'amazon' ? marketplaceFiles[vendorId]?.sales_b2b : null;
    const settlementFile = marketplaceFiles[vendorId]?.settlement;
    if (vendorId === 'amazon') {
      if (!salesFile || !salesB2bFile || !settlementFile || selectedYear === null || selectedMonth === null) return;
    } else {
      if (!salesFile || !settlementFile || selectedYear === null || selectedMonth === null) return;
    }
    setUploadingVendor(`${vendorId}_bulk`);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', salesFile);
      if (vendorId === 'amazon' && salesB2bFile) {
        formData.append('file2', settlementFile);
        formData.append('file3', salesB2bFile);
        formData.append('description', `${vendorId} B2C sales/settlement/B2B sales bulk upload for ${months[selectedMonth]} ${selectedYear}`);
        formData.append('month', months[selectedMonth]);
        formData.append('year', selectedYear.toString());
        formData.append('report_type', `${vendorId}_sales`);
        formData.append('report_type2', `${vendorId}_settlement`);
        formData.append('report_type3', 'amazon_sales_b2b');
      } else {
        formData.append('file2', settlementFile);
        formData.append('description', `${vendorId} sales/settlement bulk upload for ${months[selectedMonth]} ${selectedYear}`);
        formData.append('month', months[selectedMonth]);
        formData.append('year', selectedYear.toString());
        formData.append('report_type', `${vendorId}_sales`);
        formData.append('report_type2', `${vendorId}_settlement`);
      }
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
        if (response.status === 400) {
          const vendorName = vendorId === 'amazon' ? 'Amazon' : 'Flipkart';
          throw new Error(`Please upload the correct files for ${vendorName}`);
        }
        throw new Error(errorData.message || errorData.error || `Bulk upload failed with status ${response.status}`);
      }
      setUploadStatus({ type: 'success', message: `Successfully uploaded ${vendorId === 'amazon' ? 'all files' : 'both files'} for ${vendorId}` });
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

  const handleD2cUpload = async (vendorId: string, kind: 'sales' | 'settlement', fileOverride?: File | null) => {
    const file = fileOverride || d2cFiles[vendorId]?.[kind];
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
      formData.append('report_type', getReportType(vendorId, kind));

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
        if (response.status === 400) {
          const vendorName = vendors.find(v => v.id === vendorId)?.name || vendorId;
          throw new Error(`Please upload the correct file for ${vendorName}`);
        }
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
  const handleLastMileStatusUpload = async (fileOverride?: File | null) => {
    const file = fileOverride || lastMileStatusFile;
    if (!file || selectedYear === null || selectedMonth === null) return;

    setUploadingVendor('lastmile_status');
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `Last Mile Status file for ${months[selectedMonth]} ${selectedYear}`);
      formData.append('month', months[selectedMonth]);
      formData.append('year', selectedYear.toString());
      formData.append('report_type', 'lastmile');

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
        if (response.status === 400) {
          throw new Error('Please upload the correct Last Mile Status file');
        }
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

  // Unicommerce Sales Upload handler
  const handleUnicommerceUpload = async (fileOverride?: File | null) => {
    const file = fileOverride || unicommerceFile;
    if (!file || selectedYear === null || selectedMonth === null) return;

    setUploadingVendor('unicommerce_sales');
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `Unicommerce sales file for ${months[selectedMonth]} ${selectedYear}`);
      formData.append('month', months[selectedMonth]);
      formData.append('year', selectedYear.toString());
      formData.append('report_type', 'unicommerce');

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
        if (response.status === 400) {
          throw new Error('Please upload the correct file for Unicommerce');
        }
        throw new Error(errorData.message || errorData.error || `Upload failed with status ${response.status}`);
      }

      await response.json();
      setUploadStatus({ type: 'success', message: `Successfully uploaded Unicommerce sales file` });
      setUnicommerceFile(null);

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

  // Check if a vendor already has an uploaded document
  const isVendorUploaded = (vendorId: string, kind?: 'sales' | 'sales_b2b' | 'settlement'): boolean => {
    const key = kind ? `${vendorId}_${kind}` : vendorId;
    const expected = getReportType(vendorId, kind);
    return uploadedDocuments.some(doc => {
      const rt = doc.report_type.toLowerCase();
      return rt === key.toLowerCase() || rt === expected.toLowerCase();
    });
  };

  // Get uploaded document for a vendor
  const getUploadedDocument = (vendorId: string, kind?: 'sales' | 'sales_b2b' | 'settlement'): UploadedDocument | undefined => {
    const key = kind ? `${vendorId}_${kind}` : vendorId;
    const expected = getReportType(vendorId, kind);
    return uploadedDocuments.find(doc => {
      const rt = doc.report_type.toLowerCase();
      return rt === key.toLowerCase() || rt === expected.toLowerCase();
    });
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
            {(currentView === 'marketplace' || currentView === 'd2c') && selectedYear && selectedMonth !== null && (
              <>
              <Link
                component="button"
                variant="body2"
                  onClick={handleBackToYears}
                sx={{
                    color: '#6b7280',
                  textDecoration: 'none',
                    fontWeight: 400,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {selectedYear}
              </Link>
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleBackToYears}
                  sx={{
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontWeight: 400,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {months[selectedMonth]}
                </Link>
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                  {currentView === 'marketplace' ? 'Marketplace' : 'D2C'}
              </Typography>
              </>
            )}
          </Breadcrumbs>
        </Box>

        {/* Years View with Hover Dropdowns */}
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
                      onMouseEnter={() => {
                        setHoveredYear(year);
                        // Clear any pending timeout
                        if (hoverTimeoutRef.current) {
                          clearTimeout(hoverTimeoutRef.current);
                          hoverTimeoutRef.current = null;
                        }
                      }}
                      onMouseLeave={() => {
                        // Delay to allow moving to dropdown
                        hoverTimeoutRef.current = setTimeout(() => {
                          if (!hoveredMonth || hoveredMonth.year !== year) {
                            setHoveredYear(null);
                          }
                          hoverTimeoutRef.current = null;
                        }, 300);
                      }}
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        background: '#ffffff',
                        border: hoveredYear === year ? '1.5px solid #111111' : '1.5px solid #e5e7eb',
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
                      
                      {/* Months Dropdown */}
                      {hoveredYear === year && (
                        <Box
                          onMouseEnter={() => {
                            setHoveredYear(year);
                            // Clear any pending timeout
                            if (hoverTimeoutRef.current) {
                              clearTimeout(hoverTimeoutRef.current);
                              hoverTimeoutRef.current = null;
                            }
                          }}
                          onMouseLeave={() => {
                            hoverTimeoutRef.current = setTimeout(() => {
                            setHoveredYear(null);
                            setHoveredMonth(null);
                              hoverTimeoutRef.current = null;
                            }, 300);
                          }}
            sx={{ 
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            mt: 0, // No gap
              background: '#ffffff',
              border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                            zIndex: 1000,
                            overflow: 'visible',
                            py: 1
                          }}
                        >
                          {months.map((month, monthIndex) => {
                            const isHovered = hoveredMonth?.year === year && hoveredMonth?.month === monthIndex;
                return (
                              <Box 
                                key={monthIndex}
                                sx={{ position: 'relative', display: 'flex' }}
                                onMouseEnter={() => {
                                  // Clear any pending timeout
                                  if (hoverTimeoutRef.current) {
                                    clearTimeout(hoverTimeoutRef.current);
                                    hoverTimeoutRef.current = null;
                                  }
                                  setHoveredMonth({ year, month: monthIndex });
                                }}
                                onMouseLeave={() => {
                                  // Set timeout to close dropdown, but it will be cleared if mouse enters dropdown
                                  hoverTimeoutRef.current = setTimeout(() => {
                                    setHoveredMonth(null);
                                    hoverTimeoutRef.current = null;
                                  }, 200);
                                }}
                              >
                                <Box
                      sx={{
                                    px: 2,
                                    py: 1.5,
                        cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    background: isHovered ? '#f8fafc' : 'transparent',
                                    '&:hover': {
                                      background: '#f8fafc'
                                    }
                                  }}
                                >
                                  <Typography variant="body2" fontWeight={600} color="#111111" sx={{ textAlign: 'left' }}>
                                    {month}
                                  </Typography>
                                  <KeyboardArrowRightIcon sx={{ fontSize: 20, color: '#6b7280' }} />
                                </Box>
                                
                                {/* Marketplace and D2C Dropdown */}
                                {isHovered && (
                                  <Box
                                    data-dropdown
                                    onMouseEnter={() => {
                                      // Clear timeout when entering dropdown
                                      if (hoverTimeoutRef.current) {
                                        clearTimeout(hoverTimeoutRef.current);
                                        hoverTimeoutRef.current = null;
                                      }
                                      setHoveredMonth({ year, month: monthIndex });
                                    }}
                                    onMouseLeave={() => {
                                      // Close dropdown when leaving
                                      if (hoverTimeoutRef.current) {
                                        clearTimeout(hoverTimeoutRef.current);
                                      }
                                      hoverTimeoutRef.current = setTimeout(() => {
                                        setHoveredMonth(null);
                                        hoverTimeoutRef.current = null;
                                      }, 100);
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      left: '100%',
                                      top: 0,
                                      ml: 0,
                        background: '#ffffff',
                                      border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                      minWidth: 200,
                                      py: 1,
                                      zIndex: 1001,
                                      pointerEvents: 'auto'
                                    }}
                                  >
                                    <MenuItem
                                      onClick={() => handleNavigateToMarketplace(year, monthIndex)}
                                      sx={{
                                        py: 1.5,
                                        px: 2,
                        '&:hover': {
                                          background: '#f8fafc'
                                        }
                                      }}
                                    >
                                      <Typography variant="body2" fontWeight={600}>
                                        Marketplace
                                      </Typography>
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() => handleNavigateToD2C(year, monthIndex)}
                        sx={{ 
                                        py: 1.5,
                                        px: 2,
                                        '&:hover': {
                                          background: '#f8fafc'
                                        }
                                      }}
                                    >
                                      <Typography variant="body2" fontWeight={600}>
                                        D2C
                                      </Typography>
                                    </MenuItem>
                    </Box>
                                )}
                              </Box>
                );
              })}
                        </Box>
                      )}
                    </Box>
            </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        )}


        {/* Marketplace View - Flipkart and Amazon side by side */}
        {currentView === 'marketplace' && selectedMonth !== null && (
          <Paper 
            elevation={0} 
            sx={{ p: 4, background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', minHeight: '60vh' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Button
                onClick={handleBackToYears}
                startIcon={<ChevronRightIcon sx={{ transform: 'rotate(180deg)' }} />}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                Back
              </Button>
              <Typography variant="h6" fontWeight={700} color="#1e293b">
                Marketplace Uploads - {months[selectedMonth]} {selectedYear}
            </Typography>
            </Box>
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
            <Grid container spacing={4}>
              {/* Flipkart */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 3, border: '2px solid #e5e7eb', borderRadius: '12px' }}>
                  <Typography variant="h6" fontWeight={700} color="#111111" mb={4}>
                    Flipkart
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, position: 'relative', maxWidth: 800, mx: 'auto' }}>
                    {/* Step 1: Sales File */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        flex: '0 0 auto',
                        width: 220,
                        p: 2,
                        border: isVendorUploaded('flipkart', 'sales') ? '2px solid #16a34a' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        background: isVendorUploaded('flipkart', 'sales') ? '#f0fdf4' : '#ffffff',
                        position: 'relative',
                        zIndex: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        {/* Step Number Circle */}
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: isVendorUploaded('flipkart', 'sales') ? '#16a34a' : '#f3f4f6',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: isVendorUploaded('flipkart', 'sales') ? 'none' : '2px solid #d1d5db'
                        }}>
                          {isVendorUploaded('flipkart', 'sales') ? (
                            <CheckCircleIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                          ) : (
                            <Typography variant="body2" fontWeight={700} color="#6b7280">1</Typography>
                          )}
                        </Box>
                        
                        {/* Step Title */}
                        <Typography variant="body2" fontWeight={600} color="#111111" textAlign="center">
                          Sales File
                        </Typography>
                        
                        {/* Uploaded File Info */}
                      {isVendorUploaded('flipkart', 'sales') && getUploadedDocument('flipkart', 'sales') && (
                          <Typography variant="caption" color="#16a34a" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                            {getUploadedDocument('flipkart', 'sales')?.filename}
                        </Typography>
                      )}
                        
                        {/* File Input */}
                        <input
                          accept={getAcceptForVendor('flipkart')}
                          style={{ display: 'none' }}
                          id="flipkart-sales-upload"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              if (!validateFileType(file, 'flipkart', 'Flipkart sales')) {
                                e.target.value = '';
                                return;
                              }
                              setMarketplaceFile('flipkart', 'sales', file);
                            }
                            e.target.value = '';
                          }}
                          disabled={!!uploadingVendor}
                        />
                        <label htmlFor="flipkart-sales-upload">
                          <Button
                            variant={isVendorUploaded('flipkart', 'sales') ? 'outlined' : 'contained'}
                            component="span"
                            size="small"
                            startIcon={<CloudUploadIcon />}
                            disabled={!!uploadingVendor || uploadingVendor === 'flipkart_sales'}
                            endIcon={uploadingVendor === 'flipkart_sales' ? <CircularProgress size={14} /> : null}
                            onClick={() => {
                              if (marketplaceFiles.flipkart?.sales) {
                                handleMarketplaceUploadClick('flipkart', 'sales');
                              }
                            }}
                            sx={{ 
                              minWidth: 120,
                              fontSize: '0.75rem',
                              py: 0.75,
                              ...(isVendorUploaded('flipkart', 'sales') && {
                                borderColor: '#16a34a',
                                color: '#16a34a'
                              })
                            }}
                          >
                            {uploadingVendor === 'flipkart_sales' ? 'Uploading...' : marketplaceFiles.flipkart?.sales ? 'Upload' : 'Choose File'}
                          </Button>
                        </label>
                        {marketplaceFiles.flipkart?.sales && !isVendorUploaded('flipkart', 'sales') && (
                          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                            {marketplaceFiles.flipkart.sales.name}
                          </Typography>
                        )}
                      </Box>
                    </Paper>

                    {/* Connector Line */}
                    <Box sx={{ 
                      width: 80,
                      height: '3px',
                      background: isVendorUploaded('flipkart', 'sales') 
                        ? 'linear-gradient(to right, #16a34a, #16a34a)' 
                        : 'linear-gradient(to right, #d1d5db, #d1d5db)',
                      position: 'relative',
                      zIndex: 3
                    }}>
                      {isVendorUploaded('flipkart', 'sales') && (
                        <Box sx={{
                          position: 'absolute',
                          right: -8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 4
                        }}>
                          <ArrowForwardIcon sx={{ fontSize: 12, color: '#ffffff' }} />
                        </Box>
                      )}
                    </Box>

                    {/* Step 2: Settlement File */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        flex: '0 0 auto',
                        width: 220,
                        p: 2,
                        border: isVendorUploaded('flipkart', 'settlement') 
                          ? '2px solid #16a34a' 
                          : (!isVendorUploaded('flipkart', 'sales') ? '2px dashed #d1d5db' : '2px solid #e5e7eb'),
                        borderRadius: '12px',
                        background: isVendorUploaded('flipkart', 'settlement') 
                          ? '#f0fdf4' 
                          : (!isVendorUploaded('flipkart', 'sales') ? '#f9fafb' : '#ffffff'),
                        position: 'relative',
                        zIndex: 2,
                        opacity: isVendorUploaded('flipkart', 'sales') ? 1 : 0.6
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        {/* Step Number Circle */}
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: isVendorUploaded('flipkart', 'settlement') 
                            ? '#16a34a' 
                            : (!isVendorUploaded('flipkart', 'sales') ? '#f3f4f6' : '#f3f4f6'),
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: isVendorUploaded('flipkart', 'settlement') 
                            ? 'none' 
                            : (!isVendorUploaded('flipkart', 'sales') ? '2px dashed #d1d5db' : '2px solid #d1d5db'),
                          position: 'relative'
                        }}>
                          {isVendorUploaded('flipkart', 'settlement') ? (
                            <CheckCircleIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                          ) : !isVendorUploaded('flipkart', 'sales') ? (
                            <LockIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                          ) : (
                            <Typography variant="body2" fontWeight={700} color="#6b7280">2</Typography>
                    )}
                  </Box>
                        
                        {/* Step Title */}
                        <Typography variant="body2" fontWeight={600} color={isVendorUploaded('flipkart', 'sales') ? '#111111' : '#9ca3af'} textAlign="center">
                          Settlement File
                        </Typography>
                        
                        {/* Uploaded File Info */}
                      {isVendorUploaded('flipkart', 'settlement') && getUploadedDocument('flipkart', 'settlement') && (
                          <Typography variant="caption" color="#16a34a" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                            {getUploadedDocument('flipkart', 'settlement')?.filename}
                      </Typography>
                      )}
                        
                        {/* File Input */}
                        <input
                          accept={getAcceptForVendor('flipkart')}
                          style={{ display: 'none' }}
                          id="flipkart-settlement-upload"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              if (!validateFileType(file, 'flipkart', 'Flipkart settlement')) {
                                e.target.value = '';
                                return;
                              }
                              setMarketplaceFile('flipkart', 'settlement', file);
                            }
                            e.target.value = '';
                          }}
                          disabled={!!uploadingVendor || !isVendorUploaded('flipkart', 'sales')}
                        />
                        <label htmlFor="flipkart-settlement-upload">
                          <Button
                            variant={isVendorUploaded('flipkart', 'settlement') ? 'outlined' : 'contained'}
                            component="span"
                            size="small"
                            startIcon={<CloudUploadIcon />}
                            disabled={!!uploadingVendor || uploadingVendor === 'flipkart_settlement' || !isVendorUploaded('flipkart', 'sales')}
                            endIcon={uploadingVendor === 'flipkart_settlement' ? <CircularProgress size={14} /> : null}
                            onClick={() => {
                              if (marketplaceFiles.flipkart?.settlement) {
                                handleMarketplaceUploadClick('flipkart', 'settlement');
                              }
                            }}
                            sx={{ 
                              minWidth: 120,
                              fontSize: '0.75rem',
                              py: 0.75,
                              ...(!isVendorUploaded('flipkart', 'sales') && {
                                background: '#f3f4f6',
                                color: '#9ca3af',
                                cursor: 'not-allowed',
                                border: 'none',
                                '&:hover': {
                                  background: '#f3f4f6',
                                }
                              }),
                              ...(isVendorUploaded('flipkart', 'settlement') && {
                                borderColor: '#16a34a',
                                color: '#16a34a'
                              })
                            }}
                          >
                            {uploadingVendor === 'flipkart_settlement' ? 'Uploading...' : marketplaceFiles.flipkart?.settlement ? 'Upload' : 'Choose File'}
                          </Button>
                        </label>
                        {marketplaceFiles.flipkart?.settlement && !isVendorUploaded('flipkart', 'settlement') && (
                          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                            {marketplaceFiles.flipkart.settlement.name}
                      </Typography>
                    )}
                  </Box>
                    </Paper>
                  </Box>
                </Paper>
              </Grid>

              {/* Amazon */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 3, border: '2px solid #e5e7eb', borderRadius: '12px' }}>
                  <Typography variant="h6" fontWeight={700} color="#111111" mb={4}>
                    Amazon
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, position: 'relative', maxWidth: 1000, mx: 'auto' }}>
                    {/* Step 1: B2C Sales File */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        flex: '0 0 auto',
                        width: 200,
                        p: 2,
                        border: isVendorUploaded('amazon', 'sales') ? '2px solid #16a34a' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        background: isVendorUploaded('amazon', 'sales') ? '#f0fdf4' : '#ffffff',
                        position: 'relative',
                        zIndex: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        {/* Step Number Circle */}
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: isVendorUploaded('amazon', 'sales') ? '#16a34a' : '#f3f4f6',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: isVendorUploaded('amazon', 'sales') ? 'none' : '2px solid #d1d5db'
                        }}>
                          {isVendorUploaded('amazon', 'sales') ? (
                            <CheckCircleIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                          ) : (
                            <Typography variant="body2" fontWeight={700} color="#6b7280">1</Typography>
                          )}
                        </Box>
                        
                        {/* Step Title */}
                        <Typography variant="body2" fontWeight={600} color="#111111" textAlign="center">
                          B2C Sales File
                        </Typography>
                        
                        {/* Uploaded File Info */}
                      {isVendorUploaded('amazon', 'sales') && getUploadedDocument('amazon', 'sales') && (
                          <Typography variant="caption" color="#16a34a" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                            {getUploadedDocument('amazon', 'sales')?.filename}
                        </Typography>
                      )}
                        
                        {/* File Input */}
                <input
                          accept={getAcceptForVendor('amazon')}
                  style={{ display: 'none' }}
                          id="amazon-sales-upload"
                  type="file"
                          onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                              if (!validateFileType(file, 'amazon', 'Amazon B2C sales')) {
                        e.target.value = '';
                        return;
                      }
                              setMarketplaceFile('amazon', 'sales', file);
                    }
                    e.target.value = '';
                  }}
                          disabled={!!uploadingVendor}
                />
                        <label htmlFor="amazon-sales-upload">
                  <Button
                            variant={isVendorUploaded('amazon', 'sales') ? 'outlined' : 'contained'}
                    component="span"
                            size="small"
                            startIcon={<CloudUploadIcon />}
                            disabled={!!uploadingVendor || uploadingVendor === 'amazon_sales'}
                            endIcon={uploadingVendor === 'amazon_sales' ? <CircularProgress size={14} /> : null}
                            onClick={() => {
                              if (marketplaceFiles.amazon?.sales) {
                                handleMarketplaceUploadClick('amazon', 'sales');
                              }
                            }}
                            sx={{ 
                              minWidth: 120,
                              fontSize: '0.75rem',
                              py: 0.75,
                              ...(isVendorUploaded('amazon', 'sales') && {
                                borderColor: '#16a34a',
                                color: '#16a34a'
                              })
                            }}
                          >
                            {uploadingVendor === 'amazon_sales' ? 'Uploading...' : marketplaceFiles.amazon?.sales ? 'Upload' : 'Choose File'}
                  </Button>
                </label>
                        {marketplaceFiles.amazon?.sales && !isVendorUploaded('amazon', 'sales') && (
                          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                            {marketplaceFiles.amazon.sales.name}
                          </Typography>
                        )}
                      </Box>
                    </Paper>

                    {/* Connector Line 1 */}
                    <Box sx={{ 
                      width: 60,
                      height: '3px',
                      background: isVendorUploaded('amazon', 'sales') 
                        ? 'linear-gradient(to right, #16a34a, #16a34a)' 
                        : 'linear-gradient(to right, #d1d5db, #d1d5db)',
                      position: 'relative',
                      zIndex: 3
                    }}>
                      {isVendorUploaded('amazon', 'sales') && (
                        <Box sx={{
                          position: 'absolute',
                          right: -8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 4
                        }}>
                          <ArrowForwardIcon sx={{ fontSize: 12, color: '#ffffff' }} />
                        </Box>
                      )}
            </Box>
            
                    {/* Step 2: B2B Sales File */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        flex: '0 0 auto',
                        width: 200,
                        p: 2,
                        border: isVendorUploaded('amazon', 'sales_b2b') 
                          ? '2px solid #16a34a' 
                          : (!isVendorUploaded('amazon', 'sales') ? '2px dashed #d1d5db' : '2px solid #e5e7eb'),
                        borderRadius: '12px',
                        background: isVendorUploaded('amazon', 'sales_b2b') 
                          ? '#f0fdf4' 
                          : (!isVendorUploaded('amazon', 'sales') ? '#f9fafb' : '#ffffff'),
                        position: 'relative',
                        zIndex: 2,
                        opacity: isVendorUploaded('amazon', 'sales') ? 1 : 0.6
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        {/* Step Number Circle */}
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: isVendorUploaded('amazon', 'sales_b2b') 
                            ? '#16a34a' 
                            : (!isVendorUploaded('amazon', 'sales') ? '#f3f4f6' : '#f3f4f6'),
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: isVendorUploaded('amazon', 'sales_b2b') 
                            ? 'none' 
                            : (!isVendorUploaded('amazon', 'sales') ? '2px dashed #d1d5db' : '2px solid #d1d5db'),
                          position: 'relative'
                        }}>
                          {isVendorUploaded('amazon', 'sales_b2b') ? (
                            <CheckCircleIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                          ) : !isVendorUploaded('amazon', 'sales') ? (
                            <LockIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                          ) : (
                            <Typography variant="body2" fontWeight={700} color="#6b7280">2</Typography>
                        )}
                      </Box>
                        
                        {/* Step Title */}
                        <Typography variant="body2" fontWeight={600} color={isVendorUploaded('amazon', 'sales') ? '#111111' : '#9ca3af'} textAlign="center">
                          B2B Sales File
                        </Typography>
                        
                        {/* Uploaded File Info */}
                      {isVendorUploaded('amazon', 'sales_b2b') && getUploadedDocument('amazon', 'sales_b2b') && (
                          <Typography variant="caption" color="#16a34a" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                            {getUploadedDocument('amazon', 'sales_b2b')?.filename}
                        </Typography>
                      )}
                        
                        {/* File Input */}
                        <input
                          accept={getAcceptForVendor('amazon')}
                          style={{ display: 'none' }}
                          id="amazon-sales-b2b-upload"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              if (!validateFileType(file, 'amazon', 'Amazon B2B sales')) {
                                e.target.value = '';
                                return;
                              }
                              setMarketplaceFile('amazon', 'sales_b2b', file);
                            }
                            e.target.value = '';
                          }}
                          disabled={!!uploadingVendor || !isVendorUploaded('amazon', 'sales')}
                        />
                        <label htmlFor="amazon-sales-b2b-upload">
                          <Button
                            variant={isVendorUploaded('amazon', 'sales_b2b') ? 'outlined' : 'contained'}
                            component="span"
                            size="small"
                            startIcon={<CloudUploadIcon />}
                            disabled={!!uploadingVendor || uploadingVendor === 'amazon_sales_b2b' || !isVendorUploaded('amazon', 'sales')}
                            endIcon={uploadingVendor === 'amazon_sales_b2b' ? <CircularProgress size={14} /> : null}
                            onClick={() => {
                              if (marketplaceFiles.amazon?.sales_b2b) {
                                handleMarketplaceUploadClick('amazon', 'sales_b2b');
                              }
                            }}
                            sx={{ 
                              minWidth: 120,
                              fontSize: '0.75rem',
                              py: 0.75,
                              ...(!isVendorUploaded('amazon', 'sales') && {
                                background: '#f3f4f6',
                                color: '#9ca3af',
                                cursor: 'not-allowed',
                                border: 'none',
                                '&:hover': {
                                  background: '#f3f4f6',
                                }
                              }),
                              ...(isVendorUploaded('amazon', 'sales_b2b') && {
                                borderColor: '#16a34a',
                                color: '#16a34a'
                              })
                            }}
                          >
                            {uploadingVendor === 'amazon_sales_b2b' ? 'Uploading...' : marketplaceFiles.amazon?.sales_b2b ? 'Upload' : 'Choose File'}
                          </Button>
                        </label>
                        {marketplaceFiles.amazon?.sales_b2b && !isVendorUploaded('amazon', 'sales_b2b') && (
                          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                            {marketplaceFiles.amazon.sales_b2b.name}
                          </Typography>
                        )}
                      </Box>
                    </Paper>

                    {/* Connector Line 2 */}
                    <Box sx={{ 
                      width: 60,
                      height: '3px',
                      background: isVendorUploaded('amazon', 'sales_b2b') 
                        ? 'linear-gradient(to right, #16a34a, #16a34a)' 
                        : 'linear-gradient(to right, #d1d5db, #d1d5db)',
                      position: 'relative',
                      zIndex: 3
                    }}>
                      {isVendorUploaded('amazon', 'sales_b2b') && (
                        <Box sx={{
                          position: 'absolute',
                          right: -8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 4
                        }}>
                          <ArrowForwardIcon sx={{ fontSize: 12, color: '#ffffff' }} />
                        </Box>
                      )}
                    </Box>

                    {/* Step 3: Settlement File */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        flex: '0 0 auto',
                        width: 200,
                        p: 2,
                        border: isVendorUploaded('amazon', 'settlement') 
                          ? '2px solid #16a34a' 
                          : (!isVendorUploaded('amazon', 'sales_b2b') ? '2px dashed #d1d5db' : '2px solid #e5e7eb'),
                        borderRadius: '12px',
                        background: isVendorUploaded('amazon', 'settlement') 
                          ? '#f0fdf4' 
                          : (!isVendorUploaded('amazon', 'sales_b2b') ? '#f9fafb' : '#ffffff'),
                        position: 'relative',
                        zIndex: 2,
                        opacity: isVendorUploaded('amazon', 'sales_b2b') ? 1 : 0.6
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        {/* Step Number Circle */}
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: isVendorUploaded('amazon', 'settlement') 
                            ? '#16a34a' 
                            : (!isVendorUploaded('amazon', 'sales_b2b') ? '#f3f4f6' : '#f3f4f6'),
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: isVendorUploaded('amazon', 'settlement') 
                            ? 'none' 
                            : (!isVendorUploaded('amazon', 'sales_b2b') ? '2px dashed #d1d5db' : '2px solid #d1d5db'),
                          position: 'relative'
                        }}>
                          {isVendorUploaded('amazon', 'settlement') ? (
                            <CheckCircleIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                          ) : !isVendorUploaded('amazon', 'sales_b2b') ? (
                            <LockIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                          ) : (
                            <Typography variant="body2" fontWeight={700} color="#6b7280">3</Typography>
                          )}
                        </Box>
                        
                        {/* Step Title */}
                        <Typography variant="body2" fontWeight={600} color={isVendorUploaded('amazon', 'sales_b2b') ? '#111111' : '#9ca3af'} textAlign="center">
                          Settlement File
                        </Typography>
                        
                        {/* Uploaded File Info */}
                      {isVendorUploaded('amazon', 'settlement') && getUploadedDocument('amazon', 'settlement') && (
                          <Typography variant="caption" color="#16a34a" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                            {getUploadedDocument('amazon', 'settlement')?.filename}
                        </Typography>
                      )}
                        
                        {/* File Input */}
                        <input
                          accept={getAcceptForVendor('amazon')}
                          style={{ display: 'none' }}
                          id="amazon-settlement-upload"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              if (!validateFileType(file, 'amazon', 'Amazon settlement')) {
                                e.target.value = '';
                                return;
                              }
                              setMarketplaceFile('amazon', 'settlement', file);
                            }
                            e.target.value = '';
                          }}
                          disabled={!!uploadingVendor || !isVendorUploaded('amazon', 'sales_b2b')}
                        />
                        <label htmlFor="amazon-settlement-upload">
                    <Button
                            variant={isVendorUploaded('amazon', 'settlement') ? 'outlined' : 'contained'}
                            component="span"
                            size="small"
                            startIcon={<CloudUploadIcon />}
                            disabled={!!uploadingVendor || uploadingVendor === 'amazon_settlement' || !isVendorUploaded('amazon', 'sales_b2b')}
                            endIcon={uploadingVendor === 'amazon_settlement' ? <CircularProgress size={14} /> : null}
                            onClick={() => {
                              if (marketplaceFiles.amazon?.settlement) {
                                handleMarketplaceUploadClick('amazon', 'settlement');
                              }
                            }}
                            sx={{ 
                              minWidth: 120,
                              fontSize: '0.75rem',
                              py: 0.75,
                              ...(!isVendorUploaded('amazon', 'sales_b2b') && {
                                background: '#f3f4f6',
                                color: '#9ca3af',
                                cursor: 'not-allowed',
                                border: 'none',
                                '&:hover': {
                                  background: '#f3f4f6',
                                }
                              }),
                              ...(isVendorUploaded('amazon', 'settlement') && {
                                borderColor: '#16a34a',
                                color: '#16a34a'
                              })
                            }}
                          >
                            {uploadingVendor === 'amazon_settlement' ? 'Uploading...' : marketplaceFiles.amazon?.settlement ? 'Upload' : 'Choose File'}
                    </Button>
                        </label>
                        {marketplaceFiles.amazon?.settlement && !isVendorUploaded('amazon', 'settlement') && (
                          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                            {marketplaceFiles.amazon.settlement.name}
                          </Typography>
                        )}
            </Box>
                    </Paper>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* D2C View - 3 steps: Sales file, Last Mile Status, D2C Settlement */}
        {currentView === 'd2c' && selectedMonth !== null && (
                  <Paper
                    elevation={0}
            sx={{ p: 4, background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', minHeight: '60vh' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Button
                onClick={handleBackToYears}
                startIcon={<ChevronRightIcon sx={{ transform: 'rotate(180deg)' }} />}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                Back
              </Button>
              <Typography variant="h6" fontWeight={700} color="#1e293b">
                D2C Uploads - {months[selectedMonth]} {selectedYear}
              </Typography>
            </Box>
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
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, position: 'relative', maxWidth: 1200, mx: 'auto', flexWrap: 'wrap' }}>
                {/* Step 1: Sales File (Unicommerce) */}
              <Paper 
                elevation={0}
                sx={{ 
                  flex: '0 0 auto',
                  width: 200,
                  p: 2,
                  border: isVendorUploaded('unicommerce') ? '2px solid #16a34a' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: isVendorUploaded('unicommerce') ? '#f0fdf4' : '#ffffff',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  {/* Step Number Circle */}
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: isVendorUploaded('unicommerce') ? '#16a34a' : '#f3f4f6',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: isVendorUploaded('unicommerce') ? 'none' : '2px solid #d1d5db'
                  }}>
                      {isVendorUploaded('unicommerce') ? (
                      <CheckCircleIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                      ) : (
                        <Typography variant="body2" fontWeight={700} color="#6b7280">1</Typography>
                        )}
                      </Box>
                  
                  {/* Step Title */}
                  <Typography variant="body2" fontWeight={600} color="#111111" textAlign="center">
                    Sales File
                      </Typography>
                  
                  {/* Uploaded File Info */}
                  {isVendorUploaded('unicommerce') && getUploadedDocument('unicommerce') && (
                    <Typography variant="caption" color="#16a34a" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                      {getUploadedDocument('unicommerce')?.filename}
                    </Typography>
                  )}
                  
                  {/* File Input */}
                    <input
                      accept={getAcceptForVendor('unicommerce')}
                      style={{ display: 'none' }}
                      id="d2c-unicommerce-sales-upload"
                      type="file"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          if (!validateFileType(file, 'unicommerce', 'Unicommerce sales')) {
                            e.target.value = '';
                            return;
                          }
                          setUnicommerceFile(file);
                          handleUnicommerceUpload(file);
                        }
                        e.target.value = '';
                      }}
                      disabled={uploadingVendor === 'unicommerce_sales'}
                    />
                    <label htmlFor="d2c-unicommerce-sales-upload">
                      <Button
                        variant={isVendorUploaded('unicommerce') ? 'outlined' : 'contained'}
                        component="span"
                      size="small"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploadingVendor === 'unicommerce_sales'}
                      endIcon={uploadingVendor === 'unicommerce_sales' ? <CircularProgress size={14} /> : null}
                      sx={{ 
                        minWidth: 120,
                        fontSize: '0.75rem',
                        py: 0.75,
                        ...(isVendorUploaded('unicommerce') && {
                          borderColor: '#16a34a',
                          color: '#16a34a'
                        })
                      }}
                    >
                      {uploadingVendor === 'unicommerce_sales' ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </label>
            </Box>
                </Paper>

              {/* Connector Line 1 */}
              <Box sx={{ 
                width: 60,
                height: '3px',
                background: isVendorUploaded('unicommerce') 
                  ? 'linear-gradient(to right, #16a34a, #16a34a)' 
                  : 'linear-gradient(to right, #d1d5db, #d1d5db)',
                position: 'relative',
                zIndex: 3,
                alignSelf: 'center'
              }}>
                {isVendorUploaded('unicommerce') && (
                  <Box sx={{
                    position: 'absolute',
                    right: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 4
                  }}>
                    <ArrowForwardIcon sx={{ fontSize: 12, color: '#ffffff' }} />
                  </Box>
                )}
              </Box>

                {/* Step 2: Last Mile Status */}
              <Paper 
                elevation={0}
                sx={{ 
                  flex: '0 0 auto',
                  width: 200,
                  p: 2,
                  border: isVendorUploaded('lastmile') 
                    ? '2px solid #16a34a' 
                    : (!isVendorUploaded('unicommerce') ? '2px dashed #d1d5db' : '2px solid #e5e7eb'),
                  borderRadius: '12px',
                  background: isVendorUploaded('lastmile') 
                    ? '#f0fdf4' 
                    : (!isVendorUploaded('unicommerce') ? '#f9fafb' : '#ffffff'),
                  position: 'relative',
                  zIndex: 2,
                  opacity: isVendorUploaded('unicommerce') ? 1 : 0.6
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  {/* Step Number Circle */}
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: isVendorUploaded('lastmile') 
                      ? '#16a34a' 
                      : (!isVendorUploaded('unicommerce') ? '#f3f4f6' : '#f3f4f6'),
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: isVendorUploaded('lastmile') 
                      ? 'none' 
                      : (!isVendorUploaded('unicommerce') ? '2px dashed #d1d5db' : '2px solid #d1d5db'),
                    position: 'relative'
                  }}>
                    {isVendorUploaded('lastmile') ? (
                      <CheckCircleIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                    ) : !isVendorUploaded('unicommerce') ? (
                      <LockIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                    ) : (
                        <Typography variant="body2" fontWeight={700} color="#6b7280">2</Typography>
                    )}
                  </Box>
                  
                  {/* Step Title */}
                  <Typography variant="body2" fontWeight={600} color={isVendorUploaded('unicommerce') ? '#111111' : '#9ca3af'} textAlign="center">
                    Last Mile Status
                      </Typography>
                  
                  {/* Uploaded File Info */}
                  {isVendorUploaded('lastmile') && getUploadedDocument('lastmile') && (
                    <Typography variant="caption" color="#16a34a" sx={{ textAlign: 'center', display: 'block', fontSize: '10px' }}>
                      {getUploadedDocument('lastmile')?.filename}
                      </Typography>
                    )}
                  
                  {/* File Input */}
                <input
                  accept={getAcceptForVendor('lastmile')}
                  style={{ display: 'none' }}
                      id="d2c-lastmile-status-upload"
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      if (!validateFileType(file, 'lastmile', 'Last Mile Status')) {
                        e.target.value = '';
                        return;
                      }
                      setLastMileStatusFile(file);
                      handleLastMileStatusUpload(file);
                    }
                    e.target.value = '';
                  }}
                    disabled={uploadingVendor === 'lastmile_status' || !isVendorUploaded('unicommerce')}
                />
                    <label htmlFor="d2c-lastmile-status-upload">
                  <Button
                    variant={isVendorUploaded('lastmile') ? 'outlined' : 'contained'}
                    component="span"
                      size="small"
                        startIcon={<CloudUploadIcon />}
                      disabled={uploadingVendor === 'lastmile_status' || !isVendorUploaded('unicommerce')}
                      endIcon={uploadingVendor === 'lastmile_status' ? <CircularProgress size={14} /> : null}
                      sx={{ 
                        minWidth: 120,
                        fontSize: '0.75rem',
                        py: 0.75,
                        ...(!isVendorUploaded('unicommerce') && {
                          background: '#f3f4f6',
                          color: '#9ca3af',
                          cursor: 'not-allowed',
                          border: 'none',
                          '&:hover': {
                            background: '#f3f4f6',
                          }
                        }),
                        ...(isVendorUploaded('lastmile') && {
                          borderColor: '#16a34a',
                          color: '#16a34a'
                        })
                      }}
                    >
                      {uploadingVendor === 'lastmile_status' ? 'Uploading...' : 'Choose File'}
                  </Button>
                </label>
                  </Box>
              </Paper>

              {/* Connector Line 2 */}
              <Box sx={{ 
                width: 60,
                height: '3px',
                background: isVendorUploaded('lastmile') 
                  ? 'linear-gradient(to right, #16a34a, #16a34a)' 
                  : 'linear-gradient(to right, #d1d5db, #d1d5db)',
                position: 'relative',
                zIndex: 3,
                alignSelf: 'center'
              }}>
                {isVendorUploaded('lastmile') && (
                  <Box sx={{
                    position: 'absolute',
                    right: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 4
                  }}>
                    <ArrowForwardIcon sx={{ fontSize: 12, color: '#ffffff' }} />
                  </Box>
                )}
              </Box>

                {/* Step 3: D2C Settlement List */}
              <Paper 
                elevation={0}
                sx={{ 
                  flex: '0 0 auto',
                  width: 400,
                  p: 2,
                  border: !isVendorUploaded('lastmile') ? '2px dashed #d1d5db' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: !isVendorUploaded('lastmile') ? '#f9fafb' : '#ffffff',
                  position: 'relative',
                  zIndex: 2,
                  opacity: isVendorUploaded('lastmile') ? 1 : 0.6
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  {/* Step Number Circle */}
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: !isVendorUploaded('lastmile') ? '#f3f4f6' : '#f3f4f6',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: !isVendorUploaded('lastmile') ? '2px dashed #d1d5db' : '2px solid #d1d5db',
                    position: 'relative'
                  }}>
                    {!isVendorUploaded('lastmile') ? (
                      <LockIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                    ) : (
                      <Typography variant="body2" fontWeight={700} color="#6b7280">3</Typography>
                    )}
                    </Box>
                  
                  {/* Step Title */}
                  <Typography variant="body2" fontWeight={600} color={isVendorUploaded('lastmile') ? '#111111' : '#9ca3af'} textAlign="center">
                    D2C Settlement
                      </Typography>
                  
                  {/* Settlement Providers List */}
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 400, overflowY: 'auto' }}>
                      {vendors.filter(v => v.id !== 'amazon' && v.id !== 'flipkart').map((vendor) => {
                        const isSettlementUploaded = isVendorUploaded(vendor.id, 'settlement');
                        const uploadedSettlementDoc = getUploadedDocument(vendor.id, 'settlement');
                        const isSettlementUploading = uploadingVendor === `${vendor.id}_settlement`;

                        return (
                          <Paper
                            key={vendor.id}
                            elevation={0}
                            sx={{ 
                              p: 1.5, 
                              border: isSettlementUploaded ? '1px solid #dcfce7' : '1px solid #e5e7eb', 
                              borderRadius: '8px', 
                              background: isSettlementUploaded ? '#f0fdf4' : '#ffffff' 
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <Typography variant="caption" fontWeight={600} color="#111111" sx={{ fontSize: '0.7rem' }}>
                                    {vendor.name}
                                  </Typography>
                                  {isSettlementUploaded && (
                                    <CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                                  )}
                                </Box>
                                {isSettlementUploaded && uploadedSettlementDoc ? (
                                  <Typography variant="caption" color="#16a34a" sx={{ display: 'block', fontSize: '9px' }}>
                                    {uploadedSettlementDoc.filename}
                                  </Typography>
                                ) : (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '9px' }}>
                                    Not uploaded
                                  </Typography>
                                )}
                              </Box>
                              <input
                                accept={getAcceptForVendor(vendor.id)}
                                style={{ display: 'none' }}
                                id={`d2c-settlement-upload-${vendor.id}`}
                                type="file"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0] || null;
                                  if (file) {
                                    if (!validateFileType(file, vendor.id, `${vendor.name} settlement`)) {
                                      e.target.value = '';
                                      return;
                                    }
                                    setD2cFile(vendor.id, 'settlement', file);
                                    handleD2cUpload(vendor.id, 'settlement', file);
                                  }
                                  e.target.value = '';
                                }}
                                disabled={isSettlementUploading || !isVendorUploaded('lastmile')}
                              />
                              <label htmlFor={`d2c-settlement-upload-${vendor.id}`}>
                                <Button
                                  variant={isSettlementUploaded ? 'outlined' : 'contained'}
                                  component="span"
                                  size="small"
                                  disabled={isSettlementUploading || !isVendorUploaded('lastmile')}
                                  endIcon={isSettlementUploading ? <CircularProgress size={12} /> : null}
                                  sx={{ 
                                    minWidth: 70,
                                    fontSize: '0.7rem',
                                    py: 0.5,
                                    px: 1,
                                    ...(!isVendorUploaded('lastmile') && {
                                      background: '#f3f4f6',
                                      color: '#9ca3af',
                                      cursor: 'not-allowed',
                                      border: 'none',
                                      '&:hover': {
                                        background: '#f3f4f6',
                                      }
                                    }),
                                    ...(isSettlementUploaded && {
                                      borderColor: '#16a34a',
                                      color: '#16a34a',
                                      minWidth: 70
                                    })
                                  }}
                                >
                                  {isSettlementUploading ? '...' : isSettlementUploaded ? 'Done' : 'Upload'}
                                </Button>
                              </label>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                    </Box>
                  </Box>
                </Paper>
            </Box>
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
              {/* File pickers */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                {/* B2C Sales report */}
                <Box sx={{ mb: 2, p: 1.5, borderRadius: '8px', background: isVendorUploaded(rightPanelVendor, 'sales') ? '#f0fdf4' : 'transparent', border: isVendorUploaded(rightPanelVendor, 'sales') ? '1px solid #dcfce7' : 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2">
                      {`B2C Sales report (${getFormatLabelForVendor(rightPanelVendor)})`}
                    </Typography>
                    {isVendorUploaded(rightPanelVendor, 'sales') && (
                      <Chip 
                        label="Uploaded" 
                        size="small" 
                        icon={<CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a !important' }} />}
                        sx={{ background: '#16a34a', color: '#ffffff', fontWeight: 600, fontSize: '10px', height: '20px' }} 
                      />
                    )}
                  </Box>
                  {isVendorUploaded(rightPanelVendor, 'sales') && getUploadedDocument(rightPanelVendor, 'sales') && (
                    <Typography variant="caption" color="#16a34a" sx={{ display: 'block', mb: 1 }}>
                      {getUploadedDocument(rightPanelVendor, 'sales')?.filename} • {new Date(getUploadedDocument(rightPanelVendor, 'sales')!.upload_date).toLocaleDateString()}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      accept={getAcceptForVendor(rightPanelVendor)}
                      style={{ display: 'none' }}
                      id={`drawer-${rightPanelVendor}-sales`}
                      type="file"
                      onChange={(e) => {
                        const vendorKey = rightPanelVendor;
                        const file = e.target.files?.[0] || null;
                        if (vendorKey && file) {
                          const vendorLabel = vendorKey === 'flipkart' ? 'Flipkart' : 'Amazon';
                          if (!validateFileType(file, vendorKey, `${vendorLabel} B2C sales`)) {
                            e.target.value = '';
                            return;
                          }
                          setMarketplaceFile(vendorKey, 'sales', file);
                        } else if (vendorKey) {
                          setMarketplaceFile(vendorKey, 'sales', null);
                        }
                        e.target.value = '';
                      }}
                      disabled={!!uploadingVendor}
                    />
                    <label htmlFor={`drawer-${rightPanelVendor}-sales`}>
                      <Button 
                        variant="outlined" 
                        component="span" 
                        startIcon={<CloudUploadIcon />}
                        disabled={!!uploadingVendor}
                      >
                        Choose file
                      </Button>
                    </label>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        flex: 1, 
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {marketplaceFiles[rightPanelVendor]?.sales?.name || 'No file selected'}
                    </Typography>
                    <Button
                      variant={isVendorUploaded(rightPanelVendor, 'sales') ? 'outlined' : 'contained'}
                      size="small"
                      disabled={
                        !marketplaceFiles[rightPanelVendor]?.sales ||
                        !!uploadingVendor ||
                        uploadingVendor === `${rightPanelVendor}_sales`
                      }
                      onClick={() => handleMarketplaceUploadClick(rightPanelVendor, 'sales')}
                      startIcon={uploadingVendor === `${rightPanelVendor}_sales` ? <CircularProgress size={16} sx={{ color: isVendorUploaded(rightPanelVendor, 'sales') ? '#111111' : '#fff' }} /> : <ArrowForwardIcon />}
                      sx={{ 
                        background: isVendorUploaded(rightPanelVendor, 'sales') ? '#ffffff' : '#111111', 
                        color: isVendorUploaded(rightPanelVendor, 'sales') ? '#111111' : '#ffffff',
                        borderColor: isVendorUploaded(rightPanelVendor, 'sales') ? '#e5e7eb' : 'transparent',
                        flexShrink: 0,
                        '&:hover': { 
                          background: isVendorUploaded(rightPanelVendor, 'sales') ? '#f8fafc' : '#333333',
                          borderColor: isVendorUploaded(rightPanelVendor, 'sales') ? '#d1d5db' : 'transparent'
                        }, 
                        fontWeight: 600 
                      }}
                    >
                      {uploadingVendor === `${rightPanelVendor}_sales` ? 'Uploading...' : isVendorUploaded(rightPanelVendor, 'sales') ? 'Re-upload' : 'Upload'}
                    </Button>
                  </Box>
                </Box>

                {/* B2B Sales report (Amazon only) */}
                {rightPanelVendor === 'amazon' && (
                  <Box sx={{ mb: 2, p: 1.5, borderRadius: '8px', background: isVendorUploaded(rightPanelVendor, 'sales_b2b') ? '#f0fdf4' : 'transparent', border: isVendorUploaded(rightPanelVendor, 'sales_b2b') ? '1px solid #dcfce7' : 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2">
                        {`B2B Sales report (${getFormatLabelForVendor('amazon')})`}
                      </Typography>
                      {isVendorUploaded(rightPanelVendor, 'sales_b2b') && (
                        <Chip 
                          label="Uploaded" 
                          size="small" 
                          icon={<CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a !important' }} />}
                          sx={{ background: '#16a34a', color: '#ffffff', fontWeight: 600, fontSize: '10px', height: '20px' }} 
                        />
                      )}
                    </Box>
                    {isVendorUploaded(rightPanelVendor, 'sales_b2b') && getUploadedDocument(rightPanelVendor, 'sales_b2b') && (
                      <Typography variant="caption" color="#16a34a" sx={{ display: 'block', mb: 1 }}>
                        {getUploadedDocument(rightPanelVendor, 'sales_b2b')?.filename} • {new Date(getUploadedDocument(rightPanelVendor, 'sales_b2b')!.upload_date).toLocaleDateString()}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        accept={getAcceptForVendor('amazon')}
                        style={{ display: 'none' }}
                        id={`drawer-${rightPanelVendor}-sales-b2b`}
                        type="file"
                        onChange={(e) => {
                          const vendorKey = rightPanelVendor === 'amazon' ? 'amazon' : null;
                          const file = e.target.files?.[0] || null;
                          if (vendorKey && file) {
                            if (!validateFileType(file, vendorKey, 'Amazon B2B sales')) {
                              e.target.value = '';
                              return;
                            }
                            setMarketplaceFile(vendorKey, 'sales_b2b', file);
                          } else if (vendorKey) {
                            setMarketplaceFile(vendorKey, 'sales_b2b', null);
                          }
                          e.target.value = '';
                        }}
                        disabled={!!uploadingVendor}
                      />
                      <label htmlFor={`drawer-${rightPanelVendor}-sales-b2b`}>
                        <Button 
                          variant="outlined" 
                          component="span" 
                          startIcon={<CloudUploadIcon />}
                          disabled={!!uploadingVendor}
                        >
                          Choose file
                        </Button>
                      </label>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          flex: 1, 
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {marketplaceFiles[rightPanelVendor]?.sales_b2b?.name || 'No file selected'}
                      </Typography>
                      <Button
                        variant={isVendorUploaded(rightPanelVendor, 'sales_b2b') ? 'outlined' : 'contained'}
                        size="small"
                        disabled={
                          !marketplaceFiles[rightPanelVendor]?.sales_b2b ||
                          !!uploadingVendor ||
                          uploadingVendor === `${rightPanelVendor}_sales_b2b`
                        }
                        onClick={() => handleMarketplaceUploadClick(rightPanelVendor, 'sales_b2b')}
                        startIcon={uploadingVendor === `${rightPanelVendor}_sales_b2b` ? <CircularProgress size={16} sx={{ color: isVendorUploaded(rightPanelVendor, 'sales_b2b') ? '#111111' : '#fff' }} /> : <ArrowForwardIcon />}
                        sx={{ 
                          background: isVendorUploaded(rightPanelVendor, 'sales_b2b') ? '#ffffff' : '#111111', 
                          color: isVendorUploaded(rightPanelVendor, 'sales_b2b') ? '#111111' : '#ffffff',
                          borderColor: isVendorUploaded(rightPanelVendor, 'sales_b2b') ? '#e5e7eb' : 'transparent',
                          flexShrink: 0,
                          '&:hover': { 
                            background: isVendorUploaded(rightPanelVendor, 'sales_b2b') ? '#f8fafc' : '#333333',
                            borderColor: isVendorUploaded(rightPanelVendor, 'sales_b2b') ? '#d1d5db' : 'transparent'
                          }, 
                          fontWeight: 600 
                        }}
                      >
                        {uploadingVendor === `${rightPanelVendor}_sales_b2b` ? 'Uploading...' : isVendorUploaded(rightPanelVendor, 'sales_b2b') ? 'Re-upload' : 'Upload'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Settlement report */}
                <Box sx={{ p: 1.5, borderRadius: '8px', background: isVendorUploaded(rightPanelVendor, 'settlement') ? '#f0fdf4' : 'transparent', border: isVendorUploaded(rightPanelVendor, 'settlement') ? '1px solid #dcfce7' : 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2">
                      {`Settlement report (${getFormatLabelForVendor(rightPanelVendor)})`}
                    </Typography>
                    {isVendorUploaded(rightPanelVendor, 'settlement') && (
                      <Chip 
                        label="Uploaded" 
                        size="small" 
                        icon={<CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a !important' }} />}
                        sx={{ background: '#16a34a', color: '#ffffff', fontWeight: 600, fontSize: '10px', height: '20px' }} 
                      />
                    )}
                  </Box>
                  {isVendorUploaded(rightPanelVendor, 'settlement') && getUploadedDocument(rightPanelVendor, 'settlement') && (
                    <Typography variant="caption" color="#16a34a" sx={{ display: 'block', mb: 1 }}>
                      {getUploadedDocument(rightPanelVendor, 'settlement')?.filename} • {new Date(getUploadedDocument(rightPanelVendor, 'settlement')!.upload_date).toLocaleDateString()}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      accept={getAcceptForVendor(rightPanelVendor)}
                      style={{ display: 'none' }}
                      id={`drawer-${rightPanelVendor}-settlement`}
                      type="file"
                      onChange={(e) => {
                        const vendorKey = rightPanelVendor;
                        const file = e.target.files?.[0] || null;
                        if (vendorKey && file) {
                          const vendorLabel = vendorKey === 'flipkart' ? 'Flipkart' : 'Amazon';
                          if (!validateFileType(file, vendorKey, `${vendorLabel} settlement`)) {
                            e.target.value = '';
                            return;
                          }
                          setMarketplaceFile(vendorKey, 'settlement', file);
                        } else if (vendorKey) {
                          setMarketplaceFile(vendorKey, 'settlement', null);
                        }
                        e.target.value = '';
                      }}
                      disabled={!!uploadingVendor}
                    />
                    <label htmlFor={`drawer-${rightPanelVendor}-settlement`}>
                      <Button 
                        variant="outlined" 
                        component="span" 
                        startIcon={<CloudUploadIcon />}
                        disabled={!!uploadingVendor}
                      >
                        Choose file
                      </Button>
                    </label>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        flex: 1, 
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {marketplaceFiles[rightPanelVendor]?.settlement?.name || 'No file selected'}
                    </Typography>
                    <Button
                      variant={isVendorUploaded(rightPanelVendor, 'settlement') ? 'outlined' : 'contained'}
                      size="small"
                      disabled={
                        !marketplaceFiles[rightPanelVendor]?.settlement ||
                        !!uploadingVendor ||
                        uploadingVendor === `${rightPanelVendor}_settlement`
                      }
                      onClick={() => handleMarketplaceUploadClick(rightPanelVendor, 'settlement')}
                      startIcon={uploadingVendor === `${rightPanelVendor}_settlement` ? <CircularProgress size={16} sx={{ color: isVendorUploaded(rightPanelVendor, 'settlement') ? '#111111' : '#fff' }} /> : <ArrowForwardIcon />}
                      sx={{ 
                        background: isVendorUploaded(rightPanelVendor, 'settlement') ? '#ffffff' : '#111111', 
                        color: isVendorUploaded(rightPanelVendor, 'settlement') ? '#111111' : '#ffffff',
                        borderColor: isVendorUploaded(rightPanelVendor, 'settlement') ? '#e5e7eb' : 'transparent',
                        flexShrink: 0,
                        '&:hover': { 
                          background: isVendorUploaded(rightPanelVendor, 'settlement') ? '#f8fafc' : '#333333',
                          borderColor: isVendorUploaded(rightPanelVendor, 'settlement') ? '#d1d5db' : 'transparent'
                        }, 
                        fontWeight: 600 
                      }}
                    >
                      {uploadingVendor === `${rightPanelVendor}_settlement` ? 'Uploading...' : isVendorUploaded(rightPanelVendor, 'settlement') ? 'Re-upload' : 'Upload'}
                    </Button>
                  </Box>
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

      {/* Confirmation Dialog for Re-upload */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelReupload}
        aria-labelledby="confirm-reupload-dialog-title"
        aria-describedby="confirm-reupload-dialog-description"
      >
        <DialogTitle id="confirm-reupload-dialog-title">
          Confirm Re-upload
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-reupload-dialog-description">
            {pendingUpload && getUploadedDocument(pendingUpload.vendorId, pendingUpload.kind) ? (
              <>
                The previous file <strong>{getUploadedDocument(pendingUpload.vendorId, pendingUpload.kind)?.filename}</strong> will be deleted and all its related data will be permanently removed.
                <br /><br />
                Do you want to continue?
              </>
            ) : (
              'The previous file will be deleted and all its related data will be permanently removed. Do you want to continue?'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReupload} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmReupload} variant="contained" color="error" autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadDocuments;

