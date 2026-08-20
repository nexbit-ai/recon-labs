import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, hairline, space, tabularNums } from '../theme/b2bTokens';
import { ColumnLabel } from './primitives';
import { formatRupees } from '../lib/format';
import type { DeductionBreakdownLine } from '../mock/types';

interface DeductionTableProps {
  deductions: DeductionBreakdownLine[];
}

export const DeductionTable: React.FC<DeductionTableProps> = ({ deductions }) => {
  return (
    <Box sx={{ border: hairline }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: `${space.md}px`, px: `${space.lg}px`, py: `${space.sm}px`, bgcolor: colors.grey100, borderBottom: hairline }}>
        <ColumnLabel>Fee Component</ColumnLabel>
        <ColumnLabel>Contracted Basis</ColumnLabel>
        <ColumnLabel align="right">Expected</ColumnLabel>
        <ColumnLabel align="right">Actual Paid</ColumnLabel>
        <ColumnLabel align="right">Variance</ColumnLabel>
      </Box>
      {deductions.map((line, i) => {
        const hasVariance = line.variance > 0;
        return (
          <Box
            key={line.label}
            sx={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: `${space.md}px`,
              px: `${space.lg}px`, py: `${space.md}px`,
              borderBottom: i < deductions.length - 1 ? hairline : 'none',
              bgcolor: hasVariance ? '#FEF2F2' : 'transparent',
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{line.label}</Typography>
            <Typography sx={{ fontSize: 12, color: line.contracted === 'NOT IN CONTRACT' ? '#991B1B' : colors.grey700 }}>
              {line.contracted}
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(line.expected)}</Typography>
            <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(line.actual)}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: hasVariance ? 600 : 400, color: hasVariance ? '#991B1B' : colors.ink, textAlign: 'right', ...tabularNums }}>
              {hasVariance ? `+${formatRupees(line.variance)}` : formatRupees(line.variance)}
            </Typography>
          </Box>
        );
      })}
      <Box sx={{ display: 'grid', gridTemplateColumns: '4fr 1fr 1fr 1fr', gap: `${space.md}px`, px: `${space.lg}px`, py: `${space.sm}px`, borderTop: `2px solid ${colors.ink}` }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>Total Deductions</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, textAlign: 'right', ...tabularNums }}>
          {formatRupees(deductions.reduce((s, l) => s + l.expected, 0))}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, textAlign: 'right', ...tabularNums }}>
          {formatRupees(deductions.reduce((s, l) => s + l.actual, 0))}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#991B1B', textAlign: 'right', ...tabularNums }}>
          +{formatRupees(deductions.reduce((s, l) => s + l.variance, 0))}
        </Typography>
      </Box>
    </Box>
  );
};
