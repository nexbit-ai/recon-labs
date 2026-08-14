// B2B Contracts - every channel's contract in one place. The page is an
// accordion of channels; opening one unrolls its full contract: the signed rate
// card AND its secondary-discount register. Secondary discounts are the time-
// and-SKU-scoped promos the brand co-funds - declaring them here is what lets
// recon lower the "expected amount to receive" for that window, so a legitimate
// promo deduction reconciles instead of flagging as variance.
//
// Monochrome + one accent (#7A5DBF): accent appears ONLY on the "Extracted…"
// tag, Active discount state, the impact figures / clean-reconcile check, and
// primary actions. A contract breach reads as wrong through weight + an alert
// glyph, never colour. Square corners, hairline borders, tabular figures.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import {
  CheckOutlined,
  ErrorOutlineOutlined,
  ExpandMoreOutlined,
  AddOutlined,
  LocalOfferOutlined,
  SyncOutlined,
} from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, PageTitle, SectionTitle, Pressable, ChannelTag } from '../components/primitives';
import AddDiscountModal from '../components/AddDiscountModal';
import { formatRupees } from '../lib/format';
import {
  channelContracts,
  secondaryDiscounts as seedDiscounts,
  discountStatus,
  discountImpact,
  discountValueLabel,
  blinkitBreach,
  skuById,
} from '../mock';
import type {
  ChannelContract,
  ChannelName,
  RateCardLine,
  SecondaryDiscount,
  DiscountStatus,
} from '../mock';

const DISPUTES_ROUTE = '/b2b/disputes';

// ── date-window formatting ───────────────────────────────────────────────────
const asDate = (iso: string) => new Date(`${iso}T00:00:00`);
const monthShort = (iso: string) => asDate(iso).toLocaleDateString('en-US', { month: 'short' });
const dayNum = (iso: string) => asDate(iso).getDate();
function formatWindow(start: string, end: string): string {
  const sM = monthShort(start);
  const eM = monthShort(end);
  return sM === eM ? `${sM} ${dayNum(start)} – ${dayNum(end)}` : `${sM} ${dayNum(start)} – ${eM} ${dayNum(end)}`;
}

// ── status pill (accent only for Active) ─────────────────────────────────────
const StatusPill: React.FC<{ status: DiscountStatus }> = ({ status }) => {
  const styles: Record<DiscountStatus, object> = {
    Active: { bgcolor: colors.accentWash, color: colors.accent },
    Scheduled: { border: hairline, color: colors.grey700 },
    Ended: { bgcolor: colors.grey100, color: colors.grey500 },
  };
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ...type.label, px: `${space.sm}px`, py: '3px', ...styles[status] }}>
      {status}
    </Box>
  );
};

