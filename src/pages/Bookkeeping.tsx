import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountBalanceOutlined as AccountBalanceIcon,
  Sync as SyncIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  ReceiptOutlined as ReceiptIcon,
  AccountTreeOutlined as AccountTreeIcon,
  ApiOutlined as ApiIcon,
  TrendingUpOutlined as TrendingUpIcon,
  TrendingDownOutlined as TrendingDownIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Bookkeeping: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30);

  const mockTransactions = [
    {
      id: 'TXN001',
      date: '2025-01-15',
      description: 'Flipkart Sales Revenue',
      amount: 125000,
      category: 'Sales',
      status: 'synced',
      zohoId: 'ZOHO001'
    },
    {
      id: 'TXN002',
      date: '2025-01-15',
      description: 'Platform Commission',
      amount: -12500,
      category: 'Commissions',
      status: 'synced',
      zohoId: 'ZOHO002'
    },
    {
      id: 'TXN003',
      date: '2025-01-15',
      description: 'TDS Deduction',
      amount: -3750,
      category: 'Taxes',
      status: 'pending',
      zohoId: null
    },
    {
      id: 'TXN004',
      date: '2025-01-14',
      description: 'Amazon Sales Revenue',
      amount: 89000,
      category: 'Sales',
      status: 'synced',
      zohoId: 'ZOHO003'
    },
    {
      id: 'TXN005',
      date: '2025-01-14',
      description: 'Shipping Charges',
      amount: -4500,
      category: 'Expenses',
      status: 'synced',
      zohoId: 'ZOHO004'
    },
    {
      id: 'TXN006',
      date: '2025-01-13',
      description: 'Myntra Sales Revenue',
      amount: 67000,
      category: 'Sales',
      status: 'synced',
      zohoId: 'ZOHO005'
    },
    {
      id: 'TXN007',
      date: '2025-01-13',
      description: 'Payment Gateway Fees',
      amount: -3350,
      category: 'Fees',
      status: 'error',
      zohoId: null
    },
    {
      id: 'TXN008',
      date: '2025-01-12',
      description: 'Snapdeal Sales Revenue',
      amount: 45000,
      category: 'Sales',
      status: 'synced',
      zohoId: 'ZOHO006'
    },
    {
      id: 'TXN009',
      date: '2025-01-12',
      description: 'Warehouse Storage Fees',
      amount: -8000,
      category: 'Expenses',
      status: 'pending',
      zohoId: null
    },
    {
      id: 'TXN010',
      date: '2025-01-11',
      description: 'Paytm Mall Sales Revenue',
      amount: 78000,
      category: 'Sales',
      status: 'synced',
      zohoId: 'ZOHO007'
    },
    {
      id: 'TXN011',
      date: '2025-01-11',
      description: 'Marketing Expenses',
      amount: -12000,
      category: 'Marketing',
      status: 'synced',
      zohoId: 'ZOHO008'
    },
    {
      id: 'TXN012',
      date: '2025-01-10',
      description: 'JioMart Sales Revenue',
      amount: 92000,
      category: 'Sales',
      status: 'synced',
      zohoId: 'ZOHO009'
    },
    {
      id: 'TXN013',
      date: '2025-01-10',
      description: 'Employee Salaries',
      amount: -25000,
      category: 'Payroll',
      status: 'pending',
      zohoId: null
    },
    {
      id: 'TXN014',
      date: '2025-01-09',
      description: 'Tata Cliq Sales Revenue',
      amount: 55000,
      category: 'Sales',
      status: 'synced',
      zohoId: 'ZOHO010'
    },
    {
      id: 'TXN015',
      date: '2025-01-09',
      description: 'Office Rent',
      amount: -15000,
      category: 'Rent',
      status: 'synced',
      zohoId: 'ZOHO011'
    }
  ];

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckIcon sx={{ color: '#14B8A6', fontSize: 20 }} />;
      case 'pending': return <PendingIcon sx={{ color: '#F59E0B', fontSize: 20 }} />;
      case 'error': return <ErrorIcon sx={{ color: '#EF4444', fontSize: 20 }} />;
      default: return <PendingIcon sx={{ color: '#6B7280', fontSize: 20 }} />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#fafafa' }}>
      <Box sx={{ p: { xs: 2, md: 6 } }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 4,
          background: 'white',
          borderRadius: '8px',
          p: 4,
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              background: '#1a1a1a',
              borderRadius: '6px',
              p: 2,
              mr: 3,
            }}>
              <AccountBalanceIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                color: '#1a1a1a',
                mb: 1,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}>
                Bookkeeping & ERP Integration
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#666666',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}>
                Seamlessly sync your financial data with Zoho Books
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {syncStatus === 'syncing' && <CircularProgress size={24} sx={{ color: '#1a1a1a' }} />}
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              component="a"
              href="/src/assets/sales-working-fk.csv"
              download
              sx={{
                borderRadius: '6px',
                borderColor: '#1a1a1a',
                color: '#1a1a1a',
                textTransform: 'none',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 500,
              }}
            >
              Download Excel Sheet
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setShowSettings(true)}
              sx={{
                borderRadius: '6px',
                borderColor: '#1a1a1a',
                color: '#1a1a1a',
                textTransform: 'none',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 500,
              }}
            >
              Settings
            </Button>

            <Button
              variant="contained"
              startIcon={<SyncIcon />}
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              sx={{
                borderRadius: '6px',
                background: '#1a1a1a',
                textTransform: 'none',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 500,
                '&:hover': { background: '#000000' },
                '&:disabled': { background: '#d0d0d0' },
              }}
            >
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync to Zoho'}
            </Button>
          </Box>
        </Box>

        {syncStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '6px' }}>
            Successfully synced 4 transactions to Zoho Books
          </Alert>
        )}

        {/* Main Content */}
        <Card sx={{ 
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}>
          <Box sx={{ borderBottom: 1, borderColor: '#e0e0e0' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontWeight: 500,
                },
                '& .Mui-selected': { color: '#1a1a1a' },
                '& .MuiTabs-indicator': { backgroundColor: '#1a1a1a' },
              }}
            >
              <Tab label="Transactions" icon={<ReceiptIcon />} iconPosition="start" />
              <Tab label="Chart of Accounts" icon={<AccountTreeIcon />} iconPosition="start" />
              <Tab label="Integration Status" icon={<ApiIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Transactions Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#1a1a1a',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              mb: 3,
            }}>
              Transaction Sync Status
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#14B8A6' }}>2</Typography>
                    <Typography variant="body2" sx={{ color: '#666666' }}>Synced</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>1</Typography>
                    <Typography variant="body2" sx={{ color: '#856404' }}>Pending</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: '#f8d7da', border: '1px solid #f5c6cb' }}>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>0</Typography>
                    <Typography variant="body2" sx={{ color: '#721c24' }}>Error</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: '#e3f2fd', border: '1px solid #bbdefb' }}>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>₹125,000</Typography>
                    <Typography variant="body2" sx={{ color: '#1565c0' }}>Total Value</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ background: 'white', borderRadius: '8px' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Transaction ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Zoho ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockTransactions.map((transaction) => (
                    <TableRow key={transaction.id} sx={{ '&:hover': { background: '#f8f9fa' } }}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600,
                        color: transaction.amount > 0 ? '#14B8A6' : '#EF4444',
                      }}>
                        {transaction.amount > 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.category}
                          size="small"
                          sx={{ background: '#f8f9fa', color: '#1a1a1a' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(transaction.status)}
                          <Typography variant="body2" sx={{ 
                            color: transaction.status === 'synced' ? '#14B8A6' : 
                                   transaction.status === 'pending' ? '#F59E0B' : '#EF4444',
                            fontWeight: 500,
                          }}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{transaction.zohoId || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Chart of Accounts Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#1a1a1a',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              mb: 3,
            }}>
              Chart of Accounts Mapping
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                      Income Accounts
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon><TrendingUpIcon sx={{ color: '#14B8A6' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Sales Revenue"
                          secondary="Mapped to: Sales Revenue (Zoho)"
                        />
                        <Chip label="Mapped" color="success" size="small" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                      Expense Accounts
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon><TrendingDownIcon sx={{ color: '#EF4444' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Platform Commission"
                          secondary="Mapped to: Commission Expense (Zoho)"
                        />
                        <Chip label="Mapped" color="success" size="small" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Integration Status Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#1a1a1a',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              mb: 3,
            }}>
              Zoho Books Integration Status
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: '#d4edda', border: '1px solid #c3e6cb' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckIcon sx={{ color: '#155724', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#155724' }}>
                        Connection Status
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#155724' }}>
                      Successfully connected to Zoho Books API
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ background: '#d4edda', border: '1px solid #c3e6cb' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckIcon sx={{ color: '#155724', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#155724' }}>
                        API Permissions
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#155724' }}>
                      Full access to transactions and accounts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SettingsIcon sx={{ color: '#1a1a1a' }} />
            Zoho Books Integration Settings
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Zoho API Key"
                placeholder="Enter your Zoho Books API key"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organization ID"
                placeholder="Enter your Zoho organization ID"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, background: '#f8f9fa', borderRadius: '6px' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                    Auto-sync
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Automatically sync transactions at regular intervals
                  </Typography>
                </Box>
                <Switch
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#1a1a1a' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1a1a1a' },
                  }}
                />
              </Box>
            </Grid>
            {autoSync && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sync Interval</InputLabel>
                  <Select
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(e.target.value as number)}
                    label="Sync Interval"
                    sx={{ borderRadius: '6px' }}
                  >
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={240}>4 hours</MenuItem>
                    <MenuItem value={1440}>Daily</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', pt: 2, px: 3, pb: 3 }}>
          <Button onClick={() => setShowSettings(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setShowSettings(false)}
            sx={{
              background: '#1a1a1a',
              '&:hover': { background: '#000000' },
            }}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookkeeping; 