import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Settlement {
  id: string;
  period: string;
  provider: 'Shopify' | 'Amazon' | 'Flipkart' | 'Myntra' | 'Website' | 'Other';
  grossAmount: number;
  deductions: number; 
  taxWithheld: number;
  netSettlement: number;
  status: 'synced' | 'pending' | 'error';
  zohoId: string | null;
  paymentDate: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <Box sx={{ py: 1 }}>{children}</Box>
        </motion.div>
      )}
    </div>
  );
}

const Bookkeeping: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [reportsAnchorEl, setReportsAnchorEl] = useState<null | HTMLElement>(null);

  const mockSettlements: Settlement[] = [
    { id: 'SET-FK-25-01', period: 'Jan 15 - Jan 21, 2025', provider: 'Flipkart', grossAmount: 845000, deductions: 126750, taxWithheld: 16900, netSettlement: 701350, status: 'synced', zohoId: 'ZOHO-1022', paymentDate: '2025-01-22' },
    { id: 'SET-AMZ-25-01', period: 'Jan 14 - Jan 20, 2025', provider: 'Amazon', grossAmount: 1240000, deductions: 248000, taxWithheld: 24800, netSettlement: 967200, status: 'synced', zohoId: 'ZOHO-1023', paymentDate: '2025-01-21' },
    { id: 'SET-SH-25-01', period: 'Jan 10 - Jan 17, 2025', provider: 'Shopify', grossAmount: 450000, deductions: 13500, taxWithheld: 9000, netSettlement: 427500, status: 'pending', zohoId: null, paymentDate: '2025-01-18' },
    { id: 'SET-FK-25-02', period: 'Jan 08 - Jan 14, 2025', provider: 'Flipkart', grossAmount: 670000, deductions: 100500, taxWithheld: 13400, netSettlement: 556100, status: 'synced', zohoId: 'ZOHO-1018', paymentDate: '2025-01-15' },
    { id: 'SET-AMZ-25-02', period: 'Jan 07 - Jan 13, 2025', provider: 'Amazon', grossAmount: 1100000, deductions: 220000, taxWithheld: 22000, netSettlement: 858000, status: 'synced', zohoId: 'ZOHO-1017', paymentDate: '2025-01-14' },
    { id: 'SET-MYN-25-01', period: 'Jan 01 - Jan 10, 2025', provider: 'Myntra', grossAmount: 520000, deductions: 78000, taxWithheld: 10400, netSettlement: 431600, status: 'error', zohoId: null, paymentDate: '2025-01-12' },
    { id: 'SET-SH-25-02', period: 'Jan 01 - Jan 09, 2025', provider: 'Shopify', grossAmount: 380000, deductions: 11400, taxWithheld: 7600, netSettlement: 361000, status: 'synced', zohoId: 'ZOHO-1011', paymentDate: '2025-01-10' },
    { id: 'SET-FK-25-03', period: 'Jan 01 - Jan 07, 2025', provider: 'Flipkart', grossAmount: 920000, deductions: 138000, taxWithheld: 18400, netSettlement: 763600, status: 'synced', zohoId: 'ZOHO-1008', paymentDate: '2025-01-08' },
    { id: 'SET-AMZ-25-03', period: 'Dec 24 - Dec 31, 2024', provider: 'Amazon', grossAmount: 1450000, deductions: 290000, taxWithheld: 29000, netSettlement: 1131000, status: 'synced', zohoId: 'ZOHO-0988', paymentDate: '2025-01-01' },
    { id: 'SET-MYN-25-02', period: 'Dec 20 - Dec 31, 2024', provider: 'Myntra', grossAmount: 410000, deductions: 61500, taxWithheld: 8200, netSettlement: 340300, status: 'synced', zohoId: 'ZOHO-0985', paymentDate: '2025-01-01' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 2000);
  };

  const getStatusChip = (status: string) => {
    const colors = { synced: '#14B8A6', pending: '#F59E0B', error: '#EF4444' };
    const color = colors[status as keyof typeof colors] || '#64748b';
    return (
      <Chip
        label={status.toUpperCase()}
        size="small"
        sx={{
          bgcolor: 'transparent',
          color: color,
          fontWeight: 800,
          fontSize: '10px',
          border: `1px solid ${color}`,
          borderRadius: '2px',
          height: '18px'
        }}
      />
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#fff', pt: 1, px: { xs: 2, md: 4 } }}>
      {/* Header - Tightened */}
      <Box sx={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        mb: 2, position: 'sticky', top: 0, zIndex: 10, background: '#fff', py: 1,
        borderBottom: '1px solid #f1f5f9'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>
          Accounting
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setShowUploadDialog(true)}
            sx={{ borderRadius: '4px', borderColor: '#e2e8f0', color: '#475569', textTransform: 'none', fontWeight: 600, py: 0.5 }}>
            Upload Bulk
          </Button>
          <Button variant="outlined" size="small" onClick={(e) => setReportsAnchorEl(e.currentTarget)}
            sx={{ borderRadius: '4px', borderColor: '#e2e8f0', color: '#475569', textTransform: 'none', fontWeight: 600, py: 0.5 }}>
            Reports
          </Button>
          <Button variant="outlined" size="small" onClick={() => setShowAddDialog(true)}
            sx={{ borderRadius: '4px', borderColor: '#e2e8f0', color: '#475569', textTransform: 'none', fontWeight: 600, py: 0.5 }}>
            New Entry
          </Button>
          <Button variant="outlined" size="small" onClick={handleSync} disabled={syncStatus === 'syncing'}
            sx={{ 
              borderRadius: '4px', 
              borderColor: syncStatus === 'syncing' ? '#e2e8f0' : '#22c55e', 
              color: syncStatus === 'syncing' ? '#94a3b8' : '#22c55e', 
              textTransform: 'none', fontWeight: 700, py: 0.5, px: 2,
              '&:hover': { borderColor: '#16a34a', color: '#16a34a', bgcolor: 'transparent' }
            }}>
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync to Zoho'}
          </Button>
        </Box>
      </Box>

      <AnimatePresence>
        {syncStatus === 'success' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Alert severity="success" sx={{ mb: 2, py: 0, borderRadius: '4px', border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', color: '#166534', fontWeight: 600, fontSize: '12px' }} onClose={() => setSyncStatus('idle')}>
              Settlements pushed to Zoho Books.
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Section - Dense */}
      <Box sx={{ mb: 1 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            minHeight: 0,
            '& .MuiTab-root': {
              textTransform: 'none', fontWeight: 700, fontSize: '12px', minHeight: 32, color: '#94a3b8', mr: 3, px: 0, minWidth: 0,
              '&.Mui-selected': { color: '#111' }
            },
            '& .MuiTabs-indicator': { height: 2, bgcolor: '#111' }
          }}>
          <Tab label="Settlement Batches" />
          <Tab label="Chart of Accounts" />
          <Tab label="Audit Logs" />
        </Tabs>
      </Box>

      {/* Content Area - Minimal Spacing */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', py: 1.5, px: 0 }}>Period</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Provider</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Gross</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Fees</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Tax</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Net Payout</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="right" sx={{ px: 0 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockSettlements.map((settlement) => (
                <TableRow key={settlement.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell sx={{ px: 0, py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111', fontSize: '13px' }}>{settlement.period}</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '10px' }}>ID: {settlement.id}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{settlement.provider}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: '#111', fontSize: '13px' }}>{formatCurrency(settlement.grossAmount)}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>-{formatCurrency(settlement.deductions)}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#64748b', fontSize: '12px', fontWeight: 500 }}>-{formatCurrency(settlement.taxWithheld)}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 800, color: '#111', fontSize: '13px' }}>{formatCurrency(settlement.netSettlement)}</Typography></TableCell>
                  <TableCell>{getStatusChip(settlement.status)}</TableCell>
                  <TableCell align="right" sx={{ px: 0 }}>
                    <IconButton size="small"><MoreIcon sx={{ fontSize: 16, color: '#cbd5e1' }} /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={4} sx={{ pt: 1 }}>
          {[
            { title: 'Income', items: ['Marketplace Sales', 'Shipping Revenue'] },
            { title: 'Expenses', items: ['Sales Commissions', 'Logistics Costs', 'Advertising'] },
            { title: 'Taxation', items: ['TCS Receivable', 'TDS Withheld'] },
          ].map((cat, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.title}</Typography>
              <List dense sx={{ p: 0 }}>
                {cat.items.map((item, j) => (
                  <ListItem key={j} sx={{ px: 0, py: 1, borderBottom: '1px solid #f1f5f9' }}>
                    <ListItemText primary={item} primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: '13px', color: '#111' } }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', fontSize: '10px' }}>LINKED</Typography>
                  </ListItem>
                ))}
              </List>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Menus and Dialogs - Tightened */}
      <Menu anchorEl={reportsAnchorEl} open={Boolean(reportsAnchorEl)} onClose={() => setReportsAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: '4px', mt: 0.5, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' } }}>
        {['Profit & Loss', 'Reconciliation', 'Tax Liability'].map(item => (
          <MenuItem key={item} onClick={() => setReportsAnchorEl(null)} sx={{ fontSize: '12px', py: 1, px: 2, fontWeight: 600 }}>{item}</MenuItem>
        ))}
      </Menu>

      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} PaperProps={{ sx: { borderRadius: '4px', p: 0, maxWidth: 360 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '16px', pb: 1 }}>Upload Transactions</DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Box sx={{ border: '2px dashed #e2e8f0', borderRadius: '4px', p: 3, textAlign: 'center', cursor: 'pointer' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Click or drag CSV/Excel files</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowUploadDialog(false)} size="small" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
          <Button variant="outlined" size="small" onClick={() => setShowUploadDialog(false)} sx={{ borderColor: '#111', color: '#111', borderRadius: '4px', px: 2, fontWeight: 700, textTransform: 'none' }}>Upload</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} PaperProps={{ sx: { borderRadius: '4px', p: 0, maxWidth: 440 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '16px', pb: 1 }}>New Settlement Entry</DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}><TextField fullWidth label="Period" size="small" /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small"><InputLabel>Provider</InputLabel>
                <Select label="Provider"><MenuItem value="Shopify">Shopify</MenuItem><MenuItem value="Amazon">Amazon</MenuItem><MenuItem value="Flipkart">Flipkart</MenuItem></Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Gross" type="number" size="small" /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Deductions" type="number" size="small" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowAddDialog(false)} size="small" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
          <Button variant="outlined" size="small" onClick={() => setShowAddDialog(false)} sx={{ borderColor: '#111', color: '#111', borderRadius: '4px', px: 2, fontWeight: 700, textTransform: 'none' }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookkeeping;