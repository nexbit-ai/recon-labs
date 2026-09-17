import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Rectangle,
} from 'recharts';
import { colors, hairline, fontFamily, tabularNums, space } from '../theme/b2bTokens';
import { formatRupees } from '../lib/format';
import { KAPIVA_CLIENTS, type B2BClient } from '../mock/b2bReconData';

export type AgeingBucket = '0-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days';

export interface ClientAgeingItem {
  id: string;
  name: string;
  code: string;
  amount: number;
  percentage: number;
  entityType: string;
  invoices: number;
  creditDays: number;
  ageingDays: number;
  overdueDays: number;
  bucket: AgeingBucket;
}

// Realistic weighted average ageing days per client aligned with the 4 macro buckets
const CLIENT_AGEING_METRICS: Record<string, { days: number; bucket: AgeingBucket }> = {
  'cli-001': { days: 48, bucket: '31-60 Days' }, // New Welcome Pharma
  'cli-002': { days: 68, bucket: '61-90 Days' }, // Apollo Pharmacy Ltd
  'cli-003': { days: 55, bucket: '31-60 Days' }, // Wellness Forever Medicare
  'cli-004': { days: 65, bucket: '61-90 Days' }, // MedPlus Health Services
  'cli-005': { days: 92, bucket: '90+ Days' },   // Reliance Retail (JioMart B2B)
  'cli-006': { days: 94, bucket: '90+ Days' },   // Frank Ross Pharmacy
  'cli-007': { days: 26, bucket: '0-30 Days' },  // Noble Plus Healthcare
  'cli-008': { days: 52, bucket: '31-60 Days' }, // Tata 1mg Retail Distribution
  'cli-009': { days: 46, bucket: '31-60 Days' }, // Hetero Pharmacy Outlets
  'cli-010': { days: 44, bucket: '31-60 Days' }, // Fortis Healthworld
  'cli-011': { days: 38, bucket: '31-60 Days' }, // Avenue Supermarts (DMart B2B)
  'cli-012': { days: 50, bucket: '31-60 Days' }, // Nature's Basket Fine Foods
  'cli-013': { days: 28, bucket: '0-30 Days' },  // Zepto Darkstores Supply
  'cli-014': { days: 39, bucket: '31-60 Days' }, // Blinkit Commerce Pvt Ltd
  'cli-015': { days: 64, bucket: '61-90 Days' }, // Amazon Retail Wholesale
  'cli-016': { days: 71, bucket: '61-90 Days' }, // Flipkart India Wholesale
  'cli-017': { days: 54, bucket: '31-60 Days' }, // Guardian Pharmacy Chain
  'cli-018': { days: 51, bucket: '31-60 Days' }, // Netmeds Offline Distributors
  'cli-019': { days: 38, bucket: '31-60 Days' }, // Wellness Care Distributors
  'cli-020': { days: 49, bucket: '31-60 Days' }, // Metro Cash & Carry India
};

interface ClientAgeingBarChartProps {
  clients?: B2BClient[];
  selectedClientId?: string;
  maxVisibleClients?: number;
}

