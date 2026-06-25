import React, { useState, useMemo } from 'react';
import { Box, Paper, Typography, Grid, Chip, Tab, Tabs } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AutoAwesome as AIIcon,
  AccessTime as TimeIcon,
  WarningAmber as WarningIcon,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';
import { b2bPlatforms, platformColors, b2bHomeFeed, b2bInboxDocuments } from '../../data/b2bMockData';

const fmt = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

// Mock extended data per platform
const extendedData = {
  Zepto: {
    healthTrend: 'worse',
    insight: 'Financial health is degrading. Deduction rate increased by 2.4% over the last 30 days due to commission overcharges.',
    avgDeductionRate: 3.2,
    recoverySuccess: 84,
    openDisputesCount: 12,
    recentSettlements: [
      { date: 'Jun 22', amount: 1240000, status: 'Short' },
      { date: 'Jun 15', amount: 1480000, status: 'Matched' }
    ]
  },
  Blinkit: {
    healthTrend: 'better',
    insight: 'Financial health is improving. Payment delays dropped to 6 days and recovery success hit an all-time high.',
    avgDeductionRate: 1.1,
    recoverySuccess: 92,
    openDisputesCount: 4,
    recentSettlements: [
      { date: 'Jun 24', amount: 1820000, status: 'Matched' },
      { date: 'Jun 17', amount: 1750000, status: 'Matched' }
    ]
  },
  Instamart: {
    healthTrend: 'worse',
    insight: 'Critical health status. Average payment delay spiked to 14 days and ₹14.8L is outstanding. High logistics penalty rate.',
    avgDeductionRate: 5.8,
    recoverySuccess: 62,
    openDisputesCount: 28,
    recentSettlements: [
      { date: 'Jun 18', amount: 840000, status: 'Short' },
      { date: 'Jun 04', amount: 920000, status: 'Short' }
    ]
  },
  Amazon: {
    healthTrend: 'stable',
    insight: 'Stable financial performance. Settlements are on time, but return-related deductions remain consistently at 2%.',
    avgDeductionRate: 2.0,
    recoverySuccess: 88,
    openDisputesCount: 15,
    recentSettlements: [
      { date: 'Jun 25', amount: 3450000, status: 'Matched' },
      { date: 'Jun 18', amount: 3220000, status: 'Matched' }
    ]
  },
  Flipkart: {
    healthTrend: 'worse',
    insight: 'Deteriorating cash flow. ₹12.9L locked in disputes regarding SLA breaches. Recommend escalating to account manager.',
    avgDeductionRate: 4.5,
    recoverySuccess: 71,
    openDisputesCount: 34,
    recentSettlements: [
      { date: 'Jun 22', amount: 1120000, status: 'Short' },
      { date: 'Jun 15', amount: 1050000, status: 'Short' }
    ]
  }
};

const B2BPlatforms: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const platform = b2bPlatforms[selectedTab];
  const ext = extendedData[platform.name as keyof typeof extendedData];

  // Mock activity feed for the platform
  const activity = useMemo(() => {
    return b2bHomeFeed.filter(a => a.platform === platform.name)
      .concat(b2bHomeFeed.map(a => ({...a, id: a.id + '2', platform: platform.name as any})).slice(0, 2));
  }, [platform.name]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', height: '100%' }}>
      {/* Platform Selector Tabs */}
      <Box sx={{ mb: 4, borderBottom: '1px solid #e5e7eb' }}>
        <Tabs 
          value={selectedTab} 
          onChange={(e, v) => setSelectedTab(v)}
          TabIndicatorProps={{ sx: { bgcolor: platformColors[platform.name as keyof typeof platformColors], height: 3 } }}
        >
          {b2bPlatforms.map((p, i) => (
            <Tab 
              key={p.name} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: platformColors[p.name as keyof typeof platformColors] }} />
                  <Typography sx={{ fontWeight: selectedTab === i ? 800 : 600, color: selectedTab === i ? '#111' : '#6b7280' }}>
                    {p.name}
                  </Typography>
                </Box>
              } 
            />
          ))}
        </Tabs>
      </Box>

      {/* Platform Workspace */}
      <Box>
        {/* AI Health Insight Header */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: ext.healthTrend === 'worse' ? '#fecaca' : ext.healthTrend === 'better' ? '#bbf7d0' : '#e5e7eb', bgcolor: ext.healthTrend === 'worse' ? '#fef2f2' : ext.healthTrend === 'better' ? '#f0fdf4' : '#fafafa', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: '#fff', color: ext.healthTrend === 'worse' ? '#ef4444' : ext.healthTrend === 'better' ? '#10b981' : '#6b7280', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {ext.healthTrend === 'worse' ? <TrendingDownIcon /> : ext.healthTrend === 'better' ? <TrendingUpIcon /> : <TimeIcon />}
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AIIcon sx={{ fontSize: 16, color: ext.healthTrend === 'worse' ? '#991b1b' : ext.healthTrend === 'better' ? '#166534' : '#374151' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: ext.healthTrend === 'worse' ? '#991b1b' : ext.healthTrend === 'better' ? '#166534' : '#374151' }}>
                  Financial Health Insight
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '1.1rem', color: ext.healthTrend === 'worse' ? '#7f1d1d' : ext.healthTrend === 'better' ? '#14532d' : '#111', fontWeight: 500, lineHeight: 1.5 }}>
                {ext.insight}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 6 Key Metrics Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Outstanding</Typography>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#111' }}>{fmt(platform.outstanding)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Recoverable Pipeline</Typography>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e42' }}>{fmt(platform.inDispute)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Open Disputes</Typography>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>{ext.openDisputesCount}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Avg Payment Delay</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: platform.avgSettlementDays > 7 ? '#ef4444' : '#10b981' }}>{platform.avgSettlementDays}</Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>days</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Avg Deduction Rate</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: ext.avgDeductionRate > 3 ? '#ef4444' : '#111' }}>{ext.avgDeductionRate}%</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af' }}>of GMV</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Recovery Success</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: ext.recoverySuccess > 80 ? '#10b981' : '#f59e42' }}>{ext.recoverySuccess}%</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af' }}>win rate</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Activity & Settlements */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#111', mb: 2 }}>Recent Activity</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activity.map((item, idx) => (
                <Paper key={idx} sx={{ p: 2, borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>{item.title}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.timeAgo}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.85rem', color: '#4b5563' }}>{item.description}</Typography>
                </Paper>
              ))}
              {activity.length === 0 && (
                <Typography sx={{ fontSize: '0.85rem', color: '#6b7280' }}>No recent anomalies for this platform.</Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#111', mb: 2 }}>Recent Settlements</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ext.recentSettlements.map((set, idx) => (
                <Paper key={idx} sx={{ p: 2, borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#111' }}>{fmt(set.amount)}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 0.2 }}>{set.date}</Typography>
                  </Box>
                  <Chip 
                    label={set.status} 
                    size="small" 
                    icon={set.status === 'Matched' ? <CheckIcon fontSize="small" /> : <WarningIcon fontSize="small" />}
                    sx={{ 
                      fontSize: '0.65rem', fontWeight: 700, height: 22,
                      bgcolor: set.status === 'Matched' ? '#dcfce7' : '#fee2e2',
                      color: set.status === 'Matched' ? '#166534' : '#991b1b'
                    }} 
                  />
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default B2BPlatforms;
