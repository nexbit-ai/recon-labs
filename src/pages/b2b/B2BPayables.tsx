import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Chip, Grid, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { b2bDisputes, b2bDisputeStats, platformColors, PlatformName } from '../../data/b2bMockData';

const fmt = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const statusStyle: Record<string, { bg: string; fg: string }> = {
  'Open': { bg: '#e8eaf6', fg: '#283593' },
  'Under Review': { bg: '#fff7e6', fg: '#b45309' },
  'Escalated': { bg: '#fef2f2', fg: '#991b1b' },
  'Won': { bg: '#e6f4ea', fg: '#1b5e20' },
  'Lost': { bg: '#f3f4f6', fg: '#6b7280' },
  'Partially Won': { bg: '#faf5ff', fg: '#7c3aed' },
};

const B2BDisputes: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [platformFilter, setPlatformFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    return b2bDisputes.filter((d) => {
      if (statusFilter !== 'All' && d.status !== statusFilter) return false;
      if (platformFilter !== 'All' && d.platform !== platformFilter) return false;
      return true;
    });
  }, [statusFilter, platformFilter]);

  const ds = b2bDisputeStats;

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 26, letterSpacing: -0.5, color: '#111' }}>
          Disputes
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#6b7280', mt: 0.3 }}>
          What are we fighting for? Track active disputes and resolution.
        </Typography>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Active Disputes', value: ds.totalActive.toString(), sub: `${fmt(ds.totalAmount)} at stake`, color: '#111' },
          { label: 'Win Rate', value: `${ds.winRate}%`, sub: 'Historical average', color: '#22c55e' },
          { label: 'Won', value: fmt(ds.wonAmount), sub: 'Credited or incoming', color: '#22c55e' },
          { label: 'Partially Won', value: fmt(ds.partiallyWonAmount), sub: 'Partial resolution', color: '#7c3aed' },
          { label: 'Avg Resolution', value: `${ds.avgResolutionDays}d`, sub: 'Days to resolve', color: '#6b7280' },
        ].map((s) => (
          <Grid item xs={6} md key={s.label}>
            <Paper sx={{ p: 2, borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none' }}>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: s.color, mt: 0.3 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: '#9ca3af' }}>{s.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status" sx={{ fontSize: '0.75rem' }}>
            <MenuItem value="All">All</MenuItem>
            {['Open', 'Under Review', 'Escalated', 'Won', 'Partially Won', 'Lost'].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
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

      {/* Disputes List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {filtered.map((d) => (
          <Paper
            key={d.id}
            sx={{
              p: 0,
              borderRadius: 3,
              border: '1.5px solid #f0f0f0',
              boxShadow: 'none',
              overflow: 'hidden',
              transition: 'border-color 0.15s',
              '&:hover': { borderColor: '#d1d5db' },
            }}
          >
            {/* Main content */}
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: platformColors[d.platform], flexShrink: 0, mt: 0.3 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{d.type}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                      {d.platform} · Filed {d.filedDate} · {d.daysOpen}d open
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800 }}>{fmt(d.amount)}</Typography>
                  <Chip label={d.status} size="small" sx={{ fontSize: '0.58rem', fontWeight: 700, height: 20, ...statusStyle[d.status] }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.5 }}>{d.description}</Typography>
            </Box>

            {/* AI Suggestion */}
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                bgcolor: '#faf5ff',
                borderTop: '1px solid #f0e6ff',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <AIIcon sx={{ fontSize: 14, color: '#7c3aed', mt: 0.2, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#6b21a8', lineHeight: 1.5, fontStyle: 'italic' }}>
                {d.aiSuggestion}
              </Typography>
            </Box>
          </Paper>
        ))}
        {filtered.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1.5px solid #f0f0f0', boxShadow: 'none' }}>
            <Typography sx={{ color: '#9ca3af', fontSize: '0.82rem' }}>No disputes match filters</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default B2BDisputes;
