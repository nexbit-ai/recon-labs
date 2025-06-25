import React from 'react';
import { Box, Typography, Paper, Stack, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon, Insights as InsightsIcon, Flag as FlagIcon, Bolt as BoltIcon, Timeline as TimelineIcon, Info as InfoIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const agents = [
  {
    name: 'AI Reconciliation Agent',
    icon: <AutoAwesomeIcon color="primary" />,
    features: [
      'Ingest data from banks, ERP, Excel',
      'Automatic matching',
      'Discrepancy flagging',
      'Agents flag accounts that need your attention, and share actionable insights to help you resolve discrepancies, fast.'
    ],
    path: '/ai-reconciliation',
  },
  {
    name: 'Analysis Agent',
    icon: <InsightsIcon color="secondary" />,
    features: [
      'Analyze fluctuations and flag variances based on thresholds you select',
      'Variance explanations: Get instant context for variances in your data, saving your team hours of manual work.'
    ],
  },
];

const AIWorkflows: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>AI Workflows</Typography>
      <Stack spacing={3}>
        {agents.map((agent, idx) => (
          <Paper
            key={idx}
            sx={{
              p: 3,
              borderRadius: 3,
              cursor: agent.path ? 'pointer' : 'default',
              '&:hover': agent.path ? { boxShadow: 3 } : {},
            }}
            onClick={() => agent.path && navigate(agent.path)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {agent.icon}
              <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>{agent.name}</Typography>
            </Box>
            <List>
              {agent.features.map((feature, i) => (
                <ListItem key={i} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {idx === 0 ? (i === 2 ? <FlagIcon color="warning" /> : <BoltIcon color="success" />) : (i === 0 ? <TimelineIcon color="info" /> : <InfoIcon color="secondary" />)}
                  </ListItemIcon>
                  <ListItemText primary={feature} />
                </ListItem>
              ))}
            </List>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default AIWorkflows; 