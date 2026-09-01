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
  const [showErpDialog, setShowErpDialog] = useState(false);
  const [reportsAnchorEl, setReportsAnchorEl] = useState<null | HTMLElement>(null);

  const mockSalesEntries = Array.from({ length: 15 }, (_, i) => ({
    id: `S${i + 1}`,
    docType: 'Invoice',
    docNo: `OD${123456789 + i}`,
    custNo: 'CUST-FLIPKART',
    postingDate: `2025-01-${String(21 - Math.floor(i / 3)).padStart(2, '0')}`,
    itemNo: `SKU-ABC-${String(i % 5 + 1).padStart(2, '0')}`,
    qty: (i + 1) * 1000 + 500 * (i % 3),
    unitPrice: 1250.00 + i * 50,
    location: i % 2 === 0 ? 'BLR-WH1' : 'DEL-WH2',
    taxGroup: i % 3 === 0 ? 'GST-18' : 'GST-12'
  }));

  const mockReturnEntries = Array.from({ length: 10 }, (_, i) => ({
    id: `R${i + 1}`,
    docType: 'Credit Memo',
    docNo: `RET${987654321 + i}`,
    custNo: 'CUST-FLIPKART',
    postingDate: `2025-01-${String(23 - Math.floor(i / 2)).padStart(2, '0')}`,
    itemNo: `SKU-DEF-${String(i % 5 + 1).padStart(2, '0')}`,
    qty: -((i + 1) * 1000 + 500 * (i % 2)),
    unitPrice: 1500.00 + i * 75,
    location: i % 2 === 0 ? 'BOM-WH3' : 'BLR-WH1',
    taxGroup: i % 2 === 0 ? 'GST-18' : 'GST-12'
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount); // Removed absolute value to show negatives for returns
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 2000);
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
          <Button variant="outlined" size="small" onClick={() => setShowErpDialog(true)}
            sx={{ 
              borderRadius: '4px', 
              borderColor: '#111827', 
              color: '#111827', 
              textTransform: 'none', fontWeight: 700, py: 0.5, px: 2,
              '&:hover': { borderColor: '#000000', backgroundColor: '#f9fafb' }
            }}>
            Sync
          </Button>
        </Box>
      </Box>

      <AnimatePresence>
        {syncStatus === 'success' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Alert severity="success" sx={{ mb: 2, py: 0, borderRadius: '4px', border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', color: '#166534', fontWeight: 600, fontSize: '12px' }} onClose={() => setSyncStatus('idle')}>
              Dynamics ERP template generated successfully.

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
          <Tab label="Sales Entries" />
          <Tab label="Return Entries" />
          <Tab label="Chart of Accounts" />
          <Tab label="Audit Logs" />

        </Tabs>
      </Box>

      {/* Content Area - Minimal Spacing */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer sx={{ mb: 4 }}>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', py: 1.5, px: 0, width: '120px' }}>Document Type</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>Document No.</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>Customer No.</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '100px' }}>Posting Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>Item No.</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '80px', textAlign: 'right' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '120px', textAlign: 'right' }}>Unit Price</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '120px' }}>Location Code</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '120px' }}>Tax Group</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockSalesEntries.map((entry) => (
                <TableRow key={entry.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell sx={{ px: 0, py: 1 }}><Typography variant="body2" sx={{ fontWeight: 600, color: '#111', fontSize: '13px' }}>{entry.docType}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#111', fontSize: '13px' }}>{entry.docNo}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#111', fontSize: '13px' }}>{entry.custNo}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px' }}>{entry.postingDate}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{entry.itemNo}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ color: '#111', fontWeight: 700, fontSize: '13px' }}>{entry.qty}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{formatCurrency(entry.unitPrice)}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#111', fontSize: '13px' }}>{entry.location}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px' }}>{entry.taxGroup}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer sx={{ mb: 4 }}>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', py: 1.5, px: 0, width: '120px' }}>Document Type</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>Document No.</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>Customer No.</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '100px' }}>Posting Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>Item No.</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '80px', textAlign: 'right' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '120px', textAlign: 'right' }}>Unit Price</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '120px' }}>Location Code</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '120px' }}>Tax Group</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockReturnEntries.map((entry) => (
                <TableRow key={entry.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell sx={{ px: 0, py: 1 }}><Typography variant="body2" sx={{ fontWeight: 600, color: '#111', fontSize: '13px' }}>{entry.docType}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#111', fontSize: '13px' }}>{entry.docNo}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#111', fontSize: '13px' }}>{entry.custNo}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px' }}>{entry.postingDate}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{entry.itemNo}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 700, fontSize: '13px' }}>{entry.qty}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{formatCurrency(entry.unitPrice)}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#111', fontSize: '13px' }}>{entry.location}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px' }}>{entry.taxGroup}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
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

      <Dialog open={showErpDialog} onClose={() => setShowErpDialog(false)} PaperProps={{ sx: { borderRadius: '4px', p: 0, minWidth: 320 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '16px', pb: 1, borderBottom: '1px solid #f1f5f9' }}>Connect ERP</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ p: 0 }}>
            {['Zoho Books', 'SAP ERP', 'Tally Prime', 'Microsoft Dynamics 365'].map((erp, idx) => (
              <ListItem key={erp} sx={{ py: 2, px: 3, borderBottom: idx < 3 ? '1px solid #f1f5f9' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>{erp}</Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setShowErpDialog(false)} 
                  sx={{ 
                    borderColor: '#e5e7eb', 
                    color: '#111827', 
                    borderRadius: '4px', 
                    px: 2, 
                    fontWeight: 600, 
                    textTransform: 'none',
                    '&:hover': { borderColor: '#d1d5db', backgroundColor: '#f9fafb' }
                  }}
                >
                  Connect
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Bookkeeping;