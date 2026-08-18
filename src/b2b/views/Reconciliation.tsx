// B2B Reconciliation - Cosmix line-level settlement matching with expandable
// variance decomposition and 3-way matching (PO ↔ GRN ↔ Invoice).
// Clicking a flagged row opens the IssuePanel side-drawer.
import React from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Drawer, Popover, IconButton, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, FormControl } from '@mui/material';
import { ExpandMoreOutlined, CheckCircleOutlined, ErrorOutlineOutlined, HourglassEmptyOutlined, HelpOutlineOutlined, InfoOutlined, ArrowUpwardOutlined, ArrowDownwardOutlined } from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, ChannelTag, ColumnLabel, Pressable } from '../components/primitives';
import { formatRupees } from '../lib/format';
import { reconPurchaseOrders, type ReconPurchaseOrder, type ReconLineItem, type ReconStatus, type GRNStatus, type ThreeWayMatch, channelContracts } from '../mock';
import IssuePanel from '../components/IssuePanel';

const DISPUTES_ROUTE = '/b2b/disputes';
const GRID = '104px minmax(120px, 1fr) 100px 100px 100px 116px 36px';

type Filter = 'all' | 'exceptions' | 'matched';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'exceptions', label: 'Exceptions' },
  { key: 'matched', label: 'Matched' },
];

const labelSx = { ...type.label, color: colors.grey700 } as const;

const signed = (n: number): string => (n < 0 ? `−${formatRupees(Math.abs(n))}` : formatRupees(n));

const StatusLabel: React.FC<{ status: ReconStatus }> = ({ status }) => {
  const isMatched = status === 'Matched';
  const isPending = status.includes('Pending');
  const isException = !isMatched && !isPending;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: hairline,
        bgcolor: isException ? '#FEE2E2' : isMatched ? colors.grey100 : colors.paper,
        color: isMatched ? colors.grey700 : colors.ink,
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        px: `${space.sm}px`,
        py: '3px',
      }}
    >
      {status}
    </Box>
  );
};

const GRNStatusIcon: React.FC<{ status: GRNStatus }> = ({ status }) => {
  const iconMap: Record<GRNStatus, React.ReactElement> = {
    Accepted: <CheckCircleOutlined sx={{ fontSize: 14, color: colors.grey700 }} />,
    Pending: <HourglassEmptyOutlined sx={{ fontSize: 14, color: colors.ink }} />,
    Partial: <ErrorOutlineOutlined sx={{ fontSize: 14, color: colors.ink }} />,
    Missing: <HelpOutlineOutlined sx={{ fontSize: 14, color: colors.ink }} />,
  };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {iconMap[status]}
      <Typography sx={{ fontSize: 11, fontWeight: status === 'Accepted' ? 500 : 600, color: status === 'Accepted' ? colors.grey700 : colors.ink }}>
        {status}
      </Typography>
    </Box>
  );
};

