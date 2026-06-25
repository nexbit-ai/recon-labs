import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Chip, Grid, Drawer, IconButton, Button, Avatar, Divider,
  TextField
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AIIcon,
  InsertDriveFileOutlined as FileIcon,
  Send as SendIcon,
  CheckCircleOutline as CheckIcon,
  WarningAmber as WarningIcon,
  PersonAddOutlined as AssignIcon,
  ForumOutlined as DiscussionIcon,
  HistoryOutlined as HistoryIcon,
} from '@mui/icons-material';
import { b2bRecoveries, platformColors, Recovery } from '../../data/b2bMockData';

const fmt = (v: number) => {
  return `₹${v.toLocaleString('en-IN')}`;
};

const statusStyle: Record<string, { bg: string; fg: string }> = {
  'Recovered': { bg: '#dcfce7', fg: '#166534' },
  'In Progress': { bg: '#e0e7ff', fg: '#3730a3' },
  'Filed': { bg: '#fef3c7', fg: '#92400e' },
  'Identified': { bg: '#f3f4f6', fg: '#374151' },
};

const B2BRecoveries: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedRecovery = useMemo(() => {
    return b2bRecoveries.find(r => r.id === selectedId) || null;
  }, [selectedId]);

  return (
    <Box sx={{ display: 'flex', height: '100%', bgcolor: '#fff' }}>
      {/* Main List View */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflowY: 'auto', maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 28, letterSpacing: -0.5, color: '#111' }}>
              Recoveries
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#6b7280', mt: 0.5 }}>
              Active recovery tickets requiring attention.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Pipeline
              </Typography>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', lineHeight: 1.1 }}>
                {fmt(b2bRecoveries.reduce((acc, r) => acc + r.amount, 0))}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* List Header */}
        <Box sx={{ display: 'flex', px: 3, pb: 1.5, borderBottom: '1px solid #f0f0f0' }}>
          <Box sx={{ flex: 1 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</Typography></Box>
          <Box sx={{ width: 120 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</Typography></Box>
          <Box sx={{ width: 100 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</Typography></Box>
          <Box sx={{ width: 120 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</Typography></Box>
          <Box sx={{ width: 180 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended</Typography></Box>
          <Box sx={{ width: 120, textAlign: 'right' }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</Typography></Box>
        </Box>

        {/* List Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {b2bRecoveries.map((r) => (
            <Box
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              sx={{
                display: 'flex', px: 3, py: 2.5, 
                borderBottom: '1px solid #f9fafb',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: '#f9fafb' },
                ...(selectedId === r.id ? { bgcolor: '#f5f3ff', borderLeft: '3px solid #6c63ff', paddingLeft: '21px' } : { borderLeft: '3px solid transparent' })
              }}
            >
              <Box sx={{ flex: 1, pr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280' }}>{r.id}</Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#111' }}>{r.type}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description}</Typography>
              </Box>
              <Box sx={{ width: 120, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: platformColors[r.platform] }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.platform}</Typography>
              </Box>
              <Box sx={{ width: 100 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: r.confidence >= 90 ? '#10b981' : '#f59e42' }}>
                  {r.confidence}%
                </Typography>
              </Box>
              <Box sx={{ width: 120 }}>
                <Chip label={r.status} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700, height: 22, ...statusStyle[r.status] }} />
              </Box>
              <Box sx={{ width: 180 }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>{r.recommendedAction}</Typography>
              </Box>
              <Box sx={{ width: 120, textAlign: 'right' }}>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800 }}>{fmt(r.amount)}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Detail Drawer (Ticket View) */}
      <Drawer
        anchor="right"
        open={Boolean(selectedRecovery)}
        onClose={() => setSelectedId(null)}
        PaperProps={{ sx: { width: { xs: '100%', md: 640 }, bgcolor: '#fafafa', borderLeft: '1px solid #e5e7eb' } }}
      >
        {selectedRecovery && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 4, bgcolor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>{selectedRecovery.id}</Typography>
                  <Chip label={selectedRecovery.status} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700, height: 20, ...statusStyle[selectedRecovery.status] }} />
                </Box>
                <IconButton size="small" onClick={() => setSelectedId(null)} sx={{ m: -1 }}><CloseIcon fontSize="small" /></IconButton>
              </Box>
              
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', mb: 1, letterSpacing: '-0.02em' }}>{selectedRecovery.type}</Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#4b5563', mb: 4, lineHeight: 1.5 }}>{selectedRecovery.description}</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Amount</Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#111', mt: 0.5 }}>{fmt(selectedRecovery.amount)}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Platform</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: platformColors[selectedRecovery.platform] }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedRecovery.platform}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Assignee</Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, mt: 0.5, color: selectedRecovery.assignee ? '#111' : '#9ca3af' }}>
                    {selectedRecovery.assignee || 'Unassigned'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Confidence</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, mt: 0.5, color: selectedRecovery.confidence >= 90 ? '#10b981' : '#f59e42' }}>
                    {selectedRecovery.confidence}% Match
                  </Typography>
                </Grid>
              </Grid>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 4, flexWrap: 'wrap' }}>
                <Button variant="contained" size="small" sx={{ bgcolor: '#111', textTransform: 'none', fontWeight: 600, px: 2.5, py: 0.8, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#374151', boxShadow: 'none' } }}>
                  Raise Dispute
                </Button>
                <Button variant="outlined" size="small" sx={{ borderColor: '#d1d5db', color: '#374151', textTransform: 'none', fontWeight: 600, px: 2.5, py: 0.8, borderRadius: 2, '&:hover': { borderColor: '#9ca3af', bgcolor: 'transparent' } }}>
                  Accept Deduction
                </Button>
                <Button variant="outlined" size="small" sx={{ borderColor: '#d1d5db', color: '#374151', textTransform: 'none', fontWeight: 600, px: 2.5, py: 0.8, borderRadius: 2, '&:hover': { borderColor: '#9ca3af', bgcolor: 'transparent' } }}>
                  Request Documents
                </Button>
                <Button variant="outlined" size="small" sx={{ borderColor: '#d1d5db', color: '#374151', textTransform: 'none', fontWeight: 600, px: 2.5, py: 0.8, borderRadius: 2, '&:hover': { borderColor: '#9ca3af', bgcolor: 'transparent' } }}>
                  Assign
                </Button>
              </Box>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
              
              {/* AI Reasoning */}
              <Paper sx={{ p: 2.5, mb: 4, borderRadius: 3, border: '1px solid #e9d5ff', bgcolor: '#faf5ff', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <AIIcon sx={{ fontSize: 18, color: '#7c3aed' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Reasoning</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.9rem', color: '#4c1d95', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {selectedRecovery.aiReasoning}
                </Typography>
              </Paper>

              {/* Supporting Evidence */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#111', mb: 2 }}>Supporting Evidence</Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {selectedRecovery.evidence.map((ev, i) => (
                    <Chip key={i} icon={<FileIcon fontSize="small" sx={{ color: '#6b7280' }} />} label={ev} variant="outlined" sx={{ borderRadius: 2, borderColor: '#d1d5db', bgcolor: '#fff', fontSize: '0.8rem', fontWeight: 500, py: 1 }} />
                  ))}
                  {selectedRecovery.relatedDocuments.map((doc, i) => (
                    <Chip key={i} icon={<FileIcon fontSize="small" sx={{ color: '#6b7280' }} />} label={doc} variant="outlined" sx={{ borderRadius: 2, borderColor: '#d1d5db', bgcolor: '#fff', fontSize: '0.8rem', fontWeight: 500, py: 1 }} />
                  ))}
                  {selectedRecovery.evidence.length === 0 && selectedRecovery.relatedDocuments.length === 0 && (
                    <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>No supporting documents found.</Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 4, borderColor: '#e5e7eb' }} />

              <Grid container spacing={4}>
                {/* Discussion */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <DiscussionIcon sx={{ fontSize: 20, color: '#6b7280' }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#111' }}>Discussion</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {selectedRecovery.discussion.map((msg) => (
                      <Box key={msg.id} sx={{ display: 'flex', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: msg.user.includes('AI') ? '#7c3aed' : '#f3f4f6', color: msg.user.includes('AI') ? '#fff' : '#111', fontSize: '0.8rem', fontWeight: 700 }}>
                          {msg.user.includes('AI') ? <AIIcon sx={{ fontSize: 16 }} /> : msg.user[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>{msg.user}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af' }}>{msg.time}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.5 }}>{msg.text}</Typography>
                        </Box>
                      </Box>
                    ))}
                    {selectedRecovery.discussion.length === 0 && (
                      <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>No discussion yet.</Typography>
                    )}
                  </Box>
                  
                  {/* Reply Box */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                    <TextField 
                      fullWidth 
                      placeholder="Add a comment..." 
                      variant="outlined" 
                      size="small"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff', fontSize: '0.9rem' } }}
                    />
                    <IconButton sx={{ bgcolor: '#111', color: '#fff', borderRadius: 2, '&:hover': { bgcolor: '#374151' } }}>
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>

                {/* Timeline */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <HistoryIcon sx={{ fontSize: 20, color: '#6b7280' }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#111' }}>Timeline</Typography>
                  </Box>
                  <Box sx={{ position: 'relative', ml: 1 }}>
                    <Box sx={{ position: 'absolute', top: 8, bottom: 8, left: 3, width: 2, bgcolor: '#e5e7eb' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {selectedRecovery.timeline.map((event) => (
                        <Box key={event.id} sx={{ display: 'flex', gap: 1.5, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#d1d5db', mt: 0.6, border: '2px solid #fafafa' }} />
                          <Box>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>{event.action}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 0.2 }}>{event.date} · {event.user}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default B2BRecoveries;