// ── rate-card lines (a flagged line reads wrong via weight + glyph, not colour) ─
const RateCard: React.FC<{ lines: RateCardLine[] }> = ({ lines }) => (
  <Box sx={{ border: hairline }}>
    {lines.map((line, i) => (
      <Box
        key={line.code}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${space.lg}px`,
          px: `${space.lg}px`,
          py: `${space.md}px`,
          borderBottom: i === lines.length - 1 ? 'none' : hairline,
          bgcolor: line.authorised ? 'transparent' : colors.grey100,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, minWidth: 0 }}>
          {line.authorised ? (
            <CheckOutlined sx={{ fontSize: 16, color: colors.grey500, flexShrink: 0 }} />
          ) : (
            <ErrorOutlineOutlined sx={{ fontSize: 16, color: colors.ink, flexShrink: 0 }} />
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: type.body.fontSize, fontWeight: line.authorised ? 400 : 600, color: colors.ink }}>
              {line.label}
            </Typography>
            {line.note && <Typography sx={{ fontSize: 13, color: colors.grey700 }}>- {line.note}</Typography>}
          </Box>
        </Box>
        <Typography
          sx={{
            flexShrink: 0,
            fontSize: type.body.fontSize,
            fontWeight: line.authorised ? 400 : 600,
            color: colors.ink,
            ...tabularNums,
          }}
        >
          {line.contracted}
        </Typography>
      </Box>
    ))}
  </Box>
);

// ── one discount row + expandable reconciliation-impact explainer ────────────
const DiscountRow: React.FC<{
  discount: SecondaryDiscount;
  expanded: boolean;
  onToggle: () => void;
}> = ({ discount, expanded, onToggle }) => {
  const status = discountStatus(discount);
  const impact = discountImpact(discount);
  const skuNames = discount.skuIds.map((id) => skuById(id)?.product ?? id);
  const skuSummary =
    skuNames.length <= 2 ? skuNames.join(', ') : `${skuNames.slice(0, 2).join(', ')} +${skuNames.length - 2}`;

  const mathLine =
    discount.discountType === 'percent'
      ? `${discount.unitsInWindow.toLocaleString('en-IN')} units × ₹${discount.avgSellingPrice} × ${discount.discountValue}% × ${discount.brandFundedPct}% brand share`
      : `${discount.unitsInWindow.toLocaleString('en-IN')} units × ₹${discount.discountValue} × ${discount.brandFundedPct}% brand share`;

  return (
    <Box sx={{ borderBottom: hairline }}>
      <Pressable
        onClick={onToggle}
        ariaLabel={`${discount.name} discount`}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.2fr) 90px 96px 92px 20px',
          alignItems: 'center',
          gap: `${space.md}px`,
          px: `${space.lg}px`,
          py: `${space.md}px`,
          '&:hover': { bgcolor: colors.grey100 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {discount.name}
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.grey700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {skuSummary}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink, ...tabularNums }}>
          {discountValueLabel(discount)} · {discount.brandFundedPct}% brand
        </Typography>
        <Typography sx={{ fontSize: 13, color: colors.grey700, ...tabularNums }}>
          {formatWindow(discount.startDate, discount.endDate)}
        </Typography>
        <Box><StatusPill status={status} /></Box>
        <Typography sx={{ fontSize: type.body.fontSize, color: colors.accent, fontWeight: 600, textAlign: 'right', ...tabularNums }}>
          {formatRupees(impact.brandFunded)}
        </Typography>
        <ExpandMoreOutlined
          sx={{ fontSize: 20, color: colors.grey500, justifySelf: 'end', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
        />
      </Pressable>

      <AnimatePresence initial={false}>
        {expanded && (
          <Box
            component={motion.div}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            sx={{ overflow: 'hidden' }}
          >
            <Box sx={{ px: `${space.lg}px`, pb: `${space.lg}px` }}>
              <Typography sx={{ ...type.label, color: colors.grey700, mb: `${space.md}px` }}>
                How this affects reconciliation
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: `${space.md}px` }}>
                {/* Without config → false positive */}
                <Box sx={{ border: hairline, p: `${space.lg}px` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, mb: `${space.sm}px` }}>
                    <ErrorOutlineOutlined sx={{ fontSize: 16, color: colors.ink }} />
                    <Typography sx={{ ...type.label, color: colors.ink }}>Not declared</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: colors.grey700, lineHeight: '19px' }}>
                    Nex expects full price, sees a {formatRupees(impact.brandFunded)} deduction on the settlement, and
                    flags it as <b style={{ color: colors.ink }}>unexplained variance</b> - a false leakage alert.
                  </Typography>
                </Box>

                {/* With config → reconciles */}
                <Box sx={{ border: `1px solid ${colors.accent}`, p: `${space.lg}px`, bgcolor: colors.accentWash }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, mb: `${space.sm}px` }}>
                    <CheckOutlined sx={{ fontSize: 16, color: colors.accent }} />
                    <Typography sx={{ ...type.label, color: colors.accent }}>Declared here</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: colors.grey700, lineHeight: '19px' }}>
                    Expected receivable drops by <b style={{ color: colors.ink }}>{formatRupees(impact.brandFunded)}</b> for
                    this window &amp; SKU set - the deduction matches expectation and{' '}
                    <b style={{ color: colors.ink }}>reconciles clean</b>.
                  </Typography>
                </Box>
              </Box>

              {/* The math */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: `${space.sm}px`, mt: `${space.md}px`, px: `${space.md}px`, py: `${space.sm}px`, bgcolor: colors.grey100 }}>
                <Typography sx={{ ...type.label, color: colors.grey500 }}>Expected adjustment</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700, ...tabularNums }}>{mathLine}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey500 }}>=</Typography>
                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                  {formatRupees(impact.brandFunded)}
                </Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey500, ...tabularNums }}>
                  (of a {formatRupees(impact.gross)} total markdown; platform funds {formatRupees(impact.platformFunded)})
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

// ── one channel accordion ────────────────────────────────────────────────────
const ChannelPanel: React.FC<{
  contract: ChannelContract;
  discounts: SecondaryDiscount[];
  expanded: boolean;
  onToggle: () => void;
  onAddDiscount: () => void;
  isLast: boolean;
}> = ({ contract, discounts, expanded, onToggle, onAddDiscount, isLast }) => {
  const navigate = useNavigate();
  const [openDiscountId, setOpenDiscountId] = React.useState<string | null>(null);
  const hasBreach = contract.rateCard.some((l) => !l.authorised);
  const activeCount = discounts.filter((d) => discountStatus(d) === 'Active').length;

  return (
    <Box sx={{ borderBottom: isLast ? 'none' : hairline }}>
      {/* Collapsed header row */}
      <Pressable
        onClick={onToggle}
        ariaLabel={`${contract.channel} contract`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: `${space.lg}px`,
          px: `${space.xl}px`,
          py: `${space.lg}px`,
          bgcolor: expanded ? colors.grey100 : 'transparent',
          '&:hover': { bgcolor: colors.grey100 },
        }}
      >
        <Box sx={{ minWidth: 132 }}>
          <ChannelTag name={contract.channel} />
          <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '2px' }}>{contract.model}</Typography>
        </Box>
        <Typography sx={{ flex: 1, fontSize: 13, color: colors.grey500, ...tabularNums, display: { xs: 'none', md: 'block' } }}>
          {contract.contractRef}
        </Typography>

        {/* Summary chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.lg}px` }}>
          <Typography sx={{ fontSize: 13, color: colors.grey700, ...tabularNums, whiteSpace: 'nowrap' }}>
            {contract.rateCard.length} rate lines
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.xs}px`, whiteSpace: 'nowrap' }}>
            <LocalOfferOutlined sx={{ fontSize: 15, color: colors.grey500 }} />
            <Typography sx={{ fontSize: 13, color: colors.grey700, ...tabularNums }}>
              {discounts.length} discount{discounts.length === 1 ? '' : 's'}
              {activeCount > 0 && <Box component="span" sx={{ color: colors.accent, fontWeight: 600 }}> · {activeCount} active</Box>}
            </Typography>
          </Box>
          {hasBreach && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.xs}px`, whiteSpace: 'nowrap' }}>
              <ErrorOutlineOutlined sx={{ fontSize: 15, color: colors.ink }} />
              <Typography sx={{ fontSize: 13, color: colors.ink, fontWeight: 600 }}>1 breach</Typography>
            </Box>
          )}
        </Box>

        <ExpandMoreOutlined sx={{ fontSize: 22, color: colors.grey500, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </Pressable>

      {/* Expanded contract body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <Box
            component={motion.div}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            sx={{ overflow: 'hidden' }}
          >
            <Box sx={{ p: `${space.xl}px`, display: 'flex', flexDirection: 'column', gap: `${space.xl}px` }}>
              {/* Rate card */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, mb: `${space.md}px`, flexWrap: 'wrap' }}>
                  <SectionTitle>Rate card</SectionTitle>
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: colors.accentWash, color: colors.accent, ...type.label, px: `${space.sm}px`, py: '3px' }}>
                    {contract.source}
                  </Box>
                </Box>
                <RateCard lines={contract.rateCard} />
              </Box>

              {/* Breach strip - Blinkit's unauthorised "Storage Fee v2" */}
              {hasBreach && contract.channel === 'Blinkit' && (
                <Box sx={{ border: hairline, p: `${space.lg}px`, display: 'flex', alignItems: 'flex-start', gap: `${space.md}px`, flexWrap: 'wrap' }}>
                  <ErrorOutlineOutlined sx={{ fontSize: 18, color: colors.ink, flexShrink: 0, mt: '1px' }} />
                  <Box sx={{ flex: 1, minWidth: 240 }}>
                    <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink }}>
                      A {blinkitBreach.feePct}% ‘{blinkitBreach.feeLabel}’ is being charged with no signed basis.
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '2px' }}>
                      First appeared {blinkitBreach.since} across {blinkitBreach.skuCount} SKUs ·{' '}
                      <Box component="span" sx={{ color: colors.accent, fontWeight: 600 }}>{formatRupees(blinkitBreach.amount)}</Box> overcharged ·{' '}
                      {blinkitBreach.windowDaysRemaining} days left to dispute
                    </Typography>
                  </Box>
                  <Button
                    disableElevation
                    onClick={(e) => { e.stopPropagation(); navigate(DISPUTES_ROUTE); }}
                    sx={{ borderRadius: 0, bgcolor: colors.accent, color: colors.paper, fontSize: 13, fontWeight: 600, px: `${space.lg}px`, py: `${space.sm}px`, '&:hover': { bgcolor: colors.accentHover } }}
                  >
                    File dispute
                  </Button>
                </Box>
              )}

              {/* Secondary discounts */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${space.md}px`, mb: `${space.sm}px`, flexWrap: 'wrap' }}>
                  <SectionTitle>Secondary discounts</SectionTitle>
                  <Button
                    disableElevation
                    startIcon={<AddOutlined sx={{ fontSize: 18 }} />}
                    onClick={(e) => { e.stopPropagation(); onAddDiscount(); }}
                    sx={{ borderRadius: 0, border: hairline, color: colors.ink, fontSize: 13, fontWeight: 600, px: `${space.lg}px`, py: `${space.sm}px`, '&:hover': { bgcolor: colors.grey100 } }}
                  >
                    Add discount
                  </Button>
                </Box>
                <Typography sx={{ fontSize: 13, color: colors.grey700, mb: `${space.md}px`, maxWidth: 680 }}>
                  Promos this channel runs on specific SKUs for a date window. Declaring them lowers the expected
                  receivable for that window, so the settlement deduction reconciles instead of flagging as variance.
                </Typography>

                {discounts.length === 0 ? (
                  <Box sx={{ border: hairline, px: `${space.lg}px`, py: `${space.xl}px`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey500 }}>
                      No discounts configured - deductions on promo SKUs will flag as variance until you add them.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ border: hairline }}>
                    {/* column header */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.2fr) 90px 96px 92px 20px', gap: `${space.md}px`, px: `${space.lg}px`, py: `${space.sm}px`, bgcolor: colors.grey100, borderBottom: hairline }}>
                      <Typography sx={{ ...type.label, color: colors.grey500 }}>Discount · SKUs</Typography>
                      <Typography sx={{ ...type.label, color: colors.grey500 }}>Terms</Typography>
                      <Typography sx={{ ...type.label, color: colors.grey500 }}>Window</Typography>
                      <Typography sx={{ ...type.label, color: colors.grey500 }}>Status</Typography>
                      <Typography sx={{ ...type.label, color: colors.grey500, textAlign: 'right' }}>Expected −</Typography>
                      <Box />
                    </Box>
                    {discounts.map((d) => (
                      <DiscountRow
                        key={d.id}
                        discount={d}
                        expanded={openDiscountId === d.id}
                        onToggle={() => setOpenDiscountId((prev) => (prev === d.id ? null : d.id))}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

// ── page ─────────────────────────────────────────────────────────────────────
const Contracts: React.FC = () => {
  const reduce = useReducedMotion();
  const [expandedChannel, setExpandedChannel] = React.useState<ChannelName | null>('Blinkit');
  const [discounts, setDiscounts] = React.useState<SecondaryDiscount[]>(seedDiscounts);
  const [addChannel, setAddChannel] = React.useState<ChannelName | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const discountsFor = (channel: ChannelName) => discounts.filter((d) => d.channel === channel);

  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  const handleAdd = (discount: SecondaryDiscount) => {
    setDiscounts((prev) => [discount, ...prev]);
    setExpandedChannel(discount.channel); // reveal it immediately
  };

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
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
        <Box>
          <PageTitle>Contracts</PageTitle>
          <Typography sx={{ mt: `-${space.md}px`, fontSize: type.body.fontSize, color: colors.grey700, maxWidth: 760 }}>
            One contract per channel. Each defines the rate card <b style={{ color: colors.ink }}>and</b> the secondary
            discounts running on it - together they set the “expected amount to receive” that reconciliation checks every
            settlement against. Open a channel to view or configure its contract.
          </Typography>
        </Box>
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          startIcon={
            <SyncOutlined
              sx={{
                fontSize: 18,
                animation: isSyncing && !reduce ? 'b2bspin 1s linear infinite' : 'none',
                '@keyframes b2bspin': { to: { transform: 'rotate(360deg)' } },
              }}
            />
          }
          sx={{
            bgcolor: colors.accent,
            color: colors.paper,
            fontSize: 13,
            fontWeight: 600,
            px: `${space.xl}px`,
            py: `${space.md}px`,
            '&:hover': { bgcolor: colors.accentHover },
            '&.Mui-disabled': {
              bgcolor: colors.accent,
              color: colors.paper,
              opacity: 0.7,
            }
          }}
        >
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Button>
      </Box>

      <Box sx={cardSx}>
        {channelContracts.map((contract, i) => (
          <ChannelPanel
            key={contract.channel}
            contract={contract}
            discounts={discountsFor(contract.channel)}
            expanded={expandedChannel === contract.channel}
            onToggle={() => setExpandedChannel((prev) => (prev === contract.channel ? null : contract.channel))}
            onAddDiscount={() => setAddChannel(contract.channel)}
            isLast={i === channelContracts.length - 1}
          />
        ))}
      </Box>

      <AddDiscountModal
        open={addChannel !== null}
        channel={addChannel}
        onClose={() => setAddChannel(null)}
        onAdd={handleAdd}
      />
    </Box>
  );
};

export default Contracts;