// 3-way match indicator row
const ThreeWayMatchRow: React.FC<{ match: ThreeWayMatch }> = ({ match }) => {
  const items = [
    { label: 'PO', ref: match.po.ref, status: match.po.status, amount: match.po.amount },
    { label: 'Invoice', ref: match.invoice.ref, status: match.invoice.status, amount: match.invoice.amount },
    { label: 'GRN', ref: match.grn.ref, status: match.grn.status, amount: match.grn.amount },
  ];
  const statusIcon = (s: string) => {
    if (s === 'Matched') return <CheckCircleOutlined sx={{ fontSize: 14, color: colors.grey500 }} />;
    if (s === 'Pending') return <HourglassEmptyOutlined sx={{ fontSize: 14, color: colors.ink }} />;
    if (s === 'Missing') return <HelpOutlineOutlined sx={{ fontSize: 14, color: colors.accent }} />;
    return <ErrorOutlineOutlined sx={{ fontSize: 14, color: colors.ink }} />;
  };

  return (
    <Box sx={{ display: 'flex', mt: `${space.md}px`, alignItems: 'stretch' }}>
      {items.map((item, index) => {
        const gap = index > 0 ? items[index - 1].amount - item.amount : 0;
        
        return (
          <React.Fragment key={item.label}>
            {index > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', px: `${space.md}px`, minWidth: '80px' }}>
                {index === 2 && gap > 0 && (
                  <Typography sx={{ fontSize: 10, color: colors.grey500, textTransform: 'uppercase', letterSpacing: '0.04em', mb: '4px', whiteSpace: 'nowrap' }}>Debit Note</Typography>
                )}
                <Box sx={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ height: '1px', flex: 1, bgcolor: colors.grey500 }} />
                  <Box sx={{ borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `5px solid ${colors.grey500}` }} />
                </Box>
                {index === 2 && gap > 0 && (
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.accent, mt: '4px', ...tabularNums }}>−{formatRupees(gap)}</Typography>
                )}
              </Box>
            )}
            <Box sx={{ flex: 1, border: hairline, p: `${space.md}px`, minWidth: 0, bgcolor: colors.paper }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: '4px' }}>
                {statusIcon(item.status)}
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase' }}>{item.label}</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: colors.grey700, wordBreak: 'break-all', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.ref}>{item.ref}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, mt: '2px', ...tabularNums }}>{formatRupees(item.amount)}</Typography>
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
};

const ExpectedCalcPopover = ({ anchorEl, onClose, line }: { anchorEl: HTMLElement | null, onClose: () => void, line: ReconLineItem | null }) => {
  if (!line) return null;
  const contract = channelContracts.find(c => c.channel === line.channel);
  
  // Dummy math: derive gross from expected + approx deductions
  const grossGMV = Math.round(line.expected / 0.8);
  const deductions = contract?.rateCard.map(rc => {
     let dummyAmount = 0;
     if (rc.contracted.includes('%')) {
        const pctMatch = rc.contracted.match(/(\d+(?:\.\d+)?)%/);
        const pct = pctMatch ? parseFloat(pctMatch[1]) : 5;
        dummyAmount = Math.round(grossGMV * (pct / 100));
     } else {
        dummyAmount = Math.round(grossGMV * 0.02); 
     }
     return { label: rc.label, amount: dummyAmount, code: rc.code, contracted: rc.contracted };
  }) || [];
  
  const sumDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const diff = (grossGMV - sumDeductions) - line.expected;
  if (deductions.length > 0) {
     deductions[deductions.length - 1].amount += diff;
  }
  
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={() => { onClose(); }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      slotProps={{ paper: { sx: { width: 340, p: 2, borderRadius: 2, border: hairline, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } } }}
    >
       <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mb: 2 }}>Expected Amount Calculation</Typography>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
         <Typography sx={{ fontSize: 12, color: colors.grey700 }}>Gross GMV</Typography>
         <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.ink, ...tabularNums }}>{formatRupees(grossGMV)}</Typography>
       </Box>
       {deductions.map(d => (
         <Box key={d.code} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, gap: 2 }}>
           <Box>
             <Typography sx={{ fontSize: 12, color: colors.grey700 }}>Less: {d.label}</Typography>
             <Typography sx={{ fontSize: 11, color: colors.grey500 }}>{d.contracted}</Typography>
           </Box>
           <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '2px', ...tabularNums }}>−{formatRupees(d.amount)}</Typography>
         </Box>
       ))}
       <Box sx={{ borderTop: hairline, mt: 1, pt: 1, display: 'flex', justifyContent: 'space-between' }}>
         <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>Expected (Net)</Typography>
         <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, ...tabularNums }}>{formatRupees(line.expected)}</Typography>
       </Box>
       <Typography sx={{ mt: 2, fontSize: 11, color: colors.grey500, fontStyle: 'italic', lineHeight: 1.4 }}>
         Calculated dynamically from rate card provisions in <b>{contract?.contractRef}</b>.
       </Typography>
    </Popover>
  );
};

