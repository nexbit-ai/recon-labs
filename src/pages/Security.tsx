import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ListAltIcon from '@mui/icons-material/ListAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SearchIcon from '@mui/icons-material/Search';
import TimelineIcon from '@mui/icons-material/Timeline';

const securityFeatures = [
  {
    icon: LockIcon,
    iconProps: { sx: { fontSize: 32, color: 'primary.main' } },
    title: 'Bank-Level Security',
    desc: 'All your financial data is protected with robust encryption—both in transit (TLS) and at rest (AES-256). This ensures that sensitive information is always locked away from unauthorized access.',
  },
  {
    icon: AssignmentIndIcon,
    iconProps: { sx: { fontSize: 32, color: 'primary.main' } },
    title: 'Strict Access Controls',
    desc: 'Only the right people see the right data. Our platform uses role-based permissions, so your team members access only what they need, reducing the risk of internal data leaks.',
  },
  {
    icon: ListAltIcon,
    iconProps: { sx: { fontSize: 32, color: 'primary.main' } },
    title: 'Comprehensive Audit Logs',
    desc: 'Every action taken within the system is logged.',
  },
  {
    icon: VerifiedUserIcon,
    iconProps: { sx: { fontSize: 32, color: 'primary.main' } },
    title: 'Regulatory Compliance',
    desc: 'We are committed to meeting industry standards such as SOC 2 and ISO 27001, and we ensure GDPR compliance is always top of mind. Additionally, we adhere to all guidelines of the Digital Personal Data Protection (DPDP) Act, 2023, ensuring your data is handled with the highest standards of privacy and protection.',
  },
];

const guardrails = [
  {
    icon: SupervisorAccountIcon,
    iconProps: { sx: { fontSize: 32, color: 'primary.main' } },
    title: 'Human-in-the-Loop',
    desc: 'Critical decisions are reviewed by humans, ensuring that no AI output is accepted blindly.',
  },
  {
    icon: SearchIcon,
    iconProps: { sx: { fontSize: 32, color: 'primary.main' } },
    title: 'Explainable AI',
    desc: 'We provide clear explanations for AI-driven decisions, so users can understand and trust the process.',
  },
  {
    icon: TimelineIcon,
    iconProps: { sx: { fontSize: 32, color: 'primary.main' } },
    title: 'Real-Time Monitoring',
    desc: 'Continuous monitoring detects and responds to anomalies quickly.',
  },
];

const Security: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      {/* Page Header */}
  <Box sx={{ mb: 5, textAlign: 'left' }}>
        <SecurityIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
          Security & Trust
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
          Your data is protected by industry-leading security, privacy, and compliance standards.
        </Typography>
      </Box>

      {/* Security Features Section */}
      <Box sx={{ mb: 6 }}>
  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 4, textAlign: 'left' }}>
          Data Protection & Privacy
        </Typography>
        <Grid container spacing={3}>
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Grid item xs={12} md={6} key={feature.title}>
                <Paper elevation={0} sx={{ p: 3, h: '100%', border: '1px solid #e5e7eb', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Icon {...feature.iconProps} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Guardrails Section */}
      <Box sx={{ mb: 6 }}>
  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 4, textAlign: 'left' }}>
          AI Guardrails & Human Oversight
        </Typography>
        <Grid container spacing={3}>
          {guardrails.map((guardrail) => {
            const Icon = guardrail.icon;
            return (
              <Grid item xs={12} md={4} key={guardrail.title}>
                <Paper elevation={0} sx={{ p: 3, h: '100%', border: '1px solid #e5e7eb', borderRadius: 2 }}>
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                    <Icon {...guardrail.iconProps} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mt: 2, mb: 1, color: 'text.primary' }}>
                      {guardrail.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {guardrail.desc}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default Security; 