import React from 'react';
import { Box, Typography } from '@mui/material';
import { useWorkspace, WorkspaceMode } from '../contexts/WorkspaceContext';
import { useNavigate } from 'react-router-dom';

const WorkspaceSwitcher: React.FC = () => {
  const { workspace, setWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const handleSwitch = (mode: WorkspaceMode) => {
    if (mode === workspace) return;
    setWorkspace(mode);
    // Navigate to the default page of the target workspace
    if (mode === 'b2b') {
      navigate('/b2b/overview');
    } else {
      navigate('/marketplace-reconciliation');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        bgcolor: '#f3f4f6',
        borderRadius: '8px',
        p: '3px',
        mx: 1.5,
        mb: 1.5,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {(['b2b', 'b2c'] as WorkspaceMode[]).map((mode) => {
        const isActive = workspace === mode;
        return (
          <Box
            key={mode}
            onClick={() => handleSwitch(mode)}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: '5px',
              px: 1,
              borderRadius: '6px',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
              bgcolor: isActive ? '#fff' : 'transparent',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
              '&:hover': {
                bgcolor: isActive ? '#fff' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#111' : '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                userSelect: 'none',
              }}
            >
              {mode === 'b2b' ? 'B2B' : 'B2C'}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default WorkspaceSwitcher;
