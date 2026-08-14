// Issue Explanation Side Panel - Screen 4 of the Cosmix demo.
// Slide-out drawer showing: why a line item is flagged, which documents
// disagree, 3-way match detail, and the exact next action needed.
import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { CloseOutlined, CheckCircleOutlined, ErrorOutlineOutlined, HourglassEmptyOutlined, HelpOutlineOutlined, DescriptionOutlined } from '@mui/icons-material';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { ChannelTag, SectionTitle } from '../components/primitives';
import { formatRupees } from '../lib/format';
import type { ReconLineItem } from '../mock';

const signed = (n: number): string => (n < 0 ? `−${formatRupees(Math.abs(n))}` : formatRupees(n));

const statusIcon = (s: string) => {
  if (s === 'Matched') return <CheckCircleOutlined sx={{ fontSize: 16, color: colors.grey500 }} />;
  if (s === 'Pending') return <HourglassEmptyOutlined sx={{ fontSize: 16, color: colors.ink }} />;
  if (s === 'Missing') return <HelpOutlineOutlined sx={{ fontSize: 16, color: colors.accent }} />;
  return <ErrorOutlineOutlined sx={{ fontSize: 16, color: colors.ink }} />;
};

interface IssuePanelProps {
  lineItem: ReconLineItem;
  onClose: () => void;
}

const IssuePanel: React.FC<IssuePanelProps> = ({ lineItem, onClose }) => {
  const li = lineItem;
  const isMatched = li.status === 'Matched';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.paper }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: `${space.xl}px`,
          py: `${space.lg}px`,
          borderBottom: hairline,
          flexShrink: 0,
        }}
      >
        <Box>
          <ChannelTag name={li.channel} />
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, mt: '4px' }}>
            {li.skuLabel}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ borderRadius: 0, color: colors.grey700 }}>
          <CloseOutlined />
        </IconButton>
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: `${space.xl}px` }}>
        {/* Why flagged */}
        {!isMatched && (
          <Box sx={{ mb: `${space.xl}px`, p: `${space.lg}px`, bgcolor: colors.grey100, border: hairline }}>
            <Typography sx={{ ...type.label, color: colors.ink, mb: `${space.sm}px` }}>Why this is flagged</Typography>
            <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink, lineHeight: '22px' }}>
              {li.matchNote}
            </Typography>
            {li.issueType && (
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: hairline,
                  mt: `${space.md}px`,
                  px: `${space.sm}px`,
                  py: '3px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: colors.ink,
                }}
              >
                {li.issueType}
              </Box>
            )}
          </Box>
        )}

        {/* Key facts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.md}px`, mb: `${space.xl}px` }}>
          {[
            { label: 'Sale period', value: li.salePeriod },
            { label: 'Expected payout', value: li.expectedPayoutDate },
            { label: 'Expected amount', value: formatRupees(li.expected) },
            { label: 'Received amount', value: formatRupees(li.paid) },
            { label: 'Variance', value: li.variance > 0 ? `−${formatRupees(li.variance)}` : formatRupees(0) },
            { label: 'GRN status', value: li.grnStatus },
          ].map((item) => (
            <Box key={item.label} sx={{ border: hairline, p: `${space.md}px` }}>
              <Typography sx={{ ...type.label, color: colors.grey500 }}>{item.label}</Typography>
              <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink, mt: '2px', ...tabularNums }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* 3-Way Match Detail */}
        <SectionTitle sx={{ mb: `${space.md}px` }}>Three-way match</SectionTitle>
        <Box sx={{ border: hairline, mb: `${space.xl}px` }}>
          {[
            { label: 'Purchase Order', ref: li.threeWayMatch.po.ref, status: li.threeWayMatch.po.status, amount: li.threeWayMatch.po.amount, extra: null },
            {
              label: 'GRN',
              ref: li.threeWayMatch.grn.ref,
              status: li.threeWayMatch.grn.status,
              amount: li.threeWayMatch.grn.amount,
              extra: `${li.threeWayMatch.grn.unitsAccepted} / ${li.threeWayMatch.grn.unitsOrdered} units accepted`,
            },
            { label: 'Invoice', ref: li.threeWayMatch.invoice.ref, status: li.threeWayMatch.invoice.status, amount: li.threeWayMatch.invoice.amount, extra: null },
          ].map((doc, i) => (
            <Box
              key={doc.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: `${space.lg}px`,
                px: `${space.lg}px`,
                py: `${space.md}px`,
                borderBottom: i < 2 ? hairline : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, minWidth: 0, flex: 1 }}>
                {statusIcon(doc.status)}
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink }}>{doc.label}</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.grey700, wordBreak: 'break-all' }}>{doc.ref}</Typography>
                  {doc.extra && <Typography sx={{ fontSize: 12, color: colors.grey500 }}>{doc.extra}</Typography>}
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink, ...tabularNums }}>
                  {formatRupees(doc.amount)}
                </Typography>
                <Box
                  component="span"
                  sx={{
                    fontSize: 11,
                    fontWeight: doc.status === 'Matched' ? 500 : 600,
                    color: doc.status === 'Matched' ? colors.grey500 : colors.ink,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {doc.status}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Variance waterfall */}
        <SectionTitle sx={{ mb: `${space.md}px` }}>Deduction breakdown</SectionTitle>
        <Box sx={{ border: hairline, mb: `${space.xl}px` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: `${space.lg}px`, py: `${space.md}px`, borderBottom: hairline }}>
            <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink }}>Expected (GRN Value)</Typography>
            <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink, ...tabularNums }}>{formatRupees(li.expected)}</Typography>
          </Box>
          {li.varianceBreakdown.map((part) => (
            <Box
              key={part.label}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: `${space.lg}px`,
                px: `${space.lg}px`,
                py: `${space.md}px`,
                borderBottom: hairline,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink }}>Less: {part.label}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '1px', lineHeight: '18px' }}>{part.why}</Typography>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: `${space.lg}px`, py: `${space.md}px`, borderTop: `2px solid ${colors.ink}` }}>
            <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink }}>Actual Paid</Typography>
            <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink, ...tabularNums }}>{formatRupees(li.paid)}</Typography>
          </Box>
        </Box>

        {/* Related documents */}
        <SectionTitle sx={{ mb: `${space.md}px` }}>Related documents</SectionTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.sm}px`, mb: `${space.xl}px` }}>
          {[
            { label: 'Purchase Order', ref: li.poNumber },
            { label: 'GRN', ref: li.grn },
            { label: 'Invoice', ref: li.invoiceNumber },
          ].map((doc) => (
            <Box
              key={doc.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: hairline,
                px: `${space.lg}px`,
                py: `${space.md}px`,
                transition: 'background-color 0.12s',
                '&:hover': { bgcolor: colors.grey100 },
                cursor: 'pointer',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
                <DescriptionOutlined sx={{ fontSize: 18, color: colors.grey500 }} />
                <Box>
                  <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink }}>{doc.label}</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.grey700 }}>{doc.ref}</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: 13, color: colors.accent, fontWeight: 500 }}>View →</Typography>
            </Box>
          ))}
        </Box>

        {/* Next action */}
        {li.nextAction && (
          <Box sx={{ p: `${space.lg}px`, bgcolor: colors.accentWash, border: `1px solid ${colors.accent}` }}>
            <Typography sx={{ ...type.label, color: colors.accent, mb: `${space.sm}px` }}>
              Recommended next action
            </Typography>
            <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink, lineHeight: '22px' }}>
              {li.nextAction}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default IssuePanel;