export const ClientAgeingBarChart: React.FC<ClientAgeingBarChartProps> = ({
  clients = KAPIVA_CLIENTS,
  selectedClientId,
  maxVisibleClients = 8,
}) => {
  const { chartData, maxDays, avgAgeingDays } = useMemo(() => {
    const total = clients.reduce((sum, c) => sum + c.totalOutstanding, 0);

    const rawData: ClientAgeingItem[] = clients.map((client) => {
      const metric = CLIENT_AGEING_METRICS[client.id] || {
        days: Math.round(client.creditPeriodDays * 1.15),
        bucket: '31-60 Days' as AgeingBucket,
      };
      const overdue = Math.max(0, metric.days - client.creditPeriodDays);

      return {
        id: client.id,
        name: client.name,
        code: client.code,
        amount: client.totalOutstanding,
        percentage: total > 0 ? (client.totalOutstanding / total) * 100 : 0,
        entityType: client.entityType,
        invoices: client.totalInvoices,
        creditDays: client.creditPeriodDays,
        ageingDays: metric.days,
        overdueDays: overdue,
        bucket: metric.bucket,
      };
    });

    // Arranged in descending order of days (longest ageing first)
    const sorted = [...rawData].sort((a, b) => b.ageingDays - a.ageingDays);

    const max = sorted.length > 0 ? Math.max(...sorted.map((d) => d.ageingDays)) : 100;
    const avgDays =
      sorted.length > 0
        ? Math.round(sorted.reduce((acc, d) => acc + d.ageingDays, 0) / sorted.length)
        : 0;

    return {
      chartData: sorted,
      maxDays: max,
      avgAgeingDays: avgDays,
    };
  }, [clients]);

  // Row height is 42px. 8 clients fit comfortably in ~340px viewport.
  const ROW_HEIGHT = 42;
  const viewportHeight = maxVisibleClients * ROW_HEIGHT;
  const totalChartHeight = chartData.length * ROW_HEIGHT;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item: ClientAgeingItem = payload[0]?.payload;
    if (!item) return null;

    return (
      <Box
        sx={{
          bgcolor: colors.paper,
          border: hairline,
          borderRadius: '8px',
          p: '12px 16px',
          boxShadow: '0 4px 16px rgba(9, 9, 11, 0.08)',
          minWidth: 240,
          pointerEvents: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>
            {item.name}
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              bgcolor: colors.grey100,
              px: '6px',
              py: '2px',
              borderRadius: '4px',
              color: colors.grey700,
              fontWeight: 500,
            }}
          >
            {item.code}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '5px' }}>
          <Typography sx={{ fontSize: 11, color: colors.grey500 }}>Payment Ageing</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, ...tabularNums }}>
            {item.ageingDays} days
            {item.overdueDays > 0 && (
              <Box component="span" sx={{ fontSize: 11, color: colors.grey600, fontWeight: 400, ml: '4px' }}>
                (+{item.overdueDays}d overdue)
              </Box>
            )}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '5px' }}>
          <Typography sx={{ fontSize: 11, color: colors.grey500 }}>Ageing Bucket</Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: '6px',
              py: '1px',
              bgcolor: colors.grey100,
              borderRadius: '4px',
              fontSize: 11,
              fontWeight: 500,
              color: colors.ink,
            }}
          >
            {item.bucket}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '5px' }}>
          <Typography sx={{ fontSize: 11, color: colors.grey500 }}>Outstanding Balance</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, ...tabularNums }}>
            {formatRupees(item.amount)}
            <Box component="span" sx={{ fontSize: 11, color: colors.grey500, fontWeight: 400, ml: '4px' }}>
              ({item.percentage.toFixed(1)}%)
            </Box>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography sx={{ fontSize: 11, color: colors.grey500 }}>Invoices / Terms</Typography>
          <Typography sx={{ fontSize: 12, color: colors.ink, ...tabularNums }}>
            {item.invoices} inv · {item.creditDays}d terms
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderCustomShape = (props: any) => {
    const { x, y, width, height, background, payload } = props;
    const bgX = background?.x ?? x;
    const bgWidth = background?.width ?? width;
    const rightEdge = bgX + bgWidth - 12;
    const centerY = y + height / 2 + 4;
    const isSelected = selectedClientId && (payload.id === selectedClientId || payload.name === selectedClientId);

    return (
      <g>
        {/* Filled foreground bar representing time (ageingDays) */}
        <Rectangle
          x={x}
          y={y}
          width={Math.max(width, 8)}
          height={height}
          radius={6}
          fill={isSelected ? colors.accent : colors.ink}
        />
        {/* Ageing Days (primary metric) and Amount / percentage at right edge of background pill */}
        <text
          x={rightEdge}
          y={centerY}
          textAnchor="end"
          fill={colors.ink}
          fontSize={12}
          fontWeight={600}
          fontFamily={fontFamily}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {payload.ageingDays} days
          <tspan fill={colors.grey400} fontWeight={400} dx={8}>
            ·
          </tspan>
          <tspan fill={colors.grey700} fontWeight={500} dx={8}>
            {formatRupees(payload.amount)}
          </tspan>
          <tspan fill={colors.grey500} fontWeight={400} dx={6}>
            ({payload.percentage.toFixed(1)}%)
          </tspan>
        </text>
      </g>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: `${space.xl}px`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
          <Typography sx={{ fontSize: 18, lineHeight: '26px', fontWeight: 600, color: colors.ink }}>
            Outstanding Payment Ageing (All Clients)
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: '8px',
              py: '3px',
              bgcolor: colors.grey100,
              borderRadius: '4px',
              fontSize: 12,
              fontWeight: 500,
              color: colors.grey700,
              ...tabularNums,
            }}
          >
            {chartData.length} Clients
          </Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: '8px',
              py: '3px',
              bgcolor: colors.grey100,
              borderRadius: '4px',
              fontSize: 12,
              fontWeight: 500,
              color: colors.grey700,
              ...tabularNums,
            }}
          >
            Avg Ageing: {avgAgeingDays} Days
          </Box>
        </Box>

        <Typography sx={{ fontSize: 12, color: colors.grey500 }}>
          Showing {Math.min(maxVisibleClients, chartData.length)} of {chartData.length} · Scroll to view all
        </Typography>
      </Box>

      {/* Scrollable container showing exactly maxVisibleClients (8) clients */}
      <Box
        sx={{
          height: viewportHeight,
          overflowY: 'auto',
          pr: '8px',
          // Sleek minimalist scrollbar
          '&::-webkit-scrollbar': {
            width: '5px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: colors.grey100,
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: colors.grey300,
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: colors.grey400,
            },
          },
        }}
      >
        <Box sx={{ width: '100%', height: totalChartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              barSize={22}
              margin={{ top: 4, right: 8, left: 16, bottom: 4 }}
            >
              {/* XAxis hidden; represents time (days) with domain scaled so right label fits comfortably */}
              <XAxis
                dataKey="ageingDays"
                type="number"
                hide
                domain={[0, maxDays * 1.38]}
              />

              {/* YAxis with clean client names */}
              <YAxis
                dataKey="name"
                type="category"
                width={225}
                tickLine={false}
                axisLine={false}
                tick={(tickProps: any) => {
                  const { x, y, payload } = tickProps;
                  const isSelected = selectedClientId && (payload.value === selectedClientId);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={-12}
                        y={4}
                        textAnchor="end"
                        fill={isSelected ? colors.accent : colors.ink}
                        fontSize={12}
                        fontWeight={isSelected ? 600 : 500}
                        fontFamily={fontFamily}
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />

              <Tooltip
                cursor={{ fill: 'rgba(9, 9, 11, 0.03)', radius: 6 }}
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="ageingDays"
                layout="vertical"
                fill={colors.ink}
                background={{ radius: 6, fill: colors.grey100 }}
                radius={6}
                shape={renderCustomShape}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ClientAgeingBarChart;
