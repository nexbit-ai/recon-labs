import React from 'react';
import { Box, Paper, Typography, Grid, Button, IconButton } from '@mui/material';
import {
  MoreHoriz as MoreHorizIcon,
  CheckCircleOutline as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  InfoOutlined as InfoIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';
import { b2bHomeKPIs, b2bHomeFeed, platformColors } from '../../data/b2bMockData';

const fmt = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const FeedIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />;
    case 'alert':
      return <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />;
    case 'warning':
      return <WarningIcon sx={{ color: '#f59e42', fontSize: 20 }} />;
    case 'info':
    default:
      return <InfoIcon sx={{ color: '#3b82f6', fontSize: 20 }} />;
  }
};

const B2BOverview: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 28, letterSpacing: -0.5, color: '#111' }}>
          Overview
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: '#6b7280', mt: 0.5 }}>
          What needs your attention today?
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 6 }}>
        {[
          { label: 'Recoverable Today', value: fmt(b2bHomeKPIs.recoverableToday), color: '#10b981' },
          { label: 'Outstanding Receivables', value: fmt(b2bHomeKPIs.outstandingReceivables), color: '#f59e42' },
          { label: 'Open Disputes', value: b2bHomeKPIs.openDisputes, color: '#ef4444' },
          { label: 'Automation Rate', value: `${b2bHomeKPIs.automationRate}%`, color: '#6c63ff' },
        ].map((kpi) => (
          <Grid item xs={6} md={3} key={kpi.label}>
            <Paper 
              sx={{ 
                p: 2.5, 
                borderRadius: 4, 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: '#fff'
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {kpi.label}
              </Typography>
              <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: kpi.color, lineHeight: 1.1 }}>
                {kpi.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* AI Activity Feed */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <AIIcon sx={{ fontSize: 18, color: '#111' }} />
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#111' }}>
            Action Items
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {b2bHomeFeed.map((item) => (
            <Paper 
              key={item.id} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                border: '1px solid #e5e7eb', 
                boxShadow: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                '&:hover': { borderColor: '#d1d5db', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }
              }}
            >
              <Box sx={{ display: 'flex', gap: 2.5 }}>
                <Box sx={{ pt: 0.2 }}>
                  <FeedIcon type={item.type} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: platformColors[item.platform] }} />
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>
                        {item.platform}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        {item.timeAgo}
                      </Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: '#9ca3af', m: -1 }}>
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography sx={{ fontSize: '1.05rem', color: '#1f2937', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4, mb: 2.5 }}>
                    {item.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {item.actions.map((action) => {
                      const isPrimary = action === 'Review' || action === 'Raise Dispute' || action === 'Accept';
                      return (
                        <Button
                          key={action}
                          variant={isPrimary ? 'contained' : 'outlined'}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            px: 2.5,
                            py: 0.6,
                            boxShadow: 'none',
                            ...(isPrimary ? {
                              bgcolor: action === 'Raise Dispute' ? '#ef4444' : action === 'Accept' ? '#10b981' : '#111',
                              '&:hover': {
                                bgcolor: action === 'Raise Dispute' ? '#dc2626' : action === 'Accept' ? '#059669' : '#374151',
                                boxShadow: 'none'
                              }
                            } : {
                              borderColor: '#d1d5db',
                              color: '#4b5563',
                              '&:hover': {
                                borderColor: '#9ca3af',
                                bgcolor: 'transparent'
                              }
                            })
                          }}
                        >
                          {action}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default B2BOverview;
