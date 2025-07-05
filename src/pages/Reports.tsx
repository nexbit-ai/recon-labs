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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  AutoAwesome as AutoAwesomeIcon,
  CalendarToday as CalendarTodayIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
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
  const [slackDialogOpen, setSlackDialogOpen] = useState(false);
  const [slackChannel, setSlackChannel] = useState('');
  const [slackFrequency, setSlackFrequency] = useState('weekly');
  const [slackEnabled, setSlackEnabled] = useState(false);

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
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ScheduleIcon />}
              fullWidth
              sx={{ borderRadius: 2, py: 1.5 }}
              onClick={() => setSlackDialogOpen(true)}
            >
              Send Reports Periodically to Slack
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

      {/* Slack Connector Dialog */}
      <Dialog
        open={slackDialogOpen}
        onClose={() => setSlackDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #4A154B 30%, #36C5F0 90%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              💬
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0 }}>
                Connect to Slack
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Schedule periodic reports to your Slack channels
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setSlackDialogOpen(false)}
            sx={{ ml: 'auto' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {/* Enable/Disable Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={slackEnabled}
                  onChange={(e) => setSlackEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable periodic reports to Slack"
            />
            
            <Divider />
            
            {/* Channel Selector */}
            <FormControl fullWidth disabled={!slackEnabled}>
              <InputLabel>Slack Channel</InputLabel>
              <Select
                value={slackChannel}
                label="Slack Channel"
                onChange={(e) => setSlackChannel(e.target.value)}
              >
                <MenuItem value="general"># general</MenuItem>
                <MenuItem value="finance"># finance</MenuItem>
                <MenuItem value="accounting"># accounting</MenuItem>
                <MenuItem value="management"># management</MenuItem>
                <MenuItem value="reports"># reports</MenuItem>
              </Select>
            </FormControl>
            
            {/* Frequency Selector */}
            <FormControl fullWidth disabled={!slackEnabled}>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={slackFrequency}
                label="Frequency"
                onChange={(e) => setSlackFrequency(e.target.value)}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </Select>
            </FormControl>
            
            {/* Report Type for Slack */}
            <FormControl fullWidth disabled={!slackEnabled}>
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
            
            {slackEnabled && slackChannel && (
              <Box sx={{ 
                p: 2, 
                bgcolor: 'primary.50', 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: 'primary.200' 
              }}>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                  📅 Schedule Preview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {reportTypes.find(rt => rt.value === reportType)?.label} will be sent to{' '}
                  <strong>#{slackChannel}</strong> every{' '}
                  <strong>{slackFrequency.replace('ly', '')}</strong>
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setSlackDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // Handle save logic here
              setSlackDialogOpen(false);
              // Show success message or handle the integration
            }}
            variant="contained"
            disabled={!slackEnabled || !slackChannel}
            sx={{ borderRadius: 2 }}
          >
            Save Integration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 