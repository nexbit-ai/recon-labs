import React from 'react';
import { Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { ResponsiveContainer, CartesianGrid, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';

type ProviderType = 'Logistics (COD)' | 'Payment Gateway';

type AgeBucketKey = '<=1d' | '2-3d' | '4-7d' | '8-14d' | '15-30d' | '>30d';

interface ProviderAgeing {
  provider: string;
  type: ProviderType;
  averageDaysToSettle: number;
  distribution: Record<AgeBucketKey, number>; // percentage distribution by bucket (0-100)
}

const AGE_BUCKETS: AgeBucketKey[] = ['<=1d', '2-3d', '4-7d', '8-14d', '15-30d', '>30d'];

const BUCKET_COLORS: Record<AgeBucketKey, string> = {
  '<=1d': '#3bb36a',
  '2-3d': '#6c63ff',
  '4-7d': '#00bcd4',
  '8-14d': '#ffb300',
  '15-30d': '#ff7043',
  '>30d': '#ef5350',
};

// Mock ageing data across typical providers
const PROVIDER_AGEING_DATA: ProviderAgeing[] = [
  { provider: 'Blue Dart', type: 'Logistics (COD)', averageDaysToSettle: 6.2, distribution: { '<=1d': 5, '2-3d': 18, '4-7d': 42, '8-14d': 25, '15-30d': 8, '>30d': 2 } },
  { provider: 'DTDC', type: 'Logistics (COD)', averageDaysToSettle: 7.9, distribution: { '<=1d': 4, '2-3d': 15, '4-7d': 38, '8-14d': 28, '15-30d': 12, '>30d': 3 } },
  { provider: 'Delhivery', type: 'Logistics (COD)', averageDaysToSettle: 5.6, distribution: { '<=1d': 7, '2-3d': 22, '4-7d': 45, '8-14d': 20, '15-30d': 5, '>30d': 1 } },
  { provider: 'Ecom Express', type: 'Logistics (COD)', averageDaysToSettle: 6.8, distribution: { '<=1d': 6, '2-3d': 20, '4-7d': 40, '8-14d': 24, '15-30d': 8, '>30d': 2 } },
  { provider: 'PayU', type: 'Payment Gateway', averageDaysToSettle: 2.3, distribution: { '<=1d': 35, '2-3d': 45, '4-7d': 15, '8-14d': 4, '15-30d': 1, '>30d': 0 } },
  { provider: 'Paytm', type: 'Payment Gateway', averageDaysToSettle: 2.0, distribution: { '<=1d': 40, '2-3d': 42, '4-7d': 12, '8-14d': 4, '15-30d': 2, '>30d': 0 } },
  { provider: 'Razorpay', type: 'Payment Gateway', averageDaysToSettle: 1.8, distribution: { '<=1d': 48, '2-3d': 40, '4-7d': 9, '8-14d': 2, '15-30d': 1, '>30d': 0 } },
  { provider: 'Cashfree', type: 'Payment Gateway', averageDaysToSettle: 2.5, distribution: { '<=1d': 32, '2-3d': 46, '4-7d': 17, '8-14d': 4, '15-30d': 1, '>30d': 0 } },
];

// Prepare stacked-bar chart data structure: one entry per provider with bucket keys as fields
const chartData = PROVIDER_AGEING_DATA.map((p) => {
  const row: any = { provider: p.provider };
  AGE_BUCKETS.forEach((b) => { row[b] = p.distribution[b]; });
  return row;
});

const Dashboard: React.FC = () => {
  // Summary metrics
  const overallAvgTAT = (
    PROVIDER_AGEING_DATA.reduce((sum, p) => sum + p.averageDaysToSettle, 0) / PROVIDER_AGEING_DATA.length
  ).toFixed(1);

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, fontSize: 28, letterSpacing: -0.5 }}>Payment Ageing Analysis</Typography>
        <Chip label={`Avg TAT: ${overallAvgTAT} days`} sx={{ bgcolor: '#e6f4ea', color: '#1b5e20', fontWeight: 700 }} />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>Time to Settle by Provider (Stacked %)</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {AGE_BUCKETS.map((b) => (
                  <Chip key={b} size="small" label={b} sx={{ bgcolor: BUCKET_COLORS[b], color: '#fff', fontWeight: 700 }} />
                ))}
              </Box>
            </Box>
            <Box sx={{ width: '100%', height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="provider" tick={{ fontSize: 12 }} interval={0} height={60} angle={-15} textAnchor="end" />
                  <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <RechartsTooltip formatter={(v: any) => [`${v}%`, 'Share']} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {AGE_BUCKETS.map((b) => (
                    <Bar key={b} dataKey={b} stackId="a" fill={BUCKET_COLORS[b]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, mb: 2 }}>Provider TAT Summary</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Provider</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Avg TAT (days)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">≤3d %</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">4–7d %</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">8–14d %</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">{'>'}14d %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PROVIDER_AGEING_DATA.map((p) => {
                    const le3 = p.distribution['<=1d'] + p.distribution['2-3d'];
                    const d4_7 = p.distribution['4-7d'];
                    const d8_14 = p.distribution['8-14d'];
                    const gt14 = p.distribution['15-30d'] + p.distribution['>30d'];
                    return (
                      <TableRow key={p.provider} hover>
                        <TableCell>{p.provider}</TableCell>
                        <TableCell>
                          <Chip size="small" label={p.type} sx={{ bgcolor: p.type === 'Payment Gateway' ? '#e3f2fd' : '#fff7e6', fontWeight: 700 }} />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{p.averageDaysToSettle.toFixed(1)}</TableCell>
                        <TableCell align="right">{le3}%</TableCell>
                        <TableCell align="right">{d4_7}%</TableCell>
                        <TableCell align="right">{d8_14}%</TableCell>
                        <TableCell align="right">{gt14}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;