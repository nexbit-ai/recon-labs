// Add-secondary-discount modal — frontend-only. A real working form: pick SKUs,
// discount type + value, brand-funded split, and date window, then it builds a
// SecondaryDiscount and hands it back to the Contracts view (local state). No
// API. Monochrome + one accent (#7A5DBF): accent on the header tile, selected
// SKUs / type toggle, the live impact figure, and the primary action.
import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Checkbox,
} from '@mui/material';
import { CloseOutlined, LocalOfferOutlined } from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums, focusRingSx } from '../theme/b2bTokens';
import { Pressable } from './primitives';
import { formatRupees } from '../lib/format';
import { skus, discountImpact } from '../mock';
import type { ChannelName, DiscountType, SecondaryDiscount } from '../mock';

interface Props {
  open: boolean;
  channel: ChannelName | null;
  onClose: () => void;
  onAdd: (discount: SecondaryDiscount) => void;
}

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 0 },
  '& .MuiInputLabel-root': { ...type.label, color: colors.grey700 },
} as const;

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ ...type.label, color: colors.grey700, mb: `${space.sm}px` }}>{children}</Typography>
);

const AddDiscountModal: React.FC<Props> = ({ open, channel, onClose, onAdd }) => {
  const reduce = useReducedMotion();

  const [name, setName] = React.useState('');
  const [skuIds, setSkuIds] = React.useState<string[]>([]);
  const [discountType, setDiscountType] = React.useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = React.useState('15');
  const [brandFundedPct, setBrandFundedPct] = React.useState('100');
  const [startDate, setStartDate] = React.useState('2026-07-15');
  const [endDate, setEndDate] = React.useState('2026-07-21');
  const [unitsInWindow, setUnitsInWindow] = React.useState('2000');
  const [avgSellingPrice, setAvgSellingPrice] = React.useState('200');

  // Reset to defaults each time the modal is opened for a channel.
  React.useEffect(() => {
    if (!open) return;
    setName('');
    setSkuIds([]);
    setDiscountType('percent');
    setDiscountValue('15');
    setBrandFundedPct('100');
    setStartDate('2026-07-15');
    setEndDate('2026-07-21');
    setUnitsInWindow('2000');
    setAvgSellingPrice('200');
  }, [open, channel]);

  const toggleSku = (id: string) =>
    setSkuIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  // Live draft used to preview the reconciliation impact as the user types.
  const draft: SecondaryDiscount = {
    id: 'draft',
    channel: channel ?? 'Blinkit',
    name: name || 'New discount',
    skuIds,
    discountType,
    discountValue: Number(discountValue) || 0,
    brandFundedPct: Number(brandFundedPct) || 0,
    startDate,
    endDate,
    unitsInWindow: Number(unitsInWindow) || 0,
    avgSellingPrice: Number(avgSellingPrice) || 0,
  };
  const impact = discountImpact(draft);

  const valid =
    channel !== null &&
    name.trim().length > 0 &&
    skuIds.length > 0 &&
    Number(discountValue) > 0 &&
    startDate <= endDate;

  const handleAdd = () => {
    if (!valid || !channel) return;
    onAdd({
      ...draft,
      id: `SD-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      channel,
      name: name.trim(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && channel && (
        <Box
          component={motion.div}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            bgcolor: 'rgba(17, 17, 17, 0.4)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            overflowY: 'auto',
            p: `${space.xl}px`,
          }}
        >
          <Box
            component={motion.div}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: 520,
              maxWidth: '100%',
              my: 'auto',
              bgcolor: colors.paper,
              border: hairline,
              boxShadow: '0 1px 0 rgba(17,17,17,0.04)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: `${space.md}px`,
                p: `${space.xl}px`,
                borderBottom: hairline,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  bgcolor: colors.accentWash,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LocalOfferOutlined sx={{ fontSize: 18, color: colors.accent }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ ...type.sectionTitle, color: colors.ink }}>New secondary discount</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700 }}>
                  {channel} · tells recon what to expect on the settlement
                </Typography>
              </Box>
              <Pressable
                ariaLabel="Close"
                onClick={onClose}
                sx={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.grey700,
                  '&:hover': { bgcolor: colors.grey100, color: colors.ink },
                }}
              >
                <CloseOutlined sx={{ fontSize: 18 }} />
              </Pressable>
            </Box>

            {/* Body */}
            <Box sx={{ p: `${space.xl}px`, display: 'flex', flexDirection: 'column', gap: `${space.xl}px` }}>
              {/* Name */}
              <Box>
                <FieldLabel>Discount name</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. Month-Start Blitz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={inputSx}
                />
              </Box>

              {/* SKUs */}
              <Box>
                <FieldLabel>SKUs on discount</FieldLabel>
                <Box sx={{ border: hairline, maxHeight: 168, overflowY: 'auto' }}>
                  {skus.map((s, i) => {
                    const on = skuIds.includes(s.id);
                    return (
                      <Pressable
                        key={s.id}
                        onClick={() => toggleSku(s.id)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: `${space.sm}px`,
                          px: `${space.md}px`,
                          py: `${space.sm}px`,
                          borderBottom: i === skus.length - 1 ? 'none' : hairline,
                          bgcolor: on ? colors.accentWash : 'transparent',
                          '&:hover': { bgcolor: on ? colors.accentWash : colors.grey100 },
                        }}
                      >
                        <Checkbox
                          checked={on}
                          size="small"
                          disableRipple
                          sx={{ p: 0, color: colors.grey500, '&.Mui-checked': { color: colors.accent } }}
                        />
                        <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink }}>{s.label}</Typography>
                      </Pressable>
                    );
                  })}
                </Box>
                {skuIds.length > 0 && (
                  <Typography sx={{ ...type.label, color: colors.grey500, mt: `${space.sm}px` }}>
                    {skuIds.length} selected
                  </Typography>
                )}
              </Box>

              {/* Discount type + value */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.lg}px` }}>
                <Box>
                  <FieldLabel>Discount type</FieldLabel>
                  <Box sx={{ display: 'flex', border: hairline }}>
                    {(['percent', 'perUnit'] as DiscountType[]).map((t) => {
                      const on = discountType === t;
                      return (
                        <Pressable
                          key={t}
                          selected={on}
                          role="tab"
                          onClick={() => setDiscountType(t)}
                          sx={{
                            flex: 1,
                            textAlign: 'center',
                            py: `${space.sm}px`,
                            fontSize: 13,
                            fontWeight: on ? 600 : 400,
                            color: on ? colors.paper : colors.grey700,
                            bgcolor: on ? colors.accent : 'transparent',
                            '&:hover': { bgcolor: on ? colors.accent : colors.grey100 },
                          }}
                        >
                          {t === 'percent' ? '% off' : '₹ / unit'}
                        </Pressable>
                      );
                    })}
                  </Box>
                </Box>
                <Box>
                  <FieldLabel>{discountType === 'percent' ? 'Percent off' : '₹ off per unit'}</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    sx={inputSx}
                  />
                </Box>
              </Box>

              {/* Funding + (for percent) ASP */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.lg}px` }}>
                <Box>
                  <FieldLabel>Brand-funded share</FieldLabel>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    value={brandFundedPct}
                    onChange={(e) => setBrandFundedPct(e.target.value)}
                    sx={inputSx}
                  >
                    {['100', '70', '60', '50', '0'].map((v) => (
                      <MenuItem key={v} value={v}>
                        {v === '0' ? 'Platform-funded (0%)' : `${v}% brand-funded`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box>
                  <FieldLabel>{discountType === 'percent' ? 'Avg selling price (₹)' : 'Units in window'}</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={discountType === 'percent' ? avgSellingPrice : unitsInWindow}
                    onChange={(e) =>
                      discountType === 'percent'
                        ? setAvgSellingPrice(e.target.value)
                        : setUnitsInWindow(e.target.value)
                    }
                    sx={inputSx}
                  />
                </Box>
              </Box>

              {/* Dates + (for percent) units */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: `${space.lg}px` }}>
                <Box>
                  <FieldLabel>Starts</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    sx={inputSx}
                  />
                </Box>
                <Box>
                  <FieldLabel>Ends</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    sx={inputSx}
                  />
                </Box>
                <Box>
                  <FieldLabel>Units in window</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={unitsInWindow}
                    onChange={(e) => setUnitsInWindow(e.target.value)}
                    sx={inputSx}
                  />
                </Box>
              </Box>

              {/* Live impact preview */}
              <Box sx={{ bgcolor: colors.grey100, p: `${space.lg}px` }}>
                <Typography sx={{ ...type.label, color: colors.grey700 }}>
                  Expected receivable will drop by
                </Typography>
                <Typography sx={{ ...type.statValue, color: colors.accent, mt: '2px', ...tabularNums }}>
                  {formatRupees(impact.brandFunded)}
                </Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700, mt: `${space.xs}px` }}>
                  brand-funded slice of a {formatRupees(impact.gross)} markdown — so this deduction reconciles
                  instead of flagging as variance.
                </Typography>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ display: 'flex', gap: `${space.md}px`, p: `${space.xl}px`, borderTop: hairline }}>
              <Button
                onClick={onClose}
                sx={{
                  flex: 1,
                  borderRadius: 0,
                  border: hairline,
                  color: colors.ink,
                  fontSize: 13,
                  fontWeight: 600,
                  py: `${space.md}px`,
                  ...focusRingSx,
                  '&:hover': { bgcolor: colors.grey100 },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!valid}
                sx={{
                  flex: 2,
                  borderRadius: 0,
                  bgcolor: colors.accent,
                  color: colors.paper,
                  fontSize: 13,
                  fontWeight: 600,
                  py: `${space.md}px`,
                  '&:hover': { bgcolor: colors.accentHover },
                  '&.Mui-disabled': { bgcolor: colors.grey200, color: colors.grey500 },
                }}
              >
                Add discount
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default AddDiscountModal;