const RowDetail: React.FC<{ po: ReconPurchaseOrder }> = ({ po }) => {
  const navigate = useNavigate();
  const [expandedLineId, setExpandedLineId] = React.useState<string | null>(null);
  const [calcAnchorEl, setCalcAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [selectedCalcLine, setSelectedCalcLine] = React.useState<ReconLineItem | null>(null);

  return (
    <Box
      sx={{
        bgcolor: colors.grey100,
        borderTop: hairline,
        p: `${space.xl}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${space.sm}px`,
      }}
    >
      {/* Table Header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 80px 1fr 1fr 1fr', px: `${space.md}px`, pb: `${space.sm}px`, borderBottom: hairline, gap: `${space.sm}px` }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase' }}>Item</Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase' }}>PO / Invoice</Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase' }}>GRN</Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', textAlign: 'right' }}>Expected</Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', textAlign: 'right' }}>Paid</Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', textAlign: 'right' }}>Difference</Typography>
      </Box>

      {po.lineItems.map((line) => {
        const residual = line.paid - line.expected - line.varianceBreakdown.reduce((t, v) => t + v.amount, 0);
        const isMatched = line.status === 'Matched';
        const isExpanded = expandedLineId === line.id;

        return (
          <Box key={line.id} sx={{ bgcolor: colors.paper, border: hairline, transition: 'all 0.2s', '&:hover': { borderColor: colors.ink } }}>
            {/* Summary Row (Clickable) */}
            <Box
              onClick={() => setExpandedLineId(isExpanded ? null : line.id)}
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: '1.5fr 1fr 80px 1fr 1fr 1fr', 
                p: `${space.md}px`, 
                cursor: 'pointer',
                alignItems: 'center',
                gap: `${space.sm}px`
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{line.skuLabel}</Typography>
              <Box>
                <Typography sx={{ fontSize: 12, color: colors.grey700, wordBreak: 'break-all' }}>{line.poNumber}</Typography>
                <Typography sx={{ fontSize: 12, color: colors.grey500, wordBreak: 'break-all' }}>{line.invoiceNumber}</Typography>
              </Box>
              <GRNStatusIcon status={line.grnStatus} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(line.expected)}</Typography>
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCalcAnchorEl(e.currentTarget);
                    setSelectedCalcLine(line);
                  }} 
                  sx={{ p: '2px', color: colors.grey500 }}
                >
                  <InfoOutlined sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(line.paid)}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: line.variance > 0 ? colors.accent : colors.ink, textAlign: 'right', ...tabularNums }}>
                {line.variance > 0 ? `−${formatRupees(line.variance)}` : formatRupees(0)}
              </Typography>
            </Box>

            {/* Expandable Waterfall Ledger */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <Box
                  component={motion.div}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  sx={{ overflow: 'hidden' }}
                >
                  <Box sx={{ p: `${space.xl}px`, borderTop: hairline, bgcolor: '#FAFAFA' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.xl}px` }}>
                      {/* 3-Way Match */}
                      <Box>
                        <Typography sx={{ ...labelSx, color: colors.grey700, display: 'block', mb: `${space.sm}px` }}>
                          Three-way match: PO ↔ GRN ↔ Invoice
                        </Typography>
                        <ThreeWayMatchRow match={line.threeWayMatch} />
                      </Box>

                      <Box>
                        <Typography sx={{ ...labelSx, color: colors.grey700, display: 'block', mb: `${space.md}px` }}>
                          Deductions & Adjustments
                        </Typography>
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                              gap: `${space.lg}px`,
                              py: `${space.md}px`,
                            }}
                          >
                            <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink }}>
                              Expected (GRN Value)
                            </Typography>
                            <Typography
                              sx={{
                                flexShrink: 0,
                                fontSize: type.body.fontSize,
                                fontWeight: 500,
                                color: colors.ink,
                                ...tabularNums,
                              }}
                            >
                              {formatRupees(line.expected)}
                            </Typography>
                          </Box>
                          
                          {line.varianceBreakdown.map((part) => (
                            <Box
                              key={part.label}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                gap: `${space.lg}px`,
                                py: `${space.md}px`,
                                borderTop: hairline,
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink }}>
                                  Less: {part.label}
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
                          
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                              gap: `${space.lg}px`,
                              py: `${space.md}px`,
                              borderTop: `2px solid ${colors.ink}`,
                              mt: '4px',
                            }}
                          >
                            <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink }}>
                              Actual Paid (Settlement)
                            </Typography>
                            <Typography sx={{ flexShrink: 0, fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                              {formatRupees(line.paid)}
                            </Typography>
                          </Box>

                          {/* Unreconciled residual */}
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
                              Unreconciled Difference
                            </Typography>
                            <Typography sx={{ flexShrink: 0, fontSize: type.body.fontSize, fontWeight: 600, color: residual === 0 ? colors.accent : colors.ink, ...tabularNums }}>
                              {formatRupees(residual)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Next action */}
                        {line.nextAction && (
                          <Box sx={{ mt: `${space.md}px`, p: `${space.md}px`, bgcolor: colors.accentWash, border: `1px solid ${colors.accent}` }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.accent, mb: '4px' }}>
                              Recommended next action
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: colors.ink, lineHeight: '19px' }}>
                              {line.nextAction}
                            </Typography>
                          </Box>
                        )}
                        
                        {!isMatched && (
                          <Button
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
                              px: `${space.xl}px`,
                              ...tabularNums,
                              '&:hover': { bgcolor: colors.accentHover },
                            }}
                          >
                            Draft dispute · {formatRupees(line.variance)}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </AnimatePresence>
          </Box>
        );
      })}
      
      <ExpectedCalcPopover 
        anchorEl={calcAnchorEl} 
        onClose={() => { setCalcAnchorEl(null); setSelectedCalcLine(null); }} 
        line={selectedCalcLine} 
      />
    </Box>
  );
};

const Reconciliation: React.FC = () => {
  const reduce = useReducedMotion();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const expandPo = searchParams.get('po');
  const queryChannel = searchParams.get('channel');
  const [filter, setFilter] = React.useState<Filter>('all');
  const [selectedChannels, setSelectedChannels] = React.useState<string[]>(queryChannel ? [queryChannel] : []);
  const [expandedId, setExpandedId] = React.useState<string | null>(expandPo || null);
  const [selectedLineItem, setSelectedLineItem] = React.useState<ReconLineItem | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'up' | 'down'>('down');

  const availableChannels = React.useMemo(() => {
    return Array.from(new Set(reconPurchaseOrders.map((po) => po.channel)));
  }, []);

  React.useEffect(() => {
    if (expandPo) {
      setTimeout(() => {
        const el = document.getElementById(expandPo);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [expandPo]);
  const { platformFilter } = useOutletContext<{ platformFilter: string }>() || { platformFilter: 'all' };

  const rows = reconPurchaseOrders.filter((po) => {
    const channelRaw = po.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
    const filterRaw = platformFilter.toLowerCase().replace(/\s+/g, '').replace('–', '');
    const matchesPlatform = platformFilter === 'all' || channelRaw.includes(filterRaw) || filterRaw.includes(channelRaw);
    const matchesStatus = filter === 'all' ? true : filter === 'matched' ? po.status === 'Matched' : po.status !== 'Matched';
    const matchesSelectedChannels = selectedChannels.length === 0 || selectedChannels.includes(po.channel);
    
    return matchesPlatform && matchesStatus && matchesSelectedChannels;
  });

  const getStatusRank = (status: string) => {
    if (status === 'Matched') return 1;
    if (status.includes('Pending')) return 2;
    return 3;
  };

  const sortedRows = [...rows].sort((a, b) => {
    const rankA = getStatusRank(a.status);
    const rankB = getStatusRank(b.status);
    if (sortDirection === 'up') {
      return rankA - rankB;
    } else {
      return rankB - rankA;
    }
  });

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
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${space.lg}px`,
          mb: `${space.lg}px`,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', gap: `${space.lg}px`, alignItems: 'center', flexWrap: 'wrap' }}>
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
          
          <FormControl sx={{ minWidth: 200 }} size="small">
            <Select
              multiple
              displayEmpty
              value={selectedChannels}
              onChange={(e) => setSelectedChannels(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
              input={<OutlinedInput sx={{ height: 34, fontSize: 13, fontWeight: 600, borderRadius: 0, '& .MuiOutlinedInput-notchedOutline': { border: hairline }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.ink }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.ink, borderWidth: '1px' } }} />}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.grey700 }}>All Channels</Typography>;
                }
                return <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.join(', ')}</Typography>;
              }}
              MenuProps={{
                PaperProps: {
                  sx: { borderRadius: 0, border: hairline, mt: '4px', boxShadow: 'none' }
                }
              }}
            >
              {availableChannels.map((channel) => (
                <MenuItem key={channel} value={channel} sx={{ fontSize: 13 }}>
                  <Checkbox checked={selectedChannels.indexOf(channel) > -1} size="small" sx={{ p: 0.5, mr: 1, '&.Mui-checked': { color: colors.ink } }} />
                  <ListItemText primary={channel} primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography sx={{ fontSize: 13, color: colors.grey500, ...tabularNums }}>
          3-way matching: PO → GRN → Invoice · deterministic · ±₹1 tolerance
        </Typography>
      </Box>

      {/* ── TABLE ── */}
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
            <ColumnLabel>PO Reference</ColumnLabel>
            <ColumnLabel>Period</ColumnLabel>
            <ColumnLabel align="right">Expected</ColumnLabel>
            <ColumnLabel align="right">Received</ColumnLabel>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setSortDirection(prev => prev === 'down' ? 'up' : 'down')}
            >
              <ColumnLabel align="right">Status</ColumnLabel>
              {sortDirection === 'up' ? <ArrowUpwardOutlined sx={{ fontSize: 14, color: colors.grey500 }} /> : <ArrowDownwardOutlined sx={{ fontSize: 14, color: colors.grey500 }} />}
            </Box>
            <ColumnLabel />
          </Box>

          {sortedRows.map((po, idx) => {
            const expanded = expandedId === po.id;
            return (
              <Box key={po.id} id={po.id} sx={{ borderBottom: idx < sortedRows.length - 1 ? hairline : 'none' }}>
                {/* Clickable row */}
                <Pressable
                  ariaLabel={`${po.channel} ${po.id}, ${po.status}`}
                  onClick={() => setExpandedId(expanded ? null : po.id)}
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
                  <ChannelTag name={po.channel} />
                  <Typography
                    sx={{
                      fontSize: type.body.fontSize,
                      color: colors.ink,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 600,
                    }}
                  >
                    {po.id}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: colors.grey700 }}>
                    {po.date}
                  </Typography>
                  <Typography sx={{ textAlign: 'right', fontSize: type.body.fontSize, color: colors.ink, ...tabularNums }}>
                    {formatRupees(po.expected)}
                  </Typography>
                  <Typography
                    sx={{
                      textAlign: 'right',
                      fontSize: type.body.fontSize,
                      color: colors.ink,
                      fontWeight: po.variance > 0 ? 600 : 400,
                      ...tabularNums,
                    }}
                  >
                    {formatRupees(po.paid)}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <StatusLabel status={po.status} />
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

                {/* Expandable detail */}
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <RowDetail po={po} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            );
          })}

          {sortedRows.length === 0 && (
            <Box sx={{ p: `${space.xl}px` }}>
              <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey500 }}>No Purchase Orders in this view.</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Issue Panel side drawer */}
      <Drawer
        anchor="right"
        open={!!selectedLineItem}
        onClose={() => setSelectedLineItem(null)}
        PaperProps={{ sx: { width: { xs: '100%', md: '45%' }, maxWidth: 640, border: 'none', borderLeft: hairline } }}
      >
        {selectedLineItem && <IssuePanel lineItem={selectedLineItem} onClose={() => setSelectedLineItem(null)} />}
      </Drawer>
    </Box>
  );
};

export default Reconciliation;
