// B2B Reconciliation — line-level settlement matching with an expandable
// variance decomposition. All figures come from the mock barrel (src/b2b/mock).
// Monochrome + one accent (#7A5DBF). Accent is used ONLY on: the active filter
// pill, the "Draft dispute" button, and the ₹0 unexplained residual. Status is
// never colour-coded — it is a square hairline-bordered label. Square corners,
// hairline borders, tabular figures throughout.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { ExpandMoreOutlined } from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, ChannelTag, ColumnLabel, PageTitle, Pressable } from '../components/primitives';
import { formatRupees } from '../lib/format';
import { reconLineItems, type ReconLineItem, type ReconStatus } from '../mock';

const DISPUTES_ROUTE = '/b2b/disputes';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const GRID = '104px minmax(180px, 1fr) 160px 116px 116px 144px 36px';

type Filter = 'all' | 'exceptions' | 'matched';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'exceptions', label: 'Exceptions' },
  { key: 'matched', label: 'Matched' },
];

const labelSx = { ...type.label, color: colors.grey700 } as const;

// −₹2,85,200 for negatives, ₹0 for zero, ₹X otherwise — always tabular.
const signed = (n: number): string => (n < 0 ? `−${formatRupees(Math.abs(n))}` : formatRupees(n));

// Square hairline-bordered status label — ink/grey only, never coloured.
const StatusLabel: React.FC<{ status: ReconStatus }> = ({ status }) => {
  const matched = status === 'Matched';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: hairline,
        bgcolor: matched ? colors.grey100 : colors.paper,
        color: matched ? colors.grey700 : colors.ink,
        fontWeight: matched ? 500 : 600,
        fontSize: 11,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        px: `${space.sm}px`,
        py: '3px',
      }}
    >
      {status}
    </Box>
  );
};


const RowDetail: React.FC<{ line: ReconLineItem }> = ({ line }) => {
  const navigate = useNavigate();
  const residual = line.paid - line.expected - line.varianceBreakdown.reduce((t, v) => t + v.amount, 0); // ≡ 0
  const isMatched = line.status === 'Matched';

  return (
    <Box
      sx={{
        bgcolor: colors.grey100,
        borderTop: hairline,
        p: `${space.xl}px`,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.5fr) minmax(0, 1fr)' },
        gap: `${space.xl}px`,
      }}
    >
      {/* LEFT — Variance decomposition */}
      <Box>
        <Typography sx={{ ...labelSx, color: colors.grey700, display: 'block', mb: `${space.md}px` }}>
          Variance decomposition
        </Typography>
        <Box>
          {line.varianceBreakdown.map((part, i) => (
            <Box
              key={part.label}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: `${space.lg}px`,
                py: `${space.md}px`,
                borderTop: i === 0 ? 'none' : hairline,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink }}>
                  {part.label}
                </Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '1px' }}>{part.why}</Typography>
              </Box>
              <Typography
                sx={{
                  flexShrink: 0,
                  fontSize: type.body.fontSize,
                  fontWeight: part.amount < 0 ? 600 : 400,
                  color: part.amount === 0 ? colors.grey500 : colors.ink,
                  ...tabularNums,
                }}
              >
                {signed(part.amount)}
              </Typography>
            </Box>
          ))}
          {/* Unexplained residual — ₹0 in accent signals a clean, fully-explained recon */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: `${space.lg}px`,
              py: `${space.md}px`,
              borderTop: hairline,
            }}
          >
            <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink }}>
              Unexplained residual
            </Typography>
            <Typography sx={{ flexShrink: 0, fontSize: type.body.fontSize, fontWeight: 600, color: colors.accent, ...tabularNums }}>
              {formatRupees(residual)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* RIGHT — How this matched */}
      <Box>
        <Typography sx={{ ...labelSx, color: colors.grey700, display: 'block', mb: `${space.md}px` }}>
          How this matched
        </Typography>
        <Box sx={{ ...cardSx, p: `${space.lg}px` }}>
          <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink, lineHeight: '20px' }}>
            {line.matchNote}
          </Typography>
        </Box>
        {!isMatched && (
          <Button
            fullWidth
            disableElevation
            onClick={() => navigate(DISPUTES_ROUTE)}
            sx={{
              mt: `${space.lg}px`,
              borderRadius: 0,
              bgcolor: colors.accent,
              color: colors.paper,
              fontSize: 13,
              fontWeight: 600,
              py: `${space.md}px`,
              ...tabularNums,
              '&:hover': { bgcolor: colors.accentHover },
            }}
          >
            Draft dispute · {formatRupees(line.variance)}
          </Button>
        )}
      </Box>
    </Box>
  );
};

