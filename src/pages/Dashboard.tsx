import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Avatar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  MoreHoriz as MoreHorizIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import AvatarGroup from '@mui/material/AvatarGroup';
import GavelIcon from '@mui/icons-material/Gavel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

// Mock users
const users = [
  { id: 1, name: 'Mary', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 2, name: 'Alex', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: 3, name: 'Evan', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
];

// Mock data with different time periods
const getDashboardData = (period: string) => {
  const baseData = {
    'current': {
      cashBalance: 11470852.37,
      automationRate: 99,
      totalFees: 61778.91,
      totalExceptions: 8239.36,
      totalExceptionCount: 4,
      forecastedBalanceData: [
        { date: 'Sep 23', value: 4000000 },
        { date: 'Oct 23', value: 7000000 },
        { date: 'Nov 23', value: 9000000 },
        { date: 'Dec 23', value: 11470852.37 },
      ],
      cashFlowCategories: [
        { name: 'Opening', value: 1000000, type: 'in' },
        { name: 'Collection', value: 3000000, type: 'in' },
        { name: 'Interest', value: 500000, type: 'in' },
        { name: 'Other Income', value: 200000, type: 'in' },
        { name: 'Vendors', value: -1200000, type: 'out' },
        { name: 'Payroll', value: -800000, type: 'out' },
        { name: 'Rent', value: -400000, type: 'out' },
        { name: 'CAPEX', value: -300000, type: 'out' },
        { name: 'Closing', value: 1200000, type: 'in' },
      ],
      exceptions: [
        { date: '08/20/2023', user: users[0], days: 12, amount: 2000 },
        { date: '08/12/2023', user: users[1], days: 7, amount: 1500 },
        { date: '08/12/2023', user: users[2], days: 3, amount: 3000 },
        { date: '07/27/2023', user: users[2], days: 3, amount: 1739.36 },
      ],
      feeBreakdown: [
        { name: 'PayPal', value: 30000 },
        { name: 'Stripe', value: 20000 },
        { name: 'Wells Fargo', value: 11778.91 },
      ],
      agingReport: [
        { name: '0', value: 0 },
        { name: '1-30 days', value: 250000 },
        { name: '31-60 days', value: 120000 },
      ],
    },
    'last-month': {
      cashBalance: 9876543.21,
      automationRate: 97,
      totalFees: 54321.50,
      totalExceptions: 12345.67,
      totalExceptionCount: 6,
      forecastedBalanceData: [
        { date: 'Aug 23', value: 3500000 },
        { date: 'Sep 23', value: 6000000 },
        { date: 'Oct 23', value: 8000000 },
        { date: 'Nov 23', value: 9876543.21 },
      ],
      cashFlowCategories: [
        { name: 'Opening', value: 800000, type: 'in' },
        { name: 'Collection', value: 2500000, type: 'in' },
        { name: 'Interest', value: 400000, type: 'in' },
        { name: 'Other Income', value: 150000, type: 'in' },
        { name: 'Vendors', value: -1000000, type: 'out' },
        { name: 'Payroll', value: -700000, type: 'out' },
        { name: 'Rent', value: -350000, type: 'out' },
        { name: 'CAPEX', value: -250000, type: 'out' },
        { name: 'Closing', value: 1000000, type: 'in' },
      ],
      exceptions: [
        { date: '07/15/2023', user: users[0], days: 15, amount: 2500 },
        { date: '07/10/2023', user: users[1], days: 10, amount: 1800 },
        { date: '07/05/2023', user: users[2], days: 5, amount: 3500 },
        { date: '06/28/2023', user: users[0], days: 8, amount: 1200 },
        { date: '06/20/2023', user: users[1], days: 12, amount: 2200 },
        { date: '06/15/2023', user: users[2], days: 6, amount: 1145.67 },
      ],
      feeBreakdown: [
        { name: 'PayPal', value: 25000 },
        { name: 'Stripe', value: 18000 },
        { name: 'Wells Fargo', value: 11321.50 },
      ],
      agingReport: [
        { name: '0', value: 0 },
        { name: '1-30 days', value: 200000 },
        { name: '31-60 days', value: 100000 },
      ],
    },
    'last-year': {
      cashBalance: 8765432.10,
      automationRate: 95,
      totalFees: 45678.90,
      totalExceptions: 9876.54,
      totalExceptionCount: 8,
      forecastedBalanceData: [
        { date: 'Jan 23', value: 3000000 },
        { date: 'Apr 23', value: 5000000 },
        { date: 'Jul 23', value: 7000000 },
        { date: 'Oct 23', value: 8765432.10 },
      ],
      cashFlowCategories: [
        { name: 'Opening', value: 600000, type: 'in' },
        { name: 'Collection', value: 2000000, type: 'in' },
        { name: 'Interest', value: 300000, type: 'in' },
        { name: 'Other Income', value: 100000, type: 'in' },
        { name: 'Vendors', value: -800000, type: 'out' },
        { name: 'Payroll', value: -600000, type: 'out' },
        { name: 'Rent', value: -300000, type: 'out' },
        { name: 'CAPEX', value: -200000, type: 'out' },
        { name: 'Closing', value: 800000, type: 'in' },
      ],
      exceptions: [
        { date: '06/15/2023', user: users[0], days: 18, amount: 3000 },
        { date: '06/10/2023', user: users[1], days: 12, amount: 2000 },
        { date: '06/05/2023', user: users[2], days: 8, amount: 4000 },
        { date: '05/28/2023', user: users[0], days: 10, amount: 1500 },
        { date: '05/20/2023', user: users[1], days: 15, amount: 2500 },
        { date: '05/15/2023', user: users[2], days: 7, amount: 1500 },
        { date: '05/10/2023', user: users[0], days: 9, amount: 1200 },
        { date: '05/05/2023', user: users[1], days: 11, amount: 876.54 },
      ],
      feeBreakdown: [
        { name: 'PayPal', value: 20000 },
        { name: 'Stripe', value: 15000 },
        { name: 'Wells Fargo', value: 10678.90 },
      ],
      agingReport: [
        { name: '0', value: 0 },
        { name: '1-30 days', value: 180000 },
        { name: '31-60 days', value: 80000 },
      ],
    },
  };
  
  return baseData[period as keyof typeof baseData] || baseData.current;
};

const COLORS = ['#3bb36a', '#6c63ff', '#ffb300', '#ff3b30', '#bdbdbd'];

// Add mock tasks for 'My Tasks' card
const myTasks = [
  {
    id: 1,
    name: 'Sales of Product Income Reconciliation',
    type: 'RECONCILIATION',
    typeColor: 'primary',
    typeBg: '#e3f2fd',
    user: users[0],
    priority: 3,
    due: '2025-05-24',
  },
  {
    id: 2,
    name: 'Accounts Receivable (A/R) Reconciliation',
    type: 'RECONCILIATION',
    typeColor: 'primary',
    typeBg: '#e3f2fd',
    user: users[0],
    priority: 3,
    due: '2025-05-28',
  },
  {
    id: 3,
    name: 'Post Interest Income',
    type: 'JOURNAL ENTRY',
    typeColor: 'success',
    typeBg: '#e6f4ea',
    user: users[2],
    priority: 4,
    due: '2025-05-31',
  },
];

function formatDue(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dateStr: string) {
  const today = new Date();
  const due = new Date(dateStr);
  return due < today;
}

const reconciliationBarData = [
  { name: 'Liability', value: 1 },
  { name: 'Asset', value: 8 },
  { name: 'Expense', value: 1 },
  { name: 'Revenue', value: 2 },
  { name: 'Equity', value: 4 },
];

const closeLengthData = [
  { date: 'May 1', value: 8 },
  { date: 'May 10', value: 8 },
  { date: 'May 20', value: 10 },
  { date: 'Jun 2', value: 12 },
];

const totalTasks = 16;
const completedTasks = 3;
const tasksPercent = Math.round((completedTasks / totalTasks) * 100);

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const data = getDashboardData(selectedPeriod);
  const [selectedMonth, setSelectedMonth] = useState(2); // 2 = March
  const [selectedYear, setSelectedYear] = useState(2024);

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };
  const handleNextMonth = () => {
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handlePrevMonth} size="large" sx={{ mr: 1 }}>
            <ChevronLeftIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <Typography variant="h3" sx={{ fontWeight: 800, mx: 1, fontSize: 32, letterSpacing: -1, minWidth: 170, textAlign: 'center' }}>
            {monthNames[selectedMonth]} {selectedYear}
          </Typography>
          <IconButton onClick={handleNextMonth} size="large" sx={{ ml: 1 }}>
            <ChevronRightIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="large"><FilterListIcon sx={{ fontSize: 32 }} /></IconButton>
          <IconButton size="large"><AddIcon sx={{ fontSize: 32 }} /></IconButton>
          <AvatarGroup max={3} sx={{ mr: 1 }}>
            <Avatar src={users[0].avatar} sx={{ width: 42, height: 42 }} />
            <Avatar src={users[1].avatar} sx={{ width: 42, height: 42 }} />
            <Avatar src={users[2].avatar} sx={{ width: 42, height: 42 }} />
            <Avatar sx={{ width: 42, height: 42, fontWeight: 700, fontSize: 20 }}>+2</Avatar>
          </AvatarGroup>
          <IconButton size="large"><MoreHorizIcon sx={{ fontSize: 32 }} /></IconButton>
        </Box>
      </Box>

      {/* Main Cards Row */}
      <Grid container spacing={4} sx={{ mb: 5, justifyContent: 'center' }}>
        {/* Reconciliation Card */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper sx={{ width: 350, height: 230, p: 3, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GavelIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 22 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 16 }}>Reconciliation</Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: 36, mb: 0.5, color: '#111' }}>93% Complete</Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: 16 }}>
              ₹3,802.63 Unreconciled
            </Typography>
            <Box sx={{ width: '100%', height: 60, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reconciliationBarData} barCategoryGap={30} barGap={2} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="value" fill="#111" radius={8} barSize={16} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#222' }} />
                  <YAxis hide />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        {/* Tasks Card */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper sx={{ width: 350, height: 230, p: 3, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssignmentTurnedInIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 22 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 16 }}>Tasks</Typography>
            </Box>
            <Box sx={{ position: 'relative', width: 90, height: 90, mb: 1 }}>
              <svg width="90" height="90">
                <circle cx="45" cy="45" r="40" fill="none" stroke="#eee" strokeWidth="8" />
                <circle cx="45" cy="45" r="40" fill="none" stroke="#6c63ff" strokeWidth="8" strokeDasharray={`${tasksPercent * 2.51} 251`} strokeLinecap="round" transform="rotate(-90 45 45)" />
              </svg>
              <Typography variant="h4" sx={{ position: 'absolute', top: 24, left: 0, width: '100%', textAlign: 'center', fontWeight: 800, fontSize: 28 }}>{tasksPercent}%</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontSize: 16 }}>{completedTasks}/{totalTasks} tasks completed</Typography>
          </Paper>
        </Grid>
        {/* Close Length Card */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper sx={{ width: 350, height: 230, p: 3, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 22 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 16 }}>Close Length</Typography>
              <Chip label="Jun 2, 2024" size="small" sx={{ ml: 'auto', bgcolor: '#fff7e6', color: '#ff9800', fontWeight: 600, fontSize: 14, height: 28 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: 36, mb: 0.5, color: '#111' }}>12 Days</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: 16 }}>Estimated days to complete close</Typography>
            <Box sx={{ width: '100%', height: 40, mb: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={closeLengthData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Line type="monotone" dataKey="value" stroke="#2196f3" strokeWidth={2} dot={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#222' }} />
                  <YAxis hide />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 15, mt: 1 }}>
              At this pace you are behind your close target (May 30, 2024) by <b>2 days</b>.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* My Tasks Card */}
      <Box sx={{ width: 1050, maxWidth: '100%', mb: 4, mx: 'auto' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: 20 }}>
          My Tasks
        </Typography>
        <Paper sx={{ borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none', overflow: 'hidden' }}>
          {myTasks.map((task, idx) => (
            <Box
              key={task.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 3,
                py: 2,
                borderBottom: idx !== myTasks.length - 1 ? '1px solid #f0f0f0' : 'none',
                background: idx % 2 === 2 ? '#fafbfc' : '#fff',
              }}
            >
              <Typography sx={{ flex: 1, fontWeight: 500, fontSize: 18 }}>
                {task.name}
              </Typography>
              <Chip
                label={task.type}
                size="small"
                sx={{
                  bgcolor: task.typeBg,
                  color: (theme) => (theme.palette as any)[task.typeColor]?.main || theme.palette.primary.main,
                  fontWeight: 600,
                  mr: 2,
                  minWidth: 110,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              />
              <Avatar src={task.user.avatar} sx={{ width: 28, height: 28, ml: 1, mr: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, color: '#ff9800', fontWeight: 600, fontSize: 16 }}>
                <span style={{ fontSize: 18, marginRight: 2 }}>⚡</span> {task.priority}
              </Box>
              <Typography
                sx={{
                  fontWeight: 500,
                  color: isOverdue(task.due) ? 'error.main' : 'text.secondary',
                  fontSize: 16,
                  minWidth: 64,
                  textAlign: 'right',
                }}
              >
                {formatDue(task.due)}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 