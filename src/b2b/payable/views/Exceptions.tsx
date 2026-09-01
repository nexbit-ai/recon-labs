// Exceptions — the killer screen. AI-native exception review queue.
// 6 hardcoded exception types: OCR uncertainty, HSN/SAC mismatch, GST mismatch,
// Qty mismatch, Freight not in PO, Missing vendor code.
// Each card expands to show: issue, why flagged, suggested action, confidence,
// reviewer, and 6 action buttons.
import React, { useState } from 'react';
import { Box, Typography, Button, LinearProgress } from '@mui/material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ExpandMoreOutlined,
  ExpandLessOutlined,
  AutoAwesomeOutlined,
  SendOutlined,
  DescriptionOutlined,
  RemoveCircleOutlineOutlined,
  LocalShippingOutlined,
  PauseCircleOutlineOutlined,
} from '@mui/icons-material';
import { colors, hairline, type, space, tabularNums } from '../../theme/b2bTokens';
import { cardSx, PageTitle, SectionTitle, ColumnLabel } from '../../components/primitives';
import { EXCEPTIONS, INVOICES, VENDORS } from '../mock/apData';
import type { APException, ExceptionType, Reviewer } from '../mock/apData';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

// Exception type label styling — hairline, uppercase, weight differentiation only
const TYPE_WEIGHT: Record<ExceptionType, number> = {
  'OCR uncertainty': 500,
  'HSN/SAC mismatch': 600,
  'GST mismatch': 700,
  'Qty mismatch': 600,
  'Price mismatch': 600,
  'Freight not in PO': 600,
  'Missing vendor code': 600,
};

const ExcTypeChip: React.FC<{ type: ExceptionType }> = ({ type: excType }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      border: hairline,
      bgcolor: colors.paper,
      color: colors.ink,
      fontWeight: TYPE_WEIGHT[excType] ?? 500,
      fontSize: 11,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      px: `${space.sm}px`,
      py: '3px',
      whiteSpace: 'nowrap',
    }}
  >
    {excType}
  </Box>
);

const REVIEWER_LABEL: Record<Reviewer, string> = {
  'AP team': 'AP',
  'Procurement': 'Procurement',
  'Requester': 'Requester',
  'Vendor': 'Vendor',
};

const ReviewerBadge: React.FC<{ reviewer: Reviewer }> = ({ reviewer }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 24,
      px: `${space.sm}px`,
      border: `1px solid ${colors.accent}`,
      bgcolor: colors.accentWash,
      color: colors.accent,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    }}
  >
    {REVIEWER_LABEL[reviewer]}
  </Box>
);

// Confidence bar — uses accent fill, grey-100 track
const ConfidenceBar: React.FC<{ value: number }> = ({ value }) => {
  const isLow = value < 60;
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
        <Typography sx={{ fontSize: 12, color: colors.grey700 }}>AI confidence</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: isLow ? 700 : 500, color: isLow ? colors.accent : colors.ink, ...tabularNums }}>
          {value}%
        </Typography>
      </Box>
      <Box sx={{ height: 6, bgcolor: colors.grey100 }}>
        <Box
          sx={{
            height: '100%',
            width: `${value}%`,
            bgcolor: isLow ? colors.accent : colors.ink,
            transition: 'width 0.4s ease',
          }}
        />
      </Box>
    </Box>
  );
};

