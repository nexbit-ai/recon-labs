import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Chip, Grid, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Cell,
} from 'recharts';
import { b2bOutstanding, b2bOutstandingAging, b2bOverviewKPIs, platformColors, PlatformName } from '../../data/b2bMockData';

const fmt = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const riskStyle: Record<string, { bg: string; fg: string }> = {
  'Low': { bg: '#e6f4ea', fg: '#1b5e20' },
  'Medium': { bg: '#fff7e6', fg: '#b45309' },
  'High': { bg: '#fef2f2', fg: '#991b1b' },
};

const B2BOutstanding: React.FC = () => {
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [platformFilter, setPlatformFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    return b2bOutstanding.filter((o) => {
      if (riskFilter !== 'All' && o.risk !== riskFilter) return false;
      if (platformFilter !== 'All' && o.platform !== platformFilter) return false;
      return true;
    });
  }, [riskFilter, platformFilter]);

  const highRiskTotal = useMemo(
    () => b2bOutstanding.filter((o) => o.risk === 'High').reduce((s, o) => s + o.amount, 0),
    []
  );

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 26, letterSpacing: -0.5, color: '#111' }}>
          Outstanding
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#6b7280', mt: 0.3 }}>
          What's still pending settlement from platforms?
        </Typography>
      </Box>

      {/* KPI Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none' }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Outstanding
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e42' }}>{fmt(b2bOverviewKPIs.totalOutstanding)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid #ef4444', boxShadow: 'none' }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              High Risk
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#991b1b' }}>{fmt(highRiskTotal)}</Typography>
            <Typography sx={{ fontSize: '0.62rem', color: '#9ca3af' }}>
              {b2bOutstanding.filter((o) => o.risk === 'High').length} items overdue
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none' }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Items
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800 }}>{b2bOutstanding.length}</Typography>
            <Typography sx={{ fontSize: '0.62rem', color: '#9ca3af' }}>Across 5 platforms</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none' }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Expected This Week
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>
              {fmt(b2bOutstanding.filter((o) => o.agingBucket === '0-7').reduce((s, o) => s + o.amount, 0))}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Aging Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none', height: '100%' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 2 }}>Aging Breakdown</Typography>
            <Box sx={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={b2bOutstandingAging} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => fmt(v)} axisLine={false} />
                  <YAxis type="category" dataKey="bucket" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
                  <RechartsTooltip formatter={(v: any) => fmt(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {b2bOutstandingAging.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {b2bOutstandingAging.map((a) => (
                <Box key={a.bucket} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: a.color }} />
                    <Typography sx={{ fontSize: '0.68rem', color: '#6b7280' }}>{a.bucket}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 600 }}>{a.count} items · {fmt(a.amount)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Items List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Pending Settlements</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>Risk</InputLabel>
                  <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} label="Risk" sx={{ fontSize: '0.75rem' }}>
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>Platform</InputLabel>
                  <Select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} label="Platform" sx={{ fontSize: '0.75rem' }}>
                    <MenuItem value="All">All</MenuItem>
                    {['Zepto', 'Blinkit', 'Instamart', 'Amazon', 'Flipkart'].map((p) => (
                      <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filtered.map((o) => (
                <Box
                  key={o.id}
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: o.risk === 'High' ? '#fecaca' : '#f0f0f0',
                    bgcolor: o.risk === 'High' ? '#fffbfb' : 'transparent',
                    transition: 'border-color 0.15s',
                    '&:hover': { borderColor: '#d1d5db' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: platformColors[o.platform], flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{o.platform}</Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: '#9ca3af' }}>· {o.orderPeriod}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>{fmt(o.amount)}</Typography>
                      <Chip label={o.risk} size="small" sx={{ fontSize: '0.58rem', fontWeight: 700, height: 20, ...riskStyle[o.risk] }} />
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.4 }}>{o.reason}</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 0.8 }}>
                    <Typography sx={{ fontSize: '0.62rem', color: '#9ca3af' }}>Expected: {o.expectedDate}</Typography>
                    {o.agingDays > 0 && (
                      <Typography sx={{ fontSize: '0.62rem', color: o.agingDays > 14 ? '#991b1b' : '#b45309', fontWeight: 600 }}>
                        {o.agingDays}d overdue
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
              {filtered.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography sx={{ color: '#9ca3af', fontSize: '0.82rem' }}>No outstanding items match filters</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default B2BOutstanding;
