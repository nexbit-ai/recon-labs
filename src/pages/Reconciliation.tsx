import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
  Collapse,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Sync as SyncIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  AssignmentInd as AssignmentIndIcon,
  InfoOutlined as InfoOutlinedIcon,
  AccountBalance as AccountBalanceIcon,
  Storage as StorageIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';

// Mock data for users/avatars
const users = [
  { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: 3, name: 'Carol', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: 4, name: 'Dan', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
];

// Mock data for accounts
const accountData = [
  {
    group: 'Assets',
    count: 14,
    children: [
      {
        subgroup: 'Current Assets',
        accounts: [
          {
            code: '1010',
            name: 'Cash and Cash Equivalents',
            glBalance: 32000000,
            recBalance: 32000000,
            difference: 0,
            percent: 0,
            assignees: [users[0]],
            status: 'ok',
          },
          {
            code: '1020',
            name: 'Accounts Receivable - Trade',
            glBalance: 2500000,
            recBalance: 2250000,
            difference: 250000,
            percent: 1,
            assignees: [users[1], users[2]],
            status: 'warning',
          },
          {
            code: '1021',
            name: 'Accounts Receivable - Other',
            glBalance: 150000,
            recBalance: 150000,
            difference: 0,
            percent: 0,
            assignees: [users[3]],
            status: 'ok',
          },
          {
            code: '1030',
            name: 'Inventory',
            glBalance: 150000,
            recBalance: 150000,
            difference: 0,
            percent: 0,
            assignees: [users[2]],
            status: 'ok',
          },
        ],
      },
    ],
  },
];

const statusIcon = (status: string) => {
  if (status === 'ok') return <CheckCircleIcon color="success" fontSize="small" />;
  if (status === 'warning') return <WarningIcon color="warning" fontSize="small" />;
  return <InfoOutlinedIcon color="disabled" fontSize="small" />;
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const connectorOptions = [
  { key: 'bank', label: 'Bank', icon: <AccountBalanceIcon color="primary" /> },
  { key: 'erp', label: 'ERP', icon: <StorageIcon color="secondary" /> },
  { key: 'excel', label: 'Excel', icon: <TableChartIcon color="success" /> },
];

const Reconciliation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({ Assets: true });
  const [expandedSubgroups, setExpandedSubgroups] = useState<{ [key: string]: boolean }>({ 'Assets-Current Assets': true });
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = January
  const [syncAnchorEl, setSyncAnchorEl] = useState<null | HTMLElement>(null);
  const [syncStatus, setSyncStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'done' }>({});
  const [syncStarted, setSyncStarted] = useState(false);

  const handleGroupToggle = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };
  const handleSubgroupToggle = (group: string, subgroup: string) => {
    setExpandedSubgroups((prev) => ({ ...prev, [`${group}-${subgroup}`]: !prev[`${group}-${subgroup}`] }));
  };

  // Filtering (search only on account name/code)
  const filteredData = accountData.map((group) => ({
    ...group,
    children: group.children.map((sub) => ({
      ...sub,
      accounts: sub.accounts.filter(
        (acc) =>
          acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          acc.code.includes(searchTerm)
      ),
    })),
  }));

  // Auto-trigger sync when popover opens
  useEffect(() => {
    if (syncAnchorEl && !syncStarted) {
      setSyncStarted(true);
      setSyncStatus({ bank: 'done', erp: 'done', excel: 'loading' });
      setTimeout(() => {
        setSyncStatus({ bank: 'done', erp: 'done', excel: 'done' });
        setTimeout(() => {
          setSyncAnchorEl(null);
          setSyncStarted(false);
        }, 800);
      }, 2000);
    }
    if (!syncAnchorEl && syncStarted) {
      setSyncStarted(false);
    }
  }, [syncAnchorEl, syncStarted]);

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Month Tabs */}
      <Paper sx={{ mb: 2, p: 1, borderRadius: 3 }}>
        <Tabs
          value={selectedMonth}
          onChange={(_, v) => setSelectedMonth(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {monthNames.map((name, idx) => (
            <Tab key={name} label={name} value={idx} />
          ))}
        </Tabs>
      </Paper>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            LTD Nexbit
          </Typography>
          <Chip label={`${monthNames[selectedMonth]} 2025`} variant="outlined" sx={{ fontWeight: 500 }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last sync 5 mins ago
          </Typography>
          <Button
            startIcon={<SyncIcon />}
            variant="outlined"
            sx={{ borderRadius: 2, opacity: 1, '&:active': { opacity: 1 }, '&:focus': { opacity: 1 }, '&:hover': { opacity: 1 } }}
            onClick={(e) => setSyncAnchorEl(e.currentTarget)}
          >
            Sync Data
          </Button>
          <Popover
            open={Boolean(syncAnchorEl)}
            anchorEl={syncAnchorEl}
            onClose={() => setSyncAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { minWidth: 220, p: 1 } }}
          >
            <Typography sx={{ px: 2, py: 1, fontWeight: 600, color: 'text.secondary' }}>
              Select connector
            </Typography>
            <List>
              {connectorOptions.map((opt) => (
                <ListItem key={opt.label} disablePadding>
                  <ListItemButton disabled>
                    <ListItemIcon>{opt.icon}</ListItemIcon>
                    <ListItemText primary={opt.label} />
                    {syncStatus[opt.key] === 'done' && (
                      <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                    )}
                    {syncStatus[opt.key] === 'loading' && (
                      <CircularProgress size={22} sx={{ ml: 1 }} />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Popover>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Search"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, background: '#fff' },
          }}
          sx={{ width: 240 }}
        />
        <Chip icon={<AssignmentIndIcon />} label="Assignee" variant="outlined" />
        <Chip icon={<PersonIcon />} label="Account status" variant="outlined" />
      </Box>

      {/* Table */}
      <Paper sx={{ p: 0, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ background: '#fafbfc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>GL balance</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rec. Balance</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Difference</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>%</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Account status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((group) => (
                <React.Fragment key={group.group}>
                  {/* Group Row */}
                  <TableRow sx={{ background: '#f5f6fa' }}>
                    <TableCell colSpan={8} sx={{ pl: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" onClick={() => handleGroupToggle(group.group)}>
                          {expandedGroups[group.group] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <Typography sx={{ fontWeight: 600 }}>{group.group} <span style={{ color: '#b0b0b0', fontWeight: 400 }}>({group.count})</span></Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {/* Subgroups */}
                  {expandedGroups[group.group] && group.children.map((sub) => (
                    <React.Fragment key={sub.subgroup}>
                      <TableRow sx={{ background: '#f8f9fb' }}>
                        <TableCell colSpan={8} sx={{ pl: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton size="small" onClick={() => handleSubgroupToggle(group.group, sub.subgroup)}>
                              {expandedSubgroups[`${group.group}-${sub.subgroup}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                            <Typography sx={{ fontWeight: 500 }}>{sub.subgroup}</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                      {/* Accounts */}
                      {expandedSubgroups[`${group.group}-${sub.subgroup}`] && sub.accounts.map((acc) => (
                        <TableRow key={acc.code} hover sx={{ background: '#fff' }}>
                          <TableCell sx={{ pl: 10, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {statusIcon(acc.status)}
                            <Typography sx={{ fontWeight: 500 }}>{acc.code} {acc.name}</Typography>
                          </TableCell>
                          <TableCell>{acc.glBalance.toLocaleString('en-GB', { style: 'currency', currency: 'EUR' })}</TableCell>
                          <TableCell>{acc.recBalance.toLocaleString('en-GB', { style: 'currency', currency: 'EUR' })}</TableCell>
                          <TableCell sx={{ color: acc.difference === 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                            {acc.difference === 0 ? `€0.00` : acc.difference.toLocaleString('en-GB', { style: 'currency', currency: 'EUR' })}
                          </TableCell>
                          <TableCell sx={{ color: acc.percent === 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                            {acc.percent}%
                          </TableCell>
                          <TableCell>
                            <Chip label="0%" color="success" size="small" />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={-1}>
                              {acc.assignees.map((user) => (
                                <Tooltip title={user.name} key={user.id}>
                                  <Avatar src={user.avatar} sx={{ width: 28, height: 28, border: '2px solid #fff' }} />
                                </Tooltip>
                              ))}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={acc.status === 'ok' ? 'OK' : acc.status === 'warning' ? 'Attention' : 'Unknown'}
                              color={acc.status === 'ok' ? 'success' : acc.status === 'warning' ? 'error' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Reconciliation; 