const Reconciliation: React.FC = () => {
  const reduce = useReducedMotion();
  const [filter, setFilter] = React.useState<Filter>('all');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const rows = reconLineItems.filter((li) =>
    filter === 'all' ? true : filter === 'matched' ? li.status === 'Matched' : li.status !== 'Matched',
  );

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <PageTitle>Reconciliation</PageTitle>

      {/* ── CONTROL ROW ─────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${space.lg}px`,
          mb: `${space.lg}px`,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'inline-flex', border: hairline }}>
          {FILTERS.map((f, i) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                role="tab"
                selected={active}
                onClick={() => setFilter(f.key)}
                sx={{
                  px: `${space.lg}px`,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: active ? 'default' : 'pointer',
                  borderLeft: i === 0 ? 'none' : hairline,
                  bgcolor: active ? colors.accent : 'transparent',
                  color: active ? colors.paper : colors.grey700,
                  fontSize: 13,
                  fontWeight: 600,
                  '&:hover': active ? undefined : { bgcolor: colors.grey100, color: colors.ink },
                }}
              >
                {f.label}
              </Pressable>
            );
          })}
        </Box>

        <Typography sx={{ fontSize: 13, color: colors.grey500, ...tabularNums }}>
          Matching: reference → composite key → FIFO · deterministic · ±₹1 tolerance
        </Typography>
      </Box>

      {/* ── TABLE (scrolls horizontally on narrow viewports) ── */}
      <Box sx={{ ...cardSx, overflowX: 'auto' }}>
       <Box sx={{ minWidth: 880 }}>
        {/* Column header */}
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
          <ColumnLabel>SKU</ColumnLabel>
          <ColumnLabel>GRN / settlement</ColumnLabel>
          <ColumnLabel align="right">Expected</ColumnLabel>
          <ColumnLabel align="right">Paid</ColumnLabel>
          <ColumnLabel align="right">Status</ColumnLabel>
          <ColumnLabel />
        </Box>

        {rows.map((li, idx) => {
          const expanded = expandedId === li.id;
          return (
            <Box key={li.id} sx={{ borderBottom: idx < rows.length - 1 ? hairline : 'none' }}>
              {/* Clickable row */}
              <Pressable
                ariaLabel={`${li.channel} ${li.skuLabel}, ${li.status}`}
                onClick={() => setExpandedId(expanded ? null : li.id)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  alignItems: 'center',
                  gap: `${space.lg}px`,
                  px: `${space.xl}px`,
                  height: 56,
                  bgcolor: expanded ? colors.grey100 : 'transparent',
                  transition: 'background-color 0.12s ease',
                  '&:hover': { bgcolor: colors.grey100 },
                }}
              >
                <ChannelTag name={li.channel} />
                <Typography
                  sx={{
                    fontSize: type.body.fontSize,
                    color: colors.ink,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {li.skuLabel}
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: 12.5, color: colors.grey700, ...tabularNums }}>
                  {li.ref}
                </Typography>
                <Typography sx={{ textAlign: 'right', fontSize: type.body.fontSize, color: colors.ink, ...tabularNums }}>
                  {formatRupees(li.expected)}
                </Typography>
                <Typography
                  sx={{
                    textAlign: 'right',
                    fontSize: type.body.fontSize,
                    color: colors.ink,
                    fontWeight: li.variance > 0 ? 600 : 400, // emphasise underpayment by weight, not colour
                    ...tabularNums,
                  }}
                >
                  {formatRupees(li.paid)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <StatusLabel status={li.status} />
                </Box>
                <ExpandMoreOutlined
                  sx={{
                    fontSize: 20,
                    color: colors.grey500,
                    justifySelf: 'end',
                    transition: reduce ? 'none' : 'transform 0.18s ease',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </Pressable>

              {/* Expandable detail — one open at a time */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <RowDetail line={li} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          );
        })}

        {rows.length === 0 && (
          <Box sx={{ p: `${space.xl}px` }}>
            <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey500 }}>No lines in this view.</Typography>
          </Box>
        )}
       </Box>
      </Box>
    </Box>
  );
};

export default Reconciliation;
