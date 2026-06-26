import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  ContentCopy as ContentCopyIcon,
  AutoAwesome as AutoAwesomeIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import UploadSettlementModal from '../components/UploadSettlementModal';

const Upload: React.FC = () => {
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleSyncClick = () => {
    setUploadOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100%', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ pt: 2 }}>
        {/* Top Header with Sync */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<SyncIcon sx={{ animation: uploadOpen ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />}
            onClick={handleSyncClick}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: '#e5e7eb', color: '#374151', '&:hover': { background: '#f9fafb' } }}
          >
            Sync
          </Button>
        </Box>

        {/* Top Cards Row */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, borderRadius: '24px', border: '2px dashed #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', boxShadow: 'none', bgcolor: '#fafafa', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#d1d5db', bgcolor: '#f9fafb' } }} onClick={handleSyncClick}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#f3f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <CloudUploadIcon sx={{ color: '#7c3aed' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>Drag & Drop files or folders</Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>Supports PDF, Excel, CSV, XML, and ERP exports</Typography>
              <Button variant="contained" onClick={(e) => { e.stopPropagation(); handleSyncClick(); }} sx={{ bgcolor: '#111827', color: 'white', borderRadius: '20px', px: 4, py: 1, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#000000' } }}>Browse Files</Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #e5e7eb', height: '100%', boxShadow: 'none' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>Email Forwarding</Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 3, lineHeight: 1.6 }}>Forward vendor emails, platform reports, or internal invoices directly to your AI inbox.</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f3f4f6', borderRadius: '12px', p: 1.5, px: 2 }}>
                <Typography variant="body2" sx={{ flexGrow: 1, fontFamily: 'monospace', color: '#374151', fontWeight: 500 }}>inbox-kp-kapiva@nexbit.ai</Typography>
                <IconButton size="small" sx={{ color: '#6b7280' }} onClick={() => navigator.clipboard.writeText('inbox-kp-kapiva@nexbit.ai')}><ContentCopyIcon fontSize="small" /></IconButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Today's Processing */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>Today's Processing</Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: 'none', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>Auto-Detected Documents</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={4} sm={2}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', display: 'inline', mr: 1 }}>8</Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', display: 'inline' }}>Purchase Orders</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', display: 'inline', mr: 1 }}>14</Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', display: 'inline' }}>GRNs</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', display: 'inline', mr: 1 }}>22</Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', display: 'inline' }}>Invoices</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', display: 'inline', mr: 1 }}>6</Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', display: 'inline' }}>Settlements</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', display: 'inline', mr: 1 }}>1</Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', display: 'inline' }}>Bank Statements</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', display: 'inline', mr: 1 }}>4</Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', display: 'inline' }}>Debit/Credit Notes</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Recently Received */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>Recently Received</Typography>
        <Paper sx={{ p: 2, borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: 'none', display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
            <InsertDriveFileIcon sx={{ color: '#9ca3af' }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>PO_Zepto_48291.pdf</Typography>
              <Chip label="Purchase Order" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#eff6ff', color: '#3b82f6' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>Auto-fetch</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>•</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>10 mins ago</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>•</Typography>
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>99% Confidence</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>₹1.4 L</Typography>
            <Chip label="Processed" size="small" sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#ecfdf5', color: '#10b981', borderRadius: '12px' }} />
          </Box>
        </Paper>
      </Box>

      <UploadSettlementModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Box>
  );
};

export default Upload;
