import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { b2bActivities, platformColors } from '../../data/b2bMockData';

const fmt = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const typeConfig: Record<string, { icon: string; label: string; bg: string; fg: string }> = {
  ai_insight: { icon: '✨', label: 'AI Insight', bg: '#faf5ff', fg: '#7c3aed' },
  settlement: { icon: '💰', label: 'Settlement', bg: '#f0fdf4', fg: '#166534' },
  dispute: { icon: '⚖️', label: 'Dispute', bg: '#fef2f2', fg: '#991b1b' },
  anomaly: { icon: '🔍', label: 'Anomaly', bg: '#fffbeb', fg: '#92400e' },
  recovery: { icon: '↩️', label: 'Recovery', bg: '#e8eaf6', fg: '#283593' },
  accounting: { icon: '📊', label: 'Accounting', bg: '#f3f4f6', fg: '#374151' },
};

const B2BActivity: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 26, letterSpacing: -0.5, color: '#111' }}>
          Activity
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#6b7280', mt: 0.3 }}>
          What happened recently across your platforms?
        </Typography>
      </Box>

      {/* Timeline */}
      <Box sx={{ position: 'relative' }}>
        {/* Vertical line */}
        <Box
          sx={{
            position: 'absolute',
            left: 20,
            top: 8,
            bottom: 8,
            width: 2,
            bgcolor: '#f0f0f0',
            borderRadius: 1,
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {b2bActivities.map((a, idx) => {
            const cfg = typeConfig[a.type] || typeConfig.accounting;
            return (
              <Box
                key={a.id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  pl: 0,
                  position: 'relative',
                }}
              >
                {/* Timeline dot */}
                <Box
                  sx={{
                    width: 40,
                    display: 'flex',
                    justifyContent: 'center',
                    pt: 1.8,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: a.isNew ? 12 : 8,
                      height: a.isNew ? 12 : 8,
                      borderRadius: '50%',
                      bgcolor: a.isNew ? '#6c63ff' : '#d1d5db',
                      border: a.isNew ? '2px solid #c4b5fd' : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                </Box>

                {/* Content card */}
                <Paper
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: a.isNew ? '#e9d5ff' : '#f0f0f0',
                    boxShadow: 'none',
                    bgcolor: a.isNew ? '#fefbff' : 'transparent',
                    transition: 'border-color 0.15s',
                    '&:hover': { borderColor: '#d1d5db' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: '0.88rem' }}>{cfg.icon}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#111' }}>{a.title}</Typography>
                      {a.isNew && (
                        <Chip label="New" size="small" sx={{ fontSize: '0.55rem', fontWeight: 700, height: 16, bgcolor: '#6c63ff', color: '#fff' }} />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '0.62rem', color: '#9ca3af', whiteSpace: 'nowrap', ml: 1, flexShrink: 0 }}>
                      {a.timestamp}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.5, mb: 0.8 }}>
                    {a.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={cfg.label}
                      size="small"
                      sx={{ fontSize: '0.55rem', fontWeight: 700, height: 18, bgcolor: cfg.bg, color: cfg.fg }}
                    />
                    {a.platform && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: platformColors[a.platform] }} />
                        <Typography sx={{ fontSize: '0.62rem', color: '#6b7280' }}>{a.platform}</Typography>
                      </Box>
                    )}
                    {a.amount && (
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#374151' }}>{fmt(a.amount)}</Typography>
                    )}
                  </Box>
                </Paper>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default B2BActivity;
