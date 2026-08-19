import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { api } from '../services/api';

interface FlipkartSyncModalProps {
  open: boolean;
  onClose: () => void;
}

const FlipkartSyncModal: React.FC<FlipkartSyncModalProps> = ({ open, onClose }) => {
  const [status, setStatus] = useState<string>('none');
  const [logs, setLogs] = useState<string[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    try {
      const response = await api.flipkartListings.getSyncJobStatus();
      if (response.statusCode === 200 && response.data) {
        setStatus(response.data.status);
        setLogs(response.data.logs || []);
        setProcessedCount(response.data.processed_count || 0);
        setTotalCount(response.data.total_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (open) {
      fetchStatus();
      interval = setInterval(fetchStatus, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [open]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleStart = async () => {
    try {
      await api.flipkartListings.startSyncJob();
      fetchStatus();
    } catch (err) {
      console.error('Failed to start sync', err);
    }
  };

  const handleStop = async () => {
    try {
      await api.flipkartListings.stopSyncJob();
      fetchStatus();
    } catch (err) {
      console.error('Failed to stop sync', err);
    }
  };

  const isRunning = status === 'running';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">Sync Flipkart Listings</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This will fetch all unique SKUs from your Flipkart sales and pull their latest listing details (pricing, taxes, etc.) from Flipkart.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleStart}
            disabled={isRunning}
            sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Hit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleStop}
            disabled={!isRunning}
            sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Stop
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Progress: {processedCount} / {totalCount}
          </Typography>
          {isRunning && <CircularProgress size={16} />}
        </Box>

        <Box sx={{ 
          bgcolor: '#1e1e1e', 
          color: '#4af626', 
          p: 2, 
          borderRadius: 2, 
          height: 250, 
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
        }}>
          {logs.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.5, fontFamily: 'inherit' }}>Ready to start sync...</Typography>
          ) : (
            logs.map((log, index) => (
              <Box key={index} sx={{ mb: 0.5 }}>{log}</Box>
            ))
          )}
          <div ref={logsEndRef} />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlipkartSyncModal;
