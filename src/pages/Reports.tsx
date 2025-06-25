import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  TextField,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  AutoAwesome as AutoAwesomeIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';

interface ReportData {
  category: string;
  amount: number;
  percentage: number;
}

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('income');
  const [timeRange, setTimeRange] = useState('month');
  const [customPrompt, setCustomPrompt] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const [customResult, setCustomResult] = useState<string | null>(null);

  const expenseData: ReportData[] = [
    { category: 'Operating Expenses', amount: 45000, percentage: 45 },
    { category: 'Payroll', amount: 35000, percentage: 35 },
    { category: 'Marketing', amount: 12000, percentage: 12 },
    { category: 'Other Expenses', amount: 8000, percentage: 8 },
  ];

  const currentData = expenseData;
  const total = currentData.reduce((sum, item) => sum + item.amount, 0);

  const reportTypes = [
    { value: 'income', label: 'Income Statement' },
    { value: 'expense', label: 'Expense Report' },
    { value: 'balance', label: 'Balance Sheet' },
    { value: 'cashflow', label: 'Cash Flow Statement' },
    { value: 'trial', label: 'Trial Balance' },
    { value: 'variance', label: 'Variance Analysis' },
    { value: 'ar-aging', label: 'AR Aging Report' },
    { value: 'ap-aging', label: 'AP Aging Report' },
    { value: 'forecast', label: 'Forecast Report' },
    { value: 'audit', label: 'Audit Trail' },
  ];

  const pastReports = [
    { id: 1, name: 'Income Statement - Jan 2025', type: 'Income Statement', date: '2025-02-01', file: 'income_jan2025.pdf', format: 'PDF' },
    { id: 2, name: 'Balance Sheet - Q4 2024', type: 'Balance Sheet', date: '2025-01-15', file: 'balance_q4_2024.xlsx', format: 'Excel' },
    { id: 3, name: 'AR Aging - Jan 2025', type: 'AR Aging Report', date: '2025-02-02', file: 'ar_aging_jan2025.pdf', format: 'PDF' },
    { id: 4, name: 'Variance Analysis - FY24', type: 'Variance Analysis', date: '2025-01-10', file: 'variance_fy24.xlsx', format: 'Excel' },
    { id: 5, name: 'Audit Trail - Jan 2025', type: 'Audit Trail', date: '2025-02-03', file: 'audittrail_jan2025.pdf', format: 'PDF' },
    { id: 6, name: 'Cash Flow - Q1 2025', type: 'Cash Flow Statement', date: '2025-01-20', file: 'cashflow_q1_2025.pdf', format: 'PDF' },
  ];

  const handleCustomReport = () => {
    setCustomLoading(true);
    setCustomResult(null);
    setTimeout(() => {
      setCustomLoading(false);
      setCustomResult(
        `<b>Custom Report:</b> <br/>Prompt: ${customPrompt}<br/><br/>` +
        'Summary: <ul><li>Metric 1: ₹1,25,000</li><li>Metric 2: ₹75,000</li><li>Metric 3: ₹50,000</li></ul>'
      );
    }, 2000);
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'Income Statement':
        return <BarChartIcon color="primary" />;
      case 'Balance Sheet':
        return <TableIcon color="secondary" />;
      case 'Cash Flow Statement':
        return <AutoAwesomeIcon color="info" />;
      default:
        return <DescriptionIcon color="action" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Financial Reports
      </Typography>
      
      {/* First Header Row: Input Text with General Report Button */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Describe the report you want..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            fullWidth
            size="small"
            disabled={customLoading}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <Button
            variant="contained"
            disabled={!customPrompt || customLoading}
            onClick={handleCustomReport}
            sx={{ minWidth: 140, borderRadius: 2 }}
          >
            {customLoading ? <CircularProgress size={20} /> : 'General Report'}
          </Button>
        </Box>
        
        {/* Custom Report Result */}
        {customLoading && (
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2, p: 2, background: '#f8fafb', borderRadius: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2">Generating custom report...</Typography>
          </Box>
        )}
        
        {customResult && !customLoading && (
          <Box sx={{ mt: 3, background: '#f8fafb', p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              Custom Report Generated
            </Typography>
            <Box sx={{ background: '#fff', p: 2, borderRadius: 1, border: '1px solid #e8e8e8' }}>
              <div dangerouslySetInnerHTML={{ __html: customResult }} />
            </Box>
          </Box>
        )}
      </Paper>

      {/* Second Header Row: Report Type, Time Range with Generate Button */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map((rt) => (
                  <MenuItem key={rt.value} value={rt.value}>{rt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AutoAwesomeIcon />}
              fullWidth
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              Generate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Past Reports as Thumbnails */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Recent Reports
        </Typography>
        <Grid container spacing={3}>
          {pastReports.map((report) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={report.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px 0 rgba(60,72,88,0.04)',
                  '&:hover': {
                    boxShadow: '0 4px 20px 0 rgba(60,72,88,0.08)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getReportIcon(report.type)}
                    <Chip 
                      label={report.format} 
                      size="small" 
                      sx={{ ml: 'auto', bgcolor: report.format === 'PDF' ? '#ffebee' : '#e3f2fd', color: report.format === 'PDF' ? '#d32f2f' : '#1976d2' }}
                    />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                    {report.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {report.type}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(report.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                    onClick={() => window.alert(`Downloading ${report.file}`)}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Reports; 