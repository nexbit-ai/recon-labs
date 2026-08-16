import React from 'react';
import {
  Box, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';

interface FeeAuditsTabProps {
  data: any;
  loading: boolean;
  onDownloadCSV: () => void;
  onViewOrders: (orderIds: string[]) => void;
}

const FeeAuditsTab: React.FC<FeeAuditsTabProps> = ({ data, loading, onDownloadCSV, onViewOrders }) => {
  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}>Loading fee audits...</Box>;
  }

  if (!data || !data.overcharged_by_sku) {
    return <Box sx={{ p: 4, textAlign: 'center' }}>No fee audit data available.</Box>;
  }

  const skuList = (data.overcharged_by_sku || []).sort((a: any, b: any) => b.total_excess - a.total_excess);
  const totalClaim = skuList.reduce((sum: number, metrics: any) => sum + metrics.total_excess, 0);
  const totalOrders = skuList.reduce((sum: number, metrics: any) => sum + metrics.rows, 0);

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. High-Level Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
        <Card sx={{ background: '#fef2f2', border: '1px solid #fecaca', boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="body2" color="error.main" fontWeight="600" mb={1}>Total Potential Claim</Typography>
            <Typography variant="h4" color="error.dark" fontWeight="700">₹{totalClaim.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" fontWeight="600" mb={1}>Affected Orders</Typography>
            <Typography variant="h4" color="text.primary" fontWeight="700">{totalOrders}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" fontWeight="600" mb={1}>Highest Impact SKU</Typography>
            <Typography variant="h5" color="text.primary" fontWeight="700">{skuList.length > 0 ? skuList[0].sku : 'N/A'}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 2. Critical Action Alerts */}
      <Box sx={{ 
        display: 'flex', alignItems: 'flex-start', p: 2, borderRadius: 2, 
        backgroundColor: '#fffbeb', border: '1px solid #fde68a', gap: 1.5 
      }}>
        <WarningAmberIcon sx={{ color: '#d97706', mt: 0.5 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight="700" color="#92400e">
            Critical Action Required: Wall Fans Overcharged
          </Typography>
          <Typography variant="body2" color="#b45309" mt={0.5}>
            Amazon is charging a 17.41% referral fee on Wall Fans (SKUs: 7L-2H8K-8UV5, KA-WK81-MPO5) instead of the standard rate. 
            This represents the majority of the overcharge. Please verify the product category in Seller Central.
          </Typography>
        </Box>
      </Box>

      {/* 3. Detailed Claims Data Table */}
      <Card sx={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="h6" fontWeight="600">Overcharges by SKU</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />}
            onClick={onDownloadCSV}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Download CSV for Amazon Claim
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Expected Fee (%)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actual Fee (%)</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Correct Orders</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Overcharged Orders</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Total Overcharge (₹)</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {skuList.map((metrics: any) => (
                <TableRow key={metrics.sku} sx={{ '&:hover': { backgroundColor: '#f3f4f6' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{metrics.sku}</TableCell>
                  <TableCell sx={{ color: '#6b7280', fontSize: '0.82rem' }}>{metrics.subcategory ? `${metrics.category} / ${metrics.subcategory}` : metrics.category}</TableCell>
                  <TableCell>{metrics.max_pct ? metrics.max_pct.toFixed(2) : 'N/A'}%</TableCell>
                  <TableCell>
                    <Chip size="small" label={`${metrics.actual_pct ? metrics.actual_pct.toFixed(2) : 'N/A'}%`} color={metrics.actual_pct > 15 ? "error" : "warning"} />
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#16a34a', fontWeight: 500 }}>{metrics.correct_rows ?? 0}</TableCell>
                  <TableCell align="right" sx={{ color: '#dc2626', fontWeight: 600 }}>{metrics.rows}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                    ₹{metrics.total_excess ? metrics.total_excess.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </TableCell>
                  <TableCell align="center">
                    {metrics.order_ids && metrics.order_ids.length > 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<SearchIcon fontSize="small" />}
                        onClick={() => onViewOrders(metrics.order_ids)}
                        sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.25 }}
                      >
                        View Orders
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default FeeAuditsTab;
