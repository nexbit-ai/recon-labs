import React from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { ExpandMoreOutlined, KeyboardArrowRightOutlined } from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, ChannelTag, ColumnLabel, Pressable, SectionTitle } from '../components/primitives';
import { formatRupees } from '../lib/format';
import { StatusBadge } from '../components/StatusBadge';
import { ActionPipeline } from '../components/ActionPipeline';
import { ActionTimeline } from '../components/ActionTimeline';
import {
  actionItems,
  actionPipeline,
  headlineByKey,
} from '../mock';

const GRID = '1fr 140px 140px 140px 160px 40px';

const Disputes: React.FC = () => {
  const reduce = useReducedMotion();
  const context = useOutletContext<{ platformFilter: string }>() || { platformFilter: 'all' };
  const [searchParams] = useSearchParams();
  const urlId = searchParams.get('id');

  const [expandedId, setExpandedId] = React.useState<string | null>(urlId);

  const platformFilter = context.platformFilter;
  const isAll = platformFilter === 'all';

  const items = isAll
    ? actionItems
    : actionItems.filter(i => {
        const fRaw = platformFilter.toLowerCase().replace(/\s+/g, '').replace('–', '');
        const cRaw = i.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
        return cRaw.includes(fRaw) || fRaw.includes(cRaw);
      });

  const recoveredYtd = headlineByKey('recoveredYtd').value;

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: `${space.xl}px` }}>
        <Box>
          <Typography sx={{ ...type.label, color: colors.grey500, mb: '4px' }}>
            {platformFilter === 'all' ? 'All Channels' : platformFilter.charAt(0).toUpperCase() + platformFilter.slice(1)} · August 2026
          </Typography>
        </Box>
      </Box>

      {/* ── PIPELINE SUMMARY ── */}
      <Box sx={{ ...cardSx, p: 0, mb: `${space.xl}px` }}>
        <Box sx={{ p: `${space.xl}px`, borderBottom: hairline }}>
          <SectionTitle>Action Pipeline</SectionTitle>
        </Box>
        <Box sx={{ p: `${space.xl}px` }}>
          <ActionPipeline pipeline={actionPipeline} recoveredAmount={recoveredYtd} />
        </Box>
      </Box>

      {/* ── ACTION ITEMS LIST ── */}
      <Box sx={{ ...cardSx, p: 0, overflowX: 'auto' }}>
        <Box sx={{ p: `${space.xl}px`, borderBottom: hairline, display: 'flex', justifyContent: 'space-between' }}>
          <SectionTitle>Action Centre ({items.length})</SectionTitle>
        </Box>
        <Box sx={{ minWidth: 860 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: GRID,
              alignItems: 'center',
              gap: `${space.lg}px`,
              px: `${space.xl}px`,
              py: `${space.md}px`,
              bgcolor: colors.grey100,
              borderBottom: hairline,
            }}
          >
            <ColumnLabel>Issue</ColumnLabel>
            <ColumnLabel>Channel</ColumnLabel>
            <ColumnLabel align="right">Amount</ColumnLabel>
            <ColumnLabel align="right">Days Open</ColumnLabel>
            <ColumnLabel align="right">Status</ColumnLabel>
            <Box />
          </Box>

          {items.map((item, idx) => {
            const isExpanded = expandedId === item.id;
            return (
              <Box key={item.id} sx={{ borderBottom: idx < items.length - 1 ? hairline : 'none' }}>
                <Pressable
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: GRID,
                    alignItems: 'center',
                    gap: `${space.lg}px`,
                    px: `${space.xl}px`,
                    py: `${space.md}px`,
                    minHeight: 64,
                    bgcolor: isExpanded ? colors.grey100 : 'transparent',
                    transition: 'background-color 0.12s ease',
                    '&:hover': { bgcolor: colors.grey100 },
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>
                      {item.id} — {item.issue}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: colors.grey500, mt: '2px' }}>
                      Ref: {item.relatedRef}
                    </Typography>
                  </Box>
                  <Box>
                    <ChannelTag name={item.channel} />
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#991B1B', textAlign: 'right', ...tabularNums }}>
                    {formatRupees(item.amount)}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: colors.grey700, textAlign: 'right', ...tabularNums }}>
                    {item.daysOpen} days
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <StatusBadge status={item.status} />
                  </Box>
                  <ExpandMoreOutlined
                    sx={{
                      fontSize: 20,
                      color: colors.grey500,
                      justifySelf: 'end',
                      transition: reduce ? 'none' : 'transform 0.18s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </Pressable>
                
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <Box sx={{ p: `${space.xl}px`, bgcolor: colors.grey100, borderTop: hairline }}>
                        <Box sx={{ display: 'flex', gap: `${space.xl}px`, flexWrap: 'wrap' }}>
                          <Box sx={{ flex: 1, minWidth: 300 }}>
                            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.sm}px` }}>Urgency</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
                              {item.urgency}
                            </Typography>
                            
                            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.sm}px` }}>Next Action</Typography>
                            <Typography sx={{ fontSize: 13, color: colors.ink }}>
                              {item.nextAction}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 2, minWidth: 400 }}>
                            {item.history && item.history.length > 0 ? (
                              <Box sx={{ mt: `-${space.xl}px` }}>
                                <ActionTimeline history={item.history} />
                              </Box>
                            ) : (
                              <Typography sx={{ fontSize: 13, color: colors.grey500 }}>No timeline available.</Typography>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: `${space.lg}px`, pt: `${space.md}px`, borderTop: hairline }}>
                          <Button
                            disableElevation
                            sx={{
                              bgcolor: colors.ink,
                              color: colors.paper,
                              fontSize: 13,
                              fontWeight: 600,
                              px: `${space.xl}px`,
                              py: `${space.sm}px`,
                              borderRadius: 0,
                              '&:hover': { bgcolor: colors.inkHover },
                            }}
                          >
                            Resolve manually →
                          </Button>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            );
          })}
          {items.length === 0 && (
            <Box sx={{ p: `${space.xl}px`, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 14, color: colors.grey500 }}>No actions needed for this channel.</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Disputes;
