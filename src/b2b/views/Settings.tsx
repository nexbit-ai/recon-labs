import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space } from '../theme/b2bTokens';
import { PageTitle, Pressable } from '../components/primitives';
import ContractsTab from './settings/ContractsTab';
import UploadTab from './settings/UploadTab';
import IntegrationsTab from '../../pages/Integrations';
import { SyncOutlined } from '@mui/icons-material';
import UploadSettlementModal from '../components/UploadSettlementModal';

type SettingsTab = 'contracts' | 'upload' | 'integrations';

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'contracts', label: 'Contracts & Rates' },
  { key: 'upload', label: 'Upload Data' },
  { key: 'integrations', label: 'Data Sources' },
];

const Settings: React.FC = () => {
  const reduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState<SettingsTab>('contracts');
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <Box sx={{ mb: `${space.xl}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `${space.lg}px` }}>
        <PageTitle>Settings</PageTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
          {activeTab === 'upload' && (
            <Button
              onClick={() => setUploadOpen(true)}
              startIcon={
                <SyncOutlined
                  sx={{
                    fontSize: 18,
                    animation: uploadOpen && !reduce ? 'b2bspin 1s linear infinite' : 'none',
                    '@keyframes b2bspin': { to: { transform: 'rotate(360deg)' } },
                  }}
                />
              }
              sx={{
                bgcolor: colors.accent,
                color: colors.paper,
                fontSize: 13,
                fontWeight: 600,
                px: `${space.lg}px`,
                height: 34,
                '&:hover': { bgcolor: colors.accentHover },
              }}
            >
              Sync
            </Button>
          )}
          <Box sx={{ display: 'inline-flex', border: hairline }}>
          {TABS.map((t, i) => {
            const active = activeTab === t.key;
            return (
              <Pressable
                key={t.key}
                role="tab"
                selected={active}
                onClick={() => setActiveTab(t.key)}
                sx={{
                  px: `${space.lg}px`, height: 34, display: 'flex', alignItems: 'center',
                  cursor: active ? 'default' : 'pointer',
                  borderLeft: i === 0 ? 'none' : hairline,
                  bgcolor: active ? colors.ink : 'transparent',
                  color: active ? colors.paper : colors.grey700,
                  fontSize: 13, fontWeight: 600,
                  '&:hover': active ? undefined : { bgcolor: colors.grey100, color: colors.ink },
                }}
              >
                {t.label}
              </Pressable>
            );
          })}
          </Box>
        </Box>
      </Box>

      {/* Render the active tab's content */}
      <Box sx={{ mt: `${space.xl}px` }}>
        {activeTab === 'contracts' && (
          <Box sx={{ '& .b2b-page-title': { display: 'none' } }}>
            <ContractsTab />
          </Box>
        )}
        {activeTab === 'upload' && (
          <Box sx={{ '& .b2b-page-title': { display: 'none' } }}>
            <UploadTab onOpenModal={() => setUploadOpen(true)} />
          </Box>
        )}
        {activeTab === 'integrations' && (
          <Box sx={{ mt: `-${space.xl}px`, '& .MuiContainer-root': { px: 0, maxWidth: 'none' }, '& header': { display: 'none' } }}>
            <IntegrationsTab />
          </Box>
        )}
      </Box>
      <UploadSettlementModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Box>
  );
};

export default Settings;
