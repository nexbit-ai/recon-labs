// B2B Channels - Cosmix channel list with click-through to channel drilldown.
// Shows channel name, model, receivable, received, outstanding, issues.
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { ArrowForwardOutlined } from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, ChannelTag, ColumnLabel, PageTitle, Pressable } from '../components/primitives';
import { formatRupees, formatINRShort, formatPercent } from '../lib/format';
import { channelPerformance, type ChannelPerformance } from '../mock';

const GRID = '160px minmax(100px, 1fr) 116px 116px 116px 80px 36px';

const Channels: React.FC = () => {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { platformFilter } = useOutletContext<{ platformFilter: string }>();

  const filterKey = platformFilter.toLowerCase().replace(/\s+/g, '').replace('–', '');
  const rows: ChannelPerformance[] = filterKey === 'all'
    ? channelPerformance
    : channelPerformance.filter((c) => {
        const channelKey = c.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
        return channelKey.includes(filterKey) || filterKey.includes(channelKey);
      });

  const handleClick = (channel: string) => {
    const key = channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
    navigate(`/b2b/channels/${key}`);
  };

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <PageTitle>Channel Overview</PageTitle>

      <Box sx={{ ...cardSx, overflowX: 'auto' }}>
        <Box sx={{ minWidth: 800 }}>
          {/* Header */}
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
            <ColumnLabel>Channel</ColumnLabel>
            <ColumnLabel>Model</ColumnLabel>
            <ColumnLabel align="right">Receivable</ColumnLabel>
            <ColumnLabel align="right">Received</ColumnLabel>
            <ColumnLabel align="right">Outstanding</ColumnLabel>
            <ColumnLabel align="right">Net %</ColumnLabel>
            <ColumnLabel />
          </Box>

          {/* Rows */}
          {rows.map((channel, idx) => {
            const receivable = channel.settled + channel.leakage;
            const outstanding = channel.leakage;
            return (
              <Pressable
                key={channel.channel}
                ariaLabel={`View ${channel.channel} details`}
                onClick={() => handleClick(channel.channel)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  alignItems: 'center',
                  gap: `${space.lg}px`,
                  px: `${space.xl}px`,
                  minHeight: 60,
                  borderBottom: idx < rows.length - 1 ? hairline : 'none',
                  transition: 'background-color 0.12s ease',
                  '&:hover': { bgcolor: colors.grey100 },
                }}
              >
                <ChannelTag name={channel.channel} />
                <Typography sx={{ fontSize: 13, color: colors.grey700 }}>
                  {channel.channel === 'Blinkit' || channel.channel === 'Zepto'
                    ? 'Quick-commerce (SOR)'
                    : channel.channel === 'Reliance'
                    ? 'Modern Trade'
                    : 'Direct Supply'}
                </Typography>
                <Typography sx={{ textAlign: 'right', fontSize: type.body.fontSize, color: colors.ink, ...tabularNums }}>
                  {formatINRShort(receivable)}
                </Typography>
                <Typography sx={{ textAlign: 'right', fontSize: type.body.fontSize, color: colors.ink, ...tabularNums }}>
                  {formatINRShort(channel.settled)}
                </Typography>
                <Typography
                  sx={{
                    textAlign: 'right',
                    fontSize: type.body.fontSize,
                    fontWeight: 600,
                    color: outstanding > 0 ? colors.accent : colors.grey500,
                    ...tabularNums,
                  }}
                >
                  {formatINRShort(outstanding)}
                </Typography>
                <Typography sx={{ textAlign: 'right', fontSize: type.body.fontSize, color: colors.ink, ...tabularNums }}>
                  {formatPercent(channel.netRealisationPct)}
                </Typography>
                <ArrowForwardOutlined sx={{ fontSize: 18, color: colors.grey500, justifySelf: 'end' }} />
              </Pressable>
            );
          })}

          {rows.length === 0 && (
            <Box sx={{ p: `${space.xl}px` }}>
              <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey500 }}>
                No channels match the current filter.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Channels;