// Action button row
interface ActionButtonProps {
  label: string;
  icon: React.ElementType;
  primary?: boolean;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon: Icon, primary, onClick }) => (
  <Button
    onClick={onClick}
    startIcon={<Icon sx={{ fontSize: 16 }} />}
    sx={{
      height: 36,
      fontSize: 12,
      fontWeight: 600,
      px: `${space.lg}px`,
      bgcolor: primary ? colors.accent : colors.paper,
      color: primary ? colors.paper : colors.ink,
      border: primary ? 'none' : hairline,
      '&:hover': {
        bgcolor: primary ? colors.accentHover : colors.grey100,
      },
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </Button>
);

// ── Exception card ────────────────────────────────────────────────────────────
interface ExceptionCardProps {
  exc: APException;
  isOpen: boolean;
  onToggle: () => void;
  vendorName: string;
}

const ExceptionCard: React.FC<ExceptionCardProps> = ({ exc, isOpen, onToggle, vendorName }) => {
  const [resolved, setResolved] = useState(false);
  const reduce = useReducedMotion();

  const inv = INVOICES.find((i) => i.id === exc.invoice);

  const handleAction = (action: string) => {
    console.log(`[AP Demo] Action: ${action} on exception ${exc.id}`);
    setResolved(true);
  };

  if (resolved) {
    return (
      <Box
        sx={{
          ...cardSx,
          p: `${space.xl}px`,
          display: 'flex',
          alignItems: 'center',
          gap: `${space.lg}px`,
          bgcolor: colors.grey100,
          opacity: 0.7,
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.grey700, flex: 1 }}>
          {exc.id} — {exc.type} · Resolved ✓
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardSx, borderLeft: `2px solid ${colors.accent}` }}>
      {/* Header row — always visible */}
      <Box
        onClick={onToggle}
        sx={{
          px: `${space.xl}px`,
          py: `${space.lg}px`,
          display: 'flex',
          alignItems: 'center',
          gap: `${space.lg}px`,
          cursor: 'pointer',
          transition: 'background 0.1s ease',
          '&:hover': { bgcolor: colors.grey100 },
          flexWrap: 'wrap',
        }}
      >
        {/* Left: ID + type */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, mb: `${space.xs}px`, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.ink, ...tabularNums }}>
              {exc.id}
            </Typography>
            <ExcTypeChip type={exc.type} />
            <ReviewerBadge reviewer={exc.reviewer} />
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>{exc.issue}</Typography>
          <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '2px' }}>
            {exc.invoice} · {vendorName}
          </Typography>
        </Box>

        {/* Right: risk + confidence + chevron */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.xl}px`, flexShrink: 0 }}>
          {exc.riskAmount ? (
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ ...type.label, color: colors.grey500 }}>Risk amount</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.accent, ...tabularNums }}>
                {formatINR(exc.riskAmount)}
              </Typography>
            </Box>
          ) : null}
          <Box sx={{ width: 80 }}>
            <Typography sx={{ fontSize: 11, color: colors.grey500, mb: '2px', textAlign: 'right' }}>
              {exc.confidence}% conf
            </Typography>
            <Box sx={{ height: 4, bgcolor: colors.grey100 }}>
              <Box sx={{ height: '100%', width: `${exc.confidence}%`, bgcolor: exc.confidence < 60 ? colors.accent : colors.ink }} />
            </Box>
          </Box>
          {isOpen ? (
            <ExpandLessOutlined sx={{ fontSize: 20, color: colors.grey500 }} />
          ) : (
            <ExpandMoreOutlined sx={{ fontSize: 20, color: colors.grey500 }} />
          )}
        </Box>
      </Box>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <Box
            component={motion.div}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            sx={{ overflow: 'hidden' }}
          >
            <Box sx={{ borderTop: hairline }}>
              {/* Detail columns */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 220px' },
                  gap: 0,
                  '& > *:not(:first-of-type)': { borderLeft: { md: hairline } },
                }}
              >
                {/* Why flagged */}
                <Box sx={{ p: `${space.xl}px` }}>
                  <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.sm}px` }}>
                    Why flagged
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: colors.ink, lineHeight: '20px' }}>
                    {exc.whyFlagged}
                  </Typography>
                </Box>

                {/* Suggested action */}
                <Box sx={{ p: `${space.xl}px` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, mb: `${space.sm}px` }}>
                    <AutoAwesomeOutlined sx={{ fontSize: 14, color: colors.accent }} />
                    <Typography sx={{ ...type.label, color: colors.grey500 }}>
                      AI suggested action
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: colors.ink, lineHeight: '20px' }}>
                    {exc.suggestedAction}
                  </Typography>
                </Box>

                {/* Confidence + reviewer */}
                <Box sx={{ p: `${space.xl}px`, display: 'flex', flexDirection: 'column', gap: `${space.xl}px` }}>
                  <ConfidenceBar value={exc.confidence} />
                  <Box>
                    <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.sm}px` }}>
                      Who should review
                    </Typography>
                    <ReviewerBadge reviewer={exc.reviewer} />
                  </Box>
                </Box>
              </Box>

              {/* Action buttons */}
              <Box
                sx={{
                  borderTop: hairline,
                  px: `${space.xl}px`,
                  py: `${space.lg}px`,
                  bgcolor: colors.grey100,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: `${space.sm}px`,
                }}
              >
                <ActionButton
                  primary
                  label="Accept AI suggestion"
                  icon={AutoAwesomeOutlined}
                  onClick={() => handleAction('accept_ai')}
                />
                <ActionButton
                  label="Send to vendor"
                  icon={SendOutlined}
                  onClick={() => handleAction('send_vendor')}
                />
                <ActionButton
                  label="Request revised invoice"
                  icon={DescriptionOutlined}
                  onClick={() => handleAction('revised_invoice')}
                />
                <ActionButton
                  label="Create debit note"
                  icon={RemoveCircleOutlineOutlined}
                  onClick={() => handleAction('debit_note')}
                />
                <ActionButton
                  label="Mark as short GRN"
                  icon={LocalShippingOutlined}
                  onClick={() => handleAction('short_grn')}
                />
                <ActionButton
                  label="Hold for finance"
                  icon={PauseCircleOutlineOutlined}
                  onClick={() => handleAction('hold_finance')}
                />
              </Box>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const Exceptions: React.FC = () => {
  const reduce = useReducedMotion();
  const [openIdx, setOpenIdx] = useState<number | null>(0); // First card open by default

  const vendorMap = Object.fromEntries(
    VENDORS.map((v) => [v.id, v.name])
  );
  const invVendorMap = Object.fromEntries(
    INVOICES.map((inv) => [inv.id, vendorMap[inv.vendor] ?? 'Unknown'])
  );

  // Summary counts
  const totalRisk = EXCEPTIONS.reduce((sum, e) => sum + (e.riskAmount ?? 0), 0);
  const highConfidence = EXCEPTIONS.filter((e) => e.confidence >= 90).length;
  const lowConfidence = EXCEPTIONS.filter((e) => e.confidence < 60).length;

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Title */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: `${space.lg}px`,
          flexWrap: 'wrap',
          mb: `${space.xl}px`,
        }}
      >
        <PageTitle>Exception Review Queue</PageTitle>
        <Box sx={{ display: 'flex', gap: `${space.sm}px`, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ border: hairline, px: `${space.md}px`, py: `${space.sm}px`, bgcolor: colors.grey100 }}>
            <Typography sx={{ ...type.label, color: colors.grey500 }}>
              {EXCEPTIONS.length} open · {formatINR(totalRisk)} at risk
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Summary KPI strip ───────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          mb: `${space.xxl}px`,
          '& > *:not(:first-of-type)': { borderLeft: hairline },
        }}
      >
        {[
          { label: 'Total exceptions', value: EXCEPTIONS.length, note: 'Across 4 invoices' },
          { label: 'AI high-confidence flags', value: highConfidence, note: '≥ 90% confidence' },
          { label: 'Needs human review', value: lowConfidence, note: 'AI confidence < 60%' },
        ].map((kpi) => (
          <Box key={kpi.label} sx={{ ...cardSx, p: `${space.xl}px` }}>
            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.sm}px` }}>
              {kpi.label}
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: colors.ink, ...tabularNums }}>
              {kpi.value}
            </Typography>
            <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '2px' }}>{kpi.note}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── Exception cards ──────────────────────────────────────────── */}
      <SectionTitle sx={{ mb: `${space.lg}px` }}>Active exceptions</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
        {EXCEPTIONS.map((exc, idx) => (
          <ExceptionCard
            key={exc.id}
            exc={exc}
            isOpen={openIdx === idx}
            onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
            vendorName={invVendorMap[exc.invoice] ?? 'Unknown'}
          />
        ))}
      </Box>

      {/* ── AI assist callout ──────────────────────────────────────── */}
      <Box
        sx={{
          mt: `${space.xxl}px`,
          border: hairline,
          bgcolor: colors.grey100,
          p: `${space.xl}px`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: `${space.lg}px`,
        }}
      >
        <AutoAwesomeOutlined sx={{ fontSize: 20, color: colors.accent, flexShrink: 0, mt: '2px' }} />
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mb: '4px' }}>
            AI has pre-validated all exceptions
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.grey700, lineHeight: '20px' }}>
            Each exception was automatically flagged by Nexbit's AP AI engine by comparing PO terms, GRN entries,
            HSN master, GST rate tables, and vendor master data. Suggested actions are generated per exception type.
            High-confidence suggestions (≥ 90%) can be accepted in one click.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Exceptions;
