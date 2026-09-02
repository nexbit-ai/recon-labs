import React from 'react';
import { Box, Typography } from '@mui/material';

interface POSummaryCardProps {
  label: string;
  value: string;
  trend?: string;
  trendIsPositive?: boolean; // true = green (↗), false = yellow/amber (↘)
  trendSubtitle?: string;
  progress?: {
    percent: number;
    label: string;
  };
  footer?: string;
}

export const POSummaryCard: React.FC<POSummaryCardProps> = ({
  label,
  value,
  trend,
  trendIsPositive = true,
  trendSubtitle,
  progress,
  footer,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #eaecf0',
        p: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 120,
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          borderColor: '#d0d5dd',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
      }}
    >
      {/* 1. Label: Clean grey in sentence case */}
      <Typography
        sx={{
          fontSize: '12.5px',
          fontWeight: 450,
          color: '#71717a',
          lineHeight: 1.3,
          mb: 0.75,
        }}
      >
        {label}
      </Typography>

      {/* 2. Value: Crisp black, bold tabular numbers */}
      <Typography
        sx={{
          fontSize: '25px',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: '#09090b',
          lineHeight: 1.15,
          fontVariantNumeric: 'tabular-nums',
          mb: 0.75,
        }}
      >
        {value}
      </Typography>

      {/* 3. Trend: Clean green ↗ or yellow/amber ↘ (no icon box, no background pill) */}
      {trend ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: progress ? 1 : 0.75 }}>
          <Typography
            component="span"
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: trendIsPositive ? '#16a34a' : '#ca8a04',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span>{trendIsPositive ? '↗' : '↘'}</span>
            <span>{trend}</span>
          </Typography>
          {trendSubtitle && (
            <Typography
              component="span"
              sx={{
                fontSize: '11px',
                color: '#a1a1aa',
                ml: 0.5,
              }}
            >
              {trendSubtitle}
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{ height: 18 }} />
      )}

      {/* 4. Progress bar (thin black bar with grey track) */}
      {progress && (
        <Box sx={{ mb: 1, mt: 0.25 }}>
          <Box
            sx={{
              width: '100%',
              height: 3,
              backgroundColor: '#e4e4e7',
              borderRadius: 2,
              overflow: 'hidden',
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                width: `${Math.min(100, Math.max(0, progress.percent))}%`,
                height: '100%',
                backgroundColor: '#09090b',
                borderRadius: 2,
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '11px', color: '#71717a' }}>
            {progress.label}
          </Typography>
        </Box>
      )}

      {/* 5. Footer source / timestamp */}
      {footer && (
        <Typography
          sx={{
            fontSize: '11px',
            color: '#a1a1aa',
            mt: 'auto',
            pt: 0.5,
          }}
        >
          {footer}
        </Typography>
      )}
    </Box>
  );
};
