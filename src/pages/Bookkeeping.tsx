import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Menu,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api/apiService';
import { TotalTransactionsResponse, TransactionRow } from '../services/api/types';
import { API_CONFIG } from '../services/api/config';

interface ZohoSalesEntry {
  id: string;
  customerName: string;
  invoiceDate: string;
  invoiceNo: string;
  sku: string;
  qty: number;
  itemRate: number;
  discount: number;
  taxAmount: number;
  invoiceTotal: number;
}

interface ZohoReturnEntry {
  id: string;
  customerName: string;
  creditNoteDate: string;
  creditNoteNo: string;
  originalInvoiceNo: string;
  sku: string;
  qty: number;
  itemRate: number;
  taxAmount: number;
  creditTotal: number;
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

  const [salesEntries, setSalesEntries] = useState<ZohoSalesEntry[]>([]);
  const [returnEntries, setReturnEntries] = useState<ZohoReturnEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [myntraResponse, amazonResponse] = await Promise.all([
          apiService.get<TotalTransactionsResponse>(API_CONFIG.ENDPOINTS.TOTAL_TRANSACTIONS, {
            platform: 'myntra',
            limit: 100
          }).catch(() => null),
          apiService.get<TotalTransactionsResponse>(API_CONFIG.ENDPOINTS.TOTAL_TRANSACTIONS, {
            platform: 'amazon',
            limit: 100
          }).catch(() => null)
        ]);

        const myntraData = (myntraResponse && myntraResponse.data && Array.isArray(myntraResponse.data.data)) 
          ? myntraResponse.data.data.map((r: any) => ({ ...r, _sourcePlatform: 'myntra' })) : [];
        const amazonData = (amazonResponse && amazonResponse.data && Array.isArray(amazonResponse.data.data)) 
          ? amazonResponse.data.data.map((r: any) => ({ ...r, _sourcePlatform: 'amazon' })) : [];

        const combinedData = [...myntraData, ...amazonData];

        if (combinedData.length > 0) {
          const sales: ZohoSalesEntry[] = [];
          const returns: ZohoReturnEntry[] = [];

          combinedData.forEach((row: any) => {
            const taxes = row.metadata?.settlement_value?.taxes_tds_tcs || row.metadata?.breakups?.taxes || 0;
            const mrp = row.metadata?.order_value?.mrp || row.order_value || 0;
            const discount = row.metadata?.order_value?.seller_discount || 0;
            
            if (row.event_type === 'rto' || row.event_type === 'cancelled' || row.order_value < 0) {
              returns.push({
                id: row.order_id,
                customerName: row._sourcePlatform === 'amazon' ? 'Amazon B2C' : 'Myntra B2C',
                creditNoteDate: row.settlement_date || row.order_date || row.invoice_date || '-',
                creditNoteNo: `${row.order_id}-RET`,
                originalInvoiceNo: row.order_id,
                sku: row.metadata?.sku || 'Sales - Apparels',
                qty: 1,
                itemRate: Math.abs(mrp),
                taxAmount: Math.abs(taxes),
                creditTotal: Math.abs(row.order_value || 0),
              });
            } else {
              sales.push({
                id: row.order_id,
                customerName: row._sourcePlatform === 'amazon' ? 'Amazon B2C' : 'Myntra B2C',
                invoiceDate: row.order_date || row.invoice_date || '-',
                invoiceNo: row.order_id,
                sku: row.metadata?.sku || 'Sales - Apparels',
                qty: 1,
                itemRate: Math.abs(mrp),
                discount: discount,
                taxAmount: Math.abs(taxes),
                invoiceTotal: Math.abs(row.order_value || 0),
              });
            }
          });

          setSalesEntries(sales);
          setReturnEntries(returns);
        }
      } catch (err) {
        console.error('Error fetching bookkeeping data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount);
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
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={24} sx={{ color: '#111' }} />
        </Box>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <TableContainer sx={{ mb: 4 }}>
              <Table size="small" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', py: 1.5, px: 0, width: '130px' }}>Customer Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '100px' }}>Invoice Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>Invoice No.</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>SKU / Item</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '60px', textAlign: 'right' }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '100px', textAlign: 'right' }}>Item Rate</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '100px', textAlign: 'right' }}>Discount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '100px', textAlign: 'right' }}>Tax Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '120px', textAlign: 'right' }}>Invoice Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesEntries.map((entry) => (
                    <TableRow key={entry.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ px: 0, py: 1 }}><Typography variant="body2" sx={{ fontWeight: 600, color: '#111', fontSize: '13px' }}>{entry.customerName}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px' }}>{entry.invoiceDate.split('T')[0]}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ color: '#111', fontSize: '13px' }}>{entry.invoiceNo}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{entry.sku}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color: '#111', fontWeight: 700, fontSize: '13px' }}>{entry.qty}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{formatCurrency(entry.itemRate)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600, fontSize: '13px' }}>{formatCurrency(entry.discount)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{formatCurrency(entry.taxAmount)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color: '#111', fontWeight: 700, fontSize: '13px' }}>{formatCurrency(entry.invoiceTotal)}</Typography></TableCell>
                    </TableRow>
                  ))}
                  {salesEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ py: 4, textAlign: 'center', color: '#94a3b8' }}>
                        No sales transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer sx={{ mb: 4 }}>
              <Table size="small" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', py: 1.5, px: 0, width: '130px' }}>Customer Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '100px' }}>C.N. Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>Credit Note No.</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>Orig. Invoice No.</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '150px' }}>SKU / Item</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '60px', textAlign: 'right' }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '100px', textAlign: 'right' }}>Item Rate</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '100px', textAlign: 'right' }}>Tax Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', width: '120px', textAlign: 'right' }}>Credit Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returnEntries.map((entry) => (
                    <TableRow key={entry.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ px: 0, py: 1 }}><Typography variant="body2" sx={{ fontWeight: 600, color: '#111', fontSize: '13px' }}>{entry.customerName}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px' }}>{entry.creditNoteDate.split('T')[0]}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ color: '#111', fontSize: '13px' }}>{entry.creditNoteNo}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px' }}>{entry.originalInvoiceNo}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{entry.sku}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 700, fontSize: '13px' }}>-{entry.qty}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{formatCurrency(entry.itemRate)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color: '#111', fontWeight: 600, fontSize: '13px' }}>{formatCurrency(entry.taxAmount)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color: '#111', fontWeight: 700, fontSize: '13px' }}>{formatCurrency(entry.creditTotal)}</Typography></TableCell>
                    </TableRow>
                  ))}
                  {returnEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ py: 4, textAlign: 'center', color: '#94a3b8' }}>
                        No return transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </>
      )}

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
