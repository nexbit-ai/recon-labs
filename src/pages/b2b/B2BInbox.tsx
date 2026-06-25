import React from 'react';
import { Box, Paper, Typography, Grid, Button, Chip } from '@mui/material';
import {
  CloudUploadOutlined as UploadIcon,
  ContentCopyOutlined as CopyIcon,
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  InsertDriveFileOutlined as FileIcon
} from '@mui/icons-material';
import { b2bInboxStats, b2bInboxDocuments } from '../../data/b2bMockData';

const fmt = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const B2BInbox: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 28, letterSpacing: -0.5, color: '#111' }}>
            AI Inbox
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#6b7280', mt: 0.5 }}>
            Drop files or forward emails. The AI handles the rest.
          </Typography>
        </Box>
      </Box>

      {/* Input Zone */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              borderRadius: 4,
              border: '2px dashed #d1d5db',
              bgcolor: '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.2s, background-color 0.2s',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#6c63ff',
                bgcolor: '#f5f3ff'
              }
            }}
          >
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', mb: 2 }}>
              <UploadIcon sx={{ fontSize: 32, color: '#6c63ff' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111', mb: 0.5 }}>
              Drag & Drop files or folders
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#6b7280', mb: 3 }}>
              Supports PDF, Excel, CSV, XML, and ERP exports
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#111',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                '&:hover': { bgcolor: '#374151' }
              }}
            >
              Browse Files
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 4,
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111', mb: 1 }}>
              Email Forwarding
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#6b7280', mb: 3, lineHeight: 1.5 }}>
              Forward vendor emails, platform reports, or internal invoices directly to your AI inbox.
            </Typography>
            
            <Box sx={{ p: 1.5, bgcolor: '#f3f4f6', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>
                inbox-kp-kapiva@nexbit.ai
              </Typography>
              <Button size="small" sx={{ minWidth: 0, p: 0.5, color: '#6b7280' }}>
                <CopyIcon fontSize="small" />
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* AI Processing Status */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', mb: 2 }}>
          Today's Processing
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AIIcon sx={{ fontSize: 18, color: '#6c63ff' }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#111' }}>
                  Auto-Detected Documents
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {b2bInboxStats.detected.map(item => (
                  <Grid item xs={6} sm={4} key={item.type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#111' }}>
                        {item.count}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>
                        {item.type}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Auto-Matched
                    </Typography>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1, mt: 0.5 }}>
                      {b2bInboxStats.matchedRate}%
                    </Typography>
                  </Box>
                  <CheckIcon sx={{ fontSize: 32, color: '#10b981', opacity: 0.2 }} />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fffbfb', borderColor: '#fecaca' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Needs Review
                    </Typography>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', lineHeight: 1.1, mt: 0.5 }}>
                      {b2bInboxStats.needsReviewRate}%
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 32, color: '#ef4444', opacity: 0.2 }} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Documents */}
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', mb: 2 }}>
          Recently Received
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {b2bInboxDocuments.map((doc) => (
            <Paper
              key={doc.id}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: doc.status === 'Needs Review' ? '#fecaca' : '#e5e7eb',
                bgcolor: doc.status === 'Needs Review' ? '#fef2f2' : '#fff',
                boxShadow: 'none',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: doc.status === 'Needs Review' ? '#fca5a5' : '#d1d5db' }
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: doc.status === 'Needs Review' ? '#fee2e2' : '#f3f4f6', color: doc.status === 'Needs Review' ? '#ef4444' : '#6b7280' }}>
                  <FileIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#111' }}>
                        {doc.filename}
                      </Typography>
                      <Chip 
                        label={doc.type} 
                        size="small" 
                        sx={{ fontSize: '0.65rem', fontWeight: 600, height: 20, bgcolor: '#e0e7ff', color: '#3730a3' }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {doc.amount && (
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
                          {fmt(doc.amount)}
                        </Typography>
                      )}
                      <Chip
                        label={doc.status}
                        size="small"
                        sx={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          height: 20,
                          bgcolor: doc.status === 'Needs Review' ? '#fee2e2' : '#dcfce7',
                          color: doc.status === 'Needs Review' ? '#991b1b' : '#166534'
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: doc.explanation ? 1.5 : 0 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {doc.source}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      •
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {doc.receivedAt}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      •
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: doc.confidence < 80 ? '#b45309' : '#10b981' }}>
                      {doc.confidence}% Confidence
                    </Typography>
                  </Box>

                  {doc.explanation && (
                    <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <AIIcon sx={{ fontSize: 16, color: '#ef4444', mt: 0.2 }} />
                      <Typography sx={{ fontSize: '0.8rem', color: '#991b1b', lineHeight: 1.4 }}>
                        {doc.explanation}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default B2BInbox;
